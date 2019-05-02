"""
A component which allows you to update your custom cards and components.

For more details about this component, please refer to the documentation at
https://github.com/custom-components/custom_updater
"""
import logging
import os.path
from datetime import timedelta

import voluptuous as vol
from aiohttp import web
from homeassistant.const import EVENT_HOMEASSISTANT_START
import homeassistant.helpers.config_validation as cv
from homeassistant.components.http import HomeAssistantView
from homeassistant.helpers.event import async_track_time_interval

VERSION = '5.0.0'

_LOGGER = logging.getLogger(__name__)

REQUIREMENTS = ['pyupdate==1.3.6']

CONF_TRACK = 'track'
CONF_HIDE_SENSOR = 'hide_sensor'
CONF_SHOW_INSTALLABLE = 'show_installable'
CONF_CARD_CONFIG_URLS = 'card_urls'
CONF_COMPONENT_CONFIG_URLS = 'component_urls'
CONF_PYTHON_SCRIPT_CONFIG_URLS = 'python_script_urls'

DOMAIN = 'custom_updater'

INTERVAL = timedelta(days=1)

ATTR_CARD = 'card'
ATTR_COMPONENT = 'component'
ATTR_ELEMENT = 'element'

DEFAULT_TRACK = ['components', 'cards']

CONFIG_SCHEMA = vol.Schema({
    DOMAIN: vol.Schema({
        vol.Optional(CONF_TRACK, default=DEFAULT_TRACK):
            vol.All(cv.ensure_list, [cv.string]),
        vol.Optional(CONF_HIDE_SENSOR, default=False): cv.boolean,
        vol.Optional(CONF_SHOW_INSTALLABLE, default=False): cv.boolean,
        vol.Optional(CONF_CARD_CONFIG_URLS, default=[]):
            vol.All(cv.ensure_list, [cv.url]),
        vol.Optional(CONF_COMPONENT_CONFIG_URLS, default=[]):
            vol.All(cv.ensure_list, [cv.url]),
        vol.Optional(CONF_PYTHON_SCRIPT_CONFIG_URLS, default=[]):
            vol.All(cv.ensure_list, [cv.url]),
    })
}, extra=vol.ALLOW_EXTRA)


async def async_setup(hass, config):
    """Set up this component."""
    conf_mode = config.get('lovelace', {}).get('mode', 'storage')
    conf_track = config[DOMAIN][CONF_TRACK]
    conf_hide_sensor = config[DOMAIN][CONF_HIDE_SENSOR]
    conf_card_urls = config[DOMAIN][CONF_CARD_CONFIG_URLS]
    conf_component_urls = config[DOMAIN][CONF_COMPONENT_CONFIG_URLS]
    conf_py_script_urls = config[DOMAIN][CONF_PYTHON_SCRIPT_CONFIG_URLS]

    _LOGGER.info('if you have ANY issues with this, please report them here:'
                 ' https://github.com/custom-components/custom_updater')

    _LOGGER.debug('Version %s', VERSION)
    _LOGGER.debug('Mode %s', conf_mode)

    if conf_mode == 'yaml':
        if not os.path.exists("{}/ui-lovelace.yaml".format(str(hass.config.path()))):
            _LOGGER.warning(
                "Configured to run with yaml mode but ui-lovelace.yaml does not exist, assuming storage is used")
            conf_mode = 'storage'

    if 'cards' in conf_track:
        card_controller = CustomCards(
            hass, conf_hide_sensor, conf_card_urls, conf_mode)

        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_START, card_controller.extra_init())

        async_track_time_interval(
            hass, card_controller.force_reload, INTERVAL)

    if 'components' in conf_track:
        components_controller = CustomComponents(
            hass, conf_hide_sensor, conf_component_urls)

        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_START, components_controller.extra_init())

        async_track_time_interval(
            hass, components_controller.cache_versions, INTERVAL)

    if 'python_scripts' in conf_track:
        python_scripts_controller = CustomPythonScripts(
            hass, conf_hide_sensor, conf_py_script_urls)

        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_START, python_scripts_controller.extra_init())

        async_track_time_interval(
            hass, python_scripts_controller.cache_versions, INTERVAL)

    async def check_all_service(call):
        """Set up service for manual trigger."""
        if 'cards' in conf_track:
            await card_controller.force_reload()
        if 'components' in conf_track:
            await components_controller.cache_versions()
        if 'python_scripts' in conf_track:
            await python_scripts_controller.cache_versions()

    async def update_all_service(call):
        """Set up service for manual trigger."""
        if 'cards' in conf_track:
            await card_controller.update_all()
        if 'components' in conf_track:
            await components_controller.update_all()
        if 'python_scripts' in conf_track:
            await python_scripts_controller.update_all()

    async def install_service(call):
        """Install single component/card."""
        element = call.data.get(ATTR_ELEMENT)
        _LOGGER.debug('Installing %s', element)
        if 'cards' in conf_track:
            await card_controller.install(element)
        if 'components' in conf_track:
            await components_controller.install(element)
        if 'python_scripts' in conf_track:
            await python_scripts_controller.install(element)

    hass.services.async_register(DOMAIN, 'check_all', check_all_service)
    hass.services.async_register(DOMAIN, 'update_all', update_all_service)
    hass.services.async_register(DOMAIN, 'install', install_service)
    return True


