// <tsl-rating value="3" max="5" [read-only] [clearable] caption="Your rating">
// Port of Tessel.NET's RatingControl: star rating with hover preview. Arrow keys, Home/End and Delete work too
// (`clearable` lets you click the current value again — or press Delete — to reset it to 0).

import { TesselElement, define } from '../core/base-element.js';
import { iconMarkup } from '../core/icons.js';
import { h, html, cx } from '../core/dom.js';

const STAR = 'flex size-7 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 transition-[color,transform] duration-fast ease-tessel '
  + 'active:scale-90 disabled:cursor-default disabled:active:scale-100';

export class TesselRating extends TesselElement {
  static styles = ':host{display:inline-flex;flex-direction:column;gap:2px;}';
  static observedAttributes = ['value', 'max', 'read-only', 'clearable', 'caption', 'disabled'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._row = h('div', 'flex items-center outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-sm', { role: 'slider', tabindex: '0' });
    this._caption = h('div', 'text-caption text-text-secondary');
    this.shadowRoot.append(this._row, this._caption);
    this._hover = 0;
    this._row.addEventListener('mouseleave', () => { this._hover = 0; this._paint(); });
    this._row.addEventListener('keydown', (e) => this._onKeydown(e));
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  get max() { return Math.max(1, Number(this.getAttribute('max')) || 5); }
  get value() { return Math.min(this.max, Math.max(0, Number(this.getAttribute('value')) || 0)); }
  set value(v) { this.setAttribute('value', String(v)); }
  get readOnly() { return this.hasAttribute('read-only') || this.disabled; }

  _choose(v) {
    const next = v === this.value && this.hasAttribute('clearable') ? 0 : v;
    if (next === this.value) return;
    this.value = next;
    this.emit('change', { value: next });
  }

  _onKeydown(e) {
    if (this.readOnly) return;
    const to = { ArrowRight: this.value + 1, ArrowUp: this.value + 1, ArrowLeft: this.value - 1, ArrowDown: this.value - 1, Home: 0, End: this.max }[e.key];
    if (to != null) {
      e.preventDefault();
      const next = Math.min(this.max, Math.max(0, to));
      if (next !== this.value) { this.value = next; this.emit('change', { value: next }); }
    } else if (e.key === 'Delete' && this.hasAttribute('clearable')) {
      e.preventDefault();
      if (this.value) { this.value = 0; this.emit('change', { value: 0 }); }
    }
  }

  _sync() {
    const readOnly = this.readOnly;
    this._row.replaceChildren(...Array.from({ length: this.max }, (_, i) => {
      const star = html('button', STAR, iconMarkup('favorite-star', 20));
      star.type = 'button';
      star.tabIndex = -1;
      star.disabled = readOnly;
      star.setAttribute('aria-label', `${i + 1} star${i ? 's' : ''}`);
      star.addEventListener('mouseenter', () => { if (!readOnly) { this._hover = i + 1; this._paint(); } });
      star.addEventListener('click', () => { if (!readOnly) this._choose(i + 1); });
      return star;
    }));
    this._row.setAttribute('aria-valuemin', '0');
    this._row.setAttribute('aria-valuemax', String(this.max));
    this._row.setAttribute('aria-valuenow', String(this.value));
    this._row.setAttribute('aria-readonly', String(readOnly));
    this._row.tabIndex = readOnly ? -1 : 0;
    const caption = this.getAttribute('caption');
    this._caption.textContent = caption || '';
    this._caption.hidden = !caption;
    this._paint();
  }

  _paint() {
    const shown = this._hover || this.value;
    Array.from(this._row.children).forEach((star, i) => {
      const on = i < shown;
      star.className = cx(STAR, on ? 'text-warning' : 'text-text-tertiary', !this.readOnly && !on && 'hover:text-text-secondary');
      star.firstElementChild?.setAttribute('fill', on ? 'currentColor' : 'none');
    });
  }
}

define('tsl-rating', TesselRating);
