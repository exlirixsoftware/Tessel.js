// <tsl-badge kind="neutral|accent|success|warning|danger|info" [solid]>New</tsl-badge>
// Port of components/Badge.java and Tessel.NET's Badge (pill, radius = height/2, semibold 12px).

import { TesselElement, define } from '../core/base-element.js';
import { h, cx } from '../core/dom.js';

const PILL = 'inline-flex items-center whitespace-nowrap rounded-pill px-2 py-0.5 text-caption font-semibold transition-colors duration-fast ease-tessel';

const SOFT = {
  neutral: 'bg-subtle text-text-secondary',
  accent: 'bg-accent-subtle text-accent',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
  danger: 'bg-danger-subtle text-danger',
  info: 'bg-info-subtle text-info',
};
const SOLID = {
  neutral: 'bg-text-secondary text-surface',
  accent: 'bg-accent text-on-accent',
  success: 'bg-success text-surface',
  warning: 'bg-warning text-surface',
  danger: 'bg-danger text-white',
  info: 'bg-info text-surface',
};

export class TesselBadge extends TesselElement {
  static styles = ':host{display:inline-flex;}';
  static observedAttributes = ['kind', 'solid'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._pill = h('span', PILL, null, h('slot'));
    this.shadowRoot.appendChild(this._pill);
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    const kind = this.getAttribute('kind');
    const map = this.hasAttribute('solid') ? SOLID : SOFT;
    this._pill.className = cx(PILL, map[kind] || map.neutral);
  }
}

define('tsl-badge', TesselBadge);
