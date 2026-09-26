// <tsl-text-area placeholder rows="4" value>...</tsl-text-area> — port of TesselTextAreaUI.

import { TesselElement, define } from '../core/base-element.js';

const STYLES = `
  :host{display:inline-flex;width:280px;}
  .field{position:relative;display:flex;width:100%;border-radius:var(--tsl-radius-md);border:1px solid var(--tsl-border);
    background:var(--tsl-input-bg);overflow:hidden;transition:border-color var(--tsl-duration-fast) var(--tsl-ease);}
  .field:hover{border-color:var(--tsl-border-strong);}
  .field.focused{border-color:var(--tsl-accent);}
  textarea{flex:1;border:none;background:transparent;outline:none;font:inherit;font-size:14px;color:var(--tsl-text);
    padding:6px 10px;resize:vertical;min-height:64px;line-height:1.4;}
  textarea::placeholder{color:var(--tsl-text-tertiary);}
  :host([disabled]) .field{opacity:var(--tsl-disabled-alpha);}
`;

export class TesselTextArea extends TesselElement {
  static styles = STYLES;
  static observedAttributes = ['disabled', 'placeholder', 'rows', 'value', 'readonly'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const field = document.createElement('div');
    field.className = 'field';
    const textarea = document.createElement('textarea');
    const initial = this.getAttribute('value') ?? this.textContent.trim();
    if (initial) textarea.value = initial;
    field.appendChild(textarea);
    this.shadowRoot.appendChild(field);
    this._field = field;
    this._textarea = textarea;
    this._sync();

    textarea.addEventListener('focus', () => field.classList.add('focused'));
    textarea.addEventListener('blur', () => field.classList.remove('focused'));
    textarea.addEventListener('input', () => this.emit('input', { value: textarea.value }));
    textarea.addEventListener('change', () => this.emit('change', { value: textarea.value }));
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    this._textarea.placeholder = this.getAttribute('placeholder') || '';
    this._textarea.rows = Number(this.getAttribute('rows')) || 4;
    this._textarea.disabled = this.disabled;
    this._textarea.readOnly = this.hasAttribute('readonly');
  }

  get value() { return this._textarea ? this._textarea.value : ''; }
  set value(v) { if (this._textarea) this._textarea.value = v; }
}

define('tsl-text-area', TesselTextArea);
