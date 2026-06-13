import { createModalInstance } from './bootstrap_resolver';
import type { ResolvedInstallOptions } from './types';

const DIALOG_ATTRIBUTE = 'data-haori-dialog';
const CONFIRM_ATTRIBUTE = 'data-haori-confirm';
const DIALOG_TITLE_ATTRIBUTE = 'data-haori-dialog-title';
const DIALOG_OK_ATTRIBUTE = 'data-haori-dialog-ok';
const CONFIRM_OK_ATTRIBUTE = 'data-haori-confirm-ok';
const CONFIRM_CANCEL_ATTRIBUTE = 'data-haori-confirm-cancel';

let dialogTitleCounter = 0;

/**
 * dialog 系 modal の既定オプションを返す。
 *
 * @return Bootstrap Modal の生成オプション。
 */
function createDialogModalOptions() {
  return {
    backdrop: 'static' as const,
    keyboard: false,
  };
}

/**
 * dialog を挿入する親要素を解決する。
 *
 * @param documentObject 検索に使用する document。
 * @param options 解決済み導入設定。
 * @return 挿入先の要素。
 */
function resolveDialogContainer(documentObject: Document, options: ResolvedInstallOptions): HTMLElement {
  if (options.dialogContainerSelector) {
    const resolvedElement = documentObject.querySelector<HTMLElement>(
      options.dialogContainerSelector,
    );
    if (resolvedElement) {
      return resolvedElement;
    }
  }

  return documentObject.body;
}

/**
 * dialog または confirm 用の modal 要素を組み立てる。
 *
 * @param documentObject 生成に使用する document。
 * @param message 表示するメッセージ。
 * @param isConfirm confirm 用かどうか。
 * @param title ヘッダーに表示するタイトル。未指定はヘッダーなし。
 * @return 生成した modal 要素。
 */
function createModalShell(
  documentObject: Document,
  message: string,
  isConfirm: boolean,
  title?: string,
): HTMLDivElement {
  const modalElement = documentObject.createElement('div');
  modalElement.className = 'modal fade';
  modalElement.tabIndex = -1;
  modalElement.setAttribute(isConfirm ? CONFIRM_ATTRIBUTE : DIALOG_ATTRIBUTE, 'true');
  modalElement.setAttribute('aria-hidden', 'true');

  const dialogElement = documentObject.createElement('div');
  dialogElement.className = 'modal-dialog modal-dialog-centered';

  const contentElement = documentObject.createElement('div');
  contentElement.className = 'modal-content';

  if (title) {
    const titleId = `haori-dialog-title-${++dialogTitleCounter}`;
    const headerElement = documentObject.createElement('div');
    headerElement.className = 'modal-header';

    const titleElement = documentObject.createElement('h5');
    titleElement.className = 'modal-title';
    titleElement.id = titleId;
    titleElement.setAttribute(DIALOG_TITLE_ATTRIBUTE, 'true');
    titleElement.textContent = title;
    headerElement.appendChild(titleElement);

    contentElement.appendChild(headerElement);
    modalElement.setAttribute('aria-labelledby', titleId);
  }

  const bodyElement = documentObject.createElement('div');
  bodyElement.className = 'modal-body';

  const messageElement = documentObject.createElement('p');
  messageElement.className = 'mb-0';
  messageElement.style.whiteSpace = 'pre-line';
  messageElement.textContent = message;
  bodyElement.appendChild(messageElement);

  const footerElement = documentObject.createElement('div');
  footerElement.className = 'modal-footer';

  if (isConfirm) {
    const cancelButton = documentObject.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'btn btn-secondary';
    cancelButton.setAttribute(CONFIRM_CANCEL_ATTRIBUTE, 'true');
    cancelButton.textContent = 'Cancel';
    footerElement.appendChild(cancelButton);
  }

  const okButton = documentObject.createElement('button');
  okButton.type = 'button';
  okButton.className = 'btn btn-primary';
  okButton.setAttribute(isConfirm ? CONFIRM_OK_ATTRIBUTE : DIALOG_OK_ATTRIBUTE, 'true');
  okButton.textContent = 'OK';
  footerElement.appendChild(okButton);

  contentElement.append(bodyElement, footerElement);
  dialogElement.appendChild(contentElement);
  modalElement.appendChild(dialogElement);
  return modalElement;
}

