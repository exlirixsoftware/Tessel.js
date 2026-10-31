// <tsl-theme-toggle> — a small icon button that flips between the light and dark theme, showing a
// sun (click to go light) while dark and a crescent moon (click to go dark) while light. Toggling
// always lands on an explicit LIGHT/DARK — it's a binary switch, not a LIGHT/DARK/SYSTEM cycle.

import { TesselElement, define } from '../core/base-element.js';
import { isDark, setTheme, TesselTheme, addThemeListener } from '../core/theme.js';
import { createIcon } from '../core/icons.js';
import { h } from '../core/dom.js';

const BUTTON = 'flex size-8 cursor-pointer items-center justify-center rounded-sm bg-transparent p-0 text-text-secondary '
  + 'transition-colors duration-fast ease-tessel hover:bg-control-hover hover:text-text active:bg-control-pressed '
  + 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export class TesselThemeToggle extends TesselElement {
  static styles = ':host{display:inline-flex;}';

  connectedCallback() {
    super.connectedCallback();
    if (!this._built) {
      this._built = true;
      this._button = h('button', BUTTON, { type: 'button' });
      this.shadowRoot.appendChild(this._button);
      this._button.addEventListener('click', () => {
        setTheme(isDark() ? TesselTheme.LIGHT : TesselTheme.DARK);
      });
    }
    // Re-subscribe on every (re)connect: disconnectedCallback drops the listener.
    this._unsubscribe = addThemeListener(() => this._sync());
    this._sync();
  }

  disconnectedCallback() {
    this._unsubscribe?.();
  }

  _sync() {
    const dark = isDark();
    this._button.replaceChildren(createIcon(dark ? 'brightness' : 'quiet-hours', 18));
    const label = dark ? 'Switch to light theme' : 'Switch to dark theme';
    this._button.setAttribute('aria-label', label);
    this._button.title = label;
  }
}

define('tsl-theme-toggle', TesselThemeToggle);
