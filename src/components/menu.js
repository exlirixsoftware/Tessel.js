// <tsl-menu-button label="Options" icon="more">
//   <tsl-menu-item value="edit" icon="edit">Edit</tsl-menu-item>
//   <tsl-menu-separator></tsl-menu-separator>
//   <tsl-menu-checkbox-item value="hidden" checked>Show hidden files</tsl-menu-checkbox-item>
// </tsl-menu-button>
// Port of MenuPainting / TesselMenuUIs (12px icon-text gap, radius 4 row highlight, controlHover fill).

import { TesselElement, define, openAnimated, closeAnimated } from '../core/base-element.js';
import { createIcon, checkmarkSvg } from '../core/icons.js';
import { MOTION } from '../core/tokens.js';

const CLOSE_DURATION = parseInt(MOTION.fast, 10);

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

const STYLES = `
  :host{display:inline-flex;position:relative;}
  .popup{position:absolute;top:calc(100% + 4px);left:0;min-width:200px;z-index:1000;background:var(--tsl-surface);
    border:1px solid var(--tsl-border);border-radius:var(--tsl-radius-md);box-shadow:0 8px 24px var(--tsl-shadow);
    padding:4px;display:none;opacity:0;transform:translateY(-4px) scale(0.98);transform-origin:top left;
    transition:opacity var(--tsl-duration-fast) var(--tsl-ease), transform var(--tsl-duration-fast) var(--tsl-ease);}
  :host([align="right"]) .popup{left:auto;right:0;transform-origin:top right;}
  :host([open]) .popup{display:block;}
  :host([visible]) .popup{opacity:1;transform:translateY(0) scale(1);}
  .row{position:relative;display:flex;align-items:center;gap:12px;min-height:32px;padding:6px 10px;
    border-radius:var(--tsl-radius-sm);color:var(--tsl-text);font-size:14px;cursor:pointer;background:transparent;
    border:none;width:100%;text-align:left;font:inherit;transition:background var(--tsl-duration-fast) var(--tsl-ease);}
  .row:hover{background:var(--tsl-control-hover);}
  .row .icon{flex:none;display:flex;color:var(--tsl-text-secondary);width:16px;}
  .row .label{flex:1;min-width:0;}
  .row .check{flex:none;color:var(--tsl-accent);opacity:0;width:16px;display:flex;}
  .row[aria-checked="true"] .check{opacity:1;}
  .row[aria-disabled="true"]{opacity:var(--tsl-disabled-alpha);pointer-events:none;}
  .sep{height:1px;background:var(--tsl-border);margin:4px 6px;}
`;

export class TesselMenuButton extends TesselElement {
  static styles = STYLES;
  static observedAttributes = ['label', 'icon', 'open', 'disabled'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) { this._readItems(); return; }
    this._built = true;

    const trigger = document.createElement('slot');
    trigger.name = 'trigger';
    trigger.addEventListener('click', () => this._toggleTrigger());

    this._defaultTrigger = document.createElement('tsl-button');
    this._defaultTrigger.setAttribute('variant', 'standard');
    this._defaultTrigger.addEventListener('click', () => this._toggleTrigger());

    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.setAttribute('role', 'menu');

    this.shadowRoot.append(trigger, this._defaultTrigger, popup);
    this._popup = popup;

    this._onDocPointer = (e) => {
      if (!this.contains(e.target) && !this.shadowRoot.contains(e.target)) this.close();
    };

    this._mo = new MutationObserver(() => this._readItems());
    this._mo.observe(this, { childList: true, characterData: true, subtree: true });

    this._sync();
    this._readItems();
  }

  disconnectedCallback() {
    document.removeEventListener('pointerdown', this._onDocPointer);
    this._mo?.disconnect();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === 'label' || name === 'icon' || name === 'disabled') this._sync();
  }

  _toggleTrigger() {
    if (this.disabled) return;
    this.open ? this.close() : this.openMenu();
  }

  _sync() {
    const hasSlotted = this.querySelector('[slot="trigger"]');
    this._defaultTrigger.style.display = hasSlotted ? 'none' : '';
    if (!hasSlotted) {
      this._defaultTrigger.textContent = this.getAttribute('label') || '';
      const icon = this.getAttribute('icon');
      if (icon) this._defaultTrigger.setAttribute('icon', icon);
      this._defaultTrigger.disabled = this.disabled;
    }
  }

  _menuChildren() {
    return Array.from(this.children).filter(
      (c) => c instanceof TesselMenuItem || c instanceof TesselMenuSeparator,
    );
  }

  _readItems() {
    this._popup.innerHTML = '';
    for (const child of this._menuChildren()) {
      if (child instanceof TesselMenuSeparator) {
        const sep = document.createElement('div');
        sep.className = 'sep';
        this._popup.appendChild(sep);
        continue;
      }
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'row';
      row.setAttribute('role', child instanceof TesselMenuCheckboxItem ? 'menuitemcheckbox' : 'menuitem');
      if (child.hasAttribute('disabled')) row.setAttribute('aria-disabled', 'true');
      const icon = document.createElement('span');
      icon.className = 'icon';
      if (child.icon) icon.appendChild(createIcon(child.icon, 16));
      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = child.label;
      const check = document.createElement('span');
      check.className = 'check';
      check.innerHTML = checkmarkSvg(14, 2);
      row.append(icon, label, check);

      if (child instanceof TesselMenuCheckboxItem) {
        row.setAttribute('aria-checked', String(child.checked));
        row.addEventListener('click', () => {
          if (child.hasAttribute('disabled')) return;
          child.checked = !child.checked;
          row.setAttribute('aria-checked', String(child.checked));
          this.emit('change', { value: child.value, checked: child.checked });
        });
      } else {
        row.addEventListener('click', () => {
          if (child.hasAttribute('disabled')) return;
          this.emit('select', { value: child.value });
          this.close();
        });
      }
      this._popup.appendChild(row);
    }
  }

  openMenu() {
    if (this.disabled) return;
    openAnimated(this);
    document.addEventListener('pointerdown', this._onDocPointer);
  }

  close() {
    closeAnimated(this, CLOSE_DURATION);
    document.removeEventListener('pointerdown', this._onDocPointer);
  }

  get open() { return this.hasAttribute('open'); }
}

define('tsl-menu-button', TesselMenuButton);
