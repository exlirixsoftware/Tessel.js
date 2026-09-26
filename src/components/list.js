// <tsl-list><tsl-list-item value="a">A</tsl-list-item>...</tsl-list> — port of TesselListUI
// (row highlight radius 4, selected = subtle fill + 3px accent indicator bar, hover = controlHover fill).

import { TesselElement, define } from '../core/base-element.js';

const ITEM_STYLES = `
  :host{display:block;}
  .row{position:relative;display:flex;align-items:center;gap:10px;min-height:36px;margin:1px 4px;
    padding:8px 12px;border-radius:var(--tsl-radius-sm);color:var(--tsl-text);font-size:14px;cursor:pointer;
    transition:background var(--tsl-duration-fast) var(--tsl-ease);}
  .row:hover{background:var(--tsl-control-hover);}
  :host([selected]) .row{background:var(--tsl-subtle);}
  :host([selected]) .row::before{content:"";position:absolute;left:-3px;top:6px;bottom:6px;width:3px;
    border-radius:1.5px;background:var(--tsl-accent);}
  :host([disabled]) .row{opacity:var(--tsl-disabled-alpha);pointer-events:none;}
`;

export class TesselListItem extends TesselElement {
  static styles = ITEM_STYLES;

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const row = document.createElement('div');
    row.className = 'row';
    row.setAttribute('role', 'option');
    row.appendChild(document.createElement('slot'));
    this.shadowRoot.appendChild(row);
    row.addEventListener('click', () => {
      if (this.disabled) return;
      this.dispatchEvent(new CustomEvent('tsl-item-click', { bubbles: true, composed: true, detail: { value: this.value } }));
    });
  }

  get value() { return this.getAttribute('value') ?? this.textContent.trim(); }
  set value(v) { this.setAttribute('value', v); }

  get selected() { return this.hasAttribute('selected'); }
  set selected(v) { this.toggleAttribute('selected', !!v); }
}

const LIST_STYLES = `
  :host{display:block;padding:4px 0;border-radius:var(--tsl-radius-md);background:var(--tsl-surface);
    border:1px solid var(--tsl-border);overflow:auto;}
`;

export class TesselList extends TesselElement {
  static styles = LIST_STYLES;
  static observedAttributes = ['value'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) { this._applySelection(); return; }
    this._built = true;
    const slot = document.createElement('slot');
    this.shadowRoot.appendChild(slot);
    this.setAttribute('role', 'listbox');
    this.addEventListener('tsl-item-click', (e) => {
      this.value = e.detail.value;
      this.emit('change', { value: this.value });
    });
    this._applySelection();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built && name === 'value') this._applySelection();
  }

  _items() {
    return Array.from(this.children).filter((c) => c instanceof TesselListItem);
  }

  _applySelection() {
    const value = this.getAttribute('value');
    for (const item of this._items()) item.selected = item.value === value;
  }

  get value() { return this.getAttribute('value') || ''; }
  set value(v) { this.setAttribute('value', v); }
}

define('tsl-list-item', TesselListItem);
define('tsl-list', TesselList);
