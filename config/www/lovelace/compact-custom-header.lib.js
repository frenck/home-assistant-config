var config_views = window.cch_ua_views;
var config_header = window.cch_header;
var config_menu = window.cch_menu;
var config_notify = window.cch_notify;
var config_voice = window.cch_voice;
var config_options = window.cch_options;
var config_tabs = window.cch_tabs;
var config_clock = window.cch_clock;
var config_clock_form =window.cch_clock_format;
var config_am_pm = window.cch_am_pm;
var config_disable = window.cch_disable;
var config_background = window.cch_background_image;
var display_tabs = window.cch_tabs_display;
var display_ua = window.cch_ua_display;

// Avoid "already defined" error when navigating away from Lovelace and back.
if (hui_root == undefined) var hui_root, card;

// Find hui-root element
recursive_walk(document, 'HUI-ROOT', function(node) {
  hui_root = node.nodeName == 'HUI-ROOT' ? node.shadowRoot : null;
});

// If hui-root was found we're on a lovelace page.
if (hui_root) {
  let app_layout = hui_root.querySelector('ha-app-layout');
  let div_view = app_layout.querySelector('[id="view"]');
  let toolbar = hui_root.querySelectorAll('app-toolbar');
  var tabs = hui_root.querySelector('paper-tabs');
  if (tabs) {
    let tabs_sr = tabs.shadowRoot;
    var tabs_count = tabs.querySelectorAll('paper-tab');
    var tabs_container = tabs_sr.getElementById('tabsContainer');
    var arrows = tabs_sr.querySelectorAll('[icon^="paper-tabs:chevron"]');
  }

  // Find this card's element.
  recursive_walk(app_layout, 'COMPACT-CUSTOM-HEADER', function(node) {
    card = node.nodeName == 'COMPACT-CUSTOM-HEADER' ? node : null;
  });

  // When exiting raw config editor buttons are hidden.
  let raw_config = hui_root.querySelector('ha-menu-button') == null;

  // If multiple toolbars exist & 2nd one is displayed, edit mode is active.
  if (toolbar.length > 1) {
    var edit_mode = toolbar[1].style.cssText != 'display: none;' ? true : false;
  } else {
    edit_mode = false;
  }

  // Card styling.
  let button_style = `
    margin:auto;
    margin-bottom:10px;
    background-color:var(--primary-color);
    color:var(--primary-text-color);
    border-radius:8px;
    display:inline-block;
    border:0;
    font-size:14px;
    width:30%;
    padding:10px 0 10px 0;
    outline:0 !important;
  `;
  let h2_style = `
    margin:auto auto 10px auto;
    padding:20px;
    background-color:var(--primary-color);
  `;
  let svg_style = `
    float:left;
    height:30px;
    padding:15px 5px 15px 15px;
  `;
  let div_style = `
    display: flex;
    justify-content: center;
  `;
  let path = `
    fill="var(--primary-text-color)"
    d="M12,7L17,12H14V16H10V12H7L12,7M19,
    21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,
    3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,
    21M19,19V5H5V19H19Z"
   `;
  let user_agent = `
    padding:5px;
    border:0;
    resize:none;
    width:100%;
  `;

  if (card) {
    // Create and display card if we're in edit or raw config modes.
    if (edit_mode || raw_config) {
      let ua_text = display_ua ? 'Hide' : 'Show';
      let tabs_text = display_tabs ? 'Revert' : 'Show';
      card.style.cssText = '';
      card.innerHTML = `
        <svg style="${svg_style}" viewBox="0 0 24 24">
          <path ${path}></path>
        </svg>
        <h2 style="${h2_style}">Compact Custom Header</h2>
        <div style="${div_style}">
          <button id='btn_ua' style="${button_style}"
            onclick="show_user_agent()">
            ${ua_text} user agent</button>
          <button id='btn_tabs' style="${button_style}"
            onclick="show_all_tabs()">
            ${tabs_text} all tabs</button>
          <button style="${button_style}"
            onclick="location.reload(true);">
            Refresh</button>
        </div>
        <div style="${div_style}">
          <textarea style="${user_agent} "id="cch_ua" rows="4" readonly>
          </textarea>
        </div>
      `;
      card.parentNode.style.cssText = `
        background-color:var(--paper-card-background-color);
      `;
      if (!display_ua) {
        card.querySelector('[id="cch_ua"]').style.display = 'none';
      }
      card.querySelector('[id="cch_ua"]').innerHTML = navigator.userAgent;
    } else {
      // Hide card outside of edit mode.
      card.style.cssText = 'display:none';
      card.innerHTML = '';
      // When not in edit mode hide whole column if this is the only card in it.
      if (card.parentNode.children.length == 1) {
        card.parentNode.style.cssText = 'display:none';
      } else {
        card.parentNode.style.cssText = '';
      }
    }
  }
  // Resize to update.
  window.dispatchEvent(new Event('resize'));

  // Style header and icons.
  if (!config_disable && !raw_config) {
    let menu_btn = hui_root.querySelector('ha-menu-button');
    let menu_icon = menu_btn.shadowRoot.querySelector('paper-icon-button');
    let menu_iron_icon = menu_icon.shadowRoot.querySelector('iron-icon');
    let notify_btn = hui_root.querySelector('hui-notifications-button');
    let notify_icon = notify_btn.shadowRoot.querySelector('paper-icon-button');
    let notify_iron_icon = notify_icon.shadowRoot.querySelector('iron-icon');
    var notify_dot = notify_btn.shadowRoot.querySelector('[class="indicator"]');
    let voice_btn = hui_root.querySelector('ha-start-voice-button');
    let voice_icon = voice_btn.shadowRoot.querySelector('paper-icon-button');
    let voice_iron_icon = voice_icon.shadowRoot.querySelector('iron-icon');
    var options_btn = hui_root.querySelector('paper-menu-button');
    let options_icon = options_btn.querySelector('paper-icon-button');
    let options_iron_icon = options_icon.shadowRoot.querySelector('iron-icon');

    // Hide header completely if set to false in config.
    if (!config_header) {
      hui_root.querySelector('app-header').style.cssText = 'display:none;';
    }

    // Remove clock from element if no longer set.
    remove_clock('notification', notify_icon, notify_btn);
    remove_clock('voice', voice_icon, voice_btn);
    remove_clock('options', options_icon, options_btn);
    remove_clock('menu', menu_icon, menu_btn);

    // Hide or show buttons.
    element_style(config_menu, menu_btn, true);
    element_style(config_notify, notify_btn, true);
    element_style(config_voice, voice_btn, true);
    element_style(config_options, options_btn, true);

    // Pad bottom for image backgrounds as we're shifted -64px.
    div_view.style.paddingBottom = config_background ? '64px' : '';

    // Set clock width.
    let clock_w = config_clock_form == 12 && config_am_pm ? 110 : 80;

    if (tabs) {
      // Add width of all visible elements on right side for tabs margin.
      let pad = 0;
      pad += config_notify && config_clock != 'notification' ? 45 : 0;
      pad += config_voice && config_clock != 'voice' ? 45 : 0;
      pad += config_options && config_clock != 'options' ? 45 : 0;
      if (config_clock && config_clock != 'menu') {
        pad += config_am_pm && config_clock_form == 12 ? 110 : 80;
      }
      tabs.style.cssText = `margin-right:${pad}px;`;

      // Add margin to left side if menu button is the clock.
      if (config_menu && config_clock != 'menu') {
        tabs_container.style.cssText = 'margin-left:60px;';
      } else if (config_menu && config_clock == 'menu') {
        tabs_container.style.cssText = `margin-left:${clock_w + 15}px;`;
      }

      // Shift the header up to hide unused portion.
      hui_root.querySelector('app-toolbar').style.cssText = 'margin-top:-64px;';

      // Hide tab bar scroll arrows to save space since we can still swipe.
      arrows[0].style.cssText = 'display:none;';
      arrows[1].style.cssText = 'display:none;';

      // Hide or show tabs.
      if (config_views && !display_tabs) {
        for (let i = 0; i < tabs_count.length; i++) {
          if (config_views.indexOf(String(i)) > -1) {
            element_style(config_tabs, tabs_count[i], false);
          } else {
            tabs_count[i].style.cssText = 'display:none;';
          }
        }
        // If user agent hide's first tab, then redirect to new first tab.
        if (!display_tabs && config_views[0] > 0 &&
            tabs_count[0].className == 'iron-selected') {
          tabs_count[parseInt(config_views[0])].click();
        }
      } else {
        for (let i = 0; i < tabs_count.length; i++) {
            element_style(config_tabs, tabs_count[i], false);
        }
      }
    }

    // Strings to compare config to. Avoids errors while typing in edit field.
    let clock_strings = ['notification','voice','options','menu'];

    // Get elements to style for clock choice.
    if (clock_strings.indexOf(config_clock) > -1) {
      if (config_clock == 'notification') {
        var icon = notify_icon;
        var iron_icon = notify_iron_icon;
        notify_dot.style.cssText = 'top:14.5px;left:-7px';
      } else if (config_clock == 'voice') {
        icon = voice_icon;
        iron_icon = voice_iron_icon;
      } else if (config_clock == 'options') {
        icon = options_icon;
        iron_icon = options_iron_icon;
      } else if (config_clock == 'menu') {
        icon = menu_icon;
        iron_icon = menu_iron_icon;
      }

      // If the clock element doesn't exist yet, create & insert.
      if (config_clock && clock == null) {
        let create_clock = document.createElement('p');
        create_clock.setAttribute('id','cch_clock');
        create_clock.style.cssText = `
          width:${clock_w}px;
          margin-top:2px;
          margin-left:-8px;
        `;
        iron_icon.parentNode.insertBefore(create_clock, iron_icon);
      }

      // Style clock and insert time text.
      var clock = icon.shadowRoot.getElementById('cch_clock');
      if (config_clock && clock != null) {
        let clock_format = {
          'hour12': (config_clock_form != 24),
          'hour': '2-digit',
          'minute': '2-digit'
        };
        let date = new Date();
        date = date.toLocaleTimeString([], clock_format);
        if (!config_am_pm && config_clock_form == 12) {
          clock.innerHTML = date.slice(0, -3);
        } else {
          clock.innerHTML = date;
        }
        icon.style.cssText = `
          margin-right:-5px;
          width:${clock_w}px;
          text-align: center;
        `;
        iron_icon.style.cssText = 'display:none;';
      }
    }
  }
  window.dispatchEvent(new Event('resize'));
}

