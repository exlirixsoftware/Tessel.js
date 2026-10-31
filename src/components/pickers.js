// Pickers ported from Tessel.NET's Pickers.xaml / ColorRating.xaml / DatePicker.xaml:
//   <tsl-calendar value="2026-10-31" min max first-day="1">
//   <tsl-date-picker value="2026-10-31" placeholder="Pick a date" header="Due date" min max>
//   <tsl-time-picker value="14:30" [hour24] minute-increment="5" header placeholder>
//   <tsl-color-picker value="#4f46e5" [alpha] [no-hex]>
//
// Values are plain strings: dates as YYYY-MM-DD, times as 24h HH:MM, colors as #rrggbb (#rrggbbaa with
// `alpha`). Every picker fires `change` with { value }; the color picker also fires `input` while dragging.

import { TesselElement, define } from '../core/base-element.js';
import { createIcon, chevronSvg } from '../core/icons.js';
import { h, html, cx } from '../core/dom.js';
import { openPopup, closePopup, popupIsOpen, POPUP_BASE } from '../core/popup.js';

const HEADER = 'mb-1.5 block text-body font-medium text-text';
const CONTROL = 'flex h-8 w-full cursor-pointer items-center gap-2 rounded-md border border-border bg-control px-3 text-body text-text '
  + 'transition-colors duration-fast ease-tessel hover:bg-control-hover focus-visible:outline-2 focus-visible:outline-offset-2 '
  + 'focus-visible:outline-accent host-[open]:border-accent host-[disabled]:pointer-events-none host-[disabled]:opacity-45';
const POPUP = `${POPUP_BASE} z-50 rounded-lg p-3 shadow-flyout`;

// ---------------------------------------------------------------- date helpers

