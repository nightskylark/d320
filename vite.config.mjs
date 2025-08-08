import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

const isCI = !!process.env.GITHUB_REPOSITORY;
// for pages by address https://<user>.github.io/d320/
const base = isCI ? '/d320/' : '/';

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


