import { hasAutoEnablePrerequisites, install } from './install';
import type { BrowserWindow } from './types';

const AUTO_ENABLE_MARKER = '__haoriJsBootstrapAutoEnabled__';

function getBrowserWindow(): BrowserWindow | undefined {
  const scope = globalThis as typeof globalThis & { window?: BrowserWindow };
  return scope.window;
}

function wasAutoEnabled(browserWindow: BrowserWindow): boolean {
  return Boolean((browserWindow as unknown as Record<string, unknown>)[AUTO_ENABLE_MARKER]);
}

function markAutoEnabled(browserWindow: BrowserWindow): void {
  (browserWindow as unknown as Record<string, unknown>)[AUTO_ENABLE_MARKER] = true;
}

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
