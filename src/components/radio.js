// <tsl-radio-group value="b"><tsl-radio value="a">A</tsl-radio><tsl-radio value="b">B</tsl-radio></tsl-radio-group>
// Port of TesselRadioButtonUI / TesselIcons.RadioIcon (20x20 circle, 1.5px stroke, 8px dot).
// Native <input type="radio"> grouping doesn't cross shadow-root boundaries, so <tsl-radio-group>
// does the mutual-exclusion bookkeeping that Swing's ButtonGroup would otherwise give for free.

import { TesselElement, define } from '../core/base-element.js';

const RADIO_STYLES = `
  :host{display:inline-flex;}
  label{display:inline-flex;align-items:center;gap:10px;cursor:pointer;padding:4px 2px;user-select:none;}
  input{position:absolute;opacity:0;width:20px;height:20px;margin:0;}
  .box{position:relative;flex:none;width:20px;height:20px;border-radius:50%;border:1.5px solid var(--tsl-text-tertiary);
    background:var(--tsl-input-bg);transition:background var(--tsl-duration-fast) var(--tsl-ease), border-color var(--tsl-duration-fast) var(--tsl-ease);}
  .dot{position:absolute;top:50%;left:50%;width:8px;height:8px;border-radius:50%;background:var(--tsl-on-accent);
    transform:translate(-50%,-50%) scale(0);transition:transform var(--tsl-duration-fast) var(--tsl-ease);}
  label:hover .box{border-color:var(--tsl-text-secondary);background:var(--tsl-control-hover);}
  label:hover .dot{width:10px;height:10px;}
  input:checked ~ .box{background:var(--tsl-accent);border-color:var(--tsl-accent);}
  label:hover input:checked ~ .box{background:var(--tsl-accent-hover);border-color:var(--tsl-accent-hover);}
  input:checked ~ .dot{transform:translate(-50%,-50%) scale(1);}
  input:focus-visible ~ .box{outline:2px solid var(--tsl-accent);outline-offset:2px;}
  :host([disabled]) .box{opacity:var(--tsl-disabled-alpha);}
  :host([disabled]) label{pointer-events:none;}
  .text{font-size:14px;color:var(--tsl-text);line-height:20px;}
`;

export class TesselRadio extends TesselElement {
  static styles = RADIO_STYLES;
  static observedAttributes = ['disabled', 'checked'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'radio';
    const box = document.createElement('span');
    box.className = 'box';
    const dot = document.createElement('span');
    dot.className = 'dot';
    box.appendChild(dot);
    const text = document.createElement('span');
    text.className = 'text';
    text.appendChild(document.createElement('slot'));
    label.append(input, box, text);
    this.shadowRoot.appendChild(label);
    this._input = input;
    this._sync();

    input.addEventListener('click', (e) => {
      // A lone radio (no group) can't be unchecked by clicking itself again.
      if (input.checked) e.preventDefault();
    });
    input.addEventListener('change', () => {
      this.checked = true;
      this.emit('change', { value: this.value, checked: true });
    });
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    this._input.checked = this.hasAttribute('checked');
    this._input.disabled = this.disabled;
  }

  get checked() { return this.hasAttribute('checked'); }
  set checked(v) { this.toggleAttribute('checked', !!v); }

  get value() { return this.getAttribute('value') || ''; }
  set value(v) { this.setAttribute('value', v); }
}

const GROUP_STYLES = `:host{display:flex;flex-direction:column;gap:2px;}`;

export class TesselRadioGroup extends TesselElement {
  static styles = GROUP_STYLES;
  static observedAttributes = ['value'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const slot = document.createElement('slot');
    this.shadowRoot.appendChild(slot);
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
