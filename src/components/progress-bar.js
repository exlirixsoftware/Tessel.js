// <tsl-progress-bar value="40" max="100" [indeterminate]> — port of TesselProgressBarUI and Tessel.NET's ProgressBar
// (4px thickness, indeterminate box = 30% width, 1400ms cycle, matching ProgressBar.cycleTime).

import { TesselElement, define } from '../core/base-element.js';
import { h, cx } from '../core/dom.js';

const TRACK = 'relative h-1 w-full overflow-hidden rounded-xs bg-subtle host-[disabled]:opacity-45';
const FILL = 'absolute inset-y-0 left-0 rounded-xs bg-accent';

export class TesselProgressBar extends TesselElement {
  static styles = ':host{display:block;width:220px;}';
  static observedAttributes = ['value', 'max', 'indeterminate', 'disabled'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._fill = h('div', FILL);
    this._track = h('div', TRACK, { role: 'progressbar', 'aria-valuemin': '0' }, this._fill);
    this.shadowRoot.appendChild(this._track);
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    const max = Number(this.getAttribute('max')) || 100;
    const value = Number(this.getAttribute('value')) || 0;
    const indeterminate = this.hasAttribute('indeterminate');
    this._fill.className = cx(FILL, indeterminate ? 'animate-indeterminate' : 'transition-[width] duration-base ease-tessel');
    if (indeterminate) {
      // Clear any inline width left over from a determinate state so the animation's own width applies.
      this._fill.style.width = '';
      this._track.removeAttribute('aria-valuenow');
    } else {
      this._fill.style.width = `${Math.max(0, Math.min(100, (value / max) * 100))}%`;
      this._track.setAttribute('aria-valuenow', String(value));
      this._track.setAttribute('aria-valuemax', String(max));
    }
  }
}

define('tsl-progress-bar', TesselProgressBar);
