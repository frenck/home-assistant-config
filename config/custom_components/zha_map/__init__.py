import asyncio
import logging
import os
import time
from datetime import timedelta

import voluptuous as vol
import zigpy.exceptions as zigpy_exc

from homeassistant.components import websocket_api
from homeassistant.helpers.event import async_call_later, async_track_time_interval
from homeassistant.util.json import save_json

from .helpers import LogMixin
from .neighbour import Neighbour, NeighbourType

ATTR_TOPO = "topology"
ATTR_TYPE = "type"
ATTR_OUTPUT_DIR = "output_dir"
AWAKE_INTERVAL = timedelta(hours=4, minutes=15)
DOMAIN = "zha_map"
CONFIG_OUTPUT_DIR_NAME = "neighbours"
CONFIG_INITIAL_SCAN_DELAY = 20 * 60
SERVICE_SCAN_NOW = "scan_now"
SERVICE_SCHEMAS = {SERVICE_SCAN_NOW: vol.Schema({})}

LOGGER = logging.getLogger(__name__)


async def async_setup(hass, config):
    """Set up ZHA from config."""

    if DOMAIN not in config:
        return True

    try:
        zha_gateway = hass.data["zha"]["zha_gateway"]
    except KeyError:
        return False

    builder = TopologyBuilder(hass, zha_gateway)
    hass.data[DOMAIN] = {ATTR_TOPO: builder}
    output_dir = os.path.join(hass.config.config_dir, CONFIG_OUTPUT_DIR_NAME)
    hass.data[DOMAIN][ATTR_OUTPUT_DIR] = output_dir

    def mkdir(dir):
        try:
            os.mkdir(dir)
            return True
        except OSError as exc:
            LOGGER.error("Couldn't create '%s' dir: %s", dir, exc)
            return False

    if not os.path.isdir(output_dir):
        if not await hass.async_add_executor_job(mkdir, output_dir):
            return False

    async def setup_scanner(_now):
        async_track_time_interval(hass, builder.time_tracker, AWAKE_INTERVAL)
        await builder.time_tracker()

    async_call_later(hass, CONFIG_INITIAL_SCAN_DELAY, setup_scanner)

    async def scan_now_handler(service):
        """Scan topology right now."""
        await builder.preempt_build()

    hass.services.async_register(
        DOMAIN,
        SERVICE_SCAN_NOW,
        scan_now_handler,
        schema=SERVICE_SCHEMAS[SERVICE_SCAN_NOW],
    )

    @websocket_api.require_admin
    @websocket_api.async_response
    @websocket_api.websocket_command({vol.Required(ATTR_TYPE): f"{DOMAIN}/devices"})
    async def websocket_get_devices(hass, connection, msg):
        """Get ZHA Map devices."""

        response = {
            "time": builder.timestamp,
            "devices": [nei.json() for nei in builder.current.values()],
        }
        connection.send_result(msg["id"], response)

    websocket_api.async_register_command(hass, websocket_get_devices)

    return True


class TopologyBuilder(LogMixin):
    """Keeps track of topology."""

    log = LOGGER.log

    def __init__(self, hass, zha_gw):
        """Init instance."""
        self._hass = hass
        self._app = zha_gw
        self._in_process = None
        self._seen = {}
        self._current = {}
        self._failed = {}
        self._timestamp = 0

    @property
    def current(self):
        """Return a dict with all Router/Coordinator devices."""
        return self._current

    @property
    def timestamp(self):
        """Return the timestamp of the last scan."""
        return self._timestamp

    async def time_tracker(self, time=None):
        """Awake periodically."""
        if self._in_process and not self._in_process.done():
            return
        self._in_process = self._hass.async_create_task(self.build())

    async def preempt_build(self):
        """Start a new scan, preempting the current one in progress."""
        if self._in_process and not self._in_process.done():
            self.debug("Cancelling a neighbour scan in progress")
            self._in_process.cancel()
        self._in_process = self._hass.async_create_task(self.build())

    async def build(self):
        self._seen.clear()
        self._failed.clear()

        seed = self._app.application_controller.get_device(nwk=0x0000)
        self.debug("Building topology starting from coordinator")
        try:
            await self.scan_device(seed)
        except zigpy_exc.ZigbeeException as exc:
            self.error("failed to scan %s device: %s", seed.ieee, exc)
            return

        pending = self._pending()
        while pending:
            for nei in pending:
                try:
                    await nei.scan()
                except (zigpy_exc.ZigbeeException, asyncio.TimeoutError):
                    self.warning("Couldn't scan %s neighbours", nei.ieee)
                    self._failed[nei.ieee] = nei
                    nei.offline = True
                    continue
                await self.process_neighbour_table(nei)
            pending = self._pending()

        await self.sanity_check()
        self._current = {**self._seen}
        self._timestamp = time.time()

    def _pending(self):
        """Return neighbours still pending a scan."""
        pending = [
            n
            for n in self._seen.values()
            if not n.neighbours
            and n.supported
            and n.device is not None
            and n.device_type
            in (NeighbourType.Coordinator.name, NeighbourType.Router.name)
            and n.ieee not in self._failed
        ]

        if pending:
            self.debug(
                "continuing neighbour scan. Neighbours discovered: %s",
                [n.ieee for n in pending],
            )
        else:
            self.debug(
                "Finished neighbour scan pass. Failed: %s",
                [k for k in self._failed.keys()],
            )
        return pending

    async def sanity_check(self):
        """Check discovered neighbours vs Zigpy database."""
        # do we have extra neighbours
        for nei in self._seen.values():
            if nei.ieee not in self._app.application_controller.devices:
                self.debug(
                    "Neighbour not in 'zigbee.db': %s - %s", nei.ieee, nei.device_type
                )

        # are we missing neighbours
        for dev in self._app.application_controller.devices.values():
            if dev.ieee in self._seen:
                continue

            if dev.ieee in self._failed:
                self.debug(
                    (
                        "%s (%s %s) was discovered in the neighbours "
                        "tables, but did not respond"
                    ),
                    dev.ieee,
                    dev.manufacturer,
                    dev.model,
                )
            else:
                self.debug(
                    "%s (%s %s) was not found in the neighbours tables",
                    dev.ieee,
                    dev.manufacturer,
                    dev.model,
                )
                nei = Neighbour(dev.ieee, f"0x{dev.nwk:04x}", "unk")
                nei.device = dev
                nei.model = dev.model
                nei.manufacturer = dev.manufacturer
                nei.offline = True
                if dev.node_desc.logical_type is not None:
                    nei.device_type = dev.node_desc.logical_type.name
                self._seen[dev.ieee] = nei

    async def scan_device(self, device):
        """Scan device neigbours."""
        nei = await Neighbour.scan_device(device)
        await self.process_neighbour_table(nei)

    async def process_neighbour_table(self, nei):
        for entry in nei.neighbours:
            if entry.ieee in self._seen:
                continue
            self.debug("Adding %s to all neighbours", entry.ieee)
            self._seen[entry.ieee] = entry
        await self.save_neighbours(nei)

    async def save_neighbours(self, nei):
        suffix = str(nei.ieee).replace(":", "")
        suffix = f"_{suffix}.txt"

        file_name = os.path.join(
            self._hass.data[DOMAIN][ATTR_OUTPUT_DIR], "neighbours" + suffix
        )
        self.debug("Saving %s", file_name)
        await self._hass.async_add_executor_job(save_json, file_name, nei.json())
