import asyncio
import enum
import logging
import random

import attr
import zigpy.zdo.types as zdo_t
from zigpy.exceptions import DeliveryError
from zigpy.util import retryable

from .helpers import LogMixin

LOGGER = logging.getLogger(__name__)


class NeighbourType(enum.IntEnum):
    Coordinator = 0x0
    Router = 0x1
    End_Device = 0x2
    Unknown = 0x3


class RxOnIdle(enum.IntEnum):
    Off = 0x0
    On = 0x1
    Unknown = 0x2


class Relation(enum.IntEnum):
    Parent = 0x0
    Child = 0x1
    Sibling = 0x2
    None_of_the_above = 0x3
    Previous_Child = 0x4


class PermitJoins(enum.IntEnum):
    Not_Accepting = 0x0
    Accepting = 0x1
    Unknown = 0x2


@attr.s
class Neighbour(LogMixin):
    ieee = attr.ib(default=None)
    nwk = attr.ib(default=None)
    lqi = attr.ib(default=None)
    pan_id = attr.ib(default=None)
    device_type = attr.ib(default="unk")
    rx_on_when_idle = attr.ib(default=None)
    relation = attr.ib(default=None)
    new_joins_accepted = attr.ib(default=None)
    depth = attr.ib(default=None)
    device = attr.ib(default=None)
    model = attr.ib(default=None)
    manufacturer = attr.ib(default=None)
    neighbours = attr.ib(factory=list)
    offline = attr.ib(factory=bool)
    supported = attr.ib(default=True)

    @classmethod
    def new_from_record(cls, record):
        """Create new neighbour from a neighbour record."""

        r = cls()
        r.offline = False
        r.pan_id = str(record.PanId)
        r.ieee = record.IEEEAddr

        raw = record.NeighborType & 0x03
        try:
            r.device_type = NeighbourType(raw).name
        except ValueError:
            r.device_type = "undefined_0x{:02x}".format(raw)

        raw = (record.NeighborType >> 2) & 0x03
        try:
            r.rx_on_when_idle = RxOnIdle(raw).name
        except ValueError:
            r.rx_on_when_idle = "undefined_0x{:02x}".format(raw)

        raw = (record.NeighborType >> 4) & 0x07
        try:
            r.relation = Relation(raw).name
        except ValueError:
            r.relation = "undefined_0x{:02x}".format(raw)

        raw = record.PermitJoining & 0x02
        try:
            r.new_joins_accepted = PermitJoins(raw).name
        except ValueError:
            r.new_joins_accepted = "undefined_0x{:02x}".format(raw)

        r.depth = record.Depth
        r.lqi = record.LQI
        return r

    def _update_info(self):
        """Update info based on device information."""
        if self.device is None:
            return
        self.nwk = "0x{:04x}".format(self.device.nwk)
        self.model = self.device.model
        self.manufacturer = self.device.manufacturer

    @classmethod
    async def scan_device(cls, device):
        """New neighbour from a scan."""
        r = cls()
        r.offline = False
        r.device = device
        r.ieee = device.ieee
        r._update_info()

        await r.scan()
        return r

    async def scan(self):
        """Scan for neighbours."""
        idx = 0
        while True:
            status, val = await self.device.zdo.request(
                zdo_t.ZDOCmd.Mgmt_Lqi_req, idx, tries=3, delay=1
            )
            self.debug("neighbor request Status: %s. Response: %r", status, val)
            if zdo_t.Status.SUCCESS != status:
                self.supported = False
                self.debug("device does not support 'Mgmt_Lqi_req'")
                return

            neighbors = val.NeighborTableList
            for neighbor in neighbors:
                new = self.new_from_record(neighbor)

                if repr(new.ieee) in (
                    "00:00:00:00:00:00:00:00",
                    "ff:ff:ff:ff:ff:ff:ff:ff",
                ):
                    self.debug("Ignoring invalid neighbour: %s", new.ieee)
                    idx += 1
                    continue

                try:
                    new.device = self.device.application.get_device(new.ieee)
                    new._update_info()
                except KeyError:
                    self.warning("neighbour %s is not in 'zigbee.db'", new.ieee)
                self.neighbours.append(new)
                idx += 1
            if idx >= val.Entries:
                break
            if len(neighbors) <= 0:
                idx += 1
                self.debug("Neighbor count is 0 (idx : %d)", idx)
                
            await asyncio.sleep(random.uniform(1.0, 1.5))
            self.debug("Querying next starting at %s", idx)

        self.debug("Done scanning. Total %s neighbours", len(self.neighbours))

    def log(self, level, msg, *args):
        """Log a message with level."""
        msg = "[%s]: " + msg
        args = (self.device.ieee,) + args
        LOGGER.log(level, msg, *args)

    def json(self):
        """Return JSON representation of the neighbours table."""
        res = []
        for nei in sorted(self.neighbours, key=lambda x: x.ieee):
            if nei.device is not None:
                assert nei.ieee == nei.device.ieee
            dict_nei = attr.asdict(
                nei,
                filter=lambda a, v: a.name not in ("device", "neighbours"),
                retain_collection_types=True,
            )
            dict_nei["ieee"] = str(dict_nei["ieee"])
            res.append(dict_nei)
        return {
            "ieee": str(self.ieee),
            "nwk": self.nwk,
            "lqi": self.lqi,
            "device_type": self.device_type,
            "manufacturer": self.manufacturer,
            "model": self.model,
            "offline": self.offline,
            "neighbours": res,
        }
