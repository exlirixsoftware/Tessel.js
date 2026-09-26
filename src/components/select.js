// <tsl-select value="b"><tsl-option value="a">A</tsl-option><tsl-option value="b">B</tsl-option></tsl-select>
// Port of TesselComboBoxUI / TesselListUI (32px control, 4px dropdown-below gap, row highlight radius 4
// with a 3px accent indicator bar on the current value).

import { TesselElement, define, openAnimated, closeAnimated } from '../core/base-element.js';
import { chevronSvg, checkmarkSvg } from '../core/icons.js';
import { MOTION } from '../core/tokens.js';

const CLOSE_DURATION = parseInt(MOTION.fast, 10);

export class TesselOption extends HTMLElement {
  get value() { return this.getAttribute('value') ?? this.textContent.trim(); }
  set value(v) { this.setAttribute('value', v); }
}
Object.defineProperty(TesselOption.prototype, 'label', {
  get() { return this.textContent.trim(); },
});
if (!customElements.get('tsl-option')) {
  TesselOption.prototype.connectedCallback = function () { this.hidden = true; };
  customElements.define('tsl-option', TesselOption);
}

const STYLES = `
  :host{display:inline-flex;width:220px;position:relative;}
  .control{display:flex;align-items:center;gap:8px;width:100%;height:32px;padding:0 12px;
    border-radius:var(--tsl-radius-md);border:1px solid var(--tsl-border);background:var(--tsl-control-bg);
    cursor:pointer;font-size:14px;color:var(--tsl-text);transition:background var(--tsl-duration-fast) var(--tsl-ease),
      border-color var(--tsl-duration-fast) var(--tsl-ease);}
  .control:hover{background:var(--tsl-control-hover);}
  :host([open]) .control{border-color:var(--tsl-accent);}
  .control:focus-visible{outline:2px solid var(--tsl-accent);outline-offset:2px;}
  .value{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;}
  .value.placeholder{color:var(--tsl-text-tertiary);}
  .chevron{flex:none;display:flex;color:var(--tsl-text-secondary);transition:transform var(--tsl-duration-fast) var(--tsl-ease);}
  :host([open]) .chevron{transform:rotate(180deg);}
  .popup{position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:1000;background:var(--tsl-surface);
    border:1px solid var(--tsl-border);border-radius:var(--tsl-radius-md);box-shadow:0 8px 24px var(--tsl-shadow);
    padding:4px;max-height:260px;overflow:auto;display:none;opacity:0;transform:translateY(-4px) scale(0.98);
    transform-origin:top center;transition:opacity var(--tsl-duration-fast) var(--tsl-ease),
      transform var(--tsl-duration-fast) var(--tsl-ease);}
  :host([open]) .popup{display:block;}
  :host([visible]) .popup{opacity:1;transform:translateY(0) scale(1);}
  .option{position:relative;display:flex;align-items:center;gap:8px;min-height:32px;padding:7px 10px 7px 14px;
    border-radius:var(--tsl-radius-sm);cursor:pointer;color:var(--tsl-text);
    transition:background var(--tsl-duration-fast) var(--tsl-ease);}
  .option:hover{background:var(--tsl-control-hover);}
  .option[aria-selected="true"]{background:var(--tsl-subtle);}
  .option[aria-selected="true"]::before{content:"";position:absolute;left:1px;top:8px;bottom:8px;width:3px;
    border-radius:1.5px;background:var(--tsl-accent);}
  .option .check{margin-left:auto;flex:none;color:var(--tsl-accent);opacity:0;}
  .option[aria-selected="true"] .check{opacity:1;}
  .option[aria-disabled="true"]{opacity:var(--tsl-disabled-alpha);pointer-events:none;}
  :host([disabled]) .control{opacity:var(--tsl-disabled-alpha);pointer-events:none;}
`;

export class TesselSelect extends TesselElement {
  static styles = STYLES;
  static observedAttributes = ['disabled', 'value', 'placeholder', 'open'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) {
      this._readOptions();
      return;
    }
    this._built = true;

    const control = document.createElement('button');
    control.type = 'button';
    control.className = 'control';
    const value = document.createElement('span');
    value.className = 'value';
    const chevron = document.createElement('span');
    chevron.className = 'chevron';
    chevron.innerHTML = chevronSvg('down', 14);
    control.append(value, chevron);

    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.setAttribute('role', 'listbox');

    this.shadowRoot.append(control, popup);
    this._control = control;
    this._valueEl = value;
    this._popup = popup;

    control.addEventListener('click', () => this.open ? this.close() : this.openMenu());
    control.addEventListener('keydown', (e) => this._onKeydown(e));
    this._onDocPointer = (e) => {
      if (!this.contains(e.target) && !this.shadowRoot.contains(e.target)) this.close();
    };

    this._mo = new MutationObserver(() => this._readOptions());
    this._mo.observe(this, { childList: true, characterData: true, subtree: true });

    this._readOptions();
  }

  disconnectedCallback() {
    document.removeEventListener('pointerdown', this._onDocPointer);
    this._mo?.disconnect();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === 'value') this._render();
  }

  _readOptions() {
    this._options = Array.from(this.querySelectorAll('tsl-option'));
    this._render();
  }

  _render() {
    if (!this._popup) return;
    const value = this.getAttribute('value');
    this._popup.innerHTML = '';
    let matched = null;
    for (const opt of this._options) {
      const row = document.createElement('div');
      row.className = 'option';
      row.setAttribute('role', 'option');
      row.dataset.value = opt.value;
      if (opt.hasAttribute('disabled')) row.setAttribute('aria-disabled', 'true');
      const selected = opt.value === value;
      if (selected) { row.setAttribute('aria-selected', 'true'); matched = opt; }
      const label = document.createElement('span');
      label.textContent = opt.label;
      const check = document.createElement('span');
      check.className = 'check';
      check.innerHTML = checkmarkSvg(14, 2);
      row.append(label, check);
      row.addEventListener('click', () => {
        if (opt.hasAttribute('disabled')) return;
        this.value = opt.value;
        this.close();
        this.emit('change', { value: opt.value });
      });
      this._popup.appendChild(row);
    }
    this._valueEl.textContent = matched ? matched.label : (this.getAttribute('placeholder') || '');
    this._valueEl.classList.toggle('placeholder', !matched);
  }

  _onKeydown(e) {
    const openNow = () => { if (!this.open) this.openMenu(); };
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      openNow();
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      const enabled = this._options.filter((o) => !o.hasAttribute('disabled'));
      const idx = enabled.findIndex((o) => o.value === this.getAttribute('value'));
      const next = enabled[(idx + dir + enabled.length) % enabled.length] || enabled[0];
      if (next) { this.value = next.value; this.emit('change', { value: next.value }); }
    } else if (e.key === 'Escape') {
      this.close();
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

  get value() { return this.getAttribute('value') || ''; }
  set value(v) { this.setAttribute('value', v); }
}

define('tsl-select', TesselSelect);
