// <tsl-switch [checked] [disabled]>Label</tsl-switch> — port of components/ToggleSwitch.java and
// Tessel.NET's ToggleSwitch (40x20 track, fully rounded, 12px knob, CSS transition standing in for the
// 15ms-tick Java animation).

import { TesselElement, define } from '../core/base-element.js';
import { h, cx } from '../core/dom.js';

const LABEL = 'group inline-flex items-center gap-2.5 cursor-pointer select-none host-[disabled]:pointer-events-none';
const TRACK = 'relative flex-none w-10 h-5 rounded-pill border-[1.5px] transition-colors duration-base ease-tessel '
  + 'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-accent host-[disabled]:opacity-45';
const TRACK_OFF = 'border-text-secondary bg-input group-hover:bg-control-hover';
const TRACK_ON = 'border-accent bg-accent group-hover:border-accent-hover group-hover:bg-accent-hover';
// 4px inset on both ends: the 37px inner track minus 12px knob leaves 25px, so it travels 17px.
const KNOB = 'absolute left-1 top-1/2 -translate-y-1/2 h-3 rounded-full group-active:w-3.5 w-3 '
  + 'transition-[transform,background-color,width] duration-base ease-tessel';
const KNOB_OFF = 'bg-text-secondary';
const KNOB_ON = 'bg-on-accent translate-x-[17px]';

export class TesselSwitch extends TesselElement {
  static styles = ':host{display:inline-flex;}';
  static observedAttributes = ['disabled', 'checked'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._input = h('input', 'peer sr-only', { type: 'checkbox', role: 'switch' });
    this._knob = h('span', KNOB);
    this._track = h('span', '', null, this._knob);
    this.shadowRoot.appendChild(
      h('label', LABEL, null, this._input, this._track, h('span', 'text-body text-text', null, h('slot'))),
    );
    this._sync();
    this._input.addEventListener('change', () => {
      this.checked = this._input.checked;
      this.emit('change', { checked: this.checked });
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
    this._track.className = cx(TRACK, checked ? TRACK_ON : TRACK_OFF);
    this._knob.className = cx(KNOB, checked ? KNOB_ON : KNOB_OFF);
  }

  get checked() { return this.hasAttribute('checked'); }
  set checked(v) { this.toggleAttribute('checked', !!v); }
}

define('tsl-switch', TesselSwitch);
