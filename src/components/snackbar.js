// Tessel.snackbar.show("Saved", { message: "Your changes were saved.", severity: "success" });
// Port of components/Snackbar.java (380px wide, bottom-right, 4000ms auto-dismiss paused on hover,
// 200ms ease-out fade, stacks bottom-anchored). Reuses <tsl-info-bar elevated surface>.

import { ensureInstalled } from '../core/theme.js';
import './info-bar.js';

let host = null;

function ensureHost() {
  if (host) return host;
  host = document.createElement('div');
  host.style.cssText = `
    position:fixed;right:24px;bottom:24px;z-index:3000;display:flex;flex-direction:column-reverse;
    gap:12px;width:380px;max-width:calc(100vw - 32px);pointer-events:none;`;
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
  if (title) bar.setAttribute('title', title);
  if (message) bar.textContent = message;
  bar.style.cssText = 'pointer-events:auto;opacity:0;transform:translateY(12px);' +
    'transition:opacity 200ms cubic-bezier(0.16,1,0.3,1), transform 200ms cubic-bezier(0.16,1,0.3,1);';
  container.appendChild(bar);
  requestAnimationFrame(() => { bar.style.opacity = '1'; bar.style.transform = 'translateY(0)'; });

  let timer = null;
  const dismiss = () => {
    bar.style.opacity = '0';
    bar.style.transform = 'translateY(12px)';
    setTimeout(() => bar.remove(), 200);
  };
  const arm = () => { if (duration > 0) timer = setTimeout(dismiss, duration); };
  const disarm = () => { if (timer) clearTimeout(timer); };

  bar.addEventListener('mouseenter', disarm);
  bar.addEventListener('mouseleave', arm);
  // Own the removal animation (slide + fade) instead of the info bar's own default fade-out.
  bar.addEventListener('close', (e) => { e.preventDefault(); disarm(); dismiss(); });
  arm();

  return { dismiss };
}
