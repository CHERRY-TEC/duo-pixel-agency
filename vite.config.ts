import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/**
 * Duo Pixel Agency runs as two SPAs from one repo:
 *
 *   index.html  -> site/    the public website (marketing + booking flow)
 *   portal.html -> portal/  the client & designer portal (tracking, account,
 *                           dashboard)
 *
 * Locally — and on a single-domain deploy — both are served from one origin so
 * the localStorage demo data is shared. Portal routes are rewritten to
 * `portal.html` before the site's SPA fallback can swallow them.
 *
 * To host them on two domains instead, build with `vite.site.config.ts` /
 * `vite.portal.config.ts` and point VITE_PORTAL_URL / VITE_SITE_URL at each
 * other (see README).
 */
const PORTAL_PATH = /^\/(login|signup|track|account|dashboard)(\/|$|\?|#)/;

function portalFallback(): Plugin {
  const rewrite = (req: { url?: string }) => {
    const url = req.url ?? '/';
    const [path, query] = url.split('?');
    if (PORTAL_PATH.test(path)) {
      req.url = `/portal.html${query ? `?${query}` : ''}`;
    }
  };

  return {
    name: 'portal-fallback',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req);
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), portalFallback()],
  resolve: {
    alias: { '@': resolve(process.cwd(), 'shared') },
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      input: {
        index: resolve(process.cwd(), 'index.html'),
        portal: resolve(process.cwd(), 'portal.html'),
      },
    },
  },
});
