import { createModalInstance } from './bootstrap_resolver';
import type { ResolvedInstallOptions } from './types';

/**
 * 既存要素を Bootstrap Modal として扱える最低限の属性へ整える。
 *
 * @param element 整形対象の要素。
 * @return 戻り値はない。
 */
function prepareModalElement(element: HTMLElement): void {
  if (!element.classList.contains('modal')) {
    element.classList.add('modal');
  }

  if (element.tabIndex < 0) {
    element.tabIndex = -1;
  }

  if (!element.hasAttribute('aria-hidden')) {
    element.setAttribute('aria-hidden', 'true');
  }
}

/**
 * 任意要素を Bootstrap Modal として開く。
 *
 * @param element 開く対象の要素。
 * @param options 解決済み導入設定。
 * @return 完了時に解決される Promise。
 */
export function openDialogElement(
  element: HTMLElement,
  options: ResolvedInstallOptions,
): Promise<void> {
  prepareModalElement(element);
  const modalInstance = createModalInstance(element, options.bootstrap);
  if (!modalInstance) {
    return Promise.reject(new Error('Bootstrap Modal is unavailable.'));
  }

  modalInstance.show();
  return Promise.resolve();
}

/**
 * 任意要素を Bootstrap Modal として閉じる。
 *
 * @param element 閉じる対象の要素。
 * @param options 解決済み導入設定。
 * @return 完了時に解決される Promise。
 */
export function closeDialogElement(
  element: HTMLElement,
  options: ResolvedInstallOptions,
): Promise<void> {
  prepareModalElement(element);
  const modalInstance = createModalInstance(element, options.bootstrap);
  if (!modalInstance) {
    return Promise.reject(new Error('Bootstrap Modal is unavailable.'));
  }

  modalInstance.hide();
  return Promise.resolve();
}
