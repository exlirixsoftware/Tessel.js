/*! Tessel.js v1.0.0 — A pure-JavaScript, framework-free port of the Tessel4J look and feel — Fluent-inspired Web Components for the browser.
 * MIT License — bundled 2026-10-31
 */


// src/core/palette.js
function clamp255(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}
function hexToRgb(hex) {
  const h2 = hex.replace("#", "");
  const full = h2.length === 3 ? h2.split("").map((c) => c + c).join("") : h2;
  const num = parseInt(full, 16);
  return { r: num >> 16 & 255, g: num >> 8 & 255, b: num & 255 };
}
function rgbToHex(r, g, b) {
  const toHex = (v) => clamp255(v).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function mix(from, to, amount) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return rgbToHex(
    a.r + (b.r - a.r) * amount,
    a.g + (b.g - a.g) * amount,
    a.b + (b.b - a.b) * amount
  );
}
function channel(v) {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
var WHITE = "#ffffff";
var BLACK = "#000000";
function buildPalette(dark, accent2) {
  const p = { dark: !!dark };
  p.background = dark ? "#0f1115" : "#f4f5f7";
  p.surface = dark ? "#181b21" : "#ffffff";
  p.surfaceAlt = dark ? "#1d2027" : "#f9fafb";
  p.subtle = dark ? "#242832" : "#eef0f3";
  p.border = dark ? "#2c313b" : "#e1e4e8";
  p.borderStrong = dark ? "#434b58" : "#c4cad3";
  p.text = dark ? "#e8eaed" : "#1b1f24";
  p.textSecondary = dark ? "#a3acb9" : "#58626f";
  p.textTertiary = dark ? "#7a8494" : "#8a93a0";
  p.textDisabled = dark ? "#565e6b" : "#a8afb9";
  p.controlBackground = dark ? "#20242c" : "#ffffff";
  p.controlHover = dark ? "#292e38" : "#f2f3f5";
  p.controlPressed = dark ? "#313743" : "#e7e9ed";
  p.inputBackground = dark ? "#14171c" : "#ffffff";
  p.overlay = dark ? "rgba(0, 0, 0, 0.6)" : "rgba(16, 19, 24, 0.4)";
  p.success = dark ? "#4ade80" : "#15803d";
  p.successSubtle = dark ? "#15291e" : "#e3f8ea";
  p.warning = dark ? "#fbbf24" : "#b45309";
  p.warningSubtle = dark ? "#33280f" : "#fef4dc";
  p.danger = dark ? "#ef4444" : "#dc2626";
  p.dangerHover = dark ? "#f26363" : "#b91c1c";
  p.dangerSubtle = dark ? "#361a1c" : "#fde8e8";
  p.info = dark ? "#38bdf8" : "#0369a1";
  p.infoSubtle = dark ? "#122838" : "#e3f2fc";
  p.shadow = dark ? "rgba(0, 0, 0, 0.43)" : "rgba(0, 0, 0, 0.12)";
  if (!accent2) {
    p.accent = dark ? "#6366f1" : "#4f46e5";
    p.accentHover = dark ? "#7c7ff4" : "#4338ca";
    p.accentPressed = dark ? "#5457d6" : "#3730a3";
    p.accentSubtle = dark ? "#272a52" : "#eef0ff";
    p.onAccent = WHITE;
  } else {
    const c = accent2.length === 9 ? `#${accent2.slice(1, 7)}` : accent2;
    p.accent = c;
    p.accentHover = dark ? mix(c, WHITE, 0.14) : mix(c, BLACK, 0.12);
    p.accentPressed = dark ? mix(c, BLACK, 0.15) : mix(c, BLACK, 0.24);
    p.accentSubtle = mix(c, p.surface, dark ? 0.78 : 0.88);
    p.onAccent = luminance(c) > 0.5 ? "#111418" : WHITE;
  }
  return p;
}

// src/core/tokens.js
var RADIUS = {
  sm: "4px",
  // menu/list/tree/nav row highlights, spinner buttons
  md: "6px",
  // buttons, inputs, checkbox/radio box, combo, spinner shell
  lg: "8px",
  // cards, dialogs, info bars, expanders, settings cards
  pill: "999px"
};
var SPACING = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  xxl: "24px"
};
var MOTION = {
  fast: "130ms",
  base: "180ms",
  slow: "220ms",
  ease: "cubic-bezier(0.16, 1, 0.3, 1)"
  // approximates the ease-out-quad/cubic used throughout Tessel4J
};
var FONT_STACK = "'Segoe UI', 'SF Pro Text', 'Helvetica Neue', Inter, Cantarell, Ubuntu, 'Noto Sans', system-ui, sans-serif";
var MONO_STACK = "'Cascadia Mono', Consolas, 'JetBrains Mono', 'SF Mono', Menlo, 'DejaVu Sans Mono', ui-monospace, monospace";
var DISABLED_ALPHA = 0.45;
var baseInstalled = false;
function installBaseStyles() {
  if (baseInstalled) return;
  baseInstalled = true;
  const style2 = document.createElement("style");
  style2.id = "tessel-base-styles";
  style2.textContent = `
    [data-tessel-root], [data-tessel-root] * { box-sizing: border-box; }
    [data-tessel-root] {
      font-family: ${FONT_STACK};
      color: var(--tsl-text);
      background: var(--tsl-background);
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }
    /* The 14px base goes on <body>, not <html>: a root font-size would silently rescale every rem in the host page. */
    [data-tessel-root] body { font-size: 14px; }
    /* Scrollbars: thin, token-colored thumb on a transparent track (scrollbar-color inherits, scrollbar-width doesn't). */
    html[data-tessel-root] { scrollbar-color: var(--tsl-border-strong) transparent; }
    [data-tessel-root] * { scrollbar-width: thin; }
    [data-tessel-root] *:hover { scrollbar-color: var(--tsl-text-tertiary) transparent; }
    [data-tessel-root] :focus { outline: none; }
    [data-tessel-root] :focus-visible { outline: none; }
    /* Light-DOM panel elements default to inline; :not([hidden]) never fights the UA [hidden] rule
       the way an inline style="display:block" would, since the two selectors are mutually exclusive. */
    tsl-tab-panel:not([hidden]), tsl-nav-page:not([hidden]) { display: block; }
  `;
  document.head.appendChild(style2);
}

// src/core/theme.js
var TesselTheme = Object.freeze({
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system"
});
var ButtonStyle = Object.freeze({
  STANDARD: "standard",
  ACCENT: "accent",
  OUTLINE: "outline",
  SUBTLE: "subtle",
  DANGER: "danger",
  ICON: "icon",
  LINK: "link"
});
var TextStyle = Object.freeze({
  DISPLAY: "display",
  TITLE: "title",
  SUBTITLE: "subtitle",
  HEADER: "header",
  BODY_STRONG: "body-strong",
  BODY: "body",
  SECONDARY: "secondary",
  CAPTION: "caption",
  CODE: "code"
});
var Severity = Object.freeze({
  INFORMATIONAL: "informational",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error"
});
var BadgeKind = Object.freeze({
  NEUTRAL: "neutral",
  ACCENT: "accent",
  SUCCESS: "success",
  WARNING: "warning",
  DANGER: "danger",
  INFO: "info"
});
var theme = TesselTheme.LIGHT;
var accent = null;
var palette = buildPalette(false, null);
var listeners = /* @__PURE__ */ new Set();
var mediaQuery = null;
var installed = false;
function isSystemDark() {
  return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function applyToDom() {
  const root = document.documentElement;
  const map = {
    "--tsl-background": palette.background,
    "--tsl-surface": palette.surface,
    "--tsl-surface-alt": palette.surfaceAlt,
    "--tsl-subtle": palette.subtle,
    "--tsl-border": palette.border,
    "--tsl-border-strong": palette.borderStrong,
    "--tsl-text": palette.text,
    "--tsl-text-secondary": palette.textSecondary,
    "--tsl-text-tertiary": palette.textTertiary,
    "--tsl-text-disabled": palette.textDisabled,
    "--tsl-control-bg": palette.controlBackground,
    "--tsl-control-hover": palette.controlHover,
    "--tsl-control-pressed": palette.controlPressed,
    "--tsl-input-bg": palette.inputBackground,
    "--tsl-overlay": palette.overlay,
    "--tsl-accent": palette.accent,
    "--tsl-accent-hover": palette.accentHover,
    "--tsl-accent-pressed": palette.accentPressed,
    "--tsl-accent-subtle": palette.accentSubtle,
    "--tsl-on-accent": palette.onAccent,
    "--tsl-success": palette.success,
    "--tsl-success-subtle": palette.successSubtle,
    "--tsl-warning": palette.warning,
    "--tsl-warning-subtle": palette.warningSubtle,
    "--tsl-danger": palette.danger,
    "--tsl-danger-hover": palette.dangerHover,
    "--tsl-danger-subtle": palette.dangerSubtle,
    "--tsl-info": palette.info,
    "--tsl-info-subtle": palette.infoSubtle,
    "--tsl-shadow": palette.shadow,
    "--tsl-radius-sm": RADIUS.sm,
    "--tsl-radius-md": RADIUS.md,
    "--tsl-radius-lg": RADIUS.lg,
    "--tsl-radius-pill": RADIUS.pill,
    "--tsl-space-xs": SPACING.xs,
    "--tsl-space-sm": SPACING.sm,
    "--tsl-space-md": SPACING.md,
    "--tsl-space-lg": SPACING.lg,
    "--tsl-space-xl": SPACING.xl,
    "--tsl-space-xxl": SPACING.xxl,
    "--tsl-duration-fast": MOTION.fast,
    "--tsl-duration-base": MOTION.base,
    "--tsl-duration-slow": MOTION.slow,
    "--tsl-ease": MOTION.ease,
    "--tsl-font": FONT_STACK,
    "--tsl-font-mono": MONO_STACK,
    "--tsl-disabled-alpha": String(DISABLED_ALPHA)
  };
  for (const [key, value] of Object.entries(map)) root.style.setProperty(key, value);
  root.setAttribute("data-tessel-theme", palette.dark ? "dark" : "light");
  root.setAttribute("data-tessel-root", "");
  root.style.colorScheme = palette.dark ? "dark" : "light";
}
function install(notify) {
  installBaseStyles();
  const dark = theme === TesselTheme.DARK || theme === TesselTheme.SYSTEM && isSystemDark();
  palette = buildPalette(dark, accent);
  applyToDom();
  if (theme === TesselTheme.SYSTEM) {
    if (!mediaQuery) {
      mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", () => {
        if (theme === TesselTheme.SYSTEM) install(true);
      });
    }
  }
  if (notify) for (const l of listeners) l();
}
function setup(initialTheme = TesselTheme.SYSTEM, initialAccent = null) {
  theme = initialTheme || TesselTheme.SYSTEM;
  accent = initialAccent || null;
  installed = true;
  install(false);
}
function setTheme(next) {
  theme = next || TesselTheme.SYSTEM;
  if (!installed) return setup(theme, accent);
  install(true);
}
function setAccent(next) {
  accent = next || null;
  if (!installed) return setup(theme, accent);
  install(true);
}
function getTheme() {
  return theme;
}
function getAccent() {
  return accent;
}
function getPalette() {
  return palette;
}
function isDark() {
  return palette.dark;
}
function addThemeListener(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function removeThemeListener(fn) {
  listeners.delete(fn);
}
function ensureInstalled() {
  if (!installed) setup(TesselTheme.SYSTEM, null);
}

// src/core/icons.js
var DEFAULTS = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
var Symbol = Object.freeze({
  GLOBAL_NAV: "global-nav",
  WIFI: "wifi",
  BLUETOOTH: "bluetooth",
  BRIGHTNESS: "brightness",
  QUIET_HOURS: "quiet-hours",
  CHEVRON_DOWN: "chevron-down",
  CHEVRON_UP: "chevron-up",
  EDIT: "edit",
  ADD: "add",
  CANCEL: "cancel",
  MORE: "more",
  SETTINGS: "settings",
  VIDEO: "video",
  MAIL: "mail",
  PEOPLE: "people",
  PHONE: "phone",
  PIN: "pin",
  SHOP: "shop",
  LINK: "link",
  FILTER: "filter",
  SEARCH: "search",
  CAMERA: "camera",
  ATTACH: "attach",
  SEND: "send",
  FORWARD: "forward",
  BACK: "back",
  REFRESH: "refresh",
  SHARE: "share",
  LOCK: "lock",
  FAVORITE_STAR: "favorite-star",
  FAVORITE_STAR_FILL: "favorite-star-fill",
  REMOVE: "remove",
  CHECKBOX_COMPOSITE: "checkbox-composite",
  CHECK_MARK: "check-mark",
  PRINT: "print",
  UP: "up",
  DOWN: "down",
  DELETE: "delete",
  SAVE: "save",
  CLOUD: "cloud",
  KEYBOARD: "keyboard",
  PLAY: "play",
  PAUSE: "pause",
  CHEVRON_LEFT: "chevron-left",
  CHEVRON_RIGHT: "chevron-right",
  EMOJI: "emoji",
  GLOBE: "globe",
  CONTACT: "contact",
  PASTE: "paste",
  UNLOCK: "unlock",
  CALENDAR: "calendar",
  COLOR: "color",
  REDO: "redo",
  UNDO: "undo",
  WARNING: "warning",
  FLAG: "flag",
  PAGE: "page",
  TOUCH_POINTER: "touch-pointer",
  HOME: "home",
  CLOCK: "clock",
  VIEW: "view",
  CLEAR: "clear",
  SYNC: "sync",
  DOWNLOAD: "download",
  HELP: "help",
  UPLOAD: "upload",
  DOCUMENT: "document",
  VIEW_ALL: "view-all",
  RENAME: "rename",
  FOLDER: "folder",
  CHROME_CLOSE: "chrome-close",
  MESSAGE: "message",
  CUT: "cut",
  COPY: "copy",
  SORT: "sort",
  FONT: "font",
  TAG: "tag",
  LIBRARY: "library",
  ACCEPT: "accept",
  COMMENT: "comment",
  PICTURES: "pictures",
  CHROME_MINIMIZE: "chrome-minimize",
  CHROME_MAXIMIZE: "chrome-maximize",
  CHROME_RESTORE: "chrome-restore",
  COMPLETED: "completed",
  CODE: "code",
  INFO: "info",
  SHIELD: "shield",
  LIST: "list",
  ERROR_BADGE: "error-badge",
  LIGHTBULB: "lightbulb",
  RINGER: "ringer",
  HEART: "heart",
  BUG: "bug"
});
var PATHS = {
  "global-nav": '<line x1="3" y1="5" x2="17" y2="5"/><line x1="3" y1="10" x2="17" y2="10"/><line x1="3" y1="15" x2="17" y2="15"/>',
  wifi: '<circle cx="10" cy="15" r="1" fill="currentColor" stroke="none"/><path d="M7 12.3a4.2 4.2 0 0 1 6 0"/><path d="M4.5 9.5a8 8 0 0 1 11 0"/><path d="M2 6.8a12 12 0 0 1 16 0"/>',
  bluetooth: '<path d="M6 6l8 7-4 3V4l4 3-8 7"/>',
  brightness: '<circle cx="10" cy="10" r="3"/><path d="M10 2v2M10 16v2M3 10h2M15 10h2M4.9 4.9l1.4 1.4M13.7 13.7l1.4 1.4M4.9 15.1l1.4-1.4M13.7 6.3l1.4-1.4"/>',
  "quiet-hours": '<path d="M14 4.5A6.5 6.5 0 1 0 14 16a7.8 7.8 0 0 1 0-11.5Z" fill="currentColor" stroke="none"/>',
  "chevron-down": '<path d="M4.5 7.5L10 13l5.5-5.5"/>',
  "chevron-up": '<path d="M4.5 12.5L10 7l5.5 5.5"/>',
  "chevron-left": '<path d="M12.5 4.5L7 10l5.5 5.5"/>',
  "chevron-right": '<path d="M7.5 4.5L13 10l-5.5 5.5"/>',
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
  "favorite-star": '<path d="M10 3l2.1 4.4 4.9.6-3.6 3.4.9 4.8L10 13.9l-4.3 2.3.9-4.8-3.6-3.4 4.9-.6L10 3Z"/>',
  "favorite-star-fill": '<path d="M10 3l2.1 4.4 4.9.6-3.6 3.4.9 4.8L10 13.9l-4.3 2.3.9-4.8-3.6-3.4 4.9-.6L10 3Z" fill="currentColor" stroke="none"/>',
  remove: '<line x1="4" y1="10" x2="16" y2="10"/>',
  "checkbox-composite": '<rect x="4" y="4" width="12" height="12" rx="2"/><path d="M6.5 10.2l2.3 2.3 4.7-4.7"/>',
  "check-mark": '<path d="M4 10.5l4 4 8-9"/>',
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
  "touch-pointer": '<path d="M5 3l9 9h-4l2.5 5-1.8.9-2.5-5-3 3.1V3Z"/>',
  home: '<path d="M4 10.5L10 4l6 6.5"/><path d="M6 9.3V17h8V9.3"/>',
  clock: '<circle cx="10" cy="10" r="7"/><path d="M10 6v4.3l3 2"/>',
  view: '<path d="M2 10c2.5-4.3 5.8-6.3 8-6.3s5.5 2 8 6.3c-2.5 4.3-5.8 6.3-8 6.3S4.5 14.3 2 10Z"/><circle cx="10" cy="10" r="2.3"/>',
  clear: '<line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/>',
  sync: '<path d="M4.5 10a5.5 5.5 0 0 1 9.6-3.6M15.5 10a5.5 5.5 0 0 1-9.6 3.6"/><path d="M14.5 3.5v3.4h-3.4M5.5 16.5v-3.4h3.4"/>',
  download: '<line x1="10" y1="3" x2="10" y2="12"/><path d="M6 8.5L10 12.5 14 8.5"/><line x1="4.5" y1="16.5" x2="15.5" y2="16.5"/>',
  help: '<circle cx="10" cy="10" r="7"/><path d="M7.8 8a2.2 2.2 0 1 1 3.2 2c-.8.5-1 1-1 1.7"/><circle cx="10" cy="14" r="0.9" fill="currentColor" stroke="none"/>',
  upload: '<line x1="10" y1="12.5" x2="10" y2="3.5"/><path d="M6 7L10 3 14 7"/><line x1="4.5" y1="16.5" x2="15.5" y2="16.5"/>',
  document: '<path d="M6 3h6l4 4v10H6V3Z"/><path d="M12 3v4h4"/>',
  "view-all": '<rect x="3.5" y="3.5" width="5.5" height="5.5" rx="1"/><rect x="11" y="3.5" width="5.5" height="5.5" rx="1"/><rect x="3.5" y="11" width="5.5" height="5.5" rx="1"/><rect x="11" y="11" width="5.5" height="5.5" rx="1"/>',
  rename: '<path d="M4 16v-3l9-9 3 3-9 9H4Z"/><line x1="4" y1="17.5" x2="9" y2="17.5"/>',
  folder: '<path d="M3 6.3h5l2 2h7v8.4H3V6.3Z"/>',
  "chrome-close": '<line x1="5.5" y1="5.5" x2="14.5" y2="14.5"/><line x1="14.5" y1="5.5" x2="5.5" y2="14.5"/>',
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
  "chrome-minimize": '<line x1="5" y1="14" x2="15" y2="14"/>',
  "chrome-maximize": '<rect x="5" y="5" width="10" height="10" rx="1"/>',
  "chrome-restore": '<rect x="6.5" y="4" width="8" height="8" rx="1"/><path d="M5.5 8.5H4.5v7h8v-1"/>',
  completed: '<circle cx="10" cy="10" r="7"/><path d="M6.5 10.2l2.3 2.3 4.7-4.7"/>',
  code: '<path d="M7.5 5.5L3 10l4.5 4.5M12.5 5.5L17 10l-4.5 4.5"/>',
  info: '<circle cx="10" cy="10" r="7"/><line x1="10" y1="9" x2="10" y2="14"/><circle cx="10" cy="6.3" r="0.9" fill="currentColor" stroke="none"/>',
  shield: '<path d="M10 2.5l6.5 2.6V10c0 4.5-3.3 7.2-6.5 8-3.2-.8-6.5-3.5-6.5-8V5.1L10 2.5Z"/>',
  list: '<circle cx="4.2" cy="5.5" r="1" fill="currentColor" stroke="none"/><circle cx="4.2" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="4.2" cy="14.5" r="1" fill="currentColor" stroke="none"/><line x1="7.5" y1="5.5" x2="16.5" y2="5.5"/><line x1="7.5" y1="10" x2="16.5" y2="10"/><line x1="7.5" y1="14.5" x2="16.5" y2="14.5"/>',
  "error-badge": '<circle cx="10" cy="10" r="7"/><line x1="7.5" y1="7.5" x2="12.5" y2="12.5"/><line x1="12.5" y1="7.5" x2="7.5" y2="12.5"/>',
  lightbulb: '<path d="M10 3.5a4.8 4.8 0 0 0-2.7 8.8c.5.4.7.8.7 1.4v.5h4v-.5c0-.6.2-1 .7-1.4A4.8 4.8 0 0 0 10 3.5Z"/><line x1="8.3" y1="16.5" x2="11.7" y2="16.5"/>',
  ringer: '<path d="M10 3a4 4 0 0 1 4 4v2.3c0 1.7.7 2.7 1.6 3.7H4.4c.9-1 1.6-2 1.6-3.7V7a4 4 0 0 1 4-4Z"/><path d="M8.3 15.5a1.9 1.9 0 0 0 3.4 0"/>',
  heart: '<path d="M10 17C4.5 12.7 2.5 9.5 2.5 6.6A3.8 3.8 0 0 1 10 5.1a3.8 3.8 0 0 1 7.5 1.5c0 2.9-2 6.1-7.5 10.4Z"/>',
  bug: '<rect x="6.5" y="7" width="7" height="8.5" rx="3.5"/><line x1="10" y1="4.5" x2="10" y2="7"/><line x1="3.5" y1="8" x2="6.5" y2="9"/><line x1="3.5" y1="14.5" x2="6.5" y2="13"/><line x1="16.5" y1="8" x2="13.5" y2="9"/><line x1="16.5" y1="14.5" x2="13.5" y2="13"/><path d="M7.5 5.3l1.2 1.5M12.5 5.3l-1.2 1.5"/>'
};
function iconMarkup(name, size = 16) {
  const body = PATHS[name];
  if (!body) return `<svg width="${size}" height="${size}" viewBox="0 0 20 20"></svg>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" ${DEFAULTS} aria-hidden="true">${body}</svg>`;
}
function createIcon(name, size = 16) {
  const wrap = document.createElement("span");
  wrap.className = "tsl-icon";
  wrap.style.cssText = `display:inline-flex;width:${size}px;height:${size}px;flex:none;`;
  wrap.innerHTML = iconMarkup(name, size);
  return wrap;
}
function chevronSvg(direction = "down", size = 12) {
  return iconMarkup(`chevron-${direction}`, size);
}
function closeSvg(size = 12) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/></svg>`;
}
function checkmarkSvg(size = 14, strokeWidth = 2) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10.2l4.3 4.3 7.7-8.8"/></svg>`;
}
function severitySvg(severity, size = 16) {
  const map = {
    success: '<circle cx="10" cy="10" r="9" fill="currentColor"/><path d="M6 10.3l2.7 2.7L14.5 7" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    warning: '<path d="M10 2 18.5 17h-17Z" fill="currentColor"/><line x1="10" y1="8" x2="10" y2="12.2" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><circle cx="10" cy="14.6" r="0.95" fill="#fff"/>',
    error: '<circle cx="10" cy="10" r="9" fill="currentColor"/><line x1="7" y1="7" x2="13" y2="13" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><line x1="13" y1="7" x2="7" y2="13" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>',
    informational: '<circle cx="10" cy="10" r="9" fill="currentColor"/><line x1="10" y1="9" x2="10" y2="14" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle cx="10" cy="6" r="1.05" fill="#fff"/>'
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" aria-hidden="true">${map[severity] || map.informational}</svg>`;
}
function folderSvg(size = 16) {
  return iconMarkup("folder", size);
}
function fileSvg(size = 16) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2.5h6l4 4v11H6v-15Z"/><path d="M12 2.5v4h4"/></svg>`;
}

