// <tsl-dialog title="Delete file?" primary-text="Delete" close-text="Cancel" primary-destructive>
//   This can't be undone.
// </tsl-dialog>
// const result = await dialog.showModal(); // TesselDialog.Result.PRIMARY | .SECONDARY | .NONE
// Port of components/ContentDialog.java (overlay fade 180ms, dialog pop-in 0.96->1, width 320-548px).

import { TesselElement, define, openAnimated, closeAnimated } from '../core/base-element.js';
import { MOTION } from '../core/tokens.js';

export const DialogResult = Object.freeze({ NONE: 'none', PRIMARY: 'primary', SECONDARY: 'secondary' });

const CLOSE_DURATION = parseInt(MOTION.slow, 10); // matches --tsl-duration-slow, used to time the fade-out

const STYLES = `
  :host{position:fixed;inset:0;z-index:2000;display:none;align-items:center;justify-content:center;padding:24px;}
  :host([open]){display:flex;}
  .overlay{position:absolute;inset:0;background:var(--tsl-overlay);opacity:0;
    transition:opacity var(--tsl-duration-slow) var(--tsl-ease);}
  :host([visible]) .overlay{opacity:1;}
  .panel{position:relative;width:420px;max-width:min(548px, 100%);min-width:320px;max-height:100%;
    display:flex;flex-direction:column;border-radius:var(--tsl-radius-lg);border:1px solid var(--tsl-border);
    background:var(--tsl-surface);box-shadow:0 16px 48px var(--tsl-shadow);
    transform:scale(0.96);opacity:0;transition:transform var(--tsl-duration-slow) var(--tsl-ease),
      opacity var(--tsl-duration-slow) var(--tsl-ease);}
  :host([visible]) .panel{transform:scale(1);opacity:1;}
  .body{padding:24px;overflow:auto;}
  .title{font-size:20px;font-weight:600;color:var(--tsl-text);margin-bottom:12px;}
  .content{font-size:14px;color:var(--tsl-text-secondary);line-height:1.5;}
  .footer{display:flex;gap:8px;justify-content:flex-end;padding:16px 20px;background:var(--tsl-surface-alt);
    border-top:1px solid var(--tsl-border);border-radius:0 0 var(--tsl-radius-lg) var(--tsl-radius-lg);}
`;

export class TesselDialog extends TesselElement {
  static styles = STYLES;
  static Result = DialogResult;
  static observedAttributes = ['title', 'primary-text', 'secondary-text', 'close-text', 'primary-destructive', 'open'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    const body = document.createElement('div');
    body.className = 'body';
    this._title = document.createElement('div');
    this._title.className = 'title';
    const content = document.createElement('div');
    content.className = 'content';
    content.appendChild(document.createElement('slot'));
    body.append(this._title, content);
    this._footer = document.createElement('div');
    this._footer.className = 'footer';
    panel.append(body, this._footer);
    this.shadowRoot.append(overlay, panel);
    this._overlay = overlay;

    overlay.addEventListener('click', () => this._close(DialogResult.NONE));
    this._onKeydown = (e) => { if (e.key === 'Escape' && this.open) this._close(DialogResult.NONE); };
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    this._title.textContent = this.getAttribute('title') || '';
    this._title.style.display = this.getAttribute('title') ? '' : 'none';

    this._footer.innerHTML = '';
    const secondaryText = this.getAttribute('secondary-text');
    const closeText = this.getAttribute('close-text') || 'Cancel';
    const primaryText = this.getAttribute('primary-text');

    if (secondaryText) this._footer.appendChild(this._makeButton(secondaryText, 'standard', DialogResult.SECONDARY));
    this._footer.appendChild(this._makeButton(closeText, 'standard', DialogResult.NONE));
    if (primaryText) {
      const variant = this.hasAttribute('primary-destructive') ? 'danger' : 'accent';
      this._footer.appendChild(this._makeButton(primaryText, variant, DialogResult.PRIMARY));
    }
  }

  _makeButton(text, variant, result) {
    const btn = document.createElement('tsl-button');
    btn.setAttribute('variant', variant);
    btn.textContent = text;
    btn.addEventListener('click', () => this._close(result));
    return btn;
  }

  get open() { return this.hasAttribute('open'); }

  /** Opens the dialog and resolves with a DialogResult once it closes (either button). */
  showModal() {
    return new Promise((resolve) => {
      this._resolve = resolve;
      this._previousFocus = document.activeElement;
      this._closing = false;
      openAnimated(this);
      document.addEventListener('keydown', this._onKeydown);
      requestAnimationFrame(() => this._footer.querySelector('tsl-button')?.focus?.());
    });
  }

  /** Alias kept for parity with ContentDialog.showAsync — behaves identically to showModal(). */
  showAsync() {
    return this.showModal();
  }

  close(result = DialogResult.NONE) {
    this._close(result);
  }

  _close(result) {
    if (!this.open || this._closing) return;
    this._closing = true;
    document.removeEventListener('keydown', this._onKeydown);
    this.emit('close', { result });
    this._previousFocus?.focus?.({ preventScroll: true });
    // Wait for the fade-out to finish before hiding (display:none) and resolving the promise —
    // resolving immediately would let callers (e.g. showDialog's `.finally(() => dialog.remove())`)
    // rip the element out mid-transition, cutting the animation short.
    closeAnimated(this, CLOSE_DURATION, 'open', 'visible', () => {
      this._closing = false;
      this._resolve?.(result);
      this._resolve = null;
    });
  }
}

define('tsl-dialog', TesselDialog);

/**
 * One-off dialog, mirroring `new ContentDialog(title, message).showAsync(frame)`:
 * creates a <tsl-dialog>, shows it, and removes it from the DOM once closed.
 */
export function showDialog({
  title, message, primaryText, secondaryText, closeText = 'Cancel', primaryDestructive = false,
} = {}) {
  const dialog = document.createElement('tsl-dialog');
  if (title) dialog.setAttribute('title', title);
  if (primaryText) dialog.setAttribute('primary-text', primaryText);
  if (secondaryText) dialog.setAttribute('secondary-text', secondaryText);
  dialog.setAttribute('close-text', closeText);
  if (primaryDestructive) dialog.setAttribute('primary-destructive', '');
  if (message) dialog.textContent = message;
  document.body.appendChild(dialog);
  return dialog.showModal().finally(() => dialog.remove());
}
