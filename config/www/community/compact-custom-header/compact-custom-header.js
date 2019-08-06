const LitElement = Object.getPrototypeOf(
  customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const hass = document.querySelector("home-assistant").hass;

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

const defaultConfig = {
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
  warning: true,
  compact_header: true
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

const newSidebar = !root.querySelector("hui-notification-drawer");

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
    hideMenuItems();
    styleHeader(tabContainer, tabs, header);
    styleButtons(tabs);
    defaultTab(tabs, tabContainer);
    hideTabs(tabContainer, tabs);
    for (let button in buttons) {
      if (cchConfig[button] == "clock") insertClock(button);
    }
    if (firstRun) {
      sidebarMod();
      conditionalStyling(tabs, header);
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
      if (cond == "user" && conditions[cond].includes(",")) {
        let userList = conditions[cond].split(/[ ,]+/);
        for (let user in userList) {
          if (userVars[cond] == userList[user]) {
            count++;
          }
        }
      } else {
        if (
          userVars[cond] == conditions[cond] ||
          (cond == "query_string" &&
            window.location.search.includes(conditions[cond])) ||
          (cond == "user_agent" && userVars[cond].includes(conditions[cond])) ||
          (cond == "media_query" && window.matchMedia(conditions[cond]).matches)
        ) {
          count++;
        } else {
          return 0;
        }
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
  if (cchConfig.hide_help || cchConfig.hide_config || cchConfig.hide_unused) {
    let menuItems = buttons.options
      .querySelector("paper-listbox")
      .querySelectorAll("paper-item");
    for (let item of menuItems) {
      if (
        (item.innerHTML.includes("Help") ||
          item.getAttribute("aria-label") == "Help") &&
        cchConfig.hide_help
      ) {
        item.parentNode.removeChild(item);
      } else if (
        (item.innerHTML.includes("Unused entities") ||
          item.getAttribute("aria-label") == "Unused entities") &&
        cchConfig.hide_unused
      ) {
        item.parentNode.removeChild(item);
      } else if (
        (item.innerHTML.includes("Configure UI") ||
          item.getAttribute("aria-label") == "Configure UI") &&
        cchConfig.hide_config
      ) {
        item.parentNode.removeChild(item);
      }
    }
  }
}

function insertEditMenu(tabs) {
  if (buttons.options && editMode) {
    if (cchConfig.hide_tabs) {
      let show_tabs = document.createElement("paper-item");
      show_tabs.setAttribute("id", "show_tabs");
      show_tabs.addEventListener("click", () => {
        for (let i = 0; i < tabs.length; i++) {
          tabs[i].style.removeProperty("display");
        }
      });
      show_tabs.innerHTML = "Show all tabs";
      insertMenuItem(buttons.options.querySelector("paper-listbox"), show_tabs);
    }

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
    header.style.background =
      cchConfig.background ||
      getComputedStyle(document.body).getPropertyValue("--cch-background") ||
      "var(--primary-color)";
    header.querySelector("app-toolbar").style.background = "transparent";
  }

  if (newSidebar && cchConfig.compact_header) {
    let sidebar = main.shadowRoot.querySelector("ha-sidebar").shadowRoot;
    sidebar.querySelector(".menu").style = "height:49px;";
    sidebar.querySelector("paper-listbox").style = "height:calc(100% - 180px);";
  }
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
    root.querySelector("app-toolbar").style.marginTop = cchConfig.compact_header
      ? "-64px"
      : "";

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
  let topMargin =
    tabs.length > 0 && cchConfig.compact_header ? "margin-top:111px;" : "";
  buttons = reverseObject(buttons);
  if (
    newSidebar &&
    cchConfig.menu != "hide" &&
    !buttons.menu.shadowRoot.querySelector('[id="cch_dot"]')
  ) {
    let style = document.createElement("style");
    style.setAttribute("id", "cch_dot");
    let indicator =
      cchConfig.notify_indicator_color ||
      getComputedStyle(header).getPropertyValue("--cch-tab-indicator-color") ||
      "";
    let border = getComputedStyle(header)
      .getPropertyValue("background")
      .includes("url")
      ? "border-color: transparent !important"
      : `border-color: ${getComputedStyle(header).getPropertyValue(
          "background-color"
        )} !important;`;
    style.innerHTML = `
        .dot {
          ${topMargin}
          z-index: 2;
          ${indicator ? `background: ${indicator} !important` : ""}
          ${border}
        }
    `;
    buttons.menu.shadowRoot.appendChild(style);
  }
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
    if (isNaN(default_tab)) {
      let views = lovelace.config.views;
      for (let view in views) {
        if (
          views[view]["title"] == default_tab ||
          views[view]["path"] == default_tab
        ) {
          default_tab = view;
        }
      }
    }
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
    buttons.menu.style.marginTop = cchConfig.compact_header ? "111px" : "";
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
    } else if (conditional_styles) {
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
            if (isNaN(key)) {
              let views = lovelace.config.views;
              for (let view in views) {
                if (views[view]["title"] == key || views[view]["path"] == key) {
                  styling[i][obj][view] = styling[i][obj][key];
                  delete styling[i][obj][key];
                  key = view;
                }
              }
            }
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
          let tabIndex = Object.keys(template[condition]);
          let views = lovelace.config.views;
          if (isNaN(tabIndex)) {
            for (let view in views) {
              if (
                views[view]["title"] == tabIndex ||
                views[view]["path"] == tabIndex
              ) {
                tabIndex = view;
              }
            }
          } else {
            tabIndex = parseInt(tabIndex);
          }
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
  let ranges = [];
  if (!array) return [];
  const sortNumber = (a, b) => a - b;
  const range = (start, end) =>
    new Array(end - start + 1).fill(undefined).map((_, i) => i + start);
  for (let i in array) {
    if (typeof array[i] == "string" && array[i].includes("to")) {
      let split = array[i].split("to");
      if (parseInt(split[1]) > parseInt(split[0])) {
        ranges.push(range(parseInt(split[0]), parseInt(split[1])));
      } else {
        ranges.push(range(parseInt(split[1]), parseInt(split[0])));
      }
    } else if (isNaN(array[i])) {
      let views = lovelace.config.views;
      for (let view in views) {
        if (
          views[view]["title"] == array[i] ||
          views[view]["path"] == array[i]
        ) {
          ranges.push(parseInt(view));
        }
      }
    } else {
      ranges.push(parseInt(array[i]));
    }
  }
  return ranges.flat().sort(sortNumber);
}

function showEditor() {
  window.scrollTo(0, 0);
  if (!root.querySelector("ha-app-layout").querySelector("editor")) {
    const container = document.createElement("editor");
    const nest = document.createElement("div");
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
    root.querySelector("ha-app-layout").insertBefore(container, view);
    container.appendChild(nest);
    nest.appendChild(document.createElement("compact-custom-header-editor"));
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

// EDITOR //////////////////////////////////////////////////////////////////

const buttonOptions = ["show", "hide", "clock", "overflow"];
const overflowOptions = ["show", "hide", "clock"];
const swipeAnimation = ["none", "swipe", "fade", "flip"];
let _lovelace;

class CompactCustomHeaderEditor extends LitElement {
  static get properties() {
    return {
      _config: {}
    };
  }

  firstUpdated() {
    let ll = document.querySelector("home-assistant");
    ll = ll && ll.shadowRoot;
    ll = ll && ll.querySelector("home-assistant-main");
    ll = ll && ll.shadowRoot;
    ll = ll && ll.querySelector("app-drawer-layout partial-panel-resolver");
    ll = (ll && ll.shadowRoot) || ll;
    ll = ll && ll.querySelector("ha-panel-lovelace");
    ll = ll && ll.shadowRoot;
    _lovelace = ll && ll.querySelector("hui-root").lovelace;

    this._config = _lovelace.config.cch ? deepcopy(_lovelace.config.cch) : {};
  }

  render() {
    if (!this._config || !_lovelace) return html``;
    return html`
      <div @click="${this._close}" class="title_control">
        X
      </div>
      ${this.renderStyle()}
      <cch-config-editor
        .defaultConfig="${defaultConfig}"
        .config="${this._config}"
        @cch-config-changed="${this._configChanged}"
      >
      </cch-config-editor>
      <h4 class="underline">Exceptions</h4>
      <br />
      ${this._config.exceptions
        ? this._config.exceptions.map((exception, index) => {
            return html`
              <cch-exception-editor
                .config="${this._config}"
                .exception="${exception}"
                .index="${index}"
                @cch-exception-changed="${this._exceptionChanged}"
                @cch-exception-delete="${this._exceptionDelete}"
              >
              </cch-exception-editor>
            `;
          })
        : ""}
      <br />
      ${this._mwc_button
        ? html`
            <mwc-button @click="${this._addException}"
              >Add Exception
            </mwc-button>
          `
        : html`
            <paper-button @click="${this._addException}"
              >Add Exception
            </paper-button>
          `}

      <h4 class="underline">Current User</h4>
      <p style="font-size:16pt">${hass.user.name}</p>
      <h4 class="underline">Current User Agent</h4>
      <br />
      ${navigator.userAgent}
      <br />
      <h4
        style="background:var(--paper-card-background-color);
      margin-bottom:-20px;"
        class="underline"
      >
        ${!this.exception
          ? html`
              ${this._save_button}
            `
          : ""}
        ${!this.exception
          ? html`
              ${this._cancel_button}
            `
          : ""}
      </h4>
    `;
  }

  get _mwc_button() {
    return customElements.get("mwc-button") ? true : false;
  }

  _close() {
    let editor = this.parentNode.parentNode.parentNode.querySelector("editor");
    this.parentNode.parentNode.parentNode.removeChild(editor);
  }

  _save() {
    for (var key in this._config) {
      if (this._config[key] == defaultConfig[key]) {
        delete this._config[key];
      }
    }
    let newConfig = {
      ..._lovelace.config,
      ...{ cch: this._config }
    };
    try {
      _lovelace.saveConfig(newConfig).then(() => {
        location.reload(true);
      });
    } catch (e) {
      alert("Save failed: " + e);
    }
  }

  get _save_button() {
    return this._mwc_button
      ? html`
          <mwc-button raised @click="${this._save}">Save and Reload</mwc-button>
        `
      : html`
          <paper-button raised @click="${this._save}"
            >Save and Reload</paper-button
          >
        `;
  }
  get _cancel_button() {
    return this._mwc_button
      ? html`
          <mwc-button raised @click="${this._close}">Cancel</mwc-button>
        `
      : html`
          <paper-button raised @click="${this._close}">Cancel</paper-button>
        `;
  }

  _addException() {
    let newExceptions;
    if (this._config.exceptions) {
      newExceptions = this._config.exceptions.slice(0);
      newExceptions.push({
        conditions: {},
        config: {}
      });
    } else {
      newExceptions = [
        {
          conditions: {},
          config: {}
        }
      ];
    }
    this._config = {
      ...this._config,
      exceptions: newExceptions
    };

    fireEvent(this, "config-changed", {
      config: this._config
    });
  }

  _configChanged(ev) {
    if (!this._config) {
      return;
    }
    this._config = {
      ...this._config,
      ...ev.detail.config
    };
    fireEvent(this, "config-changed", {
      config: this._config
    });
  }

  _exceptionChanged(ev) {
    if (!this._config) {
      return;
    }
    const target = ev.target.index;
    const newExceptions = this._config.exceptions.slice(0);
    newExceptions[target] = ev.detail.exception;
    this._config = {
      ...this._config,
      exceptions: newExceptions
    };

    fireEvent(this, "config-changed", {
      config: this._config
    });
  }

  _exceptionDelete(ev) {
    if (!this._config) {
      return;
    }
    const target = ev.target;
    const newExceptions = this._config.exceptions.slice(0);
    newExceptions.splice(target.index, 1);
    this._config = {
      ...this._config,
      exceptions: newExceptions
    };

    fireEvent(this, "config-changed", {
      config: this._config
    });
    this.requestUpdate();
  }

  renderStyle() {
    return html`
      <style>
        h3,
        h4 {
          font-size: 16pt;
          margin-bottom: 5px;
          width: 100%;
        }
        paper-button {
          margin: 0;
          background-color: var(--primary-color);
          color: var(--text-primary-color, #fff);
        }
        .toggle-button {
          margin: 4px;
          background-color: transparent;
          color: var(--primary-color);
        }
        .title_control {
          color: var(--text-dark-color);
          font-weight: bold;
          font-size: 22px;
          float: right;
          cursor: pointer;
          margin: -10px -5px -5px -5px;
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
        .underline {
          width: 100%;
          background: var(--dark-color);
          color: var(--text-dark-color);
          padding: 5px;
          width: calc(100% + 30px);
          margin-left: calc(0% - 20px);
        }
      </style>
    `;
  }
}

customElements.define(
  "compact-custom-header-editor",
  CompactCustomHeaderEditor
);

class CchConfigEditor extends LitElement {
  static get properties() {
    return {
      defaultConfig: {},
      config: {},
      exception: {},
      _closed: {}
    };
  }

  get _clock() {
    return (
      this.getConfig("menu") == "clock" ||
      this.getConfig("voice") == "clock" ||
      this.getConfig("notifications") == "clock" ||
      this.getConfig("options") == "clock"
    );
  }

  getConfig(item) {
    return this.config[item] !== undefined
      ? this.config[item]
      : this.defaultConfig[item];
  }

  render() {
    this.exception = this.exception !== undefined && this.exception !== false;
    return html`
      <custom-style>
        <style is="custom-style">
          a {
            color: var(--text-dark-color);
            text-decoration: none;
          }
          .card-header {
            margin-top: -5px;
            @apply --paper-font-headline;
          }
          .card-header paper-icon-button {
            margin-top: -5px;
            float: right;
          }
        </style>
      </custom-style>
      ${!this.exception
        ? html`
            <h1 style="margin-top:-20px;margin-bottom:0;" class="underline">
              Compact Custom Header
            </h1>
            <h4
              style="margin-top:-5px;padding-top:10px;font-size:12pt;"
              class="underline"
            >
              <a
                href="https://maykar.github.io/compact-custom-header/"
                target="_blank"
              >
                <ha-icon icon="mdi:help-circle" style="margin-top:-5px;">
                </ha-icon>
                Docs&nbsp;&nbsp;&nbsp;</a
              >
              <a
                href="https://github.com/maykar/compact-custom-header"
                target="_blank"
              >
                <ha-icon icon="mdi:github-circle" style="margin-top:-5px;">
                </ha-icon>
                Github&nbsp;&nbsp;&nbsp;</a
              >
              <a
                href="https://community.home-assistant.io/t/compact-custom-header"
                target="_blank"
              >
                <ha-icon icon="hass:home-assistant" style="margin-top:-5px;">
                </ha-icon>
                Forums</a
              >
            </h4>
            ${this.getConfig("warning")
              ? html`
                  <br />
                  <div class="warning">
                    Modifying options marked with a
                    <iron-icon
                      icon="hass:alert"
                      style="width:20px;margin-top:-6px;"
                    ></iron-icon
                    >or hiding the options button will remove your ability to
                    edit from the UI. You can disable CCH by adding
                    "?disable_cch" to the end of your URL to temporarily restore
                    the default header.
                  </div>
                  <br />
                `
              : ""}
          `
        : ""}
      ${this.renderStyle()}
      <div class="side-by-side">
        <paper-toggle-button
          class="${this.exception && this.config.disable === undefined
            ? "inherited"
            : ""}"
          ?checked="${this.getConfig("disable") !== false}"
          .configValue="${"disable"}"
          @change="${this._valueChanged}"
          title="Completely disable CCH. Useful for exceptions."
        >
          Disable CCH
        </paper-toggle-button>
        <paper-toggle-button
          class="${this.exception && this.config.compact_header === undefined
            ? "inherited"
            : ""}"
          ?checked="${this.getConfig("compact_header") !== false}"
          .configValue="${"compact_header"}"
          @change="${this._valueChanged}"
          title="Make header compact."
        >
          Compact Header
        </paper-toggle-button>
        <paper-toggle-button
          class="${this.exception && this.config.kiosk_mode === undefined
            ? "inherited"
            : ""}"
          ?checked="${this.getConfig("kiosk_mode") !== false}"
          .configValue="${"kiosk_mode"}"
          @change="${this._valueChanged}"
          title="Hide the header, close the sidebar, and disable sidebar swipe."
        >
          Kiosk Mode
          ${this.getConfig("warning")
            ? html`
                <iron-icon icon="hass:alert" class="alert"></iron-icon>
              `
            : ""}
        </paper-toggle-button>
        <paper-toggle-button
          class="${this.exception && this.config.header === undefined
            ? "inherited"
            : ""}"
          ?checked="${this.getConfig("header") !== false &&
            this.getConfig("kiosk_mode") == false}"
          .configValue="${"header"}"
          @change="${this._valueChanged}"
          title="Turn off to hide the header completely."
        >
          Display Header
          ${this.getConfig("warning")
            ? html`
                <iron-icon icon="hass:alert" class="alert"></iron-icon>
              `
            : ""}
        </paper-toggle-button>
        <paper-toggle-button
          class="${this.exception && this.config.chevrons === undefined
            ? "inherited"
            : ""}"
          ?checked="${this.getConfig("chevrons") !== false}"
          .configValue="${"chevrons"}"
          @change="${this._valueChanged}"
          title="View scrolling controls in header."
        >
          Display Tab Chevrons
        </paper-toggle-button>
        <paper-toggle-button
          class="${this.exception && this.config.redirect === undefined
            ? "inherited"
            : ""}"
          ?checked="${this.getConfig("redirect") !== false}"
          .configValue="${"redirect"}"
          @change="${this._valueChanged}"
          title="Auto-redirect away from hidden tabs."
        >
          Hidden Tab Redirect
        </paper-toggle-button>
        <paper-toggle-button
          style="${newSidebar ? "" : "display:none;"}"
          class="${this.exception && this.config.disable_sidebar === undefined
            ? "inherited"
            : ""}"
          ?checked="${this.getConfig("disable_sidebar") !== false ||
            this.getConfig("kiosk_mode") !== false}"
          .configValue="${"disable_sidebar"}"
          @change="${this._valueChanged}"
          title="Hides and prevents sidebar from opening."
        >
          Hide & Disable Sidebar
        </paper-toggle-button>
        <paper-toggle-button
          style="${newSidebar ? "display:none;" : ""}"
          class="${this.exception && this.config.sidebar_closed === undefined
            ? "inherited"
            : ""}"
          ?checked="${this.getConfig("sidebar_closed") !== false ||
            this.getConfig("kiosk_mode") !== false}"
          .configValue="${"sidebar_closed"}"
          @change="${this._valueChanged}"
          title="Closes the sidebar on opening editor_lovelace."
        >
          Close Sidebar
        </paper-toggle-button>
        ${!this.exception
          ? html`
              <paper-toggle-button
                class="${this.exception && this.config.warning === undefined
                  ? "inherited"
                  : ""}"
                ?checked="${this.getConfig("warning") !== false}"
                .configValue="${"warning"}"
                @change="${this._valueChanged}"
                title="Toggle warnings in this editor."
              >
                Display CCH Warnings
              </paper-toggle-button>
            `
          : ""}
        <paper-toggle-button
          style="${newSidebar ? "display:none;" : ""}"
          class="${this.exception && this.config.sidebar_swipe === undefined
            ? "inherited"
            : ""}"
          ?checked="${this.getConfig("sidebar_swipe") !== false &&
            this.getConfig("kiosk_mode") == false}"
          .configValue="${"sidebar_swipe"}"
          @change="${this._valueChanged}"
          title="Swipe to open sidebar on mobile devices."
        >
          Swipe Open Sidebar
        </paper-toggle-button>
      </div>
      <h4 class="underline">Menu Items</h4>
      <div class="side-by-side">
        <paper-toggle-button
          class="${this.exception && this.config.hide_config === undefined
            ? "inherited"
            : ""}"
          ?checked="${this.getConfig("hide_config") !== false}"
          .configValue="${"hide_config"}"
          @change="${this._valueChanged}"
          title='Hide "Configure UI" in options menu.'
        >
          Hide "Configure UI"
          ${this.getConfig("warning")
            ? html`
                <iron-icon icon="hass:alert" class="alert"></iron-icon>
              `
            : ""}
        </paper-toggle-button>
        <paper-toggle-button
          class="${this.exception && this.config.hide_help === undefined
            ? "inherited"
            : ""}"
          ?checked="${this.getConfig("hide_help") !== false}"
          .configValue="${"hide_help"}"
          @change="${this._valueChanged}"
          title='Hide "Help" in options menu.'
        >
          Hide "Help"
        </paper-toggle-button>
        <paper-toggle-button
          class="${this.exception && this.config.hide_unused === undefined
            ? "inherited"
            : ""}"
          ?checked="${this.getConfig("hide_unused") !== false}"
          .configValue="${"hide_unused"}"
          @change="${this._valueChanged}"
          title='Hide "Help" in options menu.'
        >
          Hide "Unused Entities"
        </paper-toggle-button>
      </div>
      <h4 class="underline">Buttons</h4>
      <div class="buttons side-by-side">
        <div
          class="${this.exception && this.config.menu === undefined
            ? "inherited"
            : ""}"
        >
          <iron-icon icon="hass:menu"></iron-icon>
          <paper-dropdown-menu
            @value-changed="${this._valueChanged}"
            label="Menu Button:"
            .configValue="${"menu"}"
          >
            <paper-listbox
              slot="dropdown-content"
              .selected="${buttonOptions.indexOf(this.getConfig("menu"))}"
            >
              ${buttonOptions.map(option => {
                return html`
                  <paper-item>${option}</paper-item>
                `;
              })}
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
        <div
          class="${this.exception && this.config.voice === undefined
            ? "inherited"
            : ""}"
        >
          <iron-icon icon="hass:microphone"></iron-icon>
          <paper-dropdown-menu
            @value-changed="${this._valueChanged}"
            label="Voice Button:"
            .configValue="${"voice"}"
          >
            <paper-listbox
              slot="dropdown-content"
              .selected="${buttonOptions.indexOf(this.getConfig("voice"))}"
            >
              ${buttonOptions.map(option => {
                return html`
                  <paper-item>${option}</paper-item>
                `;
              })}
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
      </div>
      <div
        class="buttons side-by-side"
        style="${newSidebar ? "width:50%;" : ""}"
      >
        <div
          class="${this.exception && this.config.options === undefined
            ? "inherited"
            : ""}"
        >
          <iron-icon icon="hass:dots-vertical"></iron-icon>
          <paper-dropdown-menu
            @value-changed="${this._valueChanged}"
            label="Options Button:"
            .configValue="${"options"}"
          >
            <paper-listbox
              slot="dropdown-content"
              .selected="${overflowOptions.indexOf(this.getConfig("options"))}"
            >
              ${overflowOptions.map(option => {
                return html`
                  <paper-item>${option}</paper-item>
                `;
              })}
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
        <div
          style="${newSidebar ? "display:none;" : ""}"
          class="${this.exception && this.config.notifications === undefined
            ? "inherited"
            : ""}"
        >
          <iron-icon icon="hass:bell"></iron-icon>
          <paper-dropdown-menu
            @value-changed="${this._valueChanged}"
            label="Notifications Button:"
            .configValue="${"notifications"}"
          >
            <paper-listbox
              slot="dropdown-content"
              .selected="${buttonOptions.indexOf(
                this.getConfig("notifications")
              )}"
            >
              ${buttonOptions.map(option => {
                return html`
                  <paper-item>${option}</paper-item>
                `;
              })}
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
      </div>
      ${this._clock
        ? html`
            <h4 class="underline">Clock Options</h4>
            <div class="side-by-side">
              <paper-dropdown-menu
                class="${this.exception &&
                this.getConfig("clock_format") === undefined
                  ? "inherited"
                  : ""}"
                label="Clock format"
                @value-changed="${this._valueChanged}"
                .configValue="${"clock_format"}"
              >
                <paper-listbox
                  slot="dropdown-content"
                  .selected="${this.getConfig("clock_format") === "24" ? 1 : 0}"
                >
                  <paper-item>12</paper-item>
                  <paper-item>24</paper-item>
                </paper-listbox>
              </paper-dropdown-menu>
              <paper-input
                class="${this.exception && this.config.date_locale === undefined
                  ? "inherited"
                  : ""}"
                label="Date Locale:"
                .value="${this.getConfig("date_locale")}"
                .configValue="${"date_locale"}"
                @value-changed="${this._valueChanged}"
              >
              </paper-input>

              <div class="side-by-side">
                <paper-toggle-button
                  class="${this.exception &&
                  this.config.clock_am_pm === undefined
                    ? "inherited"
                    : ""}"
                  ?checked="${this.getConfig("clock_am_pm") !== false}"
                  .configValue="${"clock_am_pm"}"
                  @change="${this._valueChanged}"
                >
                  AM / PM</paper-toggle-button
                >
                <paper-toggle-button
                  class="${this.exception &&
                  this.config.clock_date === undefined
                    ? "inherited"
                    : ""}"
                  ?checked="${this.getConfig("clock_date") !== false}"
                  .configValue="${"clock_date"}"
                  @change="${this._valueChanged}"
                >
                  Date</paper-toggle-button
                >
              </div>
            </div>
          `
        : ""}
      <h4 class="underline">Tabs</h4>
      <paper-dropdown-menu id="tabs" @value-changed="${this._tabVisibility}">
        <paper-listbox
          slot="dropdown-content"
          .selected="${this.getConfig("show_tabs").length > 0 ? "1" : "0"}"
        >
          <paper-item>Hide Tabs</paper-item>
          <paper-item>Show Tabs</paper-item>
        </paper-listbox>
      </paper-dropdown-menu>
      <div class="side-by-side">
        <div
          id="show"
          style="display:${this.getConfig("show_tabs").length > 0
            ? "initial"
            : "none"}"
        >
          <paper-input
            class="${this.exception && this.config.show_tabs === undefined
              ? "inherited"
              : ""}"
            label="Comma-separated list of tab numbers to show:"
            .value="${this.getConfig("show_tabs")}"
            .configValue="${"show_tabs"}"
            @value-changed="${this._valueChanged}"
          >
          </paper-input>
        </div>
        <div
          id="hide"
          style="display:${this.getConfig("show_tabs").length > 0
            ? "none"
            : "initial"}"
        >
          <paper-input
            class="${this.exception && this.config.hide_tabs === undefined
              ? "inherited"
              : ""}"
            label="Comma-separated list of tab numbers to hide:"
            .value="${this.getConfig("hide_tabs")}"
            .configValue="${"hide_tabs"}"
            @value-changed="${this._valueChanged}"
          >
          </paper-input>
        </div>
        <paper-input
          class="${this.exception && this.config.default_tab === undefined
            ? "inherited"
            : ""}"
          label="Default tab:"
          .value="${this.getConfig("default_tab")}"
          .configValue="${"default_tab"}"
          @value-changed="${this._valueChanged}"
        >
        </paper-input>
      </div>
      <h4 class="underline">Swipe Navigation</h4>
      <div class="side-by-side">
        <paper-toggle-button
          class="${this.exception && this.config.swipe === undefined
            ? "inherited"
            : ""}"
          ?checked="${this.getConfig("swipe") !== false}"
          .configValue="${"swipe"}"
          @change="${this._valueChanged}"
          title="Toggle Swipe Navigation"
        >
          Swipe Navigation
        </paper-toggle-button>
        ${this.config.swipe
          ? html`
        <paper-toggle-button
          class="${
            this.exception && this.config.swipe_wrap === undefined
              ? "inherited"
              : ""
          }"
          ?checked="${this.getConfig("swipe_wrap") !== false}"
          .configValue="${"swipe_wrap"}"
          @change="${this._valueChanged}"
          title="Wrap from first to last tab and vice versa."
        >
          Wrapping
        </paper-toggle-button>
        <paper-toggle-button
          class="${
            this.exception && this.config.swipe_prevent_default === undefined
              ? "inherited"
              : ""
          }"
          ?checked="${this.getConfig("swipe_prevent_default") !== false}"
          .configValue="${"swipe_prevent_default"}"
          @change="${this._valueChanged}"
          title="Prevent browsers default horizontal swipe action."
        >
          Prevent Default
        </paper-toggle-button>
        <div
        class="${
          this.exception && this.config.swipe_animate === undefined
            ? "inherited"
            : ""
        }"
      >
      </div>
      <div class="side-by-side">
        <paper-dropdown-menu
          @value-changed="${this._valueChanged}"
          label="Swipe Animation:"
          .configValue="${"swipe_animate"}"
        >
          <paper-listbox
            slot="dropdown-content"
            .selected="${swipeAnimation.indexOf(
              this.getConfig("swipe_animate")
            )}"
          >
            ${swipeAnimation.map(option => {
              return html`
                <paper-item>${option}</paper-item>
              `;
            })}
          </paper-listbox>
        </paper-dropdown-menu>
      </div>
      <paper-input
      class="${
        this.exception && this.config.swipe_amount === undefined
          ? "inherited"
          : ""
      }"
      label="Percentage of screen width needed for swipe:"
      .value="${this.getConfig("swipe_amount")}"
      .configValue="${"swipe_amount"}"
      @value-changed="${this._valueChanged}"
    >
    </paper-input>
        </div>
        <paper-input
        class="${
          this.exception && this.config.swipe_skip === undefined
            ? "inherited"
            : ""
        }"
        label="Comma-separated list of tabs to skip over on swipe:"
        .value="${this.getConfig("swipe_skip")}"
        .configValue="${"swipe_skip"}"
        @value-changed="${this._valueChanged}"
      >
      </paper-input>
      </div>
    `
          : ""}
      </div>
    `;
  }

  _toggleCard() {
    this._closed = !this._closed;
    fireEvent(this, "iron-resize");
  }

  _tabVisibility() {
    let show = this.shadowRoot.querySelector('[id="show"]');
    let hide = this.shadowRoot.querySelector('[id="hide"]');
    if (this.shadowRoot.querySelector('[id="tabs"]').value == "Hide Tabs") {
      show.style.display = "none";
      hide.style.display = "initial";
    } else {
      hide.style.display = "none";
      show.style.display = "initial";
    }
  }

  _valueChanged(ev) {
    if (!this.config) {
      return;
    }
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === "") {
        delete this.config[target.configValue];
      } else {
        this.config = {
          ...this.config,
          [target.configValue]:
            target.checked !== undefined ? target.checked : target.value
        };
      }
    }
    fireEvent(this, "cch-config-changed", {
      config: this.config
    });
  }

  renderStyle() {
    return html`
      <style>
        h3,
        h4 {
          font-size: 16pt;
          margin-bottom: 5px;
          width: 100%;
        }
        paper-toggle-button {
          padding-top: 16px;
        }
        iron-icon {
          padding-right: 5px;
        }
        iron-input {
          max-width: 115px;
        }
        .inherited {
          opacity: 0.4;
        }
        .inherited:hover {
          opacity: 1;
        }
        .side-by-side {
          display: flex;
          flex-wrap: wrap;
        }
        .side-by-side > * {
          flex: 1;
          padding-right: 4px;
          flex-basis: 33%;
        }
        .buttons > div {
          display: flex;
          align-items: center;
        }
        .buttons > div paper-dropdown-menu {
          flex-grow: 1;
        }
        .buttons > div iron-icon {
          padding-right: 15px;
          padding-top: 20px;
          margin-left: -3px;
        }
        .buttons > div:nth-of-type(2n) iron-icon {
          padding-left: 20px;
        }
        .warning {
          background-color: #455a64;
          padding: 10px;
          color: #ffcd4c;
          border-radius: 5px;
        }
        .alert {
          color: #ffcd4c;
          width: 20px;
          margin-top: -6px;
        }
        [closed] {
          overflow: hidden;
          height: 52px;
        }
        paper-card {
          margin-top: 10px;
          width: 100%;
          transition: all 0.5s ease;
        }
        .underline {
          width: 100%;
          background: var(--dark-color);
          color: var(--text-dark-color);
          padding: 5px;
          width: calc(100% + 30px);
          margin-left: calc(0% - 20px);
        }
      </style>
    `;
  }
}

