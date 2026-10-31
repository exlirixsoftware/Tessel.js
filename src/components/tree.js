// <tsl-tree>
//   <tsl-tree-item label="src" expanded>
//     <tsl-tree-item label="index.js"></tsl-tree-item>
//   </tsl-tree-item>
// </tsl-tree>
// Port of TesselTreeUI and Tessel.NET's TreeView (32px rows, chevron expand icons, selected = subtle fill
// + 3px accent bar, folder/file vector icons). Nesting is expressed with real nested <tsl-tree-item>s,
// so each level's own padding provides the cumulative indent. Expanding animates a CSS grid row
// (0fr -> 1fr), which needs no height measurement — so it behaves even inside a not-yet-visible tab.

import { TesselElement, define } from '../core/base-element.js';
import { chevronSvg, folderSvg, fileSvg, createIcon } from '../core/icons.js';
import { h, html, cx } from '../core/dom.js';

const ROW = 'relative flex h-8 cursor-pointer select-none items-center gap-2 rounded-sm pl-0.5 pr-2 text-body text-text '
  + 'transition-colors duration-fast ease-tessel focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent';
const ROW_IDLE = 'hover:bg-control-hover';
const ROW_SELECTED = 'bg-subtle before:absolute before:-left-0.5 before:top-2 before:bottom-2 before:w-[3px] before:rounded-[1.5px] before:bg-accent';
const CHEVRON = 'flex size-4 flex-none items-center justify-center text-text-secondary transition-transform duration-fast ease-tessel';
const KIDS = 'grid transition-[grid-template-rows] duration-slow ease-tessel';

export class TesselTreeItem extends TesselElement {
  static styles = ':host{display:block;}';
  static observedAttributes = ['label', 'icon', 'expanded', 'selected', 'folder'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) { this._detectChildren(); return; }
    this._built = true;

    this._chevron = html('span', CHEVRON, chevronSvg('right', 14));
    this._icon = h('span', 'flex flex-none text-accent');
    this._label = h('span', 'min-w-0 flex-1 truncate');
    this._row = h('div', ROW, { tabindex: '-1', role: 'treeitem' }, this._chevron, this._icon, this._label);
    this._kids = h('div', KIDS, { role: 'group' }, h('div', 'min-h-0 overflow-hidden pl-[22px]', null, h('slot')));
    this.shadowRoot.append(this._row, this._kids);

    this._row.addEventListener('click', () => {
      if (this.hasAttribute('has-children')) this.expanded = !this.expanded;
      this.dispatchEvent(new CustomEvent('tsl-tree-select', { bubbles: true, composed: true, detail: { item: this } }));
    });
    this._row.addEventListener('keydown', (e) => this._onKeydown(e));

    this._mo = new MutationObserver(() => this._detectChildren());
    this._mo.observe(this, { childList: true });
    this._detectChildren();
  }

  disconnectedCallback() {
    this._mo?.disconnect();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _detectChildren() {
    this.toggleAttribute('has-children', this.querySelector(':scope > tsl-tree-item') !== null);
    this._sync();
  }

  /** Items currently reachable by keyboard: every row whose ancestors are all expanded. */
  _visibleRows() {
    const tree = this.closest('tsl-tree') || this;
    return Array.from(tree.querySelectorAll('tsl-tree-item')).filter((item) => {
      for (let p = item.parentElement; p && p !== tree; p = p.parentElement) {
        if (p instanceof TesselTreeItem && !p.expanded) return false;
      }
      return true;
    });
  }

  _onKeydown(e) {
    const hasChildren = this.hasAttribute('has-children');
    const rows = this._visibleRows();
    const at = rows.indexOf(this);
    switch (e.key) {
      case 'Enter': case ' ':
        e.preventDefault();
        this._row.click();
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (hasChildren && !this.expanded) this.expanded = true;
        else if (hasChildren) rows[at + 1]?._row.focus();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (hasChildren && this.expanded) this.expanded = false;
        else this.parentElement?.closest?.('tsl-tree-item')?._row.focus();
        break;
      case 'ArrowDown': e.preventDefault(); rows[at + 1]?._row.focus(); break;
      case 'ArrowUp': e.preventDefault(); rows[at - 1]?._row.focus(); break;
      case 'Home': e.preventDefault(); rows[0]?._row.focus(); break;
      case 'End': e.preventDefault(); rows.at(-1)?._row.focus(); break;
      default:
    }
  }

  _sync() {
    const hasChildren = this.hasAttribute('has-children');
    const expanded = this.expanded;
    this._label.textContent = this.getAttribute('label') || '';
    const icon = this.getAttribute('icon');
    const isFolder = this.hasAttribute('folder') || hasChildren;
    this._icon.replaceChildren();
    if (icon) this._icon.appendChild(createIcon(icon, 16));
    else this._icon.innerHTML = isFolder ? folderSvg(16) : fileSvg(16);
    this._row.className = cx(ROW, this.selected ? ROW_SELECTED : ROW_IDLE);
    // One tab stop for the whole tree: the selected row, or the first row while nothing is selected.
    const tree = this.closest('tsl-tree');
    const first = tree && !tree.querySelector('tsl-tree-item[selected]') && tree.querySelector('tsl-tree-item') === this;
    this._row.tabIndex = this.selected || first ? 0 : -1;
    this._row.setAttribute('aria-selected', this.selected ? 'true' : 'false');
    if (hasChildren) this._row.setAttribute('aria-expanded', String(expanded));
    else this._row.removeAttribute('aria-expanded');
    this._chevron.className = cx(CHEVRON, hasChildren ? (expanded ? 'visible rotate-90' : 'visible') : 'invisible');
    this._kids.className = cx(KIDS, expanded && hasChildren ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]');
    this._kids.inert = !expanded;
  }

  get expanded() { return this.hasAttribute('expanded'); }
  set expanded(v) { this.toggleAttribute('expanded', !!v); }

  get selected() { return this.hasAttribute('selected'); }
  set selected(v) { this.toggleAttribute('selected', !!v); }

  get label() { return this.getAttribute('label') || ''; }
}

export class TesselTree extends TesselElement {
  static styles = ':host{display:block;padding:4px;}';

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this.setAttribute('role', 'tree');
    this.shadowRoot.appendChild(h('slot'));
    this.addEventListener('tsl-tree-select', (e) => {
      for (const item of this.querySelectorAll('tsl-tree-item')) item.selected = item === e.detail.item;
      this.emit('change', { item: e.detail.item, label: e.detail.item.label });
    });
  }
}

define('tsl-tree-item', TesselTreeItem);
define('tsl-tree', TesselTree);
