// <tsl-radio-group value="b"><tsl-radio value="a">A</tsl-radio><tsl-radio value="b">B</tsl-radio></tsl-radio-group>
// Port of TesselRadioButtonUI / TesselIcons.RadioIcon (20x20 circle, 1.5px stroke, 8px dot).
// Native <input type="radio"> grouping doesn't cross shadow-root boundaries, so <tsl-radio-group>
// does the mutual-exclusion bookkeeping that Swing's ButtonGroup would otherwise give for free.

import { TesselElement, define } from '../core/base-element.js';
import { h, cx } from '../core/dom.js';

const LABEL = 'group inline-flex items-center gap-2.5 px-0.5 py-1 cursor-pointer select-none host-[disabled]:pointer-events-none';
const BOX = 'relative flex-none size-5 rounded-full border-[1.5px] transition-colors duration-fast ease-tessel '
  + 'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent host-[disabled]:opacity-45';
const BOX_OFF = 'border-text-tertiary bg-input group-hover:border-text-secondary group-hover:bg-control-hover';
const BOX_ON = 'border-accent bg-accent group-hover:border-accent-hover group-hover:bg-accent-hover';
const DOT = 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-on-accent '
  + 'transition-[transform,width,height] duration-fast ease-tessel';

export class TesselRadio extends TesselElement {
  static styles = ':host{display:inline-flex;}';
  static observedAttributes = ['disabled', 'checked'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._input = h('input', 'peer sr-only', { type: 'radio' });
    this._dot = h('span', DOT);
    this._box = h('span', '', null, this._dot);
    this.shadowRoot.appendChild(
      h('label', LABEL, null, this._input, this._box, h('span', 'text-body text-text', null, h('slot'))),
    );
    this._sync();

    this._input.addEventListener('change', () => {
      this.checked = true;
      this.emit('change', { value: this.value, checked: true });
    });
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    const checked = this.hasAttribute('checked');
    this._input.checked = checked;
    this._input.disabled = this.disabled;
    this._box.className = cx(BOX, checked ? BOX_ON : BOX_OFF);
    // The dot grows slightly on hover (10px vs 8px), like the Swing painter.
    this._dot.className = cx(DOT, checked ? 'size-2 scale-100 group-hover:size-2.5' : 'size-2 scale-0');
  }

  get checked() { return this.hasAttribute('checked'); }
  set checked(v) { this.toggleAttribute('checked', !!v); }

  get value() { return this.getAttribute('value') || ''; }
  set value(v) { this.setAttribute('value', v); }
}

export class TesselRadioGroup extends TesselElement {
  static styles = ':host{display:flex;flex-direction:column;gap:2px;}';
  static observedAttributes = ['value'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this.shadowRoot.appendChild(h('slot'));
    this.setAttribute('role', 'radiogroup');
    this.addEventListener('change', (e) => {
      if (!(e.target instanceof TesselRadio)) return;
      for (const radio of this._radios()) radio.checked = radio === e.target;
      this._applying = true;
      this.setAttribute('value', e.target.value);
      this._applying = false;
      this.emit('change', { value: e.target.value });
    });
    this._applyValue();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built && name === 'value' && !this._applying) this._applyValue();
  }

  _radios() {
    return Array.from(this.children).filter((c) => c instanceof TesselRadio);
  }

  _applyValue() {
    const value = this.getAttribute('value');
    for (const radio of this._radios()) radio.checked = radio.value === value;
  }

  get value() { return this.getAttribute('value') || ''; }
  set value(v) { this.setAttribute('value', v); }
}

define('tsl-radio', TesselRadio);
define('tsl-radio-group', TesselRadioGroup);
