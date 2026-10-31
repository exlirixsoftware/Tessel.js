// <tsl-table [selectable] [sortable]><table><thead>...</thead><tbody>...</tbody></table></tsl-table>
// Restyles a plain, accessible native <table> — loosely based on TesselTableUI/TesselTableHeaderUI and
// Tessel.NET's DataGrid, dialed up for the web: an uppercase letter-spaced header on a tinted band, 44px rows
// with zebra striping, rounded/elevated outer card, accentSubtle selection.
//
// `::slotted()` can only match the slotted <table> itself, so the cell rules live in a light-DOM sheet
// (styles/light.css, compiled by Tailwind) adopted by whichever root contains the element.
//
//   selectable — clicking a row marks it `aria-selected` and fires `change` with { row, index }.
//   sortable   — clicking a header cell sorts the body rows by that column (text, or numbers when both parse)
//                and fires `sort` with { column, direction }.

import { TesselElement, define } from '../core/base-element.js';
import lightCss from '../styles/light.generated.js';
import { h } from '../core/dom.js';

let lightSheet = null;
function adoptLightStyles(root) {
  if (!('adoptedStyleSheets' in Document.prototype)) {
    if (root.querySelector?.('style[data-tessel-light]')) return;
    const style = document.createElement('style');
    style.dataset.tesselLight = '';
    style.textContent = lightCss;
    (root.head || root).appendChild(style);
    return;
  }
  lightSheet ??= new CSSStyleSheet();
  if (!lightSheet.cssRules.length) lightSheet.replaceSync(lightCss);
  if (!root.adoptedStyleSheets.includes(lightSheet)) root.adoptedStyleSheets = [...root.adoptedStyleSheets, lightSheet];
}

export class TesselTable extends TesselElement {
  static styles = ':host{display:block;overflow:auto;border:1px solid var(--tsl-border);border-radius:var(--tsl-radius-lg);background:var(--tsl-surface);box-shadow:0 1px 2px var(--tsl-shadow);}';

  connectedCallback() {
    super.connectedCallback();
    adoptLightStyles(this.getRootNode());
    if (this._built) return;
    this._built = true;
    this.shadowRoot.appendChild(h('slot'));

    this.addEventListener('click', (e) => {
      const cell = e.composedPath().find((n) => n instanceof HTMLElement && (n.tagName === 'TD' || n.tagName === 'TH'));
      if (!cell) return;
      if (cell.tagName === 'TH' && this.hasAttribute('sortable')) this._sortBy(cell);
      const row = cell.parentElement;
      if (cell.tagName === 'TD' && this.hasAttribute('selectable') && row.parentElement?.tagName === 'TBODY') {
        for (const r of row.parentElement.rows) r.removeAttribute('aria-selected');
        row.setAttribute('aria-selected', 'true');
        this.emit('change', { row, index: row.sectionRowIndex });
      }
    });
  }

  _sortBy(th) {
    const table = this.querySelector('table');
    const body = table?.tBodies[0];
    if (!body) return;
    const column = th.cellIndex;
    const direction = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
    for (const other of th.parentElement.cells) other.removeAttribute('aria-sort');
    th.setAttribute('aria-sort', direction);
    const text = (row) => (row.cells[column]?.textContent ?? '').trim();
    const rows = Array.from(body.rows);
    const numeric = rows.every((r) => text(r) !== '' && !Number.isNaN(Number(text(r))));
    rows.sort((a, b) => {
      const cmp = numeric ? Number(text(a)) - Number(text(b)) : text(a).localeCompare(text(b), undefined, { numeric: true, sensitivity: 'base' });
      return direction === 'ascending' ? cmp : -cmp;
    });
    body.append(...rows);
    this.emit('sort', { column, direction });
  }
}

define('tsl-table', TesselTable);
