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
import homeassistant.helpers.config_validation as cv
from homeassistant.components.http import HomeAssistantView
from homeassistant.helpers.event import track_time_interval

VERSION = '4.0.5'

_LOGGER = logging.getLogger(__name__)

REQUIREMENTS = ['pyupdate==0.2.29']

CONF_TRACK = 'track'
CONF_HIDE_SENSOR = 'hide_sensor'
CONF_SHOW_INSTALLABLE = 'show_installable'
CONF_MODE = 'mode'
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
        vol.Optional(CONF_MODE, default='yaml'): cv.string,
        vol.Optional(CONF_CARD_CONFIG_URLS, default=[]):
            vol.All(cv.ensure_list, [cv.url]),
        vol.Optional(CONF_COMPONENT_CONFIG_URLS, default=[]):
            vol.All(cv.ensure_list, [cv.url]),
        vol.Optional(CONF_PYTHON_SCRIPT_CONFIG_URLS, default=[]):
            vol.All(cv.ensure_list, [cv.url]),
    })
}, extra=vol.ALLOW_EXTRA)


def setup(hass, config):
    """Set up this component."""
    conf_mode = config[DOMAIN][CONF_MODE]
    conf_track = config[DOMAIN][CONF_TRACK]
    conf_hide_sensor = config[DOMAIN][CONF_HIDE_SENSOR]
    config_show_installabe = config[DOMAIN][CONF_SHOW_INSTALLABLE]
    conf_card_urls = config[DOMAIN][CONF_CARD_CONFIG_URLS]
    conf_component_urls = config[DOMAIN][CONF_COMPONENT_CONFIG_URLS]
    conf_py_script_urls = config[DOMAIN][CONF_PYTHON_SCRIPT_CONFIG_URLS]

    _LOGGER.info('if you have ANY issues with this, please report them here:'
                 ' https://github.com/custom-components/custom_updater')

    _LOGGER.debug('Version %s', VERSION)
    _LOGGER.debug('Mode %s', conf_mode)

    if 'cards' in conf_track:
        card_controller = CustomCards(hass,
                                      conf_hide_sensor, conf_card_urls,
                                      config_show_installabe, conf_mode)
        track_time_interval(hass, card_controller.cache_versions, INTERVAL)
    if 'components' in conf_track:
        components_controller = CustomComponents(hass,
                                                 conf_hide_sensor,
                                                 conf_component_urls,
                                                 config_show_installabe)
        track_time_interval(hass, components_controller.cache_versions,
                            INTERVAL)
    if 'python_scripts' in conf_track:
        python_scripts_controller = CustomPythonScripts(hass,
                                                        conf_hide_sensor,
                                                        conf_py_script_urls,
                                                        config_show_installabe)
        track_time_interval(hass, python_scripts_controller.cache_versions,
                            INTERVAL)

    def check_all_service(call):
        """Set up service for manual trigger."""
        if 'cards' in conf_track:
            card_controller.cache_versions()
        if 'components' in conf_track:
            components_controller.cache_versions()
        if 'python_scripts' in conf_track:
            python_scripts_controller.cache_versions()

    def update_all_service(call):
        """Set up service for manual trigger."""
        if 'cards' in conf_track:
            card_controller.update_all()
        if 'components' in conf_track:
            components_controller.update_all()
        if 'python_scripts' in conf_track:
            python_scripts_controller.update_all()

    def install_service(call):
        """Install single component/card."""
        element = call.data.get(ATTR_ELEMENT)
        _LOGGER.debug('Installing %s', element)
        if 'cards' in conf_track:
            card_controller.install(element)
        if 'components' in conf_track:
            components_controller.install(element)
        if 'python_scripts' in conf_track:
            python_scripts_controller.install(element)

    hass.services.register(DOMAIN, 'check_all', check_all_service)
    hass.services.register(DOMAIN, 'update_all', update_all_service)
    hass.services.register(DOMAIN, 'install', install_service)
    return True


