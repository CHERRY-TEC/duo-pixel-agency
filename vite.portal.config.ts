import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/**
 * Standalone build of the client & designer portal only.
 * Output: dist/portal  — deploy this folder as its own site/app.
 * Set VITE_SITE_URL to the public website's origin so links reach it.
 *
 * With APP_TARGET=portal (set by the Vercel portal project) the output goes to
 * dist/ instead, so the project can keep Vercel's default output directory.
 */
const OUT_DIR = process.env.APP_TARGET === 'portal' ? 'dist' : 'dist/portal';

/**
 * The entry file is `portal.html`; vercel.json rewrites /login, /track, … to
 * it, and plain static hosts need it as `index.html`. Emit both so every
 * hosting mode works (single-domain combined build, standalone portal, and
 * any static file server).
 */
function portalIndex(): Plugin {
  return {
    name: 'portal-output-index',
    closeBundle() {
      const from = resolve(process.cwd(), OUT_DIR, 'portal.html');
      const to = resolve(process.cwd(), OUT_DIR, 'index.html');
      if (existsSync(from)) copyFileSync(from, to);
    },
  };
}

export default defineConfig({
  plugins: [react(), portalIndex()],
  resolve: {
    alias: { '@': resolve(process.cwd(), 'shared') },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    outDir: OUT_DIR,
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(process.cwd(), 'portal.html'),
    },
  },
});
