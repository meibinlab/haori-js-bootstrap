import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';

/**
 * デモ確認用の Vite 設定。
 */
export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  server: {
    open: '/index.html',
  },
  build: {
    emptyOutDir: true,
    outDir: fileURLToPath(new URL('../dist-demo', import.meta.url)),
  },
});
