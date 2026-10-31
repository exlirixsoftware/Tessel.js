// <tsl-settings-card header="Notifications" description="Alerts for mentions" icon="ringer">
//   <tsl-switch slot="control" checked></tsl-switch>
// </tsl-settings-card> — port of components/SettingsCard.java and Tessel.NET's SettingsCard (68px min height, radius 8).

import { TesselElement, define } from '../core/base-element.js';
import { createIcon } from '../core/icons.js';
import { h } from '../core/dom.js';

const ROW = 'flex min-h-17 w-full items-center gap-4 rounded-lg border border-border bg-surface py-3 pl-5 pr-4';

export class TesselSettingsCard extends TesselElement {
  static styles = ':host{display:flex;}';
  static observedAttributes = ['header', 'description', 'icon'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._icon = h('span', 'flex flex-none text-text-secondary');
    this._header = h('div', 'text-body text-text');
    this._description = h('div', 'mt-0.5 text-caption text-text-tertiary');
    this.shadowRoot.appendChild(h('div', ROW, null,
      this._icon,
      h('div', 'min-w-0 flex-1', null, this._header, this._description),
      h('span', 'flex flex-none items-center', null, h('slot', '', { name: 'control' }))));
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    const icon = this.getAttribute('icon');
    this._icon.replaceChildren(...(icon ? [createIcon(icon, 20)] : []));
    this._icon.hidden = !icon;
    this._header.textContent = this.getAttribute('header') || '';
    const description = this.getAttribute('description');
    this._description.textContent = description || '';
    this._description.hidden = !description;
  }
}

define('tsl-settings-card', TesselSettingsCard);