const pad = (n) => String(n).padStart(2, '0');
export const toIso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export function fromIso(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) || d.getMonth() !== Number(m[2]) - 1 ? null : d;
}
const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const locale = () => (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

/** 0 = Sunday … 6 = Saturday, from the browser locale when it can tell us (Monday in most of Europe). */
function localeFirstDay() {
  try {
    const info = new Intl.Locale(locale());
    const first = (info.getWeekInfo?.() ?? info.weekInfo)?.firstDay;
    if (first) return first % 7;
  } catch { /* fall through */ }
  return 0;
}

// ---------------------------------------------------------------- <tsl-calendar>

const NAV = 'flex size-8 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 text-text-secondary hover:bg-control-hover hover:text-text '
  + 'disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-accent';
const DAY = 'flex size-9 cursor-pointer items-center justify-center rounded-md border border-transparent bg-transparent p-0 text-body tabular-nums transition-colors duration-fast '
  + 'focus-visible:outline-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-30';

export class TesselCalendar extends TesselElement {
  static styles = ':host{display:inline-block;}';
  static observedAttributes = ['value', 'min', 'max', 'first-day'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._mode = 'days';
    const base = fromIso(this.getAttribute('value')) || new Date();
    this._view = new Date(base.getFullYear(), base.getMonth(), 1);
    this._focus = base;
    this._root = h('div', 'w-[280px] select-none');
    this.shadowRoot.appendChild(this._root);
    this._render();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === 'value') {
      const d = fromIso(newV);
      if (d) { this._view = new Date(d.getFullYear(), d.getMonth(), 1); this._focus = d; }
    }
    this._render();
  }

  get value() { return this.getAttribute('value') || ''; }
  set value(v) { this.setAttribute('value', v); }

  get _min() { return fromIso(this.getAttribute('min')); }
  get _max() { return fromIso(this.getAttribute('max')); }
  _disabledDay(d) { return (this._min && d < this._min) || (this._max && d > this._max); }

  _firstDay() {
    return this.hasAttribute('first-day') ? Number(this.getAttribute('first-day')) % 7 : localeFirstDay();
  }

  _go(months) {
    this._view = new Date(this._view.getFullYear(), this._view.getMonth() + months, 1);
    this._render();
  }

  _pick(d) {
    if (this._disabledDay(d)) return;
    this.setAttribute('value', toIso(d));
    this.emit('change', { value: toIso(d) });
  }

  _render() {
    const fmt = (opts) => new Intl.DateTimeFormat(locale(), opts);
    const label = this._mode === 'days' ? fmt({ month: 'long', year: 'numeric' }).format(this._view)
      : this._mode === 'months' ? String(this._view.getFullYear())
        : `${Math.floor(this._view.getFullYear() / 12) * 12} – ${Math.floor(this._view.getFullYear() / 12) * 12 + 11}`;
    const step = this._mode === 'days' ? 1 : this._mode === 'months' ? 12 : 144;
    const title = h('button', 'flex-1 cursor-pointer rounded-sm border-0 bg-transparent px-2 py-1 text-body font-semibold text-text hover:bg-control-hover focus-visible:outline-2 focus-visible:outline-accent', { type: 'button' }, label);
    title.addEventListener('click', () => { this._mode = this._mode === 'days' ? 'months' : this._mode === 'months' ? 'years' : 'days'; this._render(); });
    const nav = (dir) => {
      const b = html('button', NAV, chevronSvg(dir > 0 ? 'right' : 'left', 14));
      b.type = 'button';
      b.setAttribute('aria-label', dir > 0 ? 'Next' : 'Previous');
      b.addEventListener('click', () => this._go(dir * step));
      return b;
    };
    this._root.replaceChildren(h('div', 'mb-2 flex items-center gap-1', null, nav(-1), title, nav(1)), this._body());
    if (this._refocus) { this._refocus = false; this._root.querySelector(`[data-iso="${toIso(this._focus)}"]`)?.focus(); }
  }

  _body() {
    if (this._mode === 'months') {
      const grid = h('div', 'grid grid-cols-3 gap-1');
      for (let m = 0; m < 12; m++) {
        const on = this._view.getMonth() === m;
        const b = h('button', cx('h-12 cursor-pointer rounded-md border-0 text-body focus-visible:outline-2 focus-visible:outline-accent', on ? 'bg-accent text-on-accent' : 'bg-transparent text-text hover:bg-control-hover'), { type: 'button' },
          new Intl.DateTimeFormat(locale(), { month: 'short' }).format(new Date(2000, m, 1)));
        b.addEventListener('click', () => { this._view = new Date(this._view.getFullYear(), m, 1); this._mode = 'days'; this._render(); });
        grid.appendChild(b);
      }
      return grid;
    }
    if (this._mode === 'years') {
      const start = Math.floor(this._view.getFullYear() / 12) * 12;
      const grid = h('div', 'grid grid-cols-3 gap-1');
      for (let y = start; y < start + 12; y++) {
        const on = this._view.getFullYear() === y;
        const b = h('button', cx('h-12 cursor-pointer rounded-md border-0 text-body tabular-nums focus-visible:outline-2 focus-visible:outline-accent', on ? 'bg-accent text-on-accent' : 'bg-transparent text-text hover:bg-control-hover'), { type: 'button' }, String(y));
        b.addEventListener('click', () => { this._view = new Date(y, this._view.getMonth(), 1); this._mode = 'months'; this._render(); });
        grid.appendChild(b);
      }
      return grid;
    }
    const first = this._firstDay();
    const grid = h('div', 'grid grid-cols-7 gap-y-0.5 place-items-center', { role: 'grid' });
    const weekday = new Intl.DateTimeFormat(locale(), { weekday: 'short' });
    for (let i = 0; i < 7; i++) {
      grid.appendChild(h('div', 'flex size-9 items-center justify-center text-caption font-medium text-text-tertiary', null,
        weekday.format(new Date(2023, 0, 1 + ((first + i) % 7))).slice(0, 2)));
    }
    const lead = (this._view.getDay() - first + 7) % 7;
    const selected = fromIso(this.getAttribute('value'));
    const today = new Date();
    for (let i = 0; i < 42; i++) {
      const d = addDays(this._view, i - lead);
      const outside = d.getMonth() !== this._view.getMonth();
      const isSel = sameDay(d, selected);
      const b = h('button', cx(DAY, isSel ? 'bg-accent font-medium text-on-accent hover:bg-accent-hover'
        : cx('hover:bg-control-hover', outside ? 'text-text-tertiary' : 'text-text', sameDay(d, today) && 'border-accent')), {
        type: 'button', 'data-iso': toIso(d), tabindex: sameDay(d, this._focus) ? '0' : '-1', 'aria-selected': String(isSel), disabled: !!this._disabledDay(d),
        'aria-label': d.toDateString(),
      }, String(d.getDate()));
      b.addEventListener('click', () => this._pick(d));
      b.addEventListener('keydown', (e) => this._onKey(e, d));
      grid.appendChild(b);
    }
    return grid;
  }

  _onKey(e, d) {
    const move = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    let next = null;
    if (move) next = addDays(d, move);
    else if (e.key === 'PageUp' || e.key === 'PageDown') next = new Date(d.getFullYear(), d.getMonth() + (e.key === 'PageUp' ? -1 : 1), d.getDate());
    else if (e.key === 'Home') next = addDays(d, -((d.getDay() - this._firstDay() + 7) % 7));
    else if (e.key === 'End') next = addDays(d, 6 - ((d.getDay() - this._firstDay() + 7) % 7));
    if (!next) return;
    e.preventDefault();
    this._focus = next;
    this._view = new Date(next.getFullYear(), next.getMonth(), 1);
    this._refocus = true;
    this._render();
  }
}

