import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Standalone build of the public website only.
 * Output: dist/site  — deploy this folder as the marketing site.
 * Set VITE_PORTAL_URL to the portal's origin so nav links reach it.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(process.cwd(), 'shared') },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    outDir: 'dist/site',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(process.cwd(), 'index.html'),
    },
  },
});
