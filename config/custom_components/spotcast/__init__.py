import asyncio
import logging
import voluptuous as vol
import random
import time
from datetime import datetime
import spotipy
from functools import wraps, partial
from homeassistant.components import http, websocket_api
from homeassistant.core import callback
from homeassistant.exceptions import HomeAssistantError
import homeassistant.helpers.config_validation as cv
from homeassistant.components.cast.media_player import CastDevice
from homeassistant.components.cast.helpers import ChromeCastZeroconf
from homeassistant.components.spotify.media_player import SpotifyMediaPlayer
from homeassistant.helpers import entity_platform


DOMAIN = "spotcast"

_LOGGER = logging.getLogger(__name__)

CONF_SPOTIFY_DEVICE_ID = "spotify_device_id"
CONF_DEVICE_NAME = "device_name"
CONF_ENTITY_ID = "entity_id"
CONF_SPOTIFY_URI = "uri"
CONF_ACCOUNTS = "accounts"
CONF_SPOTIFY_ACCOUNT = "account"
CONF_FORCE_PLAYBACK = "force_playback"
CONF_RANDOM = "random_song"
CONF_REPEAT = "repeat"
CONF_SHUFFLE = "shuffle"
CONF_OFFSET = "offset"
CONF_SP_DC = "sp_dc"
CONF_SP_KEY = "sp_key"
CONF_START_VOL = "start_volume"
CONF_IGNORE_FULLY_PLAYED = "ignore_fully_played"

WS_TYPE_SPOTCAST_PLAYLISTS = "spotcast/playlists"

SCHEMA_PLAYLISTS = websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
    {
        vol.Required("type"): WS_TYPE_SPOTCAST_PLAYLISTS,
        vol.Required("playlist_type"): str,
        vol.Optional("limit"): int,
        vol.Optional("country_code"): str,
        vol.Optional("locale"): str,
        vol.Optional("account"): str,
    }
)

WS_TYPE_SPOTCAST_DEVICES = "spotcast/devices"
SCHEMA_WS_DEVICES = websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
    {
        vol.Required("type"): WS_TYPE_SPOTCAST_DEVICES,
        vol.Optional("account"): str,
    }
)

WS_TYPE_SPOTCAST_PLAYER = "spotcast/player"
SCHEMA_WS_PLAYER = websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
    {
        vol.Required("type"): WS_TYPE_SPOTCAST_PLAYER,
        vol.Optional("account"): str,
    }
)

WS_TYPE_SPOTCAST_ACCOUNTS = "spotcast/accounts"
SCHEMA_WS_ACCOUNTS = websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
    {
        vol.Required("type"): WS_TYPE_SPOTCAST_ACCOUNTS,
    }
)

WS_TYPE_SPOTCAST_CASTDEVICES = "spotcast/castdevices"
SCHEMA_WS_CASTDEVICES = websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
    {
        vol.Required("type"): WS_TYPE_SPOTCAST_CASTDEVICES,
    }
)

SERVICE_START_COMMAND_SCHEMA = vol.Schema(
    {
        vol.Optional(CONF_DEVICE_NAME): cv.string,
        vol.Optional(CONF_SPOTIFY_DEVICE_ID): cv.string,
        vol.Optional(CONF_ENTITY_ID): cv.string,
        vol.Optional(CONF_SPOTIFY_URI): cv.string,
        vol.Optional(CONF_SPOTIFY_ACCOUNT): cv.string,
        vol.Optional(CONF_FORCE_PLAYBACK, default=False): cv.boolean,
        vol.Optional(CONF_RANDOM, default=False): cv.boolean,
        vol.Optional(CONF_REPEAT, default="off"): cv.string,
        vol.Optional(CONF_SHUFFLE, default=False): cv.boolean,
        vol.Optional(CONF_OFFSET, default=0): cv.string,
        vol.Optional(CONF_START_VOL, default=101): cv.positive_int,
        vol.Optional(CONF_IGNORE_FULLY_PLAYED, default=False): cv.boolean,
    }
)

ACCOUNTS_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_SP_DC): cv.string,
        vol.Required(CONF_SP_KEY): cv.string,
    }
)

CONFIG_SCHEMA = vol.Schema(
    {
        DOMAIN: vol.Schema(
            {
                vol.Required(CONF_SP_DC): cv.string,
                vol.Required(CONF_SP_KEY): cv.string,
                vol.Optional(CONF_ACCOUNTS): cv.schema_with_slug_keys(ACCOUNTS_SCHEMA),
            }
        ),
    },
    extra=vol.ALLOW_EXTRA,
)


