// <tsl-tab-view value="a" addable reorderable>
//   <tsl-tab-view-item value="a" header="Home" icon="home" pinned>Home content</tsl-tab-view-item>
//   <tsl-tab-view-item value="b" header="Report.pdf">…</tsl-tab-view-item>
// </tsl-tab-view>
// Port of Tessel.NET's TabView / TabViewItem: document-style tabs with a close button (also middle-click),
// drag to reorder, an "add tab" button and a horizontally scrolling strip. The items are the panels.
// Events: `tab-close-requested` (cancelable — otherwise the tab is removed), `add-tab-click`, `change`.

import { TesselElement, define } from '../core/base-element.js';
import { createIcon, closeSvg } from '../core/icons.js';
import { h, html, cx } from '../core/dom.js';

export class TesselTabViewItem extends HTMLElement {
  get value() { return this.getAttribute('value') ?? this.getAttribute('header') ?? ''; }
  set value(v) { this.setAttribute('value', v); }
  get header() { return this.getAttribute('header') ?? ''; }
  get pinned() { return this.hasAttribute('pinned'); }
}
if (!customElements.get('tsl-tab-view-item')) customElements.define('tsl-tab-view-item', TesselTabViewItem);

const STRIP = 'flex min-w-0 items-end gap-0.5 overflow-x-auto overflow-y-hidden scrollbar-none';
const TAB = 'group relative flex h-9 max-w-52 min-w-24 flex-none cursor-pointer select-none items-center gap-2 rounded-t-lg border border-b-0 pl-3 pr-1.5 text-body '
  + 'transition-colors duration-fast ease-tessel focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent';
const TAB_ON = 'border-border bg-surface text-text';
const TAB_OFF = 'border-transparent bg-transparent text-text-secondary hover:bg-control-hover hover:text-text';
const CLOSE = 'flex size-5 flex-none cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 text-current transition-opacity duration-fast hover:bg-control-pressed';
const ADD = 'mb-1 ml-1 flex size-7 flex-none cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 text-text-secondary hover:bg-control-hover hover:text-text '
  + 'focus-visible:outline-2 focus-visible:outline-accent';

export class TesselTabView extends TesselElement {
  static styles = ':host{display:block;} ::slotted(tsl-tab-view-item:not([hidden])){display:block;}';
  static observedAttributes = ['value', 'addable', 'reorderable'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) { this._read(); return; }
    this._built = true;
    this._strip = h('div', STRIP, { role: 'tablist' });
    this._add = h('button', ADD, { type: 'button', 'aria-label': 'Add tab' }, createIcon('add', 16));
    this._add.addEventListener('click', () => this.emit('add-tab-click', {}));
    this._footer = h('slot', 'flex-none', { name: 'footer' });
    const bar = h('div', 'flex items-end border-b border-border px-1 pt-1', null,
      this._strip, this._add, h('div', 'flex-1'), this._footer);
    this.shadowRoot.append(bar, h('div', 'rounded-b-lg border border-t-0 border-border bg-surface p-4', null, h('slot')));
    this._strip.addEventListener('keydown', (e) => this._onKeydown(e));

