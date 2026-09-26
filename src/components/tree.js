// <tsl-tree>
//   <tsl-tree-item label="src" expanded>
//     <tsl-tree-item label="index.js"></tsl-tree-item>
//   </tsl-tree-item>
// </tsl-tree>
// Port of TesselTreeUI (32px rows, chevron expand icons, 8/14px indent, selected = subtle fill
// + 3px accent bar, folder/file vector icons). Nesting is expressed with real nested <tsl-tree-item>s,
// so each level's own padding provides the cumulative indent.

import { TesselElement, define } from '../core/base-element.js';
import { chevronSvg, folderSvg, fileSvg, createIcon } from '../core/icons.js';

const ITEM_STYLES = `
  :host{display:block;}
  .row{position:relative;display:flex;align-items:center;gap:8px;height:32px;padding:0 8px 0 2px;
    border-radius:var(--tsl-radius-sm);color:var(--tsl-text);font-size:14px;cursor:pointer;user-select:none;
    transition:background var(--tsl-duration-fast) var(--tsl-ease);}
  .row:hover{background:var(--tsl-control-hover);}
  :host([selected]) > .row{background:var(--tsl-subtle);}
  :host([selected]) > .row::before{content:"";position:absolute;left:-2px;top:8px;bottom:8px;width:3px;
    border-radius:1.5px;background:var(--tsl-accent);}
  .chevron{flex:none;width:16px;height:16px;display:flex;align-items:center;justify-content:center;
    color:var(--tsl-text-secondary);transition:transform var(--tsl-duration-fast) var(--tsl-ease);visibility:hidden;}
  :host([has-children]) .chevron{visibility:visible;}
  :host([expanded]) .chevron{transform:rotate(90deg);}
  .icon{flex:none;display:flex;color:var(--tsl-accent);}
  .label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .children{overflow:hidden;padding-left:22px;max-height:0;
    transition:max-height var(--tsl-duration-slow) var(--tsl-ease);}
`;

export class TesselTreeItem extends TesselElement {
  static styles = ITEM_STYLES;
  static observedAttributes = ['label', 'icon', 'expanded', 'selected', 'folder'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) { this._detectChildren(); return; }
    this._built = true;

    const row = document.createElement('div');
    row.className = 'row';
    row.tabIndex = 0;
    row.setAttribute('role', 'treeitem');
    this._chevron = document.createElement('span');
    this._chevron.className = 'chevron';
    this._chevron.innerHTML = chevronSvg('right', 14);
    this._icon = document.createElement('span');
    this._icon.className = 'icon';
    this._label = document.createElement('span');
    this._label.className = 'label';
    row.append(this._chevron, this._icon, this._label);

    this._children = document.createElement('div');
    this._children.className = 'children';
    const slot = document.createElement('slot');
    // A child being added/removed changes this container's natural height while it's expanded —
    // recompute so the cap tracks it. Uses the safe/instant path (see _applyHeight) since slotchange
    // fires during initial parsing too, potentially while still inside a hidden ancestor (a
    // not-yet-shown nav page/tab), where scrollHeight would read 0.
    slot.addEventListener('slotchange', () => { if (this.expanded) this._applyHeight(true); });
    this._children.appendChild(slot);

    this.shadowRoot.append(row, this._children);

