// <tsl-badge kind="neutral|accent|success|warning|danger|info" [solid]>New</tsl-badge>
// Port of components/Badge.java (pill, radius = height/2, semibold 12px).

import { TesselElement, define } from '../core/base-element.js';

const STYLES = `
  :host{display:inline-flex;}
  .pill{display:inline-flex;align-items:center;padding:2px 8px;border-radius:var(--tsl-radius-pill);
    font-size:12px;font-weight:600;line-height:1.5;white-space:nowrap;
    background:var(--tsl-subtle);color:var(--tsl-text-secondary);
    transition:background var(--tsl-duration-fast) var(--tsl-ease), color var(--tsl-duration-fast) var(--tsl-ease);}

  :host([kind="accent"]) .pill{background:var(--tsl-accent-subtle);color:var(--tsl-accent);}
  :host([kind="success"]) .pill{background:var(--tsl-success-subtle);color:var(--tsl-success);}
  :host([kind="warning"]) .pill{background:var(--tsl-warning-subtle);color:var(--tsl-warning);}
  :host([kind="danger"]) .pill{background:var(--tsl-danger-subtle);color:var(--tsl-danger);}
  :host([kind="info"]) .pill{background:var(--tsl-info-subtle);color:var(--tsl-info);}

  :host([solid]) .pill{color:var(--tsl-surface);background:var(--tsl-text-secondary);}
  :host([solid][kind="accent"]) .pill{background:var(--tsl-accent);color:var(--tsl-on-accent);}
  :host([solid][kind="success"]) .pill{background:var(--tsl-success);}
  :host([solid][kind="warning"]) .pill{background:var(--tsl-warning);}
  :host([solid][kind="danger"]) .pill{background:var(--tsl-danger);color:#fff;}
  :host([solid][kind="info"]) .pill{background:var(--tsl-info);}
`;

export class TesselBadge extends TesselElement {
  static styles = STYLES;

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const pill = document.createElement('span');
    pill.className = 'pill';
    pill.appendChild(document.createElement('slot'));
    this.shadowRoot.appendChild(pill);
  }
}

define('tsl-badge', TesselBadge);
