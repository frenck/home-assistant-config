import "./compact-custom-header-editor.js?v=1.0.1b1";

export const LitElement = Object.getPrototypeOf(
  customElements.get("ha-panel-lovelace")
);

export const html = LitElement.prototype.html;

export const fireEvent = (node, type, detail, options) => {
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

export const defaultConfig = {
  header: true,
  menu: "show",
  notifications: "show",
  voice: "show",
  options: "show",
  clock_format: 12,
  clock_am_pm: true,
  clock_date: false,
  disable: false,
  background_image: false,
  main_config: false,
  hide_tabs: [],
  show_tabs: []
};

if (!customElements.get("compact-custom-header")) {
  class CompactCustomHeader extends LitElement {
    static get properties() {
      return {
        config: {},
        hass: {},
        editMode: {},
        showUa: {}
      };
    }

    constructor() {
      super();
      this.firstRun = true;
      this.editMode = false;
    }

    static async getConfigElement() {
      return document.createElement("compact-custom-header-editor");
    }

    static getStubConfig() {
      return {};
    }

    setConfig(config) {
      this.config = config;
    }

    updated() {
      if (this.config && this.hass && this.firstRun) {
        this.buildConfig();
      }
    }

    render() {
      if (!this.editMode) {
        return html``;
      }
      return html`
        ${this.renderStyle()}
        <ha-card>
          <svg viewBox="0 0 24 24">
            <path
              d="M12,7L17,12H14V16H10V12H7L12,7M19,
                      21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,
                      3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,
                      21M19,19V5H5V19H19Z"
            ></path>
          </svg>
          <h2>Compact Custom Header</h2>
        </ha-card>
      `;
    }

    renderStyle() {
      return html`
        <style>
          [hidden] {
            display: none;
          }
          h2 {
            margin: auto;
            padding: 20px;
            background-color: var(--primary-color);
            color: var(--text-primary-color);
          }
          svg {
            float: left;
            height: 30px;
            padding: 15px 5px 15px 15px;
            fill: var(--text-primary-color);
          }
          .user_agent {
            display: block;
            margin-left: auto;
            margin-right: auto;
            padding: 5px;
            border: 0;
            resize: none;
            width: 100%;
          }
        </style>
      `;
    }

    buildConfig() {
      if (window.location.href.includes("clear_cch_cache")) {
        localStorage.removeItem("cchCache");
        window.location.replace(
          window.location.href.replace("?clear_cch_cache","")
        );
      }

      if (this.firstRun) {
        this.firstRun = false;
        this.userVars = {
          user: this.hass.user.name,
          user_agent: navigator.userAgent
        };
      }

      if (this.config.main_config) {
        let cache = Object.assign({}, this.config);
        delete cache.main_config;
        localStorage.setItem("cchCache", JSON.stringify(cache));
      } else if (localStorage.getItem("cchCache")) {
        this.config = JSON.parse(localStorage.getItem("cchCache"));
      }

      let exceptionConfig = {};
      let highestMatch = 0;
      if (this.config.exceptions) {
        this.config.exceptions.forEach(exception => {
          const matches = this.countMatches(exception.conditions);
          if (matches > highestMatch) {
            highestMatch = matches;
            exceptionConfig = exception.config;
          }
        });
      }

      this.cchConfig = {
        ...defaultConfig,
        ...this.config,
        ...exceptionConfig
      };

      this.run();
    }

    countMatches(conditions) {
      let count = 0;
      for (const condition in conditions) {
        if (
          this.userVars[condition] == conditions[condition] ||
          (condition == "user_agent" &&
            this.userVars[condition].includes(conditions[condition])) ||
          (condition == "media_query" &&
            window.matchMedia(conditions[condition]).matches)
        ) {
          count++;
        } else {
          return 0;
        }
      }
      return count;
    }

    getCardSize() {
      return 0;
    }

    run() {
      const root = this.rootElement;
      this.editMode =
        root.querySelector("app-toolbar").className == "edit-mode";
      const buttons = this.getButtonElements(root);
      const tabContainer = root.querySelector("paper-tabs");
      const tabs = tabContainer
        ? Array.from(tabContainer.querySelectorAll("paper-tab"))
        : [];
      let hidden_tabs = JSON.parse("[" + this.cchConfig.hide_tabs + "]");
      const shown_tabs = JSON.parse("[" + this.cchConfig.show_tabs + "]");
      // Invert shown_tabs to hidden tabs.
      if (!hidden_tabs.length && shown_tabs.length) {
        let total_tabs = [];
        for (let i = 0; i < tabs.length; i++) {
          total_tabs.push(i);
        }
        hidden_tabs = total_tabs.filter( ( el ) => !shown_tabs.includes( el ) );
      }
      if (!this.editMode) this.hideCard();
      if (this.editMode && !this.cchConfig.disable) {
        this.removeMargin(tabContainer);
        if (buttons.options) {
          this.insertEditMenu(buttons.options, tabs);
        }
      } else if (
        !this.cchConfig.disable &&
        !window.location.href.includes("disable_cch")
      ) {
        const marginRight = this.marginRight;
        this.styleHeader(root, tabContainer, marginRight);
        this.styleButtons(buttons, tabs);
        if (this.cchConfig.hide_tabs && tabContainer) {
          this.hideTabs(tabContainer, tabs, hidden_tabs);
        }
        this.restoreTabs(tabs, hidden_tabs);
        for (const button in buttons) {
          if (this.cchConfig[button] == "clock") {
            this.insertClock(
              buttons,
              button == "options"
                ? buttons[button]
                : buttons[button].shadowRoot,
              tabContainer,
              marginRight
            );
          }
        }
        fireEvent(this, "iron-resize");
      }
    }

    get marginRight() {
      // Add width of all visible elements on right side for tabs margin.
      let marginRight = 0;
      marginRight += this.cchConfig.notifications == "show" ? 45 : 0;
      marginRight += this.cchConfig.voice == "show" ? 45 : 0;
      marginRight += this.cchConfig.options == "show" ? 45 : 0;
      return marginRight;
    }

    get rootElement() {
      try {
        return document
          .querySelector("home-assistant")
          .shadowRoot.querySelector("home-assistant-main")
          .shadowRoot.querySelector("app-drawer-layout partial-panel-resolver")
          .shadowRoot.querySelector("ha-panel-lovelace")
          .shadowRoot.querySelector("hui-root").shadowRoot;
      } catch(e) {
        console.log("Can't find 'hui-root', going to walk the DOM to find it.");
      }
      this.recursiveWalk(document, "HUI-ROOT", node => {
        return node.nodeName == "HUI-ROOT" ? node.shadowRoot : null;
      });
    }

    insertEditMenu(optionsBtn, tabs) {
      if (this.cchConfig.hide_tabs) {
        let show_tabs = document.createElement("paper-item");
        show_tabs.setAttribute("id", "show_tabs");
        show_tabs.addEventListener("click", () => {
          for (let i = 0; i < tabs.length; i++) {
            tabs[i].style.removeProperty("display");
          }
        });
        show_tabs.innerHTML = "Show all tabs";
        this.insertMenuItem(
          optionsBtn.querySelector("paper-listbox"),
          show_tabs
        );
      }
    }

    getButtonElements(root) {
      const buttons = {};
      buttons.options = root.querySelector("paper-menu-button");

      if (!this.editMode) {
        buttons.menu = root.querySelector("ha-menu-button");
        buttons.voice = root.querySelector("ha-start-voice-button");
        buttons.notifications = root.querySelector("hui-notifications-button");
      }
      return buttons;
    }

    removeMargin(tabContainer) {
      // Remove margin from tabs when in edit mode
      if (tabContainer) {
        tabContainer.style.marginLeft = "";
        tabContainer.style.marginRight = "";
      }
    }

    styleHeader(root, tabContainer, marginRight) {
      // Hide header completely if set to false in config.
      if (!this.cchConfig.header) {
        root.querySelector("app-header").style.display = "none";
        return;
      }

      root
        .querySelector("ha-app-layout")
        .querySelector('[id="view"]').style.paddingBottom = this.cchConfig
        .background_image
        ? "64px"
        : "";

      if (tabContainer) {
        // Add margin to left side of tabs for menu buttom.
        if (this.cchConfig.menu == "show") {
          tabContainer.style.marginLeft = "60px";
        }
        // Add margin to right side of tabs for all buttons on the right.
        tabContainer.style.marginRight = `${marginRight}px`;

        // Shift the header up to hide unused portion.
        root.querySelector("app-toolbar").style.marginTop = "-64px";

        // Hide tab bar scroll arrows to save space since we can still swipe.
        let chevron = tabContainer.shadowRoot.querySelectorAll(
          '[icon^="paper-tabs:chevron"]'
        );
        chevron[0].style.display = "none";
        chevron[1].style.display = "none";
      }
    }

    styleButtons(buttons, tabs) {
      let topMargin = tabs.length > 0 ? "margin-top:111px;" : ""
      for (const button in buttons) {
        if (button == "options" && this.cchConfig[button] == "overflow") {
          this.cchConfig[button] = "show";
        }
        if (
          this.cchConfig[button] == "show" ||
          this.cchConfig[button] == "clock"
        ) {
          buttons[button].style.cssText = `
              z-index:1;
              ${topMargin}
              ${button == "options" ? "margin-right:-5px; padding:0;" : ""}
            `;
        } else if (this.cchConfig[button] == "overflow") {
          const paperIconButton = buttons[button].shadowRoot.querySelector(
            "paper-icon-button"
          );
          if (paperIconButton.hasAttribute("hidden")) {
            continue;
          }
          const menu_items = buttons.options.querySelector("paper-listbox");
          const id = `menu_item_${button}`;
          if (!menu_items.querySelector(`[id="${id}"]`)) {
            const wrapper = document.createElement("paper-item");
            wrapper.setAttribute("id", id);
            wrapper.innerText = this.getTranslation(button);
            wrapper.appendChild(buttons[button]);
            wrapper.addEventListener("click", () => {
              paperIconButton.click();
            });
            this.insertMenuItem(menu_items, wrapper);
          }
        } else if (this.cchConfig[button] == "hide") {
          buttons[button].style.display = "none";
        }
      }
    }

    getTranslation(button) {
      switch (button) {
        case "notifications":
          return this.hass.localize("ui.notification_drawer.title");
        default:
          return button.charAt(0).toUpperCase() + button.slice(1);
      }
    }

    restoreTabs(tabs, hidden_tabs) {
      for (let i = 0; i < tabs.length; i++) {
        let hidden = hidden_tabs.includes(i);
        if (tabs[i].style.display == "none" && !hidden) {
          tabs[i].style.removeProperty("display");
        }
      }
    }

    hideTabs(tabContainer, tabs, hidden_tabs) {
      for (const tab of hidden_tabs) {
        if (!tabs[tab]) {
          continue;
        }
        tabs[tab].style.display = "none";
      }

      // Check if current tab is a hidden tab.
      const activeTab = tabContainer.querySelector("paper-tab.iron-selected");
      const activeTabIndex = tabs.indexOf(activeTab);
      if (
        hidden_tabs.includes(activeTabIndex) &&
        hidden_tabs.length != tabs.length
      ) {
        let i = 0;
        // Find first not hidden view
        while (hidden_tabs.includes(i)) {
          i++;
        }
        tabs[i].click();
      }
    }

    hideCard() {
      // If this card is the only one in a column hide column outside edit mode.
      if (this.parentNode.children.length == 1) {
        this.parentNode.style.display = "none";
      }
      this.style.display = "none";
    }

    insertMenuItem(menu_items, element) {
      let first_item = menu_items.querySelector("paper-item");
      if (!menu_items.querySelector(`[id="${element.id}"]`)) {
        first_item.parentNode.insertBefore(element, first_item);
      }
    }

    insertClock(buttons, clock_button, tabContainer, marginRight) {
      const clockIcon = clock_button.querySelector("paper-icon-button");
      const clockIronIcon = clockIcon.shadowRoot.querySelector("iron-icon");
      const clockWidth =
        this.cchConfig.clock_format == 12 &&
        this.cchConfig.clock_am_pm ||
        this.cchConfig.clock_date
          ? 110
          : 80;

      if (this.cchConfig.notifications == "clock") {
        let style = document.createElement( 'style' );
        if (this.config.clock_date) {
          style.innerHTML = `
          .indicator {
            top: unset;
            bottom: -3px;
            right: -10px;
            width: 90%;
            height: 3px;
            border-radius: 0;
          }
          .indicator > div{
            display:none;
          }
        `;
        } else {
          style.innerHTML = `
          .indicator {
            top: 5px;
            right: -10px;
            width: 10px;
            height: 10px;
          }
          .indicator > div{
            display:none;
          }
        `;
        }
        buttons.notifications.shadowRoot.appendChild( style )
      }

      let clockElement = clockIronIcon.parentNode.getElementById("cch_clock");
      if (!clockElement) {
        clockIcon.style.cssText = `
              margin-right:-5px;
              width:${clockWidth}px;
              text-align: center;
            `;

        clockElement = document.createElement("p");
        clockElement.setAttribute("id", "cch_clock");
        let clockAlign = this.cchConfig.menu == "clock" ? "left" : "right";
        let marginTop = this.cchConfig.clock_date ? "-6px" : "2px";
        clockElement.style.cssText = `
              width: ${clockWidth}px;
              margin-top: ${marginTop};
              margin-left: -8px;
              text-align: ${clockAlign};
            `;
        clockIronIcon.parentNode.insertBefore(clockElement, clockIronIcon);
        clockIronIcon.style.display = "none";
      }

      if (this.cchConfig.menu == "clock" && tabContainer) {
        tabContainer.style.marginLeft = `${clockWidth + 15}px`;
      } else if (tabContainer) {
        tabContainer.style.marginRight = `${clockWidth + marginRight}px`;
      }
      const clockFormat = {
        hour12: this.cchConfig.clock_format != 24,
        hour: "2-digit",
        minute: "2-digit"
      };
      this.updateClock(clockElement, clockFormat);
    }

    updateClock(clock, clockFormat) {
      let date = new Date();
      let locale = this.hass.language;
      let time = date.toLocaleTimeString([], clockFormat);
      let options = {
        "weekday": "short",
        "month": "2-digit",
        "day": "2-digit"
      }
      date = this.cchConfig.clock_date
        ? `</br>${date.toLocaleDateString( locale, options )}`
        : "";
      if (!this.cchConfig.clock_am_pm && this.cchConfig.clock_format == 12) {
        clock.innerHTML = time.slice(0, -3) + date;
      } else {
        clock.innerHTML = time + date;
      }
      window.setTimeout(() => this.updateClock(clock, clockFormat), 60000);
    }

    // Walk the DOM to find element.
    recursiveWalk(node, element, func) {
      let done = func(node) || node.nodeName == element;
      if (done) return true;
      if ("shadowRoot" in node && node.shadowRoot) {
        done = this.recursiveWalk(node.shadowRoot, element, func);
        if (done) return true;
      }
      node = node.firstChild;
      while (node) {
        done = this.recursiveWalk(node, element, func);
        if (done) return true;
        node = node.nextSibling;
      }
    }
  }

  customElements.define("compact-custom-header", CompactCustomHeader);
}
