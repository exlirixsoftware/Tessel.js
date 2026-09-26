// <tsl-text-field type="text|password|email|number|..." placeholder icon="search" value>
// Port of TesselInputBorder + TesselTextFieldUI/TesselPasswordFieldUI/TesselFormattedTextFieldUI.

import { TesselElement, define } from '../core/base-element.js';
import { createIcon } from '../core/icons.js';

const STYLES = `
  :host{display:inline-flex;width:220px;}
  .field{position:relative;display:flex;align-items:center;gap:8px;width:100%;height:32px;padding:0 10px;
    border-radius:var(--tsl-radius-md);border:1px solid var(--tsl-border);background:var(--tsl-input-bg);
    overflow:hidden;transition:border-color var(--tsl-duration-fast) var(--tsl-ease);}
  .field:hover{border-color:var(--tsl-border-strong);}
  .field.focused{border-color:var(--tsl-accent);}
  .field::after{content:"";position:absolute;left:1px;right:1px;bottom:0;height:0;background:var(--tsl-accent);
    transition:height var(--tsl-duration-fast) var(--tsl-ease);}
  .field.focused::after{height:2px;}
  .icon{flex:none;display:flex;color:var(--tsl-text-secondary);}
  input{flex:1;min-width:0;border:none;background:transparent;outline:none;font:inherit;font-size:14px;color:var(--tsl-text);
    padding:0;height:100%;}
  input::placeholder{color:var(--tsl-text-tertiary);}
  :host([disabled]) .field{opacity:var(--tsl-disabled-alpha);}
`;

export class TesselTextField extends TesselElement {
  static styles = STYLES;
  static observedAttributes = ['disabled', 'icon', 'placeholder', 'type', 'value', 'readonly'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const field = document.createElement('div');
    field.className = 'field';
    this._iconSlot = document.createElement('span');
    this._iconSlot.className = 'icon';
    const input = document.createElement('input');
    field.append(this._iconSlot, input);
    this.shadowRoot.appendChild(field);
    this._field = field;
    this._input = input;
    this._sync();

    input.addEventListener('focus', () => field.classList.add('focused'));
    input.addEventListener('blur', () => field.classList.remove('focused'));
    input.addEventListener('input', () => {
      this.setAttribute('value', input.value);
      this.emit('input', { value: input.value });
    });
    input.addEventListener('change', () => this.emit('change', { value: input.value }));
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    this._input.type = this.getAttribute('type') || 'text';
    this._input.placeholder = this.getAttribute('placeholder') || '';
    this._input.disabled = this.disabled;
    this._input.readOnly = this.hasAttribute('readonly');
    if (this.hasAttribute('value') && this._input.value !== this.getAttribute('value')) {
      this._input.value = this.getAttribute('value');
    }
    const icon = this.getAttribute('icon');
    this._iconSlot.innerHTML = icon ? createIcon(icon, 16).innerHTML : '';
    this._iconSlot.style.display = icon ? '' : 'none';
  }

  get value() { return this._input ? this._input.value : (this.getAttribute('value') || ''); }
  set value(v) {
    this.setAttribute('value', v);
    if (this._input) this._input.value = v;
  }

  focus(options) { this._input?.focus(options); }
}

define('tsl-text-field', TesselTextField);
