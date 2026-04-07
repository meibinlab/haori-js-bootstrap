/** Bootstrap 名前空間の最小契約。 */
export interface BootstrapNamespace {
  Modal?: unknown;
  Toast?: unknown;
  [key: string]: unknown;
}

/** Haori.js Bootstrap の導入設定。 */
export interface InstallOptions {
  /** Bootstrap 名前空間を明示的に渡す。 */
  bootstrap?: BootstrapNamespace;
  /** Bootstrap 利用不可時に元の Haori へ委譲するか。 */
  fallbackToNative?: boolean;
  /** Toast 配置先セレクター。 */
  toastContainerSelector?: string;
  /** Dialog 配置先セレクター。 */
  dialogContainerSelector?: string;
}

/** 内部で解決済みの導入設定。 */
export interface ResolvedInstallOptions {
  /** Bootstrap 名前空間。 */
  bootstrap?: BootstrapNamespace;
  /** Bootstrap 利用不可時に元の Haori へ委譲するか。 */
  fallbackToNative: boolean;
  /** Toast 配置先セレクター。 */
  toastContainerSelector?: string;
  /** Dialog 配置先セレクター。 */
  dialogContainerSelector?: string;
}

/** Haori の静的メソッド群に対する最小契約。 */
export interface HaoriGlobalObject {
  [key: string]: unknown;
  dialog?: (message: string) => Promise<void> | void;
  confirm?: (message: string) => Promise<boolean> | boolean;
  toast?: (message: string, level?: string) => Promise<void> | void;
  openDialog?: (element: HTMLElement) => Promise<void> | void;
  closeDialog?: (element: HTMLElement) => Promise<void> | void;
  addErrorMessage?: (target: HTMLElement, message: string) => Promise<void> | void;
  clearMessages?: (parentOrTarget: HTMLElement) => Promise<void> | void;
}

/** ブラウザ環境で利用する window の拡張契約。 */
export interface BrowserWindow extends Window {
  Haori?: HaoriGlobalObject;
  bootstrap?: BootstrapNamespace;
  HaoriBootstrap?: HaoriBootstrapGlobal;
}

/** IIFE 版で補助公開されるグローバル API。 */
export interface HaoriBootstrapGlobal {
  /**
   * Bootstrap 対応 Haori を再適用する。
   *
   * @param options 上書きする導入設定。
   * @return 戻り値はない。
   */
  install: (options?: InstallOptions) => void;
  /**
   * 元の Haori 実装を復元する。
   *
   * @return 戻り値はない。
   */
  uninstall: () => void;
  /** パッケージ版数。 */
  version: string;
}

declare global {
  interface Window {
    Haori?: HaoriGlobalObject;
    bootstrap?: BootstrapNamespace;
    HaoriBootstrap?: HaoriBootstrapGlobal;
  }
}
