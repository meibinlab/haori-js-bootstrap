import { BootstrapHaori, setBootstrapHaoriContext } from './bootstrap_haori';
import type {
  BrowserWindow,
  HaoriGlobalObject,
  InstallOptions,
  ResolvedInstallOptions,
} from './types';

const DEFAULT_INSTALL_OPTIONS: ResolvedInstallOptions = {
  fallbackToNative: true,
};

const installState: {
  installed: boolean;
  originalHaori?: HaoriGlobalObject;
  options: ResolvedInstallOptions;
} = {
  installed: false,
  options: DEFAULT_INSTALL_OPTIONS,
};

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
 * install に渡された設定を既定値込みで解決する。
 *
 * @param options 指定された導入設定。
 * @param browserWindow 現在の window。
 * @return 解決済みの導入設定。
 */
function resolveInstallOptions(
  options: InstallOptions,
  browserWindow: BrowserWindow | undefined,
): ResolvedInstallOptions {
  return {
    bootstrap: options.bootstrap ?? browserWindow?.bootstrap,
    fallbackToNative: options.fallbackToNative ?? DEFAULT_INSTALL_OPTIONS.fallbackToNative,
    toastContainerSelector: options.toastContainerSelector,
    dialogContainerSelector: options.dialogContainerSelector,
  };
}

/**
 * 自動有効化に必要な前提が揃っているかを返す。
 *
 * @param browserWindow 判定対象の window。
 * @return 自動有効化可能なら true。
 */
export function hasAutoEnablePrerequisites(
  browserWindow: BrowserWindow | undefined = getBrowserWindow(),
): boolean {
  return Boolean(browserWindow?.Haori && browserWindow.bootstrap);
}

/**
 * Bootstrap 対応 Haori を再適用し、必要なら設定を上書きする。
 *
 * @param options 上書きする導入設定。
 * @return 戻り値はない。
 */
export function install(options: InstallOptions = {}): void {
  const browserWindow = getBrowserWindow();
  if (!browserWindow?.Haori) {
    throw new Error('window.Haori is required before calling install().');
  }

  if (!installState.originalHaori) {
    installState.originalHaori = browserWindow.Haori;
  }

  installState.options = resolveInstallOptions(options, browserWindow);
  setBootstrapHaoriContext({
    originalHaori: installState.originalHaori,
    options: installState.options,
  });
  browserWindow.Haori = BootstrapHaori as unknown as HaoriGlobalObject;
  installState.installed = true;
}

/**
 * 元の Haori 実装を復元する。
 *
 * @return 戻り値はない。
 */
export function uninstall(): void {
  const browserWindow = getBrowserWindow();
  if (!browserWindow || !installState.originalHaori) {
    return;
  }

  browserWindow.Haori = installState.originalHaori;
  installState.installed = false;
  installState.originalHaori = undefined;
}

/**
 * 現在 BootstrapHaori が有効かどうかを返す。
 *
 * @return 有効なら true。
 */
export function isInstalled(): boolean {
  return installState.installed;
}
