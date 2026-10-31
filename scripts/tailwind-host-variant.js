// Tailwind plugin: `host-[attr=value]:` styles an element when the custom element that owns the shadow
// root has that attribute — e.g. `host-[variant=accent]:bg-accent` compiles to
// `:host([variant=accent]) .host-\[variant\=accent\]\:bg-accent`. Components are styled from the
// outside in (the author sets attributes on <tsl-button>), so this is the bridge between host
// attributes and utilities inside the shadow tree.

export default function hostVariant({ matchVariant }) {
  matchVariant('host', (value) => `:host([${value}]) &`);
  matchVariant('not-host', (value) => `:host(:not([${value}])) &`);
}
