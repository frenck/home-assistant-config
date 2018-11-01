/* mini-media-player - version: v0.8.4 */
import { LitElement, html } from 'https://unpkg.com/@polymer/lit-element@^0.6.2/lit-element.js?module';

class MiniMediaPlayer extends LitElement {
  constructor() {
    super();
    this._icons = {
      'playing': {
        true: 'mdi:pause',
        false: 'mdi:play'
      },
      'prev': 'mdi:skip-previous',
      'next': 'mdi:skip-next',
      'power': 'mdi:power',
      'volume_up': 'mdi:volume-high',
      'volume_down': 'mdi:volume-medium',
      'mute': {
        true: 'mdi:volume-off',
        false: 'mdi:volume-high'
      },
      'send': 'mdi:send',
      'dropdown': 'mdi:chevron-down'
    }
    this._media_info = [
      { attr: 'media_title' },
      { attr: 'media_artist' },
      { attr: 'media_series_title' },
      { attr: 'media_season', prefix: 'S' },
      { attr: 'media_episode', prefix: 'E'}
    ];
  }

  static get properties() {
    return {
      _hass: Object,
      config: Object,
      entity: Object,
      source: String,
      position: Number
    };
  }

  set hass(hass) {
    const entity = hass.states[this.config.entity];
    this._hass = hass;
    if (entity && this.entity !== entity) {
      this.entity = entity;
    }
  }

  setConfig(config) {
    if (!config.entity || config.entity.split('.')[0] !== 'media_player') {
      throw new Error('Specify an entity from within the media_player domain.');
    }

    const conf = Object.assign({
      title: '',
      icon: false,
      more_info: true,
      show_tts: false,
      show_source: false,
      artwork_border: false,
      group: false,
      power_color: false,
      artwork: 'default',
      volume_stateless: false,
      hide_power: false,
      hide_controls: false,
      hide_volume: false,
      hide_mute: false,
      hide_info: false,
      scroll_info: false,
      short_info: false,
      max_volume: 100,
      show_progress: false
    }, config);
    conf.max_volume = Number(conf.max_volume) || 100;
    conf.short_info = (conf.short_info || conf.scroll_info ? true : false);

    this.config = conf;
  }

  shouldUpdate(changedProps) {
    const change = changedProps.has('entity') || changedProps.has('source') || changedProps.has('position');
    if (change) {
      if (this.config.show_progress) this._checkProgress();
      return true;
    }
  }

  updated() {
    if (this.config.scroll_info) this._hasOverflow();
  }

  render({_hass, config, entity} = this) {
    if (!entity) return;
    const artwork = this._computeArtwork();
    const hide_controls = (config.hide_controls || config.hide_volume) || false;
    const short = (hide_controls || config.short_info);

    return html`
      ${this._style()}
      <ha-card ?group=${config.group}
        ?more-info=${config.more_info} ?has-title=${config.title !== ''}
        artwork=${config.artwork} ?has-artwork=${artwork}
        @click='${(e) => this._handleMore()}' state=${entity.state}>
        <div id='artwork-cover'
          style='background-image: url("${artwork}")'>
        </div>
        <header>${config.title}</header>
        <div class='entity flex' ?hide-info=${this.config.hide_info}>
            ${this._renderIcon()}
            <div class='info' ?short=${short}>
              <div id='playername' ?has-info=${this._hasMediaInfo()}>
                ${this._computeName()}
              </div>
              ${this._renderMediaInfo(short)}
            </div>
          <div class='power-state flex'>
            ${this._renderPowerStrip(entity)}
          </div>
        </div>
        ${this._isActive() && !hide_controls ? this._renderControlRow(entity) : html``}
        ${config.show_tts ? this._renderTts() : html``}
        ${config.show_progress ? this._renderProgress(entity) : ''}
      </ha-card>`;
  }

  _computeName() {
    return this.config.name || this.entity.attributes.friendly_name;
  }

  _computeArtwork() {
    return (this.entity.attributes.entity_picture
      && this.entity.attributes.entity_picture != '')
      ? this.entity.attributes.entity_picture
      : false;
  }

