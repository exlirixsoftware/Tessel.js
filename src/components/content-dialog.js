// <tsl-dialog title="Delete file?" primary-text="Delete" close-text="Cancel" primary-destructive>
//   This can't be undone.
// </tsl-dialog>
// const result = await dialog.showModal(); // DialogResult.PRIMARY | .SECONDARY | .NONE
// Port of components/ContentDialog.java and Tessel.NET's ContentDialog (overlay fade, dialog pop-in 0.96->1,
// width 320-548px, progress state while a long operation runs).
//
// Built on a native modal <dialog>: the browser supplies the top layer (no z-index or clipping problems),
// the inert backdrop, Escape handling and the focus trap. Events: `primary-click` / `secondary-click`
// are cancelable (preventDefault keeps the dialog open, e.g. while an async save runs — pair with `busy`),
// `close` carries { result }.

import { TesselElement, define } from '../core/base-element.js';
import { h, html, cx } from '../core/dom.js';
import { severitySvg } from '../core/icons.js';
import './button.js';
import './progress-bar.js';

export const DialogResult = Object.freeze({ NONE: 'none', PRIMARY: 'primary', SECONDARY: 'secondary' });

const DIALOG = 'm-auto flex-col overflow-hidden rounded-lg border border-border bg-surface p-0 text-text shadow-dialog '
  + 'w-[420px] min-w-80 max-w-[min(548px,calc(100vw-48px))] max-h-[calc(100vh-48px)] '
  + 'open:flex opacity-0 scale-96 open:opacity-100 open:scale-100 starting:open:opacity-0 starting:open:scale-96 '
  + 'transition-[opacity,scale,display,overlay] transition-discrete duration-slow ease-tessel '
  + 'backdrop:bg-overlay backdrop:opacity-0 open:backdrop:opacity-100 starting:open:backdrop:opacity-0 '
  + 'backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-slow backdrop:ease-tessel';

export class TesselDialog extends TesselElement {
  static styles = ':host{display:contents;}';
  static Result = DialogResult;
  static observedAttributes = ['title', 'heading', 'primary-text', 'secondary-text', 'close-text', 'primary-destructive', 'busy', 'severity'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._severity = h('span', 'mt-0.5 flex flex-none', { hidden: true });
    this._title = h('h2', 'mb-3 text-subtitle font-semibold text-text', { id: 'tsl-dialog-title' });
    this._progress = h('tsl-progress-bar', 'mt-4 w-full');
    this._progressText = h('div', 'mt-2 text-caption text-text-secondary');
    this._busyBlock = h('div', '', null, this._progress, this._progressText);
    this._footer = h('div', 'flex justify-end gap-2 rounded-b-lg border-t border-border bg-surface-alt px-5 py-4');
    this._dialog = h('dialog', DIALOG, { 'aria-labelledby': 'tsl-dialog-title' },
      h('div', 'flex gap-4 overflow-auto p-6', null,
        this._severity,
        h('div', 'min-w-0 flex-1', null,
          this._title,
          h('div', 'text-body leading-normal text-text-secondary', null, h('slot')),
          this._busyBlock)),
      this._footer);
    this.shadowRoot.appendChild(this._dialog);

    // Backdrop clicks land on the <dialog> itself (its content fills the whole box otherwise).
    this._dialog.addEventListener('click', (e) => { if (e.target === this._dialog && !this.busy) this._close(DialogResult.NONE); });
    this._dialog.addEventListener('cancel', (e) => {
      e.preventDefault(); // we close it ourselves so the exit animation and promise stay in sync
      if (!this.busy) this._close(DialogResult.NONE);
    });
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    const title = this.readHeading();
    this._title.textContent = title;
    this._title.hidden = !title;
    const busy = this.busy;
    this._busyBlock.hidden = !busy;
    const severity = this.getAttribute('severity');
    this._severity.hidden = !severity;
    this._severity.className = cx('mt-0.5 flex flex-none', { success: 'text-success', warning: 'text-warning', error: 'text-danger', informational: 'text-info' }[severity] || 'text-accent');
    this._severity.innerHTML = severity ? severitySvg(severity, 24) : '';
    this._footer.replaceChildren();
    if (this._customButtons) {
      for (const b of this._customButtons) this._footer.appendChild(this._makeButton(b.text, b.variant || 'standard', b.value, false));
      return;
    }
    const secondaryText = this.getAttribute('secondary-text');
    const closeText = this.getAttribute('close-text') || 'Cancel';
    const primaryText = this.getAttribute('primary-text');
    if (secondaryText) this._footer.appendChild(this._makeButton(secondaryText, 'standard', DialogResult.SECONDARY, busy));
    this._footer.appendChild(this._makeButton(closeText, 'standard', DialogResult.NONE, false));
    if (primaryText) {
      const variant = this.hasAttribute('primary-destructive') ? 'danger' : 'accent';
      this._footer.appendChild(this._makeButton(primaryText, variant, DialogResult.PRIMARY, busy));
    }
  }

  _makeButton(text, variant, result, disabled) {
    const btn = h('tsl-button', '', { variant, disabled }, text);
    btn.addEventListener('click', () => this._close(result));
    return btn;
  }

