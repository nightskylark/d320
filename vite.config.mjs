import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

// Allow overriding the base path via environment variable.
// This is useful for deploying to GitHub Pages where the app is served
// from a subdirectory like https://<user>.github.io/d320/.
// For all other environments (including https://d320.world) we keep the
// root path so assets are resolved correctly.
const base = process.env.VITE_BASE || '/';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      crypto: 'empty-module',
      buffer: 'buffer',
      process: 'process/browser',
    },
  },
  define: {
    global: 'globalThis',
  },
  base,
});


