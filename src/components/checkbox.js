// <tsl-checkbox [checked] [indeterminate] [disabled]>Label</tsl-checkbox>
// Port of TesselCheckBoxUI / TesselIcons.CheckBoxIcon (20x20 box, radius 4, 1.5px stroke).

import { TesselElement, define } from '../core/base-element.js';
import { checkmarkSvg } from '../core/icons.js';

const STYLES = `
  :host{display:inline-flex;}
  label{display:inline-flex;align-items:center;gap:10px;cursor:pointer;padding:4px 2px;user-select:none;}
  :host([disabled]) label{cursor:default;}
  input{position:absolute;opacity:0;width:20px;height:20px;margin:0;}
  .box{position:relative;flex:none;width:20px;height:20px;border-radius:4px;border:1.5px solid var(--tsl-text-tertiary);
    background:var(--tsl-input-bg);display:flex;align-items:center;justify-content:center;color:var(--tsl-on-accent);
    transition:background var(--tsl-duration-fast) var(--tsl-ease), border-color var(--tsl-duration-fast) var(--tsl-ease);}
  .box svg{width:13px;height:13px;opacity:0;transform:scale(0.6);transition:opacity var(--tsl-duration-fast) var(--tsl-ease), transform var(--tsl-duration-fast) var(--tsl-ease);}
  .dash{position:absolute;width:10px;height:2px;border-radius:1px;background:currentColor;opacity:0;transform:scale(0.6);
    transition:opacity var(--tsl-duration-fast) var(--tsl-ease), transform var(--tsl-duration-fast) var(--tsl-ease);}
  label:hover .box{border-color:var(--tsl-text-secondary);background:var(--tsl-control-hover);}
  input:checked ~ .box, input:indeterminate ~ .box{background:var(--tsl-accent);border-color:var(--tsl-accent);}
  label:hover input:checked ~ .box, label:hover input:indeterminate ~ .box{background:var(--tsl-accent-hover);border-color:var(--tsl-accent-hover);}
  input:checked ~ .box svg{opacity:1;transform:scale(1);}
  input:indeterminate ~ .box .dash{opacity:1;transform:scale(1);}
  input:focus-visible ~ .box{outline:2px solid var(--tsl-accent);outline-offset:2px;}
  :host([disabled]) .box{opacity:var(--tsl-disabled-alpha);}
  :host([disabled]) label{pointer-events:none;}
  .text{font-size:14px;color:var(--tsl-text);line-height:20px;}
`;

export class TesselCheckbox extends TesselElement {
  static styles = STYLES;
  static observedAttributes = ['disabled', 'checked', 'indeterminate'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    const box = document.createElement('span');
    box.className = 'box';
    box.innerHTML = checkmarkSvg(14, 2.2);
    const dash = document.createElement('span');
    dash.className = 'dash';
    box.appendChild(dash);
    const text = document.createElement('span');
    text.className = 'text';
    text.appendChild(document.createElement('slot'));
    label.append(input, box, text);
    this.shadowRoot.appendChild(label);
    this._input = input;

    this._sync();
    input.addEventListener('change', () => {
      this.checked = input.checked;
      this.indeterminate = false;
      this.emit('change', { checked: this.checked });
    });
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    this._input.checked = this.hasAttribute('checked');
    this._input.indeterminate = this.hasAttribute('indeterminate');
    this._input.disabled = this.disabled;
  }

  get checked() { return this.hasAttribute('checked'); }
  set checked(v) { this.toggleAttribute('checked', !!v); }

  get indeterminate() { return this.hasAttribute('indeterminate'); }
  set indeterminate(v) { this.toggleAttribute('indeterminate', !!v); }
}

define('tsl-checkbox', TesselCheckbox);