def get_spotify_devices(hass):
    platforms = entity_platform.async_get_platforms(hass, "spotify")
    spotify_media_player = None
    for platform in platforms:
        if platform.domain != "media_player":
            continue

        for entity in platform.entities.values():
            if isinstance(entity, SpotifyMediaPlayer):
                _LOGGER.debug(
                    f"get_spotify_devices: {entity.entity_id}: {entity.name} HH: %s",
                    entity._devices,
                )
                spotify_media_player = entity
                break
    if spotify_media_player:
        # Need to come from media_player spotify's sp client due to token issues
        return spotify_media_player._spotify.devices()


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


def setup(hass, config):
    """Setup the Spotcast service."""
    conf = config[DOMAIN]

    sp_dc = conf[CONF_SP_DC]
    sp_key = conf[CONF_SP_KEY]
    accounts = conf.get(CONF_ACCOUNTS)
    spotifyTokenInstances = {}

    def get_token_instance(account=None):
        """ Get token instance for account """
        if account is None or account == "default":
            account = "default"
            dc = sp_dc
            key = sp_key
        else:
            dc = accounts.get(account).get(CONF_SP_DC)
            key = accounts.get(account).get(CONF_SP_KEY)

        _LOGGER.debug("setting up with  account %s", account)
        if account not in spotifyTokenInstances:
            spotifyTokenInstances[account] = SpotifyToken(dc, key)
        return spotifyTokenInstances[account]

    @callback
    def websocket_handle_playlists(hass, connection, msg):
        @async_wrap
        def get_playlist():
            """Handle to get playlist"""
            playlistType = msg.get("playlist_type")
            countryCode = msg.get("country_code")
            locale = msg.get("locale", "en")
            limit = msg.get("limit", 10)
            account = msg.get("account", None)

            _LOGGER.debug("websocket_handle_playlists msg: %s", msg)

            client = spotipy.Spotify(auth=get_token_instance(account).access_token)
            resp = {}

            if playlistType == "discover-weekly":
                resp = client._get(
                    "views/made-for-x",
                    content_limit=limit,
                    locale=locale,
                    platform="web",
                    types="album,playlist,artist,show,station",
                    limit=limit,
                    offset=0,
                )
                resp = resp.get("content")
            elif playlistType == "featured":
                resp = client.featured_playlists(
                    locale=locale,
                    country=countryCode,
                    timestamp=datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
                    limit=limit,
                    offset=0,
                )
                resp = resp.get("playlists")
            else:
                resp = client.current_user_playlists(limit=limit)

            connection.send_message(websocket_api.result_message(msg["id"], resp))

        hass.async_add_job(get_playlist())

    @callback
    def websocket_handle_devices(hass, connection, msg):
        @async_wrap
        def get_devices():
            """Handle to get devices. Only for default account"""
            resp = get_spotify_devices(hass)
            connection.send_message(websocket_api.result_message(msg["id"], resp))

        hass.async_add_job(get_devices())

    @callback
    def websocket_handle_player(hass, connection, msg):
        @async_wrap
        def get_player():
            """Handle to get player"""
            account = msg.get("account", None)
            _LOGGER.debug("websocket_handle_player msg: %s", msg)
            client = spotipy.Spotify(auth=get_token_instance(account).access_token)
            resp = client._get("me/player")
            connection.send_message(websocket_api.result_message(msg["id"], resp))

        hass.async_add_job(get_player())

    @callback
    def websocket_handle_accounts(hass, connection, msg):
        """Handle to get accounts"""
        _LOGGER.debug("websocket_handle_accounts msg: %s", msg)
        resp = list(accounts.keys()) if accounts is not None else []
        resp.append("default")
        connection.send_message(websocket_api.result_message(msg["id"], resp))

    @callback
    def websocket_handle_castdevices(hass, connection, msg):
        """Handle to get cast devices for debug purposes"""
        _LOGGER.debug("websocket_handle_castdevices msg: %s", msg)

        known_devices = get_cast_devices(hass)
        _LOGGER.debug("%s", known_devices)
        resp = [
            {
                "uuid": cast_info.uuid,
                "model_name": cast_info.model_name,
                "friendly_name": cast_info.friendly_name,
            }
            for cast_info in known_devices
        ]

        connection.send_message(websocket_api.result_message(msg["id"], resp))

    def play(client, spotify_device_id, uri, random_song, repeat, shuffle, position, ignore_fully_played):
        _LOGGER.debug(
            "Playing URI: %s on device-id: %s",
            uri,
            spotify_device_id,
        )
        if uri.find("show") > 0:
            show_episodes_info = client.show_episodes(uri)
            if show_episodes_info and len(show_episodes_info["items"]) > 0:
                if ignore_fully_played:
                    for episode in show_episodes_info["items"]:
                        if not episode["resume_point"]["fully_played"]:
                            episode_uri = episode["external_urls"]["spotify"]
                            break
                else:
                    episode_uri = show_episodes_info["items"][0]["external_urls"]["spotify"]
                _LOGGER.debug(
                    "Playing episode using uris (latest podcast playlist)= for uri: %s",
                    episode_uri,
                )
                client.start_playback(device_id=spotify_device_id, uris=[episode_uri])
        elif uri.find("episode") > 0:
            _LOGGER.debug("Playing episode using uris= for uri: %s", uri)
            client.start_playback(device_id=spotify_device_id, uris=[uri])

        elif uri.find("track") > 0:
            _LOGGER.debug("Playing track using uris= for uri: %s", uri)
            client.start_playback(device_id=spotify_device_id, uris=[uri])
        else:
            if uri == "random":
                _LOGGER.debug(
                    "Cool, you found the easter egg with playing a random playlist"
                )
                playlists = client.user_playlists("me", 50)
                no_playlists = len(playlists["items"])
                uri = playlists["items"][random.randint(0, no_playlists - 1)]["uri"]
            kwargs = {"device_id": spotify_device_id, "context_uri": uri}

            if random_song:
                if uri.find("album") > 0:
                    results = client.album_tracks(uri)
                    position = random.randint(0, results["total"] - 1)
                elif uri.find("playlist") > 0:
                    results = client.playlist_tracks(uri)
                    position = random.randint(0, results["total"] - 1)
                _LOGGER.debug("Start playback at random position: %s", position)
            if uri.find("artist") < 1:
                kwargs["offset"] = {"position": position}
            _LOGGER.debug(
                'Playing context uri using context_uri for uri: "%s" (random_song: %s)',
                uri,
                random_song,
            )
            client.start_playback(**kwargs)

    def getSpotifyConnectDeviceId(client, device_name):
        devices_available = client.devices()
        for device in devices_available["devices"]:
            if device["name"] == device_name:
                return device["id"]
        return None

    def start_casting(call):
        """service called."""
        uri = call.data.get(CONF_SPOTIFY_URI)
        random_song = call.data.get(CONF_RANDOM, False)
        repeat = call.data.get(CONF_REPEAT)
        shuffle = call.data.get(CONF_SHUFFLE)
        start_volume = call.data.get(CONF_START_VOL)
        spotify_device_id = call.data.get(CONF_SPOTIFY_DEVICE_ID)
        position = call.data.get(CONF_OFFSET)
        force_playback = call.data.get(CONF_FORCE_PLAYBACK)
        account = call.data.get(CONF_SPOTIFY_ACCOUNT)
        ignore_fully_played = call.data.get(CONF_IGNORE_FULLY_PLAYED)

        # login as real browser to get powerful token
        access_token, expires = get_token_instance(account).get_spotify_token()

        # get the spotify web api client
        client = spotipy.Spotify(auth=access_token)

        # first, rely on spotify id given in config
        if not spotify_device_id:
            # if not present, check if there's a spotify connect device with that name
            spotify_device_id = getSpotifyConnectDeviceId(
                client, call.data.get(CONF_DEVICE_NAME)
            )
        if not spotify_device_id:
            # if still no id available, check cast devices and launch the app on chromecast
            spotify_cast_device = SpotifyCastDevice(
                hass,
                call.data.get(CONF_DEVICE_NAME),
                call.data.get(CONF_ENTITY_ID),
            )
            spotify_cast_device.startSpotifyController(access_token, expires)
            spotify_device_id = spotify_cast_device.getSpotifyDeviceId(get_spotify_devices(hass))

        if uri is None or uri.strip() == "":
            _LOGGER.debug("Transfering playback")
            current_playback = client.current_playback()
            if current_playback is not None:
                _LOGGER.debug("Current_playback from spotify: %s", current_playback)
                force_playback = True
            _LOGGER.debug("Force playback: %s", force_playback)
            client.transfer_playback(
                device_id=spotify_device_id, force_play=force_playback
            )
        else:
            play(client, spotify_device_id, uri, random_song, repeat, shuffle, position, ignore_fully_played)
        if shuffle or repeat or start_volume <= 100:
            if start_volume <= 100:
                _LOGGER.debug("Setting volume to %d", start_volume)
                time.sleep(2)
                client.volume(volume_percent=start_volume, device_id=spotify_device_id)
            if shuffle:
                _LOGGER.debug("Turning shuffle on")
                time.sleep(3)
                client.shuffle(state=shuffle, device_id=spotify_device_id)
            if repeat:
                _LOGGER.debug("Turning repeat on")
                time.sleep(3)
                client.repeat(state=repeat, device_id=spotify_device_id)

    # Register websocket and service
    hass.components.websocket_api.async_register_command(
        WS_TYPE_SPOTCAST_PLAYLISTS, websocket_handle_playlists, SCHEMA_PLAYLISTS
    )
    hass.components.websocket_api.async_register_command(
        WS_TYPE_SPOTCAST_DEVICES, websocket_handle_devices, SCHEMA_WS_DEVICES
    )
    hass.components.websocket_api.async_register_command(
        WS_TYPE_SPOTCAST_PLAYER, websocket_handle_player, SCHEMA_WS_PLAYER
    )

    hass.components.websocket_api.async_register_command(
        WS_TYPE_SPOTCAST_ACCOUNTS, websocket_handle_accounts, SCHEMA_WS_ACCOUNTS
    )

    hass.components.websocket_api.async_register_command(
        WS_TYPE_SPOTCAST_CASTDEVICES,
        websocket_handle_castdevices,
        SCHEMA_WS_CASTDEVICES,
    )

    hass.services.register(
        DOMAIN, "start", start_casting, schema=SERVICE_START_COMMAND_SCHEMA
    )

    return True