customElements.define("cch-config-editor", CchConfigEditor);

class CchExceptionEditor extends LitElement {
  static get properties() {
    return {
      config: {},
      exception: {},
      _closed: {}
    };
  }

  constructor() {
    super();
    this._closed = true;
  }

  render() {
    if (!this.exception) {
      return html``;
    }
    return html`
      ${this.renderStyle()}
      <custom-style>
        <style is="custom-style">
          .card-header {
            margin-top: -5px;
            @apply --paper-font-headline;
          }
          .card-header paper-icon-button {
            margin-top: -5px;
            float: right;
          }
        </style>
      </custom-style>
      <paper-card ?closed=${this._closed}>
        <div class="card-content">
          <div class="card-header">
            ${Object.values(this.exception.conditions)
              .join(", ")
              .substring(0, 40) || "New Exception"}
            <paper-icon-button
              icon="${this._closed ? "mdi:chevron-down" : "mdi:chevron-up"}"
              @click="${this._toggleCard}"
            >
            </paper-icon-button>
            <paper-icon-button
              ?hidden=${this._closed}
              icon="mdi:delete"
              @click="${this._deleteException}"
            >
            </paper-icon-button>
          </div>
          <h4 class="underline">Conditions</h4>
          <cch-conditions-editor
            .conditions="${this.exception.conditions}"
            @cch-conditions-changed="${this._conditionsChanged}"
          >
          </cch-conditions-editor>
          <h4 class="underline">Config</h4>
          <cch-config-editor
            exception
            .defaultConfig="${{ ...defaultConfig, ...this.config }}"
            .config="${this.exception.config}"
            @cch-config-changed="${this._configChanged}"
          >
          </cch-config-editor>
        </div>
      </paper-card>
    `;
  }

