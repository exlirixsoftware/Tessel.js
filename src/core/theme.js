// Theme engine — the web equivalent of `net.tessel.laf.Tessel` (setup/setTheme/setAccent/palette).

import { buildPalette } from './palette.js';
import { installBaseStyles, RADIUS, SPACING, MOTION, FONT_STACK, MONO_STACK, DISABLED_ALPHA } from './tokens.js';

export const TesselTheme = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
});

export const ButtonStyle = Object.freeze({
  STANDARD: 'standard',
  ACCENT: 'accent',
  OUTLINE: 'outline',
  SUBTLE: 'subtle',
  DANGER: 'danger',
  ICON: 'icon',
  LINK: 'link',
});

export const TextStyle = Object.freeze({
  DISPLAY: 'display',
  TITLE: 'title',
  SUBTITLE: 'subtitle',
  HEADER: 'header',
  BODY_STRONG: 'body-strong',
  BODY: 'body',
  SECONDARY: 'secondary',
  CAPTION: 'caption',
  CODE: 'code',
});

export const Severity = Object.freeze({
  INFORMATIONAL: 'informational',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
});

export const BadgeKind = Object.freeze({
  NEUTRAL: 'neutral',
  ACCENT: 'accent',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
  INFO: 'info',
});

let theme = TesselTheme.LIGHT;
let accent = null;
let palette = buildPalette(false, null);
const listeners = new Set();
let mediaQuery = null;
let installed = false;

function isSystemDark() {
  return typeof window !== 'undefined'
    && !!window.matchMedia
    && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyToDom() {
  const root = document.documentElement;
  const map = {
    '--tsl-background': palette.background,
    '--tsl-surface': palette.surface,
    '--tsl-surface-alt': palette.surfaceAlt,
    '--tsl-subtle': palette.subtle,
    '--tsl-border': palette.border,
    '--tsl-border-strong': palette.borderStrong,
    '--tsl-text': palette.text,
    '--tsl-text-secondary': palette.textSecondary,
    '--tsl-text-tertiary': palette.textTertiary,
    '--tsl-text-disabled': palette.textDisabled,
    '--tsl-control-bg': palette.controlBackground,
    '--tsl-control-hover': palette.controlHover,
    '--tsl-control-pressed': palette.controlPressed,
    '--tsl-input-bg': palette.inputBackground,
    '--tsl-overlay': palette.overlay,
    '--tsl-accent': palette.accent,
    '--tsl-accent-hover': palette.accentHover,
    '--tsl-accent-pressed': palette.accentPressed,
    '--tsl-accent-subtle': palette.accentSubtle,
    '--tsl-on-accent': palette.onAccent,
    '--tsl-success': palette.success,
    '--tsl-success-subtle': palette.successSubtle,
    '--tsl-warning': palette.warning,
    '--tsl-warning-subtle': palette.warningSubtle,
    '--tsl-danger': palette.danger,
    '--tsl-danger-hover': palette.dangerHover,
    '--tsl-danger-subtle': palette.dangerSubtle,
    '--tsl-info': palette.info,
    '--tsl-info-subtle': palette.infoSubtle,
    '--tsl-shadow': palette.shadow,
    '--tsl-radius-sm': RADIUS.sm,
    '--tsl-radius-md': RADIUS.md,
    '--tsl-radius-lg': RADIUS.lg,
    '--tsl-radius-pill': RADIUS.pill,
    '--tsl-space-xs': SPACING.xs,
    '--tsl-space-sm': SPACING.sm,
    '--tsl-space-md': SPACING.md,
    '--tsl-space-lg': SPACING.lg,
    '--tsl-space-xl': SPACING.xl,
    '--tsl-space-xxl': SPACING.xxl,
    '--tsl-duration-fast': MOTION.fast,
    '--tsl-duration-base': MOTION.base,
    '--tsl-duration-slow': MOTION.slow,
    '--tsl-ease': MOTION.ease,
    '--tsl-font': FONT_STACK,
    '--tsl-font-mono': MONO_STACK,
    '--tsl-disabled-alpha': String(DISABLED_ALPHA),
  };
  for (const [key, value] of Object.entries(map)) root.style.setProperty(key, value);
  root.setAttribute('data-tessel-theme', palette.dark ? 'dark' : 'light');
  root.setAttribute('data-tessel-root', '');
  root.style.colorScheme = palette.dark ? 'dark' : 'light';
}

function install(notify) {
  installBaseStyles();
  const dark = theme === TesselTheme.DARK || (theme === TesselTheme.SYSTEM && isSystemDark());
  palette = buildPalette(dark, accent);
  applyToDom();
  if (theme === TesselTheme.SYSTEM) {
    if (!mediaQuery) {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (theme === TesselTheme.SYSTEM) install(true);
      });
    }
  }
  if (notify) for (const l of listeners) l();
}

/** Installs Tessel with the given theme (default SYSTEM) and an optional custom accent. */
export function setup(initialTheme = TesselTheme.SYSTEM, initialAccent = null) {
  theme = initialTheme || TesselTheme.SYSTEM;
  accent = initialAccent || null;
  installed = true;
  install(false);
}

/** Switches the theme at runtime; every Tessel element picks it up immediately via CSS variables. */
export function setTheme(next) {
  theme = next || TesselTheme.SYSTEM;
  if (!installed) return setup(theme, accent);
  install(true);
}

/** Sets a custom accent color (hex string), or null to restore the built-in indigo accent. */
export function setAccent(next) {
  accent = next || null;
  if (!installed) return setup(theme, accent);
  install(true);
}

export function getTheme() {
  return theme;
}

export function getAccent() {
  return accent;
}

/** The active color palette (same shape as Tessel4J's `Palette`). */
export function getPalette() {
  return palette;
}

export function isDark() {
  return palette.dark;
}

export function addThemeListener(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function removeThemeListener(fn) {
  listeners.delete(fn);
}

// Auto-install with sensible defaults the first time any Tessel component is used, so a page that
// only drops in `<tsl-button>` works without an explicit setup() call — `setup()` remains the way
// to choose a theme/accent up front, mirroring Tessel4J's `Tessel.setup()`.
export function ensureInstalled() {
  if (!installed) setup(TesselTheme.SYSTEM, null);
}
