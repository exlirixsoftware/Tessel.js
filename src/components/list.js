// <tsl-list><tsl-list-item value="a">A</tsl-list-item>...</tsl-list> — port of TesselListUI and Tessel.NET's ListBox
// (row highlight radius 4, selected = subtle fill + 3px accent indicator bar, hover = controlHover fill).

import { TesselElement, define } from '../core/base-element.js';
import { h, cx } from '../core/dom.js';

const ROW = 'relative mx-1 my-px flex min-h-9 cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2 text-body text-text '
  + 'transition-colors duration-fast ease-tessel focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent';
const ROW_IDLE = 'hover:bg-control-hover';
const ROW_SELECTED = 'bg-subtle before:absolute before:-left-[3px] before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-[1.5px] before:bg-accent';

export class TesselListItem extends TesselElement {
  static styles = ':host{display:block;}';
  static observedAttributes = ['selected', 'disabled'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._row = h('div', ROW, { role: 'option', tabindex: '-1' }, h('slot'));
    this.shadowRoot.appendChild(this._row);
    this._row.addEventListener('click', () => {
      if (this.disabled) return;
      this.dispatchEvent(new CustomEvent('tsl-item-click', { bubbles: true, composed: true, detail: { value: this.value } }));
    });
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    this._row.className = cx(ROW, this.selected ? ROW_SELECTED : ROW_IDLE, this.disabled && 'pointer-events-none opacity-45');
    this._row.setAttribute('aria-selected', this.selected ? 'true' : 'false');
  }

  focusRow() { this._row?.focus(); }

  get value() { return this.getAttribute('value') ?? this.textContent.trim(); }
  set value(v) { this.setAttribute('value', v); }

  get selected() { return this.hasAttribute('selected'); }
  set selected(v) { this.toggleAttribute('selected', !!v); }
}

export class TesselList extends TesselElement {
  static styles = ':host{display:block;padding:4px 0;border-radius:var(--tsl-radius-md);background:var(--tsl-surface);border:1px solid var(--tsl-border);overflow:auto;}';
  static observedAttributes = ['value'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) { this._applySelection(); return; }
    this._built = true;
    this.shadowRoot.appendChild(h('slot'));
    this.setAttribute('role', 'listbox');
    this.addEventListener('tsl-item-click', (e) => {
      this.value = e.detail.value;
      this.emit('change', { value: this.value });
    });
    // Roving focus: arrow keys move through the enabled items; Enter/Space pick the focused one.
    this.addEventListener('keydown', (e) => {
      const items = this._items().filter((i) => !i.disabled);
      const at = items.findIndex((i) => i.matches(':focus-within'));
      const move = { ArrowDown: 1, ArrowUp: -1 }[e.key];
      if (move) {
        e.preventDefault();
        (items[at < 0 ? (move > 0 ? 0 : items.length - 1) : (at + move + items.length) % items.length])?.focusRow();
      } else if ((e.key === 'Enter' || e.key === ' ') && at >= 0) {
        e.preventDefault();
        items[at]._row.click();
      }
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
    const items = this._items();
    for (const item of items) item.selected = item.value === value;
    // Make exactly one row tabbable so the list is one Tab stop.
    const tabbable = items.find((i) => i.selected) || items.find((i) => !i.disabled);
    for (const item of items) item._row?.setAttribute('tabindex', item === tabbable ? '0' : '-1');
  }

  get value() { return this.getAttribute('value') || ''; }
  set value(v) { this.setAttribute('value', v); }
}

define('tsl-list-item', TesselListItem);
define('tsl-list', TesselList);
