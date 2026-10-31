// Shared base class for every Tessel custom element.
// Handles: shadow root + shared stylesheet injection, the `disabled` attribute (alpha-fade, like
// UIUtils.applyEnabledAlpha), and small DOM/attribute helpers used across components.

import { ensureInstalled } from './theme.js';
import tailwindCss from '../styles/tailwind.generated.js';

const sheetCache = new Map();

function sharedSheet(css) {
  if (!('adoptedStyleSheets' in Document.prototype)) return null;
  let sheet = sheetCache.get(css);
  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    sheetCache.set(css, sheet);
  }
  return sheet;
}

export class TesselElement extends HTMLElement {
  /** Subclasses override with their CSS (a plain string, `:host` scoped). */
  static styles = '';

  constructor() {
    super();
    ensureInstalled();
    // delegatesFocus: `host.focus()` and clicks on non-interactive parts land on the first focusable inner element.
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    // Tailwind utilities (shared by every component) first, then this component's own leftover CSS:
    // `:host` display/sizing and the few rules utilities can't express (slotted content, native
    // pseudo-elements). `all:initial` keeps page-level inheritance (text-align, line-height...) out.
    const css = `:host{all:initial;box-sizing:border-box;font-family:var(--tsl-font);color:var(--tsl-text);font-size:14px;line-height:20px;
      scrollbar-color:var(--tsl-border-strong) transparent;}
      /* Thin, token-colored scrollbars everywhere inside a component; the thumb darkens while hovering. */
      *,*::before,*::after{box-sizing:border-box;scrollbar-width:thin;}
      *:hover{scrollbar-color:var(--tsl-text-tertiary) transparent;}
      ${this.constructor.styles}`;
    const sheets = [sharedSheet(tailwindCss), sharedSheet(css)];
    if (sheets[0] && sheets[1]) {
      this.shadowRoot.adoptedStyleSheets = sheets;
    } else {
      for (const text of [tailwindCss, css]) {
        const style = document.createElement('style');
        style.textContent = text;
        this.shadowRoot.appendChild(style);
      }
    }
  }

  connectedCallback() {
    if (this.hasAttribute('disabled')) this.setAttribute('aria-disabled', 'true');
  }

  static get observedAttributes() {
    return ['disabled'];
  }

  attributeChangedCallback(name) {
    if (name === 'disabled') {
      if (this.hasAttribute('disabled')) this.setAttribute('aria-disabled', 'true');
      else this.removeAttribute('aria-disabled');
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value) {
    if (value) this.setAttribute('disabled', '');
    else this.removeAttribute('disabled');
  }

  /**
   * Emits a bubbling, composed, cancelable custom event. Returns false when a listener called
   * preventDefault() — used where a component has a sensible default action (e.g. an info bar
   * removing itself on close) that a listener taking full ownership of the behavior can opt out of.
   */
  emit(name, detail) {
    return this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable: true }));
  }

  /**
   * Components that take a heading via `title` would otherwise also get the browser's native hover tooltip
   * for it. Captures the value into `_heading` and strips the attribute; `heading` is the tooltip-free alias.
   */
  readHeading() {
    if (this.hasAttribute('title')) {
      this._heading = this.getAttribute('title');
      this.removeAttribute('title');
    }
    return this.getAttribute('heading') ?? this._heading ?? '';
  }

  $(selector) {
    return this.shadowRoot.querySelector(selector);
  }
}

export function define(tag, ctor) {
  if (!customElements.get(tag)) customElements.define(tag, ctor);
}