class CustomCards():
    """Custom cards controller."""

    # pylint: disable=too-many-instance-attributes

    def __init__(self, hass, conf_hide_sensor, conf_card_urls,
                 config_show_installable, conf_mode):
        """Initialize."""
        from pyupdate.ha_custom import custom_cards
        self.pyupdate = custom_cards
        self.hass = hass
        self.ha_conf_dir = str(hass.config.path())
        self.data = {}
        self.mode = conf_mode
        self.updatable = 0
        self.hidden = conf_hide_sensor
        self.custom_url = conf_card_urls
        self.show_installable = config_show_installable
        self.pyupdate.init_local_data(
            self.ha_conf_dir, self.mode, conf_card_urls)
        self.serve_dynamic_files()
        self.cache_versions()

    def cache_versions(self, now=None):
        """Cache."""
        information = self.pyupdate.get_sensor_data(
            self.ha_conf_dir, self.mode, self.show_installable, self.custom_url)
        state = int(information[1])
        attributes = information[0]
        attributes['hidden'] = self.hidden
        self.hass.states.set('sensor.custom_card_tracker', state, attributes)

    def update_all(self):
        """Update all cards."""
        self.pyupdate.update_all(
            self.ha_conf_dir, self.mode, self.show_installable, self.custom_url)
        information = self.pyupdate.get_sensor_data(
            self.ha_conf_dir, self.mode, self.show_installable, self.custom_url)
        state = int(information[1])
        attributes = information[0]
        attributes['hidden'] = self.hidden
        self.hass.states.set('sensor.custom_card_tracker', state, attributes)

    def install(self, element):
        """Install single card."""
        self.pyupdate.install(self.ha_conf_dir, element, self.custom_url)

    def serve_dynamic_files(self):
        """Serve dynamic cardfiles."""
        self.hass.http.register_view(CustomCardsView(self.ha_conf_dir))


class CustomComponents():
    """Custom components controller."""

    # pylint: disable=too-many-instance-attributes

    def __init__(self, hass, conf_hide_sensor, conf_component_urls,
                 config_show_installable):
        """Initialize."""
        from pyupdate.ha_custom import custom_components
        self.pyupdate = custom_components
        self.hass = hass
        self.ha_conf_dir = str(hass.config.path())
        self.data = {}
        self.updatable = 0
        self.hidden = conf_hide_sensor
        self.custom_url = conf_component_urls
        self.show_installable = config_show_installable
        self.cache_versions()

    def cache_versions(self, now=None):
        """Cache."""
        information = self.pyupdate.get_sensor_data(self.ha_conf_dir,
                                                    self.show_installable,
                                                    self.custom_url)
        state = int(information[1])
        attributes = information[0]
        attributes['hidden'] = self.hidden
        self.hass.states.set('sensor.custom_component_tracker', state,
                             attributes)

    def update_all(self):
        """Update all components."""
        self.pyupdate.update_all(self.ha_conf_dir, self.show_installable,
                                 self.custom_url)
        information = self.pyupdate.get_sensor_data(self.ha_conf_dir,
                                                    self.show_installable,
                                                    self.custom_url)
        state = int(information[1])
        attributes = information[0]
        attributes['hidden'] = self.hidden
        self.hass.states.set('sensor.custom_component_tracker', state,
                             attributes)

    def install(self, element):
        """Install single component."""
        self.pyupdate.install(self.ha_conf_dir, element, self.custom_url)


class CustomPythonScripts():
    """Custom python_scripts controller."""

    # pylint: disable=too-many-instance-attributes

    def __init__(self, hass, conf_hide_sensor, conf_python_script_urls,
                 config_show_installable):
        """Initialize."""
        from pyupdate.ha_custom import python_scripts
        self.pyupdate = python_scripts
        self.hass = hass
        self.ha_conf_dir = str(hass.config.path())
        self.data = {}
        self.updatable = 0
        self.hidden = conf_hide_sensor
        self.custom_url = conf_python_script_urls
        self.show_installable = config_show_installable
        self.cache_versions()

    def cache_versions(self, now=None):
        """Cache."""
        information = self.pyupdate.get_sensor_data(self.ha_conf_dir,
                                                    self.show_installable,
                                                    self.custom_url)
        state = int(information[1])
        attributes = information[0]
        attributes['hidden'] = self.hidden
        self.hass.states.set('sensor.custom_python_script_tracker',
                             state,
                             attributes)

    def update_all(self):
        """Update all python_scripts."""
        self.pyupdate.update_all(self.ha_conf_dir, self.show_installable,
                                 self.custom_url)
        information = self.pyupdate.get_sensor_data(self.ha_conf_dir,
                                                    self.show_installable,
                                                    self.custom_url)
        state = int(information[1])
        attributes = information[0]
        attributes['hidden'] = self.hidden
        self.hass.states.set('sensor.custom_python_script_tracker',
                             state,
                             attributes)

    def install(self, element):
        """Install single python_script."""
        self.pyupdate.install(self.ha_conf_dir, element, self.custom_url)


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
            msg = "Serving /customcards/{path} from /www/{path}".format(path=path)
            _LOGGER.debug(msg)
            resp = web.FileResponse(file)
            return resp
        else:
            _LOGGER.error("Tried to serve up '%s' but it does not exist", file)
            return None
