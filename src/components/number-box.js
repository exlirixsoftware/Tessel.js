// <tsl-number-box value="5" min="0" max="10" step="1" header> — port of TesselSpinnerUI and Tessel.NET's NumberBox
// (rounded input + stacked +/- buttons, 28x26 each, radius 4 hover/pressed highlight).

import { TesselElement, define } from '../core/base-element.js';
import { h, html } from '../core/dom.js';

const HEADER = 'mb-1.5 block text-body font-medium text-text';
const FIELD = 'flex h-8 w-full items-stretch overflow-hidden rounded-md border border-border bg-input transition-colors duration-fast ease-tessel '
  + 'hover:border-border-strong focus-within:border-accent hover:focus-within:border-accent host-[disabled]:pointer-events-none host-[disabled]:opacity-45';
const INPUT = 'min-w-0 flex-1 bg-transparent px-2.5 text-body text-text outline-none [appearance:textfield] '
  + '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';
const STEP = 'flex flex-1 cursor-pointer items-center justify-center bg-transparent p-0 text-text-secondary '
  + 'hover:bg-control-hover hover:text-text active:bg-control-pressed';
const PLUS = '<svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><line x1="4" y1="10" x2="16" y2="10"/><line x1="10" y1="4" x2="10" y2="16"/></svg>';
const MINUS = '<svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><line x1="4" y1="10" x2="16" y2="10"/></svg>';

export class TesselNumberBox extends TesselElement {
  static styles = ':host{display:inline-flex;flex-direction:column;width:120px;}';
  static observedAttributes = ['disabled', 'min', 'max', 'step', 'value', 'header'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._header = h('label', HEADER);
    this._input = h('input', INPUT, { type: 'number' });
    // The numeric input itself already handles focus and keyboard stepping, so the buttons skip the tab order.
    const up = html('button', `${STEP} border-b border-border`, PLUS);
    const down = html('button', STEP, MINUS);
    for (const [btn, label] of [[up, 'Increase'], [down, 'Decrease']]) {
      btn.type = 'button';
      btn.tabIndex = -1;
      btn.setAttribute('aria-label', label);
      btn.addEventListener('mousedown', (e) => e.preventDefault());
    }
    this.shadowRoot.append(this._header, h('div', FIELD, null, this._input, h('div', 'flex w-7 flex-none flex-col border-l border-border', null, up, down)));
    this._sync();

    up.addEventListener('click', () => { this._input.stepUp(); this._commit(); });
    down.addEventListener('click', () => { this._input.stepDown(); this._commit(); });
    this._input.addEventListener('input', () => this._commit());
    // Typing can leave a value outside min/max; snap it back when the user leaves the field.
    this._input.addEventListener('blur', () => {
      const clamped = this._clamp(this._input.valueAsNumber);
      if (Number.isNaN(clamped)) return;
      if (clamped !== this._input.valueAsNumber) {
        this._input.value = String(clamped);
        this._commit();
      }
    });
  }

  _clamp(n) {
    const min = this.hasAttribute('min') ? Number(this.getAttribute('min')) : -Infinity;
    const max = this.hasAttribute('max') ? Number(this.getAttribute('max')) : Infinity;
    return Math.min(max, Math.max(min, n));
  }

  _commit() {
    this.setAttribute('value', this._input.value);
    this.emit('change', { value: this.value });
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    this._input.min = this.getAttribute('min') ?? '';
    this._input.max = this.getAttribute('max') ?? '';
    this._input.step = this.getAttribute('step') ?? '1';
    if (this.hasAttribute('value') && this._input.value !== this.getAttribute('value')) this._input.value = this.getAttribute('value');
    this._input.disabled = this.disabled;
    this._header.textContent = this.getAttribute('header') || '';
    this._header.hidden = !this.hasAttribute('header');
  }

  get value() { return Number(this._input ? this._input.value : this.getAttribute('value') || 0); }
  set value(v) { this.setAttribute('value', String(v)); }
}

define('tsl-number-box', TesselNumberBox);
