"""Customizer component. Bring extra customize features to home-assistant."""

import asyncio
import logging
import os

import homeassistant.components.frontend as frontend
import homeassistant.helpers.config_validation as cv
from homeassistant.config import load_yaml_config_file, DATA_CUSTOMIZE
from homeassistant.core import callback

from homeassistant.helpers.entity import Entity
from homeassistant.helpers.entity_component import EntityComponent
from homeassistant.const import CONF_ENTITY_ID, MINOR_VERSION

import voluptuous as vol

_LOGGER = logging.getLogger(__name__)

DOMAIN = 'customizer'
DEPENDENCIES = ['frontend']

CONF_CUSTOM_UI = 'custom_ui'

LOCAL = 'local'
HOSTED = 'hosted'
DEBUG = 'debug'

CONF_HIDE_ATTRIBUTES = 'hide_attributes'

CONF_ATTRIBUTE = 'attribute'
CONF_VALUE = 'value'
CONF_COLUMNS = 'columns'

SERVICE_SET_ATTRIBUTE = 'set_attribute'
SERVICE_SET_ATTRIBUTE_SCHEMA = vol.Schema({
    vol.Required(CONF_ENTITY_ID): cv.entity_id,
    vol.Required(CONF_ATTRIBUTE): cv.string,
    vol.Optional(CONF_VALUE): cv.match_all,
})

CONFIG_SCHEMA = vol.Schema({
    DOMAIN: vol.Schema({
        vol.Optional(CONF_CUSTOM_UI): cv.string,
        vol.Optional(CONF_COLUMNS): [int],
        vol.Optional(CONF_HIDE_ATTRIBUTES):
            vol.All(cv.ensure_list, [cv.string]),
    })
}, extra=vol.ALLOW_EXTRA)


@asyncio.coroutine
def async_setup(hass, config):
    """Set up customizer."""
    custom_ui = config[DOMAIN].get(CONF_CUSTOM_UI)
    if MINOR_VERSION < 53 and custom_ui is not None:
        _LOGGER.warning('%s is only supported from Home Assistant 0.53',
                        CONF_CUSTOM_UI)
    elif custom_ui is not None:
        def add_extra_html_url(base_url):
            """Add extra url using version-dependent function."""
            if MINOR_VERSION >= 59:
                frontend.add_extra_html_url(
                    hass, '{}.html'.format(base_url), False)
                frontend.add_extra_html_url(
                    hass, '{}-es5.html'.format(base_url), True)
            else:
                frontend.add_extra_html_url(hass, '{}.html'.format(base_url))

        if custom_ui == LOCAL:
            add_extra_html_url('/local/custom_ui/state-card-custom-ui')
        elif custom_ui == HOSTED:
            add_extra_html_url(
                'https://raw.githubusercontent.com/andrey-git/'
                'home-assistant-custom-ui/master/state-card-custom-ui')
        elif custom_ui == DEBUG:
            add_extra_html_url(
                'https://raw.githubusercontent.com/andrey-git/'
                'home-assistant-custom-ui/master/'
                'state-card-custom-ui-dbg')
        else:
            add_extra_html_url(
                'https://github.com/andrey-git/home-assistant-custom-ui/'
                'releases/download/{}/state-card-custom-ui'
                .format(custom_ui))

    component = EntityComponent(_LOGGER, DOMAIN, hass)
    yield from component.async_add_entities([CustomizerEntity(config[DOMAIN])])

    @callback
    def set_attribute(call):
        """Set attribute override."""
        data = call.data
        entity_id = data[CONF_ENTITY_ID]
        attribute = data[CONF_ATTRIBUTE]
        value = data.get(CONF_VALUE)
        overrides = hass.data[DATA_CUSTOMIZE].get(entity_id)
        state = hass.states.get(entity_id)
        state_attributes = dict(state.attributes)
        if value is None:
            if attribute in overrides:
                overrides.pop(attribute)
            if attribute in state_attributes:
                state_attributes.pop(attribute)
        else:
            overrides[attribute] = value
            state_attributes[attribute] = value
        hass.states.async_set(entity_id, state.state, state_attributes)

    if MINOR_VERSION >= 61:
        hass.services.async_register(DOMAIN, SERVICE_SET_ATTRIBUTE,
                                     set_attribute,
                                     SERVICE_SET_ATTRIBUTE_SCHEMA)
    else:
        descriptions = yield from hass.async_add_job(
            load_yaml_config_file, os.path.join(
                os.path.dirname(__file__), 'services.yaml'))
        hass.services.async_register(DOMAIN, SERVICE_SET_ATTRIBUTE,
                                     set_attribute,
                                     descriptions[SERVICE_SET_ATTRIBUTE],
                                     SERVICE_SET_ATTRIBUTE_SCHEMA)

    return True


class CustomizerEntity(Entity):
    """Customizer entity class."""

    def __init__(self, config):
        """Constructor that parses the config."""
        self.hide_attributes = config.get(CONF_HIDE_ATTRIBUTES)
        self.columns = config.get(CONF_COLUMNS)

    @property
    def hidden(self):
        """Don't show the entity."""
        return True

    @property
    def name(self):
        """Singleton name."""
        return DOMAIN

    @property
    def state_attributes(self):
        """Return the state attributes."""
        result = {}
        if self.hide_attributes:
            result[CONF_HIDE_ATTRIBUTES] = self.hide_attributes
        if self.columns:
            result[CONF_COLUMNS] = self.columns
        return result