// src/styles/tailwind.generated.js
var tailwind_generated_default = '@layer theme,base,components,utilities;@layer base{*,::before,::after,::backdrop{--tw-translate-x:0;--tw-translate-y:0;--tw-translate-z:0;--tw-scale-x:1;--tw-scale-y:1;--tw-scale-z:1;--tw-border-style:solid;--tw-shadow:0 0 #0000;--tw-shadow-alpha:100%;--tw-inset-shadow:0 0 #0000;--tw-inset-shadow-alpha:100%;--tw-ring-shadow:0 0 #0000;--tw-inset-ring-shadow:0 0 #0000;--tw-ring-offset-width:0;--tw-ring-offset-color:#fff;--tw-ring-offset-shadow:0 0 #0000;--tw-outline-style:solid;--tw-drop-shadow-alpha:100%;--tw-content:""}}/*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */\n@layer theme{:root,:host{--spacing:4px;--font-weight-normal:400;--font-weight-medium:500;--font-weight-semibold:600;--font-weight-bold:700;--tracking-wider:.05em;--leading-normal:1.5;--default-transition-duration:.15s;--default-transition-timing-function:cubic-bezier(.4, 0, .2, 1);--default-font-family:var(--tsl-font);--default-mono-font-family:var(--tsl-font-mono)}}@layer base{*,:after,:before,::backdrop{box-sizing:border-box;border:0 solid;margin:0;padding:0}::file-selector-button{box-sizing:border-box;border:0 solid;margin:0;padding:0}html,:host{-webkit-text-size-adjust:100%;tab-size:4;line-height:1.5;font-family:var(--default-font-family,-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji");font-feature-settings:var(--default-font-feature-settings,normal);font-variation-settings:var(--default-font-variation-settings,normal);-webkit-tap-highlight-color:transparent}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;-webkit-text-decoration:inherit;-webkit-text-decoration:inherit;-webkit-text-decoration:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:var(--default-mono-font-family,ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace);font-feature-settings:var(--default-mono-font-feature-settings,normal);font-variation-settings:var(--default-mono-font-variation-settings,normal);font-size:1em}small{font-size:80%}sub,sup{vertical-align:baseline;font-size:75%;line-height:0;position:relative}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}:-moz-focusring:where(:not(iframe)){outline:auto}progress{vertical-align:baseline}summary{display:list-item}ol,ul,menu{list-style:none}img,svg,video,canvas,audio,iframe,embed,object{vertical-align:middle;display:block}img,video{max-width:100%;height:auto}button,input,select,optgroup,textarea{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}::file-selector-button{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}:where(select:is([multiple],[size])) optgroup{font-weight:bolder}:where(select:is([multiple],[size])) optgroup option{padding-inline-start:20px}::file-selector-button{margin-inline-end:4px}::placeholder{opacity:1}@supports (not ((-webkit-appearance:-apple-pay-button))) or (contain-intrinsic-size:1px){::placeholder{color:currentColor}@supports (color:color-mix(in lab, red, red)){::placeholder{color:color-mix(in oklab, currentcolor 50%, transparent)}}}textarea{resize:vertical}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-date-and-time-value{min-height:1lh;text-align:inherit}::-webkit-datetime-edit{display:inline-flex}::-webkit-datetime-edit-fields-wrapper{padding:0}::-webkit-datetime-edit{padding-block:0}::-webkit-datetime-edit-year-field{padding-block:0}::-webkit-datetime-edit-month-field{padding-block:0}::-webkit-datetime-edit-day-field{padding-block:0}::-webkit-datetime-edit-hour-field{padding-block:0}::-webkit-datetime-edit-minute-field{padding-block:0}::-webkit-datetime-edit-second-field{padding-block:0}::-webkit-datetime-edit-millisecond-field{padding-block:0}::-webkit-datetime-edit-meridiem-field{padding-block:0}::-webkit-calendar-picker-indicator{line-height:1}:-moz-ui-invalid{box-shadow:none}button,input:where([type=button],[type=reset],[type=submit]){appearance:button}::file-selector-button{appearance:button}::-webkit-inner-spin-button{height:auto}::-webkit-outer-spin-button{height:auto}[hidden]:where(:not([hidden=until-found])){display:none!important}:host{color:var(--tsl-text);font-family:var(--tsl-font);-webkit-font-smoothing:antialiased;font-size:14px;line-height:20px;display:inline-block}button,input,select,textarea{font:inherit;color:inherit}:focus{outline:none}::selection{background:var(--tsl-accent);color:var(--tsl-on-accent)}}@layer components;@layer utilities{.pointer-events-none{pointer-events:none}.collapse{visibility:collapse}.invisible{visibility:hidden}.visible{visibility:visible}.visible\\!{visibility:visible!important}.sr-only{clip-path:inset(50%);white-space:nowrap;border-width:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}.absolute{position:absolute}.fixed{position:fixed}.relative{position:relative}.static{position:static}.sticky{position:sticky}.inset-0{inset:0}.inset-auto{inset:auto}.inset-y-0{inset-block:0}.inset-y-1{inset-block:4px}.top-0{top:0}.top-1{top:4px}.top-1\\/2{top:50%}.right-0{right:0}.right-6{right:24px}.bottom-0{bottom:0}.bottom-6{bottom:24px}.bottom-\\[-1px\\]{bottom:-1px}.left-0{left:0}.left-1{left:4px}.left-1\\/2{left:50%}.left-2{left:8px}.z-10{z-index:10}.z-20{z-index:20}.z-50{z-index:50}.z-60{z-index:60}.z-3000{z-index:3000}.container{width:100%}.m-0{margin:0}.m-auto{margin:auto}.mx-1{margin-inline:4px}.mx-1\\.5{margin-inline:6px}.mx-2{margin-inline:8px}.mx-3{margin-inline:12px}.my-0{margin-block:0}.my-0\\.5{margin-block:2px}.my-1{margin-block:4px}.my-1\\.5{margin-block:6px}.my-2{margin-block:8px}.my-px{margin-block:1px}.mt-0{margin-top:0}.mt-0\\.5{margin-top:2px}.mt-2{margin-top:8px}.mt-3{margin-top:12px}.mt-3\\.5{margin-top:14px}.mt-4{margin-top:16px}.mt-auto{margin-top:auto}.mt-px{margin-top:1px}.-mr-1{margin-right:-4px}.-mr-1\\.5,.mr-\\[-6px\\]{margin-right:-6px}.mb-0{margin-bottom:0}.mb-0\\.5{margin-bottom:2px}.mb-1{margin-bottom:4px}.mb-1\\.5{margin-bottom:6px}.mb-2{margin-bottom:8px}.mb-3{margin-bottom:12px}.mb-3\\.5{margin-bottom:14px}.ml-0{margin-left:0}.ml-0\\.5{margin-left:2px}.ml-1{margin-left:4px}.ml-3{margin-left:12px}.ml-auto{margin-left:auto}.scrollbar-none::-webkit-scrollbar{display:none}.block{display:block}.flex{display:flex}.grid{display:grid}.hidden{display:none}.inline{display:inline}.inline-block{display:inline-block}.inline-flex{display:inline-flex}.table{display:table}.size-1{width:4px;height:4px}.size-1\\.5{width:6px;height:6px}.size-2{width:8px;height:8px}.size-3{width:12px;height:12px}.size-3\\.5{width:14px;height:14px}.size-4{width:16px;height:16px}.size-5{width:20px;height:20px}.size-6{width:24px;height:24px}.size-7{width:28px;height:28px}.size-8{width:32px;height:32px}.size-9{width:36px;height:36px}.size-\\[13px\\]{width:13px;height:13px}.size-\\[18px\\]{width:18px;height:18px}.size-full{width:100%;height:100%}.h-0{height:0}.h-0\\.5{height:2px}.h-1{height:4px}.h-1\\.5{height:6px}.h-3{height:12px}.h-3\\.5{height:14px}.h-4{height:16px}.h-5{height:20px}.h-8{height:32px}.h-9{height:36px}.h-11{height:44px}.h-12{height:48px}.h-24{height:96px}.h-40{height:160px}.h-\\[3px\\]{height:3px}.h-\\[34px\\]{height:34px}.h-\\[46px\\]{height:46px}.h-\\[52px\\]{height:52px}.h-full{height:100%}.h-px{height:1px}.max-h-56{max-height:224px}.max-h-64{max-height:256px}.max-h-\\[calc\\(100vh-48px\\)\\]{max-height:calc(100vh - 48px)}.min-h-0{min-height:0}.min-h-4{min-height:16px}.min-h-6{min-height:24px}.min-h-7{min-height:28px}.min-h-8{min-height:32px}.min-h-9{min-height:36px}.min-h-16{min-height:64px}.min-h-17{min-height:68px}.min-h-\\[30px\\]{min-height:30px}.min-h-\\[200px\\]{min-height:200px}.w-0{width:0}.w-0\\.5{width:2px}.w-1{width:4px}.w-1\\.5{width:6px}.w-2{width:8px}.w-2\\.5{width:10px}.w-3{width:12px}.w-4{width:16px}.w-7{width:28px}.w-8{width:32px}.w-10{width:40px}.w-14{width:56px}.w-40{width:160px}.w-64{width:256px}.w-65{width:260px}.w-72{width:288px}.w-80{width:320px}.w-\\[3px\\]{width:3px}.w-\\[260px\\]{width:260px}.w-\\[280px\\]{width:280px}.w-\\[380px\\]{width:380px}.w-\\[420px\\]{width:420px}.w-\\[460px\\]{width:460px}.w-\\[var\\(--hw\\)\\]{width:var(--hw)}.w-full{width:100%}.w-px{width:1px}.max-w-52{max-width:208px}.max-w-72{max-width:288px}.max-w-\\[calc\\(100vw-32px\\)\\]{max-width:calc(100vw - 32px)}.max-w-\\[min\\(420px\\,calc\\(100vw-16px\\)\\)\\]{max-width:min(420px,100vw - 16px)}.max-w-\\[min\\(548px\\,calc\\(100vw-48px\\)\\)\\]{max-width:min(548px,100vw - 48px)}.min-w-0{min-width:0}.min-w-4{min-width:16px}.min-w-6{min-width:24px}.min-w-24{min-width:96px}.min-w-80{min-width:320px}.min-w-\\[34px\\]{min-width:34px}.min-w-\\[72px\\]{min-width:72px}.min-w-\\[200px\\]{min-width:200px}.flex-1{flex:1}.flex-none{flex:none}.shrink{flex-shrink:1}.grow{flex-grow:1}.origin-center{transform-origin:50%}.-translate-x-1{--tw-translate-x:calc(4px * -1);translate:var(--tw-translate-x) var(--tw-translate-y)}.-translate-x-1\\/2{--tw-translate-x:calc(calc(1 / 2 * 100%) * -1);translate:var(--tw-translate-x) var(--tw-translate-y)}.-translate-x-full{--tw-translate-x:-100%;translate:var(--tw-translate-x) var(--tw-translate-y)}.-translate-x-px{--tw-translate-x:-1px;translate:var(--tw-translate-x) var(--tw-translate-y)}.translate-x-0{--tw-translate-x:0px;translate:var(--tw-translate-x) var(--tw-translate-y)}.translate-x-\\[17px\\]{--tw-translate-x:17px;translate:var(--tw-translate-x) var(--tw-translate-y)}.-translate-y-1{--tw-translate-y:calc(4px * -1);translate:var(--tw-translate-x) var(--tw-translate-y)}.-translate-y-1\\/2{--tw-translate-y:calc(calc(1 / 2 * 100%) * -1);translate:var(--tw-translate-x) var(--tw-translate-y)}.scale-0{--tw-scale-x:0%;--tw-scale-y:0%;--tw-scale-z:0%;scale:var(--tw-scale-x) var(--tw-scale-y)}.scale-60{--tw-scale-x:60%;--tw-scale-y:60%;--tw-scale-z:60%;scale:var(--tw-scale-x) var(--tw-scale-y)}.scale-96{--tw-scale-x:96%;--tw-scale-y:96%;--tw-scale-z:96%;scale:var(--tw-scale-x) var(--tw-scale-y)}.scale-98{--tw-scale-x:98%;--tw-scale-y:98%;--tw-scale-z:98%;scale:var(--tw-scale-x) var(--tw-scale-y)}.scale-100{--tw-scale-x:100%;--tw-scale-y:100%;--tw-scale-z:100%;scale:var(--tw-scale-x) var(--tw-scale-y)}.-rotate-90{rotate:-90deg}.rotate-45{rotate:45deg}.rotate-90{rotate:90deg}.rotate-180{rotate:180deg}.transform{transform:var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,)}.animate-indeterminate{animation:tsl-indeterminate 1.6s var(--tsl-ease) infinite}.animate-ring{animation:1.4s linear infinite tsl-ring}.animate-shimmer{animation:1.4s ease-in-out infinite tsl-shimmer}.cursor-crosshair{cursor:crosshair}.cursor-ew-resize{cursor:ew-resize}.cursor-grab{cursor:grab}.cursor-pointer{cursor:pointer}.touch-none{touch-action:none}.resize{resize:both}.resize-y{resize:vertical}.scrollbar-thin{scrollbar-width:thin;scrollbar-color:var(--tsl-border-strong) transparent}.scrollbar-none{scrollbar-width:none}.scrollbar-thin{scrollbar-width:thin}.\\[appearance\\:textfield\\]{appearance:textfield}.grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.grid-cols-7{grid-template-columns:repeat(7,minmax(0,1fr))}.grid-cols-\\[1fr_auto_1fr\\]{grid-template-columns:1fr auto 1fr}.grid-cols-\\[repeat\\(auto-fill\\,minmax\\(96px\\,1fr\\)\\)\\]{grid-template-columns:repeat(auto-fill,minmax(96px,1fr))}.grid-rows-\\[0fr\\]{grid-template-rows:0fr}.grid-rows-\\[1fr\\]{grid-template-rows:1fr}.grid-rows-\\[1fr_auto_1fr\\]{grid-template-rows:1fr auto 1fr}.flex-col{flex-direction:column}.flex-col-reverse{flex-direction:column-reverse}.flex-wrap{flex-wrap:wrap}.place-items-center{place-items:center}.items-center{align-items:center}.items-end{align-items:flex-end}.items-start{align-items:flex-start}.items-stretch{align-items:stretch}.justify-between{justify-content:space-between}.justify-center{justify-content:center}.justify-end{justify-content:flex-end}.gap-0{gap:0}.gap-0\\.5{gap:2px}.gap-1{gap:4px}.gap-1\\.5{gap:6px}.gap-2{gap:8px}.gap-2\\.5{gap:10px}.gap-3{gap:12px}.gap-4{gap:16px}.gap-8{gap:32px}.gap-12{gap:48px}.gap-px{gap:1px}.gap-x-4{column-gap:16px}.gap-y-0{row-gap:0}.gap-y-0\\.5{row-gap:2px}.gap-y-2{row-gap:8px}.self-center{align-self:center}.truncate{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.overflow-auto{overflow:auto}.overflow-hidden{overflow:hidden}.overflow-visible{overflow:visible}.overflow-x-auto{overflow-x:auto}.overflow-x-hidden{overflow-x:hidden}.overflow-y-auto{overflow-y:auto}.overflow-y-hidden{overflow-y:hidden}.rounded-\\[1\\.5px\\]{border-radius:1.5px}.rounded-\\[1px\\]{border-radius:1px}.rounded-full{border-radius:3.40282e38px}.rounded-lg{border-radius:var(--tsl-radius-lg)}.rounded-md{border-radius:var(--tsl-radius-md)}.rounded-none{border-radius:0}.rounded-pill{border-radius:var(--tsl-radius-pill)}.rounded-sm{border-radius:var(--tsl-radius-sm)}.rounded-xs{border-radius:2px}.rounded-t-lg{border-top-left-radius:var(--tsl-radius-lg);border-top-right-radius:var(--tsl-radius-lg)}.rounded-t-sm{border-top-left-radius:var(--tsl-radius-sm);border-top-right-radius:var(--tsl-radius-sm)}.rounded-tl-lg{border-top-left-radius:var(--tsl-radius-lg)}.rounded-r-sm{border-top-right-radius:var(--tsl-radius-sm);border-bottom-right-radius:var(--tsl-radius-sm)}.rounded-b-lg{border-bottom-right-radius:var(--tsl-radius-lg);border-bottom-left-radius:var(--tsl-radius-lg)}.border{border-style:var(--tw-border-style);border-width:1px}.border-0{border-style:var(--tw-border-style);border-width:0}.border-2{border-style:var(--tw-border-style);border-width:2px}.border-\\[1\\.5px\\]{border-style:var(--tw-border-style);border-width:1.5px}.border-x-0{border-inline-style:var(--tw-border-style);border-inline-width:0}.border-x-2{border-inline-style:var(--tw-border-style);border-inline-width:2px}.border-t{border-top-style:var(--tw-border-style);border-top-width:1px}.border-t-0{border-top-style:var(--tw-border-style);border-top-width:0}.border-r{border-right-style:var(--tw-border-style);border-right-width:1px}.border-b{border-bottom-style:var(--tw-border-style);border-bottom-width:1px}.border-b-0{border-bottom-style:var(--tw-border-style);border-bottom-width:0}.border-l{border-left-style:var(--tw-border-style);border-left-width:1px}.border-dashed{--tw-border-style:dashed;border-style:dashed}.border-accent{border-color:var(--tsl-accent)}.border-black{border-color:#000}.border-black\\/20{border-color:oklab(0% none none/.2) oklab(0% none none/.2) oklab(0% none none/.2) oklab(0% none none/.2)}.border-border{border-color:var(--tsl-border)}.border-border-strong{border-color:var(--tsl-border-strong)}.border-danger{border-color:var(--tsl-danger)}.border-info{border-color:var(--tsl-info)}.border-success{border-color:var(--tsl-success)}.border-surface{border-color:var(--tsl-surface)}.border-text-secondary{border-color:var(--tsl-text-secondary)}.border-text-tertiary{border-color:var(--tsl-text-tertiary)}.border-transparent{border-color:#0000}.border-warning{border-color:var(--tsl-warning)}.border-white{border-color:#fff}.bg-accent{background-color:var(--tsl-accent)}.bg-accent-subtle{background-color:var(--tsl-accent-subtle)}.bg-accent\\/10{background-color:var(--tsl-accent)}@supports (color:color-mix(in lab, red, red)){.bg-accent\\/10{background-color:color-mix(in oklab, var(--tsl-accent) 10%, transparent)}}.bg-accent\\/15{background-color:var(--tsl-accent)}@supports (color:color-mix(in lab, red, red)){.bg-accent\\/15{background-color:color-mix(in oklab, var(--tsl-accent) 15%, transparent)}}.bg-accent\\/25{background-color:var(--tsl-accent)}@supports (color:color-mix(in lab, red, red)){.bg-accent\\/25{background-color:color-mix(in oklab, var(--tsl-accent) 25%, transparent)}}.bg-background{background-color:var(--tsl-background)}.bg-border{background-color:var(--tsl-border)}.bg-border-strong{background-color:var(--tsl-border-strong)}.bg-control{background-color:var(--tsl-control-bg)}.bg-control-hover{background-color:var(--tsl-control-hover)}.bg-current{background-color:currentColor}.bg-danger{background-color:var(--tsl-danger)}.bg-danger-subtle{background-color:var(--tsl-danger-subtle)}.bg-info{background-color:var(--tsl-info)}.bg-info-subtle{background-color:var(--tsl-info-subtle)}.bg-input{background-color:var(--tsl-input-bg)}.bg-on-accent,.bg-on-accent\\/30{background-color:var(--tsl-on-accent)}@supports (color:color-mix(in lab, red, red)){.bg-on-accent\\/30{background-color:color-mix(in oklab, var(--tsl-on-accent) 30%, transparent)}}.bg-overlay{background-color:var(--tsl-overlay)}.bg-subtle,.bg-subtle\\/60{background-color:var(--tsl-subtle)}@supports (color:color-mix(in lab, red, red)){.bg-subtle\\/60{background-color:color-mix(in oklab, var(--tsl-subtle) 60%, transparent)}}.bg-success{background-color:var(--tsl-success)}.bg-success-subtle{background-color:var(--tsl-success-subtle)}.bg-surface{background-color:var(--tsl-surface)}.bg-surface-alt{background-color:var(--tsl-surface-alt)}.bg-text-secondary{background-color:var(--tsl-text-secondary)}.bg-text-tertiary{background-color:var(--tsl-text-tertiary)}.bg-transparent{background-color:#0000}.bg-warning{background-color:var(--tsl-warning)}.bg-warning-subtle{background-color:var(--tsl-warning-subtle)}.bg-white{background-color:#fff}.bg-\\[linear-gradient\\(45deg\\,\\#8884_25\\%\\,transparent_25\\%\\,transparent_75\\%\\,\\#8884_75\\%\\)\\,linear-gradient\\(45deg\\,\\#8884_25\\%\\,transparent_25\\%\\,transparent_75\\%\\,\\#8884_75\\%\\)\\]{background-image:linear-gradient(45deg,#8884 25%,#0000 25% 75%,#8884 75%),linear-gradient(45deg,#8884 25%,#0000 25% 75%,#8884 75%)}.bg-\\[linear-gradient\\(90deg\\,\\#f00\\,\\#ff0\\,\\#0f0\\,\\#0ff\\,\\#00f\\,\\#f0f\\,\\#f00\\)\\]{background-image:linear-gradient(90deg,red,#ff0,#0f0,#0ff,#00f,#f0f,red)}.bg-\\[linear-gradient\\(90deg\\,var\\(--tsl-subtle\\)_25\\%\\,var\\(--tsl-control-hover\\)_50\\%\\,var\\(--tsl-subtle\\)_75\\%\\)\\]{background-image:linear-gradient(90deg,var(--tsl-subtle) 25%,var(--tsl-control-hover) 50%,var(--tsl-subtle) 75%)}.bg-\\[length\\:8px_8px\\]{background-size:8px 8px}.bg-\\[length\\:200\\%_100\\%\\]{background-size:200% 100%}.bg-\\[position\\:0_0\\,4px_4px\\]{background-position:0 0,4px 4px}.stroke-accent{stroke:var(--tsl-accent)}.stroke-border{stroke:var(--tsl-border)}.object-cover{object-fit:cover}.p-0{padding:0}.p-0\\.5{padding:2px}.p-1{padding:4px}.p-3{padding:12px}.p-4{padding:16px}.p-5{padding:20px}.p-6{padding:24px}.px-0{padding-inline:0}.px-0\\.5{padding-inline:2px}.px-1{padding-inline:4px}.px-1\\.5{padding-inline:6px}.px-2{padding-inline:8px}.px-2\\.5{padding-inline:10px}.px-3{padding-inline:12px}.px-3\\.5{padding-inline:14px}.px-4{padding-inline:16px}.px-5{padding-inline:20px}.px-px{padding-inline:1px}.py-0{padding-block:0}.py-0\\.5{padding-block:2px}.py-1{padding-block:4px}.py-1\\.5{padding-block:6px}.py-2{padding-block:8px}.py-2\\.5{padding-block:10px}.py-3{padding-block:12px}.py-4{padding-block:16px}.pt-0{padding-top:0}.pt-0\\.5{padding-top:2px}.pt-1{padding-top:4px}.pt-1\\.5{padding-top:6px}.pt-2{padding-top:8px}.pt-4{padding-top:16px}.pr-0{padding-right:0}.pr-0\\.5{padding-right:2px}.pr-1{padding-right:4px}.pr-1\\.5{padding-right:6px}.pr-2{padding-right:8px}.pr-2\\.5{padding-right:10px}.pr-3{padding-right:12px}.pr-4{padding-right:16px}.pb-2{padding-bottom:8px}.pb-4{padding-bottom:16px}.pb-5{padding-bottom:20px}.pb-6{padding-bottom:24px}.pl-0{padding-left:0}.pl-0\\.5{padding-left:2px}.pl-1{padding-left:4px}.pl-3{padding-left:12px}.pl-3\\.5{padding-left:14px}.pl-4{padding-left:16px}.pl-5{padding-left:20px}.pl-\\[22px\\]{padding-left:22px}.text-left{text-align:left}.text-right{text-align:right}.font-mono{font-family:var(--tsl-font-mono)}.text-2xs{font-size:10px;line-height:var(--tw-leading,14px)}.text-body{font-size:14px;line-height:var(--tw-leading,20px)}.text-caption{font-size:12px;line-height:var(--tw-leading,16px)}.text-code{font-size:13px;line-height:var(--tw-leading,20px)}.text-display{font-size:40px;line-height:var(--tw-leading,52px)}.text-header{font-size:16px;line-height:var(--tw-leading,22px)}.text-subtitle{font-size:20px;line-height:var(--tw-leading,28px)}.text-title{font-size:28px;line-height:var(--tw-leading,36px)}.text-\\[13px\\]{font-size:13px}.leading-normal{--tw-leading:var(--leading-normal);line-height:var(--leading-normal)}.font-medium{--tw-font-weight:var(--font-weight-medium);font-weight:var(--font-weight-medium)}.font-normal{--tw-font-weight:var(--font-weight-normal);font-weight:var(--font-weight-normal)}.font-semibold{--tw-font-weight:var(--font-weight-semibold);font-weight:var(--font-weight-semibold)}.wrap-break-word{overflow-wrap:break-word}.whitespace-nowrap{white-space:nowrap}.text-accent{color:var(--tsl-accent)}.text-current{color:currentColor}.text-danger{color:var(--tsl-danger)}.text-info{color:var(--tsl-info)}.text-on-accent{color:var(--tsl-on-accent)}.text-success{color:var(--tsl-success)}.text-surface{color:var(--tsl-surface)}.text-text{color:var(--tsl-text)}.text-text-secondary{color:var(--tsl-text-secondary)}.text-text-tertiary{color:var(--tsl-text-tertiary)}.text-warning{color:var(--tsl-warning)}.text-white{color:#fff}.uppercase{text-transform:uppercase}.italic{font-style:italic}.tabular-nums{--tw-numeric-spacing:tabular-nums;font-variant-numeric:var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,)}.underline{text-decoration-line:underline}.opacity-0{opacity:0}.opacity-40{opacity:.4}.opacity-45{opacity:.45}.opacity-60{opacity:.6}.opacity-70{opacity:.7}.opacity-100{opacity:1}.shadow-card{--tw-shadow:0 2px 16px 0 var(--tw-shadow-color,var(--tsl-shadow));box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.shadow-dialog{--tw-shadow:0 8px 32px 0 var(--tw-shadow-color,var(--tsl-shadow)), 0 0 0 1px var(--tw-shadow-color,var(--tsl-border));box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.shadow-flyout{--tw-shadow:0 4px 24px 0 var(--tw-shadow-color,var(--tsl-shadow)), 0 0 0 1px var(--tw-shadow-color,var(--tsl-border));box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.shadow-sm{--tw-shadow:0 1px 2px 0 var(--tw-shadow-color,var(--tsl-shadow));box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.ring{--tw-ring-shadow:var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color,currentcolor);box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.ring-2{--tw-ring-shadow:var(--tw-ring-inset,) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color,currentcolor);box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.ring-4{--tw-ring-shadow:var(--tw-ring-inset,) 0 0 0 calc(4px + var(--tw-ring-offset-width)) var(--tw-ring-color,currentcolor);box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.ring-accent{--tw-ring-color:var(--tsl-accent)}.ring-accent-subtle{--tw-ring-color:var(--tsl-accent-subtle)}.ring-danger-subtle{--tw-ring-color:var(--tsl-danger-subtle)}.ring-info-subtle{--tw-ring-color:var(--tsl-info-subtle)}.ring-subtle{--tw-ring-color:var(--tsl-subtle)}.ring-success-subtle{--tw-ring-color:var(--tsl-success-subtle)}.ring-warning-subtle{--tw-ring-color:var(--tsl-warning-subtle)}.outline{outline-style:var(--tw-outline-style);outline-width:1px}.blur{--tw-blur:blur(8px);filter:var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)}.drop-shadow{--tw-drop-shadow-size:drop-shadow(0 1px 2px var(--tw-drop-shadow-color,#0000001a)) drop-shadow(0 1px 1px var(--tw-drop-shadow-color,#0000000f));--tw-drop-shadow:drop-shadow(0 1px 2px #0000001a) drop-shadow(0 1px 1px #0000000f);filter:var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)}.filter{filter:var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)}.transition{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to,opacity,box-shadow,transform,translate,scale,rotate,filter,-webkit-backdrop-filter,backdrop-filter,display,content-visibility,overlay,pointer-events;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-\\[background-color\\,transform\\]{transition-property:background-color,transform;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-\\[color\\,transform\\]{transition-property:color,transform;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-\\[grid-template-rows\\,border-color\\]{transition-property:grid-template-rows,border-color;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-\\[grid-template-rows\\]{transition-property:grid-template-rows;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-\\[opacity\\,scale\\,display\\,overlay\\]{transition-property:opacity,scale,display,overlay;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-\\[opacity\\,scale\\]{transition-property:opacity,scale;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-\\[opacity\\,transform\\]{transition-property:opacity,transform;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-\\[stroke-dashoffset\\]{transition-property:stroke-dashoffset;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-\\[transform\\,background-color\\,width\\]{transition-property:transform,background-color,width;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-\\[transform\\,opacity\\]{transition-property:transform,opacity;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-\\[transform\\,width\\,height\\]{transition-property:transform,width,height;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-\\[transform\\,width\\]{transition-property:transform,width;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-\\[width\\]{transition-property:width;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-colors{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-opacity{transition-property:opacity;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-shadow{transition-property:box-shadow;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-transform{transition-property:transform,translate,scale,rotate;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-discrete{transition-behavior:allow-discrete}.duration-base{transition-duration:var(--tsl-duration-base)}.duration-fast{transition-duration:var(--tsl-duration-fast)}.duration-slow{transition-duration:var(--tsl-duration-slow)}.ease-in-out{--tw-ease:cubic-bezier(.4, 0, .2, 1);transition-timing-function:cubic-bezier(.4,0,.2,1)}.ease-out{--tw-ease:cubic-bezier(0, 0, .2, 1);transition-timing-function:cubic-bezier(0,0,.2,1)}.ease-tessel{--tw-ease:var(--tsl-ease);transition-timing-function:var(--tsl-ease)}.outline-none{--tw-outline-style:none;outline-style:none}.select-none{-webkit-user-select:none;user-select:none}.\\[transform-box\\:fill-box\\]{transform-box:fill-box}@media (hover:hover){.group-hover\\:size-2\\.5:is(:where(.group):hover *){width:10px;height:10px}.group-hover\\:scale-125:is(:where(.group):hover *){--tw-scale-x:125%;--tw-scale-y:125%;--tw-scale-z:125%;scale:var(--tw-scale-x) var(--tw-scale-y)}.group-hover\\:border-accent-hover:is(:where(.group):hover *){border-color:var(--tsl-accent-hover)}.group-hover\\:border-text-secondary:is(:where(.group):hover *){border-color:var(--tsl-text-secondary)}.group-hover\\:bg-accent-hover:is(:where(.group):hover *){background-color:var(--tsl-accent-hover)}.group-hover\\:bg-control-hover:is(:where(.group):hover *){background-color:var(--tsl-control-hover)}.group-hover\\:opacity-100:is(:where(.group):hover *){opacity:1}}.group-focus-visible\\:outline-2:is(:where(.group):focus-visible *){outline-style:var(--tw-outline-style);outline-width:2px}.group-focus-visible\\:outline-offset-2:is(:where(.group):focus-visible *){outline-offset:2px}.group-focus-visible\\:outline-accent:is(:where(.group):focus-visible *){outline-color:var(--tsl-accent)}.group-active\\:w-3\\.5:is(:where(.group):active *){width:14px}.group-active\\:scale-75:is(:where(.group):active *){--tw-scale-x:75%;--tw-scale-y:75%;--tw-scale-z:75%;scale:var(--tw-scale-x) var(--tw-scale-y)}.peer-focus-visible\\:outline-2:is(:where(.peer):focus-visible~*){outline-style:var(--tw-outline-style);outline-width:2px}.peer-focus-visible\\:outline-offset-2:is(:where(.peer):focus-visible~*){outline-offset:2px}.peer-focus-visible\\:outline-offset-3:is(:where(.peer):focus-visible~*){outline-offset:3px}.peer-focus-visible\\:outline-accent:is(:where(.peer):focus-visible~*){outline-color:var(--tsl-accent)}.placeholder\\:text-text-tertiary::placeholder{color:var(--tsl-text-tertiary)}.backdrop\\:bg-overlay::backdrop{background-color:var(--tsl-overlay)}.backdrop\\:opacity-0::backdrop{opacity:0}.backdrop\\:transition-\\[opacity\\,display\\,overlay\\]::backdrop{transition-property:opacity,display,overlay;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.backdrop\\:transition-discrete::backdrop{transition-behavior:allow-discrete}.backdrop\\:duration-slow::backdrop{transition-duration:var(--tsl-duration-slow)}.backdrop\\:ease-tessel::backdrop{--tw-ease:var(--tsl-ease);transition-timing-function:var(--tsl-ease)}.before\\:absolute:before{content:var(--tw-content);position:absolute}.before\\:top-1\\.5:before{content:var(--tw-content);top:6px}.before\\:top-2:before{content:var(--tw-content);top:8px}.before\\:bottom-1\\.5:before{content:var(--tw-content);bottom:6px}.before\\:bottom-2:before{content:var(--tw-content);bottom:8px}.before\\:-left-0\\.5:before{content:var(--tw-content);left:-2px}.before\\:-left-\\[3px\\]:before{content:var(--tw-content);left:-3px}.before\\:left-px:before{content:var(--tw-content);left:1px}.before\\:w-\\[3px\\]:before{content:var(--tw-content);width:3px}.before\\:rounded-\\[1\\.5px\\]:before{content:var(--tw-content);border-radius:1.5px}.before\\:bg-accent:before{content:var(--tw-content);background-color:var(--tsl-accent)}.after\\:absolute:after{content:var(--tw-content);position:absolute}.after\\:inset-x-px:after{content:var(--tw-content);inset-inline:1px}.after\\:bottom-0:after{content:var(--tw-content);bottom:0}.after\\:h-0:after{content:var(--tw-content);height:0}.after\\:bg-accent:after{content:var(--tw-content);background-color:var(--tsl-accent)}.after\\:transition-\\[height\\]:after{content:var(--tw-content);transition-property:height;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.after\\:duration-fast:after{content:var(--tw-content);transition-duration:var(--tsl-duration-fast)}.after\\:ease-tessel:after{content:var(--tw-content);--tw-ease:var(--tsl-ease);transition-timing-function:var(--tsl-ease)}.open\\:flex:is([open],:popover-open,:open){display:flex}.open\\:scale-100:is([open],:popover-open,:open){--tw-scale-x:100%;--tw-scale-y:100%;--tw-scale-z:100%;scale:var(--tw-scale-x) var(--tw-scale-y)}.open\\:opacity-100:is([open],:popover-open,:open),.open\\:backdrop\\:opacity-100:is([open],:popover-open,:open)::backdrop{opacity:1}.focus-within\\:border-accent:focus-within{border-color:var(--tsl-accent)}.focus-within\\:after\\:h-0\\.5:focus-within:after{content:var(--tw-content);height:2px}@media (hover:hover){.hover\\:border-accent-hover:hover{border-color:var(--tsl-accent-hover)}.hover\\:border-border-strong:hover{border-color:var(--tsl-border-strong)}.hover\\:border-danger-hover:hover{border-color:var(--tsl-danger-hover)}.hover\\:bg-accent-hover:hover{background-color:var(--tsl-accent-hover)}.hover\\:bg-accent-subtle:hover{background-color:var(--tsl-accent-subtle)}.hover\\:bg-control-hover:hover{background-color:var(--tsl-control-hover)}.hover\\:bg-control-pressed:hover{background-color:var(--tsl-control-pressed)}.hover\\:bg-danger-hover:hover{background-color:var(--tsl-danger-hover)}.hover\\:text-accent-hover:hover{color:var(--tsl-accent-hover)}.hover\\:text-text:hover{color:var(--tsl-text)}.hover\\:text-text-secondary:hover{color:var(--tsl-text-secondary)}.hover\\:opacity-100:hover{opacity:1}.hover\\:focus-within\\:border-accent:hover:focus-within{border-color:var(--tsl-accent)}}.focus\\:border-accent:focus{border-color:var(--tsl-accent)}.focus-visible\\:bg-control-hover:focus-visible{background-color:var(--tsl-control-hover)}.focus-visible\\:outline-2:focus-visible{outline-style:var(--tw-outline-style);outline-width:2px}.focus-visible\\:-outline-offset-2:focus-visible{outline-offset:calc(2px * -1)}.focus-visible\\:outline-offset-2:focus-visible{outline-offset:2px}.focus-visible\\:outline-accent:focus-visible{outline-color:var(--tsl-accent)}.focus-visible\\:outline-none:focus-visible{--tw-outline-style:none;outline-style:none}.active\\:scale-90:active{--tw-scale-x:90%;--tw-scale-y:90%;--tw-scale-z:90%;scale:var(--tw-scale-x) var(--tw-scale-y)}.active\\:border-accent-pressed:active{border-color:var(--tsl-accent-pressed)}.active\\:border-danger-hover:active{border-color:var(--tsl-danger-hover)}.active\\:bg-accent-pressed:active{background-color:var(--tsl-accent-pressed)}.active\\:bg-accent-subtle:active{background-color:var(--tsl-accent-subtle)}.active\\:bg-control-pressed:active{background-color:var(--tsl-control-pressed)}.active\\:bg-danger-hover:active{background-color:var(--tsl-danger-hover)}.active\\:text-accent-pressed:active{color:var(--tsl-accent-pressed)}.disabled\\:pointer-events-none:disabled{pointer-events:none}.disabled\\:cursor-default:disabled{cursor:default}.disabled\\:opacity-30:disabled{opacity:.3}.disabled\\:opacity-40:disabled{opacity:.4}.disabled\\:opacity-45:disabled{opacity:.45}.disabled\\:active\\:scale-100:disabled:active{--tw-scale-x:100%;--tw-scale-y:100%;--tw-scale-z:100%;scale:var(--tw-scale-x) var(--tw-scale-y)}.aria-disabled\\:pointer-events-none[aria-disabled=true]{pointer-events:none}.aria-disabled\\:opacity-45[aria-disabled=true]{opacity:.45}.aria-selected\\:text-text[aria-selected=true]{color:var(--tsl-text)}@starting-style{.starting\\:open\\:scale-96:is([open],:popover-open,:open){--tw-scale-x:96%;--tw-scale-y:96%;--tw-scale-z:96%;scale:var(--tw-scale-x) var(--tw-scale-y)}.starting\\:open\\:scale-98:is([open],:popover-open,:open){--tw-scale-x:98%;--tw-scale-y:98%;--tw-scale-z:98%;scale:var(--tw-scale-x) var(--tw-scale-y)}.starting\\:open\\:opacity-0:is([open],:popover-open,:open),.starting\\:open\\:backdrop\\:opacity-0:is([open],:popover-open,:open)::backdrop{opacity:0}}:host([disabled]) .host-\\[disabled\\]\\:pointer-events-none{pointer-events:none}:host([disabled]) .host-\\[disabled\\]\\:opacity-45{opacity:.45}:host([elevated]) .host-\\[elevated\\]\\:shadow-card{--tw-shadow:0 2px 16px 0 var(--tw-shadow-color,var(--tsl-shadow));box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}:host([open]) .host-\\[open\\]\\:border-accent{border-color:var(--tsl-accent)}:host([variant=accent]) .host-\\[variant\\=accent\\]\\:bg-accent{background-color:var(--tsl-accent)}.\\[\\&\\:\\:-webkit-inner-spin-button\\]\\:appearance-none::-webkit-inner-spin-button{appearance:none}.\\[\\&\\:\\:-webkit-outer-spin-button\\]\\:appearance-none::-webkit-outer-spin-button{appearance:none}}@keyframes tsl-spin{to{transform:rotate(360deg)}}@keyframes tsl-shimmer{0%{background-position:200% 0}to{background-position:-200% 0}}@keyframes tsl-indeterminate{0%{width:40%;left:-40%}60%{width:40%;left:100%}to{width:40%;left:100%}}@keyframes tsl-fade-in{0%{opacity:0}to{opacity:1}}@keyframes tsl-pop-in{0%{opacity:0;transform:translateY(4px)scale(.98)}to{opacity:1;transform:none}}@keyframes tsl-page-in{0%{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}@keyframes tsl-ring{0%{stroke-dasharray:1 150;stroke-dashoffset:0;transform:rotate(0)}50%{stroke-dasharray:90 150;stroke-dashoffset:-35px;transform:rotate(180deg)}to{stroke-dasharray:90 150;stroke-dashoffset:-124px;transform:rotate(360deg)}}';

// src/core/base-element.js
var sheetCache = /* @__PURE__ */ new Map();
function sharedSheet(css) {
  if (!("adoptedStyleSheets" in Document.prototype)) return null;
  let sheet = sheetCache.get(css);
  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    sheetCache.set(css, sheet);
  }
  return sheet;
}
var TesselElement = class extends HTMLElement {
  /** Subclasses override with their CSS (a plain string, `:host` scoped). */
  static styles = "";
  constructor() {
    super();
    ensureInstalled();
    this.attachShadow({ mode: "open", delegatesFocus: true });
    const css = `:host{all:initial;box-sizing:border-box;font-family:var(--tsl-font);color:var(--tsl-text);font-size:14px;line-height:20px;
      scrollbar-color:var(--tsl-border-strong) transparent;}
      /* Thin, token-colored scrollbars everywhere inside a component; the thumb darkens while hovering. */
      *,*::before,*::after{box-sizing:border-box;scrollbar-width:thin;}
      *:hover{scrollbar-color:var(--tsl-text-tertiary) transparent;}
      ${this.constructor.styles}`;
    const sheets = [sharedSheet(tailwind_generated_default), sharedSheet(css)];
    if (sheets[0] && sheets[1]) {
      this.shadowRoot.adoptedStyleSheets = sheets;
    } else {
      for (const text of [tailwind_generated_default, css]) {
        const style2 = document.createElement("style");
        style2.textContent = text;
        this.shadowRoot.appendChild(style2);
      }
    }
  }
  connectedCallback() {
    if (this.hasAttribute("disabled")) this.setAttribute("aria-disabled", "true");
  }
  static get observedAttributes() {
    return ["disabled"];
  }
  attributeChangedCallback(name) {
    if (name === "disabled") {
      if (this.hasAttribute("disabled")) this.setAttribute("aria-disabled", "true");
      else this.removeAttribute("aria-disabled");
    }
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(value) {
    if (value) this.setAttribute("disabled", "");
    else this.removeAttribute("disabled");
  }
  /**
   * Emits a bubbling, composed, cancelable custom event. Returns false when a listener called
   * preventDefault() — used where a component has a sensible default action (e.g. an info bar
   * removing itself on close) that a listener taking full ownership of the behavior can opt out of.
   */
  emit(name, detail) {
    return this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable: true }));
  }
  /**
   * Components that take a heading via `title` would otherwise also get the browser's native hover tooltip
   * for it. Captures the value into `_heading` and strips the attribute; `heading` is the tooltip-free alias.
   */
  readHeading() {
    if (this.hasAttribute("title")) {
      this._heading = this.getAttribute("title");
      this.removeAttribute("title");
    }
    return this.getAttribute("heading") ?? this._heading ?? "";
  }
  $(selector) {
    return this.shadowRoot.querySelector(selector);
  }
};
function define(tag, ctor) {
  if (!customElements.get(tag)) customElements.define(tag, ctor);
}

// src/core/dom.js
function h(tag, className, props, ...children) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value == null || value === false) continue;
      if (key.startsWith("on") && typeof value === "function") el.addEventListener(key.slice(2), value);
      else if (key === "style" && typeof value === "object") Object.assign(el.style, value);
      else if (key === "dataset") Object.assign(el.dataset, value);
      else if (key === "class" || key === "className") el.className += ` ${value}`;
      else if (value === true) el.setAttribute(key, "");
      else el.setAttribute(key, String(value));
    }
  }
  append(el, children);
  return el;
}
function append(el, children) {
  for (const child of children) {
    if (child == null || child === false) continue;
    if (Array.isArray(child)) append(el, child);
    else el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}
function html(tag, className, markup) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.innerHTML = markup;
  return el;
}
function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

