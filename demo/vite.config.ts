import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';

const demoRoot = fileURLToPath(new URL('./', import.meta.url));
const demoPageNames = [
  'index.html',
  'api.html',
  'procedure.html',
  'checkbox-radio.html',
  'cdn.html',
];
const demoInputs = Object.fromEntries(
  demoPageNames.map((pageName) => [pageName, fileURLToPath(new URL(pageName, import.meta.url))]),
);

/**
 * デモ確認用の Vite 設定。
 */
export default defineConfig({
  root: demoRoot,
  server: {
    open: '/index.html',
  },
  build: {
    emptyOutDir: true,
    outDir: fileURLToPath(new URL('../dist-demo', import.meta.url)),
    rollupOptions: {
      input: demoInputs,
    },
  },
});
