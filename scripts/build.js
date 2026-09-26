// Bundles every source module (src/tessel.js and everything it imports — core/* and components/*)
// into two single-file drop-ins under dist/, for projects that don't want a multi-file ES module
// tree to manage:
//
//   dist/tessel.js       — bundled, readable (not minified), for debugging/inspection
//   dist/tessel.min.js   — bundled and minified, for production
//
// Both are still plain ES modules with the same named exports as src/tessel.js (Tessel, setTheme,
// ButtonStyle, ...) — bundling only inlines the internal `./core/...`/`./components/...` imports
// between Tessel's own files, it doesn't change the public API. Usage is unchanged either way:
//
//   <script type="module" src="dist/tessel.min.js"></script>
//   <tsl-button variant="accent">Save</tsl-button>
//
// Run with `npm run build` (uses esbuild — a devDependency; consumers of the built files still
// need nothing, this is only a maintainer-side tool for producing them).

import * as esbuild from 'esbuild';
import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const entry = path.join(root, 'src', 'tessel.js');
const outDir = path.join(root, 'dist');
mkdirSync(outDir, { recursive: true });

const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const banner = `/*! Tessel.js v${pkg.version} — ${pkg.description}\n * ${pkg.license} License — bundled ${new Date().toISOString().slice(0, 10)}\n */\n`;

const shared = {
  entryPoints: [entry],
  bundle: true,
  format: 'esm',
  target: 'es2022',
  legalComments: 'none',
  banner: { js: banner },
};

function humanSize(bytes) {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
}

async function buildOne(label, outfile, extraOptions) {
  const result = await esbuild.build({
    ...shared,
    ...extraOptions,
    outfile,
    metafile: true,
  });
  const bytes = Buffer.byteLength(readFileSync(outfile));
  console.log(`  ${label.padEnd(20)} ${path.relative(root, outfile)}  (${humanSize(bytes)})`);
  return result;
}

console.log('Bundling Tessel.js...');
await buildOne('readable', path.join(outDir, 'tessel.js'), { minify: false });
await buildOne('minified', path.join(outDir, 'tessel.min.js'), { minify: true });
console.log('Done.');
