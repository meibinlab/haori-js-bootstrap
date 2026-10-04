import { defineConfig } from '@playwright/test';

import baseConfig from './playwright.config';

/** GitHub Pages で公開するときのデモのパス（プロジェクトサイトのため、リポジトリ名の下に置かれる）。 */
const pagesBasePath = '/haori-js-bootstrap/';

/**
 * 公開構成のデモ向け E2E テストの Playwright 設定。
 *
 * <p>開発サーバーではなく、ビルド済みのデモ（`dist-demo`）を GitHub Pages と同じ
 * サブパスで配信して確かめる。開発サーバーはサイトのルートで配信するため、ルート
 * 始まりのパスや、ビルドに含まれないファイルへの参照が、公開先でだけ壊れる。
 */
export default defineConfig({
  ...baseConfig,
  use: {
    ...baseConfig.use,
    baseURL: `http://127.0.0.1:4174${pagesBasePath}`,
  },
  webServer: {
    command: `npx vite preview --config demo/vite.config.ts --host 127.0.0.1 --port 4174 --strictPort --base ${pagesBasePath}`,
    url: `http://127.0.0.1:4174${pagesBasePath}index.html`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
