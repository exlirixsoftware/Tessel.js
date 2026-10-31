# Changelog

All notable changes to **Tessel.js** are documented in this file.

## [Unreleased]

Restyled on Tailwind CSS v4 and brought up to date with Tessel.NET 1.2.0.

### Changed

- **Styling is now Tailwind CSS v4.** Components are built from utility classes; a build step (`npm run build:css`) compiles them
  into one shared constructable stylesheet (`src/styles/tailwind.generated.js`) that every shadow root adopts. The generated files are
  committed, so consuming the library still needs no tooling. Tailwind and its CLI are dev dependencies only.
- `heading` is now the preferred attribute for `<tsl-info-bar>`, `<tsl-dialog>` and `<tsl-teaching-tip>`; `title` still works but is
  moved off the element so the browser no longer shows it as a hover tooltip.
- Dropdowns (`<tsl-select>`, `<tsl-menu-button>`) and the new popups render in the browser's top layer instead of `position:absolute`.
- `<tsl-dialog>` is built on a native modal `<dialog>`.
- `<tsl-slider>` is drawn from plain elements (pointer capture + ARIA slider keyboard model) instead of a vendor-styled range input.
- `<tsl-expander>` and `<tsl-tree-item>` animate a CSS grid row instead of measuring `scrollHeight`.
- The server in `scripts/serve.js` redirects `/` to `/gallery/index.html`.

### Added

- New controls from Tessel.NET: `<tsl-toggle-button>`, `<tsl-dropdown-button>`, `<tsl-split-button>`, `<tsl-toggle-split-button>`,
  `<tsl-chip>`, `<tsl-segmented>`, `<tsl-tab-view>`, `<tsl-breadcrumb>`, `<tsl-pagination>`, `<tsl-stepper>`, `<tsl-timeline>`,
  `<tsl-progress-ring>`, `<tsl-skeleton>`, `<tsl-rating>`, `<tsl-auto-suggest>`, `<tsl-calendar>`, `<tsl-date-picker>`,
  `<tsl-time-picker>`, `<tsl-color-picker>`, `<tsl-flyout>`, `<tsl-teaching-tip>`, `<tsl-tooltip>`, `<tsl-group-box>`, `<tsl-toolbar>`
  and `<tsl-animation-timeline>`.
- `Tessel.dialog.message()` (Tessel.NET's `MessageDialog`), plus `busy` / `reportProgress()` and cancelable `primary-click` on `<tsl-dialog>`.
- `header` on text fields, text areas, selects and number boxes; `clearable` on `<tsl-text-field>`; `shortcut` on menu items;
  `selectable` / `sortable` on `<tsl-table>`; `slot="action"` on `<tsl-info-bar>`; `icon` on `<tsl-tab>`.
- Themed scrollbars: thin, with a thumb colored from the palette (darker on hover) on a transparent track, inside every component and on the host page.
- Keyboard navigation for lists, trees, tabs, menus, selects, calendars and toolbars.
- A gallery with Tessel.NET's pages (Buttons, Inputs, Selection, Collections, Feedback, Layout, Menus, Navigation, Dialogs, Animation).

### Fixed

- `<tsl-radio>`: clicking did nothing. A click handler cancelled every selection, because browsers check a radio before its click event fires.
- Menus, selects, pickers, flyouts and auto-suggest: until first opened, the popup was an invisible `position:fixed` box sitting over its trigger and neighbors, so the first click (on a menu, a toggle button next to a split button, …) hit an invisible menu row. Popups are now popovers from creation, hidden with `display:none` until opened.
- `<tsl-switch>`: the knob sat 4px from one end of the track and 1px from the other when on.
- Popups no longer get clipped by `overflow:hidden` ancestors (cards, dialogs, expanders).
- `<tsl-table>`: cell styling now also works when the table lives inside another component's shadow root.
- `<tsl-theme-toggle>` stopped following the theme after being detached and re-attached.
- `<tsl-text-area>`: the `value` attribute is applied after the initial render.
- `<tsl-number-box>`: typed values outside `min`/`max` are clamped when the field loses focus.
- Snackbars show above open modal dialogs.
- The theme no longer sets a 14px `font-size` on `<html>`, which rescaled every `rem` in the host page; it is applied to `<body>` instead.
- `<tsl-nav-view>`: the pane becomes a slide-over drawer on narrow screens instead of squeezing the content.
