// <tsl-avatar name="Ada Lovelace" size="40" src="..."> — port of components/Avatar.java
// (circular, initials fallback, name-hashed fill color from an 8-color palette).

import { TesselElement, define } from '../core/base-element.js';

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

const STYLES = `
  :host{display:inline-flex;}
  .avatar{position:relative;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;
    overflow:hidden;background:var(--tsl-accent);color:#fff;font-weight:600;user-select:none;}
  img{width:100%;height:100%;object-fit:cover;}
`;

export class TesselAvatar extends TesselElement {
  static styles = STYLES;
  static observedAttributes = ['name', 'size', 'src'];

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._avatar = document.createElement('div');
    this._avatar.className = 'avatar';
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
    this._avatar.style.width = `${size}px`;
    this._avatar.style.height = `${size}px`;
    this._avatar.style.fontSize = `${Math.max(8, size * 0.38)}px`;
    this._avatar.style.background = hashColor(name) || 'var(--tsl-accent)';
    this._avatar.innerHTML = '';
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = name;
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
