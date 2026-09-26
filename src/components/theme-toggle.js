// <tsl-theme-toggle> — a small icon button that flips between the light and dark theme, showing a
// sun (click to go light) while dark and a crescent moon (click to go dark) while light. Toggling
// always lands on an explicit LIGHT/DARK — it's a binary switch, not a LIGHT/DARK/SYSTEM cycle.

import { TesselElement, FOCUS_VISIBLE_CSS, define } from '../core/base-element.js';
import { isDark, setTheme, TesselTheme, addThemeListener } from '../core/theme.js';
import { createIcon } from '../core/icons.js';

const STYLES = `
  :host{display:inline-flex;}
  button{display:flex;align-items:center;justify-content:center;width:32px;height:32px;padding:0;
    border:none;border-radius:var(--tsl-radius-sm);background:transparent;color:var(--tsl-text-secondary);
    cursor:pointer;transition:background var(--tsl-duration-fast) var(--tsl-ease),
      color var(--tsl-duration-fast) var(--tsl-ease);}
  button:hover{background:var(--tsl-control-hover);color:var(--tsl-text);}
  button:active{background:var(--tsl-control-pressed);}
  .icon{display:flex;}
  ${FOCUS_VISIBLE_CSS}
`;

export class TesselThemeToggle extends TesselElement {
  static styles = STYLES;

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const button = document.createElement('button');
    button.type = 'button';
    this._iconSlot = document.createElement('span');
    this._iconSlot.className = 'icon';
    button.appendChild(this._iconSlot);
    this.shadowRoot.appendChild(button);
    this._button = button;

    button.addEventListener('click', () => {
      setTheme(isDark() ? TesselTheme.LIGHT : TesselTheme.DARK);
    });
    this._unsubscribe = addThemeListener(() => this._sync());
    this._sync();
  }

  disconnectedCallback() {
    this._unsubscribe?.();
  }

  _sync() {
    const dark = isDark();
    this._iconSlot.innerHTML = '';
    this._iconSlot.appendChild(createIcon(dark ? 'brightness' : 'quiet-hours', 18));
    const label = dark ? 'Switch to light theme' : 'Switch to dark theme';
    this._button.setAttribute('aria-label', label);
    this._button.title = label;
  }
}

define('tsl-theme-toggle', TesselThemeToggle);
