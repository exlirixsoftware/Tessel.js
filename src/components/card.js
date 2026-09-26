// <tsl-card header="Profile" [elevated]>content</tsl-card> — port of components/Card.java
// (radius 8, padding 20, 1px border, optional soft drop shadow).

import { TesselElement, define } from '../core/base-element.js';

const STYLES = `
  :host{display:block;border-radius:var(--tsl-radius-lg);background:var(--tsl-surface);
    border:1px solid var(--tsl-border);padding:20px;box-shadow:0 0 0 rgba(0,0,0,0);
    transition:box-shadow var(--tsl-duration-base) var(--tsl-ease);}
  :host([elevated]){box-shadow:0 1px 2px var(--tsl-shadow), 0 8px 24px var(--tsl-shadow);}
  .header{font-size:16px;font-weight:600;color:var(--tsl-text);margin-bottom:14px;}
`;

export class TesselCard extends TesselElement {
  static styles = STYLES;
  static observedAttributes = ['header'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._header = document.createElement('div');
    this._header.className = 'header';
    this.shadowRoot.append(this._header, document.createElement('slot'));
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    const header = this.getAttribute('header');
    this._header.textContent = header || '';
    this._header.style.display = header ? '' : 'none';
  }
}

define('tsl-card', TesselCard);
