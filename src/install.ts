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

/**
 * BootstrapHaori が差し替える UI 系静的メソッド名。
 * これら以外（`Core` / `waitForRenders` / `version` / `setBindingData` などの
 * コア API）は元の Haori 実装へそのまま委譲する。
 */
const OVERRIDDEN_METHOD_NAMES: ReadonlySet<string> = new Set<string>([
  'dialog',
  'confirm',
  'toast',
  'openDialog',
  'closeDialog',
  'addErrorMessage',
  'addMessage',
  'clearMessages',
]);

/**
 * UI 系メソッドだけを BootstrapHaori に差し替え、それ以外のプロパティ
 * （コア API・名前付きエクスポート等）は元の Haori 実装へ委譲する
 * グローバル Haori を生成する。
 *
 * これにより `Haori.Core` / `Haori.waitForRenders` / `Haori.version` などが
 * 導入後も引き続き利用できる（従来は最小ファサードで上書きされ消失していた）。
 *
 * @param originalHaori 差し替え前の Haori 実装。
 * @return UI メソッドを差し替えた Haori グローバル。
 */
function createInstalledHaori(originalHaori: HaoriGlobalObject): HaoriGlobalObject {
  const overrides = BootstrapHaori as unknown as Record<string, unknown>;
  return new Proxy(originalHaori, {
    get(target, property, receiver): unknown {
      if (typeof property === 'string' && OVERRIDDEN_METHOD_NAMES.has(property)) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    has(target, property): boolean {
      // 元の Haori が UI メソッドを持たない最小実装でも、get では BootstrapHaori
      // の実装を返すため、`in` 判定も常に true にして get と一貫させる。
      if (typeof property === 'string' && OVERRIDDEN_METHOD_NAMES.has(property)) {
        return true;
      }
      return Reflect.has(target, property);
    },
  });
}

const installState: {
  installed: boolean;
  originalHaori?: HaoriGlobalObject;
  originalRuntime?: 'embedded' | 'demo';
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
    runtime:
      options.runtime ?? installState.options.runtime ?? browserWindow?.Haori?.runtime,
    toastContainerSelector:
      options.toastContainerSelector ?? installState.options.toastContainerSelector,
    dialogContainerSelector:
      options.dialogContainerSelector ?? installState.options.dialogContainerSelector,
    dialogTitle: options.dialogTitle ?? installState.options.dialogTitle,
    toastPosition: options.toastPosition ?? installState.options.toastPosition,
    toastDelay: options.toastDelay ?? installState.options.toastDelay,
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
    installState.originalRuntime = browserWindow.Haori.runtime as 'embedded' | 'demo' | undefined;
  }

  installState.options = resolveInstallOptions(options, browserWindow);
  if (installState.options.runtime) {
    const targetHaori = installState.originalHaori ?? browserWindow.Haori;
    if (typeof targetHaori.setRuntime === 'function') {
      targetHaori.setRuntime(installState.options.runtime);
    } else {
      console.warn(
        '[haori-bootstrap] Haori.setRuntime が利用できません。runtime 設定は無視されます。',
      );
    }
  }
  setBootstrapHaoriContext({
    originalHaori: installState.originalHaori,
    options: installState.options,
  });
  browserWindow.Haori = createInstalledHaori(installState.originalHaori);
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

  // runtime は getter のみの実装（core Haori）があり、直接代入すると strict mode で
  // TypeError になる。setRuntime があればそれ経由で復元し、無い実装（プレーンな
  // スタブ等）にのみ直接代入でフォールバックする。
  const original = installState.originalHaori;
  if (typeof original.setRuntime === 'function') {
    original.setRuntime(installState.originalRuntime as 'embedded' | 'demo');
  } else {
    original.runtime = installState.originalRuntime;
  }
  browserWindow.Haori = installState.originalHaori;
  installState.installed = false;
  installState.originalHaori = undefined;
  installState.originalRuntime = undefined;
  installState.options = DEFAULT_INSTALL_OPTIONS;
}

/**
 * 現在 BootstrapHaori が有効かどうかを返す。
 *
 * @return 有効なら true。
 */
export function isInstalled(): boolean {
  return installState.installed;
}