// src/components/info-bar.js
var BAR = "flex w-full items-start gap-3 rounded-lg border py-3 pl-4 pr-2.5 transition-[opacity,scale] duration-fast ease-tessel";
var TONE = {
  informational: { bar: "bg-info-subtle", icon: "text-info" },
  success: { bar: "bg-success-subtle", icon: "text-success" },
  warning: { bar: "bg-warning-subtle", icon: "text-warning" },
  error: { bar: "bg-danger-subtle", icon: "text-danger" }
};
var CLOSE = "flex size-7 flex-none cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent text-text-secondary hover:bg-control-hover focus-visible:outline-2 focus-visible:outline-accent";
var TesselInfoBar = class extends TesselElement {
  static styles = ":host{display:flex;}";
  static observedAttributes = ["severity", "title", "heading", "closable", "elevated", "surface"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._icon = h("span", "mt-px flex-none");
    this._title = h("div", "text-body font-semibold text-text");
    this._bar = h("div", BAR, { role: "status" });
    this._closeBtn = html("button", CLOSE, closeSvg(14));
    this._closeBtn.type = "button";
    this._closeBtn.setAttribute("aria-label", "Close");
    this._closeBtn.addEventListener("click", () => {
      if (this.emit("close", {})) this.dismiss();
    });
    this._bar.append(
      this._icon,
      h("div", "min-w-0 flex-1", null, this._title, h("div", "mt-0.5 text-body text-text-secondary", null, h("slot"))),
      h("slot", "flex-none self-center", { name: "action" }),
      this._closeBtn
    );
    this.shadowRoot.appendChild(this._bar);
    this._sync();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    const severity = this.getAttribute("severity") || "informational";
    const tone = TONE[severity] || TONE.informational;
    const title = this.readHeading();
    const elevated = this.hasAttribute("elevated");
    this._bar.className = cx(
      BAR,
      this.hasAttribute("surface") ? "bg-surface" : tone.bar,
      elevated ? "border-transparent shadow-card" : "border-border"
    );
    this._icon.className = cx("mt-px flex-none", tone.icon);
    this._icon.innerHTML = severitySvg(severity, 20);
    this._title.textContent = title;
    this._title.hidden = !title;
    this._closeBtn.hidden = !this.hasAttribute("closable");
    this._bar.setAttribute("role", severity === "error" || severity === "warning" ? "alert" : "status");
  }
  /** Fades the bar out, then removes it. Exposed so external code (e.g. Tessel.snackbar) can call it. */
  dismiss() {
    this._bar.classList.add("opacity-0", "scale-98");
    setTimeout(() => this.remove(), 130);
  }
};
define("tsl-info-bar", TesselInfoBar);

// src/components/snackbar.js
var TesselSnackbarHost = class extends TesselElement {
  static styles = ":host{display:contents;}";
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._stack = h(
      "div",
      "pointer-events-none fixed inset-auto bottom-6 right-6 m-0 flex w-[380px] max-w-[calc(100vw-32px)] flex-col-reverse gap-3 overflow-visible border-0 bg-transparent p-0",
      { popover: "manual", role: "region", "aria-live": "polite", "aria-label": "Notifications" },
      h("slot")
    );
    this.shadowRoot.appendChild(this._stack);
  }
  /** (Re)opens the stack so it sits above whatever entered the top layer last (e.g. a dialog). */
  raise() {
    if (this._stack.matches(":popover-open")) this._stack.hidePopover();
    this._stack.showPopover();
  }
};
define("tsl-snackbar-host", TesselSnackbarHost);
var EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
var host = null;
function ensureHost() {
  if (host?.isConnected) return host;
  host = document.createElement("tsl-snackbar-host");
  document.body.appendChild(host);
  return host;
}
function showSnackbar(title, { message = "", severity = "informational", duration = 4e3 } = {}) {
  ensureInstalled();
  const container = ensureHost();
  const bar = document.createElement("tsl-info-bar");
  bar.setAttribute("elevated", "");
  bar.setAttribute("surface", "");
  bar.setAttribute("closable", "");
  bar.setAttribute("severity", severity);
  if (title) bar.setAttribute("heading", title);
  if (message) bar.textContent = message;
  bar.style.pointerEvents = "auto";
  container.appendChild(bar);
  container.raise();
  bar.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 200, easing: EASE });
  let timer = null;
  let gone = false;
  const dismiss = () => {
    if (gone) return;
    gone = true;
    bar.animate([{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(12px)" }], { duration: 200, easing: EASE, fill: "forwards" }).finished.then(() => bar.remove(), () => bar.remove());
  };
  const arm = () => {
    if (duration > 0 && !gone) timer = setTimeout(dismiss, duration);
  };
  const disarm = () => {
    clearTimeout(timer);
  };
  bar.addEventListener("mouseenter", disarm);
  bar.addEventListener("mouseleave", arm);
  bar.addEventListener("close", (e) => {
    e.preventDefault();
    disarm();
    dismiss();
  });
  arm();
  return { dismiss };
}

// src/components/animation-timeline.js
var RULER_H = 28;
var SNAP_PX = 6;
var TRACK_COLORS = ["#4f46e5", "#0891b2", "#059669", "#d97706", "#db2777", "#7c3aed"];
var TBTN = "flex size-8 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 text-text-secondary transition-colors duration-fast hover:bg-control-hover hover:text-text active:bg-control-pressed disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-accent";
var clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
var TesselAnimationTimeline = class extends TesselElement {
  static styles = ":host{display:block;}";
  static observedAttributes = ["fps", "duration", "current-frame", "pixels-per-frame", "time-display", "hide-transport", "header-width", "loop-start", "loop-end", "loop-enabled", "read-only"];
  constructor() {
    super();
    this._tracks = [];
    this._markers = [];
    this._frame = 0;
    this._playing = false;
    this._rate = 1;
    this._undo = [];
    this._redo = [];
    this._ppf = null;
  }
  connectedCallback() {
    super.connectedCallback();
    if (this._built) {
      this._render();
      return;
    }
    this._built = true;
    this._buildShell();
    this._ro = new ResizeObserver(() => this._render());
    this._ro.observe(this);
    this._render();
  }
  disconnectedCallback() {
    this._ro?.disconnect();
    this.pause();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === "current-frame") this._frame = clamp(Number(newV) || 0, 0, this.duration);
    if (name === "pixels-per-frame") this._ppf = null;
    this._render();
  }
  // ------------------------------------------------------------------ public API
  get fps() {
    return Math.max(1, Number(this.getAttribute("fps")) || 24);
  }
  set fps(v) {
    this.setAttribute("fps", String(v));
  }
  get duration() {
    return Math.max(1, Number(this.getAttribute("duration")) || 240);
  }
  set duration(v) {
    this.setAttribute("duration", String(v));
  }
  get currentFrame() {
    return Math.round(this._frame);
  }
  set currentFrame(v) {
    this._setFrame(v);
  }
  get pixelsPerFrame() {
    return this._ppf ?? (Number(this.getAttribute("pixels-per-frame")) || 4);
  }
  set pixelsPerFrame(v) {
    this._ppf = clamp(v, 0.05, 80);
    this._render();
  }
  get timeDisplay() {
    return this.getAttribute("time-display") || "timecode";
  }
  get isPlaying() {
    return this._playing;
  }
  get tracks() {
    return this._tracks;
  }
  set tracks(list) {
    this._tracks = list || [];
    this._undo = [];
    this._redo = [];
    this._historyChanged();
    this._render();
  }
  get markers() {
    return this._markers;
  }
  set markers(list) {
    this._markers = list || [];
    this._render();
  }
  get selectedClips() {
    return this._allClips().filter(({ clip }) => clip.selected).map(({ clip }) => clip);
  }
  get canUndo() {
    return this._undo.length > 0 && !this.hasAttribute("no-undo");
  }
  get canRedo() {
    return this._redo.length > 0 && !this.hasAttribute("no-undo");
  }
  get undoDescription() {
    return this._undo.at(-1)?.description ?? "";
  }
  get redoDescription() {
    return this._redo.at(-1)?.description ?? "";
  }
  /** Redraws after the model was changed from the outside. */
  refresh() {
    this._render();
  }
  formatTime(frame) {
    const fps = this.fps;
    const f = Math.round(frame);
    if (this.timeDisplay === "frames") return String(f);
    if (this.timeDisplay === "seconds") return `${(f / fps).toFixed(2)}s`;
    const p = (n) => String(n).padStart(2, "0");
    const secs = Math.floor(f / fps);
    return `${p(Math.floor(secs / 3600))}:${p(Math.floor(secs / 60) % 60)}:${p(secs % 60)}:${p(f % Math.round(fps))}`;
  }
  play() {
    if (this._playing) return;
    if (this._frame >= this.duration) this._setFrame(0);
    this._playing = true;
    this._last = performance.now();
    const tick = (now) => {
      if (!this._playing) return;
      const dt = (now - this._last) / 1e3;
      this._last = now;
      let next = this._frame + dt * this.fps * this._rate;
      const loopOn = this.hasAttribute("loop-enabled");
      const ls = Number(this.getAttribute("loop-start")) || 0;
      const le = Number(this.getAttribute("loop-end")) || this.duration;
      if (loopOn && next >= le) next = ls;
      if (next >= this.duration) {
        this._setFrame(this.duration);
        this.pause();
        return;
      }
      this._setFrame(next, { follow: true });
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
    this.emit("playback-state-changed", { playing: true });
    this._renderTransport();
  }
  pause() {
    if (!this._playing) return;
    this._playing = false;
    cancelAnimationFrame(this._raf);
    this.emit("playback-state-changed", { playing: false });
    this._renderTransport();
  }
  stop() {
    this.pause();
    this._setFrame(0);
  }
  togglePlayback() {
    if (this._playing) this.pause();
    else this.play();
  }
  stepForward(n = 1) {
    this._setFrame(this.currentFrame + n);
  }
  stepBackward(n = 1) {
    this._setFrame(this.currentFrame - n);
  }
  zoomIn() {
    this._zoom(1.25);
  }
  zoomOut() {
    this._zoom(0.8);
  }
  zoomToFit() {
    const w = this._scroll.clientWidth - 24;
    this.pixelsPerFrame = clamp(w / this.duration, 0.05, 80);
  }
  /**
   * Adds `clip` to `track` under the same rules as dragging (overlap prevention, project length). Returns false when
   * there is no room.
   */
  addClip(track, clip) {
    clip.length = Math.max(1, clip.length || 1);
    clip.start = Math.max(0, clip.start || 0);
    if (!this._fits(track, clip.start, clip.length, /* @__PURE__ */ new Set())) {
      if (!this.hasAttribute("auto-extend-duration") || this.hasAttribute("prevent-overlap") && this._overlaps(track, clip.start, clip.length, /* @__PURE__ */ new Set())) return false;
    }
    if (clip.start + clip.length > this.duration && this.hasAttribute("auto-extend-duration")) {
      this._durationBefore = this.duration;
      this._extendTo(clip.start + clip.length);
    }
    track.clips.push(clip);
    this._record("Add clip", { add: [{ clip, track }] });
    this._render();
    return true;
  }
  /** Removes the selected clips (honouring `clips-deleting`). */
  deleteSelection() {
    if (this.hasAttribute("read-only")) return;
    const entries = this._allClips().filter(({ clip, track }) => clip.selected && !track.locked);
    if (!entries.length || !this.emit("clips-deleting", { clips: entries.map((e) => e.clip) })) return;
    for (const { clip, track } of entries) track.clips.splice(track.clips.indexOf(clip), 1);
    this._record("Delete clips", { remove: entries });
    this._selectionChanged();
    this._render();
  }
  undo() {
    this._step(this._undo, this._redo, true);
  }
  redo() {
    this._step(this._redo, this._undo, false);
  }
  clearHistory() {
    this._undo = [];
    this._redo = [];
    this._historyChanged();
  }
  /** Puts your own step on the undo stack: `undo()` and `redo()` must reverse/replay it. */
  recordHistory(description, undo, redo) {
    this._push({ description, undo, redo });
  }
  // ------------------------------------------------------------------ internals
  _allClips() {
    return this._tracks.flatMap((track) => track.clips.map((clip) => ({ clip, track })));
  }
  _trackOf(clip) {
    return this._tracks.find((t) => t.clips.includes(clip));
  }
  _setFrame(v, { follow = false } = {}) {
    const next = clamp(v, 0, this.duration);
    if (next === this._frame) return;
    const before = this.currentFrame;
    this._frame = next;
    if (this.currentFrame !== before || !follow) this.setAttribute("current-frame", String(this.currentFrame));
    this._paintPlayhead(follow);
    if (this.currentFrame !== before) this.emit("current-frame-changed", { frame: this.currentFrame, time: this.formatTime(this.currentFrame) });
  }
  _zoom(factor, anchorPx) {
    const old = this.pixelsPerFrame;
    const next = clamp(old * factor, 0.05, 80);
    const anchor = anchorPx ?? this._scroll.clientWidth / 2;
    const frameAtAnchor = (this._scroll.scrollLeft + anchor) / old;
    this._ppf = next;
    this._render();
    this._scroll.scrollLeft = frameAtAnchor * next - anchor;
  }
  _extendTo(frames) {
    this.setAttribute("duration", String(Math.ceil(frames)));
  }
  _overlaps(track, start, length, ignore) {
    return track.clips.some((c) => !ignore.has(c) && start < c.start + c.length && start + length > c.start);
  }
  _fits(track, start, length, ignore) {
    if (start < 0) return false;
    if (this.hasAttribute("constrain-to-duration") && start + length > this.duration) return false;
    if (this.hasAttribute("prevent-overlap") && this._overlaps(track, start, length, ignore)) return false;
    return true;
  }
  // ---- history
  _push(entry) {
    if (this.hasAttribute("no-undo")) return;
    this._undo.push(entry);
    if (this._undo.length > 200) this._undo.shift();
    this._redo = [];
    this._historyChanged();
  }
  _historyChanged() {
    this.emit("history-changed", { canUndo: this.canUndo, canRedo: this.canRedo, undoDescription: this.undoDescription, redoDescription: this.redoDescription });
    this._renderTransport();
  }
  _step(from, to, undoing) {
    if (this.hasAttribute("no-undo")) return;
    const entry = from.pop();
    if (!entry) return;
    (undoing ? entry.undo : entry.redo)();
    to.push(entry);
    this._historyChanged();
    this._render();
  }
  /**
   * Records an edit. `snap` = [{ clip, from: {start,length,track}, to: {…} }] for move/trim; `add` / `remove` for
   * inserted / deleted clips (also restoring an auto-extended duration on undo).
   */
  _record(description, { snap = [], add = [], remove = [] }) {
    const duration = this._durationBefore ?? this.duration;
    this._durationBefore = void 0;
    const apply = (use) => {
      for (const { clip, from, to } of snap) {
        const state2 = use === "from" ? from : to;
        const cur = this._trackOf(clip);
        if (cur !== state2.track) {
          cur?.clips.splice(cur.clips.indexOf(clip), 1);
          state2.track.clips.push(clip);
        }
        clip.start = state2.start;
        clip.length = state2.length;
        if ("mediaStart" in state2) clip.mediaStart = state2.mediaStart;
      }
    };
    const after = this.duration;
    this._push({
      description,
      undo: () => {
        apply("from");
        for (const { clip, track } of add) track.clips.splice(track.clips.indexOf(clip), 1);
        for (const { clip, track } of remove) track.clips.push(clip);
        if (duration !== after) this.setAttribute("duration", String(duration));
      },
      redo: () => {
        apply("to");
        for (const { clip, track } of add) track.clips.push(clip);
        for (const { clip, track } of remove) track.clips.splice(track.clips.indexOf(clip), 1);
        if (duration !== after) this.setAttribute("duration", String(after));
      }
    });
  }
  // ---- DOM
  _buildShell() {
    this._transport = h("div", "flex flex-wrap items-center gap-1 border-b border-border px-2 py-1");
    this._headers = h("div", "flex-none overflow-hidden border-r border-border bg-surface-alt");
    this._ruler = h("div", "sticky top-0 z-20 cursor-pointer border-b border-border bg-surface-alt");
    this._lanes = h("div", "relative");
    this._playhead = h("div", "pointer-events-none absolute inset-y-0 z-10 w-px bg-danger");
    this._marquee = h("div", "pointer-events-none absolute z-10 border border-accent bg-accent/15", { hidden: true });
    this._content = h("div", "relative", null, this._ruler, this._lanes, this._playhead, this._marquee);
    this._scroll = h("div", "relative min-w-0 flex-1 overflow-auto scrollbar-thin", { tabindex: "0", "aria-label": "Animation timeline" }, this._content);
    this._corner = h("div", "flex flex-none items-center border-b border-border px-3 text-caption font-medium text-text-secondary", { style: { height: `${RULER_H}px` } });
    this._headerWrap = h("div", "flex w-[var(--hw)] flex-none flex-col border-r border-border bg-surface-alt overflow-hidden", null, this._corner, this._headers);
    this._body = h("div", "flex min-h-0 flex-1", null, this._headerWrap, this._scroll);
    this.shadowRoot.appendChild(h("div", "flex h-full min-h-[200px] flex-col overflow-hidden rounded-lg border border-border bg-surface select-none", null, this._transport, this._body));
    this._scroll.addEventListener("scroll", () => {
      this._headers.scrollTop = this._scroll.scrollTop;
    });
    this._scroll.addEventListener("wheel", (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      this._zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - this._scroll.getBoundingClientRect().left);
    }, { passive: false });
    this._scroll.addEventListener("keydown", (e) => this._onKey(e));
    this._ruler.addEventListener("pointerdown", (e) => this._rulerDown(e));
    this._lanes.addEventListener("pointerdown", (e) => this._lanesDown(e));
    this._lanes.addEventListener("dblclick", (e) => {
      const el = e.target.closest?.("[data-clip]");
      if (el) this.emit("clip-activated", { clip: el._clip, track: el._track });
    });
  }
  _frameAt(clientX) {
    const r = this._content.getBoundingClientRect();
    return (clientX - r.left) / this.pixelsPerFrame;
  }
  _render() {
    if (!this._built) return;
    const ppf = this.pixelsPerFrame;
    const width = Math.ceil(this.duration * ppf) + 40;
    const hw = Number(this.getAttribute("header-width")) || 160;
    this._headerWrap.style.setProperty("--hw", `${hw}px`);
    this._corner.textContent = this.formatTime(this._frame);
    this._corner.id = "tsl-tl-time";
    this._content.style.width = `${width}px`;
    this._renderTransport();
    this._renderRuler(ppf, width);
    this._renderTracks(ppf, width);
    this._paintPlayhead(false);
  }
  _renderTransport() {
    if (!this._transport) return;
    this._transport.hidden = this.hasAttribute("hide-transport");
    const btn = (icon, label2, onClick, { on = false, disabled = false } = {}) => {
      const b = h("button", cx(TBTN, on && "bg-accent-subtle text-accent"), { type: "button", title: label2, "aria-label": label2, "aria-pressed": on ? "true" : null, disabled }, createIcon(icon, 16));
      b.addEventListener("click", onClick);
      return b;
    };
    const sep = () => h("span", "mx-1 h-5 w-px bg-border");
    this._transport.replaceChildren(
      btn("back", "Previous frame", () => this.stepBackward()),
      btn(this._playing ? "pause" : "play", this._playing ? "Pause" : "Play", () => this.togglePlayback(), { on: this._playing }),
      btn("forward", "Next frame", () => this.stepForward()),
      btn("chrome-maximize", "Stop", () => this.stop()),
      sep(),
      btn("sync", "Loop", () => this.toggleAttribute("loop-enabled"), { on: this.hasAttribute("loop-enabled") }),
      btn("pin", "Snapping", () => {
        this.toggleAttribute("no-snapping");
        this._renderTransport();
      }, { on: !this.hasAttribute("no-snapping") }),
      sep(),
      btn("undo", this.undoDescription ? `Undo ${this.undoDescription}` : "Undo", () => this.undo(), { disabled: !this.canUndo }),
      btn("redo", this.redoDescription ? `Redo ${this.redoDescription}` : "Redo", () => this.redo(), { disabled: !this.canRedo }),
      h("span", "flex-1"),
      h("span", "font-mono text-code tabular-nums text-text", { "data-time": "" }, this.formatTime(this._frame)),
      sep(),
      btn("remove", "Zoom out", () => this.zoomOut()),
      btn("add", "Zoom in", () => this.zoomIn()),
      btn("view-all", "Zoom to fit", () => this.zoomToFit())
    );
  }
  /** Ticks every `step` frames, chosen so labels stay ~70px apart. */
  _tickStep(ppf) {
    const fps = Math.round(this.fps);
    const candidates = this.timeDisplay === "frames" ? [1, 2, 5, 10, 20, 50, 100, 200, 500, 1e3, 2e3, 5e3] : [1, 2, 5, 10, fps, fps * 2, fps * 5, fps * 10, fps * 30, fps * 60, fps * 300, fps * 600, fps * 1800, fps * 3600];
    return candidates.find((c) => c * ppf >= 70) ?? candidates.at(-1);
  }
  _renderRuler(ppf, width) {
    const step = this._tickStep(ppf);
    this._ruler.style.height = `${RULER_H}px`;
    this._ruler.style.width = `${width}px`;
    const kids = [];
    const minor = step >= 5 ? step / 5 : 0;
    for (let f = 0; f <= this.duration; f += minor || step) {
      const major = f % step === 0;
      const x = f * ppf;
      kids.push(h("span", cx("pointer-events-none absolute bottom-0 w-px", major ? "h-3.5 bg-border-strong" : "h-1.5 bg-border"), { style: { left: `${x}px` } }));
      if (major) kids.push(h("span", "pointer-events-none absolute top-1 pl-1 text-2xs tabular-nums text-text-tertiary", { style: { left: `${x}px` } }, this.formatTime(f)));
    }
    const ls = Number(this.getAttribute("loop-start"));
    const le = Number(this.getAttribute("loop-end"));
    if (le > ls) {
      kids.push(h("span", cx("pointer-events-none absolute inset-y-0 border-x-2 border-accent", this.hasAttribute("loop-enabled") ? "bg-accent/25" : "bg-accent/10"), { style: { left: `${ls * ppf}px`, width: `${(le - ls) * ppf}px` } }));
    }
    for (const m of this._markers) {
      const flag = h("button", "absolute bottom-0 flex h-4 -translate-x-px cursor-pointer items-center gap-1 whitespace-nowrap rounded-r-sm border-0 bg-warning px-1.5 text-2xs font-medium text-surface", { type: "button", title: m.name, style: { left: `${m.frame * ppf}px` } }, m.name || "");
      flag.addEventListener("pointerdown", (e) => e.stopPropagation());
      flag.addEventListener("click", () => this._setFrame(m.frame));
      kids.push(flag);
    }
    this._ruler.replaceChildren(...kids);
  }
  _renderTracks(ppf, width) {
    this._headers.replaceChildren(...this._tracks.map((track, ti) => {
      const color = track.color || TRACK_COLORS[ti % TRACK_COLORS.length];
      const toggle = (icon, label2, on, key) => {
        const b = h("button", cx("flex size-6 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 hover:bg-control-hover", on ? "text-text-secondary" : "text-text-tertiary opacity-60"), { type: "button", title: label2, "aria-pressed": String(on), "aria-label": label2 }, createIcon(icon, 14));
        b.addEventListener("click", () => {
          track[key] = key === "visible" ? track.visible === false : !track.locked;
          this._render();
        });
        return b;
      };
      return h(
        "div",
        "flex items-center gap-2 border-b border-border px-2",
        { style: { height: `${track.height || 44}px` } },
        h("span", "h-5 w-1 flex-none rounded-pill", { style: { background: color } }),
        h("span", "min-w-0 flex-1 truncate text-body text-text", null, track.name),
        toggle("view", "Toggle visibility", track.visible !== false, "visible"),
        toggle("lock", "Lock track", !!track.locked, "locked")
      );
    }));
    const total = this._tracks.reduce((s, t) => s + (t.height || 44), 0);
    this._lanes.style.height = `${total}px`;
    this._lanes.style.width = `${width}px`;
    this._lanes.replaceChildren(...this._tracks.map((track, ti) => {
      const color = track.color || TRACK_COLORS[ti % TRACK_COLORS.length];
      const lane = h("div", cx("relative border-b border-border", track.locked && "bg-subtle/60", track.visible === false && "opacity-40"), { style: { height: `${track.height || 44}px` }, "data-lane": String(ti) });
      lane._track = track;
      for (const clip of track.clips) lane.appendChild(this._buildClip(clip, track, color, ppf));
      return lane;
    }));
    this._lanes.style.marginTop = "0px";
  }
  _buildClip(clip, track, color, ppf) {
    const x = clip.start * ppf;
    const w = Math.max(2, clip.length * ppf);
    if (clip.keyframe) {
      const kf = h("div", cx("absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 cursor-pointer border-2 border-surface", clip.selected && "ring-2 ring-accent"), { "data-clip": "", style: { left: `${x + w / 2}px`, background: clip.color || color } });
      kf._clip = clip;
      kf._track = track;
      return kf;
    }
    const el = h(
      "div",
      cx("absolute inset-y-1 flex cursor-grab items-center overflow-hidden rounded-sm border text-caption font-medium text-white", clip.selected ? "border-white ring-2 ring-accent" : "border-black/20"),
      { "data-clip": "", title: `${clip.name} (${this.formatTime(clip.start)} \u2013 ${this.formatTime(clip.start + clip.length)})`, style: { left: `${x}px`, width: `${w}px`, background: clip.color || color } }
    );
    el._clip = clip;
    el._track = track;
    if (clip.waveform?.length) el.appendChild(this._waveform(clip, w));
    el.appendChild(h("span", "pointer-events-none relative truncate px-1.5 drop-shadow", null, clip.name));
    if (!track.locked) {
      el.appendChild(h("span", "absolute inset-y-0 left-0 w-1.5 cursor-ew-resize", { "data-edge": "start" }));
      el.appendChild(h("span", "absolute inset-y-0 right-0 w-1.5 cursor-ew-resize", { "data-edge": "end" }));
    }
    return el;
  }
  _waveform(clip, widthPx) {
    const peaks = clip.waveform;
    const mediaLength = clip.mediaLength || clip.length;
    const from = Math.floor((clip.mediaStart || 0) / mediaLength * peaks.length);
    const to = Math.min(peaks.length, Math.ceil(((clip.mediaStart || 0) + clip.length) / mediaLength * peaks.length));
    const bars = Math.max(1, Math.floor(widthPx / 3));
    const wrap = h("div", "pointer-events-none absolute inset-0 flex items-center gap-px px-px opacity-60");
    for (let i = 0; i < bars; i++) {
      const p = peaks[from + Math.floor(i / bars * (to - from))] ?? 0;
      wrap.appendChild(h("span", "flex-1 rounded-pill bg-white", { style: { height: `${Math.max(6, p * 90)}%` } }));
    }
    return wrap;
  }
  _paintPlayhead(follow) {
    if (!this._playhead) return;
    const x = this._frame * this.pixelsPerFrame;
    this._playhead.style.left = `${x}px`;
    const time = this._transport?.querySelector("[data-time]");
    if (time) time.textContent = this.formatTime(this._frame);
    if (this._corner) this._corner.textContent = this.formatTime(this._frame);
    if (follow && this._playing) {
      const { scrollLeft, clientWidth } = this._scroll;
      if (x > scrollLeft + clientWidth - 24 || x < scrollLeft) this._scroll.scrollLeft = Math.max(0, x - 40);
    }
  }
  // ---- pointer interaction
  _rulerDown(e) {
    if (e.button !== 0) return;
    this._ruler.setPointerCapture(e.pointerId);
    const shift = e.shiftKey;
    const anchor = Math.round(this._frameAt(e.clientX));
    const move = (ev) => {
      const f = clamp(Math.round(this._frameAt(ev.clientX)), 0, this.duration);
      if (shift) {
        this.setAttribute("loop-start", String(Math.min(anchor, f)));
        this.setAttribute("loop-end", String(Math.max(anchor, f)));
      } else this._setFrame(f);
    };
    move(e);
    const up = () => {
      this._ruler.removeEventListener("pointermove", move);
      this._ruler.removeEventListener("pointerup", up);
    };
    this._ruler.addEventListener("pointermove", move);
    this._ruler.addEventListener("pointerup", up);
  }
  _lanesDown(e) {
    if (e.button !== 0) return;
    this._scroll.focus({ preventScroll: true });
    const clipEl = e.target.closest?.("[data-clip]");
    if (!clipEl) {
      this._marqueeStart(e);
      return;
    }
    const { _clip: clip, _track: track } = clipEl;
    const additive = e.ctrlKey || e.metaKey || e.shiftKey;
    if (additive) {
      clip.selected = !clip.selected;
      this._selectionChanged();
      this._render();
      return;
    }
    if (!clip.selected) {
      for (const { clip: c } of this._allClips()) c.selected = c === clip;
      this._selectionChanged();
    }
    if (track.locked || this.hasAttribute("read-only")) {
      this._render();
      return;
    }
    const edge = e.target.dataset?.edge;
    this._dragStart(e, edge ? "trim-" + edge : "move", clip);
  }
  _selectionChanged() {
    this.emit("selection-changed", { clips: this.selectedClips });
  }
  _marqueeStart(e) {
    const rect0 = this._content.getBoundingClientRect();
    const additive = e.ctrlKey || e.metaKey || e.shiftKey;
    const startX = e.clientX - rect0.left;
    const startY = e.clientY - rect0.top;
    const base = additive ? new Set(this.selectedClips) : /* @__PURE__ */ new Set();
    this._lanes.setPointerCapture(e.pointerId);
    let moved = false;
    const move = (ev) => {
      const x = ev.clientX - rect0.left, y = ev.clientY - rect0.top;
      if (!moved && Math.hypot(x - startX, y - startY) < 3) return;
      moved = true;
      const box = { l: Math.min(x, startX), r: Math.max(x, startX), t: Math.min(y, startY), b: Math.max(y, startY) };
      this._marquee.hidden = false;
      Object.assign(this._marquee.style, { left: `${box.l}px`, top: `${box.t}px`, width: `${box.r - box.l}px`, height: `${box.b - box.t}px` });
      let top = RULER_H;
      for (const track of this._tracks) {
        const hgt = track.height || 44;
        for (const clip of track.clips) {
          const hit = !track.locked && clip.start * this.pixelsPerFrame < box.r && (clip.start + clip.length) * this.pixelsPerFrame > box.l && top < box.b && top + hgt > box.t;
          clip.selected = base.has(clip) || hit;
        }
        top += hgt;
      }
      this._render();
    };
    const up = () => {
      this._lanes.removeEventListener("pointermove", move);
      this._lanes.removeEventListener("pointerup", up);
      this._marquee.hidden = true;
      if (!moved && !additive) {
        for (const { clip } of this._allClips()) clip.selected = false;
        this._render();
      }
      this._selectionChanged();
    };
    this._lanes.addEventListener("pointermove", move);
    this._lanes.addEventListener("pointerup", up);
  }
  /** Snaps `frame` to the playhead, markers, the loop region and other clips' edges when within a few pixels. */
  _snap(frame, ignore) {
    if (this.hasAttribute("no-snapping")) return frame;
    const targets = [this.currentFrame, ...this._markers.map((m) => m.frame)];
    const ls = Number(this.getAttribute("loop-start")), le = Number(this.getAttribute("loop-end"));
    if (le > ls) targets.push(ls, le);
    for (const { clip } of this._allClips()) if (!ignore.has(clip)) targets.push(clip.start, clip.start + clip.length);
    let best = frame, bestDist = SNAP_PX / this.pixelsPerFrame;
    for (const t of targets) {
      const d = Math.abs(t - frame);
      if (d <= bestDist) {
        best = t;
        bestDist = d;
      }
    }
    return best;
  }
  _dragStart(e, mode, anchorClip) {
    const entries = this._allClips().filter(({ clip }) => clip.selected);
    const group = new Set(entries.map((x) => x.clip));
    const orig = new Map(entries.map(({ clip, track }) => [clip, { start: clip.start, length: clip.length, track, mediaStart: clip.mediaStart }]));
    const startFrame = this._frameAt(e.clientX);
    const startLane = this._tracks.indexOf(this._trackOf(anchorClip));
    const laneEl = this._lanes;
    laneEl.setPointerCapture(e.pointerId);
    this._durationBefore = this.duration;
    let moved = false;
    let cancelled = false;
    const restore = () => {
      for (const [clip, o] of orig) {
        const cur = this._trackOf(clip);
        if (cur !== o.track) {
          cur.clips.splice(cur.clips.indexOf(clip), 1);
          o.track.clips.push(clip);
        }
        clip.start = o.start;
        clip.length = o.length;
        if (o.mediaStart !== void 0) clip.mediaStart = o.mediaStart;
      }
    };
    const move = (ev) => {
      if (cancelled) return;
      const dx = this._frameAt(ev.clientX) - startFrame;
      if (!moved && Math.abs(dx) * this.pixelsPerFrame < 3 && Math.abs(ev.clientY - e.clientY) < 3) return;
      moved = true;
      restore();
      if (mode === "move") this._applyMove(orig, group, dx, ev, startLane, anchorClip);
      else this._applyTrim(orig, group, mode, dx);
      this._render();
    };
    const key = (ev) => {
      if (ev.key === "Escape") {
        cancelled = true;
        restore();
        this._render();
        end();
      }
    };
    const end = () => {
      laneEl.removeEventListener("pointermove", move);
      laneEl.removeEventListener("pointerup", up);
      this._scroll.removeEventListener("keydown", key);
    };
    const up = () => {
      end();
      if (!moved || cancelled) {
        this._render();
        return;
      }
      const snap = [...orig].map(([clip, from]) => ({ clip, from, to: { start: clip.start, length: clip.length, track: this._trackOf(clip), mediaStart: clip.mediaStart } })).filter(({ clip, from }) => clip.start !== from.start || clip.length !== from.length || this._trackOf(clip) !== from.track);
      if (!snap.length) {
        this._durationBefore = void 0;
        return;
      }
      this._record(mode === "move" ? "Move clips" : "Trim clips", { snap });
      const detail = { clips: snap.map((s) => ({ clip: s.clip, oldStart: s.from.start, oldLength: s.from.length, oldTrack: s.from.track, newTrack: s.to.track })) };
      this.emit(mode === "move" ? "clips-moved" : "clips-resized", detail);
      this._render();
    };
    this._scroll.addEventListener("keydown", key);
    laneEl.addEventListener("pointermove", move);
    laneEl.addEventListener("pointerup", up);
  }
  _applyMove(orig, group, dx, ev, startLane, anchorClip) {
    const o0 = orig.get(anchorClip);
    const lead = this._snap(o0.start + dx, group);
    const trail = this._snap(o0.start + o0.length + dx, group) - o0.length;
    let delta = (Math.abs(lead - (o0.start + dx)) <= Math.abs(trail - (o0.start + dx)) ? lead : trail) - o0.start;
    delta = Math.round(delta);
    let minStart = Infinity, maxEnd = -Infinity;
    for (const [, o] of orig) {
      minStart = Math.min(minStart, o.start);
      maxEnd = Math.max(maxEnd, o.start + o.length);
    }
    delta = Math.max(delta, -minStart);
    if (this.hasAttribute("constrain-to-duration")) delta = Math.min(delta, this.duration - maxEnd);
    const r = this._lanes.getBoundingClientRect();
    let y = ev.clientY - r.top, lane = 0, acc = 0;
    for (let i = 0; i < this._tracks.length; i++) {
      acc += this._tracks[i].height || 44;
      if (y < acc) {
        lane = i;
        break;
      }
      lane = i;
    }
    let laneDelta = lane - startLane;
    const tIdx = (clip) => this._tracks.indexOf(orig.get(clip).track);
    const usable = (d2) => [...orig.keys()].every((c) => {
      const t = this._tracks[tIdx(c) + d2];
      return t && !t.locked;
    });
    if (!usable(laneDelta)) laneDelta = 0;
    const place2 = (d2, ld2) => {
      for (const [clip, o] of orig) {
        const dest = this._tracks[tIdx(clip) + ld2];
        const cur = this._trackOf(clip);
        if (cur !== dest) {
          cur.clips.splice(cur.clips.indexOf(clip), 1);
          dest.clips.push(clip);
        }
        clip.start = o.start + d2;
      }
    };
    const valid = (d2, ld2) => [...orig.keys()].every((c) => {
      const dest = this._tracks[tIdx(c) + ld2];
      return this._fits(dest, orig.get(c).start + d2, c.length, group);
    });
    let d = delta, ld = laneDelta;
    if (!valid(d, ld)) {
      while (d !== 0 && !valid(d, ld)) d += d > 0 ? -1 : 1;
      if (!valid(d, ld)) {
        ld = 0;
        while (d !== 0 && !valid(d, ld)) d += d > 0 ? -1 : 1;
      }
    }
    if (this.hasAttribute("auto-extend-duration") && maxEnd + d > this.duration) this._extendTo(maxEnd + d);
    place2(d, ld);
  }
  _applyTrim(orig, group, mode, dx) {
    for (const [clip, o] of orig) {
      const track = this._trackOf(clip);
      const hasMedia = clip.mediaLength != null;
      const mediaStart = o.mediaStart || 0;
      if (mode === "trim-start") {
        let start = Math.round(this._snap(o.start + dx, group));
        const minStart = hasMedia ? o.start - mediaStart : 0;
        start = clamp(start, Math.max(0, minStart), o.start + o.length - 1);
        if (this.hasAttribute("prevent-overlap")) {
          const prevEnd = Math.max(0, ...track.clips.filter((c) => !group.has(c) && c.start + c.length <= o.start + 1e-4).map((c) => c.start + c.length));
          start = Math.max(start, prevEnd);
        }
        clip.length = o.start + o.length - start;
        if (hasMedia) clip.mediaStart = mediaStart + (start - o.start);
        clip.start = start;
      } else {
        let end = Math.round(this._snap(o.start + o.length + dx, group));
        end = Math.max(end, o.start + 1);
        if (hasMedia) end = Math.min(end, o.start + (clip.mediaLength - mediaStart));
        if (this.hasAttribute("constrain-to-duration")) end = Math.min(end, this.duration);
        if (this.hasAttribute("prevent-overlap")) {
          const next = Math.min(Infinity, ...track.clips.filter((c) => !group.has(c) && c.start >= o.start + o.length - 1e-4).map((c) => c.start));
          end = Math.min(end, next);
        }
        if (this.hasAttribute("auto-extend-duration") && end > this.duration) this._extendTo(end);
        clip.length = end - o.start;
      }
    }
  }
  _onKey(e) {
    const ctrl = e.ctrlKey || e.metaKey;
    const k = e.key;
    if (k === " ") {
      e.preventDefault();
      this.togglePlayback();
    } else if (k === "ArrowRight") {
      e.preventDefault();
      this.stepForward(ctrl ? 10 : 1);
    } else if (k === "ArrowLeft") {
      e.preventDefault();
      this.stepBackward(ctrl ? 10 : 1);
    } else if (k === "Home") {
      e.preventDefault();
      this._setFrame(0);
    } else if (k === "End") {
      e.preventDefault();
      this._setFrame(this.duration);
    } else if (k === "Delete" || k === "Backspace") {
      e.preventDefault();
      this.deleteSelection();
    } else if (ctrl && (k === "a" || k === "A")) {
      e.preventDefault();
      for (const { clip, track } of this._allClips()) clip.selected = !track.locked;
      this._selectionChanged();
      this._render();
    } else if (ctrl && (k === "+" || k === "=")) {
      e.preventDefault();
      this.zoomIn();
    } else if (ctrl && (k === "-" || k === "_")) {
      e.preventDefault();
      this.zoomOut();
    } else if (ctrl && (k === "z" || k === "Z")) {
      e.preventDefault();
      if (e.shiftKey) this.redo();
      else this.undo();
    } else if (ctrl && (k === "y" || k === "Y")) {
      e.preventDefault();
      this.redo();
    }
  }
};
function waveformFromSamples(samples, bins = 200) {
  const out = new Array(bins).fill(0);
  const per = Math.max(1, Math.floor(samples.length / bins));
  for (let i = 0; i < bins; i++) {
    let peak = 0;
    for (let j = i * per; j < Math.min(samples.length, (i + 1) * per); j++) peak = Math.max(peak, Math.abs(samples[j]));
    out[i] = Math.min(1, peak);
  }
  return out;
}
define("tsl-animation-timeline", TesselAnimationTimeline);

// src/components/button.js
var BASE = "inline-flex items-center justify-center gap-2 border rounded-md select-none cursor-pointer whitespace-nowrap text-body font-medium transition-colors duration-fast ease-tessel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-45";
var BOX = "h-8 px-3.5 grow";
var VARIANTS = {
  standard: `${BOX} bg-control border-border hover:bg-control-hover active:bg-control-pressed`,
  accent: `${BOX} bg-accent border-accent text-on-accent hover:bg-accent-hover hover:border-accent-hover active:bg-accent-pressed active:border-accent-pressed`,
  outline: `${BOX} bg-transparent border-accent text-accent hover:bg-accent-subtle active:bg-accent-subtle`,
  subtle: `${BOX} bg-transparent border-transparent hover:bg-control-hover active:bg-control-pressed`,
  danger: `${BOX} bg-danger border-danger text-white hover:bg-danger-hover hover:border-danger-hover active:bg-danger-hover active:border-danger-hover`,
  icon: "size-8 p-0 bg-transparent border-transparent hover:bg-control-hover active:bg-control-pressed",
  link: "p-0 bg-transparent border-transparent text-accent font-normal hover:text-accent-hover active:text-accent-pressed"
};
var TesselButton = class extends TesselElement {
  static styles = ":host{display:inline-flex;vertical-align:middle;} ::slotted(*){pointer-events:none;}";
  static observedAttributes = ["disabled", "icon", "icon-size", "variant"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._iconSlot = h("span", "inline-flex flex-none", { part: "icon" });
    this._button = h("button", "", { type: this.getAttribute("type") || "button" }, this._iconSlot, h("slot"));
    this._button.disabled = this.disabled;
    this.shadowRoot.appendChild(this._button);
    this._renderVariant();
    this._renderIcon();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === "disabled") this._button.disabled = this.disabled;
    if (name === "variant") this._renderVariant();
    if (name === "icon" || name === "icon-size") this._renderIcon();
  }
  _renderVariant() {
    this._button.className = cx(BASE, VARIANTS[this.variant] || VARIANTS.standard);
  }
  _renderIcon() {
    const icon = this.getAttribute("icon");
    this._iconSlot.replaceChildren();
    this._iconSlot.hidden = !icon;
    if (icon) this._iconSlot.appendChild(createIcon(icon, Number(this.getAttribute("icon-size")) || 16));
  }
  get variant() {
    return this.getAttribute("variant") || "standard";
  }
  set variant(v) {
    this.setAttribute("variant", v);
  }
};
define("tsl-button", TesselButton);

