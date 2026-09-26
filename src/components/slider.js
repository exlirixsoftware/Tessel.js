// <tsl-slider min="0" max="100" step="1" value="50"> — port of TesselSliderUI
// (4px track radius 2, 20px thumb with an accent center dot, focus ring +2px around the thumb).
// Uses a native <input type="range"> so keyboard/drag/accessibility come for free.

import { TesselElement, define } from '../core/base-element.js';

const STYLES = `
  :host{display:inline-flex;width:200px;}
  input[type="range"]{-webkit-appearance:none;appearance:none;width:100%;height:20px;background:transparent;margin:0;}
  input[type="range"]::-webkit-slider-runnable-track{height:4px;border-radius:2px;
    background:linear-gradient(to right, var(--tsl-accent) 0%, var(--tsl-accent) var(--fill,0%),
      var(--tsl-border-strong) var(--fill,0%), var(--tsl-border-strong) 100%);}
  input[type="range"]::-moz-range-track{height:4px;border-radius:2px;background:var(--tsl-border-strong);}
  input[type="range"]::-moz-range-progress{height:4px;border-radius:2px;background:var(--tsl-accent);}
  /* The center dot is a radial-gradient sized entirely by its own circle-radius argument — not via
     background-size, which was squeezing a 6px-radius (12px-diameter) circle into a 6x6px box.
     Since the circle was more than twice the size of the box it was supposed to fade out within,
     the box ended up solid-filled edge to edge, rendering as a square instead of a dot. */
  input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;margin-top:-8px;width:20px;height:20px;
    border-radius:50%;border:1px solid var(--tsl-border-strong);
    background:radial-gradient(circle 3px at center, var(--tsl-accent) 99%, transparent 100%),
      var(--tsl-surface);cursor:pointer;transition:background var(--tsl-duration-fast) var(--tsl-ease);}
  input[type="range"]::-moz-range-thumb{width:18px;height:18px;border-radius:50%;border:1px solid var(--tsl-border-strong);
    background:radial-gradient(circle 3px at center, var(--tsl-accent) 99%, transparent 100%),
      var(--tsl-surface);cursor:pointer;transition:background var(--tsl-duration-fast) var(--tsl-ease);}
  input[type="range"]:active::-webkit-slider-thumb{background:radial-gradient(circle 2.5px at center, var(--tsl-accent) 99%, transparent 100%), var(--tsl-surface);}
  input[type="range"]:hover::-webkit-slider-thumb{background:radial-gradient(circle 3.5px at center, var(--tsl-accent) 99%, transparent 100%), var(--tsl-surface);}
  input[type="range"]:active::-moz-range-thumb{background:radial-gradient(circle 2.5px at center, var(--tsl-accent) 99%, transparent 100%), var(--tsl-surface);}
  input[type="range"]:hover::-moz-range-thumb{background:radial-gradient(circle 3.5px at center, var(--tsl-accent) 99%, transparent 100%), var(--tsl-surface);}
  input[type="range"]:focus-visible::-webkit-slider-thumb{outline:2px solid var(--tsl-accent);outline-offset:2px;}
  input[type="range"]:focus-visible::-moz-range-thumb{outline:2px solid var(--tsl-accent);outline-offset:2px;}
  :host([disabled]) input{opacity:var(--tsl-disabled-alpha);pointer-events:none;}
`;

export class TesselSlider extends TesselElement {
  static styles = STYLES;
  static observedAttributes = ['disabled', 'min', 'max', 'step', 'value'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const input = document.createElement('input');
    input.type = 'range';
    this.shadowRoot.appendChild(input);
    this._input = input;
    this._sync();
    input.addEventListener('input', () => {
      this.setAttribute('value', input.value);
      this._updateFill();
      this.emit('input', { value: this.value });
    });
    input.addEventListener('change', () => this.emit('change', { value: this.value }));
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    this._input.min = this.getAttribute('min') ?? '0';
    this._input.max = this.getAttribute('max') ?? '100';
    this._input.step = this.getAttribute('step') ?? '1';
    if (this.hasAttribute('value')) this._input.value = this.getAttribute('value');
    this._input.disabled = this.disabled;
    this._updateFill();
  }

  _updateFill() {
    const min = Number(this._input.min), max = Number(this._input.max), value = Number(this._input.value);
    const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
    this._input.style.setProperty('--fill', `${pct}%`);
  }

  get value() { return Number(this._input ? this._input.value : this.getAttribute('value') || 0); }
  set value(v) { this.setAttribute('value', String(v)); }
}

define('tsl-slider', TesselSlider);
