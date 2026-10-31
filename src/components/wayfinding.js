// Wayfinding controls ported from Tessel.NET's Wayfinding.xaml / Progress.xaml:
//   <tsl-breadcrumb><tsl-breadcrumb-item value="home">Home</tsl-breadcrumb-item>…</tsl-breadcrumb>
//   <tsl-pagination page="3" count="24" max-visible="7"></tsl-pagination>
//   <tsl-stepper current="1" [orientation="vertical"]><tsl-step header="Cart" description="…" [error]></tsl-step>…</tsl-stepper>

import { TesselElement, define } from '../core/base-element.js';
import { chevronSvg, checkmarkSvg, closeSvg } from '../core/icons.js';
import { h, html, cx } from '../core/dom.js';

// ---------------------------------------------------------------- <tsl-breadcrumb>

export class TesselBreadcrumbItem extends HTMLElement {
  connectedCallback() { this.hidden = true; }
  get value() { return this.getAttribute('value') ?? this.textContent.trim(); }
  get label() { return this.textContent.trim(); }
}
if (!customElements.get('tsl-breadcrumb-item')) customElements.define('tsl-breadcrumb-item', TesselBreadcrumbItem);

const CRUMB = 'cursor-pointer rounded-sm border-0 bg-transparent px-1.5 py-1 text-body text-text-secondary transition-colors duration-fast ease-tessel '
  + 'hover:bg-control-hover hover:text-text active:bg-control-pressed focus-visible:outline-2 focus-visible:outline-accent';

export class TesselBreadcrumb extends TesselElement {
  static styles = ':host{display:block;}';

  connectedCallback() {
    super.connectedCallback();
    if (this._built) { this._read(); return; }
    this._built = true;
    this._nav = h('nav', 'flex flex-wrap items-center gap-0.5', { 'aria-label': 'Breadcrumb' });
    this.shadowRoot.appendChild(this._nav);
    this._mo = new MutationObserver(() => this._read());
    this._mo.observe(this, { childList: true, characterData: true, subtree: true });
    this._read();
  }

  disconnectedCallback() { this._mo?.disconnect(); }

  _read() {
    const items = Array.from(this.children).filter((c) => c instanceof TesselBreadcrumbItem);
    this._nav.replaceChildren(...items.flatMap((item, index) => {
      const last = index === items.length - 1;
      const crumb = last
        ? h('span', 'px-1.5 py-1 text-body font-semibold text-text', { 'aria-current': 'page' }, item.label)
        : h('button', CRUMB, { type: 'button' }, item.label);
      if (!last) crumb.addEventListener('click', () => this.emit('item-click', { index, value: item.value, label: item.label }));
      return [crumb, !last && html('span', 'flex text-text-tertiary', chevronSvg('right', 10))];
    }));
  }
}

// ---------------------------------------------------------------- <tsl-pagination>

const PAGE = 'flex h-[34px] min-w-[34px] cursor-pointer items-center justify-center rounded-md border px-2 text-body transition-colors duration-fast ease-tessel '
  + 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-45';
const PAGE_IDLE = 'border-transparent bg-transparent text-text hover:bg-control-hover active:bg-control-pressed';
const PAGE_ON = 'border-accent bg-accent font-medium text-on-accent';

/** The 1-based page numbers to show; `null` entries are ellipses. Always includes first, last and the current page. */
export function pageWindow(page, count, maxVisible) {
  const total = Math.max(5, maxVisible);
  if (count <= total) return Array.from({ length: count }, (_, i) => i + 1);
  const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const sibling = Math.floor((total - 5) / 2);
  // The strip always has `total` slots, so it doesn't jump in width while paging.
  if (page <= 3 + sibling) return [...range(1, total - 2), null, count];
  if (page >= count - 2 - sibling) return [1, null, ...range(count - (total - 3), count)];
  return [1, null, ...range(page - sibling, page + sibling), null, count];
}

export class TesselPagination extends TesselElement {
  static styles = ':host{display:inline-block;}';
  static observedAttributes = ['page', 'count', 'max-visible'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._nav = h('nav', 'flex items-center gap-1', { 'aria-label': 'Pagination' });
    this.shadowRoot.appendChild(this._nav);
    this._render();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._render();
  }

  get count() { return Math.max(1, Number(this.getAttribute('count')) || 1); }
  get page() { return Math.min(this.count, Math.max(1, Number(this.getAttribute('page')) || 1)); }
  set page(v) { this.setAttribute('page', String(v)); }
  set count(v) { this.setAttribute('count', String(v)); }

  _go(page) {
    const next = Math.min(this.count, Math.max(1, page));
    if (next === this.page) return;
    this.page = next;
    this.emit('change', { page: next });
  }

