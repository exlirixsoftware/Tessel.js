// <tsl-card header="Profile" [elevated]>content</tsl-card> — port of components/Card.java and Tessel.NET's Card
// (radius 8, padding 20, 1px border, optional soft drop shadow).

import { TesselElement, define } from '../core/base-element.js';
import { h } from '../core/dom.js';

const CARD = 'rounded-lg border border-border bg-surface p-5 transition-shadow duration-base ease-tessel host-[elevated]:shadow-card';

export class TesselCard extends TesselElement {
  static styles = ':host{display:block;}';
  static observedAttributes = ['header'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._header = h('div', 'mb-3.5 text-header font-semibold text-text');
    this.shadowRoot.appendChild(h('div', CARD, null, this._header, h('slot')));
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    const header = this.getAttribute('header');
    this._header.textContent = header || '';
    this._header.hidden = !header;
  }
}

define('tsl-card', TesselCard);
