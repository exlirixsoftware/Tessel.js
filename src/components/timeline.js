// <tsl-timeline [orientation="horizontal"] [layout="alternate"] [item-width="200"]>
//   <tsl-timeline-item header="Order placed" timestamp="10:02" icon="shop" kind="success">Payment received.</tsl-timeline-item>
//   <tsl-timeline-item header="Out for delivery" timestamp="Tomorrow" pending></tsl-timeline-item>
// </tsl-timeline>
// Port of Tessel.NET's Timeline / TimelineItem (1.2.0): events in chronological order, each with a marker on a
// connecting line, a header, a description (the content), an optional timestamp and icon. `kind` colors the
// marker (neutral | accent | success | warning | danger | info), `pending` draws a hollow dashed marker for an
// event that hasn't happened yet. `layout="alternate"` alternates the two sides of the line; `orientation=
// "horizontal"` lays it out sideways (scrolls). Timestamp columns are shared so vertical markers line up.
//
// Each item draws itself (marker, line, text); the timeline just tells it where it sits (first/last, side).

import { TesselElement, define } from '../core/base-element.js';
import { createIcon } from '../core/icons.js';
import { h, cx } from '../core/dom.js';

const KINDS = {
  neutral: { marker: 'bg-text-tertiary text-surface', dot: 'bg-text-tertiary ring-subtle', hollow: 'border-text-tertiary text-text-tertiary' },
  accent: { marker: 'bg-accent text-on-accent', dot: 'bg-accent ring-accent-subtle', hollow: 'border-accent text-accent' },
  success: { marker: 'bg-success text-surface', dot: 'bg-success ring-success-subtle', hollow: 'border-success text-success' },
  warning: { marker: 'bg-warning text-surface', dot: 'bg-warning ring-warning-subtle', hollow: 'border-warning text-warning' },
  danger: { marker: 'bg-danger text-white', dot: 'bg-danger ring-danger-subtle', hollow: 'border-danger text-danger' },
  info: { marker: 'bg-info text-surface', dot: 'bg-info ring-info-subtle', hollow: 'border-info text-info' },
};

