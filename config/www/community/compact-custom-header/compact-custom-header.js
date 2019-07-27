export const LitElement = Object.getPrototypeOf(
  customElements.get("ha-panel-lovelace")
);
export const html = LitElement.prototype.html;
export const hass = document.querySelector("home-assistant").hass;

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
  disable: false,
  menu: "show",
  voice: "show",
  notifications: "show",
  options: "show",
  clock_format: 12,
  clock_am_pm: true,
  clock_date: false,
  date_locale: hass.language,
  chevrons: false,
  redirect: true,
  background: "",
  hide_tabs: [],
  show_tabs: [],
  default_tab: [],
  kiosk_mode: false,
  sidebar_swipe: true,
  sidebar_closed: false,
  disable_sidebar: false,
  hide_help: false,
  hide_config: false,
  hide_unused: false,
  tab_color: {},
  button_color: {},
  swipe: false,
  swipe_amount: "15",
  swipe_animate: "none",
  swipe_skip: "",
  swipe_wrap: true,
  swipe_prevent_default: false,
  warning: true
};

let root = document.querySelector("home-assistant");
root = root && root.shadowRoot;
root = root && root.querySelector("home-assistant-main");
const main = root;
root = root && root.shadowRoot;
root = root && root.querySelector("app-drawer-layout partial-panel-resolver");
root = (root && root.shadowRoot) || root;
root = root && root.querySelector("ha-panel-lovelace");
root = root && root.shadowRoot;
root = root && root.querySelector("hui-root");
const lovelace = root.lovelace;
root = root.shadowRoot;

export const newSidebar = !root.querySelector("hui-notification-drawer");

let notifications = notificationCount();
const header = root.querySelector("app-header");
let cchConfig = buildConfig(lovelace.config.cch || {});
const view = root.querySelector("ha-app-layout").querySelector('[id="view"]');

let defaultTabRedirect = false;
let sidebarClosed = false;
let editMode = header.className == "edit-mode";
let firstRun = true;
let condState = [];
let prevColor = {};
let prevState = [];
let buttons = {};

run();
breakingChangeNotification();

function run() {
  const disable = cchConfig.disable;
  const urlDisable = window.location.href.includes("disable_cch");
  const tabContainer = root.querySelector("paper-tabs");
  const tabs = tabContainer
    ? Array.from(tabContainer.querySelectorAll("paper-tab"))
    : [];
  if (firstRun || buttons == undefined) {
    buttons = getButtonElements(tabContainer);
  }
  if (!buttons.menu || !buttons.options || header.className == "edit-mode") {
    return;
  }

  if (!disable && !urlDisable) {
    insertEditMenu(tabs);
    if (!editMode) {
      styleButtons(tabs);
      styleHeader(tabContainer, tabs, header);
      hideTabs(tabContainer, tabs);
      defaultTab(tabs, tabContainer);
    }
    if (firstRun) sidebarMod();
    hideMenuItems();
    for (const button in buttons) {
      if (cchConfig[button] == "clock") insertClock(button);
    }
    if (!editMode) tabContainerMargin(tabContainer);
    if (cchConfig.swipe) swipeNavigation(tabs, tabContainer);
  }
  if (!disable && firstRun) observers(tabContainer, tabs, urlDisable, header);
  fireEvent(header, "iron-resize");
  firstRun = false;
}

function buildConfig(config) {
  let exceptionConfig = {};
  let highestMatch = 0;
  if (config.exceptions) {
    config.exceptions.forEach(exception => {
      const matches = countMatches(exception.conditions);
      if (matches > highestMatch) {
        highestMatch = matches;
        exceptionConfig = exception.config;
      }
    });
  }

  if (
    exceptionConfig.hide_tabs &&
    config.show_tabs &&
    exceptionConfig.hide_tabs.length &&
    config.show_tabs.length
  ) {
    delete config.show_tabs;
  } else if (
    exceptionConfig.show_tabs &&
    config.hide_tabs &&
    exceptionConfig.show_tabs.length &&
    config.hide_tabs.length
  ) {
    delete config.hide_tabs;
  }

  return { ...defaultConfig, ...config, ...exceptionConfig };

  function countMatches(conditions) {
    const userVars = { user: hass.user.name, user_agent: navigator.userAgent };
    let count = 0;
    for (const cond in conditions) {
      if (
        userVars[cond] == conditions[cond] ||
        (cond == "user_agent" && userVars[cond].includes(conditions[cond])) ||
        (cond == "media_query" && window.matchMedia(conditions[cond]).matches)
      ) {
        count++;
      } else {
        return 0;
      }
    }
    return count;
  }
}

