import logging
import random
import time
from collections import OrderedDict
from datetime import datetime

import pychromecast
import spotify_token as st
import spotipy
from homeassistant.components.cast.helpers import ChromeCastZeroconf
from homeassistant.exceptions import HomeAssistantError
from pychromecast.controllers.spotify import SpotifyController

from .const import CONF_SP_DC, CONF_SP_KEY
from .helpers import get_cast_devices, get_spotify_devices

_LOGGER = logging.getLogger(__name__)


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


class SpotifyToken:
    """Represents a spotify token for an account."""

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
        try:
            self._access_token, self._token_expires = st.start_session(
                self.sp_dc, self.sp_key
            )
            expires = self._token_expires - int(time.time())
            return self._access_token, expires
        except:  # noqa: E722
            raise HomeAssistantError("Could not get spotify token")


class SpotcastController:

    spotifyTokenInstances = {}
    accounts: dict = {}
    hass = None

    def __init__(self, hass, sp_dc, sp_key, accs):
        if accs:
            self.accounts = accs
        self.accounts["default"] = OrderedDict([("sp_dc", sp_dc), ("sp_key", sp_key)])
        self.hass = hass

    def get_token_instance(self, account=None):
        """Get token instance for account"""
        if account is None:
            account = "default"
        dc = self.accounts.get(account).get(CONF_SP_DC)
        key = self.accounts.get(account).get(CONF_SP_KEY)

        _LOGGER.debug("setting up with  account %s", account)
        if account not in self.spotifyTokenInstances:
            self.spotifyTokenInstances[account] = SpotifyToken(dc, key)
        return self.spotifyTokenInstances[account]

    def get_spotify_client(self, account):
        return spotipy.Spotify(auth=self.get_token_instance(account).access_token)

    def _getSpotifyConnectDeviceId(self, client, device_name):
        devices_available = get_spotify_devices(self.hass, client._get("me")["id"])
        for device in devices_available["devices"]:
            if device["name"] == device_name:
                return device["id"]
        return None

    def get_spotify_device_id(self, account, spotify_device_id, device_name, entity_id):
        # login as real browser to get powerful token
        access_token, expires = self.get_token_instance(account).get_spotify_token()
        # get the spotify web api client
        client = spotipy.Spotify(auth=access_token)
        # first, rely on spotify id given in config
        if not spotify_device_id:
            # if not present, check if there's a spotify connect device with that name
            spotify_device_id = self._getSpotifyConnectDeviceId(client, device_name)
        if not spotify_device_id:
            # if still no id available, check cast devices and launch the app on chromecast
            spotify_cast_device = SpotifyCastDevice(
                self.hass,
                device_name,
                entity_id,
            )
            me_resp = client._get("me")
            spotify_cast_device.startSpotifyController(access_token, expires)
            # Make sure it is started
            spotify_device_id = spotify_cast_device.getSpotifyDeviceId(
                get_spotify_devices(self.hass, me_resp["id"])
            )
        return spotify_device_id

    def play(
        self,
        client,
        spotify_device_id,
        uri,
        random_song,
        position,
        ignore_fully_played,
    ):
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
                    episode_uri = show_episodes_info["items"][0]["external_urls"][
                        "spotify"
                    ]
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

    def get_playlists(self, account, playlist_type, country_code, locale, limit):
        client = self.get_spotify_client(account)
        resp = {}

        if playlist_type == "discover-weekly":
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
        elif playlist_type == "featured":
            resp = client.featured_playlists(
                locale=locale,
                country=country_code,
                timestamp=datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
                limit=limit,
                offset=0,
            )
            resp = resp.get("playlists")
        else:
            resp = client.current_user_playlists(limit=limit)

        return resp
