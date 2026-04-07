import { hasAutoEnablePrerequisites, install } from './install';
import type { BrowserWindow } from './types';

const AUTO_ENABLE_MARKER = '__haoriJsBootstrapAutoEnabled__';

/**
 * 現在のブラウザ window を取得する。
 *
 * @return 現在の window。存在しない場合は undefined。
 */
function getBrowserWindow(): BrowserWindow | undefined {
  const scope = globalThis as typeof globalThis & { window?: BrowserWindow };
  return scope.window;
}

/**
 * 既に自動有効化済みかどうかを返す。
 *
 * @param browserWindow 判定対象の window。
 * @return 既に自動有効化済みなら true。
 */
function wasAutoEnabled(browserWindow: BrowserWindow): boolean {
  return Boolean((browserWindow as unknown as Record<string, unknown>)[AUTO_ENABLE_MARKER]);
}

/**
 * 自動有効化済みの印を付ける。
 *
 * @param browserWindow 更新対象の window。
 * @return 戻り値はない。
 */
function markAutoEnabled(browserWindow: BrowserWindow): void {
  (browserWindow as unknown as Record<string, unknown>)[AUTO_ENABLE_MARKER] = true;
}

/**
 * 前提が揃っていれば自動有効化を試行する。
 *
 * @return 戻り値はない。
 */
function autoEnable(): void {
  const browserWindow = getBrowserWindow();
  if (!browserWindow || wasAutoEnabled(browserWindow)) {
    return;
  }

  if (!hasAutoEnablePrerequisites(browserWindow)) {
    console.warn(
      '[haori-js-bootstrap] Auto-enable skipped because window.Haori or window.bootstrap is missing.',
    );
    return;
  }

  try {
    install({ bootstrap: browserWindow.bootstrap });
    markAutoEnabled(browserWindow);
  } catch (error) {
    console.warn('[haori-js-bootstrap] Auto-enable failed.', error);
  }
}

autoEnable();