export class TesselTimelineItem extends TesselElement {
  static styles = ':host{display:block;}';
  static observedAttributes = ['header', 'timestamp', 'icon', 'kind', 'pending', 'tl-orientation', 'tl-layout', 'tl-side', 'tl-first', 'tl-last'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._root = h('div');
    this.shadowRoot.appendChild(this._root);
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  /** Natural width of the timestamp text — the timeline uses the widest one for every item's column. */
  get timestampWidth() {
    return this._stamp?.firstElementChild?.offsetWidth ?? 0;
  }

  _marker() {
    const kind = KINDS[this.getAttribute('kind')] || KINDS.accent;
    const icon = this.getAttribute('icon');
    if (this.hasAttribute('pending')) {
      return h('span', cx('flex size-6 flex-none items-center justify-center rounded-full border-2 border-dashed bg-surface opacity-60', kind.hollow), null, icon && createIcon(icon, 12));
    }
    if (icon) return h('span', cx('flex size-6 flex-none items-center justify-center rounded-full', kind.marker), null, createIcon(icon, 14));
    return h('span', 'flex size-6 flex-none items-center justify-center', null, h('span', cx('size-3 rounded-full ring-4', kind.dot)));
  }

  _line(vertical) {
    const dashed = this.hasAttribute('pending');
    return h('span', cx('flex-1 bg-border-strong', vertical ? 'w-0.5 min-h-4' : 'h-0.5 min-w-4', dashed && 'opacity-40'));
  }

  _sync() {
    const vertical = this.getAttribute('tl-orientation') !== 'horizontal';
    const alternate = this.getAttribute('tl-layout') === 'alternate';
    const side = this.getAttribute('tl-side') || 'end'; // which side of the line the text sits on
    const first = this.hasAttribute('tl-first');
    const last = this.hasAttribute('tl-last');
    const header = this.getAttribute('header');
    const timestamp = this.getAttribute('timestamp');
    const pending = this.hasAttribute('pending');
    const tone = pending ? 'text-text-secondary' : 'text-text';

    this._stamp = timestamp ? h('div', 'flex-none pt-1 text-right text-caption text-text-secondary', { style: { width: 'var(--tsl-tl-ts, auto)' } },
      h('span', 'inline-block whitespace-nowrap', null, timestamp)) : null;
    const text = (align) => h('div', cx('min-w-0', align), null,
      header && h('div', cx('text-body font-semibold', tone), null, header),
      h('div', cx('text-body text-text-secondary', pending && 'opacity-70'), null, h('slot')));
    const stamp = (align) => timestamp && h('div', cx('whitespace-nowrap text-caption text-text-secondary', align), null, timestamp);

    let layout;
    if (vertical && !alternate) {
      layout = h('div', 'flex gap-4', null,
        this._stamp || h('div', 'flex-none', { style: { width: 'var(--tsl-tl-ts, 0px)' } }),
        h('div', 'flex flex-none flex-col items-center', null,
          h('span', cx('h-1 w-0.5 flex-none', first ? 'bg-transparent' : 'bg-border-strong')), this._marker(), last ? h('span', 'flex-1') : this._line(true)),
        h('div', cx('min-w-0 flex-1', last ? '' : 'pb-6'), null, h('div', 'pt-1', null, text(''))));
    } else if (vertical) {
      const textCol = h('div', cx('min-w-0', last ? '' : 'pb-6'), null, h('div', 'pt-1', null, text(side === 'start' ? 'text-right' : '')));
      const stampCol = h('div', cx('min-w-0 pt-1.5', side === 'start' ? 'text-left' : 'text-right'), null, stamp(''));
      layout = h('div', 'grid grid-cols-[1fr_auto_1fr] gap-x-4', null,
        side === 'start' ? textCol : stampCol,
        h('div', 'flex flex-col items-center', null,
          h('span', cx('h-1 w-0.5 flex-none', first ? 'bg-transparent' : 'bg-border-strong')), this._marker(), last ? h('span', 'flex-1') : this._line(true)),
        side === 'start' ? stampCol : textCol);
    } else {
      const markerRow = h('div', 'flex items-center', null,
        h('span', cx('h-0.5 flex-1', first ? 'bg-transparent' : 'bg-border-strong')), this._marker(), last ? h('span', 'flex-1') : this._line(false));
      const body = h('div', 'min-w-0 px-2', null, stamp('mb-0.5'), text(''));
      layout = alternate
        ? h('div', 'grid h-full grid-rows-[1fr_auto_1fr] gap-y-2', null,
          h('div', 'flex flex-col justify-end', null, side === 'start' && body), markerRow, h('div', '', null, side !== 'start' && body))
        : h('div', 'flex flex-col gap-2', null, markerRow, body);
    }
    this._root.className = vertical ? '' : 'h-full';
    this._root.replaceChildren(layout);
  }
}

export class TesselTimeline extends TesselElement {
  static styles = ':host{display:block;}';
  static observedAttributes = ['orientation', 'layout', 'item-width'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) { this._arrange(); return; }
    this._built = true;
    this._scroller = h('div', '', null, h('slot'));
    this.shadowRoot.appendChild(this._scroller);
    this._scroller.addEventListener('wheel', (e) => {
      // A vertical wheel scrolls a horizontal timeline sideways.
      if (this.getAttribute('orientation') !== 'horizontal' || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      this._scroller.scrollLeft += e.deltaY;
      e.preventDefault();
    }, { passive: false });
    this._mo = new MutationObserver(() => this._arrange());
    this._mo.observe(this, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['timestamp', 'header'] });
    // A timeline inside a not-yet-shown page/tab has no layout to measure; measure again once it gets one.
    this._ro = new ResizeObserver(() => this._measure());
    this._ro.observe(this);
    this._arrange();
  }

  disconnectedCallback() { this._mo?.disconnect(); this._ro?.disconnect(); }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._arrange();
  }

  _arrange() {
    const items = Array.from(this.children).filter((c) => c instanceof TesselTimelineItem);
    const horizontal = this.getAttribute('orientation') === 'horizontal';
    const alternate = this.getAttribute('layout') === 'alternate';
    const width = this.getAttribute('item-width');
    // <slot> is display:contents, so the slotted items are flex items of this row — equal heights keep the
    // markers of an alternating horizontal timeline on one line.
    this._scroller.className = horizontal ? 'flex items-stretch overflow-x-auto pb-2 scrollbar-thin' : '';
    items.forEach((item, i) => {
      item.setAttribute('tl-orientation', horizontal ? 'horizontal' : 'vertical');
      item.setAttribute('tl-layout', alternate ? 'alternate' : 'standard');
      item.setAttribute('tl-side', alternate && i % 2 === 0 ? 'start' : 'end');
      item.toggleAttribute('tl-first', i === 0);
      item.toggleAttribute('tl-last', i === items.length - 1);
      item.style.flex = horizontal ? 'none' : '';
      item.style.width = horizontal && width !== 'auto' ? `${Number(width) || 200}px` : '';
    });
    requestAnimationFrame(() => this._measure());
  }

  /** Shares the widest timestamp across the vertical column so every marker lines up. */
  _measure() {
    const items = Array.from(this.children).filter((c) => c instanceof TesselTimelineItem);
    const standard = this.getAttribute('orientation') !== 'horizontal' && this.getAttribute('layout') !== 'alternate';
    const widest = standard ? Math.max(0, ...items.map((i) => i.timestampWidth)) : 0;
    if (widest) this.style.setProperty('--tsl-tl-ts', `${widest}px`);
    else this.style.removeProperty('--tsl-tl-ts');
  }
}

define('tsl-timeline-item', TesselTimelineItem);
define('tsl-timeline', TesselTimeline);
