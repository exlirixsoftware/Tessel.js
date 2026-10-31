// <tsl-tabs value="a">
//   <tsl-tab value="a">Buttons</tsl-tab><tsl-tab value="b" icon="settings">Inputs</tsl-tab>
//   <tsl-tab-panel value="a">...</tsl-tab-panel><tsl-tab-panel value="b">...</tsl-tab-panel>
// </tsl-tabs>
// Port of TesselTabbedPaneUI and Tessel.NET's TabControl — bottom accent underline on the selected tab,
// hover highlight. Arrow keys / Home / End move between tabs (roving tabindex).

import { TesselElement, define } from '../core/base-element.js';
import { createIcon } from '../core/icons.js';
import { h } from '../core/dom.js';

export class TesselTab extends HTMLElement {
  connectedCallback() { this.hidden = true; }
  get value() { return this.getAttribute('value') ?? this.textContent.trim(); }
  set value(v) { this.setAttribute('value', v); }
  get label() { return this.textContent.trim(); }
}

export class TesselTabPanel extends HTMLElement {
  get value() { return this.getAttribute('value') ?? ''; }
}

if (!customElements.get('tsl-tab')) customElements.define('tsl-tab', TesselTab);
if (!customElements.get('tsl-tab-panel')) customElements.define('tsl-tab-panel', TesselTabPanel);

const STRIP = 'relative flex gap-0.5 border-b border-border';
const TAB = 'relative flex cursor-pointer items-center gap-2 rounded-t-sm border-0 bg-transparent px-3.5 py-2.5 text-body text-text-secondary '
  + 'transition-colors duration-fast ease-tessel hover:bg-control-hover hover:text-text '
  + 'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent '
  + 'aria-selected:text-text aria-disabled:pointer-events-none aria-disabled:opacity-45';
const INDICATOR = 'pointer-events-none absolute bottom-[-1px] left-0 h-[3px] w-0 rounded-[1.5px] bg-accent '
  + 'transition-[transform,width] duration-base ease-tessel';

export class TesselTabs extends TesselElement {
  static styles = ':host{display:block;} ::slotted(tsl-tab-panel:not([hidden])){display:block;}';
  static observedAttributes = ['value'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) { this._readTabs(); return; }
    this._built = true;
    this._indicator = h('div', INDICATOR);
    this._strip = h('div', STRIP, { role: 'tablist' }, this._indicator);
    this.shadowRoot.append(this._strip, h('div', 'pt-4', null, h('slot')));
    this._strip.addEventListener('keydown', (e) => this._onKeydown(e));

    this._mo = new MutationObserver(() => this._readTabs());
    this._mo.observe(this, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'icon'] });
    this._ro = new ResizeObserver(() => this._render(true));
    this._ro.observe(this._strip);
    this._readTabs();
  }

  disconnectedCallback() {
    this._mo?.disconnect();
    this._ro?.disconnect();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built && name === 'value') this._render();
  }

  _tabs() { return Array.from(this.children).filter((c) => c instanceof TesselTab); }
  _panels() { return Array.from(this.children).filter((c) => c instanceof TesselTabPanel); }
  _buttons() { return Array.from(this._strip.querySelectorAll('button')); }

  _readTabs() {
    const tabs = this._tabs();
    if (!this.hasAttribute('value') && tabs[0]) this.setAttribute('value', tabs[0].value);
    this._strip.replaceChildren(...tabs.map((tab) => {
      const icon = tab.getAttribute('icon');
      const btn = h('button', TAB, { type: 'button', role: 'tab', 'aria-disabled': tab.hasAttribute('disabled') ? 'true' : null },
        icon && createIcon(icon, 16), tab.label);
      btn.addEventListener('click', () => {
        if (tab.hasAttribute('disabled')) return;
        this.value = tab.value;
        this.emit('change', { value: tab.value });
      });
      return btn;
    }), this._indicator);
    this._render(true);
  }

  _render(skipAnimation = false) {
    const value = this.getAttribute('value');
    const tabs = this._tabs();
    let selectedBtn = null;
    this._buttons().forEach((btn, i) => {
      const selected = tabs[i]?.value === value;
      btn.setAttribute('aria-selected', String(selected));
      btn.tabIndex = selected ? 0 : -1;
      if (selected) selectedBtn = btn;
    });
    for (const panel of this._panels()) {
      panel.hidden = panel.value !== value;
      panel.setAttribute('role', 'tabpanel');
    }
    this._moveIndicator(selectedBtn, skipAnimation);
  }

  _onKeydown(e) {
    const buttons = this._buttons().filter((b) => b.getAttribute('aria-disabled') !== 'true');
    const at = buttons.indexOf(this.shadowRoot.activeElement);
    const to = { ArrowRight: at + 1, ArrowLeft: at - 1, Home: 0, End: buttons.length - 1 }[e.key];
    if (to == null || !buttons.length) return;
    e.preventDefault();
    const btn = buttons[(to + buttons.length) % buttons.length];
    btn.focus();
    btn.click();
  }

  _moveIndicator(btn, skipAnimation) {
    const indicator = this._indicator;
    if (!btn || !btn.offsetWidth) { indicator.style.width = '0'; return; }
    // The first placement (and re-placement after a resize) must not slide in from the old position.
    indicator.style.transition = skipAnimation ? 'none' : '';
    indicator.style.transform = `translateX(${btn.offsetLeft + 12}px)`;
    indicator.style.width = `${Math.max(0, btn.offsetWidth - 24)}px`;
    if (skipAnimation) {
      indicator.getBoundingClientRect();
      indicator.style.transition = '';
    }
  }

  get value() { return this.getAttribute('value') || ''; }
  set value(v) { this.setAttribute('value', v); }
}

define('tsl-tabs', TesselTabs);