// ---------------------------------------------------------------- shared dropdown-field base

class TesselDropdownField extends TesselElement {
  static styles = ':host{display:inline-flex;flex-direction:column;width:220px;}';
  static observedAttributes = ['value', 'placeholder', 'header', 'disabled'];
  /** Material name of the leading icon. */
  static icon = 'calendar';

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._header = h('label', HEADER);
    this._text = h('span', 'min-w-0 flex-1 truncate text-left');
    this._control = h('button', CONTROL, { type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': 'false' },
      h('span', 'flex flex-none text-text-secondary', null, createIcon(this.constructor.icon, 16)), this._text);
    this._popup = h('div', POPUP, { popover: 'manual', role: 'dialog' });
    this.shadowRoot.append(this._header, this._control, this._popup);
    this._control.addEventListener('click', () => (popupIsOpen(this._popup) ? this.close() : this.openPicker()));
    this._build(this._popup);
    this._sync();
  }

  disconnectedCallback() {
    if (this._popup) closePopup(this._popup);
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    const display = this._display();
    this._text.textContent = display || this.getAttribute('placeholder') || '';
    this._text.classList.toggle('text-text-tertiary', !display);
    this._header.textContent = this.getAttribute('header') || '';
    this._header.hidden = !this.hasAttribute('header');
    this._control.disabled = this.disabled;
    this._update?.();
  }

  openPicker() {
    if (this.disabled) return;
    this.setAttribute('open', '');
    this._control.setAttribute('aria-expanded', 'true');
    openPopup(this._popup, this._control, { owner: this, onDismiss: () => this._closed() });
    this._opened?.();
  }

  close() {
    closePopup(this._popup);
    this._closed();
  }

  _closed() {
    this.removeAttribute('open');
    this._control?.setAttribute('aria-expanded', 'false');
  }

  get value() { return this.getAttribute('value') || ''; }
  set value(v) { this.setAttribute('value', v); }
}

// ---------------------------------------------------------------- <tsl-date-picker>

export class TesselDatePicker extends TesselDropdownField {
  static observedAttributes = [...TesselDropdownField.observedAttributes, 'min', 'max', 'first-day'];
  static icon = 'calendar';

  _build(popup) {
    this._cal = h('tsl-calendar');
    this._cal.addEventListener('change', (e) => {
      e.stopPropagation();
      this.value = e.detail.value;
      this.emit('change', { value: e.detail.value });
      this.close();
      this._control.focus();
    });
    popup.appendChild(this._cal);
  }

  _display() {
    const d = fromIso(this.getAttribute('value'));
    return d ? new Intl.DateTimeFormat(locale(), { dateStyle: 'medium' }).format(d) : '';
  }

  _update() {
    for (const attr of ['value', 'min', 'max', 'first-day']) {
      if (this.hasAttribute(attr)) this._cal.setAttribute(attr, this.getAttribute(attr));
      else this._cal.removeAttribute(attr);
    }
  }

  _opened() {
    requestAnimationFrame(() => (this._cal.shadowRoot.querySelector('[tabindex="0"]:not([disabled])') || this._cal.shadowRoot.querySelector('button'))?.focus());
  }
}

// ---------------------------------------------------------------- <tsl-time-picker>

const COL = 'flex max-h-56 w-14 flex-col gap-0.5 overflow-y-auto pr-0.5 scrollbar-thin';
const CELL = 'flex h-8 flex-none cursor-pointer items-center justify-center rounded-sm border-0 text-body tabular-nums focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent';

export class TesselTimePicker extends TesselDropdownField {
  static observedAttributes = [...TesselDropdownField.observedAttributes, 'hour24', 'minute-increment'];
  static icon = 'clock';

  get _hour24() {
    if (this.hasAttribute('hour24')) return this.getAttribute('hour24') !== 'false';
    try { return !new Intl.DateTimeFormat(locale(), { hour: 'numeric' }).resolvedOptions().hour12; } catch { return true; }
  }

  _parts() {
    const m = /^(\d{1,2}):(\d{2})$/.exec(this.getAttribute('value') || '');
    return m ? { h: Number(m[1]) % 24, m: Number(m[2]) % 60 } : null;
  }

