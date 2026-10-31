// Menu rendering shared by <tsl-menu-button>, <tsl-dropdown-button>, <tsl-split-button> and friends.
// Port of MenuPainting / TesselMenuUIs and Tessel.NET's Menu/ContextMenu styles (12px icon-text gap, radius 4
// row highlight, controlHover fill, "gesture" text on the right).

import { createIcon, checkmarkSvg } from './icons.js';
import { h, html, cx } from './dom.js';
import { openPopup, closePopup, popupIsOpen, POPUP_BASE } from './popup.js';

export const MENU_POPUP = `${POPUP_BASE} z-50 min-w-[200px] rounded-md p-1 shadow-card scrollbar-thin`;

const ROW = 'relative flex min-h-8 w-full cursor-pointer items-center gap-3 rounded-sm border-0 bg-transparent px-2.5 py-1.5 text-left text-body text-text '
  + 'transition-colors duration-fast ease-tessel hover:bg-control-hover focus-visible:bg-control-hover focus-visible:outline-none '
  + 'aria-disabled:pointer-events-none aria-disabled:opacity-45';

/**
 * Fills `popup` with menu rows built from light-DOM menu definition elements
 * (<tsl-menu-item>, <tsl-menu-checkbox-item>, <tsl-menu-separator>).
 * onSelect(child) fires for a plain item; onToggle(child) after a checkbox item flipped.
 */
export function renderMenu(popup, children, { onSelect, onToggle } = {}) {
  popup.replaceChildren();
  popup.setAttribute('role', 'menu');
  for (const child of children) {
    if (child.localName === 'tsl-menu-separator') {
      popup.appendChild(h('div', 'mx-1.5 my-1 h-px bg-border', { role: 'separator' }));
      continue;
    }
    const checkable = child.localName === 'tsl-menu-checkbox-item';
    const disabled = child.hasAttribute('disabled');
    const shortcut = child.getAttribute('shortcut');
    const row = h('button', ROW, {
      type: 'button',
      role: checkable ? 'menuitemcheckbox' : 'menuitem',
      tabindex: '-1',
      'aria-disabled': disabled ? 'true' : null,
      'aria-checked': checkable ? String(child.checked) : null,
    },
    h('span', 'flex w-4 flex-none text-text-secondary', null, child.icon ? createIcon(child.icon, 16) : null),
    h('span', 'min-w-0 flex-1', null, child.label),
    shortcut && h('span', 'flex-none pl-4 text-caption text-text-tertiary', null, shortcut),
    html('span', cx('flex w-4 flex-none text-accent', checkable && child.checked ? 'opacity-100' : 'opacity-0'), checkmarkSvg(14, 2)));
    row.addEventListener('click', () => {
      if (disabled) return;
      if (checkable) {
        child.checked = !child.checked;
        row.setAttribute('aria-checked', String(child.checked));
        row.lastElementChild.classList.toggle('opacity-100', child.checked);
        row.lastElementChild.classList.toggle('opacity-0', !child.checked);
        onToggle?.(child);
      } else {
        onSelect?.(child);
      }
    });
    popup.appendChild(row);
  }
}

/** Arrow/Home/End/Typeahead navigation for an open menu popup. Returns true when the key was handled. */
export function menuKeydown(popup, e) {
  const rows = Array.from(popup.querySelectorAll('[role^="menuitem"]:not([aria-disabled="true"])'));
  if (!rows.length) return false;
  const root = popup.getRootNode();
  const at = rows.indexOf(root.activeElement);
  let next = null;
  if (e.key === 'ArrowDown') next = rows[(at + 1) % rows.length];
  else if (e.key === 'ArrowUp') next = rows[(at - 1 + rows.length) % rows.length];
  else if (e.key === 'Home') next = rows[0];
  else if (e.key === 'End') next = rows.at(-1);
  else if (e.key.length === 1 && /\S/.test(e.key)) {
    const ch = e.key.toLowerCase();
    const ordered = [...rows.slice(at + 1), ...rows.slice(0, at + 1)];
    next = ordered.find((r) => r.textContent.trim().toLowerCase().startsWith(ch)) || null;
  }
  if (!next) return false;
  e.preventDefault();
  next.focus();
  return true;
}

const MENU_TAGS = new Set(['tsl-menu-item', 'tsl-menu-checkbox-item', 'tsl-menu-separator']);

/** Light-DOM menu definition children of `el`, in order. */
export function menuChildren(el) {
  return Array.from(el.children).filter((c) => MENU_TAGS.has(c.localName));
}

/**
 * A popup menu attached to `host` and defined by its <tsl-menu-item> children. Returns { popup, refresh, open, close }.
 * `popup` must be appended to the host's shadow root by the caller. Options:
 *   anchor()        element the menu opens next to
 *   placement       'bottom-start' (default) | 'bottom-end' | ...
 *   onSelect(child) / onToggle(child)  item activated
 *   onOpenChange(open)                 open state changed (for aria-expanded / host attribute)
 */
export function createMenu(host, { anchor, placement = 'bottom-start', onSelect, onToggle, onOpenChange } = {}) {
  // A popover from the start: before the first open it must be display:none, not an invisible box over the trigger.
  const popup = h('div', MENU_POPUP, { popover: 'manual' });
  const api = {
    popup,
    get isOpen() { return popupIsOpen(popup); },
    refresh() {
      renderMenu(popup, menuChildren(host), {
        onSelect: (child) => { api.close(); anchor().focus?.(); onSelect?.(child); },
        onToggle,
      });
    },
    open() {
      if (api.isOpen) return;
      onOpenChange?.(true);
      openPopup(popup, anchor(), {
        placement: typeof placement === 'function' ? placement() : placement,
        owner: host,
        onDismiss: () => onOpenChange?.(false),
      });
      requestAnimationFrame(() => popup.querySelector('[role^="menuitem"]:not([aria-disabled="true"])')?.focus());
    },
    close() {
      closePopup(popup);
      onOpenChange?.(false);
    },
  };
  popup.addEventListener('keydown', (e) => {
    if (menuKeydown(popup, e)) return;
    if (e.key === 'Escape' || e.key === 'Tab') { api.close(); anchor().focus?.(); }
  });
  return api;
}
