// Shared popup plumbing for every dropdown-style component (select, menus, flyouts, pickers...).
//
// Popups used to be `position:absolute` children of their component, which an `overflow:hidden` ancestor
// (a card, a dialog body, an expander) clips and which a sibling's z-index can cover. Here the popup is a
// `popover="manual"` element: it is promoted to the browser's top layer (never clipped, always on top),
// then positioned with fixed coordinates next to its anchor, flipped when there is no room, and
// repositioned on scroll/resize. Enter/exit animations are plain Tailwind classes on the popup:
// `open:` matches `:popover-open`, `starting:` supplies the from-state and `transition-discrete` keeps the
// element displayed while it fades out.

const state = new WeakMap();
const MARGIN = 8;

/** Utility classes every popup element should carry (top-layer reset + animation hooks). */
export const POPUP_BASE =
  'fixed inset-auto m-0 overflow-auto border border-border bg-surface text-text p-0 '
  + 'opacity-0 scale-98 transition-[opacity,scale,display,overlay] transition-discrete duration-fast ease-tessel '
  + 'open:opacity-100 open:scale-100 starting:open:opacity-0 starting:open:scale-98';

function isOpen(popup) {
  try { return popup.matches(':popover-open'); } catch { return false; }
}

function place(popup, anchor, { placement, offset, matchWidth, align }) {
  const a = anchor.getBoundingClientRect();
  if (matchWidth) popup.style.minWidth = `${a.width}px`;
  popup.style.maxHeight = '';
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  // offset* ignores the closed-state scale transform that getBoundingClientRect() would include.
  const p = { width: popup.offsetWidth, height: popup.offsetHeight };
  const [side, alignment = align] = placement.split('-');

  let top, left;
  if (side === 'bottom' || side === 'top') {
    const below = vh - a.bottom - offset - MARGIN;
    const above = a.top - offset - MARGIN;
    const flip = side === 'bottom' ? p.height > below && above > below : p.height > above && below > above;
    const useBottom = side === 'bottom' ? !flip : flip;
    const room = useBottom ? below : above;
    if (p.height > room) popup.style.maxHeight = `${Math.max(120, room)}px`;
    const h = Math.min(p.height, Math.max(120, room));
    top = useBottom ? a.bottom + offset : a.top - offset - h;
    left = alignment === 'end' ? a.right - p.width : alignment === 'center' ? a.left + (a.width - p.width) / 2 : a.left;
    popup.dataset.side = useBottom ? 'bottom' : 'top';
  } else {
    const right = vw - a.right - offset - MARGIN;
    const useRight = side === 'right' ? !(p.width > right && a.left > right) : (p.width > a.left - offset - MARGIN && right > a.left);
    left = useRight ? a.right + offset : a.left - offset - p.width;
    top = alignment === 'end' ? a.bottom - p.height : alignment === 'center' ? a.top + (a.height - p.height) / 2 : a.top;
    popup.dataset.side = useRight ? 'right' : 'left';
  }
  left = Math.max(MARGIN, Math.min(left, vw - p.width - MARGIN));
  top = Math.max(MARGIN, Math.min(top, vh - Math.min(p.height, vh - 2 * MARGIN) - MARGIN));
  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
}

/**
 * Shows `popup` next to `anchor`.
 * options: placement 'bottom-start' | 'bottom-end' | 'top-start' | 'right-start' | 'left-start' | ... ,
 *          offset (px gap), matchWidth (min-width = anchor width), stayOpen (no light dismiss),
 *          onDismiss (called when the user clicks outside or presses Escape), owner (extra element that
 *          counts as "inside" for outside-click detection — usually the host component).
 */
export function openPopup(popup, anchor, options = {}) {
  const opts = { placement: 'bottom-start', offset: 4, matchWidth: false, align: 'start', ...options };
  closeNow(popup);
  if (!popup.hasAttribute('popover')) popup.setAttribute('popover', 'manual');
  if (!isOpen(popup)) popup.showPopover();
  place(popup, anchor, opts);

  const reposition = () => place(popup, anchor, opts);
  const dismiss = () => { closePopup(popup); opts.onDismiss?.(); };
  const onPointer = (e) => {
    if (opts.stayOpen) return;
    const path = e.composedPath();
    if (path.includes(popup) || path.includes(anchor) || (opts.owner && path.includes(opts.owner))) return;
    dismiss();
  };
  const onKey = (e) => { if (e.key === 'Escape' && !opts.stayOpen) { e.stopPropagation(); dismiss(); } };
  window.addEventListener('resize', reposition);
  window.addEventListener('scroll', reposition, true);
  document.addEventListener('pointerdown', onPointer, true);
  document.addEventListener('keydown', onKey, true);
  state.set(popup, {
    reposition,
    cleanup() {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
      document.removeEventListener('pointerdown', onPointer, true);
      document.removeEventListener('keydown', onKey, true);
    },
  });
  return { reposition };
}

/** Recomputes the popup's position (call after its content changed size, e.g. filtered suggestions). */
export function repositionPopup(popup) {
  state.get(popup)?.reposition();
}

function closeNow(popup) {
  const s = state.get(popup);
  if (s) { s.cleanup(); state.delete(popup); }
}

export function closePopup(popup) {
  closeNow(popup);
  if (isOpen(popup)) popup.hidePopover();
}

export function popupIsOpen(popup) {
  return isOpen(popup);
}
