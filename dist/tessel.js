/*! Tessel.js v1.0.0 — A pure-JavaScript, framework-free port of the Tessel4J look and feel — Fluent-inspired Web Components for the browser.
 * MIT License — bundled 2026-09-26
 */


// src/core/palette.js
function clamp255(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
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
var TEXT_STYLES = {
  display: [40, 600, false],
  title: [28, 600, false],
  subtitle: [20, 600, false],
  header: [16, 600, false],
  "body-strong": [14, 600, false],
  body: [14, 400, false],
  secondary: [14, 400, true],
  caption: [12, 400, true],
  code: [13, 400, false]
};
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
      font-size: 14px;
      color: var(--tsl-text);
      background: var(--tsl-background);
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }
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
var Symbol2 = Object.freeze({
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
    this.attachShadow({ mode: "open" });
    const css = `:host{all:initial;box-sizing:border-box;font-family:var(--tsl-font);}
      *,*::before,*::after{box-sizing:border-box;}
      ${this.constructor.styles}`;
    const sheet = sharedSheet(css);
    if (sheet) {
      this.shadowRoot.adoptedStyleSheets = [sheet];
    } else {
      const style2 = document.createElement("style");
      style2.textContent = css;
      this.shadowRoot.appendChild(style2);
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
  $(selector) {
    return this.shadowRoot.querySelector(selector);
  }
};
var FOCUS_VISIBLE_CSS = `
  :focus-visible{outline:2px solid var(--tsl-accent);outline-offset:2px;}
`;
function define(tag, ctor) {
  if (!customElements.get(tag)) customElements.define(tag, ctor);
}
var closeTokens = /* @__PURE__ */ new WeakMap();
function openAnimated(host2, openAttr = "open", visibleAttr = "visible") {
  closeTokens.delete(host2);
  host2.setAttribute(openAttr, "");
  void host2.offsetWidth;
  host2.setAttribute(visibleAttr, "");
}
function closeAnimated(host2, durationMs, openAttr = "open", visibleAttr = "visible", onClosed) {
  if (!host2.hasAttribute(openAttr)) return;
  host2.removeAttribute(visibleAttr);
  const token = /* @__PURE__ */ Symbol();
  closeTokens.set(host2, token);
  setTimeout(() => {
    if (closeTokens.get(host2) !== token) return;
    host2.removeAttribute(openAttr);
    onClosed?.();
  }, durationMs);
}

// src/components/info-bar.js
var DISMISS_DURATION = parseInt(MOTION.fast, 10);
var STYLES = `
  :host{display:flex;opacity:1;transform:scale(1);
    transition:opacity var(--tsl-duration-fast) var(--tsl-ease), transform var(--tsl-duration-fast) var(--tsl-ease);}
  .bar{display:flex;align-items:flex-start;gap:12px;width:100%;padding:12px 10px 12px 16px;
    border-radius:var(--tsl-radius-lg);border:1px solid var(--tsl-border);background:var(--tsl-info-subtle);}
  :host([elevated]) .bar{box-shadow:0 1px 2px var(--tsl-shadow), 0 8px 24px var(--tsl-shadow);border-color:transparent;}
  :host([surface]) .bar{background:var(--tsl-surface);}
  .icon{flex:none;margin-top:1px;color:var(--tsl-info);}
  .body{flex:1;min-width:0;}
  .title{font-size:14px;font-weight:600;color:var(--tsl-text);}
  .message{font-size:14px;color:var(--tsl-text-secondary);margin-top:2px;}
  ::slotted(*){margin:0;}
  .close{flex:none;display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:4px;
    border:none;background:transparent;color:var(--tsl-text-secondary);cursor:pointer;}
  .close:hover{background:var(--tsl-control-hover);}

  :host([severity="success"]) .bar{background:var(--tsl-success-subtle);}
  :host([severity="success"]) .icon{color:var(--tsl-success);}
  :host([severity="warning"]) .bar{background:var(--tsl-warning-subtle);}
  :host([severity="warning"]) .icon{color:var(--tsl-warning);}
  :host([severity="error"]) .bar{background:var(--tsl-danger-subtle);}
  :host([severity="error"]) .icon{color:var(--tsl-danger);}
  :host([surface]) .bar, :host([surface][severity]) .bar{background:var(--tsl-surface);}
`;
var TesselInfoBar = class extends TesselElement {
  static styles = STYLES;
  static observedAttributes = ["severity", "title", "closable"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const bar = document.createElement("div");
    bar.className = "bar";
    this._icon = document.createElement("span");
    this._icon.className = "icon";
    const body = document.createElement("div");
    body.className = "body";
    this._title = document.createElement("div");
    this._title.className = "title";
    const message = document.createElement("div");
    message.className = "message";
    message.appendChild(document.createElement("slot"));
    body.append(this._title, message);
    this._closeBtn = document.createElement("button");
    this._closeBtn.type = "button";
    this._closeBtn.className = "close";
    this._closeBtn.innerHTML = closeSvg(14);
    this._closeBtn.addEventListener("click", () => {
      const notCanceled = this.emit("close", {});
      if (notCanceled) this.dismiss();
    });
    bar.append(this._icon, body, this._closeBtn);
    this.shadowRoot.appendChild(bar);
    this._sync();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    const severity = this.getAttribute("severity") || "informational";
    this._icon.innerHTML = severitySvg(severity, 20);
    const title = this.getAttribute("title");
    this._title.textContent = title || "";
    this._title.style.display = title ? "" : "none";
    this._closeBtn.style.display = this.hasAttribute("closable") ? "" : "none";
  }
  /** Fades the bar out, then removes it. Exposed so external code (e.g. Tessel.snackbar) can call it. */
  dismiss() {
    this.style.opacity = "0";
    this.style.transform = "scale(0.98)";
    setTimeout(() => this.remove(), DISMISS_DURATION);
  }
};
define("tsl-info-bar", TesselInfoBar);

// src/components/snackbar.js
var host = null;
function ensureHost() {
  if (host) return host;
  host = document.createElement("div");
  host.style.cssText = `
    position:fixed;right:24px;bottom:24px;z-index:3000;display:flex;flex-direction:column-reverse;
    gap:12px;width:380px;max-width:calc(100vw - 32px);pointer-events:none;`;
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
  if (title) bar.setAttribute("title", title);
  if (message) bar.textContent = message;
  bar.style.cssText = "pointer-events:auto;opacity:0;transform:translateY(12px);transition:opacity 200ms cubic-bezier(0.16,1,0.3,1), transform 200ms cubic-bezier(0.16,1,0.3,1);";
  container.appendChild(bar);
  requestAnimationFrame(() => {
    bar.style.opacity = "1";
    bar.style.transform = "translateY(0)";
  });
  let timer = null;
  const dismiss = () => {
    bar.style.opacity = "0";
    bar.style.transform = "translateY(12px)";
    setTimeout(() => bar.remove(), 200);
  };
  const arm = () => {
    if (duration > 0) timer = setTimeout(dismiss, duration);
  };
  const disarm = () => {
    if (timer) clearTimeout(timer);
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

// src/components/content-dialog.js
var DialogResult = Object.freeze({ NONE: "none", PRIMARY: "primary", SECONDARY: "secondary" });
var CLOSE_DURATION = parseInt(MOTION.slow, 10);
var STYLES2 = `
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
var TesselDialog = class extends TesselElement {
  static styles = STYLES2;
  static Result = DialogResult;
  static observedAttributes = ["title", "primary-text", "secondary-text", "close-text", "primary-destructive", "open"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    const panel = document.createElement("div");
    panel.className = "panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    const body = document.createElement("div");
    body.className = "body";
    this._title = document.createElement("div");
    this._title.className = "title";
    const content = document.createElement("div");
    content.className = "content";
    content.appendChild(document.createElement("slot"));
    body.append(this._title, content);
    this._footer = document.createElement("div");
    this._footer.className = "footer";
    panel.append(body, this._footer);
    this.shadowRoot.append(overlay, panel);
    this._overlay = overlay;
    overlay.addEventListener("click", () => this._close(DialogResult.NONE));
    this._onKeydown = (e) => {
      if (e.key === "Escape" && this.open) this._close(DialogResult.NONE);
    };
    this._sync();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    this._title.textContent = this.getAttribute("title") || "";
    this._title.style.display = this.getAttribute("title") ? "" : "none";
    this._footer.innerHTML = "";
    const secondaryText = this.getAttribute("secondary-text");
    const closeText = this.getAttribute("close-text") || "Cancel";
    const primaryText = this.getAttribute("primary-text");
    if (secondaryText) this._footer.appendChild(this._makeButton(secondaryText, "standard", DialogResult.SECONDARY));
    this._footer.appendChild(this._makeButton(closeText, "standard", DialogResult.NONE));
    if (primaryText) {
      const variant = this.hasAttribute("primary-destructive") ? "danger" : "accent";
      this._footer.appendChild(this._makeButton(primaryText, variant, DialogResult.PRIMARY));
    }
  }
  _makeButton(text, variant, result) {
    const btn = document.createElement("tsl-button");
    btn.setAttribute("variant", variant);
    btn.textContent = text;
    btn.addEventListener("click", () => this._close(result));
    return btn;
  }
  get open() {
    return this.hasAttribute("open");
  }
  /** Opens the dialog and resolves with a DialogResult once it closes (either button). */
  showModal() {
    return new Promise((resolve) => {
      this._resolve = resolve;
      this._previousFocus = document.activeElement;
      this._closing = false;
      openAnimated(this);
      document.addEventListener("keydown", this._onKeydown);
      requestAnimationFrame(() => this._footer.querySelector("tsl-button")?.focus?.());
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
    document.removeEventListener("keydown", this._onKeydown);
    this.emit("close", { result });
    this._previousFocus?.focus?.({ preventScroll: true });
    closeAnimated(this, CLOSE_DURATION, "open", "visible", () => {
      this._closing = false;
      this._resolve?.(result);
      this._resolve = null;
    });
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
  if (title) dialog.setAttribute("title", title);
  if (primaryText) dialog.setAttribute("primary-text", primaryText);
  if (secondaryText) dialog.setAttribute("secondary-text", secondaryText);
  dialog.setAttribute("close-text", closeText);
  if (primaryDestructive) dialog.setAttribute("primary-destructive", "");
  if (message) dialog.textContent = message;
  document.body.appendChild(dialog);
  return dialog.showModal().finally(() => dialog.remove());
}

// src/components/button.js
var STYLES3 = `
  :host{display:inline-flex;vertical-align:middle;}
  button{display:inline-flex;align-items:center;justify-content:center;gap:8px;
    height:32px;padding:0 14px;border-radius:var(--tsl-radius-md);border:1px solid transparent;
    background:var(--tsl-control-bg);color:var(--tsl-text);font:inherit;font-size:14px;font-weight:500;
    cursor:pointer;transition:background var(--tsl-duration-fast) var(--tsl-ease),
      border-color var(--tsl-duration-fast) var(--tsl-ease), color var(--tsl-duration-fast) var(--tsl-ease);
    -webkit-appearance:none;white-space:nowrap;width:100%;}
  button:hover{background:var(--tsl-control-hover);}
  button:active{background:var(--tsl-control-pressed);}
  :host([disabled]) button{pointer-events:none;opacity:var(--tsl-disabled-alpha);}
  ${FOCUS_VISIBLE_CSS}

  :host(:not([variant])) button, :host([variant="standard"]) button{border-color:var(--tsl-border);}

  :host([variant="accent"]) button{background:var(--tsl-accent);border-color:var(--tsl-accent);color:var(--tsl-on-accent);}
  :host([variant="accent"]) button:hover{background:var(--tsl-accent-hover);border-color:var(--tsl-accent-hover);}
  :host([variant="accent"]) button:active{background:var(--tsl-accent-pressed);border-color:var(--tsl-accent-pressed);}

  :host([variant="outline"]) button{background:transparent;border-color:var(--tsl-accent);color:var(--tsl-accent);}
  :host([variant="outline"]) button:hover,:host([variant="outline"]) button:active{background:var(--tsl-accent-subtle);}

  :host([variant="subtle"]) button{background:transparent;}
  :host([variant="subtle"]) button:hover{background:var(--tsl-control-hover);}
  :host([variant="subtle"]) button:active{background:var(--tsl-control-pressed);}

  :host([variant="danger"]) button{background:var(--tsl-danger);border-color:var(--tsl-danger);color:#fff;}
  :host([variant="danger"]) button:hover,:host([variant="danger"]) button:active{background:var(--tsl-danger-hover);border-color:var(--tsl-danger-hover);}

  :host([variant="icon"]) button{background:transparent;padding:0;width:32px;height:32px;}
  :host([variant="icon"]) button:hover{background:var(--tsl-control-hover);}
  :host([variant="icon"]) button:active{background:var(--tsl-control-pressed);}

  :host([variant="link"]) button{background:transparent;padding:0;height:auto;width:auto;color:var(--tsl-accent);
    font-weight:400;text-decoration:none;}
  :host([variant="link"]) button:hover{color:var(--tsl-accent-hover);background:transparent;}
  :host([variant="link"]) button:active{color:var(--tsl-accent-pressed);background:transparent;}

  ::slotted(*){pointer-events:none;}
`;
var TesselButton = class extends TesselElement {
  static styles = STYLES3;
  static observedAttributes = ["disabled", "icon", "icon-size"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const button = document.createElement("button");
    button.type = this.getAttribute("type") || "button";
    button.disabled = this.disabled;
    this._iconSlot = document.createElement("span");
    this._iconSlot.part = "icon";
    button.appendChild(this._iconSlot);
    button.appendChild(document.createElement("slot"));
    this.shadowRoot.appendChild(button);
    this._button = button;
    this._renderIcon();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === "disabled") this._button.disabled = this.disabled;
    if (name === "icon" || name === "icon-size") this._renderIcon();
  }
  _renderIcon() {
    const icon = this.getAttribute("icon");
    this._iconSlot.innerHTML = "";
    this._iconSlot.style.display = icon ? "" : "none";
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

// src/components/checkbox.js
var STYLES4 = `
  :host{display:inline-flex;}
  label{display:inline-flex;align-items:center;gap:10px;cursor:pointer;padding:4px 2px;user-select:none;}
  :host([disabled]) label{cursor:default;}
  input{position:absolute;opacity:0;width:20px;height:20px;margin:0;}
  .box{position:relative;flex:none;width:20px;height:20px;border-radius:4px;border:1.5px solid var(--tsl-text-tertiary);
    background:var(--tsl-input-bg);display:flex;align-items:center;justify-content:center;color:var(--tsl-on-accent);
    transition:background var(--tsl-duration-fast) var(--tsl-ease), border-color var(--tsl-duration-fast) var(--tsl-ease);}
  .box svg{width:13px;height:13px;opacity:0;transform:scale(0.6);transition:opacity var(--tsl-duration-fast) var(--tsl-ease), transform var(--tsl-duration-fast) var(--tsl-ease);}
  .dash{position:absolute;width:10px;height:2px;border-radius:1px;background:currentColor;opacity:0;transform:scale(0.6);
    transition:opacity var(--tsl-duration-fast) var(--tsl-ease), transform var(--tsl-duration-fast) var(--tsl-ease);}
  label:hover .box{border-color:var(--tsl-text-secondary);background:var(--tsl-control-hover);}
  input:checked ~ .box, input:indeterminate ~ .box{background:var(--tsl-accent);border-color:var(--tsl-accent);}
  label:hover input:checked ~ .box, label:hover input:indeterminate ~ .box{background:var(--tsl-accent-hover);border-color:var(--tsl-accent-hover);}
  input:checked ~ .box svg{opacity:1;transform:scale(1);}
  input:indeterminate ~ .box .dash{opacity:1;transform:scale(1);}
  input:focus-visible ~ .box{outline:2px solid var(--tsl-accent);outline-offset:2px;}
  :host([disabled]) .box{opacity:var(--tsl-disabled-alpha);}
  :host([disabled]) label{pointer-events:none;}
  .text{font-size:14px;color:var(--tsl-text);line-height:20px;}
`;
var TesselCheckbox = class extends TesselElement {
  static styles = STYLES4;
  static observedAttributes = ["disabled", "checked", "indeterminate"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const label2 = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    const box = document.createElement("span");
    box.className = "box";
    box.innerHTML = checkmarkSvg(14, 2.2);
    const dash = document.createElement("span");
    dash.className = "dash";
    box.appendChild(dash);
    const text = document.createElement("span");
    text.className = "text";
    text.appendChild(document.createElement("slot"));
    label2.append(input, box, text);
    this.shadowRoot.appendChild(label2);
    this._input = input;
    this._sync();
    input.addEventListener("change", () => {
      this.checked = input.checked;
      this.indeterminate = false;
      this.emit("change", { checked: this.checked });
    });
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    this._input.checked = this.hasAttribute("checked");
    this._input.indeterminate = this.hasAttribute("indeterminate");
    this._input.disabled = this.disabled;
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
var RADIO_STYLES = `
  :host{display:inline-flex;}
  label{display:inline-flex;align-items:center;gap:10px;cursor:pointer;padding:4px 2px;user-select:none;}
  input{position:absolute;opacity:0;width:20px;height:20px;margin:0;}
  .box{position:relative;flex:none;width:20px;height:20px;border-radius:50%;border:1.5px solid var(--tsl-text-tertiary);
    background:var(--tsl-input-bg);transition:background var(--tsl-duration-fast) var(--tsl-ease), border-color var(--tsl-duration-fast) var(--tsl-ease);}
  .dot{position:absolute;top:50%;left:50%;width:8px;height:8px;border-radius:50%;background:var(--tsl-on-accent);
    transform:translate(-50%,-50%) scale(0);transition:transform var(--tsl-duration-fast) var(--tsl-ease);}
  label:hover .box{border-color:var(--tsl-text-secondary);background:var(--tsl-control-hover);}
  label:hover .dot{width:10px;height:10px;}
  input:checked ~ .box{background:var(--tsl-accent);border-color:var(--tsl-accent);}
  label:hover input:checked ~ .box{background:var(--tsl-accent-hover);border-color:var(--tsl-accent-hover);}
  input:checked ~ .dot{transform:translate(-50%,-50%) scale(1);}
  input:focus-visible ~ .box{outline:2px solid var(--tsl-accent);outline-offset:2px;}
  :host([disabled]) .box{opacity:var(--tsl-disabled-alpha);}
  :host([disabled]) label{pointer-events:none;}
  .text{font-size:14px;color:var(--tsl-text);line-height:20px;}
`;
var TesselRadio = class extends TesselElement {
  static styles = RADIO_STYLES;
  static observedAttributes = ["disabled", "checked"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const label2 = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    const box = document.createElement("span");
    box.className = "box";
    const dot = document.createElement("span");
    dot.className = "dot";
    box.appendChild(dot);
    const text = document.createElement("span");
    text.className = "text";
    text.appendChild(document.createElement("slot"));
    label2.append(input, box, text);
    this.shadowRoot.appendChild(label2);
    this._input = input;
    this._sync();
    input.addEventListener("click", (e) => {
      if (input.checked) e.preventDefault();
    });
    input.addEventListener("change", () => {
      this.checked = true;
      this.emit("change", { value: this.value, checked: true });
    });
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    this._input.checked = this.hasAttribute("checked");
    this._input.disabled = this.disabled;
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
var GROUP_STYLES = `:host{display:flex;flex-direction:column;gap:2px;}`;
var TesselRadioGroup = class extends TesselElement {
  static styles = GROUP_STYLES;
  static observedAttributes = ["value"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const slot = document.createElement("slot");
    this.shadowRoot.appendChild(slot);
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
var STYLES5 = `
  :host{display:inline-flex;}
  label{display:inline-flex;align-items:center;gap:10px;cursor:pointer;user-select:none;}
  input{position:absolute;opacity:0;width:40px;height:20px;margin:0;}
  .track{position:relative;flex:none;width:40px;height:20px;border-radius:999px;background:var(--tsl-input-bg);
    border:1.5px solid var(--tsl-text-secondary);transition:background var(--tsl-duration-base) var(--tsl-ease),
      border-color var(--tsl-duration-base) var(--tsl-ease);}
  .knob{position:absolute;top:3px;left:4px;width:12px;height:12px;border-radius:50%;background:var(--tsl-text-secondary);
    transition:transform var(--tsl-duration-base) var(--tsl-ease), background var(--tsl-duration-base) var(--tsl-ease),
      width var(--tsl-duration-fast) var(--tsl-ease), height var(--tsl-duration-fast) var(--tsl-ease);}
  label:hover .track{background:var(--tsl-control-hover);}
  input:checked ~ .track{background:var(--tsl-accent);border-color:var(--tsl-accent);}
  label:hover input:checked ~ .track{background:var(--tsl-accent-hover);border-color:var(--tsl-accent-hover);}
  input:checked ~ .track .knob{transform:translateX(20px);background:var(--tsl-on-accent);}
  label:active .knob{width:14px;}
  input:focus-visible ~ .track{outline:2px solid var(--tsl-accent);outline-offset:3px;}
  :host([disabled]) label{pointer-events:none;}
  :host([disabled]) .track{opacity:var(--tsl-disabled-alpha);}
  .text{font-size:14px;color:var(--tsl-text);}
`;
var TesselSwitch = class extends TesselElement {
  static styles = STYLES5;
  static observedAttributes = ["disabled", "checked"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const label2 = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    const track = document.createElement("span");
    track.className = "track";
    const knob = document.createElement("span");
    knob.className = "knob";
    track.appendChild(knob);
    const text = document.createElement("span");
    text.className = "text";
    text.appendChild(document.createElement("slot"));
    label2.append(input, track, text);
    this.shadowRoot.appendChild(label2);
    this._input = input;
    this._sync();
    input.addEventListener("change", () => {
      this.checked = input.checked;
      this.emit("change", { checked: this.checked });
    });
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    this._input.checked = this.hasAttribute("checked");
    this._input.disabled = this.disabled;
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
var STYLES6 = `
  :host{display:inline-flex;width:220px;}
  .field{position:relative;display:flex;align-items:center;gap:8px;width:100%;height:32px;padding:0 10px;
    border-radius:var(--tsl-radius-md);border:1px solid var(--tsl-border);background:var(--tsl-input-bg);
    overflow:hidden;transition:border-color var(--tsl-duration-fast) var(--tsl-ease);}
  .field:hover{border-color:var(--tsl-border-strong);}
  .field.focused{border-color:var(--tsl-accent);}
  .field::after{content:"";position:absolute;left:1px;right:1px;bottom:0;height:0;background:var(--tsl-accent);
    transition:height var(--tsl-duration-fast) var(--tsl-ease);}
  .field.focused::after{height:2px;}
  .icon{flex:none;display:flex;color:var(--tsl-text-secondary);}
  input{flex:1;min-width:0;border:none;background:transparent;outline:none;font:inherit;font-size:14px;color:var(--tsl-text);
    padding:0;height:100%;}
  input::placeholder{color:var(--tsl-text-tertiary);}
  :host([disabled]) .field{opacity:var(--tsl-disabled-alpha);}
`;
var TesselTextField = class extends TesselElement {
  static styles = STYLES6;
  static observedAttributes = ["disabled", "icon", "placeholder", "type", "value", "readonly"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const field = document.createElement("div");
    field.className = "field";
    this._iconSlot = document.createElement("span");
    this._iconSlot.className = "icon";
    const input = document.createElement("input");
    field.append(this._iconSlot, input);
    this.shadowRoot.appendChild(field);
    this._field = field;
    this._input = input;
    this._sync();
    input.addEventListener("focus", () => field.classList.add("focused"));
    input.addEventListener("blur", () => field.classList.remove("focused"));
    input.addEventListener("input", () => {
      this.setAttribute("value", input.value);
      this.emit("input", { value: input.value });
    });
    input.addEventListener("change", () => this.emit("change", { value: input.value }));
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    this._input.type = this.getAttribute("type") || "text";
    this._input.placeholder = this.getAttribute("placeholder") || "";
    this._input.disabled = this.disabled;
    this._input.readOnly = this.hasAttribute("readonly");
    if (this.hasAttribute("value") && this._input.value !== this.getAttribute("value")) {
      this._input.value = this.getAttribute("value");
    }
    const icon = this.getAttribute("icon");
    this._iconSlot.innerHTML = icon ? createIcon(icon, 16).innerHTML : "";
    this._iconSlot.style.display = icon ? "" : "none";
  }
  get value() {
    return this._input ? this._input.value : this.getAttribute("value") || "";
  }
  set value(v) {
    this.setAttribute("value", v);
    if (this._input) this._input.value = v;
  }
  focus(options) {
    this._input?.focus(options);
  }
};
define("tsl-text-field", TesselTextField);

// src/components/text-area.js
var STYLES7 = `
  :host{display:inline-flex;width:280px;}
  .field{position:relative;display:flex;width:100%;border-radius:var(--tsl-radius-md);border:1px solid var(--tsl-border);
    background:var(--tsl-input-bg);overflow:hidden;transition:border-color var(--tsl-duration-fast) var(--tsl-ease);}
  .field:hover{border-color:var(--tsl-border-strong);}
  .field.focused{border-color:var(--tsl-accent);}
  textarea{flex:1;border:none;background:transparent;outline:none;font:inherit;font-size:14px;color:var(--tsl-text);
    padding:6px 10px;resize:vertical;min-height:64px;line-height:1.4;}
  textarea::placeholder{color:var(--tsl-text-tertiary);}
  :host([disabled]) .field{opacity:var(--tsl-disabled-alpha);}
`;
var TesselTextArea = class extends TesselElement {
  static styles = STYLES7;
  static observedAttributes = ["disabled", "placeholder", "rows", "value", "readonly"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const field = document.createElement("div");
    field.className = "field";
    const textarea = document.createElement("textarea");
    const initial = this.getAttribute("value") ?? this.textContent.trim();
    if (initial) textarea.value = initial;
    field.appendChild(textarea);
    this.shadowRoot.appendChild(field);
    this._field = field;
    this._textarea = textarea;
    this._sync();
    textarea.addEventListener("focus", () => field.classList.add("focused"));
    textarea.addEventListener("blur", () => field.classList.remove("focused"));
    textarea.addEventListener("input", () => this.emit("input", { value: textarea.value }));
    textarea.addEventListener("change", () => this.emit("change", { value: textarea.value }));
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    this._textarea.placeholder = this.getAttribute("placeholder") || "";
    this._textarea.rows = Number(this.getAttribute("rows")) || 4;
    this._textarea.disabled = this.disabled;
    this._textarea.readOnly = this.hasAttribute("readonly");
  }
  get value() {
    return this._textarea ? this._textarea.value : "";
  }
  set value(v) {
    if (this._textarea) this._textarea.value = v;
  }
};
define("tsl-text-area", TesselTextArea);

// src/components/select.js
var CLOSE_DURATION2 = parseInt(MOTION.fast, 10);
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
var STYLES8 = `
  :host{display:inline-flex;width:220px;position:relative;}
  .control{display:flex;align-items:center;gap:8px;width:100%;height:32px;padding:0 12px;
    border-radius:var(--tsl-radius-md);border:1px solid var(--tsl-border);background:var(--tsl-control-bg);
    cursor:pointer;font-size:14px;color:var(--tsl-text);transition:background var(--tsl-duration-fast) var(--tsl-ease),
      border-color var(--tsl-duration-fast) var(--tsl-ease);}
  .control:hover{background:var(--tsl-control-hover);}
  :host([open]) .control{border-color:var(--tsl-accent);}
  .control:focus-visible{outline:2px solid var(--tsl-accent);outline-offset:2px;}
  .value{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;}
  .value.placeholder{color:var(--tsl-text-tertiary);}
  .chevron{flex:none;display:flex;color:var(--tsl-text-secondary);transition:transform var(--tsl-duration-fast) var(--tsl-ease);}
  :host([open]) .chevron{transform:rotate(180deg);}
  .popup{position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:1000;background:var(--tsl-surface);
    border:1px solid var(--tsl-border);border-radius:var(--tsl-radius-md);box-shadow:0 8px 24px var(--tsl-shadow);
    padding:4px;max-height:260px;overflow:auto;display:none;opacity:0;transform:translateY(-4px) scale(0.98);
    transform-origin:top center;transition:opacity var(--tsl-duration-fast) var(--tsl-ease),
      transform var(--tsl-duration-fast) var(--tsl-ease);}
  :host([open]) .popup{display:block;}
  :host([visible]) .popup{opacity:1;transform:translateY(0) scale(1);}
  .option{position:relative;display:flex;align-items:center;gap:8px;min-height:32px;padding:7px 10px 7px 14px;
    border-radius:var(--tsl-radius-sm);cursor:pointer;color:var(--tsl-text);
    transition:background var(--tsl-duration-fast) var(--tsl-ease);}
  .option:hover{background:var(--tsl-control-hover);}
  .option[aria-selected="true"]{background:var(--tsl-subtle);}
  .option[aria-selected="true"]::before{content:"";position:absolute;left:1px;top:8px;bottom:8px;width:3px;
    border-radius:1.5px;background:var(--tsl-accent);}
  .option .check{margin-left:auto;flex:none;color:var(--tsl-accent);opacity:0;}
  .option[aria-selected="true"] .check{opacity:1;}
  .option[aria-disabled="true"]{opacity:var(--tsl-disabled-alpha);pointer-events:none;}
  :host([disabled]) .control{opacity:var(--tsl-disabled-alpha);pointer-events:none;}
`;
var TesselSelect = class extends TesselElement {
  static styles = STYLES8;
  static observedAttributes = ["disabled", "value", "placeholder", "open"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) {
      this._readOptions();
      return;
    }
    this._built = true;
    const control = document.createElement("button");
    control.type = "button";
    control.className = "control";
    const value = document.createElement("span");
    value.className = "value";
    const chevron = document.createElement("span");
    chevron.className = "chevron";
    chevron.innerHTML = chevronSvg("down", 14);
    control.append(value, chevron);
    const popup = document.createElement("div");
    popup.className = "popup";
    popup.setAttribute("role", "listbox");
    this.shadowRoot.append(control, popup);
    this._control = control;
    this._valueEl = value;
    this._popup = popup;
    control.addEventListener("click", () => this.open ? this.close() : this.openMenu());
    control.addEventListener("keydown", (e) => this._onKeydown(e));
    this._onDocPointer = (e) => {
      if (!this.contains(e.target) && !this.shadowRoot.contains(e.target)) this.close();
    };
    this._mo = new MutationObserver(() => this._readOptions());
    this._mo.observe(this, { childList: true, characterData: true, subtree: true });
    this._readOptions();
  }
  disconnectedCallback() {
    document.removeEventListener("pointerdown", this._onDocPointer);
    this._mo?.disconnect();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === "value") this._render();
  }
  _readOptions() {
    this._options = Array.from(this.querySelectorAll("tsl-option"));
    this._render();
  }
  _render() {
    if (!this._popup) return;
    const value = this.getAttribute("value");
    this._popup.innerHTML = "";
    let matched = null;
    for (const opt of this._options) {
      const row = document.createElement("div");
      row.className = "option";
      row.setAttribute("role", "option");
      row.dataset.value = opt.value;
      if (opt.hasAttribute("disabled")) row.setAttribute("aria-disabled", "true");
      const selected = opt.value === value;
      if (selected) {
        row.setAttribute("aria-selected", "true");
        matched = opt;
      }
      const label2 = document.createElement("span");
      label2.textContent = opt.label;
      const check = document.createElement("span");
      check.className = "check";
      check.innerHTML = checkmarkSvg(14, 2);
      row.append(label2, check);
      row.addEventListener("click", () => {
        if (opt.hasAttribute("disabled")) return;
        this.value = opt.value;
        this.close();
        this.emit("change", { value: opt.value });
      });
      this._popup.appendChild(row);
    }
    this._valueEl.textContent = matched ? matched.label : this.getAttribute("placeholder") || "";
    this._valueEl.classList.toggle("placeholder", !matched);
  }
  _onKeydown(e) {
    const openNow = () => {
      if (!this.open) this.openMenu();
    };
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openNow();
      const dir = e.key === "ArrowDown" ? 1 : -1;
      const enabled = this._options.filter((o) => !o.hasAttribute("disabled"));
      const idx = enabled.findIndex((o) => o.value === this.getAttribute("value"));
      const next = enabled[(idx + dir + enabled.length) % enabled.length] || enabled[0];
      if (next) {
        this.value = next.value;
        this.emit("change", { value: next.value });
      }
    } else if (e.key === "Escape") {
      this.close();
    }
  }
  openMenu() {
    if (this.disabled) return;
    openAnimated(this);
    document.addEventListener("pointerdown", this._onDocPointer);
  }
  close() {
    closeAnimated(this, CLOSE_DURATION2);
    document.removeEventListener("pointerdown", this._onDocPointer);
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
var STYLES9 = `
  :host{display:inline-flex;width:200px;}
  input[type="range"]{-webkit-appearance:none;appearance:none;width:100%;height:20px;background:transparent;margin:0;}
  input[type="range"]::-webkit-slider-runnable-track{height:4px;border-radius:2px;
    background:linear-gradient(to right, var(--tsl-accent) 0%, var(--tsl-accent) var(--fill,0%),
      var(--tsl-border-strong) var(--fill,0%), var(--tsl-border-strong) 100%);}
  input[type="range"]::-moz-range-track{height:4px;border-radius:2px;background:var(--tsl-border-strong);}
  input[type="range"]::-moz-range-progress{height:4px;border-radius:2px;background:var(--tsl-accent);}
  /* The center dot is a radial-gradient sized entirely by its own circle-radius argument \u2014 not via
     background-size, which was squeezing a 6px-radius (12px-diameter) circle into a 6x6px box.
     Since the circle was more than twice the size of the box it was supposed to fade out within,
     the box ended up solid-filled edge to edge, rendering as a square instead of a dot. */
  input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;margin-top:-8px;width:20px;height:20px;
    border-radius:50%;border:1px solid var(--tsl-border-strong);
    background:radial-gradient(circle 3px at center, var(--tsl-accent) 99%, transparent 100%),
      var(--tsl-surface);cursor:pointer;transition:background var(--tsl-duration-fast) var(--tsl-ease);}
  input[type="range"]::-moz-range-thumb{width:18px;height:18px;border-radius:50%;border:1px solid var(--tsl-border-strong);
    background:radial-gradient(circle 3px at center, var(--tsl-accent) 99%, transparent 100%),
      var(--tsl-surface);cursor:pointer;transition:background var(--tsl-duration-fast) var(--tsl-ease);}
  input[type="range"]:active::-webkit-slider-thumb{background:radial-gradient(circle 2.5px at center, var(--tsl-accent) 99%, transparent 100%), var(--tsl-surface);}
  input[type="range"]:hover::-webkit-slider-thumb{background:radial-gradient(circle 3.5px at center, var(--tsl-accent) 99%, transparent 100%), var(--tsl-surface);}
  input[type="range"]:active::-moz-range-thumb{background:radial-gradient(circle 2.5px at center, var(--tsl-accent) 99%, transparent 100%), var(--tsl-surface);}
  input[type="range"]:hover::-moz-range-thumb{background:radial-gradient(circle 3.5px at center, var(--tsl-accent) 99%, transparent 100%), var(--tsl-surface);}
  input[type="range"]:focus-visible::-webkit-slider-thumb{outline:2px solid var(--tsl-accent);outline-offset:2px;}
  input[type="range"]:focus-visible::-moz-range-thumb{outline:2px solid var(--tsl-accent);outline-offset:2px;}
  :host([disabled]) input{opacity:var(--tsl-disabled-alpha);pointer-events:none;}
`;
var TesselSlider = class extends TesselElement {
  static styles = STYLES9;
  static observedAttributes = ["disabled", "min", "max", "step", "value"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const input = document.createElement("input");
    input.type = "range";
    this.shadowRoot.appendChild(input);
    this._input = input;
    this._sync();
    input.addEventListener("input", () => {
      this.setAttribute("value", input.value);
      this._updateFill();
      this.emit("input", { value: this.value });
    });
    input.addEventListener("change", () => this.emit("change", { value: this.value }));
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    this._input.min = this.getAttribute("min") ?? "0";
    this._input.max = this.getAttribute("max") ?? "100";
    this._input.step = this.getAttribute("step") ?? "1";
    if (this.hasAttribute("value")) this._input.value = this.getAttribute("value");
    this._input.disabled = this.disabled;
    this._updateFill();
  }
  _updateFill() {
    const min = Number(this._input.min), max = Number(this._input.max), value = Number(this._input.value);
    const pct = max > min ? (value - min) / (max - min) * 100 : 0;
    this._input.style.setProperty("--fill", `${pct}%`);
  }
  get value() {
    return Number(this._input ? this._input.value : this.getAttribute("value") || 0);
  }
  set value(v) {
    this.setAttribute("value", String(v));
  }
};
define("tsl-slider", TesselSlider);

// src/components/progress-bar.js
var STYLES10 = `
  :host{display:block;width:220px;}
  .track{position:relative;width:100%;height:4px;border-radius:2px;background:var(--tsl-subtle);overflow:hidden;}
  .fill{position:absolute;top:0;bottom:0;left:0;width:0;border-radius:2px;background:var(--tsl-accent);
    transition:width var(--tsl-duration-base) var(--tsl-ease);}
  :host([indeterminate]) .fill{width:30%;animation:tsl-indeterminate 1400ms linear infinite;}
  @keyframes tsl-indeterminate{
    0%{left:-30%;}
    100%{left:100%;}
  }
  :host([disabled]) .track{opacity:var(--tsl-disabled-alpha);}
`;
var TesselProgressBar = class extends TesselElement {
  static styles = STYLES10;
  static observedAttributes = ["value", "max", "indeterminate", "disabled"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const track = document.createElement("div");
    track.className = "track";
    track.setAttribute("role", "progressbar");
    const fill = document.createElement("div");
    fill.className = "fill";
    track.appendChild(fill);
    this.shadowRoot.appendChild(track);
    this._track = track;
    this._fill = fill;
    this._sync();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    const max = Number(this.getAttribute("max")) || 100;
    const value = Number(this.getAttribute("value")) || 0;
    if (!this.hasAttribute("indeterminate")) {
      const pct = Math.max(0, Math.min(100, value / max * 100));
      this._fill.style.width = `${pct}%`;
      this._track.setAttribute("aria-valuenow", String(value));
      this._track.setAttribute("aria-valuemax", String(max));
    } else {
      this._fill.style.width = "";
      this._track.removeAttribute("aria-valuenow");
    }
  }
};
define("tsl-progress-bar", TesselProgressBar);

// src/components/list.js
var ITEM_STYLES = `
  :host{display:block;}
  .row{position:relative;display:flex;align-items:center;gap:10px;min-height:36px;margin:1px 4px;
    padding:8px 12px;border-radius:var(--tsl-radius-sm);color:var(--tsl-text);font-size:14px;cursor:pointer;
    transition:background var(--tsl-duration-fast) var(--tsl-ease);}
  .row:hover{background:var(--tsl-control-hover);}
  :host([selected]) .row{background:var(--tsl-subtle);}
  :host([selected]) .row::before{content:"";position:absolute;left:-3px;top:6px;bottom:6px;width:3px;
    border-radius:1.5px;background:var(--tsl-accent);}
  :host([disabled]) .row{opacity:var(--tsl-disabled-alpha);pointer-events:none;}
`;
var TesselListItem = class extends TesselElement {
  static styles = ITEM_STYLES;
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const row = document.createElement("div");
    row.className = "row";
    row.setAttribute("role", "option");
    row.appendChild(document.createElement("slot"));
    this.shadowRoot.appendChild(row);
    row.addEventListener("click", () => {
      if (this.disabled) return;
      this.dispatchEvent(new CustomEvent("tsl-item-click", { bubbles: true, composed: true, detail: { value: this.value } }));
    });
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
var LIST_STYLES = `
  :host{display:block;padding:4px 0;border-radius:var(--tsl-radius-md);background:var(--tsl-surface);
    border:1px solid var(--tsl-border);overflow:auto;}
`;
var TesselList = class extends TesselElement {
  static styles = LIST_STYLES;
  static observedAttributes = ["value"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) {
      this._applySelection();
      return;
    }
    this._built = true;
    const slot = document.createElement("slot");
    this.shadowRoot.appendChild(slot);
    this.setAttribute("role", "listbox");
    this.addEventListener("tsl-item-click", (e) => {
      this.value = e.detail.value;
      this.emit("change", { value: this.value });
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
    for (const item of this._items()) item.selected = item.value === value;
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
var ITEM_STYLES2 = `
  :host{display:block;}
  .row{position:relative;display:flex;align-items:center;gap:8px;height:32px;padding:0 8px 0 2px;
    border-radius:var(--tsl-radius-sm);color:var(--tsl-text);font-size:14px;cursor:pointer;user-select:none;
    transition:background var(--tsl-duration-fast) var(--tsl-ease);}
  .row:hover{background:var(--tsl-control-hover);}
  :host([selected]) > .row{background:var(--tsl-subtle);}
  :host([selected]) > .row::before{content:"";position:absolute;left:-2px;top:8px;bottom:8px;width:3px;
    border-radius:1.5px;background:var(--tsl-accent);}
  .chevron{flex:none;width:16px;height:16px;display:flex;align-items:center;justify-content:center;
    color:var(--tsl-text-secondary);transition:transform var(--tsl-duration-fast) var(--tsl-ease);visibility:hidden;}
  :host([has-children]) .chevron{visibility:visible;}
  :host([expanded]) .chevron{transform:rotate(90deg);}
  .icon{flex:none;display:flex;color:var(--tsl-accent);}
  .label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .children{overflow:hidden;padding-left:22px;max-height:0;
    transition:max-height var(--tsl-duration-slow) var(--tsl-ease);}
`;
var TesselTreeItem = class _TesselTreeItem extends TesselElement {
  static styles = ITEM_STYLES2;
  static observedAttributes = ["label", "icon", "expanded", "selected", "folder"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) {
      this._detectChildren();
      return;
    }
    this._built = true;
    const row = document.createElement("div");
    row.className = "row";
    row.tabIndex = 0;
    row.setAttribute("role", "treeitem");
    this._chevron = document.createElement("span");
    this._chevron.className = "chevron";
    this._chevron.innerHTML = chevronSvg("right", 14);
    this._icon = document.createElement("span");
    this._icon.className = "icon";
    this._label = document.createElement("span");
    this._label.className = "label";
    row.append(this._chevron, this._icon, this._label);
    this._children = document.createElement("div");
    this._children.className = "children";
    const slot = document.createElement("slot");
    slot.addEventListener("slotchange", () => {
      if (this.expanded) this._applyHeight(true);
    });
    this._children.appendChild(slot);
    this.shadowRoot.append(row, this._children);
    row.addEventListener("click", () => {
      if (this.hasAttribute("has-children")) this.expanded = !this.expanded;
      this.dispatchEvent(new CustomEvent("tsl-tree-select", { bubbles: true, composed: true, detail: { item: this } }));
    });
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        row.click();
      }
    });
    this._mo = new MutationObserver(() => this._detectChildren());
    this._mo.observe(this, { childList: true });
    this._sync();
    this._detectChildren();
    this._applyHeight(true);
  }
  disconnectedCallback() {
    this._mo?.disconnect();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    this._sync();
    if (name === "expanded") this._applyHeight(false);
  }
  _detectChildren() {
    const has = this.querySelector("tsl-tree-item") !== null;
    this.toggleAttribute("has-children", has);
    this._sync();
    if (this.expanded) this._applyHeight(true);
  }
  /**
   * max-height can't transition to/from 'none' (it isn't an interpolatable value along with a
   * length), so an actual pixel height has to be measured and animated instead — same technique as
   * <tsl-expander>. `firstPaint` skips the transition (and the scrollHeight measurement) for a
   * pre-expanded item: not just to avoid animating open on load, but because a tree can perfectly
   * legitimately start inside a hidden container (a not-yet-shown nav page or tab) — scrollHeight
   * always reads 0 there, so baking that in as a fixed pixel cap would wrongly clip the content the
   * moment the container becomes visible. `max-height:none` has no such problem; the first actual
   * interactive collapse (only possible once the tree is genuinely visible) measures a real height.
   */
  _applyHeight(firstPaint) {
    const kids = this._children;
    if (!this.expanded) {
      kids.style.maxHeight = "0px";
      return;
    }
    if (firstPaint) {
      kids.style.transition = "none";
      kids.style.maxHeight = "none";
      kids.getBoundingClientRect();
      kids.style.transition = "";
      return;
    }
    kids.style.maxHeight = `${kids.scrollHeight}px`;
    this._notifyParentHeightChange();
  }
  /** Growing/shrinking changes this item's own rendered height — an expanded ancestor's fixed
   * max-height cap needs to grow/shrink along with it, or its content would end up clipped. */
  _notifyParentHeightChange() {
    const parent = this.parentElement;
    if (parent instanceof _TesselTreeItem && parent.expanded) parent._applyHeight(false);
  }
  _sync() {
    this._label.textContent = this.getAttribute("label") || "";
    const icon = this.getAttribute("icon");
    const hasChildren = this.hasAttribute("has-children");
    const isFolder = this.hasAttribute("folder") || hasChildren;
    this._icon.innerHTML = "";
    if (icon) this._icon.appendChild(createIcon(icon, 16));
    else this._icon.innerHTML = isFolder ? folderSvg(16) : fileSvg(16);
  }
  get expanded() {
    return this.hasAttribute("expanded");
  }
  set expanded(v) {
    const next = !!v;
    if (!next && this.expanded && this._children) {
      this._children.style.maxHeight = `${this._children.scrollHeight}px`;
      this._children.getBoundingClientRect();
    }
    this.toggleAttribute("expanded", next);
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
var TREE_STYLES = `:host{display:block;padding:4px;}`;
var TesselTree = class extends TesselElement {
  static styles = TREE_STYLES;
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this.setAttribute("role", "tree");
    this.shadowRoot.appendChild(document.createElement("slot"));
    this.addEventListener("tsl-tree-select", (e) => {
      for (const item of this.querySelectorAll("tsl-tree-item")) item.selected = item === e.detail.item;
      this.emit("change", { item: e.detail.item, label: e.detail.item.label });
    });
  }
};
define("tsl-tree-item", TesselTreeItem);
define("tsl-tree", TesselTree);

// src/components/table.js
var tableStylesInstalled = false;
function installTableStyles() {
  if (tableStylesInstalled) return;
  tableStylesInstalled = true;
  const style2 = document.createElement("style");
  style2.id = "tessel-table-cell-styles";
  style2.textContent = `
    tsl-table table{width:100%;border-collapse:collapse;border-spacing:0;font-size:14px;color:var(--tsl-text);}
    tsl-table thead th{text-align:left;font-size:11px;font-weight:700;color:var(--tsl-text-secondary);
      text-transform:uppercase;letter-spacing:0.04em;padding:13px 20px;background:var(--tsl-subtle);
      border-bottom:1px solid var(--tsl-border);position:sticky;top:0;}
    tsl-table thead th:first-child{border-top-left-radius:var(--tsl-radius-lg);}
    tsl-table thead th:last-child{border-top-right-radius:var(--tsl-radius-lg);}
    tsl-table tbody td{height:44px;padding:0 20px;border-bottom:1px solid var(--tsl-border);}
    tsl-table tbody tr:last-child td{border-bottom:none;}
    tsl-table tbody tr{transition:background var(--tsl-duration-fast) var(--tsl-ease);}
    tsl-table tbody tr:nth-child(even){background:var(--tsl-surface-alt);}
    tsl-table tbody tr:hover{background:var(--tsl-control-hover);}
    tsl-table tbody tr[aria-selected="true"]{background:var(--tsl-accent-subtle);}
    tsl-table tbody tr:last-child td:first-child{border-bottom-left-radius:var(--tsl-radius-lg);}
    tsl-table tbody tr:last-child td:last-child{border-bottom-right-radius:var(--tsl-radius-lg);}
  `;
  document.head.appendChild(style2);
}
var STYLES11 = `
  :host{display:block;overflow:auto;border:1px solid var(--tsl-border);border-radius:var(--tsl-radius-lg);
    background:var(--tsl-surface);box-shadow:0 1px 2px var(--tsl-shadow);}
`;
var TesselTable = class extends TesselElement {
  static styles = STYLES11;
  connectedCallback() {
    super.connectedCallback();
    installTableStyles();
    if (this._built) return;
    this._built = true;
    this.shadowRoot.appendChild(document.createElement("slot"));
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
var STYLES12 = `
  :host{display:block;}
  .strip{position:relative;display:flex;gap:2px;border-bottom:1px solid var(--tsl-border);}
  .tab{position:relative;display:flex;align-items:center;padding:10px 14px;font-size:14px;
    color:var(--tsl-text-secondary);background:transparent;border:none;cursor:pointer;font:inherit;border-radius:4px 4px 0 0;
    transition:color var(--tsl-duration-fast) var(--tsl-ease), background var(--tsl-duration-fast) var(--tsl-ease);}
  .tab:hover{background:var(--tsl-control-hover);color:var(--tsl-text);}
  .tab[aria-selected="true"]{color:var(--tsl-text);}
  .tab:focus-visible{outline:2px solid var(--tsl-accent);outline-offset:-2px;}
  .tab[aria-disabled="true"]{opacity:var(--tsl-disabled-alpha);pointer-events:none;}
  .indicator{position:absolute;left:0;bottom:-1px;height:3px;border-radius:1.5px;background:var(--tsl-accent);
    width:0;transform:translateX(0);transition:transform var(--tsl-duration-base) var(--tsl-ease),
      width var(--tsl-duration-base) var(--tsl-ease);pointer-events:none;}
  .panels{padding-top:16px;}
  ::slotted(tsl-tab-panel:not([hidden])){display:block;}
`;
var TesselTabs = class extends TesselElement {
  static styles = STYLES12;
  static observedAttributes = ["value"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) {
      this._readTabs();
      return;
    }
    this._built = true;
    const strip = document.createElement("div");
    strip.className = "strip";
    strip.setAttribute("role", "tablist");
    const panels = document.createElement("div");
    panels.className = "panels";
    panels.appendChild(document.createElement("slot"));
    this._indicator = document.createElement("div");
    this._indicator.className = "indicator";
    strip.appendChild(this._indicator);
    this.shadowRoot.append(strip, panels);
    this._strip = strip;
    this._mo = new MutationObserver(() => this._readTabs());
    this._mo.observe(this, { childList: true, characterData: true, subtree: true });
    this._readTabs();
  }
  disconnectedCallback() {
    this._mo?.disconnect();
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
  _readTabs() {
    const tabs = this._tabs();
    if (!this.hasAttribute("value") && tabs[0]) this.setAttribute("value", tabs[0].value);
    this._strip.innerHTML = "";
    for (const tab of tabs) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tab";
      btn.setAttribute("role", "tab");
      btn.textContent = tab.label;
      if (tab.hasAttribute("disabled")) btn.setAttribute("aria-disabled", "true");
      btn.addEventListener("click", () => {
        if (tab.hasAttribute("disabled")) return;
        this.value = tab.value;
        this.emit("change", { value: tab.value });
      });
      this._strip.appendChild(btn);
    }
    this._strip.appendChild(this._indicator);
    this._render(true);
  }
  _render(skipAnimation = false) {
    const value = this.getAttribute("value");
    const tabs = this._tabs();
    let selectedBtn = null;
    Array.from(this._strip.children).forEach((btn, i) => {
      if (!(btn instanceof HTMLButtonElement)) return;
      const selected = tabs[i]?.value === value;
      btn.setAttribute("aria-selected", String(selected));
      if (selected) selectedBtn = btn;
    });
    for (const panel of this._panels()) panel.hidden = panel.value !== value;
    this._moveIndicator(selectedBtn, skipAnimation);
  }
  _moveIndicator(btn, skipAnimation) {
    const indicator = this._indicator;
    if (!btn) {
      indicator.style.width = "0";
      return;
    }
    const prevTransition = indicator.style.transition;
    if (skipAnimation) indicator.style.transition = "none";
    indicator.style.transform = `translateX(${btn.offsetLeft + 12}px)`;
    indicator.style.width = `${Math.max(0, btn.offsetWidth - 24)}px`;
    if (skipAnimation) {
      indicator.getBoundingClientRect();
      indicator.style.transition = prevTransition;
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

// src/components/menu.js
var CLOSE_DURATION3 = parseInt(MOTION.fast, 10);
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
var STYLES13 = `
  :host{display:inline-flex;position:relative;}
  .popup{position:absolute;top:calc(100% + 4px);left:0;min-width:200px;z-index:1000;background:var(--tsl-surface);
    border:1px solid var(--tsl-border);border-radius:var(--tsl-radius-md);box-shadow:0 8px 24px var(--tsl-shadow);
    padding:4px;display:none;opacity:0;transform:translateY(-4px) scale(0.98);transform-origin:top left;
    transition:opacity var(--tsl-duration-fast) var(--tsl-ease), transform var(--tsl-duration-fast) var(--tsl-ease);}
  :host([align="right"]) .popup{left:auto;right:0;transform-origin:top right;}
  :host([open]) .popup{display:block;}
  :host([visible]) .popup{opacity:1;transform:translateY(0) scale(1);}
  .row{position:relative;display:flex;align-items:center;gap:12px;min-height:32px;padding:6px 10px;
    border-radius:var(--tsl-radius-sm);color:var(--tsl-text);font-size:14px;cursor:pointer;background:transparent;
    border:none;width:100%;text-align:left;font:inherit;transition:background var(--tsl-duration-fast) var(--tsl-ease);}
  .row:hover{background:var(--tsl-control-hover);}
  .row .icon{flex:none;display:flex;color:var(--tsl-text-secondary);width:16px;}
  .row .label{flex:1;min-width:0;}
  .row .check{flex:none;color:var(--tsl-accent);opacity:0;width:16px;display:flex;}
  .row[aria-checked="true"] .check{opacity:1;}
  .row[aria-disabled="true"]{opacity:var(--tsl-disabled-alpha);pointer-events:none;}
  .sep{height:1px;background:var(--tsl-border);margin:4px 6px;}
`;
var TesselMenuButton = class extends TesselElement {
  static styles = STYLES13;
  static observedAttributes = ["label", "icon", "open", "disabled"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) {
      this._readItems();
      return;
    }
    this._built = true;
    const trigger = document.createElement("slot");
    trigger.name = "trigger";
    trigger.addEventListener("click", () => this._toggleTrigger());
    this._defaultTrigger = document.createElement("tsl-button");
    this._defaultTrigger.setAttribute("variant", "standard");
    this._defaultTrigger.addEventListener("click", () => this._toggleTrigger());
    const popup = document.createElement("div");
    popup.className = "popup";
    popup.setAttribute("role", "menu");
    this.shadowRoot.append(trigger, this._defaultTrigger, popup);
    this._popup = popup;
    this._onDocPointer = (e) => {
      if (!this.contains(e.target) && !this.shadowRoot.contains(e.target)) this.close();
    };
    this._mo = new MutationObserver(() => this._readItems());
    this._mo.observe(this, { childList: true, characterData: true, subtree: true });
    this._sync();
    this._readItems();
  }
  disconnectedCallback() {
    document.removeEventListener("pointerdown", this._onDocPointer);
    this._mo?.disconnect();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === "label" || name === "icon" || name === "disabled") this._sync();
  }
  _toggleTrigger() {
    if (this.disabled) return;
    this.open ? this.close() : this.openMenu();
  }
  _sync() {
    const hasSlotted = this.querySelector('[slot="trigger"]');
    this._defaultTrigger.style.display = hasSlotted ? "none" : "";
    if (!hasSlotted) {
      this._defaultTrigger.textContent = this.getAttribute("label") || "";
      const icon = this.getAttribute("icon");
      if (icon) this._defaultTrigger.setAttribute("icon", icon);
      this._defaultTrigger.disabled = this.disabled;
    }
  }
  _menuChildren() {
    return Array.from(this.children).filter(
      (c) => c instanceof TesselMenuItem || c instanceof TesselMenuSeparator
    );
  }
  _readItems() {
    this._popup.innerHTML = "";
    for (const child of this._menuChildren()) {
      if (child instanceof TesselMenuSeparator) {
        const sep = document.createElement("div");
        sep.className = "sep";
        this._popup.appendChild(sep);
        continue;
      }
      const row = document.createElement("button");
      row.type = "button";
      row.className = "row";
      row.setAttribute("role", child instanceof TesselMenuCheckboxItem ? "menuitemcheckbox" : "menuitem");
      if (child.hasAttribute("disabled")) row.setAttribute("aria-disabled", "true");
      const icon = document.createElement("span");
      icon.className = "icon";
      if (child.icon) icon.appendChild(createIcon(child.icon, 16));
      const label2 = document.createElement("span");
      label2.className = "label";
      label2.textContent = child.label;
      const check = document.createElement("span");
      check.className = "check";
      check.innerHTML = checkmarkSvg(14, 2);
      row.append(icon, label2, check);
      if (child instanceof TesselMenuCheckboxItem) {
        row.setAttribute("aria-checked", String(child.checked));
        row.addEventListener("click", () => {
          if (child.hasAttribute("disabled")) return;
          child.checked = !child.checked;
          row.setAttribute("aria-checked", String(child.checked));
          this.emit("change", { value: child.value, checked: child.checked });
        });
      } else {
        row.addEventListener("click", () => {
          if (child.hasAttribute("disabled")) return;
          this.emit("select", { value: child.value });
          this.close();
        });
      }
      this._popup.appendChild(row);
    }
  }
  openMenu() {
    if (this.disabled) return;
    openAnimated(this);
    document.addEventListener("pointerdown", this._onDocPointer);
  }
  close() {
    closeAnimated(this, CLOSE_DURATION3);
    document.removeEventListener("pointerdown", this._onDocPointer);
  }
  get open() {
    return this.hasAttribute("open");
  }
};
define("tsl-menu-button", TesselMenuButton);

// src/components/separator.js
var STYLES14 = `
  :host{display:block;background:var(--tsl-border);}
  :host(:not([vertical])){width:100%;height:1px;margin:8px 0;}
  :host([vertical]){width:1px;height:100%;margin:0 8px;align-self:stretch;}
`;
var TesselSeparator = class extends TesselElement {
  static styles = STYLES14;
};
define("tsl-separator", TesselSeparator);

// src/components/number-box.js
var STYLES15 = `
  :host{display:inline-flex;width:120px;}
  .field{display:flex;align-items:stretch;width:100%;height:32px;border-radius:var(--tsl-radius-md);
    border:1px solid var(--tsl-border);background:var(--tsl-input-bg);overflow:hidden;
    transition:border-color var(--tsl-duration-fast) var(--tsl-ease);}
  .field:hover{border-color:var(--tsl-border-strong);}
  .field.focused{border-color:var(--tsl-accent);}
  input{flex:1;min-width:0;border:none;background:transparent;outline:none;font:inherit;font-size:14px;
    color:var(--tsl-text);padding:0 10px;-moz-appearance:textfield;}
  input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
  .steppers{display:flex;flex-direction:column;flex:none;width:28px;border-left:1px solid var(--tsl-border);}
  .steppers button{flex:1;display:flex;align-items:center;justify-content:center;border:none;background:transparent;
    color:var(--tsl-text-secondary);cursor:pointer;padding:0;}
  .steppers button:hover{background:var(--tsl-control-hover);color:var(--tsl-text);}
  .steppers button:active{background:var(--tsl-control-pressed);}
  .steppers button:first-child{border-bottom:1px solid var(--tsl-border);}
  :host([disabled]) .field{opacity:var(--tsl-disabled-alpha);pointer-events:none;}
`;
var TesselNumberBox = class extends TesselElement {
  static styles = STYLES15;
  static observedAttributes = ["disabled", "min", "max", "step", "value"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const field = document.createElement("div");
    field.className = "field";
    const input = document.createElement("input");
    input.type = "number";
    const steppers = document.createElement("div");
    steppers.className = "steppers";
    const up = document.createElement("button");
    up.type = "button";
    up.setAttribute("aria-label", "Increase");
    up.tabIndex = -1;
    up.innerHTML = '<svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><line x1="4" y1="10" x2="16" y2="10"/><line x1="10" y1="4" x2="10" y2="16"/></svg>';
    const down = document.createElement("button");
    down.type = "button";
    down.setAttribute("aria-label", "Decrease");
    down.tabIndex = -1;
    down.innerHTML = '<svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><line x1="4" y1="10" x2="16" y2="10"/></svg>';
    steppers.append(up, down);
    field.append(input, steppers);
    this.shadowRoot.appendChild(field);
    this._field = field;
    this._input = input;
    this._sync();
    up.addEventListener("click", () => {
      input.stepUp();
      this._commit();
    });
    down.addEventListener("click", () => {
      input.stepDown();
      this._commit();
    });
    input.addEventListener("focus", () => field.classList.add("focused"));
    input.addEventListener("blur", () => field.classList.remove("focused"));
    input.addEventListener("input", () => this._commit());
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
    if (this.hasAttribute("value")) this._input.value = this.getAttribute("value");
    this._input.disabled = this.disabled;
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
var STYLES16 = `
  :host{display:block;border-radius:var(--tsl-radius-lg);background:var(--tsl-surface);
    border:1px solid var(--tsl-border);padding:20px;box-shadow:0 0 0 rgba(0,0,0,0);
    transition:box-shadow var(--tsl-duration-base) var(--tsl-ease);}
  :host([elevated]){box-shadow:0 1px 2px var(--tsl-shadow), 0 8px 24px var(--tsl-shadow);}
  .header{font-size:16px;font-weight:600;color:var(--tsl-text);margin-bottom:14px;}
`;
var TesselCard = class extends TesselElement {
  static styles = STYLES16;
  static observedAttributes = ["header"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._header = document.createElement("div");
    this._header.className = "header";
    this.shadowRoot.append(this._header, document.createElement("slot"));
    this._sync();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    const header = this.getAttribute("header");
    this._header.textContent = header || "";
    this._header.style.display = header ? "" : "none";
  }
};
define("tsl-card", TesselCard);

// src/components/badge.js
var STYLES17 = `
  :host{display:inline-flex;}
  .pill{display:inline-flex;align-items:center;padding:2px 8px;border-radius:var(--tsl-radius-pill);
    font-size:12px;font-weight:600;line-height:1.5;white-space:nowrap;
    background:var(--tsl-subtle);color:var(--tsl-text-secondary);
    transition:background var(--tsl-duration-fast) var(--tsl-ease), color var(--tsl-duration-fast) var(--tsl-ease);}

  :host([kind="accent"]) .pill{background:var(--tsl-accent-subtle);color:var(--tsl-accent);}
  :host([kind="success"]) .pill{background:var(--tsl-success-subtle);color:var(--tsl-success);}
  :host([kind="warning"]) .pill{background:var(--tsl-warning-subtle);color:var(--tsl-warning);}
  :host([kind="danger"]) .pill{background:var(--tsl-danger-subtle);color:var(--tsl-danger);}
  :host([kind="info"]) .pill{background:var(--tsl-info-subtle);color:var(--tsl-info);}

  :host([solid]) .pill{color:var(--tsl-surface);background:var(--tsl-text-secondary);}
  :host([solid][kind="accent"]) .pill{background:var(--tsl-accent);color:var(--tsl-on-accent);}
  :host([solid][kind="success"]) .pill{background:var(--tsl-success);}
  :host([solid][kind="warning"]) .pill{background:var(--tsl-warning);}
  :host([solid][kind="danger"]) .pill{background:var(--tsl-danger);color:#fff;}
  :host([solid][kind="info"]) .pill{background:var(--tsl-info);}
`;
var TesselBadge = class extends TesselElement {
  static styles = STYLES17;
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const pill = document.createElement("span");
    pill.className = "pill";
    pill.appendChild(document.createElement("slot"));
    this.shadowRoot.appendChild(pill);
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
var STYLES18 = `
  :host{display:inline-flex;}
  .avatar{position:relative;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;
    overflow:hidden;background:var(--tsl-accent);color:#fff;font-weight:600;user-select:none;}
  img{width:100%;height:100%;object-fit:cover;}
`;
var TesselAvatar = class extends TesselElement {
  static styles = STYLES18;
  static observedAttributes = ["name", "size", "src"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    this._avatar = document.createElement("div");
    this._avatar.className = "avatar";
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
    this._avatar.style.width = `${size}px`;
    this._avatar.style.height = `${size}px`;
    this._avatar.style.fontSize = `${Math.max(8, size * 0.38)}px`;
    this._avatar.style.background = hashColor(name) || "var(--tsl-accent)";
    this._avatar.innerHTML = "";
    if (src) {
      const img = document.createElement("img");
      img.src = src;
      img.alt = name;
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
var STYLES19 = `
  :host{display:flex;}
  .row{display:flex;align-items:center;gap:16px;width:100%;min-height:68px;padding:12px 16px 12px 20px;
    border-radius:var(--tsl-radius-lg);border:1px solid var(--tsl-border);background:var(--tsl-surface);}
  .icon{flex:none;display:flex;color:var(--tsl-text-secondary);}
  .text{flex:1;min-width:0;}
  .header{font-size:14px;color:var(--tsl-text);}
  .description{font-size:12px;color:var(--tsl-text-tertiary);margin-top:2px;}
  .control{flex:none;display:flex;align-items:center;}
`;
var TesselSettingsCard = class extends TesselElement {
  static styles = STYLES19;
  static observedAttributes = ["header", "description", "icon"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const row = document.createElement("div");
    row.className = "row";
    this._icon = document.createElement("span");
    this._icon.className = "icon";
    const text = document.createElement("div");
    text.className = "text";
    this._header = document.createElement("div");
    this._header.className = "header";
    this._description = document.createElement("div");
    this._description.className = "description";
    text.append(this._header, this._description);
    const control = document.createElement("span");
    control.className = "control";
    const slot = document.createElement("slot");
    slot.name = "control";
    control.appendChild(slot);
    row.append(this._icon, text, control);
    this.shadowRoot.appendChild(row);
    this._sync();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (this._built) this._sync();
  }
  _sync() {
    const icon = this.getAttribute("icon");
    this._icon.innerHTML = icon ? createIcon(icon, 20).innerHTML : "";
    this._icon.style.display = icon ? "" : "none";
    this._header.textContent = this.getAttribute("header") || "";
    const description = this.getAttribute("description");
    this._description.textContent = description || "";
    this._description.style.display = description ? "" : "none";
  }
};
define("tsl-settings-card", TesselSettingsCard);

// src/components/expander.js
var STYLES20 = `
  :host{display:block;border-radius:var(--tsl-radius-lg);background:var(--tsl-surface);
    border:1px solid var(--tsl-border);overflow:hidden;}
  .header{display:flex;align-items:center;justify-content:space-between;height:46px;padding:0 12px 0 16px;
    cursor:pointer;font-size:14px;font-weight:600;color:var(--tsl-text);user-select:none;}
  .chevron-btn{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:4px;
    color:var(--tsl-text-secondary);transition:background var(--tsl-duration-fast) var(--tsl-ease);}
  .header:hover .chevron-btn{background:var(--tsl-control-hover);}
  .chevron-btn svg{transition:transform var(--tsl-duration-fast) var(--tsl-ease);}
  :host([expanded]) .chevron-btn svg{transform:rotate(180deg);}
  .body{border-top:1px solid transparent;padding:0 16px;max-height:0;overflow:hidden;
    transition:max-height var(--tsl-duration-slow) var(--tsl-ease), padding var(--tsl-duration-slow) var(--tsl-ease),
      border-color var(--tsl-duration-slow) var(--tsl-ease);}
  :host([expanded]) .body{border-top-color:var(--tsl-border);padding:16px;}
`;
var TesselExpander = class extends TesselElement {
  static styles = STYLES20;
  static observedAttributes = ["header", "expanded"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const header = document.createElement("div");
    header.className = "header";
    header.tabIndex = 0;
    header.setAttribute("role", "button");
    this._headerText = document.createElement("span");
    const chevron = document.createElement("span");
    chevron.className = "chevron-btn";
    chevron.innerHTML = chevronSvg("down", 16);
    header.append(this._headerText, chevron);
    this._body = document.createElement("div");
    this._body.className = "body";
    const slot = document.createElement("slot");
    slot.addEventListener("slotchange", () => {
      if (this.expanded) this._applyHeight(true);
    });
    this._body.appendChild(slot);
    this.shadowRoot.append(header, this._body);
    const toggle = () => {
      this.expanded = !this.expanded;
      this.emit("toggle", { expanded: this.expanded });
    };
    header.addEventListener("click", toggle);
    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
    this._headerText.textContent = this.getAttribute("header") || "";
    this._applyHeight(true);
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    this._headerText.textContent = this.getAttribute("header") || "";
    if (name === "expanded") this._applyHeight(false);
  }
  /**
   * max-height can't transition to/from 'none' (it isn't an interpolatable value along with a
   * length), so an actual pixel height has to be measured and animated instead. `firstPaint` skips
   * both the transition AND the scrollHeight measurement: not just so a pre-expanded expander
   * doesn't visibly grow open on page load, but because it can legitimately start inside a hidden
   * container (a not-yet-shown tab/nav page) — scrollHeight always reads 0 there, and baking that in
   * as a fixed pixel cap would wrongly clip the content the moment the container becomes visible.
   * 'none' has no such problem; the first actual interactive collapse (only possible once the
   * expander is genuinely visible) measures a real height.
   */
  _applyHeight(firstPaint) {
    const body = this._body;
    if (!this.expanded) {
      body.style.maxHeight = "0px";
      return;
    }
    if (firstPaint) {
      body.style.transition = "none";
      body.style.maxHeight = "none";
      body.getBoundingClientRect();
      body.style.transition = "";
    } else {
      body.style.maxHeight = `${body.scrollHeight}px`;
    }
  }
  get expanded() {
    return this.hasAttribute("expanded");
  }
  set expanded(v) {
    const next = !!v;
    if (!next && this.expanded && this._body) {
      this._body.style.maxHeight = `${this._body.scrollHeight}px`;
      this._body.getBoundingClientRect();
    }
    this.toggleAttribute("expanded", next);
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
var STYLES21 = `
  :host{display:block;height:100%;}
  .shell{display:flex;flex-direction:column;height:100%;background:var(--tsl-background);}
  .topbar{display:flex;align-items:center;gap:12px;height:52px;padding:0 8px;flex:none;}
  .toggle{display:flex;align-items:center;justify-content:center;width:36px;height:36px;flex:none;
    border-radius:var(--tsl-radius-sm);border:none;background:transparent;color:var(--tsl-text);cursor:pointer;}
  .toggle:hover{background:var(--tsl-control-hover);}
  .title{flex:1;min-width:0;font-size:14px;font-weight:600;color:var(--tsl-text);white-space:nowrap;
    overflow:hidden;text-overflow:ellipsis;}
  .topbar-actions{display:flex;align-items:center;gap:4px;flex:none;}
  .body{display:flex;flex:1;min-height:0;}
  .pane{position:relative;display:flex;flex-direction:column;flex:none;width:260px;padding:4px 8px;
    overflow-y:auto;overflow-x:hidden;transition:width var(--tsl-duration-slow) var(--tsl-ease);}
  :host([compact]) .pane{width:56px;}
  .rail-indicator{position:absolute;top:0;left:8px;width:3px;height:16px;border-radius:1.5px;
    background:var(--tsl-accent);opacity:0;pointer-events:none;
    transition:transform var(--tsl-duration-base) var(--tsl-ease), opacity var(--tsl-duration-fast) var(--tsl-ease);}
  .pane-header{padding:4px 8px 8px;}
  .items{display:flex;flex-direction:column;gap:2px;flex:1;}
  .footer-items{display:flex;flex-direction:column;gap:2px;margin-top:auto;padding-top:8px;}
  .header-row{display:flex;align-items:center;height:36px;padding:0 12px;font-size:12px;font-weight:600;
    color:var(--tsl-text-secondary);white-space:nowrap;overflow:hidden;}
  :host([compact]) .header-row{padding:0;margin:8px 4px;height:1px;background:var(--tsl-border);}
  :host([compact]) .header-row span{display:none;}
  .item{position:relative;display:flex;align-items:center;gap:0;height:44px;padding:0;border-radius:var(--tsl-radius-sm);
    color:var(--tsl-text-secondary);cursor:pointer;font-size:14px;background:transparent;border:none;font:inherit;
    text-align:left;width:100%;margin:2px 0;
    transition:background var(--tsl-duration-fast) var(--tsl-ease), color var(--tsl-duration-fast) var(--tsl-ease);}
  .item:hover{background:var(--tsl-control-hover);color:var(--tsl-text);}
  .item[aria-current="true"]{background:var(--tsl-subtle);color:var(--tsl-text);}
  .item .icon-col{flex:none;width:40px;display:flex;align-items:center;justify-content:center;}
  .item .label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  :host([compact]) .item .label{display:none;}
  .item[aria-disabled="true"]{opacity:var(--tsl-disabled-alpha);pointer-events:none;}
  .content{flex:1;min-width:0;overflow:auto;background:var(--tsl-surface);border:1px solid var(--tsl-border);
    border-radius:var(--tsl-radius-lg) 0 0 0;padding:24px;}
  ::slotted(tsl-nav-page:not([hidden])){display:block;animation:tsl-nav-page-in var(--tsl-duration-slow) var(--tsl-ease);}
  @keyframes tsl-nav-page-in{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
`;
var TesselNavView = class extends TesselElement {
  static styles = STYLES21;
  static observedAttributes = ["app-title", "value", "compact"];
  connectedCallback() {
    super.connectedCallback();
    if (this._built) {
      this._readChildren();
      return;
    }
    this._built = true;
    const shell = document.createElement("div");
    shell.className = "shell";
    const topbar = document.createElement("div");
    topbar.className = "topbar";
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "toggle";
    toggle.innerHTML = createIcon("global-nav", 18).outerHTML;
    toggle.addEventListener("click", () => this.toggleAttribute("compact"));
    this._titleEl = document.createElement("span");
    this._titleEl.className = "title";
    const topbarActions = document.createElement("span");
    topbarActions.className = "topbar-actions";
    topbarActions.appendChild(document.createElement("slot")).name = "topbar-actions";
    topbar.append(toggle, this._titleEl, topbarActions);
    const body = document.createElement("div");
    body.className = "body";
    const pane = document.createElement("nav");
    pane.className = "pane";
    const paneHeader = document.createElement("div");
    paneHeader.className = "pane-header";
    paneHeader.appendChild(document.createElement("slot")).name = "pane-header";
    this._items = document.createElement("div");
    this._items.className = "items";
    this._footerItems = document.createElement("div");
    this._footerItems.className = "footer-items";
    this._indicator = document.createElement("div");
    this._indicator.className = "rail-indicator";
    pane.append(paneHeader, this._items, this._footerItems, this._indicator);
    const content = document.createElement("div");
    content.className = "content";
    content.appendChild(document.createElement("slot"));
    body.append(pane, content);
    shell.append(topbar, body);
    this.shadowRoot.appendChild(shell);
    this._mo = new MutationObserver(() => this._readChildren());
    this._mo.observe(this, { childList: true, characterData: true, subtree: true });
    this._sync();
    this._readChildren();
  }
  disconnectedCallback() {
    this._mo?.disconnect();
  }
  attributeChangedCallback(name, oldV, newV) {
    super.attributeChangedCallback?.(name, oldV, newV);
    if (!this._built) return;
    if (name === "app-title") this._sync();
    if (name === "value") this._render();
  }
  _sync() {
    this._titleEl.textContent = this.getAttribute("app-title") || "";
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
      const firstItem = children.find((c) => c instanceof TesselNavItem);
      if (firstItem) this.setAttribute("value", firstItem.value);
    }
    this._items.innerHTML = "";
    this._footerItems.innerHTML = "";
    for (const child of children) {
      const target = child instanceof TesselNavItem && child.footer ? this._footerItems : this._items;
      target.appendChild(this._buildRow(child));
    }
    this._render(true);
  }
  _buildRow(child) {
    if (child instanceof TesselNavHeader) {
      const row = document.createElement("div");
      row.className = "header-row";
      const span = document.createElement("span");
      span.textContent = child.label;
      row.appendChild(span);
      return row;
    }
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "item";
    btn.title = child.label;
    btn.dataset.value = child.value;
    if (child.hasAttribute("disabled")) btn.setAttribute("aria-disabled", "true");
    const iconCol = document.createElement("span");
    iconCol.className = "icon-col";
    if (child.icon) iconCol.appendChild(createIcon(child.icon, 20));
    const label2 = document.createElement("span");
    label2.className = "label";
    label2.textContent = child.label;
    btn.append(iconCol, label2);
    btn.addEventListener("click", () => {
      if (child.hasAttribute("disabled")) return;
      this.value = child.value;
      this.emit("change", { value: child.value });
    });
    return btn;
  }
  _render(skipAnimation = false) {
    const value = this.getAttribute("value");
    let currentBtn = null;
    for (const row of this.shadowRoot.querySelectorAll(".item")) {
      const isCurrent = row.dataset.value === value;
      row.setAttribute("aria-current", String(isCurrent));
      if (isCurrent) currentBtn = row;
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
    this._moveIndicator(currentBtn, skipAnimation);
  }
  _moveIndicator(btn, skipAnimation) {
    const indicator = this._indicator;
    if (!btn) {
      indicator.style.opacity = "0";
      return;
    }
    const prevTransition = indicator.style.transition;
    if (skipAnimation) indicator.style.transition = "none";
    const top = btn.offsetTop + (btn.offsetHeight - 16) / 2;
    indicator.style.transform = `translateY(${top}px)`;
    indicator.style.opacity = "1";
    if (skipAnimation) {
      indicator.getBoundingClientRect();
      indicator.style.transition = prevTransition;
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
function buildStyleRules() {
  return Object.entries(TEXT_STYLES).map(([name, [size, weight, secondary]]) => `
    :host([variant="${name}"]){font-size:${size}px;font-weight:${weight};
      color:var(${secondary ? "--tsl-text-secondary" : "--tsl-text"});
      ${name === "code" ? `font-family:${MONO_STACK};` : ""}}
  `).join("\n");
}
var STYLES22 = `
  :host{display:block;font-size:14px;font-weight:400;color:var(--tsl-text);line-height:1.45;}
  ${buildStyleRules()}
`;
var TesselText = class extends TesselElement {
  static styles = STYLES22;
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    if (!this.hasAttribute("variant")) this.setAttribute("variant", "body");
    this.shadowRoot.appendChild(document.createElement("slot"));
  }
};
define("tsl-text", TesselText);

// src/components/theme-toggle.js
var STYLES23 = `
  :host{display:inline-flex;}
  button{display:flex;align-items:center;justify-content:center;width:32px;height:32px;padding:0;
    border:none;border-radius:var(--tsl-radius-sm);background:transparent;color:var(--tsl-text-secondary);
    cursor:pointer;transition:background var(--tsl-duration-fast) var(--tsl-ease),
      color var(--tsl-duration-fast) var(--tsl-ease);}
  button:hover{background:var(--tsl-control-hover);color:var(--tsl-text);}
  button:active{background:var(--tsl-control-pressed);}
  .icon{display:flex;}
  ${FOCUS_VISIBLE_CSS}
`;
var TesselThemeToggle = class extends TesselElement {
  static styles = STYLES23;
  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    const button = document.createElement("button");
    button.type = "button";
    this._iconSlot = document.createElement("span");
    this._iconSlot.className = "icon";
    button.appendChild(this._iconSlot);
    this.shadowRoot.appendChild(button);
    this._button = button;
    button.addEventListener("click", () => {
      setTheme(isDark() ? TesselTheme.LIGHT : TesselTheme.DARK);
    });
    this._unsubscribe = addThemeListener(() => this._sync());
    this._sync();
  }
  disconnectedCallback() {
    this._unsubscribe?.();
  }
  _sync() {
    const dark = isDark();
    this._iconSlot.innerHTML = "";
    this._iconSlot.appendChild(createIcon(dark ? "brightness" : "quiet-hours", 18));
    const label2 = dark ? "Switch to light theme" : "Switch to dark theme";
    this._button.setAttribute("aria-label", label2);
    this._button.title = label2;
  }
};
define("tsl-theme-toggle", TesselThemeToggle);

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
  Symbol: Symbol2,
  // component helpers
  style,
  placeholder,
  leadingIcon,
  textStyle,
  label,
  icon: createIcon,
  // imperative components
  snackbar: { show: showSnackbar },
  dialog: { show: showDialog, Result: DialogResult }
};
if (typeof window !== "undefined") window.Tessel = Tessel;
var tessel_default = Tessel;
export {
  BadgeKind,
  ButtonStyle,
  DialogResult,
  Severity,
  Symbol2 as Symbol,
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
  showSnackbar
};