/**
 * 情報表示用の Bootstrap Modal を表示する。
 *
 * @param message 表示するメッセージ。
 * @param options 解決済み導入設定。
 * @return 完了時に解決される Promise。
 */
export function showDialog(message: string, options: ResolvedInstallOptions): Promise<void> {
  const documentObject = globalThis.document;
  const modalElement = createModalShell(documentObject, message, false, options.dialogTitle);
  resolveDialogContainer(documentObject, options).appendChild(modalElement);

  const modalInstance = createModalInstance(
    modalElement,
    createDialogModalOptions(),
    options.bootstrap,
  );
  if (!modalInstance) {
    modalElement.remove();
    return Promise.reject(new Error('Bootstrap Modal is unavailable.'));
  }

  return new Promise<void>((resolve, reject) => {
    const finalize = (): void => {
      modalElement.removeEventListener('hidden.bs.modal', handleHidden);
      modalElement.remove();
      modalInstance.dispose?.();
      resolve();
    };

    const handleHidden = (): void => {
      finalize();
    };

    const okButton = modalElement.querySelector<HTMLButtonElement>(`[${DIALOG_OK_ATTRIBUTE}]`);
    okButton?.addEventListener(
      'click',
      () => {
        modalInstance.hide();
      },
      { once: true },
    );

    modalElement.addEventListener('hidden.bs.modal', handleHidden, { once: true });

    try {
      modalInstance.show();
    } catch (error) {
      modalElement.removeEventListener('hidden.bs.modal', handleHidden);
      modalElement.remove();
      modalInstance.dispose?.();
      reject(error);
    }
  });
}

/**
 * 確認用の Bootstrap Modal を表示する。
 *
 * @param message 表示するメッセージ。
 * @param options 解決済み導入設定。
 * @return OK のみ true を返す Promise。
 */
export function showConfirm(
  message: string,
  options: ResolvedInstallOptions,
): Promise<boolean> {
  const documentObject = globalThis.document;
  const modalElement = createModalShell(documentObject, message, true, options.dialogTitle);
  resolveDialogContainer(documentObject, options).appendChild(modalElement);

  const modalInstance = createModalInstance(
    modalElement,
    createDialogModalOptions(),
    options.bootstrap,
  );
  if (!modalInstance) {
    modalElement.remove();
    return Promise.reject(new Error('Bootstrap Modal is unavailable.'));
  }

  return new Promise<boolean>((resolve, reject) => {
    let confirmed = false;

    const finalize = (): void => {
      modalElement.removeEventListener('hidden.bs.modal', handleHidden);
      modalElement.remove();
      modalInstance.dispose?.();
      resolve(confirmed);
    };

    const handleHidden = (): void => {
      finalize();
    };

    const okButton = modalElement.querySelector<HTMLButtonElement>(`[${CONFIRM_OK_ATTRIBUTE}]`);
    const cancelButton = modalElement.querySelector<HTMLButtonElement>(
      `[${CONFIRM_CANCEL_ATTRIBUTE}]`,
    );

    okButton?.addEventListener(
      'click',
      () => {
        confirmed = true;
        modalInstance.hide();
      },
      { once: true },
    );
    cancelButton?.addEventListener(
      'click',
      () => {
        confirmed = false;
        modalInstance.hide();
      },
      { once: true },
    );

    modalElement.addEventListener('hidden.bs.modal', handleHidden, { once: true });

    try {
      modalInstance.show();
    } catch (error) {
      modalElement.removeEventListener('hidden.bs.modal', handleHidden);
      modalElement.remove();
      modalInstance.dispose?.();
      reject(error);
    }
  });
}