    this._mo = new MutationObserver(() => this._read());
    this._mo.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ['header', 'icon', 'pinned'] });
    this._read();
  }

  disconnectedCallback() { this._mo?.disconnect(); }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === 'value') this._render();
    else this._read();
  }

  _items() { return Array.from(this.children).filter((c) => c instanceof TesselTabViewItem); }

  _read() {
    const items = this._items();
    if (!items.some((i) => i.value === this.getAttribute('value')) && items[0]) this.setAttribute('value', items[0].value);
    this._add.hidden = !this.hasAttribute('addable');
    this._strip.replaceChildren(...items.map((item) => this._buildTab(item)));
    this._render();
  }

  _buildTab(item) {
    const icon = item.getAttribute('icon');
    const close = html('button', CLOSE, closeSvg(10));
    close.type = 'button';
    close.tabIndex = -1;
    close.setAttribute('aria-label', `Close ${item.header}`);
    close.hidden = item.pinned;
    const tab = h('div', TAB, { role: 'tab', draggable: this.hasAttribute('reorderable') ? 'true' : null, title: item.header },
      icon && h('span', 'flex flex-none', null, createIcon(icon, 16)),
      h('span', 'min-w-0 flex-1 truncate', null, item.header),
      close);
    tab.addEventListener('click', (e) => {
      if (e.composedPath().includes(close)) return;
      this._select(item);
    });
    // Middle-click closes, like browser tabs.
    tab.addEventListener('auxclick', (e) => { if (e.button === 1 && !item.pinned) this._requestClose(item); });
    close.addEventListener('click', () => this._requestClose(item));
    if (this.hasAttribute('reorderable')) {
      tab.addEventListener('dragstart', (e) => { this._dragging = item; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', item.value); });
      tab.addEventListener('dragover', (e) => { if (this._dragging && this._dragging !== item) { e.preventDefault(); tab.classList.add('bg-control-hover'); } });
      tab.addEventListener('dragleave', () => tab.classList.remove('bg-control-hover'));
      tab.addEventListener('drop', (e) => {
        e.preventDefault();
        const from = this._dragging;
        this._dragging = null;
        if (!from || from === item) return;
        const before = from.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING;
        this.insertBefore(from, before ? item.nextElementSibling : item);
        this.emit('tabs-reordered', { value: from.value, index: this._items().indexOf(from) });
      });
      tab.addEventListener('dragend', () => { this._dragging = null; });
    }
    tab._item = item;
    return tab;
  }

  _select(item) {
    if (item.value === this.getAttribute('value')) return;
    this.setAttribute('value', item.value);
    this.emit('change', { value: item.value });
  }

  _requestClose(item) {
    if (!this.emit('tab-close-requested', { value: item.value, item })) return;
    const items = this._items();
    const at = items.indexOf(item);
    const wasCurrent = item.value === this.getAttribute('value');
    item.remove();
    if (wasCurrent) {
      const next = items[at + 1] || items[at - 1];
      if (next) this._select(next);
    }
  }

  _render() {
    const value = this.getAttribute('value');
    for (const tab of this._strip.children) {
      const on = tab._item.value === value;
      tab.className = cx(TAB, on ? TAB_ON : TAB_OFF);
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      // The close glyph shows on the current tab and on hover, like browser tabs.
      tab.lastElementChild.classList.toggle('opacity-0', !on);
      tab.lastElementChild.classList.toggle('group-hover:opacity-100', !on);
      if (on) tab.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    }
    for (const item of this._items()) {
      item.hidden = item.value !== value;
      item.setAttribute('role', 'tabpanel');
    }
  }

  _onKeydown(e) {
    const tabs = Array.from(this._strip.children);
    const at = tabs.indexOf(this.shadowRoot.activeElement);
    const to = { ArrowRight: at + 1, ArrowLeft: at - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (to != null && tabs.length) {
      e.preventDefault();
      const tab = tabs[(to + tabs.length) % tabs.length];
      tab.focus();
      this._select(tab._item);
    } else if (e.key === 'Delete' && at >= 0 && !tabs[at]._item.pinned) {
      this._requestClose(tabs[at]._item);
    }
  }

  /** Adds a tab and selects it. Returns the new <tsl-tab-view-item>. */
  addTab({ header = 'New tab', value = `tab-${Date.now()}`, icon, pinned = false, content = '' } = {}) {
    const item = document.createElement('tsl-tab-view-item');
    item.setAttribute('value', value);
    item.setAttribute('header', header);
    if (icon) item.setAttribute('icon', icon);
    if (pinned) item.setAttribute('pinned', '');
    if (content instanceof Node) item.append(content);
    else item.textContent = content;
    this.append(item);
    this._select(item);
    return item;
  }

  get value() { return this.getAttribute('value') || ''; }
  set value(v) { this.setAttribute('value', v); }
}

define('tsl-tab-view', TesselTabView);
