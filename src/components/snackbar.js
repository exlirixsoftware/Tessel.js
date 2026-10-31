// Tessel.snackbar.show("Saved", { message: "Your changes were saved.", severity: "success" });
// Port of components/Snackbar.java and Tessel.NET's Snackbar (380px wide, bottom-right, 4000ms auto-dismiss
// paused on hover, 200ms ease-out fade, stacks bottom-anchored). Reuses <tsl-info-bar elevated surface>.

import { TesselElement, define } from '../core/base-element.js';
import { ensureInstalled } from '../core/theme.js';
import { h } from '../core/dom.js';
import './info-bar.js';

/** The fixed, bottom-right stack the bars are slotted into — a custom element so it gets the Tailwind sheet. */
class TesselSnackbarHost extends TesselElement {
  static styles = ':host{display:contents;}';

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    // A manual popover lives in the top layer, so bars stay visible above an open modal dialog.
    this._stack = h('div', 'pointer-events-none fixed inset-auto bottom-6 right-6 m-0 flex w-[380px] max-w-[calc(100vw-32px)] flex-col-reverse gap-3 overflow-visible border-0 bg-transparent p-0',
      { popover: 'manual', role: 'region', 'aria-live': 'polite', 'aria-label': 'Notifications' }, h('slot'));
    this.shadowRoot.appendChild(this._stack);
  }

  /** (Re)opens the stack so it sits above whatever entered the top layer last (e.g. a dialog). */
  raise() {
    if (this._stack.matches(':popover-open')) this._stack.hidePopover();
    this._stack.showPopover();
  }
}
define('tsl-snackbar-host', TesselSnackbarHost);

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
let host = null;

function ensureHost() {
  if (host?.isConnected) return host;
  host = document.createElement('tsl-snackbar-host');
  document.body.appendChild(host);
  return host;
}

/**
 * Shows a snackbar. `severity` is one of informational/success/warning/error; `duration` in ms
 * (default 4000, matching Snackbar.defaultDuration); pass `duration: 0` to require manual dismissal.
 */
export function showSnackbar(title, { message = '', severity = 'informational', duration = 4000 } = {}) {
  ensureInstalled();
  const container = ensureHost();
  const bar = document.createElement('tsl-info-bar');
  bar.setAttribute('elevated', '');
  bar.setAttribute('surface', '');
  bar.setAttribute('closable', '');
  bar.setAttribute('severity', severity);
  if (title) bar.setAttribute('heading', title);
  if (message) bar.textContent = message;
  bar.style.pointerEvents = 'auto';
  container.appendChild(bar);
  container.raise();
  bar.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 200, easing: EASE });

  let timer = null;
  let gone = false;
  const dismiss = () => {
    if (gone) return;
    gone = true;
    bar.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(12px)' }], { duration: 200, easing: EASE, fill: 'forwards' })
      .finished.then(() => bar.remove(), () => bar.remove());
  };
  const arm = () => { if (duration > 0 && !gone) timer = setTimeout(dismiss, duration); };
  const disarm = () => { clearTimeout(timer); };

  bar.addEventListener('mouseenter', disarm);
  bar.addEventListener('mouseleave', arm);
  // Own the removal animation (slide + fade) instead of the info bar's own default fade-out.
  bar.addEventListener('close', (e) => { e.preventDefault(); disarm(); dismiss(); });
  arm();

  return { dismiss };
}
