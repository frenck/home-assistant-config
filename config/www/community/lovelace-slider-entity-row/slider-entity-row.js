!function(t){var e={};function s(i){if(e[i])return e[i].exports;var a=e[i]={i:i,l:!1,exports:{}};return t[i].call(a.exports,a,a.exports,s),a.l=!0,a.exports}s.m=t,s.c=e,s.d=function(t,e,i){s.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i})},s.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},s.t=function(t,e){if(1&e&&(t=s(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(s.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var a in t)s.d(i,a,function(e){return t[e]}.bind(null,a));return i},s.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return s.d(e,"a",e),e},s.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},s.p="",s(s.s=0)}([function(t,e,s){"use strict";s.r(e);const i=Object.getPrototypeOf(customElements.get("home-assistant-main")),a=i.prototype.html,r=i.prototype.css;class n{constructor(t){this._config=t}set hass(t){this._hass=t,this.stateObj=this._config.entity in t.states?t.states[this._config.entity]:null}get value(){return this._value?Math.round(this._value/this.step)*this.step:0}set value(t){t!==this.value&&(this._value=t)}get string(){return`${this.value}`}get hidden(){return!1}get hasSlider(){return!0}get hasToggle(){return!0}get isOff(){return 0===this.value}get min(){return void 0!==this._config.min?this._config.min:void 0!==this._min?this._min:0}get max(){return void 0!==this._config.max?this._config.max:void 0!==this._max?this._max:100}get step(){return void 0!==this._config.step?this._config.step:void 0!==this._step?this._step:5}}const u={light:class extends n{get _value(){return"on"===this.stateObj.state?Math.ceil(100*this.stateObj.attributes.brightness/255):0}set _value(t){(t=Math.ceil(t/100*255))?this._hass.callService("light","turn_on",{entity_id:this.stateObj.entity_id,brightness:t}):this._hass.callService("light","turn_off",{entity_id:this.stateObj.entity_id})}get string(){return"off"===this.stateObj.state?this._hass.localize("state.default.off"):`${this.value} %`}get hasSlider(){return"brightness"in this.stateObj.attributes||!!("supported_features"in this.stateObj.attributes&&1&this.stateObj.attributes.supported_features)}},media_player:class extends n{get _value(){return"on"===this.stateObj.is_volume_muted?0:Math.ceil(100*this.stateObj.attributes.volume_level)}set _value(t){t/=100,this._hass.callService("media_player","volume_set",{entity_id:this.stateObj.entity_id,volume_level:t})}get isOff(){return"off"===this.stateObj.state}get string(){return this.stateObj.attributes.is_volume_muted?"-":this.stateObj.attributes.volume_level?`${this.value} %`:this._hass.localize("state.media_player.off")}get hasToggle(){return!1}},climate:class extends n{get _value(){return this.stateObj.attributes.temperature}set _value(t){this._hass.callService("climate","set_temperature",{entity_id:this.stateObj.entity_id,temperature:t})}get string(){return"off"===this.stateObj.attributes.operation_mode?this._hass.localize("state.climate.off"):`${this.value} ${this._hass.config.unit_system.temperature}`}get isOff(){return"off"===this.stateObj.attributes.operation_mode}get _min(){return this.stateObj.attributes.min_temp}get _max(){return this.stateObj.attributes.max_temp}get _step(){return 1}},cover:class extends n{get _value(){return"open"===this.stateObj.state?this.stateObj.attributes.current_position:0}set _value(t){this._hass.callService("cover","set_cover_position",{entity_id:this.stateObj.entity_id,position:t})}get string(){return this.hasSlider?"closed"===this.stateObj.state?this._hass.localize("state.cover.closed"):`${this.value} %`:""}get hasToggle(){return!1}get hasSlider(){return"current_position"in this.stateObj.attributes||!!("supported_features"in this.stateObj.attributes&&4&this.stateObj.attributes.supported_features)}get _step(){return 10}},fan:class extends n{get _value(){return"off"!==this.stateObj.state?this.stateObj.attributes.speed_list.indexOf(this.stateObj.attributes.speed):0}set _value(t){t in this.stateObj.attributes.speed_list?this._hass.callService("fan","turn_on",{entity_id:this.stateObj.entity_id,speed:this.stateObj.attributes.speed_list[t]}):this._hass.callService("fan","turn_off",{entity_id:this.stateObj.entity_id})}get string(){return"off"===this.stateObj.state?this._hass.localize("state.default.off"):this.stateObj.attributes.speed}get hasSlider(){return"speed"in this.stateObj.attributes}get _max(){return this.stateObj.attributes.speed_list.length-1}get _step(){return 1}},input_number:class extends n{get _value(){return this.stateObj.state}set _value(t){this._hass.callService("input_number","set_value",{entity_id:this.stateObj.entity_id,value:t})}get string(){return`${parseFloat(this.stateObj.state)}`}get isOff(){return!1}get hasToggle(){return!1}get hasSlider(){return"slider"===this.stateObj.attributes.mode}get _min(){return this.stateObj.attributes.min}get _max(){return this.stateObj.attributes.max}get _step(){return this.stateObj.attributes.step}},input_select:class extends n{get _value(){return this.stateObj.attributes.options.indexOf(this.stateObj.state)}set _value(t){t in this.stateObj.attributes.options&&this._hass.callService("input_select","select_option",{entity_id:this.stateObj.entity_id,option:this.stateObj.attributes.options[t]})}get string(){return this.stateObj.state}get isOff(){return!1}get hasToggle(){return!1}get hasSlider(){return this.stateObj.attributes.options&&this.stateObj.attributes.options.length>0}get _max(){return this.stateObj.attributes.options.length-1}get _step(){return 1}}};customElements.define("slider-entity-row",class extends i{static get properties(){return{hass:{}}}setConfig(t){this._config=t;const e=t.entity.split(".")[0],s=u[e];if(!s)throw new Error(`Unsupported entity type: ${e}`);this.ctrl=new s(t)}render(){const t=this.ctrl;t.hass=this.hass;const e=a`
      <ha-slider
        .min=${t.min}
        .max=${t.max}
        .step=${t.step}
        .value=${t.value}
        pin
        @change=${e=>t.value=this.shadowRoot.querySelector("ha-slider").value}
        class=${this._config.full_row?"full":""}
      ></ha-slider>
    `,s=a`
      <ha-entity-toggle
        .stateObj=${this.hass.states[this._config.entity]}
        .hass=${this.hass}
      ></ha-entity-toggle>
    `,i=a`
    <div class="wrapper" @click=${t=>t.stopPropagation()}>
      ${"unavailable"===t.stateObj.state?a`
          <span class="state">
          unavailable
          </span>
        `:a`
          ${this._config.hide_when_off&&t.isOff||!t.hasSlider?"":e}
          ${this._config.hide_state||this._config.toggle?"":a`
              <span class="state">
                ${t.string}
              </span>
              `}
          ${this._config.toggle&&t.hasToggle?s:""}
        `}
    </div>
    `;return this._config.full_row?i:a`
    <hui-generic-entity-row
      .hass=${this.hass}
      .config=${this._config}
    > ${i} </hui-generic-entity-row>
    `}static get styles(){return r`
      .wrapper {
        display: flex;
        align-items: center;
        height: 40px;
      }
      .state {
        min-width: 45px;
        text-align: end;
      }
      ha-entity-toggle {
        margin-left: 8px;
      }
      ha-slider.full {
        width: 100%;
      }
    `}})}]);