// src/components/progress-bar.js
var TRACK = "relative h-1 w-full overflow-hidden rounded-xs bg-subtle host-[disabled]:opacity-45";
var FILL = "absolute inset-y-0 left-0 rounded-xs bg-accent";
var TesselProgressBar = class extends TesselElement {
  static styles = ":host{display:block;width:220px;}";
  static observedAttributes = ["value", "max", "indeterminate", "disabled"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._fill = h("div", FILL);
    this._track = h("div", TRACK, { role: "progressbar", "aria-valuemin": "0" }, this._fill);
    this.shadowRoot.appendChild(this._track);
    this._sync();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    const max = Number(this.getAttribute("max")) || 100;
    const value = Number(this.getAttribute("value")) || 0;
    const indeterminate = this.hasAttribute("indeterminate");
    this._fill.className = cx(FILL, indeterminate ? "animate-indeterminate" : "transition-[width] duration-base ease-tessel");
    if (indeterminate) {
      this._fill.style.width = "";
      this._track.removeAttribute("aria-valuenow");
    } else {
      this._fill.style.width = `${Math.max(0, Math.min(100, value / max * 100))}%`;
      this._track.setAttribute("aria-valuenow", String(value));
      this._track.setAttribute("aria-valuemax", String(max));
    }
  }
};
define("tsl-progress-bar", TesselProgressBar);

// src/components/content-dialog.js
var DialogResult = Object.freeze({ NONE: "none", PRIMARY: "primary", SECONDARY: "secondary" });
var DIALOG = "m-auto flex-col overflow-hidden rounded-lg border border-border bg-surface p-0 text-text shadow-dialog w-[420px] min-w-80 max-w-[min(548px,calc(100vw-48px))] max-h-[calc(100vh-48px)] open:flex opacity-0 scale-96 open:opacity-100 open:scale-100 starting:open:opacity-0 starting:open:scale-96 transition-[opacity,scale,display,overlay] transition-discrete duration-slow ease-tessel backdrop:bg-overlay backdrop:opacity-0 open:backdrop:opacity-100 starting:open:backdrop:opacity-0 backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-slow backdrop:ease-tessel";
var TesselDialog = class extends TesselElement {
  static styles = ":host{display:contents;}";
  static Result = DialogResult;
  static observedAttributes = ["title", "heading", "primary-text", "secondary-text", "close-text", "primary-destructive", "busy", "severity"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._severity = h("span", "mt-0.5 flex flex-none", { hidden: true });
    this._title = h("h2", "mb-3 text-subtitle font-semibold text-text", { id: "tsl-dialog-title" });
    this._progress = h("tsl-progress-bar", "mt-4 w-full");
    this._progressText = h("div", "mt-2 text-caption text-text-secondary");
    this._busyBlock = h("div", "", null, this._progress, this._progressText);
    this._footer = h("div", "flex justify-end gap-2 rounded-b-lg border-t border-border bg-surface-alt px-5 py-4");
    this._dialog = h(
      "dialog",
      DIALOG,
      { "aria-labelledby": "tsl-dialog-title" },
      h(
        "div",
        "flex gap-4 overflow-auto p-6",
        null,
        this._severity,
        h(
          "div",
          "min-w-0 flex-1",
          null,
          this._title,
          h("div", "text-body leading-normal text-text-secondary", null, h("slot")),
          this._busyBlock
        )
      ),
      this._footer
    );
    this.shadowRoot.appendChild(this._dialog);
    this._dialog.addEventListener("click", (e) => {
      if (e.target === this._dialog && !this.busy) this._close(DialogResult.NONE);
    });
    this._dialog.addEventListener("cancel", (e) => {
      e.preventDefault();
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
    const severity = this.getAttribute("severity");
    this._severity.hidden = !severity;
    this._severity.className = cx("mt-0.5 flex flex-none", { success: "text-success", warning: "text-warning", error: "text-danger", informational: "text-info" }[severity] || "text-accent");
    this._severity.innerHTML = severity ? severitySvg(severity, 24) : "";
    this._footer.replaceChildren();
    if (this._customButtons) {
      for (const b of this._customButtons) this._footer.appendChild(this._makeButton(b.text, b.variant || "standard", b.value, false));
      return;
    }
    const secondaryText = this.getAttribute("secondary-text");
    const closeText = this.getAttribute("close-text") || "Cancel";
    const primaryText = this.getAttribute("primary-text");
    if (secondaryText) this._footer.appendChild(this._makeButton(secondaryText, "standard", DialogResult.SECONDARY, busy));
    this._footer.appendChild(this._makeButton(closeText, "standard", DialogResult.NONE, false));
    if (primaryText) {
      const variant = this.hasAttribute("primary-destructive") ? "danger" : "accent";
      this._footer.appendChild(this._makeButton(primaryText, variant, DialogResult.PRIMARY, busy));
    }
  }
  _makeButton(text, variant, result, disabled) {
    const btn = h("tsl-button", "", { variant, disabled }, text);
    btn.addEventListener("click", () => this._close(result));
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
  get open() {
    return this._dialog?.open ?? false;
  }
  /** Shows the progress bar and disables the primary/secondary buttons while a long operation runs. */
  get busy() {
    return this.hasAttribute("busy");
  }
  set busy(v) {
    this.toggleAttribute("busy", !!v);
  }
  /** Updates the progress bar (0-100) and the status line shown under the content while `busy`. */
  reportProgress(percent, text = "") {
    this.busy = true;
    this._progress.removeAttribute("indeterminate");
    this._progress.setAttribute("value", String(percent));
    this._progressText.textContent = text;
  }
  /** Opens the dialog and resolves with a DialogResult once it closes (either button). */
  showModal() {
    return new Promise((resolve) => {
      this._resolve = resolve;
      this._closing = false;
      this._dialog.showModal();
      this.setAttribute("open", "");
      requestAnimationFrame(() => this._footer.lastElementChild?.focus?.());
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
      if (!this.emit(result === DialogResult.PRIMARY ? "primary-click" : "secondary-click", {})) return;
    }
    this._closing = true;
    this.emit("close", { result });
    this._dialog.close();
    this.removeAttribute("open");
    await Promise.allSettled(this._dialog.getAnimations({ subtree: true }).map((a) => a.finished));
    this._closing = false;
    this._resolve?.(result);
    this._resolve = null;
  }
};
define("tsl-dialog", TesselDialog);
function showDialog({
  title,
  message,
  primaryText,
  secondaryText,
  closeText = "Cancel",
  primaryDestructive = false
} = {}) {
  const dialog = document.createElement("tsl-dialog");
  if (title) dialog.setAttribute("heading", title);
  if (primaryText) dialog.setAttribute("primary-text", primaryText);
  if (secondaryText) dialog.setAttribute("secondary-text", secondaryText);
  dialog.setAttribute("close-text", closeText);
  if (primaryDestructive) dialog.setAttribute("primary-destructive", "");
  if (message) dialog.textContent = message;
  document.body.appendChild(dialog);
  return dialog.showModal().finally(() => dialog.remove());
}
var MessageButtons = Object.freeze({
  OK: "ok",
  OK_CANCEL: "ok-cancel",
  YES_NO: "yes-no",
  YES_NO_CANCEL: "yes-no-cancel",
  RETRY_CANCEL: "retry-cancel"
});
var MessageResult = Object.freeze({ OK: "ok", CANCEL: "cancel", YES: "yes", NO: "no", RETRY: "retry" });
var BUTTON_SETS = {
  [MessageButtons.OK]: ["ok"],
  [MessageButtons.OK_CANCEL]: ["cancel", "ok"],
  [MessageButtons.YES_NO]: ["no", "yes"],
  [MessageButtons.YES_NO_CANCEL]: ["cancel", "no", "yes"],
  [MessageButtons.RETRY_CANCEL]: ["cancel", "retry"]
};
var BUTTON_TEXT = { ok: "OK", cancel: "Cancel", yes: "Yes", no: "No", retry: "Retry" };
async function showMessage(title, message, { buttons = MessageButtons.OK, icon, destructive = false } = {}) {
  const dialog = document.createElement("tsl-dialog");
  if (title) dialog.setAttribute("heading", title);
  if (icon) dialog.setAttribute("severity", icon);
  if (message) dialog.textContent = message;
  const set = BUTTON_SETS[buttons] || BUTTON_SETS[MessageButtons.OK];
  const fallback = set.includes("cancel") ? "cancel" : set.includes("no") ? "no" : set[0];
  dialog.buttons = set.map((value, i) => ({
    text: BUTTON_TEXT[value],
    value,
    variant: i === set.length - 1 ? destructive ? "danger" : "accent" : "standard"
  }));
  document.body.appendChild(dialog);
  const result = await dialog.showModal().finally(() => dialog.remove());
  return result === DialogResult.NONE ? fallback : result;
}

// src/components/checkbox.js
var LABEL = "group inline-flex items-center gap-2.5 px-0.5 py-1 cursor-pointer select-none host-[disabled]:pointer-events-none";
var BOX2 = "relative flex flex-none size-5 items-center justify-center rounded-sm border-[1.5px] text-on-accent transition-colors duration-fast ease-tessel peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent host-[disabled]:opacity-45";
var BOX_OFF = "border-text-tertiary bg-input group-hover:border-text-secondary group-hover:bg-control-hover";
var BOX_ON = "border-accent bg-accent group-hover:border-accent-hover group-hover:bg-accent-hover";
var MARK = "size-[13px] transition-[opacity,transform] duration-fast ease-tessel";
var DASH = "absolute w-2.5 h-0.5 rounded-[1px] bg-current transition-[opacity,transform] duration-fast ease-tessel";
var SHOWN = "opacity-100 scale-100";
var HIDDEN = "opacity-0 scale-60";
var TesselCheckbox = class extends TesselElement {
  static styles = ":host{display:inline-flex;}";
  static observedAttributes = ["disabled", "checked", "indeterminate"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._input = h("input", "peer sr-only", { type: "checkbox" });
    this._check = html("span", MARK, checkmarkSvg(13, 2.2));
    this._dash = h("span", DASH);
    this._box = h("span", "", null, this._check, this._dash);
    this.shadowRoot.appendChild(
      h("label", LABEL, null, this._input, this._box, h("span", "text-body text-text", null, h("slot")))
    );
    this._sync();
    this._input.addEventListener("change", () => {
      this.checked = this._input.checked;
      this.indeterminate = false;
      this.emit("change", { checked: this.checked });
    });
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    const checked = this.hasAttribute("checked");
    const indeterminate = this.hasAttribute("indeterminate");
    this._input.checked = checked;
    this._input.indeterminate = indeterminate;
    this._input.disabled = this.disabled;
    this._box.className = cx(BOX2, checked || indeterminate ? BOX_ON : BOX_OFF);
    this._check.className = cx(MARK, checked && !indeterminate ? SHOWN : HIDDEN);
    this._dash.className = cx(DASH, indeterminate ? SHOWN : HIDDEN);
  }
  get checked() {
    return this.hasAttribute("checked");
  }
  set checked(v) {
    this.toggleAttribute("checked", !!v);
  }
  get indeterminate() {
    return this.hasAttribute("indeterminate");
  }
  set indeterminate(v) {
    this.toggleAttribute("indeterminate", !!v);
  }
};
define("tsl-checkbox", TesselCheckbox);

// src/components/radio.js
var LABEL2 = "group inline-flex items-center gap-2.5 px-0.5 py-1 cursor-pointer select-none host-[disabled]:pointer-events-none";
var BOX3 = "relative flex-none size-5 rounded-full border-[1.5px] transition-colors duration-fast ease-tessel peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent host-[disabled]:opacity-45";
var BOX_OFF2 = "border-text-tertiary bg-input group-hover:border-text-secondary group-hover:bg-control-hover";
var BOX_ON2 = "border-accent bg-accent group-hover:border-accent-hover group-hover:bg-accent-hover";
var DOT = "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-on-accent transition-[transform,width,height] duration-fast ease-tessel";
var TesselRadio = class extends TesselElement {
  static styles = ":host{display:inline-flex;}";
  static observedAttributes = ["disabled", "checked"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._input = h("input", "peer sr-only", { type: "radio" });
    this._dot = h("span", DOT);
    this._box = h("span", "", null, this._dot);
    this.shadowRoot.appendChild(
      h("label", LABEL2, null, this._input, this._box, h("span", "text-body text-text", null, h("slot")))
    );
    this._sync();
    this._input.addEventListener("change", () => {
      this.checked = true;
      this.emit("change", { value: this.value, checked: true });
    });
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    const checked = this.hasAttribute("checked");
    this._input.checked = checked;
    this._input.disabled = this.disabled;
    this._box.className = cx(BOX3, checked ? BOX_ON2 : BOX_OFF2);
    this._dot.className = cx(DOT, checked ? "size-2 scale-100 group-hover:size-2.5" : "size-2 scale-0");
  }
  get checked() {
    return this.hasAttribute("checked");
  }
  set checked(v) {
    this.toggleAttribute("checked", !!v);
  }
  get value() {
    return this.getAttribute("value") || "";
  }
  set value(v) {
    this.setAttribute("value", v);
  }
};
var TesselRadioGroup = class extends TesselElement {
  static styles = ":host{display:flex;flex-direction:column;gap:2px;}";
  static observedAttributes = ["value"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this.shadowRoot.appendChild(h("slot"));
    this.setAttribute("role", "radiogroup");
    this.addEventListener("change", (e) => {
      if (!(e.target instanceof TesselRadio)) return;
      for (const radio of this._radios()) radio.checked = radio === e.target;
      this._applying = true;
      this.setAttribute("value", e.target.value);
      this._applying = false;
      this.emit("change", { value: e.target.value });
    });
    this._applyValue();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built && name === "value" && !this._applying) this._applyValue();
  }
  _radios() {
    return Array.from(this.children).filter((c) => c instanceof TesselRadio);
  }
  _applyValue() {
    const value = this.getAttribute("value");
    for (const radio of this._radios()) radio.checked = radio.value === value;
  }
  get value() {
    return this.getAttribute("value") || "";
  }
  set value(v) {
    this.setAttribute("value", v);
  }
};
define("tsl-radio", TesselRadio);
define("tsl-radio-group", TesselRadioGroup);

// src/components/switch.js
var LABEL3 = "group inline-flex items-center gap-2.5 cursor-pointer select-none host-[disabled]:pointer-events-none";
var TRACK2 = "relative flex-none w-10 h-5 rounded-pill border-[1.5px] transition-colors duration-base ease-tessel peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-accent host-[disabled]:opacity-45";
var TRACK_OFF = "border-text-secondary bg-input group-hover:bg-control-hover";
var TRACK_ON = "border-accent bg-accent group-hover:border-accent-hover group-hover:bg-accent-hover";
var KNOB = "absolute left-1 top-1/2 -translate-y-1/2 h-3 rounded-full group-active:w-3.5 w-3 transition-[transform,background-color,width] duration-base ease-tessel";
var KNOB_OFF = "bg-text-secondary";
var KNOB_ON = "bg-on-accent translate-x-[17px]";
var TesselSwitch = class extends TesselElement {
  static styles = ":host{display:inline-flex;}";
  static observedAttributes = ["disabled", "checked"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._input = h("input", "peer sr-only", { type: "checkbox", role: "switch" });
    this._knob = h("span", KNOB);
    this._track = h("span", "", null, this._knob);
    this.shadowRoot.appendChild(
      h("label", LABEL3, null, this._input, this._track, h("span", "text-body text-text", null, h("slot")))
    );
    this._sync();
    this._input.addEventListener("change", () => {
      this.checked = this._input.checked;
      this.emit("change", { checked: this.checked });
    });
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    const checked = this.hasAttribute("checked");
    this._input.checked = checked;
    this._input.disabled = this.disabled;
    this._track.className = cx(TRACK2, checked ? TRACK_ON : TRACK_OFF);
    this._knob.className = cx(KNOB, checked ? KNOB_ON : KNOB_OFF);
  }
  get checked() {
    return this.hasAttribute("checked");
  }
  set checked(v) {
    this.toggleAttribute("checked", !!v);
  }
};
define("tsl-switch", TesselSwitch);

// src/components/text-field.js
var HEADER = "mb-1.5 block text-body font-medium text-text";
var FIELD = "group relative flex h-8 w-full items-center gap-2 overflow-hidden rounded-md border border-border bg-input px-2.5 transition-colors duration-fast ease-tessel hover:border-border-strong focus-within:border-accent hover:focus-within:border-accent host-[disabled]:opacity-45 host-[disabled]:pointer-events-none after:absolute after:inset-x-px after:bottom-0 after:h-0 after:bg-accent after:transition-[height] after:duration-fast after:ease-tessel focus-within:after:h-0.5";
var INPUT = "h-full min-w-0 flex-1 bg-transparent p-0 text-body text-text outline-none placeholder:text-text-tertiary";
var CLEAR = "mr-[-6px] flex size-6 flex-none cursor-pointer items-center justify-center rounded-sm bg-transparent text-text-secondary transition-colors duration-fast hover:bg-control-hover hover:text-text active:bg-control-pressed";
var TesselTextField = class extends TesselElement {
  static styles = ":host{display:inline-flex;flex-direction:column;width:220px;}";
  static observedAttributes = ["disabled", "icon", "placeholder", "type", "value", "readonly", "header", "clearable", "name", "maxlength", "autocomplete"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._header = h("label", HEADER);
    this._iconSlot = h("span", "flex flex-none text-text-secondary");
    this._input = h("input", INPUT);
    this._clear = h("button", CLEAR, { type: "button", tabindex: "-1", "aria-label": "Clear" });
    this._clear.innerHTML = closeSvg(10);
    this._field = h("div", FIELD, null, this._iconSlot, this._input, this._clear);
    this.shadowRoot.append(this._header, this._field);
    this._sync();
    this._input.addEventListener("input", () => {
      this.setAttribute("value", this._input.value);
      this._updateClear();
      this.emit("input", { value: this._input.value });
    });
    this._input.addEventListener("change", () => this.emit("change", { value: this._input.value }));
    this._clear.addEventListener("mousedown", (e) => e.preventDefault());
    this._clear.addEventListener("click", () => {
      this.value = "";
      this._input.focus();
      this.emit("input", { value: "" });
      this.emit("change", { value: "" });
    });
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    const input = this._input;
    input.type = this.getAttribute("type") || "text";
    input.placeholder = this.getAttribute("placeholder") || "";
    input.disabled = this.disabled;
    input.readOnly = this.hasAttribute("readonly");
    for (const attr of ["name", "maxlength", "autocomplete"]) {
      if (this.hasAttribute(attr)) input.setAttribute(attr, this.getAttribute(attr));
      else input.removeAttribute(attr);
    }
    if (this.hasAttribute("value") && input.value !== this.getAttribute("value")) {
      input.value = this.getAttribute("value");
    }
    const header = this.getAttribute("header");
    this._header.textContent = header || "";
    this._header.hidden = !header;
    const icon = this.getAttribute("icon");
    this._iconSlot.replaceChildren(...icon ? [createIcon(icon, 16)] : []);
    this._iconSlot.hidden = !icon;
    this._updateClear();
  }
  _updateClear() {
    this._clear.hidden = !this.hasAttribute("clearable") || this.hasAttribute("readonly") || !this._input.value;
  }
  get value() {
    return this._input ? this._input.value : this.getAttribute("value") || "";
  }
  set value(v) {
    this.setAttribute("value", v);
    if (this._input) {
      this._input.value = v;
      this._updateClear();
    }
  }
  focus(options) {
    this._input?.focus(options);
  }
};
define("tsl-text-field", TesselTextField);

// src/components/text-area.js
var HEADER2 = "mb-1.5 block text-body font-medium text-text";
var FIELD2 = "relative flex w-full overflow-hidden rounded-md border border-border bg-input transition-colors duration-fast ease-tessel hover:border-border-strong focus-within:border-accent hover:focus-within:border-accent host-[disabled]:opacity-45 host-[disabled]:pointer-events-none after:absolute after:inset-x-px after:bottom-0 after:h-0 after:bg-accent after:transition-[height] after:duration-fast after:ease-tessel focus-within:after:h-0.5";
var TEXTAREA = "min-h-16 flex-1 resize-y bg-transparent px-2.5 py-1.5 text-body text-text outline-none placeholder:text-text-tertiary";
var TesselTextArea = class extends TesselElement {
  static styles = ":host{display:inline-flex;flex-direction:column;width:280px;}";
  static observedAttributes = ["disabled", "placeholder", "rows", "value", "readonly", "header", "name", "maxlength"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._header = h("label", HEADER2);
    this._textarea = h("textarea", TEXTAREA);
    const initial = this.getAttribute("value") ?? this.textContent.trim();
    if (initial) this._textarea.value = initial;
    this.shadowRoot.append(this._header, h("div", FIELD2, null, this._textarea));
    this._sync();
    this._textarea.addEventListener("input", () => this.emit("input", { value: this._textarea.value }));
    this._textarea.addEventListener("change", () => this.emit("change", { value: this._textarea.value }));
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync(name);
  }
  _sync(changed) {
    const ta = this._textarea;
    ta.placeholder = this.getAttribute("placeholder") || "";
    ta.rows = Number(this.getAttribute("rows")) || 4;
    ta.disabled = this.disabled;
    ta.readOnly = this.hasAttribute("readonly");
    for (const attr of ["name", "maxlength"]) {
      if (this.hasAttribute(attr)) ta.setAttribute(attr, this.getAttribute(attr));
      else ta.removeAttribute(attr);
    }
    if (changed === "value" && this.hasAttribute("value")) ta.value = this.getAttribute("value");
    const header = this.getAttribute("header");
    this._header.textContent = header || "";
    this._header.hidden = !header;
  }
  get value() {
    return this._textarea ? this._textarea.value : "";
  }
  set value(v) {
    if (this._textarea) this._textarea.value = v;
  }
};
define("tsl-text-area", TesselTextArea);

// src/core/popup.js
var state = /* @__PURE__ */ new WeakMap();
var MARGIN = 8;
var POPUP_BASE = "fixed inset-auto m-0 overflow-auto border border-border bg-surface text-text p-0 opacity-0 scale-98 transition-[opacity,scale,display,overlay] transition-discrete duration-fast ease-tessel open:opacity-100 open:scale-100 starting:open:opacity-0 starting:open:scale-98";
function isOpen(popup) {
  try {
    return popup.matches(":popover-open");
  } catch {
    return false;
  }
}
function place(popup, anchor, { placement, offset, matchWidth, align }) {
  const a = anchor.getBoundingClientRect();
  if (matchWidth) popup.style.minWidth = `${a.width}px`;
  popup.style.maxHeight = "";
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const p = { width: popup.offsetWidth, height: popup.offsetHeight };
  const [side, alignment = align] = placement.split("-");
  let top, left;
  if (side === "bottom" || side === "top") {
    const below = vh - a.bottom - offset - MARGIN;
    const above = a.top - offset - MARGIN;
    const flip = side === "bottom" ? p.height > below && above > below : p.height > above && below > above;
    const useBottom = side === "bottom" ? !flip : flip;
    const room = useBottom ? below : above;
    if (p.height > room) popup.style.maxHeight = `${Math.max(120, room)}px`;
    const h2 = Math.min(p.height, Math.max(120, room));
    top = useBottom ? a.bottom + offset : a.top - offset - h2;
    left = alignment === "end" ? a.right - p.width : alignment === "center" ? a.left + (a.width - p.width) / 2 : a.left;
    popup.dataset.side = useBottom ? "bottom" : "top";
  } else {
    const right = vw - a.right - offset - MARGIN;
    const useRight = side === "right" ? !(p.width > right && a.left > right) : p.width > a.left - offset - MARGIN && right > a.left;
    left = useRight ? a.right + offset : a.left - offset - p.width;
    top = alignment === "end" ? a.bottom - p.height : alignment === "center" ? a.top + (a.height - p.height) / 2 : a.top;
    popup.dataset.side = useRight ? "right" : "left";
  }
  left = Math.max(MARGIN, Math.min(left, vw - p.width - MARGIN));
  top = Math.max(MARGIN, Math.min(top, vh - Math.min(p.height, vh - 2 * MARGIN) - MARGIN));
  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
}
function openPopup(popup, anchor, options = {}) {
  const opts = { placement: "bottom-start", offset: 4, matchWidth: false, align: "start", ...options };
  closeNow(popup);
  if (!popup.hasAttribute("popover")) popup.setAttribute("popover", "manual");
  if (!isOpen(popup)) popup.showPopover();
  place(popup, anchor, opts);
  const reposition = () => place(popup, anchor, opts);
  const dismiss = () => {
    closePopup(popup);
    opts.onDismiss?.();
  };
  const onPointer = (e) => {
    if (opts.stayOpen) return;
    const path = e.composedPath();
    if (path.includes(popup) || path.includes(anchor) || opts.owner && path.includes(opts.owner)) return;
    dismiss();
  };
  const onKey = (e) => {
    if (e.key === "Escape" && !opts.stayOpen) {
      e.stopPropagation();
      dismiss();
    }
  };
  window.addEventListener("resize", reposition);
  window.addEventListener("scroll", reposition, true);
  document.addEventListener("pointerdown", onPointer, true);
  document.addEventListener("keydown", onKey, true);
  state.set(popup, {
    reposition,
    cleanup() {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("keydown", onKey, true);
    }
  });
  return { reposition };
}
function repositionPopup(popup) {
  state.get(popup)?.reposition();
}
function closeNow(popup) {
  const s = state.get(popup);
  if (s) {
    s.cleanup();
    state.delete(popup);
  }
}
function closePopup(popup) {
  closeNow(popup);
  if (isOpen(popup)) popup.hidePopover();
}
function popupIsOpen(popup) {
  return isOpen(popup);
}

// src/components/select.js
var TesselOption = class extends HTMLElement {
  get value() {
    return this.getAttribute("value") ?? this.textContent.trim();
  }
  set value(v) {
    this.setAttribute("value", v);
  }
};
Object.defineProperty(TesselOption.prototype, "label", {
  get() {
    return this.textContent.trim();
  }
});
if (!customElements.get("tsl-option")) {
  TesselOption.prototype.connectedCallback = function() {
    this.hidden = true;
  };
  customElements.define("tsl-option", TesselOption);
}
var HEADER3 = "mb-1.5 block text-body font-medium text-text";
var CONTROL = "flex h-8 w-full cursor-pointer items-center gap-2 rounded-md border border-border bg-control px-3 text-body text-text transition-colors duration-fast ease-tessel hover:bg-control-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent host-[open]:border-accent host-[disabled]:pointer-events-none host-[disabled]:opacity-45";
var POPUP = `${POPUP_BASE} z-50 rounded-md p-1 shadow-card scrollbar-thin`;
var OPTION = "relative flex min-h-8 cursor-pointer items-center gap-2 rounded-sm py-1.5 pl-3.5 pr-2.5 text-text transition-colors duration-fast ease-tessel";
var OPTION_IDLE = "hover:bg-control-hover";
var OPTION_SELECTED = "bg-subtle before:absolute before:left-px before:top-2 before:bottom-2 before:w-[3px] before:rounded-[1.5px] before:bg-accent";
var OPTION_ACTIVE = "bg-control-hover";
var TesselSelect = class extends TesselElement {
  static styles = ":host{display:inline-flex;flex-direction:column;width:220px;}";
  static observedAttributes = ["disabled", "value", "placeholder", "header"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) {
      this._readOptions();
      return;
    }
    this._built = true;
    this._header = h("label", HEADER3);
    this._valueEl = h("span", "min-w-0 flex-1 truncate text-left");
    this._control = h(
      "button",
      CONTROL,
      { type: "button", role: "combobox", "aria-haspopup": "listbox", "aria-expanded": "false" },
      this._valueEl,
      html("span", "flex flex-none text-text-secondary transition-transform duration-fast ease-tessel", chevronSvg("down", 14))
    );
    this._chevron = this._control.lastElementChild;
    this._popup = h("div", POPUP, { popover: "manual", role: "listbox" });
    this.shadowRoot.append(this._header, this._control, this._popup);
    this._active = -1;
    this._control.addEventListener("click", () => this.open ? this.close() : this.openMenu());
    this._control.addEventListener("keydown", (e) => this._onKeydown(e));
    this._mo = new MutationObserver(() => this._readOptions());
    this._mo.observe(this, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["disabled", "value"] });
    this._readOptions();
  }
  disconnectedCallback() {
    this._mo?.disconnect();
    if (this._popup) closePopup(this._popup);
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === "header") {
      this._header.textContent = newV || "";
      this._header.hidden = !newV;
    } else {
      this._render();
    }
  }
  _readOptions() {
    this._options = Array.from(this.querySelectorAll("tsl-option"));
    this._render();
  }
  _render() {
    if (!this._popup) return;
    const value = this.getAttribute("value");
    this._header.textContent = this.getAttribute("header") || "";
    this._header.hidden = !this.hasAttribute("header");
    this._popup.replaceChildren();
    let matched = null;
    this._options.forEach((opt, i) => {
      const disabled = opt.hasAttribute("disabled");
      const selected = opt.value === value;
      if (selected) matched = opt;
      const row = h(
        "div",
        cx(OPTION, selected ? OPTION_SELECTED : OPTION_IDLE, i === this._active && OPTION_ACTIVE, disabled && "pointer-events-none opacity-45"),
        {
          role: "option",
          "aria-selected": selected ? "true" : "false",
          "aria-disabled": disabled ? "true" : null
        },
        h("span", "min-w-0 flex-1 truncate", null, opt.label),
        html("span", cx("ml-auto flex-none text-accent", selected ? "opacity-100" : "opacity-0"), checkmarkSvg(14, 2))
      );
      row.addEventListener("click", () => {
        if (disabled) return;
        this._choose(opt);
        this.close();
      });
      this._popup.appendChild(row);
    });
    this._valueEl.textContent = matched ? matched.label : this.getAttribute("placeholder") || "";
    this._valueEl.className = cx("min-w-0 flex-1 truncate text-left", !matched && "text-text-tertiary");
  }
  _choose(opt) {
    if (opt.value === this.getAttribute("value")) return;
    this.value = opt.value;
    this.emit("change", { value: opt.value });
  }
  _enabled() {
    return this._options.map((o, i) => [o, i]).filter(([o]) => !o.hasAttribute("disabled"));
  }
  _move(dir) {
    const enabled = this._enabled();
    if (!enabled.length) return;
    const at = enabled.findIndex(([, i]) => i === this._active);
    const next = enabled[(at + dir + enabled.length) % enabled.length] ?? enabled[0];
    this._active = next[1];
    this._render();
    this._popup.children[this._active]?.scrollIntoView({ block: "nearest" });
  }
  _onKeydown(e) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!this.open) this.openMenu();
      else this._move(e.key === "ArrowDown" ? 1 : -1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!this.open) this.openMenu();
      else {
        const opt = this._options[this._active];
        if (opt && !opt.hasAttribute("disabled")) this._choose(opt);
        this.close();
      }
    } else if (e.key === "Home" || e.key === "End") {
      if (!this.open) return;
      e.preventDefault();
      const enabled = this._enabled();
      this._active = (e.key === "Home" ? enabled[0] : enabled.at(-1))?.[1] ?? -1;
      this._render();
    } else if (e.key === "Tab") {
      this.close();
    }
  }
  openMenu() {
    if (this.disabled) return;
    this._active = this._options.findIndex((o) => o.value === this.getAttribute("value"));
    this._render();
    this.setAttribute("open", "");
    this._control.setAttribute("aria-expanded", "true");
    this._chevron.classList.add("rotate-180");
    openPopup(this._popup, this._control, { matchWidth: true, owner: this, onDismiss: () => this._afterClose() });
  }
  close() {
    closePopup(this._popup);
    this._afterClose();
  }
  _afterClose() {
    this.removeAttribute("open");
    this._control.setAttribute("aria-expanded", "false");
    this._chevron.classList.remove("rotate-180");
  }
  get open() {
    return this.hasAttribute("open");
  }
  get value() {
    return this.getAttribute("value") || "";
  }
  set value(v) {
    this.setAttribute("value", v);
  }
};
define("tsl-select", TesselSelect);

