// <tsl-text variant="display|title|subtitle|header|body-strong|body|secondary|caption|code">...</tsl-text>
// Port of TextStyle / TextBlock.java (font ramp + color per style, wraps natively unlike JLabel).

import { TesselElement, define } from '../core/base-element.js';
import { TEXT_STYLES, MONO_STACK } from '../core/tokens.js';

function buildStyleRules() {
  return Object.entries(TEXT_STYLES).map(([name, [size, weight, secondary]]) => `
    :host([variant="${name}"]){font-size:${size}px;font-weight:${weight};
      color:var(${secondary ? '--tsl-text-secondary' : '--tsl-text'});
      ${name === 'code' ? `font-family:${MONO_STACK};` : ''}}
  `).join('\n');
}

const STYLES = `
  :host{display:block;font-size:14px;font-weight:400;color:var(--tsl-text);line-height:1.45;}
  ${buildStyleRules()}
`;

export class TesselText extends TesselElement {
  static styles = STYLES;

  connectedCallback() {
    super.connectedCallback();
    if (this._built) return;
    this._built = true;
    if (!this.hasAttribute('variant')) this.setAttribute('variant', 'body');
    this.shadowRoot.appendChild(document.createElement('slot'));
  }
}

define('tsl-text', TesselText);
