import { LitElement, html } from 'https://unpkg.com/@polymer/lit-element@^0.6.1/lit-element.js?module';

import { Debouncer } from "https://unpkg.com/@polymer/polymer/lib/utils/debounce";

function renderStyles () {
  return html`
    <style is="custom-style">
      ha-card {
        --thermostat-font-size-xl: var(--paper-font-display3_-_font-size);
        --thermostat-font-size-l: var(--paper-font-display2_-_font-size);
        --thermostat-font-size-m: var(--paper-font-title_-_font-size);
        --thermostat-font-size-title: 24px;

        font-family: var(--paper-font-body1_-_font-family);
        -webkit-font-smoothing: var(--paper-font-body1_-_-webkit-font-smoothing);
        font-size: var(--paper-font-body1_-_font-size);
        font-weight: var(--paper-font-body1_-_font-weight);
        line-height: var(--paper-font-body1_-_line-height);

        padding-bottom: 16px;
      }

      ha-card.no-header {
        padding: 16px 0;
      }

      .body {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
      }
      .main {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
      }
      .sensors {
        font-size: 1.1em;
      }
      table:empty {
        display: none;
      }
      .mode-selector {
        --paper-dropdown-menu: {
          display: inline;
        };
        --paper-input-container: {
          padding: 0;
        }
      }
      header {
        display: flex;
        flex-direction: row;

        font-family: var(--paper-font-headline_-_font-family);
        -webkit-font-smoothing: var(--paper-font-headline_-_-webkit-font-smoothing);
        font-size: var(--paper-font-headline_-_font-size);
        font-weight: var(--paper-font-headline_-_font-weight);
        letter-spacing: var(--paper-font-headline_-_letter-spacing);
        line-height: var(--paper-font-headline_-_line-height);
        text-rendering: var(--paper-font-common-expensive-kerning_-_text-rendering);
        opacity: var(--dark-primary-opacity);
        padding: 24px 16px 16px;
      }
      .icon {
        margin-right: 8px;
        color: grey;
      }
      .title {
        font-size: var(--thermostat-font-size-title);
        line-height: var(--thermostat-font-size-title);
        font-weight: normal;
        margin: 0;
        align-self: left;
      }
      .current-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .current--value {
        margin: 0;
        font-size: var(--thermostat-font-size-xl);
        font-weight: 400;
        line-height: var(--thermostat-font-size-xl);
      }
      .current--unit {
        font-size: var(--thermostat-font-size-m);
      }
      .thermostat-trigger {
        padding: 0px;
      }
      .sensors th {
        text-align: right;
        font-weight: 300;
        padding-right: 8px;
        padding-bottom: 4px;
      }
      .sensors td {
        padding-bottom: 4px;
      }
      .sensors td.clickable {
        text-decoration: underline;
        cursor: pointer;
      }
    </style>
  `
}

function formatNumber (number) {
  const [int, dec] = String(number).split('.')
  return `${int}.${dec || '0'}`
}

const DEBOUNCE_TIMEOUT = 1000
const STEP_SIZE = .5
const UPDATE_PROPS = ['entity', 'sensors', '_temperature']
const modeIcons = {
  auto: "hass:autorenew",
  manual: "hass:cursor-pointer",
  heat: "hass:fire",
  cool: "hass:snowflake",
  off: "hass:power",
  fan_only: "hass:fan",
  eco: "hass:leaf",
  dry: "hass:water-percent",
  idle: "hass:power",
}

const STATE_ICONS = {
  off: 'mdi:radiator-off',
  on: 'mdi:radiator',
  idle: 'mdi:radiator-disabled',
  heat: 'mdi:radiator',
  cool: 'mdi:snowflake',
  auto: 'mdi:radiator',
  manual: 'mdi:radiator',
  boost: 'mdi:fire',
  away: 'mdi:radiator-disabled'
}

const DEFAULT_HIDE = {
  temperature: false,
  state: false,
  mode: false,
}

class SimpleThermostat extends LitElement {

  static get properties () {
    return {
      _hass: Object,
      config: Object,
      entity: Object,
      sensors: Array,
      icon: String,
      _temperature: {
        type: Number,
        notify: true,
      },
      _mode: String,
      _hide: Object,
      name: String,
    }
  }

  constructor () {
    super();

    this._hass = null
    this.entity = null
    this.icon = null
    this.sensors = []
    this._stepSize = STEP_SIZE
    this._temperature = null
    this._mode = null
    this._hide = DEFAULT_HIDE
  }

  set hass (hass) {
    this._hass = hass

    const entity = hass.states[this.config.entity]
    if (this.entity !== entity) {
      this.entity = entity;

      const {
        attributes: {
          operation_mode: mode,
          operation_list: modes = [],
          temperature: _temperature,
        }
      } = entity
      this._temperature = _temperature
      this._mode = mode
    }

    if (this.config.icon) {
      this.icon = this.config.icon;
    } else {
      this.icon = STATE_ICONS;
    }

    if (this.config.step_size) {
      this._stepSize = this.config.step_size
    }

    if (this.config.hide) {
      this._hide = { ...DEFAULT_HIDE, ...this.config.hide }
    }

    if (typeof this.config.name === 'string') {
      this.name = this.config.name
    } else if (this.config.name === false) {
      this.name = false
    } else {
      this.name = entity.attributes.friendly_name
    }

    if (this.config.sensors) {
      this.sensors = this.config.sensors.map(({ name: wantedName, entity }) => {
        const state = hass.states[entity]
        const name = [
          wantedName,
          state.attributes && state.attributes.friendly_name,
          entity
        ].find(n => !!n)
        return { name, entity, state }
      })
    }

  }

