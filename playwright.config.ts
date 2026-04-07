import { defineConfig, devices } from '@playwright/test';

/**
 * デモ向け E2E テストの Playwright 設定。
 */
export default defineConfig({
  testDir: './playwright',
  fullyParallel: process.env.CI === 'true',
  timeout: 30_000,
  workers: process.env.CI === 'true' ? 2 : 1,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: process.env.CI === 'true',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npx vite --config demo/vite.config.ts --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173/index.html',
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
});