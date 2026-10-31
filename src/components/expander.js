// <tsl-expander header="Details" [expanded]>content</tsl-expander> — port of components/Expander.java and
// Tessel.NET's Expander (46px header, chevron rotates 180deg, radius 8, 1px separator between header and body
// when open). The body animates a CSS grid row (0fr -> 1fr), so no height is ever measured in JS.

import { TesselElement, define } from '../core/base-element.js';
import { chevronSvg } from '../core/icons.js';
import { h, html, cx } from '../core/dom.js';

const ROOT = 'overflow-hidden rounded-lg border border-border bg-surface';
const HEADER = 'group flex h-[46px] cursor-pointer select-none items-center justify-between pl-4 pr-3 text-body font-semibold text-text '
  + 'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent';
const CHEVRON = 'flex size-7 items-center justify-center rounded-sm text-text-secondary transition-[background-color,transform] duration-fast ease-tessel group-hover:bg-control-hover';
const BODY = 'grid border-t transition-[grid-template-rows,border-color] duration-slow ease-tessel';

export class TesselExpander extends TesselElement {
  static styles = ':host{display:block;}';
  static observedAttributes = ['header', 'expanded'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._headerText = h('span');
    this._chevron = html('span', CHEVRON, chevronSvg('down', 16));
    this._header = h('div', HEADER, { tabindex: '0', role: 'button' }, this._headerText, this._chevron);
    this._body = h('div', BODY, null, h('div', 'min-h-0 overflow-hidden', null, h('div', 'p-4', null, h('slot'))));
    this.shadowRoot.appendChild(h('div', ROOT, null, this._header, this._body));

    const toggle = () => {
      this.expanded = !this.expanded;
      this.emit('toggle', { expanded: this.expanded });
    };
    this._header.addEventListener('click', toggle);
    this._header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    const expanded = this.expanded;
    this._headerText.textContent = this.getAttribute('header') || '';
    this._header.setAttribute('aria-expanded', String(expanded));
    this._chevron.className = cx(CHEVRON, expanded && 'rotate-180');
    this._body.className = cx(BODY, expanded ? 'grid-rows-[1fr] border-border' : 'grid-rows-[0fr] border-transparent');
    this._body.inert = !expanded;
  }

  get expanded() { return this.hasAttribute('expanded'); }
  set expanded(v) { this.toggleAttribute('expanded', !!v); }
}

define('tsl-expander', TesselExpander);
