// <tsl-expander header="Details" [expanded]>content</tsl-expander> — port of components/Expander.java
// (46px header, chevron rotates 180deg, radius 8, 1px separator between header and body when open).

import { TesselElement, define } from '../core/base-element.js';
import { chevronSvg } from '../core/icons.js';

const STYLES = `
  :host{display:block;border-radius:var(--tsl-radius-lg);background:var(--tsl-surface);
    border:1px solid var(--tsl-border);overflow:hidden;}
  .header{display:flex;align-items:center;justify-content:space-between;height:46px;padding:0 12px 0 16px;
    cursor:pointer;font-size:14px;font-weight:600;color:var(--tsl-text);user-select:none;}
  .chevron-btn{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:4px;
    color:var(--tsl-text-secondary);transition:background var(--tsl-duration-fast) var(--tsl-ease);}
  .header:hover .chevron-btn{background:var(--tsl-control-hover);}
  .chevron-btn svg{transition:transform var(--tsl-duration-fast) var(--tsl-ease);}
  :host([expanded]) .chevron-btn svg{transform:rotate(180deg);}
  .body{border-top:1px solid transparent;padding:0 16px;max-height:0;overflow:hidden;
    transition:max-height var(--tsl-duration-slow) var(--tsl-ease), padding var(--tsl-duration-slow) var(--tsl-ease),
      border-color var(--tsl-duration-slow) var(--tsl-ease);}
  :host([expanded]) .body{border-top-color:var(--tsl-border);padding:16px;}
`;

export class TesselExpander extends TesselElement {
  static styles = STYLES;
  static observedAttributes = ['header', 'expanded'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const header = document.createElement('div');
    header.className = 'header';
    header.tabIndex = 0;
    header.setAttribute('role', 'button');
    this._headerText = document.createElement('span');
    const chevron = document.createElement('span');
    chevron.className = 'chevron-btn';
    chevron.innerHTML = chevronSvg('down', 16);
    header.append(this._headerText, chevron);
    this._body = document.createElement('div');
    this._body.className = 'body';
    const slot = document.createElement('slot');
    // A height change on the slotted content (e.g. text reflowing, an image loading) while expanded
    // should grow the cap along with it — otherwise it'd stay clipped at whatever height it opened at.
    // Uses the safe/instant path (see _applyHeight) since slotchange can fire while still inside a
    // hidden ancestor (a not-yet-shown tab/page), where scrollHeight would read 0.
    slot.addEventListener('slotchange', () => { if (this.expanded) this._applyHeight(true); });
    this._body.appendChild(slot);
    this.shadowRoot.append(header, this._body);

    const toggle = () => {
      this.expanded = !this.expanded;
      this.emit('toggle', { expanded: this.expanded });
    };
    header.addEventListener('click', toggle);
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
    this._headerText.textContent = this.getAttribute('header') || '';
    this._applyHeight(true); // instant: an expander that starts pre-expanded shouldn't animate open on load
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    this._headerText.textContent = this.getAttribute('header') || '';
    if (name === 'expanded') this._applyHeight(false);
  }

  /**
   * max-height can't transition to/from 'none' (it isn't an interpolatable value along with a
   * length), so an actual pixel height has to be measured and animated instead. `firstPaint` skips
   * both the transition AND the scrollHeight measurement: not just so a pre-expanded expander
   * doesn't visibly grow open on page load, but because it can legitimately start inside a hidden
   * container (a not-yet-shown tab/nav page) — scrollHeight always reads 0 there, and baking that in
   * as a fixed pixel cap would wrongly clip the content the moment the container becomes visible.
   * 'none' has no such problem; the first actual interactive collapse (only possible once the
   * expander is genuinely visible) measures a real height.
   */
  _applyHeight(firstPaint) {
    const body = this._body;
    if (!this.expanded) {
      // The collapse's starting height was already captured by the `expanded` setter, before the
      // attribute flip changed `.body`'s padding back to 0 — just animate down to closed from there.
      body.style.maxHeight = '0px';
      return;
    }
    if (firstPaint) {
      body.style.transition = 'none';
      body.style.maxHeight = 'none';
      body.getBoundingClientRect(); // commit the instant height above...
      body.style.transition = ''; // ...before transitions are re-enabled for later toggles
    } else {
      body.style.maxHeight = `${body.scrollHeight}px`;
    }
  }

  get expanded() { return this.hasAttribute('expanded'); }

  set expanded(v) {
    const next = !!v;
    if (!next && this.expanded && this._body) {
      // Capture the true, fully-open height (padding included) while still expanded — a moment
      // later the attribute flip below sets padding back to 0, which would otherwise shrink
      // `scrollHeight` first and make the collapse animation start from the wrong height.
      this._body.style.maxHeight = `${this._body.scrollHeight}px`;
      this._body.getBoundingClientRect();
    }
    this.toggleAttribute('expanded', next);
  }
}

define('tsl-expander', TesselExpander);
