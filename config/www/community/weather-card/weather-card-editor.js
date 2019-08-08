if (!customElements.get("paper-input")) {
  console.log("imported", "paper-input");
  import("https://unpkg.com/@polymer/paper-input/paper-input.js?module");
}
if (!customElements.get("paper-toggle-button")) {
  console.log("imported", "paper-toggle-button");
  import(
    "https://unpkg.com/@polymer/paper-toggle-button/paper-toggle-button.js?module"
  );
}
if (!customElements.get("paper-dropdown-menu")) {
  console.log("imported", "paper-dropdown-menu");
  import(
    "https://unpkg.com/@polymer/paper-dropdown-menu/paper-dropdown-menu.js?module"
  );
}
if (!customElements.get("paper-listbox")) {
  console.log("imported", "paper-listbox");
  import("https://unpkg.com/@polymer/paper-listbox/paper-listbox.js?module");
}
if (!customElements.get("paper-item")) {
  console.log("imported", "paper-item");
  import("https://unpkg.com/@polymer/paper-item/paper-item.js?module");
}

const fireEvent = (node, type, detail, options) => {
  options = options || {};
  detail = detail === null || detail === undefined ? {} : detail;
  const event = new Event(type, {
    bubbles: options.bubbles === undefined ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === undefined ? true : options.composed
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};

const LitElement = Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;

export class WeatherCardEditor extends LitElement {
  setConfig(config) {
    this._config = config;
  }

  static get properties() {
    return { hass: {}, _config: {} };
  }

  get _entity() {
    return this._config.entity || "";
  }

  get _name() {
    return this._config.name || "";
  }

  get _icons() {
    return this._config.icons || "";
  }

  get _current() {
    return this._config.current !== false;
  }

  get _details() {
    return this._config.details !== false;
  }

  get _forecast() {
    return this._config.forecast !== false;
  }

  render() {
    if (!this.hass) {
      return html``;
    }

    const entities = Object.keys(this.hass.states).filter(
      eid => eid.substr(0, eid.indexOf(".")) === "weather"
    );

    return html`
      ${this.renderStyle()}
      <div class="card-config">
        <div>
          <paper-input
            label="Name"
            .value="${this._name}"
            .configValue="${"name"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>
          <paper-input
            label="Icons location"
            .value="${this._icons}"
            .configValue="${"icons"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>
          ${customElements.get("ha-entity-picker")
            ? html`
                <ha-entity-picker
                  .hass="${this.hass}"
                  .value="${this._entity}"
                  .configValue=${"entity"}
                  domain-filter="weather"
                  @change="${this._valueChanged}"
                  allow-custom-entity
                ></ha-entity-picker>
              `
            : html`
                <paper-dropdown-menu
                  label="Entity"
                  @value-changed="${this._valueChanged}"
                  .configValue="${"entity"}"
                >
                  <paper-listbox
                    slot="dropdown-content"
                    .selected="${entities.indexOf(this._entity)}"
                  >
                    ${entities.map(entity => {
                      return html`
                        <paper-item>${entity}</paper-item>
                      `;
                    })}
                  </paper-listbox>
                </paper-dropdown-menu>
              `}
          <paper-toggle-button
            .checked=${this._current}
            .configValue="${"current"}"
            @change="${this._valueChanged}"
            >Show current</paper-toggle-button
          >
          <paper-toggle-button
            .checked=${this._details}
            .configValue="${"details"}"
            @change="${this._valueChanged}"
            >Show details</paper-toggle-button
          >
          <paper-toggle-button
            .checked=${this._forecast}
            .configValue="${"forecast"}"
            @change="${this._valueChanged}"
            >Show forecast</paper-toggle-button
          >
        </div>
      </div>
    `;
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === "") {
        delete this._config[target.configValue];
      } else {
        this._config = {
          ...this._config,
          [target.configValue]:
            target.checked !== undefined ? target.checked : target.value
        };
      }
    }
    fireEvent(this, "config-changed", { config: this._config });
  }

  renderStyle() {
    return html`
      <style>
        paper-toggle-button {
          padding-top: 16px;
        }
        .side-by-side {
          display: flex;
        }
        .side-by-side > * {
          flex: 1;
          padding-right: 4px;
        }
      </style>
    `;
  }
}

customElements.define("weather-card-editor", WeatherCardEditor);