// Walk the DOM to find element.
function recursive_walk(node, element, func) {
    var done = func(node) || node.nodeName == element;
    if (done) return true;
    if ('shadowRoot' in node && node.shadowRoot) {
      done = recursive_walk(node.shadowRoot, element, func);
      if (done) return true;
    }
    node = node.firstChild;
    while (node) {
      done = recursive_walk(node, element, func);
      if (done) return true;
      node = node.nextSibling;
    }
}

// Style and hide buttons.
function element_style(config, element, shift) {
  let top = edit_mode ? 240 : 111;
  let options_style = element == options_btn ?
    'margin-right:-5px; padding:0;' : '';
  if (tabs && shift && !config_disable) {
    element.style.cssText = config ?
      `z-index:1; margin-top:${top}px;${options_style}` :
      'display:none' ;
  } else if (!config_disable){
    element.style.cssText = config ? '' : 'display:none' ;
  } else {
    element.style.cssText = '';
  }
}

// Revert button if previously a clock.
function remove_clock(config, element, parent) {
  if (config_clock != config &&
      element.shadowRoot.getElementById('cch_clock') != null) {
    let clock_element = element.shadowRoot.getElementById('cch_clock');
    clock_element.parentNode.querySelector('iron-icon').style.cssText = '';
    if (config == 'options') {
      parent.querySelector('paper-icon-button').style.cssText = '';
    } else {
      parent.shadowRoot.querySelector('paper-icon-button').style.cssText = '';
    }
    if (config == 'notification') {
      notify_dot.style.cssText = '';
    }
    clock_element.parentNode.removeChild(clock_element);
  }
}

