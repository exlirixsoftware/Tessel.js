// <tsl-button variant="standard|accent|outline|subtle|danger|icon|link">
// Port of ButtonPainter / TesselButtonUI. A native <button> inside shadow DOM gives us free
// hover/active/focus-visible/disabled handling instead of Swing's manual mouse/focus tracking.

import { TesselElement, FOCUS_VISIBLE_CSS, define } from '../core/base-element.js';
import { createIcon } from '../core/icons.js';

const STYLES = `
  :host{display:inline-flex;vertical-align:middle;}
  button{display:inline-flex;align-items:center;justify-content:center;gap:8px;
    height:32px;padding:0 14px;border-radius:var(--tsl-radius-md);border:1px solid transparent;
    background:var(--tsl-control-bg);color:var(--tsl-text);font:inherit;font-size:14px;font-weight:500;
    cursor:pointer;transition:background var(--tsl-duration-fast) var(--tsl-ease),
      border-color var(--tsl-duration-fast) var(--tsl-ease), color var(--tsl-duration-fast) var(--tsl-ease);
    -webkit-appearance:none;white-space:nowrap;width:100%;}
  button:hover{background:var(--tsl-control-hover);}
  button:active{background:var(--tsl-control-pressed);}
  :host([disabled]) button{pointer-events:none;opacity:var(--tsl-disabled-alpha);}
  ${FOCUS_VISIBLE_CSS}

  :host(:not([variant])) button, :host([variant="standard"]) button{border-color:var(--tsl-border);}

  :host([variant="accent"]) button{background:var(--tsl-accent);border-color:var(--tsl-accent);color:var(--tsl-on-accent);}
  :host([variant="accent"]) button:hover{background:var(--tsl-accent-hover);border-color:var(--tsl-accent-hover);}
  :host([variant="accent"]) button:active{background:var(--tsl-accent-pressed);border-color:var(--tsl-accent-pressed);}

  :host([variant="outline"]) button{background:transparent;border-color:var(--tsl-accent);color:var(--tsl-accent);}
  :host([variant="outline"]) button:hover,:host([variant="outline"]) button:active{background:var(--tsl-accent-subtle);}

  :host([variant="subtle"]) button{background:transparent;}
  :host([variant="subtle"]) button:hover{background:var(--tsl-control-hover);}
  :host([variant="subtle"]) button:active{background:var(--tsl-control-pressed);}

  :host([variant="danger"]) button{background:var(--tsl-danger);border-color:var(--tsl-danger);color:#fff;}
  :host([variant="danger"]) button:hover,:host([variant="danger"]) button:active{background:var(--tsl-danger-hover);border-color:var(--tsl-danger-hover);}

  :host([variant="icon"]) button{background:transparent;padding:0;width:32px;height:32px;}
  :host([variant="icon"]) button:hover{background:var(--tsl-control-hover);}
  :host([variant="icon"]) button:active{background:var(--tsl-control-pressed);}

  :host([variant="link"]) button{background:transparent;padding:0;height:auto;width:auto;color:var(--tsl-accent);
    font-weight:400;text-decoration:none;}
  :host([variant="link"]) button:hover{color:var(--tsl-accent-hover);background:transparent;}
  :host([variant="link"]) button:active{color:var(--tsl-accent-pressed);background:transparent;}

  ::slotted(*){pointer-events:none;}
`;

export class TesselButton extends TesselElement {
  static styles = STYLES;
  static observedAttributes = ['disabled', 'icon', 'icon-size'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const button = document.createElement('button');
    button.type = this.getAttribute('type') || 'button';
    button.disabled = this.disabled;
    this._iconSlot = document.createElement('span');
    this._iconSlot.part = 'icon';
    button.appendChild(this._iconSlot);
    button.appendChild(document.createElement('slot'));
    this.shadowRoot.appendChild(button);
    this._button = button;
    this._renderIcon();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === 'disabled') this._button.disabled = this.disabled;
    if (name === 'icon' || name === 'icon-size') this._renderIcon();
  }

  _renderIcon() {
    const icon = this.getAttribute('icon');
    this._iconSlot.innerHTML = '';
    // An empty icon span is still a flex item, so the `gap` between it and the slotted label text
    // would otherwise reserve 8px of unwanted space (and visually off-center a no-icon button).
    this._iconSlot.style.display = icon ? '' : 'none';
    if (icon) this._iconSlot.appendChild(createIcon(icon, Number(this.getAttribute('icon-size')) || 16));
  }

  get variant() { return this.getAttribute('variant') || 'standard'; }
  set variant(v) { this.setAttribute('variant', v); }
}

define('tsl-button', TesselButton);
