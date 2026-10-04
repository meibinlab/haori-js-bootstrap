import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

import { defineConfig, type Plugin } from 'vite';

const demoRoot = fileURLToPath(new URL('./', import.meta.url));
const demoPageNames = [
  'index.html',
  'api.html',
  'procedure.html',
  'checkbox-radio.html',
  'cdn.html',
  'admin-table.html',
  'modal-copy.html',
  'dialog-label.html',
  'dismiss-lock.html',
];
const demoInputs = Object.fromEntries(
  demoPageNames.map((pageName) => [pageName, fileURLToPath(new URL(pageName, import.meta.url))]),
);

/** ルート直下で配信する IIFE 配布物のファイル名。 */
const iifeFileName = 'haori-bootstrap.iife.js';

/** IIFE 配布物の実体（デモのルートの外にある）。 */
const iifeFilePath = fileURLToPath(new URL(`../dist/${iifeFileName}`, import.meta.url));

/**
 * ビルド済みの IIFE 配布物を、デモのルート直下（`haori-bootstrap.iife.js`）で配信する。
 *
 * <p>ボタン文言デモは、`<script>` タグの属性で設定する構成を確認するため、モジュール
 * の import ではなく素の `<script src>` で読み込む必要がある。配布物は `dist/`
 * （デモのルートの外）にあり、そのままでは開発サーバーが配信しない。`publicDir` を
 * `dist/` へ向けると型定義やソースマップまで公開デモへ含まれるため、この 1 ファイル
 * だけを配信する。
 *
 * @return Vite プラグイン。
 */
function serveIifeBundle(): Plugin {
  return {
    name: 'serve-iife-bundle',
    configureServer(server) {
      server.middlewares.use(`/${iifeFileName}`, (_request, response) => {
        response.setHeader('Content-Type', 'text/javascript');
        response.end(readFileSync(iifeFilePath));
      });
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: iifeFileName,
        source: readFileSync(iifeFilePath),
      });
    },
  };
}

/**
 * デモ確認用の Vite 設定。
 */
export default defineConfig({
  root: demoRoot,
  // 公開先（GitHub Pages）はリポジトリ名のサブパスで配信するため、ビルド結果の参照を
  // 相対パスにする。ルート始まりのパスでは、公開先でだけスクリプトが読めなくなる。
  base: './',
  // デモが取得する静的な JSON は、既定の publicDir（`demo/public`）に置き、ビルドへ
  // そのまま含める。`demo/` 直下に置くと、開発サーバーでは読めても公開先では 404 になる。
  plugins: [serveIifeBundle()],
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