function observers(tabContainer, tabs, urlDisable, header) {
  const callback = function(mutations) {
    mutations.forEach(mutation => {
      if (mutation.target.className == "edit-mode") {
        editMode = true;
        if (!cchConfig.disable) removeStyles(tabContainer, tabs, header);
        buttons.options = root.querySelector("paper-menu-button");
        insertEditMenu(tabs);
      } else if (mutation.target.nodeName == "APP-HEADER") {
        for (let node of mutation.addedNodes) {
          if (node.nodeName == "APP-TOOLBAR") {
            editMode = false;
            buttons = getButtonElements(tabContainer);
            run();
            return;
          }
        }
      } else if (mutation.addedNodes.length) {
        if (mutation.addedNodes[0].nodeName == "HUI-UNUSED-ENTITIES") return;
        let editor = root
          .querySelector("ha-app-layout")
          .querySelector("editor");
        if (editor) root.querySelector("ha-app-layout").removeChild(editor);
        if (!editMode && !urlDisable && cchConfig.conditional_styles) {
          conditionalStyling(tabs, header);
        }
      }
    });
  };
  new MutationObserver(callback).observe(view, { childList: true });
  new MutationObserver(callback).observe(root.querySelector("app-header"), {
    childList: true
  });

  if (!urlDisable) {
    window.hassConnection.then(({ conn }) => {
      conn.socket.onmessage = () => {
        notifications = notificationCount();
        if (cchConfig.conditional_styles && !editMode) {
          conditionalStyling(tabs, header);
        }
      };
    });
  }
}

function notificationCount() {
  if (newSidebar) {
    let badge = main.shadowRoot
      .querySelector("ha-sidebar")
      .shadowRoot.querySelector("span.notification-badge");
    if (!badge) {
      return 0;
    } else {
      return parseInt(badge.innerHTML);
    }
  }
  let i = 0;
  let drawer = root
    .querySelector("hui-notification-drawer")
    .shadowRoot.querySelector(".notifications");
  for (let notification of drawer.querySelectorAll(".notification")) {
    if (notification.style.display !== "none") i++;
  }
  return i;
}

function getButtonElements(tabContainer) {
  let buttons = {};
  buttons.options = root.querySelector("paper-menu-button");
  if (!editMode) {
    buttons.menu = root.querySelector("ha-menu-button");
    buttons.voice = root.querySelector("ha-start-voice-button");
    if (!newSidebar) {
      buttons.notifications = root.querySelector("hui-notifications-button");
    }
  }
  if (buttons.menu && newSidebar) {
    new MutationObserver(() => {
      if (buttons.menu.style.visibility == "hidden") {
        buttons.menu.style.display = "none";
      } else {
        buttons.menu.style.display = "";
      }
      tabContainerMargin(tabContainer);
    }).observe(buttons.menu, { attributeFilter: ["style"] });
  }
  return buttons;
}

function tabContainerMargin(tabContainer) {
  let marginRight = 0;
  let marginLeft = 15;
  for (const button in buttons) {
    let visible = buttons[button].style.display !== "none";
    if (cchConfig[button] == "show" && visible) {
      if (button == "menu") marginLeft += 45;
      else marginRight += 45;
    } else if (cchConfig[button] == "clock" && visible) {
      const clockWidth =
        (cchConfig.clock_format == 12 && cchConfig.clock_am_pm) ||
        cchConfig.clock_date
          ? 110
          : 80;
      if (button == "menu") marginLeft += clockWidth + 15;
      else marginRight += clockWidth;
    }
  }
  if (tabContainer) {
    tabContainer.style.marginRight = marginRight + "px";
    tabContainer.style.marginLeft = marginLeft + "px";
  }
}

function hideMenuItems() {
  if (cchConfig.hide_help || cchConfig.hide_config) {
    let menuItems = buttons.options
      .querySelector("paper-listbox")
      .querySelectorAll("paper-item");
    for (let item of menuItems) {
      if (item.innerHTML.includes("Help") && cchConfig.hide_help) {
        item.parentNode.removeChild(item);
      } else if (
        item.innerHTML.includes("Unused entities") &&
        cchConfig.hide_unused
      ) {
        item.parentNode.removeChild(item);
      } else if (
        item.innerHTML.includes("Configure UI") &&
        cchConfig.hide_config
      ) {
        item.parentNode.removeChild(item);
      }
    }
  }
}

function insertEditMenu(tabs) {
  if (cchConfig.hide_tabs && buttons.options && editMode) {
    let show_tabs = document.createElement("paper-item");
    show_tabs.setAttribute("id", "show_tabs");
    show_tabs.addEventListener("click", () => {
      for (let i = 0; i < tabs.length; i++) {
        tabs[i].style.removeProperty("display");
      }
    });
    show_tabs.innerHTML = "Show all tabs";
    insertMenuItem(buttons.options.querySelector("paper-listbox"), show_tabs);

    let cchSettings = document.createElement("paper-item");
    cchSettings.setAttribute("id", "cch_settings");
    cchSettings.addEventListener("click", () => {
      showEditor();
    });
    cchSettings.innerHTML = "CCH Settings";
    insertMenuItem(buttons.options.querySelector("paper-listbox"), cchSettings);
  }
}

