import { existsSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/**
 * Standalone build of the client & designer portal only.
 * Output: dist/portal  — deploy this folder as its own site/app.
 * Set VITE_SITE_URL to the public website's origin so links reach it.
 *
 * The entry file is `portal.html`; on a standalone host it has to be served as
 * `index.html`, so it is renamed once the bundle is written.
 */
function portalIndex(): Plugin {
  return {
    name: 'portal-output-index',
    closeBundle() {
      const from = resolve(process.cwd(), 'dist/portal/portal.html');
      const to = resolve(process.cwd(), 'dist/portal/index.html');
      if (existsSync(from)) renameSync(from, to);
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
    outDir: 'dist/portal',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(process.cwd(), 'portal.html'),
    },
  },
});
