import { createToastInstance } from './bootstrap_resolver';
import type { ResolvedInstallOptions } from './types';

const TOAST_CONTAINER_ATTRIBUTE = 'data-haori-bootstrap-toast-container';
const TOAST_ATTRIBUTE = 'data-haori-bootstrap-toast';

/**
 * 通知レベルを Bootstrap class へ変換する。
 *
 * @param level 通知レベル。
 * @return 対応する class 名。
 */
function mapToastLevelToClass(level?: string): string {
  switch (level) {
    case 'warning':
      return 'text-bg-warning';
    case 'error':
      return 'text-bg-danger';
    default:
      return 'text-bg-info';
  }
}

/**
 * toast コンテナを配置する親要素を解決する。
 *
 * @param documentObject 検索に使用する document。
 * @param options 解決済み導入設定。
 * @return 配置先の要素。
 */
function resolveToastRoot(documentObject: Document, options: ResolvedInstallOptions): HTMLElement {
  if (options.toastContainerSelector) {
    const resolvedElement = documentObject.querySelector<HTMLElement>(options.toastContainerSelector);
    if (resolvedElement) {
      return resolvedElement;
    }
  }

  return documentObject.body;
}

/**
 * toast コンテナを取得または生成する。
 *
 * @param documentObject 生成に使用する document。
 * @param options 解決済み導入設定。
 * @return 取得または生成したコンテナ。
 */
function ensureToastContainer(documentObject: Document, options: ResolvedInstallOptions): HTMLElement {
  const rootElement = resolveToastRoot(documentObject, options);
  const existingContainer = rootElement.querySelector<HTMLElement>(
    `[${TOAST_CONTAINER_ATTRIBUTE}="true"]`,
  );
  if (existingContainer) {
    return existingContainer;
  }

  const container = documentObject.createElement('div');
  container.className = 'toast-container position-fixed top-0 end-0 p-3';
  container.setAttribute(TOAST_CONTAINER_ATTRIBUTE, 'true');
  rootElement.appendChild(container);
  return container;
}

/**
 * Bootstrap Toast を表示する。
 *
 * @param message 表示するメッセージ。
 * @param level 通知レベル。
 * @param options 解決済み導入設定。
 * @return 完了時に解決される Promise。
 */
export function showToast(
  message: string,
  level: string | undefined,
  options: ResolvedInstallOptions,
): Promise<void> {
  const documentObject = globalThis.document;
  const toastElement = documentObject.createElement('div');
  toastElement.className = `toast align-items-center border-0 ${mapToastLevelToClass(level)}`;
  toastElement.setAttribute('role', 'status');
  toastElement.setAttribute('aria-live', 'polite');
  toastElement.setAttribute('aria-atomic', 'true');
  toastElement.setAttribute(TOAST_ATTRIBUTE, 'true');

  const bodyWrapper = documentObject.createElement('div');
  bodyWrapper.className = 'd-flex';

  const bodyElement = documentObject.createElement('div');
  bodyElement.className = 'toast-body';
  bodyElement.textContent = message;

  bodyWrapper.appendChild(bodyElement);
  toastElement.appendChild(bodyWrapper);
  ensureToastContainer(documentObject, options).appendChild(toastElement);

  const toastInstance = createToastInstance(toastElement, options.bootstrap);
  if (!toastInstance) {
    toastElement.remove();
    return Promise.reject(new Error('Bootstrap Toast is unavailable.'));
  }

  toastElement.addEventListener(
    'hidden.bs.toast',
    () => {
      toastElement.remove();
      toastInstance.dispose?.();
    },
    { once: true },
  );

  try {
    toastInstance.show();
    return Promise.resolve();
  } catch (error) {
    toastElement.remove();
    toastInstance.dispose?.();
    return Promise.reject(error);
  }
}
