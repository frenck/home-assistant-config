import logging
import json
from datetime import timedelta
from homeassistant.helpers.entity import Entity
from homeassistant.util import dt
from homeassistant.const import STATE_OK, STATE_UNKNOWN
from homeassistant.helpers import entity_platform
from homeassistant.components.spotify.media_player import SpotifyMediaPlayer

from . import DOMAIN, get_cast_devices

_LOGGER = logging.getLogger(__name__)

SENSOR_SCAN_INTERVAL_SECS = 10
SCAN_INTERVAL = timedelta(seconds=SENSOR_SCAN_INTERVAL_SECS)


def setup_platform(hass, config, add_devices, discovery_info=None):
    add_devices([ChromecastDevicesSensor(hass)])


class ChromecastDevicesSensor(Entity):
    def __init__(self, hass):
        self.hass = hass
        self._state = STATE_UNKNOWN
        self._chromecast_devices = []
        self._attributes = {"devices_json": [], "devices": [], "last_update": None}
        _LOGGER.debug("initiating sensor")

    @property
    def name(self):
        return "Chromecast Devices"

    @property
    def state(self):
        return self._state

    @property
    def device_state_attributes(self):
        """Return the state attributes."""
        return self._attributes

    def update(self):
        _LOGGER.debug("Getting chromecast devices")

        known_devices = get_cast_devices(self.hass)
        _LOGGER.debug("sensor devices %s", known_devices)

        chromecasts = [
            {
                "host": "deprecated",
                "port": "deprecated",
                "uuid": cast_info.uuid,
                "model_name": cast_info.model_name,
                "name": cast_info.friendly_name,
                "manufacturer": cast_info.manufacturer,
            }
            for cast_info in known_devices
        ]

        self._attributes["devices_json"] = json.dumps(chromecasts, ensure_ascii=False)
        self._attributes["devices"] = chromecasts
        self._attributes["last_update"] = dt.now().isoformat("T")
        self._state = STATE_OK
