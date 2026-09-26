// Icon set — the web equivalent of `net.tessel.laf.icons` (Symbol / FontIcon / TesselIcons).
//
// Tessel4J falls back to hand-drawn vector icons when the Segoe Fluent Icons font isn't installed,
// so every "chrome" icon (chevrons, checkmarks, folder/file, severity glyphs) is always vector-drawn
// here too — there is no equivalent of an OS icon font on the web. `Symbol` names below cover the
// same 76-entry catalog as `Symbol.java` so app code can request icons by the same names.

const SVG_NS = 'http://www.w3.org/2000/svg';
// 1.6 rather than a thinner hairline: at the small sizes these render at (16-20px), a 1.4px stroke
// on a 20-unit viewBox comes out under 1.3 real CSS pixels once scaled down, reading as faint/narrow
// rather than a deliberate line weight.
const DEFAULTS = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';

/** Full parity list with Tessel4J's `Symbol` enum. */
export const Symbol = Object.freeze({
  GLOBAL_NAV: 'global-nav', WIFI: 'wifi', BLUETOOTH: 'bluetooth', BRIGHTNESS: 'brightness',
  QUIET_HOURS: 'quiet-hours', CHEVRON_DOWN: 'chevron-down', CHEVRON_UP: 'chevron-up', EDIT: 'edit',
  ADD: 'add', CANCEL: 'cancel', MORE: 'more', SETTINGS: 'settings', VIDEO: 'video', MAIL: 'mail',
  PEOPLE: 'people', PHONE: 'phone', PIN: 'pin', SHOP: 'shop', LINK: 'link', FILTER: 'filter',
  SEARCH: 'search', CAMERA: 'camera', ATTACH: 'attach', SEND: 'send', FORWARD: 'forward', BACK: 'back',
  REFRESH: 'refresh', SHARE: 'share', LOCK: 'lock', FAVORITE_STAR: 'favorite-star',
  FAVORITE_STAR_FILL: 'favorite-star-fill', REMOVE: 'remove', CHECKBOX_COMPOSITE: 'checkbox-composite',
  CHECK_MARK: 'check-mark', PRINT: 'print', UP: 'up', DOWN: 'down', DELETE: 'delete', SAVE: 'save',
  CLOUD: 'cloud', KEYBOARD: 'keyboard', PLAY: 'play', PAUSE: 'pause', CHEVRON_LEFT: 'chevron-left',
  CHEVRON_RIGHT: 'chevron-right', EMOJI: 'emoji', GLOBE: 'globe', CONTACT: 'contact', PASTE: 'paste',
  UNLOCK: 'unlock', CALENDAR: 'calendar', COLOR: 'color', REDO: 'redo', UNDO: 'undo', WARNING: 'warning',
  FLAG: 'flag', PAGE: 'page', TOUCH_POINTER: 'touch-pointer', HOME: 'home', CLOCK: 'clock', VIEW: 'view',
  CLEAR: 'clear', SYNC: 'sync', DOWNLOAD: 'download', HELP: 'help', UPLOAD: 'upload', DOCUMENT: 'document',
  VIEW_ALL: 'view-all', RENAME: 'rename', FOLDER: 'folder', CHROME_CLOSE: 'chrome-close', MESSAGE: 'message',
  CUT: 'cut', COPY: 'copy', SORT: 'sort', FONT: 'font', TAG: 'tag', LIBRARY: 'library', ACCEPT: 'accept',
  COMMENT: 'comment', PICTURES: 'pictures', CHROME_MINIMIZE: 'chrome-minimize', CHROME_MAXIMIZE: 'chrome-maximize',
  CHROME_RESTORE: 'chrome-restore', COMPLETED: 'completed', CODE: 'code', INFO: 'info', SHIELD: 'shield',
  LIST: 'list', ERROR_BADGE: 'error-badge', LIGHTBULB: 'lightbulb', RINGER: 'ringer', HEART: 'heart', BUG: 'bug',
});

