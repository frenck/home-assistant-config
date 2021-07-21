import logging
import time

from homeassistant.components import websocket_api
from homeassistant.const import CONF_ENTITY_ID, CONF_OFFSET, CONF_REPEAT
from homeassistant.core import callback

from .const import (
    CONF_ACCOUNTS,
    CONF_DEVICE_NAME,
    CONF_FORCE_PLAYBACK,
    CONF_IGNORE_FULLY_PLAYED,
    CONF_RANDOM,
    CONF_SHUFFLE,
    CONF_SP_DC,
    CONF_SP_KEY,
    CONF_SPOTIFY_ACCOUNT,
    CONF_SPOTIFY_DEVICE_ID,
    CONF_SPOTIFY_URI,
    CONF_START_VOL,
    DOMAIN,
    SCHEMA_PLAYLISTS,
    SCHEMA_WS_ACCOUNTS,
    SCHEMA_WS_CASTDEVICES,
    SCHEMA_WS_DEVICES,
    SCHEMA_WS_PLAYER,
    SERVICE_START_COMMAND_SCHEMA,
    SPOTCAST_CONFIG_SCHEMA,
    WS_TYPE_SPOTCAST_ACCOUNTS,
    WS_TYPE_SPOTCAST_CASTDEVICES,
    WS_TYPE_SPOTCAST_DEVICES,
    WS_TYPE_SPOTCAST_PLAYER,
    WS_TYPE_SPOTCAST_PLAYLISTS,
)
from .helpers import async_wrap, get_cast_devices, get_spotify_devices
from .spotcast_controller import SpotcastController

CONFIG_SCHEMA = SPOTCAST_CONFIG_SCHEMA

_LOGGER = logging.getLogger(__name__)


def setup(hass, config):
    """Setup the Spotcast service."""
    conf = config[DOMAIN]

    sp_dc = conf[CONF_SP_DC]
    sp_key = conf[CONF_SP_KEY]
    accounts = conf.get(CONF_ACCOUNTS)

    spotcast_controller = SpotcastController(hass, sp_dc, sp_key, accounts)

    @callback
    def websocket_handle_playlists(hass, connection, msg):
        @async_wrap
        def get_playlist():
            """Handle to get playlist"""
            playlist_type = msg.get("playlist_type")
            country_code = msg.get("country_code")
            locale = msg.get("locale", "en")
            limit = msg.get("limit", 10)
            account = msg.get("account", None)

            _LOGGER.debug("websocket_handle_playlists msg: %s", msg)
            resp = spotcast_controller.get_playlists(
                account, playlist_type, country_code, locale, limit
            )
            connection.send_message(websocket_api.result_message(msg["id"], resp))

        hass.async_add_job(get_playlist())

    @callback
    def websocket_handle_devices(hass, connection, msg):
        @async_wrap
        def get_devices():
            """Handle to get devices. Only for default account"""
            account = msg.get("account", None)
            client = spotcast_controller.get_spotify_client(account)
            me_resp = client._get("me")
            resp = get_spotify_devices(hass, me_resp["id"])
            connection.send_message(websocket_api.result_message(msg["id"], resp))

        hass.async_add_job(get_devices())

    @callback
    def websocket_handle_player(hass, connection, msg):
        @async_wrap
        def get_player():
            """Handle to get player"""
            account = msg.get("account", None)
            _LOGGER.debug("websocket_handle_player msg: %s", msg)
            client = spotcast_controller.get_spotify_client(account)
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

    def start_casting(call):
        """service called."""
        uri = call.data.get(CONF_SPOTIFY_URI)
        random_song = call.data.get(CONF_RANDOM, False)
        repeat = call.data.get(CONF_REPEAT, False)
        shuffle = call.data.get(CONF_SHUFFLE, False)
        start_volume = call.data.get(CONF_START_VOL)
        spotify_device_id = call.data.get(CONF_SPOTIFY_DEVICE_ID)
        position = call.data.get(CONF_OFFSET)
        force_playback = call.data.get(CONF_FORCE_PLAYBACK)
        account = call.data.get(CONF_SPOTIFY_ACCOUNT)
        ignore_fully_played = call.data.get(CONF_IGNORE_FULLY_PLAYED)
        device_name = call.data.get(CONF_DEVICE_NAME)
        entity_id = call.data.get(CONF_ENTITY_ID)

        client = spotcast_controller.get_spotify_client(account)

        # first, rely on spotify id given in config otherwise get one
        if not spotify_device_id:
            spotify_device_id = spotcast_controller.get_spotify_device_id(
                account, spotify_device_id, device_name, entity_id
            )

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
            spotcast_controller.play(
                client,
                spotify_device_id,
                uri,
                random_song,
                position,
                ignore_fully_played,
            )

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
