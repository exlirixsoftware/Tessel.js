// Small container controls from Tessel.NET's Misc.xaml / ToolBar.xaml:
//   <tsl-group-box header="Options"> … </tsl-group-box>
//   <tsl-toolbar> <tsl-button variant="icon" icon="cut"></tsl-button> <tsl-separator vertical></tsl-separator> … </tsl-toolbar>

import { TesselElement, define } from '../core/base-element.js';
import { h } from '../core/dom.js';

export class TesselGroupBox extends TesselElement {
  static styles = ':host{display:block;}';
  static observedAttributes = ['header'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._legend = h('legend', 'ml-3 px-2 text-body font-semibold text-text');
    this.shadowRoot.appendChild(h('fieldset', 'm-0 min-w-0 rounded-lg border border-border px-4 pb-4 pt-2', null, this._legend, h('slot')));
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    this._legend.textContent = this.getAttribute('header') || '';
    this._legend.hidden = !this.hasAttribute('header');
  }
}

/** A rounded command bar. Arrow keys move focus between the controls inside it (roving focus). */
export class TesselToolbar extends TesselElement {
  static styles = ':host{display:inline-block;}';

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this.setAttribute('role', 'toolbar');
    this.shadowRoot.appendChild(
      h('div', 'flex items-center gap-1 rounded-lg border border-border bg-surface p-1', null, h('slot')),
    );
    this.addEventListener('keydown', (e) => {
      const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!dir) return;
      const items = Array.from(this.querySelectorAll('tsl-button, tsl-toggle-button, tsl-dropdown-button, tsl-split-button, tsl-menu-button'))
        .filter((el) => !el.disabled);
      const at = items.findIndex((el) => el.matches(':focus-within') || el === document.activeElement);
      if (at < 0) return;
      e.preventDefault();
      items[(at + dir + items.length) % items.length].focus();
    });
  }
}

define('tsl-group-box', TesselGroupBox);
define('tsl-toolbar', TesselToolbar);