  _computeIcon() {
    return this.config.icon ? this.config.icon : this.entity.attributes.icon
      || 'mdi:cast';
  }

  _hasOverflow() {
    const element = this.shadowRoot.querySelector('.marquee');
    const status = element.clientWidth > (element.parentNode.clientWidth) ;
    element.parentNode.setAttribute('scroll', status);
  }

  _renderIcon() {
    const artwork = this._computeArtwork();
    if (this._isActive() && artwork && this.config.artwork == 'default') {
      return html`
        <div id='artwork' ?border=${this.config.artwork_border}
          style='background-image: url("${artwork}")'
          state=${this.entity.state}>
        </div>`;
    }

    return html`
      <div id='icon'><ha-icon icon='${this._computeIcon()}'></ha-icon></div>
    `;
  }

  _renderPower() {
    return html`
      <paper-icon-button id='power-button'
        icon=${this._icons['power']}
        @click='${(e) => this._callService(e, "toggle")}'
        ?color=${this.config.power_color && this._isActive()}>
      </paper-icon-button>`;
  }

  _renderMediaInfo(short) {
    const items = this._media_info.map(item => {
      item.info = this._getAttribute(item.attr);
      item.prefix = item.prefix || '';
      return item;
    }).filter(item => item.info !== '');

    return html`
      <div id='mediainfo' ?short=${short}>
        ${this.config.scroll_info ? html`
          <div class='marquee'>
            ${items.map(item => html`<span>${item.prefix + item.info}</span>`)}
          </div>` : '' }
        <div>
          ${items.map(item => html`<span>${item.prefix + item.info}</span>`)}
        </div>
      </div>`;
  }

  _renderProgress(entity) {
    const show = this._showProgress();
    return html`
      <paper-progress id='progress' max=${entity.attributes.media_duration}
        value=${this.position} class='transiting ${!show ? "hidden" : ""}'>
      </paper-progress>`;
  }

  _renderPowerStrip(entity, {config} = this) {
    const active = this._isActive();
    if (entity.state == 'unavailable') {
      return html`
        <span id='unavailable'>
          ${this._getLabel('state.default.unavailable', 'Unavailable')}
        </span>`;
    }
    return html`
      <div class='select flex'>
        ${active && config.hide_controls && !config.hide_volume ? this._renderVolControls(entity) : html``}
        ${active && config.hide_volume && !config.hide_controls ? this._renderMediaControls(entity) : html``}
        <div class='flex right'>
          ${config.show_source !== false ? this._renderSource(entity) : html``}
          ${!config.hide_power ? this._renderPower(active) : html``}
        <div>
      </div>`;
  }

  _renderSource(entity) {
    const sources = entity.attributes['source_list'] || false;
    const source = entity.attributes['source'] || '';

    if (sources) {
      const selected = sources.indexOf(source);
      return html`
        <paper-menu-button id='source-menu' slot='dropdown-trigger'
          .horizontalAlign=${'right'}
          .verticalAlign=${'top'} .verticalOffset=${40}
          @click='${(e) => e.stopPropagation()}'>
          <paper-button slot='dropdown-trigger'>
            ${this.config.show_source !== 'small' ? html`
            <span id='source'>${this.source || source}</span>` : '' }
            <iron-icon icon=${this._icons['dropdown']}></iron-icon>
          </paper-button>
          <paper-listbox id='list' slot='dropdown-content' selected=${selected}
            @click='${(e) => this._handleSource(e)}'>
            ${sources.map(item => html`<paper-item value=${item}>${item}</paper-item>`)}
          </paper-listbox>
        </paper-menu-button>`;
    }
  }

  _renderControlRow(entity) {
    return html`
      <div id='mediacontrols' class='flex justify flex-wrap' ?wrap=${this.config.volume_stateless}>
        ${this._renderVolControls(entity)}
        ${this._renderMediaControls(entity)}
      </div>`;
  }

