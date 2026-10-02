// Fallback build without Vite: bundles src/ with esbuild into dist/.
// Usage: node tools/build-static.mjs   (needs the `esbuild` package)
import { build } from 'esbuild';
import { cpSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
rmSync('dist', { recursive: true, force: true });
mkdirSync('dist/assets', { recursive: true });
await build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  minify: true,
  format: 'esm',
  target: 'es2022',
  jsx: 'automatic',
  outdir: 'dist/assets',
  entryNames: 'app',
  external: ['/fonts/*'],
  define: { 'import.meta.env.BASE_URL': '"/"', 'process.env.NODE_ENV': '"production"' },
  loader: { '.css': 'css' },
  nodePaths: process.env.NODE_PATH ? process.env.NODE_PATH.split(':') : [],
});
cpSync('public', 'dist', { recursive: true });
let html = readFileSync('index.html', 'utf8')
  .replace('<script type="module" src="/src/main.tsx"></script>', '<script type="module" src="/assets/app.js"></script>')
  .replace('</head>', '  <link rel="stylesheet" href="/assets/app.css" />\n  </head>');
writeFileSync('dist/index.html', html);
console.log('built dist/');
