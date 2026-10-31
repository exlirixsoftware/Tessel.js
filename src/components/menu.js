// <tsl-menu-button label="Options" icon="more">
//   <tsl-menu-item value="edit" icon="edit" shortcut="Ctrl+E">Edit</tsl-menu-item>
//   <tsl-menu-separator></tsl-menu-separator>
//   <tsl-menu-checkbox-item value="hidden" checked>Show hidden files</tsl-menu-checkbox-item>
// </tsl-menu-button>
// Port of MenuPainting / TesselMenuUIs and Tessel.NET's Menu/ContextMenu. The list is a top-layer popover
// (core/popup.js) with arrow-key navigation; a `slot="trigger"` child replaces the default button.
// The item elements defined here are the menu "definition" shared by every menu-owning component
// (<tsl-dropdown-button>, <tsl-split-button>, <tsl-context-menu>...).

import { TesselElement, define } from '../core/base-element.js';
import { h } from '../core/dom.js';
import { createMenu } from '../core/menu.js';
import './button.js';

export class TesselMenuItem extends HTMLElement {
  connectedCallback() { this.hidden = true; }
  get value() { return this.getAttribute('value') ?? this.textContent.trim(); }
  get icon() { return this.getAttribute('icon'); }
  get label() { return this.textContent.trim(); }
}
export class TesselMenuCheckboxItem extends TesselMenuItem {
  get checked() { return this.hasAttribute('checked'); }
  set checked(v) { this.toggleAttribute('checked', !!v); }
}
export class TesselMenuSeparator extends HTMLElement {
  connectedCallback() { this.hidden = true; }
}
for (const [tag, cls] of [
  ['tsl-menu-item', TesselMenuItem],
  ['tsl-menu-checkbox-item', TesselMenuCheckboxItem],
  ['tsl-menu-separator', TesselMenuSeparator],
]) {
  if (!customElements.get(tag)) customElements.define(tag, cls);
}

export class TesselMenuButton extends TesselElement {
  static styles = ':host{display:inline-flex;}';
  static observedAttributes = ['label', 'icon', 'open', 'disabled', 'variant'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) { this._menu.refresh(); return; }
    this._built = true;

    const trigger = h('slot', '', { name: 'trigger' });
    trigger.addEventListener('click', () => this._toggleTrigger());
    this._defaultTrigger = h('tsl-button', '', { variant: 'standard', 'aria-haspopup': 'menu' });
    this._defaultTrigger.addEventListener('click', () => this._toggleTrigger());
    this._menu = createMenu(this, {
      anchor: () => this._anchor(),
      placement: () => (this.getAttribute('align') === 'right' ? 'bottom-end' : 'bottom-start'),
      onSelect: (child) => this.emit('select', { value: child.value }),
      onToggle: (child) => this.emit('change', { value: child.value, checked: child.checked }),
      onOpenChange: (open) => this.toggleAttribute('open', open),
    });
    this.shadowRoot.append(trigger, this._defaultTrigger, this._menu.popup);

    this._mo = new MutationObserver(() => this._menu.refresh());
    this._mo.observe(this, { childList: true, characterData: true, subtree: true });

    this._sync();
    this._menu.refresh();
  }

  disconnectedCallback() {
    this._mo?.disconnect();
    this._menu?.close();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === 'label' || name === 'icon' || name === 'disabled' || name === 'variant') this._sync();
  }

  _anchor() {
    return this.querySelector('[slot="trigger"]') || this._defaultTrigger;
  }

  _toggleTrigger() {
    if (this.disabled) return;
    if (this.open) this.close();
    else this.openMenu();
  }

  _sync() {
    const slotted = this.querySelector('[slot="trigger"]');
    this._defaultTrigger.hidden = !!slotted;
    if (slotted) return;
    this._defaultTrigger.textContent = this.getAttribute('label') || '';
    this._defaultTrigger.setAttribute('variant', this.getAttribute('variant') || (this.getAttribute('label') ? 'standard' : 'subtle'));
    const icon = this.getAttribute('icon');
    if (icon) this._defaultTrigger.setAttribute('icon', icon);
    else this._defaultTrigger.removeAttribute('icon');
    this._defaultTrigger.toggleAttribute('disabled', this.disabled);
  }

  openMenu() {
    if (!this.disabled) this._menu.open();
  }

  close() {
    this._menu.close();
  }

  get open() { return this.hasAttribute('open'); }
}

define('tsl-menu-button', TesselMenuButton);
