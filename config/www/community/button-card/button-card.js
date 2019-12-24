function t(t, e, i, s) {
  var n,
      r = arguments.length,
      a = r < 3 ? e : null === s ? s = Object.getOwnPropertyDescriptor(e, i) : s;if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) a = Reflect.decorate(t, e, i, s);else for (var o = t.length - 1; o >= 0; o--) (n = t[o]) && (a = (r < 3 ? n(a) : r > 3 ? n(e, i, a) : n(e, i)) || a);return r > 3 && a && Object.defineProperty(e, i, a), a;
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
}const e = new WeakMap(),
      i = t => (...i) => {
  const s = t(...i);return e.set(s, !0), s;
},
      s = t => "function" == typeof t && e.has(t),
      n = void 0 !== window.customElements && void 0 !== window.customElements.polyfillWrapFlushCallback,
      r = (t, e, i = null) => {
  for (; e !== i;) {
    const i = e.nextSibling;t.removeChild(e), e = i;
  }
},
      a = {},
      o = {},
      c = `{{lit-${String(Math.random()).slice(2)}}}`,
      l = `\x3c!--${c}--\x3e`,
      h = new RegExp(`${c}|${l}`),
      d = "$lit$";class u {
  constructor(t, e) {
    this.parts = [], this.element = e;const i = [],
          s = [],
          n = document.createTreeWalker(e.content, 133, null, !1);let r = 0,
        a = -1,
        o = 0;const { strings: l, values: { length: u } } = t;for (; o < u;) {
      const t = n.nextNode();if (null !== t) {
        if (a++, 1 === t.nodeType) {
          if (t.hasAttributes()) {
            const e = t.attributes,
                  { length: i } = e;let s = 0;for (let t = 0; t < i; t++) p(e[t].name, d) && s++;for (; s-- > 0;) {
              const e = l[o],
                    i = g.exec(e)[2],
                    s = i.toLowerCase() + d,
                    n = t.getAttribute(s);t.removeAttribute(s);const r = n.split(h);this.parts.push({ type: "attribute", index: a, name: i, strings: r }), o += r.length - 1;
            }
          }"TEMPLATE" === t.tagName && (s.push(t), n.currentNode = t.content);
        } else if (3 === t.nodeType) {
          const e = t.data;if (e.indexOf(c) >= 0) {
            const s = t.parentNode,
                  n = e.split(h),
                  r = n.length - 1;for (let e = 0; e < r; e++) {
              let i,
                  r = n[e];if ("" === r) i = m();else {
                const t = g.exec(r);null !== t && p(t[2], d) && (r = r.slice(0, t.index) + t[1] + t[2].slice(0, -d.length) + t[3]), i = document.createTextNode(r);
              }s.insertBefore(i, t), this.parts.push({ type: "node", index: ++a });
            }"" === n[r] ? (s.insertBefore(m(), t), i.push(t)) : t.data = n[r], o += r;
          }
        } else if (8 === t.nodeType) if (t.data === c) {
          const e = t.parentNode;null !== t.previousSibling && a !== r || (a++, e.insertBefore(m(), t)), r = a, this.parts.push({ type: "node", index: a }), null === t.nextSibling ? t.data = "" : (i.push(t), a--), o++;
        } else {
          let e = -1;for (; -1 !== (e = t.data.indexOf(c, e + 1));) this.parts.push({ type: "node", index: -1 }), o++;
        }
      } else n.currentNode = s.pop();
    }for (const c of i) c.parentNode.removeChild(c);
  }
}const p = (t, e) => {
  const i = t.length - e.length;return i >= 0 && t.slice(i) === e;
},
      f = t => -1 !== t.index,
      m = () => document.createComment(""),
      g = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=\/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;
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
class b {
  constructor(t, e, i) {
    this.__parts = [], this.template = t, this.processor = e, this.options = i;
  }update(t) {
    let e = 0;for (const i of this.__parts) void 0 !== i && i.setValue(t[e]), e++;for (const i of this.__parts) void 0 !== i && i.commit();
  }_clone() {
    const t = n ? this.template.element.content.cloneNode(!0) : document.importNode(this.template.element.content, !0),
          e = [],
          i = this.template.parts,
          s = document.createTreeWalker(t, 133, null, !1);let r,
        a = 0,
        o = 0,
        c = s.nextNode();for (; a < i.length;) if (r = i[a], f(r)) {
      for (; o < r.index;) o++, "TEMPLATE" === c.nodeName && (e.push(c), s.currentNode = c.content), null === (c = s.nextNode()) && (s.currentNode = e.pop(), c = s.nextNode());if ("node" === r.type) {
        const t = this.processor.handleTextExpression(this.options);t.insertAfterNode(c.previousSibling), this.__parts.push(t);
      } else this.__parts.push(...this.processor.handleAttributeExpressions(c, r.name, r.strings, this.options));a++;
    } else this.__parts.push(void 0), a++;return n && (document.adoptNode(t), customElements.upgrade(t)), t;
  }
}
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
 */const _ = ` ${c} `;class y {
  constructor(t, e, i, s) {
    this.strings = t, this.values = e, this.type = i, this.processor = s;
  }getHTML() {
    const t = this.strings.length - 1;let e = "",
        i = !1;for (let s = 0; s < t; s++) {
      const t = this.strings[s],
            n = t.lastIndexOf("\x3c!--");i = (n > -1 || i) && -1 === t.indexOf("--\x3e", n + 1);const r = g.exec(t);e += null === r ? t + (i ? _ : l) : t.substr(0, r.index) + r[1] + r[2] + d + r[3] + c;
    }return e += this.strings[t];
  }getTemplateElement() {
    const t = document.createElement("template");return t.innerHTML = this.getHTML(), t;
  }
}
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
 */const v = t => null === t || !("object" == typeof t || "function" == typeof t),
      w = t => Array.isArray(t) || !(!t || !t[Symbol.iterator]);class S {
  constructor(t, e, i) {
    this.dirty = !0, this.element = t, this.name = e, this.strings = i, this.parts = [];for (let s = 0; s < i.length - 1; s++) this.parts[s] = this._createPart();
  }_createPart() {
    return new M(this);
  }_getValue() {
    const t = this.strings,
          e = t.length - 1;let i = "";for (let s = 0; s < e; s++) {
      i += t[s];const e = this.parts[s];if (void 0 !== e) {
        const t = e.value;if (v(t) || !w(t)) i += "string" == typeof t ? t : String(t);else for (const e of t) i += "string" == typeof e ? e : String(e);
      }
    }return i += t[e];
  }commit() {
    this.dirty && (this.dirty = !1, this.element.setAttribute(this.name, this._getValue()));
  }
}class M {
  constructor(t) {
    this.value = void 0, this.committer = t;
  }setValue(t) {
    t === a || v(t) && t === this.value || (this.value = t, s(t) || (this.committer.dirty = !0));
  }commit() {
    for (; s(this.value);) {
      const t = this.value;this.value = a, t(this);
    }this.value !== a && this.committer.commit();
  }
}class k {
  constructor(t) {
    this.value = void 0, this.__pendingValue = void 0, this.options = t;
  }appendInto(t) {
    this.startNode = t.appendChild(m()), this.endNode = t.appendChild(m());
  }insertAfterNode(t) {
    this.startNode = t, this.endNode = t.nextSibling;
  }appendIntoPart(t) {
    t.__insert(this.startNode = m()), t.__insert(this.endNode = m());
  }insertAfterPart(t) {
    t.__insert(this.startNode = m()), this.endNode = t.endNode, t.endNode = this.startNode;
  }setValue(t) {
    this.__pendingValue = t;
  }commit() {
    for (; s(this.__pendingValue);) {
      const t = this.__pendingValue;this.__pendingValue = a, t(this);
    }const t = this.__pendingValue;t !== a && (v(t) ? t !== this.value && this.__commitText(t) : t instanceof y ? this.__commitTemplateResult(t) : t instanceof Node ? this.__commitNode(t) : w(t) ? this.__commitIterable(t) : t === o ? (this.value = o, this.clear()) : this.__commitText(t));
  }__insert(t) {
    this.endNode.parentNode.insertBefore(t, this.endNode);
  }__commitNode(t) {
    this.value !== t && (this.clear(), this.__insert(t), this.value = t);
  }__commitText(t) {
    const e = this.startNode.nextSibling,
          i = "string" == typeof (t = null == t ? "" : t) ? t : String(t);e === this.endNode.previousSibling && 3 === e.nodeType ? e.data = i : this.__commitNode(document.createTextNode(i)), this.value = t;
  }__commitTemplateResult(t) {
    const e = this.options.templateFactory(t);if (this.value instanceof b && this.value.template === e) this.value.update(t.values);else {
      const i = new b(e, t.processor, this.options),
            s = i._clone();i.update(t.values), this.__commitNode(s), this.value = i;
    }
  }__commitIterable(t) {
    Array.isArray(this.value) || (this.value = [], this.clear());const e = this.value;let i,
        s = 0;for (const n of t) void 0 === (i = e[s]) && (i = new k(this.options), e.push(i), 0 === s ? i.appendIntoPart(this) : i.insertAfterPart(e[s - 1])), i.setValue(n), i.commit(), s++;s < e.length && (e.length = s, this.clear(i && i.endNode));
  }clear(t = this.startNode) {
    r(this.startNode.parentNode, t.nextSibling, this.endNode);
  }
}class x {
  constructor(t, e, i) {
    if (this.value = void 0, this.__pendingValue = void 0, 2 !== i.length || "" !== i[0] || "" !== i[1]) throw new Error("Boolean attributes can only contain a single expression");this.element = t, this.name = e, this.strings = i;
  }setValue(t) {
    this.__pendingValue = t;
  }commit() {
    for (; s(this.__pendingValue);) {
      const t = this.__pendingValue;this.__pendingValue = a, t(this);
    }if (this.__pendingValue === a) return;const t = !!this.__pendingValue;this.value !== t && (t ? this.element.setAttribute(this.name, "") : this.element.removeAttribute(this.name), this.value = t), this.__pendingValue = a;
  }
}class N extends S {
  constructor(t, e, i) {
    super(t, e, i), this.single = 2 === i.length && "" === i[0] && "" === i[1];
  }_createPart() {
    return new O(this);
  }_getValue() {
    return this.single ? this.parts[0].value : super._getValue();
  }commit() {
    this.dirty && (this.dirty = !1, this.element[this.name] = this._getValue());
  }
}class O extends M {}let C = !1;try {
  const t = { get capture() {
      return C = !0, !1;
    } };window.addEventListener("test", t, t), window.removeEventListener("test", t, t);
} catch (Ce) {}class A {
  constructor(t, e, i) {
    this.value = void 0, this.__pendingValue = void 0, this.element = t, this.eventName = e, this.eventContext = i, this.__boundHandleEvent = t => this.handleEvent(t);
  }setValue(t) {
    this.__pendingValue = t;
  }commit() {
    for (; s(this.__pendingValue);) {
      const t = this.__pendingValue;this.__pendingValue = a, t(this);
    }if (this.__pendingValue === a) return;const t = this.__pendingValue,
          e = this.value,
          i = null == t || null != e && (t.capture !== e.capture || t.once !== e.once || t.passive !== e.passive),
          n = null != t && (null == e || i);i && this.element.removeEventListener(this.eventName, this.__boundHandleEvent, this.__options), n && (this.__options = P(t), this.element.addEventListener(this.eventName, this.__boundHandleEvent, this.__options)), this.value = t, this.__pendingValue = a;
  }handleEvent(t) {
    "function" == typeof this.value ? this.value.call(this.eventContext || this.element, t) : this.value.handleEvent(t);
  }
}const P = t => t && (C ? { capture: t.capture, passive: t.passive, once: t.once } : t.capture);
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
 */const E = new class {
  handleAttributeExpressions(t, e, i, s) {
    const n = e[0];return "." === n ? new N(t, e.slice(1), i).parts : "@" === n ? [new A(t, e.slice(1), s.eventContext)] : "?" === n ? [new x(t, e.slice(1), i)] : new S(t, e, i).parts;
  }handleTextExpression(t) {
    return new k(t);
  }
}();
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
 */function T(t) {
  let e = F.get(t.type);void 0 === e && (e = { stringsArray: new WeakMap(), keyString: new Map() }, F.set(t.type, e));let i = e.stringsArray.get(t.strings);if (void 0 !== i) return i;const s = t.strings.join(c);return void 0 === (i = e.keyString.get(s)) && (i = new u(t, t.getTemplateElement()), e.keyString.set(s, i)), e.stringsArray.set(t.strings, i), i;
}const F = new Map(),
      R = new WeakMap();
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
(window.litHtmlVersions || (window.litHtmlVersions = [])).push("1.1.2");const V = (t, ...e) => new y(t, e, "html", E),
      B = 133;
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
 */function j(t, e) {
  const { element: { content: i }, parts: s } = t,
        n = document.createTreeWalker(i, B, null, !1);let r = H(s),
      a = s[r],
      o = -1,
      c = 0;const l = [];let h = null;for (; n.nextNode();) {
    o++;const t = n.currentNode;for (t.previousSibling === h && (h = null), e.has(t) && (l.push(t), null === h && (h = t)), null !== h && c++; void 0 !== a && a.index === o;) a.index = null !== h ? -1 : a.index - c, a = s[r = H(s, r)];
  }l.forEach(t => t.parentNode.removeChild(t));
}const $ = t => {
  let e = 11 === t.nodeType ? 0 : 1;const i = document.createTreeWalker(t, B, null, !1);for (; i.nextNode();) e++;return e;
},
      H = (t, e = -1) => {
  for (let i = e + 1; i < t.length; i++) {
    const e = t[i];if (f(e)) return i;
  }return -1;
};
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
const L = (t, e) => `${t}--${e}`;let D = !0;void 0 === window.ShadyCSS ? D = !1 : void 0 === window.ShadyCSS.prepareTemplateDom && (console.warn("Incompatible ShadyCSS version detected. Please update to at least @webcomponents/webcomponentsjs@2.0.2 and @webcomponents/shadycss@1.3.1."), D = !1);const z = t => e => {
  const i = L(e.type, t);let s = F.get(i);void 0 === s && (s = { stringsArray: new WeakMap(), keyString: new Map() }, F.set(i, s));let n = s.stringsArray.get(e.strings);if (void 0 !== n) return n;const r = e.strings.join(c);if (void 0 === (n = s.keyString.get(r))) {
    const i = e.getTemplateElement();D && window.ShadyCSS.prepareTemplateDom(i, t), n = new u(e, i), s.keyString.set(r, n);
  }return s.stringsArray.set(e.strings, n), n;
},
      I = ["html", "svg"],
      q = new Set(),
      U = (t, e, i) => {
  q.add(t);const s = i ? i.element : document.createElement("template"),
        n = e.querySelectorAll("style"),
        { length: r } = n;if (0 === r) return void window.ShadyCSS.prepareTemplateStyles(s, t);const a = document.createElement("style");for (let l = 0; l < r; l++) {
    const t = n[l];t.parentNode.removeChild(t), a.textContent += t.textContent;
  }(t => {
    I.forEach(e => {
      const i = F.get(L(e, t));void 0 !== i && i.keyString.forEach(t => {
        const { element: { content: e } } = t,
              i = new Set();Array.from(e.querySelectorAll("style")).forEach(t => {
          i.add(t);
        }), j(t, i);
      });
    });
  })(t);const o = s.content;i ? function (t, e, i = null) {
    const { element: { content: s }, parts: n } = t;if (null == i) return void s.appendChild(e);const r = document.createTreeWalker(s, B, null, !1);let a = H(n),
        o = 0,
        c = -1;for (; r.nextNode();) for (c++, r.currentNode === i && (o = $(e), i.parentNode.insertBefore(e, i)); -1 !== a && n[a].index === c;) {
      if (o > 0) {
        for (; -1 !== a;) n[a].index += o, a = H(n, a);return;
      }a = H(n, a);
    }
  }(i, a, o.firstChild) : o.insertBefore(a, o.firstChild), window.ShadyCSS.prepareTemplateStyles(s, t);const c = o.querySelector("style");if (window.ShadyCSS.nativeShadow && null !== c) e.insertBefore(c.cloneNode(!0), e.firstChild);else if (i) {
    o.insertBefore(a, o.firstChild);const t = new Set();t.add(a), j(i, t);
  }
};window.JSCompiler_renameProperty = (t, e) => t;const Y = { toAttribute(t, e) {
    switch (e) {case Boolean:
        return t ? "" : null;case Object:case Array:
        return null == t ? t : JSON.stringify(t);}return t;
  }, fromAttribute(t, e) {
    switch (e) {case Boolean:
        return null !== t;case Number:
        return null === t ? null : Number(t);case Object:case Array:
        return JSON.parse(t);}return t;
  } },
      W = (t, e) => e !== t && (e == e || t == t),
      G = { attribute: !0, type: String, converter: Y, reflect: !1, hasChanged: W },
      J = Promise.resolve(!0),
      Q = 1,
      Z = 4,
      K = 8,
      X = 16,
      tt = 32,
      et = "finalized";class it extends HTMLElement {
  constructor() {
    super(), this._updateState = 0, this._instanceProperties = void 0, this._updatePromise = J, this._hasConnectedResolver = void 0, this._changedProperties = new Map(), this._reflectingProperties = void 0, this.initialize();
  }static get observedAttributes() {
    this.finalize();const t = [];return this._classProperties.forEach((e, i) => {
      const s = this._attributeNameForProperty(i, e);void 0 !== s && (this._attributeToPropertyMap.set(s, i), t.push(s));
    }), t;
  }static _ensureClassProperties() {
    if (!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties", this))) {
      this._classProperties = new Map();const t = Object.getPrototypeOf(this)._classProperties;void 0 !== t && t.forEach((t, e) => this._classProperties.set(e, t));
    }
  }static createProperty(t, e = G) {
    if (this._ensureClassProperties(), this._classProperties.set(t, e), e.noAccessor || this.prototype.hasOwnProperty(t)) return;const i = "symbol" == typeof t ? Symbol() : `__${t}`;Object.defineProperty(this.prototype, t, { get() {
        return this[i];
      }, set(e) {
        const s = this[t];this[i] = e, this._requestUpdate(t, s);
      }, configurable: !0, enumerable: !0 });
  }static finalize() {
    const t = Object.getPrototypeOf(this);if (t.hasOwnProperty(et) || t.finalize(), this[et] = !0, this._ensureClassProperties(), this._attributeToPropertyMap = new Map(), this.hasOwnProperty(JSCompiler_renameProperty("properties", this))) {
      const t = this.properties,
            e = [...Object.getOwnPropertyNames(t), ...("function" == typeof Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(t) : [])];for (const i of e) this.createProperty(i, t[i]);
    }
  }static _attributeNameForProperty(t, e) {
    const i = e.attribute;return !1 === i ? void 0 : "string" == typeof i ? i : "string" == typeof t ? t.toLowerCase() : void 0;
  }static _valueHasChanged(t, e, i = W) {
    return i(t, e);
  }static _propertyValueFromAttribute(t, e) {
    const i = e.type,
          s = e.converter || Y,
          n = "function" == typeof s ? s : s.fromAttribute;return n ? n(t, i) : t;
  }static _propertyValueToAttribute(t, e) {
    if (void 0 === e.reflect) return;const i = e.type,
          s = e.converter;return (s && s.toAttribute || Y.toAttribute)(t, i);
  }initialize() {
    this._saveInstanceProperties(), this._requestUpdate();
  }_saveInstanceProperties() {
    this.constructor._classProperties.forEach((t, e) => {
      if (this.hasOwnProperty(e)) {
        const t = this[e];delete this[e], this._instanceProperties || (this._instanceProperties = new Map()), this._instanceProperties.set(e, t);
      }
    });
  }_applyInstanceProperties() {
    this._instanceProperties.forEach((t, e) => this[e] = t), this._instanceProperties = void 0;
  }connectedCallback() {
    this._updateState = this._updateState | tt, this._hasConnectedResolver && (this._hasConnectedResolver(), this._hasConnectedResolver = void 0);
  }disconnectedCallback() {}attributeChangedCallback(t, e, i) {
    e !== i && this._attributeToProperty(t, i);
  }_propertyToAttribute(t, e, i = G) {
    const s = this.constructor,
          n = s._attributeNameForProperty(t, i);if (void 0 !== n) {
      const t = s._propertyValueToAttribute(e, i);if (void 0 === t) return;this._updateState = this._updateState | K, null == t ? this.removeAttribute(n) : this.setAttribute(n, t), this._updateState = this._updateState & ~K;
    }
  }_attributeToProperty(t, e) {
    if (this._updateState & K) return;const i = this.constructor,
          s = i._attributeToPropertyMap.get(t);if (void 0 !== s) {
      const t = i._classProperties.get(s) || G;this._updateState = this._updateState | X, this[s] = i._propertyValueFromAttribute(e, t), this._updateState = this._updateState & ~X;
    }
  }_requestUpdate(t, e) {
    let i = !0;if (void 0 !== t) {
      const s = this.constructor,
            n = s._classProperties.get(t) || G;s._valueHasChanged(this[t], e, n.hasChanged) ? (this._changedProperties.has(t) || this._changedProperties.set(t, e), !0 !== n.reflect || this._updateState & X || (void 0 === this._reflectingProperties && (this._reflectingProperties = new Map()), this._reflectingProperties.set(t, n))) : i = !1;
    }!this._hasRequestedUpdate && i && this._enqueueUpdate();
  }requestUpdate(t, e) {
    return this._requestUpdate(t, e), this.updateComplete;
  }async _enqueueUpdate() {
    let t, e;this._updateState = this._updateState | Z;const i = this._updatePromise;this._updatePromise = new Promise((i, s) => {
      t = i, e = s;
    });try {
      await i;
    } catch (s) {}this._hasConnected || (await new Promise(t => this._hasConnectedResolver = t));try {
      const t = this.performUpdate();null != t && (await t);
    } catch (s) {
      e(s);
    }t(!this._hasRequestedUpdate);
  }get _hasConnected() {
    return this._updateState & tt;
  }get _hasRequestedUpdate() {
    return this._updateState & Z;
  }get hasUpdated() {
    return this._updateState & Q;
  }performUpdate() {
    this._instanceProperties && this._applyInstanceProperties();let t = !1;const e = this._changedProperties;try {
      (t = this.shouldUpdate(e)) && this.update(e);
    } catch (i) {
      throw t = !1, i;
    } finally {
      this._markUpdated();
    }t && (this._updateState & Q || (this._updateState = this._updateState | Q, this.firstUpdated(e)), this.updated(e));
  }_markUpdated() {
    this._changedProperties = new Map(), this._updateState = this._updateState & ~Z;
  }get updateComplete() {
    return this._getUpdateComplete();
  }_getUpdateComplete() {
    return this._updatePromise;
  }shouldUpdate(t) {
    return !0;
  }update(t) {
    void 0 !== this._reflectingProperties && this._reflectingProperties.size > 0 && (this._reflectingProperties.forEach((t, e) => this._propertyToAttribute(e, this[e], t)), this._reflectingProperties = void 0);
  }updated(t) {}firstUpdated(t) {}
}it[et] = !0;
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
const st = (t, e) => "method" !== e.kind || !e.descriptor || "value" in e.descriptor ? { kind: "field", key: Symbol(), placement: "own", descriptor: {}, initializer() {
    "function" == typeof e.initializer && (this[e.key] = e.initializer.call(this));
  }, finisher(i) {
    i.createProperty(e.key, t);
  } } : Object.assign({}, e, { finisher(i) {
    i.createProperty(e.key, t);
  } }),
      nt = (t, e, i) => {
  e.constructor.createProperty(i, t);
};function rt(t) {
  return (e, i) => void 0 !== i ? nt(t, e, i) : st(t, e);
}
/**
@license
Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const at = "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype,
      ot = Symbol();class ct {
  constructor(t, e) {
    if (e !== ot) throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText = t;
  }get styleSheet() {
    return void 0 === this._styleSheet && (at ? (this._styleSheet = new CSSStyleSheet(), this._styleSheet.replaceSync(this.cssText)) : this._styleSheet = null), this._styleSheet;
  }toString() {
    return this.cssText;
  }
}
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
(window.litElementVersions || (window.litElementVersions = [])).push("2.2.1");const lt = t => t.flat ? t.flat(1 / 0) : function t(e, i = []) {
  for (let s = 0, n = e.length; s < n; s++) {
    const n = e[s];Array.isArray(n) ? t(n, i) : i.push(n);
  }return i;
}(t);class ht extends it {
  static finalize() {
    super.finalize.call(this), this._styles = this.hasOwnProperty(JSCompiler_renameProperty("styles", this)) ? this._getUniqueStyles() : this._styles || [];
  }static _getUniqueStyles() {
    const t = this.styles,
          e = [];if (Array.isArray(t)) {
      lt(t).reduceRight((t, e) => (t.add(e), t), new Set()).forEach(t => e.unshift(t));
    } else t && e.push(t);return e;
  }initialize() {
    super.initialize(), this.renderRoot = this.createRenderRoot(), window.ShadowRoot && this.renderRoot instanceof window.ShadowRoot && this.adoptStyles();
  }createRenderRoot() {
    return this.attachShadow({ mode: "open" });
  }adoptStyles() {
    const t = this.constructor._styles;0 !== t.length && (void 0 === window.ShadyCSS || window.ShadyCSS.nativeShadow ? at ? this.renderRoot.adoptedStyleSheets = t.map(t => t.styleSheet) : this._needsShimAdoptedStyleSheets = !0 : window.ShadyCSS.ScopingShim.prepareAdoptedCssText(t.map(t => t.cssText), this.localName));
  }connectedCallback() {
    super.connectedCallback(), this.hasUpdated && void 0 !== window.ShadyCSS && window.ShadyCSS.styleElement(this);
  }update(t) {
    super.update(t);const e = this.render();e instanceof y && this.constructor.render(e, this.renderRoot, { scopeName: this.localName, eventContext: this }), this._needsShimAdoptedStyleSheets && (this._needsShimAdoptedStyleSheets = !1, this.constructor._styles.forEach(t => {
      const e = document.createElement("style");e.textContent = t.cssText, this.renderRoot.appendChild(e);
    }));
  }render() {}
}ht.finalized = !0, ht.render = (t, e, i) => {
  if (!i || "object" != typeof i || !i.scopeName) throw new Error("The `scopeName` option is required.");const s = i.scopeName,
        n = R.has(e),
        a = D && 11 === e.nodeType && !!e.host,
        o = a && !q.has(s),
        c = o ? document.createDocumentFragment() : e;if (((t, e, i) => {
    let s = R.get(e);void 0 === s && (r(e, e.firstChild), R.set(e, s = new k(Object.assign({ templateFactory: T }, i))), s.appendInto(e)), s.setValue(t), s.commit();
  })(t, c, Object.assign({ templateFactory: z(s) }, i)), o) {
    const t = R.get(c);R.delete(c);const i = t.value instanceof b ? t.value.template : void 0;U(s, c, i), r(e, e.firstChild), e.appendChild(c), R.set(e, t);
  }!n && a && window.ShadyCSS.styleElement(e.host);
};
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
const dt = new WeakMap(),
      ut = i(t => e => {
  if (!(e instanceof M) || e instanceof O || "style" !== e.committer.name || e.committer.parts.length > 1) throw new Error("The `styleMap` directive must be used in the style attribute and must be the only part in the attribute.");const { committer: i } = e,
        { style: s } = i.element;dt.has(e) || (s.cssText = i.strings.join(" "));const n = dt.get(e);for (const r in n) r in t || (-1 === r.indexOf("-") ? s[r] = null : s.removeProperty(r));for (const r in t) -1 === r.indexOf("-") ? s[r] = t[r] : s.setProperty(r, t[r]);dt.set(e, t);
}),
      pt = new WeakMap(),
      ft = i(t => e => {
  if (!(e instanceof k)) throw new Error("unsafeHTML can only be used in text bindings");const i = pt.get(e);if (void 0 !== i && v(t) && t === i.value && e.value === i.fragment) return;const s = document.createElement("template");s.innerHTML = t;const n = document.importNode(s.content, !0);e.setValue(n), pt.set(e, { value: t, fragment: n });
}),
      mt = i(t => e => {
  if (void 0 === t && e instanceof M) {
    if (t !== e.value) {
      const t = e.committer.name;e.committer.element.removeAttribute(t);
    }
  } else e.setValue(t);
}),
      gt = new WeakMap(),
      bt = i(t => e => {
  if (!(e instanceof M) || e instanceof O || "class" !== e.committer.name || e.committer.parts.length > 1) throw new Error("The `classMap` directive must be used in the `class` attribute and must be the only part in the attribute.");const { committer: i } = e,
        { element: s } = i;gt.has(e) || (s.className = i.strings.join(" "));const { classList: n } = s,
        r = gt.get(e);for (const a in r) a in t || n.remove(a);for (const a in t) {
    const e = t[a];if (!r || e !== r[a]) {
      n[e ? "add" : "remove"](a);
    }
  }gt.set(e, t);
});var _t = {},
    yt = /d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g,
    vt = "[^\\s]+",
    wt = /\[([^]*?)\]/gm,
    St = function () {};function Mt(t, e) {
  for (var i = [], s = 0, n = t.length; s < n; s++) i.push(t[s].substr(0, e));return i;
}function kt(t) {
  return function (e, i, s) {
    var n = s[t].indexOf(i.charAt(0).toUpperCase() + i.substr(1).toLowerCase());~n && (e.month = n);
  };
}function xt(t, e) {
  for (t = String(t), e = e || 2; t.length < e;) t = "0" + t;return t;
}var Nt = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    Ot = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    Ct = Mt(Ot, 3),
    At = Mt(Nt, 3);_t.i18n = { dayNamesShort: At, dayNames: Nt, monthNamesShort: Ct, monthNames: Ot, amPm: ["am", "pm"], DoFn: function (t) {
    return t + ["th", "st", "nd", "rd"][t % 10 > 3 ? 0 : (t - t % 10 != 10) * t % 10];
  } };var Pt = { D: function (t) {
    return t.getDate();
  }, DD: function (t) {
    return xt(t.getDate());
  }, Do: function (t, e) {
    return e.DoFn(t.getDate());
  }, d: function (t) {
    return t.getDay();
  }, dd: function (t) {
    return xt(t.getDay());
  }, ddd: function (t, e) {
    return e.dayNamesShort[t.getDay()];
  }, dddd: function (t, e) {
    return e.dayNames[t.getDay()];
  }, M: function (t) {
    return t.getMonth() + 1;
  }, MM: function (t) {
    return xt(t.getMonth() + 1);
  }, MMM: function (t, e) {
    return e.monthNamesShort[t.getMonth()];
  }, MMMM: function (t, e) {
    return e.monthNames[t.getMonth()];
  }, YY: function (t) {
    return xt(String(t.getFullYear()), 4).substr(2);
  }, YYYY: function (t) {
    return xt(t.getFullYear(), 4);
  }, h: function (t) {
    return t.getHours() % 12 || 12;
  }, hh: function (t) {
    return xt(t.getHours() % 12 || 12);
  }, H: function (t) {
    return t.getHours();
  }, HH: function (t) {
    return xt(t.getHours());
  }, m: function (t) {
    return t.getMinutes();
  }, mm: function (t) {
    return xt(t.getMinutes());
  }, s: function (t) {
    return t.getSeconds();
  }, ss: function (t) {
    return xt(t.getSeconds());
  }, S: function (t) {
    return Math.round(t.getMilliseconds() / 100);
  }, SS: function (t) {
    return xt(Math.round(t.getMilliseconds() / 10), 2);
  }, SSS: function (t) {
    return xt(t.getMilliseconds(), 3);
  }, a: function (t, e) {
    return t.getHours() < 12 ? e.amPm[0] : e.amPm[1];
  }, A: function (t, e) {
    return t.getHours() < 12 ? e.amPm[0].toUpperCase() : e.amPm[1].toUpperCase();
  }, ZZ: function (t) {
    var e = t.getTimezoneOffset();return (e > 0 ? "-" : "+") + xt(100 * Math.floor(Math.abs(e) / 60) + Math.abs(e) % 60, 4);
  } },
    Et = { D: ["\\d\\d?", function (t, e) {
    t.day = e;
  }], Do: ["\\d\\d?" + vt, function (t, e) {
    t.day = parseInt(e, 10);
  }], M: ["\\d\\d?", function (t, e) {
    t.month = e - 1;
  }], YY: ["\\d\\d?", function (t, e) {
    var i = +("" + new Date().getFullYear()).substr(0, 2);t.year = "" + (e > 68 ? i - 1 : i) + e;
  }], h: ["\\d\\d?", function (t, e) {
    t.hour = e;
  }], m: ["\\d\\d?", function (t, e) {
    t.minute = e;
  }], s: ["\\d\\d?", function (t, e) {
    t.second = e;
  }], YYYY: ["\\d{4}", function (t, e) {
    t.year = e;
  }], S: ["\\d", function (t, e) {
    t.millisecond = 100 * e;
  }], SS: ["\\d{2}", function (t, e) {
    t.millisecond = 10 * e;
  }], SSS: ["\\d{3}", function (t, e) {
    t.millisecond = e;
  }], d: ["\\d\\d?", St], ddd: [vt, St], MMM: [vt, kt("monthNamesShort")], MMMM: [vt, kt("monthNames")], a: [vt, function (t, e, i) {
    var s = e.toLowerCase();s === i.amPm[0] ? t.isPm = !1 : s === i.amPm[1] && (t.isPm = !0);
  }], ZZ: ["[^\\s]*?[\\+\\-]\\d\\d:?\\d\\d|[^\\s]*?Z", function (t, e) {
    var i,
        s = (e + "").match(/([+-]|\d\d)/gi);s && (i = 60 * s[1] + parseInt(s[2], 10), t.timezoneOffset = "+" === s[0] ? i : -i);
  }] };function Tt(t) {
  var e = t.split(":").map(Number);return 3600 * e[0] + 60 * e[1] + e[2];
}Et.dd = Et.d, Et.dddd = Et.ddd, Et.DD = Et.D, Et.mm = Et.m, Et.hh = Et.H = Et.HH = Et.h, Et.MM = Et.M, Et.ss = Et.s, Et.A = Et.a, _t.masks = { default: "ddd MMM DD YYYY HH:mm:ss", shortDate: "M/D/YY", mediumDate: "MMM D, YYYY", longDate: "MMMM D, YYYY", fullDate: "dddd, MMMM D, YYYY", shortTime: "HH:mm", mediumTime: "HH:mm:ss", longTime: "HH:mm:ss.SSS" }, _t.format = function (t, e, i) {
  var s = i || _t.i18n;if ("number" == typeof t && (t = new Date(t)), "[object Date]" !== Object.prototype.toString.call(t) || isNaN(t.getTime())) throw new Error("Invalid Date in fecha.format");e = _t.masks[e] || e || _t.masks.default;var n = [];return (e = (e = e.replace(wt, function (t, e) {
    return n.push(e), "@@@";
  })).replace(yt, function (e) {
    return e in Pt ? Pt[e](t, s) : e.slice(1, e.length - 1);
  })).replace(/@@@/g, function () {
    return n.shift();
  });
}, _t.parse = function (t, e, i) {
  var s = i || _t.i18n;if ("string" != typeof e) throw new Error("Invalid format in fecha.parse");if (e = _t.masks[e] || e, t.length > 1e3) return null;var n = {},
      r = [],
      a = [];e = e.replace(wt, function (t, e) {
    return a.push(e), "@@@";
  });var o,
      c = (o = e, o.replace(/[|\\{()[^$+*?.-]/g, "\\$&")).replace(yt, function (t) {
    if (Et[t]) {
      var e = Et[t];return r.push(e[1]), "(" + e[0] + ")";
    }return t;
  });c = c.replace(/@@@/g, function () {
    return a.shift();
  });var l = t.match(new RegExp(c, "i"));if (!l) return null;for (var h = 1; h < l.length; h++) r[h - 1](n, l[h], s);var d,
      u = new Date();return !0 === n.isPm && null != n.hour && 12 != +n.hour ? n.hour = +n.hour + 12 : !1 === n.isPm && 12 == +n.hour && (n.hour = 0), null != n.timezoneOffset ? (n.minute = +(n.minute || 0) - +n.timezoneOffset, d = new Date(Date.UTC(n.year || u.getFullYear(), n.month || 0, n.day || 1, n.hour || 0, n.minute || 0, n.second || 0, n.millisecond || 0))) : d = new Date(n.year || u.getFullYear(), n.month || 0, n.day || 1, n.hour || 0, n.minute || 0, n.second || 0, n.millisecond || 0), d;
};(function () {
  try {
    new Date().toLocaleDateString("i");
  } catch (t) {
    return "RangeError" === t.name;
  }
})(), function () {
  try {
    new Date().toLocaleString("i");
  } catch (t) {
    return "RangeError" === t.name;
  }
}(), function () {
  try {
    new Date().toLocaleTimeString("i");
  } catch (t) {
    return "RangeError" === t.name;
  }
}();var Ft = function (t) {
  return t < 10 ? "0" + t : t;
};var Rt = "hass:bookmark",
    Vt = ["closed", "locked", "off"],
    Bt = function (t, e, i, s) {
  s = s || {}, i = null == i ? {} : i;var n = new Event(e, { bubbles: void 0 === s.bubbles || s.bubbles, cancelable: Boolean(s.cancelable), composed: void 0 === s.composed || s.composed });return n.detail = i, t.dispatchEvent(n), n;
},
    jt = { alert: "hass:alert", automation: "hass:playlist-play", calendar: "hass:calendar", camera: "hass:video", climate: "hass:thermostat", configurator: "hass:settings", conversation: "hass:text-to-speech", device_tracker: "hass:account", fan: "hass:fan", group: "hass:google-circles-communities", history_graph: "hass:chart-line", homeassistant: "hass:home-assistant", homekit: "hass:home-automation", image_processing: "hass:image-filter-frames", input_boolean: "hass:drawing", input_datetime: "hass:calendar-clock", input_number: "hass:ray-vertex", input_select: "hass:format-list-bulleted", input_text: "hass:textbox", light: "hass:lightbulb", mailbox: "hass:mailbox", notify: "hass:comment-alert", person: "hass:account", plant: "hass:flower", proximity: "hass:apple-safari", remote: "hass:remote", scene: "hass:google-pages", script: "hass:file-document", sensor: "hass:eye", simple_alarm: "hass:bell", sun: "hass:white-balance-sunny", switch: "hass:flash", timer: "hass:timer", updater: "hass:cloud-upload", vacuum: "hass:robot-vacuum", water_heater: "hass:thermometer", weblink: "hass:open-in-new" };var $t = function (t, e) {
  Bt(t, "haptic", e);
},
    Ht = function (t, e, i, s, n) {
  var r;if (n && i.double_tap_action ? r = i.double_tap_action : s && i.hold_action ? r = i.hold_action : !s && i.tap_action && (r = i.tap_action), r || (r = { action: "more-info" }), !r.confirmation || r.confirmation.exemptions && r.confirmation.exemptions.some(function (t) {
    return t.user === e.user.id;
  }) || confirm(r.confirmation.text || "Are you sure you want to " + r.action + "?")) switch (r.action) {case "more-info":
      (i.entity || i.camera_image) && (Bt(t, "hass-more-info", { entityId: r.entity ? r.entity : i.entity ? i.entity : i.camera_image }), r.haptic && $t(t, r.haptic));break;case "navigate":
      r.navigation_path && (function (t, e, i) {
        void 0 === i && (i = !1), i ? history.replaceState(null, "", e) : history.pushState(null, "", e), Bt(window, "location-changed", { replace: i });
      }(0, r.navigation_path), r.haptic && $t(t, r.haptic));break;case "url":
      r.url_path && window.open(r.url_path), r.haptic && $t(t, r.haptic);break;case "toggle":
      i.entity && (function (t, e) {
        (function (t, e, i) {
          void 0 === i && (i = !0);var s,
              n = function (t) {
            return t.substr(0, t.indexOf("."));
          }(e),
              r = "group" === n ? "homeassistant" : n;switch (n) {case "lock":
              s = i ? "unlock" : "lock";break;case "cover":
              s = i ? "open_cover" : "close_cover";break;default:
              s = i ? "turn_on" : "turn_off";}t.callService(r, s, { entity_id: e });
        })(t, e, Vt.includes(t.states[e].state));
      }(e, i.entity), r.haptic && $t(t, r.haptic));break;case "call-service":
      if (!r.service) return;var a = r.service.split(".", 2),
          o = a[0],
          c = a[1],
          l = Object.assign({}, r.service_data);"entity" === l.entity_id && (l.entity_id = i.entity), e.callService(o, c, l), r.haptic && $t(t, r.haptic);}
};const Lt = { "Amazon Silk": "amazon_silk", "Android Browser": "android", Bada: "bada", BlackBerry: "blackberry", Chrome: "chrome", Chromium: "chromium", Epiphany: "epiphany", Firefox: "firefox", Focus: "focus", Generic: "generic", "Google Search": "google_search", Googlebot: "googlebot", "Internet Explorer": "ie", "K-Meleon": "k_meleon", Maxthon: "maxthon", "Microsoft Edge": "edge", "MZ Browser": "mz", "NAVER Whale Browser": "naver", Opera: "opera", "Opera Coast": "opera_coast", PhantomJS: "phantomjs", Puffin: "puffin", QupZilla: "qupzilla", QQ: "qq", QQLite: "qqlite", Safari: "safari", Sailfish: "sailfish", "Samsung Internet for Android": "samsung_internet", SeaMonkey: "seamonkey", Sleipnir: "sleipnir", Swing: "swing", Tizen: "tizen", "UC Browser": "uc", Vivaldi: "vivaldi", "WebOS Browser": "webos", WeChat: "wechat", "Yandex Browser": "yandex", Roku: "roku" },
      Dt = { amazon_silk: "Amazon Silk", android: "Android Browser", bada: "Bada", blackberry: "BlackBerry", chrome: "Chrome", chromium: "Chromium", epiphany: "Epiphany", firefox: "Firefox", focus: "Focus", generic: "Generic", googlebot: "Googlebot", google_search: "Google Search", ie: "Internet Explorer", k_meleon: "K-Meleon", maxthon: "Maxthon", edge: "Microsoft Edge", mz: "MZ Browser", naver: "NAVER Whale Browser", opera: "Opera", opera_coast: "Opera Coast", phantomjs: "PhantomJS", puffin: "Puffin", qupzilla: "QupZilla", qq: "QQ Browser", qqlite: "QQ Browser Lite", safari: "Safari", sailfish: "Sailfish", samsung_internet: "Samsung Internet for Android", seamonkey: "SeaMonkey", sleipnir: "Sleipnir", swing: "Swing", tizen: "Tizen", uc: "UC Browser", vivaldi: "Vivaldi", webos: "WebOS Browser", wechat: "WeChat", yandex: "Yandex Browser" },
      zt = { tablet: "tablet", mobile: "mobile", desktop: "desktop", tv: "tv" },
      It = { WindowsPhone: "Windows Phone", Windows: "Windows", MacOS: "macOS", iOS: "iOS", Android: "Android", WebOS: "WebOS", BlackBerry: "BlackBerry", Bada: "Bada", Tizen: "Tizen", Linux: "Linux", ChromeOS: "Chrome OS", PlayStation4: "PlayStation 4", Roku: "Roku" },
      qt = { EdgeHTML: "EdgeHTML", Blink: "Blink", Trident: "Trident", Presto: "Presto", Gecko: "Gecko", WebKit: "WebKit" };class Ut {
  static getFirstMatch(t, e) {
    const i = e.match(t);return i && i.length > 0 && i[1] || "";
  }static getSecondMatch(t, e) {
    const i = e.match(t);return i && i.length > 1 && i[2] || "";
  }static matchAndReturnConst(t, e, i) {
    if (t.test(e)) return i;
  }static getWindowsVersionName(t) {
    switch (t) {case "NT":
        return "NT";case "XP":
        return "XP";case "NT 5.0":
        return "2000";case "NT 5.1":
        return "XP";case "NT 5.2":
        return "2003";case "NT 6.0":
        return "Vista";case "NT 6.1":
        return "7";case "NT 6.2":
        return "8";case "NT 6.3":
        return "8.1";case "NT 10.0":
        return "10";default:
        return;}
  }static getMacOSVersionName(t) {
    const e = t.split(".").splice(0, 2).map(t => parseInt(t, 10) || 0);if (e.push(0), 10 === e[0]) switch (e[1]) {case 5:
        return "Leopard";case 6:
        return "Snow Leopard";case 7:
        return "Lion";case 8:
        return "Mountain Lion";case 9:
        return "Mavericks";case 10:
        return "Yosemite";case 11:
        return "El Capitan";case 12:
        return "Sierra";case 13:
        return "High Sierra";case 14:
        return "Mojave";case 15:
        return "Catalina";default:
        return;}
  }static getAndroidVersionName(t) {
    const e = t.split(".").splice(0, 2).map(t => parseInt(t, 10) || 0);if (e.push(0), !(1 === e[0] && e[1] < 5)) return 1 === e[0] && e[1] < 6 ? "Cupcake" : 1 === e[0] && e[1] >= 6 ? "Donut" : 2 === e[0] && e[1] < 2 ? "Eclair" : 2 === e[0] && 2 === e[1] ? "Froyo" : 2 === e[0] && e[1] > 2 ? "Gingerbread" : 3 === e[0] ? "Honeycomb" : 4 === e[0] && e[1] < 1 ? "Ice Cream Sandwich" : 4 === e[0] && e[1] < 4 ? "Jelly Bean" : 4 === e[0] && e[1] >= 4 ? "KitKat" : 5 === e[0] ? "Lollipop" : 6 === e[0] ? "Marshmallow" : 7 === e[0] ? "Nougat" : 8 === e[0] ? "Oreo" : 9 === e[0] ? "Pie" : void 0;
  }static getVersionPrecision(t) {
    return t.split(".").length;
  }static compareVersions(t, e, i = !1) {
    const s = Ut.getVersionPrecision(t),
          n = Ut.getVersionPrecision(e);let r = Math.max(s, n),
        a = 0;const o = Ut.map([t, e], t => {
      const e = r - Ut.getVersionPrecision(t),
            i = t + new Array(e + 1).join(".0");return Ut.map(i.split("."), t => new Array(20 - t.length).join("0") + t).reverse();
    });for (i && (a = r - Math.min(s, n)), r -= 1; r >= a;) {
      if (o[0][r] > o[1][r]) return 1;if (o[0][r] === o[1][r]) {
        if (r === a) return 0;r -= 1;
      } else if (o[0][r] < o[1][r]) return -1;
    }
  }static map(t, e) {
    const i = [];let s;if (Array.prototype.map) return Array.prototype.map.call(t, e);for (s = 0; s < t.length; s += 1) i.push(e(t[s]));return i;
  }static getBrowserAlias(t) {
    return Lt[t];
  }static getBrowserTypeByAlias(t) {
    return Dt[t] || "";
  }
}const Yt = /version\/(\d+(\.?_?\d+)+)/i,
      Wt = [{ test: [/googlebot/i], describe(t) {
    const e = { name: "Googlebot" },
          i = Ut.getFirstMatch(/googlebot\/(\d+(\.\d+))/i, t) || Ut.getFirstMatch(Yt, t);return i && (e.version = i), e;
  } }, { test: [/opera/i], describe(t) {
    const e = { name: "Opera" },
          i = Ut.getFirstMatch(Yt, t) || Ut.getFirstMatch(/(?:opera)[\s\/](\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/opr\/|opios/i], describe(t) {
    const e = { name: "Opera" },
          i = Ut.getFirstMatch(/(?:opr|opios)[\s\/](\S+)/i, t) || Ut.getFirstMatch(Yt, t);return i && (e.version = i), e;
  } }, { test: [/SamsungBrowser/i], describe(t) {
    const e = { name: "Samsung Internet for Android" },
          i = Ut.getFirstMatch(Yt, t) || Ut.getFirstMatch(/(?:SamsungBrowser)[\s\/](\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/Whale/i], describe(t) {
    const e = { name: "NAVER Whale Browser" },
          i = Ut.getFirstMatch(Yt, t) || Ut.getFirstMatch(/(?:whale)[\s\/](\d+(?:\.\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/MZBrowser/i], describe(t) {
    const e = { name: "MZ Browser" },
          i = Ut.getFirstMatch(/(?:MZBrowser)[\s\/](\d+(?:\.\d+)+)/i, t) || Ut.getFirstMatch(Yt, t);return i && (e.version = i), e;
  } }, { test: [/focus/i], describe(t) {
    const e = { name: "Focus" },
          i = Ut.getFirstMatch(/(?:focus)[\s\/](\d+(?:\.\d+)+)/i, t) || Ut.getFirstMatch(Yt, t);return i && (e.version = i), e;
  } }, { test: [/swing/i], describe(t) {
    const e = { name: "Swing" },
          i = Ut.getFirstMatch(/(?:swing)[\s\/](\d+(?:\.\d+)+)/i, t) || Ut.getFirstMatch(Yt, t);return i && (e.version = i), e;
  } }, { test: [/coast/i], describe(t) {
    const e = { name: "Opera Coast" },
          i = Ut.getFirstMatch(Yt, t) || Ut.getFirstMatch(/(?:coast)[\s\/](\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/yabrowser/i], describe(t) {
    const e = { name: "Yandex Browser" },
          i = Ut.getFirstMatch(/(?:yabrowser)[\s\/](\d+(\.?_?\d+)+)/i, t) || Ut.getFirstMatch(Yt, t);return i && (e.version = i), e;
  } }, { test: [/ucbrowser/i], describe(t) {
    const e = { name: "UC Browser" },
          i = Ut.getFirstMatch(Yt, t) || Ut.getFirstMatch(/(?:ucbrowser)[\s\/](\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/Maxthon|mxios/i], describe(t) {
    const e = { name: "Maxthon" },
          i = Ut.getFirstMatch(Yt, t) || Ut.getFirstMatch(/(?:Maxthon|mxios)[\s\/](\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/epiphany/i], describe(t) {
    const e = { name: "Epiphany" },
          i = Ut.getFirstMatch(Yt, t) || Ut.getFirstMatch(/(?:epiphany)[\s\/](\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/puffin/i], describe(t) {
    const e = { name: "Puffin" },
          i = Ut.getFirstMatch(Yt, t) || Ut.getFirstMatch(/(?:puffin)[\s\/](\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/sleipnir/i], describe(t) {
    const e = { name: "Sleipnir" },
          i = Ut.getFirstMatch(Yt, t) || Ut.getFirstMatch(/(?:sleipnir)[\s\/](\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/k-meleon/i], describe(t) {
    const e = { name: "K-Meleon" },
          i = Ut.getFirstMatch(Yt, t) || Ut.getFirstMatch(/(?:k-meleon)[\s\/](\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/micromessenger/i], describe(t) {
    const e = { name: "WeChat" },
          i = Ut.getFirstMatch(/(?:micromessenger)[\s\/](\d+(\.?_?\d+)+)/i, t) || Ut.getFirstMatch(Yt, t);return i && (e.version = i), e;
  } }, { test: [/qqbrowser/i], describe(t) {
    const e = { name: /qqbrowserlite/i.test(t) ? "QQ Browser Lite" : "QQ Browser" },
          i = Ut.getFirstMatch(/(?:qqbrowserlite|qqbrowser)[\/](\d+(\.?_?\d+)+)/i, t) || Ut.getFirstMatch(Yt, t);return i && (e.version = i), e;
  } }, { test: [/msie|trident/i], describe(t) {
    const e = { name: "Internet Explorer" },
          i = Ut.getFirstMatch(/(?:msie |rv:)(\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/\sedg\//i], describe(t) {
    const e = { name: "Microsoft Edge" },
          i = Ut.getFirstMatch(/\sedg\/(\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/edg([ea]|ios)/i], describe(t) {
    const e = { name: "Microsoft Edge" },
          i = Ut.getSecondMatch(/edg([ea]|ios)\/(\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/vivaldi/i], describe(t) {
    const e = { name: "Vivaldi" },
          i = Ut.getFirstMatch(/vivaldi\/(\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/seamonkey/i], describe(t) {
    const e = { name: "SeaMonkey" },
          i = Ut.getFirstMatch(/seamonkey\/(\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/sailfish/i], describe(t) {
    const e = { name: "Sailfish" },
          i = Ut.getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i, t);return i && (e.version = i), e;
  } }, { test: [/silk/i], describe(t) {
    const e = { name: "Amazon Silk" },
          i = Ut.getFirstMatch(/silk\/(\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/phantom/i], describe(t) {
    const e = { name: "PhantomJS" },
          i = Ut.getFirstMatch(/phantomjs\/(\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/slimerjs/i], describe(t) {
    const e = { name: "SlimerJS" },
          i = Ut.getFirstMatch(/slimerjs\/(\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/blackberry|\bbb\d+/i, /rim\stablet/i], describe(t) {
    const e = { name: "BlackBerry" },
          i = Ut.getFirstMatch(Yt, t) || Ut.getFirstMatch(/blackberry[\d]+\/(\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/(web|hpw)[o0]s/i], describe(t) {
    const e = { name: "WebOS Browser" },
          i = Ut.getFirstMatch(Yt, t) || Ut.getFirstMatch(/w(?:eb)?[o0]sbrowser\/(\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/bada/i], describe(t) {
    const e = { name: "Bada" },
          i = Ut.getFirstMatch(/dolfin\/(\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/tizen/i], describe(t) {
    const e = { name: "Tizen" },
          i = Ut.getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.?_?\d+)+)/i, t) || Ut.getFirstMatch(Yt, t);return i && (e.version = i), e;
  } }, { test: [/qupzilla/i], describe(t) {
    const e = { name: "QupZilla" },
          i = Ut.getFirstMatch(/(?:qupzilla)[\s\/](\d+(\.?_?\d+)+)/i, t) || Ut.getFirstMatch(Yt, t);return i && (e.version = i), e;
  } }, { test: [/firefox|iceweasel|fxios/i], describe(t) {
    const e = { name: "Firefox" },
          i = Ut.getFirstMatch(/(?:firefox|iceweasel|fxios)[\s\/](\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/chromium/i], describe(t) {
    const e = { name: "Chromium" },
          i = Ut.getFirstMatch(/(?:chromium)[\s\/](\d+(\.?_?\d+)+)/i, t) || Ut.getFirstMatch(Yt, t);return i && (e.version = i), e;
  } }, { test: [/chrome|crios|crmo/i], describe(t) {
    const e = { name: "Chrome" },
          i = Ut.getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/GSA/i], describe(t) {
    const e = { name: "Google Search" },
          i = Ut.getFirstMatch(/(?:GSA)\/(\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test(t) {
    const e = !t.test(/like android/i),
          i = t.test(/android/i);return e && i;
  }, describe(t) {
    const e = { name: "Android Browser" },
          i = Ut.getFirstMatch(Yt, t);return i && (e.version = i), e;
  } }, { test: [/playstation 4/i], describe(t) {
    const e = { name: "PlayStation 4" },
          i = Ut.getFirstMatch(Yt, t);return i && (e.version = i), e;
  } }, { test: [/safari|applewebkit/i], describe(t) {
    const e = { name: "Safari" },
          i = Ut.getFirstMatch(Yt, t);return i && (e.version = i), e;
  } }, { test: [/.*/i], describe(t) {
    const e = -1 !== t.search("\\(") ? /^(.*)\/(.*)[ \t]\((.*)/ : /^(.*)\/(.*) /;return { name: Ut.getFirstMatch(e, t), version: Ut.getSecondMatch(e, t) };
  } }];var Gt = [{ test: [/Roku\/DVP/], describe(t) {
    const e = Ut.getFirstMatch(/Roku\/DVP-(\d+\.\d+)/i, t);return { name: It.Roku, version: e };
  } }, { test: [/windows phone/i], describe(t) {
    const e = Ut.getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i, t);return { name: It.WindowsPhone, version: e };
  } }, { test: [/windows/i], describe(t) {
    const e = Ut.getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i, t),
          i = Ut.getWindowsVersionName(e);return { name: It.Windows, version: e, versionName: i };
  } }, { test: [/macintosh/i], describe(t) {
    const e = Ut.getFirstMatch(/mac os x (\d+(\.?_?\d+)+)/i, t).replace(/[_\s]/g, "."),
          i = Ut.getMacOSVersionName(e),
          s = { name: It.MacOS, version: e };return i && (s.versionName = i), s;
  } }, { test: [/(ipod|iphone|ipad)/i], describe(t) {
    const e = Ut.getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i, t).replace(/[_\s]/g, ".");return { name: It.iOS, version: e };
  } }, { test(t) {
    const e = !t.test(/like android/i),
          i = t.test(/android/i);return e && i;
  }, describe(t) {
    const e = Ut.getFirstMatch(/android[\s\/-](\d+(\.\d+)*)/i, t),
          i = Ut.getAndroidVersionName(e),
          s = { name: It.Android, version: e };return i && (s.versionName = i), s;
  } }, { test: [/(web|hpw)[o0]s/i], describe(t) {
    const e = Ut.getFirstMatch(/(?:web|hpw)[o0]s\/(\d+(\.\d+)*)/i, t),
          i = { name: It.WebOS };return e && e.length && (i.version = e), i;
  } }, { test: [/blackberry|\bbb\d+/i, /rim\stablet/i], describe(t) {
    const e = Ut.getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i, t) || Ut.getFirstMatch(/blackberry\d+\/(\d+([_\s]\d+)*)/i, t) || Ut.getFirstMatch(/\bbb(\d+)/i, t);return { name: It.BlackBerry, version: e };
  } }, { test: [/bada/i], describe(t) {
    const e = Ut.getFirstMatch(/bada\/(\d+(\.\d+)*)/i, t);return { name: It.Bada, version: e };
  } }, { test: [/tizen/i], describe(t) {
    const e = Ut.getFirstMatch(/tizen[\/\s](\d+(\.\d+)*)/i, t);return { name: It.Tizen, version: e };
  } }, { test: [/linux/i], describe: () => ({ name: It.Linux }) }, { test: [/CrOS/], describe: () => ({ name: It.ChromeOS }) }, { test: [/PlayStation 4/], describe(t) {
    const e = Ut.getFirstMatch(/PlayStation 4[\/\s](\d+(\.\d+)*)/i, t);return { name: It.PlayStation4, version: e };
  } }],
    Jt = [{ test: [/googlebot/i], describe: () => ({ type: "bot", vendor: "Google" }) }, { test: [/huawei/i], describe(t) {
    const e = Ut.getFirstMatch(/(can-l01)/i, t) && "Nova",
          i = { type: zt.mobile, vendor: "Huawei" };return e && (i.model = e), i;
  } }, { test: [/nexus\s*(?:7|8|9|10).*/i], describe: () => ({ type: zt.tablet, vendor: "Nexus" }) }, { test: [/ipad/i], describe: () => ({ type: zt.tablet, vendor: "Apple", model: "iPad" }) }, { test: [/kftt build/i], describe: () => ({ type: zt.tablet, vendor: "Amazon", model: "Kindle Fire HD 7" }) }, { test: [/silk/i], describe: () => ({ type: zt.tablet, vendor: "Amazon" }) }, { test: [/tablet(?! pc)/i], describe: () => ({ type: zt.tablet }) }, { test(t) {
    const e = t.test(/ipod|iphone/i),
          i = t.test(/like (ipod|iphone)/i);return e && !i;
  }, describe(t) {
    const e = Ut.getFirstMatch(/(ipod|iphone)/i, t);return { type: zt.mobile, vendor: "Apple", model: e };
  } }, { test: [/nexus\s*[0-6].*/i, /galaxy nexus/i], describe: () => ({ type: zt.mobile, vendor: "Nexus" }) }, { test: [/[^-]mobi/i], describe: () => ({ type: zt.mobile }) }, { test: t => "blackberry" === t.getBrowserName(!0), describe: () => ({ type: zt.mobile, vendor: "BlackBerry" }) }, { test: t => "bada" === t.getBrowserName(!0), describe: () => ({ type: zt.mobile }) }, { test: t => "windows phone" === t.getBrowserName(), describe: () => ({ type: zt.mobile, vendor: "Microsoft" }) }, { test(t) {
    const e = Number(String(t.getOSVersion()).split(".")[0]);return "android" === t.getOSName(!0) && e >= 3;
  }, describe: () => ({ type: zt.tablet }) }, { test: t => "android" === t.getOSName(!0), describe: () => ({ type: zt.mobile }) }, { test: t => "macos" === t.getOSName(!0), describe: () => ({ type: zt.desktop, vendor: "Apple" }) }, { test: t => "windows" === t.getOSName(!0), describe: () => ({ type: zt.desktop }) }, { test: t => "linux" === t.getOSName(!0), describe: () => ({ type: zt.desktop }) }, { test: t => "playstation 4" === t.getOSName(!0), describe: () => ({ type: zt.tv }) }, { test: t => "roku" === t.getOSName(!0), describe: () => ({ type: zt.tv }) }],
    Qt = [{ test: t => "microsoft edge" === t.getBrowserName(!0), describe(t) {
    if (/\sedg\//i.test(t)) return { name: qt.Blink };const e = Ut.getFirstMatch(/edge\/(\d+(\.?_?\d+)+)/i, t);return { name: qt.EdgeHTML, version: e };
  } }, { test: [/trident/i], describe(t) {
    const e = { name: qt.Trident },
          i = Ut.getFirstMatch(/trident\/(\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: t => t.test(/presto/i), describe(t) {
    const e = { name: qt.Presto },
          i = Ut.getFirstMatch(/presto\/(\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test(t) {
    const e = t.test(/gecko/i),
          i = t.test(/like gecko/i);return e && !i;
  }, describe(t) {
    const e = { name: qt.Gecko },
          i = Ut.getFirstMatch(/gecko\/(\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }, { test: [/(apple)?webkit\/537\.36/i], describe: () => ({ name: qt.Blink }) }, { test: [/(apple)?webkit/i], describe(t) {
    const e = { name: qt.WebKit },
          i = Ut.getFirstMatch(/webkit\/(\d+(\.?_?\d+)+)/i, t);return i && (e.version = i), e;
  } }];class Zt {
  constructor(t, e = !1) {
    if (null == t || "" === t) throw new Error("UserAgent parameter can't be empty");this._ua = t, this.parsedResult = {}, !0 !== e && this.parse();
  }getUA() {
    return this._ua;
  }test(t) {
    return t.test(this._ua);
  }parseBrowser() {
    this.parsedResult.browser = {};const t = Wt.find(t => {
      if ("function" == typeof t.test) return t.test(this);if (t.test instanceof Array) return t.test.some(t => this.test(t));throw new Error("Browser's test function is not valid");
    });return t && (this.parsedResult.browser = t.describe(this.getUA())), this.parsedResult.browser;
  }getBrowser() {
    return this.parsedResult.browser ? this.parsedResult.browser : this.parseBrowser();
  }getBrowserName(t) {
    return t ? String(this.getBrowser().name).toLowerCase() || "" : this.getBrowser().name || "";
  }getBrowserVersion() {
    return this.getBrowser().version;
  }getOS() {
    return this.parsedResult.os ? this.parsedResult.os : this.parseOS();
  }parseOS() {
    this.parsedResult.os = {};const t = Gt.find(t => {
      if ("function" == typeof t.test) return t.test(this);if (t.test instanceof Array) return t.test.some(t => this.test(t));throw new Error("Browser's test function is not valid");
    });return t && (this.parsedResult.os = t.describe(this.getUA())), this.parsedResult.os;
  }getOSName(t) {
    const { name: e } = this.getOS();return t ? String(e).toLowerCase() || "" : e || "";
  }getOSVersion() {
    return this.getOS().version;
  }getPlatform() {
    return this.parsedResult.platform ? this.parsedResult.platform : this.parsePlatform();
  }getPlatformType(t = !1) {
    const { type: e } = this.getPlatform();return t ? String(e).toLowerCase() || "" : e || "";
  }parsePlatform() {
    this.parsedResult.platform = {};const t = Jt.find(t => {
      if ("function" == typeof t.test) return t.test(this);if (t.test instanceof Array) return t.test.some(t => this.test(t));throw new Error("Browser's test function is not valid");
    });return t && (this.parsedResult.platform = t.describe(this.getUA())), this.parsedResult.platform;
  }getEngine() {
    return this.parsedResult.engine ? this.parsedResult.engine : this.parseEngine();
  }getEngineName(t) {
    return t ? String(this.getEngine().name).toLowerCase() || "" : this.getEngine().name || "";
  }parseEngine() {
    this.parsedResult.engine = {};const t = Qt.find(t => {
      if ("function" == typeof t.test) return t.test(this);if (t.test instanceof Array) return t.test.some(t => this.test(t));throw new Error("Browser's test function is not valid");
    });return t && (this.parsedResult.engine = t.describe(this.getUA())), this.parsedResult.engine;
  }parse() {
    return this.parseBrowser(), this.parseOS(), this.parsePlatform(), this.parseEngine(), this;
  }getResult() {
    return Object.assign({}, this.parsedResult);
  }satisfies(t) {
    const e = {};let i = 0;const s = {};let n = 0;if (Object.keys(t).forEach(r => {
      const a = t[r];"string" == typeof a ? (s[r] = a, n += 1) : "object" == typeof a && (e[r] = a, i += 1);
    }), i > 0) {
      const t = Object.keys(e),
            i = t.find(t => this.isOS(t));if (i) {
        const t = this.satisfies(e[i]);if (void 0 !== t) return t;
      }const s = t.find(t => this.isPlatform(t));if (s) {
        const t = this.satisfies(e[s]);if (void 0 !== t) return t;
      }
    }if (n > 0) {
      const t = Object.keys(s).find(t => this.isBrowser(t, !0));if (void 0 !== t) return this.compareVersion(s[t]);
    }
  }isBrowser(t, e = !1) {
    const i = this.getBrowserName().toLowerCase();let s = t.toLowerCase();const n = Ut.getBrowserTypeByAlias(s);return e && n && (s = n.toLowerCase()), s === i;
  }compareVersion(t) {
    let e = [0],
        i = t,
        s = !1;const n = this.getBrowserVersion();if ("string" == typeof n) return ">" === t[0] || "<" === t[0] ? (i = t.substr(1), "=" === t[1] ? (s = !0, i = t.substr(2)) : e = [], ">" === t[0] ? e.push(1) : e.push(-1)) : "=" === t[0] ? i = t.substr(1) : "~" === t[0] && (s = !0, i = t.substr(1)), e.indexOf(Ut.compareVersions(n, i, s)) > -1;
  }isOS(t) {
    return this.getOSName(!0) === String(t).toLowerCase();
  }isPlatform(t) {
    return this.getPlatformType(!0) === String(t).toLowerCase();
  }isEngine(t) {
    return this.getEngineName(!0) === String(t).toLowerCase();
  }is(t) {
    return this.isBrowser(t) || this.isOS(t) || this.isPlatform(t);
  }some(t = []) {
    return t.some(t => this.is(t));
  }
}class Kt {
  static getParser(t, e = !1) {
    if ("string" != typeof t) throw new Error("UserAgent should be a string");return new Zt(t, e);
  }static parse(t) {
    return new Zt(t).getResult();
  }static get BROWSER_MAP() {
    return Dt;
  }static get ENGINE_MAP() {
    return qt;
  }static get OS_MAP() {
    return It;
  }static get PLATFORMS_MAP() {
    return zt;
  }
}const Xt = "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;customElements.define("long-press-button-card", class extends HTMLElement {
  constructor() {
    super(), this.holdTime = 500, this.ripple = document.createElement("paper-ripple"), this.timer = void 0, this.held = !1, this.cooldownStart = !1, this.cooldownEnd = !1, this.nbClicks = 0;
  }connectedCallback() {
    Object.assign(this.style, { borderRadius: "50%", position: "absolute", width: Xt ? "100px" : "50px", height: Xt ? "100px" : "50px", transform: "translate(-50%, -50%)", pointerEvents: "none" }), this.appendChild(this.ripple), this.ripple.style.color = "#03a9f4", this.ripple.style.color = "var(--primary-color)", ["touchcancel", "mouseout", "mouseup", "touchmove", "mousewheel", "wheel", "scroll"].forEach(t => {
      document.addEventListener(t, () => {
        clearTimeout(this.timer), this.stopAnimation(), this.timer = void 0;
      }, { passive: !0 });
    });
  }bind(t) {
    if (t.longPress) return;t.longPress = !0, t.addEventListener("contextmenu", t => {
      const e = t || window.event;return e.preventDefault && e.preventDefault(), e.stopPropagation && e.stopPropagation(), e.cancelBubble = !0, e.returnValue = !1, !1;
    });const e = e => {
      if (this.cooldownStart) return;let i, s;this.held = !1, e.touches ? (i = e.touches[0].pageX, s = e.touches[0].pageY) : (i = e.pageX, s = e.pageY), this.timer = window.setTimeout(() => {
        this.startAnimation(i, s), this.held = !0, t.repeat && !t.isRepeating && (t.isRepeating = !0, this.repeatTimeout = setInterval(() => {
          t.dispatchEvent(new Event("ha-hold"));
        }, t.repeat));
      }, this.holdTime), this.cooldownStart = !0, window.setTimeout(() => this.cooldownStart = !1, 100);
    },
          i = e => {
      this.cooldownEnd || ["touchend", "touchcancel"].includes(e.type) && void 0 === this.timer ? t.isRepeating && this.repeatTimeout && (clearInterval(this.repeatTimeout), t.isRepeating = !1) : (clearTimeout(this.timer), t.isRepeating && this.repeatTimeout && clearInterval(this.repeatTimeout), t.isRepeating = !1, this.stopAnimation(), this.timer = void 0, this.held ? t.repeat || t.dispatchEvent(new Event("ha-hold")) : t.hasDblClick ? 0 === this.nbClicks ? (this.nbClicks += 1, this.dblClickTimeout = window.setTimeout(() => {
        1 === this.nbClicks && (this.nbClicks = 0, t.dispatchEvent(new Event("ha-click")));
      }, 250)) : (this.nbClicks = 0, clearTimeout(this.dblClickTimeout), t.dispatchEvent(new Event("ha-dblclick"))) : t.dispatchEvent(new Event("ha-click")), this.cooldownEnd = !0, window.setTimeout(() => this.cooldownEnd = !1, 100));
    },
          s = Kt.getParser(window.navigator.userAgent),
          n = s.satisfies({ mobile: { safari: ">=13" } }),
          r = new RegExp("^13\\..*", "gm"),
          a = "iOS" === s.getOSName() && !!s.getOSVersion().match(r);t.addEventListener("touchstart", e, { passive: !0 }), t.addEventListener("touchend", i), t.addEventListener("touchcancel", i), n || a || (t.addEventListener("mousedown", e, { passive: !0 }), t.addEventListener("click", i));
  }startAnimation(t, e) {
    Object.assign(this.style, { left: `${t}px`, top: `${e}px`, display: null }), this.ripple.holdDown = !0, this.ripple.simulatedRipple();
  }stopAnimation() {
    this.ripple.holdDown = !1, this.style.display = "none";
  }
});const te = t => {
  const e = (() => {
    const t = document.body;if (t.querySelector("long-press-button-card")) return t.querySelector("long-press-button-card");const e = document.createElement("long-press-button-card");return t.appendChild(e), e;
  })();e && e.bind(t);
},
      ee = i(() => t => {
  te(t.committer.element);
});function ie(t, e) {
  (function (t) {
    return "string" == typeof t && t.includes(".") && 1 === parseFloat(t);
  })(t) && (t = "100%");var i = function (t) {
    return "string" == typeof t && t.includes("%");
  }(t);return t = 360 === e ? t : Math.min(e, Math.max(0, parseFloat(t))), i && (t = parseInt(String(t * e), 10) / 100), Math.abs(t - e) < 1e-6 ? 1 : t = 360 === e ? (t < 0 ? t % e + e : t % e) / parseFloat(String(e)) : t % e / parseFloat(String(e));
}function se(t) {
  return Math.min(1, Math.max(0, t));
}function ne(t) {
  return t = parseFloat(t), (isNaN(t) || t < 0 || t > 1) && (t = 1), t;
}function re(t) {
  return t <= 1 ? 100 * Number(t) + "%" : t;
}function ae(t) {
  return 1 === t.length ? "0" + t : String(t);
}function oe(t, e, i) {
  t = ie(t, 255), e = ie(e, 255), i = ie(i, 255);var s = Math.max(t, e, i),
      n = Math.min(t, e, i),
      r = 0,
      a = 0,
      o = (s + n) / 2;if (s === n) a = 0, r = 0;else {
    var c = s - n;switch (a = o > .5 ? c / (2 - s - n) : c / (s + n), s) {case t:
        r = (e - i) / c + (e < i ? 6 : 0);break;case e:
        r = (i - t) / c + 2;break;case i:
        r = (t - e) / c + 4;}r /= 6;
  }return { h: r, s: a, l: o };
}function ce(t, e, i) {
  t = ie(t, 255), e = ie(e, 255), i = ie(i, 255);var s = Math.max(t, e, i),
      n = Math.min(t, e, i),
      r = 0,
      a = s,
      o = s - n,
      c = 0 === s ? 0 : o / s;if (s === n) r = 0;else {
    switch (s) {case t:
        r = (e - i) / o + (e < i ? 6 : 0);break;case e:
        r = (i - t) / o + 2;break;case i:
        r = (t - e) / o + 4;}r /= 6;
  }return { h: r, s: c, v: a };
}function le(t, e, i, s) {
  var n = [ae(Math.round(t).toString(16)), ae(Math.round(e).toString(16)), ae(Math.round(i).toString(16))];return s && n[0].charAt(0) === n[0].charAt(1) && n[1].charAt(0) === n[1].charAt(1) && n[2].charAt(0) === n[2].charAt(1) ? n[0].charAt(0) + n[1].charAt(0) + n[2].charAt(0) : n.join("");
}function he(t) {
  return de(t) / 255;
}function de(t) {
  return parseInt(t, 16);
}var ue = { aliceblue: "#f0f8ff", antiquewhite: "#faebd7", aqua: "#00ffff", aquamarine: "#7fffd4", azure: "#f0ffff", beige: "#f5f5dc", bisque: "#ffe4c4", black: "#000000", blanchedalmond: "#ffebcd", blue: "#0000ff", blueviolet: "#8a2be2", brown: "#a52a2a", burlywood: "#deb887", cadetblue: "#5f9ea0", chartreuse: "#7fff00", chocolate: "#d2691e", coral: "#ff7f50", cornflowerblue: "#6495ed", cornsilk: "#fff8dc", crimson: "#dc143c", cyan: "#00ffff", darkblue: "#00008b", darkcyan: "#008b8b", darkgoldenrod: "#b8860b", darkgray: "#a9a9a9", darkgreen: "#006400", darkgrey: "#a9a9a9", darkkhaki: "#bdb76b", darkmagenta: "#8b008b", darkolivegreen: "#556b2f", darkorange: "#ff8c00", darkorchid: "#9932cc", darkred: "#8b0000", darksalmon: "#e9967a", darkseagreen: "#8fbc8f", darkslateblue: "#483d8b", darkslategray: "#2f4f4f", darkslategrey: "#2f4f4f", darkturquoise: "#00ced1", darkviolet: "#9400d3", deeppink: "#ff1493", deepskyblue: "#00bfff", dimgray: "#696969", dimgrey: "#696969", dodgerblue: "#1e90ff", firebrick: "#b22222", floralwhite: "#fffaf0", forestgreen: "#228b22", fuchsia: "#ff00ff", gainsboro: "#dcdcdc", ghostwhite: "#f8f8ff", gold: "#ffd700", goldenrod: "#daa520", gray: "#808080", green: "#008000", greenyellow: "#adff2f", grey: "#808080", honeydew: "#f0fff0", hotpink: "#ff69b4", indianred: "#cd5c5c", indigo: "#4b0082", ivory: "#fffff0", khaki: "#f0e68c", lavender: "#e6e6fa", lavenderblush: "#fff0f5", lawngreen: "#7cfc00", lemonchiffon: "#fffacd", lightblue: "#add8e6", lightcoral: "#f08080", lightcyan: "#e0ffff", lightgoldenrodyellow: "#fafad2", lightgray: "#d3d3d3", lightgreen: "#90ee90", lightgrey: "#d3d3d3", lightpink: "#ffb6c1", lightsalmon: "#ffa07a", lightseagreen: "#20b2aa", lightskyblue: "#87cefa", lightslategray: "#778899", lightslategrey: "#778899", lightsteelblue: "#b0c4de", lightyellow: "#ffffe0", lime: "#00ff00", limegreen: "#32cd32", linen: "#faf0e6", magenta: "#ff00ff", maroon: "#800000", mediumaquamarine: "#66cdaa", mediumblue: "#0000cd", mediumorchid: "#ba55d3", mediumpurple: "#9370db", mediumseagreen: "#3cb371", mediumslateblue: "#7b68ee", mediumspringgreen: "#00fa9a", mediumturquoise: "#48d1cc", mediumvioletred: "#c71585", midnightblue: "#191970", mintcream: "#f5fffa", mistyrose: "#ffe4e1", moccasin: "#ffe4b5", navajowhite: "#ffdead", navy: "#000080", oldlace: "#fdf5e6", olive: "#808000", olivedrab: "#6b8e23", orange: "#ffa500", orangered: "#ff4500", orchid: "#da70d6", palegoldenrod: "#eee8aa", palegreen: "#98fb98", paleturquoise: "#afeeee", palevioletred: "#db7093", papayawhip: "#ffefd5", peachpuff: "#ffdab9", peru: "#cd853f", pink: "#ffc0cb", plum: "#dda0dd", powderblue: "#b0e0e6", purple: "#800080", rebeccapurple: "#663399", red: "#ff0000", rosybrown: "#bc8f8f", royalblue: "#4169e1", saddlebrown: "#8b4513", salmon: "#fa8072", sandybrown: "#f4a460", seagreen: "#2e8b57", seashell: "#fff5ee", sienna: "#a0522d", silver: "#c0c0c0", skyblue: "#87ceeb", slateblue: "#6a5acd", slategray: "#708090", slategrey: "#708090", snow: "#fffafa", springgreen: "#00ff7f", steelblue: "#4682b4", tan: "#d2b48c", teal: "#008080", thistle: "#d8bfd8", tomato: "#ff6347", turquoise: "#40e0d0", violet: "#ee82ee", wheat: "#f5deb3", white: "#ffffff", whitesmoke: "#f5f5f5", yellow: "#ffff00", yellowgreen: "#9acd32" };function pe(t) {
  var e,
      i,
      s,
      n = { r: 0, g: 0, b: 0 },
      r = 1,
      a = null,
      o = null,
      c = null,
      l = !1,
      h = !1;return "string" == typeof t && (t = function (t) {
    if (0 === (t = t.trim().toLowerCase()).length) return !1;var e = !1;if (ue[t]) t = ue[t], e = !0;else if ("transparent" === t) return { r: 0, g: 0, b: 0, a: 0, format: "name" };var i = be.rgb.exec(t);if (i) return { r: i[1], g: i[2], b: i[3] };if (i = be.rgba.exec(t)) return { r: i[1], g: i[2], b: i[3], a: i[4] };if (i = be.hsl.exec(t)) return { h: i[1], s: i[2], l: i[3] };if (i = be.hsla.exec(t)) return { h: i[1], s: i[2], l: i[3], a: i[4] };if (i = be.hsv.exec(t)) return { h: i[1], s: i[2], v: i[3] };if (i = be.hsva.exec(t)) return { h: i[1], s: i[2], v: i[3], a: i[4] };if (i = be.hex8.exec(t)) return { r: de(i[1]), g: de(i[2]), b: de(i[3]), a: he(i[4]), format: e ? "name" : "hex8" };if (i = be.hex6.exec(t)) return { r: de(i[1]), g: de(i[2]), b: de(i[3]), format: e ? "name" : "hex" };if (i = be.hex4.exec(t)) return { r: de(i[1] + i[1]), g: de(i[2] + i[2]), b: de(i[3] + i[3]), a: he(i[4] + i[4]), format: e ? "name" : "hex8" };if (i = be.hex3.exec(t)) return { r: de(i[1] + i[1]), g: de(i[2] + i[2]), b: de(i[3] + i[3]), format: e ? "name" : "hex" };return !1;
  }(t)), "object" == typeof t && (_e(t.r) && _e(t.g) && _e(t.b) ? (e = t.r, i = t.g, s = t.b, n = { r: 255 * ie(e, 255), g: 255 * ie(i, 255), b: 255 * ie(s, 255) }, l = !0, h = "%" === String(t.r).substr(-1) ? "prgb" : "rgb") : _e(t.h) && _e(t.s) && _e(t.v) ? (a = re(t.s), o = re(t.v), n = function (t, e, i) {
    t = 6 * ie(t, 360), e = ie(e, 100), i = ie(i, 100);var s = Math.floor(t),
        n = t - s,
        r = i * (1 - e),
        a = i * (1 - n * e),
        o = i * (1 - (1 - n) * e),
        c = s % 6;return { r: 255 * [i, a, r, r, o, i][c], g: 255 * [o, i, i, a, r, r][c], b: 255 * [r, r, o, i, i, a][c] };
  }(t.h, a, o), l = !0, h = "hsv") : _e(t.h) && _e(t.s) && _e(t.l) && (a = re(t.s), c = re(t.l), n = function (t, e, i) {
    var s, n, r;function a(t, e, i) {
      return i < 0 && (i += 1), i > 1 && (i -= 1), i < 1 / 6 ? t + 6 * i * (e - t) : i < .5 ? e : i < 2 / 3 ? t + (e - t) * (2 / 3 - i) * 6 : t;
    }if (t = ie(t, 360), e = ie(e, 100), i = ie(i, 100), 0 === e) n = i, r = i, s = i;else {
      var o = i < .5 ? i * (1 + e) : i + e - i * e,
          c = 2 * i - o;s = a(c, o, t + 1 / 3), n = a(c, o, t), r = a(c, o, t - 1 / 3);
    }return { r: 255 * s, g: 255 * n, b: 255 * r };
  }(t.h, a, c), l = !0, h = "hsl"), Object.prototype.hasOwnProperty.call(t, "a") && (r = t.a)), r = ne(r), { ok: l, format: t.format || h, r: Math.min(255, Math.max(n.r, 0)), g: Math.min(255, Math.max(n.g, 0)), b: Math.min(255, Math.max(n.b, 0)), a: r };
}var fe = "(?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?)",
    me = "[\\s|\\(]+(" + fe + ")[,|\\s]+(" + fe + ")[,|\\s]+(" + fe + ")\\s*\\)?",
    ge = "[\\s|\\(]+(" + fe + ")[,|\\s]+(" + fe + ")[,|\\s]+(" + fe + ")[,|\\s]+(" + fe + ")\\s*\\)?",
    be = { CSS_UNIT: new RegExp(fe), rgb: new RegExp("rgb" + me), rgba: new RegExp("rgba" + ge), hsl: new RegExp("hsl" + me), hsla: new RegExp("hsla" + ge), hsv: new RegExp("hsv" + me), hsva: new RegExp("hsva" + ge), hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/, hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/, hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/, hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/ };function _e(t) {
  return Boolean(be.CSS_UNIT.exec(String(t)));
}var ye = function () {
  function t(e, i) {
    if (void 0 === e && (e = ""), void 0 === i && (i = {}), e instanceof t) return e;this.originalInput = e;var s = pe(e);this.originalInput = e, this.r = s.r, this.g = s.g, this.b = s.b, this.a = s.a, this.roundA = Math.round(100 * this.a) / 100, this.format = i.format || s.format, this.gradientType = i.gradientType, this.r < 1 && (this.r = Math.round(this.r)), this.g < 1 && (this.g = Math.round(this.g)), this.b < 1 && (this.b = Math.round(this.b)), this.isValid = s.ok;
  }return t.prototype.isDark = function () {
    return this.getBrightness() < 128;
  }, t.prototype.isLight = function () {
    return !this.isDark();
  }, t.prototype.getBrightness = function () {
    var t = this.toRgb();return (299 * t.r + 587 * t.g + 114 * t.b) / 1e3;
  }, t.prototype.getLuminance = function () {
    var t = this.toRgb(),
        e = t.r / 255,
        i = t.g / 255,
        s = t.b / 255;return .2126 * (e <= .03928 ? e / 12.92 : Math.pow((e + .055) / 1.055, 2.4)) + .7152 * (i <= .03928 ? i / 12.92 : Math.pow((i + .055) / 1.055, 2.4)) + .0722 * (s <= .03928 ? s / 12.92 : Math.pow((s + .055) / 1.055, 2.4));
  }, t.prototype.getAlpha = function () {
    return this.a;
  }, t.prototype.setAlpha = function (t) {
    return this.a = ne(t), this.roundA = Math.round(100 * this.a) / 100, this;
  }, t.prototype.toHsv = function () {
    var t = ce(this.r, this.g, this.b);return { h: 360 * t.h, s: t.s, v: t.v, a: this.a };
  }, t.prototype.toHsvString = function () {
    var t = ce(this.r, this.g, this.b),
        e = Math.round(360 * t.h),
        i = Math.round(100 * t.s),
        s = Math.round(100 * t.v);return 1 === this.a ? "hsv(" + e + ", " + i + "%, " + s + "%)" : "hsva(" + e + ", " + i + "%, " + s + "%, " + this.roundA + ")";
  }, t.prototype.toHsl = function () {
    var t = oe(this.r, this.g, this.b);return { h: 360 * t.h, s: t.s, l: t.l, a: this.a };
  }, t.prototype.toHslString = function () {
    var t = oe(this.r, this.g, this.b),
        e = Math.round(360 * t.h),
        i = Math.round(100 * t.s),
        s = Math.round(100 * t.l);return 1 === this.a ? "hsl(" + e + ", " + i + "%, " + s + "%)" : "hsla(" + e + ", " + i + "%, " + s + "%, " + this.roundA + ")";
  }, t.prototype.toHex = function (t) {
    return void 0 === t && (t = !1), le(this.r, this.g, this.b, t);
  }, t.prototype.toHexString = function (t) {
    return void 0 === t && (t = !1), "#" + this.toHex(t);
  }, t.prototype.toHex8 = function (t) {
    return void 0 === t && (t = !1), function (t, e, i, s, n) {
      var r,
          a = [ae(Math.round(t).toString(16)), ae(Math.round(e).toString(16)), ae(Math.round(i).toString(16)), ae((r = s, Math.round(255 * parseFloat(r)).toString(16)))];return n && a[0].charAt(0) === a[0].charAt(1) && a[1].charAt(0) === a[1].charAt(1) && a[2].charAt(0) === a[2].charAt(1) && a[3].charAt(0) === a[3].charAt(1) ? a[0].charAt(0) + a[1].charAt(0) + a[2].charAt(0) + a[3].charAt(0) : a.join("");
    }(this.r, this.g, this.b, this.a, t);
  }, t.prototype.toHex8String = function (t) {
    return void 0 === t && (t = !1), "#" + this.toHex8(t);
  }, t.prototype.toRgb = function () {
    return { r: Math.round(this.r), g: Math.round(this.g), b: Math.round(this.b), a: this.a };
  }, t.prototype.toRgbString = function () {
    var t = Math.round(this.r),
        e = Math.round(this.g),
        i = Math.round(this.b);return 1 === this.a ? "rgb(" + t + ", " + e + ", " + i + ")" : "rgba(" + t + ", " + e + ", " + i + ", " + this.roundA + ")";
  }, t.prototype.toPercentageRgb = function () {
    var t = function (t) {
      return Math.round(100 * ie(t, 255)) + "%";
    };return { r: t(this.r), g: t(this.g), b: t(this.b), a: this.a };
  }, t.prototype.toPercentageRgbString = function () {
    var t = function (t) {
      return Math.round(100 * ie(t, 255));
    };return 1 === this.a ? "rgb(" + t(this.r) + "%, " + t(this.g) + "%, " + t(this.b) + "%)" : "rgba(" + t(this.r) + "%, " + t(this.g) + "%, " + t(this.b) + "%, " + this.roundA + ")";
  }, t.prototype.toName = function () {
    if (0 === this.a) return "transparent";if (this.a < 1) return !1;for (var t = "#" + le(this.r, this.g, this.b, !1), e = 0, i = Object.keys(ue); e < i.length; e++) {
      var s = i[e];if (ue[s] === t) return s;
    }return !1;
  }, t.prototype.toString = function (t) {
    var e = Boolean(t);t = t || this.format;var i = !1,
        s = this.a < 1 && this.a >= 0;return e || !s || !t.startsWith("hex") && "name" !== t ? ("rgb" === t && (i = this.toRgbString()), "prgb" === t && (i = this.toPercentageRgbString()), "hex" !== t && "hex6" !== t || (i = this.toHexString()), "hex3" === t && (i = this.toHexString(!0)), "hex4" === t && (i = this.toHex8String(!0)), "hex8" === t && (i = this.toHex8String()), "name" === t && (i = this.toName()), "hsl" === t && (i = this.toHslString()), "hsv" === t && (i = this.toHsvString()), i || this.toHexString()) : "name" === t && 0 === this.a ? this.toName() : this.toRgbString();
  }, t.prototype.clone = function () {
    return new t(this.toString());
  }, t.prototype.lighten = function (e) {
    void 0 === e && (e = 10);var i = this.toHsl();return i.l += e / 100, i.l = se(i.l), new t(i);
  }, t.prototype.brighten = function (e) {
    void 0 === e && (e = 10);var i = this.toRgb();return i.r = Math.max(0, Math.min(255, i.r - Math.round(-e / 100 * 255))), i.g = Math.max(0, Math.min(255, i.g - Math.round(-e / 100 * 255))), i.b = Math.max(0, Math.min(255, i.b - Math.round(-e / 100 * 255))), new t(i);
  }, t.prototype.darken = function (e) {
    void 0 === e && (e = 10);var i = this.toHsl();return i.l -= e / 100, i.l = se(i.l), new t(i);
  }, t.prototype.tint = function (t) {
    return void 0 === t && (t = 10), this.mix("white", t);
  }, t.prototype.shade = function (t) {
    return void 0 === t && (t = 10), this.mix("black", t);
  }, t.prototype.desaturate = function (e) {
    void 0 === e && (e = 10);var i = this.toHsl();return i.s -= e / 100, i.s = se(i.s), new t(i);
  }, t.prototype.saturate = function (e) {
    void 0 === e && (e = 10);var i = this.toHsl();return i.s += e / 100, i.s = se(i.s), new t(i);
  }, t.prototype.greyscale = function () {
    return this.desaturate(100);
  }, t.prototype.spin = function (e) {
    var i = this.toHsl(),
        s = (i.h + e) % 360;return i.h = s < 0 ? 360 + s : s, new t(i);
  }, t.prototype.mix = function (e, i) {
    void 0 === i && (i = 50);var s = this.toRgb(),
        n = new t(e).toRgb(),
        r = i / 100;return new t({ r: (n.r - s.r) * r + s.r, g: (n.g - s.g) * r + s.g, b: (n.b - s.b) * r + s.b, a: (n.a - s.a) * r + s.a });
  }, t.prototype.analogous = function (e, i) {
    void 0 === e && (e = 6), void 0 === i && (i = 30);var s = this.toHsl(),
        n = 360 / i,
        r = [this];for (s.h = (s.h - (n * e >> 1) + 720) % 360; --e;) s.h = (s.h + n) % 360, r.push(new t(s));return r;
  }, t.prototype.complement = function () {
    var e = this.toHsl();return e.h = (e.h + 180) % 360, new t(e);
  }, t.prototype.monochromatic = function (e) {
    void 0 === e && (e = 6);for (var i = this.toHsv(), s = i.h, n = i.s, r = i.v, a = [], o = 1 / e; e--;) a.push(new t({ h: s, s: n, v: r })), r = (r + o) % 1;return a;
  }, t.prototype.splitcomplement = function () {
    var e = this.toHsl(),
        i = e.h;return [this, new t({ h: (i + 72) % 360, s: e.s, l: e.l }), new t({ h: (i + 216) % 360, s: e.s, l: e.l })];
  }, t.prototype.triad = function () {
    return this.polyad(3);
  }, t.prototype.tetrad = function () {
    return this.polyad(4);
  }, t.prototype.polyad = function (e) {
    for (var i = this.toHsl(), s = i.h, n = [this], r = 360 / e, a = 1; a < e; a++) n.push(new t({ h: (s + a * r) % 360, s: i.s, l: i.l }));return n;
  }, t.prototype.equals = function (e) {
    return this.toRgbString() === new t(e).toRgbString();
  }, t;
}();function ve(t, e) {
  return void 0 === t && (t = ""), void 0 === e && (e = {}), new ye(t, e);
}function we(t) {
  return t.substr(0, t.indexOf("."));
}function Se(t) {
  return "var" === t.substring(0, 3) ? window.getComputedStyle(document.documentElement).getPropertyValue(t.substring(4).slice(0, -1)).trim() : t;
}function Me(t, e) {
  const i = new ye(Se(t));if (i.isValid) {
    const t = i.mix("black", 100 - e).toString();if (t) return t;
  }return t;
}function ke(...t) {
  const e = t => t && "object" == typeof t;return t.reduce((t, i) => (Object.keys(i).forEach(s => {
    const n = t[s],
          r = i[s];Array.isArray(n) && Array.isArray(r) ? t[s] = n.concat(...r) : e(n) && e(r) ? t[s] = ke(n, r) : t[s] = r;
  }), t), {});
}function xe(t, e) {
  let i = [];return t && t.forEach(t => {
    let s = t;e && e.forEach(e => {
      e.id && t.id && e.id == t.id && (s = ke(s, e));
    }), i.push(s);
  }), e && (i = i.concat(e.filter(e => !t || !t.find(t => !(!t.id || !e.id) && t.id == e.id)))), i;
}const Ne = ((t, ...e) => {
  const i = e.reduce((e, i, s) => e + (t => {
    if (t instanceof ct) return t.cssText;if ("number" == typeof t) return t;throw new Error(`Value passed to 'css' function must be a 'css' function result: ${t}. Use 'unsafeCSS' to pass non-literal values, but\n            take care to ensure page security.`);
  })(i) + t[s + 1], t[0]);return new ct(i, ot);
})`
  ha-card {
    cursor: pointer;
    overflow: hidden;
    box-sizing: border-box;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  ha-card.disabled {
    pointer-events: none;
    cursor: default;
  }
  ha-icon {
    display: inline-block;
    margin: auto;
  }
  ha-card.button-card-main {
    padding: 4% 0px;
    text-transform: none;
    font-weight: 400;
    font-size: 1.2rem;
    align-items: center;
    text-align: center;
    letter-spacing: normal;
    width: 100%;
  }
  .ellipsis {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  #overlay {
    align-items: flex-start;
    justify-content: flex-end;
    padding: 8px 7px;
    opacity: 0.5;
    /* DO NOT override items below */
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 1;
    display: flex;
  }
  #lock {
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
    margin: unset;
  }
  .invalid {
    animation: blink 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
  }
  .hidden {
    visibility: hidden;
    opacity: 0;
    transition: visibility 0s 1s, opacity 1s linear;
  }
  @keyframes blink {
    0%{opacity:0;}
    50%{opacity:1;}
    100%{opacity:0;}
  }
  @-webkit-keyframes rotating /* Safari and Chrome */ {
    from {
      -webkit-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    to {
      -webkit-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @keyframes rotating {
    from {
      -ms-transform: rotate(0deg);
      -moz-transform: rotate(0deg);
      -webkit-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    to {
      -ms-transform: rotate(360deg);
      -moz-transform: rotate(360deg);
      -webkit-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  [rotating] {
    -webkit-animation: rotating 2s linear infinite;
    -moz-animation: rotating 2s linear infinite;
    -ms-animation: rotating 2s linear infinite;
    -o-animation: rotating 2s linear infinite;
    animation: rotating 2s linear infinite;
  }

  #container {
    display: grid;
    width: 100%;
    height: 100%;
    text-align: center;
    align-items: center;
  }
  #img-cell {
    display: flex;
    grid-area: i;
    height: 100%;
    width: 100%;
    max-width: 100%;
    max-height: 100%;
    align-self: center;
    justify-self: center;
    overflow: hidden;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  ha-icon#icon {
    height: 100%;
    width: 100%;
    max-height: 100%;
    position: absolute;
  }
  img#icon {
    display: block;
    height: auto;
    width: 100%;
    position: absolute;
  }
  #name {
    grid-area: n;
    max-width: 100%;
    align-self: center;
    justify-self: center;
    /* margin: auto; */
  }
  #state {
    grid-area: s;
    max-width: 100%;
    align-self: center;
    justify-self: center;
    /* margin: auto; */
  }

  #label {
    grid-area: l;
    max-width: 100%;
    align-self: center;
    justify-self: center;
  }

  #container.vertical {
    grid-template-areas: "i" "n" "s" "l";
    grid-template-columns: 1fr;
    grid-template-rows: 1fr min-content min-content min-content;
  }
  /* Vertical No Icon */
  #container.vertical.no-icon {
    grid-template-areas: "n" "s" "l";
    grid-template-columns: 1fr;
    grid-template-rows: 1fr min-content 1fr;
  }
  #container.vertical.no-icon #state {
    align-self: center;
  }
  #container.vertical.no-icon #name {
    align-self: end;
  }
  #container.vertical.no-icon #label {
    align-self: start;
  }

  /* Vertical No Icon No Name */
  #container.vertical.no-icon.no-name {
    grid-template-areas: "s" "l";
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
  #container.vertical.no-icon.no-name #state {
    align-self: end;
  }
  #container.vertical.no-icon.no-name #label {
    align-self: start;
  }

  /* Vertical No Icon No State */
  #container.vertical.no-icon.no-state {
    grid-template-areas: "n" "l";
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
  #container.vertical.no-icon.no-state #name {
    align-self: end;
  }
  #container.vertical.no-icon.no-state #label {
    align-self: start;
  }

  /* Vertical No Icon No Label */
  #container.vertical.no-icon.no-label {
    grid-template-areas: "n" "s";
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
  #container.vertical.no-icon.no-label #name {
    align-self: end;
  }
  #container.vertical.no-icon.no-label #state {
    align-self: start;
  }

  /* Vertical No Icon No Label No Name */
  #container.vertical.no-icon.no-label.no-name {
    grid-template-areas: "s";
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }
  #container.vertical.no-icon.no-label.no-name #state {
    align-self: center;
  }
  /* Vertical No Icon No Label No State */
  #container.vertical.no-icon.no-label.no-state {
    grid-template-areas: "n";
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }
  #container.vertical.no-icon.no-label.no-state #name {
    align-self: center;
  }

  /* Vertical No Icon No Name No State */
  #container.vertical.no-icon.no-name.no-state {
    grid-template-areas: "l";
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }
  #container.vertical.no-icon.no-name.no-state #label {
    align-self: center;
  }

  #container.icon_name_state {
    grid-template-areas: "i n" "l l";
    grid-template-columns: 40% 1fr;
    grid-template-rows: 1fr min-content;
  }

  #container.icon_name {
    grid-template-areas: "i n" "s s" "l l";
    grid-template-columns: 40% 1fr;
    grid-template-rows: 1fr min-content min-content;
  }

  #container.icon_state {
    grid-template-areas: "i s" "n n" "l l";
    grid-template-columns: 40% 1fr;
    grid-template-rows: 1fr min-content min-content;
  }

  #container.name_state {
    grid-template-areas: "i" "n" "l";
    grid-template-columns: 1fr;
    grid-template-rows: 1fr min-content min-content;
  }
  #container.name_state.no-icon {
    grid-template-areas: "n" "l";
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
  #container.name_state.no-icon #name {
    align-self: end
  }
  #container.name_state.no-icon #label {
    align-self: start
  }

  #container.name_state.no-icon.no-label {
    grid-template-areas: "n";
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }
  #container.name_state.no-icon.no-label #name {
    align-self: center
  }

  /* icon_name_state2nd default */
  #container.icon_name_state2nd {
    grid-template-areas: "i n" "i s" "i l";
    grid-template-columns: 40% 1fr;
    grid-template-rows: 1fr min-content 1fr;
  }
  #container.icon_name_state2nd #name {
    align-self: end;
  }
  #container.icon_name_state2nd #state {
    align-self: center;
  }
  #container.icon_name_state2nd #label {
    align-self: start;
  }

  /* icon_name_state2nd No Label */
  #container.icon_name_state2nd.no-label {
    grid-template-areas: "i n" "i s";
    grid-template-columns: 40% 1fr;
    grid-template-rows: 1fr 1fr;
  }
  #container.icon_name_state2nd #name {
    align-self: end;
  }
  #container.icon_name_state2nd #state {
    align-self: start;
  }

  /* icon_state_name2nd Default */
  #container.icon_state_name2nd {
    grid-template-areas: "i s" "i n" "i l";
    grid-template-columns: 40% 1fr;
    grid-template-rows: 1fr min-content 1fr;
  }
  #container.icon_state_name2nd #state {
    align-self: end;
  }
  #container.icon_state_name2nd #name {
    align-self: center;
  }
  #container.icon_state_name2nd #label {
    align-self: start;
  }

  /* icon_state_name2nd No Label */
  #container.icon_state_name2nd.no-label {
    grid-template-areas: "i s" "i n";
    grid-template-columns: 40% 1fr;
    grid-template-rows: 1fr 1fr;
  }
  #container.icon_state_name2nd #state {
    align-self: end;
  }
  #container.icon_state_name2nd #name {
    align-self: start;
  }

  #container.icon_label {
    grid-template-areas: "i l" "n n" "s s";
    grid-template-columns: 40% 1fr;
    grid-template-rows: 1fr min-content min-content;
  }

  [style*="--aspect-ratio"] > :first-child {
    width: 100%;
  }
  [style*="--aspect-ratio"] > img {
    height: auto;
  }
  @supports (--custom:property) {
    [style*="--aspect-ratio"] {
      position: relative;
    }
    [style*="--aspect-ratio"]::before {
      content: "";
      display: block;
      padding-bottom: calc(100% / (var(--aspect-ratio)));
    }
    [style*="--aspect-ratio"] > :first-child {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
    }
  }
`;console.info("%c  BUTTON-CARD  \n%c Version 3.0.0 ", "color: orange; font-weight: bold; background: black", "color: white; font-weight: bold; background: dimgray");let Oe = class extends ht {
  disconnectedCallback() {
    super.disconnectedCallback(), this._clearInterval();
  }connectedCallback() {
    if (super.connectedCallback(), this.config && this.config.entity && "timer" === we(this.config.entity)) {
      const t = this.hass.states[this.config.entity];this._startInterval(t);
    }
  }static get styles() {
    return Ne;
  }render() {
    return this._stateObj = this.config.entity ? this.hass.states[this.config.entity] : void 0, this.config && this.hass ? this._cardHtml() : V``;
  }shouldUpdate(t) {
    const e = !!(this._hasTemplate || this.config.state && this.config.state.find(t => "template" === t.operator) || t.has("_timeRemaining"));return function (t, e, i) {
      if (e.has("config") || i) return !0;if (t.config.entity) {
        const i = e.get("hass");return !i || i.states[t.config.entity] !== t.hass.states[t.config.entity];
      }return !1;
    }(this, t, e);
  }updated(t) {
    if (super.updated(t), this.config && this.config.entity && "timer" === we(this.config.entity) && t.has("hass")) {
      const e = this.hass.states[this.config.entity],
            i = t.get("hass");(i ? i.states[this.config.entity] : void 0) !== e ? this._startInterval(e) : e || this._clearInterval();
    }
  }_clearInterval() {
    this._interval && (window.clearInterval(this._interval), this._interval = void 0);
  }_startInterval(t) {
    this._clearInterval(), this._calculateRemaining(t), "active" === t.state && (this._interval = window.setInterval(() => this._calculateRemaining(t), 1e3));
  }_calculateRemaining(t) {
    this._timeRemaining = function (t) {
      var e = Tt(t.attributes.remaining);if ("active" === t.state) {
        var i = new Date().getTime(),
            s = new Date(t.last_changed).getTime();e = Math.max(e - (i - s) / 1e3, 0);
      }return e;
    }(t);
  }_computeTimeDisplay(t) {
    if (t) return function (t) {
      var e = Math.floor(t / 3600),
          i = Math.floor(t % 3600 / 60),
          s = Math.floor(t % 3600 % 60);return e > 0 ? e + ":" + Ft(i) + ":" + Ft(s) : i > 0 ? i + ":" + Ft(s) : s > 0 ? "" + s : null;
    }(this._timeRemaining || Tt(t.attributes.duration));
  }_getMatchingConfigState(t) {
    if (!this.config.state) return;const e = this.config.state.find(t => "template" === t.operator);if (!t && !e) return;let i;const s = this.config.state.find(e => {
      if (!e.operator) return t && this._getTemplateOrValue(t, e.value) == t.state;switch (e.operator) {case "==":
          return t && t.state == this._getTemplateOrValue(t, e.value);case "<=":
          return t && t.state <= this._getTemplateOrValue(t, e.value);case "<":
          return t && t.state < this._getTemplateOrValue(t, e.value);case ">=":
          return t && t.state >= this._getTemplateOrValue(t, e.value);case ">":
          return t && t.state > this._getTemplateOrValue(t, e.value);case "!=":
          return t && t.state != this._getTemplateOrValue(t, e.value);case "regex":
          return !(!t || !t.state.match(this._getTemplateOrValue(t, e.value)));case "template":
          return this._getTemplateOrValue(t, e.value);case "default":
          return i = e, !1;default:
          return !1;}
    });return !s && i ? i : s;
  }_evalTemplate(t, e) {
    return new Function("states", "entity", "user", "hass", `'use strict'; ${e}`).call(this, this.hass.states, t, this.hass.user, this.hass);
  }_getTemplateOrValue(t, e) {
    if (["number", "boolean"].includes(typeof e)) return e;if (!e) return e;const i = e.trim();return "[[[" === i.substring(0, 3) && "]]]" === i.slice(-3) ? this._evalTemplate(t, i.slice(3, -3)) : e;
  }_getDefaultColorForState(t) {
    switch (t.state) {case "on":
        return this.config.color_on;case "off":
        return this.config.color_off;default:
        return this.config.default_color;}
  }_getColorForLightEntity(t, e) {
    let i = this.config.default_color;return t && (t.attributes.rgb_color ? (i = `rgb(${t.attributes.rgb_color.join(",")})`, t.attributes.brightness && (i = Me(i, (t.attributes.brightness + 245) / 5))) : e && t.attributes.color_temp && t.attributes.min_mireds && t.attributes.max_mireds ? (i = function (t, e, i) {
      const s = new ye("rgb(255, 160, 0)"),
            n = new ye("rgb(166, 209, 255)"),
            r = new ye("white"),
            a = (t - e) / (i - e) * 100;return a < 50 ? ve(n).mix(r, 2 * a).toRgbString() : ve(r).mix(s, 2 * (a - 50)).toRgbString();
    }(t.attributes.color_temp, t.attributes.min_mireds, t.attributes.max_mireds), t.attributes.brightness && (i = Me(i, (t.attributes.brightness + 245) / 5))) : i = t.attributes.brightness ? Me(this._getDefaultColorForState(t), (t.attributes.brightness + 245) / 5) : this._getDefaultColorForState(t)), i;
  }_buildCssColorAttribute(t, e) {
    let i,
        s = "";return e && e.color ? s = e.color : "auto" !== this.config.color && t && "off" === t.state ? s = this.config.color_off : this.config.color && (s = this.config.color), i = "auto" == s || "auto-no-temperature" == s ? this._getColorForLightEntity(t, "auto-no-temperature" !== s) : s || (t ? this._getDefaultColorForState(t) : this.config.default_color);
  }_buildIcon(t, e) {
    if (!this.config.show_icon) return;let i;return e && e.icon ? i = e.icon : this.config.icon ? i = this.config.icon : t && t.attributes && (i = t.attributes.icon ? t.attributes.icon : function (t, e) {
      if (t in jt) return jt[t];switch (t) {case "alarm_control_panel":
          switch (e) {case "armed_home":
              return "hass:bell-plus";case "armed_night":
              return "hass:bell-sleep";case "disarmed":
              return "hass:bell-outline";case "triggered":
              return "hass:bell-ring";default:
              return "hass:bell";}case "binary_sensor":
          return e && "off" === e ? "hass:radiobox-blank" : "hass:checkbox-marked-circle";case "cover":
          return "closed" === e ? "hass:window-closed" : "hass:window-open";case "lock":
          return e && "unlocked" === e ? "hass:lock-open" : "hass:lock";case "media_player":
          return e && "off" !== e && "idle" !== e ? "hass:cast-connected" : "hass:cast";case "zwave":
          switch (e) {case "dead":
              return "hass:emoticon-dead";case "sleeping":
              return "hass:sleep";case "initializing":
              return "hass:timer-sand";default:
              return "hass:z-wave";}default:
          return console.warn("Unable to find icon for domain " + t + " (" + e + ")"), Rt;}
    }(we(t.entity_id), t.state)), this._getTemplateOrValue(t, i);
  }_buildEntityPicture(t, e) {
    if (!this.config.show_entity_picture || !t && !e && !this.config.entity_picture) return;let i;return e && e.entity_picture ? i = e.entity_picture : this.config.entity_picture ? i = this.config.entity_picture : t && (i = t.attributes && t.attributes.entity_picture ? t.attributes.entity_picture : void 0), this._getTemplateOrValue(t, i);
  }_buildStyleGeneric(t, e, i) {
    let s = {};if (this.config.styles && this.config.styles[i] && (s = Object.assign(s, ...this.config.styles[i])), e && e.styles && e.styles[i]) {
      let t = {};t = Object.assign(t, ...e.styles[i]), s = Object.assign(Object.assign({}, s), t);
    }return Object.keys(s).forEach(e => {
      s[e] = this._getTemplateOrValue(t, s[e]);
    }), s;
  }_buildCustomStyleGeneric(t, e, i) {
    let s = {};if (this.config.styles && this.config.styles.custom_fields && this.config.styles.custom_fields[i] && (s = Object.assign(s, ...this.config.styles.custom_fields[i])), e && e.styles && e.styles.custom_fields && e.styles.custom_fields[i]) {
      let t = {};t = Object.assign(t, ...e.styles.custom_fields[i]), s = Object.assign(Object.assign({}, s), t);
    }return Object.keys(s).forEach(e => {
      s[e] = this._getTemplateOrValue(t, s[e]);
    }), s;
  }_buildName(t, e) {
    if (!1 === this.config.show_name) return;let i;var s;return e && e.name ? i = e.name : this.config.name ? i = this.config.name : t && (i = t.attributes && t.attributes.friendly_name ? t.attributes.friendly_name : (s = t.entity_id).substr(s.indexOf(".") + 1)), this._getTemplateOrValue(t, i);
  }_buildStateString(t) {
    let e;if (this.config.show_state && t && t.state) {
      const i = ((t, e) => {
        let i;const s = we(e.entity_id);return "binary_sensor" === s ? (e.attributes.device_class && (i = t(`state.${s}.${e.attributes.device_class}.${e.state}`)), i || (i = t(`state.${s}.default.${e.state}`))) : i = e.attributes.unit_of_measurement && !["unknown", "unavailable"].includes(e.state) ? e.state : "zwave" === s ? ["initializing", "dead"].includes(e.state) ? t(`state.zwave.query_stage.${e.state}`, "query_stage", e.attributes.query_stage) : t(`state.zwave.default.${e.state}`) : t(`state.${s}.${e.state}`), i || (i = t(`state.default.${e.state}`) || t(`component.${s}.state.${e.state}`) || e.state), i;
      })(this.hass.localize, t),
            s = this._buildUnits(t);s ? e = `${t.state} ${s}` : "timer" === we(t.entity_id) ? "idle" === t.state || 0 === this._timeRemaining ? e = i : (e = this._computeTimeDisplay(t), "paused" === t.state && (e += ` (${i})`)) : e = i;
    }return e;
  }_buildUnits(t) {
    let e;return t && this.config.show_units && (e = t.attributes && t.attributes.unit_of_measurement && !this.config.units ? t.attributes.unit_of_measurement : this.config.units ? this.config.units : void 0), e;
  }_buildLastChanged(t, e) {
    return this.config.show_last_changed && t ? V`
        <ha-relative-time
          id="label"
          class="ellipsis"
          .hass="${this.hass}"
          .datetime="${t.last_changed}"
          style=${ut(e)}
        ></ha-relative-time>` : void 0;
  }_buildLabel(t, e) {
    if (!this.config.show_label) return;let i;return i = e && e.label ? e.label : this.config.label, this._getTemplateOrValue(t, i);
  }_buildCustomFields(t, e) {
    let i = V``;const s = {},
          n = {};return this.config.custom_fields && Object.keys(this.config.custom_fields).forEach(e => {
      const i = this.config.custom_fields[e];i.card ? n[e] = i.card : s[e] = this._getTemplateOrValue(t, i);
    }), e && e.custom_fields && Object.keys(e.custom_fields).forEach(i => {
      const r = e.custom_fields[i];r.card ? n[i] = r.card : s[i] = this._getTemplateOrValue(t, r);
    }), Object.keys(s).forEach(n => {
      if (null != s[n]) {
        const r = Object.assign(Object.assign({}, this._buildCustomStyleGeneric(t, e, n)), { "grid-area": n });i = V`${i}
        <div id=${n} class="ellipsis" style=${ut(r)}>${ft(s[n])}</div>`;
      }
    }), Object.keys(n).forEach(s => {
      if (null != n[s]) {
        const r = Object.assign(Object.assign({}, this._buildCustomStyleGeneric(t, e, s)), { "grid-area": s }),
              a = function (t) {
          var e = function (t, e) {
            return i("hui-error-card", { type: "error", error: t, config: e });
          },
              i = function (t, i) {
            var s = window.document.createElement(t);try {
              s.setConfig(i);
            } catch (s) {
              return console.error(t, s), e(s.message, i);
            }return s;
          };if (!t || "object" != typeof t || !t.type) return e("No type defined", t);var s = t.type;if (s = s.startsWith("custom:") ? s.substr("custom:".length) : "hui-" + s + "-card", customElements.get(s)) return i(s, t);var n = e("Custom element doesn't exist: " + t.type + ".", t);n.style.display = "None";var r = setTimeout(function () {
            n.style.display = "";
          }, 2e3);return customElements.whenDefined(t.type).then(function () {
            clearTimeout(r), Bt(n, "ll-rebuild", {}, n);
          }), n;
        }(n[s]);a.hass = this.hass, i = V`${i}
        <div id=${s} class="ellipsis" @click=${this._stopPropagation} @touchstart=${this._stopPropagation} style=${ut(r)}>${a}</div>`;
      }
    }), i;
  }_isClickable(t) {
    let e = !0;if ("toggle" === this.config.tap_action.action && "none" === this.config.hold_action.action && "none" === this.config.double_tap_action.action || "toggle" === this.config.hold_action.action && "none" === this.config.tap_action.action && "none" === this.config.double_tap_action.action || "toggle" === this.config.double_tap_action.action && "none" === this.config.tap_action.action && "none" === this.config.hold_action.action) {
      if (t) switch (we(t.entity_id)) {case "sensor":case "binary_sensor":case "device_tracker":
          e = !1;break;default:
          e = !0;} else e = !1;
    } else e = "none" != this.config.tap_action.action || "none" != this.config.hold_action.action || "none" != this.config.double_tap_action.action;return e;
  }_rotate(t) {
    return !(!t || !t.spin);
  }_blankCardColoredHtml(t) {
    const e = Object.assign({ background: "none", "box-shadow": "none" }, t);return V`
      <ha-card class="disabled" style=${ut(e)}>
        <div></div>
      </ha-card>
      `;
  }_cardHtml() {
    const t = this._getMatchingConfigState(this._stateObj),
          e = this._buildCssColorAttribute(this._stateObj, t);let i = e,
        s = {},
        n = {};const r = {},
          a = this._buildStyleGeneric(this._stateObj, t, "lock"),
          o = this._buildStyleGeneric(this._stateObj, t, "card"),
          c = { "button-card-main": !0, disabled: !this._isClickable(this._stateObj) };switch (o.width && (this.style.setProperty("flex", "0 0 auto"), this.style.setProperty("max-width", "fit-content")), this.config.color_type) {case "blank-card":
        return this._blankCardColoredHtml(o);case "card":case "label-card":
        {
          const t = function (t) {
            const e = new ye(Se(t));return e.isValid && e.getLuminance() > .5 ? "rgb(62, 62, 62)" : "rgb(234, 234, 234)";
          }(e);s.color = t, n.color = t, s["background-color"] = e, s = Object.assign(Object.assign({}, s), o), i = "inherit";break;
        }default:
        s = o;}return this.config.aspect_ratio ? (r["--aspect-ratio"] = this.config.aspect_ratio, s.position = "absolute") : r.display = "inline", this.style.setProperty("--button-card-light-color", this._getColorForLightEntity(this._stateObj, !0)), this.style.setProperty("--button-card-light-color-no-temperature", this._getColorForLightEntity(this._stateObj, !1)), n = Object.assign(Object.assign({}, n), a), V`
      <div id="aspect-ratio" style=${ut(r)}>
        <ha-card
          id="card"
          class=${bt(c)}
          style=${ut(s)}
          @ha-click="${this._handleTap}"
          @ha-hold="${this._handleHold}"
          @ha-dblclick=${this._handleDblTap}
          .hasDblClick=${"none" !== this.config.double_tap_action.action}
          .repeat=${mt(this.config.hold_action.repeat)}
          .longpress=${ee()}
          .config="${this.config}"
        >
          ${this._buttonContent(this._stateObj, t, i)}
          ${this._getLock(n)}
        </ha-card>
      </div>
      `;
  }_getLock(t) {
    return this.config.lock && this._getTemplateOrValue(this._stateObj, this.config.lock.enabled) ? V`
        <div id="overlay" style=${ut(t)}
          @ha-click=${t => this._handleUnlockType(t, "tap")}
          @ha-hold=${t => this._handleUnlockType(t, "hold")}
          @ha-dblclick=${t => this._handleUnlockType(t, "double_tap")}
          .hasDblClick=${"double_tap" === this.config.lock.unlock}
          .longpress=${ee()}
          .config="${this.config}"
        >
          <ha-icon id="lock" icon="mdi:lock-outline"></ha-icon>
        </div>
      ` : V`<mwc-ripple id="ripple"></mwc-ripple>`;
  }_buttonContent(t, e, i) {
    const s = this._buildName(t, e),
          n = this._buildStateString(t),
          r = function (t, e) {
      if (!t && !e) return;let i;return i = e ? t ? `${t}: ${e}` : e : t;
    }(s, n);switch (this.config.layout) {case "icon_name_state":case "name_state":
        return this._gridHtml(t, e, this.config.layout, i, r, void 0);default:
        return this._gridHtml(t, e, this.config.layout, i, s, n);}
  }_gridHtml(t, e, i, s, n, r) {
    const a = this._getIconHtml(t, e, s),
          o = [i],
          c = this._buildLabel(t, e),
          l = this._buildStyleGeneric(t, e, "name"),
          h = this._buildStyleGeneric(t, e, "state"),
          d = this._buildStyleGeneric(t, e, "label"),
          u = this._buildLastChanged(t, d),
          p = this._buildStyleGeneric(t, e, "grid");return a || o.push("no-icon"), n || o.push("no-name"), r || o.push("no-state"), c || u || o.push("no-label"), V`
      <div id="container" class=${o.join(" ")} style=${ut(p)}>
        ${a || ""}
        ${n ? V`<div id="name" class="ellipsis" style=${ut(l)}>${ft(n)}</div>` : ""}
        ${r ? V`<div id="state" class="ellipsis" style=${ut(h)}>${r}</div>` : ""}
        ${c && !u ? V`<div id="label" class="ellipsis" style=${ut(d)}>${ft(c)}</div>` : ""}
        ${u || ""}
        ${this._buildCustomFields(t, e)}
      </div>
    `;
  }_getIconHtml(t, e, i) {
    const s = this._buildIcon(t, e),
          n = this._buildEntityPicture(t, e),
          r = this._buildStyleGeneric(t, e, "entity_picture"),
          a = this._buildStyleGeneric(t, e, "icon"),
          o = this._buildStyleGeneric(t, e, "img_cell"),
          c = this._buildStyleGeneric(t, e, "card"),
          l = Object.assign({ color: i, width: this.config.size, position: this.config.aspect_ratio || c.height ? "absolute" : "relative" }, a),
          h = Object.assign(Object.assign({}, l), r);return s || n ? V`
        <div id="img-cell" style=${ut(o)}>
          ${s && !n ? V`<ha-icon style=${ut(l)}
            .icon="${s}" id="icon" ?rotating=${this._rotate(e)}></ha-icon>` : ""}
          ${n ? V`<img src="${n}" style=${ut(h)}
            id="icon" ?rotating=${this._rotate(e)} />` : ""}
        </div>
      ` : void 0;
  }setConfig(t) {
    if (!t) throw new Error("Invalid configuration");const e = function () {
      var t = document.querySelector("home-assistant");if (t = (t = (t = (t = (t = (t = (t = (t = t && t.shadowRoot) && t.querySelector("home-assistant-main")) && t.shadowRoot) && t.querySelector("app-drawer-layout partial-panel-resolver")) && t.shadowRoot || t) && t.querySelector("ha-panel-lovelace")) && t.shadowRoot) && t.querySelector("hui-root")) {
        var e = t.lovelace;return e.current_view = t.___curView, e;
      }return null;
    }();let i = Object.assign({}, t),
        s = i.template,
        n = t.state;for (; s && e.config.button_card_templates && e.config.button_card_templates[s];) i = ke(e.config.button_card_templates[s], i), n = xe(e.config.button_card_templates[s].state, n), s = e.config.button_card_templates[s].template;i.state = n, this.config = Object.assign({ tap_action: { action: "toggle" }, hold_action: { action: "none" }, double_tap_action: { action: "none" }, layout: "vertical", size: "40%", color_type: "icon", show_name: !0, show_state: !1, show_icon: !0, show_units: !0, show_label: !1, show_entity_picture: !1 }, i), this.config.lock = Object.assign({ enabled: !1, duration: 5, unlock: "tap" }, this.config.lock), this.config.default_color = "var(--primary-text-color)", "icon" !== this.config.color_type ? this.config.color_off = "var(--paper-card-background-color)" : this.config.color_off = "var(--paper-item-icon-color)", this.config.color_on = "var(--paper-item-icon-active-color)";const r = JSON.stringify(this.config),
          a = new RegExp("\\[\\[\\[.*\\]\\]\\]", "gm");this._hasTemplate = !!r.match(a);
  }getCardSize() {
    return 3;
  }_evalActions(t, e) {
    const i = this.config.entity ? this.hass.states[this.config.entity] : void 0,
          s = JSON.parse(JSON.stringify(t)),
          n = t => t ? (Object.keys(t).forEach(e => {
      "object" == typeof t[e] ? t[e] = n(t[e]) : t[e] = this._getTemplateOrValue(i, t[e]);
    }), t) : t;return s[e] = n(s[e]), !s[e].confirmation && s.confirmation && (s[e].confirmation = n(s.confirmation)), s;
  }_handleTap(t) {
    const e = t.target.config;Ht(this, this.hass, this._evalActions(e, "tap_action"), !1, !1);
  }_handleHold(t) {
    const e = t.target.config;Ht(this, this.hass, this._evalActions(e, "hold_action"), !0, !1);
  }_handleDblTap(t) {
    const e = t.target.config;Ht(this, this.hass, this._evalActions(e, "double_tap_action"), !1, !0);
  }_handleUnlockType(t, e) {
    t.target.config.lock.unlock === e && this._handleLock(t);
  }_handleLock(t) {
    t.stopPropagation();const e = this.shadowRoot.getElementById("lock");if (!e) return;if (this.config.lock.exemptions) {
      if (!this.hass.user.name || !this.hass.user.id) return;let t = !1;if (this.config.lock.exemptions.forEach(e => {
        (!t && e.user === this.hass.user.id || e.username === this.hass.user.name) && (t = !0);
      }), !t) return e.classList.add("invalid"), void window.setTimeout(() => {
        e && e.classList.remove("invalid");
      }, 3e3);
    }const i = this.shadowRoot.getElementById("overlay"),
          s = this.shadowRoot.getElementById("card");i.style.setProperty("pointer-events", "none");const n = document.createElement("paper-ripple");if (e) {
      s.appendChild(n);const t = document.createAttribute("icon");t.value = "mdi:lock-open-outline", e.attributes.setNamedItem(t), e.classList.add("hidden");
    }window.setTimeout(() => {
      if (i.style.setProperty("pointer-events", ""), e) {
        e.classList.remove("hidden");const t = document.createAttribute("icon");t.value = "mdi:lock-outline", e.attributes.setNamedItem(t), s.removeChild(n);
      }
    }, 1e3 * this.config.lock.duration);
  }_stopPropagation(t) {
    t.stopPropagation(), console.log("BRRRR");
  }
};t([rt()], Oe.prototype, "hass", void 0), t([rt()], Oe.prototype, "config", void 0), t([rt()], Oe.prototype, "_timeRemaining", void 0), t([rt()], Oe.prototype, "_hasTemplate", void 0), t([rt()], Oe.prototype, "_stateObj", void 0), Oe = t([(t => e => "function" == typeof e ? ((t, e) => (window.customElements.define(t, e), e))(t, e) : ((t, e) => {
  const { kind: i, elements: s } = e;return { kind: i, elements: s, finisher(e) {
      window.customElements.define(t, e);
    } };
})(t, e))("button-card")], Oe);