function removeStyles(tabContainer, tabs, header) {
  let header_colors = root.querySelector('[id="cch_header_colors"]');
  if (tabContainer) {
    tabContainer.style.marginLeft = "";
    tabContainer.style.marginRight = "";
  }
  header.style.background = null;
  view.style.minHeight = "";
  view.style.marginTop = "";
  view.style.paddingTop = "";
  view.style.boxSizing = "";
  if (root.querySelector('[id="cch_iron_selected"]')) {
    root.querySelector('[id="cch_iron_selected"]').outerHTML = "";
  }
  if (header_colors) header_colors.parentNode.removeChild(header_colors);
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].style.color = "";
  }
}

function styleHeader(tabContainer, tabs, header) {
  if (!cchConfig.header || cchConfig.kiosk_mode) {
    header.style.display = "none";
    view.style.minHeight = "100vh";
  } else {
    view.style.minHeight = "100vh";
    view.style.marginTop = "-48.5px";
    view.style.paddingTop = "48.5px";
    view.style.boxSizing = "border-box";
    let cchThemeBg = getComputedStyle(document.body).getPropertyValue(
      "--cch-background"
    );
    header.style.background =
      cchConfig.background || cchThemeBg || "var(--primary-color)";
    if (!tabContainer) {
      header.querySelector("app-toolbar").style.background =
        cchConfig.background || cchThemeBg || "var(--primary-color)";
    }
  }

  if (newSidebar)
    main.shadowRoot
      .querySelector("ha-sidebar")
      .shadowRoot.querySelector(".menu").style = "height:49px;";
  let indicator = cchConfig.tab_indicator_color;
  if (
    indicator &&
    !root.querySelector('[id="cch_header_colors"]') &&
    !editMode
  ) {
    let style = document.createElement("style");
    style.setAttribute("id", "cch_header_colors");
    style.innerHTML = `
          paper-tabs {
            ${
              indicator
                ? `--paper-tabs-selection-bar-color: ${indicator} !important`
                : "var(--cch-tab-indicator-color) !important"
            }
          }
        `;
    root.appendChild(style);
  }

  let conditionalTabs = cchConfig.conditional_styles
    ? JSON.stringify(cchConfig.conditional_styles).includes("tab")
    : false;
  if (
    !root.querySelector('[id="cch_iron_selected"]') &&
    !editMode &&
    !conditionalTabs &&
    tabContainer
  ) {
    let style = document.createElement("style");
    style.setAttribute("id", "cch_iron_selected");
    style.innerHTML = `
            .iron-selected {
              ${
                cchConfig.active_tab_color
                  ? `color: ${cchConfig.active_tab_color + " !important"}`
                  : "var(--cch-active-tab-color)"
              }
            }
          `;
    tabContainer.appendChild(style);
  }
  let all_tabs_color = cchConfig.all_tabs_color || "var(--cch-all-tabs-color)";
  if (
    (cchConfig.tab_color && Object.keys(cchConfig.tab_color).length) ||
    all_tabs_color
  ) {
    for (let i = 0; i < tabs.length; i++) {
      tabs[i].style.color = cchConfig.tab_color[i] || all_tabs_color;
    }
  }

  if (tabContainer) {
    // Shift the header up to hide unused portion.
    root.querySelector("app-toolbar").style.marginTop = "-64px";

    if (!cchConfig.chevrons) {
      // Hide chevrons.
      let chevron = tabContainer.shadowRoot.querySelectorAll(
        '[icon^="paper-tabs:chevron"]'
      );
      chevron[0].style.display = "none";
      chevron[1].style.display = "none";
    } else {
      // Remove space taken up by "not-visible" chevron.
      let style = document.createElement("style");
      style.setAttribute("id", "cch_chevron");
      style.innerHTML = `
            .not-visible {
              display:none;
            }
          `;
      tabContainer.shadowRoot.appendChild(style);
    }
  }
}

