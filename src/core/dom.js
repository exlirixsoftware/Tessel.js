// Tiny DOM builder used by components to assemble their shadow trees with Tailwind class strings.
//
//   h('button', 'h-8 px-3 rounded-md', { type: 'button', onclick: fn }, icon, label)
//
// `props` keys: `on<event>` adds a listener, `style` (object) assigns inline styles, `dataset` (object),
// `part`, `class`/`className`, boolean attributes set when truthy, everything else via setAttribute.
// Children may be nodes, strings (text) or arrays; null/false/undefined are skipped.

export function h(tag, className, props, ...children) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value == null || value === false) continue;
      if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2), value);
      else if (key === 'style' && typeof value === 'object') Object.assign(el.style, value);
      else if (key === 'dataset') Object.assign(el.dataset, value);
      else if (key === 'class' || key === 'className') el.className += ` ${value}`;
      else if (value === true) el.setAttribute(key, '');
      else el.setAttribute(key, String(value));
    }
  }
  append(el, children);
  return el;
}

export function append(el, children) {
  for (const child of children) {
    if (child == null || child === false) continue;
    if (Array.isArray(child)) append(el, child);
    else el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

/** An element built from trusted SVG/HTML markup (the icon helpers return strings). */
export function html(tag, className, markup) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.innerHTML = markup;
  return el;
}

/** Replaces `el.className` with the merged, de-blanked class strings. */
export function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}
