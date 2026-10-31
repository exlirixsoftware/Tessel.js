// <tsl-separator [vertical]> — port of TesselSeparatorUI (1px line, p.border).

import { TesselElement, define } from '../core/base-element.js';
import { h, cx } from '../core/dom.js';

export class TesselSeparator extends TesselElement {
  static styles = ':host{display:block;}:host([vertical]){align-self:stretch;}';
  static observedAttributes = ['vertical'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._line = h('div');
    this.shadowRoot.appendChild(this._line);
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    const vertical = this.hasAttribute('vertical');
    this.setAttribute('role', 'separator');
    if (vertical) this.setAttribute('aria-orientation', 'vertical');
    else this.removeAttribute('aria-orientation');
    this._line.className = cx('bg-border', vertical ? 'mx-2 h-full w-px' : 'my-2 h-px w-full');
  }
}

define('tsl-separator', TesselSeparator);
