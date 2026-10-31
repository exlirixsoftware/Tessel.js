// <tsl-nav-view app-title="My App">
//   <tsl-theme-toggle slot="topbar-actions"></tsl-theme-toggle>
//   <tsl-nav-item value="home" icon="home" selected>Home</tsl-nav-item>
//   <tsl-nav-header>Section</tsl-nav-header>
//   <tsl-nav-item value="settings" icon="settings" footer>Settings</tsl-nav-item>
//   <tsl-nav-page value="home">...page content...</tsl-nav-page>
//   <tsl-nav-page value="settings">...page content...</tsl-nav-page>
// </tsl-nav-view>
// Port of components/NavigationView.java and Tessel.NET's NavigationView (260px open / 56px compact pane,
// 44px item rows, 3px accent indicator, 220ms cubic ease-out page cross-fade + 16px slide). Below 720px
// the pane turns into a slide-over drawer (Tessel.NET's "minimal" display mode) so phones keep the content.

import { TesselElement, define } from '../core/base-element.js';
import { createIcon } from '../core/icons.js';
import { h, cx } from '../core/dom.js';

export class TesselNavItem extends HTMLElement {
  connectedCallback() { this.hidden = true; }
  get value() { return this.getAttribute('value') ?? ''; }
  get icon() { return this.getAttribute('icon'); }
  get footer() { return this.hasAttribute('footer'); }
  get label() { return this.textContent.trim(); }
}
export class TesselNavHeader extends HTMLElement {
  connectedCallback() { this.hidden = true; }
  get label() { return this.textContent.trim(); }
}
export class TesselNavPage extends HTMLElement {
  get value() { return this.getAttribute('value') ?? ''; }
}
for (const [tag, cls] of [['tsl-nav-item', TesselNavItem], ['tsl-nav-header', TesselNavHeader], ['tsl-nav-page', TesselNavPage]]) {
  if (!customElements.get(tag)) customElements.define(tag, cls);
}

const NARROW_PX = 720;
const TOGGLE = 'flex size-9 flex-none cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent text-text '
  + 'hover:bg-control-hover focus-visible:outline-2 focus-visible:outline-accent';
const ITEM = 'relative my-0.5 flex h-11 w-full cursor-pointer items-center rounded-sm border-0 bg-transparent p-0 text-left text-body '
  + 'transition-colors duration-fast ease-tessel hover:bg-control-hover hover:text-text focus-visible:outline-2 focus-visible:-outline-offset-2 '
  + 'focus-visible:outline-accent aria-disabled:pointer-events-none aria-disabled:opacity-45';

export class TesselNavView extends TesselElement {
  static styles = `:host{display:block;height:100%;}
    ::slotted(tsl-nav-page:not([hidden])){display:block;animation:tsl-page-in var(--tsl-duration-slow) var(--tsl-ease);}`;
  static observedAttributes = ['app-title', 'value', 'compact'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) { this._readChildren(); return; }
    this._built = true;

    this._toggle = h('button', TOGGLE, { type: 'button', 'aria-label': 'Toggle navigation pane' }, createIcon('global-nav', 18));
    this._toggle.addEventListener('click', () => {
      if (this._narrow) this._setDrawer(!this._drawerOpen);
      else this.toggleAttribute('compact');
    });
    this._titleEl = h('span', 'min-w-0 flex-1 truncate text-body font-semibold text-text');
    const topbar = h('div', 'flex h-[52px] flex-none items-center gap-3 px-2', null,
      this._toggle, this._titleEl,
      h('span', 'flex flex-none items-center gap-1', null, h('slot', '', { name: 'topbar-actions' })));

    this._items = h('div', 'flex flex-1 flex-col gap-0.5');
    this._footerItems = h('div', 'mt-auto flex flex-col gap-0.5 pt-2');
    this._indicator = h('div', 'pointer-events-none absolute left-2 top-0 h-4 w-[3px] rounded-[1.5px] bg-accent opacity-0 transition-[transform,opacity] duration-base ease-tessel');
    this._pane = h('nav', '', { 'aria-label': 'Navigation' },
      h('div', 'px-2 pb-2 pt-1', null, h('slot', '', { name: 'pane-header' })), this._items, this._footerItems, this._indicator);
    this._scrim = h('div', 'absolute inset-0 z-10 bg-overlay', { hidden: true });
    this._scrim.addEventListener('click', () => this._setDrawer(false));
    this._content = h('div', '', null, h('slot'));
    this._body = h('div', 'relative flex min-h-0 flex-1 overflow-hidden', null, this._scrim, this._pane, this._content);
    this.shadowRoot.appendChild(h('div', 'flex h-full flex-col bg-background', null, topbar, this._body));

    this._ro = new ResizeObserver(() => this._layout());
    this._ro.observe(this);
    this._mo = new MutationObserver(() => this._readChildren());
    this._mo.observe(this, { childList: true, characterData: true, subtree: true });