// src/components/slider.js
var ROOT = "group relative flex h-5 w-full touch-none items-center outline-none cursor-pointer host-[disabled]:pointer-events-none host-[disabled]:opacity-45";
var TRACK3 = "relative h-1 w-full rounded-xs bg-border-strong";
var FILL2 = "absolute inset-y-0 left-0 rounded-xs bg-accent";
var THUMB = "absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border-strong bg-surface transition-shadow duration-fast ease-tessel group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-accent";
var DOT2 = "absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent transition-transform duration-fast ease-tessel group-hover:scale-125 group-active:scale-75";
var TesselSlider = class extends TesselElement {
  static styles = ":host{display:inline-flex;width:200px;}";
  static observedAttributes = ["disabled", "min", "max", "step", "value"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._fill = h("div", FILL2);
    this._thumb = h("div", THUMB, null, h("span", DOT2));
    this._root = h("div", ROOT, { role: "slider", tabindex: "0" }, h("div", TRACK3, null, this._fill), this._thumb);
    this.shadowRoot.appendChild(this._root);
    this._value = this._read("value", this._min());
    this._sync();
    this._root.addEventListener("pointerdown", (e) => {
      if (this.disabled) return;
      this._root.setPointerCapture(e.pointerId);
      this._dragging = true;
      this._fromPointer(e);
    });
    this._root.addEventListener("pointermove", (e) => {
      if (this._dragging) this._fromPointer(e);
    });
    const end = (e) => {
      if (!this._dragging) return;
      this._dragging = false;
      this._root.releasePointerCapture?.(e.pointerId);
      this.emit("change", { value: this.value });
    };
    this._root.addEventListener("pointerup", end);
    this._root.addEventListener("pointercancel", end);
    this._root.addEventListener("keydown", (e) => this._onKeydown(e));
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === "value") this._value = this._snap(this._read("value", this._min()));
    this._sync();
  }
  _read(attr, fallback) {
    const n = Number(this.getAttribute(attr));
    return this.hasAttribute(attr) && !Number.isNaN(n) ? n : fallback;
  }
  _min() {
    return this._read("min", 0);
  }
  _max() {
    return this._read("max", 100);
  }
  _step() {
    return this._read("step", 1) || 1;
  }
  _snap(v) {
    const min = this._min(), max = this._max(), step = this._step();
    const snapped = min + Math.round((v - min) / step) * step;
    const digits = (String(step).split(".")[1] || "").length;
    return Math.min(max, Math.max(min, Number(snapped.toFixed(digits))));
  }
  _set(v, { fire = true } = {}) {
    const next = this._snap(v);
    if (next === this._value) return;
    this._value = next;
    this.setAttribute("value", String(next));
    if (fire) this.emit("input", { value: next });
  }
  _fromPointer(e) {
    const rect = this._root.getBoundingClientRect();
    const t = rect.width ? Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)) : 0;
    this._set(this._min() + t * (this._max() - this._min()));
  }
  _onKeydown(e) {
    const step = this._step();
    const big = Math.max(step, (this._max() - this._min()) / 10);
    const keys = {
      ArrowRight: step,
      ArrowUp: step,
      ArrowLeft: -step,
      ArrowDown: -step,
      PageUp: big,
      PageDown: -big
    };
    let next = null;
    if (e.key in keys) next = this._value + keys[e.key];
    else if (e.key === "Home") next = this._min();
    else if (e.key === "End") next = this._max();
    if (next == null) return;
    e.preventDefault();
    this._set(next);
    this.emit("change", { value: this.value });
  }
  _sync() {
    const min = this._min(), max = this._max();
    const pct = max > min ? (this._value - min) / (max - min) * 100 : 0;
    this._fill.style.width = `${pct}%`;
    this._thumb.style.left = `${pct}%`;
    this._root.setAttribute("aria-valuemin", String(min));
    this._root.setAttribute("aria-valuemax", String(max));
    this._root.setAttribute("aria-valuenow", String(this._value));
    this._root.tabIndex = this.disabled ? -1 : 0;
  }
  get value() {
    return this._built ? this._value : this._read("value", 0);
  }
  set value(v) {
    this.setAttribute("value", String(v));
  }
};
define("tsl-slider", TesselSlider);

// src/components/list.js
var ROW = "relative mx-1 my-px flex min-h-9 cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2 text-body text-text transition-colors duration-fast ease-tessel focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent";
var ROW_IDLE = "hover:bg-control-hover";
var ROW_SELECTED = "bg-subtle before:absolute before:-left-[3px] before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-[1.5px] before:bg-accent";
var TesselListItem = class extends TesselElement {
  static styles = ":host{display:block;}";
  static observedAttributes = ["selected", "disabled"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._row = h("div", ROW, { role: "option", tabindex: "-1" }, h("slot"));
    this.shadowRoot.appendChild(this._row);
    this._row.addEventListener("click", () => {
      if (this.disabled) return;
      this.dispatchEvent(new CustomEvent("tsl-item-click", { bubbles: true, composed: true, detail: { value: this.value } }));
    });
    this._sync();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    this._row.className = cx(ROW, this.selected ? ROW_SELECTED : ROW_IDLE, this.disabled && "pointer-events-none opacity-45");
    this._row.setAttribute("aria-selected", this.selected ? "true" : "false");
  }
  focusRow() {
    this._row?.focus();
  }
  get value() {
    return this.getAttribute("value") ?? this.textContent.trim();
  }
  set value(v) {
    this.setAttribute("value", v);
  }
  get selected() {
    return this.hasAttribute("selected");
  }
  set selected(v) {
    this.toggleAttribute("selected", !!v);
  }
};
var TesselList = class extends TesselElement {
  static styles = ":host{display:block;padding:4px 0;border-radius:var(--tsl-radius-md);background:var(--tsl-surface);border:1px solid var(--tsl-border);overflow:auto;}";
  static observedAttributes = ["value"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) {
      this._applySelection();
      return;
    }
    this._built = true;
    this.shadowRoot.appendChild(h("slot"));
    this.setAttribute("role", "listbox");
    this.addEventListener("tsl-item-click", (e) => {
      this.value = e.detail.value;
      this.emit("change", { value: this.value });
    });
    this.addEventListener("keydown", (e) => {
      const items = this._items().filter((i) => !i.disabled);
      const at = items.findIndex((i) => i.matches(":focus-within"));
      const move = { ArrowDown: 1, ArrowUp: -1 }[e.key];
      if (move) {
        e.preventDefault();
        items[at < 0 ? move > 0 ? 0 : items.length - 1 : (at + move + items.length) % items.length]?.focusRow();
      } else if ((e.key === "Enter" || e.key === " ") && at >= 0) {
        e.preventDefault();
        items[at]._row.click();
      }
    });
    this._applySelection();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built && name === "value") this._applySelection();
  }
  _items() {
    return Array.from(this.children).filter((c) => c instanceof TesselListItem);
  }
  _applySelection() {
    const value = this.getAttribute("value");
    const items = this._items();
    for (const item of items) item.selected = item.value === value;
    const tabbable = items.find((i) => i.selected) || items.find((i) => !i.disabled);
    for (const item of items) item._row?.setAttribute("tabindex", item === tabbable ? "0" : "-1");
  }
  get value() {
    return this.getAttribute("value") || "";
  }
  set value(v) {
    this.setAttribute("value", v);
  }
};
define("tsl-list-item", TesselListItem);
define("tsl-list", TesselList);

// src/components/tree.js
var ROW2 = "relative flex h-8 cursor-pointer select-none items-center gap-2 rounded-sm pl-0.5 pr-2 text-body text-text transition-colors duration-fast ease-tessel focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent";
var ROW_IDLE2 = "hover:bg-control-hover";
var ROW_SELECTED2 = "bg-subtle before:absolute before:-left-0.5 before:top-2 before:bottom-2 before:w-[3px] before:rounded-[1.5px] before:bg-accent";
var CHEVRON = "flex size-4 flex-none items-center justify-center text-text-secondary transition-transform duration-fast ease-tessel";
var KIDS = "grid transition-[grid-template-rows] duration-slow ease-tessel";
var TesselTreeItem = class _TesselTreeItem extends TesselElement {
  static styles = ":host{display:block;}";
  static observedAttributes = ["label", "icon", "expanded", "selected", "folder"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) {
      this._detectChildren();
      return;
    }
    this._built = true;
    this._chevron = html("span", CHEVRON, chevronSvg("right", 14));
    this._icon = h("span", "flex flex-none text-accent");
    this._label = h("span", "min-w-0 flex-1 truncate");
    this._row = h("div", ROW2, { tabindex: "-1", role: "treeitem" }, this._chevron, this._icon, this._label);
    this._kids = h("div", KIDS, { role: "group" }, h("div", "min-h-0 overflow-hidden pl-[22px]", null, h("slot")));
    this.shadowRoot.append(this._row, this._kids);
    this._row.addEventListener("click", () => {
      if (this.hasAttribute("has-children")) this.expanded = !this.expanded;
      this.dispatchEvent(new CustomEvent("tsl-tree-select", { bubbles: true, composed: true, detail: { item: this } }));
    });
    this._row.addEventListener("keydown", (e) => this._onKeydown(e));
    this._mo = new MutationObserver(() => this._detectChildren());
    this._mo.observe(this, { childList: true });
    this._detectChildren();
  }
  disconnectedCallback() {
    this._mo?.disconnect();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _detectChildren() {
    this.toggleAttribute("has-children", this.querySelector(":scope > tsl-tree-item") !== null);
    this._sync();
  }
  /** Items currently reachable by keyboard: every row whose ancestors are all expanded. */
  _visibleRows() {
    const tree = this.closest("tsl-tree") || this;
    return Array.from(tree.querySelectorAll("tsl-tree-item")).filter((item) => {
      for (let p = item.parentElement; p && p !== tree; p = p.parentElement) {
        if (p instanceof _TesselTreeItem && !p.expanded) return false;
      }
      return true;
    });
  }
  _onKeydown(e) {
    const hasChildren = this.hasAttribute("has-children");
    const rows = this._visibleRows();
    const at = rows.indexOf(this);
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        this._row.click();
        break;
      case "ArrowRight":
        e.preventDefault();
        if (hasChildren && !this.expanded) this.expanded = true;
        else if (hasChildren) rows[at + 1]?._row.focus();
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (hasChildren && this.expanded) this.expanded = false;
        else this.parentElement?.closest?.("tsl-tree-item")?._row.focus();
        break;
      case "ArrowDown":
        e.preventDefault();
        rows[at + 1]?._row.focus();
        break;
      case "ArrowUp":
        e.preventDefault();
        rows[at - 1]?._row.focus();
        break;
      case "Home":
        e.preventDefault();
        rows[0]?._row.focus();
        break;
      case "End":
        e.preventDefault();
        rows.at(-1)?._row.focus();
        break;
      default:
    }
  }
  _sync() {
    const hasChildren = this.hasAttribute("has-children");
    const expanded = this.expanded;
    this._label.textContent = this.getAttribute("label") || "";
    const icon = this.getAttribute("icon");
    const isFolder = this.hasAttribute("folder") || hasChildren;
    this._icon.replaceChildren();
    if (icon) this._icon.appendChild(createIcon(icon, 16));
    else this._icon.innerHTML = isFolder ? folderSvg(16) : fileSvg(16);
    this._row.className = cx(ROW2, this.selected ? ROW_SELECTED2 : ROW_IDLE2);
    const tree = this.closest("tsl-tree");
    const first = tree && !tree.querySelector("tsl-tree-item[selected]") && tree.querySelector("tsl-tree-item") === this;
    this._row.tabIndex = this.selected || first ? 0 : -1;
    this._row.setAttribute("aria-selected", this.selected ? "true" : "false");
    if (hasChildren) this._row.setAttribute("aria-expanded", String(expanded));
    else this._row.removeAttribute("aria-expanded");
    this._chevron.className = cx(CHEVRON, hasChildren ? expanded ? "visible rotate-90" : "visible" : "invisible");
    this._kids.className = cx(KIDS, expanded && hasChildren ? "grid-rows-[1fr]" : "grid-rows-[0fr]");
    this._kids.inert = !expanded;
  }
  get expanded() {
    return this.hasAttribute("expanded");
  }
  set expanded(v) {
    this.toggleAttribute("expanded", !!v);
  }
  get selected() {
    return this.hasAttribute("selected");
  }
  set selected(v) {
    this.toggleAttribute("selected", !!v);
  }
  get label() {
    return this.getAttribute("label") || "";
  }
};
var TesselTree = class extends TesselElement {
  static styles = ":host{display:block;padding:4px;}";
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this.setAttribute("role", "tree");
    this.shadowRoot.appendChild(h("slot"));
    this.addEventListener("tsl-tree-select", (e) => {
      for (const item of this.querySelectorAll("tsl-tree-item")) item.selected = item === e.detail.item;
      this.emit("change", { item: e.detail.item, label: e.detail.item.label });
    });
  }
};
define("tsl-tree-item", TesselTreeItem);
define("tsl-tree", TesselTree);

// src/styles/light.generated.js
var light_generated_default = '@layer theme,base,components,utilities;@layer base{tsl-table,tsl-table *{--tw-border-style:solid}}/*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */\n@layer theme{:root,:host{--font-weight-bold:700;--tracking-wider:.05em;--default-transition-duration:.15s;--default-transition-timing-function:cubic-bezier(.4, 0, .2, 1)}}@layer base;@layer components{tsl-table>table{border-collapse:collapse;width:100%;font-size:14px;line-height:var(--tw-leading,20px);color:var(--tsl-text);border-spacing:0}tsl-table>table>thead>tr>th{border-bottom-style:var(--tw-border-style);border-bottom-width:1px;border-color:var(--tsl-border);background-color:var(--tsl-subtle);text-align:left;font-size:11px;line-height:var(--tw-leading,16px);--tw-font-weight:var(--font-weight-bold);font-weight:var(--font-weight-bold);--tw-tracking:var(--tracking-wider);letter-spacing:var(--tracking-wider);color:var(--tsl-text-secondary);text-transform:uppercase;padding-block:12px;padding-inline:20px;position:sticky;top:0}tsl-table>table>thead>tr>th:first-child{border-top-left-radius:var(--tsl-radius-lg)}tsl-table>table>thead>tr>th:last-child{border-top-right-radius:var(--tsl-radius-lg)}tsl-table[sortable]>table>thead>tr>th{cursor:pointer;-webkit-user-select:none;user-select:none}@media (hover:hover){tsl-table[sortable]>table>thead>tr>th:hover{background-color:var(--tsl-control-hover)}}tsl-table>table>thead>tr>th[aria-sort=ascending]:after{content:" \u2191"}tsl-table>table>thead>tr>th[aria-sort=descending]:after{content:" \u2193"}tsl-table>table>tbody>tr{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration));transition-duration:var(--tsl-duration-fast);--tw-ease:var(--tsl-ease);transition-timing-function:var(--tsl-ease)}@media (hover:hover){tsl-table>table>tbody>tr:hover{background-color:var(--tsl-control-hover)}}tsl-table>table>tbody>tr:nth-child(2n){background-color:var(--tsl-surface-alt)}@media (hover:hover){tsl-table>table>tbody>tr:nth-child(2n):hover{background-color:var(--tsl-control-hover)}}tsl-table>table>tbody>tr>td{border-bottom-style:var(--tw-border-style);border-bottom-width:1px;border-color:var(--tsl-border);height:44px;padding-inline:20px}tsl-table>table>tbody>tr:last-child>td{border-bottom-style:var(--tw-border-style);border-bottom-width:0}tsl-table>table>tbody>tr:last-child>td:first-child{border-bottom-left-radius:var(--tsl-radius-lg)}tsl-table>table>tbody>tr:last-child>td:last-child{border-bottom-right-radius:var(--tsl-radius-lg)}tsl-table[selectable]>table>tbody>tr{cursor:pointer}tsl-table>table>tbody>tr[aria-selected=true],tsl-table>table>tbody>tr[aria-selected=true]:nth-child(2n){background-color:var(--tsl-accent-subtle)}}@layer utilities;@keyframes tsl-spin{to{transform:rotate(360deg)}}@keyframes tsl-shimmer{0%{background-position:200% 0}to{background-position:-200% 0}}@keyframes tsl-indeterminate{0%{width:40%;left:-40%}60%{width:40%;left:100%}to{width:40%;left:100%}}@keyframes tsl-fade-in{0%{opacity:0}to{opacity:1}}@keyframes tsl-pop-in{0%{opacity:0;transform:translateY(4px)scale(.98)}to{opacity:1;transform:none}}@keyframes tsl-page-in{0%{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}@keyframes tsl-ring{0%{stroke-dasharray:1 150;stroke-dashoffset:0;transform:rotate(0)}50%{stroke-dasharray:90 150;stroke-dashoffset:-35px;transform:rotate(180deg)}to{stroke-dasharray:90 150;stroke-dashoffset:-124px;transform:rotate(360deg)}}';

// src/components/table.js
var lightSheet = null;
function adoptLightStyles(root) {
  if (!("adoptedStyleSheets" in Document.prototype)) {
    if (root.querySelector?.("style[data-tessel-light]")) return;
    const style2 = document.createElement("style");
    style2.dataset.tesselLight = "";
    style2.textContent = light_generated_default;
    (root.head || root).appendChild(style2);
    return;
  }
  lightSheet ??= new CSSStyleSheet();
  if (!lightSheet.cssRules.length) lightSheet.replaceSync(light_generated_default);
  if (!root.adoptedStyleSheets.includes(lightSheet)) root.adoptedStyleSheets = [...root.adoptedStyleSheets, lightSheet];
}
var TesselTable = class extends TesselElement {
  static styles = ":host{display:block;overflow:auto;border:1px solid var(--tsl-border);border-radius:var(--tsl-radius-lg);background:var(--tsl-surface);box-shadow:0 1px 2px var(--tsl-shadow);}";
  connectedCallback() {
    super.connectedCallback();
    adoptLightStyles(this.getRootNode());
    if (this._built) return;
    this._built = true;
    this.shadowRoot.appendChild(h("slot"));
    this.addEventListener("click", (e) => {
      const cell = e.composedPath().find((n) => n instanceof HTMLElement && (n.tagName === "TD" || n.tagName === "TH"));
      if (!cell) return;
      if (cell.tagName === "TH" && this.hasAttribute("sortable")) this._sortBy(cell);
      const row = cell.parentElement;
      if (cell.tagName === "TD" && this.hasAttribute("selectable") && row.parentElement?.tagName === "TBODY") {
        for (const r of row.parentElement.rows) r.removeAttribute("aria-selected");
        row.setAttribute("aria-selected", "true");
        this.emit("change", { row, index: row.sectionRowIndex });
      }
    });
  }
  _sortBy(th) {
    const table = this.querySelector("table");
    const body = table?.tBodies[0];
    if (!body) return;
    const column = th.cellIndex;
    const direction = th.getAttribute("aria-sort") === "ascending" ? "descending" : "ascending";
    for (const other of th.parentElement.cells) other.removeAttribute("aria-sort");
    th.setAttribute("aria-sort", direction);
    const text = (row) => (row.cells[column]?.textContent ?? "").trim();
    const rows = Array.from(body.rows);
    const numeric = rows.every((r) => text(r) !== "" && !Number.isNaN(Number(text(r))));
    rows.sort((a, b) => {
      const cmp = numeric ? Number(text(a)) - Number(text(b)) : text(a).localeCompare(text(b), void 0, { numeric: true, sensitivity: "base" });
      return direction === "ascending" ? cmp : -cmp;
    });
    body.append(...rows);
    this.emit("sort", { column, direction });
  }
};
define("tsl-table", TesselTable);

// src/components/tabs.js
var TesselTab = class extends HTMLElement {
  connectedCallback() {
    this.hidden = true;
  }
  get value() {
    return this.getAttribute("value") ?? this.textContent.trim();
  }
  set value(v) {
    this.setAttribute("value", v);
  }
  get label() {
    return this.textContent.trim();
  }
};
var TesselTabPanel = class extends HTMLElement {
  get value() {
    return this.getAttribute("value") ?? "";
  }
};
if (!customElements.get("tsl-tab")) customElements.define("tsl-tab", TesselTab);
if (!customElements.get("tsl-tab-panel")) customElements.define("tsl-tab-panel", TesselTabPanel);
var STRIP = "relative flex gap-0.5 border-b border-border";
var TAB = "relative flex cursor-pointer items-center gap-2 rounded-t-sm border-0 bg-transparent px-3.5 py-2.5 text-body text-text-secondary transition-colors duration-fast ease-tessel hover:bg-control-hover hover:text-text focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent aria-selected:text-text aria-disabled:pointer-events-none aria-disabled:opacity-45";
var INDICATOR = "pointer-events-none absolute bottom-[-1px] left-0 h-[3px] w-0 rounded-[1.5px] bg-accent transition-[transform,width] duration-base ease-tessel";
var TesselTabs = class extends TesselElement {
  static styles = ":host{display:block;} ::slotted(tsl-tab-panel:not([hidden])){display:block;}";
  static observedAttributes = ["value"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) {
      this._readTabs();
      return;
    }
    this._built = true;
    this._indicator = h("div", INDICATOR);
    this._strip = h("div", STRIP, { role: "tablist" }, this._indicator);
    this.shadowRoot.append(this._strip, h("div", "pt-4", null, h("slot")));
    this._strip.addEventListener("keydown", (e) => this._onKeydown(e));
    this._mo = new MutationObserver(() => this._readTabs());
    this._mo.observe(this, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["disabled", "icon"] });
    this._ro = new ResizeObserver(() => this._render(true));
    this._ro.observe(this._strip);
    this._readTabs();
  }
  disconnectedCallback() {
    this._mo?.disconnect();
    this._ro?.disconnect();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built && name === "value") this._render();
  }
  _tabs() {
    return Array.from(this.children).filter((c) => c instanceof TesselTab);
  }
  _panels() {
    return Array.from(this.children).filter((c) => c instanceof TesselTabPanel);
  }
  _buttons() {
    return Array.from(this._strip.querySelectorAll("button"));
  }
  _readTabs() {
    const tabs = this._tabs();
    if (!this.hasAttribute("value") && tabs[0]) this.setAttribute("value", tabs[0].value);
    this._strip.replaceChildren(...tabs.map((tab) => {
      const icon = tab.getAttribute("icon");
      const btn = h(
        "button",
        TAB,
        { type: "button", role: "tab", "aria-disabled": tab.hasAttribute("disabled") ? "true" : null },
        icon && createIcon(icon, 16),
        tab.label
      );
      btn.addEventListener("click", () => {
        if (tab.hasAttribute("disabled")) return;
        this.value = tab.value;
        this.emit("change", { value: tab.value });
      });
      return btn;
    }), this._indicator);
    this._render(true);
  }
  _render(skipAnimation = false) {
    const value = this.getAttribute("value");
    const tabs = this._tabs();
    let selectedBtn = null;
    this._buttons().forEach((btn, i) => {
      const selected = tabs[i]?.value === value;
      btn.setAttribute("aria-selected", String(selected));
      btn.tabIndex = selected ? 0 : -1;
      if (selected) selectedBtn = btn;
    });
    for (const panel of this._panels()) {
      panel.hidden = panel.value !== value;
      panel.setAttribute("role", "tabpanel");
    }
    this._moveIndicator(selectedBtn, skipAnimation);
  }
  _onKeydown(e) {
    const buttons = this._buttons().filter((b) => b.getAttribute("aria-disabled") !== "true");
    const at = buttons.indexOf(this.shadowRoot.activeElement);
    const to = { ArrowRight: at + 1, ArrowLeft: at - 1, Home: 0, End: buttons.length - 1 }[e.key];
    if (to == null || !buttons.length) return;
    e.preventDefault();
    const btn = buttons[(to + buttons.length) % buttons.length];
    btn.focus();
    btn.click();
  }
  _moveIndicator(btn, skipAnimation) {
    const indicator = this._indicator;
    if (!btn || !btn.offsetWidth) {
      indicator.style.width = "0";
      return;
    }
    indicator.style.transition = skipAnimation ? "none" : "";
    indicator.style.transform = `translateX(${btn.offsetLeft + 12}px)`;
    indicator.style.width = `${Math.max(0, btn.offsetWidth - 24)}px`;
    if (skipAnimation) {
      indicator.getBoundingClientRect();
      indicator.style.transition = "";
    }
  }
  get value() {
    return this.getAttribute("value") || "";
  }
  set value(v) {
    this.setAttribute("value", v);
  }
};
define("tsl-tabs", TesselTabs);

// src/core/menu.js
var MENU_POPUP = `${POPUP_BASE} z-50 min-w-[200px] rounded-md p-1 shadow-card scrollbar-thin`;
var ROW3 = "relative flex min-h-8 w-full cursor-pointer items-center gap-3 rounded-sm border-0 bg-transparent px-2.5 py-1.5 text-left text-body text-text transition-colors duration-fast ease-tessel hover:bg-control-hover focus-visible:bg-control-hover focus-visible:outline-none aria-disabled:pointer-events-none aria-disabled:opacity-45";
function renderMenu(popup, children, { onSelect, onToggle } = {}) {
  popup.replaceChildren();
  popup.setAttribute("role", "menu");
  for (const child of children) {
    if (child.localName === "tsl-menu-separator") {
      popup.appendChild(h("div", "mx-1.5 my-1 h-px bg-border", { role: "separator" }));
      continue;
    }
    const checkable = child.localName === "tsl-menu-checkbox-item";
    const disabled = child.hasAttribute("disabled");
    const shortcut = child.getAttribute("shortcut");
    const row = h(
      "button",
      ROW3,
      {
        type: "button",
        role: checkable ? "menuitemcheckbox" : "menuitem",
        tabindex: "-1",
        "aria-disabled": disabled ? "true" : null,
        "aria-checked": checkable ? String(child.checked) : null
      },
      h("span", "flex w-4 flex-none text-text-secondary", null, child.icon ? createIcon(child.icon, 16) : null),
      h("span", "min-w-0 flex-1", null, child.label),
      shortcut && h("span", "flex-none pl-4 text-caption text-text-tertiary", null, shortcut),
      html("span", cx("flex w-4 flex-none text-accent", checkable && child.checked ? "opacity-100" : "opacity-0"), checkmarkSvg(14, 2))
    );
    row.addEventListener("click", () => {
      if (disabled) return;
      if (checkable) {
        child.checked = !child.checked;
        row.setAttribute("aria-checked", String(child.checked));
        row.lastElementChild.classList.toggle("opacity-100", child.checked);
        row.lastElementChild.classList.toggle("opacity-0", !child.checked);
        onToggle?.(child);
      } else {
        onSelect?.(child);
      }
    });
    popup.appendChild(row);
  }
}
function menuKeydown(popup, e) {
  const rows = Array.from(popup.querySelectorAll('[role^="menuitem"]:not([aria-disabled="true"])'));
  if (!rows.length) return false;
  const root = popup.getRootNode();
  const at = rows.indexOf(root.activeElement);
  let next = null;
  if (e.key === "ArrowDown") next = rows[(at + 1) % rows.length];
  else if (e.key === "ArrowUp") next = rows[(at - 1 + rows.length) % rows.length];
  else if (e.key === "Home") next = rows[0];
  else if (e.key === "End") next = rows.at(-1);
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
var MENU_TAGS = /* @__PURE__ */ new Set(["tsl-menu-item", "tsl-menu-checkbox-item", "tsl-menu-separator"]);
function menuChildren(el) {
  return Array.from(el.children).filter((c) => MENU_TAGS.has(c.localName));
}
function createMenu(host2, { anchor, placement = "bottom-start", onSelect, onToggle, onOpenChange } = {}) {
  const popup = h("div", MENU_POPUP, { popover: "manual" });
  const api = {
    popup,
    get isOpen() {
      return popupIsOpen(popup);
    },
    refresh() {
      renderMenu(popup, menuChildren(host2), {
        onSelect: (child) => {
          api.close();
          anchor().focus?.();
          onSelect?.(child);
        },
        onToggle
      });
    },
    open() {
      if (api.isOpen) return;
      onOpenChange?.(true);
      openPopup(popup, anchor(), {
        placement: typeof placement === "function" ? placement() : placement,
        owner: host2,
        onDismiss: () => onOpenChange?.(false)
      });
      requestAnimationFrame(() => popup.querySelector('[role^="menuitem"]:not([aria-disabled="true"])')?.focus());
    },
    close() {
      closePopup(popup);
      onOpenChange?.(false);
    }
  };
  popup.addEventListener("keydown", (e) => {
    if (menuKeydown(popup, e)) return;
    if (e.key === "Escape" || e.key === "Tab") {
      api.close();
      anchor().focus?.();
    }
  });
  return api;
}

// src/components/menu.js
var TesselMenuItem = class extends HTMLElement {
  connectedCallback() {
    this.hidden = true;
  }
  get value() {
    return this.getAttribute("value") ?? this.textContent.trim();
  }
  get icon() {
    return this.getAttribute("icon");
  }
  get label() {
    return this.textContent.trim();
  }
};
var TesselMenuCheckboxItem = class extends TesselMenuItem {
  get checked() {
    return this.hasAttribute("checked");
  }
  set checked(v) {
    this.toggleAttribute("checked", !!v);
  }
};
var TesselMenuSeparator = class extends HTMLElement {
  connectedCallback() {
    this.hidden = true;
  }
};
for (const [tag, cls] of [
  ["tsl-menu-item", TesselMenuItem],
  ["tsl-menu-checkbox-item", TesselMenuCheckboxItem],
  ["tsl-menu-separator", TesselMenuSeparator]
]) {
  if (!customElements.get(tag)) customElements.define(tag, cls);
}
var TesselMenuButton = class extends TesselElement {
  static styles = ":host{display:inline-flex;}";
  static observedAttributes = ["label", "icon", "open", "disabled", "variant"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) {
      this._menu.refresh();
      return;
    }
    this._built = true;
    const trigger = h("slot", "", { name: "trigger" });
    trigger.addEventListener("click", () => this._toggleTrigger());
    this._defaultTrigger = h("tsl-button", "", { variant: "standard", "aria-haspopup": "menu" });
    this._defaultTrigger.addEventListener("click", () => this._toggleTrigger());
    this._menu = createMenu(this, {
      anchor: () => this._anchor(),
      placement: () => this.getAttribute("align") === "right" ? "bottom-end" : "bottom-start",
      onSelect: (child) => this.emit("select", { value: child.value }),
      onToggle: (child) => this.emit("change", { value: child.value, checked: child.checked }),
      onOpenChange: (open) => this.toggleAttribute("open", open)
    });
    this.shadowRoot.append(trigger, this._defaultTrigger, this._menu.popup);
    this._mo = new MutationObserver(() => this._menu.refresh());
    this._mo.observe(this, { childList: true, characterData: true, subtree: true });
    this._sync();
    this._menu.refresh();
  }
  disconnectedCallback() {
    this._mo?.disconnect();
    this._menu?.close();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === "label" || name === "icon" || name === "disabled" || name === "variant") this._sync();
  }
  _anchor() {
    return this.querySelector('[slot="trigger"]') || this._defaultTrigger;
  }
  _toggleTrigger() {
    if (this.disabled) return;
    if (this.open) this.close();
    else this.openMenu();
  }
  _sync() {
    const slotted = this.querySelector('[slot="trigger"]');
    this._defaultTrigger.hidden = !!slotted;
    if (slotted) return;
    this._defaultTrigger.textContent = this.getAttribute("label") || "";
    this._defaultTrigger.setAttribute("variant", this.getAttribute("variant") || (this.getAttribute("label") ? "standard" : "subtle"));
    const icon = this.getAttribute("icon");
    if (icon) this._defaultTrigger.setAttribute("icon", icon);
    else this._defaultTrigger.removeAttribute("icon");
    this._defaultTrigger.toggleAttribute("disabled", this.disabled);
  }
  openMenu() {
    if (!this.disabled) this._menu.open();
  }
  close() {
    this._menu.close();
  }
  get open() {
    return this.hasAttribute("open");
  }
};
define("tsl-menu-button", TesselMenuButton);