  shouldUpdate (changedProps) {
    return UPDATE_PROPS.some(prop => changedProps.has(prop))
  }

  localize (label, prefix) {
    const lang = this._hass.selectedLanguage || this._hass.language;
    return this._hass.resources[lang][`${prefix}${label}`] || label
  }

  render ({ _hass, _hide, config, entity, sensors } = this) {
    if (!entity) return
    const {
      state,
      attributes: {
        min_temp: minTemp = null,
        max_temp: maxTemp = null,
        current_temperature: current,
        operation_list: operations = [],
        operation_mode: operation,
      },
    } = entity
    const unit = this._hass.config.unit_system.temperature

    const sensorHtml = [
      _hide.temperature ? null : this.renderInfoItem(
        `${formatNumber(current)}${unit}`, 'Temperature'
      ),
      _hide.state ? null : this.renderInfoItem(this.localize(state, 'state.climate.'), 'State'),
      _hide.mode ? null : this.renderModeSelector(operations, operation),
      sensors.map(({ name, state }) => {
        return this.renderInfoItem(state, name)
      }) || null,
    ].filter(it => it !== null)

    const increaseTemperature = this.handleTemperatureChange.bind(this, +this._stepSize)
    const decreaseTemperature = this.handleTemperatureChange.bind(this, -this._stepSize)
    return html`
      ${renderStyles()}
      <ha-card class="${this.name ? '' : 'no-header' }">
        ${ this.renderHeader() }
        <section class="body">
          <table class="sensors">${sensorHtml}</table>

          <div class="main">
            <div class="current-wrapper">
              <paper-icon-button
                class="thermostat-trigger"
                icon="hass:chevron-up"
                @click='${increaseTemperature}'
              >
              </paper-icon-button>

              <div class="current" @click='${() => this.openEntityPopover(config.entity)}'>
                <h3 class="current--value">${formatNumber(this._temperature)}</h3>
              </div>
              <paper-icon-button
                class="thermostat-trigger"
                icon="hass:chevron-down"
                @click='${decreaseTemperature}'
              >
              </paper-icon-button>
            </div>
            <span class="current--unit">${unit}</span>
          </div>
        </section>
      </ha-card>
    `
  }

  renderHeader () {
    if (this.name === false) return ''

    let icon = this.icon
    const { state } = this.entity
    if (typeof this.icon === 'object') {
      icon = state in this.icon ? this.icon[state] : false
    }

    return html`
      <header>
        ${ icon && html`
          <ha-icon class="icon" .icon=${icon}></ha-icon>
        ` || '' }
        <h2 class="title">
        ${this.name}
        </h2>
      </header>
    `
  }

  renderModeSelector (modes, mode) {
    const selected = modes.indexOf(mode)
    return html`
      <tr>
        <th>Mode:</th>
        <td style="max-width: 4em;">
          <paper-dropdown-menu
            class="mode-selector"
            no-label-float
            noink
            no-animations
            vertical-offset="26"
            @selected-item-changed="${this.setMode}"
          >
            <paper-listbox
              items="${modes}"
              slot="dropdown-content"
              class="dropdown-content"
              selected="${selected}"
            >
              ${ modes.map(m =>
                html`<paper-item mode-value="${m}">
                    <ha-icon .icon=${modeIcons[m]}></ha-icon>
                  ${this.localize(m, 'state.climate.')}
                  </paper-item>`
              ) }
            </paper-listbox>
          </paper-dropdown-menu>
        </td>
      </tr>
    `
  }

  renderInfoItem (state, heading) {
    if (!state) return

    let valueCell
    if (typeof state === 'string') {
      valueCell = html`<td>${state}</td>`
    }
    else {
      valueCell = html`<td
        class="clickable"
        @click='${() => this.openEntityPopover(state.entity_id)}'
      >
        ${state.state} ${state.attributes.unit_of_measurement}
      </td>`
    }
    return html`
      <tr>
        <th>${heading}:</th>
        ${valueCell}
      </tr>
    `
  }

  handleTemperatureChange (change, e) {
    e.stopPropagation();
    this.setTemperature(this._temperature + change)
  }

  setTemperature (temperature) {
    this._debouncedSetTemperature = Debouncer.debounce(
			this._debouncedSetTemperature,
      {
        run: (fn) => {
          this._temperature = temperature
          return window.setTimeout(fn, DEBOUNCE_TIMEOUT)
        },
        cancel: handle => window.clearTimeout(handle),
      },
      () => {
        this._hass.callService("climate", "set_temperature", {
          entity_id: this.config.entity,
          temperature: this._temperature,
        })
      }
    )
  }

  setMode (e) {
    const { detail: { value: node } } = e
    if (!node) return
    const value = node.getAttribute('mode-value')
    if (value && value !== this._mode) {
      this._hass.callService("climate", "set_operation_mode", {
        entity_id: this.config.entity,
        operation_mode: value,
      });
    }
  }

  openEntityPopover (entityId) {
    this.fire('hass-more-info', { entityId });
  }

  fire (type, detail, options) {
    options = options || {};
    detail = (detail === null || detail === undefined) ? {} : detail;
    const e = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
      composed: options.composed === undefined ? true : options.composed
    });
    e.detail = detail;
    this.dispatchEvent(e);
    return e;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.config = config;
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize() {
    return 3;
  }
}

customElements.define('simple-thermostat', SimpleThermostat);
