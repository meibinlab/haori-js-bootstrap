import { hasModalSupport, hasToastSupport } from './bootstrap_resolver';
import { showConfirm, showDialog } from './dialog';
import { addManagedErrorMessage, clearManagedMessages } from './message';
import { closeDialogElement, openDialogElement } from './modal';
import { showToast } from './toast';
import type { HaoriGlobalObject, ResolvedInstallOptions } from './types';

/**
 * BootstrapHaori が利用する内部コンテキスト。
 */
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

/**
 * 表示用 message 中のエスケープ済み改行を実際の改行へ正規化する。
 *
 * @param message 正規化対象のメッセージ。
 * @return 正規化後のメッセージ。
 */
function normalizeMessageText(message: string): string {
  return message.replace(/\\n/g, '\n');
}

/**
 * 現在のブラウザ window を取得する。
 *
 * @return 現在の window。存在しない場合は undefined。
 */
function getBrowserWindow(): Window | undefined {
  const scope = globalThis as typeof globalThis & { window?: Window };
  return scope.window;
}

/**
 * 値を Promise<void> 契約へ正規化する。
 *
 * @param value 正規化対象の値。
 * @return 完了時に解決される Promise。
 */
function toPromiseVoid(value: Promise<void> | void | unknown): Promise<void> {
  return Promise.resolve(value).then(() => undefined);
}

/**
 * 元の Haori 実装から対象メソッドを取得する。
 *
 * @param methodName 取得対象のメソッド名。
 * @return 対象メソッド。見つからない場合は undefined。
 */
function getOriginalMethod(
  methodName: keyof HaoriGlobalObject,
): ((...args: readonly unknown[]) => unknown) | undefined {
  const method = context.originalHaori?.[methodName];
  return typeof method === 'function'
    ? (method as (...args: readonly unknown[]) => unknown)
    : undefined;
}

/**
 * no-op に正規化したことを警告する。
 *
 * @param apiName 利用できなかった API 名。
 * @return 戻り値はない。
 */
function warnNoop(apiName: string): void {
  console.warn(`[haori-bootstrap] ${apiName} skipped because Bootstrap support is unavailable.`);
}

/**
 * dialog の fallback 経路を処理する。
 *
 * @param message 表示対象のメッセージ。
 * @return 完了時に解決される Promise。
 */
function fallbackDialog(message: string): Promise<void> {
  const normalizedMessage = normalizeMessageText(message);
  const originalMethod = getOriginalMethod('dialog');
  if (originalMethod) {
    return toPromiseVoid(originalMethod(normalizedMessage));
  }

  const browserWindow = getBrowserWindow();
  if (context.options.fallbackToNative && typeof browserWindow?.alert === 'function') {
    browserWindow.alert(normalizedMessage);
    return Promise.resolve();
  }

  warnNoop('dialog');
  return Promise.resolve();
}

/**
 * confirm の fallback 経路を処理する。
 *
 * @param message 表示対象のメッセージ。
 * @return 確認結果を返す Promise。
 */
function fallbackConfirm(message: string): Promise<boolean> {
  const normalizedMessage = normalizeMessageText(message);
  const originalMethod = getOriginalMethod('confirm');
  if (originalMethod) {
    return Promise.resolve(originalMethod(normalizedMessage) as Promise<boolean> | boolean).then(
      (value) => Boolean(value),
    );
  }

  const browserWindow = getBrowserWindow();
  if (context.options.fallbackToNative && typeof browserWindow?.confirm === 'function') {
    return Promise.resolve(browserWindow.confirm(normalizedMessage));
  }

  warnNoop('confirm');
  return Promise.resolve(false);
}

/**
 * toast の fallback 経路を処理する。
 *
 * @param message 表示対象のメッセージ。
 * @param level 通知レベル。
 * @return 完了時に解決される Promise。
 */