// src/components/separator.js
var TesselSeparator = class extends TesselElement {
  static styles = ":host{display:block;}:host([vertical]){align-self:stretch;}";
  static observedAttributes = ["vertical"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._line = h("div");
    this.shadowRoot.appendChild(this._line);
    this._sync();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    const vertical = this.hasAttribute("vertical");
    this.setAttribute("role", "separator");
    if (vertical) this.setAttribute("aria-orientation", "vertical");
    else this.removeAttribute("aria-orientation");
    this._line.className = cx("bg-border", vertical ? "mx-2 h-full w-px" : "my-2 h-px w-full");
  }
};
define("tsl-separator", TesselSeparator);

// src/components/number-box.js
var HEADER4 = "mb-1.5 block text-body font-medium text-text";
var FIELD3 = "flex h-8 w-full items-stretch overflow-hidden rounded-md border border-border bg-input transition-colors duration-fast ease-tessel hover:border-border-strong focus-within:border-accent hover:focus-within:border-accent host-[disabled]:pointer-events-none host-[disabled]:opacity-45";
var INPUT2 = "min-w-0 flex-1 bg-transparent px-2.5 text-body text-text outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";
var STEP = "flex flex-1 cursor-pointer items-center justify-center bg-transparent p-0 text-text-secondary hover:bg-control-hover hover:text-text active:bg-control-pressed";
var PLUS = '<svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><line x1="4" y1="10" x2="16" y2="10"/><line x1="10" y1="4" x2="10" y2="16"/></svg>';
var MINUS = '<svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><line x1="4" y1="10" x2="16" y2="10"/></svg>';
var TesselNumberBox = class extends TesselElement {
  static styles = ":host{display:inline-flex;flex-direction:column;width:120px;}";
  static observedAttributes = ["disabled", "min", "max", "step", "value", "header"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._header = h("label", HEADER4);
    this._input = h("input", INPUT2, { type: "number" });
    const up = html("button", `${STEP} border-b border-border`, PLUS);
    const down = html("button", STEP, MINUS);
    for (const [btn, label2] of [[up, "Increase"], [down, "Decrease"]]) {
      btn.type = "button";
      btn.tabIndex = -1;
      btn.setAttribute("aria-label", label2);
      btn.addEventListener("mousedown", (e) => e.preventDefault());
    }
    this.shadowRoot.append(this._header, h("div", FIELD3, null, this._input, h("div", "flex w-7 flex-none flex-col border-l border-border", null, up, down)));
    this._sync();
    up.addEventListener("click", () => {
      this._input.stepUp();
      this._commit();
    });
    down.addEventListener("click", () => {
      this._input.stepDown();
      this._commit();
    });
    this._input.addEventListener("input", () => this._commit());
    this._input.addEventListener("blur", () => {
      const clamped = this._clamp(this._input.valueAsNumber);
      if (Number.isNaN(clamped)) return;
      if (clamped !== this._input.valueAsNumber) {
        this._input.value = String(clamped);
        this._commit();
      }
    });
  }
  _clamp(n) {
    const min = this.hasAttribute("min") ? Number(this.getAttribute("min")) : -Infinity;
    const max = this.hasAttribute("max") ? Number(this.getAttribute("max")) : Infinity;
    return Math.min(max, Math.max(min, n));
  }
  _commit() {
    this.setAttribute("value", this._input.value);
    this.emit("change", { value: this.value });
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    this._input.min = this.getAttribute("min") ?? "";
    this._input.max = this.getAttribute("max") ?? "";
    this._input.step = this.getAttribute("step") ?? "1";
    if (this.hasAttribute("value") && this._input.value !== this.getAttribute("value")) this._input.value = this.getAttribute("value");
    this._input.disabled = this.disabled;
    this._header.textContent = this.getAttribute("header") || "";
    this._header.hidden = !this.hasAttribute("header");
  }
  get value() {
    return Number(this._input ? this._input.value : this.getAttribute("value") || 0);
  }
  set value(v) {
    this.setAttribute("value", String(v));
  }
};
define("tsl-number-box", TesselNumberBox);

// src/components/card.js
var CARD = "rounded-lg border border-border bg-surface p-5 transition-shadow duration-base ease-tessel host-[elevated]:shadow-card";
var TesselCard = class extends TesselElement {
  static styles = ":host{display:block;}";
  static observedAttributes = ["header"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._header = h("div", "mb-3.5 text-header font-semibold text-text");
    this.shadowRoot.appendChild(h("div", CARD, null, this._header, h("slot")));
    this._sync();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    const header = this.getAttribute("header");
    this._header.textContent = header || "";
    this._header.hidden = !header;
  }
};
define("tsl-card", TesselCard);

// src/components/badge.js
var PILL = "inline-flex items-center whitespace-nowrap rounded-pill px-2 py-0.5 text-caption font-semibold transition-colors duration-fast ease-tessel";
var SOFT = {
  neutral: "bg-subtle text-text-secondary",
  accent: "bg-accent-subtle text-accent",
  success: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  danger: "bg-danger-subtle text-danger",
  info: "bg-info-subtle text-info"
};
var SOLID = {
  neutral: "bg-text-secondary text-surface",
  accent: "bg-accent text-on-accent",
  success: "bg-success text-surface",
  warning: "bg-warning text-surface",
  danger: "bg-danger text-white",
  info: "bg-info text-surface"
};
var TesselBadge = class extends TesselElement {
  static styles = ":host{display:inline-flex;}";
  static observedAttributes = ["kind", "solid"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._pill = h("span", PILL, null, h("slot"));
    this.shadowRoot.appendChild(this._pill);
    this._sync();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    const kind = this.getAttribute("kind");
    const map = this.hasAttribute("solid") ? SOLID : SOFT;
    this._pill.className = cx(PILL, map[kind] || map.neutral);
  }
};
define("tsl-badge", TesselBadge);

// src/components/avatar.js
var PALETTE = ["#4f46e5", "#0891b2", "#059669", "#d97706", "#db2777", "#7c3aed", "#dc2626", "#2563eb"];
function initialsOf(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
function hashColor(name) {
  if (!name) return null;
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = hash * 31 + name.charCodeAt(i) >>> 0;
  return PALETTE[hash % PALETTE.length];
}
var AVATAR = "relative flex flex-none select-none items-center justify-center overflow-hidden rounded-full bg-accent font-semibold text-white";
var TesselAvatar = class extends TesselElement {
  static styles = ":host{display:inline-flex;}";
  static observedAttributes = ["name", "size", "src"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._avatar = h("div", AVATAR, { role: "img" });
    this.shadowRoot.appendChild(this._avatar);
    this._sync();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    const size = Number(this.getAttribute("size")) || 40;
    const name = this.getAttribute("name") || "";
    const src = this.getAttribute("src");
    Object.assign(this._avatar.style, {
      width: `${size}px`,
      height: `${size}px`,
      fontSize: `${Math.max(8, size * 0.38)}px`,
      background: hashColor(name) || ""
    });
    this._avatar.setAttribute("aria-label", name);
    this._avatar.replaceChildren();
    if (src) {
      const img = h("img", "size-full object-cover", { src, alt: name });
      img.addEventListener("error", () => {
        if (this._avatar.contains(img)) this._avatar.textContent = initialsOf(name);
      }, { once: true });
      this._avatar.appendChild(img);
    } else {
      this._avatar.textContent = initialsOf(name);
    }
  }
};
define("tsl-avatar", TesselAvatar);

// src/components/settings-card.js
var ROW4 = "flex min-h-17 w-full items-center gap-4 rounded-lg border border-border bg-surface py-3 pl-5 pr-4";
var TesselSettingsCard = class extends TesselElement {
  static styles = ":host{display:flex;}";
  static observedAttributes = ["header", "description", "icon"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._icon = h("span", "flex flex-none text-text-secondary");
    this._header = h("div", "text-body text-text");
    this._description = h("div", "mt-0.5 text-caption text-text-tertiary");
    this.shadowRoot.appendChild(h(
      "div",
      ROW4,
      null,
      this._icon,
      h("div", "min-w-0 flex-1", null, this._header, this._description),
      h("span", "flex flex-none items-center", null, h("slot", "", { name: "control" }))
    ));
    this._sync();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    const icon = this.getAttribute("icon");
    this._icon.replaceChildren(...icon ? [createIcon(icon, 20)] : []);
    this._icon.hidden = !icon;
    this._header.textContent = this.getAttribute("header") || "";
    const description = this.getAttribute("description");
    this._description.textContent = description || "";
    this._description.hidden = !description;
  }
};
define("tsl-settings-card", TesselSettingsCard);

// src/components/expander.js
var ROOT2 = "overflow-hidden rounded-lg border border-border bg-surface";
var HEADER5 = "group flex h-[46px] cursor-pointer select-none items-center justify-between pl-4 pr-3 text-body font-semibold text-text focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent";
var CHEVRON2 = "flex size-7 items-center justify-center rounded-sm text-text-secondary transition-[background-color,transform] duration-fast ease-tessel group-hover:bg-control-hover";
var BODY = "grid border-t transition-[grid-template-rows,border-color] duration-slow ease-tessel";
var TesselExpander = class extends TesselElement {
  static styles = ":host{display:block;}";
  static observedAttributes = ["header", "expanded"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._headerText = h("span");
    this._chevron = html("span", CHEVRON2, chevronSvg("down", 16));
    this._header = h("div", HEADER5, { tabindex: "0", role: "button" }, this._headerText, this._chevron);
    this._body = h("div", BODY, null, h("div", "min-h-0 overflow-hidden", null, h("div", "p-4", null, h("slot"))));
    this.shadowRoot.appendChild(h("div", ROOT2, null, this._header, this._body));
    const toggle = () => {
      this.expanded = !this.expanded;
      this.emit("toggle", { expanded: this.expanded });
    };
    this._header.addEventListener("click", toggle);
    this._header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
    this._sync();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    const expanded = this.expanded;
    this._headerText.textContent = this.getAttribute("header") || "";
    this._header.setAttribute("aria-expanded", String(expanded));
    this._chevron.className = cx(CHEVRON2, expanded && "rotate-180");
    this._body.className = cx(BODY, expanded ? "grid-rows-[1fr] border-border" : "grid-rows-[0fr] border-transparent");
    this._body.inert = !expanded;
  }
  get expanded() {
    return this.hasAttribute("expanded");
  }
  set expanded(v) {
    this.toggleAttribute("expanded", !!v);
  }
};
define("tsl-expander", TesselExpander);

// src/components/navigation-view.js
var TesselNavItem = class extends HTMLElement {
  connectedCallback() {
    this.hidden = true;
  }
  get value() {
    return this.getAttribute("value") ?? "";
  }
  get icon() {
    return this.getAttribute("icon");
  }
  get footer() {
    return this.hasAttribute("footer");
  }
  get label() {
    return this.textContent.trim();
  }
};
var TesselNavHeader = class extends HTMLElement {
  connectedCallback() {
    this.hidden = true;
  }
  get label() {
    return this.textContent.trim();
  }
};
var TesselNavPage = class extends HTMLElement {
  get value() {
    return this.getAttribute("value") ?? "";
  }
};
for (const [tag, cls] of [["tsl-nav-item", TesselNavItem], ["tsl-nav-header", TesselNavHeader], ["tsl-nav-page", TesselNavPage]]) {
  if (!customElements.get(tag)) customElements.define(tag, cls);
}
var NARROW_PX = 720;
var TOGGLE = "flex size-9 flex-none cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent text-text hover:bg-control-hover focus-visible:outline-2 focus-visible:outline-accent";
var ITEM = "relative my-0.5 flex h-11 w-full cursor-pointer items-center rounded-sm border-0 bg-transparent p-0 text-left text-body transition-colors duration-fast ease-tessel hover:bg-control-hover hover:text-text focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent aria-disabled:pointer-events-none aria-disabled:opacity-45";
var TesselNavView = class extends TesselElement {
  static styles = `:host{display:block;height:100%;}
    ::slotted(tsl-nav-page:not([hidden])){display:block;animation:tsl-page-in var(--tsl-duration-slow) var(--tsl-ease);}`;
  static observedAttributes = ["app-title", "value", "compact"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) {
      this._readChildren();
      return;
    }
    this._built = true;
    this._toggle = h("button", TOGGLE, { type: "button", "aria-label": "Toggle navigation pane" }, createIcon("global-nav", 18));
    this._toggle.addEventListener("click", () => {
      if (this._narrow) this._setDrawer(!this._drawerOpen);
      else this.toggleAttribute("compact");
    });
    this._titleEl = h("span", "min-w-0 flex-1 truncate text-body font-semibold text-text");
    const topbar = h(
      "div",
      "flex h-[52px] flex-none items-center gap-3 px-2",
      null,
      this._toggle,
      this._titleEl,
      h("span", "flex flex-none items-center gap-1", null, h("slot", "", { name: "topbar-actions" }))
    );
    this._items = h("div", "flex flex-1 flex-col gap-0.5");
    this._footerItems = h("div", "mt-auto flex flex-col gap-0.5 pt-2");
    this._indicator = h("div", "pointer-events-none absolute left-2 top-0 h-4 w-[3px] rounded-[1.5px] bg-accent opacity-0 transition-[transform,opacity] duration-base ease-tessel");
    this._pane = h(
      "nav",
      "",
      { "aria-label": "Navigation" },
      h("div", "px-2 pb-2 pt-1", null, h("slot", "", { name: "pane-header" })),
      this._items,
      this._footerItems,
      this._indicator
    );
    this._scrim = h("div", "absolute inset-0 z-10 bg-overlay", { hidden: true });
    this._scrim.addEventListener("click", () => this._setDrawer(false));
    this._content = h("div", "", null, h("slot"));
    this._body = h("div", "relative flex min-h-0 flex-1 overflow-hidden", null, this._scrim, this._pane, this._content);
    this.shadowRoot.appendChild(h("div", "flex h-full flex-col bg-background", null, topbar, this._body));
    this._ro = new ResizeObserver(() => this._layout());
    this._ro.observe(this);
    this._mo = new MutationObserver(() => this._readChildren());
    this._mo.observe(this, { childList: true, characterData: true, subtree: true });
    this._layout();
    this._sync();
    this._readChildren();
  }
  disconnectedCallback() {
    this._mo?.disconnect();
    this._ro?.disconnect();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === "app-title") this._sync();
    if (name === "value") this._render();
    if (name === "compact") {
      this._layout();
      this._readChildren();
    }
  }
  _sync() {
    this._titleEl.textContent = this.getAttribute("app-title") || "";
  }
  get _compact() {
    return this.hasAttribute("compact") && !this._narrow;
  }
  _setDrawer(open) {
    this._drawerOpen = open;
    this._layout();
  }
  _layout() {
    this._narrow = this.clientWidth > 0 && this.clientWidth < NARROW_PX;
    if (!this._narrow) this._drawerOpen = false;
    const PANE = "flex flex-none flex-col overflow-y-auto overflow-x-hidden px-2 py-1";
    if (this._narrow) {
      this._pane.className = cx(
        PANE,
        "absolute inset-y-0 left-0 z-20 w-65 bg-background shadow-flyout transition-transform duration-slow ease-tessel",
        this._drawerOpen ? "translate-x-0" : "-translate-x-full invisible"
      );
    } else {
      this._pane.className = cx(PANE, "relative transition-[width] duration-slow ease-tessel", this._compact ? "w-14" : "w-65");
    }
    this._scrim.hidden = !(this._narrow && this._drawerOpen);
    this._content.className = cx(
      "min-w-0 flex-1 overflow-auto border border-border bg-surface p-6",
      this._narrow ? "rounded-none border-x-0" : "rounded-tl-lg"
    );
    this._toggle.setAttribute("aria-expanded", String(this._narrow ? this._drawerOpen : !this._compact));
    this._moveIndicator(this._currentBtn, true);
  }
  _paneChildren() {
    return Array.from(this.children).filter((c) => c instanceof TesselNavItem || c instanceof TesselNavHeader);
  }
  _pages() {
    return Array.from(this.children).filter((c) => c instanceof TesselNavPage);
  }
  _readChildren() {
    const children = this._paneChildren();
    if (!this.hasAttribute("value")) {
      const first = children.find((c) => c instanceof TesselNavItem && c.hasAttribute("selected")) || children.find((c) => c instanceof TesselNavItem);
      if (first) this.setAttribute("value", first.value);
    }
    this._items.replaceChildren();
    this._footerItems.replaceChildren();
    for (const child of children) {
      const target = child instanceof TesselNavItem && child.footer ? this._footerItems : this._items;
      target.appendChild(this._buildRow(child));
    }
    this._render(true);
  }
  _buildRow(child) {
    if (child instanceof TesselNavHeader) {
      return this._compact ? h("div", "mx-1 my-2 h-px bg-border", { role: "separator" }) : h("div", "flex h-9 items-center overflow-hidden whitespace-nowrap px-3 text-caption font-semibold text-text-secondary", null, child.label);
    }
    const btn = h(
      "button",
      ITEM,
      {
        type: "button",
        title: this._compact ? child.label : null,
        "data-value": child.value,
        "aria-disabled": child.hasAttribute("disabled") ? "true" : null
      },
      h("span", "flex w-10 flex-none items-center justify-center", null, child.icon ? createIcon(child.icon, 20) : null),
      !this._compact && h("span", "min-w-0 flex-1 truncate", null, child.label)
    );
    btn.addEventListener("click", () => {
      if (child.hasAttribute("disabled")) return;
      this.value = child.value;
      this.emit("change", { value: child.value });
      if (this._narrow) this._setDrawer(false);
    });
    return btn;
  }
  _render(skipAnimation = false) {
    const value = this.getAttribute("value");
    this._currentBtn = null;
    for (const row of this._pane.querySelectorAll("button[data-value]")) {
      const isCurrent = row.dataset.value === value;
      row.setAttribute("aria-current", isCurrent ? "page" : "false");
      row.classList.toggle("bg-subtle", isCurrent);
      row.classList.toggle("text-text", isCurrent);
      row.classList.toggle("text-text-secondary", !isCurrent);
      if (isCurrent) this._currentBtn = row;
    }
    for (const page of this._pages()) {
      const shouldShow = page.value === value;
      if (shouldShow && !this._everShownPage) {
        page.style.animation = "none";
        page.hidden = false;
        page.getBoundingClientRect();
        page.style.animation = "";
      } else {
        page.hidden = !shouldShow;
      }
    }
    this._everShownPage = true;
    this._moveIndicator(this._currentBtn, skipAnimation);
  }
  _moveIndicator(btn, skipAnimation) {
    const indicator = this._indicator;
    if (!btn || !btn.offsetHeight) {
      indicator.style.opacity = "0";
      return;
    }
    indicator.style.transition = skipAnimation ? "none" : "";
    indicator.style.transform = `translateY(${btn.offsetTop + (btn.offsetHeight - 16) / 2}px)`;
    indicator.style.opacity = "1";
    if (skipAnimation) {
      indicator.getBoundingClientRect();
      indicator.style.transition = "";
    }
  }
  get value() {
    return this.getAttribute("value") || "";
  }
  set value(v) {
    this.setAttribute("value", v);
  }
};
define("tsl-nav-view", TesselNavView);

// src/components/text.js
var VARIANTS2 = {
  display: "text-display font-semibold text-text",
  title: "text-title font-semibold text-text",
  subtitle: "text-subtitle font-semibold text-text",
  header: "text-header font-semibold text-text",
  "body-strong": "text-body font-semibold text-text",
  body: "text-body font-normal text-text",
  secondary: "text-body font-normal text-text-secondary",
  caption: "text-caption font-normal text-text-secondary",
  code: "font-mono text-code font-normal text-text"
};
var TesselText = class extends TesselElement {
  static styles = ":host{display:block;}";
  static observedAttributes = ["variant"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._body = h("div", "", null, h("slot"));
    this.shadowRoot.appendChild(this._body);
    this._sync();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    this._body.className = cx("wrap-break-word", VARIANTS2[this.getAttribute("variant")] || VARIANTS2.body);
  }
};
define("tsl-text", TesselText);

// src/components/theme-toggle.js
var BUTTON = "flex size-8 cursor-pointer items-center justify-center rounded-sm bg-transparent p-0 text-text-secondary transition-colors duration-fast ease-tessel hover:bg-control-hover hover:text-text active:bg-control-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
var TesselThemeToggle = class extends TesselElement {
  static styles = ":host{display:inline-flex;}";
  connectedCallback() {
    super.connectedCallback();
    if (!this._built) {
      this._built = true;
      this._button = h("button", BUTTON, { type: "button" });
      this.shadowRoot.appendChild(this._button);
      this._button.addEventListener("click", () => {
        setTheme(isDark() ? TesselTheme.LIGHT : TesselTheme.DARK);
      });
    }
    this._unsubscribe = addThemeListener(() => this._sync());
    this._sync();
  }
  disconnectedCallback() {
    this._unsubscribe?.();
  }
  _sync() {
    const dark = isDark();
    this._button.replaceChildren(createIcon(dark ? "brightness" : "quiet-hours", 18));
    const label2 = dark ? "Switch to light theme" : "Switch to dark theme";
    this._button.setAttribute("aria-label", label2);
    this._button.title = label2;
  }
};
define("tsl-theme-toggle", TesselThemeToggle);

// src/components/buttons.js
var FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
var DISABLED = "host-[disabled]:pointer-events-none host-[disabled]:opacity-45";
var TOGGLE2 = `inline-flex h-8 cursor-pointer select-none items-center justify-center gap-2 rounded-md border px-3.5 text-body font-medium transition-colors duration-fast ease-tessel ${FOCUS} ${DISABLED}`;
var TOGGLE_OFF = "border-border bg-control text-text hover:bg-control-hover active:bg-control-pressed";
var TOGGLE_ON = "border-accent bg-accent text-on-accent hover:border-accent-hover hover:bg-accent-hover active:bg-accent-pressed";
var TesselToggleButton = class extends TesselElement {
  static styles = ":host{display:inline-flex;vertical-align:middle;}";
  static observedAttributes = ["checked", "disabled", "icon"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._icon = h("span", "inline-flex flex-none");
    this._button = h("button", TOGGLE2, { type: "button", "aria-pressed": "false" }, this._icon, h("slot"));
    this.shadowRoot.appendChild(this._button);
    this._button.addEventListener("click", () => {
      this.checked = !this.checked;
      this.emit("change", { checked: this.checked });
    });
    this._sync();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    const icon = this.getAttribute("icon");
    this._icon.replaceChildren(...icon ? [createIcon(icon, 16)] : []);
    this._icon.hidden = !icon;
    this._button.className = cx(TOGGLE2, this.checked ? TOGGLE_ON : TOGGLE_OFF);
    this._button.setAttribute("aria-pressed", String(this.checked));
    this._button.disabled = this.disabled;
  }
  get checked() {
    return this.hasAttribute("checked");
  }
  set checked(v) {
    this.toggleAttribute("checked", !!v);
  }
};
var SHELL = "inline-flex h-8 select-none items-stretch overflow-hidden rounded-md border transition-colors duration-fast ease-tessel";
var PART = `flex cursor-pointer items-center justify-center gap-2 border-0 bg-transparent text-body font-medium text-current transition-colors duration-fast ease-tessel focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent`;
var LOOKS = {
  standard: { shell: "border-border bg-control text-text", part: "hover:bg-control-hover active:bg-control-pressed", divider: "bg-border" },
  accent: { shell: "border-accent bg-accent text-on-accent", part: "hover:bg-accent-hover active:bg-accent-pressed", divider: "bg-on-accent/30" }
};
var TesselMenuButtonBase = class extends TesselElement {
  static styles = ":host{display:inline-flex;vertical-align:middle;}";
  static observedAttributes = ["label", "icon", "variant", "disabled", "checked", "open"];
  /** 'dropdown' = one button that opens the menu, 'split' = action part + chevron part. */
  static kind = "split";
  static toggling = false;
  connectedCallback() {
    super.connectedCallback();
    if (this._built) {
      this._menu.refresh();
      return;
    }
    this._built = true;
    const { kind } = this.constructor;
    this._icon = h("span", "inline-flex flex-none");
    this._label = h("span");
    this._chevron = html("span", "flex flex-none transition-transform duration-fast ease-tessel", chevronSvg("down", 12));
    this._divider = h("span", "my-1.5 w-px flex-none");
    if (kind === "dropdown") {
      this._main = h("button", `${PART} px-3.5`, { type: "button", "aria-haspopup": "menu", "aria-expanded": "false" }, this._icon, this._label, this._chevron);
      this._shell = h("div", SHELL, null, this._main);
      this._arrow = this._main;
    } else {
      this._main = h("button", `${PART} pl-3.5 pr-3`, { type: "button" }, this._icon, this._label);
      this._arrow = h("button", `${PART} w-8`, { type: "button", "aria-haspopup": "menu", "aria-expanded": "false", "aria-label": "More options" }, this._chevron);
      this._shell = h("div", SHELL, null, this._main, this._divider, this._arrow);
    }
    this.shadowRoot.appendChild(this._shell);
    this._menu = createMenu(this, {
      anchor: () => this._shell,
      onSelect: (child) => this.emit("select", { value: child.value }),
      onToggle: (child) => this.emit("change", { value: child.value, checked: child.checked, source: "menu" }),
      onOpenChange: (open) => {
        this.toggleAttribute("open", open);
        this._arrow.setAttribute("aria-expanded", String(open));
        this._chevron.classList.toggle("rotate-180", open);
      }
    });
    this.shadowRoot.appendChild(this._menu.popup);
    this._arrow.addEventListener("click", (e) => {
      if (kind === "split") e.stopPropagation();
      if (this.disabled) return;
      if (this._menu.isOpen) this._menu.close();
      else this._menu.open();
    });
    if (kind === "split") {
      this._main.addEventListener("click", () => {
        if (this.constructor.toggling) {
          this.checked = !this.checked;
          this.emit("change", { checked: this.checked, source: "button" });
        }
      });
    }
    this._mo = new MutationObserver(() => this._menu.refresh());
    this._mo.observe(this, { childList: true, characterData: true, subtree: true });
    this._sync();
    this._menu.refresh();
  }
  disconnectedCallback() {
    this._mo?.disconnect();
    this._menu?.close();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    const label2 = this.getAttribute("label") ?? "";
    const icon = this.getAttribute("icon");
    const accent2 = this.getAttribute("variant") === "accent" || this.constructor.toggling && this.checked;
    const look = accent2 ? LOOKS.accent : LOOKS.standard;
    this._label.textContent = label2;
    this._label.hidden = !label2;
    this._icon.replaceChildren(...icon ? [createIcon(icon, 16)] : []);
    this._icon.hidden = !icon;
    this._shell.className = cx(SHELL, look.shell, this.disabled && "pointer-events-none opacity-45");
    this._divider.className = cx("my-1.5 w-px flex-none", look.divider);
    for (const part of [this._main, this._arrow]) {
      part.className = cx(PART, look.part, part === this._arrow && this.constructor.kind === "split" ? "w-8" : this.constructor.kind === "split" ? "pl-3.5 pr-3" : "px-3.5");
      part.disabled = this.disabled;
    }
    if (this.constructor.toggling) this._main.setAttribute("aria-pressed", String(this.checked));
  }
  get checked() {
    return this.hasAttribute("checked");
  }
  set checked(v) {
    this.toggleAttribute("checked", !!v);
  }
  get open() {
    return this.hasAttribute("open");
  }
};
var TesselDropDownButton = class extends TesselMenuButtonBase {
  static kind = "dropdown";
};
var TesselSplitButton = class extends TesselMenuButtonBase {
  static kind = "split";
};
var TesselToggleSplitButton = class extends TesselMenuButtonBase {
  static kind = "split";
  static toggling = true;
};
var CHIP = `inline-flex min-h-7 select-none items-center gap-1.5 rounded-pill border px-3 text-[13px] transition-colors duration-fast ease-tessel ${FOCUS} ${DISABLED}`;
var CHIP_IDLE = "border-border bg-control text-text";
var CHIP_HOVER = "hover:bg-control-hover active:bg-control-pressed";
var CHIP_ON = "border-accent bg-accent-subtle text-accent";
var TesselChip = class extends TesselElement {
  static styles = ":host{display:inline-flex;vertical-align:middle;}";
  static observedAttributes = ["icon", "removable", "selectable", "checked", "disabled"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._icon = h("span", "inline-flex flex-none");
    this._remove = html("button", "ml-0.5 -mr-1.5 flex size-[18px] flex-none cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-current opacity-70 hover:bg-control-hover hover:opacity-100", closeSvg(8));
    this._remove.type = "button";
    this._remove.setAttribute("aria-label", "Remove");
    this._root = h("div", CHIP, { tabindex: "0" }, this._icon, h("slot"), this._remove);
    this.shadowRoot.appendChild(this._root);
    this._root.addEventListener("click", (e) => {
      if (this.disabled || e.composedPath().includes(this._remove) || !this.hasAttribute("selectable")) return;
      this.checked = !this.checked;
      this.emit("change", { checked: this.checked });
    });
    this._root.addEventListener("keydown", (e) => {
      if (e.target !== this._root) return;
      if ((e.key === " " || e.key === "Enter") && this.hasAttribute("selectable")) {
        e.preventDefault();
        this._root.click();
      }
      if ((e.key === "Delete" || e.key === "Backspace") && this.hasAttribute("removable")) this._remove.click();
    });
    this._remove.addEventListener("click", () => {
      if (this.disabled) return;
      if (this.emit("remove", {})) this.remove();
    });
    this._sync();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    const icon = this.getAttribute("icon");
    const selectable = this.hasAttribute("selectable");
    this._icon.replaceChildren(...icon ? [createIcon(icon, 14)] : []);
    this._icon.hidden = !icon;
    this._remove.hidden = !this.hasAttribute("removable");
    this._root.className = cx(CHIP, selectable && this.checked ? CHIP_ON : CHIP_IDLE, selectable && "cursor-pointer", (selectable || this.hasAttribute("removable")) && !(selectable && this.checked) && CHIP_HOVER);
    if (selectable) this._root.setAttribute("aria-pressed", String(this.checked));
    else this._root.removeAttribute("aria-pressed");
  }
  get checked() {
    return this.hasAttribute("checked");
  }
  set checked(v) {
    this.toggleAttribute("checked", !!v);
  }
};
define("tsl-toggle-button", TesselToggleButton);
define("tsl-dropdown-button", TesselDropDownButton);
define("tsl-split-button", TesselSplitButton);
define("tsl-toggle-split-button", TesselToggleSplitButton);
define("tsl-chip", TesselChip);