  _renderMediaControls(entity) {
    const playing = entity.state == 'playing';
    return html`
      <div class='flex'>
        <paper-icon-button id='prev-button' icon=${this._icons["prev"]}
          @click='${(e) => this._callService(e, "media_previous_track")}'>
        </paper-icon-button>
        <paper-icon-button id='play-button'
          icon=${this._icons.playing[playing]}
          @click='${(e) => this._callService(e, "media_play_pause")}'>
        </paper-icon-button>
        <paper-icon-button id='next-button' icon=${this._icons["next"]}
          @click='${(e) => this._callService(e, "media_next_track")}'>
        </paper-icon-button>
      </div>`;
  }

  _renderVolControls(entity) {
    const muted = entity.attributes.is_volume_muted || false;
    if (this.config.volume_stateless) {
      return this._renderVolButtons(entity, muted);
    } else {
      return html`
        ${this._renderVolSlider(entity, muted)}`;
    }
  }

  _renderMuteButton(muted) {
    if (!this.config.hide_mute)
      return html`
        <paper-icon-button id='mute-button' icon=${this._icons.mute[muted]}
          @click='${(e) => this._callService(e, "volume_mute", { is_volume_muted: !muted })}'>
        </paper-icon-button>`;
  }

  _renderVolSlider(entity, muted = false) {
    const volumeSliderValue = entity.attributes.volume_level * 100;

    return html`
      <div class='vol-control flex'>
        <div>
          ${this._renderMuteButton(muted)}
        </div>
        <paper-slider id='volume-slider' ?disabled=${muted}
          @change='${(e) => this._handleVolumeChange(e)}'
          @click='${(e) => e.stopPropagation()}'
          min='0' max=${this.config.max_volume} value=${volumeSliderValue}
          ignore-bar-touch pin>
        </paper-slider>
      </div>`;
  }

  _renderVolButtons(entity, muted = false) {
    return html`
      <div class='flex'>
        ${this._renderMuteButton(muted)}
        <paper-icon-button id='volume-down-button' icon=${this._icons.volume_down}
          @click='${(e) => this._callService(e, "volume_down")}'>
        </paper-icon-button>
        <paper-icon-button id='volume-up-button' icon=${this._icons.volume_up}
          @click='${(e) => this._callService(e, "volume_up")}'>
        </paper-icon-button>
      </div>`;
  }

  _renderTts() {
    return html`
      <div id='tts' class='flex justify'>
        <paper-input id='tts-input' no-label-float
          placeholder=${this._getLabel('ui.card.media_player.text_to_speak', 'Say')}...
          @click='${(e) => e.stopPropagation()}'>
        </paper-input>
        <div>
          <paper-button id='tts-send' @click='${(e) => this._handleTts(e)}'>
            SEND
          </paper-button>
        </div>
      </div>`;
  }

  _callService(e, service, options, component = 'media_player') {
    e.stopPropagation();
    options = (options === null || options === undefined) ? {} : options;
    options.entity_id = options.entity_id || this.config.entity;
    this._hass.callService(component, service, options);
  }

  _handleVolumeChange(e) {
    e.stopPropagation();
    const volPercentage = parseFloat(e.target.value);
    const vol = volPercentage > 0 ? volPercentage / 100 : 0;
    this._callService(e, 'volume_set', { volume_level: vol })
  }

  _handleTts(e) {
    e.stopPropagation();
    const input = this.shadowRoot.querySelector('#tts paper-input');
    const options = { message: input.value };
    this._callService(e, this.config.show_tts + '_say' , options, 'tts');
    input.value = '';
  }

  _handleMore({config} = this) {
    if(config.more_info)
      this._fire('hass-more-info', { entityId: config.entity });
  }

  _handleSource(e) {
    e.stopPropagation();
    const source = e.target.getAttribute('value');
    const options = { 'source': source };
    this._callService(e, 'select_source' , options);
    this.source = source;
  }

