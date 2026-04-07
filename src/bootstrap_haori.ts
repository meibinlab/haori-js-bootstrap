import type { HaoriGlobalObject, ResolvedInstallOptions } from './types';

/** BootstrapHaori が利用する内部コンテキスト。 */
export interface BootstrapHaoriContext {
  /** 差し替え前の Haori 実装。 */
  originalHaori?: HaoriGlobalObject;
  /** 解決済みの導入設定。 */
  options: ResolvedInstallOptions;
}

const defaultContext: BootstrapHaoriContext = {
  options: {
    fallbackToNative: true,
  },
};

let context = defaultContext;

function getBrowserWindow(): Window | undefined {
  const scope = globalThis as typeof globalThis & { window?: Window };
  return scope.window;
}

function toPromiseVoid(value: Promise<void> | void | unknown): Promise<void> {
  return Promise.resolve(value).then(() => undefined);
}

function getOriginalMethod(
  methodName: keyof HaoriGlobalObject,
): ((...args: readonly unknown[]) => unknown) | undefined {
  const method = context.originalHaori?.[methodName];
  return typeof method === 'function'
    ? (method as (...args: readonly unknown[]) => unknown)
    : undefined;
}

/**
 * BootstrapHaori が参照する内部状態を更新する。
 *
 * @param nextContext 差し替え先が参照する内部コンテキスト。
 * @return 戻り値はない。
 */
export function setBootstrapHaoriContext(nextContext: BootstrapHaoriContext): void {
  context = nextContext;
}

/** Haori の UI 系静的メソッドを差し替える最小ファサード。 */
export class BootstrapHaori {
  /**
   * 情報表示ダイアログを表示する。
   *
   * @param message 表示するメッセージ。
   * @return 完了時に解決される Promise。
   */
  public static dialog(message: string): Promise<void> {
    const originalMethod = getOriginalMethod('dialog');
    if (originalMethod) {
      return toPromiseVoid(originalMethod(message));
    }

    const browserWindow = getBrowserWindow();
    if (context.options.fallbackToNative && typeof browserWindow?.alert === 'function') {
      browserWindow.alert(message);
    }

    return Promise.resolve();
  }

  /**
   * 確認ダイアログを表示する。
   *
   * @param message 表示するメッセージ。
   * @return OK のみ true を返す Promise。
   */
  public static confirm(message: string): Promise<boolean> {
    const originalMethod = getOriginalMethod('confirm');
    if (originalMethod) {
      return Promise.resolve(originalMethod(message) as Promise<boolean> | boolean).then(
        (value) => Boolean(value),
      );
    }

    const browserWindow = getBrowserWindow();
    if (context.options.fallbackToNative && typeof browserWindow?.confirm === 'function') {
      return Promise.resolve(browserWindow.confirm(message));
    }

    return Promise.resolve(false);
  }

  /**
   * トースト通知を表示する。
   *
   * @param message 表示するメッセージ。
   * @param level 通知レベル。
   * @return 完了時に解決される Promise。
   */
  public static toast(message: string, level?: string): Promise<void> {
    const originalMethod = getOriginalMethod('toast');
    if (originalMethod) {
      return toPromiseVoid(originalMethod(message, level));
    }

    return Promise.resolve();
  }

  /**
   * 任意のダイアログ要素を開く。
   *
   * @param element 開く対象の要素。
   * @return 完了時に解決される Promise。
   */
  public static openDialog(element: HTMLElement): Promise<void> {
    const originalMethod = getOriginalMethod('openDialog');
    if (originalMethod) {
      return toPromiseVoid(originalMethod(element));
    }

    return Promise.resolve();
  }

  /**
   * 任意のダイアログ要素を閉じる。
   *
   * @param element 閉じる対象の要素。
   * @return 完了時に解決される Promise。
   */
  public static closeDialog(element: HTMLElement): Promise<void> {
    const originalMethod = getOriginalMethod('closeDialog');
    if (originalMethod) {
      return toPromiseVoid(originalMethod(element));
    }

    return Promise.resolve();
  }

  /**
   * 管理対象のエラーメッセージを追加する。
   *
   * @param target 追加先の要素。
   * @param message 表示するメッセージ。
   * @return 完了時に解決される Promise。
   */
  public static addErrorMessage(target: HTMLElement, message: string): Promise<void> {
    const originalMethod = getOriginalMethod('addErrorMessage');
    if (originalMethod) {
      return toPromiseVoid(originalMethod(target, message));
    }

    return Promise.resolve();
  }

  /**
   * 管理対象のメッセージを削除する。
   *
   * @param parentOrTarget 削除対象の親要素または対象要素。
   * @return 完了時に解決される Promise。
   */
  public static clearMessages(parentOrTarget: HTMLElement): Promise<void> {
    const originalMethod = getOriginalMethod('clearMessages');
    if (originalMethod) {
      return toPromiseVoid(originalMethod(parentOrTarget));
    }

    return Promise.resolve();
  }
}
