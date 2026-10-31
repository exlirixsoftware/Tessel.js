// Anchored popups ported from Tessel.NET's Popups.xaml:
//   <tsl-flyout target="#help" placement="bottom" [stays-open]> …any content… </tsl-flyout>
//   <tsl-teaching-tip target="#help" heading="New!" subtitle="…" action-text="Got it"> … </tsl-teaching-tip>
//   <tsl-tooltip for="#help" placement="top">Tooltip text</tsl-tooltip>
//
// All three are top-layer popovers (core/popup.js): never clipped by an `overflow:hidden` ancestor and
// flipped to the other side when there is no room. A flyout light-dismisses (click outside / Escape) unless
// `stays-open`. Open with `flyout.show()` (or the `open` attribute), `flyout.showAt(element)` or `toggle()`;
// events: `opened`, `closed`. TeachingTip adds `action-click` and `close-click`.

import { TesselElement, define } from '../core/base-element.js';
import { createIcon, closeSvg } from '../core/icons.js';
import { h, html } from '../core/dom.js';
import { openPopup, closePopup, popupIsOpen, repositionPopup, POPUP_BASE } from '../core/popup.js';
import './button.js';

const FLYOUT = `${POPUP_BASE} z-50 max-w-[min(420px,calc(100vw-16px))] rounded-lg bg-surface p-4 shadow-flyout`;

function resolveTarget(host) {
  if (host._target) return host._target;
  const sel = host.getAttribute('target');
  if (!sel) return null;
  const root = host.getRootNode();
  return root.querySelector?.(sel) || document.querySelector(sel);
}

export class TesselFlyout extends TesselElement {
  static styles = ':host{display:contents;}';
  static observedAttributes = ['open', 'placement'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._popup = h('div', this._popupClass(), { popover: 'manual', role: 'dialog' }, ...this._body());
    this.shadowRoot.appendChild(this._popup);
    if (this.hasAttribute('open')) requestAnimationFrame(() => this.show());
  }

  disconnectedCallback() {
    if (this._popup) closePopup(this._popup);
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built || name !== 'open') return;
    if (this.hasAttribute('open') && !popupIsOpen(this._popup)) this._present();
    else if (!this.hasAttribute('open') && popupIsOpen(this._popup)) this._dismiss(false);
  }

  /** Hook for subclasses. */
  _popupClass() { return FLYOUT; }
  _body() { return [h('slot')]; }

  /** The element the flyout is anchored to: `.target` (an element), else the `target` selector attribute. */
  get target() { return resolveTarget(this); }
  set target(el) { this._target = el; }

  get isOpen() { return this._popup ? popupIsOpen(this._popup) : false; }

  _present() {
    const anchor = this.target;
    if (!anchor) return;
    openPopup(this._popup, anchor, {
      placement: this.getAttribute('placement') || 'bottom',
      stayOpen: this.hasAttribute('stays-open'),
      owner: this,
      align: 'center',
      onDismiss: () => this._dismiss(true),
    });
    this.emit('opened', {});
  }

  _dismiss(fromPopup) {
    if (!fromPopup) closePopup(this._popup);
    if (this.hasAttribute('open')) this.removeAttribute('open');
    this.emit('closed', {});
  }

  show() {
    if (this.isOpen) { repositionPopup(this._popup); return; }
    this.setAttribute('open', '');
    // Attribute callbacks only fire on a change; an element that already carried `open` still needs presenting.
    if (!this.isOpen) this._present();
  }

  showAt(element) {
    this._target = element;
    if (this.isOpen) { this.hide(); }
    this.show();
  }

  hide() {
    if (!this.isOpen) { this.removeAttribute('open'); return; }
    closePopup(this._popup);
    this._dismiss(true);
  }

  toggle() {
    if (this.isOpen) this.hide();
    else this.show();
  }
}

export class TesselTeachingTip extends TesselFlyout {
  static observedAttributes = [...TesselFlyout.observedAttributes, 'heading', 'title', 'subtitle', 'icon', 'action-text', 'closable'];

  _popupClass() { return `${FLYOUT} w-80`; }

