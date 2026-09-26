// <tsl-settings-card header="Notifications" description="Alerts for mentions" icon="ringer">
//   <tsl-switch slot="control" checked></tsl-switch>
// </tsl-settings-card> — port of components/SettingsCard.java (68px min height, radius 8).

import { TesselElement, define } from '../core/base-element.js';
import { createIcon } from '../core/icons.js';

const STYLES = `
  :host{display:flex;}
  .row{display:flex;align-items:center;gap:16px;width:100%;min-height:68px;padding:12px 16px 12px 20px;
    border-radius:var(--tsl-radius-lg);border:1px solid var(--tsl-border);background:var(--tsl-surface);}
  .icon{flex:none;display:flex;color:var(--tsl-text-secondary);}
  .text{flex:1;min-width:0;}
  .header{font-size:14px;color:var(--tsl-text);}
  .description{font-size:12px;color:var(--tsl-text-tertiary);margin-top:2px;}
  .control{flex:none;display:flex;align-items:center;}
`;

export class TesselSettingsCard extends TesselElement {
  static styles = STYLES;
  static observedAttributes = ['header', 'description', 'icon'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const row = document.createElement('div');
    row.className = 'row';
    this._icon = document.createElement('span');
    this._icon.className = 'icon';
    const text = document.createElement('div');
    text.className = 'text';
    this._header = document.createElement('div');
    this._header.className = 'header';
    this._description = document.createElement('div');
    this._description.className = 'description';
    text.append(this._header, this._description);
    const control = document.createElement('span');
    control.className = 'control';
    const slot = document.createElement('slot');
    slot.name = 'control';
    control.appendChild(slot);
    row.append(this._icon, text, control);
    this.shadowRoot.appendChild(row);
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    const icon = this.getAttribute('icon');
    this._icon.innerHTML = icon ? createIcon(icon, 20).innerHTML : '';
    this._icon.style.display = icon ? '' : 'none';
    this._header.textContent = this.getAttribute('header') || '';
    const description = this.getAttribute('description');
    this._description.textContent = description || '';
    this._description.style.display = description ? '' : 'none';
  }
}

define('tsl-settings-card', TesselSettingsCard);
