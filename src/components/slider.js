// <tsl-slider min="0" max="100" step="1" value="50"> — port of TesselSliderUI and Tessel.NET's Slider
// (4px track radius 2, 20px thumb with an accent center dot, focus ring +2px around the thumb).
// Built from plain elements with pointer capture and the ARIA slider keyboard model, so the whole look is
// utility classes — no vendor `::-webkit-slider-thumb` / `::-moz-range-thumb` rules to keep in sync.

import { TesselElement, define } from '../core/base-element.js';
import { h } from '../core/dom.js';

const ROOT = 'group relative flex h-5 w-full touch-none items-center outline-none cursor-pointer host-[disabled]:pointer-events-none host-[disabled]:opacity-45';
const TRACK = 'relative h-1 w-full rounded-xs bg-border-strong';
const FILL = 'absolute inset-y-0 left-0 rounded-xs bg-accent';
const THUMB = 'absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border-strong bg-surface '
  + 'transition-shadow duration-fast ease-tessel group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-accent';
const DOT = 'absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent transition-transform duration-fast ease-tessel '
  + 'group-hover:scale-125 group-active:scale-75';

export class TesselSlider extends TesselElement {
  static styles = ':host{display:inline-flex;width:200px;}';
  static observedAttributes = ['disabled', 'min', 'max', 'step', 'value'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._fill = h('div', FILL);
    this._thumb = h('div', THUMB, null, h('span', DOT));
    this._root = h('div', ROOT, { role: 'slider', tabindex: '0' }, h('div', TRACK, null, this._fill), this._thumb);
    this.shadowRoot.appendChild(this._root);
    this._value = this._read('value', this._min());
    this._sync();

    this._root.addEventListener('pointerdown', (e) => {
      if (this.disabled) return;
      this._root.setPointerCapture(e.pointerId);
      this._dragging = true;
      this._fromPointer(e);
    });
    this._root.addEventListener('pointermove', (e) => { if (this._dragging) this._fromPointer(e); });
    const end = (e) => {
      if (!this._dragging) return;
      this._dragging = false;
      this._root.releasePointerCapture?.(e.pointerId);
      this.emit('change', { value: this.value });
    };
    this._root.addEventListener('pointerup', end);
    this._root.addEventListener('pointercancel', end);
    this._root.addEventListener('keydown', (e) => this._onKeydown(e));
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === 'value') this._value = this._snap(this._read('value', this._min()));
    this._sync();
  }

  _read(attr, fallback) {
    const n = Number(this.getAttribute(attr));
    return this.hasAttribute(attr) && !Number.isNaN(n) ? n : fallback;
  }

  _min() { return this._read('min', 0); }
  _max() { return this._read('max', 100); }
  _step() { return this._read('step', 1) || 1; }

  _snap(v) {
    const min = this._min(), max = this._max(), step = this._step();
    const snapped = min + Math.round((v - min) / step) * step;
    // Trim float noise (0.1 + 0.2) to the step's own precision.
    const digits = (String(step).split('.')[1] || '').length;
    return Math.min(max, Math.max(min, Number(snapped.toFixed(digits))));
  }

  _set(v, { fire = true } = {}) {
    const next = this._snap(v);
    if (next === this._value) return;
    this._value = next;
    this.setAttribute('value', String(next));
    if (fire) this.emit('input', { value: next });
  }

  _fromPointer(e) {
    const rect = this._root.getBoundingClientRect();
    const t = rect.width ? Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)) : 0;
    this._set(this._min() + t * (this._max() - this._min()));
  }

  _onKeydown(e) {
    const step = this._step();
    const big = Math.max(step, (this._max() - this._min()) / 10);
    const keys = {
      ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: big, PageDown: -big,
    };
    let next = null;
    if (e.key in keys) next = this._value + keys[e.key];
    else if (e.key === 'Home') next = this._min();
    else if (e.key === 'End') next = this._max();
    if (next == null) return;
    e.preventDefault();
    this._set(next);
    this.emit('change', { value: this.value });
  }

  _sync() {
    const min = this._min(), max = this._max();
    const pct = max > min ? ((this._value - min) / (max - min)) * 100 : 0;
    this._fill.style.width = `${pct}%`;
    this._thumb.style.left = `${pct}%`;
    this._root.setAttribute('aria-valuemin', String(min));
    this._root.setAttribute('aria-valuemax', String(max));
    this._root.setAttribute('aria-valuenow', String(this._value));
    this._root.tabIndex = this.disabled ? -1 : 0;
  }

  get value() { return this._built ? this._value : this._read('value', 0); }
  set value(v) { this.setAttribute('value', String(v)); }
}

define('tsl-slider', TesselSlider);
