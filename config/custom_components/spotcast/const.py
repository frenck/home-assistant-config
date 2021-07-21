import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.const import CONF_ENTITY_ID, CONF_OFFSET, CONF_REPEAT

DOMAIN = "spotcast"

CONF_SPOTIFY_DEVICE_ID = "spotify_device_id"
CONF_DEVICE_NAME = "device_name"
CONF_SPOTIFY_URI = "uri"
CONF_ACCOUNTS = "accounts"
CONF_SPOTIFY_ACCOUNT = "account"
CONF_FORCE_PLAYBACK = "force_playback"
CONF_RANDOM = "random_song"
CONF_SHUFFLE = "shuffle"
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

SPOTCAST_CONFIG_SCHEMA = vol.Schema(
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
