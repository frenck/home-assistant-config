const LitElement = Object.getPrototypeOf(
  customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;

const weatherIconsDay = {
  clear: "day",
  "clear-night": "night",
  cloudy: "cloudy",
  fog: "cloudy",
  hail: "rainy-7",
  lightning: "thunder",
  "lightning-rainy": "thunder",
  partlycloudy: "cloudy-day-3",
  pouring: "rainy-6",
  rainy: "rainy-5",
  snowy: "snowy-6",
  "snowy-rainy": "rainy-7",
  sunny: "day",
  windy: "cloudy",
  "windy-variant": "cloudy-day-3",
  exceptional: "!!"
};

const weatherIconsNight = {
  ...weatherIconsDay,
  clear: "night",
  sunny: "night",
  partlycloudy: "cloudy-night-3",
  "windy-variant": "cloudy-night-3"
};

const windDirections = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW",
  "N"
];

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

function hasConfigOrEntityChanged(element, changedProps) {
  if (changedProps.has("_config")) {
    return true;
  }

  const oldHass = changedProps.get("hass");
  if (oldHass) {
    return (
      oldHass.states[element._config.entity] !==
        element.hass.states[element._config.entity] ||
      oldHass.states["sun.sun"] !== element.hass.states["sun.sun"]
    );
  }

  return true;
}

class WeatherCard extends LitElement {
  static get properties() {
    return {
      _config: {},
      hass: {}
    };
  }

  static async getConfigElement() {
    await import("./weather-card-editor.js");
    return document.createElement("weather-card-editor");
  }