  _render() {
    const { page, count } = this;
    const button = (content, label, onClick, { on = false, disabled = false } = {}) => {
      const b = h('button', cx(PAGE, on ? PAGE_ON : PAGE_IDLE), { type: 'button', 'aria-label': label, 'aria-current': on ? 'page' : null, disabled }, content);
      b.addEventListener('click', onClick);
      return b;
    };
    const arrow = (dir) => html('span', 'flex', chevronSvg(dir, 14));
    this._nav.replaceChildren(
      button(arrow('left'), 'Previous page', () => this._go(page - 1), { disabled: page <= 1 }),
      ...pageWindow(page, count, Number(this.getAttribute('max-visible')) || 7).map((p) => (p === null
        ? h('span', 'flex h-[34px] min-w-6 items-center justify-center text-text-tertiary', null, '…')
        : button(String(p), `Page ${p}`, () => this._go(p), { on: p === page }))),
      button(arrow('right'), 'Next page', () => this._go(page + 1), { disabled: page >= count }),
    );
  }
}

// ---------------------------------------------------------------- <tsl-stepper>

export class TesselStep extends HTMLElement {
  connectedCallback() { this.hidden = true; }
  get header() { return this.getAttribute('header') ?? ''; }
  get description() { return this.getAttribute('description') ?? ''; }
  get error() { return this.hasAttribute('error'); }
}
if (!customElements.get('tsl-step')) customElements.define('tsl-step', TesselStep);

const DOT = 'flex size-7 flex-none items-center justify-center rounded-full border-2 text-caption font-semibold transition-colors duration-base ease-tessel';
const STATE = {
  completed: 'border-accent bg-accent text-on-accent',
  current: 'border-accent bg-accent-subtle text-accent',
  pending: 'border-border-strong bg-transparent text-text-tertiary',
  error: 'border-danger bg-danger text-white',
};

export class TesselStepper extends TesselElement {
  static styles = ':host{display:block;}';
  static observedAttributes = ['current', 'orientation'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) { this._read(); return; }
    this._built = true;
    this._root = h('ol', '', { role: 'list' });
    this.shadowRoot.appendChild(this._root);
    this._mo = new MutationObserver(() => this._read());
    this._mo.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ['header', 'description', 'error'] });
    this._read();
  }

  disconnectedCallback() { this._mo?.disconnect(); }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._read();
  }

  get current() { return Number(this.getAttribute('current')) || 0; }
  set current(v) { this.setAttribute('current', String(v)); }

  /** Step state, computed from `current` (0-based) and each step's `error` flag. */
  stateOf(index, step) {
    if (step.error) return 'error';
    if (index < this.current) return 'completed';
    return index === this.current ? 'current' : 'pending';
  }

  _read() {
    const steps = Array.from(this.children).filter((c) => c instanceof TesselStep);
    const vertical = this.getAttribute('orientation') === 'vertical';
    this._root.className = vertical ? 'flex flex-col' : 'flex items-start';
    this._root.replaceChildren(...steps.map((step, i) => {
      const state = this.stateOf(i, step);
      const last = i === steps.length - 1;
      const glyph = state === 'completed' ? html('span', 'flex', checkmarkSvg(14, 2.4)) : state === 'error' ? html('span', 'flex', closeSvg(11)) : String(i + 1);
      const dot = h('span', cx(DOT, STATE[state]), { 'aria-hidden': 'true' }, glyph);
      const text = h('div', 'min-w-0', null,
        h('div', cx('text-body', state === 'pending' ? 'text-text-secondary' : 'font-medium text-text', state === 'error' && 'text-danger'), null, step.header),
        step.description && h('div', 'text-caption text-text-tertiary', null, step.description));
      const line = (cls) => h('span', cx('transition-colors duration-base', i < this.current && !step.error ? 'bg-accent' : 'bg-border-strong', cls), { 'aria-hidden': 'true' });
      const item = vertical
        ? h('li', 'flex gap-3', null,
          h('div', 'flex flex-col items-center', null, dot, !last && line('my-1 w-0.5 flex-1 min-h-6')),
          h('div', cx('pt-0.5', !last && 'pb-5'), null, text))
        : h('li', cx('flex items-start gap-2.5', !last && 'flex-1'), null,
          dot, h('div', 'pt-0.5', null, text), !last && line('mx-3 mt-3.5 h-0.5 flex-1 min-w-6'));
      if (state === 'current') item.setAttribute('aria-current', 'step');
      return item;
    }));
  }
}

define('tsl-breadcrumb', TesselBreadcrumb);
define('tsl-pagination', TesselPagination);
define('tsl-stepper', TesselStepper);
