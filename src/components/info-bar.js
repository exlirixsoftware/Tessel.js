// <tsl-info-bar severity="informational|success|warning|error" title="Heads up" [closable] [elevated]>
//   message text
// </tsl-info-bar> — port of components/InfoBar.java.

import { TesselElement, define } from '../core/base-element.js';
import { severitySvg, closeSvg } from '../core/icons.js';
import { MOTION } from '../core/tokens.js';

const DISMISS_DURATION = parseInt(MOTION.fast, 10);

const STYLES = `
  :host{display:flex;opacity:1;transform:scale(1);
    transition:opacity var(--tsl-duration-fast) var(--tsl-ease), transform var(--tsl-duration-fast) var(--tsl-ease);}
  .bar{display:flex;align-items:flex-start;gap:12px;width:100%;padding:12px 10px 12px 16px;
    border-radius:var(--tsl-radius-lg);border:1px solid var(--tsl-border);background:var(--tsl-info-subtle);}
  :host([elevated]) .bar{box-shadow:0 1px 2px var(--tsl-shadow), 0 8px 24px var(--tsl-shadow);border-color:transparent;}
  :host([surface]) .bar{background:var(--tsl-surface);}
  .icon{flex:none;margin-top:1px;color:var(--tsl-info);}
  .body{flex:1;min-width:0;}
  .title{font-size:14px;font-weight:600;color:var(--tsl-text);}
  .message{font-size:14px;color:var(--tsl-text-secondary);margin-top:2px;}
  ::slotted(*){margin:0;}
  .close{flex:none;display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:4px;
    border:none;background:transparent;color:var(--tsl-text-secondary);cursor:pointer;}
  .close:hover{background:var(--tsl-control-hover);}

  :host([severity="success"]) .bar{background:var(--tsl-success-subtle);}
  :host([severity="success"]) .icon{color:var(--tsl-success);}
  :host([severity="warning"]) .bar{background:var(--tsl-warning-subtle);}
  :host([severity="warning"]) .icon{color:var(--tsl-warning);}
  :host([severity="error"]) .bar{background:var(--tsl-danger-subtle);}
  :host([severity="error"]) .icon{color:var(--tsl-danger);}
  :host([surface]) .bar, :host([surface][severity]) .bar{background:var(--tsl-surface);}
`;

export class TesselInfoBar extends TesselElement {
  static styles = STYLES;
  static observedAttributes = ['severity', 'title', 'closable'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const bar = document.createElement('div');
    bar.className = 'bar';
    this._icon = document.createElement('span');
    this._icon.className = 'icon';
    const body = document.createElement('div');
    body.className = 'body';
    this._title = document.createElement('div');
    this._title.className = 'title';
    const message = document.createElement('div');
    message.className = 'message';
    message.appendChild(document.createElement('slot'));
    body.append(this._title, message);
    this._closeBtn = document.createElement('button');
    this._closeBtn.type = 'button';
    this._closeBtn.className = 'close';
    this._closeBtn.innerHTML = closeSvg(14);
    this._closeBtn.addEventListener('click', () => {
      // Cancelable: a listener that wants to own the removal animation (e.g. the snackbar host,
      // which slides bars out instead of just fading them) can preventDefault() to skip this.
      const notCanceled = this.emit('close', {});
      if (notCanceled) this.dismiss();
    });
    bar.append(this._icon, body, this._closeBtn);
    this.shadowRoot.appendChild(bar);
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    const severity = this.getAttribute('severity') || 'informational';
    this._icon.innerHTML = severitySvg(severity, 20);
    const title = this.getAttribute('title');
    this._title.textContent = title || '';
    this._title.style.display = title ? '' : 'none';
    this._closeBtn.style.display = this.hasAttribute('closable') ? '' : 'none';
  }

  /** Fades the bar out, then removes it. Exposed so external code (e.g. Tessel.snackbar) can call it. */
  dismiss() {
    this.style.opacity = '0';
    this.style.transform = 'scale(0.98)';
    setTimeout(() => this.remove(), DISMISS_DURATION);
  }
}

define('tsl-info-bar', TesselInfoBar);