  _fire(type, detail, options) {
    options = options || {};
    detail = (detail === null || detail === undefined) ? {} : detail;
    const e = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
      composed: options.composed === undefined ? true : options.composed
    });
    e.detail = detail;
    this.dispatchEvent(e);
    return e;
  }

  async _checkProgress() {
    if (this._isPlaying() && this._showProgress()) {
      if (!this._positionTracker) {
        this._positionTracker = setInterval(() => this.position = this._currentProgress(), 1000);
      }
    } else if (this._positionTracker) {
      clearInterval(this._positionTracker);
      this._positionTracker = null;
    }
    if (this._showProgress) {
      this.position = this._currentProgress();
    }
  }

  _showProgress() {
    return (
      (this._isPlaying() || this._isPaused())
      && 'media_duration' in this.entity.attributes
      && 'media_position' in this.entity.attributes
      && 'media_position_updated_at' in this.entity.attributes);
  }
  _currentProgress() {
    let progress = this.entity.attributes.media_position;
    if (this._isPlaying()) {
      progress += (Date.now() - new Date(this.entity.attributes.media_position_updated_at).getTime()) / 1000.0;

    }
    return progress;
  }

  _isPaused() {
    return this.entity.state === 'paused';
  }

  _isPlaying() {
    return this.entity.state === 'playing';
  }

  _isActive() {
    return (this.entity.state !== 'off' && this.entity.state !== 'unavailable') || false;
  }

  _hasMediaInfo() {
    const items = this._media_info.map(item => {
      return item.info = this._getAttribute(item.attr);
    }).filter(item => item !== '');
    return items.length == 0 ? false : true;
  }

  _getAttribute(attr, {entity} = this) {
    return entity.attributes[attr] || '';
  }

  _getLabel(label, fallback = 'unknown') {
    const lang = this._hass.selectedLanguage || this._hass.language;
    const resources = this._hass.resources[lang];
    return (resources && resources[label] ? resources[label] : fallback);
  }

  _style() {
    return html`
      <style>
        div:empty { display: none; }
        ha-card {
          padding: 16px;
          position: relative;
        }
        ha-card header {
          display: none;
        }
        ha-card[has-title] header {
          display: block;
          position: relative;
          font-size: var(--paper-font-headline_-_font-size);
          font-weight: var(--paper-font-headline_-_font-weight);
          letter-spacing: var(--paper-font-headline_-_letter-spacing);
          line-height: var(--paper-font-headline_-_line-height);
          padding: 24px 16px 16px;
        }
        ha-card[has-title] {
          padding-top: 0px;
        }
        ha-card[group] {
          padding: 0;
          background: none;
          box-shadow: none;
        }
        ha-card[group][artwork='cover'][has-artwork] .info {
          margin-top: 10px;
        }
        ha-card[more-info] {
          cursor: pointer;
        }
        ha-card[artwork='cover'][has-artwork] #artwork-cover {
          display: block;
        }
        ha-card[artwork='cover'][has-artwork] paper-icon-button,
        ha-card[artwork='cover'][has-artwork] ha-icon,
        ha-card[artwork='cover'][has-artwork] .info,
        ha-card[artwork='cover'][has-artwork] paper-button,
        ha-card[artwork='cover'][has-artwork] header,
        ha-card[artwork='cover'][has-artwork] .select span {
          color: #FFFFFF;
        }
        ha-card[artwork='cover'][has-artwork] paper-input {
          --paper-input-container-color: #FFFFFF;
          --paper-input-container-input-color: #FFFFFF;
        }
        #artwork-cover {
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center center;
          display: none;
          position: absolute;
          top: 0; left: 0; bottom: 0; right: 0;
        }
        #artwork-cover:before {
          background: #000000;
          content: '';
          opacity: .5;
          position: absolute;
          top: 0; left: 0; bottom: 0; right: 0;
        }
        .flex {
          display: flex;
          display: -ms-flexbox;
          display: -webkit-flex;
          flex-direction: row;
        }
        .justify {
          -webkit-justify-content: space-between;
          justify-content: space-between;
        }
        .hidden {
          display: none;
        }
        .flex-wrap[wrap] {
          flex-wrap: wrap;
        }
        .info {
          margin-left: 16px;
          display: block;
          position: relative;
        }
        #mediacontrols, #tts {
          margin-left: 56px;
          position: relative;
        }
        .info[short] {
          max-height: 40px;
          overflow: hidden;
        }
        #artwork, #icon {
          min-width: 40px;
          height: 40px;
          width: 40px;
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center center;
          border-radius: 100%;
          text-align: center;
          line-height: 40px;
        }
        #artwork[border] {
          border: 2px solid var(--primary-text-color);
          box-sizing: border-box;
          -moz-box-sizing: border-box;
          -webkit-box-sizing: border-box;
        }
        #artwork[state='playing'] {
          border-color: var(--accent-color);
        }
        #playername, .power-state {
          line-height: 40px;
        }
        #playername[has-info] {
          line-height: 20px;
        }
        #icon {
          color: var(--paper-item-icon-color, #44739e);
        }
        #player-name,
        paper-icon-button,
        paper-button,
        .select span {
          color: var(--primary-text-color);
          position: relative;
        }
        #mediainfo {
          color: var(--secondary-text-color);
        }
        #mediainfo[short] {
          word-wrap: break-word;
          display: block;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          max-height: 1.4rem;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        #mediainfo[scroll='true'] div {
          visibility: hidden;
        }
        #mediainfo[scroll='true'] {
          animation: move 10s linear infinite;
          overflow: visible;
        }
        #mediainfo[scroll='true'] .marquee {
          animation: slide 10s linear infinite;
          visibility: visible;
        }
        .marquee {
          position: absolute;
          white-space: nowrap;
          display: inline-block;
        }
        ha-card[artwork='cover'][has-artwork] #mediainfo,
        #power-button[color] {
          color: var(--accent-color);
        }
        #mediainfo span:before {
          content: ' - ';
        }
        #mediainfo span:first-child:before {
          content: '';
        }
        #mediainfo span:empty,
        #source-menu span:empty {
          display: none;
        }
        #tts paper-input {
          flex: 1;
          -webkit-flex: 1;
          cursor: text;
        }
        .power-state {
          padding-left: 5px;
        }
        .power-state,
        .select {
          width: auto;
          margin-right: 0;
          margin-left: auto;
          justify-content: flex-end;
        }
        .power-state,
        .select,
        .power-state paper-slider {
          flex: 1;
        }
        .power-state paper-slider {
          height: 40px;
        }
        .vol-control {
          min-width: 120px;
          flex: 1;
        }
        paper-slider {
          min-width: 80px;
          max-width: 400px;
          width: 100%;
        }
        paper-input {
          opacity: .75;
          --paper-input-container-color: var(--primary-text-color);
          --paper-input-container-focus-color: var(--accent-color);
        }
        paper-input[focused] {
          opacity: 1;
        }
        #source-menu {
          padding: 0;
        }
        #source-menu paper-button {
          margin: 0;
          height: 40px;
          line-height: 20px;
          text-transform: initial;
          min-width: 0;
        }
        #source-menu span {
          position: relative;
          display: block;
          max-width: 60px;
          width: auto;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        #progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          height: var(--paper-progress-height, 4px);
          --paper-progress-active-color: var(--accent-color);
          --paper-progress-container-color: rgba(150,150,150,0.25);
          --paper-progress-transition-duration: 1s;
          --paper-progress-transition-timing-function: linear;
          --paper-progress-transition-delay: 0s;
        }
        ha-card[state='paused'] #progress {
          --paper-progress-active-color: var(--disabled-text-color, rgba(150,150,150,.5));
        }
        ha-card[group] #progress {
          position: relative
        }
        #unavailable {
          white-space: nowrap;
        }
        .entity[hide-info] .info,
        .entity[hide-info] #artwork,
        .entity[hide-info] #icon {
          display: none;
        }
        .entity[hide-info] .power-state,
        .entity[hide-info] .select {
          justify-content: space-between;
        }
        .entity[hide-info] .right {
          justify-content: flex-end;
          margin-left: auto;
        }
        @keyframes slide {
          from {transform: translate(0, 0); }
          to {transform: translate(-100%, 0); }
        }
        @keyframes move {
          from {transform: translate(100%, 0); }
          to {transform: translate(0, 0); }
        }
      </style>
    `;
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('mini-media-player', MiniMediaPlayer);
