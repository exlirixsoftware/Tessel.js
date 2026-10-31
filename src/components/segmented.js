// <tsl-segmented value="week">
//   <tsl-segment value="day" icon="calendar">Day</tsl-segment><tsl-segment value="week">Week</tsl-segment>
// </tsl-segmented>
// Port of Tessel.NET's SegmentedControl / SegmentedItem: a row of mutually exclusive options on a tinted
// track (min 72x30 segments, radius 6, selected segment lifts onto the surface color). Arrow keys move the
// selection (roving tabindex).

import { TesselElement, define } from '../core/base-element.js';
import { createIcon } from '../core/icons.js';
import { h, cx } from '../core/dom.js';

export class TesselSegment extends HTMLElement {
  connectedCallback() { this.hidden = true; }
  get value() { return this.getAttribute('value') ?? this.textContent.trim(); }
  get label() { return this.textContent.trim(); }
}
if (!customElements.get('tsl-segment')) customElements.define('tsl-segment', TesselSegment);

const TRACK = 'inline-flex gap-0.5 rounded-lg bg-subtle p-0.5 host-[disabled]:pointer-events-none host-[disabled]:opacity-45';
const SEGMENT = 'inline-flex min-h-[30px] min-w-[72px] cursor-pointer items-center justify-center gap-2 rounded-md border-0 px-3.5 text-body transition-colors duration-fast ease-tessel '
  + 'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent aria-disabled:pointer-events-none aria-disabled:opacity-45';
const SEGMENT_ON = 'bg-surface font-medium text-text shadow-sm';
const SEGMENT_OFF = 'bg-transparent text-text-secondary hover:bg-control-hover hover:text-text';

export class TesselSegmented extends TesselElement {
  static styles = ':host{display:inline-flex;}';
  static observedAttributes = ['value', 'disabled'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) { this._read(); return; }
    this._built = true;
    this._track = h('div', TRACK, { role: 'radiogroup' });
    this.shadowRoot.appendChild(this._track);
    this._track.addEventListener('keydown', (e) => this._onKeydown(e));
    this._mo = new MutationObserver(() => this._read());
    this._mo.observe(this, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'icon', 'value'] });
    this._read();
  }

  disconnectedCallback() { this._mo?.disconnect(); }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._render();
  }

  _segments() { return Array.from(this.children).filter((c) => c instanceof TesselSegment); }

  _read() {
    const segments = this._segments();
    if (!this.hasAttribute('value') && segments[0]) this.setAttribute('value', segments[0].value);
    this._track.replaceChildren(...segments.map((seg) => {
      const icon = seg.getAttribute('icon');
      const btn = h('button', SEGMENT, { type: 'button', role: 'radio', 'aria-disabled': seg.hasAttribute('disabled') ? 'true' : null },
        icon && createIcon(icon, 16), seg.label);
      btn.addEventListener('click', () => {
        if (seg.hasAttribute('disabled') || this.disabled || this.value === seg.value) return;
        this.value = seg.value;
        this.emit('change', { value: seg.value });
      });
      return btn;
    }));
    this._render();
  }

  _render() {
    const value = this.getAttribute('value');
    const segments = this._segments();
    Array.from(this._track.children).forEach((btn, i) => {
      const on = segments[i]?.value === value;
      btn.className = cx(SEGMENT, on ? SEGMENT_ON : SEGMENT_OFF);
      btn.setAttribute('aria-checked', String(on));
      btn.tabIndex = on ? 0 : -1;
    });
  }

  _onKeydown(e) {
    const buttons = Array.from(this._track.children).filter((b) => b.getAttribute('aria-disabled') !== 'true');
    const at = buttons.indexOf(this.shadowRoot.activeElement);
    const to = { ArrowRight: at + 1, ArrowDown: at + 1, ArrowLeft: at - 1, ArrowUp: at - 1, Home: 0, End: buttons.length - 1 }[e.key];
    if (to == null || !buttons.length) return;
    e.preventDefault();
    const btn = buttons[(to + buttons.length) % buttons.length];
    btn.focus();
    btn.click();
  }

  get value() { return this.getAttribute('value') || ''; }
  set value(v) { this.setAttribute('value', v); }
}

define('tsl-segmented', TesselSegmented);