function styleButtons(tabs) {
  let topMargin = tabs.length > 0 ? "margin-top:111px;" : "";
  buttons = reverseObject(buttons);
  for (const button in buttons) {
    if (!buttons[button]) continue;
    if (button == "options" && cchConfig[button] == "overflow") {
      cchConfig[button] = "show";
    }
    if (cchConfig[button] == "show" || cchConfig[button] == "clock") {
      if (button == "menu") {
        let paperIconButton = buttons[button].querySelector("paper-icon-button")
          ? buttons[button].querySelector("paper-icon-button")
          : buttons[button].shadowRoot.querySelector("paper-icon-button");
        if (!paperIconButton) continue;
        paperIconButton.style.cssText = `
          z-index:1;
          ${topMargin}
          ${button == "options" ? "margin-right:-5px; padding:0;" : ""}
        `;
      } else {
        buttons[button].style.cssText = `
              z-index:1;
              ${topMargin}
              ${button == "options" ? "margin-right:-5px; padding:0;" : ""}
            `;
      }
    } else if (cchConfig[button] == "overflow") {
      const menu_items = buttons.options.querySelector("paper-listbox");
      let paperIconButton = buttons[button].querySelector("paper-icon-button")
        ? buttons[button].querySelector("paper-icon-button")
        : buttons[button].shadowRoot.querySelector("paper-icon-button");
      if (paperIconButton.hasAttribute("hidden")) {
        continue;
      }
      const id = `menu_item_${button}`;
      if (!menu_items.querySelector(`[id="${id}"]`)) {
        const wrapper = document.createElement("paper-item");
        wrapper.setAttribute("id", id);
        wrapper.innerText = getTranslation(button);
        wrapper.appendChild(buttons[button]);
        wrapper.addEventListener("click", () => {
          paperIconButton.click();
        });
        paperIconButton.style.pointerEvents = "none";
        insertMenuItem(menu_items, wrapper);
        if (button == "notifications" && !newSidebar) {
          let style = document.createElement("style");
          style.innerHTML = `
                .indicator {
                  top: 5px;
                  right: 0px;
                  width: 10px;
                  height: 10px;
                  ${
                    cchConfig.notify_indicator_color
                      ? `background-color:${cchConfig.notify_indicator_color}`
                      : ""
                  }
                }
                .indicator > div{
                  display:none;
                }
              `;
          paperIconButton.parentNode.appendChild(style);
        }
      }
    } else if (cchConfig[button] == "hide") {
      buttons[button].style.display = "none";
    }
    if (newSidebar && (cchConfig.kiosk_mode || cchConfig.disable_sidebar)) {
      buttons.menu.style.display = "none";
    }
  }

  // Use color vars set in HA theme.
  buttons.menu.style.color = "var(--cch-button-color-menu)";
  if (!newSidebar) {
    buttons.notifications.style.color = "var(--cch-button-color-notifications)";
  }
  buttons.voice.style.color = "var(--cch-button-color-voice)";
  buttons.options.style.color = "var(--cch-button-color-options)";
  if (cchConfig.all_buttons_color) {
    root.querySelector("app-toolbar").style.color =
      cchConfig.all_buttons_color || "var(--cch-all-buttons-color)";
  }

  // Use colors set in CCH config.
  for (const button in buttons) {
    if (cchConfig.button_color[button]) {
      buttons[button].style.color = cchConfig.button_color[button];
    }
  }

  if (cchConfig.notify_indicator_color && cchConfig.notifications == "show") {
    let style = document.createElement("style");
    style.innerHTML = `
          .indicator {
            background-color:${cchConfig.notify_indicator_color ||
              "var(--cch-notify-indicator-color)"} !important;
            color: ${cchConfig.notify_text_color ||
              "var(--cch-notify-text-color), var(--primary-text-color)"};
          }
        `;
    if (!newSidebar) buttons.notifications.shadowRoot.appendChild(style);
  }
}

function getTranslation(button) {
  switch (button) {
    case "notifications":
      return hass.localize("ui.notification_drawer.title");
    default:
      return button.charAt(0).toUpperCase() + button.slice(1);
  }
}

function defaultTab(tabs, tabContainer) {
  if (cchConfig.default_tab && !defaultTabRedirect && tabContainer) {
    let default_tab = cchConfig.default_tab;
    let activeTab = tabs.indexOf(tabContainer.querySelector(".iron-selected"));
    if (
      activeTab != default_tab &&
      activeTab == 0 &&
      !cchConfig.hide_tabs.includes(default_tab)
    ) {
      tabs[default_tab].click();
    }
    defaultTabRedirect = true;
  }
}

function sidebarMod() {
  let menu = buttons.menu.querySelector("paper-icon-button");
  let sidebar = main.shadowRoot.querySelector("app-drawer");

  if (!newSidebar) {
    if (!cchConfig.sidebar_swipe || cchConfig.kiosk_mode) {
      sidebar.removeAttribute("swipe-open");
    }
    if ((cchConfig.sidebar_closed || cchConfig.kiosk_mode) && !sidebarClosed) {
      if (sidebar.hasAttribute("opened")) menu.click();
      sidebarClosed = true;
    }
  } else if (
    newSidebar &&
    (cchConfig.disable_sidebar || cchConfig.kiosk_mode)
  ) {
    sidebar.style.display = "none";
    sidebar.addEventListener(
      "mouseenter",
      function(event) {
        event.stopPropagation();
      },
      true
    );
    let style = document.createElement("style");
    style.type = "text/css";
    style.appendChild(
      document.createTextNode(
        ":host(:not([expanded])) {width: 0px !important;}"
      )
    );
    main.shadowRoot.querySelector("ha-sidebar").shadowRoot.appendChild(style);

    style = document.createElement("style");
    style.type = "text/css";
    style.appendChild(
      document.createTextNode(":host {--app-drawer-width: 0px !important;}")
    );
    main.shadowRoot.appendChild(style);
  }
}

