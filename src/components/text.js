// <tsl-text variant="display|title|subtitle|header|body-strong|body|secondary|caption|code">...</tsl-text>
// Port of TextStyle / TextBlock.java and Tessel.NET's Tessel.Text.* ramp (font ramp + color per style,
// wraps natively unlike JLabel).

import { TesselElement, define } from '../core/base-element.js';
import { h, cx } from '../core/dom.js';

const VARIANTS = {
  display: 'text-display font-semibold text-text',
  title: 'text-title font-semibold text-text',
  subtitle: 'text-subtitle font-semibold text-text',
  header: 'text-header font-semibold text-text',
  'body-strong': 'text-body font-semibold text-text',
  body: 'text-body font-normal text-text',
  secondary: 'text-body font-normal text-text-secondary',
  caption: 'text-caption font-normal text-text-secondary',
  code: 'font-mono text-code font-normal text-text',
};

export class TesselText extends TesselElement {
  static styles = ':host{display:block;}';
  static observedAttributes = ['variant'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._body = h('div', '', null, h('slot'));
    this.shadowRoot.appendChild(this._body);
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    this._body.className = cx('wrap-break-word', VARIANTS[this.getAttribute('variant')] || VARIANTS.body);
  }
}

define('tsl-text', TesselText);
