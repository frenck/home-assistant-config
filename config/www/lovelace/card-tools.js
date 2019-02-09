customElements.define('card-tools',
class {
  static CUSTOM_TYPE_PREFIX() { return "custom:"}
  static version() { return "0.3"}

  static v() {return version};

  static checkVersion(v) {
    if (this.version() < v) {
      throw new Error(`Old version of card-tools found. Get the latest version of card-tools.js from https://github.com/thomasloven/lovelace-card-tools`);
    }
  }

  static litElement() {
    return Object.getPrototypeOf(customElements.get('hui-error-entity-row'));
  }

  static litHtml() {
    return this.litElement().prototype.html;
  }

  static hass() {
    return document.querySelector('home-assistant').hass;
  }

  static fireEvent(ev, detail, entity=null) {
    ev = new Event(ev, {
      bubbles: true,
      cancelable: false,
      composed: true,
    });
    ev.detail = detail || {};
    if(entity) {
      entity.dispatchEvent(ev);
    } else {
    document
      .querySelector("home-assistant")
      .shadowRoot.querySelector("home-assistant-main")
      .shadowRoot.querySelector("app-drawer-layout partial-panel-resolver")
      .shadowRoot.querySelector("ha-panel-lovelace")
      .shadowRoot.querySelector("hui-root")
      .shadowRoot.querySelector("ha-app-layout #view")
      .firstElementChild
      .dispatchEvent(ev);
    }
  }

  static createThing(thing, config) {
    const _createThing = (tag, config) => {
      const element = document.createElement(tag);
      try {
        element.setConfig(config);
      } catch (err) {
        console.error(tag, err);
        return _createError(err.message, config);
      }
      return element;
    };

    const _createError = (error, config) => {
      return _createThing("hui-error-card", {
        type: "error",
        error,
        config,
      });
    };

    if(!config || typeof config !== "object" || !config.type)
      return _createError(`No ${thing} type configured`, config);
    let tag = config.type;
    if(config.error) {
      const err = config.error;
      delete config.error;
      return _createError(err, config);
    }
    if(tag.startsWith(this.CUSTOM_TYPE_PREFIX()))
      tag = tag.substr(this.CUSTOM_TYPE_PREFIX().length);
    else
      tag = `hui-${tag}-${thing}`;

    if(customElements.get(tag))
      return _createThing(tag, config);

    // If element doesn't exist (yet) create an error
    const element = _createError(
      `Custom element doesn't exist: ${tag}.`,
      config
    );
    element.style.display = "None";
    const time = setTimeout(() => {
      element.style.display = "";
    }, 2000);
    // Remove error if element is defined later
    customElements.whenDefined(tag).then(() => {
      clearTimeout(timer);
      this.fireEvent("ll-rebuild", {}, element);
    });

    return element;
  }

  static createCard(config) {
    return this.createThing("card", config);
  }

  static createElement(config) {
    return this.createThing("element", config);
  }

  static createEntityRow(config) {
    const SPECIAL_TYPES = new Set([
      "call-service",
      "divider",
      "section",
      "weblink",
    ]);
    const DEFAULT_ROWS = {
      alert: "toggle",
      automation: "toggle",
      climate: "climate",
      cover: "cover",
      fan: "toggle",
      group: "group",
      input_boolean: "toggle",
      input_number: "input-number",
      input_select: "input-select",
      input_text: "input-text",
      light: "toggle",
      media_player: "media-player",
      lock: "lock",
      scene: "scene",
      script: "script",
      sensor: "sensor",
      timer: "timer",
      switch: "toggle",
      vacuum: "toggle",
      water_heater: "climate",
    };

    if(!config || typeof config !== "object" || (!config.entity && !config.type)) {
      Object.assign(config, {error: "Invalid config given"});
      return this.createThing("", config);
    }

    const type = config.type || "default";
    if(SPECIAL_TYPES.has(type) || type.startsWith(this.CUSTOM_TYPE_PREFIX()))
      return this.createThing("row", config);

    const domain = config.entity.split(".", 1)[0];
    Object.assign(config, {type: DEFAULT_ROWS[domain] || "text"});
    return this.createThing("entity-row", config);
  }

  static deviceID() {
    const ID_STORAGE_KEY = 'lovelace-player-device-id';
    if(window['fully'] && typeof fully.getDeviceId === "function")
      return fully.getDeviceId();
    if(!localStorage[ID_STORAGE_KEY])
    {
      const s4 = () => {
        return Math.floor((1+Math.random())*100000).toString(16).substring(1);
      }
      localStorage[ID_STORAGE_KEY] = `${s4()}${s4()}-${s4()}${s4()}`;
    }
    return localStorage[ID_STORAGE_KEY];
  }

  static moreInfo(entity) {
    this.fireEvent("hass-more-info", {entityId: entity});
  }

  static longpress(element) {
    customElements.whenDefined("long-press").then(() => {
      const longpress = document.body.querySelector("long-press");
      longpress.bind(element);
    });
    return element;
  }

  static hasTemplate(text) {
    return /\[\[\s+.*\s+\]\]/.test(text);
  }

  static parseTemplate(text, error) {
    if(typeof(text) !== "string") return text;
    const _parse = (str) => {
      try {
        str = str.replace(/^\[\[\s+|\s+\]\]$/g, '')
        const parts = str.split(".");
        let v = this.hass().states[`${parts[0]}.${parts[1]}`];
        parts.shift();
        parts.shift();
        parts.forEach(item => v = v[item]);
        return v;
      } catch (err) {
        return error || `[[ Template matching failed ${str} ]]`;
      }
    }
    text = text.replace(/(\[\[\s.*?\s\]\])/g, (str, p1, offset, s) => _parse(str));
    return text;
  }

  static args() {
    var url = document.currentScript.src
    url = url.substr(url.indexOf("?")+1)
    let args = {};
    url.split("&").forEach((a) => {
      if(a.indexOf("=")) {
        var parts = a.split("=");
        args[parts[0]] = parts[1]
      } else {
        args[a] = true;
      }
    });
    return args;
  }

  static localize(key, def="") {
    const language = this.hass().language;
    if(this.hass().resources[language] && this.hass().resources[language][key])
      return this.hass().resources[language][key];
    return def;
  }

});

// Global definition of cardTools
var cardTools = customElements.get('card-tools');

console.info(`%cCARD-TOOLS IS INSTALLED
%cDeviceID: ${customElements.get('card-tools').deviceID()}`,
"color: green; font-weight: bold",
"");
