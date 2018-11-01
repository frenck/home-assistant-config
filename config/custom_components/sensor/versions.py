"""
A platform which allows you to get information about new versions.

For more details about this component, please refer to the documentation at
https://github.com/custom-components/sensor.versions
"""
from datetime import timedelta
import voluptuous as vol
from homeassistant.helpers.entity import Entity
import homeassistant.helpers.config_validation as cv
from homeassistant.components.sensor import (PLATFORM_SCHEMA)

__version__ = '0.3.0'

REQUIREMENTS = ['pyhaversion==1.0.0']

CONF_INSTALLATION = 'installation'
CONF_BRANCH = 'branch'
CONF_IMAGE = 'image'
CONF_NAME = 'name'

SCAN_INTERVAL = timedelta(seconds=300)

PLATFORM_NAME = 'versions'

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({
    vol.Optional(CONF_INSTALLATION, default='venv'): cv.string,
    vol.Optional(CONF_BRANCH, default='stable'): cv.string,
    vol.Optional(CONF_IMAGE, default='default'): cv.string,
    vol.Optional(CONF_NAME, default='none'): cv.string,
})


def setup_platform(hass, config, add_devices, discovery_info=None):
    """Create the sensor."""
    installation = config.get(CONF_INSTALLATION)
    branch = config.get(CONF_BRANCH)
    image = config.get(CONF_IMAGE)
    name = config.get(CONF_NAME)
    add_devices([HomeAssistantVersion(installation, branch, image, name)])


class HomeAssistantVersion(Entity):
    """Representation of a Sensor."""

    def __init__(self, installation, branch, image, name):
        """Initialize the sensor."""
        self._installation = installation
        self._branch = branch
        self._image = image
        self._state = None
        self._attributes = None
        self._name = name
        self.update()

    def update(self):
        """Update sensor value."""
        import pyhaversion
        if self._installation == 'venv' or self._installation == 'hassbian':
            source = 'pip'
        else:
            source = self._installation
        if self._branch == 'rc':
            branch = 'beta'
        else:
            branch = self._branch
        data = pyhaversion.get_version_number(source, branch, self._image)
        self._state = data['homeassistant']
        self._attributes = data

    @property
    def name(self):
        """Return the name of the sensor."""
        if self._name == 'none':
            name = 'HA version ' + self._installation + ' ' + self._branch
        else:
            name = self._name
        return name

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @property
    def icon(self):
        """Return the icon of the sensor."""
        return 'mdi:package-up'

    @property
    def device_state_attributes(self):
        """Return the attributes of the sensor."""
        return self._attributes