function fallbackToast(message: string, level?: string): Promise<void> {
  const normalizedMessage = normalizeMessageText(message);
  const originalMethod = getOriginalMethod('toast');
  if (originalMethod) {
    return toPromiseVoid(originalMethod(normalizedMessage, level));
  }

  warnNoop('toast');
  return Promise.resolve();
}

/**
 * openDialog または closeDialog の fallback 経路を処理する。
 *
 * @param methodName 呼び出す API 名。
 * @param element 対象要素。
 * @return 完了時に解決される Promise。
 */
function fallbackModal(methodName: 'openDialog' | 'closeDialog', element: HTMLElement): Promise<void> {
  const originalMethod = getOriginalMethod(methodName);
  if (originalMethod) {
    return toPromiseVoid(originalMethod(element));
  }

  warnNoop(methodName);
  return Promise.resolve();
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

/**
 * Haori の UI 系静的メソッドを差し替える最小ファサード。
 */
export class BootstrapHaori {
  /**
   * 情報表示ダイアログを表示する。
   *
   * @param message 表示するメッセージ。
   * @return 完了時に解決される Promise。
   */
  public static dialog(message: string): Promise<void> {
    const normalizedMessage = normalizeMessageText(message);
    if (hasModalSupport(context.options.bootstrap)) {
      return showDialog(normalizedMessage, context.options).catch(() => fallbackDialog(normalizedMessage));
    }

    return fallbackDialog(normalizedMessage);
  }

  /**
   * 確認ダイアログを表示する。
   *
   * @param message 表示するメッセージ。
   * @return OK のみ true を返す Promise。
   */
  public static confirm(message: string): Promise<boolean> {
    const normalizedMessage = normalizeMessageText(message);
    if (hasModalSupport(context.options.bootstrap)) {
      return showConfirm(normalizedMessage, context.options).catch(() => fallbackConfirm(normalizedMessage));
    }

    return fallbackConfirm(normalizedMessage);
  }

  /**
   * トースト通知を表示する。
   *
   * @param message 表示するメッセージ。
   * @param level 通知レベル。
   * @return 完了時に解決される Promise。
   */
  public static toast(message: string, level?: string): Promise<void> {
    const normalizedMessage = normalizeMessageText(message);
    if (hasToastSupport(context.options.bootstrap)) {
      return showToast(normalizedMessage, level, context.options).catch(() =>
        fallbackToast(normalizedMessage, level),
      );
    }

    return fallbackToast(normalizedMessage, level);
  }

  /**
   * 任意のダイアログ要素を開く。
   *
   * @param element 開く対象の要素。
   * @return 完了時に解決される Promise。
   */
  public static openDialog(element: HTMLElement): Promise<void> {
    if (hasModalSupport(context.options.bootstrap)) {
      return openDialogElement(element, context.options).catch(() =>
        fallbackModal('openDialog', element),
      );
    }

    return fallbackModal('openDialog', element);
  }

  /**
   * 任意のダイアログ要素を閉じる。
   *
   * @param element 閉じる対象の要素。
   * @return 完了時に解決される Promise。
   */
  public static closeDialog(element: HTMLElement): Promise<void> {
    if (hasModalSupport(context.options.bootstrap)) {
      return closeDialogElement(element, context.options).catch(() =>
        fallbackModal('closeDialog', element),
      );
    }

    return fallbackModal('closeDialog', element);
  }

  /**
   * 管理対象のエラーメッセージを追加する。
   *
   * @param target 追加先の要素。
   * @param message 表示するメッセージ。
   * @return 完了時に解決される Promise。
   */
  public static addErrorMessage(target: HTMLElement, message: string): Promise<void> {
    return addManagedErrorMessage(target, message);
  }

  /**
   * 管理対象のメッセージを削除する。
   *
   * @param parentOrTarget 削除対象の親要素または対象要素。
   * @return 完了時に解決される Promise。
   */
  public static clearMessages(parentOrTarget: HTMLElement): Promise<void> {
    return clearManagedMessages(parentOrTarget);
  }
}
