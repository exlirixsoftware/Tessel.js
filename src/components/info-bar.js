// <tsl-info-bar severity="informational|success|warning|error" title="Heads up" [closable] [elevated]>
//   message text
//   <tsl-button slot="action">Undo</tsl-button>
// </tsl-info-bar> — port of components/InfoBar.java and Tessel.NET's InfoBar.
// `heading` is the tooltip-free alias of `title` (a `title` attribute is also accepted, and is moved off
// the element so the browser doesn't show it as a hover tooltip).

import { TesselElement, define } from '../core/base-element.js';
import { severitySvg, closeSvg } from '../core/icons.js';
import { h, html, cx } from '../core/dom.js';

const BAR = 'flex w-full items-start gap-3 rounded-lg border py-3 pl-4 pr-2.5 transition-[opacity,scale] duration-fast ease-tessel';
const TONE = {
  informational: { bar: 'bg-info-subtle', icon: 'text-info' },
  success: { bar: 'bg-success-subtle', icon: 'text-success' },
  warning: { bar: 'bg-warning-subtle', icon: 'text-warning' },
  error: { bar: 'bg-danger-subtle', icon: 'text-danger' },
};
const CLOSE = 'flex size-7 flex-none cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent text-text-secondary '
  + 'hover:bg-control-hover focus-visible:outline-2 focus-visible:outline-accent';

export class TesselInfoBar extends TesselElement {
  static styles = ':host{display:flex;}';
  static observedAttributes = ['severity', 'title', 'heading', 'closable', 'elevated', 'surface'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._icon = h('span', 'mt-px flex-none');
    this._title = h('div', 'text-body font-semibold text-text');
    this._bar = h('div', BAR, { role: 'status' });
    this._closeBtn = html('button', CLOSE, closeSvg(14));
    this._closeBtn.type = 'button';
    this._closeBtn.setAttribute('aria-label', 'Close');
    this._closeBtn.addEventListener('click', () => {
      // Cancelable: a listener that wants to own the removal animation (e.g. the snackbar host,
      // which slides bars out instead of just fading them) can preventDefault() to skip this.
      if (this.emit('close', {})) this.dismiss();
    });
    this._bar.append(
      this._icon,
      h('div', 'min-w-0 flex-1', null, this._title, h('div', 'mt-0.5 text-body text-text-secondary', null, h('slot'))),
      h('slot', 'flex-none self-center', { name: 'action' }),
      this._closeBtn,
    );
    this.shadowRoot.appendChild(this._bar);
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    const severity = this.getAttribute('severity') || 'informational';
    const tone = TONE[severity] || TONE.informational;
    const title = this.readHeading();
    const elevated = this.hasAttribute('elevated');
    this._bar.className = cx(
      BAR,
      this.hasAttribute('surface') ? 'bg-surface' : tone.bar,
      elevated ? 'border-transparent shadow-card' : 'border-border',
    );
    this._icon.className = cx('mt-px flex-none', tone.icon);
    this._icon.innerHTML = severitySvg(severity, 20);
    this._title.textContent = title;
    this._title.hidden = !title;
    this._closeBtn.hidden = !this.hasAttribute('closable');
    this._bar.setAttribute('role', severity === 'error' || severity === 'warning' ? 'alert' : 'status');
  }

  /** Fades the bar out, then removes it. Exposed so external code (e.g. Tessel.snackbar) can call it. */
  dismiss() {
    this._bar.classList.add('opacity-0', 'scale-98');
    setTimeout(() => this.remove(), 130);
  }
}

define('tsl-info-bar', TesselInfoBar);
