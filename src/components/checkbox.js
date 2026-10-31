// <tsl-checkbox [checked] [indeterminate] [disabled]>Label</tsl-checkbox>
// Port of TesselCheckBoxUI / TesselIcons.CheckBoxIcon and Tessel.NET's CheckBox.xaml
// (20x20 box, radius 4, 1.5px stroke). The native <input> stays in the tree (visually hidden) for
// keyboard, focus and accessibility; the visible box is restyled per state with Tailwind classes.

import { TesselElement, define } from '../core/base-element.js';
import { checkmarkSvg } from '../core/icons.js';
import { h, html, cx } from '../core/dom.js';

const LABEL = 'group inline-flex items-center gap-2.5 px-0.5 py-1 cursor-pointer select-none host-[disabled]:pointer-events-none';
const BOX = 'relative flex flex-none size-5 items-center justify-center rounded-sm border-[1.5px] text-on-accent '
  + 'transition-colors duration-fast ease-tessel peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 '
  + 'peer-focus-visible:outline-accent host-[disabled]:opacity-45';
const BOX_OFF = 'border-text-tertiary bg-input group-hover:border-text-secondary group-hover:bg-control-hover';
const BOX_ON = 'border-accent bg-accent group-hover:border-accent-hover group-hover:bg-accent-hover';
const MARK = 'size-[13px] transition-[opacity,transform] duration-fast ease-tessel';
const DASH = 'absolute w-2.5 h-0.5 rounded-[1px] bg-current transition-[opacity,transform] duration-fast ease-tessel';
const SHOWN = 'opacity-100 scale-100';
const HIDDEN = 'opacity-0 scale-60';

export class TesselCheckbox extends TesselElement {
  static styles = ':host{display:inline-flex;}';
  static observedAttributes = ['disabled', 'checked', 'indeterminate'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._input = h('input', 'peer sr-only', { type: 'checkbox' });
    this._check = html('span', MARK, checkmarkSvg(13, 2.2));
    this._dash = h('span', DASH);
    this._box = h('span', '', null, this._check, this._dash);
    this.shadowRoot.appendChild(
      h('label', LABEL, null, this._input, this._box, h('span', 'text-body text-text', null, h('slot'))),
    );
    this._sync();
    this._input.addEventListener('change', () => {
      this.checked = this._input.checked;
      this.indeterminate = false;
      this.emit('change', { checked: this.checked });
    });
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    const checked = this.hasAttribute('checked');
    const indeterminate = this.hasAttribute('indeterminate');
    this._input.checked = checked;
    this._input.indeterminate = indeterminate;
    this._input.disabled = this.disabled;
    this._box.className = cx(BOX, checked || indeterminate ? BOX_ON : BOX_OFF);
    this._check.className = cx(MARK, checked && !indeterminate ? SHOWN : HIDDEN);
    this._dash.className = cx(DASH, indeterminate ? SHOWN : HIDDEN);
  }

  get checked() { return this.hasAttribute('checked'); }
  set checked(v) { this.toggleAttribute('checked', !!v); }

  get indeterminate() { return this.hasAttribute('indeterminate'); }
  set indeterminate(v) { this.toggleAttribute('indeterminate', !!v); }
}

define('tsl-checkbox', TesselCheckbox);