  static getStubConfig() {
    return {};
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("Please define a weather entity");
    }
    this._config = config;
  }

  shouldUpdate(changedProps) {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  render() {
    if (!this._config || !this.hass) {
      return html``;
    }

    const stateObj = this.hass.states[this._config.entity];

    if (!stateObj) {
      return html`
        <style>
          .not-found {
            flex: 1;
            background-color: yellow;
            padding: 8px;
          }
        </style>
        <ha-card>
          <div class="not-found">
            Entity not available: ${this._config.entity}
          </div>
        </ha-card>
      `;
    }

    const lang = this.hass.selectedLanguage || this.hass.language;

    const next_rising = new Date(
      this.hass.states["sun.sun"].attributes.next_rising
    );
    const next_setting = new Date(
      this.hass.states["sun.sun"].attributes.next_setting
    );

    return html`
      ${this.renderStyle()}
      <ha-card @click="${this._handleClick}">
        <span
          class="icon bigger"
          style="background: none, url(${
            this.getWeatherIcon(
              stateObj.state.toLowerCase(),
              this.hass.states["sun.sun"].state
            )
          }) no-repeat; background-size: contain;"
          >${stateObj.state}
        </span>
        ${
          this._config.name
            ? html`
                <span class="title"> ${this._config.name} </span>
              `
            : ""
        }
        <span class="temp"
          >${
            this.getUnit("temperature") == "°F"
              ? Math.round(stateObj.attributes.temperature)
              : stateObj.attributes.temperature
          }</span
        >
        <span class="tempc"> ${this.getUnit("temperature")}</span>
        <span>
          <ul class="variations">
            <li>
              <span class="ha-icon"
                ><ha-icon icon="mdi:water-percent"></ha-icon
              ></span>
              ${stateObj.attributes.humidity}<span class="unit"> % </span>
              <br />
              <span class="ha-icon"
                ><ha-icon icon="mdi:weather-windy"></ha-icon
              ></span>
              ${
                windDirections[
                  parseInt((stateObj.attributes.wind_bearing + 11.25) / 22.5)
                ]
              }
              ${stateObj.attributes.wind_speed}<span class="unit">
                ${this.getUnit("length")}/h
              </span>
              <br />
              <span class="ha-icon"
                ><ha-icon icon="mdi:weather-sunset-up"></ha-icon
              ></span>
              ${next_rising.toLocaleTimeString()}
            </li>
            <li>
              <span class="ha-icon"><ha-icon icon="mdi:gauge"></ha-icon></span
              >${stateObj.attributes.pressure}<span class="unit">
                ${this.getUnit("air_pressure")}
              </span>
              <br />
              <span class="ha-icon"
                ><ha-icon icon="mdi:weather-fog"></ha-icon
              ></span>
              ${stateObj.attributes.visibility}<span class="unit">
                ${this.getUnit("length")}
              </span>
              <br />
              <span class="ha-icon"
                ><ha-icon icon="mdi:weather-sunset-down"></ha-icon
              ></span>
              ${next_setting.toLocaleTimeString()}
            </li>
          </ul>
        </span>
        ${
          stateObj.attributes.forecast &&
          stateObj.attributes.forecast.length > 0
            ? html`
                <div class="forecast clear">
                  ${
                    stateObj.attributes.forecast.slice(0, 5).map(
                      daily => html`
                        <div class="day">
                          <span class="dayname"
                            >${
                              new Date(daily.datetime).toLocaleDateString(
                                lang,
                                {
                                  weekday: "short"
                                }
                              )
                            }</span
                          >
                          <br /><i
                            class="icon"
                            style="background: none, url(${
                              this.getWeatherIcon(daily.condition.toLowerCase())
                            }) no-repeat; background-size: contain;"
                          ></i>
                          <br /><span class="highTemp"
                            >${daily.temperature}${
                              this.getUnit("temperature")
                            }</span
                          >
                          ${
                            typeof daily.templow !== 'undefined'
                              ? html`
                                  <br /><span class="lowTemp"
                                    >${daily.templow}${
                                      this.getUnit("temperature")
                                    }</span
                                  >
                                `
                              : ""
                          }
                        </div>
                      `
                    )
                  }
                </div>
              `
            : ""
        }
      </ha-card>
    `;
  }

  getWeatherIcon(condition, sun) {
    return `${
      this._config.icons
        ? this._config.icons
        : "https://cdn.jsdelivr.net/gh/bramkragten/weather-card@master/dist/icons/"
    }${
      sun && sun == "below_horizon"
        ? weatherIconsNight[condition]
        : weatherIconsDay[condition]
    }.svg`;
  }

  getUnit(measure) {
    const lengthUnit = this.hass.config.unit_system.length;
    switch (measure) {
      case "air_pressure":
        return lengthUnit === "km" ? "hPa" : "inHg";
      case "length":
        return lengthUnit;
      case "precipitation":
        return lengthUnit === "km" ? "mm" : "in";
      default:
        return this.hass.config.unit_system[measure] || "";
    }
  }

  _handleClick() {
    fireEvent(this, "hass-more-info", { entityId: this._config.entity });
  }

  getCardSize() {
    return 3;
  }

  renderStyle() {
    return html`
      <style>
        ha-card {
          cursor: pointer;
          margin: auto;
          padding-top: 2.5em;
          padding-bottom: 1.3em;
          padding-left: 1em;
          padding-right: 1em;
          position: relative;
        }

        .clear {
          clear: both;
        }

        .ha-icon {
          height: 18px;
          margin-right: 5px;
          color: var(--paper-item-icon-color);
        }

        .title {
          position: absolute;
          left: 3em;
          top: 0.6em;
          font-weight: 300;
          font-size: 3em;
          color: var(--primary-text-color);
        }
        .temp {
          font-weight: 300;
          font-size: 4em;
          color: var(--primary-text-color);
          position: absolute;
          right: 1em;
          top: 0.3em;
        }

        .tempc {
          font-weight: 300;
          font-size: 1.5em;
          vertical-align: super;
          color: var(--primary-text-color);
          position: absolute;
          right: 1em;
          margin-top: -14px;
          margin-right: 7px;
        }

        .variations {
          display: flex;
          flex-flow: row wrap;
          justify-content: space-between;
          font-weight: 300;
          color: var(--primary-text-color);
          list-style: none;
          margin-top: 4.5em;
          padding: 0;
        }

        .variations li {
          flex-basis: auto;
        }

        .variations li:first-child {
          padding-left: 1em;
        }

        .variations li:last-child {
          padding-right: 1em;
        }

        .unit {
          font-size: 0.8em;
        }

        .forecast {
          width: 100%;
          margin: 0 auto;
          height: 9em;
        }

        .day {
          display: block;
          width: 20%;
          float: left;
          text-align: center;
          color: var(--primary-text-color);
          border-right: 0.1em solid #d9d9d9;
          line-height: 2;
          box-sizing: border-box;
        }

        .dayname {
          text-transform: uppercase;
        }

        .forecast .day:first-child {
          margin-left: 0;
        }

        .forecast .day:nth-last-child(1) {
          border-right: none;
          margin-right: 0;
        }

        .highTemp {
          font-weight: bold;
        }

        .lowTemp {
          color: var(--secondary-text-color);
        }

        .icon.bigger {
          width: 10em;
          height: 10em;
          margin-top: -4em;
          position: absolute;
          left: 0em;
        }

        .icon {
          width: 50px;
          height: 50px;
          margin-right: 5px;
          display: inline-block;
          vertical-align: middle;
          background-size: contain;
          background-position: center center;
          background-repeat: no-repeat;
          text-indent: -9999px;
        }

        .weather {
          font-weight: 300;
          font-size: 1.5em;
          color: var(--primary-text-color);
          text-align: left;
          position: absolute;
          top: -0.5em;
          left: 6em;
          word-wrap: break-word;
          width: 30%;
        }
      </style>
    `;
  }
}
customElements.define("weather-card", WeatherCard);
