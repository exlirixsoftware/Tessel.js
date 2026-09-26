# Tessel.js

A pure-JavaScript port of [Tessel4J](../Tessel4J)'s Fluent-inspired look and feel — the same design
tokens, palette, component set and behavior, rebuilt as framework-free [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) for the browser.

- Light, dark and system themes, switchable at runtime
- Custom accent colors
- 25 components, restyled/rebuilt from Tessel4J's Swing controls and custom widgets
- Zero dependencies, zero build step — plain ES modules, native custom elements with Shadow DOM
- Every color, radius and spacing value is a CSS custom property, so theme changes are instant everywhere
- Also ships as a single bundled file (`dist/tessel.js` / `dist/tessel.min.js`) for projects that
  would rather drop in one `<script>` than manage the source module tree

```
Tessel.js/
├── src/
│   ├── core/            palette, theme engine, tokens, icons, base element
│   ├── components/      one file per <tsl-*> custom element
│   └── tessel.js         entry point — import this, get every component + the Tessel API
├── dist/                 bundled single-file builds (see "Bundling" below) — generated, not hand-edited
├── gallery/              demo app showing every control (mirrors Tessel4J's tessel-gallery)
└── scripts/
    ├── serve.js          dependency-free static server for the demo
    └── build.js          bundles src/ into dist/tessel.js and dist/tessel.min.js
```

## Getting started

Tessel.js ships as plain ES modules — no bundler, npm install, or build step required.

```html
<script type="module" src="tessel/src/tessel.js"></script>

<tsl-button variant="accent">Save</tsl-button>
```

```js
import { Tessel } from './tessel/src/tessel.js';

Tessel.setup(Tessel.Theme.SYSTEM); // or LIGHT / DARK
```

Run the gallery locally:

```bash
node scripts/serve.js
```

## Bundling into a single file

The source tree (`src/core/*`, `src/components/*`, `src/tessel.js`) works as-is via the multi-file
`<script type="module">` above — nothing needs bundling to run it. For projects that would rather
ship/host one file, `npm run build` bundles the whole module graph into two drop-in files under
`dist/`, using [esbuild](https://esbuild.github.io/) (a devDependency — only needed to *produce*
these files, not to use them):

```bash
npm install   # pulls in esbuild, once
npm run build
```

```
dist/tessel.js       bundled, not minified — same code, easier to read/debug
dist/tessel.min.js   bundled and minified — for production
```

Both are plain ES modules with the exact same exports as `src/tessel.js` (`Tessel`, `setTheme`,
`ButtonStyle`, ...); bundling only inlines Tessel's own internal imports, it doesn't change the
public API. Use whichever file suits the project, the same way:

```html
<script type="module" src="dist/tessel.min.js"></script>
<tsl-button variant="accent">Save</tsl-button>
```

```js
import { Tessel } from 'tessel.js/dist/tessel.min.js';
```

Re-run `npm run build` after changing any file under `src/` — the `dist/` files aren't watched or
regenerated automatically.

## Theming

```js
import { Tessel } from './src/tessel.js';

Tessel.setTheme(Tessel.Theme.DARK);   // updates every Tessel element on the page instantly
Tessel.setAccent('#0078D4');          // null = built-in indigo accent
Tessel.addThemeListener(() => { ... });

const p = Tessel.palette();           // the active color palette
p.accent; p.surface; p.textSecondary; p.danger; // ...
```

Colors are plain CSS custom properties on `<html>` (`--tsl-accent`, `--tsl-surface`, `--tsl-text`, …),
so any of your own CSS can use them too — no re-render needed when the theme changes.

## Component helpers

```js
Tessel.style(button, Tessel.ButtonStyle.ACCENT);          // sets variant="accent" on a <tsl-button>
Tessel.placeholder(field, 'name@example.com');
Tessel.leadingIcon(field, Tessel.Symbol.MAIL);
Tessel.label('Settings', Tessel.TextStyle.TITLE);         // creates a <tsl-text variant="title">
Tessel.icon(Tessel.Symbol.SAVE, 16);                      // an <span> wrapping the inline SVG icon
```

## Components

| Component | Notes |
| --- | --- |
| `<tsl-button variant="standard\|accent\|outline\|subtle\|danger\|icon\|link">` | `icon`, `icon-size` attrs |
| `<tsl-checkbox checked indeterminate>` | |
| `<tsl-radio-group value>` / `<tsl-radio value>` | mutual exclusion managed by the group |
| `<tsl-switch checked>` | |
| `<tsl-text-field type icon placeholder value>` | |
| `<tsl-text-area placeholder rows value>` | |
| `<tsl-select value placeholder>` / `<tsl-option value disabled>` | |
| `<tsl-slider min max step value>` | |
| `<tsl-number-box min max step value>` | |
| `<tsl-progress-bar value max indeterminate>` | |
| `<tsl-list value>` / `<tsl-list-item value disabled>` | |
| `<tsl-tree>` / `<tsl-tree-item label icon folder expanded>` | nest `<tsl-tree-item>` for children |
| `<tsl-table>` | restyles a plain slotted `<table>` |
| `<tsl-tabs value>` / `<tsl-tab value>` / `<tsl-tab-panel value>` | |
| `<tsl-menu-button label icon align>` / `<tsl-menu-item>` / `<tsl-menu-checkbox-item>` / `<tsl-menu-separator>` | |
| `<tsl-separator vertical>` | |
| `<tsl-card header elevated>` | |
| `<tsl-badge kind solid>` | kinds: neutral/accent/success/warning/danger/info |
| `<tsl-avatar name size src>` | |
| `<tsl-info-bar severity title closable elevated surface>` | |
| `<tsl-settings-card header description icon>` | put the trailing control in `slot="control"` |
| `<tsl-expander header expanded>` | |
| `<tsl-dialog title primary-text secondary-text close-text primary-destructive>` | `await dialog.showModal()` |
| `<tsl-nav-view app-title value compact>` / `<tsl-nav-item>` / `<tsl-nav-header>` / `<tsl-nav-page>` | put a `slot="topbar-actions"` element (e.g. `<tsl-theme-toggle>`) for trailing top-bar buttons |
| `<tsl-text variant>` | display/title/subtitle/header/body-strong/body/secondary/caption/code |
| `<tsl-theme-toggle>` | icon button that flips between light/dark; reflects the current theme live |
| `Tessel.snackbar.show(title, { message, severity, duration })` | |
| `Tessel.dialog.show({ title, message, primaryText, ... })` | one-off promise-based dialog |

See [`gallery/index.html`](gallery/index.html) for a live example of every component.

## Design differences from Tessel4J

A few things that don't map 1:1 from Swing to the browser, by design:

- **Hover/press/focus states** use native CSS (`:hover`, `:active`, `:focus-visible`) instead of
  Tessel4J's manual `AWTEventListener`-based hover/focus tracking.
- **Sliders, ranges and number inputs** wrap native `<input type="range">`/`<input type="number">`
  for free keyboard, drag and accessibility support, styled to match.
- **No icon-font dependency.** Tessel4J falls back to hand-drawn vector icons when Segoe Fluent Icons
  isn't installed; Tessel.js always uses inline SVG, so every `Symbol` renders identically everywhere.
- **`TesselFrame`'s native window chrome** (DWM shadow, Aero Snap, custom title bar) has no web
  equivalent — the browser already owns the window chrome — so it isn't ported.
- **System accent color** isn't exposed to web pages by any browser, so `Tessel.useSystemAccent()`
  doesn't have a web equivalent; pick a custom accent with `Tessel.setAccent()` instead.
