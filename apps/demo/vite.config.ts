import { defineConfig } from 'vite';

// Relative base: the page works at any path (GitHub Pages serves it under /imagery-date/). The `source` condition
// builds the library from its TypeScript, so the page never runs on a stale build of it.
export default defineConfig({
  base: './',
  resolve: { conditions: ['source'] },
  // MapLibre GL alone is about 1 MB minified (300 kB gzipped); the page has no other weight to split off.
  build: { target: 'es2022', sourcemap: true, chunkSizeWarningLimit: 1200 },
});
