// <tsl-nav-view app-title="My App">
//   <tsl-theme-toggle slot="topbar-actions"></tsl-theme-toggle>
//   <tsl-nav-item value="home" icon="home" selected>Home</tsl-nav-item>
//   <tsl-nav-header>Section</tsl-nav-header>
//   <tsl-nav-item value="settings" icon="settings" footer>Settings</tsl-nav-item>
//   <tsl-nav-page value="home">...page content...</tsl-nav-page>
//   <tsl-nav-page value="settings">...page content...</tsl-nav-page>
// </tsl-nav-view>
// Port of components/NavigationView.java (260px open / 56px compact pane, 44px item rows, 3px accent
// indicator, 220ms cubic ease-out page cross-fade + 16px slide).

import { TesselElement, define } from '../core/base-element.js';
import { createIcon, chevronSvg } from '../core/icons.js';

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

const STYLES = `
  :host{display:block;height:100%;}
  .shell{display:flex;flex-direction:column;height:100%;background:var(--tsl-background);}
  .topbar{display:flex;align-items:center;gap:12px;height:52px;padding:0 8px;flex:none;}
  .toggle{display:flex;align-items:center;justify-content:center;width:36px;height:36px;flex:none;
    border-radius:var(--tsl-radius-sm);border:none;background:transparent;color:var(--tsl-text);cursor:pointer;}
  .toggle:hover{background:var(--tsl-control-hover);}
  .title{flex:1;min-width:0;font-size:14px;font-weight:600;color:var(--tsl-text);white-space:nowrap;
    overflow:hidden;text-overflow:ellipsis;}
  .topbar-actions{display:flex;align-items:center;gap:4px;flex:none;}
  .body{display:flex;flex:1;min-height:0;}
  .pane{position:relative;display:flex;flex-direction:column;flex:none;width:260px;padding:4px 8px;
    overflow-y:auto;overflow-x:hidden;transition:width var(--tsl-duration-slow) var(--tsl-ease);}
  :host([compact]) .pane{width:56px;}
  .rail-indicator{position:absolute;top:0;left:8px;width:3px;height:16px;border-radius:1.5px;
    background:var(--tsl-accent);opacity:0;pointer-events:none;
    transition:transform var(--tsl-duration-base) var(--tsl-ease), opacity var(--tsl-duration-fast) var(--tsl-ease);}
  .pane-header{padding:4px 8px 8px;}
  .items{display:flex;flex-direction:column;gap:2px;flex:1;}
  .footer-items{display:flex;flex-direction:column;gap:2px;margin-top:auto;padding-top:8px;}
  .header-row{display:flex;align-items:center;height:36px;padding:0 12px;font-size:12px;font-weight:600;
    color:var(--tsl-text-secondary);white-space:nowrap;overflow:hidden;}
  :host([compact]) .header-row{padding:0;margin:8px 4px;height:1px;background:var(--tsl-border);}
  :host([compact]) .header-row span{display:none;}
  .item{position:relative;display:flex;align-items:center;gap:0;height:44px;padding:0;border-radius:var(--tsl-radius-sm);
    color:var(--tsl-text-secondary);cursor:pointer;font-size:14px;background:transparent;border:none;font:inherit;
    text-align:left;width:100%;margin:2px 0;
    transition:background var(--tsl-duration-fast) var(--tsl-ease), color var(--tsl-duration-fast) var(--tsl-ease);}
  .item:hover{background:var(--tsl-control-hover);color:var(--tsl-text);}
  .item[aria-current="true"]{background:var(--tsl-subtle);color:var(--tsl-text);}
  .item .icon-col{flex:none;width:40px;display:flex;align-items:center;justify-content:center;}
  .item .label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  :host([compact]) .item .label{display:none;}
  .item[aria-disabled="true"]{opacity:var(--tsl-disabled-alpha);pointer-events:none;}
  .content{flex:1;min-width:0;overflow:auto;background:var(--tsl-surface);border:1px solid var(--tsl-border);
    border-radius:var(--tsl-radius-lg) 0 0 0;padding:24px;}
  ::slotted(tsl-nav-page:not([hidden])){display:block;animation:tsl-nav-page-in var(--tsl-duration-slow) var(--tsl-ease);}
  @keyframes tsl-nav-page-in{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
`;