class SpotifyToken:
    """Represents a spotify token."""

    sp_dc = None
    sp_key = None
    _access_token = None
    _token_expires = 0

    def __init__(self, sp_dc, sp_key):
        self.sp_dc = sp_dc
        self.sp_key = sp_key

    def ensure_token_valid(self):
        if float(self._token_expires) > time.time():
            return True
        self.get_spotify_token()

    @property
    def access_token(self):
        self.ensure_token_valid()
        _LOGGER.debug("expires: %s time: %s", self._token_expires, time.time())
        return self._access_token

    def get_spotify_token(self):
        import spotify_token as st

        try:
            self._access_token, self._token_expires = st.start_session(
                self.sp_dc, self.sp_key
            )
            expires = self._token_expires - int(time.time())
            return self._access_token, expires
        except:
            raise HomeAssistantError("Could not get spotify token")


class SpotifyCastDevice:
    """Represents a spotify device."""

    hass = None
    castDevice = None
    spotifyController = None

    def __init__(self, hass, call_device_name, call_entity_id):
        """Initialize a spotify cast device."""
        self.hass = hass

        # Get device name from either device_name or entity_id
        device_name = None
        if call_device_name is None:
            entity_id = call_entity_id
            if entity_id is None:
                raise HomeAssistantError(
                    "Either entity_id or device_name must be specified"
                )
            entity_states = hass.states.get(entity_id)
            if entity_states is None:
                _LOGGER.error("Could not find entity_id: %s", entity_id)
            else:
                device_name = entity_states.attributes.get("friendly_name")
        else:
            device_name = call_device_name

        if device_name is None or device_name.strip() == "":
            raise HomeAssistantError("device_name is empty")

        # Find chromecast device
        self.castDevice = self.getChromecastDevice(device_name)
        _LOGGER.debug("Found cast device: %s", self.castDevice)
        self.castDevice.wait()

    def getChromecastDevice(self, device_name):
        import pychromecast

        # Get cast from discovered devices of cast platform
        known_devices = get_cast_devices(self.hass)

        _LOGGER.debug("Chromecast devices: %s", known_devices)

        cast_info = next(
            (
                castinfo
                for castinfo in known_devices
                if castinfo.friendly_name == device_name
            ),
            None,
        )

        _LOGGER.debug("cast info: %s", cast_info)

        if cast_info:
            return pychromecast.get_chromecast_from_cast_info(
                cast_info, ChromeCastZeroconf.get_zeroconf()
            )
        _LOGGER.error(
            "Could not find device %s from hass.data",
            device_name,
        )

        raise HomeAssistantError(
            "Could not find device with name {}".format(device_name)
        )

    def startSpotifyController(self, access_token, expires):
        from pychromecast.controllers.spotify import SpotifyController

        sp = SpotifyController(access_token, expires)
        self.castDevice.register_handler(sp)
        sp.launch_app()

        if not sp.is_launched and not sp.credential_error:
            raise HomeAssistantError(
                "Failed to launch spotify controller due to timeout"
            )
        if not sp.is_launched and sp.credential_error:
            raise HomeAssistantError(
                "Failed to launch spotify controller due to credentials error"
            )

        self.spotifyController = sp

    def getSpotifyDeviceId(self, devices_available):
        # Look for device to make sure we can start playback
        _LOGGER.debug(
            "devices_available: %s %s", devices_available, self.spotifyController.device
        )

        if devices := devices_available["devices"]:
            for device in devices:
                if device["id"] == self.spotifyController.device:
                    return device["id"]

        _LOGGER.error(
            'No device with id "{}" known by Spotify'.format(
                self.spotifyController.device
            )
        )
        _LOGGER.error("Known devices: {}".format(devices))

        raise HomeAssistantError("Failed to get device id from Spotify")
