/**
 * Bootstrap Modal インスタンスの最小契約。
 */
export interface BootstrapModalInstance {
  /** Modal を表示する。 */
  show: () => void;
  /** Modal を閉じる。 */
  hide: () => void;
  /** 後始末を行う。 */
  dispose?: () => void;
}

/**
 * Bootstrap Modal の最小設定。
 */
export interface BootstrapModalOptions {
  /** backdrop click を無効化して backdrop 自体は表示する。 */
  backdrop?: 'static' | boolean;
}

/**
 * Bootstrap Toast インスタンスの最小契約。
 */
export interface BootstrapToastInstance {
  /** Toast を表示する。 */
  show: () => void;
  /** 後始末を行う。 */
  dispose?: () => void;
}

/**
 * Bootstrap Modal コンストラクターの最小契約。
 */
export interface BootstrapModalConstructor {
  /**
   * Modal インスタンスを生成する。
   *
   * @param element 対象要素。
   * @param options Modal 設定。
   */
  new (element: Element, options?: BootstrapModalOptions): BootstrapModalInstance;
  /**
   * Modal インスタンスを取得または生成する。
   *
   * @param element 対象要素。
   * @param options Modal 設定。
   * @return Modal インスタンス。
   */
  getOrCreateInstance?: (element: Element, options?: BootstrapModalOptions) => BootstrapModalInstance;
}

/**
 * Bootstrap Toast コンストラクターの最小契約。
 */
export interface BootstrapToastConstructor {
  /**
   * Toast インスタンスを生成する。
   *
   * @param element 対象要素。
   */
  new (element: Element): BootstrapToastInstance;
  /**
   * Toast インスタンスを取得または生成する。
   *
   * @param element 対象要素。
   * @return Toast インスタンス。
   */
  getOrCreateInstance?: (element: Element) => BootstrapToastInstance;
}

/**
 * Toast コンテナの表示位置。Bootstrap の position-fixed クラスに対応する。
 */
export type ToastPosition =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end';

/**
 * Bootstrap 名前空間の最小契約。
 */
export interface BootstrapNamespace {
  Modal?: BootstrapModalConstructor;
  Toast?: BootstrapToastConstructor;
  [key: string]: unknown;
}

/**
 * Haori.js Bootstrap の導入設定。
 */
export interface InstallOptions {
  /** Bootstrap 名前空間を明示的に渡す。 */
  bootstrap?: BootstrapNamespace;
  /** Bootstrap 利用不可時に元の Haori へ委譲するか。 */
  fallbackToNative?: boolean;
  /** Haori の実行モード。 */
  runtime?: 'embedded' | 'demo';
  /** Toast 配置先セレクター。 */
  toastContainerSelector?: string;
  /** Dialog 配置先セレクター。 */
  dialogContainerSelector?: string;
  /** Toast コンテナの表示位置。未指定は 'bottom-end'。 */
  toastPosition?: ToastPosition;
}

/**
 * 内部で解決済みの導入設定。
 */
export interface ResolvedInstallOptions {
  /** Bootstrap 名前空間。 */
  bootstrap?: BootstrapNamespace;
  /** Bootstrap 利用不可時に元の Haori へ委譲するか。 */
  fallbackToNative: boolean;
  /** Haori の実行モード。 */
  runtime?: 'embedded' | 'demo';
  /** Toast 配置先セレクター。 */
  toastContainerSelector?: string;
  /** Dialog 配置先セレクター。 */
  dialogContainerSelector?: string;
  /** Toast コンテナの表示位置。未指定は 'bottom-end'。 */
  toastPosition?: ToastPosition;
}

/**
 * Haori の静的メソッド群に対する最小契約。
 */
export interface HaoriGlobalObject {
  [key: string]: unknown;
  /** 現在の実行モード。 */
  runtime?: 'embedded' | 'demo';
  /** 実行モードを設定する。 */
  setRuntime?: (runtime: string) => void;
  dialog?: (message: string) => Promise<void> | void;
  confirm?: (message: string) => Promise<boolean> | boolean;
  toast?: (message: string, level?: string) => Promise<void> | void;
  openDialog?: (element: HTMLElement) => Promise<void> | void;
  closeDialog?: (element: HTMLElement) => Promise<void> | void;
  addErrorMessage?: (target: HTMLElement, message: string) => Promise<void> | void;
  clearMessages?: (parentOrTarget: HTMLElement) => Promise<void> | void;
}

/**
 * ブラウザ環境で利用する window の拡張契約。
 */
export interface BrowserWindow extends Window {
  Haori?: HaoriGlobalObject;
  bootstrap?: BootstrapNamespace;
  HaoriBootstrap?: HaoriBootstrapGlobal;
}

/**
 * IIFE 版で補助公開されるグローバル API。
 */
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
