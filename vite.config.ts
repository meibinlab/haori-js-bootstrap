import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

/** ライブラリ配布用の Vite 設定。 */
export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: 'src/index.ts',
      name: 'HaoriBootstrap',
      formats: ['es', 'iife'],
      fileName: (format) =>
        format === 'es' ? 'haori-js-bootstrap.js' : 'haori-js-bootstrap.iife.js',
    },
    sourcemap: true,
    rollupOptions: {
      output: {
        exports: 'named',
      },
    },
  },
  plugins: [
    dts({
      entryRoot: 'src',
      include: ['src/**/*.ts'],
      insertTypesEntry: true,
    }),
  ],
});