export class TesselNavView extends TesselElement {
  static styles = STYLES;
  static observedAttributes = ['app-title', 'value', 'compact'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) { this._readChildren(); return; }
    this._built = true;

    const shell = document.createElement('div');
    shell.className = 'shell';

    const topbar = document.createElement('div');
    topbar.className = 'topbar';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'toggle';
    toggle.innerHTML = createIcon('global-nav', 18).outerHTML;
    toggle.addEventListener('click', () => this.toggleAttribute('compact'));
    this._titleEl = document.createElement('span');
    this._titleEl.className = 'title';
    const topbarActions = document.createElement('span');
    topbarActions.className = 'topbar-actions';
    topbarActions.appendChild(document.createElement('slot')).name = 'topbar-actions';
    topbar.append(toggle, this._titleEl, topbarActions);

    const body = document.createElement('div');
    body.className = 'body';
    const pane = document.createElement('nav');
    pane.className = 'pane';
    const paneHeader = document.createElement('div');
    paneHeader.className = 'pane-header';
    paneHeader.appendChild(document.createElement('slot')).name = 'pane-header';
    this._items = document.createElement('div');
    this._items.className = 'items';
    this._footerItems = document.createElement('div');
    this._footerItems.className = 'footer-items';
    this._indicator = document.createElement('div');
    this._indicator.className = 'rail-indicator';
    pane.append(paneHeader, this._items, this._footerItems, this._indicator);

    const content = document.createElement('div');
    content.className = 'content';
    content.appendChild(document.createElement('slot'));

    body.append(pane, content);
    shell.append(topbar, body);
    this.shadowRoot.appendChild(shell);

    this._mo = new MutationObserver(() => this._readChildren());
    this._mo.observe(this, { childList: true, characterData: true, subtree: true });

    this._sync();
    this._readChildren();
  }

  disconnectedCallback() {
    this._mo?.disconnect();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === 'app-title') this._sync();
    if (name === 'value') this._render();
  }

  _sync() {
    this._titleEl.textContent = this.getAttribute('app-title') || '';
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
      const firstItem = children.find((c) => c instanceof TesselNavItem);
      if (firstItem) this.setAttribute('value', firstItem.value);
    }
    this._items.innerHTML = '';
    this._footerItems.innerHTML = '';
    for (const child of children) {
      const target = child instanceof TesselNavItem && child.footer ? this._footerItems : this._items;
      target.appendChild(this._buildRow(child));
    }
    this._render(true);
  }

  _buildRow(child) {
    if (child instanceof TesselNavHeader) {
      const row = document.createElement('div');
      row.className = 'header-row';
      const span = document.createElement('span');
      span.textContent = child.label;
      row.appendChild(span);
      return row;
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'item';
    btn.title = child.label;
    btn.dataset.value = child.value;
    if (child.hasAttribute('disabled')) btn.setAttribute('aria-disabled', 'true');
    const iconCol = document.createElement('span');
    iconCol.className = 'icon-col';
    if (child.icon) iconCol.appendChild(createIcon(child.icon, 20));
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = child.label;
    btn.append(iconCol, label);
    btn.addEventListener('click', () => {
      if (child.hasAttribute('disabled')) return;
      this.value = child.value;
      this.emit('change', { value: child.value });
    });
    return btn;
  }

  _render(skipAnimation = false) {
    const value = this.getAttribute('value');
    let currentBtn = null;
    for (const row of this.shadowRoot.querySelectorAll('.item')) {
      const isCurrent = row.dataset.value === value;
      row.setAttribute('aria-current', String(isCurrent));
      if (isCurrent) currentBtn = row;
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
    this._moveIndicator(currentBtn, skipAnimation);
  }

  _moveIndicator(btn, skipAnimation) {
    const indicator = this._indicator;
    if (!btn) { indicator.style.opacity = '0'; return; }
    const prevTransition = indicator.style.transition;
    if (skipAnimation) indicator.style.transition = 'none';
    const top = btn.offsetTop + (btn.offsetHeight - 16) / 2;
    indicator.style.transform = `translateY(${top}px)`;
    indicator.style.opacity = '1';
    if (skipAnimation) {
      indicator.getBoundingClientRect();
      indicator.style.transition = prevTransition;
    }
  }

  get value() { return this.getAttribute('value') || ''; }
  set value(v) { this.setAttribute('value', v); }
}

define('tsl-nav-view', TesselNavView);