  _display() {
    const t = this._parts();
    if (!t) return '';
    return new Intl.DateTimeFormat(locale(), { hour: 'numeric', minute: '2-digit', hour12: !this._hour24 }).format(new Date(2000, 0, 1, t.h, t.m));
  }

  _build(popup) {
    this._cols = h('div', 'flex gap-2');
    popup.appendChild(this._cols);
  }

  _update() { this._renderCols(); }
  _opened() {
    this._renderCols();
    requestAnimationFrame(() => this._cols.querySelectorAll('[aria-selected="true"]').forEach((el) => el.scrollIntoView({ block: 'center' })));
  }

  _set(hh, mm) {
    const value = `${pad(hh)}:${pad(mm)}`;
    this.setAttribute('value', value);
    this.emit('change', { value });
  }

  _renderCols() {
    const t = this._parts() || { h: 0, m: 0 };
    const h24 = this._hour24;
    const step = Math.max(1, Number(this.getAttribute('minute-increment')) || 1);
    const cell = (label, on, onClick) => {
      const b = h('button', cx(CELL, on ? 'bg-accent font-medium text-on-accent' : 'bg-transparent text-text hover:bg-control-hover'), { type: 'button', 'aria-selected': String(on) }, label);
      b.addEventListener('click', onClick);
      return b;
    };
    const hours = h24 ? Array.from({ length: 24 }, (_, i) => i) : Array.from({ length: 12 }, (_, i) => i + 1);
    const hourCol = h('div', COL, null, ...hours.map((v) => cell(pad(v), h24 ? v === t.h : (t.h % 12 || 12) === v,
      () => this._set(h24 ? v : (v % 12) + (t.h >= 12 ? 12 : 0), t.m))));
    const minuteCol = h('div', COL, null, ...Array.from({ length: Math.ceil(60 / step) }, (_, i) => i * step).map((v) =>
      cell(pad(v), v === t.m, () => this._set(t.h, v))));
    this._cols.replaceChildren(hourCol, minuteCol);
    if (!h24) {
      this._cols.appendChild(h('div', 'flex flex-col gap-0.5', null,
        cell('AM', t.h < 12, () => this._set(t.h % 12, t.m)),
        cell('PM', t.h >= 12, () => this._set((t.h % 12) + 12, t.m))));
    }
  }
}

// ---------------------------------------------------------------- <tsl-color-picker>

const CHECKER = 'bg-[length:8px_8px] bg-[linear-gradient(45deg,#8884_25%,transparent_25%,transparent_75%,#8884_75%),linear-gradient(45deg,#8884_25%,transparent_25%,transparent_75%,#8884_75%)] bg-[position:0_0,4px_4px]';

