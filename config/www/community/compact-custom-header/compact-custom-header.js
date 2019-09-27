console.info(
  `%c COMPACT-CUSTOM-HEADER \n%c     Version 1.4.0     `,
  "color: orange; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: dimgray"
);

const LitElement = Object.getPrototypeOf(
  customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const hass = document.querySelector("home-assistant").hass;

const fireEvent = (node, type, detail, options = {}) => {
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
  edit_mode_show_tabs: false,
  default_tab: "",
  default_tab_template: "",
  kiosk_mode: false,
  sidebar_swipe: true,
  sidebar_closed: false,
  disable_sidebar: false,
  hide_help: false,
  hide_config: false,
  hide_unused: false,
  tab_color: {},
  button_color: {},
  statusbar_color: "",
  swipe: false,
  swipe_amount: "15",
  swipe_animate: "none",
  swipe_skip: "",
  swipe_wrap: true,
  swipe_prevent_default: false,
  swipe_skip_hidden: true,
  warning: true,
  compact_header: true,
  view_css: "",
  time_css: "",
  date_css: "",
  header_css: "",
  tab_css: {},
  button_css: {}
};

let root = document.querySelector("home-assistant");
root = root && root.shadowRoot;
root = root && root.querySelector("home-assistant-main");
const main = root;
root = root && root.shadowRoot;
root = root && root.querySelector("app-drawer-layout partial-panel-resolver");
const panelResolver = root;
root = (root && root.shadowRoot) || root;
root = root && root.querySelector("ha-panel-lovelace");
root = root && root.shadowRoot;
root = root && root.querySelector("hui-root");
const lovelace = root.lovelace;
root = root.shadowRoot;

const frontendVersion = Number(window.frontendVersion);
const newSidebar = frontendVersion >= 20190710;
const header = root.querySelector("app-header");
let cchConfig = buildConfig(lovelace.config.cch || {});
const view = root.querySelector("ha-app-layout").querySelector("#view");
const disabled =
  window.location.href.includes("disable_cch") || cchConfig.disable;

let sidebarClosed = false;
let editMode = header.className == "edit-mode";
let firstRun = true;
let buttons = {};
let prevColor = {};

run();
breakingChangeNotification();

function run() {
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
  if (!disabled) {
    insertEditMenu(tabs);
    hideMenuItems();
    styleHeader(tabContainer, tabs, header);
    styleButtons(tabs, tabContainer);
    if (firstRun) {
      sidebarMod();
      conditionalStyling(tabs, header);
    }
    hideTabs(tabContainer, tabs);
    for (let button in buttons) {
      if (cchConfig[button] == "clock") insertClock(button);
    }
    if (!editMode) tabContainerMargin(tabContainer);
    if (cchConfig.swipe) swipeNavigation(tabs, tabContainer);
  }
  if (firstRun) {
    observers(tabContainer, tabs, header);
    defaultTab(tabs, tabContainer);
  }
  firstRun = false;
  fireEvent(header, "iron-resize");
}

function buildConfig(config) {
  let exceptionConfig = {};
  let highestMatch = 0;
  // Count number of matching conditions and choose config with most matches.
  if (config.exceptions) {
    config.exceptions.forEach(exception => {
      const matches = countMatches(exception.conditions);
      if (matches > highestMatch) {
        highestMatch = matches;
        exceptionConfig = exception.config;
      }
    });
  }
  // If exception config uses hide_tabs and main config uses show_tabs,
  // delete show_tabs and vice versa.
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
        conditions[cond].split(/[ ,]+/).forEach(user => {
          if (userVars[cond] == user) count++;
        });
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

function observers(tabContainer, tabs, header) {
  const callback = mutations => {
    mutations.forEach(({ addedNodes, target }) => {
      if (addedNodes.length && target.nodeName == "PARTIAL-PANEL-RESOLVER") {
        // Navigated back to lovelace from elsewhere in HA.
        buttons = getButtonElements();
        run();
      } else if (target.className == "edit-mode" && addedNodes.length) {
        // Entered edit mode.
        editMode = true;
        if (!disabled) removeStyles(tabContainer, tabs, header);
        buttons.options = root.querySelector("paper-menu-button");
        insertEditMenu(tabs);
        fireEvent(header, "iron-resize");
      } else if (target.nodeName == "APP-HEADER" && addedNodes.length) {
        // Exited edit mode.
        for (let node of addedNodes) {
          if (node.nodeName == "APP-TOOLBAR") {
            editMode = false;
            buttons = getButtonElements();
            root.querySelectorAll("[id^='cch']").forEach(style => {
              style.remove();
            });
            setTimeout(() => {
              run();
              if (!disabled) conditionalStyling(tabs, header);
            }, 100);
          }
        }
      } else if (
        // Viewing unused entities
        frontendVersion < 20190911 &&
        addedNodes.length &&
        !addedNodes[0].nodeName == "HUI-UNUSED-ENTITIES"
      ) {
        let editor = root
          .querySelector("ha-app-layout")
          .querySelector("editor");
        if (editor) root.querySelector("ha-app-layout").removeChild(editor);
        if (cchConfig.conditional_styles) {
          buttons = getButtonElements(tabContainer);
          conditionalStyling(tabs, header);
        }
      } else if (target.id == "view" && addedNodes.length) {
        scrollTabIconIntoView();
      }
    });
  };
  let observer = new MutationObserver(callback);
  observer.observe(panelResolver, { childList: true });
  observer.observe(view, { childList: true });
  observer.observe(root.querySelector("app-header"), {
    childList: true
  });

  if (!disabled) {
    window.hassConnection.then(({ conn }) => {
      conn.socket.onmessage = () => {
        if (cchConfig.conditional_styles && !editMode) {
          conditionalStyling(tabs, header);
        }
      };
    });
  }
}

function getButtonElements() {
  let buttons = {};
  buttons.options = root.querySelector("paper-menu-button");
  if (!editMode) {
    buttons.menu = root.querySelector("ha-menu-button");
    buttons.voice = root.querySelector("ha-start-voice-button");
    if (!newSidebar) {
      buttons.notifications = root.querySelector("hui-notifications-button");
    }
  }
  if (buttons.menu && buttons.menu.style.visibility == "hidden" && !disabled) {
    buttons.menu.style.display = "none";
  } else if (buttons.menu) {
    buttons.menu.style.display = "";
  }
  return buttons;
}

function tabContainerMargin(tabContainer) {
  let marginRight = 0;
  let marginLeft = 15;
  for (const button in buttons) {
    let paperIconButton =
      buttons[button].querySelector("paper-icon-button") ||
      buttons[button].shadowRoot.querySelector("paper-icon-button");
    let visible = paperIconButton
      ? buttons[button].style.display !== "none" &&
        !paperIconButton.hasAttribute("hidden")
      : buttons[button].style.display !== "none";
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
    tabContainer.style.marginRight = `${marginRight}px`;
    tabContainer.style.marginLeft = `${marginLeft}px`;
  }
}

function scrollTabIconIntoView() {
  let paperTabs = root.querySelector("paper-tabs");
  let currentTab = paperTabs.querySelector(".iron-selected");
  if (!paperTabs || !currentTab) return;
  let tab = currentTab.getBoundingClientRect();
  let container = paperTabs.shadowRoot
    .querySelector("#tabsContainer")
    .getBoundingClientRect();
  if (container.right < tab.right || container.left > tab.left) {
    if ("scrollMarginInline" in document.documentElement.style) {
      currentTab.scrollIntoView({ inline: "center" });
    } else if (Element.prototype.scrollIntoViewIfNeeded) {
      currentTab.scrollIntoViewIfNeeded(true);
    } else {
      currentTab.scrollIntoView();
    }
  }
}

function hideMenuItems() {
  if (cchConfig.hide_help || cchConfig.hide_config || cchConfig.hide_unused) {
    const itemCheck = (item, string) => {
      let localized = hass.localize(`ui.panel.lovelace.menu.${string}`);
      return (
        item.innerHTML.includes(localized) ||
        item.getAttribute("aria-label") == localized
      );
    };
    buttons.options
      .querySelector("paper-listbox")
      .querySelectorAll("paper-item")
      .forEach(item => {
        if (
          (cchConfig.hide_help && itemCheck(item, "help")) ||
          (cchConfig.hide_unused && itemCheck(item, "unused_entities")) ||
          (cchConfig.hide_config && itemCheck(item, "configure_ui"))
        ) {
          item.parentNode.removeChild(item);
        }
      });
  }
}

function insertEditMenu(tabs) {
  if (buttons.options && editMode) {
    // If any tabs are hidden, add "show all tabs" option.
    if (cchConfig.hide_tabs && !cchConfig.edit_mode_show_tabs) {
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

    // Add menu item to open CCH settings.
    let cchSettings = document.createElement("paper-item");
    cchSettings.setAttribute("id", "cch_settings");
    cchSettings.addEventListener("click", () => {
      showEditor();
    });
    cchSettings.innerHTML = "CCH Settings";
    insertMenuItem(buttons.options.querySelector("paper-listbox"), cchSettings);
    if (!disabled) hideMenuItems();
  }
}

function removeStyles(tabContainer, tabs, { style }) {
  root.querySelector("app-header").style.backgroundColor = "#455a64";
  root.querySelectorAll("[id^='cch']").forEach(style => {
    style.remove();
  });
  if (cchConfig.tab_css) {
    for (let [key, value] of Object.entries(cchConfig.tab_css)) {
      key = getViewIndex(key);
      value = value.replace(/: /g, ":").replace(/; /g, ";");
      let css = tabs[key].style.cssText.replace(/: /g, ":").replace(/; /g, ";");
      tabs[key].style.cssText = css.replace(value, "");
    }
  }
  if (cchConfig.header_css) {
    let value = cchConfig.header_css.replace(/: /g, ":").replace(/; /g, ";");
    let css = style.cssText.replace(/: /g, ":").replace(/; /g, ";");
    style.cssText = css.replace(value, "");
  }
  if (tabContainer) {
    tabContainer.style.marginLeft = "";
    tabContainer.style.marginRight = "";
  }
  view.style = "";
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].style.color = "";
  }
  if (cchConfig.edit_mode_show_tabs) {
    for (let i = 0; i < tabs.length; i++) {
      tabs[i].style.removeProperty("display");
    }
  }
  let viewStyle = document.createElement("style");
  viewStyle.setAttribute("id", "cch_view_styling");
  viewStyle.innerHTML = `
    hui-view {
      min-height: 100vh;
    }
    hui-panel-view {
      min-height: calc(100vh - 52px);
    }
    `;
  root.appendChild(viewStyle);
}

function styleHeader(tabContainer, tabs, header) {
  document.body.style.backgroundColor = getComputedStyle(
    document.body
  ).getPropertyValue("--background-color");
  let headerBackground =
    cchConfig.background ||
    getComputedStyle(document.body).getPropertyValue("--cch-background") ||
    getComputedStyle(document.body).getPropertyValue("--primary-color");
  let statusBarColor = cchConfig.statusbar_color || headerBackground;
  // Match mobile status bar color to header color.
  let themeColor = document.querySelector('[name="theme-color"]');
  function colorStatusBar() {
    statusBarColor =
      cchConfig.statusbar_color ||
      cchConfig.background ||
      getComputedStyle(document.body).getPropertyValue("--cch-background") ||
      getComputedStyle(document.body).getPropertyValue("--primary-color");
    themeColor = document.querySelector('[name="theme-color"]');
    themeColor.content = statusBarColor;
    themeColor.setAttribute("default-content", statusBarColor);
  }
  colorStatusBar();
  // If app/browser is idle or in background sometimes theme-color needs reset.
  let observeStatus = new MutationObserver(() => {
    if (themeColor.content != statusBarColor) colorStatusBar();
  });
  if (firstRun) {
    observeStatus.observe(themeColor, { attributeFilter: ["content"] });
  }

  // Adjust view size & padding for new header size.
  if (!cchConfig.header || cchConfig.kiosk_mode) {
    header.style.display = "none";
    view.style.minHeight = "100vh";
    if (
      frontendVersion >= 20190911 &&
      !root.querySelector("#cch_view_styling")
    ) {
      let viewStyle = document.createElement("style");
      viewStyle.setAttribute("id", "cch_view_styling");
      viewStyle.innerHTML = `
        hui-view {
          ${cchConfig.view_css ? cchConfig.view_css : ""}
        }
        hui-panel-view {
          ${cchConfig.view_css ? cchConfig.view_css : ""}
        }
        `;
      root.appendChild(viewStyle);
    }
  } else {
    view.style.minHeight = "100vh";
    view.style.marginTop = "-48.5px";
    view.style.paddingTop = "48.5px";
    view.style.boxSizing = "border-box";
    header.style.background = headerBackground;
    header.querySelector("app-toolbar").style.background = "transparent";
    if (
      frontendVersion >= 20190911 &&
      !root.querySelector("#cch_view_styling")
    ) {
      let viewStyle = document.createElement("style");
      viewStyle.setAttribute("id", "cch_view_styling");
      viewStyle.innerHTML = `
        hui-view {
          margin-top: -48.5px;
          padding-top: 52px;
          min-height: 100vh;
          ${cchConfig.view_css ? cchConfig.view_css : ""}
        }
        hui-panel-view {
          margin-top: -48.5px;
          padding-top: 52px;
          min-height: calc(100vh - 52px);
          ${cchConfig.view_css ? cchConfig.view_css : ""}
        }
        `;
      root.appendChild(viewStyle);
    }
  }

  // Match sidebar elements to header's size.
  if (newSidebar && cchConfig.compact_header) {
    let sidebar = main.shadowRoot.querySelector("ha-sidebar").shadowRoot;
    sidebar.querySelector(".menu").style = "height:49px;";
    sidebar.querySelector("paper-listbox").style = "height:calc(100% - 180px);";
  }

  // Current tab icon color.
  let conditionalTabs = cchConfig.conditional_styles
    ? JSON.stringify(cchConfig.conditional_styles).includes("tab")
    : false;
  if (
    !root.querySelector("#cch_iron_selected") &&
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
                    ? `color: ${`${cchConfig.active_tab_color} !important`}`
                    : "var(--cch-active-tab-color)"
                }
              }
            `;
    tabContainer.appendChild(style);
  }

  // Style current tab indicator.
  let indicator = cchConfig.tab_indicator_color;
  if (indicator && !root.querySelector("#cch_header_colors") && !editMode) {
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

  // Tab's icon color.
  let all_tabs_color = cchConfig.all_tabs_color || "var(--cch-all-tabs-color)";
  if (
    (cchConfig.tab_color && Object.keys(cchConfig.tab_color).length) ||
    all_tabs_color
  ) {
    for (let i = 0; i < tabs.length; i++) {
      tabs[i].style.color = cchConfig.tab_color[i] || all_tabs_color;
    }
  }

  // Add header custom css.
  if (cchConfig.header_css) header.style.cssText += cchConfig.header_css;

  // Add view custom css.
  if (cchConfig.view_css && frontendVersion < 20190911) {
    view.style.cssText += cchConfig.view_css;
  }

  // Add tab custom css.
  let tabCss = cchConfig.tab_css;
  if (tabCss) {
    for (let [key, value] of Object.entries(tabCss)) {
      key = getViewIndex(key);
      if (tabs[key]) tabs[key].style.cssText += value;
    }
  }

  if (tabContainer) {
    // Shift the header up to hide unused portion.
    root.querySelector("app-toolbar").style.marginTop = cchConfig.compact_header
      ? "-64px"
      : "";

    tabs.forEach(({ style }) => {
      style.marginTop = "-1px";
    });

    // Show/hide tab navigation chevrons.
    if (!cchConfig.chevrons) {
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

function styleButtons({ length }, tabContainer) {
  let topMargin =
    length > 0 && cchConfig.compact_header ? "margin-top:111px;" : "";
  let topMarginMenu =
    length > 0 && cchConfig.compact_header ? "margin-top:115px;" : "";
  // Reverse buttons object so menu is first in overflow menu.
  buttons = reverseObject(buttons);
  for (const button in buttons) {
    if (!buttons[button]) continue;
    if (button == "options" && cchConfig[button] == "overflow") {
      cchConfig[button] = "show";
    }
    let buttonStyle = `
        z-index:1;
        ${
          button == "menu"
            ? `padding: 8px 0; margin-bottom:5px; ${topMarginMenu}`
            : "padding: 4px 0;"
        }
        ${button == "menu" ? "" : topMargin}
        ${button == "options" ? "margin-right:-5px;" : ""}
      `;
    if (cchConfig[button] == "show" || cchConfig[button] == "clock") {
      if (button == "menu") {
        let paperIconButton = buttons[button].querySelector("paper-icon-button")
          ? buttons[button].querySelector("paper-icon-button")
          : buttons[button].shadowRoot.querySelector("paper-icon-button");
        if (!paperIconButton) continue;
        paperIconButton.style.cssText = buttonStyle;
      } else {
        buttons[button].style.cssText = buttonStyle;
      }
    } else if (cchConfig[button] == "overflow") {
      const menu_items = buttons.options.querySelector("paper-listbox");
      let paperIconButton = buttons[button].querySelector("paper-icon-button")
        ? buttons[button].querySelector("paper-icon-button")
        : buttons[button].shadowRoot.querySelector("paper-icon-button");
      if (paperIconButton && paperIconButton.hasAttribute("hidden")) {
        continue;
      }
      const id = `menu_item_${button}`;
      if (!menu_items.querySelector(`#${id}`)) {
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
    // Hide menu button if hiding the sidebar.
    if (newSidebar && (cchConfig.kiosk_mode || cchConfig.disable_sidebar)) {
      buttons.menu.style.display = "none";
    }
  }

  // Remove empty space taken up by hidden menu button.
  if (buttons.menu && newSidebar && !disabled) {
    new MutationObserver(() => {
      if (buttons.menu.style.visibility == "hidden") {
        buttons.menu.style.display = "none";
      } else {
        buttons.menu.style.display = "";
      }
      tabContainerMargin(tabContainer);
    }).observe(buttons.menu, { attributeFilter: ["style"] });
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

  // Notification indicator's color for HA 0.96 and above.
  if (
    newSidebar &&
    cchConfig.menu != "hide" &&
    !buttons.menu.shadowRoot.querySelector("#cch_dot")
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
  } else if (
    // Notification indicator's color for HA 0.95 and below.
    cchConfig.notify_indicator_color &&
    cchConfig.notifications == "show" &&
    !newSidebar
  ) {
    let style = document.createElement("style");
    style.innerHTML = `
            .indicator {
              background-color:${cchConfig.notify_indicator_color ||
                "var(--cch-notify-indicator-color)"} !important;
              color: ${cchConfig.notify_text_color ||
                "var(--cch-notify-text-color), var(--primary-text-color)"};
            }
          `;
    buttons.notifications.shadowRoot.appendChild(style);
  }

  // Add buttons's custom css.
  let buttonCss = cchConfig.button_css;
  if (buttonCss) {
    for (const [key, value] of Object.entries(buttonCss)) {
      if (!buttons[key]) {
        continue;
      } else {
        buttons[key].style.cssText += value;
      }
    }
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
  let default_tab = cchConfig.default_tab;
  let template = cchConfig.default_tab_template;
  if ((default_tab || template) && tabContainer) {
    if (template) default_tab = templateEval(template, hass.states);
    default_tab = getViewIndex(default_tab);
    let activeTab = tabs.indexOf(tabContainer.querySelector(".iron-selected"));
    if (
      activeTab != default_tab &&
      activeTab == 0 &&
      (!cchConfig.redirect ||
        (cchConfig.redirect && tabs[default_tab].style.display != "none"))
    ) {
      tabs[default_tab].click();
    }
  }
}

function sidebarMod() {
  let menu = buttons.menu.querySelector("paper-icon-button");
  let sidebar = main.shadowRoot.querySelector("app-drawer");

  // HA 0.95 and below
  if (!newSidebar) {
    if (!cchConfig.sidebar_swipe || cchConfig.kiosk_mode) {
      sidebar.removeAttribute("swipe-open");
    }
    if ((cchConfig.sidebar_closed || cchConfig.kiosk_mode) && !sidebarClosed) {
      if (sidebar.hasAttribute("opened")) menu.click();
      sidebarClosed = true;
    }
    // HA 0.96 and above
  } else if (cchConfig.disable_sidebar || cchConfig.kiosk_mode) {
    sidebar.style.display = "none";
    sidebar.addEventListener(
      "mouseenter",
      event => {
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
  if (!menu_items.querySelector(`#${element.id}`)) {
    first_item.parentNode.insertBefore(element, first_item);
  }
}

function insertClock(button) {
  const clock_button = buttons[button].querySelector("paper-icon-button")
    ? buttons[button]
    : buttons[button].shadowRoot;
  const clockIcon = clock_button.querySelector("paper-icon-button");
  const clockIronIcon =
    clockIcon.querySelector("iron-icon") ||
    clockIcon.shadowRoot.querySelector("iron-icon");
  const clockWidth =
    (cchConfig.clock_format == 12 && cchConfig.clock_am_pm) ||
    cchConfig.clock_date
      ? 105
      : 80;

  if (
    !newSidebar &&
    cchConfig.notifications == "clock" &&
    cchConfig.clock_date &&
    !buttons.notifications.shadowRoot.querySelector("#cch_indicator")
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
    let style = document.createElement("style");
    style.setAttribute("id", "cch_clock");
    style.innerHTML = `
            time {
              ${cchConfig.time_css}
            }
            date {
              ${cchConfig.date_css}
            }
          `;
    clockIronIcon.parentNode.insertBefore(style, clockIronIcon);
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
    ? `</br><date>${date.toLocaleDateString(locale, options)}</date>`
    : "";
  if (!cchConfig.clock_am_pm && cchConfig.clock_format == 12) {
    clock.innerHTML = `<time>${time.slice(0, -3)}</time>${date}`;
  } else {
    clock.innerHTML = `<time>${time}</time>${date}`;
  }
  window.setTimeout(() => updateClock(clock, clockFormat), 60000);
}

// Abandon all hope, ye who enter here.
function conditionalStyling(tabs, header) {
  let _hass = document.querySelector("home-assistant").hass;
  const conditional_styles = cchConfig.conditional_styles;
  let tabContainer = tabs[0] ? tabs[0].parentNode : "";
  let styling = [];

  if (Array.isArray(conditional_styles)) {
    for (let i = 0; i < conditional_styles.length; i++) {
      styling.push(Object.assign({}, conditional_styles[i]));
    }
  } else {
    styling.push(Object.assign({}, conditional_styles));
  }

  function exists(configItem) {
    return configItem !== undefined && configItem !== null;
  }

  function notificationCount() {
    if (newSidebar) {
      let badge = main.shadowRoot
        .querySelector("ha-sidebar")
        .shadowRoot.querySelector("span.notification-badge");
      if (!badge) return 0;
      else return parseInt(badge.innerHTML);
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

  for (let i = 0; i < styling.length; i++) {
    let template = styling[i].template;
    let condition = styling[i].condition;

    if (template) {
      if (!template.length) template = [template];
      template.forEach(template => {
        templates(template, tabs, _hass, header);
      });
    } else if (condition) {
      let entity = styling[i].entity;
      if (_hass.states[entity] == undefined && entity !== "notifications") {
        console.log(`CCH conditional styling: ${entity} does not exist.`);
        continue;
      }
      let entState =
        entity == "notifications"
          ? notificationCount()
          : _hass.states[entity].state;
      let condState = condition.state;
      let above = condition.above;
      let below = condition.below;

      let toStyle =
        (exists(condState) && entState == condState) ||
        (exists(above) &&
          exists(below) &&
          entState > above &&
          entState < below) ||
        (exists(above) && entState > above) ||
        (exists(below) && entState < below);

      let tabIndex = styling[i].tab ? Object.keys(styling[i].tab)[0] : null;
      let tabCondition = styling[i].tab ? styling[i].tab[tabIndex] : null;
      let tabElem = tabs[getViewIndex(tabIndex)];
      let tabkey = `tab_${getViewIndex(tabIndex)}`;
      let button = styling[i].button ? Object.keys(styling[i].button)[0] : null;
      let background = styling[i].background;

      // Conditionally style tabs.
      if (toStyle && exists(tabIndex) && tabElem) {
        if (tabCondition.hide) tabElem.style.display = "none";
        if (tabCondition.color) {
          if (prevColor[tabkey] == undefined) {
            Object.assign(prevColor, {
              [tabkey]: window
                .getComputedStyle(tabElem, null)
                .getPropertyValue("color")
            });
          }
          tabElem.style.color = tabCondition.color;
        }
        if (tabCondition.on_icon) {
          tabElem
            .querySelector("ha-icon")
            .setAttribute("icon", tabCondition.on_icon);
        }
      } else if (!toStyle && exists(tabIndex) && tabElem) {
        if (tabCondition.hide) {
          tabElem.style.display = "";
        }
        if (tabCondition.color && prevColor[tabkey]) {
          tabElem.style.color = prevColor[tabkey];
        }
        if (tabCondition.off_icon) {
          tabElem
            .querySelector("ha-icon")
            .setAttribute("icon", tabCondition.off_icon);
        }
      }

      if (toStyle && button) {
        if (!buttons[button]) continue;
        let buttonCondition = styling[i].button[button];
        let buttonElem = buttons[button].querySelector("paper-icon-button")
          ? buttons[button].querySelector("paper-icon-button")
          : buttons[button].shadowRoot.querySelector("paper-icon-button");
        if (buttonCondition.hide) {
          buttonElem.style.display = "none";
        }
        if (buttonCondition.color) {
          if (prevColor.button == undefined) prevColor.button = {};
          if (prevColor.button[button] == undefined) {
            prevColor.button[button] = window
              .getComputedStyle(buttonElem, null)
              .getPropertyValue("color");
          }
          buttonElem.style.color = buttonCondition.color;
        }
        if (buttonCondition.on_icon) {
          let icon =
            buttonElem.querySelector("iron-icon") ||
            buttonElem.shadowRoot.querySelector("iron-icon");
          icon.setAttribute("icon", buttonCondition.on_icon);
        }
      } else if (!toStyle && button) {
        let buttonCondition = styling[i].button[button];
        let buttonElem = buttons[button].querySelector("paper-icon-button")
          ? buttons[button].querySelector("paper-icon-button")
          : buttons[button].shadowRoot.querySelector("paper-icon-button");
        if (buttonCondition.hide) {
          buttonElem.style.display = "";
        }
        if (
          buttonCondition.color &&
          prevColor.button &&
          prevColor.button[button]
        ) {
          buttonElem.style.color = prevColor.button[button];
        }
        if (buttonCondition.off_icon) {
          let icon =
            buttonElem.querySelector("iron-icon") ||
            buttonElem.shadowRoot.querySelector("iron-icon");
          icon.setAttribute("icon", buttonCondition.off_icon);
        }
      }

      // Conditionally style background.
      if (toStyle && background) {
        if (prevColor.background == undefined) {
          prevColor.background = window
            .getComputedStyle(header, null)
            .getPropertyValue("background");
        }
        header.style.background = styling[i].background;
      } else if (!toStyle && background) {
        header.style.background = prevColor.background;
      }
    }
  }
  tabContainerMargin(tabContainer);
}

function templates(template, tabs, _hass, { style }) {
  let states = _hass.states;
  for (const condition in template) {
    if (condition == "tab") {
      for (const tab in template[condition]) {
        let tempCond = template[condition][tab];
        if (!tempCond.length) tempCond = [tempCond];
        tempCond.forEach(templateObj => {
          let tabIndex = getViewIndex(Object.keys(template[condition]));
          let styleTarget = Object.keys(templateObj);
          let tabTemplate = templateObj[styleTarget];
          let tabElement = tabs[tabIndex];
          if (styleTarget == "icon") {
            tabElement
              .querySelector("ha-icon")
              .setAttribute("icon", templateEval(tabTemplate, states));
          } else if (styleTarget == "color") {
            tabElement.style.color = templateEval(tabTemplate, states);
          } else if (styleTarget == "display") {
            templateEval(tabTemplate, states) == "show"
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
            iconTarget.setAttribute("icon", templateEval(tempCond, states));
          } else if (styleTarget == "color") {
            let tar =
              iconTarget.querySelector("iron-icon") ||
              iconTarget.shadowRoot.querySelector("iron-icon");
            tar.style.color = templateEval(tempCond, states);
          } else if (styleTarget == "display") {
            templateEval(tempCond, states) == "show"
              ? (buttonElem.style.display = "")
              : (buttonElem.style.display = "none");
          }
        });
      }
    } else if (condition == "background") {
      style.background = templateEval(template[condition], states);
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

function getViewIndex(viewString) {
  let views = lovelace.config.views;
  if (isNaN(viewString)) {
    for (let view in views) {
      if (
        views[view]["title"] == viewString ||
        views[view]["path"] == viewString
      ) {
        return view;
      }
    }
  } else {
    return parseInt(viewString);
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

function templateEval(template, states) {
  let entity = states;
  try {
    if (template.includes("return")) {
      return eval(`(function() {${template}}())`);
    } else {
      return eval(template);
    }
  } catch (e) {
    console.log(
      `%cCCH Template Failed:%c\n${template}\n%c${e}`,
      "text-decoration: underline;",
      "",
      "color: red;"
    );
  }
}

function swipeNavigation(tabs, tabContainer) {
  // To make it easier to update lovelace-swipe-navigation
  // keep this as close to the standalone lovelace addon as possible.
  let swipe_amount = cchConfig.swipe_amount || 15;
  let swipe_groups = cchConfig.swipe_groups;
  let animate = cchConfig.swipe_animate || "none";
  let skip_tabs = cchConfig.swipe_skip
    ? buildRanges(cchConfig.swipe_skip.split(","))
    : [];
  let wrap = cchConfig.swipe_wrap != undefined ? cchConfig.swipe_wrap : true;
  let prevent_default =
    cchConfig.swipe_prevent_default != undefined
      ? cchConfig.swipe_prevent_default
      : false;

  swipe_amount /= 10 ** 2;
  const appLayout = root.querySelector("ha-app-layout");
  let inGroup = true;
  let xDown;
  let yDown;
  let xDiff;
  let yDiff;
  let activeTab;
  let firstTab;
  let lastTab;
  let left;
  let fTabs;

  appLayout.addEventListener("touchstart", handleTouchStart, { passive: true });
  appLayout.addEventListener("touchmove", handleTouchMove, { passive: false });
  appLayout.addEventListener("touchend", handleTouchEnd, { passive: true });

  function handleTouchStart(event) {
    filterTabs();
    if (swipe_groups && !inGroup) return;
    let ignored = [
      "APP-HEADER",
      "HA-SLIDER",
      "SWIPE-CARD",
      "HUI-MAP-CARD",
      "ROUND-SLIDER",
      "HUI-THERMOSTAT-CARD"
    ];
    let path = (event.composedPath && event.composedPath()) || event.path;
    if (path) {
      for (let element of path) {
        if (element.nodeName == "HUI-VIEW") break;
        else if (ignored.includes(element.nodeName)) return;
      }
    }
    xDown = event.touches[0].clientX;
    yDown = event.touches[0].clientY;
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
      if (!wrap && fTabs[activeTab] == lastTab) return;
      else if (fTabs[activeTab] == lastTab && wrap) click(firstTab);
      else click(fTabs[activeTab + 1]);
    } else if (xDiff < -Math.abs(screen.width * swipe_amount)) {
      left = true;
      if (!wrap && fTabs[activeTab] == firstTab) return;
      else if (fTabs[activeTab] == firstTab && wrap) click(lastTab);
      else click(fTabs[activeTab - 1]);
    }
    xDown = yDown = xDiff = yDiff = null;
  }

  function filterTabs() {
    let currentTab = tabs.indexOf(tabContainer.querySelector(".iron-selected"));
    if (swipe_groups) {
      let groups = swipe_groups.replace(/, /g, ",").split(",");
      for (let group in groups) {
        let firstLast = groups[group].replace(/ /g, "").split("to");
        if (wrap && currentTab >= firstLast[0] && currentTab <= firstLast[1]) {
          inGroup = true;
          firstTab = tabs[parseInt(firstLast[0])];
          lastTab = tabs[parseInt(firstLast[1])];
          fTabs = tabs.filter(
            element =>
              tabs.indexOf(element) >= firstLast[0] &&
              tabs.indexOf(element) <= firstLast[1]
          );
          break;
        } else {
          inGroup = false;
        }
      }
    }
    if (cchConfig.swipe_skip_hidden) {
      fTabs = tabs.filter(
        element =>
          !skip_tabs.includes(tabs.indexOf(element)) &&
          getComputedStyle(element, null).display != "none"
      );
    } else {
      fTabs = tabs.filter(
        element => !skip_tabs.includes(tabs.indexOf(element))
      );
    }
    if (!swipe_groups) {
      firstTab = fTabs[0];
      lastTab = fTabs[fTabs.length - 1];
    }
    activeTab = fTabs.indexOf(tabContainer.querySelector(".iron-selected"));
  }

  if (!root.querySelector("#cch_swipe_animation")) {
    let swipeAnimations = document.createElement("style");
    swipeAnimations.setAttribute("id", "cch_swipe_animation");
    swipeAnimations.innerHTML = `
        @keyframes swipeOutRight {
          0% { transform: translateX(0px); }
          100% { transform: translateX(${screen.width / 1.5}px); opacity: 0; }
        }
        @keyframes swipeOutLeft {
          0% { transform: translateX(0px); }
          100% { transform: translateX(-${screen.width / 1.5}px); opacity: 0; }
        }
        @keyframes swipeInRight {
          0% { transform: translateX(${screen.width / 1.5}px); opacity: 0; }
          100% { transform: translateX(0px); opacity: 1; }
        }
        @keyframes swipeInLeft {
          0% { transform: translateX(-${screen.width / 1.5}px); opacity: 0; }
          100% { transform: translateX(0px); opacity: 1; }
        }
        .swipeOutRight, .swipeOutLeft, .swipeInRight, .swipeInLeft {
          animation-fill-mode: forwards;
        }
        .swipeOutRight { animation: swipeOutRight .20s 1; }
        .swipeOutLeft { animation: swipeOutLeft .20s 1; }
        .swipeInRight { animation: swipeInRight .20s 1; }
        .swipeInLeft { animation: swipeInLeft .20s 1; }
    `;
    view.parentNode.appendChild(swipeAnimations);
  }

  function clear(huiView) {
    huiView.className = "";
    huiView.style.overflowX = "";
    view.style.overflowX = "";
  }

  function navigate(tab, timeout) {
    setTimeout(() => {
      tab.dispatchEvent(
        new MouseEvent("click", { bubbles: false, cancelable: true })
      );
    }, timeout);
  }

  function click(tab) {
    if (!tab || (tab.style.display == "none" && cchConfig.swipe_skip_hidden)) {
      return;
    }
    if (
      !wrap &&
      ((activeTab == firstTab && left) || (activeTab == lastTab && !left))
    ) {
      return;
    } else if (animate == "swipe") {
      const getHuiView = () => {
        return (
          view.querySelector("hui-view") || view.querySelector("hui-panel-view")
        );
      };
      if (window.cch_animation_running) return;
      window.cch_animation_running = true;
      let huiView = getHuiView();
      huiView.style.overflowX = "hidden";
      view.style.overflowX = "hidden";
      // Swipe view off screen and fade out.
      huiView.className = "";
      view.style.transition = `opacity 0.20s`;
      view.style.opacity = 1;
      huiView.classList.add(left ? "swipeOutRight" : "swipeOutLeft");
      view.style.opacity = 0;
      setTimeout(() => clear(huiView), 210);
      const observer = new MutationObserver(mutations => {
        mutations.forEach(({ addedNodes }) => {
          addedNodes.forEach(({ nodeName }) => {
            if (nodeName) {
              // Swipe view on screen and fade in.
              huiView = getHuiView();
              huiView.style.overflowX = "hidden";
              view.style.overflowX = "hidden";
              view.style.opacity = 1;
              huiView.classList.add(left ? "swipeInLeft" : "swipeInRight");
              setTimeout(() => {
                clear(huiView);
                observer.disconnect();
                window.cch_animation_running = false;
              }, 210);
              return;
            }
          });
        });
      });
      observer.observe(view, { childList: true });
      // Navigate to next view and trigger the observer.
      navigate(tab, 220);
    } else if (animate == "fade") {
      animation(0.16, "", 0, 0);
      const observer = new MutationObserver(mutations => {
        mutations.forEach(({ addedNodes }) => {
          addedNodes.forEach(({ nodeName }) => {
            if (nodeName == "HUI-VIEW") {
              animation(0.16, "", 1, 0);
              observer.disconnect();
            }
          });
        });
      });
      observer.observe(view, { childList: true });
      navigate(tab, 170);
    } else if (animate == "flip") {
      animation(0.25, "rotatey(90deg)", 0.25, 0);
      const observer = new MutationObserver(mutations => {
        mutations.forEach(({ addedNodes }) => {
          addedNodes.forEach(({ nodeName }) => {
            if (nodeName == "HUI-VIEW") {
              animation(0.25, "rotatey(0deg)", 1, 50);
              observer.disconnect();
            }
          });
        });
      });
      observer.observe(view, { childList: true });
      navigate(tab, 270);
    } else {
      navigate(tab, 0);
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

// EDITOR //////////////////////////////////////////////////////////////////////

const buttonOptions = ["show", "hide", "clock", "overflow"];
const overflowOptions = ["show", "hide", "clock"];
const swipeAnimation = ["none", "swipe", "fade", "flip"];
let _lovelace;

class CompactCustomHeaderEditor extends LitElement {
  static get properties() {
    return { _config: {} };
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
        ? this._config.exceptions.map(
            (exception, index) => html`
              <cch-exception-editor
                .config="${this._config}"
                .exception="${exception}"
                .index="${index}"
                @cch-exception-changed="${this._exceptionChanged}"
                @cch-exception-delete="${this._exceptionDelete}"
              >
              </cch-exception-editor>
            `
          )
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
    for (const key in this._config) {
      if (this._config[key] == defaultConfig[key]) delete this._config[key];
    }
    let newConfig = { ..._lovelace.config, ...{ cch: this._config } };
    try {
      _lovelace.saveConfig(newConfig).then(() => {
        location.reload(true);
      });
    } catch (e) {
      alert(`Save failed: ${e}`);
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
      newExceptions.push({ conditions: {}, config: {} });
    } else {
      newExceptions = [{ conditions: {}, config: {} }];
    }
    this._config = { ...this._config, exceptions: newExceptions };

    fireEvent(this, "config-changed", { config: this._config });
  }

  _configChanged({ detail }) {
    if (!this._config) return;
    this._config = { ...this._config, ...detail.config };
    fireEvent(this, "config-changed", { config: this._config });
  }

  _exceptionChanged(ev) {
    if (!this._config) return;
    const target = ev.target.index;
    const newExceptions = this._config.exceptions.slice(0);
    newExceptions[target] = ev.detail.exception;
    this._config = { ...this._config, exceptions: newExceptions };

    fireEvent(this, "config-changed", { config: this._config });
  }

  _exceptionDelete(ev) {
    if (!this._config) return;
    const target = ev.target;
    const newExceptions = this._config.exceptions.slice(0);
    newExceptions.splice(target.index, 1);
    this._config = { ...this._config, exceptions: newExceptions };

    fireEvent(this, "config-changed", { config: this._config });
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
              Compact Custom Header &nbsp;₁.₄.₀
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
              ${buttonOptions.map(
                option => html`
                  <paper-item>${option}</paper-item>
                `
              )}
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
              ${buttonOptions.map(
                option => html`
                  <paper-item>${option}</paper-item>
                `
              )}
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
              ${overflowOptions.map(
                option => html`
                  <paper-item>${option}</paper-item>
                `
              )}
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
              ${buttonOptions.map(
                option => html`
                  <paper-item>${option}</paper-item>
                `
              )}
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
              ${swipeAnimation.map(
                option => html`
                  <paper-item>${option}</paper-item>
                `
              )}
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
    let show = this.shadowRoot.querySelector("#show");
    let hide = this.shadowRoot.querySelector("#hide");
    if (this.shadowRoot.querySelector("#tabs").value == "Hide Tabs") {
      show.style.display = "none";
      hide.style.display = "initial";
    } else {
      hide.style.display = "none";
      show.style.display = "initial";
    }
  }

  _valueChanged(ev) {
    if (!this.config) return;
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) return;
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
    fireEvent(this, "cch-config-changed", { config: this.config });
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
    return { config: {}, exception: {}, _closed: {} };
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

  _conditionsChanged({ detail }) {
    if (!this.exception) return;
    const newException = { ...this.exception, conditions: detail.conditions };
    fireEvent(this, "cch-exception-changed", { exception: newException });
  }

  _configChanged(ev) {
    ev.stopPropagation();
    if (!this.exception) return;
    const newException = { ...this.exception, config: ev.detail.config };
    fireEvent(this, "cch-exception-changed", { exception: newException });
  }
}

customElements.define("cch-exception-editor", CchExceptionEditor);

class CchConditionsEditor extends LitElement {
  static get properties() {
    return { conditions: {} };
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
    if (!this.conditions) return html``;
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
    if (!this.conditions) return;
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) return;
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
    fireEvent(this, "cch-conditions-changed", { conditions: this.conditions });
  }
}

customElements.define("cch-conditions-editor", CchConditionsEditor);

function deepcopy(value) {
  if (!(!!value && typeof value == "object")) return value;
  if (Object.prototype.toString.call(value) == "[object Date]") {
    return new Date(value.getTime());
  }
  if (Array.isArray(value)) return value.map(deepcopy);
  const result = {};
  Object.keys(value).forEach(key => {
    result[key] = deepcopy(value[key]);
  });
  return result;
}
