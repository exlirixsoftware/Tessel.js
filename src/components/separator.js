// <tsl-separator [vertical]> — port of TesselSeparatorUI (1px line, p.border).

import { TesselElement, define } from '../core/base-element.js';

const STYLES = `
  :host{display:block;background:var(--tsl-border);}
  :host(:not([vertical])){width:100%;height:1px;margin:8px 0;}
  :host([vertical]){width:1px;height:100%;margin:0 8px;align-self:stretch;}
`;

export class TesselSeparator extends TesselElement {
  static styles = STYLES;
}

define('tsl-separator', TesselSeparator);
