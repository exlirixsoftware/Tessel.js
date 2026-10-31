// Global tokens & base install — the web equivalent of `TesselLookAndFeel` installing UIDefaults.
// Radii/spacing/motion numbers come straight from the Tessel4J source (ButtonPainter, UIUtils, etc).

export const RADIUS = {
  sm: '4px',   // menu/list/tree/nav row highlights, spinner buttons
  md: '6px',   // buttons, inputs, checkbox/radio box, combo, spinner shell
  lg: '8px',   // cards, dialogs, info bars, expanders, settings cards
  pill: '999px',
};

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
};

export const MOTION = {
  fast: '130ms',
  base: '180ms',
  slow: '220ms',
  ease: 'cubic-bezier(0.16, 1, 0.3, 1)', // approximates the ease-out-quad/cubic used throughout Tessel4J
};

export const FONT_STACK =
  "'Segoe UI', 'SF Pro Text', 'Helvetica Neue', Inter, Cantarell, Ubuntu, 'Noto Sans', system-ui, sans-serif";
export const MONO_STACK =
  "'Cascadia Mono', Consolas, 'JetBrains Mono', 'SF Mono', Menlo, 'DejaVu Sans Mono', ui-monospace, monospace";

export const DISABLED_ALPHA = 0.45;

let baseInstalled = false;

/** Injects the one-time global stylesheet (fonts, box-sizing, focus-ring reset). */
export function installBaseStyles() {
  if (baseInstalled) return;
  baseInstalled = true;
  const style = document.createElement('style');
  style.id = 'tessel-base-styles';
  style.textContent = `
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
  document.head.appendChild(style);
}
