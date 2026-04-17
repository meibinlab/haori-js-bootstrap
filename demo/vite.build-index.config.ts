import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';

export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  appType: 'mpa',
  base: '/haori-js-bootstrap/',
  build: {
    emptyOutDir: true,
    outDir: fileURLToPath(new URL('../dist/demo', import.meta.url)),
    rollupOptions: {
      input: fileURLToPath(new URL('./index.html', import.meta.url)),
    },
  },
});