  /**
   * Replaces the primary/secondary/close buttons with custom ones: [{ text, value, variant? }], left to right.
   * Clicking one closes the dialog and resolves `showModal()` with its `value` (MessageDialog's Yes / No / Retry…).
   */
  set buttons(list) {
    this._customButtons = list?.length ? list : null;
    if (this._built) this._sync();
  }

  get open() { return this._dialog?.open ?? false; }

  /** Shows the progress bar and disables the primary/secondary buttons while a long operation runs. */
  get busy() { return this.hasAttribute('busy'); }
  set busy(v) { this.toggleAttribute('busy', !!v); }

  /** Updates the progress bar (0-100) and the status line shown under the content while `busy`. */
  reportProgress(percent, text = '') {
    this.busy = true;
    this._progress.removeAttribute('indeterminate');
    this._progress.setAttribute('value', String(percent));
    this._progressText.textContent = text;
  }

  /** Opens the dialog and resolves with a DialogResult once it closes (either button). */
  showModal() {
    return new Promise((resolve) => {
      this._resolve = resolve;
      this._closing = false;
      this._dialog.showModal();
      this.setAttribute('open', '');
      // Focus the default action (primary, else the close button) like Tessel.NET does.
      requestAnimationFrame(() => (this._footer.lastElementChild)?.focus?.());
    });
  }

  /** Alias kept for parity with ContentDialog.showAsync — behaves identically to showModal(). */
  showAsync() {
    return this.showModal();
  }

  close(result = DialogResult.NONE) {
    this._close(result);
  }

  async _close(result) {
    if (!this.open || this._closing) return;
    if (result === DialogResult.PRIMARY || result === DialogResult.SECONDARY) {
      // Like ContentDialog's PrimaryButtonClick: a handler can cancel to keep the dialog open.
      if (!this.emit(result === DialogResult.PRIMARY ? 'primary-click' : 'secondary-click', {})) return;
    }
    this._closing = true;
    this.emit('close', { result });
    this._dialog.close();
    this.removeAttribute('open');
    // Resolve only after the exit animation, so callers that remove the element (showDialog) don't cut it short.
    await Promise.allSettled(this._dialog.getAnimations({ subtree: true }).map((a) => a.finished));
    this._closing = false;
    this._resolve?.(result);
    this._resolve = null;
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
  if (title) dialog.setAttribute('heading', title);
  if (primaryText) dialog.setAttribute('primary-text', primaryText);
  if (secondaryText) dialog.setAttribute('secondary-text', secondaryText);
  dialog.setAttribute('close-text', closeText);
  if (primaryDestructive) dialog.setAttribute('primary-destructive', '');
  if (message) dialog.textContent = message;
  document.body.appendChild(dialog);
  return dialog.showModal().finally(() => dialog.remove());
}

export const MessageButtons = Object.freeze({
  OK: 'ok', OK_CANCEL: 'ok-cancel', YES_NO: 'yes-no', YES_NO_CANCEL: 'yes-no-cancel', RETRY_CANCEL: 'retry-cancel',
});
export const MessageResult = Object.freeze({ OK: 'ok', CANCEL: 'cancel', YES: 'yes', NO: 'no', RETRY: 'retry' });

const BUTTON_SETS = {
  [MessageButtons.OK]: ['ok'],
  [MessageButtons.OK_CANCEL]: ['cancel', 'ok'],
  [MessageButtons.YES_NO]: ['no', 'yes'],
  [MessageButtons.YES_NO_CANCEL]: ['cancel', 'no', 'yes'],
  [MessageButtons.RETRY_CANCEL]: ['cancel', 'retry'],
};
const BUTTON_TEXT = { ok: 'OK', cancel: 'Cancel', yes: 'Yes', no: 'No', retry: 'Retry' };

/**
 * Tessel.NET's MessageDialog.ShowAsync: a message box that opens inside the page and is awaited.
 *   const answer = await Tessel.dialog.message('Delete project?', "This can't be undone.",
 *     { buttons: 'yes-no', icon: 'warning', destructive: true });   // 'yes' | 'no'
 * `icon` is informational | success | warning | error (or omitted). The rightmost button is the default action;
 * Escape or a click on the backdrop resolves with 'cancel' (or 'no' / 'ok' when there is no Cancel button).
 */
export async function showMessage(title, message, { buttons = MessageButtons.OK, icon, destructive = false } = {}) {
  const dialog = document.createElement('tsl-dialog');
  if (title) dialog.setAttribute('heading', title);
  if (icon) dialog.setAttribute('severity', icon);
  if (message) dialog.textContent = message;
  const set = BUTTON_SETS[buttons] || BUTTON_SETS[MessageButtons.OK];
  const fallback = set.includes('cancel') ? 'cancel' : set.includes('no') ? 'no' : set[0];
  dialog.buttons = set.map((value, i) => ({
    text: BUTTON_TEXT[value],
    value,
    variant: i === set.length - 1 ? (destructive ? 'danger' : 'accent') : 'standard',
  }));
  document.body.appendChild(dialog);
  const result = await dialog.showModal().finally(() => dialog.remove());
  return result === DialogResult.NONE ? fallback : result;
}
