// <tsl-button variant="standard|accent|outline|subtle|danger|icon|link">
// Port of ButtonPainter / TesselButtonUI and Tessel.NET's Button.xaml. A native <button> inside shadow DOM
// gives us free hover/active/focus-visible/disabled handling; the look is Tailwind utilities keyed off `variant`.

import { TesselElement, define } from '../core/base-element.js';
import { createIcon } from '../core/icons.js';
import { h, cx } from '../core/dom.js';

const BASE =
  'inline-flex items-center justify-center gap-2 border rounded-md select-none cursor-pointer '
  + 'whitespace-nowrap text-body font-medium transition-colors duration-fast ease-tessel '
  + 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent '
  + 'disabled:pointer-events-none disabled:opacity-45';

const BOX = 'h-8 px-3.5 grow';

// Each variant owns its sizing too, so no two classes on the element ever set the same property.
const VARIANTS = {
  standard: `${BOX} bg-control border-border hover:bg-control-hover active:bg-control-pressed`,
  accent: `${BOX} bg-accent border-accent text-on-accent hover:bg-accent-hover hover:border-accent-hover active:bg-accent-pressed active:border-accent-pressed`,
  outline: `${BOX} bg-transparent border-accent text-accent hover:bg-accent-subtle active:bg-accent-subtle`,
  subtle: `${BOX} bg-transparent border-transparent hover:bg-control-hover active:bg-control-pressed`,
  danger: `${BOX} bg-danger border-danger text-white hover:bg-danger-hover hover:border-danger-hover active:bg-danger-hover active:border-danger-hover`,
  icon: 'size-8 p-0 bg-transparent border-transparent hover:bg-control-hover active:bg-control-pressed',
  link: 'p-0 bg-transparent border-transparent text-accent font-normal hover:text-accent-hover active:text-accent-pressed',
};

export class TesselButton extends TesselElement {
  static styles = ':host{display:inline-flex;vertical-align:middle;} ::slotted(*){pointer-events:none;}';
  static observedAttributes = ['disabled', 'icon', 'icon-size', 'variant'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._iconSlot = h('span', 'inline-flex flex-none', { part: 'icon' });
    this._button = h('button', '', { type: this.getAttribute('type') || 'button' }, this._iconSlot, h('slot'));
    this._button.disabled = this.disabled;
    this.shadowRoot.appendChild(this._button);
    this._renderVariant();
    this._renderIcon();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === 'disabled') this._button.disabled = this.disabled;
    if (name === 'variant') this._renderVariant();
    if (name === 'icon' || name === 'icon-size') this._renderIcon();
  }

  _renderVariant() {
    this._button.className = cx(BASE, VARIANTS[this.variant] || VARIANTS.standard);
  }

  _renderIcon() {
    const icon = this.getAttribute('icon');
    this._iconSlot.replaceChildren();
    // An empty icon span is still a flex item, so the `gap` between it and the slotted label text would
    // otherwise reserve 8px of unwanted space (and visually off-center a no-icon button).
    this._iconSlot.hidden = !icon;
    if (icon) this._iconSlot.appendChild(createIcon(icon, Number(this.getAttribute('icon-size')) || 16));
  }

  get variant() { return this.getAttribute('variant') || 'standard'; }
  set variant(v) { this.setAttribute('variant', v); }
}

define('tsl-button', TesselButton);
