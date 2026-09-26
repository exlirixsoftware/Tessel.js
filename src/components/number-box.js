// <tsl-number-box value="5" min="0" max="10" step="1"> — port of TesselSpinnerUI
// (rounded input + stacked -/+ buttons, 28x26 each, radius 4 hover/pressed highlight).

import { TesselElement, define } from '../core/base-element.js';

const STYLES = `
  :host{display:inline-flex;width:120px;}
  .field{display:flex;align-items:stretch;width:100%;height:32px;border-radius:var(--tsl-radius-md);
    border:1px solid var(--tsl-border);background:var(--tsl-input-bg);overflow:hidden;
    transition:border-color var(--tsl-duration-fast) var(--tsl-ease);}
  .field:hover{border-color:var(--tsl-border-strong);}
  .field.focused{border-color:var(--tsl-accent);}
  input{flex:1;min-width:0;border:none;background:transparent;outline:none;font:inherit;font-size:14px;
    color:var(--tsl-text);padding:0 10px;-moz-appearance:textfield;}
  input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
  .steppers{display:flex;flex-direction:column;flex:none;width:28px;border-left:1px solid var(--tsl-border);}
  .steppers button{flex:1;display:flex;align-items:center;justify-content:center;border:none;background:transparent;
    color:var(--tsl-text-secondary);cursor:pointer;padding:0;}
  .steppers button:hover{background:var(--tsl-control-hover);color:var(--tsl-text);}
  .steppers button:active{background:var(--tsl-control-pressed);}
  .steppers button:first-child{border-bottom:1px solid var(--tsl-border);}
  :host([disabled]) .field{opacity:var(--tsl-disabled-alpha);pointer-events:none;}
`;

export class TesselNumberBox extends TesselElement {
  static styles = STYLES;
  static observedAttributes = ['disabled', 'min', 'max', 'step', 'value'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const field = document.createElement('div');
    field.className = 'field';
    const input = document.createElement('input');
    input.type = 'number';
    const steppers = document.createElement('div');
    steppers.className = 'steppers';
    const up = document.createElement('button');
    up.type = 'button';
    up.setAttribute('aria-label', 'Increase');
    up.tabIndex = -1; // the numeric input itself already handles focus/keyboard stepping
    up.innerHTML = '<svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><line x1="4" y1="10" x2="16" y2="10"/><line x1="10" y1="4" x2="10" y2="16"/></svg>';
    const down = document.createElement('button');
    down.type = 'button';
    down.setAttribute('aria-label', 'Decrease');
    down.tabIndex = -1;
    down.innerHTML = '<svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><line x1="4" y1="10" x2="16" y2="10"/></svg>';
    steppers.append(up, down);
    field.append(input, steppers);
    this.shadowRoot.appendChild(field);
    this._field = field;
    this._input = input;
    this._sync();

    up.addEventListener('click', () => { input.stepUp(); this._commit(); });
    down.addEventListener('click', () => { input.stepDown(); this._commit(); });
    input.addEventListener('focus', () => field.classList.add('focused'));
    input.addEventListener('blur', () => field.classList.remove('focused'));
    input.addEventListener('input', () => this._commit());
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
    if (this.hasAttribute('value')) this._input.value = this.getAttribute('value');
    this._input.disabled = this.disabled;
  }

  get value() { return Number(this._input ? this._input.value : this.getAttribute('value') || 0); }
  set value(v) { this.setAttribute('value', String(v)); }
}

define('tsl-number-box', TesselNumberBox);
