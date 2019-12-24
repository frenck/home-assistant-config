class XiaomiVacuumCard extends Polymer.Element {

    static get template() {
        return Polymer.html`
          <style>
            .background {
              background-repeat: no-repeat;
              background-position: center center;
              background-size: cover;
            }
            .title {
              font-size: 20px;
              padding: 16px 16px 0;
              text-align: center;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
            }
            .content {
              cursor: pointer;
            }
            .flex {
              display: flex;
              align-items: center;
              justify-content: space-evenly;
            }
            .button {
              cursor: pointer;
              padding: 16px;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, auto);
            }
            .grid-content {
              display: grid;
              align-content: space-between;
              grid-row-gap: 6px;
            }
            .grid-left {
              text-align: left;
              font-size: 110%;
              padding-left: 10px;
              border-left: 2px solid var(--primary-color);
            }
            .grid-right {
              text-align: right;
              padding-right: 10px;
              border-right: 2px solid var(--primary-color);
            }
          </style>
          <ha-card hass="[[_hass]]" config="[[_config]]" class="background" style="[[backgroundImage]]">
            <template is="dom-if" if="{{name}}">
              <div class="title" style="[[contentText]]" on-click="moreInfo">[[name]]</div>
            </template>
            <template is="dom-if" if="{{showLabels}}">
              <div class="content grid" style="[[contentStyle]]" on-click="moreInfo">
                <div class="grid-content grid-left">
                  <div>[[getValue('status')]]</div>
                  <div>[[getValue('battery', ' %')]]</div>
                  <div>[[getValue('mode')]]</div>
                </div>
                <template is="dom-if" if="{{showDetails}}">
                  <div class="grid-content grid-right" >
                    <div>[[computeValue('main_brush')]]</div>
                    <div>[[computeValue('side_brush')]]</div>
                    <div>[[computeValue('filter')]]</div>
                    <div>[[computeValue('sensor')]]</div>
                  </div>
                </template>
              </div>
            </template>
            <template is="dom-if" if="{{showButtons}}">
              <div class="flex" style="[[contentText]]">
                <template is="dom-if" if="{{_config.buttons.start}}">
                  <div class="button" on-tap="startVaccum">
                    <ha-icon icon="mdi:play"></ha-icon>
                  </div>
                </template>
                <template is="dom-if" if="{{_config.buttons.pause}}">
                  <div class="button" on-tap="pauseVacuum">
                    <ha-icon icon="mdi:pause"></ha-icon>
                  </div>
                </template>
                <template is="dom-if" if="{{_config.buttons.stop}}">
                  <div class="button" on-tap="stopVacuum">
                    <ha-icon icon="mdi:stop"></ha-icon>
                  </div>
                </template>
                <template is="dom-if" if="{{_config.buttons.spot}}">
                  <div class="button" on-tap="cleanSpot">
                    <ha-icon icon="mdi:broom"></ha-icon>
                  </div>
                </template>
                <template is="dom-if" if="{{_config.buttons.locate}}">
                  <div class="button" on-tap="locateVacuum">
                    <ha-icon icon="mdi:map-marker"></ha-icon>
                  </div>
                </template>
                <template is="dom-if" if="{{_config.buttons.return}}">
                  <div class="button" on-tap="returnVacuum">
                    <ha-icon icon="mdi:home-map-marker"></ha-icon>
                  </div>
                </template>
              </div>
            </template>
          </ha-card>
        `;
    }

    moreInfo() { this.fireEvent('hass-more-info'); }
    startVaccum() { this.callService(this._config.service.start); }
    pauseVacuum() { this.callService(this._config.service.pause); }
    stopVacuum() { this.callService(this._config.service.stop); }
    locateVacuum() { this.callService(this._config.service.locate); }
    returnVacuum() { this.callService(this._config.service.return); }
    cleanSpot() { this.callService(this._config.service.spot); }

    callService(service) {
        this._hass.callService('vacuum', service, {entity_id: this._config.entity});
    }

    fireEvent(type, options = {}) {
        const event = new Event(type, {
            bubbles: options.bubbles || true,
            cancelable: options.cancelable || true,
            composed: options.composed || true,
        });
        event.detail = {entityId: this._config.entity};
        this.shadowRoot.dispatchEvent(event);
        return event;
    }

    getCardSize() {
        if (this.name && this.showButtons) return 5;
        if (this.name || this.showButtons) return 4;
        return 3;
    }

    setConfig(config) {
        const labels = {
            status: 'Status',
            battery: 'Battery',
            mode: 'Mode',
            main_brush: 'Main Brush',
            side_brush: 'Side Brush',
            filter: 'Filter',
            sensor: 'Sensor',
            hours: 'h',
        };

        const services = {
            start: 'start',
            pause: 'pause',
            stop: 'stop',
            locate: 'locate',
            return: 'return_to_base',
            spot: 'clean_spot',
        };

        const buttons = {
            start: true,
            pause: true,
            stop: true,
            spot: false,
            locate: true,
            return: true,
        };

        const attributes = {
            status: 'status',
            battery: 'battery_level',
            mode: 'fan_speed',
            main_brush: 'main_brush_left',
            side_brush: 'side_brush_left',
            filter: 'filter_left',
            sensor: 'sensor_dirty_left',
        };

        const vendors = {
            xiaomi: {
                image: '/local/img/vacuum.png',
                details: true,
            },
            valetudo: {
                image: '/local/img/vacuum.png',
                details: true,
                attributes: {
                    status: 'state',
                    main_brush: 'mainBrush',
                    side_brush: 'sideBrush',
                    filter: 'filter',
                    sensor: 'sensor',
                },
            },
            robovac: {
                image: '/local/img/vacuum.png',
                details: false,
                buttons: {
                    stop: false,
                    spot: true,
                },
            },
            ecovacs: {
                image: '/local/img/vacuum_ecovacs.png',
                details: false,
                buttons: {
                    stop: false,
                    spot: true,
                },
                service: {
                    start: 'turn_on',
                    pause: 'stop',
                    stop: 'turn_off',
                },
            },
            deebot: {
                image: '/local/img/vacuum_ecovacs.png',
                details: true,
                service: {
                    start: 'turn_on',
                    pause: 'stop',
                    stop: 'turn_off',
                },
                attributes: {
                    main_brush: 'component_main_brush',
                    side_brush: 'component_side_brush',
                    filter: 'component_filter',
                },
                computeValue: v => Math.round(Number(v) / 100),
            }
        };

        if (!config.entity) throw new Error('Please define an entity.');
        if (config.entity.split('.')[0] !== 'vacuum') throw new Error('Please define a vacuum entity.');
        if (config.vendor && !config.vendor in vendors) throw new Error('Please define a valid vendor.');

        const vendor = vendors[config.vendor] || vendors.xiaomi;

        this.showDetails = vendor.details;
        this.showButtons = config.buttons !== false;
        this.showLabels = config.labels !== false;

        config.service = Object.assign({}, services, vendor.service);
        config.buttons = Object.assign({}, buttons, vendor.buttons, config.buttons);
        config.attributes = Object.assign({}, attributes, vendor.attributes, config.attributes);
        config.labels = Object.assign({}, labels, config.labels);

        this.getValue = (field, unit = '') => {
            const value = (this.stateObj && config.attributes[field] in this.stateObj.attributes)
                ? this.stateObj.attributes[config.attributes[field]] + unit
                : (this._hass ? this._hass.localize('state.default.unavailable') : 'Unavailable');
            return `${config.labels[field]}: ${value}`;
        };

        this.computeValue = field => {
            if (this.stateObj && config.attributes[field] in this.stateObj.attributes) {
                const value = this.stateObj.attributes[config.attributes[field]];
                return `${config.labels[field]}: ${vendor.computeValue ? vendor.computeValue(value) : value} ${config.labels.hours}`;
            } else {
                return `${config.labels[field]}: - `;
            }
        };

        this.contentText = `color: ${config.image !== false ? 'white; text-shadow: 0 0 10px black;' : 'var(--primary-text-color)'}`;
        this.contentStyle = `padding: ${this.showButtons ? '16px 16px 4px' : '16px'}; ${this.contentText}`;
        this.backgroundImage = config.image !== false ? `background-image: url('${config.image || vendor.image}')` : '';

        this._config = config;
    }

    set hass(hass) {
        this._hass = hass;

        if (hass && this._config) {
            this.stateObj = this._config.entity in hass.states ? hass.states[this._config.entity] : null;

            if (this.stateObj) {
                this.name = this._config.name !== false && (this._config.name || this.stateObj.attributes.friendly_name);
            }
        }
    }
}

customElements.define('xiaomi-vacuum-card', XiaomiVacuumCard);
