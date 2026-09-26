// <tsl-table><table><thead>...</thead><tbody>...</tbody></table></tsl-table>
// Restyles a plain, accessible native <table> — loosely based on TesselTableUI/TesselTableHeaderUI,
// dialed up for the web: an uppercase letter-spaced header on a tinted band, 44px rows with zebra
// striping, rounded/elevated outer card, accentSubtle selection.

import { TesselElement, define } from '../core/base-element.js';

// `::slotted()` can only match the top-level slotted node itself (the <table>) — it cannot reach
// into that table's own descendants (<thead>, <th>, <td>, ...). A `::slotted(table) thead th{...}`
// rule looks reasonable but is invalid per the CSS Scoping spec, and CSSStyleSheet.replaceSync()
// silently drops invalid rules rather than erroring, so this shipped for a while quietly doing
// nothing — the table was rendering with bare browser-default <table> styling the whole time.
// Styling the actual cells needs a plain, un-scoped stylesheet in the *light* DOM instead, scoped by
// prefixing every selector with the `tsl-table` tag name so it can't leak onto unrelated tables.
let tableStylesInstalled = false;
function installTableStyles() {
  if (tableStylesInstalled) return;
  tableStylesInstalled = true;
  const style = document.createElement('style');
  style.id = 'tessel-table-cell-styles';
  style.textContent = `
    tsl-table table{width:100%;border-collapse:collapse;border-spacing:0;font-size:14px;color:var(--tsl-text);}
    tsl-table thead th{text-align:left;font-size:11px;font-weight:700;color:var(--tsl-text-secondary);
      text-transform:uppercase;letter-spacing:0.04em;padding:13px 20px;background:var(--tsl-subtle);
      border-bottom:1px solid var(--tsl-border);position:sticky;top:0;}
    tsl-table thead th:first-child{border-top-left-radius:var(--tsl-radius-lg);}
    tsl-table thead th:last-child{border-top-right-radius:var(--tsl-radius-lg);}
    tsl-table tbody td{height:44px;padding:0 20px;border-bottom:1px solid var(--tsl-border);}
    tsl-table tbody tr:last-child td{border-bottom:none;}
    tsl-table tbody tr{transition:background var(--tsl-duration-fast) var(--tsl-ease);}
    tsl-table tbody tr:nth-child(even){background:var(--tsl-surface-alt);}
    tsl-table tbody tr:hover{background:var(--tsl-control-hover);}
    tsl-table tbody tr[aria-selected="true"]{background:var(--tsl-accent-subtle);}
    tsl-table tbody tr:last-child td:first-child{border-bottom-left-radius:var(--tsl-radius-lg);}
    tsl-table tbody tr:last-child td:last-child{border-bottom-right-radius:var(--tsl-radius-lg);}
  `;
  document.head.appendChild(style);
}

const STYLES = `
  :host{display:block;overflow:auto;border:1px solid var(--tsl-border);border-radius:var(--tsl-radius-lg);
    background:var(--tsl-surface);box-shadow:0 1px 2px var(--tsl-shadow);}
`;

export class TesselTable extends TesselElement {
  static styles = STYLES;

  connectedCallback() {
    super.connectedCallback();
    installTableStyles();
    if (this._built) return;
    this._built = true;
    this.shadowRoot.appendChild(document.createElement('slot'));
  }
}

define('tsl-table', TesselTable);
