// <tsl-auto-suggest placeholder="Search…" icon="search" header="City" [local]>
// Port of Tessel.NET's AutoSuggestBox: a text box with a drop-down of suggestions. Feed it from the
// `text-changed` event (set `box.suggestions = [...]` — strings or { label, value }), or add `local` to give it
// the full list once and let it filter by what's typed.
//   text-changed      { text, reason: 'user' | 'programmatic' | 'suggestion' }
//   suggestion-chosen { suggestion }
//   query-submitted   { text, suggestion }    (Enter, or clicking a suggestion)
// Up/Down move through the list, Enter submits, Escape closes.

import { TesselElement, define } from '../core/base-element.js';
import { createIcon } from '../core/icons.js';
import { h, cx } from '../core/dom.js';
import { openPopup, closePopup, repositionPopup, popupIsOpen, POPUP_BASE } from '../core/popup.js';

const HEADER = 'mb-1.5 block text-body font-medium text-text';
const FIELD = 'relative flex h-8 w-full items-center gap-2 overflow-hidden rounded-md border border-border bg-input px-2.5 transition-colors duration-fast ease-tessel '
  + 'hover:border-border-strong focus-within:border-accent hover:focus-within:border-accent host-[disabled]:pointer-events-none host-[disabled]:opacity-45 '
  + 'after:absolute after:inset-x-px after:bottom-0 after:h-0 after:bg-accent after:transition-[height] after:duration-fast after:ease-tessel focus-within:after:h-0.5';
const POPUP = `${POPUP_BASE} z-50 max-h-64 rounded-md p-1 shadow-card scrollbar-thin`;
const ROW = 'flex min-h-8 cursor-pointer items-center gap-2 rounded-sm px-2.5 py-1.5 text-body text-text transition-colors duration-fast';

const norm = (s) => (typeof s === 'string' ? { label: s, value: s } : { value: s.label, ...s });

export class TesselAutoSuggest extends TesselElement {
  static styles = ':host{display:inline-flex;flex-direction:column;width:260px;}';
  static observedAttributes = ['placeholder', 'icon', 'header', 'value', 'disabled', 'local'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._all = [];
    this._shown = [];
    this._active = -1;
    this._header = h('label', HEADER);
    this._icon = h('span', 'flex flex-none text-text-secondary');
    this._input = h('input', 'h-full min-w-0 flex-1 bg-transparent p-0 text-body text-text outline-none placeholder:text-text-tertiary', {
      type: 'text', role: 'combobox', autocomplete: 'off', 'aria-autocomplete': 'list', 'aria-expanded': 'false',
    });
    this._field = h('div', FIELD, null, this._icon, this._input);
    this._popup = h('div', POPUP, { popover: 'manual', role: 'listbox' });
    this.shadowRoot.append(this._header, this._field, this._popup);

    this._input.addEventListener('input', () => {
      this.setAttribute('value', this._input.value);
      this._textChanged('user');
    });
    this._input.addEventListener('keydown', (e) => this._onKeydown(e));
    this._input.addEventListener('focus', () => { if (this._shown.length && this._input.value) this._open(); });
    this._sync();
  }

  disconnectedCallback() {
    if (this._popup) closePopup(this._popup);
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === 'value' && this._input.value !== (newV ?? '')) {
      this._input.value = newV ?? '';
      this._textChanged('programmatic');
    } else this._sync();
  }

  _sync() {
    this._input.placeholder = this.getAttribute('placeholder') || '';
    this._input.disabled = this.disabled;
    if (this.hasAttribute('value') && this._input.value !== this.getAttribute('value')) this._input.value = this.getAttribute('value');
    const icon = this.getAttribute('icon');
    this._icon.replaceChildren(createIcon(icon || 'search', 16));
    this._header.textContent = this.getAttribute('header') || '';
    this._header.hidden = !this.hasAttribute('header');
  }

  /** Suggestions to show: strings or { label, value, icon? } objects. */
  get suggestions() { return this._all; }
  set suggestions(list) {
    this._all = (list || []).map(norm);
    this._refresh();
  }

  get value() { return this._input ? this._input.value : this.getAttribute('value') || ''; }
  set value(v) { this.setAttribute('value', v); }

  focus(options) { this._input?.focus(options); }

  _textChanged(reason) {
    this.emit('text-changed', { text: this._input.value, reason });
    this._refresh();
  }

  _refresh() {
    if (!this._built) return;
    const text = this._input.value.trim().toLowerCase();
    this._shown = this.hasAttribute('local') ? this._all.filter((s) => s.label.toLowerCase().includes(text)) : this._all;
    this._active = -1;
    this._renderList();
    if (this._shown.length && text && this.shadowRoot.activeElement === this._input) this._open();
    else if (!this._shown.length) this._close();
  }

  _renderList() {
    const text = this._input.value.trim();
    this._popup.replaceChildren(...this._shown.map((s, i) => {
      const row = h('div', cx(ROW, i === this._active ? 'bg-control-hover' : 'hover:bg-control-hover'), { role: 'option', 'aria-selected': String(i === this._active) },
        s.icon && createIcon(s.icon, 16), this._highlight(s.label, text));
      row.addEventListener('mousedown', (e) => e.preventDefault()); // keep the caret in the input
      row.addEventListener('click', () => this._choose(s));
      return row;
    }));
    if (popupIsOpen(this._popup)) repositionPopup(this._popup);
  }

  /** Bold the typed part of a suggestion. */
  _highlight(label, text) {
    const at = text ? label.toLowerCase().indexOf(text.toLowerCase()) : -1;
    if (at < 0) return h('span', 'min-w-0 flex-1 truncate', null, label);
    return h('span', 'min-w-0 flex-1 truncate', null,
      label.slice(0, at), h('b', 'font-semibold', null, label.slice(at, at + text.length)), label.slice(at + text.length));
  }

  _choose(s) {
    this._input.value = s.label;
    this.setAttribute('value', s.label);
    this.emit('suggestion-chosen', { suggestion: s });
    this.emit('text-changed', { text: s.label, reason: 'suggestion' });
    this.emit('query-submitted', { text: s.label, suggestion: s });
    this._close();
  }

  _open() {
    if (!this._shown.length) return;
    this._input.setAttribute('aria-expanded', 'true');
    openPopup(this._popup, this._field, { matchWidth: true, owner: this, onDismiss: () => this._input.setAttribute('aria-expanded', 'false') });
  }

  _close() {
    closePopup(this._popup);
    this._input?.setAttribute('aria-expanded', 'false');
  }

  _onKeydown(e) {
    const open = popupIsOpen(this._popup);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!this._shown.length) return;
      e.preventDefault();
      if (!open) this._open();
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      this._active = (this._active + dir + this._shown.length) % this._shown.length;
      this._renderList();
      this._popup.children[this._active]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      const s = open ? this._shown[this._active] : null;
      if (s) this._choose(s);
      else { this.emit('query-submitted', { text: this._input.value, suggestion: null }); this._close(); }
    } else if (e.key === 'Escape' && open) {
      e.stopPropagation();
      this._close();
    }
  }
}

define('tsl-auto-suggest', TesselAutoSuggest);