function hsvToRgb(hh, s, v) {
  const f = (n) => { const k = (n + hh / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
  return [f(5), f(3), f(1)].map((c) => Math.round(c * 255));
}
function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
  let hue = 0;
  if (d) {
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
  }
  return { h: (hue * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}
const hex2 = (n) => Math.round(n).toString(16).padStart(2, '0');

function parseHex(str) {
  const m = /^#?([0-9a-f]{3,8})$/i.exec((str || '').trim());
  if (!m) return null;
  let x = m[1];
  if (x.length === 3 || x.length === 4) x = [...x].map((c) => c + c).join('');
  if (x.length !== 6 && x.length !== 8) return null;
  return { r: parseInt(x.slice(0, 2), 16), g: parseInt(x.slice(2, 4), 16), b: parseInt(x.slice(4, 6), 16), a: x.length === 8 ? parseInt(x.slice(6, 8), 16) / 255 : 1 };
}

/** Pointer drag over `el`, reporting the position as 0-1 fractions (captured, so it can leave the element). */
function dragOn(el, onMove, onEnd) {
  const at = (e) => {
    const r = el.getBoundingClientRect();
    onMove(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)));
  };
  el.addEventListener('pointerdown', (e) => {
    el.setPointerCapture(e.pointerId);
    el._dragging = true;
    at(e);
  });
  el.addEventListener('pointermove', (e) => { if (el._dragging) at(e); });
  const end = () => { if (el._dragging) { el._dragging = false; onEnd(); } };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
}

export class TesselColorPicker extends TesselElement {
  static styles = ':host{display:inline-block;}';
  static observedAttributes = ['value', 'alpha', 'no-hex'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const c = parseHex(this.getAttribute('value')) || { r: 79, g: 70, b: 229, a: 1 };
    this._hsv = rgbToHsv(c.r, c.g, c.b);
    this._a = c.a;

    this._sv = h('div', 'relative h-40 w-full cursor-crosshair touch-none rounded-md');
    this._svThumb = h('div', 'pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm');
    this._sv.appendChild(this._svThumb);
    this._hue = h('div', 'relative h-3 w-full cursor-pointer touch-none rounded-pill bg-[linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)]');
    this._hueThumb = h('div', 'pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm');
    this._hue.appendChild(this._hueThumb);
    this._alphaBar = h('div', 'absolute inset-0 rounded-pill');
    this._alphaThumb = h('div', 'pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm');
    this._alphaWrap = h('div', cx('relative h-3 w-full cursor-pointer touch-none rounded-pill', CHECKER), null, this._alphaBar, this._alphaThumb);
    this._swatchColor = h('div', 'size-full');
    this._swatch = h('div', cx('size-8 flex-none overflow-hidden rounded-md border border-border', CHECKER), null, this._swatchColor);
    this._hexInput = h('input', 'h-8 min-w-0 flex-1 rounded-md border border-border bg-input px-2.5 font-mono text-code text-text outline-none focus:border-accent', { spellcheck: 'false', 'aria-label': 'Hex color' });
    this._hexRow = h('div', 'flex items-center gap-2', null, this._swatch, this._hexInput);
    this.shadowRoot.appendChild(h('div', 'flex w-[260px] flex-col gap-3 rounded-lg border border-border bg-surface p-3', null, this._sv, this._hue, this._alphaWrap, this._hexRow));

    dragOn(this._sv, (x, y) => { this._hsv.s = x; this._hsv.v = 1 - y; this._changed(true); }, () => this._changed(false));
    dragOn(this._hue, (x) => { this._hsv.h = x * 360; this._changed(true); }, () => this._changed(false));
    dragOn(this._alphaWrap, (x) => { this._a = Math.round(x * 100) / 100; this._changed(true); }, () => this._changed(false));
    this._hexInput.addEventListener('change', () => {
      const p = parseHex(this._hexInput.value);
      if (p) { this._hsv = rgbToHsv(p.r, p.g, p.b); if (this.hasAttribute('alpha')) this._a = p.a; this._changed(false); }
      else this._paint();
    });
    this._paint();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === 'value') {
      const p = parseHex(newV);
      if (p && this._hex() !== newV?.toLowerCase()) { this._hsv = rgbToHsv(p.r, p.g, p.b); this._a = p.a; }
    }
    this._paint();
  }

  _rgb() { return hsvToRgb(this._hsv.h, this._hsv.s, this._hsv.v); }
  _hex() {
    const [r, g, b] = this._rgb();
    return `#${hex2(r)}${hex2(g)}${hex2(b)}${this.hasAttribute('alpha') ? hex2(this._a * 255) : ''}`;
  }

  get value() { return this._built ? this._hex() : (this.getAttribute('value') || ''); }
  set value(v) { this.setAttribute('value', v); }

  /** `dragging` = still being dragged: fire `input` only; `change` when released or committed. */
  _changed(dragging) {
    this._paint();
    this.setAttribute('value', this._hex());
    this.emit('input', { value: this._hex() });
    if (!dragging) this.emit('change', { value: this._hex() });
  }

  _paint() {
    const [r, g, b] = this._rgb();
    const alpha = this.hasAttribute('alpha');
    const pure = hsvToRgb(this._hsv.h, 1, 1);
    this._sv.style.backgroundColor = `rgb(${pure})`;
    this._sv.style.backgroundImage = 'linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,transparent)';
    this._svThumb.style.left = `${this._hsv.s * 100}%`;
    this._svThumb.style.top = `${(1 - this._hsv.v) * 100}%`;
    this._svThumb.style.background = `rgb(${r},${g},${b})`;
    this._hueThumb.style.left = `${(this._hsv.h / 360) * 100}%`;
    this._hueThumb.style.background = `rgb(${pure})`;
    this._alphaWrap.hidden = !alpha;
    this._alphaBar.style.background = `linear-gradient(to right, rgba(${r},${g},${b},0), rgb(${r},${g},${b}))`;
    this._alphaThumb.style.left = `${this._a * 100}%`;
    this._swatchColor.style.background = `rgba(${r},${g},${b},${alpha ? this._a : 1})`;
    this._hexRow.lastElementChild.hidden = this.hasAttribute('no-hex');
    if (this.shadowRoot.activeElement !== this._hexInput) this._hexInput.value = this._hex();
  }
}

define('tsl-calendar', TesselCalendar);
define('tsl-date-picker', TesselDatePicker);
define('tsl-time-picker', TesselTimePicker);
define('tsl-color-picker', TesselColorPicker);
