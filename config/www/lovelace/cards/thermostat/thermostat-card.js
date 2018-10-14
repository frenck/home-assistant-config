import ThermostatUI from './thermostat-card.lib.js?v=0.1.1'
class ThermostatCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  set hass(hass) {
    const config = this._config;
    const entity = hass.states[config.entity];
    let ambient_temperature = entity.attributes.current_temperature;
    if (config.ambient_temperature && hass.states[config.ambient_temperature])
      ambient_temperature = hass.states[config.ambient_temperature].state;
    let hvac_state;
    if (config.hvac.attribute)
      hvac_state = entity.attributes[config.hvac.attribute];
    else
      hvac_state = entity.state;
    const new_state = {
      min_value: entity.attributes.min_temp,
      max_value: entity.attributes.max_temp,
      ambient_temperature: ambient_temperature,
      target_temperature: entity.attributes.temperature,
      target_temperature_low: entity.attributes.target_temp_low,
      target_temperature_high: entity.attributes.target_temp_high,
      hvac_state: config.hvac.states[hvac_state] || 'off',
      away: (entity.attributes.away_mode == 'on' ? true : false),
    }
    if (!this._saved_state ||
      (this._saved_state.min_value != new_state.min_value ||
        this._saved_state.max_value != new_state.max_value ||
        this._saved_state.ambient_temperature != new_state.ambient_temperature ||
        this._saved_state.target_temperature != new_state.target_temperature ||
        this._saved_state.target_temperature_low != new_state.target_temperature_low ||
        this._saved_state.target_temperature_high != new_state.target_temperature_high ||
        this._saved_state.hvac_state != new_state.hvac_state ||
        this._saved_state.away != new_state.away)) {
      this._saved_state = new_state;
      this.thermostat.updateState(new_state);
    }
    this._hass = hass;
  }

  _controlSetPoints() {
    if (this.thermostat.dual) {
      if (this.thermostat.temperature.high != this._saved_state.target_temperature_high ||
        this.thermostat.temperature.low != this._saved_state.target_temperature_low)
        this._hass.callService('climate', 'set_temperature', {
          entity_id: this._config.entity,
          target_temp_high: this.thermostat.temperature.high,
          target_temp_low: this.thermostat.temperature.low,
        });
    } else {
      if (this.thermostat.temperature.target != this._saved_state.target_temperature)
        this._hass.callService('climate', 'set_temperature', {
          entity_id: this._config.entity,
          temperature: this.thermostat.temperature.target,
        });
    }
  }

  setConfig(config) {
    // Check config
    if (!config.entity && config.entity.split(".")[0] === 'climate') {
      throw new Error('Please define an entity');
    }

    // Cleanup DOM
    const root = this.shadowRoot;
    if (root.lastChild) root.removeChild(root.lastChild);

    // Prepare config defaults
    const cardConfig = Object.assign({}, config);
    cardConfig.hvac = Object.assign({}, config.hvac);
    if (!cardConfig.diameter) cardConfig.diameter = 400;
    if (!cardConfig.pending) cardConfig.pending = 3;
    if (!cardConfig.idle_zone) cardConfig.idle_zone = 2;
    if (!cardConfig.step) cardConfig.step = 0.5;
    if (!cardConfig.highlight_tap) cardConfig.highlight_tap = false;
    if (!cardConfig.no_card) cardConfig.no_card = false;
    if (!cardConfig.chevron_size) cardConfig.chevron_size = 50;
    if (!cardConfig.num_ticks) cardConfig.num_ticks = 150;
    if (!cardConfig.tick_degrees) cardConfig.tick_degrees = 300;
    if (!cardConfig.hvac.states) cardConfig.hvac.states = { 'off': 'off', 'heat': 'heat', 'cool': 'cool', };

    // Extra config values generated for simplicity of updates
    cardConfig.radius = cardConfig.diameter / 2;
    cardConfig.ticks_outer_radius = cardConfig.diameter / 30;
    cardConfig.ticks_inner_radius = cardConfig.diameter / 8;
    cardConfig.offset_degrees = 180 - (360 - cardConfig.tick_degrees) / 2;
    cardConfig.control = this._controlSetPoints.bind(this);
    this.thermostat = new ThermostatUI(cardConfig);

    if (cardConfig.no_card === true) {
      root.appendChild(this.thermostat.container);
    }
    else {
      const card = document.createElement('ha-card');
      card.style.padding = '5%';
      card.appendChild(this.thermostat.container);
      root.appendChild(card);
    }
    this._config = cardConfig;
  }
}
customElements.define('thermostat-card', ThermostatCard);