  renderStyle() {
    return html`
      <style>
        h3,
        h4 {
          font-size: 16pt;
          margin-bottom: 5px;
          width: 100%;
        }
        [closed] {
          overflow: hidden;
          height: 52px;
        }
        paper-card {
          margin-top: 10px;
          width: 100%;
          transition: all 0.5s ease;
        }
        .underline {
          width: 100%;
          background: var(--dark-color);
          color: var(--text-dark-color);
          padding: 5px;
          width: calc(100% + 30px);
          margin-left: calc(0% - 20px);
        }
      </style>
    `;
  }

  _toggleCard() {
    this._closed = !this._closed;
    fireEvent(this, "iron-resize");
  }

  _deleteException() {
    fireEvent(this, "cch-exception-delete");
  }

  _conditionsChanged(ev) {
    if (!this.exception) {
      return;
    }
    const newException = {
      ...this.exception,
      conditions: ev.detail.conditions
    };
    fireEvent(this, "cch-exception-changed", {
      exception: newException
    });
  }

  _configChanged(ev) {
    ev.stopPropagation();
    if (!this.exception) {
      return;
    }
    const newException = { ...this.exception, config: ev.detail.config };
    fireEvent(this, "cch-exception-changed", {
      exception: newException
    });
  }
}

customElements.define("cch-exception-editor", CchExceptionEditor);