const PATHS = {
  'global-nav': '<line x1="3" y1="5" x2="17" y2="5"/><line x1="3" y1="10" x2="17" y2="10"/><line x1="3" y1="15" x2="17" y2="15"/>',
  wifi: '<circle cx="10" cy="15" r="1" fill="currentColor" stroke="none"/><path d="M7 12.3a4.2 4.2 0 0 1 6 0"/><path d="M4.5 9.5a8 8 0 0 1 11 0"/><path d="M2 6.8a12 12 0 0 1 16 0"/>',
  bluetooth: '<path d="M6 6l8 7-4 3V4l4 3-8 7"/>',
  brightness: '<circle cx="10" cy="10" r="3"/><path d="M10 2v2M10 16v2M3 10h2M15 10h2M4.9 4.9l1.4 1.4M13.7 13.7l1.4 1.4M4.9 15.1l1.4-1.4M13.7 6.3l1.4-1.4"/>',
  'quiet-hours': '<path d="M14 4.5A6.5 6.5 0 1 0 14 16a7.8 7.8 0 0 1 0-11.5Z" fill="currentColor" stroke="none"/>',
  'chevron-down': '<path d="M4.5 7.5L10 13l5.5-5.5"/>',
  'chevron-up': '<path d="M4.5 12.5L10 7l5.5 5.5"/>',
  'chevron-left': '<path d="M12.5 4.5L7 10l5.5 5.5"/>',
  'chevron-right': '<path d="M7.5 4.5L13 10l-5.5 5.5"/>',
  edit: '<path d="M4 16v-3l9-9 3 3-9 9H4Z"/><path d="M11 5l3 3"/>',
  add: '<line x1="10" y1="4" x2="10" y2="16"/><line x1="4" y1="10" x2="16" y2="10"/>',
  cancel: '<line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/>',
  more: '<circle cx="4.5" cy="10" r="1.3" fill="currentColor" stroke="none"/><circle cx="10" cy="10" r="1.3" fill="currentColor" stroke="none"/><circle cx="15.5" cy="10" r="1.3" fill="currentColor" stroke="none"/>',
  settings: '<circle cx="10" cy="10" r="2.6"/><path d="M10 3v2.2M10 14.8V17M17 10h-2.2M5.2 10H3M15 5l-1.5 1.5M6.5 13.5L5 15M15 15l-1.5-1.5M6.5 6.5L5 5"/>',
  video: '<rect x="3" y="6" width="10" height="8" rx="1.5"/><path d="M13 9l4-2.5v7L13 11"/>',
  mail: '<rect x="3" y="5" width="14" height="10" rx="1.5"/><path d="M3.5 6l6.5 5.5L16.5 6"/>',
  people: '<circle cx="7" cy="7.5" r="2.5"/><path d="M2.5 16c0-2.8 2-4.5 4.5-4.5s4.5 1.7 4.5 4.5"/><circle cx="14.5" cy="8" r="2"/><path d="M13 11.2c1.9.2 3.5 1.6 4.5 3.3"/>',
  phone: '<rect x="6" y="2" width="8" height="16" rx="2"/><line x1="9" y1="15.3" x2="11" y2="15.3"/>',
  pin: '<path d="M10 2c3 0 5.5 2.3 5.5 5.5C15.5 11.5 10 18 10 18S4.5 11.5 4.5 7.5C4.5 4.3 7 2 10 2Z"/><circle cx="10" cy="7.6" r="2"/>',
  shop: '<path d="M5 7h10l-1 10H6L5 7Z"/><path d="M7.3 7V6a2.7 2.7 0 0 1 5.4 0v1"/>',
  link: '<path d="M8.3 11.7l3.4-3.4"/><path d="M7 13.2l-1.6 1.6a2.5 2.5 0 0 1-3.5-3.5l2.5-2.5a2.5 2.5 0 0 1 3.5 0"/><path d="M13 6.8l1.6-1.6a2.5 2.5 0 0 1 3.5 3.5l-2.5 2.5a2.5 2.5 0 0 1-3.5 0"/>',
  filter: '<path d="M3 4h14l-5 6.5V16l-4 2v-7.5L3 4Z"/>',
  search: '<circle cx="8.5" cy="8.5" r="5"/><line x1="12.3" y1="12.3" x2="17" y2="17"/>',
  camera: '<rect x="3" y="6" width="14" height="10" rx="2"/><rect x="7.5" y="3.5" width="5" height="2.5" rx="1"/><circle cx="10" cy="11" r="3"/>',
  attach: '<path d="M13.5 3.5a3.5 3.5 0 0 1 5 5L10 17a5 5 0 0 1-7-7l7.5-7.5a2.5 2.5 0 0 1 3.5 3.5L6.8 13.2a1 1 0 0 1-1.4-1.4L11.5 5.7"/>',
  send: '<path d="M3 10.3L17 3.3l-5.2 13.4-2.4-5.8L3 10.3Z"/>',
  forward: '<line x1="4" y1="10" x2="15" y2="10"/><path d="M11 5.5L16 10l-5 4.5"/>',
  back: '<line x1="16" y1="10" x2="5" y2="10"/><path d="M9 5.5L4 10l5 4.5"/>',
  refresh: '<path d="M4.5 10a5.5 5.5 0 0 1 9.6-3.6M15.5 10a5.5 5.5 0 0 1-9.6 3.6"/><path d="M14.5 3.5v3.4h-3.4M5.5 16.5v-3.4h3.4"/>',
  share: '<circle cx="15" cy="5" r="2"/><circle cx="15" cy="15" r="2"/><circle cx="5" cy="10" r="2"/><line x1="6.7" y1="9" x2="13.3" y2="6"/><line x1="6.7" y1="11" x2="13.3" y2="14"/>',
  lock: '<rect x="5" y="9" width="10" height="8" rx="1.5"/><path d="M7 9V7a3 3 0 0 1 6 0v2"/>',
  'favorite-star': '<path d="M10 3l2.1 4.4 4.9.6-3.6 3.4.9 4.8L10 13.9l-4.3 2.3.9-4.8-3.6-3.4 4.9-.6L10 3Z"/>',
  'favorite-star-fill': '<path d="M10 3l2.1 4.4 4.9.6-3.6 3.4.9 4.8L10 13.9l-4.3 2.3.9-4.8-3.6-3.4 4.9-.6L10 3Z" fill="currentColor" stroke="none"/>',
  remove: '<line x1="4" y1="10" x2="16" y2="10"/>',
  'checkbox-composite': '<rect x="4" y="4" width="12" height="12" rx="2"/><path d="M6.5 10.2l2.3 2.3 4.7-4.7"/>',
  'check-mark': '<path d="M4 10.5l4 4 8-9"/>',
  print: '<rect x="4" y="7" width="12" height="6" rx="1"/><path d="M6.5 7V3.5h7V7"/><path d="M6.5 13v3.5h7V13"/>',
  up: '<line x1="10" y1="16" x2="10" y2="4"/><path d="M5.5 9L10 4.5 14.5 9"/>',
  down: '<line x1="10" y1="4" x2="10" y2="16"/><path d="M5.5 11L10 15.5 14.5 11"/>',
  delete: '<line x1="5" y1="6" x2="15" y2="6"/><path d="M8 6V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1"/><path d="M6.3 6l.8 10a1 1 0 0 0 1 .9h3.8a1 1 0 0 0 1-.9L13.7 6"/>',
  save: '<path d="M4.5 4h8l3 3v9h-11V4Z"/><rect x="7" y="4" width="5.5" height="3.5"/><rect x="6.3" y="11.5" width="7.4" height="3.2"/>',
  cloud: '<path d="M6.3 14.5a3.6 3.6 0 0 1 .4-7.2 4.8 4.8 0 0 1 9.1 1.4 3.1 3.1 0 0 1-.8 5.8h-8.7Z"/>',
  keyboard: '<rect x="3" y="6" width="14" height="8" rx="1.5"/><line x1="5.5" y1="8.5" x2="5.5" y2="8.5"/><line x1="8" y1="8.5" x2="8" y2="8.5"/><line x1="10.5" y1="8.5" x2="10.5" y2="8.5"/><line x1="13" y1="8.5" x2="13" y2="8.5"/><line x1="14.5" y1="8.5" x2="14.5" y2="8.5"/><line x1="6" y1="11.3" x2="14" y2="11.3"/>',
  play: '<path d="M7 4.3v11.4L16 10 7 4.3Z"/>',
  pause: '<rect x="6" y="4" width="3" height="12"/><rect x="11" y="4" width="3" height="12"/>',
  emoji: '<circle cx="10" cy="10" r="7"/><circle cx="7.3" cy="8.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="12.7" cy="8.5" r="0.9" fill="currentColor" stroke="none"/><path d="M6.8 12a4 4 0 0 0 6.4 0"/>',
  globe: '<circle cx="10" cy="10" r="7"/><ellipse cx="10" cy="10" rx="3" ry="7"/><line x1="3" y1="10" x2="17" y2="10"/>',
  contact: '<circle cx="10" cy="7.5" r="3.2"/><path d="M4 17c0-3.3 2.7-5.3 6-5.3s6 2 6 5.3"/>',
  paste: '<rect x="5" y="4" width="10" height="14" rx="1.5"/><rect x="7.5" y="2.3" width="5" height="3" rx="1"/><line x1="7.3" y1="9.5" x2="12.7" y2="9.5"/><line x1="7.3" y1="12.5" x2="12.7" y2="12.5"/>',
  unlock: '<rect x="5" y="9" width="10" height="8" rx="1.5"/><path d="M7 9V7a3 3 0 0 1 5.8-1.1"/>',
  calendar: '<rect x="4" y="5" width="12" height="11" rx="1.5"/><line x1="4" y1="8.5" x2="16" y2="8.5"/><line x1="7.3" y1="3.2" x2="7.3" y2="6"/><line x1="12.7" y1="3.2" x2="12.7" y2="6"/>',
  color: '<path d="M10 3a7 7 0 1 0 0 14c1 0 1.3-.9.6-1.6-.5-.5-.2-1.4.6-1.4h1.6A3.4 3.4 0 0 0 16.5 10 7 7 0 0 0 10 3Z"/><circle cx="6.7" cy="9" r="1" fill="currentColor" stroke="none"/><circle cx="9.5" cy="6.3" r="1" fill="currentColor" stroke="none"/><circle cx="13" cy="7.8" r="1" fill="currentColor" stroke="none"/>',
  redo: '<path d="M15.5 10a5.5 5.5 0 1 1-1.6-3.9"/><path d="M15.5 3.5v3.4h-3.4"/>',
  undo: '<path d="M4.5 10a5.5 5.5 0 1 0 1.6-3.9"/><path d="M4.5 3.5v3.4h3.4"/>',
  warning: '<path d="M10 3.5l7.5 13h-15l7.5-13Z"/><line x1="10" y1="8.5" x2="10" y2="12"/><circle cx="10" cy="14.3" r="0.9" fill="currentColor" stroke="none"/>',
  flag: '<line x1="5" y1="3" x2="5" y2="17"/><path d="M5 3.5h9l-2 3.5 2 3.5H5Z"/>',
  page: '<rect x="5" y="3" width="10" height="14" rx="1"/><line x1="7.3" y1="7" x2="12.7" y2="7"/><line x1="7.3" y1="10" x2="12.7" y2="10"/><line x1="7.3" y1="13" x2="11" y2="13"/>',
  'touch-pointer': '<path d="M5 3l9 9h-4l2.5 5-1.8.9-2.5-5-3 3.1V3Z"/>',
  home: '<path d="M4 10.5L10 4l6 6.5"/><path d="M6 9.3V17h8V9.3"/>',
  clock: '<circle cx="10" cy="10" r="7"/><path d="M10 6v4.3l3 2"/>',
  view: '<path d="M2 10c2.5-4.3 5.8-6.3 8-6.3s5.5 2 8 6.3c-2.5 4.3-5.8 6.3-8 6.3S4.5 14.3 2 10Z"/><circle cx="10" cy="10" r="2.3"/>',
  clear: '<line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/>',
  sync: '<path d="M4.5 10a5.5 5.5 0 0 1 9.6-3.6M15.5 10a5.5 5.5 0 0 1-9.6 3.6"/><path d="M14.5 3.5v3.4h-3.4M5.5 16.5v-3.4h3.4"/>',
  download: '<line x1="10" y1="3" x2="10" y2="12"/><path d="M6 8.5L10 12.5 14 8.5"/><line x1="4.5" y1="16.5" x2="15.5" y2="16.5"/>',
  help: '<circle cx="10" cy="10" r="7"/><path d="M7.8 8a2.2 2.2 0 1 1 3.2 2c-.8.5-1 1-1 1.7"/><circle cx="10" cy="14" r="0.9" fill="currentColor" stroke="none"/>',
  upload: '<line x1="10" y1="12.5" x2="10" y2="3.5"/><path d="M6 7L10 3 14 7"/><line x1="4.5" y1="16.5" x2="15.5" y2="16.5"/>',
  document: '<path d="M6 3h6l4 4v10H6V3Z"/><path d="M12 3v4h4"/>',
  'view-all': '<rect x="3.5" y="3.5" width="5.5" height="5.5" rx="1"/><rect x="11" y="3.5" width="5.5" height="5.5" rx="1"/><rect x="3.5" y="11" width="5.5" height="5.5" rx="1"/><rect x="11" y="11" width="5.5" height="5.5" rx="1"/>',
  rename: '<path d="M4 16v-3l9-9 3 3-9 9H4Z"/><line x1="4" y1="17.5" x2="9" y2="17.5"/>',
  folder: '<path d="M3 6.3h5l2 2h7v8.4H3V6.3Z"/>',
  'chrome-close': '<line x1="5.5" y1="5.5" x2="14.5" y2="14.5"/><line x1="14.5" y1="5.5" x2="5.5" y2="14.5"/>',
  message: '<path d="M4 5h12v8H10l-3.3 3v-3H4V5Z"/>',
  cut: '<circle cx="5.5" cy="5.5" r="2"/><circle cx="5.5" cy="14.5" r="2"/><line x1="7" y1="6.8" x2="17" y2="16"/><line x1="7" y1="13.2" x2="17" y2="4"/>',
  copy: '<rect x="4" y="4" width="9" height="9" rx="1"/><path d="M7 16h9V7h-3"/>',
  sort: '<path d="M6 4v10.5M6 4L3.5 6.5M6 4l2.5 2.5"/><path d="M14 16V5.5M14 16l2.5-2.5M14 16l-2.5-2.5"/>',
  font: '<text x="10" y="15" font-size="13" font-weight="600" text-anchor="middle" fill="currentColor" stroke="none">A</text>',
  tag: '<path d="M4 10.3V5a1 1 0 0 1 1-1h5.3L16 9.7 10.3 15.4 4 10.3Z"/><circle cx="7.3" cy="7.3" r="1" fill="currentColor" stroke="none"/>',
  library: '<rect x="3.5" y="4" width="3" height="12" rx="0.8"/><rect x="8.5" y="4" width="3" height="12" rx="0.8"/><rect x="13.5" y="6.5" width="3" height="9.5" rx="0.8"/>',
  accept: '<circle cx="10" cy="10" r="7"/><path d="M6.5 10.2l2.3 2.3 4.7-4.7"/>',
  comment: '<path d="M4 5h12v8H10l-3.3 3v-3H4V5Z"/>',
  pictures: '<rect x="3" y="4" width="14" height="12" rx="1.5"/><circle cx="7" cy="8" r="1.4"/><path d="M4 15l4.5-4.5 3 3 2-2L17 15"/>',
  'chrome-minimize': '<line x1="5" y1="14" x2="15" y2="14"/>',
  'chrome-maximize': '<rect x="5" y="5" width="10" height="10" rx="1"/>',
  'chrome-restore': '<rect x="6.5" y="4" width="8" height="8" rx="1"/><path d="M5.5 8.5H4.5v7h8v-1"/>',
  completed: '<circle cx="10" cy="10" r="7"/><path d="M6.5 10.2l2.3 2.3 4.7-4.7"/>',
  code: '<path d="M7.5 5.5L3 10l4.5 4.5M12.5 5.5L17 10l-4.5 4.5"/>',
  info: '<circle cx="10" cy="10" r="7"/><line x1="10" y1="9" x2="10" y2="14"/><circle cx="10" cy="6.3" r="0.9" fill="currentColor" stroke="none"/>',
  shield: '<path d="M10 2.5l6.5 2.6V10c0 4.5-3.3 7.2-6.5 8-3.2-.8-6.5-3.5-6.5-8V5.1L10 2.5Z"/>',
  list: '<circle cx="4.2" cy="5.5" r="1" fill="currentColor" stroke="none"/><circle cx="4.2" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="4.2" cy="14.5" r="1" fill="currentColor" stroke="none"/><line x1="7.5" y1="5.5" x2="16.5" y2="5.5"/><line x1="7.5" y1="10" x2="16.5" y2="10"/><line x1="7.5" y1="14.5" x2="16.5" y2="14.5"/>',
  'error-badge': '<circle cx="10" cy="10" r="7"/><line x1="7.5" y1="7.5" x2="12.5" y2="12.5"/><line x1="12.5" y1="7.5" x2="7.5" y2="12.5"/>',
  lightbulb: '<path d="M10 3.5a4.8 4.8 0 0 0-2.7 8.8c.5.4.7.8.7 1.4v.5h4v-.5c0-.6.2-1 .7-1.4A4.8 4.8 0 0 0 10 3.5Z"/><line x1="8.3" y1="16.5" x2="11.7" y2="16.5"/>',
  ringer: '<path d="M10 3a4 4 0 0 1 4 4v2.3c0 1.7.7 2.7 1.6 3.7H4.4c.9-1 1.6-2 1.6-3.7V7a4 4 0 0 1 4-4Z"/><path d="M8.3 15.5a1.9 1.9 0 0 0 3.4 0"/>',
  heart: '<path d="M10 17C4.5 12.7 2.5 9.5 2.5 6.6A3.8 3.8 0 0 1 10 5.1a3.8 3.8 0 0 1 7.5 1.5c0 2.9-2 6.1-7.5 10.4Z"/>',
  bug: '<rect x="6.5" y="7" width="7" height="8.5" rx="3.5"/><line x1="10" y1="4.5" x2="10" y2="7"/><line x1="3.5" y1="8" x2="6.5" y2="9"/><line x1="3.5" y1="14.5" x2="6.5" y2="13"/><line x1="16.5" y1="8" x2="13.5" y2="9"/><line x1="16.5" y1="14.5" x2="13.5" y2="13"/><path d="M7.5 5.3l1.2 1.5M12.5 5.3l-1.2 1.5"/>',
};