function hideTabs(tabContainer, tabs) {
  let hidden_tabs = String(cchConfig.hide_tabs).length
    ? String(cchConfig.hide_tabs)
        .replace(/\s+/g, "")
        .split(",")
    : null;
  let shown_tabs = String(cchConfig.show_tabs).length
    ? String(cchConfig.show_tabs)
        .replace(/\s+/g, "")
        .split(",")
    : null;

  // Set the tab config source.
  if (!hidden_tabs && shown_tabs) {
    let all_tabs = [];
    shown_tabs = buildRanges(shown_tabs);
    for (let i = 0; i < tabs.length; i++) all_tabs.push(i);
    // Invert shown_tabs to hidden_tabs.
    hidden_tabs = all_tabs.filter(el => !shown_tabs.includes(el));
  } else {
    hidden_tabs = buildRanges(hidden_tabs);
  }

  // Hide tabs.
  for (const tab of hidden_tabs) {
    if (!tabs[tab]) continue;
    tabs[tab].style.display = "none";
  }

  if (cchConfig.redirect && tabContainer) {
    const activeTab = tabContainer.querySelector("paper-tab.iron-selected");
    const activeTabIndex = tabs.indexOf(activeTab);
    // Is the current tab hidden and is there at least one tab is visible.
    if (
      hidden_tabs.includes(activeTabIndex) &&
      hidden_tabs.length != tabs.length
    ) {
      let i = 0;
      // Find the first visible tab and navigate.
      while (hidden_tabs.includes(i)) {
        i++;
      }
      tabs[i].click();
    }
  }
  return hidden_tabs;
}

function insertMenuItem(menu_items, element) {
  let first_item = menu_items.querySelector("paper-item");
  if (!menu_items.querySelector(`[id="${element.id}"]`)) {
    first_item.parentNode.insertBefore(element, first_item);
  }
}

function insertClock(button) {
  const clock_button = buttons[button].querySelector("paper-icon-button")
    ? buttons[button]
    : buttons[button].shadowRoot;
  const clockIcon = clock_button.querySelector("paper-icon-button");
  const clockIronIcon = clockIcon.shadowRoot.querySelector("iron-icon");
  const clockWidth =
    (cchConfig.clock_format == 12 && cchConfig.clock_am_pm) ||
    cchConfig.clock_date
      ? 110
      : 80;

  if (
    !newSidebar &&
    cchConfig.notifications == "clock" &&
    cchConfig.clock_date &&
    !buttons.notifications.shadowRoot.querySelector('[id="cch_indicator"]')
  ) {
    let style = document.createElement("style");
    style.setAttribute("id", "cch_indicator");
    style.innerHTML = `
          .indicator {
            top: unset;
            bottom: -3px;
            right: 0px;
            width: 90%;
            height: 3px;
            border-radius: 0;
            ${
              cchConfig.notify_indicator_color
                ? `background-color:${cchConfig.notify_indicator_color}`
                : ""
            }
          }
          .indicator > div{
            display:none;
          }
        `;
    buttons.notifications.shadowRoot.appendChild(style);
  }

  let clockElement = clockIronIcon.parentNode.getElementById("cch_clock");
  if (cchConfig.menu == "clock") {
    buttons.menu.style.marginTop = "111px";
    buttons.menu.style.zIndex = "1";
  }
  if (!clockElement) {
    clockIcon.style.cssText = `
              margin-right:-5px;
              width:${clockWidth}px;
              text-align: center;
            `;
    clockElement = document.createElement("p");
    clockElement.setAttribute("id", "cch_clock");
    let clockAlign = "center";
    let padding = "";
    let fontSize = "";
    if (cchConfig.clock_date && cchConfig.menu == "clock") {
      clockAlign = "left";
      padding = "margin-right:-20px";
      fontSize = "font-size:12pt";
    } else if (cchConfig.clock_date) {
      clockAlign = "right";
      padding = "margin-left:-20px";
      fontSize = "font-size:12pt";
    }
    clockElement.style.cssText = `
              margin-top: ${cchConfig.clock_date ? "-4px" : "2px"};
              text-align: ${clockAlign};
              ${padding};
              ${fontSize};
            `;
    clockIronIcon.parentNode.insertBefore(clockElement, clockIronIcon);
    clockIronIcon.style.display = "none";
  }

  const clockFormat = {
    hour12: cchConfig.clock_format != 24,
    hour: "2-digit",
    minute: "2-digit"
  };
  updateClock(clockElement, clockFormat);
}

function updateClock(clock, clockFormat) {
  let date = new Date();
  let locale = cchConfig.date_locale || hass.language;
  let time = date.toLocaleTimeString([], clockFormat);
  let options = {
    weekday: "short",
    month: "2-digit",
    day: "2-digit"
  };
  date = cchConfig.clock_date
    ? `</br>${date.toLocaleDateString(locale, options)}`
    : "";
  if (!cchConfig.clock_am_pm && cchConfig.clock_format == 12) {
    clock.innerHTML = time.slice(0, -3) + date;
  } else {
    clock.innerHTML = time + date;
  }
  window.setTimeout(() => updateClock(clock, clockFormat), 60000);
}

