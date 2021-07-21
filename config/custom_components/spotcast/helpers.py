import asyncio
import logging
from functools import partial, wraps

from homeassistant.components.cast.media_player import CastDevice
from homeassistant.components.spotify.media_player import SpotifyMediaPlayer
from homeassistant.helpers import entity_platform

_LOGGER = logging.getLogger(__name__)


def get_spotify_devices(hass, spotify_user_id):
    platforms = entity_platform.async_get_platforms(hass, "spotify")
    spotify_media_player = None
    for platform in platforms:
        if platform.domain != "media_player":
            continue

        for entity in platform.entities.values():
            if (
                isinstance(entity, SpotifyMediaPlayer)
                and entity.unique_id == spotify_user_id
            ):
                _LOGGER.debug(
                    f"get_spotify_devices: {entity.entity_id}: {entity.name}: %s",
                    entity._devices,
                )
                spotify_media_player = entity
                break
    if spotify_media_player:
        # Need to come from media_player spotify's sp client due to token issues
        resp = spotify_media_player._spotify.devices()
        _LOGGER.debug("get_spotify_devices: %s", resp)
        return resp


def get_cast_devices(hass):
    platforms = entity_platform.async_get_platforms(hass, "cast")
    cast_infos = []
    for platform in platforms:
        if platform.domain != "media_player":
            continue
        for entity in platform.entities.values():
            if isinstance(entity, CastDevice):
                _LOGGER.debug(
                    f"get_cast_devices: {entity.entity_id}: {entity.name} cast info: %s",
                    entity._cast_info,
                )
                cast_infos.append(entity._cast_info)
    return cast_infos


# Async wrap sync function
def async_wrap(func):
    @wraps(func)
    async def run(*args, loop=None, executor=None, **kwargs):
        if loop is None:
            loop = asyncio.get_event_loop()
        pfunc = partial(func, *args, **kwargs)
        return await loop.run_in_executor(executor, pfunc)

    return run
