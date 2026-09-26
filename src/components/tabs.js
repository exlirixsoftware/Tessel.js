// <tsl-tabs value="a">
//   <tsl-tab value="a">Buttons</tsl-tab><tsl-tab value="b">Inputs</tsl-tab>
//   <tsl-tab-panel value="a">...</tsl-tab-panel><tsl-tab-panel value="b">...</tsl-tab-panel>
// </tsl-tabs>
// Port of TesselTabbedPaneUI — bottom accent underline on the selected tab, hover pill highlight.

import { TesselElement, define } from '../core/base-element.js';

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

const STYLES = `
  :host{display:block;}
  .strip{position:relative;display:flex;gap:2px;border-bottom:1px solid var(--tsl-border);}
  .tab{position:relative;display:flex;align-items:center;padding:10px 14px;font-size:14px;
    color:var(--tsl-text-secondary);background:transparent;border:none;cursor:pointer;font:inherit;border-radius:4px 4px 0 0;
    transition:color var(--tsl-duration-fast) var(--tsl-ease), background var(--tsl-duration-fast) var(--tsl-ease);}
  .tab:hover{background:var(--tsl-control-hover);color:var(--tsl-text);}
  .tab[aria-selected="true"]{color:var(--tsl-text);}
  .tab:focus-visible{outline:2px solid var(--tsl-accent);outline-offset:-2px;}
  .tab[aria-disabled="true"]{opacity:var(--tsl-disabled-alpha);pointer-events:none;}
  .indicator{position:absolute;left:0;bottom:-1px;height:3px;border-radius:1.5px;background:var(--tsl-accent);
    width:0;transform:translateX(0);transition:transform var(--tsl-duration-base) var(--tsl-ease),
      width var(--tsl-duration-base) var(--tsl-ease);pointer-events:none;}
  .panels{padding-top:16px;}
  ::slotted(tsl-tab-panel:not([hidden])){display:block;}
`;

export class TesselTabs extends TesselElement {
  static styles = STYLES;
  static observedAttributes = ['value'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) { this._readTabs(); return; }
    this._built = true;
    const strip = document.createElement('div');
    strip.className = 'strip';
    strip.setAttribute('role', 'tablist');
    const panels = document.createElement('div');
    panels.className = 'panels';
    panels.appendChild(document.createElement('slot'));
    this._indicator = document.createElement('div');
    this._indicator.className = 'indicator';
    strip.appendChild(this._indicator);
    this.shadowRoot.append(strip, panels);
    this._strip = strip;

    this._mo = new MutationObserver(() => this._readTabs());
    this._mo.observe(this, { childList: true, characterData: true, subtree: true });

    this._readTabs();
  }

  disconnectedCallback() {
    this._mo?.disconnect();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built && name === 'value') this._render();
  }

  _tabs() { return Array.from(this.children).filter((c) => c instanceof TesselTab); }
  _panels() { return Array.from(this.children).filter((c) => c instanceof TesselTabPanel); }

  _readTabs() {
    const tabs = this._tabs();
    if (!this.hasAttribute('value') && tabs[0]) this.setAttribute('value', tabs[0].value);
    this._strip.innerHTML = '';
    for (const tab of tabs) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tab';
      btn.setAttribute('role', 'tab');
      btn.textContent = tab.label;
      if (tab.hasAttribute('disabled')) btn.setAttribute('aria-disabled', 'true');
      btn.addEventListener('click', () => {
        if (tab.hasAttribute('disabled')) return;
        this.value = tab.value;
        this.emit('change', { value: tab.value });
      });
      this._strip.appendChild(btn);
    }
    this._strip.appendChild(this._indicator);
    this._render(true);
  }

  _render(skipAnimation = false) {
    const value = this.getAttribute('value');
    const tabs = this._tabs();
    let selectedBtn = null;
    Array.from(this._strip.children).forEach((btn, i) => {
      if (!(btn instanceof HTMLButtonElement)) return;
      const selected = tabs[i]?.value === value;
      btn.setAttribute('aria-selected', String(selected));
      if (selected) selectedBtn = btn;
    });
    for (const panel of this._panels()) panel.hidden = panel.value !== value;
    this._moveIndicator(selectedBtn, skipAnimation);
  }

  _moveIndicator(btn, skipAnimation) {
    const indicator = this._indicator;
    if (!btn) { indicator.style.width = '0'; return; }
    const prevTransition = indicator.style.transition;
    if (skipAnimation) indicator.style.transition = 'none';
    indicator.style.transform = `translateX(${btn.offsetLeft + 12}px)`;
    indicator.style.width = `${Math.max(0, btn.offsetWidth - 24)}px`;
    if (skipAnimation) {
      // Force the "no transition" style to apply before restoring it, so the very first
      // placement doesn't slide in from the indicator's default (0, 0-width) state.
      indicator.getBoundingClientRect();
      indicator.style.transition = prevTransition;
    }
  }

  get value() { return this.getAttribute('value') || ''; }
  set value(v) { this.setAttribute('value', v); }
}

define('tsl-tabs', TesselTabs);