// Abandon all hope, ye who enter here.
function conditionalStyling(tabs, header) {
  let _hass = document.querySelector("home-assistant").hass;
  const conditional_styles = cchConfig.conditional_styles;
  let tabContainer = tabs[0] ? tabs[0].parentNode : "";
  let elem, color, bg, hide, onIcon, offIcon, iconElem;

  const styleElements = () => {
    if (bg && elem == "background") header.style.background = bg;
    else if (color) elem.style.color = color;
    if (onIcon && iconElem) iconElem.setAttribute("icon", onIcon);
    if (hide && elem !== "background" && !editMode) {
      elem.style.display = "none";
    }
  };

  const getElements = (key, elemArray, i, obj, styling) => {
    elem = elemArray[key];
    color = styling[i][obj][key].color;
    onIcon = styling[i][obj][key].on_icon;
    offIcon = styling[i][obj][key].off_icon;
    hide = styling[i][obj][key].hide;
    if (!prevColor[key]) {
      prevColor[key] = window
        .getComputedStyle(elem, null)
        .getPropertyValue("color");
    }
  };

  let styling = [];
  if (Array.isArray(conditional_styles)) {
    for (let i = 0; i < conditional_styles.length; i++) {
      styling.push(Object.assign({}, conditional_styles[i]));
    }
  } else {
    styling.push(Object.assign({}, conditional_styles));
  }

  for (let i = 0; i < styling.length; i++) {
    let template = styling[i].template;
    if (template) {
      if (!template.length) template = [template];
      template.forEach(template => {
        templates(template, tabs, _hass, header);
      });
    } else {
      let entity = styling[i].entity;
      if (_hass.states[entity] == undefined && entity !== "notifications") {
        console.log(`CCH conditional styling: ${entity} does not exist.`);
        continue;
      }
      if (entity == "notifications") condState[i] = notifications;
      else condState[i] = _hass.states[entity].state;

      if (condState[i] !== prevState[i] || !condState.length) {
        prevState[i] = condState[i];
        let above = styling[i].condition.above;
        let below = styling[i].condition.below;

        for (const obj in styling[i]) {
          let key;
          if (styling[i][obj]) {
            key = Object.keys(styling[i][obj])[0];
          }
          if (obj == "background") {
            elem = "background";
            color = styling[i][obj].color;
            bg = styling[i][obj];
            iconElem = false;
            if (!prevColor[obj]) {
              prevColor[obj] = window
                .getComputedStyle(header, null)
                .getPropertyValue("background");
            }
          } else if (obj == "button") {
            if (newSidebar && key == "notifications") continue;
            getElements(key, buttons, i, obj, styling);
            if (key == "menu") {
              iconElem = elem
                .querySelector("paper-icon-button")
                .shadowRoot.querySelector("iron-icon");
            } else {
              iconElem = elem.shadowRoot
                .querySelector("paper-icon-button")
                .shadowRoot.querySelector("iron-icon");
            }
          } else if (obj == "tab") {
            getElements(key, tabs, i, obj, styling);
            iconElem = elem.querySelector("ha-icon");
          }

          if (condState[i] == styling[i].condition.state) {
            styleElements();
          } else if (
            above !== undefined &&
            below !== undefined &&
            condState[i] > above &&
            condState[i] < below
          ) {
            styleElements();
          } else if (
            above !== undefined &&
            below == undefined &&
            condState[i] > above
          ) {
            styleElements();
          } else if (
            above == undefined &&
            below !== undefined &&
            condState[i] < below
          ) {
            styleElements();
          } else {
            if (elem !== "background" && hide && elem.style.display == "none") {
              elem.style.display = "";
            }
            if (bg && elem == "background") {
              header.style.background = prevColor[obj];
            } else if (
              obj !== "background" &&
              obj !== "entity" &&
              obj !== "condition"
            ) {
              elem.style.color = prevColor[key];
            }
            if (onIcon && offIcon) {
              iconElem.setAttribute("icon", offIcon);
            }
          }
        }
      }
    }
  }
  tabContainerMargin(tabContainer);
}

function templates(template, tabs, _hass, header) {
  // Variables for templates.
  let states = _hass.states;
  let entity = states;

  const templateEval = template => {
    try {
      if (template.includes("return")) {
        return eval(`(function() {${template}}())`);
      } else {
        return eval(template);
      }
    } catch (e) {
      console.log("CCH styling template failed.");
      console.log(e);
    }
  };

  for (const condition in template) {
    if (condition == "tab") {
      for (const tab in template[condition]) {
        let tempCond = template[condition][tab];
        if (!tempCond.length) tempCond = [tempCond];
        tempCond.forEach(templateObj => {
          let tabIndex = parseInt(Object.keys(template[condition]));
          let styleTarget = Object.keys(templateObj);
          let tabTemplate = templateObj[styleTarget];
          let tabElement = tabs[tabIndex];
          if (styleTarget == "icon") {
            tabElement
              .querySelector("ha-icon")
              .setAttribute("icon", templateEval(tabTemplate, entity));
          } else if (styleTarget == "color") {
            tabElement.style.color = templateEval(tabTemplate, entity);
          } else if (styleTarget == "display") {
            templateEval(tabTemplate, entity) == "show"
              ? (tabElement.style.display = "")
              : (tabElement.style.display = "none");
          }
        });
      }
    } else if (condition == "button") {
      for (const button in template[condition]) {
        let tempCond = template[condition][button];
        if (!tempCond.length) tempCond = [tempCond];
        tempCond.forEach(templateObj => {
          let buttonName = Object.keys(template[condition]);
          if (newSidebar && buttonName == "notifications") return;
          let styleTarget = Object.keys(templateObj);
          let buttonElem = buttons[buttonName];
          let tempCond = templateObj[styleTarget];
          let iconTarget = buttonElem.querySelector("paper-icon-button")
            ? buttonElem.querySelector("paper-icon-button")
            : buttonElem.shadowRoot.querySelector("paper-icon-button");
          if (styleTarget == "icon") {
            iconTarget.setAttribute("icon", templateEval(tempCond, entity));
          } else if (styleTarget == "color") {
            iconTarget.shadowRoot.querySelector(
              "iron-icon"
            ).style.color = templateEval(tempCond, entity);
          } else if (styleTarget == "display") {
            templateEval(tempCond, entity) == "show"
              ? (buttonElem.style.display = "")
              : (buttonElem.style.display = "none");
          }
        });
      }
    } else if (condition == "background") {
      header.style.background = templateEval(template[condition], entity);
    }
  }
}