// src/components/segmented.js
var TesselSegment = class extends HTMLElement {
  connectedCallback() {
    this.hidden = true;
  }
  get value() {
    return this.getAttribute("value") ?? this.textContent.trim();
  }
  get label() {
    return this.textContent.trim();
  }
};
if (!customElements.get("tsl-segment")) customElements.define("tsl-segment", TesselSegment);
var TRACK4 = "inline-flex gap-0.5 rounded-lg bg-subtle p-0.5 host-[disabled]:pointer-events-none host-[disabled]:opacity-45";
var SEGMENT = "inline-flex min-h-[30px] min-w-[72px] cursor-pointer items-center justify-center gap-2 rounded-md border-0 px-3.5 text-body transition-colors duration-fast ease-tessel focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent aria-disabled:pointer-events-none aria-disabled:opacity-45";
var SEGMENT_ON = "bg-surface font-medium text-text shadow-sm";
var SEGMENT_OFF = "bg-transparent text-text-secondary hover:bg-control-hover hover:text-text";
var TesselSegmented = class extends TesselElement {
  static styles = ":host{display:inline-flex;}";
  static observedAttributes = ["value", "disabled"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) {
      this._read();
      return;
    }
    this._built = true;
    this._track = h("div", TRACK4, { role: "radiogroup" });
    this.shadowRoot.appendChild(this._track);
    this._track.addEventListener("keydown", (e) => this._onKeydown(e));
    this._mo = new MutationObserver(() => this._read());
    this._mo.observe(this, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["disabled", "icon", "value"] });
    this._read();
  }
  disconnectedCallback() {
    this._mo?.disconnect();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._render();
  }
  _segments() {
    return Array.from(this.children).filter((c) => c instanceof TesselSegment);
  }
  _read() {
    const segments = this._segments();
    if (!this.hasAttribute("value") && segments[0]) this.setAttribute("value", segments[0].value);
    this._track.replaceChildren(...segments.map((seg) => {
      const icon = seg.getAttribute("icon");
      const btn = h(
        "button",
        SEGMENT,
        { type: "button", role: "radio", "aria-disabled": seg.hasAttribute("disabled") ? "true" : null },
        icon && createIcon(icon, 16),
        seg.label
      );
      btn.addEventListener("click", () => {
        if (seg.hasAttribute("disabled") || this.disabled || this.value === seg.value) return;
        this.value = seg.value;
        this.emit("change", { value: seg.value });
      });
      return btn;
    }));
    this._render();
  }
  _render() {
    const value = this.getAttribute("value");
    const segments = this._segments();
    Array.from(this._track.children).forEach((btn, i) => {
      const on = segments[i]?.value === value;
      btn.className = cx(SEGMENT, on ? SEGMENT_ON : SEGMENT_OFF);
      btn.setAttribute("aria-checked", String(on));
      btn.tabIndex = on ? 0 : -1;
    });
  }
  _onKeydown(e) {
    const buttons = Array.from(this._track.children).filter((b) => b.getAttribute("aria-disabled") !== "true");
    const at = buttons.indexOf(this.shadowRoot.activeElement);
    const to = { ArrowRight: at + 1, ArrowDown: at + 1, ArrowLeft: at - 1, ArrowUp: at - 1, Home: 0, End: buttons.length - 1 }[e.key];
    if (to == null || !buttons.length) return;
    e.preventDefault();
    const btn = buttons[(to + buttons.length) % buttons.length];
    btn.focus();
    btn.click();
  }
  get value() {
    return this.getAttribute("value") || "";
  }
  set value(v) {
    this.setAttribute("value", v);
  }
};
define("tsl-segmented", TesselSegmented);

// src/components/tab-view.js
var TesselTabViewItem = class extends HTMLElement {
  get value() {
    return this.getAttribute("value") ?? this.getAttribute("header") ?? "";
  }
  set value(v) {
    this.setAttribute("value", v);
  }
  get header() {
    return this.getAttribute("header") ?? "";
  }
  get pinned() {
    return this.hasAttribute("pinned");
  }
};
if (!customElements.get("tsl-tab-view-item")) customElements.define("tsl-tab-view-item", TesselTabViewItem);
var STRIP2 = "flex min-w-0 items-end gap-0.5 overflow-x-auto overflow-y-hidden scrollbar-none";
var TAB2 = "group relative flex h-9 max-w-52 min-w-24 flex-none cursor-pointer select-none items-center gap-2 rounded-t-lg border border-b-0 pl-3 pr-1.5 text-body transition-colors duration-fast ease-tessel focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent";
var TAB_ON = "border-border bg-surface text-text";
var TAB_OFF = "border-transparent bg-transparent text-text-secondary hover:bg-control-hover hover:text-text";
var CLOSE2 = "flex size-5 flex-none cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 text-current transition-opacity duration-fast hover:bg-control-pressed";
var ADD = "mb-1 ml-1 flex size-7 flex-none cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 text-text-secondary hover:bg-control-hover hover:text-text focus-visible:outline-2 focus-visible:outline-accent";
var TesselTabView = class extends TesselElement {
  static styles = ":host{display:block;} ::slotted(tsl-tab-view-item:not([hidden])){display:block;}";
  static observedAttributes = ["value", "addable", "reorderable"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) {
      this._read();
      return;
    }
    this._built = true;
    this._strip = h("div", STRIP2, { role: "tablist" });
    this._add = h("button", ADD, { type: "button", "aria-label": "Add tab" }, createIcon("add", 16));
    this._add.addEventListener("click", () => this.emit("add-tab-click", {}));
    this._footer = h("slot", "flex-none", { name: "footer" });
    const bar = h(
      "div",
      "flex items-end border-b border-border px-1 pt-1",
      null,
      this._strip,
      this._add,
      h("div", "flex-1"),
      this._footer
    );
    this.shadowRoot.append(bar, h("div", "rounded-b-lg border border-t-0 border-border bg-surface p-4", null, h("slot")));
    this._strip.addEventListener("keydown", (e) => this._onKeydown(e));
    this._mo = new MutationObserver(() => this._read());
    this._mo.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ["header", "icon", "pinned"] });
    this._read();
  }
  disconnectedCallback() {
    this._mo?.disconnect();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === "value") this._render();
    else this._read();
  }
  _items() {
    return Array.from(this.children).filter((c) => c instanceof TesselTabViewItem);
  }
  _read() {
    const items = this._items();
    if (!items.some((i) => i.value === this.getAttribute("value")) && items[0]) this.setAttribute("value", items[0].value);
    this._add.hidden = !this.hasAttribute("addable");
    this._strip.replaceChildren(...items.map((item) => this._buildTab(item)));
    this._render();
  }
  _buildTab(item) {
    const icon = item.getAttribute("icon");
    const close = html("button", CLOSE2, closeSvg(10));
    close.type = "button";
    close.tabIndex = -1;
    close.setAttribute("aria-label", `Close ${item.header}`);
    close.hidden = item.pinned;
    const tab = h(
      "div",
      TAB2,
      { role: "tab", draggable: this.hasAttribute("reorderable") ? "true" : null, title: item.header },
      icon && h("span", "flex flex-none", null, createIcon(icon, 16)),
      h("span", "min-w-0 flex-1 truncate", null, item.header),
      close
    );
    tab.addEventListener("click", (e) => {
      if (e.composedPath().includes(close)) return;
      this._select(item);
    });
    tab.addEventListener("auxclick", (e) => {
      if (e.button === 1 && !item.pinned) this._requestClose(item);
    });
    close.addEventListener("click", () => this._requestClose(item));
    if (this.hasAttribute("reorderable")) {
      tab.addEventListener("dragstart", (e) => {
        this._dragging = item;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", item.value);
      });
      tab.addEventListener("dragover", (e) => {
        if (this._dragging && this._dragging !== item) {
          e.preventDefault();
          tab.classList.add("bg-control-hover");
        }
      });
      tab.addEventListener("dragleave", () => tab.classList.remove("bg-control-hover"));
      tab.addEventListener("drop", (e) => {
        e.preventDefault();
        const from = this._dragging;
        this._dragging = null;
        if (!from || from === item) return;
        const before = from.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING;
        this.insertBefore(from, before ? item.nextElementSibling : item);
        this.emit("tabs-reordered", { value: from.value, index: this._items().indexOf(from) });
      });
      tab.addEventListener("dragend", () => {
        this._dragging = null;
      });
    }
    tab._item = item;
    return tab;
  }
  _select(item) {
    if (item.value === this.getAttribute("value")) return;
    this.setAttribute("value", item.value);
    this.emit("change", { value: item.value });
  }
  _requestClose(item) {
    if (!this.emit("tab-close-requested", { value: item.value, item })) return;
    const items = this._items();
    const at = items.indexOf(item);
    const wasCurrent = item.value === this.getAttribute("value");
    item.remove();
    if (wasCurrent) {
      const next = items[at + 1] || items[at - 1];
      if (next) this._select(next);
    }
  }
  _render() {
    const value = this.getAttribute("value");
    for (const tab of this._strip.children) {
      const on = tab._item.value === value;
      tab.className = cx(TAB2, on ? TAB_ON : TAB_OFF);
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
      tab.lastElementChild.classList.toggle("opacity-0", !on);
      tab.lastElementChild.classList.toggle("group-hover:opacity-100", !on);
      if (on) tab.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    }
    for (const item of this._items()) {
      item.hidden = item.value !== value;
      item.setAttribute("role", "tabpanel");
    }
  }
  _onKeydown(e) {
    const tabs = Array.from(this._strip.children);
    const at = tabs.indexOf(this.shadowRoot.activeElement);
    const to = { ArrowRight: at + 1, ArrowLeft: at - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (to != null && tabs.length) {
      e.preventDefault();
      const tab = tabs[(to + tabs.length) % tabs.length];
      tab.focus();
      this._select(tab._item);
    } else if (e.key === "Delete" && at >= 0 && !tabs[at]._item.pinned) {
      this._requestClose(tabs[at]._item);
    }
  }
  /** Adds a tab and selects it. Returns the new <tsl-tab-view-item>. */
  addTab({ header = "New tab", value = `tab-${Date.now()}`, icon, pinned = false, content = "" } = {}) {
    const item = document.createElement("tsl-tab-view-item");
    item.setAttribute("value", value);
    item.setAttribute("header", header);
    if (icon) item.setAttribute("icon", icon);
    if (pinned) item.setAttribute("pinned", "");
    if (content instanceof Node) item.append(content);
    else item.textContent = content;
    this.append(item);
    this._select(item);
    return item;
  }
  get value() {
    return this.getAttribute("value") || "";
  }
  set value(v) {
    this.setAttribute("value", v);
  }
};
define("tsl-tab-view", TesselTabView);

// src/components/wayfinding.js
var TesselBreadcrumbItem = class extends HTMLElement {
  connectedCallback() {
    this.hidden = true;
  }
  get value() {
    return this.getAttribute("value") ?? this.textContent.trim();
  }
  get label() {
    return this.textContent.trim();
  }
};
if (!customElements.get("tsl-breadcrumb-item")) customElements.define("tsl-breadcrumb-item", TesselBreadcrumbItem);
var CRUMB = "cursor-pointer rounded-sm border-0 bg-transparent px-1.5 py-1 text-body text-text-secondary transition-colors duration-fast ease-tessel hover:bg-control-hover hover:text-text active:bg-control-pressed focus-visible:outline-2 focus-visible:outline-accent";
var TesselBreadcrumb = class extends TesselElement {
  static styles = ":host{display:block;}";
  connectedCallback() {
    super.connectedCallback();
    if (this._built) {
      this._read();
      return;
    }
    this._built = true;
    this._nav = h("nav", "flex flex-wrap items-center gap-0.5", { "aria-label": "Breadcrumb" });
    this.shadowRoot.appendChild(this._nav);
    this._mo = new MutationObserver(() => this._read());
    this._mo.observe(this, { childList: true, characterData: true, subtree: true });
    this._read();
  }
  disconnectedCallback() {
    this._mo?.disconnect();
  }
  _read() {
    const items = Array.from(this.children).filter((c) => c instanceof TesselBreadcrumbItem);
    this._nav.replaceChildren(...items.flatMap((item, index) => {
      const last = index === items.length - 1;
      const crumb = last ? h("span", "px-1.5 py-1 text-body font-semibold text-text", { "aria-current": "page" }, item.label) : h("button", CRUMB, { type: "button" }, item.label);
      if (!last) crumb.addEventListener("click", () => this.emit("item-click", { index, value: item.value, label: item.label }));
      return [crumb, !last && html("span", "flex text-text-tertiary", chevronSvg("right", 10))];
    }));
  }
};
var PAGE = "flex h-[34px] min-w-[34px] cursor-pointer items-center justify-center rounded-md border px-2 text-body transition-colors duration-fast ease-tessel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-45";
var PAGE_IDLE = "border-transparent bg-transparent text-text hover:bg-control-hover active:bg-control-pressed";
var PAGE_ON = "border-accent bg-accent font-medium text-on-accent";
function pageWindow(page, count, maxVisible) {
  const total = Math.max(5, maxVisible);
  if (count <= total) return Array.from({ length: count }, (_, i) => i + 1);
  const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const sibling = Math.floor((total - 5) / 2);
  if (page <= 3 + sibling) return [...range(1, total - 2), null, count];
  if (page >= count - 2 - sibling) return [1, null, ...range(count - (total - 3), count)];
  return [1, null, ...range(page - sibling, page + sibling), null, count];
}
var TesselPagination = class extends TesselElement {
  static styles = ":host{display:inline-block;}";
  static observedAttributes = ["page", "count", "max-visible"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._nav = h("nav", "flex items-center gap-1", { "aria-label": "Pagination" });
    this.shadowRoot.appendChild(this._nav);
    this._render();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._render();
  }
  get count() {
    return Math.max(1, Number(this.getAttribute("count")) || 1);
  }
  get page() {
    return Math.min(this.count, Math.max(1, Number(this.getAttribute("page")) || 1));
  }
  set page(v) {
    this.setAttribute("page", String(v));
  }
  set count(v) {
    this.setAttribute("count", String(v));
  }
  _go(page) {
    const next = Math.min(this.count, Math.max(1, page));
    if (next === this.page) return;
    this.page = next;
    this.emit("change", { page: next });
  }
  _render() {
    const { page, count } = this;
    const button = (content, label2, onClick, { on = false, disabled = false } = {}) => {
      const b = h("button", cx(PAGE, on ? PAGE_ON : PAGE_IDLE), { type: "button", "aria-label": label2, "aria-current": on ? "page" : null, disabled }, content);
      b.addEventListener("click", onClick);
      return b;
    };
    const arrow = (dir) => html("span", "flex", chevronSvg(dir, 14));
    this._nav.replaceChildren(
      button(arrow("left"), "Previous page", () => this._go(page - 1), { disabled: page <= 1 }),
      ...pageWindow(page, count, Number(this.getAttribute("max-visible")) || 7).map((p) => p === null ? h("span", "flex h-[34px] min-w-6 items-center justify-center text-text-tertiary", null, "\u2026") : button(String(p), `Page ${p}`, () => this._go(p), { on: p === page })),
      button(arrow("right"), "Next page", () => this._go(page + 1), { disabled: page >= count })
    );
  }
};
var TesselStep = class extends HTMLElement {
  connectedCallback() {
    this.hidden = true;
  }
  get header() {
    return this.getAttribute("header") ?? "";
  }
  get description() {
    return this.getAttribute("description") ?? "";
  }
  get error() {
    return this.hasAttribute("error");
  }
};
if (!customElements.get("tsl-step")) customElements.define("tsl-step", TesselStep);
var DOT3 = "flex size-7 flex-none items-center justify-center rounded-full border-2 text-caption font-semibold transition-colors duration-base ease-tessel";
var STATE = {
  completed: "border-accent bg-accent text-on-accent",
  current: "border-accent bg-accent-subtle text-accent",
  pending: "border-border-strong bg-transparent text-text-tertiary",
  error: "border-danger bg-danger text-white"
};
var TesselStepper = class extends TesselElement {
  static styles = ":host{display:block;}";
  static observedAttributes = ["current", "orientation"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) {
      this._read();
      return;
    }
    this._built = true;
    this._root = h("ol", "", { role: "list" });
    this.shadowRoot.appendChild(this._root);
    this._mo = new MutationObserver(() => this._read());
    this._mo.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ["header", "description", "error"] });
    this._read();
  }
  disconnectedCallback() {
    this._mo?.disconnect();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._read();
  }
  get current() {
    return Number(this.getAttribute("current")) || 0;
  }
  set current(v) {
    this.setAttribute("current", String(v));
  }
  /** Step state, computed from `current` (0-based) and each step's `error` flag. */
  stateOf(index, step) {
    if (step.error) return "error";
    if (index < this.current) return "completed";
    return index === this.current ? "current" : "pending";
  }
  _read() {
    const steps = Array.from(this.children).filter((c) => c instanceof TesselStep);
    const vertical = this.getAttribute("orientation") === "vertical";
    this._root.className = vertical ? "flex flex-col" : "flex items-start";
    this._root.replaceChildren(...steps.map((step, i) => {
      const state2 = this.stateOf(i, step);
      const last = i === steps.length - 1;
      const glyph = state2 === "completed" ? html("span", "flex", checkmarkSvg(14, 2.4)) : state2 === "error" ? html("span", "flex", closeSvg(11)) : String(i + 1);
      const dot = h("span", cx(DOT3, STATE[state2]), { "aria-hidden": "true" }, glyph);
      const text = h(
        "div",
        "min-w-0",
        null,
        h("div", cx("text-body", state2 === "pending" ? "text-text-secondary" : "font-medium text-text", state2 === "error" && "text-danger"), null, step.header),
        step.description && h("div", "text-caption text-text-tertiary", null, step.description)
      );
      const line = (cls) => h("span", cx("transition-colors duration-base", i < this.current && !step.error ? "bg-accent" : "bg-border-strong", cls), { "aria-hidden": "true" });
      const item = vertical ? h(
        "li",
        "flex gap-3",
        null,
        h("div", "flex flex-col items-center", null, dot, !last && line("my-1 w-0.5 flex-1 min-h-6")),
        h("div", cx("pt-0.5", !last && "pb-5"), null, text)
      ) : h(
        "li",
        cx("flex items-start gap-2.5", !last && "flex-1"),
        null,
        dot,
        h("div", "pt-0.5", null, text),
        !last && line("mx-3 mt-3.5 h-0.5 flex-1 min-w-6")
      );
      if (state2 === "current") item.setAttribute("aria-current", "step");
      return item;
    }));
  }
};
define("tsl-breadcrumb", TesselBreadcrumb);
define("tsl-pagination", TesselPagination);
define("tsl-stepper", TesselStepper);

// src/components/timeline.js
var KINDS = {
  neutral: { marker: "bg-text-tertiary text-surface", dot: "bg-text-tertiary ring-subtle", hollow: "border-text-tertiary text-text-tertiary" },
  accent: { marker: "bg-accent text-on-accent", dot: "bg-accent ring-accent-subtle", hollow: "border-accent text-accent" },
  success: { marker: "bg-success text-surface", dot: "bg-success ring-success-subtle", hollow: "border-success text-success" },
  warning: { marker: "bg-warning text-surface", dot: "bg-warning ring-warning-subtle", hollow: "border-warning text-warning" },
  danger: { marker: "bg-danger text-white", dot: "bg-danger ring-danger-subtle", hollow: "border-danger text-danger" },
  info: { marker: "bg-info text-surface", dot: "bg-info ring-info-subtle", hollow: "border-info text-info" }
};
var TesselTimelineItem = class extends TesselElement {
  static styles = ":host{display:block;}";
  static observedAttributes = ["header", "timestamp", "icon", "kind", "pending", "tl-orientation", "tl-layout", "tl-side", "tl-first", "tl-last"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._root = h("div");
    this.shadowRoot.appendChild(this._root);
    this._sync();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  /** Natural width of the timestamp text — the timeline uses the widest one for every item's column. */
  get timestampWidth() {
    return this._stamp?.firstElementChild?.offsetWidth ?? 0;
  }
  _marker() {
    const kind = KINDS[this.getAttribute("kind")] || KINDS.accent;
    const icon = this.getAttribute("icon");
    if (this.hasAttribute("pending")) {
      return h("span", cx("flex size-6 flex-none items-center justify-center rounded-full border-2 border-dashed bg-surface opacity-60", kind.hollow), null, icon && createIcon(icon, 12));
    }
    if (icon) return h("span", cx("flex size-6 flex-none items-center justify-center rounded-full", kind.marker), null, createIcon(icon, 14));
    return h("span", "flex size-6 flex-none items-center justify-center", null, h("span", cx("size-3 rounded-full ring-4", kind.dot)));
  }
  _line(vertical) {
    const dashed = this.hasAttribute("pending");
    return h("span", cx("flex-1 bg-border-strong", vertical ? "w-0.5 min-h-4" : "h-0.5 min-w-4", dashed && "opacity-40"));
  }
  _sync() {
    const vertical = this.getAttribute("tl-orientation") !== "horizontal";
    const alternate = this.getAttribute("tl-layout") === "alternate";
    const side = this.getAttribute("tl-side") || "end";
    const first = this.hasAttribute("tl-first");
    const last = this.hasAttribute("tl-last");
    const header = this.getAttribute("header");
    const timestamp = this.getAttribute("timestamp");
    const pending = this.hasAttribute("pending");
    const tone = pending ? "text-text-secondary" : "text-text";
    this._stamp = timestamp ? h(
      "div",
      "flex-none pt-1 text-right text-caption text-text-secondary",
      { style: { width: "var(--tsl-tl-ts, auto)" } },
      h("span", "inline-block whitespace-nowrap", null, timestamp)
    ) : null;
    const text = (align) => h(
      "div",
      cx("min-w-0", align),
      null,
      header && h("div", cx("text-body font-semibold", tone), null, header),
      h("div", cx("text-body text-text-secondary", pending && "opacity-70"), null, h("slot"))
    );
    const stamp = (align) => timestamp && h("div", cx("whitespace-nowrap text-caption text-text-secondary", align), null, timestamp);
    let layout;
    if (vertical && !alternate) {
      layout = h(
        "div",
        "flex gap-4",
        null,
        this._stamp || h("div", "flex-none", { style: { width: "var(--tsl-tl-ts, 0px)" } }),
        h(
          "div",
          "flex flex-none flex-col items-center",
          null,
          h("span", cx("h-1 w-0.5 flex-none", first ? "bg-transparent" : "bg-border-strong")),
          this._marker(),
          last ? h("span", "flex-1") : this._line(true)
        ),
        h("div", cx("min-w-0 flex-1", last ? "" : "pb-6"), null, h("div", "pt-1", null, text("")))
      );
    } else if (vertical) {
      const textCol = h("div", cx("min-w-0", last ? "" : "pb-6"), null, h("div", "pt-1", null, text(side === "start" ? "text-right" : "")));
      const stampCol = h("div", cx("min-w-0 pt-1.5", side === "start" ? "text-left" : "text-right"), null, stamp(""));
      layout = h(
        "div",
        "grid grid-cols-[1fr_auto_1fr] gap-x-4",
        null,
        side === "start" ? textCol : stampCol,
        h(
          "div",
          "flex flex-col items-center",
          null,
          h("span", cx("h-1 w-0.5 flex-none", first ? "bg-transparent" : "bg-border-strong")),
          this._marker(),
          last ? h("span", "flex-1") : this._line(true)
        ),
        side === "start" ? stampCol : textCol
      );
    } else {
      const markerRow = h(
        "div",
        "flex items-center",
        null,
        h("span", cx("h-0.5 flex-1", first ? "bg-transparent" : "bg-border-strong")),
        this._marker(),
        last ? h("span", "flex-1") : this._line(false)
      );
      const body = h("div", "min-w-0 px-2", null, stamp("mb-0.5"), text(""));
      layout = alternate ? h(
        "div",
        "grid h-full grid-rows-[1fr_auto_1fr] gap-y-2",
        null,
        h("div", "flex flex-col justify-end", null, side === "start" && body),
        markerRow,
        h("div", "", null, side !== "start" && body)
      ) : h("div", "flex flex-col gap-2", null, markerRow, body);
    }
    this._root.className = vertical ? "" : "h-full";
    this._root.replaceChildren(layout);
  }
};
var TesselTimeline = class extends TesselElement {
  static styles = ":host{display:block;}";
  static observedAttributes = ["orientation", "layout", "item-width"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) {
      this._arrange();
      return;
    }
    this._built = true;
    this._scroller = h("div", "", null, h("slot"));
    this.shadowRoot.appendChild(this._scroller);
    this._scroller.addEventListener("wheel", (e) => {
      if (this.getAttribute("orientation") !== "horizontal" || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      this._scroller.scrollLeft += e.deltaY;
      e.preventDefault();
    }, { passive: false });
    this._mo = new MutationObserver(() => this._arrange());
    this._mo.observe(this, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["timestamp", "header"] });
    this._ro = new ResizeObserver(() => this._measure());
    this._ro.observe(this);
    this._arrange();
  }
  disconnectedCallback() {
    this._mo?.disconnect();
    this._ro?.disconnect();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._arrange();
  }
  _arrange() {
    const items = Array.from(this.children).filter((c) => c instanceof TesselTimelineItem);
    const horizontal = this.getAttribute("orientation") === "horizontal";
    const alternate = this.getAttribute("layout") === "alternate";
    const width = this.getAttribute("item-width");
    this._scroller.className = horizontal ? "flex items-stretch overflow-x-auto pb-2 scrollbar-thin" : "";
    items.forEach((item, i) => {
      item.setAttribute("tl-orientation", horizontal ? "horizontal" : "vertical");
      item.setAttribute("tl-layout", alternate ? "alternate" : "standard");
      item.setAttribute("tl-side", alternate && i % 2 === 0 ? "start" : "end");
      item.toggleAttribute("tl-first", i === 0);
      item.toggleAttribute("tl-last", i === items.length - 1);
      item.style.flex = horizontal ? "none" : "";
      item.style.width = horizontal && width !== "auto" ? `${Number(width) || 200}px` : "";
    });
    requestAnimationFrame(() => this._measure());
  }
  /** Shares the widest timestamp across the vertical column so every marker lines up. */
  _measure() {
    const items = Array.from(this.children).filter((c) => c instanceof TesselTimelineItem);
    const standard = this.getAttribute("orientation") !== "horizontal" && this.getAttribute("layout") !== "alternate";
    const widest = standard ? Math.max(0, ...items.map((i) => i.timestampWidth)) : 0;
    if (widest) this.style.setProperty("--tsl-tl-ts", `${widest}px`);
    else this.style.removeProperty("--tsl-tl-ts");
  }
};
define("tsl-timeline-item", TesselTimelineItem);
define("tsl-timeline", TesselTimeline);

// src/components/progress.js
var RADIUS2 = 13;
var CIRCUMFERENCE = 2 * Math.PI * RADIUS2;
var TesselProgressRing = class extends TesselElement {
  static styles = ":host{display:inline-flex;vertical-align:middle;}";
  static observedAttributes = ["value", "max", "size", "inactive"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._root = html("span", "inline-flex", `<svg viewBox="0 0 32 32" fill="none" class="size-full -rotate-90"><circle cx="16" cy="16" r="${RADIUS2}" stroke-width="3" class="stroke-border"/><circle cx="16" cy="16" r="${RADIUS2}" stroke-width="3" stroke-linecap="round" class="stroke-accent"/></svg>`);
    this._root.setAttribute("role", "progressbar");
    this._arc = this._root.querySelectorAll("circle")[1];
    this.shadowRoot.appendChild(this._root);
    this._sync();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    const size = Number(this.getAttribute("size")) || 32;
    const determinate = this.hasAttribute("value");
    const max = Number(this.getAttribute("max")) || 100;
    const value = Math.max(0, Math.min(max, Number(this.getAttribute("value")) || 0));
    this._root.style.width = `${size}px`;
    this._root.style.height = `${size}px`;
    this._root.hidden = this.hasAttribute("inactive");
    if (determinate) {
      this._arc.setAttribute("class", "stroke-accent transition-[stroke-dashoffset] duration-base ease-tessel");
      this._arc.setAttribute("stroke-dasharray", String(CIRCUMFERENCE));
      this._arc.setAttribute("stroke-dashoffset", String(CIRCUMFERENCE * (1 - value / max)));
      this._root.setAttribute("aria-valuenow", String(value));
      this._root.setAttribute("aria-valuemax", String(max));
    } else {
      this._arc.setAttribute("class", "stroke-accent animate-ring origin-center [transform-box:fill-box]");
      this._arc.removeAttribute("stroke-dashoffset");
      this._arc.removeAttribute("stroke-dasharray");
      this._root.removeAttribute("aria-valuenow");
    }
  }
};
var TesselSkeleton = class extends TesselElement {
  static styles = ":host{display:block;}";
  static observedAttributes = ["width", "height", "circle"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._bar = h("div", "animate-shimmer bg-[linear-gradient(90deg,var(--tsl-subtle)_25%,var(--tsl-control-hover)_50%,var(--tsl-subtle)_75%)] bg-[length:200%_100%]", { "aria-hidden": "true" });
    this.shadowRoot.appendChild(this._bar);
    this._sync();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    const circle = this.hasAttribute("circle");
    const dim = (v, fallback) => /^\d+(\.\d+)?$/.test(v ?? "") ? `${v}px` : v || fallback;
    const height = dim(this.getAttribute("height"), circle ? this.hasAttribute("width") ? dim(this.getAttribute("width")) : "40px" : "16px");
    this._bar.style.height = height;
    this._bar.style.width = dim(this.getAttribute("width"), circle ? height : "100%");
    this._bar.style.borderRadius = circle ? "999px" : "var(--tsl-radius-sm)";
  }
};
define("tsl-progress-ring", TesselProgressRing);
define("tsl-skeleton", TesselSkeleton);

// src/components/rating.js
var STAR = "flex size-7 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 transition-[color,transform] duration-fast ease-tessel active:scale-90 disabled:cursor-default disabled:active:scale-100";
var TesselRating = class extends TesselElement {
  static styles = ":host{display:inline-flex;flex-direction:column;gap:2px;}";
  static observedAttributes = ["value", "max", "read-only", "clearable", "caption", "disabled"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._row = h("div", "flex items-center outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-sm", { role: "slider", tabindex: "0" });
    this._caption = h("div", "text-caption text-text-secondary");
    this.shadowRoot.append(this._row, this._caption);
    this._hover = 0;
    this._row.addEventListener("mouseleave", () => {
      this._hover = 0;
      this._paint();
    });
    this._row.addEventListener("keydown", (e) => this._onKeydown(e));
    this._sync();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  get max() {
    return Math.max(1, Number(this.getAttribute("max")) || 5);
  }
  get value() {
    return Math.min(this.max, Math.max(0, Number(this.getAttribute("value")) || 0));
  }
  set value(v) {
    this.setAttribute("value", String(v));
  }
  get readOnly() {
    return this.hasAttribute("read-only") || this.disabled;
  }
  _choose(v) {
    const next = v === this.value && this.hasAttribute("clearable") ? 0 : v;
    if (next === this.value) return;
    this.value = next;
    this.emit("change", { value: next });
  }
  _onKeydown(e) {
    if (this.readOnly) return;
    const to = { ArrowRight: this.value + 1, ArrowUp: this.value + 1, ArrowLeft: this.value - 1, ArrowDown: this.value - 1, Home: 0, End: this.max }[e.key];
    if (to != null) {
      e.preventDefault();
      const next = Math.min(this.max, Math.max(0, to));
      if (next !== this.value) {
        this.value = next;
        this.emit("change", { value: next });
      }
    } else if (e.key === "Delete" && this.hasAttribute("clearable")) {
      e.preventDefault();
      if (this.value) {
        this.value = 0;
        this.emit("change", { value: 0 });
      }
    }
  }
  _sync() {
    const readOnly = this.readOnly;
    this._row.replaceChildren(...Array.from({ length: this.max }, (_, i) => {
      const star = html("button", STAR, iconMarkup("favorite-star", 20));
      star.type = "button";
      star.tabIndex = -1;
      star.disabled = readOnly;
      star.setAttribute("aria-label", `${i + 1} star${i ? "s" : ""}`);
      star.addEventListener("mouseenter", () => {
        if (!readOnly) {
          this._hover = i + 1;
          this._paint();
        }
      });
      star.addEventListener("click", () => {
        if (!readOnly) this._choose(i + 1);
      });
      return star;
    }));
    this._row.setAttribute("aria-valuemin", "0");
    this._row.setAttribute("aria-valuemax", String(this.max));
    this._row.setAttribute("aria-valuenow", String(this.value));
    this._row.setAttribute("aria-readonly", String(readOnly));
    this._row.tabIndex = readOnly ? -1 : 0;
    const caption = this.getAttribute("caption");
    this._caption.textContent = caption || "";
    this._caption.hidden = !caption;
    this._paint();
  }
  _paint() {
    const shown = this._hover || this.value;
    Array.from(this._row.children).forEach((star, i) => {
      const on = i < shown;
      star.className = cx(STAR, on ? "text-warning" : "text-text-tertiary", !this.readOnly && !on && "hover:text-text-secondary");
      star.firstElementChild?.setAttribute("fill", on ? "currentColor" : "none");
    });
  }
};
define("tsl-rating", TesselRating);

// src/components/containers.js
var TesselGroupBox = class extends TesselElement {
  static styles = ":host{display:block;}";
  static observedAttributes = ["header"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._legend = h("legend", "ml-3 px-2 text-body font-semibold text-text");
    this.shadowRoot.appendChild(h("fieldset", "m-0 min-w-0 rounded-lg border border-border px-4 pb-4 pt-2", null, this._legend, h("slot")));
    this._sync();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    this._legend.textContent = this.getAttribute("header") || "";
    this._legend.hidden = !this.hasAttribute("header");
  }
};
var TesselToolbar = class extends TesselElement {
  static styles = ":host{display:inline-block;}";
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this.setAttribute("role", "toolbar");
    this.shadowRoot.appendChild(
      h("div", "flex items-center gap-1 rounded-lg border border-border bg-surface p-1", null, h("slot"))
    );
    this.addEventListener("keydown", (e) => {
      const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!dir) return;
      const items = Array.from(this.querySelectorAll("tsl-button, tsl-toggle-button, tsl-dropdown-button, tsl-split-button, tsl-menu-button")).filter((el) => !el.disabled);
      const at = items.findIndex((el) => el.matches(":focus-within") || el === document.activeElement);
      if (at < 0) return;
      e.preventDefault();
      items[(at + dir + items.length) % items.length].focus();
    });
  }
};
define("tsl-group-box", TesselGroupBox);
define("tsl-toolbar", TesselToolbar);