/** Renders a Symbol as an inline SVG string sized to `size` px (default 16, matching FontIcon's default). */
export function iconMarkup(name, size = 16) {
  const body = PATHS[name];
  if (!body) return `<svg width="${size}" height="${size}" viewBox="0 0 20 20"></svg>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" ${DEFAULTS} aria-hidden="true">${body}</svg>`;
}

export function createIcon(name, size = 16) {
  const wrap = document.createElement('span');
  wrap.className = 'tsl-icon';
  wrap.style.cssText = `display:inline-flex;width:${size}px;height:${size}px;flex:none;`;
  wrap.innerHTML = iconMarkup(name, size);
  return wrap;
}

// ---------------------------------------------------------------- chrome (structural) icons
// These match TesselIcons' font-independent vector glyphs used inside other controls.

export function chevronSvg(direction = 'down', size = 12) {
  return iconMarkup(`chevron-${direction}`, size);
}

export function closeSvg(size = 12) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/></svg>`;
}

export function checkmarkSvg(size = 14, strokeWidth = 2) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10.2l4.3 4.3 7.7-8.8"/></svg>`;
}

export function severitySvg(severity, size = 16) {
  const map = {
    success: '<circle cx="10" cy="10" r="9" fill="currentColor"/><path d="M6 10.3l2.7 2.7L14.5 7" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    warning: '<path d="M10 2 18.5 17h-17Z" fill="currentColor"/><line x1="10" y1="8" x2="10" y2="12.2" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><circle cx="10" cy="14.6" r="0.95" fill="#fff"/>',
    error: '<circle cx="10" cy="10" r="9" fill="currentColor"/><line x1="7" y1="7" x2="13" y2="13" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><line x1="13" y1="7" x2="7" y2="13" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>',
    informational: '<circle cx="10" cy="10" r="9" fill="currentColor"/><line x1="10" y1="9" x2="10" y2="14" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle cx="10" cy="6" r="1.05" fill="#fff"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" aria-hidden="true">${map[severity] || map.informational}</svg>`;
}

export function folderSvg(size = 16) {
  return iconMarkup('folder', size);
}

export function fileSvg(size = 16) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2.5h6l4 4v11H6v-15Z"/><path d="M12 2.5v4h4"/></svg>`;
}
