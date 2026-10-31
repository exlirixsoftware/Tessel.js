// Button family ported from Tessel.NET's Buttons.xaml / Chips.xaml:
//   <tsl-toggle-button [checked] icon>Bold</tsl-toggle-button>
//   <tsl-dropdown-button label="Share" icon="share"> <tsl-menu-item>…</tsl-menu-item> </tsl-dropdown-button>
//   <tsl-split-button label="Send" icon="send"> <tsl-menu-item>Send later</tsl-menu-item> </tsl-split-button>
//   <tsl-toggle-split-button label="Bold" [checked]> … </tsl-toggle-split-button>
//   <tsl-chip [removable] [selectable] [checked] icon>WPF</tsl-chip>
//
// Menu-owning buttons take <tsl-menu-item> / <tsl-menu-checkbox-item> / <tsl-menu-separator> children, exactly
// like <tsl-menu-button>, and fire `select` / `change`. A click on the main part fires the native `click`.

import { TesselElement, define } from '../core/base-element.js';
import { createIcon, chevronSvg, closeSvg } from '../core/icons.js';
import { createMenu } from '../core/menu.js';
import { h, html, cx } from '../core/dom.js';
import './menu.js';

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
const DISABLED = 'host-[disabled]:pointer-events-none host-[disabled]:opacity-45';

// ---------------------------------------------------------------- <tsl-toggle-button>

const TOGGLE = `inline-flex h-8 cursor-pointer select-none items-center justify-center gap-2 rounded-md border px-3.5 text-body font-medium transition-colors duration-fast ease-tessel ${FOCUS} ${DISABLED}`;
const TOGGLE_OFF = 'border-border bg-control text-text hover:bg-control-hover active:bg-control-pressed';
const TOGGLE_ON = 'border-accent bg-accent text-on-accent hover:border-accent-hover hover:bg-accent-hover active:bg-accent-pressed';

export class TesselToggleButton extends TesselElement {
  static styles = ':host{display:inline-flex;vertical-align:middle;}';
  static observedAttributes = ['checked', 'disabled', 'icon'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._icon = h('span', 'inline-flex flex-none');
    this._button = h('button', TOGGLE, { type: 'button', 'aria-pressed': 'false' }, this._icon, h('slot'));
    this.shadowRoot.appendChild(this._button);
    this._button.addEventListener('click', () => {
      this.checked = !this.checked;
      this.emit('change', { checked: this.checked });
    });
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    const icon = this.getAttribute('icon');
    this._icon.replaceChildren(...(icon ? [createIcon(icon, 16)] : []));
    this._icon.hidden = !icon;
    this._button.className = cx(TOGGLE, this.checked ? TOGGLE_ON : TOGGLE_OFF);
    this._button.setAttribute('aria-pressed', String(this.checked));
    this._button.disabled = this.disabled;
  }

  get checked() { return this.hasAttribute('checked'); }
  set checked(v) { this.toggleAttribute('checked', !!v); }
}

// ---------------------------------------------------------------- menu-owning buttons

const SHELL = 'inline-flex h-8 select-none items-stretch overflow-hidden rounded-md border transition-colors duration-fast ease-tessel';
const PART = `flex cursor-pointer items-center justify-center gap-2 border-0 bg-transparent text-body font-medium text-current transition-colors duration-fast ease-tessel focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent`;
const LOOKS = {
  standard: { shell: 'border-border bg-control text-text', part: 'hover:bg-control-hover active:bg-control-pressed', divider: 'bg-border' },
  accent: { shell: 'border-accent bg-accent text-on-accent', part: 'hover:bg-accent-hover active:bg-accent-pressed', divider: 'bg-on-accent/30' },
};

/** Shared build for DropDownButton / SplitButton / ToggleSplitButton. */
class TesselMenuButtonBase extends TesselElement {
  static styles = ':host{display:inline-flex;vertical-align:middle;}';
  static observedAttributes = ['label', 'icon', 'variant', 'disabled', 'checked', 'open'];
  /** 'dropdown' = one button that opens the menu, 'split' = action part + chevron part. */
  static kind = 'split';
  static toggling = false;