// Get range (e.g., "5 to 9") and build (5,6,7,8,9).
function buildRanges(array) {
  if (!array) array = [];
  const sortNumber = (a, b) => a - b;
  const range = (start, end) =>
    new Array(end - start + 1).fill(undefined).map((_, i) => i + start);

  for (let i = 0; i < array.length; i++) {
    if (array[i].length > 1 && array[i].includes("to")) {
      let split = array[i].split("to");
      array.splice(i, 1);
      array = array.concat(range(parseInt(split[0]), parseInt(split[1])));
    }
  }
  for (let i = 0; i < array.length; i++) array[i] = parseInt(array[i]);
  return array.sort(sortNumber);
}

function showEditor() {
  window.scrollTo(0, 0);
  import("./compact-custom-header-editor.js?v=1.3.0").then(() => {
    document.createElement("compact-custom-header-editor");
  });
  if (!root.querySelector("ha-app-layout").querySelector("editor")) {
    const container = document.createElement("editor");
    const nest = document.createElement("div");
    const loader = document.createElement("div");
    loader.classList.add("lds-ring");
    loader.innerHTML = "<div></div><div></div><div></div><div></div>";
    const cchEditor = document.createElement("compact-custom-header-editor");
    nest.style.cssText = `
      padding: 20px;
      max-width: 600px;
      margin: 15px auto;
      background: var(--paper-card-background-color);
      border: 6px solid var(--paper-card-background-color);
    `;
    container.style.cssText = `
      width: 100%;
      min-height: 100%;
      box-sizing: border-box;
      position: absolute;
      background: var(--background-color, grey);
      z-index: 2;
      padding: 5px;
    `;
    nest.innerHTML += `
      <style>
      .lds-ring {
        left: 50%;
        margin-left: -32px;
        display: inline-block;
        position: relative;
        width: 64px;
        height: 64px;
      }
      .lds-ring div {
        box-sizing: border-box;
        display: block;
        position: absolute;
        width: 51px;
        height: 51px;
        margin: 6px;
        border: 6px solid #fff;
        border-radius: 50%;
        animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        border-color: var(--primary-color) transparent transparent transparent;
      }
      .lds-ring div:nth-child(1) {
        animation-delay: -0.45s;
      }
      .lds-ring div:nth-child(2) {
        animation-delay: -0.3s;
      }
      .lds-ring div:nth-child(3) {
        animation-delay: -0.15s;
      }
      @keyframes lds-ring {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      </style>
      `;
    root.querySelector("ha-app-layout").insertBefore(container, view);
    container.appendChild(nest);
    nest.appendChild(loader);
    nest.appendChild(cchEditor);
  }
}

function reverseObject(object) {
  let newObject = {};
  let keys = [];
  for (let key in object) keys.push(key);
  for (let i = keys.length - 1; i >= 0; i--) {
    let value = object[keys[i]];
    newObject[keys[i]] = value;
  }
  return newObject;
}

