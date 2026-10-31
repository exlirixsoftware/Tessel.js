// <tsl-select value="b" header placeholder><tsl-option value="a">A</tsl-option><tsl-option value="b">B</tsl-option></tsl-select>
// Port of TesselComboBoxUI / TesselListUI (32px control, 4px dropdown-below gap, row highlight radius 4
// with a 3px accent indicator bar on the current value) and Tessel.NET's ComboBox. The list is a top-layer
// popover (core/popup.js), so a parent with `overflow:hidden` can't clip it.

import { TesselElement, define } from '../core/base-element.js';
import { chevronSvg, checkmarkSvg } from '../core/icons.js';
import { h, html, cx } from '../core/dom.js';
import { openPopup, closePopup, POPUP_BASE } from '../core/popup.js';

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

const HEADER = 'mb-1.5 block text-body font-medium text-text';
const CONTROL = 'flex h-8 w-full cursor-pointer items-center gap-2 rounded-md border border-border bg-control px-3 text-body text-text '
  + 'transition-colors duration-fast ease-tessel hover:bg-control-hover focus-visible:outline-2 focus-visible:outline-offset-2 '
  + 'focus-visible:outline-accent host-[open]:border-accent host-[disabled]:pointer-events-none host-[disabled]:opacity-45';
const POPUP = `${POPUP_BASE} z-50 rounded-md p-1 shadow-card scrollbar-thin`;
const OPTION = 'relative flex min-h-8 cursor-pointer items-center gap-2 rounded-sm py-1.5 pl-3.5 pr-2.5 text-text '
  + 'transition-colors duration-fast ease-tessel';
const OPTION_IDLE = 'hover:bg-control-hover';
const OPTION_SELECTED = 'bg-subtle before:absolute before:left-px before:top-2 before:bottom-2 before:w-[3px] before:rounded-[1.5px] before:bg-accent';
const OPTION_ACTIVE = 'bg-control-hover';

export class TesselSelect extends TesselElement {
  static styles = ':host{display:inline-flex;flex-direction:column;width:220px;}';
  static observedAttributes = ['disabled', 'value', 'placeholder', 'header'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) {
      this._readOptions();
      return;
    }
    this._built = true;

    this._header = h('label', HEADER);
    this._valueEl = h('span', 'min-w-0 flex-1 truncate text-left');
    this._control = h('button', CONTROL, { type: 'button', role: 'combobox', 'aria-haspopup': 'listbox', 'aria-expanded': 'false' },
      this._valueEl,
      html('span', 'flex flex-none text-text-secondary transition-transform duration-fast ease-tessel', chevronSvg('down', 14)));
    this._chevron = this._control.lastElementChild;
    this._popup = h('div', POPUP, { popover: 'manual', role: 'listbox' });
    this.shadowRoot.append(this._header, this._control, this._popup);

    this._active = -1;
    this._control.addEventListener('click', () => (this.open ? this.close() : this.openMenu()));
    this._control.addEventListener('keydown', (e) => this._onKeydown(e));

    this._mo = new MutationObserver(() => this._readOptions());
    this._mo.observe(this, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'value'] });
    this._readOptions();
  }

  disconnectedCallback() {
    this._mo?.disconnect();
    if (this._popup) closePopup(this._popup);
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === 'header') {
      this._header.textContent = newV || '';
      this._header.hidden = !newV;
    } else {
      this._render();
    }
  }

  _readOptions() {
    this._options = Array.from(this.querySelectorAll('tsl-option'));
    this._render();
  }

  _render() {
    if (!this._popup) return;
    const value = this.getAttribute('value');
    this._header.textContent = this.getAttribute('header') || '';
    this._header.hidden = !this.hasAttribute('header');
    this._popup.replaceChildren();
    let matched = null;
    this._options.forEach((opt, i) => {
      const disabled = opt.hasAttribute('disabled');
      const selected = opt.value === value;
      if (selected) matched = opt;
      const row = h('div', cx(OPTION, selected ? OPTION_SELECTED : OPTION_IDLE, i === this._active && OPTION_ACTIVE, disabled && 'pointer-events-none opacity-45'), {
        role: 'option',
        'aria-selected': selected ? 'true' : 'false',
        'aria-disabled': disabled ? 'true' : null,
      },
      h('span', 'min-w-0 flex-1 truncate', null, opt.label),
      html('span', cx('ml-auto flex-none text-accent', selected ? 'opacity-100' : 'opacity-0'), checkmarkSvg(14, 2)));
      row.addEventListener('click', () => {
        if (disabled) return;
        this._choose(opt);
        this.close();
      });
      this._popup.appendChild(row);
    });
    this._valueEl.textContent = matched ? matched.label : (this.getAttribute('placeholder') || '');
    this._valueEl.className = cx('min-w-0 flex-1 truncate text-left', !matched && 'text-text-tertiary');
  }

  _choose(opt) {
    if (opt.value === this.getAttribute('value')) return;
    this.value = opt.value;
    this.emit('change', { value: opt.value });
  }

  _enabled() {
    return this._options.map((o, i) => [o, i]).filter(([o]) => !o.hasAttribute('disabled'));
  }

  _move(dir) {
    const enabled = this._enabled();
    if (!enabled.length) return;
    const at = enabled.findIndex(([, i]) => i === this._active);
    const next = enabled[(at + dir + enabled.length) % enabled.length] ?? enabled[0];
    this._active = next[1];
    this._render();
    this._popup.children[this._active]?.scrollIntoView({ block: 'nearest' });
  }

  _onKeydown(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!this.open) this.openMenu();
      else this._move(e.key === 'ArrowDown' ? 1 : -1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!this.open) this.openMenu();
      else {
        const opt = this._options[this._active];
        if (opt && !opt.hasAttribute('disabled')) this._choose(opt);
        this.close();
      }
    } else if (e.key === 'Home' || e.key === 'End') {
      if (!this.open) return;
      e.preventDefault();
      const enabled = this._enabled();
      this._active = (e.key === 'Home' ? enabled[0] : enabled.at(-1))?.[1] ?? -1;
      this._render();
    } else if (e.key === 'Tab') {
      this.close();
    }
  }

  openMenu() {
    if (this.disabled) return;
    this._active = this._options.findIndex((o) => o.value === this.getAttribute('value'));
    this._render();
    this.setAttribute('open', '');
    this._control.setAttribute('aria-expanded', 'true');
    this._chevron.classList.add('rotate-180');
    openPopup(this._popup, this._control, { matchWidth: true, owner: this, onDismiss: () => this._afterClose() });
  }

  close() {
    closePopup(this._popup);
    this._afterClose();
  }

  _afterClose() {
    this.removeAttribute('open');
    this._control.setAttribute('aria-expanded', 'false');
    this._chevron.classList.remove('rotate-180');
  }

  get open() { return this.hasAttribute('open'); }

  get value() { return this.getAttribute('value') || ''; }
  set value(v) { this.setAttribute('value', v); }
}

define('tsl-select', TesselSelect);
