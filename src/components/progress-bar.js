// <tsl-progress-bar value="40" max="100" [indeterminate]> — port of TesselProgressBarUI
// (4px thickness, indeterminate box = 30% width, 1400ms cycle, matching ProgressBar.cycleTime).

import { TesselElement, define } from '../core/base-element.js';

const STYLES = `
  :host{display:block;width:220px;}
  .track{position:relative;width:100%;height:4px;border-radius:2px;background:var(--tsl-subtle);overflow:hidden;}
  .fill{position:absolute;top:0;bottom:0;left:0;width:0;border-radius:2px;background:var(--tsl-accent);
    transition:width var(--tsl-duration-base) var(--tsl-ease);}
  :host([indeterminate]) .fill{width:30%;animation:tsl-indeterminate 1400ms linear infinite;}
  @keyframes tsl-indeterminate{
    0%{left:-30%;}
    100%{left:100%;}
  }
  :host([disabled]) .track{opacity:var(--tsl-disabled-alpha);}
`;

export class TesselProgressBar extends TesselElement {
  static styles = STYLES;
  static observedAttributes = ['value', 'max', 'indeterminate', 'disabled'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const track = document.createElement('div');
    track.className = 'track';
    track.setAttribute('role', 'progressbar');
    const fill = document.createElement('div');
    fill.className = 'fill';
    track.appendChild(fill);
    this.shadowRoot.appendChild(track);
    this._track = track;
    this._fill = fill;
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    const max = Number(this.getAttribute('max')) || 100;
    const value = Number(this.getAttribute('value')) || 0;
    if (!this.hasAttribute('indeterminate')) {
      const pct = Math.max(0, Math.min(100, (value / max) * 100));
      this._fill.style.width = `${pct}%`;
      this._track.setAttribute('aria-valuenow', String(value));
      this._track.setAttribute('aria-valuemax', String(max));
    } else {
      // Clear the inline width from any earlier determinate state — inline style otherwise beats
      // the stylesheet's `:host([indeterminate]) .fill{width:30%}` rule, freezing the sliding box
      // at its last determinate width instead of the intended 30%.
      this._fill.style.width = '';
      this._track.removeAttribute('aria-valuenow');
    }
  }
}

define('tsl-progress-bar', TesselProgressBar);