  _body() {
    this._icon = h('span', 'mt-0.5 flex flex-none text-accent');
    this._title = h('div', 'text-body font-semibold text-text');
    this._subtitle = h('div', 'mt-0.5 text-body text-text-secondary');
    this._close = html('button', 'ml-auto flex size-7 flex-none cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent text-text-secondary hover:bg-control-hover focus-visible:outline-2 focus-visible:outline-accent', closeSvg(12));
    this._close.type = 'button';
    this._close.setAttribute('aria-label', 'Close');
    this._close.addEventListener('click', () => { if (this.emit('close-click', {})) this.hide(); });
    this._action = h('tsl-button', 'mt-3', { variant: 'accent' });
    this._action.addEventListener('click', () => { if (this.emit('action-click', {})) this.hide(); });
    this._content = h('div', 'mt-2 text-body text-text', null, h('slot'));
    queueMicrotask(() => this._syncTip());
    return [
      h('div', 'flex items-start gap-3', null, this._icon, h('div', 'min-w-0 flex-1', null, this._title, this._subtitle), this._close),
      this._content,
      h('div', 'flex justify-end', null, this._action),
    ];
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built && name !== 'open' && name !== 'placement') this._syncTip();
  }

  _syncTip() {
    const title = this.readHeading();
    const icon = this.getAttribute('icon');
    const action = this.getAttribute('action-text');
    this._title.textContent = title;
    this._title.hidden = !title;
    this._subtitle.textContent = this.getAttribute('subtitle') || '';
    this._subtitle.hidden = !this.hasAttribute('subtitle');
    this._icon.replaceChildren(...(icon ? [createIcon(icon, 18)] : []));
    this._icon.hidden = !icon;
    this._action.textContent = action || '';
    this._action.parentElement.hidden = !action;
    this._close.hidden = this.getAttribute('closable') === 'false';
  }
}

const TIP = `${POPUP_BASE} pointer-events-none z-60 max-w-72 rounded-sm bg-surface-alt px-2.5 py-1.5 text-caption text-text shadow-card`;

export class TesselTooltip extends TesselElement {
  static styles = ':host{display:contents;}';
  static observedAttributes = ['for', 'placement', 'delay'];

  connectedCallback() {
    super.connectedCallback();
    if (!this._built) {
      this._built = true;
      this._popup = h('div', TIP, { popover: 'manual', role: 'tooltip' }, h('slot'));
      this.shadowRoot.appendChild(this._popup);
      this._show = () => {
        clearTimeout(this._timer);
        this._timer = setTimeout(() => this._open(), Number(this.getAttribute('delay') ?? 500));
      };
      this._hide = () => { clearTimeout(this._timer); closePopup(this._popup); };
    }
    this._attach();
  }

  disconnectedCallback() {
    this._detach();
    clearTimeout(this._timer);
    if (this._popup) closePopup(this._popup);
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built && name === 'for') { this._detach(); this._attach(); }
  }

  _anchor() {
    const sel = this.getAttribute('for');
    if (!sel) return this.parentElement;
    const root = this.getRootNode();
    return root.querySelector?.(sel.startsWith('#') || sel.startsWith('.') ? sel : `#${sel}`) || null;
  }

  _attach() {
    const el = this._anchor();
    if (!el) return;
    this._el = el;
    for (const ev of ['mouseenter', 'focusin']) el.addEventListener(ev, this._show);
    for (const ev of ['mouseleave', 'focusout', 'pointerdown']) el.addEventListener(ev, this._hide);
    el.addEventListener('keydown', this._onKey ??= (e) => { if (e.key === 'Escape') this._hide(); });
  }

  _detach() {
    const el = this._el;
    if (!el) return;
    for (const ev of ['mouseenter', 'focusin']) el.removeEventListener(ev, this._show);
    for (const ev of ['mouseleave', 'focusout', 'pointerdown']) el.removeEventListener(ev, this._hide);
    el.removeEventListener('keydown', this._onKey);
    this._el = null;
  }

  _open() {
    if (!this._el?.isConnected) return;
    openPopup(this._popup, this._el, { placement: this.getAttribute('placement') || 'top', align: 'center', offset: 6, stayOpen: true });
  }
}

define('tsl-flyout', TesselFlyout);
define('tsl-teaching-tip', TesselTeachingTip);
define('tsl-tooltip', TesselTooltip);
