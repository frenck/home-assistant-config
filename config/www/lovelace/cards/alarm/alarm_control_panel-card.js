class AlarmControlPanelCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._icons = {
      'armed_away': 'mdi:security-lock',
      'armed_custom_bypass': 'mdi:security',
      'armed_home': 'mdi:security-home',
      'armed_night': 'mdi:security-home',
      'disarmed': 'mdi:verified',
      'pending': 'mdi:shield-outline',
      'triggered': 'hass:bell-ring',
    }
  }

  set hass(hass) {
    const entity = hass.states[this._config.entity];

    if (entity) {
      this.myhass = hass;
      if(!this.shadowRoot.lastChild) {
        this._createCard(entity);
      }
      if (entity.state != this._state) {
        this._state = entity.state;
        this._updateCardContent(entity);
      }
    }
  }

  _createCard(entity) {
    const config = this._config;

    const card = document.createElement('ha-card');
    const content = document.createElement('div');
    content.id = "content";
    content.innerHTML = `
      ${config.title ? '<div id="state-text"></div>' : ''}
      <ha-icon id="state-icon"></ha-icon>
      ${this._actionButtons()}
      ${entity.attributes.code_format ?
          `<paper-input label='${this._label("ui.card.alarm_control_panel.code")}'
          type="password"></paper-input>` : ''}
      ${this._keypad(entity)}
    `;
    card.appendChild(this._style(config.style));
    card.appendChild(content);
    this.shadowRoot.appendChild(card);

    this._setupInput();
    this._setupKeypad();
    this._setupActions();
  }

  connectedCallback() {
  }

  setConfig(config) {
    if (!config.entity || config.entity.split(".")[0] !== "alarm_control_panel") {
      throw new Error('Please specify an entity from alarm_control_panel domain.');
    }
    if (config.auto_enter) {
      if (!config.auto_enter.code_length || !config.auto_enter.arm_action) {
        throw new
          Error('Specify both code_length and arm_action when using auto_enter.');
      }
      this._arm_action = config.auto_enter.arm_action;
    }
    if (!config.states) config.states = ['arm_away', 'arm_home'];
    if (!config.scale) config.scale = '15px';
    this._config = Object.assign({}, config);

    const root = this.shadowRoot;
    if (root.lastChild) root.removeChild(root.lastChild);
  }

  _updateCardContent(entity) {
    const root = this.shadowRoot;
    const card = root.lastChild;
    const config = this._config;

    const state_str = "state.alarm_control_panel." + this._state;
    if (config.title) {
      card.header = config.title;
      root.getElementById("state-text").innerHTML = this._label(state_str);
      root.getElementById("state-text").className = `state ${this._state}`;
    } else {
      card.header = this._label(state_str);
    }

    root.getElementById("state-icon").setAttribute("icon",
      this._icons[this._state] || 'mdi:shield-outline');
    root.getElementById("state-icon").className = this._state;

    const armVisible = (this._state === 'disarmed');
    root.getElementById("arm-actions").style.display = armVisible ? "" : "none";
    root.getElementById("disarm-actions").style.display = armVisible ? "none" : "";
  }

  _actionButtons() {
    const armVisible = (this._state === 'disarmed');
    return `
      <div id="arm-actions" class="actions">
        ${this._config.states.map(el => `${this._actionButton(el)}`).join('')}
      </div>
      <div id="disarm-actions" class="actions">
        ${this._actionButton('disarm')}
      </div>`;
  }

  _actionButton(state) {
    return `<paper-button noink raised id="${state}">
      ${this._label("ui.card.alarm_control_panel." + state)}</paper-button>`;
  }

  _setupActions() {
    const card = this.shadowRoot.lastChild;
    const config = this._config;

    if (config.auto_enter) {
      card.querySelectorAll(".actions paper-button").forEach(element => {
        element.classList.remove('autoarm');
        if (element.id === this._arm_action || element.id === 'disarm') {
          element.classList.add('autoarm');
        }
        element.addEventListener('click', event => {
          card.querySelectorAll(".actions paper-button").forEach(element => {
            element.classList.remove('autoarm');
          })
          element.classList.add('autoarm');
          if (element.id !== 'disarm') this._arm_action = element.id;
        })
      })
    } else {
      card.querySelectorAll(".actions paper-button").forEach(element => {
        element.addEventListener('click', event => {
          const input = card.querySelector('paper-input');
          const value = input ? input.value : '';
          this._callService(element.id, value);
        })
      })
    }
  }

  _callService(service, code) {
    const input = this.shadowRoot.lastChild.querySelector("paper-input");
    this.myhass.callService('alarm_control_panel', `alarm_${service}`, {
      entity_id: this._config.entity,
      code: code,
    });
    if (input) input.value = '';
  }

  _setupInput() {
    if (this._config.auto_enter) {
      const input = this.shadowRoot.lastChild.querySelector("paper-input");
      input.addEventListener('input', event => { this._autoEnter() })
    }
  }

  _setupKeypad() {
    const root = this.shadowRoot;

    const input = root.lastChild.querySelector('paper-input');
    root.querySelectorAll(".pad paper-button").forEach(element => {
      if (element.getAttribute('value') === 
        this._label("ui.card.alarm_control_panel.clear_code")) {
        element.addEventListener('click', event => {
          input.value = '';
        })
      } else {
        element.addEventListener('click', event => {
          input.value += element.getAttribute('value');
          this._autoEnter();
        })
      }
    });
  }

  _autoEnter() {
    const config = this._config;

    if (config.auto_enter) {
      const card = this.shadowRoot.lastChild;
      const code = card.querySelector("paper-input").value;
      if (code.length == config.auto_enter.code_length) {
        const service = card.querySelector(".actions .autoarm").id;
        this._callService(service, code);
      }
    }
  }

  _keypad(entity) {
    if (this._config.hide_keypad || !entity.attributes.code_format) return '';

    return `
      <div class="pad">
        <div>
          ${this._keypadButton("1", "")}
          ${this._keypadButton("4", "GHI")}
          ${this._keypadButton("7", "PQRS")}
        </div>
        <div>
          ${this._keypadButton("2", "ABC")}
          ${this._keypadButton("5", "JKL")}
          ${this._keypadButton("8", "TUV")}
          ${this._keypadButton("0", "")}
        </div>
        <div>
          ${this._keypadButton("3", "DEF")}
          ${this._keypadButton("6", "MNO")}
          ${this._keypadButton("9", "WXYZ")}
          ${this._keypadButton(this._label("ui.card.alarm_control_panel.clear_code"), "")}
        </div>
      </div>`
  }

  _keypadButton(button, alpha) {
    let letterHTML = '';
    if (this._config.display_letters) {
      letterHTML = `<div class='alpha'>${alpha}</div>`
    }
    return `<paper-button noink raised value="${button}">${button}${letterHTML}
      </paper-button>`;
  }

  _style(icon_style) {
    const style = document.createElement('style');
    style.textContent = `
      ha-card {
        padding-bottom: 16px;
        position: relative;
        --alarm-color-disarmed: var(--label-badge-green);
        --alarm-color-pending: var(--label-badge-yellow);
        --alarm-color-triggered: var(--label-badge-red);
        --alarm-color-armed: var(--label-badge-red);
        --alarm-color-autoarm: rgba(0, 153, 255, .1);
        --alarm-state-color: var(--alarm-color-armed);
        --base-unit: ${this._config.scale};
        font-size: calc(var(--base-unit));
        ${icon_style}
      }
      ha-icon {
        color: var(--alarm-state-color);
        position: absolute;
        right: 20px;
        top: 20px;
        padding: 10px;
        border: 2px solid var(--alarm-state-color);
        border-radius: 50%;
      }
      .disarmed {
        --alarm-state-color: var(--alarm-color-disarmed);
      }
      .triggered {
        --alarm-state-color: var(--alarm-color-triggered);
        animation: pulse 1s infinite;
      }
      .arming {
        --alarm-state-color: var(--alarm-color-pending);
        animation: pulse 1s infinite;
      }
      .pending {
        --alarm-state-color: var(--alarm-color-pending);
        animation: pulse 1s infinite;
      }
      @keyframes pulse {
        0% {
          border: 2px solid var(--alarm-state-color);
        }
        100% {
          border: 2px solid rgba(255, 153, 0, 0.3);
        }
      }
      paper-input {
        margin: auto;
        max-width: 200px;
        font-size: calc(var(--base-unit));
      }
      .state {
        margin-left: 20px;
        font-size: calc(var(--base-unit) * 0.9);
        position: relative;
        bottom: 16px;
        color: var(--alarm-state-color);
        animation: none;
      }
      .pad {
        display: flex;
        justify-content: center;
      }
      .pad div {
        display: flex;
        flex-direction: column;
      }
      .pad paper-button {
        margin-bottom: 10%;
        position: relative;
        padding: calc(var(--base-unit));
        font-size: calc(var(--base-unit) * 1.1);
      }
      .actions {
        margin: 0 8px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        font-size: calc(var(--base-unit) * 1);
      }
      .actions paper-button {
        min-width: calc(var(--base-unit) * 9);
        color: var(--primary-color);
      }
      .actions .autoarm {
        background: var(--alarm-color-autoarm);
      }
      paper-button#disarm {
        color: var(--google-red-500);
      }
      .alpha {
        position: absolute;
        text-align: center;
        bottom: calc(var(--base-unit) * 0.1);
        color: var(--secondary-text-color);
        font-size: calc(var(--base-unit) * 0.7);
      }
    `;
    return style;
  }

  _label(label, default_label=undefined) {
    // Just show "raw" label; useful when want to see underlying const
    // so you can define your own label.
    if (this._config.show_label_ids) return label;

    if (this._config.labels && this._config.labels[label])
      return this._config.labels[label];

    const lang = this.myhass.selectedLanguage || this.myhass.language;
    const translations = this.myhass.resources[lang];
    if (translations && translations[label]) return translations[label];

    if (default_label) return default_label;

    // If all else fails then pretify the passed in label const
    const last_bit = label.split('.').pop();
    return last_bit.split('_').join(' ').replace(/^\w/, c => c.toUpperCase());
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('alarm_control_panel-card', AlarmControlPanelCard);