// src/components/flyout.js
var FLYOUT = `${POPUP_BASE} z-50 max-w-[min(420px,calc(100vw-16px))] rounded-lg bg-surface p-4 shadow-flyout`;
function resolveTarget(host2) {
  if (host2._target) return host2._target;
  const sel = host2.getAttribute("target");
  if (!sel) return null;
  const root = host2.getRootNode();
  return root.querySelector?.(sel) || document.querySelector(sel);
}
var TesselFlyout = class extends TesselElement {
  static styles = ":host{display:contents;}";
  static observedAttributes = ["open", "placement"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._popup = h("div", this._popupClass(), { popover: "manual", role: "dialog" }, ...this._body());
    this.shadowRoot.appendChild(this._popup);
    if (this.hasAttribute("open")) requestAnimationFrame(() => this.show());
  }
  disconnectedCallback() {
    if (this._popup) closePopup(this._popup);
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built || name !== "open") return;
    if (this.hasAttribute("open") && !popupIsOpen(this._popup)) this._present();
    else if (!this.hasAttribute("open") && popupIsOpen(this._popup)) this._dismiss(false);
  }
  /** Hook for subclasses. */
  _popupClass() {
    return FLYOUT;
  }
  _body() {
    return [h("slot")];
  }
  /** The element the flyout is anchored to: `.target` (an element), else the `target` selector attribute. */
  get target() {
    return resolveTarget(this);
  }
  set target(el) {
    this._target = el;
  }
  get isOpen() {
    return this._popup ? popupIsOpen(this._popup) : false;
  }
  _present() {
    const anchor = this.target;
    if (!anchor) return;
    openPopup(this._popup, anchor, {
      placement: this.getAttribute("placement") || "bottom",
      stayOpen: this.hasAttribute("stays-open"),
      owner: this,
      align: "center",
      onDismiss: () => this._dismiss(true)
    });
    this.emit("opened", {});
  }
  _dismiss(fromPopup) {
    if (!fromPopup) closePopup(this._popup);
    if (this.hasAttribute("open")) this.removeAttribute("open");
    this.emit("closed", {});
  }
  show() {
    if (this.isOpen) {
      repositionPopup(this._popup);
      return;
    }
    this.setAttribute("open", "");
    if (!this.isOpen) this._present();
  }
  showAt(element) {
    this._target = element;
    if (this.isOpen) {
      this.hide();
    }
    this.show();
  }
  hide() {
    if (!this.isOpen) {
      this.removeAttribute("open");
      return;
    }
    closePopup(this._popup);
    this._dismiss(true);
  }
  toggle() {
    if (this.isOpen) this.hide();
    else this.show();
  }
};
var TesselTeachingTip = class extends TesselFlyout {
  static observedAttributes = [...TesselFlyout.observedAttributes, "heading", "title", "subtitle", "icon", "action-text", "closable"];
  _popupClass() {
    return `${FLYOUT} w-80`;
  }
  _body() {
    this._icon = h("span", "mt-0.5 flex flex-none text-accent");
    this._title = h("div", "text-body font-semibold text-text");
    this._subtitle = h("div", "mt-0.5 text-body text-text-secondary");
    this._close = html("button", "ml-auto flex size-7 flex-none cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent text-text-secondary hover:bg-control-hover focus-visible:outline-2 focus-visible:outline-accent", closeSvg(12));
    this._close.type = "button";
    this._close.setAttribute("aria-label", "Close");
    this._close.addEventListener("click", () => {
      if (this.emit("close-click", {})) this.hide();
    });
    this._action = h("tsl-button", "mt-3", { variant: "accent" });
    this._action.addEventListener("click", () => {
      if (this.emit("action-click", {})) this.hide();
    });
    this._content = h("div", "mt-2 text-body text-text", null, h("slot"));
    queueMicrotask(() => this._syncTip());
    return [
      h("div", "flex items-start gap-3", null, this._icon, h("div", "min-w-0 flex-1", null, this._title, this._subtitle), this._close),
      this._content,
      h("div", "flex justify-end", null, this._action)
    ];
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built && name !== "open" && name !== "placement") this._syncTip();
  }
  _syncTip() {
    const title = this.readHeading();
    const icon = this.getAttribute("icon");
    const action = this.getAttribute("action-text");
    this._title.textContent = title;
    this._title.hidden = !title;
    this._subtitle.textContent = this.getAttribute("subtitle") || "";
    this._subtitle.hidden = !this.hasAttribute("subtitle");
    this._icon.replaceChildren(...icon ? [createIcon(icon, 18)] : []);
    this._icon.hidden = !icon;
    this._action.textContent = action || "";
    this._action.parentElement.hidden = !action;
    this._close.hidden = this.getAttribute("closable") === "false";
  }
};
var TIP = `${POPUP_BASE} pointer-events-none z-60 max-w-72 rounded-sm bg-surface-alt px-2.5 py-1.5 text-caption text-text shadow-card`;
var TesselTooltip = class extends TesselElement {
  static styles = ":host{display:contents;}";
  static observedAttributes = ["for", "placement", "delay"];
  connectedCallback() {
    super.connectedCallback();
    if (!this._built) {
      this._built = true;
      this._popup = h("div", TIP, { popover: "manual", role: "tooltip" }, h("slot"));
      this.shadowRoot.appendChild(this._popup);
      this._show = () => {
        clearTimeout(this._timer);
        this._timer = setTimeout(() => this._open(), Number(this.getAttribute("delay") ?? 500));
      };
      this._hide = () => {
        clearTimeout(this._timer);
        closePopup(this._popup);
      };
    }
    this._attach();
  }
  disconnectedCallback() {
    this._detach();
    clearTimeout(this._timer);
    if (this._popup) closePopup(this._popup);
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built && name === "for") {
      this._detach();
      this._attach();
    }
  }
  _anchor() {
    const sel = this.getAttribute("for");
    if (!sel) return this.parentElement;
    const root = this.getRootNode();
    return root.querySelector?.(sel.startsWith("#") || sel.startsWith(".") ? sel : `#${sel}`) || null;
  }
  _attach() {
    const el = this._anchor();
    if (!el) return;
    this._el = el;
    for (const ev of ["mouseenter", "focusin"]) el.addEventListener(ev, this._show);
    for (const ev of ["mouseleave", "focusout", "pointerdown"]) el.addEventListener(ev, this._hide);
    el.addEventListener("keydown", this._onKey ??= (e) => {
      if (e.key === "Escape") this._hide();
    });
  }
  _detach() {
    const el = this._el;
    if (!el) return;
    for (const ev of ["mouseenter", "focusin"]) el.removeEventListener(ev, this._show);
    for (const ev of ["mouseleave", "focusout", "pointerdown"]) el.removeEventListener(ev, this._hide);
    el.removeEventListener("keydown", this._onKey);
    this._el = null;
  }
  _open() {
    if (!this._el?.isConnected) return;
    openPopup(this._popup, this._el, { placement: this.getAttribute("placement") || "top", align: "center", offset: 6, stayOpen: true });
  }
};
define("tsl-flyout", TesselFlyout);
define("tsl-teaching-tip", TesselTeachingTip);
define("tsl-tooltip", TesselTooltip);

// src/components/auto-suggest.js
var HEADER6 = "mb-1.5 block text-body font-medium text-text";
var FIELD4 = "relative flex h-8 w-full items-center gap-2 overflow-hidden rounded-md border border-border bg-input px-2.5 transition-colors duration-fast ease-tessel hover:border-border-strong focus-within:border-accent hover:focus-within:border-accent host-[disabled]:pointer-events-none host-[disabled]:opacity-45 after:absolute after:inset-x-px after:bottom-0 after:h-0 after:bg-accent after:transition-[height] after:duration-fast after:ease-tessel focus-within:after:h-0.5";
var POPUP2 = `${POPUP_BASE} z-50 max-h-64 rounded-md p-1 shadow-card scrollbar-thin`;
var ROW5 = "flex min-h-8 cursor-pointer items-center gap-2 rounded-sm px-2.5 py-1.5 text-body text-text transition-colors duration-fast";
var norm = (s) => typeof s === "string" ? { label: s, value: s } : { value: s.label, ...s };
var TesselAutoSuggest = class extends TesselElement {
  static styles = ":host{display:inline-flex;flex-direction:column;width:260px;}";
  static observedAttributes = ["placeholder", "icon", "header", "value", "disabled", "local"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._all = [];
    this._shown = [];
    this._active = -1;
    this._header = h("label", HEADER6);
    this._icon = h("span", "flex flex-none text-text-secondary");
    this._input = h("input", "h-full min-w-0 flex-1 bg-transparent p-0 text-body text-text outline-none placeholder:text-text-tertiary", {
      type: "text",
      role: "combobox",
      autocomplete: "off",
      "aria-autocomplete": "list",
      "aria-expanded": "false"
    });
    this._field = h("div", FIELD4, null, this._icon, this._input);
    this._popup = h("div", POPUP2, { popover: "manual", role: "listbox" });
    this.shadowRoot.append(this._header, this._field, this._popup);
    this._input.addEventListener("input", () => {
      this.setAttribute("value", this._input.value);
      this._textChanged("user");
    });
    this._input.addEventListener("keydown", (e) => this._onKeydown(e));
    this._input.addEventListener("focus", () => {
      if (this._shown.length && this._input.value) this._open();
    });
    this._sync();
  }
  disconnectedCallback() {
    if (this._popup) closePopup(this._popup);
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === "value" && this._input.value !== (newV ?? "")) {
      this._input.value = newV ?? "";
      this._textChanged("programmatic");
    } else this._sync();
  }
  _sync() {
    this._input.placeholder = this.getAttribute("placeholder") || "";
    this._input.disabled = this.disabled;
    if (this.hasAttribute("value") && this._input.value !== this.getAttribute("value")) this._input.value = this.getAttribute("value");
    const icon = this.getAttribute("icon");
    this._icon.replaceChildren(createIcon(icon || "search", 16));
    this._header.textContent = this.getAttribute("header") || "";
    this._header.hidden = !this.hasAttribute("header");
  }
  /** Suggestions to show: strings or { label, value, icon? } objects. */
  get suggestions() {
    return this._all;
  }
  set suggestions(list) {
    this._all = (list || []).map(norm);
    this._refresh();
  }
  get value() {
    return this._input ? this._input.value : this.getAttribute("value") || "";
  }
  set value(v) {
    this.setAttribute("value", v);
  }
  focus(options) {
    this._input?.focus(options);
  }
  _textChanged(reason) {
    this.emit("text-changed", { text: this._input.value, reason });
    this._refresh();
  }
  _refresh() {
    if (!this._built) return;
    const text = this._input.value.trim().toLowerCase();
    this._shown = this.hasAttribute("local") ? this._all.filter((s) => s.label.toLowerCase().includes(text)) : this._all;
    this._active = -1;
    this._renderList();
    if (this._shown.length && text && this.shadowRoot.activeElement === this._input) this._open();
    else if (!this._shown.length) this._close();
  }
  _renderList() {
    const text = this._input.value.trim();
    this._popup.replaceChildren(...this._shown.map((s, i) => {
      const row = h(
        "div",
        cx(ROW5, i === this._active ? "bg-control-hover" : "hover:bg-control-hover"),
        { role: "option", "aria-selected": String(i === this._active) },
        s.icon && createIcon(s.icon, 16),
        this._highlight(s.label, text)
      );
      row.addEventListener("mousedown", (e) => e.preventDefault());
      row.addEventListener("click", () => this._choose(s));
      return row;
    }));
    if (popupIsOpen(this._popup)) repositionPopup(this._popup);
  }
  /** Bold the typed part of a suggestion. */
  _highlight(label2, text) {
    const at = text ? label2.toLowerCase().indexOf(text.toLowerCase()) : -1;
    if (at < 0) return h("span", "min-w-0 flex-1 truncate", null, label2);
    return h(
      "span",
      "min-w-0 flex-1 truncate",
      null,
      label2.slice(0, at),
      h("b", "font-semibold", null, label2.slice(at, at + text.length)),
      label2.slice(at + text.length)
    );
  }
  _choose(s) {
    this._input.value = s.label;
    this.setAttribute("value", s.label);
    this.emit("suggestion-chosen", { suggestion: s });
    this.emit("text-changed", { text: s.label, reason: "suggestion" });
    this.emit("query-submitted", { text: s.label, suggestion: s });
    this._close();
  }
  _open() {
    if (!this._shown.length) return;
    this._input.setAttribute("aria-expanded", "true");
    openPopup(this._popup, this._field, { matchWidth: true, owner: this, onDismiss: () => this._input.setAttribute("aria-expanded", "false") });
  }
  _close() {
    closePopup(this._popup);
    this._input?.setAttribute("aria-expanded", "false");
  }
  _onKeydown(e) {
    const open = popupIsOpen(this._popup);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!this._shown.length) return;
      e.preventDefault();
      if (!open) this._open();
      const dir = e.key === "ArrowDown" ? 1 : -1;
      this._active = (this._active + dir + this._shown.length) % this._shown.length;
      this._renderList();
      this._popup.children[this._active]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      const s = open ? this._shown[this._active] : null;
      if (s) this._choose(s);
      else {
        this.emit("query-submitted", { text: this._input.value, suggestion: null });
        this._close();
      }
    } else if (e.key === "Escape" && open) {
      e.stopPropagation();
      this._close();
    }
  }
};
define("tsl-auto-suggest", TesselAutoSuggest);

// src/components/pickers.js
var HEADER7 = "mb-1.5 block text-body font-medium text-text";
var CONTROL2 = "flex h-8 w-full cursor-pointer items-center gap-2 rounded-md border border-border bg-control px-3 text-body text-text transition-colors duration-fast ease-tessel hover:bg-control-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent host-[open]:border-accent host-[disabled]:pointer-events-none host-[disabled]:opacity-45";
var POPUP3 = `${POPUP_BASE} z-50 rounded-lg p-3 shadow-flyout`;
var pad = (n) => String(n).padStart(2, "0");
var toIso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function fromIso(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) || d.getMonth() !== Number(m[2]) - 1 ? null : d;
}
var sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
var addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
var locale = () => typeof navigator !== "undefined" && navigator.language || "en-US";
function localeFirstDay() {
  try {
    const info = new Intl.Locale(locale());
    const first = (info.getWeekInfo?.() ?? info.weekInfo)?.firstDay;
    if (first) return first % 7;
  } catch {
  }
  return 0;
}
var NAV = "flex size-8 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 text-text-secondary hover:bg-control-hover hover:text-text disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-accent";
var DAY = "flex size-9 cursor-pointer items-center justify-center rounded-md border border-transparent bg-transparent p-0 text-body tabular-nums transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-30";
var TesselCalendar = class extends TesselElement {
  static styles = ":host{display:inline-block;}";
  static observedAttributes = ["value", "min", "max", "first-day"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._mode = "days";
    const base = fromIso(this.getAttribute("value")) || /* @__PURE__ */ new Date();
    this._view = new Date(base.getFullYear(), base.getMonth(), 1);
    this._focus = base;
    this._root = h("div", "w-[280px] select-none");
    this.shadowRoot.appendChild(this._root);
    this._render();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === "value") {
      const d = fromIso(newV);
      if (d) {
        this._view = new Date(d.getFullYear(), d.getMonth(), 1);
        this._focus = d;
      }
    }
    this._render();
  }
  get value() {
    return this.getAttribute("value") || "";
  }
  set value(v) {
    this.setAttribute("value", v);
  }
  get _min() {
    return fromIso(this.getAttribute("min"));
  }
  get _max() {
    return fromIso(this.getAttribute("max"));
  }
  _disabledDay(d) {
    return this._min && d < this._min || this._max && d > this._max;
  }
  _firstDay() {
    return this.hasAttribute("first-day") ? Number(this.getAttribute("first-day")) % 7 : localeFirstDay();
  }
  _go(months) {
    this._view = new Date(this._view.getFullYear(), this._view.getMonth() + months, 1);
    this._render();
  }
  _pick(d) {
    if (this._disabledDay(d)) return;
    this.setAttribute("value", toIso(d));
    this.emit("change", { value: toIso(d) });
  }
  _render() {
    const fmt = (opts) => new Intl.DateTimeFormat(locale(), opts);
    const label2 = this._mode === "days" ? fmt({ month: "long", year: "numeric" }).format(this._view) : this._mode === "months" ? String(this._view.getFullYear()) : `${Math.floor(this._view.getFullYear() / 12) * 12} \u2013 ${Math.floor(this._view.getFullYear() / 12) * 12 + 11}`;
    const step = this._mode === "days" ? 1 : this._mode === "months" ? 12 : 144;
    const title = h("button", "flex-1 cursor-pointer rounded-sm border-0 bg-transparent px-2 py-1 text-body font-semibold text-text hover:bg-control-hover focus-visible:outline-2 focus-visible:outline-accent", { type: "button" }, label2);
    title.addEventListener("click", () => {
      this._mode = this._mode === "days" ? "months" : this._mode === "months" ? "years" : "days";
      this._render();
    });
    const nav = (dir) => {
      const b = html("button", NAV, chevronSvg(dir > 0 ? "right" : "left", 14));
      b.type = "button";
      b.setAttribute("aria-label", dir > 0 ? "Next" : "Previous");
      b.addEventListener("click", () => this._go(dir * step));
      return b;
    };
    this._root.replaceChildren(h("div", "mb-2 flex items-center gap-1", null, nav(-1), title, nav(1)), this._body());
    if (this._refocus) {
      this._refocus = false;
      this._root.querySelector(`[data-iso="${toIso(this._focus)}"]`)?.focus();
    }
  }
  _body() {
    if (this._mode === "months") {
      const grid2 = h("div", "grid grid-cols-3 gap-1");
      for (let m = 0; m < 12; m++) {
        const on = this._view.getMonth() === m;
        const b = h(
          "button",
          cx("h-12 cursor-pointer rounded-md border-0 text-body focus-visible:outline-2 focus-visible:outline-accent", on ? "bg-accent text-on-accent" : "bg-transparent text-text hover:bg-control-hover"),
          { type: "button" },
          new Intl.DateTimeFormat(locale(), { month: "short" }).format(new Date(2e3, m, 1))
        );
        b.addEventListener("click", () => {
          this._view = new Date(this._view.getFullYear(), m, 1);
          this._mode = "days";
          this._render();
        });
        grid2.appendChild(b);
      }
      return grid2;
    }
    if (this._mode === "years") {
      const start = Math.floor(this._view.getFullYear() / 12) * 12;
      const grid2 = h("div", "grid grid-cols-3 gap-1");
      for (let y = start; y < start + 12; y++) {
        const on = this._view.getFullYear() === y;
        const b = h("button", cx("h-12 cursor-pointer rounded-md border-0 text-body tabular-nums focus-visible:outline-2 focus-visible:outline-accent", on ? "bg-accent text-on-accent" : "bg-transparent text-text hover:bg-control-hover"), { type: "button" }, String(y));
        b.addEventListener("click", () => {
          this._view = new Date(y, this._view.getMonth(), 1);
          this._mode = "months";
          this._render();
        });
        grid2.appendChild(b);
      }
      return grid2;
    }
    const first = this._firstDay();
    const grid = h("div", "grid grid-cols-7 gap-y-0.5 place-items-center", { role: "grid" });
    const weekday = new Intl.DateTimeFormat(locale(), { weekday: "short" });
    for (let i = 0; i < 7; i++) {
      grid.appendChild(h(
        "div",
        "flex size-9 items-center justify-center text-caption font-medium text-text-tertiary",
        null,
        weekday.format(new Date(2023, 0, 1 + (first + i) % 7)).slice(0, 2)
      ));
    }
    const lead = (this._view.getDay() - first + 7) % 7;
    const selected = fromIso(this.getAttribute("value"));
    const today = /* @__PURE__ */ new Date();
    for (let i = 0; i < 42; i++) {
      const d = addDays(this._view, i - lead);
      const outside = d.getMonth() !== this._view.getMonth();
      const isSel = sameDay(d, selected);
      const b = h("button", cx(DAY, isSel ? "bg-accent font-medium text-on-accent hover:bg-accent-hover" : cx("hover:bg-control-hover", outside ? "text-text-tertiary" : "text-text", sameDay(d, today) && "border-accent")), {
        type: "button",
        "data-iso": toIso(d),
        tabindex: sameDay(d, this._focus) ? "0" : "-1",
        "aria-selected": String(isSel),
        disabled: !!this._disabledDay(d),
        "aria-label": d.toDateString()
      }, String(d.getDate()));
      b.addEventListener("click", () => this._pick(d));
      b.addEventListener("keydown", (e) => this._onKey(e, d));
      grid.appendChild(b);
    }
    return grid;
  }
  _onKey(e, d) {
    const move = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    let next = null;
    if (move) next = addDays(d, move);
    else if (e.key === "PageUp" || e.key === "PageDown") next = new Date(d.getFullYear(), d.getMonth() + (e.key === "PageUp" ? -1 : 1), d.getDate());
    else if (e.key === "Home") next = addDays(d, -((d.getDay() - this._firstDay() + 7) % 7));
    else if (e.key === "End") next = addDays(d, 6 - (d.getDay() - this._firstDay() + 7) % 7);
    if (!next) return;
    e.preventDefault();
    this._focus = next;
    this._view = new Date(next.getFullYear(), next.getMonth(), 1);
    this._refocus = true;
    this._render();
  }
};
var TesselDropdownField = class extends TesselElement {
  static styles = ":host{display:inline-flex;flex-direction:column;width:220px;}";
  static observedAttributes = ["value", "placeholder", "header", "disabled"];
  /** Material name of the leading icon. */
  static icon = "calendar";
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._header = h("label", HEADER7);
    this._text = h("span", "min-w-0 flex-1 truncate text-left");
    this._control = h(
      "button",
      CONTROL2,
      { type: "button", "aria-haspopup": "dialog", "aria-expanded": "false" },
      h("span", "flex flex-none text-text-secondary", null, createIcon(this.constructor.icon, 16)),
      this._text
    );
    this._popup = h("div", POPUP3, { popover: "manual", role: "dialog" });
    this.shadowRoot.append(this._header, this._control, this._popup);
    this._control.addEventListener("click", () => popupIsOpen(this._popup) ? this.close() : this.openPicker());
    this._build(this._popup);
    this._sync();
  }
  disconnectedCallback() {
    if (this._popup) closePopup(this._popup);
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    const display = this._display();
    this._text.textContent = display || this.getAttribute("placeholder") || "";
    this._text.classList.toggle("text-text-tertiary", !display);
    this._header.textContent = this.getAttribute("header") || "";
    this._header.hidden = !this.hasAttribute("header");
    this._control.disabled = this.disabled;
    this._update?.();
  }
  openPicker() {
    if (this.disabled) return;
    this.setAttribute("open", "");
    this._control.setAttribute("aria-expanded", "true");
    openPopup(this._popup, this._control, { owner: this, onDismiss: () => this._closed() });
    this._opened?.();
  }
  close() {
    closePopup(this._popup);
    this._closed();
  }
  _closed() {
    this.removeAttribute("open");
    this._control?.setAttribute("aria-expanded", "false");
  }
  get value() {
    return this.getAttribute("value") || "";
  }
  set value(v) {
    this.setAttribute("value", v);
  }
};
var TesselDatePicker = class extends TesselDropdownField {
  static observedAttributes = [...TesselDropdownField.observedAttributes, "min", "max", "first-day"];
  static icon = "calendar";
  _build(popup) {
    this._cal = h("tsl-calendar");
    this._cal.addEventListener("change", (e) => {
      e.stopPropagation();
      this.value = e.detail.value;
      this.emit("change", { value: e.detail.value });
      this.close();
      this._control.focus();
    });
    popup.appendChild(this._cal);
  }
  _display() {
    const d = fromIso(this.getAttribute("value"));
    return d ? new Intl.DateTimeFormat(locale(), { dateStyle: "medium" }).format(d) : "";
  }
  _update() {
    for (const attr of ["value", "min", "max", "first-day"]) {
      if (this.hasAttribute(attr)) this._cal.setAttribute(attr, this.getAttribute(attr));
      else this._cal.removeAttribute(attr);
    }
  }
  _opened() {
    requestAnimationFrame(() => (this._cal.shadowRoot.querySelector('[tabindex="0"]:not([disabled])') || this._cal.shadowRoot.querySelector("button"))?.focus());
  }
};
var COL = "flex max-h-56 w-14 flex-col gap-0.5 overflow-y-auto pr-0.5 scrollbar-thin";
var CELL = "flex h-8 flex-none cursor-pointer items-center justify-center rounded-sm border-0 text-body tabular-nums focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent";
var TesselTimePicker = class extends TesselDropdownField {
  static observedAttributes = [...TesselDropdownField.observedAttributes, "hour24", "minute-increment"];
  static icon = "clock";
  get _hour24() {
    if (this.hasAttribute("hour24")) return this.getAttribute("hour24") !== "false";
    try {
      return !new Intl.DateTimeFormat(locale(), { hour: "numeric" }).resolvedOptions().hour12;
    } catch {
      return true;
    }
  }
  _parts() {
    const m = /^(\d{1,2}):(\d{2})$/.exec(this.getAttribute("value") || "");
    return m ? { h: Number(m[1]) % 24, m: Number(m[2]) % 60 } : null;
  }
  _display() {
    const t = this._parts();
    if (!t) return "";
    return new Intl.DateTimeFormat(locale(), { hour: "numeric", minute: "2-digit", hour12: !this._hour24 }).format(new Date(2e3, 0, 1, t.h, t.m));
  }
  _build(popup) {
    this._cols = h("div", "flex gap-2");
    popup.appendChild(this._cols);
  }
  _update() {
    this._renderCols();
  }
  _opened() {
    this._renderCols();
    requestAnimationFrame(() => this._cols.querySelectorAll('[aria-selected="true"]').forEach((el) => el.scrollIntoView({ block: "center" })));
  }
  _set(hh, mm) {
    const value = `${pad(hh)}:${pad(mm)}`;
    this.setAttribute("value", value);
    this.emit("change", { value });
  }
  _renderCols() {
    const t = this._parts() || { h: 0, m: 0 };
    const h24 = this._hour24;
    const step = Math.max(1, Number(this.getAttribute("minute-increment")) || 1);
    const cell = (label2, on, onClick) => {
      const b = h("button", cx(CELL, on ? "bg-accent font-medium text-on-accent" : "bg-transparent text-text hover:bg-control-hover"), { type: "button", "aria-selected": String(on) }, label2);
      b.addEventListener("click", onClick);
      return b;
    };
    const hours = h24 ? Array.from({ length: 24 }, (_, i) => i) : Array.from({ length: 12 }, (_, i) => i + 1);
    const hourCol = h("div", COL, null, ...hours.map((v) => cell(
      pad(v),
      h24 ? v === t.h : (t.h % 12 || 12) === v,
      () => this._set(h24 ? v : v % 12 + (t.h >= 12 ? 12 : 0), t.m)
    )));
    const minuteCol = h("div", COL, null, ...Array.from({ length: Math.ceil(60 / step) }, (_, i) => i * step).map((v) => cell(pad(v), v === t.m, () => this._set(t.h, v))));
    this._cols.replaceChildren(hourCol, minuteCol);
    if (!h24) {
      this._cols.appendChild(h(
        "div",
        "flex flex-col gap-0.5",
        null,
        cell("AM", t.h < 12, () => this._set(t.h % 12, t.m)),
        cell("PM", t.h >= 12, () => this._set(t.h % 12 + 12, t.m))
      ));
    }
  }
};
var CHECKER = "bg-[length:8px_8px] bg-[linear-gradient(45deg,#8884_25%,transparent_25%,transparent_75%,#8884_75%),linear-gradient(45deg,#8884_25%,transparent_25%,transparent_75%,#8884_75%)] bg-[position:0_0,4px_4px]";
function hsvToRgb(hh, s, v) {
  const f = (n) => {
    const k = (n + hh / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return [f(5), f(3), f(1)].map((c) => Math.round(c * 255));
}
function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
  let hue = 0;
  if (d) {
    if (max === r) hue = (g - b) / d % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
  }
  return { h: (hue * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}
var hex2 = (n) => Math.round(n).toString(16).padStart(2, "0");
function parseHex(str) {
  const m = /^#?([0-9a-f]{3,8})$/i.exec((str || "").trim());
  if (!m) return null;
  let x = m[1];
  if (x.length === 3 || x.length === 4) x = [...x].map((c) => c + c).join("");
  if (x.length !== 6 && x.length !== 8) return null;
  return { r: parseInt(x.slice(0, 2), 16), g: parseInt(x.slice(2, 4), 16), b: parseInt(x.slice(4, 6), 16), a: x.length === 8 ? parseInt(x.slice(6, 8), 16) / 255 : 1 };
}
function dragOn(el, onMove, onEnd) {
  const at = (e) => {
    const r = el.getBoundingClientRect();
    onMove(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)));
  };
  el.addEventListener("pointerdown", (e) => {
    el.setPointerCapture(e.pointerId);
    el._dragging = true;
    at(e);
  });
  el.addEventListener("pointermove", (e) => {
    if (el._dragging) at(e);
  });
  const end = () => {
    if (el._dragging) {
      el._dragging = false;
      onEnd();
    }
  };
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);
}
var TesselColorPicker = class extends TesselElement {
  static styles = ":host{display:inline-block;}";
  static observedAttributes = ["value", "alpha", "no-hex"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const c = parseHex(this.getAttribute("value")) || { r: 79, g: 70, b: 229, a: 1 };
    this._hsv = rgbToHsv(c.r, c.g, c.b);
    this._a = c.a;
    this._sv = h("div", "relative h-40 w-full cursor-crosshair touch-none rounded-md");
    this._svThumb = h("div", "pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm");
    this._sv.appendChild(this._svThumb);
    this._hue = h("div", "relative h-3 w-full cursor-pointer touch-none rounded-pill bg-[linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)]");
    this._hueThumb = h("div", "pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm");
    this._hue.appendChild(this._hueThumb);
    this._alphaBar = h("div", "absolute inset-0 rounded-pill");
    this._alphaThumb = h("div", "pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm");
    this._alphaWrap = h("div", cx("relative h-3 w-full cursor-pointer touch-none rounded-pill", CHECKER), null, this._alphaBar, this._alphaThumb);
    this._swatchColor = h("div", "size-full");
    this._swatch = h("div", cx("size-8 flex-none overflow-hidden rounded-md border border-border", CHECKER), null, this._swatchColor);
    this._hexInput = h("input", "h-8 min-w-0 flex-1 rounded-md border border-border bg-input px-2.5 font-mono text-code text-text outline-none focus:border-accent", { spellcheck: "false", "aria-label": "Hex color" });
    this._hexRow = h("div", "flex items-center gap-2", null, this._swatch, this._hexInput);
    this.shadowRoot.appendChild(h("div", "flex w-[260px] flex-col gap-3 rounded-lg border border-border bg-surface p-3", null, this._sv, this._hue, this._alphaWrap, this._hexRow));
    dragOn(this._sv, (x, y) => {
      this._hsv.s = x;
      this._hsv.v = 1 - y;
      this._changed(true);
    }, () => this._changed(false));
    dragOn(this._hue, (x) => {
      this._hsv.h = x * 360;
      this._changed(true);
    }, () => this._changed(false));
    dragOn(this._alphaWrap, (x) => {
      this._a = Math.round(x * 100) / 100;
      this._changed(true);
    }, () => this._changed(false));
    this._hexInput.addEventListener("change", () => {
      const p = parseHex(this._hexInput.value);
      if (p) {
        this._hsv = rgbToHsv(p.r, p.g, p.b);
        if (this.hasAttribute("alpha")) this._a = p.a;
        this._changed(false);
      } else this._paint();
    });
    this._paint();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === "value") {
      const p = parseHex(newV);
      if (p && this._hex() !== newV?.toLowerCase()) {
        this._hsv = rgbToHsv(p.r, p.g, p.b);
        this._a = p.a;
      }
    }
    this._paint();
  }
  _rgb() {
    return hsvToRgb(this._hsv.h, this._hsv.s, this._hsv.v);
  }
  _hex() {
    const [r, g, b] = this._rgb();
    return `#${hex2(r)}${hex2(g)}${hex2(b)}${this.hasAttribute("alpha") ? hex2(this._a * 255) : ""}`;
  }
  get value() {
    return this._built ? this._hex() : this.getAttribute("value") || "";
  }
  set value(v) {
    this.setAttribute("value", v);
  }
  /** `dragging` = still being dragged: fire `input` only; `change` when released or committed. */
  _changed(dragging) {
    this._paint();
    this.setAttribute("value", this._hex());
    this.emit("input", { value: this._hex() });
    if (!dragging) this.emit("change", { value: this._hex() });
  }
  _paint() {
    const [r, g, b] = this._rgb();
    const alpha = this.hasAttribute("alpha");
    const pure = hsvToRgb(this._hsv.h, 1, 1);
    this._sv.style.backgroundColor = `rgb(${pure})`;
    this._sv.style.backgroundImage = "linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,transparent)";
    this._svThumb.style.left = `${this._hsv.s * 100}%`;
    this._svThumb.style.top = `${(1 - this._hsv.v) * 100}%`;
    this._svThumb.style.background = `rgb(${r},${g},${b})`;
    this._hueThumb.style.left = `${this._hsv.h / 360 * 100}%`;
    this._hueThumb.style.background = `rgb(${pure})`;
    this._alphaWrap.hidden = !alpha;
    this._alphaBar.style.background = `linear-gradient(to right, rgba(${r},${g},${b},0), rgb(${r},${g},${b}))`;
    this._alphaThumb.style.left = `${this._a * 100}%`;
    this._swatchColor.style.background = `rgba(${r},${g},${b},${alpha ? this._a : 1})`;
    this._hexRow.lastElementChild.hidden = this.hasAttribute("no-hex");
    if (this.shadowRoot.activeElement !== this._hexInput) this._hexInput.value = this._hex();
  }
};
define("tsl-calendar", TesselCalendar);
define("tsl-date-picker", TesselDatePicker);
define("tsl-time-picker", TesselTimePicker);
define("tsl-color-picker", TesselColorPicker);

// src/tessel.js
function style(button, buttonStyle) {
  button.setAttribute("variant", buttonStyle);
  return button;
}
function placeholder(field, text) {
  field.setAttribute("placeholder", text);
  return field;
}
function leadingIcon(field, iconName) {
  field.setAttribute("icon", iconName);
  return field;
}
function textStyle(element, style2) {
  if (element.tagName === "TSL-TEXT") element.setAttribute("variant", style2);
  else element.setAttribute("data-tsl-text-style", style2);
  return element;
}
function label(text, style2) {
  const el = document.createElement("tsl-text");
  el.setAttribute("variant", style2);
  el.textContent = text;
  return el;
}
var Tessel = {
  VERSION: "1.0.0",
  // theming
  setup,
  setTheme,
  setAccent,
  getTheme,
  getAccent,
  isDark,
  palette: getPalette,
  addThemeListener,
  removeThemeListener,
  Theme: TesselTheme,
  // enums
  ButtonStyle,
  TextStyle,
  Severity,
  BadgeKind,
  Symbol,
  // component helpers
  style,
  placeholder,
  leadingIcon,
  textStyle,
  label,
  icon: createIcon,
  // helpers for tsl-animation-timeline
  waveformFromSamples,
  // imperative components
  snackbar: { show: showSnackbar },
  dialog: { show: showDialog, message: showMessage, Result: DialogResult, MessageButtons, MessageResult }
};
if (typeof window !== "undefined") window.Tessel = Tessel;
var tessel_default = Tessel;
export {
  BadgeKind,
  ButtonStyle,
  DialogResult,
  MessageButtons,
  MessageResult,
  Severity,
  Symbol,
  Tessel,
  TesselTheme,
  TextStyle,
  addThemeListener,
  createIcon,
  tessel_default as default,
  getAccent,
  getPalette,
  getTheme,
  isDark,
  removeThemeListener,
  setAccent,
  setTheme,
  setup,
  showDialog,
  showMessage,
  showSnackbar
};
