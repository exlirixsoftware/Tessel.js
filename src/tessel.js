// Tessel.js — entry point.
//
//   <script type="module" src="/tessel/src/tessel.js"></script>
//
// Importing this file registers every `<tsl-*>` custom element (side effects) and exposes the
// `Tessel` object, the JS-facing equivalent of Tessel4J's `net.tessel.laf.Tessel` static class.

import {
  setup, setTheme, setAccent, getTheme, getAccent, getPalette, isDark,
  addThemeListener, removeThemeListener, TesselTheme, ButtonStyle, TextStyle, Severity, BadgeKind,
} from './core/theme.js';
import { Symbol, createIcon } from './core/icons.js';
import { showSnackbar } from './components/snackbar.js';
import { showDialog, DialogResult } from './components/content-dialog.js';

import './components/button.js';
import './components/checkbox.js';
import './components/radio.js';
import './components/switch.js';
import './components/text-field.js';
import './components/text-area.js';
import './components/select.js';
import './components/slider.js';
import './components/progress-bar.js';
import './components/list.js';
import './components/tree.js';
import './components/table.js';
import './components/tabs.js';
import './components/menu.js';
import './components/separator.js';
import './components/number-box.js';
import './components/card.js';
import './components/badge.js';
import './components/avatar.js';
import './components/info-bar.js';
import './components/settings-card.js';
import './components/expander.js';
import './components/content-dialog.js';
import './components/navigation-view.js';
import './components/text.js';
import './components/theme-toggle.js';

/** Applies a ButtonStyle to a <tsl-button> (or sets its `variant` attribute directly). */
function style(button, buttonStyle) {
  button.setAttribute('variant', buttonStyle);
  return button;
}

/** Sets the placeholder text of a <tsl-text-field>/<tsl-text-area>. */
function placeholder(field, text) {
  field.setAttribute('placeholder', text);
  return field;
}

/** Sets the leading icon (a Symbol name) of a <tsl-text-field>. */
function leadingIcon(field, iconName) {
  field.setAttribute('icon', iconName);
  return field;
}

/** Applies a TextStyle to any element by setting its `variant`/class — works on any tag, not just <tsl-text>. */
function textStyle(element, style) {
  if (element.tagName === 'TSL-TEXT') element.setAttribute('variant', style);
  else element.setAttribute('data-tsl-text-style', style);
  return element;
}

/** Creates a <tsl-text> with the given TextStyle, mirroring Tessel.label(text, style). */
function label(text, style) {
  const el = document.createElement('tsl-text');
  el.setAttribute('variant', style);
  el.textContent = text;
  return el;
}

export const Tessel = {
  VERSION: '1.0.0',

  // theming
  setup, setTheme, setAccent, getTheme, getAccent, isDark,
  palette: getPalette,
  addThemeListener, removeThemeListener,
  Theme: TesselTheme,

  // enums
  ButtonStyle, TextStyle, Severity, BadgeKind, Symbol,

  // component helpers
  style, placeholder, leadingIcon, textStyle, label,
  icon: createIcon,

  // imperative components
  snackbar: { show: showSnackbar },
  dialog: { show: showDialog, Result: DialogResult },
};

if (typeof window !== 'undefined') window.Tessel = Tessel;

export {
  TesselTheme, ButtonStyle, TextStyle, Severity, BadgeKind, Symbol, DialogResult,
  setup, setTheme, setAccent, getTheme, getAccent, getPalette, isDark,
  addThemeListener, removeThemeListener, showSnackbar, showDialog, createIcon,
};

export default Tessel;