  connectedCallback() {
    super.connectedCallback();
    if (this._built) { this._menu.refresh(); return; }
    this._built = true;
    const { kind } = this.constructor;
    this._icon = h('span', 'inline-flex flex-none');
    this._label = h('span');
    this._chevron = html('span', 'flex flex-none transition-transform duration-fast ease-tessel', chevronSvg('down', 12));
    this._divider = h('span', 'my-1.5 w-px flex-none');

    if (kind === 'dropdown') {
      this._main = h('button', `${PART} px-3.5`, { type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false' }, this._icon, this._label, this._chevron);
      this._shell = h('div', SHELL, null, this._main);
      this._arrow = this._main;
    } else {
      this._main = h('button', `${PART} pl-3.5 pr-3`, { type: 'button' }, this._icon, this._label);
      this._arrow = h('button', `${PART} w-8`, { type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-label': 'More options' }, this._chevron);
      this._shell = h('div', SHELL, null, this._main, this._divider, this._arrow);
    }
    this.shadowRoot.appendChild(this._shell);

    this._menu = createMenu(this, {
      anchor: () => this._shell,
      onSelect: (child) => this.emit('select', { value: child.value }),
      onToggle: (child) => this.emit('change', { value: child.value, checked: child.checked, source: 'menu' }),
      onOpenChange: (open) => {
        this.toggleAttribute('open', open);
        this._arrow.setAttribute('aria-expanded', String(open));
        this._chevron.classList.toggle('rotate-180', open);
      },
    });
    this.shadowRoot.appendChild(this._menu.popup);

    this._arrow.addEventListener('click', (e) => {
      if (kind === 'split') e.stopPropagation(); // the chevron isn't the button's primary action
      if (this.disabled) return;
      if (this._menu.isOpen) this._menu.close();
      else this._menu.open();
    });
    if (kind === 'split') {
      this._main.addEventListener('click', () => {
        if (this.constructor.toggling) {
          this.checked = !this.checked;
          this.emit('change', { checked: this.checked, source: 'button' });
        }
      });
    }
    this._mo = new MutationObserver(() => this._menu.refresh());
    this._mo.observe(this, { childList: true, characterData: true, subtree: true });
    this._sync();
    this._menu.refresh();
  }

  disconnectedCallback() {
    this._mo?.disconnect();
    this._menu?.close();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    const label = this.getAttribute('label') ?? '';
    const icon = this.getAttribute('icon');
    const accent = this.getAttribute('variant') === 'accent' || (this.constructor.toggling && this.checked);
    const look = accent ? LOOKS.accent : LOOKS.standard;
    this._label.textContent = label;
    this._label.hidden = !label;
    this._icon.replaceChildren(...(icon ? [createIcon(icon, 16)] : []));
    this._icon.hidden = !icon;
    this._shell.className = cx(SHELL, look.shell, this.disabled && 'pointer-events-none opacity-45');
    this._divider.className = cx('my-1.5 w-px flex-none', look.divider);
    for (const part of [this._main, this._arrow]) {
      part.className = cx(PART, look.part, part === this._arrow && this.constructor.kind === 'split' ? 'w-8' : (this.constructor.kind === 'split' ? 'pl-3.5 pr-3' : 'px-3.5'));
      part.disabled = this.disabled;
    }
    if (this.constructor.toggling) this._main.setAttribute('aria-pressed', String(this.checked));
  }

  get checked() { return this.hasAttribute('checked'); }
  set checked(v) { this.toggleAttribute('checked', !!v); }
  get open() { return this.hasAttribute('open'); }
}

export class TesselDropDownButton extends TesselMenuButtonBase {
  static kind = 'dropdown';
}

export class TesselSplitButton extends TesselMenuButtonBase {
  static kind = 'split';
}

export class TesselToggleSplitButton extends TesselMenuButtonBase {
  static kind = 'split';
  static toggling = true;
}

// ---------------------------------------------------------------- <tsl-chip>

const CHIP = `inline-flex min-h-7 select-none items-center gap-1.5 rounded-pill border px-3 text-[13px] transition-colors duration-fast ease-tessel ${FOCUS} ${DISABLED}`;
const CHIP_IDLE = 'border-border bg-control text-text';
const CHIP_HOVER = 'hover:bg-control-hover active:bg-control-pressed';
const CHIP_ON = 'border-accent bg-accent-subtle text-accent';

export class TesselChip extends TesselElement {
  static styles = ':host{display:inline-flex;vertical-align:middle;}';
  static observedAttributes = ['icon', 'removable', 'selectable', 'checked', 'disabled'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._icon = h('span', 'inline-flex flex-none');
    this._remove = html('button', 'ml-0.5 -mr-1.5 flex size-[18px] flex-none cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-current opacity-70 hover:bg-control-hover hover:opacity-100', closeSvg(8));
    this._remove.type = 'button';
    this._remove.setAttribute('aria-label', 'Remove');
    this._root = h('div', CHIP, { tabindex: '0' }, this._icon, h('slot'), this._remove);
    this.shadowRoot.appendChild(this._root);

    this._root.addEventListener('click', (e) => {
      if (this.disabled || e.composedPath().includes(this._remove) || !this.hasAttribute('selectable')) return;
      this.checked = !this.checked;
      this.emit('change', { checked: this.checked });
    });
    this._root.addEventListener('keydown', (e) => {
      if (e.target !== this._root) return;
      if ((e.key === ' ' || e.key === 'Enter') && this.hasAttribute('selectable')) { e.preventDefault(); this._root.click(); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.hasAttribute('removable')) this._remove.click();
    });
    this._remove.addEventListener('click', () => {
      if (this.disabled) return;
      // Cancelable: a listener can keep the chip (e.g. to confirm first); otherwise it removes itself.
      if (this.emit('remove', {})) this.remove();
    });
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    const icon = this.getAttribute('icon');
    const selectable = this.hasAttribute('selectable');
    this._icon.replaceChildren(...(icon ? [createIcon(icon, 14)] : []));
    this._icon.hidden = !icon;
    this._remove.hidden = !this.hasAttribute('removable');
    this._root.className = cx(CHIP, selectable && this.checked ? CHIP_ON : CHIP_IDLE, selectable && 'cursor-pointer', (selectable || this.hasAttribute('removable')) && !(selectable && this.checked) && CHIP_HOVER);
    if (selectable) this._root.setAttribute('aria-pressed', String(this.checked));
    else this._root.removeAttribute('aria-pressed');
  }

  get checked() { return this.hasAttribute('checked'); }
  set checked(v) { this.toggleAttribute('checked', !!v); }
}

define('tsl-toggle-button', TesselToggleButton);
define('tsl-dropdown-button', TesselDropDownButton);
define('tsl-split-button', TesselSplitButton);
define('tsl-toggle-split-button', TesselToggleSplitButton);
define('tsl-chip', TesselChip);
