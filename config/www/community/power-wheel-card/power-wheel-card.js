/**
 *
 * power-wheel-card by Gerben ten Hove
 * https://github.com/gurbyz/power-wheel-card
 *
 */

const __VERSION = "0.1.2";

const LitElement = Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class PowerWheelCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      autoToggleView: { type: Boolean },
      autoToggleViewTimerId: { type: Number },
      data: { type: Object },
      messages: { type: Array },
      sensors: { type: Array },
      view: { type: String },
      views: { type: Object },
    }
  }

  static get styles() {
    return [css`
      ha-card {
        padding: 16px;
      }
      ha-card .header {
        font-family: var(--paper-font-headline_-_font-family);
        -webkit-font-smoothing: var(--paper-font-headline_-_-webkit-font-smoothing);
        font-size: var(--paper-font-headline_-_font-size);
        font-weight: var(--paper-font-headline_-_font-weight);
        letter-spacing: var(--paper-font-headline_-_letter-spacing);
        line-height: var(--paper-font-headline_-_line-height);
        color: var(--primary-text-color);
        padding: 4px 0 12px;
        display: flex;
        justify-content: space-between;
        min-height: 12px;
      }
      ha-card .wheel {
        position: relative;
      }
      ha-card .row {
        display: flex;
        justify-content: center;
        padding: 8px;
        align-items: center;
        height: 60px;
      }
      ha-card .cell {
        text-align: center;
        width: 75px;
        transition: opacity 0.4s ease-in-out;
      }
      ha-card .cell.position {
        font-weight: bold;
      }
      ha-card .cell.arrow {
        color: var(--state-icon-unavailable-color, #bdbdbd);
      }
      ha-card .cell.sensor {
        cursor: pointer;
      }
      ha-card .cell.hidden {
        opacity: 0;
      }
      .value {
        min-height: 16px;
      }
      .unit-container {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 230px;
      }
      #unit {
        padding: 3px 10px;
        font-size: calc(1.5 * var(--paper-font-headline_-_font-size));
      }
      #unit.toggle {
        cursor: pointer;
      }
      ha-icon {
        --mdc-icon-size: 48px;
        transition: all 0.4s ease-in-out;
        color: var(--paper-item-icon-color, #44739e);
        width: 48px;
        height: 48px;
      }
      ha-icon.inactive {
        color: var(--state-icon-unavailable-color, #bdbdbd);
      }
      ha-icon#toggle-button {
        --mdc-icon-size: 24px;
        padding-top: 4px;
        width: 24px;
        height: 24px;
        float: right;
        cursor: pointer;
      }
      .message {
        display: block;
        color: white;
        padding: 8px;
        font-weight: 500;
        margin-bottom: 3px;
      }
      .message.error {
        background-color: #ef5350;
      }
      .message.warn {
        background-color: #fdd835;
      }
    `];
  }
  
  /* Card functions */

  static _generateClass(value) {
    return value > 0 ? 'producing' : ((value < 0) ? 'consuming' : 'inactive');
  }

  _generateValueStr(value, decimals) {
    return this.config.color_icons ? Math.abs(value).toFixed(decimals): value.toFixed(decimals);
  }

  _makePositionObject(val, entity, configIcon, defaultIcon, decimals, valSoC) {
    const valueStr = typeof val === 'undefined' ? 'unavailable' : this._generateValueStr(val, decimals);
    const valueStrSoC = typeof valSoC === 'undefined' ? 'unavailable' : `(${valSoC}%)`;
    const stateObj = this.hass.states[entity];
    const icon = configIcon ? configIcon : (stateObj && stateObj.attributes.icon ? stateObj.attributes.icon : defaultIcon);
    // Invert producing/consuming for grid icon when user wants to invert_grid_colors
    const classValue = PowerWheelCard._generateClass(val *
      (defaultIcon === 'mdi:transmission-tower' && this.config.invert_grid_colors ? -1 : 1));

    return {
      stateObj,
      valueStr,
      val,
      icon,
      classValue,
      hasSensor: !!stateObj && this.view !== 'money',
      valSoC,
      valueStrSoC,
    }
  }

  _makeArrowObject(val, entity, iconNormal, iconReversed, decimals) {
    const valueStr = typeof val === 'undefined' ? 'unavailable' : Math.abs(val).toFixed(decimals);
    const stateObj = entity ? this.hass.states[entity] : false;
    const classValue = typeof val === 'undefined' || val === 0 ? 'inactive' : 'active';
    const icon = typeof val === 'undefined' || val >= 0 ? iconNormal : iconReversed;

    return {
      stateObj,
      valueStr,
      val,
      icon,
      classValue,
      hasSensor: !!stateObj,
    }
  }

  // Get numeric state value or undefined
  _getEntityState(entity) {
    const stateObj = this.hass.states[entity];
    return stateObj ? parseFloat(stateObj.state) : undefined;
  }

  _setPolarity(value) {
    return typeof value === 'undefined'
      ? undefined : value * this.config.production_is_positive;
  }

  _setBatteryPolarity(value) {
    return typeof value === 'undefined'
      ? undefined : value * this.config.charging_is_positive;
  }

  // Get all entity states (view dependent) and save in this.input
  // Since battery functions this.input.grid_solo_production is not always the same as this.data.solar2grid anymore.
  _saveEntityStates(solar_entity, grid_production_entity, grid_consumption_entity, battery_entity, grid_entity, home_entity) {
    this.input.solar_production = this._getEntityState(solar_entity);
    this.input.battery_charging = this._setBatteryPolarity(this._getEntityState(battery_entity));
    this.input.home_production = this._setPolarity(this._getEntityState(home_entity));
    if (this.views[this.view].twoGridSensors) {
      this.input.grid_solo_production = this._getEntityState(grid_production_entity);
      this.input.grid_solo_consumption = this._getEntityState(grid_consumption_entity);
    } else {
      const grid_nett_production = this._setPolarity(this._getEntityState(grid_entity));
      this.input.grid_solo_production = grid_nett_production > 0 ? grid_nett_production : 0;
      this.input.grid_solo_consumption = grid_nett_production < 0 ? -grid_nett_production : 0;
    }
  }

  _calculateSolarValue() {
    return this.input.solar_production;
  }

  _calculateBatteryValue() {
    return this.input.battery_charging;
  }

  _calculateGridValue() {
    return this.input.grid_solo_production - this.input.grid_solo_consumption;
  }

  _calculateHomeValue() {
    return this.input.grid_solo_production - this.input.grid_solo_consumption
      + (this.input.battery_charging || 0) - this.input.solar_production;
  }

  _calculateGrid2BatteryValue() {
    if (this.data.battery.val > 0) {
      // Battery charged by grid, but maxed to what is consumed by the grid
      return Math.min(this.data.battery.val, this.input.grid_solo_consumption);
    } else {
      // Battery discharging to grid, but maxed to what is produced to the grid
      return -Math.min(-this.data.battery.val, this.input.grid_solo_production);
    }
  }

  _calculateGrid2HomeValue() {
    if (this.views[this.view].twoGridSensors || this.view === 'power') {
      return this.input.grid_solo_consumption - Math.max(0, this.data.grid2battery.val || 0);
    } else {
      return 0;
    }
  }

  _calculateSolar2HomeValue() {
    if (this.views[this.view].twoGridSensors || this.view === 'power') {
      if (this.view === 'power') {
        // Assumption: Solar is consumed by home first
        return Math.min((this.data.solar.val || 0), (-this.data.home.val || 0));
      } else {
        // todo: strange that this is needed, why?
        return Math.min((this.data.solar.val || 0), (-this.data.home.val || 0) - (this.data.grid2home.val || 0));
      }
    } else {
      return 0;
    }
  }

  _calculateSolar2BatteryValue() {
    // Assumption: What's left of solar (after home did consume) is used for charging the battery
    return Math.max(0, Math.min(this.data.solar.val - this.data.solar2home.val, (this.data.battery.val || 0)));
  }

  _calculateSolar2GridValue() {
    if (this.views[this.view].twoGridSensors || this.view === 'power') {
      // Assumption: What's left of solar (after home and battery did consume) is produced to the grid
      return this.data.solar.val - this.data.solar2battery.val - this.data.solar2home.val;
    } else {
      return 0;
    }
  }

  _calculateBattery2HomeValue() {
    return -this.data.home.val - this.data.grid2home.val - this.data.solar2home.val;
  }

  _performCalculations() {
    this.data.solar.val = this._calculateSolarValue();
    this.data.battery.val = this._calculateBatteryValue();
    this.data.grid.val = this._calculateGridValue();
    this.data.home.val = this._calculateHomeValue();
    this.data.grid2battery.val = this._calculateGrid2BatteryValue();
    this.data.grid2home.val = this._calculateGrid2HomeValue();
    this.data.solar2home.val = this._calculateSolar2HomeValue();
    this.data.solar2battery.val = this._calculateSolar2BatteryValue();
    this.data.solar2grid.val = this._calculateSolar2GridValue();
    this.data.battery2home.val = this._calculateBattery2HomeValue();
  }

  static _logConsole(message) {
    console.info(`%cpower-wheel-card%c\n${message}`, "color: green; font-weight: bold", "");
  }

  _getSensorUnit(entity) {
    if (entity) {
      const stateObj = this.hass.states[entity];
      const unit = stateObj && stateObj.attributes.unit_of_measurement
        ? stateObj.attributes.unit_of_measurement : undefined;
      if (stateObj && !unit) {
        this._addMessage('error', `Attribute "unit_of_measurement" for the entity "${entity}" not found in HA.`);
      }
      return unit;
    } else {
      return undefined;
    }
  }

  _defineUnit(view, solar_entity, grid_entity, grid_consumption_entity, grid_production_entity) {
    const solarUnit = this._getSensorUnit(solar_entity);
    let gridUnit;
    if (this.views[view].twoGridSensors) {
      const gridConsumptionUnit = this._getSensorUnit(grid_consumption_entity);
      const gridProductionUnit = this._getSensorUnit(grid_production_entity);
      gridUnit = gridConsumptionUnit === gridProductionUnit ? gridConsumptionUnit : undefined;
    } else if (this.views[view].oneGridSensor) {
      gridUnit = this._getSensorUnit(grid_entity);
    } else {
      gridUnit = undefined;
    }
    if (solarUnit === gridUnit) {
      return solarUnit;
    } else {
      this._addMessage('error', `Units not equal for all sensors for the ${view} view.`);
      return 'error';
    }
  }

  /* Lit functions */

  constructor() {
    super();
    this.data = {
      solar: {},
      solar2battery: {},
      battery: {},
      batterySoC: {},
      grid2battery: {},
      solar2grid: {},
      solar2home: {},
      battery2home: {},
      grid: {},
      grid2home: {},
      home: {},
    };
    this.input = {};
    this.messages = [];
    this.sensors = [];
    this.view = 'power';
    this.views = {
      power: {},
      energy: {},
      money: {},
    };
  }

  _lovelaceResource() {
    const scripts = document.getElementsByTagName("script");
    let src = '404';
    Object.keys(scripts).some((key) => {
      let pos = scripts[key].src.indexOf("power-wheel-card.js");
      if (pos !== -1) {
        src = scripts[key].src.substr(pos);
        return true;
      } else {
        return false;
      }
    });
    return src;
  }

  _addMessage(type, text, publishInConsole = true) {
    this.messages.push({ type: type, text: text });
    if (publishInConsole) {
      console[type](text);
    }
  }

  _validateSensors() {
    this.sensors.forEach(sensor => {
      if (!this.hass.states[sensor]) {
        this._addMessage('error', `Entity "${sensor}" not found in HA.`);
      }
    });
  }

  firstUpdated(changedProperties) {
    if (this.config.debug) {
      let line = `Version: ${__VERSION}\nLovelace resource: ${this._lovelaceResource()}\nHA version: ${this.hass.config.version}`;
      line += `\nAgent: ${navigator.userAgent}`;
      line += `\nReport issues here: https://github.com/gurbyz/power-wheel-card/issues`;
      line += `\nProcessed config: ${JSON.stringify(this.config, null, ' ')}\nRegistered sensors: ${JSON.stringify(this.sensors, null, ' ')}`;
      line += `\nViews object: ${JSON.stringify(this.views, null, ' ')}`;
      PowerWheelCard._logConsole(line);
      this._addMessage('warn', `[${__VERSION}] Debug mode is on.`, false);
    } else {
      PowerWheelCard._logConsole(`Version: ${__VERSION}`);
    }
    // this._validateSensors(); // todo: Have to find a better trigger than firstUpdated. Disabled in version 0.1.2 because new startup order in HA 0.111.0.
  }

  _sensorChangeDetected(oldValue) {
    return this.sensors.reduce((change, sensor) => {
      return change || this.hass.states[sensor].state !== oldValue.states[sensor].state;
    }, false);
  }

  shouldUpdate(changedProperties) {
    // Don't update when there is a new value for a hass property that's not a registered sensor.
    // Update in all other cases, e.g. when there is a change of config or old values are undefined.
    let update = true;
    Array.from(changedProperties.keys()).some((propName) => {
      const oldValue = changedProperties.get(propName);
      if (propName === "hass" && oldValue) {
        update = update && this._sensorChangeDetected(oldValue);
      }
      return !update;
    });
    return update;
  }

  render() {
    this.views.power.unit = this._defineUnit('power', this.config.solar_power_entity, this.config.grid_power_entity,
      this.config.grid_power_consumption_entity, this.config.grid_power_production_entity);
    this.views.energy.unit = this._defineUnit('energy', this.config.solar_energy_entity, this.config.grid_energy_entity,
      this.config.grid_energy_consumption_entity, this.config.grid_energy_production_entity);
    this.views.money.unit = this.config.money_unit;

    if (this.view === 'money' && this.views.money.capable) {
      // Calculate energy values first
      this._saveEntityStates(this.config.solar_energy_entity, this.config.grid_energy_production_entity, this.config.grid_energy_consumption_entity, false, this.config.grid_energy_entity, this.config.home_energy_entity);
      this._performCalculations();

      // Convert energy values into money values
      this.data.solar2grid.val *= this.config.energy_production_rate;
      this.data.grid2home.val *= this.config.energy_consumption_rate;
      this.data.solar2home.val *= this.config.energy_consumption_rate;
      this.data.solar.val = this.data.solar2grid.val + this.data.solar2home.val;
      this.data.grid.val = this.data.solar2grid.val - this.data.grid2home.val;
      this.data.home.val = - this.data.grid2home.val - this.data.solar2home.val;

      this.data.solar = this._makePositionObject(this.data.solar.val, this.config.solar_energy_entity, this.config.solar_icon,
        'mdi:weather-sunny', this.config.money_decimals);
      this.data.grid = this._makePositionObject(this.data.grid.val, this.config.grid_energy_entity, this.config.grid_icon,
        'mdi:transmission-tower', this.config.money_decimals);
      this.data.home = this._makePositionObject(this.data.home.val, this.config.home_energy_entity, this.config.home_icon,
        'mdi:home', this.config.money_decimals);
      this.data.solar2grid = this._makeArrowObject(this.data.solar2grid.val, false, 'mdi:arrow-bottom-left', 'mdi:arrow-top-right', this.config.money_decimals);
      this.data.solar2home = this._makeArrowObject(this.data.solar2home.val, false, 'mdi:arrow-bottom-right', 'mdi:arrow-top-left', this.config.money_decimals);
      this.data.grid2home = this._makeArrowObject(this.data.grid2home.val, false, 'mdi:arrow-right', 'mdi:arrow-left', this.config.money_decimals);
    } else if (this.view === 'energy' && this.views.energy.capable) {
      this._saveEntityStates(this.config.solar_energy_entity, this.config.grid_energy_production_entity, this.config.grid_energy_consumption_entity, false, this.config.grid_energy_entity, this.config.home_energy_entity);
      this._performCalculations();

      this.data.solar = this._makePositionObject(this.data.solar.val, this.config.solar_energy_entity, this.config.solar_icon,
          'mdi:weather-sunny', this.config.energy_decimals);
      this.data.grid = this._makePositionObject(this.data.grid.val, this.config.grid_energy_entity, this.config.grid_icon,
          'mdi:transmission-tower', this.config.energy_decimals);
      this.data.home = this._makePositionObject(this.data.home.val, this.config.home_energy_entity, this.config.home_icon,
          'mdi:home', this.config.energy_decimals);
      this.data.solar2grid = this._makeArrowObject(this.data.solar2grid.val, this.config.grid_energy_production_entity, 'mdi:arrow-bottom-left', 'mdi:arrow-top-right', this.config.energy_decimals);
      this.data.solar2home = this._makeArrowObject(this.data.solar2home.val, false, 'mdi:arrow-bottom-right', 'mdi:arrow-top-left', this.config.energy_decimals);
      this.data.grid2home = this._makeArrowObject(this.data.grid2home.val, this.config.grid_energy_consumption_entity, 'mdi:arrow-right', 'mdi:arrow-left', this.config.energy_decimals);
    } else {
      this._saveEntityStates(this.config.solar_power_entity, this.config.grid_power_production_entity, this.config.grid_power_consumption_entity, this.config.battery_power_entity, this.config.grid_power_entity, false);
      this._performCalculations();
      this.data.batterySoC.val = this._getEntityState(this.config.battery_soc_entity);

      this.data.solar = this._makePositionObject(this.data.solar.val, this.config.solar_power_entity, this.config.solar_icon,
          'mdi:weather-sunny', this.config.power_decimals);
      this.data.grid = this._makePositionObject(this.data.grid.val, this.config.grid_power_entity, this.config.grid_icon,
          'mdi:transmission-tower', this.config.power_decimals);
      this.data.home = this._makePositionObject(this.data.home.val, this.config.home_power_entity, this.config.home_icon,
          'mdi:home', this.config.power_decimals);
      this.data.battery = this._makePositionObject(this.data.battery.val, this.config.battery_soc_entity, this.config.battery_icon,
          'mdi:car-battery', this.config.power_decimals, this.data.batterySoC.val);
      this.data.solar2grid = this._makeArrowObject(this.data.solar2grid.val, this.config.grid_power_production_entity, 'mdi:arrow-bottom-left', 'mdi:arrow-top-right', this.config.power_decimals);
      this.data.solar2home = this._makeArrowObject(this.data.solar2home.val, false, 'mdi:arrow-bottom-right', 'mdi:arrow-top-left', this.config.power_decimals);
      this.data.grid2home = this._makeArrowObject(this.data.grid2home.val, this.config.grid_power_consumption_entity, 'mdi:arrow-right', 'mdi:arrow-left', this.config.power_decimals);
      this.data.solar2battery = this._makeArrowObject(this.data.solar2battery.val, this.config.battery_power_entity, 'mdi:arrow-right', 'mdi:arrow-left', this.config.power_decimals);
      this.data.battery2home = this._makeArrowObject(this.data.battery2home.val, this.config.battery_power_entity, 'mdi:arrow-down', 'mdi:arrow-up', this.config.power_decimals);
      this.data.grid2battery = this._makeArrowObject(this.data.grid2battery.val, this.config.battery_power_entity, 'mdi:arrow-up', 'mdi:arrow-down', this.config.power_decimals);
    }

    if (this.autoToggleView) {
      this.autoToggleViewTimerId = this.autoToggleViewTimerId || setInterval(() => {
        this._toggleViewHelper();
      }, this.config.auto_toggle_view_period * 1000);
    } else if (this.autoToggleViewTimerId) {
      this.autoToggleViewTimerId = clearInterval(this.autoToggleViewTimerId);
    }

    return html`
      <style>
        ha-icon.consuming {
          color: ${this.config.consuming_color};
        }
        ha-icon.producing {
          color: ${this.config.producing_color};
        }
        ha-icon.active {
          color: ${this.config.active_arrow_color};
        }
      </style>
      <ha-card>
        ${this.messages.length ? this.messages.map((message) => { return html`<div class="message ${message.type}">${message.text}</div>`}) : ''}
        ${this.views.energy.capable ? html`<ha-icon id="toggle-button" class="${this.autoToggleView ? `active` : `inactive`}" icon="mdi:recycle" @click="${() => this._toggleAutoToggleView()}" title="Turn ${this.autoToggleView ? `off` : `on`} auto-toggle"></ha-icon>` : ''}        
        <div id="title" class="header">
          ${this.views[this.view].title}
        </div>
        <div class="wheel">
          <div class="unit-container">
            ${this.views.energy.capable ? html`<div id="unit" class="toggle" @click="${() => this._toggleView()}" title="Toggle view">${this.views[this.view].unit}</div>` : html`<div id="unit">${this.views[this.view].unit}</div>`}
          </div>
          <div class="row">
            ${this._cell('battery', this.data.battery, 'position', undefined, undefined, this._batteryVisibilityClass('left'))}
            <div class="cell"></div>
            ${this._cell('solar', this.data.solar, 'position')}
            ${this._cell('solar2battery', this.data.solar2battery, 'arrow', this.data.solar.val, this.data.battery.val, this._batteryVisibilityClass('right'))}
            ${this._cell('battery', this.data.battery, 'position', undefined, undefined, this._batteryVisibilityClass('right'))}
          </div>
          <div class="row">
            ${this._cell('grid2battery', this.data.grid2battery, 'arrow', this.data.grid.val, this.data.battery.val, this._batteryVisibilityClass('left'))}
            ${this._cell('solar2grid', this.data.solar2grid, 'arrow', this.data.solar.val, this.data.grid.val)}
            <div class="cell"></div>
            ${this._cell('solar2home', this.data.solar2home, 'arrow', this.data.solar.val, this.data.home.val)}
            ${this._cell('battery2home', this.data.battery2home, 'arrow', this.data.home.val, this.data.battery.val, this._batteryVisibilityClass('right'))}
          </div>
          <div class="row">
            ${this._cell('grid', this.data.grid, 'position')}
            <div class="cell"></div>
            ${this._cell('grid2home', this.data.grid2home, 'arrow', this.data.grid.val, this.data.home.val)}
            <div class="cell"></div>
            ${this._cell('home', this.data.home, 'position')}
          </div>
        </div>
      </ha-card>
    `;
  }
  
  /* Template functions */

  _cell(id, cellObj, cellType, hideValue1, hideValue2, visibilityClass) {
    return html`
      <div id="cell-${id}"
            class="cell ${cellType} ${cellObj.hasSensor && !visibilityClass ? 'sensor' : ''} ${visibilityClass || ''}" 
            @click="${cellObj.hasSensor && !visibilityClass ? () => this._handleClick(cellObj.stateObj) : () => {}}"
            title="${cellObj.hasSensor ? `More info${cellObj.stateObj.attributes.friendly_name ? ':\n' + cellObj.stateObj.attributes.friendly_name : ''}` : ''}">
        <ha-icon id="icon-${id}" class="${cellObj.classValue}" icon="${cellObj.icon}"></ha-icon>
        <div id="value-${id}" class="value">
          ${cellType === 'arrow' && (cellObj.val === 0 || Math.abs(cellObj.val) === Math.abs(hideValue1) || Math.abs(cellObj.val) === Math.abs(hideValue2)) ? '' : cellObj.valueStr}
          ${cellObj.valSoC ? cellObj.valueStrSoC : ''}
        </div>
      </div>
    `;
  }

  _batteryVisibilityClass(side) {
    if (!this.views[this.view].batteryCapable) {
      return 'hidden';
    }
    if (side === 'left') {
      return this.data.grid2battery.val !== 0 ? '' : 'hidden';
    } else {
      return this.data.battery2home.val > 0 || this.data.solar2battery.val > 0 ? '' : 'hidden';
    }
  }

  _handleClick(stateObj) {
    const event = new Event('hass-more-info', {
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    event.detail = { entityId: stateObj.entity_id };
    this.shadowRoot.dispatchEvent(event);
  }

  _toggleAutoToggleView() {
    if (!this.autoToggleView) {
      this._toggleViewHelper();
    }
    this.autoToggleView = !this.autoToggleView;
  }

  _toggleView() {
    this.autoToggleView = false;
    this._toggleViewHelper();
  }

  _toggleViewHelper() {
    switch (this.view) {
      case 'power':
        this.view = 'energy';
        break;
      case 'energy':
        if (this.views.money.capable) {
          this.view = 'money';
        } else {
          this.view = 'power';
        }
        break;
      // case 'money':
      //   this.view = 'power';
      //   break;
      default:
        this.view = 'power';
    }
  }
  
  /* Config functions */

  _getSensors(config) {
    return [
      "solar_power_entity",
      "grid_power_consumption_entity",
      "grid_power_production_entity",
      "grid_power_entity",
      "battery_power_entity",
      "solar_energy_entity",
      "grid_energy_consumption_entity",
      "grid_energy_production_entity",
      "grid_energy_entity",
      "home_energy_entity",
      "battery_soc_entity",
    ].reduce((sensors, cardParameter) => {
      if (config.hasOwnProperty(cardParameter)) {
        sensors.push(config[cardParameter]);
      }
      return sensors;
    }, []);
  }

  setConfig(config) {
    config = { ...config };
    if (!config.solar_power_entity) {
      throw new Error('You need to define a solar_power_entity');
    }
    if (!config.grid_power_consumption_entity && !config.grid_power_production_entity
      && !config.grid_power_entity) {
      throw new Error('You need to define a grid_power_consumption_entity' +
        'and a grid_power_production_entity OR you can define a grid_power_entity');
    }
    if (config.grid_power_production_entity && !config.grid_power_consumption_entity) {
      throw new Error('You need to define a grid_power_consumption_entity');
    }
    if (config.grid_power_consumption_entity && !config.grid_power_production_entity) {
      throw new Error('You need to define a grid_power_production_entity');
    }
    config.charging_is_positive = config.charging_is_positive !== false;
    config.charging_is_positive = config.charging_is_positive ? 1 : -1;
    config.production_is_positive = config.production_is_positive !== false;
    config.production_is_positive = config.production_is_positive ? 1 : -1;
    config.title = config.title ? config.title : '';
    config.title_power = config.title_power ? config.title_power : config.title;
    config.title_energy = config.title_energy ? config.title_energy : config.title;
    config.title_money = config.title_money ? config.title_money : config.title;
    if (config.power_decimals && !Number.isInteger(config.power_decimals)) {
      throw new Error('Power_decimals should be an integer');
    }
    config.power_decimals = config.power_decimals === undefined ? 0 : config.power_decimals;
    if (config.energy_decimals && !Number.isInteger(config.energy_decimals)) {
      throw new Error('Energy_decimals should be an integer');
    }
    config.energy_decimals = config.energy_decimals === undefined ? 3 : config.energy_decimals;
    if (config.money_decimals && !Number.isInteger(config.money_decimals)) {
      throw new Error('Money_decimals should be an integer');
    }
    config.money_decimals = config.money_decimals === undefined ? 2 : config.money_decimals;
    config.money_unit = config.money_unit ? config.money_unit : '€';
    config.color_icons = config.color_icons !== false;
    config.consuming_color = config.color_icons
      ? (config.consuming_color ? config.consuming_color : 'var(--label-badge-yellow, #f4b400)')
      : 'var(--state-icon-unavailable-color, #bdbdbd)';
    config.producing_color = config.color_icons
      ? (config.producing_color ? config.producing_color : 'var(--label-badge-green, #0da035)')
      : 'var(--state-icon-unavailable-color, #bdbdbd)';
    config.invert_grid_colors = config.invert_grid_colors ? (config.invert_grid_colors == true) : false;
    config.active_arrow_color = config.active_arrow_color
      ? config.active_arrow_color
      : 'var(--paper-item-icon-active-color, #fdd835)';
    if (config.initial_view && !['power', 'energy', 'money'].includes(config.initial_view)) {
      throw new Error("Initial_view should 'power', 'energy' or 'money'");
    }
    config.initial_view = config.initial_view ? config.initial_view : 'power';
    config.initial_auto_toggle_view = config.initial_auto_toggle_view ? (config.initial_auto_toggle_view == true) : false;
    if (config.auto_toggle_view_period && !Number.isInteger(config.auto_toggle_view_period)) {
      throw new Error('Auto_toggle_view_period should be an integer');
    }
    config.auto_toggle_view_period = config.auto_toggle_view_period ? config.auto_toggle_view_period : 10;
    config.debug = config.debug ? config.debug : false;
    if (config.energy_production_rate === undefined && config.energy_consumption_rate) {
      config.energy_production_rate = config.energy_consumption_rate;
    }

    this.views.power = {
      title: config.title_power,
      oneGridSensor: !!config.grid_power_entity,
      twoGridSensors: !!config.grid_power_consumption_entity && !!config.grid_power_production_entity,
      batteryCapable: !!config.battery_power_entity,
    };
    this.views.power.capable = (this.views.power.oneGridSensor || this.views.power.twoGridSensors) && !!config.solar_power_entity;
    this.views.energy = {
      title: config.title_energy,
      oneGridSensor: !!config.grid_energy_entity && !!config.home_energy_entity,
      twoGridSensors: !!config.grid_energy_consumption_entity && !!config.grid_energy_production_entity,
    };
    this.views.energy.capable = (this.views.energy.oneGridSensor || this.views.energy.twoGridSensors) && !!config.solar_energy_entity;
    this.views.money = {
      title: config.title_money,
      oneGridSensor: this.views.energy.oneGridSensor,
      twoGridSensors: this.views.energy.twoGridSensors,
      capable: this.views.energy.capable && !!config.energy_consumption_rate,
    };
    this.autoToggleView = config.initial_auto_toggle_view;
    this.sensors = this._getSensors(config);
    this.view = config.initial_view;
    this.config = config;
  }

  /* HA functions */

  getCardSize() {
    return 5;
  }
}

customElements.define('power-wheel-card', PowerWheelCard);
