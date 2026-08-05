import { createModalInstance } from './bootstrap_resolver';
import type { BootstrapModalInstance, ResolvedInstallOptions } from './types';

const DIALOG_ATTRIBUTE = 'data-haori-dialog';
const CONFIRM_ATTRIBUTE = 'data-haori-confirm';
const DIALOG_TITLE_ATTRIBUTE = 'data-haori-dialog-title';
const DIALOG_OK_ATTRIBUTE = 'data-haori-dialog-ok';
const CONFIRM_OK_ATTRIBUTE = 'data-haori-confirm-ok';
const CONFIRM_CANCEL_ATTRIBUTE = 'data-haori-confirm-cancel';

/** OK ボタンの既定の文言。`dialogOkLabel` で差し替えられる。 */
const DEFAULT_OK_LABEL = 'OK';

/** キャンセルボタンの既定の文言。`dialogCancelLabel` で差し替えられる。 */
const DEFAULT_CANCEL_LABEL = 'Cancel';

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
function resolveDialogContainer(
  documentObject: Document,
  options: ResolvedInstallOptions,
): HTMLElement {
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
 * <p>ボタンの文言は導入設定（`dialogOkLabel` / `dialogCancelLabel`）で
 * 差し替えられる。未指定時は英語の既定値を使う。識別属性
 * （`data-haori-confirm-ok` など）は文言に関わらず変わらない。
 *
 * @param documentObject 生成に使用する document。
 * @param message 表示するメッセージ。
 * @param isConfirm confirm 用かどうか。
 * @param options 解決済み導入設定。
 * @return 生成した modal 要素。
 */
function createModalShell(
  documentObject: Document,
  message: string,
  isConfirm: boolean,
  options: ResolvedInstallOptions,
): HTMLDivElement {
  const title = options.dialogTitle;
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
    cancelButton.textContent = options.dialogCancelLabel ?? DEFAULT_CANCEL_LABEL;
    footerElement.appendChild(cancelButton);
  }

  const okButton = documentObject.createElement('button');
  okButton.type = 'button';
  okButton.className = 'btn btn-primary';
  okButton.setAttribute(isConfirm ? CONFIRM_OK_ATTRIBUTE : DIALOG_OK_ATTRIBUTE, 'true');
  okButton.textContent = options.dialogOkLabel ?? DEFAULT_OK_LABEL;
  footerElement.appendChild(okButton);

  contentElement.append(bodyElement, footerElement);
  dialogElement.appendChild(contentElement);
  modalElement.appendChild(dialogElement);
  return modalElement;
}

/**
 * フェードイン中の押下でも Modal を閉じられるようにする「閉じる要求」を生成する。
 *
 * <p>Bootstrap の Modal は表示アニメーション中の `hide()` を無視する。この間に
 * 押された操作をそのまま `hide()` へ渡すと何も起きず、ダイアログは開いたまま残り、
 * 呼び出し元の手続き（送信・トースト表示など）も進まない。表示完了
 * （`shown.bs.modal`）を待ち、要求が保留されていればその時点で閉じる。
 *
 * <p>受け付けるのは最初の要求だけである。フェードイン中に OK とキャンセルが
 * 続けて押された場合も、先に押された結果で確定する。
 *
 * @param modalInstance 対象の Modal インスタンス。
 * @return 閉じる要求の受付関数と、表示完了の通知関数。
 */
function createCloseRequester(modalInstance: BootstrapModalInstance): {
  requestClose: (onAccepted?: () => void) => void;
  handleShown: () => void;
} {
  let closeRequested = false;
  let shownFinished = false;

  return {
    requestClose: (onAccepted?: () => void): void => {
      if (closeRequested) {
        return;
      }
      closeRequested = true;
      onAccepted?.();
      if (shownFinished) {
        modalInstance.hide();
      }
    },
    handleShown: (): void => {
      shownFinished = true;
      if (closeRequested) {
        modalInstance.hide();
      }
    },
  };
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
  const modalElement = createModalShell(documentObject, message, false, options);
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
      modalElement.removeEventListener('shown.bs.modal', handleShown);
      modalElement.removeEventListener('hidden.bs.modal', handleHidden);
      modalElement.remove();
      modalInstance.dispose?.();
      resolve();
    };

    const handleHidden = (): void => {
      finalize();
    };

    // Bootstrap は表示アニメーション中の hide() を無視するため、フェードイン中の
    // 押下は「閉じる要求」として保持し、表示完了後に閉じる（closeRequester 参照）。
    const closeRequester = createCloseRequester(modalInstance);

    const handleShown = closeRequester.handleShown;

    const okButton = modalElement.querySelector<HTMLButtonElement>(`[${DIALOG_OK_ATTRIBUTE}]`);
    okButton?.addEventListener('click', () => {
      closeRequester.requestClose();
    });

    modalElement.addEventListener('shown.bs.modal', handleShown);
    modalElement.addEventListener('hidden.bs.modal', handleHidden, { once: true });

    try {
      modalInstance.show();
    } catch (error) {
      modalElement.removeEventListener('shown.bs.modal', handleShown);
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
export function showConfirm(message: string, options: ResolvedInstallOptions): Promise<boolean> {
  const documentObject = globalThis.document;
  const modalElement = createModalShell(documentObject, message, true, options);
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
      modalElement.removeEventListener('shown.bs.modal', handleShown);
      modalElement.removeEventListener('hidden.bs.modal', handleHidden);
      modalElement.remove();
      modalInstance.dispose?.();
      resolve(confirmed);
    };

    const handleHidden = (): void => {
      finalize();
    };

    // Bootstrap は表示アニメーション中の hide() を無視するため、フェードイン中の
    // 押下は「閉じる要求」として保持し、表示完了後に閉じる（closeRequester 参照）。
    const closeRequester = createCloseRequester(modalInstance);

    const handleShown = closeRequester.handleShown;

    const okButton = modalElement.querySelector<HTMLButtonElement>(`[${CONFIRM_OK_ATTRIBUTE}]`);
    const cancelButton = modalElement.querySelector<HTMLButtonElement>(
      `[${CONFIRM_CANCEL_ATTRIBUTE}]`,
    );

    okButton?.addEventListener('click', () => {
      closeRequester.requestClose(() => {
        confirmed = true;
      });
    });
    cancelButton?.addEventListener('click', () => {
      closeRequester.requestClose(() => {
        confirmed = false;
      });
    });

    modalElement.addEventListener('shown.bs.modal', handleShown);
    modalElement.addEventListener('hidden.bs.modal', handleHidden, { once: true });

    try {
      modalInstance.show();
    } catch (error) {
      modalElement.removeEventListener('shown.bs.modal', handleShown);
      modalElement.removeEventListener('hidden.bs.modal', handleHidden);
      modalElement.remove();
      modalInstance.dispose?.();
      reject(error);
    }
  });
}
