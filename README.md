# Tessel.js

A pure-JavaScript port of the [Tessel.NET](../Tessel.NET) / [Tessel4J](../Tessel4J) Fluent-inspired look and feel — the same
design tokens, palette and control set, rebuilt as framework-free [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
for the browser and styled with [Tailwind CSS](https://tailwindcss.com) v4.

- Light, dark and system themes, switchable at runtime
- Custom accent colors
- 60+ controls: everything in Tessel4J, plus the controls Tessel.NET added in 1.1 and 1.2 (split buttons, chips, segmented control,
  tab view, breadcrumb, pagination, stepper, timeline, pickers, flyouts, skeleton, message dialogs, animation timeline, …)
- No runtime dependencies, no build step to *use* it — plain ES modules, native custom elements with Shadow DOM
- Every color, radius and spacing value is a CSS custom property, so theme changes are instant everywhere
- Also ships as a single bundled file (`dist/tessel.js` / `dist/tessel.min.js`)

```
Tessel.js/
├── src/
│   ├── core/            palette, theme engine, tokens, icons, base element, popup + menu plumbing, DOM helper
│   ├── components/      one file (or one family) per <tsl-*> custom element
│   ├── styles/          Tailwind entries (tessel.css, light.css, theme.css) and their generated output
│   └── tessel.js        entry point — import this, get every component + the Tessel API
├── dist/                bundled single-file builds — generated, not hand-edited
├── gallery/             demo app showing every control (mirrors Tessel.NET's Tessel.Gallery)
└── scripts/
    ├── serve.js         dependency-free static server for the demo
    ├── build-css.js     compiles the Tailwind entries into src/styles/*.generated.js
    └── build.js         bundles src/ into dist/
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

It needs a browser with Web Components, constructable stylesheets, the Popover API and `@starting-style`:
Chrome/Edge 117+, Firefox 129+, Safari 17.5+.

Run the gallery locally:

```bash
npm run demo        # http://localhost:4173
```

## Styling: Tailwind CSS

Every component builds its shadow DOM with Tailwind utility classes (`h-8 px-3.5 rounded-md bg-control hover:bg-control-hover …`).

- **Tokens.** `src/styles/theme.css` maps Tailwind's theme onto the `--tsl-*` custom properties the theme engine writes on `<html>`
  (`bg-accent`, `text-text-secondary`, `border-border`, `rounded-md`, `shadow-card`, `text-body`, …). Because the utilities point at
  CSS variables rather than baked-in colors, light/dark/accent switches need no re-render. One spacing step is 4px
  (`h-8` = 32px), independent of the host page's root font size.
- **One shared sheet.** `npm run build:css` compiles `src/styles/tessel.css` (scanning `src/components` and `src/core` for class
  names) into `src/styles/tailwind.generated.js`, a string module that every shadow root adopts as a single constructable
  stylesheet. The generated files are committed, so **using** Tessel.js still needs no Tailwind, no PostCSS and no build.
- **Host-attribute variant.** Components are configured by attributes on the custom element, so a small Tailwind plugin adds
  `host-[attr=value]:` — e.g. `host-[disabled]:opacity-45` compiles to `:host([disabled]) .cls`.
- **Shadow DOM fixes.** `@property` rules are ignored inside shadow roots, so the build re-emits Tailwind's `--tw-*` defaults
  (shadows, transforms, rings…) in the base layer. `src/styles/light.css` holds the few rules that must live in the light DOM —
  a slotted `<table>` can't be styled from inside `<tsl-table>`'s shadow root.
- **Scrollbars.** Thin and token-colored: `scrollbar-width: thin` plus a palette-colored `scrollbar-color` (darker on hover),
  applied inside every shadow root and, via the base stylesheet, to the host page. These are the standard properties, so
  Chrome 121+, Firefox and Safari 18.2+ agree; older browsers keep their native bars.
- **Gallery.** `gallery/gallery.css` is the demo page's own Tailwind entry for its layout classes.

Working on the components:

```bash
npm install          # Tailwind + esbuild (maintainer-side only)
npm run dev:css      # rebuild the generated stylesheets on every change
npm run build        # CSS, then dist/tessel.js and dist/tessel.min.js
```

Re-run `npm run build:css` after adding or changing a utility class in a component — the generated sheet only contains
classes it has seen. A class that isn't in the sheet simply has no effect.

## Bundling into a single file

```bash
npm install
npm run build
```

```
dist/tessel.js       bundled, not minified — same code, easier to read/debug
dist/tessel.min.js   bundled and minified — for production
```

Both are plain ES modules with the exact same exports as `src/tessel.js`:

```html
<script type="module" src="dist/tessel.min.js"></script>
<tsl-button variant="accent">Save</tsl-button>
```

```js
import { Tessel } from 'tessel.js/dist/min';
```

## Theming

```js
import { Tessel } from './src/tessel.js';

Tessel.setTheme(Tessel.Theme.DARK);   // updates every Tessel element on the page instantly
Tessel.setAccent('#0078D4');          // null = built-in indigo accent
Tessel.addThemeListener(() => { ... });

const p = Tessel.palette();           // the active color palette
p.accent; p.surface; p.textSecondary; p.danger; // ...
```

Colors are plain CSS custom properties on `<html>` (`--tsl-accent`, `--tsl-surface`, `--tsl-text`, …), so any of your own CSS can
use them too — no re-render needed when the theme changes. The palette is identical to Tessel.NET's `Light.xaml` / `Dark.xaml`.

## Component helpers

```js
Tessel.style(button, Tessel.ButtonStyle.ACCENT);          // sets variant="accent" on a <tsl-button>
Tessel.placeholder(field, 'name@example.com');
Tessel.leadingIcon(field, Tessel.Symbol.MAIL);
Tessel.label('Settings', Tessel.TextStyle.TITLE);         // creates a <tsl-text variant="title">
Tessel.icon(Tessel.Symbol.SAVE, 16);                      // an <span> wrapping the inline SVG icon
```

## Components

### Buttons and inputs

| Component | Notes |
| --- | --- |
| `<tsl-button variant="standard\|accent\|outline\|subtle\|danger\|icon\|link">` | `icon`, `icon-size` attrs |
| `<tsl-toggle-button checked icon>` | `change` |
| `<tsl-dropdown-button label icon variant>` | `<tsl-menu-item>` children; `select`, `change` |
| `<tsl-split-button label icon variant>` | click = main action, chevron opens the menu |
| `<tsl-toggle-split-button label checked>` | main part toggles `checked` |
| `<tsl-chip removable selectable checked icon>` | `remove` (cancelable), `change` |
| `<tsl-checkbox checked indeterminate>` | |
| `<tsl-radio-group value>` / `<tsl-radio value>` | mutual exclusion managed by the group |
| `<tsl-switch checked>` | |
| `<tsl-segmented value>` / `<tsl-segment value icon>` | |
| `<tsl-text-field type icon placeholder value header clearable>` | |
| `<tsl-text-area placeholder rows value header>` | |
| `<tsl-select value placeholder header>` / `<tsl-option value disabled>` | |
| `<tsl-auto-suggest placeholder icon header local>` | `box.suggestions = [...]`; `text-changed`, `suggestion-chosen`, `query-submitted` |
| `<tsl-number-box min max step value header>` | |
| `<tsl-slider min max step value>` | |
| `<tsl-rating value max read-only clearable caption>` | |
| `<tsl-date-picker value min max header>` / `<tsl-calendar value min max first-day>` | values are `YYYY-MM-DD` |
| `<tsl-time-picker value hour24 minute-increment header>` | values are 24h `HH:MM` |
| `<tsl-color-picker value alpha no-hex>` | `#rrggbb`, or `#rrggbbaa` with `alpha`; `input` while dragging, `change` on release |

### Collections, layout and feedback

| Component | Notes |
| --- | --- |
| `<tsl-list value>` / `<tsl-list-item value disabled>` | arrow keys |
| `<tsl-tree>` / `<tsl-tree-item label icon folder expanded>` | nest `<tsl-tree-item>` for children; arrow keys |
| `<tsl-table selectable sortable>` | restyles a plain slotted `<table>` |
| `<tsl-card header elevated>` · `<tsl-group-box header>` · `<tsl-settings-card header description icon>` · `<tsl-expander header expanded>` | |
| `<tsl-badge kind solid>` · `<tsl-avatar name size src>` · `<tsl-separator vertical>` · `<tsl-text variant>` | |
| `<tsl-toolbar>` | arrow keys move between its controls |
| `<tsl-info-bar severity heading closable elevated surface>` | `slot="action"` for an action button |
| `<tsl-progress-bar value max indeterminate>` · `<tsl-progress-ring value size>` · `<tsl-skeleton width height circle>` | |
| `Tessel.snackbar.show(title, { message, severity, duration })` | stays above open dialogs |

### Menus, popups and dialogs

| Component | Notes |
| --- | --- |
| `<tsl-menu-button label icon align>` with `<tsl-menu-item value icon shortcut>` / `<tsl-menu-checkbox-item>` / `<tsl-menu-separator>` | arrow keys, type-ahead |
| `<tsl-flyout target placement stays-open>` | `show()`, `showAt(el)`, `hide()`, `toggle()`; `opened`, `closed` |
| `<tsl-teaching-tip target heading subtitle icon action-text>` | `action-click`, `close-click` |
| `<tsl-tooltip for placement>` | hover and keyboard focus |
| `<tsl-dialog heading primary-text secondary-text close-text primary-destructive busy>` | `await dialog.showModal()`; `primary-click` is cancelable; `reportProgress(pct, text)` |
| `Tessel.dialog.show({ title, message, primaryText, ... })` | one-off promise-based dialog |
| `Tessel.dialog.message(title, message, { buttons, icon, destructive })` | Tessel.NET's `MessageDialog`: `ok`, `ok-cancel`, `yes-no`, `yes-no-cancel`, `retry-cancel` |

### Navigation

| Component | Notes |
| --- | --- |
| `<tsl-tabs value>` / `<tsl-tab value icon>` / `<tsl-tab-panel value>` | arrow keys |
| `<tsl-tab-view value addable reorderable>` / `<tsl-tab-view-item value header icon pinned>` | closable, draggable tabs; `tab-close-requested` (cancelable), `add-tab-click`; `view.addTab()` |
| `<tsl-nav-view app-title value compact>` / `<tsl-nav-item>` / `<tsl-nav-header>` / `<tsl-nav-page>` | below 720px the pane becomes a slide-over drawer |
| `<tsl-breadcrumb>` / `<tsl-breadcrumb-item value>` | `item-click` |
| `<tsl-pagination page count max-visible>` | `change` |
| `<tsl-stepper current orientation>` / `<tsl-step header description error>` | |
| `<tsl-timeline orientation layout item-width>` / `<tsl-timeline-item header timestamp icon kind pending>` | `layout="alternate"`, `orientation="horizontal"` |
| `<tsl-animation-timeline fps duration>` | video / pixel-editor timeline: tracks, clips, markers, snapping, loop region, undo, playback — see the header of [animation-timeline.js](src/components/animation-timeline.js) |
| `<tsl-theme-toggle>` | icon button that flips between light/dark; reflects the current theme live |

See [`gallery/index.html`](gallery/index.html) for a live example of every component.

## Design differences from Tessel.NET / Tessel4J

A few things that don't map 1:1 from WPF/Swing to the browser, by design:

- **Hover/press/focus states** use native CSS (`:hover`, `:active`, `:focus-visible`) instead of manual tracking.
- **Popups are top-layer popovers.** Select lists, menus, flyouts and pickers are never clipped by an `overflow:hidden` ancestor
  and flip to the other side when there is no room. Dialogs use a native modal `<dialog>` (focus trap, inert backdrop, Escape).
- **No icon-font dependency.** Tessel.js always uses inline SVG, so every `Symbol` renders identically everywhere.
- **Not ported:** `TesselWindow` (the browser owns the window chrome), `FileBrowser` / `FileChooserDialog` / `FileSaverDialog`
  (use `<input type="file">` and the File System Access API), and `Tessel.useSystemAccent()` (no browser exposes the system
  accent color to pages — pick one with `Tessel.setAccent()`).
- **`title` attributes** on `<tsl-info-bar>`, `<tsl-dialog>` and `<tsl-teaching-tip>` are moved off the element so the browser
  doesn't also show them as a hover tooltip; `heading` is the equivalent attribute without that side effect.
