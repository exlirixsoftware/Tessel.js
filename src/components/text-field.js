// <tsl-text-field type="text|password|email|number|..." placeholder icon="search" value header clearable>
// Port of TesselInputBorder + TesselTextFieldUI/TesselPasswordFieldUI/TesselFormattedTextFieldUI, with
// Tessel.NET's ControlHelper extras: `header` (label above the input) and `clearable` ("x" button).

import { TesselElement, define } from '../core/base-element.js';
import { createIcon, closeSvg } from '../core/icons.js';
import { h, html } from '../core/dom.js';

const HEADER = 'mb-1.5 block text-body font-medium text-text';
const FIELD = 'group relative flex h-8 w-full items-center gap-2 overflow-hidden rounded-md border border-border bg-input px-2.5 '
  + 'transition-colors duration-fast ease-tessel hover:border-border-strong focus-within:border-accent hover:focus-within:border-accent '
  + 'host-[disabled]:opacity-45 host-[disabled]:pointer-events-none '
  // Focus underline that grows from the bottom edge, like Tessel.NET's TextBox.
  + 'after:absolute after:inset-x-px after:bottom-0 after:h-0 after:bg-accent after:transition-[height] after:duration-fast '
  + 'after:ease-tessel focus-within:after:h-0.5';
const INPUT = 'h-full min-w-0 flex-1 bg-transparent p-0 text-body text-text outline-none placeholder:text-text-tertiary';
const CLEAR = 'mr-[-6px] flex size-6 flex-none cursor-pointer items-center justify-center rounded-sm bg-transparent text-text-secondary '
  + 'transition-colors duration-fast hover:bg-control-hover hover:text-text active:bg-control-pressed';

export class TesselTextField extends TesselElement {
  static styles = ':host{display:inline-flex;flex-direction:column;width:220px;}';
  static observedAttributes = ['disabled', 'icon', 'placeholder', 'type', 'value', 'readonly', 'header', 'clearable', 'name', 'maxlength', 'autocomplete'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._header = h('label', HEADER);
    this._iconSlot = h('span', 'flex flex-none text-text-secondary');
    this._input = h('input', INPUT);
    this._clear = h('button', CLEAR, { type: 'button', tabindex: '-1', 'aria-label': 'Clear' });
    this._clear.innerHTML = closeSvg(10);
    this._field = h('div', FIELD, null, this._iconSlot, this._input, this._clear);
    this.shadowRoot.append(this._header, this._field);
    this._sync();

    this._input.addEventListener('input', () => {
      this.setAttribute('value', this._input.value);
      this._updateClear();
      this.emit('input', { value: this._input.value });
    });
    this._input.addEventListener('change', () => this.emit('change', { value: this._input.value }));
    // Keep focus in the input when clearing, so the user can keep typing.
    this._clear.addEventListener('mousedown', (e) => e.preventDefault());
    this._clear.addEventListener('click', () => {
      this.value = '';
      this._input.focus();
      this.emit('input', { value: '' });
      this.emit('change', { value: '' });
    });
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    const input = this._input;
    input.type = this.getAttribute('type') || 'text';
    input.placeholder = this.getAttribute('placeholder') || '';
    input.disabled = this.disabled;
    input.readOnly = this.hasAttribute('readonly');
    for (const attr of ['name', 'maxlength', 'autocomplete']) {
      if (this.hasAttribute(attr)) input.setAttribute(attr, this.getAttribute(attr));
      else input.removeAttribute(attr);
    }
    if (this.hasAttribute('value') && input.value !== this.getAttribute('value')) {
      input.value = this.getAttribute('value');
    }
    const header = this.getAttribute('header');
    this._header.textContent = header || '';
    this._header.hidden = !header;
    const icon = this.getAttribute('icon');
    this._iconSlot.replaceChildren(...(icon ? [createIcon(icon, 16)] : []));
    this._iconSlot.hidden = !icon;
    this._updateClear();
  }

  _updateClear() {
    this._clear.hidden = !this.hasAttribute('clearable') || this.hasAttribute('readonly') || !this._input.value;
  }

  get value() { return this._input ? this._input.value : (this.getAttribute('value') || ''); }
  set value(v) {
    this.setAttribute('value', v);
    if (this._input) {
      this._input.value = v;
      this._updateClear();
    }
  }

  focus(options) { this._input?.focus(options); }
}

define('tsl-text-field', TesselTextField);