class CchConditionsEditor extends LitElement {
  static get properties() {
    return {
      conditions: {}
    };
  }

  get _user() {
    return this.conditions.user || "";
  }

  get _user_agent() {
    return this.conditions.user_agent || "";
  }

  get _media_query() {
    return this.conditions.media_query || "";
  }

  get _query_string() {
    return this.conditions.query_string || "";
  }

  render() {
    if (!this.conditions) {
      return html``;
    }
    return html`
      <paper-input
        label="User (Seperate multiple users with a comma.)"
        .value="${this._user}"
        .configValue="${"user"}"
        @value-changed="${this._valueChanged}"
      >
      </paper-input>
      <paper-input
        label="User Agent"
        .value="${this._user_agent}"
        .configValue="${"user_agent"}"
        @value-changed="${this._valueChanged}"
      >
      </paper-input>
      <paper-input
        label="Media Query"
        .value="${this._media_query}"
        .configValue="${"media_query"}"
        @value-changed="${this._valueChanged}"
      >
      </paper-input>
      <paper-input
        label="Query String"
        .value="${this._query_string}"
        .configValue="${"query_string"}"
        @value-changed="${this._valueChanged}"
      >
      </paper-input>
    `;
  }

  _valueChanged(ev) {
    if (!this.conditions) {
      return;
    }
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === "") {
        delete this.conditions[target.configValue];
      } else {
        this.conditions = {
          ...this.conditions,
          [target.configValue]: target.value
        };
      }
    }
    fireEvent(this, "cch-conditions-changed", {
      conditions: this.conditions
    });
  }
}

customElements.define("cch-conditions-editor", CchConditionsEditor);

function deepcopy(value) {
  if (!(!!value && typeof value == "object")) {
    return value;
  }
  if (Object.prototype.toString.call(value) == "[object Date]") {
    return new Date(value.getTime());
  }
  if (Array.isArray(value)) {
    return value.map(deepcopy);
  }
  var result = {};
  Object.keys(value).forEach(function(key) {
    result[key] = deepcopy(value[key]);
  });
  return result;
}

console.info(
  `%c COMPACT-CUSTOM-HEADER \n%c     Version 1.3.5     `,
  "color: orange; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: dimgray"
);
