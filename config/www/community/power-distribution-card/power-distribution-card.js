/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function t(t,e,n,i){var o,r=arguments.length,a=r<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,n,i);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(a=(r<3?o(a):r>3?o(e,n,a):o(e,n))||a);return r>3&&a&&Object.defineProperty(e,n,a),a
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */}const e="undefined"!=typeof window&&null!=window.customElements&&void 0!==window.customElements.polyfillWrapFlushCallback,n=(t,e,n=null)=>{for(;e!==n;){const n=e.nextSibling;t.removeChild(e),e=n}},i=`{{lit-${String(Math.random()).slice(2)}}}`,o=`\x3c!--${i}--\x3e`,r=new RegExp(`${i}|${o}`);class a{constructor(t,e){this.parts=[],this.element=e;const n=[],o=[],a=document.createTreeWalker(e.content,133,null,!1);let l=0,u=-1,h=0;const{strings:p,values:{length:f}}=t;for(;h<f;){const t=a.nextNode();if(null!==t){if(u++,1===t.nodeType){if(t.hasAttributes()){const e=t.attributes,{length:n}=e;let i=0;for(let t=0;t<n;t++)s(e[t].name,"$lit$")&&i++;for(;i-- >0;){const e=p[h],n=d.exec(e)[2],i=n.toLowerCase()+"$lit$",o=t.getAttribute(i);t.removeAttribute(i);const a=o.split(r);this.parts.push({type:"attribute",index:u,name:n,strings:a}),h+=a.length-1}}"TEMPLATE"===t.tagName&&(o.push(t),a.currentNode=t.content)}else if(3===t.nodeType){const e=t.data;if(e.indexOf(i)>=0){const i=t.parentNode,o=e.split(r),a=o.length-1;for(let e=0;e<a;e++){let n,r=o[e];if(""===r)n=c();else{const t=d.exec(r);null!==t&&s(t[2],"$lit$")&&(r=r.slice(0,t.index)+t[1]+t[2].slice(0,-"$lit$".length)+t[3]),n=document.createTextNode(r)}i.insertBefore(n,t),this.parts.push({type:"node",index:++u})}""===o[a]?(i.insertBefore(c(),t),n.push(t)):t.data=o[a],h+=a}}else if(8===t.nodeType)if(t.data===i){const e=t.parentNode;null!==t.previousSibling&&u!==l||(u++,e.insertBefore(c(),t)),l=u,this.parts.push({type:"node",index:u}),null===t.nextSibling?t.data="":(n.push(t),u--),h++}else{let e=-1;for(;-1!==(e=t.data.indexOf(i,e+1));)this.parts.push({type:"node",index:-1}),h++}}else a.currentNode=o.pop()}for(const t of n)t.parentNode.removeChild(t)}}const s=(t,e)=>{const n=t.length-e.length;return n>=0&&t.slice(n)===e},l=t=>-1!==t.index,c=()=>document.createComment(""),d=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;function u(t,e){const{element:{content:n},parts:i}=t,o=document.createTreeWalker(n,133,null,!1);let r=p(i),a=i[r],s=-1,l=0;const c=[];let d=null;for(;o.nextNode();){s++;const t=o.currentNode;for(t.previousSibling===d&&(d=null),e.has(t)&&(c.push(t),null===d&&(d=t)),null!==d&&l++;void 0!==a&&a.index===s;)a.index=null!==d?-1:a.index-l,r=p(i,r),a=i[r]}c.forEach((t=>t.parentNode.removeChild(t)))}const h=t=>{let e=11===t.nodeType?0:1;const n=document.createTreeWalker(t,133,null,!1);for(;n.nextNode();)e++;return e},p=(t,e=-1)=>{for(let n=e+1;n<t.length;n++){const e=t[n];if(l(e))return n}return-1};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const f=new WeakMap,g=t=>"function"==typeof t&&f.has(t),m={},v={};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
class b{constructor(t,e,n){this.__parts=[],this.template=t,this.processor=e,this.options=n}update(t){let e=0;for(const n of this.__parts)void 0!==n&&n.setValue(t[e]),e++;for(const t of this.__parts)void 0!==t&&t.commit()}_clone(){const t=e?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),n=[],i=this.template.parts,o=document.createTreeWalker(t,133,null,!1);let r,a=0,s=0,c=o.nextNode();for(;a<i.length;)if(r=i[a],l(r)){for(;s<r.index;)s++,"TEMPLATE"===c.nodeName&&(n.push(c),o.currentNode=c.content),null===(c=o.nextNode())&&(o.currentNode=n.pop(),c=o.nextNode());if("node"===r.type){const t=this.processor.handleTextExpression(this.options);t.insertAfterNode(c.previousSibling),this.__parts.push(t)}else this.__parts.push(...this.processor.handleAttributeExpressions(c,r.name,r.strings,this.options));a++}else this.__parts.push(void 0),a++;return e&&(document.adoptNode(t),customElements.upgrade(t)),t}}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const _=window.trustedTypes&&trustedTypes.createPolicy("lit-html",{createHTML:t=>t}),y=` ${i} `;class w{constructor(t,e,n,i){this.strings=t,this.values=e,this.type=n,this.processor=i}getHTML(){const t=this.strings.length-1;let e="",n=!1;for(let r=0;r<t;r++){const t=this.strings[r],a=t.lastIndexOf("\x3c!--");n=(a>-1||n)&&-1===t.indexOf("--\x3e",a+1);const s=d.exec(t);e+=null===s?t+(n?y:o):t.substr(0,s.index)+s[1]+s[2]+"$lit$"+s[3]+i}return e+=this.strings[t],e}getTemplateElement(){const t=document.createElement("template");let e=this.getHTML();return void 0!==_&&(e=_.createHTML(e)),t.innerHTML=e,t}}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const S=t=>null===t||!("object"==typeof t||"function"==typeof t),E=t=>Array.isArray(t)||!(!t||!t[Symbol.iterator]);class x{constructor(t,e,n){this.dirty=!0,this.element=t,this.name=e,this.strings=n,this.parts=[];for(let t=0;t<n.length-1;t++)this.parts[t]=this._createPart()}_createPart(){return new C(this)}_getValue(){const t=this.strings,e=t.length-1,n=this.parts;if(1===e&&""===t[0]&&""===t[1]){const t=n[0].value;if("symbol"==typeof t)return String(t);if("string"==typeof t||!E(t))return t}let i="";for(let o=0;o<e;o++){i+=t[o];const e=n[o];if(void 0!==e){const t=e.value;if(S(t)||!E(t))i+="string"==typeof t?t:String(t);else for(const e of t)i+="string"==typeof e?e:String(e)}}return i+=t[e],i}commit(){this.dirty&&(this.dirty=!1,this.element.setAttribute(this.name,this._getValue()))}}class C{constructor(t){this.value=void 0,this.committer=t}setValue(t){t===m||S(t)&&t===this.value||(this.value=t,g(t)||(this.committer.dirty=!0))}commit(){for(;g(this.value);){const t=this.value;this.value=m,t(this)}this.value!==m&&this.committer.commit()}}class ${constructor(t){this.value=void 0,this.__pendingValue=void 0,this.options=t}appendInto(t){this.startNode=t.appendChild(c()),this.endNode=t.appendChild(c())}insertAfterNode(t){this.startNode=t,this.endNode=t.nextSibling}appendIntoPart(t){t.__insert(this.startNode=c()),t.__insert(this.endNode=c())}insertAfterPart(t){t.__insert(this.startNode=c()),this.endNode=t.endNode,t.endNode=this.startNode}setValue(t){this.__pendingValue=t}commit(){if(null===this.startNode.parentNode)return;for(;g(this.__pendingValue);){const t=this.__pendingValue;this.__pendingValue=m,t(this)}const t=this.__pendingValue;t!==m&&(S(t)?t!==this.value&&this.__commitText(t):t instanceof w?this.__commitTemplateResult(t):t instanceof Node?this.__commitNode(t):E(t)?this.__commitIterable(t):t===v?(this.value=v,this.clear()):this.__commitText(t))}__insert(t){this.endNode.parentNode.insertBefore(t,this.endNode)}__commitNode(t){this.value!==t&&(this.clear(),this.__insert(t),this.value=t)}__commitText(t){const e=this.startNode.nextSibling,n="string"==typeof(t=null==t?"":t)?t:String(t);e===this.endNode.previousSibling&&3===e.nodeType?e.data=n:this.__commitNode(document.createTextNode(n)),this.value=t}__commitTemplateResult(t){const e=this.options.templateFactory(t);if(this.value instanceof b&&this.value.template===e)this.value.update(t.values);else{const n=new b(e,t.processor,this.options),i=n._clone();n.update(t.values),this.__commitNode(i),this.value=n}}__commitIterable(t){Array.isArray(this.value)||(this.value=[],this.clear());const e=this.value;let n,i=0;for(const o of t)n=e[i],void 0===n&&(n=new $(this.options),e.push(n),0===i?n.appendIntoPart(this):n.insertAfterPart(e[i-1])),n.setValue(o),n.commit(),i++;i<e.length&&(e.length=i,this.clear(n&&n.endNode))}clear(t=this.startNode){n(this.startNode.parentNode,t.nextSibling,this.endNode)}}class T{constructor(t,e,n){if(this.value=void 0,this.__pendingValue=void 0,2!==n.length||""!==n[0]||""!==n[1])throw new Error("Boolean attributes can only contain a single expression");this.element=t,this.name=e,this.strings=n}setValue(t){this.__pendingValue=t}commit(){for(;g(this.__pendingValue);){const t=this.__pendingValue;this.__pendingValue=m,t(this)}if(this.__pendingValue===m)return;const t=!!this.__pendingValue;this.value!==t&&(t?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name),this.value=t),this.__pendingValue=m}}class k extends x{constructor(t,e,n){super(t,e,n),this.single=2===n.length&&""===n[0]&&""===n[1]}_createPart(){return new O(this)}_getValue(){return this.single?this.parts[0].value:super._getValue()}commit(){this.dirty&&(this.dirty=!1,this.element[this.name]=this._getValue())}}class O extends C{}let D=!1;(()=>{try{const t={get capture(){return D=!0,!1}};window.addEventListener("test",t,t),window.removeEventListener("test",t,t)}catch(t){}})();class M{constructor(t,e,n){this.value=void 0,this.__pendingValue=void 0,this.element=t,this.eventName=e,this.eventContext=n,this.__boundHandleEvent=t=>this.handleEvent(t)}setValue(t){this.__pendingValue=t}commit(){for(;g(this.__pendingValue);){const t=this.__pendingValue;this.__pendingValue=m,t(this)}if(this.__pendingValue===m)return;const t=this.__pendingValue,e=this.value,n=null==t||null!=e&&(t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive),i=null!=t&&(null==e||n);n&&this.element.removeEventListener(this.eventName,this.__boundHandleEvent,this.__options),i&&(this.__options=N(t),this.element.addEventListener(this.eventName,this.__boundHandleEvent,this.__options)),this.value=t,this.__pendingValue=m}handleEvent(t){"function"==typeof this.value?this.value.call(this.eventContext||this.element,t):this.value.handleEvent(t)}}const N=t=>t&&(D?{capture:t.capture,passive:t.passive,once:t.once}:t.capture)
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */;function P(t){let e=A.get(t.type);void 0===e&&(e={stringsArray:new WeakMap,keyString:new Map},A.set(t.type,e));let n=e.stringsArray.get(t.strings);if(void 0!==n)return n;const o=t.strings.join(i);return n=e.keyString.get(o),void 0===n&&(n=new a(t,t.getTemplateElement()),e.keyString.set(o,n)),e.stringsArray.set(t.strings,n),n}const A=new Map,V=new WeakMap;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const R=new
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
class{handleAttributeExpressions(t,e,n,i){const o=e[0];if("."===o){return new k(t,e.slice(1),n).parts}if("@"===o)return[new M(t,e.slice(1),i.eventContext)];if("?"===o)return[new T(t,e.slice(1),n)];return new x(t,e,n).parts}handleTextExpression(t){return new $(t)}};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */"undefined"!=typeof window&&(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.3.0");const I=(t,...e)=>new w(t,e,"html",R)
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */,j=(t,e)=>`${t}--${e}`;let Y=!0;void 0===window.ShadyCSS?Y=!1:void 0===window.ShadyCSS.prepareTemplateDom&&(console.warn("Incompatible ShadyCSS version detected. Please update to at least @webcomponents/webcomponentsjs@2.0.2 and @webcomponents/shadycss@1.3.1."),Y=!1);const H=t=>e=>{const n=j(e.type,t);let o=A.get(n);void 0===o&&(o={stringsArray:new WeakMap,keyString:new Map},A.set(n,o));let r=o.stringsArray.get(e.strings);if(void 0!==r)return r;const s=e.strings.join(i);if(r=o.keyString.get(s),void 0===r){const n=e.getTemplateElement();Y&&window.ShadyCSS.prepareTemplateDom(n,t),r=new a(e,n),o.keyString.set(s,r)}return o.stringsArray.set(e.strings,r),r},z=["html","svg"],W=new Set,B=(t,e,n)=>{W.add(t);const i=n?n.element:document.createElement("template"),o=e.querySelectorAll("style"),{length:r}=o;if(0===r)return void window.ShadyCSS.prepareTemplateStyles(i,t);const a=document.createElement("style");for(let t=0;t<r;t++){const e=o[t];e.parentNode.removeChild(e),a.textContent+=e.textContent}(t=>{z.forEach((e=>{const n=A.get(j(e,t));void 0!==n&&n.keyString.forEach((t=>{const{element:{content:e}}=t,n=new Set;Array.from(e.querySelectorAll("style")).forEach((t=>{n.add(t)})),u(t,n)}))}))})(t);const s=i.content;n?function(t,e,n=null){const{element:{content:i},parts:o}=t;if(null==n)return void i.appendChild(e);const r=document.createTreeWalker(i,133,null,!1);let a=p(o),s=0,l=-1;for(;r.nextNode();)for(l++,r.currentNode===n&&(s=h(e),n.parentNode.insertBefore(e,n));-1!==a&&o[a].index===l;){if(s>0){for(;-1!==a;)o[a].index+=s,a=p(o,a);return}a=p(o,a)}}(n,a,s.firstChild):s.insertBefore(a,s.firstChild),window.ShadyCSS.prepareTemplateStyles(i,t);const l=s.querySelector("style");if(window.ShadyCSS.nativeShadow&&null!==l)e.insertBefore(l.cloneNode(!0),e.firstChild);else if(n){s.insertBefore(a,s.firstChild);const t=new Set;t.add(a),u(n,t)}};window.JSCompiler_renameProperty=(t,e)=>t;const L={toAttribute(t,e){switch(e){case Boolean:return t?"":null;case Object:case Array:return null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){switch(e){case Boolean:return null!==t;case Number:return null===t?null:Number(t);case Object:case Array:return JSON.parse(t)}return t}},U=(t,e)=>e!==t&&(e==e||t==t),q={attribute:!0,type:String,converter:L,reflect:!1,hasChanged:U};class F extends HTMLElement{constructor(){super(),this.initialize()}static get observedAttributes(){this.finalize();const t=[];return this._classProperties.forEach(((e,n)=>{const i=this._attributeNameForProperty(n,e);void 0!==i&&(this._attributeToPropertyMap.set(i,n),t.push(i))})),t}static _ensureClassProperties(){if(!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties",this))){this._classProperties=new Map;const t=Object.getPrototypeOf(this)._classProperties;void 0!==t&&t.forEach(((t,e)=>this._classProperties.set(e,t)))}}static createProperty(t,e=q){if(this._ensureClassProperties(),this._classProperties.set(t,e),e.noAccessor||this.prototype.hasOwnProperty(t))return;const n="symbol"==typeof t?Symbol():`__${t}`,i=this.getPropertyDescriptor(t,n,e);void 0!==i&&Object.defineProperty(this.prototype,t,i)}static getPropertyDescriptor(t,e,n){return{get(){return this[e]},set(i){const o=this[t];this[e]=i,this.requestUpdateInternal(t,o,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this._classProperties&&this._classProperties.get(t)||q}static finalize(){const t=Object.getPrototypeOf(this);if(t.hasOwnProperty("finalized")||t.finalize(),this.finalized=!0,this._ensureClassProperties(),this._attributeToPropertyMap=new Map,this.hasOwnProperty(JSCompiler_renameProperty("properties",this))){const t=this.properties,e=[...Object.getOwnPropertyNames(t),..."function"==typeof Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(t):[]];for(const n of e)this.createProperty(n,t[n])}}static _attributeNameForProperty(t,e){const n=e.attribute;return!1===n?void 0:"string"==typeof n?n:"string"==typeof t?t.toLowerCase():void 0}static _valueHasChanged(t,e,n=U){return n(t,e)}static _propertyValueFromAttribute(t,e){const n=e.type,i=e.converter||L,o="function"==typeof i?i:i.fromAttribute;return o?o(t,n):t}static _propertyValueToAttribute(t,e){if(void 0===e.reflect)return;const n=e.type,i=e.converter;return(i&&i.toAttribute||L.toAttribute)(t,n)}initialize(){this._updateState=0,this._updatePromise=new Promise((t=>this._enableUpdatingResolver=t)),this._changedProperties=new Map,this._saveInstanceProperties(),this.requestUpdateInternal()}_saveInstanceProperties(){this.constructor._classProperties.forEach(((t,e)=>{if(this.hasOwnProperty(e)){const t=this[e];delete this[e],this._instanceProperties||(this._instanceProperties=new Map),this._instanceProperties.set(e,t)}}))}_applyInstanceProperties(){this._instanceProperties.forEach(((t,e)=>this[e]=t)),this._instanceProperties=void 0}connectedCallback(){this.enableUpdating()}enableUpdating(){void 0!==this._enableUpdatingResolver&&(this._enableUpdatingResolver(),this._enableUpdatingResolver=void 0)}disconnectedCallback(){}attributeChangedCallback(t,e,n){e!==n&&this._attributeToProperty(t,n)}_propertyToAttribute(t,e,n=q){const i=this.constructor,o=i._attributeNameForProperty(t,n);if(void 0!==o){const t=i._propertyValueToAttribute(e,n);if(void 0===t)return;this._updateState=8|this._updateState,null==t?this.removeAttribute(o):this.setAttribute(o,t),this._updateState=-9&this._updateState}}_attributeToProperty(t,e){if(8&this._updateState)return;const n=this.constructor,i=n._attributeToPropertyMap.get(t);if(void 0!==i){const t=n.getPropertyOptions(i);this._updateState=16|this._updateState,this[i]=n._propertyValueFromAttribute(e,t),this._updateState=-17&this._updateState}}requestUpdateInternal(t,e,n){let i=!0;if(void 0!==t){const o=this.constructor;n=n||o.getPropertyOptions(t),o._valueHasChanged(this[t],e,n.hasChanged)?(this._changedProperties.has(t)||this._changedProperties.set(t,e),!0!==n.reflect||16&this._updateState||(void 0===this._reflectingProperties&&(this._reflectingProperties=new Map),this._reflectingProperties.set(t,n))):i=!1}!this._hasRequestedUpdate&&i&&(this._updatePromise=this._enqueueUpdate())}requestUpdate(t,e){return this.requestUpdateInternal(t,e),this.updateComplete}async _enqueueUpdate(){this._updateState=4|this._updateState;try{await this._updatePromise}catch(t){}const t=this.performUpdate();return null!=t&&await t,!this._hasRequestedUpdate}get _hasRequestedUpdate(){return 4&this._updateState}get hasUpdated(){return 1&this._updateState}performUpdate(){if(!this._hasRequestedUpdate)return;this._instanceProperties&&this._applyInstanceProperties();let t=!1;const e=this._changedProperties;try{t=this.shouldUpdate(e),t?this.update(e):this._markUpdated()}catch(e){throw t=!1,this._markUpdated(),e}t&&(1&this._updateState||(this._updateState=1|this._updateState,this.firstUpdated(e)),this.updated(e))}_markUpdated(){this._changedProperties=new Map,this._updateState=-5&this._updateState}get updateComplete(){return this._getUpdateComplete()}_getUpdateComplete(){return this._updatePromise}shouldUpdate(t){return!0}update(t){void 0!==this._reflectingProperties&&this._reflectingProperties.size>0&&(this._reflectingProperties.forEach(((t,e)=>this._propertyToAttribute(e,this[e],t))),this._reflectingProperties=void 0),this._markUpdated()}updated(t){}firstUpdated(t){}}F.finalized=!0;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const X=t=>e=>"function"==typeof e?((t,e)=>(window.customElements.define(t,e),e))(t,e):((t,e)=>{const{kind:n,elements:i}=e;return{kind:n,elements:i,finisher(e){window.customElements.define(t,e)}}})(t,e),G=(t,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?Object.assign(Object.assign({},e),{finisher(n){n.createProperty(e.key,t)}}):{kind:"field",key:Symbol(),placement:"own",descriptor:{},initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this))},finisher(n){n.createProperty(e.key,t)}};function Z(t){return(e,n)=>void 0!==n?((t,e,n)=>{e.constructor.createProperty(n,t)})(t,e,n):G(t,e)}function J(t){return Z({attribute:!1,hasChanged:null==t?void 0:t.hasChanged})}
/**
@license
Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const K=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Q=Symbol();class tt{constructor(t,e){if(e!==Q)throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t}get styleSheet(){return void 0===this._styleSheet&&(K?(this._styleSheet=new CSSStyleSheet,this._styleSheet.replaceSync(this.cssText)):this._styleSheet=null),this._styleSheet}toString(){return this.cssText}}const et=(t,...e)=>{const n=e.reduce(((e,n,i)=>e+(t=>{if(t instanceof tt)return t.cssText;if("number"==typeof t)return t;throw new Error(`Value passed to 'css' function must be a 'css' function result: ${t}. Use 'unsafeCSS' to pass non-literal values, but\n            take care to ensure page security.`)})(n)+t[i+1]),t[0]);return new tt(n,Q)};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
(window.litElementVersions||(window.litElementVersions=[])).push("2.4.0");const nt={};class it extends F{static getStyles(){return this.styles}static _getUniqueStyles(){if(this.hasOwnProperty(JSCompiler_renameProperty("_styles",this)))return;const t=this.getStyles();if(Array.isArray(t)){const e=(t,n)=>t.reduceRight(((t,n)=>Array.isArray(n)?e(n,t):(t.add(n),t)),n),n=e(t,new Set),i=[];n.forEach((t=>i.unshift(t))),this._styles=i}else this._styles=void 0===t?[]:[t];this._styles=this._styles.map((t=>{if(t instanceof CSSStyleSheet&&!K){const e=Array.prototype.slice.call(t.cssRules).reduce(((t,e)=>t+e.cssText),"");return new tt(String(e),Q)}return t}))}initialize(){super.initialize(),this.constructor._getUniqueStyles(),this.renderRoot=this.createRenderRoot(),window.ShadowRoot&&this.renderRoot instanceof window.ShadowRoot&&this.adoptStyles()}createRenderRoot(){return this.attachShadow({mode:"open"})}adoptStyles(){const t=this.constructor._styles;0!==t.length&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow?K?this.renderRoot.adoptedStyleSheets=t.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):this._needsShimAdoptedStyleSheets=!0:window.ShadyCSS.ScopingShim.prepareAdoptedCssText(t.map((t=>t.cssText)),this.localName))}connectedCallback(){super.connectedCallback(),this.hasUpdated&&void 0!==window.ShadyCSS&&window.ShadyCSS.styleElement(this)}update(t){const e=this.render();super.update(t),e!==nt&&this.constructor.render(e,this.renderRoot,{scopeName:this.localName,eventContext:this}),this._needsShimAdoptedStyleSheets&&(this._needsShimAdoptedStyleSheets=!1,this.constructor._styles.forEach((t=>{const e=document.createElement("style");e.textContent=t.cssText,this.renderRoot.appendChild(e)})))}render(){return nt}}it.finalized=!0,it.render=(t,e,i)=>{if(!i||"object"!=typeof i||!i.scopeName)throw new Error("The `scopeName` option is required.");const o=i.scopeName,r=V.has(e),a=Y&&11===e.nodeType&&!!e.host,s=a&&!W.has(o),l=s?document.createDocumentFragment():e;if(((t,e,i)=>{let o=V.get(e);void 0===o&&(n(e,e.firstChild),V.set(e,o=new $(Object.assign({templateFactory:P},i))),o.appendInto(e)),o.setValue(t),o.commit()})(t,l,Object.assign({templateFactory:H(o)},i)),s){const t=V.get(l);V.delete(l);const i=t.value instanceof b?t.value.template:void 0;B(o,l,i),n(e,e.firstChild),e.appendChild(l),V.set(e,t)}!r&&a&&window.ShadyCSS.styleElement(e.host)};var ot=/d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|Z|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g,rt="[^\\s]+",at=/\[([^]*?)\]/gm;function st(t,e){for(var n=[],i=0,o=t.length;i<o;i++)n.push(t[i].substr(0,e));return n}var lt=function(t){return function(e,n){var i=n[t].map((function(t){return t.toLowerCase()})).indexOf(e.toLowerCase());return i>-1?i:null}};function ct(t){for(var e=[],n=1;n<arguments.length;n++)e[n-1]=arguments[n];for(var i=0,o=e;i<o.length;i++){var r=o[i];for(var a in r)t[a]=r[a]}return t}var dt=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],ut=["January","February","March","April","May","June","July","August","September","October","November","December"],ht=st(ut,3),pt={dayNamesShort:st(dt,3),dayNames:dt,monthNamesShort:ht,monthNames:ut,amPm:["am","pm"],DoFn:function(t){return t+["th","st","nd","rd"][t%10>3?0:(t-t%10!=10?1:0)*t%10]}},ft=ct({},pt),gt=function(t,e){for(void 0===e&&(e=2),t=String(t);t.length<e;)t="0"+t;return t},mt={D:function(t){return String(t.getDate())},DD:function(t){return gt(t.getDate())},Do:function(t,e){return e.DoFn(t.getDate())},d:function(t){return String(t.getDay())},dd:function(t){return gt(t.getDay())},ddd:function(t,e){return e.dayNamesShort[t.getDay()]},dddd:function(t,e){return e.dayNames[t.getDay()]},M:function(t){return String(t.getMonth()+1)},MM:function(t){return gt(t.getMonth()+1)},MMM:function(t,e){return e.monthNamesShort[t.getMonth()]},MMMM:function(t,e){return e.monthNames[t.getMonth()]},YY:function(t){return gt(String(t.getFullYear()),4).substr(2)},YYYY:function(t){return gt(t.getFullYear(),4)},h:function(t){return String(t.getHours()%12||12)},hh:function(t){return gt(t.getHours()%12||12)},H:function(t){return String(t.getHours())},HH:function(t){return gt(t.getHours())},m:function(t){return String(t.getMinutes())},mm:function(t){return gt(t.getMinutes())},s:function(t){return String(t.getSeconds())},ss:function(t){return gt(t.getSeconds())},S:function(t){return String(Math.round(t.getMilliseconds()/100))},SS:function(t){return gt(Math.round(t.getMilliseconds()/10),2)},SSS:function(t){return gt(t.getMilliseconds(),3)},a:function(t,e){return t.getHours()<12?e.amPm[0]:e.amPm[1]},A:function(t,e){return t.getHours()<12?e.amPm[0].toUpperCase():e.amPm[1].toUpperCase()},ZZ:function(t){var e=t.getTimezoneOffset();return(e>0?"-":"+")+gt(100*Math.floor(Math.abs(e)/60)+Math.abs(e)%60,4)},Z:function(t){var e=t.getTimezoneOffset();return(e>0?"-":"+")+gt(Math.floor(Math.abs(e)/60),2)+":"+gt(Math.abs(e)%60,2)}},vt=function(t){return+t-1},bt=[null,"[1-9]\\d?"],_t=[null,rt],yt=["isPm",rt,function(t,e){var n=t.toLowerCase();return n===e.amPm[0]?0:n===e.amPm[1]?1:null}],wt=["timezoneOffset","[^\\s]*?[\\+\\-]\\d\\d:?\\d\\d|[^\\s]*?Z?",function(t){var e=(t+"").match(/([+-]|\d\d)/gi);if(e){var n=60*+e[1]+parseInt(e[2],10);return"+"===e[0]?n:-n}return 0}],St=(lt("monthNamesShort"),lt("monthNames"),{default:"ddd MMM DD YYYY HH:mm:ss",shortDate:"M/D/YY",mediumDate:"MMM D, YYYY",longDate:"MMMM D, YYYY",fullDate:"dddd, MMMM D, YYYY",isoDate:"YYYY-MM-DD",isoDateTime:"YYYY-MM-DDTHH:mm:ssZ",shortTime:"HH:mm",mediumTime:"HH:mm:ss",longTime:"HH:mm:ss.SSS"});var Et=function(t,e,n){if(void 0===e&&(e=St.default),void 0===n&&(n={}),"number"==typeof t&&(t=new Date(t)),"[object Date]"!==Object.prototype.toString.call(t)||isNaN(t.getTime()))throw new Error("Invalid Date pass to format");var i=[];e=(e=St[e]||e).replace(at,(function(t,e){return i.push(e),"@@@"}));var o=ct(ct({},ft),n);return(e=e.replace(ot,(function(e){return mt[e](t,o)}))).replace(/@@@/g,(function(){return i.shift()}))},xt=(function(){try{(new Date).toLocaleDateString("i")}catch(t){return"RangeError"===t.name}}(),function(){try{(new Date).toLocaleString("i")}catch(t){return"RangeError"===t.name}}(),function(){try{(new Date).toLocaleTimeString("i")}catch(t){return"RangeError"===t.name}}(),function(t,e,n,i){i=i||{},n=null==n?{}:n;var o=new Event(e,{bubbles:void 0===i.bubbles||i.bubbles,cancelable:Boolean(i.cancelable),composed:void 0===i.composed||i.composed});return o.detail=n,t.dispatchEvent(o),o}),Ct=new Set(["call-service","divider","section","weblink","cast","select"]),$t={alert:"toggle",automation:"toggle",climate:"climate",cover:"cover",fan:"toggle",group:"group",input_boolean:"toggle",input_number:"input-number",input_select:"input-select",input_text:"input-text",light:"toggle",lock:"lock",media_player:"media-player",remote:"toggle",scene:"scene",script:"script",sensor:"sensor",timer:"timer",switch:"toggle",vacuum:"toggle",water_heater:"climate",input_datetime:"input-datetime"};
/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const Tt=new WeakMap,kt=(Ot=(t,e)=>n=>{const i=Tt.get(n);if(Array.isArray(t)){if(Array.isArray(i)&&i.length===t.length&&t.every(((t,e)=>t===i[e])))return}else if(i===t&&(void 0!==t||Tt.has(n)))return;n.setValue(e()),Tt.set(n,Array.isArray(t)?Array.from(t):t)},(...t)=>{const e=Ot(...t);return f.set(e,!0),e});var Ot;
/**!
 * Sortable 1.13.0
 * @author	RubaXa   <trash@rubaxa.org>
 * @author	owenm    <owen23355@gmail.com>
 * @license MIT
 */
function Dt(t){return(Dt="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function Mt(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function Nt(){return(Nt=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var i in n)Object.prototype.hasOwnProperty.call(n,i)&&(t[i]=n[i])}return t}).apply(this,arguments)}function Pt(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{},i=Object.keys(n);"function"==typeof Object.getOwnPropertySymbols&&(i=i.concat(Object.getOwnPropertySymbols(n).filter((function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable})))),i.forEach((function(e){Mt(t,e,n[e])}))}return t}function At(t,e){if(null==t)return{};var n,i,o=function(t,e){if(null==t)return{};var n,i,o={},r=Object.keys(t);for(i=0;i<r.length;i++)n=r[i],e.indexOf(n)>=0||(o[n]=t[n]);return o}(t,e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);for(i=0;i<r.length;i++)n=r[i],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(o[n]=t[n])}return o}function Vt(t){if("undefined"!=typeof window&&window.navigator)return!!navigator.userAgent.match(t)}var Rt=Vt(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i),It=Vt(/Edge/i),jt=Vt(/firefox/i),Yt=Vt(/safari/i)&&!Vt(/chrome/i)&&!Vt(/android/i),Ht=Vt(/iP(ad|od|hone)/i),zt=Vt(/chrome/i)&&Vt(/android/i),Wt={capture:!1,passive:!1};function Bt(t,e,n){t.addEventListener(e,n,!Rt&&Wt)}function Lt(t,e,n){t.removeEventListener(e,n,!Rt&&Wt)}function Ut(t,e){if(e){if(">"===e[0]&&(e=e.substring(1)),t)try{if(t.matches)return t.matches(e);if(t.msMatchesSelector)return t.msMatchesSelector(e);if(t.webkitMatchesSelector)return t.webkitMatchesSelector(e)}catch(t){return!1}return!1}}function qt(t){return t.host&&t!==document&&t.host.nodeType?t.host:t.parentNode}function Ft(t,e,n,i){if(t){n=n||document;do{if(null!=e&&(">"===e[0]?t.parentNode===n&&Ut(t,e):Ut(t,e))||i&&t===n)return t;if(t===n)break}while(t=qt(t))}return null}var Xt,Gt=/\s+/g;function Zt(t,e,n){if(t&&e)if(t.classList)t.classList[n?"add":"remove"](e);else{var i=(" "+t.className+" ").replace(Gt," ").replace(" "+e+" "," ");t.className=(i+(n?" "+e:"")).replace(Gt," ")}}function Jt(t,e,n){var i=t&&t.style;if(i){if(void 0===n)return document.defaultView&&document.defaultView.getComputedStyle?n=document.defaultView.getComputedStyle(t,""):t.currentStyle&&(n=t.currentStyle),void 0===e?n:n[e];e in i||-1!==e.indexOf("webkit")||(e="-webkit-"+e),i[e]=n+("string"==typeof n?"":"px")}}function Kt(t,e){var n="";if("string"==typeof t)n=t;else do{var i=Jt(t,"transform");i&&"none"!==i&&(n=i+" "+n)}while(!e&&(t=t.parentNode));var o=window.DOMMatrix||window.WebKitCSSMatrix||window.CSSMatrix||window.MSCSSMatrix;return o&&new o(n)}function Qt(t,e,n){if(t){var i=t.getElementsByTagName(e),o=0,r=i.length;if(n)for(;o<r;o++)n(i[o],o);return i}return[]}function te(){var t=document.scrollingElement;return t||document.documentElement}function ee(t,e,n,i,o){if(t.getBoundingClientRect||t===window){var r,a,s,l,c,d,u;if(t!==window&&t.parentNode&&t!==te()?(a=(r=t.getBoundingClientRect()).top,s=r.left,l=r.bottom,c=r.right,d=r.height,u=r.width):(a=0,s=0,l=window.innerHeight,c=window.innerWidth,d=window.innerHeight,u=window.innerWidth),(e||n)&&t!==window&&(o=o||t.parentNode,!Rt))do{if(o&&o.getBoundingClientRect&&("none"!==Jt(o,"transform")||n&&"static"!==Jt(o,"position"))){var h=o.getBoundingClientRect();a-=h.top+parseInt(Jt(o,"border-top-width")),s-=h.left+parseInt(Jt(o,"border-left-width")),l=a+r.height,c=s+r.width;break}}while(o=o.parentNode);if(i&&t!==window){var p=Kt(o||t),f=p&&p.a,g=p&&p.d;p&&(l=(a/=g)+(d/=g),c=(s/=f)+(u/=f))}return{top:a,left:s,bottom:l,right:c,width:u,height:d}}}function ne(t,e,n){for(var i=se(t,!0),o=ee(t)[e];i;){var r=ee(i)[n];if(!("top"===n||"left"===n?o>=r:o<=r))return i;if(i===te())break;i=se(i,!1)}return!1}function ie(t,e,n){for(var i=0,o=0,r=t.children;o<r.length;){if("none"!==r[o].style.display&&r[o]!==ln.ghost&&r[o]!==ln.dragged&&Ft(r[o],n.draggable,t,!1)){if(i===e)return r[o];i++}o++}return null}function oe(t,e){for(var n=t.lastElementChild;n&&(n===ln.ghost||"none"===Jt(n,"display")||e&&!Ut(n,e));)n=n.previousElementSibling;return n||null}function re(t,e){var n=0;if(!t||!t.parentNode)return-1;for(;t=t.previousElementSibling;)"TEMPLATE"===t.nodeName.toUpperCase()||t===ln.clone||e&&!Ut(t,e)||n++;return n}function ae(t){var e=0,n=0,i=te();if(t)do{var o=Kt(t),r=o.a,a=o.d;e+=t.scrollLeft*r,n+=t.scrollTop*a}while(t!==i&&(t=t.parentNode));return[e,n]}function se(t,e){if(!t||!t.getBoundingClientRect)return te();var n=t,i=!1;do{if(n.clientWidth<n.scrollWidth||n.clientHeight<n.scrollHeight){var o=Jt(n);if(n.clientWidth<n.scrollWidth&&("auto"==o.overflowX||"scroll"==o.overflowX)||n.clientHeight<n.scrollHeight&&("auto"==o.overflowY||"scroll"==o.overflowY)){if(!n.getBoundingClientRect||n===document.body)return te();if(i||e)return n;i=!0}}}while(n=n.parentNode);return te()}function le(t,e){return Math.round(t.top)===Math.round(e.top)&&Math.round(t.left)===Math.round(e.left)&&Math.round(t.height)===Math.round(e.height)&&Math.round(t.width)===Math.round(e.width)}function ce(t){var e=window.Polymer,n=window.jQuery||window.Zepto;return e&&e.dom?e.dom(t).cloneNode(!0):n?n(t).clone(!0)[0]:t.cloneNode(!0)}var de="Sortable"+(new Date).getTime();function ue(){var t,e=[];return{captureAnimationState:function(){(e=[],this.options.animation)&&[].slice.call(this.el.children).forEach((function(t){if("none"!==Jt(t,"display")&&t!==ln.ghost){e.push({target:t,rect:ee(t)});var n=Pt({},e[e.length-1].rect);if(t.thisAnimationDuration){var i=Kt(t,!0);i&&(n.top-=i.f,n.left-=i.e)}t.fromRect=n}}))},addAnimationState:function(t){e.push(t)},removeAnimationState:function(t){e.splice(function(t,e){for(var n in t)if(t.hasOwnProperty(n))for(var i in e)if(e.hasOwnProperty(i)&&e[i]===t[n][i])return Number(n);return-1}(e,{target:t}),1)},animateAll:function(n){var i=this;if(!this.options.animation)return clearTimeout(t),void("function"==typeof n&&n());var o=!1,r=0;e.forEach((function(t){var e=0,n=t.target,a=n.fromRect,s=ee(n),l=n.prevFromRect,c=n.prevToRect,d=t.rect,u=Kt(n,!0);u&&(s.top-=u.f,s.left-=u.e),n.toRect=s,n.thisAnimationDuration&&le(l,s)&&!le(a,s)&&(d.top-s.top)/(d.left-s.left)==(a.top-s.top)/(a.left-s.left)&&(e=function(t,e,n,i){return Math.sqrt(Math.pow(e.top-t.top,2)+Math.pow(e.left-t.left,2))/Math.sqrt(Math.pow(e.top-n.top,2)+Math.pow(e.left-n.left,2))*i.animation}(d,l,c,i.options)),le(s,a)||(n.prevFromRect=a,n.prevToRect=s,e||(e=i.options.animation),i.animate(n,d,s,e)),e&&(o=!0,r=Math.max(r,e),clearTimeout(n.animationResetTimer),n.animationResetTimer=setTimeout((function(){n.animationTime=0,n.prevFromRect=null,n.fromRect=null,n.prevToRect=null,n.thisAnimationDuration=null}),e),n.thisAnimationDuration=e)})),clearTimeout(t),o?t=setTimeout((function(){"function"==typeof n&&n()}),r):"function"==typeof n&&n(),e=[]},animate:function(t,e,n,i){if(i){Jt(t,"transition",""),Jt(t,"transform","");var o=Kt(this.el),r=o&&o.a,a=o&&o.d,s=(e.left-n.left)/(r||1),l=(e.top-n.top)/(a||1);t.animatingX=!!s,t.animatingY=!!l,Jt(t,"transform","translate3d("+s+"px,"+l+"px,0)"),this.forRepaintDummy=function(t){return t.offsetWidth}(t),Jt(t,"transition","transform "+i+"ms"+(this.options.easing?" "+this.options.easing:"")),Jt(t,"transform","translate3d(0,0,0)"),"number"==typeof t.animated&&clearTimeout(t.animated),t.animated=setTimeout((function(){Jt(t,"transition",""),Jt(t,"transform",""),t.animated=!1,t.animatingX=!1,t.animatingY=!1}),i)}}}}var he=[],pe={initializeByDefault:!0},fe={mount:function(t){for(var e in pe)pe.hasOwnProperty(e)&&!(e in t)&&(t[e]=pe[e]);he.forEach((function(e){if(e.pluginName===t.pluginName)throw"Sortable: Cannot mount plugin ".concat(t.pluginName," more than once")})),he.push(t)},pluginEvent:function(t,e,n){var i=this;this.eventCanceled=!1,n.cancel=function(){i.eventCanceled=!0};var o=t+"Global";he.forEach((function(i){e[i.pluginName]&&(e[i.pluginName][o]&&e[i.pluginName][o](Pt({sortable:e},n)),e.options[i.pluginName]&&e[i.pluginName][t]&&e[i.pluginName][t](Pt({sortable:e},n)))}))},initializePlugins:function(t,e,n,i){for(var o in he.forEach((function(i){var o=i.pluginName;if(t.options[o]||i.initializeByDefault){var r=new i(t,e,t.options);r.sortable=t,r.options=t.options,t[o]=r,Nt(n,r.defaults)}})),t.options)if(t.options.hasOwnProperty(o)){var r=this.modifyOption(t,o,t.options[o]);void 0!==r&&(t.options[o]=r)}},getEventProperties:function(t,e){var n={};return he.forEach((function(i){"function"==typeof i.eventProperties&&Nt(n,i.eventProperties.call(e[i.pluginName],t))})),n},modifyOption:function(t,e,n){var i;return he.forEach((function(o){t[o.pluginName]&&o.optionListeners&&"function"==typeof o.optionListeners[e]&&(i=o.optionListeners[e].call(t[o.pluginName],n))})),i}};var ge=function(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},i=n.evt,o=At(n,["evt"]);fe.pluginEvent.bind(ln)(t,e,Pt({dragEl:ve,parentEl:be,ghostEl:_e,rootEl:ye,nextEl:we,lastDownEl:Se,cloneEl:Ee,cloneHidden:xe,dragStarted:Ie,putSortable:De,activeSortable:ln.active,originalEvent:i,oldIndex:Ce,oldDraggableIndex:Te,newIndex:$e,newDraggableIndex:ke,hideGhostForTarget:on,unhideGhostForTarget:rn,cloneNowHidden:function(){xe=!0},cloneNowShown:function(){xe=!1},dispatchSortableEvent:function(t){me({sortable:e,name:t,originalEvent:i})}},o))};function me(t){!function(t){var e=t.sortable,n=t.rootEl,i=t.name,o=t.targetEl,r=t.cloneEl,a=t.toEl,s=t.fromEl,l=t.oldIndex,c=t.newIndex,d=t.oldDraggableIndex,u=t.newDraggableIndex,h=t.originalEvent,p=t.putSortable,f=t.extraEventProperties;if(e=e||n&&n[de]){var g,m=e.options,v="on"+i.charAt(0).toUpperCase()+i.substr(1);!window.CustomEvent||Rt||It?(g=document.createEvent("Event")).initEvent(i,!0,!0):g=new CustomEvent(i,{bubbles:!0,cancelable:!0}),g.to=a||n,g.from=s||n,g.item=o||n,g.clone=r,g.oldIndex=l,g.newIndex=c,g.oldDraggableIndex=d,g.newDraggableIndex=u,g.originalEvent=h,g.pullMode=p?p.lastPutMode:void 0;var b=Pt({},f,fe.getEventProperties(i,e));for(var _ in b)g[_]=b[_];n&&n.dispatchEvent(g),m[v]&&m[v].call(e,g)}}(Pt({putSortable:De,cloneEl:Ee,targetEl:ve,rootEl:ye,oldIndex:Ce,oldDraggableIndex:Te,newIndex:$e,newDraggableIndex:ke},t))}var ve,be,_e,ye,we,Se,Ee,xe,Ce,$e,Te,ke,Oe,De,Me,Ne,Pe,Ae,Ve,Re,Ie,je,Ye,He,ze,We=!1,Be=!1,Le=[],Ue=!1,qe=!1,Fe=[],Xe=!1,Ge=[],Ze="undefined"!=typeof document,Je=Ht,Ke=It||Rt?"cssFloat":"float",Qe=Ze&&!zt&&!Ht&&"draggable"in document.createElement("div"),tn=function(){if(Ze){if(Rt)return!1;var t=document.createElement("x");return t.style.cssText="pointer-events:auto","auto"===t.style.pointerEvents}}(),en=function(t,e){var n=Jt(t),i=parseInt(n.width)-parseInt(n.paddingLeft)-parseInt(n.paddingRight)-parseInt(n.borderLeftWidth)-parseInt(n.borderRightWidth),o=ie(t,0,e),r=ie(t,1,e),a=o&&Jt(o),s=r&&Jt(r),l=a&&parseInt(a.marginLeft)+parseInt(a.marginRight)+ee(o).width,c=s&&parseInt(s.marginLeft)+parseInt(s.marginRight)+ee(r).width;if("flex"===n.display)return"column"===n.flexDirection||"column-reverse"===n.flexDirection?"vertical":"horizontal";if("grid"===n.display)return n.gridTemplateColumns.split(" ").length<=1?"vertical":"horizontal";if(o&&a.float&&"none"!==a.float){var d="left"===a.float?"left":"right";return!r||"both"!==s.clear&&s.clear!==d?"horizontal":"vertical"}return o&&("block"===a.display||"flex"===a.display||"table"===a.display||"grid"===a.display||l>=i&&"none"===n[Ke]||r&&"none"===n[Ke]&&l+c>i)?"vertical":"horizontal"},nn=function(t){function e(t,n){return function(i,o,r,a){var s=i.options.group.name&&o.options.group.name&&i.options.group.name===o.options.group.name;if(null==t&&(n||s))return!0;if(null==t||!1===t)return!1;if(n&&"clone"===t)return t;if("function"==typeof t)return e(t(i,o,r,a),n)(i,o,r,a);var l=(n?i:o).options.group.name;return!0===t||"string"==typeof t&&t===l||t.join&&t.indexOf(l)>-1}}var n={},i=t.group;i&&"object"==Dt(i)||(i={name:i}),n.name=i.name,n.checkPull=e(i.pull,!0),n.checkPut=e(i.put),n.revertClone=i.revertClone,t.group=n},on=function(){!tn&&_e&&Jt(_e,"display","none")},rn=function(){!tn&&_e&&Jt(_e,"display","")};Ze&&document.addEventListener("click",(function(t){if(Be)return t.preventDefault(),t.stopPropagation&&t.stopPropagation(),t.stopImmediatePropagation&&t.stopImmediatePropagation(),Be=!1,!1}),!0);var an=function(t){if(ve){t=t.touches?t.touches[0]:t;var e=(o=t.clientX,r=t.clientY,Le.some((function(t){if(!oe(t)){var e=ee(t),n=t[de].options.emptyInsertThreshold,i=o>=e.left-n&&o<=e.right+n,s=r>=e.top-n&&r<=e.bottom+n;return n&&i&&s?a=t:void 0}})),a);if(e){var n={};for(var i in t)t.hasOwnProperty(i)&&(n[i]=t[i]);n.target=n.rootEl=e,n.preventDefault=void 0,n.stopPropagation=void 0,e[de]._onDragOver(n)}}var o,r,a},sn=function(t){ve&&ve.parentNode[de]._isOutsideThisEl(t.target)};function ln(t,e){if(!t||!t.nodeType||1!==t.nodeType)throw"Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(t));this.el=t,this.options=e=Nt({},e),t[de]=this;var n={group:null,sort:!0,disabled:!1,store:null,handle:null,draggable:/^[uo]l$/i.test(t.nodeName)?">li":">*",swapThreshold:1,invertSwap:!1,invertedSwapThreshold:null,removeCloneOnHide:!0,direction:function(){return en(t,this.options)},ghostClass:"sortable-ghost",chosenClass:"sortable-chosen",dragClass:"sortable-drag",ignore:"a, img",filter:null,preventOnFilter:!0,animation:0,easing:null,setData:function(t,e){t.setData("Text",e.textContent)},dropBubble:!1,dragoverBubble:!1,dataIdAttr:"data-id",delay:0,delayOnTouchOnly:!1,touchStartThreshold:(Number.parseInt?Number:window).parseInt(window.devicePixelRatio,10)||1,forceFallback:!1,fallbackClass:"sortable-fallback",fallbackOnBody:!1,fallbackTolerance:0,fallbackOffset:{x:0,y:0},supportPointer:!1!==ln.supportPointer&&"PointerEvent"in window&&!Yt,emptyInsertThreshold:5};for(var i in fe.initializePlugins(this,t,n),n)!(i in e)&&(e[i]=n[i]);for(var o in nn(e),this)"_"===o.charAt(0)&&"function"==typeof this[o]&&(this[o]=this[o].bind(this));this.nativeDraggable=!e.forceFallback&&Qe,this.nativeDraggable&&(this.options.touchStartThreshold=1),e.supportPointer?Bt(t,"pointerdown",this._onTapStart):(Bt(t,"mousedown",this._onTapStart),Bt(t,"touchstart",this._onTapStart)),this.nativeDraggable&&(Bt(t,"dragover",this),Bt(t,"dragenter",this)),Le.push(this.el),e.store&&e.store.get&&this.sort(e.store.get(this)||[]),Nt(this,ue())}function cn(t,e,n,i,o,r,a,s){var l,c,d=t[de],u=d.options.onMove;return!window.CustomEvent||Rt||It?(l=document.createEvent("Event")).initEvent("move",!0,!0):l=new CustomEvent("move",{bubbles:!0,cancelable:!0}),l.to=e,l.from=t,l.dragged=n,l.draggedRect=i,l.related=o||e,l.relatedRect=r||ee(e),l.willInsertAfter=s,l.originalEvent=a,t.dispatchEvent(l),u&&(c=u.call(d,l,a)),c}function dn(t){t.draggable=!1}function un(){Xe=!1}function hn(t){for(var e=t.tagName+t.className+t.src+t.href+t.textContent,n=e.length,i=0;n--;)i+=e.charCodeAt(n);return i.toString(36)}function pn(t){return setTimeout(t,0)}function fn(t){return clearTimeout(t)}ln.prototype={constructor:ln,_isOutsideThisEl:function(t){this.el.contains(t)||t===this.el||(je=null)},_getDirection:function(t,e){return"function"==typeof this.options.direction?this.options.direction.call(this,t,e,ve):this.options.direction},_onTapStart:function(t){if(t.cancelable){var e=this,n=this.el,i=this.options,o=i.preventOnFilter,r=t.type,a=t.touches&&t.touches[0]||t.pointerType&&"touch"===t.pointerType&&t,s=(a||t).target,l=t.target.shadowRoot&&(t.path&&t.path[0]||t.composedPath&&t.composedPath()[0])||s,c=i.filter;if(function(t){Ge.length=0;var e=t.getElementsByTagName("input"),n=e.length;for(;n--;){var i=e[n];i.checked&&Ge.push(i)}}(n),!ve&&!(/mousedown|pointerdown/.test(r)&&0!==t.button||i.disabled)&&!l.isContentEditable&&(this.nativeDraggable||!Yt||!s||"SELECT"!==s.tagName.toUpperCase())&&!((s=Ft(s,i.draggable,n,!1))&&s.animated||Se===s)){if(Ce=re(s),Te=re(s,i.draggable),"function"==typeof c){if(c.call(this,t,s,this))return me({sortable:e,rootEl:l,name:"filter",targetEl:s,toEl:n,fromEl:n}),ge("filter",e,{evt:t}),void(o&&t.cancelable&&t.preventDefault())}else if(c&&(c=c.split(",").some((function(i){if(i=Ft(l,i.trim(),n,!1))return me({sortable:e,rootEl:i,name:"filter",targetEl:s,fromEl:n,toEl:n}),ge("filter",e,{evt:t}),!0}))))return void(o&&t.cancelable&&t.preventDefault());i.handle&&!Ft(l,i.handle,n,!1)||this._prepareDragStart(t,a,s)}}},_prepareDragStart:function(t,e,n){var i,o=this,r=o.el,a=o.options,s=r.ownerDocument;if(n&&!ve&&n.parentNode===r){var l=ee(n);if(ye=r,be=(ve=n).parentNode,we=ve.nextSibling,Se=n,Oe=a.group,ln.dragged=ve,Me={target:ve,clientX:(e||t).clientX,clientY:(e||t).clientY},Ve=Me.clientX-l.left,Re=Me.clientY-l.top,this._lastX=(e||t).clientX,this._lastY=(e||t).clientY,ve.style["will-change"]="all",i=function(){ge("delayEnded",o,{evt:t}),ln.eventCanceled?o._onDrop():(o._disableDelayedDragEvents(),!jt&&o.nativeDraggable&&(ve.draggable=!0),o._triggerDragStart(t,e),me({sortable:o,name:"choose",originalEvent:t}),Zt(ve,a.chosenClass,!0))},a.ignore.split(",").forEach((function(t){Qt(ve,t.trim(),dn)})),Bt(s,"dragover",an),Bt(s,"mousemove",an),Bt(s,"touchmove",an),Bt(s,"mouseup",o._onDrop),Bt(s,"touchend",o._onDrop),Bt(s,"touchcancel",o._onDrop),jt&&this.nativeDraggable&&(this.options.touchStartThreshold=4,ve.draggable=!0),ge("delayStart",this,{evt:t}),!a.delay||a.delayOnTouchOnly&&!e||this.nativeDraggable&&(It||Rt))i();else{if(ln.eventCanceled)return void this._onDrop();Bt(s,"mouseup",o._disableDelayedDrag),Bt(s,"touchend",o._disableDelayedDrag),Bt(s,"touchcancel",o._disableDelayedDrag),Bt(s,"mousemove",o._delayedDragTouchMoveHandler),Bt(s,"touchmove",o._delayedDragTouchMoveHandler),a.supportPointer&&Bt(s,"pointermove",o._delayedDragTouchMoveHandler),o._dragStartTimer=setTimeout(i,a.delay)}}},_delayedDragTouchMoveHandler:function(t){var e=t.touches?t.touches[0]:t;Math.max(Math.abs(e.clientX-this._lastX),Math.abs(e.clientY-this._lastY))>=Math.floor(this.options.touchStartThreshold/(this.nativeDraggable&&window.devicePixelRatio||1))&&this._disableDelayedDrag()},_disableDelayedDrag:function(){ve&&dn(ve),clearTimeout(this._dragStartTimer),this._disableDelayedDragEvents()},_disableDelayedDragEvents:function(){var t=this.el.ownerDocument;Lt(t,"mouseup",this._disableDelayedDrag),Lt(t,"touchend",this._disableDelayedDrag),Lt(t,"touchcancel",this._disableDelayedDrag),Lt(t,"mousemove",this._delayedDragTouchMoveHandler),Lt(t,"touchmove",this._delayedDragTouchMoveHandler),Lt(t,"pointermove",this._delayedDragTouchMoveHandler)},_triggerDragStart:function(t,e){e=e||"touch"==t.pointerType&&t,!this.nativeDraggable||e?this.options.supportPointer?Bt(document,"pointermove",this._onTouchMove):Bt(document,e?"touchmove":"mousemove",this._onTouchMove):(Bt(ve,"dragend",this),Bt(ye,"dragstart",this._onDragStart));try{document.selection?pn((function(){document.selection.empty()})):window.getSelection().removeAllRanges()}catch(t){}},_dragStarted:function(t,e){if(We=!1,ye&&ve){ge("dragStarted",this,{evt:e}),this.nativeDraggable&&Bt(document,"dragover",sn);var n=this.options;!t&&Zt(ve,n.dragClass,!1),Zt(ve,n.ghostClass,!0),ln.active=this,t&&this._appendGhost(),me({sortable:this,name:"start",originalEvent:e})}else this._nulling()},_emulateDragOver:function(){if(Ne){this._lastX=Ne.clientX,this._lastY=Ne.clientY,on();for(var t=document.elementFromPoint(Ne.clientX,Ne.clientY),e=t;t&&t.shadowRoot&&(t=t.shadowRoot.elementFromPoint(Ne.clientX,Ne.clientY))!==e;)e=t;if(ve.parentNode[de]._isOutsideThisEl(t),e)do{if(e[de]){if(e[de]._onDragOver({clientX:Ne.clientX,clientY:Ne.clientY,target:t,rootEl:e})&&!this.options.dragoverBubble)break}t=e}while(e=e.parentNode);rn()}},_onTouchMove:function(t){if(Me){var e=this.options,n=e.fallbackTolerance,i=e.fallbackOffset,o=t.touches?t.touches[0]:t,r=_e&&Kt(_e,!0),a=_e&&r&&r.a,s=_e&&r&&r.d,l=Je&&ze&&ae(ze),c=(o.clientX-Me.clientX+i.x)/(a||1)+(l?l[0]-Fe[0]:0)/(a||1),d=(o.clientY-Me.clientY+i.y)/(s||1)+(l?l[1]-Fe[1]:0)/(s||1);if(!ln.active&&!We){if(n&&Math.max(Math.abs(o.clientX-this._lastX),Math.abs(o.clientY-this._lastY))<n)return;this._onDragStart(t,!0)}if(_e){r?(r.e+=c-(Pe||0),r.f+=d-(Ae||0)):r={a:1,b:0,c:0,d:1,e:c,f:d};var u="matrix(".concat(r.a,",").concat(r.b,",").concat(r.c,",").concat(r.d,",").concat(r.e,",").concat(r.f,")");Jt(_e,"webkitTransform",u),Jt(_e,"mozTransform",u),Jt(_e,"msTransform",u),Jt(_e,"transform",u),Pe=c,Ae=d,Ne=o}t.cancelable&&t.preventDefault()}},_appendGhost:function(){if(!_e){var t=this.options.fallbackOnBody?document.body:ye,e=ee(ve,!0,Je,!0,t),n=this.options;if(Je){for(ze=t;"static"===Jt(ze,"position")&&"none"===Jt(ze,"transform")&&ze!==document;)ze=ze.parentNode;ze!==document.body&&ze!==document.documentElement?(ze===document&&(ze=te()),e.top+=ze.scrollTop,e.left+=ze.scrollLeft):ze=te(),Fe=ae(ze)}Zt(_e=ve.cloneNode(!0),n.ghostClass,!1),Zt(_e,n.fallbackClass,!0),Zt(_e,n.dragClass,!0),Jt(_e,"transition",""),Jt(_e,"transform",""),Jt(_e,"box-sizing","border-box"),Jt(_e,"margin",0),Jt(_e,"top",e.top),Jt(_e,"left",e.left),Jt(_e,"width",e.width),Jt(_e,"height",e.height),Jt(_e,"opacity","0.8"),Jt(_e,"position",Je?"absolute":"fixed"),Jt(_e,"zIndex","100000"),Jt(_e,"pointerEvents","none"),ln.ghost=_e,t.appendChild(_e),Jt(_e,"transform-origin",Ve/parseInt(_e.style.width)*100+"% "+Re/parseInt(_e.style.height)*100+"%")}},_onDragStart:function(t,e){var n=this,i=t.dataTransfer,o=n.options;ge("dragStart",this,{evt:t}),ln.eventCanceled?this._onDrop():(ge("setupClone",this),ln.eventCanceled||((Ee=ce(ve)).draggable=!1,Ee.style["will-change"]="",this._hideClone(),Zt(Ee,this.options.chosenClass,!1),ln.clone=Ee),n.cloneId=pn((function(){ge("clone",n),ln.eventCanceled||(n.options.removeCloneOnHide||ye.insertBefore(Ee,ve),n._hideClone(),me({sortable:n,name:"clone"}))})),!e&&Zt(ve,o.dragClass,!0),e?(Be=!0,n._loopId=setInterval(n._emulateDragOver,50)):(Lt(document,"mouseup",n._onDrop),Lt(document,"touchend",n._onDrop),Lt(document,"touchcancel",n._onDrop),i&&(i.effectAllowed="move",o.setData&&o.setData.call(n,i,ve)),Bt(document,"drop",n),Jt(ve,"transform","translateZ(0)")),We=!0,n._dragStartId=pn(n._dragStarted.bind(n,e,t)),Bt(document,"selectstart",n),Ie=!0,Yt&&Jt(document.body,"user-select","none"))},_onDragOver:function(t){var e,n,i,o,r=this.el,a=t.target,s=this.options,l=s.group,c=ln.active,d=Oe===l,u=s.sort,h=De||c,p=this,f=!1;if(!Xe){if(void 0!==t.preventDefault&&t.cancelable&&t.preventDefault(),a=Ft(a,s.draggable,r,!0),k("dragOver"),ln.eventCanceled)return f;if(ve.contains(t.target)||a.animated&&a.animatingX&&a.animatingY||p._ignoreWhileAnimating===a)return D(!1);if(Be=!1,c&&!s.disabled&&(d?u||(i=!ye.contains(ve)):De===this||(this.lastPutMode=Oe.checkPull(this,c,ve,t))&&l.checkPut(this,c,ve,t))){if(o="vertical"===this._getDirection(t,a),e=ee(ve),k("dragOverValid"),ln.eventCanceled)return f;if(i)return be=ye,O(),this._hideClone(),k("revert"),ln.eventCanceled||(we?ye.insertBefore(ve,we):ye.appendChild(ve)),D(!0);var g=oe(r,s.draggable);if(!g||function(t,e,n){var i=ee(oe(n.el,n.options.draggable)),o=10;return e?t.clientX>i.right+o||t.clientX<=i.right&&t.clientY>i.bottom&&t.clientX>=i.left:t.clientX>i.right&&t.clientY>i.top||t.clientX<=i.right&&t.clientY>i.bottom+o}(t,o,this)&&!g.animated){if(g===ve)return D(!1);if(g&&r===t.target&&(a=g),a&&(n=ee(a)),!1!==cn(ye,r,ve,e,a,n,t,!!a))return O(),r.appendChild(ve),be=r,M(),D(!0)}else if(a.parentNode===r){n=ee(a);var m,v,b,_=ve.parentNode!==r,y=!function(t,e,n){var i=n?t.left:t.top,o=n?t.right:t.bottom,r=n?t.width:t.height,a=n?e.left:e.top,s=n?e.right:e.bottom,l=n?e.width:e.height;return i===a||o===s||i+r/2===a+l/2}(ve.animated&&ve.toRect||e,a.animated&&a.toRect||n,o),w=o?"top":"left",S=ne(a,"top","top")||ne(ve,"top","top"),E=S?S.scrollTop:void 0;if(je!==a&&(v=n[w],Ue=!1,qe=!y&&s.invertSwap||_),0!==(m=function(t,e,n,i,o,r,a,s){var l=i?t.clientY:t.clientX,c=i?n.height:n.width,d=i?n.top:n.left,u=i?n.bottom:n.right,h=!1;if(!a)if(s&&He<c*o){if(!Ue&&(1===Ye?l>d+c*r/2:l<u-c*r/2)&&(Ue=!0),Ue)h=!0;else if(1===Ye?l<d+He:l>u-He)return-Ye}else if(l>d+c*(1-o)/2&&l<u-c*(1-o)/2)return function(t){return re(ve)<re(t)?1:-1}(e);if((h=h||a)&&(l<d+c*r/2||l>u-c*r/2))return l>d+c/2?1:-1;return 0}(t,a,n,o,y?1:s.swapThreshold,null==s.invertedSwapThreshold?s.swapThreshold:s.invertedSwapThreshold,qe,je===a))){var x=re(ve);do{x-=m,b=be.children[x]}while(b&&("none"===Jt(b,"display")||b===_e))}if(0===m||b===a)return D(!1);je=a,Ye=m;var C=a.nextElementSibling,$=!1,T=cn(ye,r,ve,e,a,n,t,$=1===m);if(!1!==T)return 1!==T&&-1!==T||($=1===T),Xe=!0,setTimeout(un,30),O(),$&&!C?r.appendChild(ve):a.parentNode.insertBefore(ve,$?C:a),S&&function(t,e,n){t.scrollLeft+=e,t.scrollTop+=n}(S,0,E-S.scrollTop),be=ve.parentNode,void 0===v||qe||(He=Math.abs(v-ee(a)[w])),M(),D(!0)}if(r.contains(ve))return D(!1)}return!1}function k(s,l){ge(s,p,Pt({evt:t,isOwner:d,axis:o?"vertical":"horizontal",revert:i,dragRect:e,targetRect:n,canSort:u,fromSortable:h,target:a,completed:D,onMove:function(n,i){return cn(ye,r,ve,e,n,ee(n),t,i)},changed:M},l))}function O(){k("dragOverAnimationCapture"),p.captureAnimationState(),p!==h&&h.captureAnimationState()}function D(e){return k("dragOverCompleted",{insertion:e}),e&&(d?c._hideClone():c._showClone(p),p!==h&&(Zt(ve,De?De.options.ghostClass:c.options.ghostClass,!1),Zt(ve,s.ghostClass,!0)),De!==p&&p!==ln.active?De=p:p===ln.active&&De&&(De=null),h===p&&(p._ignoreWhileAnimating=a),p.animateAll((function(){k("dragOverAnimationComplete"),p._ignoreWhileAnimating=null})),p!==h&&(h.animateAll(),h._ignoreWhileAnimating=null)),(a===ve&&!ve.animated||a===r&&!a.animated)&&(je=null),s.dragoverBubble||t.rootEl||a===document||(ve.parentNode[de]._isOutsideThisEl(t.target),!e&&an(t)),!s.dragoverBubble&&t.stopPropagation&&t.stopPropagation(),f=!0}function M(){$e=re(ve),ke=re(ve,s.draggable),me({sortable:p,name:"change",toEl:r,newIndex:$e,newDraggableIndex:ke,originalEvent:t})}},_ignoreWhileAnimating:null,_offMoveEvents:function(){Lt(document,"mousemove",this._onTouchMove),Lt(document,"touchmove",this._onTouchMove),Lt(document,"pointermove",this._onTouchMove),Lt(document,"dragover",an),Lt(document,"mousemove",an),Lt(document,"touchmove",an)},_offUpEvents:function(){var t=this.el.ownerDocument;Lt(t,"mouseup",this._onDrop),Lt(t,"touchend",this._onDrop),Lt(t,"pointerup",this._onDrop),Lt(t,"touchcancel",this._onDrop),Lt(document,"selectstart",this)},_onDrop:function(t){var e=this.el,n=this.options;$e=re(ve),ke=re(ve,n.draggable),ge("drop",this,{evt:t}),be=ve&&ve.parentNode,$e=re(ve),ke=re(ve,n.draggable),ln.eventCanceled||(We=!1,qe=!1,Ue=!1,clearInterval(this._loopId),clearTimeout(this._dragStartTimer),fn(this.cloneId),fn(this._dragStartId),this.nativeDraggable&&(Lt(document,"drop",this),Lt(e,"dragstart",this._onDragStart)),this._offMoveEvents(),this._offUpEvents(),Yt&&Jt(document.body,"user-select",""),Jt(ve,"transform",""),t&&(Ie&&(t.cancelable&&t.preventDefault(),!n.dropBubble&&t.stopPropagation()),_e&&_e.parentNode&&_e.parentNode.removeChild(_e),(ye===be||De&&"clone"!==De.lastPutMode)&&Ee&&Ee.parentNode&&Ee.parentNode.removeChild(Ee),ve&&(this.nativeDraggable&&Lt(ve,"dragend",this),dn(ve),ve.style["will-change"]="",Ie&&!We&&Zt(ve,De?De.options.ghostClass:this.options.ghostClass,!1),Zt(ve,this.options.chosenClass,!1),me({sortable:this,name:"unchoose",toEl:be,newIndex:null,newDraggableIndex:null,originalEvent:t}),ye!==be?($e>=0&&(me({rootEl:be,name:"add",toEl:be,fromEl:ye,originalEvent:t}),me({sortable:this,name:"remove",toEl:be,originalEvent:t}),me({rootEl:be,name:"sort",toEl:be,fromEl:ye,originalEvent:t}),me({sortable:this,name:"sort",toEl:be,originalEvent:t})),De&&De.save()):$e!==Ce&&$e>=0&&(me({sortable:this,name:"update",toEl:be,originalEvent:t}),me({sortable:this,name:"sort",toEl:be,originalEvent:t})),ln.active&&(null!=$e&&-1!==$e||($e=Ce,ke=Te),me({sortable:this,name:"end",toEl:be,originalEvent:t}),this.save())))),this._nulling()},_nulling:function(){ge("nulling",this),ye=ve=be=_e=we=Ee=Se=xe=Me=Ne=Ie=$e=ke=Ce=Te=je=Ye=De=Oe=ln.dragged=ln.ghost=ln.clone=ln.active=null,Ge.forEach((function(t){t.checked=!0})),Ge.length=Pe=Ae=0},handleEvent:function(t){switch(t.type){case"drop":case"dragend":this._onDrop(t);break;case"dragenter":case"dragover":ve&&(this._onDragOver(t),function(t){t.dataTransfer&&(t.dataTransfer.dropEffect="move");t.cancelable&&t.preventDefault()}(t));break;case"selectstart":t.preventDefault()}},toArray:function(){for(var t,e=[],n=this.el.children,i=0,o=n.length,r=this.options;i<o;i++)Ft(t=n[i],r.draggable,this.el,!1)&&e.push(t.getAttribute(r.dataIdAttr)||hn(t));return e},sort:function(t,e){var n={},i=this.el;this.toArray().forEach((function(t,e){var o=i.children[e];Ft(o,this.options.draggable,i,!1)&&(n[t]=o)}),this),e&&this.captureAnimationState(),t.forEach((function(t){n[t]&&(i.removeChild(n[t]),i.appendChild(n[t]))})),e&&this.animateAll()},save:function(){var t=this.options.store;t&&t.set&&t.set(this)},closest:function(t,e){return Ft(t,e||this.options.draggable,this.el,!1)},option:function(t,e){var n=this.options;if(void 0===e)return n[t];var i=fe.modifyOption(this,t,e);n[t]=void 0!==i?i:e,"group"===t&&nn(n)},destroy:function(){ge("destroy",this);var t=this.el;t[de]=null,Lt(t,"mousedown",this._onTapStart),Lt(t,"touchstart",this._onTapStart),Lt(t,"pointerdown",this._onTapStart),this.nativeDraggable&&(Lt(t,"dragover",this),Lt(t,"dragenter",this)),Array.prototype.forEach.call(t.querySelectorAll("[draggable]"),(function(t){t.removeAttribute("draggable")})),this._onDrop(),this._disableDelayedDragEvents(),Le.splice(Le.indexOf(this.el),1),this.el=t=null},_hideClone:function(){if(!xe){if(ge("hideClone",this),ln.eventCanceled)return;Jt(Ee,"display","none"),this.options.removeCloneOnHide&&Ee.parentNode&&Ee.parentNode.removeChild(Ee),xe=!0}},_showClone:function(t){if("clone"===t.lastPutMode){if(xe){if(ge("showClone",this),ln.eventCanceled)return;ve.parentNode!=ye||this.options.group.revertClone?we?ye.insertBefore(Ee,we):ye.appendChild(Ee):ye.insertBefore(Ee,ve),this.options.group.revertClone&&this.animate(ve,Ee),Jt(Ee,"display",""),xe=!1}}else this._hideClone()}},Ze&&Bt(document,"touchmove",(function(t){(ln.active||We)&&t.cancelable&&t.preventDefault()})),ln.utils={on:Bt,off:Lt,css:Jt,find:Qt,is:function(t,e){return!!Ft(t,e,t,!1)},extend:function(t,e){if(t&&e)for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);return t},throttle:function(t,e){return function(){if(!Xt){var n=arguments,i=this;1===n.length?t.call(i,n[0]):t.apply(i,n),Xt=setTimeout((function(){Xt=void 0}),e)}}},closest:Ft,toggleClass:Zt,clone:ce,index:re,nextTick:pn,cancelNextTick:fn,detectDirection:en,getChild:ie},ln.get=function(t){return t[de]},ln.mount=function(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];e[0].constructor===Array&&(e=e[0]),e.forEach((function(t){if(!t.prototype||!t.prototype.constructor)throw"Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(t));t.utils&&(ln.utils=Pt({},ln.utils,t.utils)),fe.mount(t)}))},ln.create=function(t,e){return new ln(t,e)},ln.version="1.13.0";var gn=function(t){var e=t.originalEvent,n=t.putSortable,i=t.dragEl,o=t.activeSortable,r=t.dispatchSortableEvent,a=t.hideGhostForTarget,s=t.unhideGhostForTarget;if(e){var l=n||o;a();var c=e.changedTouches&&e.changedTouches.length?e.changedTouches[0]:e,d=document.elementFromPoint(c.clientX,c.clientY);s(),l&&!l.el.contains(d)&&(r("spill"),this.onSpill({dragEl:i,putSortable:n}))}};function mn(){}function vn(){}mn.prototype={startIndex:null,dragStart:function(t){var e=t.oldDraggableIndex;this.startIndex=e},onSpill:function(t){var e=t.dragEl,n=t.putSortable;this.sortable.captureAnimationState(),n&&n.captureAnimationState();var i=ie(this.sortable.el,this.startIndex,this.options);i?this.sortable.el.insertBefore(e,i):this.sortable.el.appendChild(e),this.sortable.animateAll(),n&&n.animateAll()},drop:gn},Nt(mn,{pluginName:"revertOnSpill"}),vn.prototype={onSpill:function(t){var e=t.dragEl,n=t.putSortable||this.sortable;n.captureAnimationState(),e.parentNode&&e.parentNode.removeChild(e),n.animateAll()},drop:gn},Nt(vn,{pluginName:"removeOnSpill"});var bn={version:"Version",description:"A Lovelace Card for visualizing power distributions.",invalid_configuration:"Invalid configuration",show_warning:"Show Warning"},_n={actions:{add:"Add",edit:"Edit",remove:"Remove",save:"Save"},optional:"Optional",required:"Required",settings:{animation:"Animation",autarky:"autarky",attribute:"Attribute",background_color:"Background Color",bigger:"Bigger",calc_excluded:"Excluded from Calculations",center:"Center",color:"Color","color-settings":"Color Settings",decimals:"Decimals","display-abs":"Display Absolute Value",entities:"Entities",entity:"Entity",equal:"Equal","hide-arrows":"Hide Arrows",icon:"Icon","invert-value":"Invert Value",name:"Name",preset:"Preset",ratio:"ratio","secondary-info":"Secondary Info",settings:"settings",smaller:"Smaller",title:"Title",unit_of_display:"Unit of Display",value:"value"}},yn={common:bn,editor:_n},wn={version:"Version",description:"Eine Karte zur Visualizierung von Stromverteilungen",invalid_configuration:"Ungültige Konfiguration",show_warning:"Warnung"},Sn={actions:{add:"Hinzufügen",edit:"Bearbeiten",remove:"Entfernen",save:"Speichern"},optional:"Optional",required:"Erforderlich",settings:{animation:"Animation",autarky:"Autarkie",attribute:"Attribut",background_color:"Hintergrundfarbe",bigger:"Größer ",calc_excluded:"Von Rechnungen ausgeschlossen",center:"Mittelbereich",color:"Farbe","color-settings":"Farb Einstellungen",decimals:"Dezimalstellen","display-abs":"Absolute Wertanzeige",entities:"Entities",entity:"Element",equal:"Gleich","hide-arrows":"Pfeile Verstecken",icon:"Symbol","invert-value":"Invertierter Wert",name:"Name",preset:"Vorlagen",ratio:"Anteil","secondary-info":"Zusatzinformationen",settings:"Einstellungen",smaller:"Kleiner",title:"Titel",unit_of_display:"Angezeigte Einheit",value:"Wert"}},En={common:wn,editor:Sn};const xn={en:Object.freeze({__proto__:null,common:bn,editor:_n,default:yn}),de:Object.freeze({__proto__:null,common:wn,editor:Sn,default:En})};function Cn(t,e=!1,n="",i=""){const o=(localStorage.getItem("selectedLanguage")||navigator.language.split("-")[0]||"en").replace(/['"]+/g,"").replace("-","_");let r;try{r=t.split(".").reduce(((t,e)=>t[e]),xn[o])}catch(e){r=t.split(".").reduce(((t,e)=>t[e]),xn.en)}return void 0===r&&(r=t.split(".").reduce(((t,e)=>t[e]),xn.en)),""!==n&&""!==i&&(r=r.replace(n,i)),e?function(t){return t.charAt(0).toUpperCase()+t.slice(1)}(r):r}const $n=["battery","car_charger","consumer","grid","home","hydro","pool","producer","solar","wind"],Tn={battery:{consumer:!0,icon:"mdi:battery-outline",name:"battery",producer:!0},car_charger:{consumer:!0,icon:"mdi:car-electric",name:"car"},consumer:{consumer:!0,icon:"mdi:lightbulb",name:"consumer"},grid:{icon:"mdi:transmission-tower",name:"grid"},home:{consumer:!0,icon:"mdi:home-assistant",name:"home"},hydro:{icon:"mdi:hydro-power",name:"hydro",producer:!0},pool:{consumer:!0,icon:"mdi:pool",name:"pool"},producer:{icon:"mdi:lightning-bolt-outline",name:"producer",producer:!0},solar:{icon:"mdi:solar-power",name:"solar",producer:!0},wind:{icon:"mdi:wind-turbine",name:"wind",producer:!0}},kn={decimals:2,display_abs:!0,name:"",unit_of_display:"W"},On={type:"",title:void 0,animation:"flash",entities:[],center:{type:"none"}},Dn=["none","flash","slide"],Mn=["none","card","bars"],Nn=["autarky","ratio",""];let Pn=class extends it{constructor(){super(...arguments),this._subElementEditor=void 0,this._renderEmptySortable=!1,this._attached=!1}setConfig(t){this._config=t}async firstUpdated(){await this.loadCardHelpers();try{await this._helpers.createCardElement({type:"calendar",entities:["calendar.does_not_exist"]})}catch(t){}await customElements.get("hui-calendar-card").getConfigElement()}async loadCardHelpers(){this._helpers=await window.loadCardHelpers()}render(){var t,e,n,i,o,r,a,s,l,c;return this.hass?this._subElementEditor?this._renderSubElementEditor():I`
      <div class="card-config">
        <paper-input
          .label="${Cn("editor.settings.title")} (${Cn("editor.optional")})"
          .value=${(null===(t=this._config)||void 0===t?void 0:t.title)||""}
          .configValue=${"title"}
          @value-changed=${this._valueChanged}
        ></paper-input>
        <paper-dropdown-menu
          label="${Cn("editor.settings.animation")}"
          .configValue=${"animation"}
          @value-changed=${this._valueChanged}
        >
          <paper-listbox slot="dropdown-content" .selected=${Dn.indexOf((null===(e=this._config)||void 0===e?void 0:e.animation)||"flash")}>
            ${Dn.map((t=>I`<paper-item>${t}</paper-item>`))}
          </paper-listbox>
        </paper-dropdown-menu>
        <br />
        <div class="entity">
          <paper-dropdown-menu
            label="${Cn("editor.settings.center")}"
            .configValue=${"type"}
            @value-changed=${this._centerChanged}
          >
            <paper-listbox slot="dropdown-content" .selected="${Mn.indexOf((null===(i=null===(n=this._config)||void 0===n?void 0:n.center)||void 0===i?void 0:i.type)||"none")}">
              ${Mn.map((t=>I`<paper-item>${t}</paper-item>`))}
            </paper-listbox>
          </paper-dropdown-menu>
          ${"bars"==(null===(r=null===(o=this._config)||void 0===o?void 0:o.center)||void 0===r?void 0:r.type)||"card"==(null===(s=null===(a=this._config)||void 0===a?void 0:a.center)||void 0===s?void 0:s.type)?I`<mwc-icon-button
                aria-label=${Cn("editor.actions.edit")}
                class="edit-icon"
                .value=${null===(c=null===(l=this._config)||void 0===l?void 0:l.center)||void 0===c?void 0:c.type}
                @click="${this._editCenter}"
              >
                <ha-icon icon="mdi:pencil"></ha-icon>
              </mwc-icon-button>`:""}
        </div>
        ${this._renderEntitiesEditor()}
      </div>
    `:I``}_centerChanged(t){if(this._config&&this.hass){if(t.target){const e=t.target;e.configValue&&(this._config=Object.assign(Object.assign({},this._config),{center:Object.assign(Object.assign({},this._config.center),{[e.configValue]:void 0!==e.checked?e.checked:e.value})}))}xt(this,"config-changed",{config:this._config})}}_editCenter(t){if(t.currentTarget){const e=t.currentTarget;this._subElementEditor={type:e.value,element:this._config.center.content}}}_renderSubElementEditor(){var t;const e=[I`<div class="header">
        <div class="back-title">
          <mwc-icon-button @click=${this._goBack}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>
          </mwc-icon-button>
        </div>
      </div>`];switch(null===(t=this._subElementEditor)||void 0===t?void 0:t.type){case"entity":e.push(this._entityEditor());break;case"bars":e.push(this._barEditor());break;case"card":e.push(this._cardEditor())}return I`${e}`}_goBack(){var t;this._subElementEditor=void 0,null===(t=this._sortable)||void 0===t||t.destroy(),this._sortable=void 0,this._sortable=this._createSortable()}_itemEntityChanged(t){var e;if(!t.target)return;const n=t.target;if(!n.configValue)return;const i=[...this._config.entities],o=n.index||(null===(e=this._subElementEditor)||void 0===e?void 0:e.index)||0;i[o]=Object.assign(Object.assign({},i[o]),{[n.configValue]:null!=n.checked?n.checked:n.value}),this._config=Object.assign(Object.assign({},this._config),{entities:i}),xt(this,"config-changed",{config:this._config})}_icon_colorChanged(t){var e;if(!t.target)return;const n=t.target;if(!n.configValue)return;const i=Object.assign(Object.assign({},this._config.entities[(null===(e=this._subElementEditor)||void 0===e?void 0:e.index)||0].icon_color),{[n.configValue]:n.value});this._itemEntityChanged({target:{configValue:"icon_color",value:i}})}_entityEditor(){var t,e,n,i,o,r;const a=(null===(t=this._subElementEditor)||void 0===t?void 0:t.element)||kn,s=Object.keys(Object.assign({},null===(e=this.hass)||void 0===e?void 0:e.states[a.entity||0].attributes))||[],l=a.secondary_info_entity?Object.keys(Object.assign({},null===(n=this.hass)||void 0===n?void 0:n.states[a.secondary_info_entity||0].attributes)):[];return I`
      <div class="side-by-side">
        <paper-input
          .label="${Cn("editor.settings.name")} (${Cn("editor.optional")})"
          .value=${a.name||""}
          .configValue=${"name"}
          @value-changed=${this._itemEntityChanged}
        ></paper-input>
        <ha-icon-input
          .label="${Cn("editor.settings.icon")}  (${Cn("editor.optional")})"
          .value=${a.icon}
          .configValue=${"icon"}
          @value-changed=${this._itemEntityChanged}
        ></ha-icon-input>
      </div>
      <div class="side-by-side">
        <ha-entity-picker
          label="${Cn("editor.settings.entity")} (${Cn("editor.required")})"
          allow-custom-entity
          hideClearIcon
          .hass=${this.hass}
          .configValue=${"entity"}
          .value=${a.entity}
          @value-changed=${this._itemEntityChanged}
        ></ha-entity-picker>
        <paper-dropdown-menu
          label="${Cn("editor.settings.attribute")} (${Cn("editor.optional")})"
          .configValue=${"attribute"}
          @value-changed=${this._itemEntityChanged}
        >
          <paper-listbox
            slot="dropdown-content"
            .selected=${s.indexOf(a.attribute||"")+(a.attribute?1:0)}
          >
            ${s.length>0?I`<paper-item></paper-item>`:void 0}
            ${s.map((t=>I`<paper-item>${t}</paper-item>`))}
          </paper-listbox>
        </paper-dropdown-menu>
      </div>
      <br />
      <h3>${Cn("editor.settings.value",!0)} ${Cn("editor.settings.settings",!0)}</h3>
      <div class="side-by-side">
        <div class="checkbox">
          <input
            type="checkbox"
            id="invert-value"
            .checked="${a.invert_value||!1}"
            .configValue=${"invert_value"}
            @change=${this._itemEntityChanged}
          />
          <label for="invert-value"> ${Cn("editor.settings.invert-value")}</label>
        </div>
        <div class="checkbox">
          <input
            type="checkbox"
            id="display-abs"
            .checked="${0!=a.display_abs}"
            .configValue=${"display_abs"}
            @change=${this._itemEntityChanged}
          />
          <label for="display-abs"> ${Cn("editor.settings.display-abs")} </label>
        </div>
        <div class="checkbox">
          <input
            type="checkbox"
            id="hide-arrows"
            .checked="${a.hide_arrows||!1}"
            .configValue=${"hide_arrows"}
            @change=${this._itemEntityChanged}
          />
          <label for="invert-value"> ${Cn("editor.settings.hide-arrows")}</label>
        </div>
      </div>
      <div class="side-by-side">
        <paper-input
          auto-validate
          pattern="[0-9]"
          .label="${Cn("editor.settings.decimals")}"
          .value=${a.decimals||""}
          .configValue=${"decimals"}
          @value-changed=${this._itemEntityChanged}
        ></paper-input>
        <paper-input
          .label="${Cn("editor.settings.unit_of_display")}"
          .value=${a.unit_of_display||""}
          .configValue=${"unit_of_display"}
          @value-changed=${this._itemEntityChanged}
        ></paper-input>
      </div>
      <br />
      <h3>${Cn("editor.settings.preset",!0)} ${Cn("editor.settings.settings",!0)}</h3>
      <div class="side-by-side">
        <paper-dropdown-menu
          label="${Cn("editor.settings.preset")}"
          .configValue=${"preset"}
          @value-changed=${this._itemEntityChanged}
        >
          <paper-listbox slot="dropdown-content" .selected=${$n.indexOf(a.preset||$n[0])}>
            ${$n.map((t=>I`<paper-item>${t}</paper-item>`))}
          </paper-listbox>
        </paper-dropdown-menu>
        <div class="checkbox">
          <input
            type="checkbox"
            id="calc_excluded"
            .checked="${a.calc_excluded}"
            .configValue=${"calc_excluded"}
            @change=${this._itemEntityChanged}
          />
          <label for="calc_excluded"> ${Cn("editor.settings.calc_excluded")} </label>
        </div>
      </div>
      <br />
      <h3>${Cn("editor.settings.secondary-info",!0)}</h3>
      <div class="side-by-side">
        <ha-entity-picker
          label="${Cn("editor.settings.entity")}"
          allow-custom-entity
          hideClearIcon
          .hass=${this.hass}
          .configValue=${"secondary_info_entity"}
          .value=${a.secondary_info_entity}
          @value-changed=${this._itemEntityChanged}
        ></ha-entity-picker>
        <paper-dropdown-menu
          allow-custom-entity
          label="${Cn("editor.settings.attribute")} (${Cn("editor.optional")})"
          .configValue=${"secondary_info_attribute"}
          @value-changed=${this._itemEntityChanged}
        >
          <paper-listbox
            slot="dropdown-content"
            .selected=${l.indexOf(a.secondary_info_attribute||"")+(a.secondary_info_attribute?1:0)}
          >
            ${l.length>0?I`<paper-item></paper-item>`:void 0}
            ${l.map((t=>I`<paper-item>${t}</paper-item>`))}
          </paper-listbox>
        </paper-dropdown-menu>
      </div>
      <br />
      <h3>${Cn("editor.settings.color-settings",!0)}</h3>
      <table>
        <tr>
          <th>Element</th>
          <th>&gt; 0</th>
          <th>= 0</th>
          <th>&lt; 0</th>
        </tr>
        <tr>
          <th>icon</th>
          <td>
            <paper-input
              .label="${Cn("editor.settings.bigger")}"
              .value=${(null===(i=a.icon_color)||void 0===i?void 0:i.bigger)||""}
              .configValue=${"bigger"}
              @value-changed=${this._icon_colorChanged}
            ></paper-input>
          </td>
          <td>
            <paper-input
              .label="${Cn("editor.settings.equal")}"
              .value=${(null===(o=a.icon_color)||void 0===o?void 0:o.equal)||""}
              .configValue=${"equal"}
              @value-changed=${this._icon_colorChanged}
            ></paper-input>
          </td>
          <td>
            <paper-input
              .label="${Cn("editor.settings.smaller")}"
              .value=${(null===(r=a.icon_color)||void 0===r?void 0:r.smaller)||""}
              .configValue=${"smaller"}
              @value-changed=${this._icon_colorChanged}
            ></paper-input>
          </td>
        </tr>
      </table>
    `}_barChanged(t){var e;if(!t.target)return;const n=t.target;if(!n.configValue)return;let i;if("content"==n.configValue)i=n.value;else{i=[...this._config.center.content];const t=n.index||(null===(e=this._subElementEditor)||void 0===e?void 0:e.index)||0;i[t]=Object.assign(Object.assign({},i[t]),{[n.configValue]:null!=n.checked?n.checked:n.value})}this._config=Object.assign(Object.assign({},this._config),{center:{type:"bars",content:i}}),xt(this,"config-changed",{config:this._config})}_removeBar(t){var e;const n=(null===(e=t.currentTarget)||void 0===e?void 0:e.index)||0,i=[...this._config.center.content];i.splice(n,1),this._barChanged({target:{configValue:"content",value:i}})}async _addBar(){const t=Object.assign({},{name:"Name",preset:"custom"}),e=[...this._config.center.content||[],t];this._barChanged({target:{configValue:"content",value:e}})}_barEditor(){const t=[];return this._config.center.content&&this._config.center.content.forEach(((e,n)=>t.push(I`
        <div class="bar-editor">
          <h3 style="margin-bottom:6px;">Bar ${n+1}
          <mwc-icon-button
            aria-label=${Cn("editor.actions.remove")}
            class="remove-icon"
            .index=${n}
            @click=${this._removeBar}
            >
            <ha-icon icon="mdi:close"></ha-icon>
          </mwc-icon-button>
          </h4>
          <div class="side-by-side">
            <paper-input
              .label="${Cn("editor.settings.name")} (${Cn("editor.optional")})"
              .value=${e.name||""}
              .configValue=${"name"}
              @value-changed=${this._barChanged}
              .index=${n}
            ></paper-input>
            <ha-entity-picker
              label="${Cn("editor.settings.entity")}"
              allow-custom-entity
              hideClearIcon
              .hass=${this.hass}
              .configValue=${"entity"}
              .value=${e.entity}
              @value-changed=${this._barChanged}
              .index=${n}
            ></ha-entity-picker>
          </div>
          <div class="side-by-side">
            <div class="checkbox">
              <input
                type="checkbox"
                id="invert-value"
                .checked="${e.invert_value||!1}"
                .configValue=${"invert_value"}
                @change=${this._barChanged}
                .index=${n}
              />
              <label for="invert-value"> ${Cn("editor.settings.invert-value")}</label>
            </div>
            <div>
            <paper-dropdown-menu
              label="${Cn("editor.settings.preset")}"
              .configValue=${"preset"}
              @value-changed=${this._barChanged}
              .index=${n}
            >
              <paper-listbox slot="dropdown-content" .selected=${Nn.indexOf(e.preset||"")}>
                ${Nn.map((t=>I`<paper-item>${t}</paper-item>`))}
              </paper-listbox>
            </paper-dropdown-menu>
          </div>
          </div>
          <div class="side-by-side">
            <paper-input
              .label="${Cn("editor.settings.color")}"
              .value=${e.bar_color||""}
              .configValue=${"bar_color"}
              @value-changed=${this._barChanged}
              .index=${n}
            ></paper-input>
            <paper-input
              .label="${Cn("editor.settings.background_color")}"
              .value=${e.bar_bg_color||""}
              .configValue=${"bar_bg_color"}
              @value-changed=${this._barChanged}
              .index=${n}
            ></paper-input>
          </div>
        </div>
        <br/>
      `))),t.push(I`
      <mwc-icon-button aria-label=${Cn("editor.actions.add")} class="add-icon" @click="${this._addBar}">
        <ha-icon icon="mdi:plus-circle-outline"></ha-icon>
      </mwc-icon-button>
    `),I`${t.map((t=>I`${t}`))}`}_cardEditor(){return I`
      Sadly you cannot edit cards from the visual editor yet.
      <p />
      Check out the
      <a target="_blank" rel="noopener noreferrer" href="https://github.com/JonahKr/power-distribution-card#cards-"
        >Readme</a
      >
      to check out the latest and best way to add it.
    `}_renderEntitiesEditor(){return I`
      <h3>
        ${Cn("editor.settings.entities")} (${Cn("editor.required")})
      </h3>
      <div class="entities">
          ${kt([this._config.entities,this._renderEmptySortable],(()=>this._renderEmptySortable?"":this._config.entities.map(((t,e)=>I`
                    <div class="entity">
                      <ha-icon class="handle" icon="mdi:drag"></ha-icon>

                      <ha-entity-picker
                        label="Entity - ${t.preset}"
                        allow-custom-entity
                        hideClearIcon
                        .hass=${this.hass}
                        .configValue=${"entity"}
                        .value=${t.entity}
                        .index=${e}
                        @value-changed=${this._itemEntityChanged}
                      ></ha-entity-picker>

                      <mwc-icon-button
                        aria-label=${Cn("editor.actions.remove")}
                        class="remove-icon"
                        .index=${e}
                        @click=${this._removeRow}
                      >
                        <ha-icon icon="mdi:close"></ha-icon>
                      </mwc-icon-button>

                      <mwc-icon-button
                        aria-label=${Cn("editor.actions.edit")}
                        class="edit-icon"
                        .index=${e}
                        @click="${this._editRow}"
                      >
                        <ha-icon icon="mdi:pencil"></ha-icon>
                      </mwc-icon-button>
                    </div>
                  `))))}
        </div>
      </div>
      <div class="add-item">
        <paper-dropdown-menu
          label="${Cn("editor.settings.preset")}"
          name="preset"
          class="add-preset"
          >
          <paper-listbox slot="dropdown-content" .selected=1>
            ${$n.map((t=>I`<paper-item>${t}</paper-item>`))}
          </paper-listbox>
        </paper-dropdown-menu>

        <ha-entity-picker .hass=${this.hass} name="entity" class="add-entity"></ha-entity-picker>

        <mwc-icon-button
          aria-label=${Cn("editor.actions.add")}
          class="add-icon"
          @click="${this._addEntity}"
          >
          <ha-icon icon="mdi:plus-circle-outline"></ha-icon>
        </mwc-icon-button>
      </div>
    `}connectedCallback(){super.connectedCallback(),this._attached=!0}disconnectedCallback(){super.disconnectedCallback(),this._attached=!1}updated(t){var e,n;super.updated(t);const i=t.has("_attached"),o=t.has("_config");if(o||i)return i&&!this._attached?(null===(e=this._sortable)||void 0===e||e.destroy(),void(this._sortable=void 0)):void(this._sortable||!(null===(n=this._config)||void 0===n?void 0:n.entities)?o&&null==this._subElementEditor&&this._handleEntitiesChanged():this._createSortable())}async _handleEntitiesChanged(){var t;this._renderEmptySortable=!0,await this.updateComplete;const e=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector(".entities");for(;e.lastElementChild;)e.removeChild(e.lastElementChild);this._renderEmptySortable=!1}_createSortable(){var t;const e=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector(".entities");e&&(this._sortable=new ln(e,{animation:150,fallbackClass:"sortable-fallback",handle:".handle",onEnd:async t=>this._rowMoved(t)}))}_valueChanged(t){if(this._config&&this.hass){if(t.target){const e=t.target;e.configValue&&(this._config=Object.assign(Object.assign({},this._config),{[e.configValue]:void 0!==e.checked?e.checked:e.value}))}xt(this,"config-changed",{config:this._config})}}async _addEntity(){var t,e;const n=(null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector(".add-preset")).value||null,i=(null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector(".add-entity")).value;if(!n||!i)return;const o=Object.assign({},kn,Tn[n],{entity:i,preset:n}),r=this._config.entities.concat(o);this._valueChanged({target:{configValue:"entities",value:r}})}_rowMoved(t){if(t.oldIndex===t.newIndex)return;const e=[...this._config.entities];e.splice(t.newIndex,0,e.splice(t.oldIndex,1)[0]),this._valueChanged({target:{configValue:"entities",value:e}})}_removeRow(t){var e;const n=(null===(e=t.currentTarget)||void 0===e?void 0:e.index)||0,i=[...this._config.entities];i.splice(n,1),this._valueChanged({target:{configValue:"entities",value:i}})}_editRow(t){var e;const n=(null===(e=t.currentTarget)||void 0===e?void 0:e.index)||0;this._subElementEditor={type:"entity",element:this._config.entities[n],index:n}}static get styles(){return[et`
        .checkbox {
          display: flex;
          align-items: center;
          padding: 8px 0;
        }
        .checkbox input {
          height: 20px;
          width: 20px;
          margin-left: 0;
          margin-right: 8px;
        }
      `,et`
        .side-by-side {
          display: flex;
        }
        .side-by-side > * {
          flex: 1 1 0%;
          padding-right: 4px;
        }
        .entity,
        .add-item {
          display: flex;
          align-items: center;
        }
        .entity .handle {
          padding-right: 8px;
          cursor: move;
        }
        .entity ha-entity-picker,
        .add-item ha-entity-picker {
          flex-grow: 1;
        }
        .add-preset {
          padding-right: 8px;
          max-width: 130px;
        }
        .remove-icon,
        .edit-icon,
        .add-icon {
          --mdc-icon-button-size: 36px;
          color: var(--secondary-text-color);
        }
        .secondary {
          font-size: 12px;
          color: var(--secondary-text-color);
        }
      `,et`
        #sortable a:nth-of-type(2n) paper-icon-item {
          animation-name: keyframes1;
          animation-iteration-count: infinite;
          transform-origin: 50% 10%;
          animation-delay: -0.75s;
          animation-duration: 0.25s;
        }
        #sortable a:nth-of-type(2n-1) paper-icon-item {
          animation-name: keyframes2;
          animation-iteration-count: infinite;
          animation-direction: alternate;
          transform-origin: 30% 5%;
          animation-delay: -0.5s;
          animation-duration: 0.33s;
        }
        #sortable a {
          height: 48px;
          display: flex;
        }
        #sortable {
          outline: none;
          display: block !important;
        }
        .hidden-panel {
          display: flex !important;
        }
        .sortable-fallback {
          display: none;
        }
        .sortable-ghost {
          opacity: 0.4;
        }
        .sortable-fallback {
          opacity: 0;
        }
        @keyframes keyframes1 {
          0% {
            transform: rotate(-1deg);
            animation-timing-function: ease-in;
          }
          50% {
            transform: rotate(1.5deg);
            animation-timing-function: ease-out;
          }
        }
        @keyframes keyframes2 {
          0% {
            transform: rotate(1deg);
            animation-timing-function: ease-in;
          }
          50% {
            transform: rotate(-1.5deg);
            animation-timing-function: ease-out;
          }
        }
        .show-panel,
        .hide-panel {
          display: none;
          position: absolute;
          top: 0;
          right: 4px;
          --mdc-icon-button-size: 40px;
        }
        :host([rtl]) .show-panel {
          right: initial;
          left: 4px;
        }
        .hide-panel {
          top: 4px;
          right: 8px;
        }
        :host([rtl]) .hide-panel {
          right: initial;
          left: 8px;
        }
        :host([expanded]) .hide-panel {
          display: block;
        }
        :host([expanded]) .show-panel {
          display: inline-flex;
        }
        paper-icon-item.hidden-panel,
        paper-icon-item.hidden-panel span,
        paper-icon-item.hidden-panel ha-icon[slot='item-icon'] {
          color: var(--secondary-text-color);
          cursor: pointer;
        }
      `]}};t([Z({attribute:!1})],Pn.prototype,"hass",void 0),t([J()],Pn.prototype,"_config",void 0),t([J()],Pn.prototype,"_subElementEditor",void 0),t([J()],Pn.prototype,"_renderEmptySortable",void 0),t([J()],Pn.prototype,"_attached",void 0),Pn=t([X("power-distribution-card-editor")],Pn);const An=et`
  * {
    box-sizing: border-box;
  }

  p {
    margin: 4px 0 4px 0;

    text-align: center;
  }

  .card-content {
    display: grid;
    overflow: auto;

    grid-template-columns: 1.5fr 1fr 1.5fr;
    column-gap: 10px;
  }

  #center-panel {
    display: flex;

    height: 100%;

    align-items: center;
    justify-content: center;
    grid-column: 2;
    flex-wrap: wrap;
  }

  #center-panel > div {
    display: flex;
    overflow: hidden;

    width: 100%;
    height: 100%;
    max-height: 200px;

    flex-basis: 50%;
    flex-flow: column;
  }

  #center-panel > div > p {
    flex: 0 1 auto;
  }

  .bar-wrapper {
    position: relative;

    width: 50%;
    height: 80%;
    margin: auto;

    flex: 1 1 auto;

    background-color: rgba(114, 114, 114, 0.2);
  }

  bar {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: var(--secondary-text-color);
  }

  item {
    display: block;
    overflow: hidden;

    margin-bottom: 10px;

    cursor: pointer;
  }

  #right-panel > item > value {
    float: left;
  }

  #right-panel > item > badge {
    float: right;
  }

  badge {
    float: left;

    width: 50%;
    padding: 4px;

    border: 1px solid;
    border-color: var(--disabled-text-color);
    border-radius: 1em;

    position: relative;
  }

  icon > ha-icon {
    display: block;

    width: 24px;
    margin: 0 auto;

    color: var(--paper-item-icon-color);
  }

  .secondary {
    position: absolute;
    top: 4px;
    right: 8%;
    font-size: 80%;
  }

  value {
    float: right;
  }

  table {
    width: 100%;
  }

  /**************
  ARROW ANIMATION
  **************/

  .blank {
    width: 54px;
    height: 4px;
    margin: 8px auto 8px auto;
    opacity: 0.2;
    background-color: var(--secondary-text-color);
  }

  .arrow-color {
    fill: var(--secondary-text-color);
    fill-opacity: 0.8;
  }

  #a-flash {
    animation: flash 3s infinite steps(1);
    fill: var(--secondary-text-color);
    fill-opacity: 0.2;
  }

  @keyframes flash {
    0%,
    66% {
      fill-opacity: 0.2;
      fill: var(--secondary-text-color);
    }
    33% {
      fill-opacity: 0.8;
      fill: var(--secondary-text-color);
    }
  }

  #a-slide-right {
    animation: slide-right 3s linear infinite both;
  }
  @keyframes slide-right {
    0% {
      -webkit-transform: translateX(0);
      transform: translateX(0);
    }
    100% {
      -webkit-transform: translateX(48px);
      transform: translateX(48px);
    }
  }
  #a-slide-left {
    animation: slide-left 3s linear infinite both;
  }
  @keyframes slide-left {
    0% {
      -webkit-transform: translateX(48px);
      transform: translateX(48px);
    }
    100% {
      -webkit-transform: translateX(0px);
      transform: translateX(0px);
    }
  }
`,Vn=I`
  <style>
    /**********
    Mobile View
    **********/
    .card-content {
      grid-template-columns: 1fr 1fr 1fr;
    }
    item > badge,
    item > value {
      display: block;
      float: none !important;

      width: 72px;
      margin: 0 auto;
    }

    .arrow {
      margin: 0px 8px;
    }
  </style>
`;var Rn=function(){if("undefined"!=typeof Map)return Map;function t(t,e){var n=-1;return t.some((function(t,i){return t[0]===e&&(n=i,!0)})),n}return function(){function e(){this.__entries__=[]}return Object.defineProperty(e.prototype,"size",{get:function(){return this.__entries__.length},enumerable:!0,configurable:!0}),e.prototype.get=function(e){var n=t(this.__entries__,e),i=this.__entries__[n];return i&&i[1]},e.prototype.set=function(e,n){var i=t(this.__entries__,e);~i?this.__entries__[i][1]=n:this.__entries__.push([e,n])},e.prototype.delete=function(e){var n=this.__entries__,i=t(n,e);~i&&n.splice(i,1)},e.prototype.has=function(e){return!!~t(this.__entries__,e)},e.prototype.clear=function(){this.__entries__.splice(0)},e.prototype.forEach=function(t,e){void 0===e&&(e=null);for(var n=0,i=this.__entries__;n<i.length;n++){var o=i[n];t.call(e,o[1],o[0])}},e}()}(),In="undefined"!=typeof window&&"undefined"!=typeof document&&window.document===document,jn="undefined"!=typeof global&&global.Math===Math?global:"undefined"!=typeof self&&self.Math===Math?self:"undefined"!=typeof window&&window.Math===Math?window:Function("return this")(),Yn="function"==typeof requestAnimationFrame?requestAnimationFrame.bind(jn):function(t){return setTimeout((function(){return t(Date.now())}),1e3/60)};var Hn=["top","right","bottom","left","width","height","size","weight"],zn="undefined"!=typeof MutationObserver,Wn=function(){function t(){this.connected_=!1,this.mutationEventsAdded_=!1,this.mutationsObserver_=null,this.observers_=[],this.onTransitionEnd_=this.onTransitionEnd_.bind(this),this.refresh=function(t,e){var n=!1,i=!1,o=0;function r(){n&&(n=!1,t()),i&&s()}function a(){Yn(r)}function s(){var t=Date.now();if(n){if(t-o<2)return;i=!0}else n=!0,i=!1,setTimeout(a,e);o=t}return s}(this.refresh.bind(this),20)}return t.prototype.addObserver=function(t){~this.observers_.indexOf(t)||this.observers_.push(t),this.connected_||this.connect_()},t.prototype.removeObserver=function(t){var e=this.observers_,n=e.indexOf(t);~n&&e.splice(n,1),!e.length&&this.connected_&&this.disconnect_()},t.prototype.refresh=function(){this.updateObservers_()&&this.refresh()},t.prototype.updateObservers_=function(){var t=this.observers_.filter((function(t){return t.gatherActive(),t.hasActive()}));return t.forEach((function(t){return t.broadcastActive()})),t.length>0},t.prototype.connect_=function(){In&&!this.connected_&&(document.addEventListener("transitionend",this.onTransitionEnd_),window.addEventListener("resize",this.refresh),zn?(this.mutationsObserver_=new MutationObserver(this.refresh),this.mutationsObserver_.observe(document,{attributes:!0,childList:!0,characterData:!0,subtree:!0})):(document.addEventListener("DOMSubtreeModified",this.refresh),this.mutationEventsAdded_=!0),this.connected_=!0)},t.prototype.disconnect_=function(){In&&this.connected_&&(document.removeEventListener("transitionend",this.onTransitionEnd_),window.removeEventListener("resize",this.refresh),this.mutationsObserver_&&this.mutationsObserver_.disconnect(),this.mutationEventsAdded_&&document.removeEventListener("DOMSubtreeModified",this.refresh),this.mutationsObserver_=null,this.mutationEventsAdded_=!1,this.connected_=!1)},t.prototype.onTransitionEnd_=function(t){var e=t.propertyName,n=void 0===e?"":e;Hn.some((function(t){return!!~n.indexOf(t)}))&&this.refresh()},t.getInstance=function(){return this.instance_||(this.instance_=new t),this.instance_},t.instance_=null,t}(),Bn=function(t,e){for(var n=0,i=Object.keys(e);n<i.length;n++){var o=i[n];Object.defineProperty(t,o,{value:e[o],enumerable:!1,writable:!1,configurable:!0})}return t},Ln=function(t){return t&&t.ownerDocument&&t.ownerDocument.defaultView||jn},Un=Jn(0,0,0,0);function qn(t){return parseFloat(t)||0}function Fn(t){for(var e=[],n=1;n<arguments.length;n++)e[n-1]=arguments[n];return e.reduce((function(e,n){return e+qn(t["border-"+n+"-width"])}),0)}function Xn(t){var e=t.clientWidth,n=t.clientHeight;if(!e&&!n)return Un;var i=Ln(t).getComputedStyle(t),o=function(t){for(var e={},n=0,i=["top","right","bottom","left"];n<i.length;n++){var o=i[n],r=t["padding-"+o];e[o]=qn(r)}return e}(i),r=o.left+o.right,a=o.top+o.bottom,s=qn(i.width),l=qn(i.height);if("border-box"===i.boxSizing&&(Math.round(s+r)!==e&&(s-=Fn(i,"left","right")+r),Math.round(l+a)!==n&&(l-=Fn(i,"top","bottom")+a)),!function(t){return t===Ln(t).document.documentElement}(t)){var c=Math.round(s+r)-e,d=Math.round(l+a)-n;1!==Math.abs(c)&&(s-=c),1!==Math.abs(d)&&(l-=d)}return Jn(o.left,o.top,s,l)}var Gn="undefined"!=typeof SVGGraphicsElement?function(t){return t instanceof Ln(t).SVGGraphicsElement}:function(t){return t instanceof Ln(t).SVGElement&&"function"==typeof t.getBBox};function Zn(t){return In?Gn(t)?function(t){var e=t.getBBox();return Jn(0,0,e.width,e.height)}(t):Xn(t):Un}function Jn(t,e,n,i){return{x:t,y:e,width:n,height:i}}var Kn=function(){function t(t){this.broadcastWidth=0,this.broadcastHeight=0,this.contentRect_=Jn(0,0,0,0),this.target=t}return t.prototype.isActive=function(){var t=Zn(this.target);return this.contentRect_=t,t.width!==this.broadcastWidth||t.height!==this.broadcastHeight},t.prototype.broadcastRect=function(){var t=this.contentRect_;return this.broadcastWidth=t.width,this.broadcastHeight=t.height,t},t}(),Qn=function(t,e){var n=function(t){var e=t.x,n=t.y,i=t.width,o=t.height,r="undefined"!=typeof DOMRectReadOnly?DOMRectReadOnly:Object,a=Object.create(r.prototype);return Bn(a,{x:e,y:n,width:i,height:o,top:n,right:e+i,bottom:o+n,left:e}),a}(e);Bn(this,{target:t,contentRect:n})},ti=function(){function t(t,e,n){if(this.activeObservations_=[],this.observations_=new Rn,"function"!=typeof t)throw new TypeError("The callback provided as parameter 1 is not a function.");this.callback_=t,this.controller_=e,this.callbackCtx_=n}return t.prototype.observe=function(t){if(!arguments.length)throw new TypeError("1 argument required, but only 0 present.");if("undefined"!=typeof Element&&Element instanceof Object){if(!(t instanceof Ln(t).Element))throw new TypeError('parameter 1 is not of type "Element".');var e=this.observations_;e.has(t)||(e.set(t,new Kn(t)),this.controller_.addObserver(this),this.controller_.refresh())}},t.prototype.unobserve=function(t){if(!arguments.length)throw new TypeError("1 argument required, but only 0 present.");if("undefined"!=typeof Element&&Element instanceof Object){if(!(t instanceof Ln(t).Element))throw new TypeError('parameter 1 is not of type "Element".');var e=this.observations_;e.has(t)&&(e.delete(t),e.size||this.controller_.removeObserver(this))}},t.prototype.disconnect=function(){this.clearActive(),this.observations_.clear(),this.controller_.removeObserver(this)},t.prototype.gatherActive=function(){var t=this;this.clearActive(),this.observations_.forEach((function(e){e.isActive()&&t.activeObservations_.push(e)}))},t.prototype.broadcastActive=function(){if(this.hasActive()){var t=this.callbackCtx_,e=this.activeObservations_.map((function(t){return new Qn(t.target,t.broadcastRect())}));this.callback_.call(t,e,t),this.clearActive()}},t.prototype.clearActive=function(){this.activeObservations_.splice(0)},t.prototype.hasActive=function(){return this.activeObservations_.length>0},t}(),ei="undefined"!=typeof WeakMap?new WeakMap:new Rn,ni=function t(e){if(!(this instanceof t))throw new TypeError("Cannot call a class as a function.");if(!arguments.length)throw new TypeError("1 argument required, but only 0 present.");var n=Wn.getInstance(),i=new ti(e,n,this);ei.set(this,i)};["observe","unobserve","disconnect"].forEach((function(t){ni.prototype[t]=function(){var e;return(e=ei.get(this))[t].apply(e,arguments)}}));var ii=void 0!==jn.ResizeObserver?jn.ResizeObserver:ni,oi=Object.freeze({__proto__:null,default:ii});console.info("%c POWER-DISTRIBUTION-CARD %c 2.2.0","font-weight: 500; color: white; background: #03a9f4;","font-weight: 500; color: #03a9f4; background: white;"),window.customCards.push({type:"power-distribution-card",name:"Power Distribution Card",description:Cn("common.description")});let ri=class extends it{constructor(){super(...arguments),this._narrow=!1}static async getConfigElement(){return document.createElement("power-distribution-card-editor")}static getStubConfig(){return{title:"Title",entities:[],center:{type:"bars",content:[{preset:"autarky",name:Cn("editor.settings.autarky")},{preset:"ratio",name:Cn("editor.settings.ratio")}]}}}async setConfig(t){const e=Object.assign({},On,t,{entities:[]});if(!t.entities)throw new Error("You need to define Entities!");t.entities.forEach((t=>{if(!t.preset||!$n.includes(t.preset))throw new Error("The preset `"+t.preset+"` is not a valid entry. Please choose a Preset from the List.");{const n=Object.assign({},kn,Tn[t.preset],t);e.entities.push(n)}})),this._config=e,"card"==this._config.center.type&&(this._card=this._createCardElement(this._config.center.content))}firstUpdated(){this._config.entities.forEach(((t,e)=>{if(!t.entity)return;const n=this.hass.states[t.entity].attributes.unit_of_measurement;t.unit_of_measurement||(this._config.entities[e].unit_of_measurement=n||"W")})),this._adjustWidth(),this._attachObserver()}updated(t){super.updated(t),this._card&&(t.has("hass")||t.has("editMode"))&&this.hass&&(this._card.hass=this.hass)}static get styles(){return An}connectedCallback(){super.connectedCallback(),this.updateComplete.then((()=>this._attachObserver()))}disconnectedCallback(){this._resizeObserver&&this._resizeObserver.disconnect()}async _attachObserver(){var t;this._resizeObserver||(await(async()=>{"function"!=typeof ii&&(window.ResizeObserver=(await Promise.resolve().then((function(){return oi}))).default)})(),this._resizeObserver=new ii(function(t,e,n){var i;return void 0===n&&(n=!1),function(){for(var o=[],r=arguments.length;r--;)o[r]=arguments[r];var a=this,s=n&&!i;clearTimeout(i),i=setTimeout((function(){i=null,n||t.apply(a,o)}),e),s&&t.apply(a,o)}}((()=>this._adjustWidth()),250,!1)));const e=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector("ha-card");e&&this._resizeObserver.observe(e)}_adjustWidth(){var t;const e=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector("ha-card");e&&(this._narrow=e.offsetWidth<400)}_val(t){var e;let n=t.invert_value?-1:1;(null===(e=t.unit_of_measurement)||void 0===e?void 0:e.startsWith("k"))&&(n*=1e3);const i=t.attribute||null,o=t.entity?Number(i?this.hass.states[t.entity].attributes[i]:this.hass.states[t.entity].state):0;return t.entity?o*n:0}render(){const t=[],e=[],n=[];let i=0,o=0;this._config.entities.forEach(((e,r)=>{const a=this._val(e);e.calc_excluded||(e.producer&&a>0&&(o+=a),e.consumer&&a<0&&(i-=a));const s=this._render_item(a,e,r);switch(r%2){case 0:t.push(s);break;case 1:n.push(s)}}));switch(this._config.center.type){case"none":break;case"card":this._card?e.push(this._card):console.log("NO CARD");break;case"bars":e.push(this._render_bars(i,o))}return I` ${this._narrow?Vn:void 0}
      <ha-card .header=${this._config.title}>
        <div class="card-content">
          <div id="left-panel">${t}</div>
          <div id="center-panel">${e}</div>
          <div id="right-panel">${n}</div>
        </div>
      </ha-card>`}_moreInfo(t){xt(this,"hass-more-info",{entityId:t.currentTarget.entity})}_render_item(t,e,n){const i=e.invert_arrow?-1*t:t;t=e.display_abs?Math.abs(t):t;let o=e.unit_of_display||"W";o.startsWith("k")?t/=1e3:"adaptive"==e.unit_of_display&&(Math.abs(t)>999?(t/=1e3,o="kW"):o="W");const r=10**(e.decimals||0==e.decimals?e.decimals:2),a=t=Math.round(t*r)/r;let s;return e.icon_color&&(i>0&&(s=e.icon_color.bigger),i<0&&(s=e.icon_color.smaller),0==i&&(s=e.icon_color.equal)),I`
      <item .entity=${e.entity} @click="${this._moreInfo}">
        <badge>
          <icon>
            <ha-icon icon="${e.icon}" style="${s?`color:${s};`:""}"></ha-icon>
            ${e.secondary_info_attribute?I`<p class="secondary">
                    ${this._val({entity:e.secondary_info_entity,attribute:e.secondary_info_attribute})}
                  </p>`:e.secondary_info_entity?I`<p class="secondary">
                    ${this._val({entity:e.secondary_info_entity})}
                    ${this.hass.states[e.secondary_info_entity].attributes.unit_of_measurement}
                  </p>`:""}
          </icon>
          <p class="subtitle">${e.name}</p>
        </badge>
        <value>
          <p>${a} ${o}</p>
          ${e.hide_arrows?I``:this._render_arrow(0==t?"none":n%2==0?i>0?"right":"left":i>0?"left":"right",n)}
        <value
      </item>
    `}_render_arrow(t,e){const n=this._config.animation;return"none"==t?I` <div class="blank"></div> `:I`
        <svg width="57" height="18" class="arrow">
          <defs>
            <polygon id="arrow-right" points="0 0, 0 16, 16 8" />
            <polygon id="arrow-left" points="16 0, 16 16, 0 8" />
            <g id="slide-${e}" class="arrow-color">
              <use href="#arrow-${t}" x="-36" />
              <use href="#arrow-${t}" x="-12" />
              <use href="#arrow-${t}" x="12" />
              <use href="#arrow-${t}" x="36" />
            </g>
            <g id="flash-${e}">
              <use
                href="#arrow-${t}"
                x="0"
                style="animation-delay: ${"right"==t?0:2}s;"
                id="a-flash"
              />
              <use href="#arrow-${t}" x="20" style="animation-delay: 1s;" id="a-flash" />
              <use
                href="#arrow-${t}"
                x="40"
                style="animation-delay: ${"right"==t?2:0}s;"
                id="a-flash"
              />
            </g>
            <g id="none-${e}" class="arrow-color">
              <use href="#arrow-${t}" x="0" />
              <use href="#arrow-${t}" x="20" />
              <use href="#arrow-${t}" x="40" />
            </g>
          </defs>
          <use href="#${n}-${e}" id="a-${n}-${t}" />
        </svg>
      `}_render_bars(t,e){const n=[];return this._config.center.content&&0!=this._config.center.content.length?(this._config.center.content.forEach((i=>{let o=-1;switch(i.preset){case"autarky":i.entity||(o=0!=t?Math.min(Math.round(100*e/Math.abs(t)),100):0);break;case"ratio":i.entity||(o=0!=e?Math.min(Math.round(100*Math.abs(t)/e),100):0)}o<0&&(o=this._val(i)),n.push(I`
        <div class="bar-element">
          <p class="bar-percentage">${o}%</p>
          <div class="bar-wrapper" style="${i.bar_bg_color?`background-color:${i.bar_bg_color};`:""}">
            <bar style="height:${o}%; background-color:${i.bar_color};" />
          </div>
          <p>${i.name||""}</p>
        </div>
      `)})),I`${n.map((t=>I`${t}`))}`):I``}_createCardElement(t){console.log("Creating Card");const e=function(t,e){void 0===e&&(e=!1);var n=function(t,e){return i("hui-error-card",{type:"error",error:t,config:e})},i=function(t,e){var i=window.document.createElement(t);try{i.setConfig(e)}catch(i){return console.error(t,i),n(i.message,e)}return i};if(!t||"object"!=typeof t||!e&&!t.type)return n("No type defined",t);var o=t.type;if(o&&o.startsWith("custom:"))o=o.substr("custom:".length);else if(e)if(Ct.has(o))o="hui-"+o+"-row";else{if(!t.entity)return n("Invalid config given.",t);var r=t.entity.split(".",1)[0];o="hui-"+($t[r]||"text")+"-entity-row"}else o="hui-"+o+"-card";if(customElements.get(o))return i(o,t);var a=n("Custom element doesn't exist: "+t.type+".",t);a.style.display="None";var s=setTimeout((function(){a.style.display=""}),2e3);return customElements.whenDefined(t.type).then((function(){clearTimeout(s),xt(a,"ll-rebuild",{},a)})),a}(t);return this.hass&&(e.hass=this.hass),e.addEventListener("ll-rebuild",(n=>{n.stopPropagation(),this._rebuildCard(e,t)}),{once:!0}),e}_rebuildCard(t,e){console.log("REBUILDING CARD");const n=this._createCardElement(e);t.parentElement&&t.parentElement.replaceChild(n,t),this._card===t&&(this._card=n)}};t([Z()],ri.prototype,"hass",void 0),t([J()],ri.prototype,"_config",void 0),t([Z()],ri.prototype,"_card",void 0),t([J()],ri.prototype,"_narrow",void 0),ri=t([X("power-distribution-card")],ri);export{ri as PowerDistributionCard};
