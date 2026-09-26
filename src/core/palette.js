// Color palette generation — a direct port of Tessel4J's `net.tessel.laf.Palette`.
// All colors are returned as hex/rgba strings so they can be written straight to CSS custom properties.

function clamp255(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r, g, b) {
  const toHex = (v) => clamp255(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Linear blend from `from` to `to`; amount 0 = from, 1 = to. Mirrors Palette.mix. */
export function mix(from, to, amount) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return rgbToHex(
    a.r + (b.r - a.r) * amount,
    a.g + (b.g - a.g) * amount,
    a.b + (b.b - a.b) * amount,
  );
}

/** The same color with a different alpha (0-1). Mirrors Palette.withAlpha. */
export function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

function channel(v) {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** WCAG relative luminance (0 = black, 1 = white). Mirrors Palette.luminance. */
export function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

const WHITE = '#ffffff';
const BLACK = '#000000';

/**
 * Builds the color set for a theme. `dark` selects the light/dark ramp; `accent` is a custom
 * accent hex color, or null/undefined for the built-in indigo — matches `new Palette(dark, accent)`.
 */
export function buildPalette(dark, accent) {
  const p = { dark: !!dark };

  p.background = dark ? '#0f1115' : '#f4f5f7';
  p.surface = dark ? '#181b21' : '#ffffff';
  p.surfaceAlt = dark ? '#1d2027' : '#f9fafb';
  p.subtle = dark ? '#242832' : '#eef0f3';
  p.border = dark ? '#2c313b' : '#e1e4e8';
  p.borderStrong = dark ? '#434b58' : '#c4cad3';

  p.text = dark ? '#e8eaed' : '#1b1f24';
  p.textSecondary = dark ? '#a3acb9' : '#58626f';
  p.textTertiary = dark ? '#7a8494' : '#8a93a0';
  p.textDisabled = dark ? '#565e6b' : '#a8afb9';

  p.controlBackground = dark ? '#20242c' : '#ffffff';
  p.controlHover = dark ? '#292e38' : '#f2f3f5';
  p.controlPressed = dark ? '#313743' : '#e7e9ed';
  p.inputBackground = dark ? '#14171c' : '#ffffff';
  p.overlay = dark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(16, 19, 24, 0.4)';

  p.success = dark ? '#4ade80' : '#15803d';
  p.successSubtle = dark ? '#15291e' : '#e3f8ea';
  p.warning = dark ? '#fbbf24' : '#b45309';
  p.warningSubtle = dark ? '#33280f' : '#fef4dc';
  p.danger = dark ? '#ef4444' : '#dc2626';
  p.dangerHover = dark ? '#f26363' : '#b91c1c';
  p.dangerSubtle = dark ? '#361a1c' : '#fde8e8';
  p.info = dark ? '#38bdf8' : '#0369a1';
  p.infoSubtle = dark ? '#122838' : '#e3f2fc';

  p.shadow = dark ? 'rgba(0, 0, 0, 0.43)' : 'rgba(0, 0, 0, 0.12)';

  if (!accent) {
    p.accent = dark ? '#6366f1' : '#4f46e5';
    p.accentHover = dark ? '#7c7ff4' : '#4338ca';
    p.accentPressed = dark ? '#5457d6' : '#3730a3';
    p.accentSubtle = dark ? '#272a52' : '#eef0ff';
    p.onAccent = WHITE;
  } else {
    const c = accent.length === 9 ? `#${accent.slice(1, 7)}` : accent;
    p.accent = c;
    p.accentHover = dark ? mix(c, WHITE, 0.14) : mix(c, BLACK, 0.12);
    p.accentPressed = dark ? mix(c, BLACK, 0.15) : mix(c, BLACK, 0.24);
    p.accentSubtle = mix(c, p.surface, dark ? 0.78 : 0.88);
    p.onAccent = luminance(c) > 0.5 ? '#111418' : WHITE;
  }

  return p;
}