function swipeNavigation(tabs, tabContainer) {
  // To make it easier to update lovelace-swipe-navigation
  // keep this as close to the standalone lovelace addon as possible.
  let swipe_amount = cchConfig.swipe_amount || 15;
  let animate = cchConfig.swipe_animate || "none";
  let skip_tabs = cchConfig.swipe_skip
    ? buildRanges(cchConfig.swipe_skip.split(","))
    : [];
  let wrap = cchConfig.swipe_wrap != undefined ? cchConfig.swipe_wrap : true;
  let prevent_default =
    cchConfig.swipe_prevent_default != undefined
      ? cchConfig.swipe_prevent_default
      : false;

  swipe_amount /= Math.pow(10, 2);
  const appLayout = root.querySelector("ha-app-layout");
  let xDown, yDown, xDiff, yDiff, activeTab, firstTab, lastTab, left;

  appLayout.addEventListener("touchstart", handleTouchStart, { passive: true });
  appLayout.addEventListener("touchmove", handleTouchMove, { passive: false });
  appLayout.addEventListener("touchend", handleTouchEnd, { passive: true });

  function handleTouchStart(event) {
    let ignored = ["APP-HEADER", "HA-SLIDER", "SWIPE-CARD", "HUI-MAP-CARD"];
    let path = (event.composedPath && event.composedPath()) || event.path;
    if (path) {
      for (let element of path) {
        if (element.nodeName == "HUI-VIEW") break;
        else if (ignored.indexOf(element.nodeName) > -1) return;
      }
    }
    xDown = event.touches[0].clientX;
    yDown = event.touches[0].clientY;
    if (!lastTab) filterTabs();
    activeTab = tabs.indexOf(tabContainer.querySelector(".iron-selected"));
  }

  function handleTouchMove(event) {
    if (xDown && yDown) {
      xDiff = xDown - event.touches[0].clientX;
      yDiff = yDown - event.touches[0].clientY;
      if (Math.abs(xDiff) > Math.abs(yDiff) && prevent_default) {
        event.preventDefault();
      }
    }
  }

  function handleTouchEnd() {
    if (activeTab < 0 || Math.abs(xDiff) < Math.abs(yDiff)) {
      xDown = yDown = xDiff = yDiff = null;
      return;
    }
    if (xDiff > Math.abs(screen.width * swipe_amount)) {
      left = false;
      activeTab == tabs.length - 1 ? click(firstTab) : click(activeTab + 1);
    } else if (xDiff < -Math.abs(screen.width * swipe_amount)) {
      left = true;
      activeTab == 0 ? click(lastTab) : click(activeTab - 1);
    }
    xDown = yDown = xDiff = yDiff = null;
  }

  function filterTabs() {
    tabs = tabs.filter(element => {
      return (
        !skip_tabs.includes(tabs.indexOf(element)) &&
        getComputedStyle(element, null).display != "none"
      );
    });
    firstTab = wrap ? 0 : null;
    lastTab = wrap ? tabs.length - 1 : null;
  }

  function click(index) {
    if (
      (activeTab == 0 && !wrap && left) ||
      (activeTab == tabs.length - 1 && !wrap && !left)
    ) {
      return;
    }
    if (animate == "swipe") {
      let _in = left ? `${screen.width / 1.5}px` : `-${screen.width / 1.5}px`;
      let _out = left ? `-${screen.width / 1.5}px` : `${screen.width / 1.5}px`;
      view.style.transitionDuration = "200ms";
      view.style.opacity = 0;
      view.style.transform = `translateX(${_in})`;
      view.style.transition = "transform 0.20s, opacity 0.20s";
      setTimeout(function() {
        tabs[index].dispatchEvent(
          new MouseEvent("click", { bubbles: false, cancelable: true })
        );
        view.style.transitionDuration = "0ms";
        view.style.transform = `translateX(${_out})`;
        view.style.transition = "transform 0s";
      }, 210);
      setTimeout(function() {
        view.style.transitionDuration = "200ms";
        view.style.opacity = 1;
        view.style.transform = `translateX(0px)`;
        view.style.transition = "transform 0.20s, opacity 0.20s";
      }, 215);
    } else if (animate == "fade") {
      view.style.transitionDuration = "200ms";
      view.style.transition = "opacity 0.20s";
      view.style.opacity = 0;
      setTimeout(function() {
        tabs[index].dispatchEvent(
          new MouseEvent("click", { bubbles: false, cancelable: true })
        );
        view.style.transitionDuration = "0ms";
        view.style.opacity = 0;
        view.style.transition = "opacity 0s";
      }, 210);
      setTimeout(function() {
        view.style.transitionDuration = "200ms";
        view.style.transition = "opacity 0.20s";
        view.style.opacity = 1;
      }, 250);
    } else if (animate == "flip") {
      view.style.transitionDuration = "200ms";
      view.style.transform = "rotatey(90deg)";
      view.style.transition = "transform 0.20s, opacity 0.20s";
      view.style.opacity = 0.25;
      setTimeout(function() {
        tabs[index].dispatchEvent(
          new MouseEvent("click", { bubbles: false, cancelable: true })
        );
      }, 210);
      setTimeout(function() {
        view.style.transitionDuration = "200ms";
        view.style.transform = "rotatey(0deg)";
        view.style.transition = "transform 0.20s, opacity 0.20s";
        view.style.opacity = 1;
      }, 250);
    } else {
      tabs[index].dispatchEvent(
        new MouseEvent("click", { bubbles: false, cancelable: true })
      );
    }
  }
}

function breakingChangeNotification() {
  if (
    lovelace.config.cch == undefined &&
    JSON.stringify(lovelace.config.views).includes(
      "custom:compact-custom-header"
    )
  ) {
    hass.callService("persistent_notification", "create", {
      title: "CCH Breaking Change",
      notification_id: "CCH_Breaking_Change",
      message:
        "Compact-Custom-Header's configuration method has changed. You are " +
        "receiving this notification because you have updated CCH, but are " +
        "using the old config method. Please, visit the [upgrade guide]" +
        "(https://maykar.github.io/compact-custom-header/1_1_0_upgrade/) " +
        "for more info."
    });
  }
}