    row.addEventListener('click', () => {
      if (this.hasAttribute('has-children')) this.expanded = !this.expanded;
      this.dispatchEvent(new CustomEvent('tsl-tree-select', { bubbles: true, composed: true, detail: { item: this } }));
    });
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); row.click(); }
    });

    this._mo = new MutationObserver(() => this._detectChildren());
    this._mo.observe(this, { childList: true });

    this._sync();
    this._detectChildren();
    this._applyHeight(true); // instant: an item that starts pre-expanded shouldn't animate open on load
  }

  disconnectedCallback() {
    this._mo?.disconnect();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    this._sync();
    if (name === 'expanded') this._applyHeight(false);
  }

  _detectChildren() {
    const has = this.querySelector('tsl-tree-item') !== null;
    this.toggleAttribute('has-children', has);
    this._sync();
    // A child being added/removed changes this container's natural height while it's expanded —
    // recompute so the cap tracks it. Uses the `firstPaint` (`max-height:none`, no measurement)
    // path rather than a live animated one: during initial HTML parsing this can fire while still
    // inside a hidden ancestor (see _applyHeight's comment), and at that point there's no reliable
    // height to animate to anyway.
    if (this.expanded) this._applyHeight(true);
  }

  /**
   * max-height can't transition to/from 'none' (it isn't an interpolatable value along with a
   * length), so an actual pixel height has to be measured and animated instead — same technique as
   * <tsl-expander>. `firstPaint` skips the transition (and the scrollHeight measurement) for a
   * pre-expanded item: not just to avoid animating open on load, but because a tree can perfectly
   * legitimately start inside a hidden container (a not-yet-shown nav page or tab) — scrollHeight
   * always reads 0 there, so baking that in as a fixed pixel cap would wrongly clip the content the
   * moment the container becomes visible. `max-height:none` has no such problem; the first actual
   * interactive collapse (only possible once the tree is genuinely visible) measures a real height.
   */
  _applyHeight(firstPaint) {
    const kids = this._children;
    if (!this.expanded) {
      // The collapse's starting height was already captured by the `expanded` setter, before
      // anything that shrinks scrollHeight (e.g. a since-removed child) could take effect. No need
      // to notify the parent: shrinking is accommodated automatically by normal box flow (max-height
      // only ever caps; a smaller child just leaves its parent's box smaller too), and propagating
      // here would make every collapsed leaf in the tree force its ancestors to redundantly
      // re-measure — including during the fragile initial-settling window where a still-hidden
      // ancestor would wrongly measure 0 and clobber the safe value `firstPaint` had just set.
      kids.style.maxHeight = '0px';
      return;
    }
    if (firstPaint) {
      kids.style.transition = 'none';
      kids.style.maxHeight = 'none';
      kids.getBoundingClientRect(); // commit the instant height above...
      kids.style.transition = ''; // ...before transitions are re-enabled for later toggles
      // 'none' accommodates any content height, so there's nothing an ancestor needs to grow to fit —
      // and (still-settling) ancestors may not have a reliable height to measure at this point anyway.
      return;
    }
    kids.style.maxHeight = `${kids.scrollHeight}px`;
    this._notifyParentHeightChange();
  }

  /** Growing/shrinking changes this item's own rendered height — an expanded ancestor's fixed
   * max-height cap needs to grow/shrink along with it, or its content would end up clipped. */
  _notifyParentHeightChange() {
    const parent = this.parentElement;
    if (parent instanceof TesselTreeItem && parent.expanded) parent._applyHeight(false);
  }

  _sync() {
    this._label.textContent = this.getAttribute('label') || '';
    const icon = this.getAttribute('icon');
    const hasChildren = this.hasAttribute('has-children');
    const isFolder = this.hasAttribute('folder') || hasChildren;
    this._icon.innerHTML = '';
    if (icon) this._icon.appendChild(createIcon(icon, 16));
    else this._icon.innerHTML = isFolder ? folderSvg(16) : fileSvg(16);
  }

  get expanded() { return this.hasAttribute('expanded'); }

  set expanded(v) {
    const next = !!v;
    if (!next && this.expanded && this._children) {
      // Capture the true, fully-open height while still expanded, before the attribute flip below
      // could let anything (a slotchange, a parent re-measure) shrink scrollHeight out from under it.
      this._children.style.maxHeight = `${this._children.scrollHeight}px`;
      this._children.getBoundingClientRect();
    }
    this.toggleAttribute('expanded', next);
  }

  get selected() { return this.hasAttribute('selected'); }
  set selected(v) { this.toggleAttribute('selected', !!v); }

  get label() { return this.getAttribute('label') || ''; }
}

const TREE_STYLES = `:host{display:block;padding:4px;}`;

export class TesselTree extends TesselElement {
  static styles = TREE_STYLES;

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this.setAttribute('role', 'tree');
    this.shadowRoot.appendChild(document.createElement('slot'));
    this.addEventListener('tsl-tree-select', (e) => {
      for (const item of this.querySelectorAll('tsl-tree-item')) item.selected = item === e.detail.item;
      this.emit('change', { item: e.detail.item, label: e.detail.item.label });
    });
  }
}

define('tsl-tree-item', TesselTreeItem);
define('tsl-tree', TesselTree);