    this._layout();
    this._sync();
    this._readChildren();
  }

  disconnectedCallback() {
    this._mo?.disconnect();
    this._ro?.disconnect();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === 'app-title') this._sync();
    if (name === 'value') this._render();
    if (name === 'compact') { this._layout(); this._readChildren(); }
  }

  _sync() {
    this._titleEl.textContent = this.getAttribute('app-title') || '';
  }

  get _compact() { return this.hasAttribute('compact') && !this._narrow; }

  _setDrawer(open) {
    this._drawerOpen = open;
    this._layout();
  }

  _layout() {
    this._narrow = this.clientWidth > 0 && this.clientWidth < NARROW_PX;
    if (!this._narrow) this._drawerOpen = false;
    const PANE = 'flex flex-none flex-col overflow-y-auto overflow-x-hidden px-2 py-1';
    if (this._narrow) {
      this._pane.className = cx(PANE, 'absolute inset-y-0 left-0 z-20 w-65 bg-background shadow-flyout transition-transform duration-slow ease-tessel',
        this._drawerOpen ? 'translate-x-0' : '-translate-x-full invisible');
    } else {
      this._pane.className = cx(PANE, 'relative transition-[width] duration-slow ease-tessel', this._compact ? 'w-14' : 'w-65');
    }
    this._scrim.hidden = !(this._narrow && this._drawerOpen);
    this._content.className = cx('min-w-0 flex-1 overflow-auto border border-border bg-surface p-6',
      this._narrow ? 'rounded-none border-x-0' : 'rounded-tl-lg');
    this._toggle.setAttribute('aria-expanded', String(this._narrow ? this._drawerOpen : !this._compact));
    this._moveIndicator(this._currentBtn, true);
  }

  _paneChildren() {
    return Array.from(this.children).filter((c) => c instanceof TesselNavItem || c instanceof TesselNavHeader);
  }
  _pages() {
    return Array.from(this.children).filter((c) => c instanceof TesselNavPage);
  }

  _readChildren() {
    const children = this._paneChildren();
    if (!this.hasAttribute('value')) {
      const first = children.find((c) => c instanceof TesselNavItem && c.hasAttribute('selected')) || children.find((c) => c instanceof TesselNavItem);
      if (first) this.setAttribute('value', first.value);
    }
    this._items.replaceChildren();
    this._footerItems.replaceChildren();
    for (const child of children) {
      const target = child instanceof TesselNavItem && child.footer ? this._footerItems : this._items;
      target.appendChild(this._buildRow(child));
    }
    this._render(true);
  }

  _buildRow(child) {
    if (child instanceof TesselNavHeader) {
      return this._compact
        ? h('div', 'mx-1 my-2 h-px bg-border', { role: 'separator' })
        : h('div', 'flex h-9 items-center overflow-hidden whitespace-nowrap px-3 text-caption font-semibold text-text-secondary', null, child.label);
    }
    const btn = h('button', ITEM, {
      type: 'button',
      title: this._compact ? child.label : null,
      'data-value': child.value,
      'aria-disabled': child.hasAttribute('disabled') ? 'true' : null,
    },
    h('span', 'flex w-10 flex-none items-center justify-center', null, child.icon ? createIcon(child.icon, 20) : null),
    !this._compact && h('span', 'min-w-0 flex-1 truncate', null, child.label));
    btn.addEventListener('click', () => {
      if (child.hasAttribute('disabled')) return;
      this.value = child.value;
      this.emit('change', { value: child.value });
      if (this._narrow) this._setDrawer(false);
    });
    return btn;
  }

  _render(skipAnimation = false) {
    const value = this.getAttribute('value');
    this._currentBtn = null;
    for (const row of this._pane.querySelectorAll('button[data-value]')) {
      const isCurrent = row.dataset.value === value;
      row.setAttribute('aria-current', isCurrent ? 'page' : 'false');
      row.classList.toggle('bg-subtle', isCurrent);
      row.classList.toggle('text-text', isCurrent);
      row.classList.toggle('text-text-secondary', !isCurrent);
      if (isCurrent) this._currentBtn = row;
    }
    for (const page of this._pages()) {
      const shouldShow = page.value === value;
      if (shouldShow && !this._everShownPage) {
        // First page ever shown: skip the slide/fade-in — only actual navigations should animate,
        // not the initial page load.
        page.style.animation = 'none';
        page.hidden = false;
        page.getBoundingClientRect();
        page.style.animation = '';
      } else {
        page.hidden = !shouldShow;
      }
    }
    this._everShownPage = true;
    this._moveIndicator(this._currentBtn, skipAnimation);
  }

  _moveIndicator(btn, skipAnimation) {
    const indicator = this._indicator;
    if (!btn || !btn.offsetHeight) { indicator.style.opacity = '0'; return; }
    indicator.style.transition = skipAnimation ? 'none' : '';
    indicator.style.transform = `translateY(${btn.offsetTop + (btn.offsetHeight - 16) / 2}px)`;
    indicator.style.opacity = '1';
    if (skipAnimation) {
      indicator.getBoundingClientRect();
      indicator.style.transition = '';
    }
  }

  get value() { return this.getAttribute('value') || ''; }
  set value(v) { this.setAttribute('value', v); }
}

define('tsl-nav-view', TesselNavView);
