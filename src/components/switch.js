// <tsl-switch [checked] [disabled]>Label</tsl-switch> — port of components/ToggleSwitch.java
// (40x20 track, fully rounded, 12px knob, CSS transition standing in for the 15ms-tick Java animation).

import { TesselElement, define } from '../core/base-element.js';

const STYLES = `
  :host{display:inline-flex;}
  label{display:inline-flex;align-items:center;gap:10px;cursor:pointer;user-select:none;}
  input{position:absolute;opacity:0;width:40px;height:20px;margin:0;}
  .track{position:relative;flex:none;width:40px;height:20px;border-radius:999px;background:var(--tsl-input-bg);
    border:1.5px solid var(--tsl-text-secondary);transition:background var(--tsl-duration-base) var(--tsl-ease),
      border-color var(--tsl-duration-base) var(--tsl-ease);}
  .knob{position:absolute;top:3px;left:4px;width:12px;height:12px;border-radius:50%;background:var(--tsl-text-secondary);
    transition:transform var(--tsl-duration-base) var(--tsl-ease), background var(--tsl-duration-base) var(--tsl-ease),
      width var(--tsl-duration-fast) var(--tsl-ease), height var(--tsl-duration-fast) var(--tsl-ease);}
  label:hover .track{background:var(--tsl-control-hover);}
  input:checked ~ .track{background:var(--tsl-accent);border-color:var(--tsl-accent);}
  label:hover input:checked ~ .track{background:var(--tsl-accent-hover);border-color:var(--tsl-accent-hover);}
  input:checked ~ .track .knob{transform:translateX(20px);background:var(--tsl-on-accent);}
  label:active .knob{width:14px;}
  input:focus-visible ~ .track{outline:2px solid var(--tsl-accent);outline-offset:3px;}
  :host([disabled]) label{pointer-events:none;}
  :host([disabled]) .track{opacity:var(--tsl-disabled-alpha);}
  .text{font-size:14px;color:var(--tsl-text);}
`;

export class TesselSwitch extends TesselElement {
  static styles = STYLES;
  static observedAttributes = ['disabled', 'checked'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    const track = document.createElement('span');
    track.className = 'track';
    const knob = document.createElement('span');
    knob.className = 'knob';
    track.appendChild(knob);
    const text = document.createElement('span');
    text.className = 'text';
    text.appendChild(document.createElement('slot'));
    label.append(input, track, text);
    this.shadowRoot.appendChild(label);
    this._input = input;
    this._sync();
    input.addEventListener('change', () => {
      this.checked = input.checked;
      this.emit('change', { checked: this.checked });
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
}

define('tsl-switch', TesselSwitch);