class CustomCards():
    """Custom cards controller."""

    # pylint: disable=too-many-instance-attributes

    def __init__(self, hass, conf_hide_sensor, conf_card_urls,
                 conf_mode):
        """Initialize."""
        _LOGGER.debug('CustomCards - __init__')
        from pyupdate.ha_custom.custom_cards import CustomCards as Cards
        self.hass = hass
        self.ha_conf_dir = str(hass.config.path())
        self.hidden = conf_hide_sensor
        self.pyupdate = Cards(self.ha_conf_dir, conf_mode, '', conf_card_urls)

    async def extra_init(self):
        """Additional init."""
        _LOGGER.debug('CustomCards - extra_init')
        await self.pyupdate.init_local_data()
        await self.cache_versions()
        await self.serve_dynamic_files()

    async def force_reload(self, now=None):
        """Force data refresh"""
        _LOGGER.debug('CustomCards - force_reload')
        await self.pyupdate.force_reload()
        await self.cache_versions()

    async def cache_versions(self, now=None):
        """Cache."""
        _LOGGER.debug('CustomCards - cache_versions')
        information = await self.pyupdate.get_sensor_data()
        state = int(information[1])
        attributes = information[0]
        attributes['hidden'] = self.hidden
        self.hass.states.async_set(
            'sensor.custom_card_tracker', state, attributes)

    async def update_all(self):
        """Update all cards."""
        _LOGGER.debug('CustomCards - update_all')
        await self.pyupdate.update_all()
        information = await self.pyupdate.get_sensor_data()
        state = int(information[1])
        attributes = information[0]
        attributes['hidden'] = self.hidden
        self.hass.states.async_set(
            'sensor.custom_card_tracker', state, attributes)

    async def install(self, element):
        """Install single card."""
        _LOGGER.debug('CustomCards - update_all')
        await self.pyupdate.install(element)

    async def serve_dynamic_files(self):
        """Serve dynamic cardfiles."""
        self.hass.http.register_view(CustomCardsView(self.ha_conf_dir))


class CustomComponents():
    """Custom components controller."""

    # pylint: disable=too-many-instance-attributes

    def __init__(self, hass, conf_hide_sensor, conf_component_urls):
        """Initialize."""
        _LOGGER.debug('CustomComponents - __init__')
        from pyupdate.ha_custom.custom_components import (
            CustomComponents as Components)
        self.hass = hass
        self.ha_conf_dir = str(hass.config.path())
        self.hidden = conf_hide_sensor
        self.pyupdate = Components(self.ha_conf_dir, conf_component_urls)

    async def extra_init(self):
        """Additional init."""
        _LOGGER.debug('CustomComponents - extra_init')
        await self.cache_versions()

    async def cache_versions(self, now=None):
        """Cache."""
        _LOGGER.debug('CustomComponents - cache_versions')
        information = await self.pyupdate.get_sensor_data(True)
        state = int(information[1])
        attributes = information[0]
        attributes['hidden'] = self.hidden
        self.hass.states.async_set(
            'sensor.custom_component_tracker', state, attributes)

    async def update_all(self):
        """Update all components."""
        _LOGGER.debug('CustomComponents - update_all')
        await self.pyupdate.update_all()
        information = await self.pyupdate.get_sensor_data()
        state = int(information[1])
        attributes = information[0]
        attributes['hidden'] = self.hidden
        self.hass.states.async_set(
            'sensor.custom_component_tracker', state, attributes)

    async def install(self, element):
        """Install single component."""
        _LOGGER.debug('CustomComponents - install')
        await self.pyupdate.install(element)


class CustomPythonScripts():
    """Custom python_scripts controller."""

    # pylint: disable=too-many-instance-attributes

    def __init__(self, hass, conf_hide_sensor, conf_python_script_urls):
        """Initialize."""
        _LOGGER.debug('CustomPythonScripts - __init__')
        from pyupdate.ha_custom.python_scripts import PythonScripts
        self.hass = hass
        self.ha_conf_dir = str(hass.config.path())
        self.hidden = conf_hide_sensor
        self.pyupdate = PythonScripts(
            self.ha_conf_dir, conf_python_script_urls)

    async def extra_init(self):
        """Additional init."""
        _LOGGER.debug('CustomPythonScripts - extra_init')
        await self.cache_versions()

    async def cache_versions(self, now=None):
        """Cache."""
        _LOGGER.debug('CustomPythonScripts - cache_versions')
        information = await self.pyupdate.get_sensor_data(True)
        state = int(information[1])
        attributes = information[0]
        attributes['hidden'] = self.hidden
        self.hass.states.async_set(
            'sensor.custom_python_script_tracker', state, attributes)

    async def update_all(self):
        """Update all python_scripts."""
        _LOGGER.debug('CustomPythonScripts - update_all')
        await self.pyupdate.update_all()
        information = await self.pyupdate.get_sensor_data()
        state = int(information[1])
        attributes = information[0]
        attributes['hidden'] = self.hidden
        self.hass.states.async_set(
            'sensor.custom_python_script_tracker', state, attributes)

    async def install(self, element):
        """Install single python_script."""
        _LOGGER.debug('CustomPythonScripts - install')
        await self.pyupdate.install(element)


class CustomCardsView(HomeAssistantView):
    """View to return a custom_card file."""

    requires_auth = False

    url = r"/customcards/{path:.+}"
    name = "customcards"

    def __init__(self, hadir):
        """Initialize custom_card view."""
        self.hadir = hadir

    async def get(self, request, path):
        """Retrieve custom_card."""
        if '?' in path:
            path = path.split('?')[0]
        file = "{}/www/{}".format(self.hadir, path)
        if os.path.exists(file):
            msg = "Serving /customcards/{path} from /www/{path}".format(
                path=path)
            _LOGGER.debug(msg)
            resp = web.FileResponse(file)
            resp.headers["Cache-Control"] = "max-age=0, must-revalidate"
            return resp
        else:
            _LOGGER.error("Tried to serve up '%s' but it does not exist", file)
            return None
