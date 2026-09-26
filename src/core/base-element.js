// Shared base class for every Tessel custom element.
// Handles: shadow root + shared stylesheet injection, the `disabled` attribute (alpha-fade, like
// UIUtils.applyEnabledAlpha), and small DOM/attribute helpers used across components.

import { ensureInstalled } from './theme.js';

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
    this.attachShadow({ mode: 'open' });
    const css = `:host{all:initial;box-sizing:border-box;font-family:var(--tsl-font);}
      *,*::before,*::after{box-sizing:border-box;}
      ${this.constructor.styles}`;
    const sheet = sharedSheet(css);
    if (sheet) {
      this.shadowRoot.adoptedStyleSheets = [sheet];
    } else {
      const style = document.createElement('style');
      style.textContent = css;
      this.shadowRoot.appendChild(style);
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

  $(selector) {
    return this.shadowRoot.querySelector(selector);
  }
}

/**
 * Focus-ring CSS to apply to the *inner* native interactive element (a real <button>/<input>/etc),
 * matching UIUtils.paintFocusRing's 2px accent ring — but for free, via :focus-visible + outline,
 * instead of Tessel4J's manual keyboard-vs-mouse focus tracking (AWTEventListener on FOCUS_EVENT).
 */
export const FOCUS_VISIBLE_CSS = `
  :focus-visible{outline:2px solid var(--tsl-accent);outline-offset:2px;}
`;

export const DISABLED_CSS = `
  :host([disabled]){pointer-events:none;opacity:var(--tsl-disabled-alpha,0.45);}
`;

export function define(tag, ctor) {
  if (!customElements.get(tag)) customElements.define(tag, ctor);
}

/**
 * Opens a popup/overlay element that toggles `display` via an `open` attribute, so its fade/scale
 * transition actually plays. A CSS transition can't animate across `display:none -> flex`: both the
 * display flip and the opacity/transform change would land in the same style recalculation, so the
 * browser skips straight to the end state instead of animating. Fix: `open` controls `display` only;
 * a `visible` attribute (added a couple of frames later, once `open` has actually painted) drives the
 * animated properties, so there's a real "closed" frame for the transition to start from.
 */
const closeTokens = new WeakMap();

export function openAnimated(host, openAttr = 'open', visibleAttr = 'visible') {
  // Invalidate any pending closeAnimated() timer from a close-then-reopen happening faster than the
  // close transition — without this, that stale timer would still fire later and rip `open` (i.e.
  // display) back off after this call had just turned it on.
  closeTokens.delete(host);
  host.setAttribute(openAttr, '');
  // Force a synchronous style/layout flush so the browser commits the "just became displayed, but
  // still at the closed opacity/transform" state before `visible` flips it to the animated target —
  // otherwise both changes land in the same recalculation and there's nothing to transition from.
  // This reads a layout property rather than waiting on requestAnimationFrame because rAF only fires
  // once the page is actually painting; a forced reflow works even while it isn't (e.g. a popup
  // opened programmatically on a backgrounded tab).
  void host.offsetWidth;
  host.setAttribute(visibleAttr, '');
}

/**
 * Reverses openAnimated(): starts the exit transition immediately, then removes `open` (display:none)
 * only after `durationMs` — removing it right away would cut the fade/scale-out short.
 */
export function closeAnimated(host, durationMs, openAttr = 'open', visibleAttr = 'visible', onClosed) {
  if (!host.hasAttribute(openAttr)) return;
  host.removeAttribute(visibleAttr);
  const token = Symbol();
  closeTokens.set(host, token);
  setTimeout(() => {
    // A closeAnimated()->openAnimated() sequence faster than durationMs invalidates this token —
    // skip so a reopen doesn't get hidden again by this now-stale timer.
    if (closeTokens.get(host) !== token) return;
    host.removeAttribute(openAttr);
    onClosed?.();
  }, durationMs);
}