// Show user agent portion of card for button on card.
function show_user_agent() {
  if (card.querySelector('[id="cch_ua"]') != null) {
    if (display_ua) {
      card.querySelector('[id="cch_ua"]').style.display = 'none';
      card.querySelector('[id="btn_ua"]').innerHTML = 'Show user agent';
      display_ua = false;
    } else if (!display_ua) {
      card.querySelector('[id="cch_ua"]').style.display = 'initial';
      card.querySelector('[id="btn_ua"]').innerHTML = 'Hide user agent';
      display_ua = true;
    }
  }
}

// Display all tabs for button on card.
function show_all_tabs() {
  if (!display_tabs && tabs) {
    for (let i = 0; i < tabs_count.length; i++) {
      tabs_count[i].style.cssText = '';
    }
    display_tabs = true;
    card.querySelector('[id="btn_tabs"]').innerHTML = 'Revert all tabs';
  } else if (display_tabs && tabs) {
    for (let i = 0; i < tabs_count.length; i++) {
      if (config_views) {
        if (config_views.indexOf(String(i+1)) > -1) {
          tabs_count[i].style.cssText = '';
        } else {
          tabs_count[i].style.cssText = 'display:none;';
        }
      }
    }
    display_tabs = false;
    card.querySelector('[id="btn_tabs"]').innerHTML = 'Show all tabs';
  }
}
