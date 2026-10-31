// <tsl-avatar name="Ada Lovelace" size="40" src="..."> — port of components/Avatar.java and Tessel.NET's Avatar
// (circular, initials fallback, name-hashed fill color from an 8-color palette).

import { TesselElement, define } from '../core/base-element.js';
import { h } from '../core/dom.js';

const PALETTE = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#db2777', '#7c3aed', '#dc2626', '#2563eb'];

function initialsOf(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function hashColor(name) {
  if (!name) return null;
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

const AVATAR = 'relative flex flex-none select-none items-center justify-center overflow-hidden rounded-full bg-accent font-semibold text-white';

export class TesselAvatar extends TesselElement {
  static styles = ':host{display:inline-flex;}';
  static observedAttributes = ['name', 'size', 'src'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._avatar = h('div', AVATAR, { role: 'img' });
    this.shadowRoot.appendChild(this._avatar);
    this._sync();
  }

  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }

  _sync() {
    const size = Number(this.getAttribute('size')) || 40;
    const name = this.getAttribute('name') || '';
    const src = this.getAttribute('src');
    // Size-dependent values can't be a fixed utility, so they go through inline styles.
    Object.assign(this._avatar.style, {
      width: `${size}px`,
      height: `${size}px`,
      fontSize: `${Math.max(8, size * 0.38)}px`,
      background: hashColor(name) || '',
    });
    this._avatar.setAttribute('aria-label', name);
    this._avatar.replaceChildren();
    if (src) {
      const img = h('img', 'size-full object-cover', { src, alt: name });
      // A broken/unreachable image would otherwise show the browser's "missing image" glyph —
      // fall back to the same initials used when no `src` is given at all.
      img.addEventListener('error', () => {
        if (this._avatar.contains(img)) this._avatar.textContent = initialsOf(name);
      }, { once: true });
      this._avatar.appendChild(img);
    } else {
      this._avatar.textContent = initialsOf(name);
    }
  }
}

define('tsl-avatar', TesselAvatar);
