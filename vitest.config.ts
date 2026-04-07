import { defineConfig } from 'vitest/config';

/** テスト実行用の Vitest 設定。 */
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
});
