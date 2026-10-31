// Loading states ported from Tessel.NET's Progress.xaml:
//   <tsl-progress-ring [value="40"] size="32" [inactive]></tsl-progress-ring>   indeterminate unless `value` is set
//   <tsl-skeleton width="180" height="16" [circle]></tsl-skeleton>              shimmering placeholder

import { TesselElement, define } from '../core/base-element.js';
import { h, html } from '../core/dom.js';

const RADIUS = 13;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export class TesselProgressRing extends TesselElement {
  static styles = ':host{display:inline-flex;vertical-align:middle;}';
  static observedAttributes = ['value', 'max', 'size', 'inactive'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._root = html('span', 'inline-flex', `<svg viewBox="0 0 32 32" fill="none" class="size-full -rotate-90"><circle cx="16" cy="16" r="${RADIUS}" stroke-width="3" class="stroke-border"/><circle cx="16" cy="16" r="${RADIUS}" stroke-width="3" stroke-linecap="round" class="stroke-accent"/></svg>`);
    this._root.setAttribute('role', 'progressbar');
    this._arc = this._root.querySelectorAll('circle')[1];
    this.shadowRoot.appendChild(this._root);
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    const size = Number(this.getAttribute('size')) || 32;
    const determinate = this.hasAttribute('value');
    const max = Number(this.getAttribute('max')) || 100;
    const value = Math.max(0, Math.min(max, Number(this.getAttribute('value')) || 0));
    this._root.style.width = `${size}px`;
    this._root.style.height = `${size}px`;
    this._root.hidden = this.hasAttribute('inactive');
    if (determinate) {
      this._arc.setAttribute('class', 'stroke-accent transition-[stroke-dashoffset] duration-base ease-tessel');
      this._arc.setAttribute('stroke-dasharray', String(CIRCUMFERENCE));
      this._arc.setAttribute('stroke-dashoffset', String(CIRCUMFERENCE * (1 - value / max)));
      this._root.setAttribute('aria-valuenow', String(value));
      this._root.setAttribute('aria-valuemax', String(max));
    } else {
      this._arc.setAttribute('class', 'stroke-accent animate-ring origin-center [transform-box:fill-box]');
      this._arc.removeAttribute('stroke-dashoffset');
      this._arc.removeAttribute('stroke-dasharray');
      this._root.removeAttribute('aria-valuenow');
    }
  }
}

export class TesselSkeleton extends TesselElement {
  static styles = ':host{display:block;}';
  static observedAttributes = ['width', 'height', 'circle'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._bar = h('div', 'animate-shimmer bg-[linear-gradient(90deg,var(--tsl-subtle)_25%,var(--tsl-control-hover)_50%,var(--tsl-subtle)_75%)] bg-[length:200%_100%]', { 'aria-hidden': 'true' });
    this.shadowRoot.appendChild(this._bar);
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    const circle = this.hasAttribute('circle');
    const dim = (v, fallback) => (/^\d+(\.\d+)?$/.test(v ?? '') ? `${v}px` : (v || fallback));
    const height = dim(this.getAttribute('height'), circle ? (this.hasAttribute('width') ? dim(this.getAttribute('width')) : '40px') : '16px');
    this._bar.style.height = height;
    this._bar.style.width = dim(this.getAttribute('width'), circle ? height : '100%');
    this._bar.style.borderRadius = circle ? '999px' : 'var(--tsl-radius-sm)';
  }
}

define('tsl-progress-ring', TesselProgressRing);
define('tsl-skeleton', TesselSkeleton);
