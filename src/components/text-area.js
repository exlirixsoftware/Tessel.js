// <tsl-text-area placeholder rows="4" value header>...</tsl-text-area> — port of TesselTextAreaUI.

import { TesselElement, define } from '../core/base-element.js';
import { h } from '../core/dom.js';

const HEADER = 'mb-1.5 block text-body font-medium text-text';
const FIELD = 'relative flex w-full overflow-hidden rounded-md border border-border bg-input transition-colors duration-fast ease-tessel '
  + 'hover:border-border-strong focus-within:border-accent hover:focus-within:border-accent host-[disabled]:opacity-45 host-[disabled]:pointer-events-none '
  + 'after:absolute after:inset-x-px after:bottom-0 after:h-0 after:bg-accent after:transition-[height] after:duration-fast after:ease-tessel focus-within:after:h-0.5';
const TEXTAREA = 'min-h-16 flex-1 resize-y bg-transparent px-2.5 py-1.5 text-body text-text outline-none placeholder:text-text-tertiary';

export class TesselTextArea extends TesselElement {
  static styles = ':host{display:inline-flex;flex-direction:column;width:280px;}';
  static observedAttributes = ['disabled', 'placeholder', 'rows', 'value', 'readonly', 'header', 'name', 'maxlength'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._header = h('label', HEADER);
    this._textarea = h('textarea', TEXTAREA);
    const initial = this.getAttribute('value') ?? this.textContent.trim();
    if (initial) this._textarea.value = initial;
    this.shadowRoot.append(this._header, h('div', FIELD, null, this._textarea));
    this._sync();

    this._textarea.addEventListener('input', () => this.emit('input', { value: this._textarea.value }));
    this._textarea.addEventListener('change', () => this.emit('change', { value: this._textarea.value }));
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync(name);
  }

  _sync(changed) {
    const ta = this._textarea;
    ta.placeholder = this.getAttribute('placeholder') || '';
    ta.rows = Number(this.getAttribute('rows')) || 4;
    ta.disabled = this.disabled;
    ta.readOnly = this.hasAttribute('readonly');
    for (const attr of ['name', 'maxlength']) {
      if (this.hasAttribute(attr)) ta.setAttribute(attr, this.getAttribute(attr));
      else ta.removeAttribute(attr);
    }
    if (changed === 'value' && this.hasAttribute('value')) ta.value = this.getAttribute('value');
    const header = this.getAttribute('header');
    this._header.textContent = header || '';
    this._header.hidden = !header;
  }

  get value() { return this._textarea ? this._textarea.value : ''; }
  set value(v) { if (this._textarea) this._textarea.value = v; }
}

define('tsl-text-area', TesselTextArea);
