const OWNED_ATTRIBUTE = 'data-haori-bootstrap-owned';
const CONTAINER_ATTRIBUTE = 'data-haori-bootstrap-message-container';
const INVALID_TARGET_ATTRIBUTE = 'data-haori-bootstrap-invalid-target';

/**
 * 対象要素が checkbox または radio かどうかを判定する。
 *
 * @param target 判定対象の要素。
 * @return checkbox または radio の input 要素なら true。
 */
function isChoiceInput(target: HTMLElement): target is HTMLInputElement {
  return (
    target instanceof HTMLInputElement &&
    (target.type === 'checkbox' || target.type === 'radio')
  );
}

/**
 * 対象要素が通常の invalid-feedback を直後に付与するフィールドかどうかを判定する。
 *
 * @param target 判定対象の要素。
 * @return 入力系フィールドなら true。
 */
function isFieldTarget(
  target: HTMLElement,
): target is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  );
}

/**
 * 子要素から管理対象のメッセージコンテナを取得する。
 *
 * @param target 検索対象の要素。
 * @return 管理対象コンテナ。見つからない場合は undefined。
 */
function getDirectOwnedContainer(target: HTMLElement): HTMLElement | undefined {
  return Array.from(target.children).find(
    (element): element is HTMLElement =>
      element instanceof HTMLElement && element.getAttribute(CONTAINER_ATTRIBUTE) === 'true',
  );
}

/**
 * 管理対象のメッセージ要素を生成する。
 *
 * @param documentObject 生成に使用する document。
 * @param message 表示するメッセージ。
 * @return 生成したメッセージ要素。
 */
function createMessageItem(documentObject: Document, message: string): HTMLDivElement {
  const messageElement = documentObject.createElement('div');
  messageElement.setAttribute(OWNED_ATTRIBUTE, 'true');
  messageElement.textContent = message;
  return messageElement;
}

/**
 * block container 配下の既存メッセージコンテナを取得する。
 *
 * @param target 検索対象の要素。
 * @return 既存コンテナ。見つからない場合は undefined。
 */
function getOwnedDirectChild(target: HTMLElement): HTMLElement | undefined {
  return getDirectOwnedContainer(target);
}

/**
 * checkbox と radio のメッセージ挿入先を解決する。
 *
 * @param target 対象の input 要素。
 * @return 挿入先の form-check 要素。見つからない場合は undefined。
 */
function resolveChoiceMessageHost(target: HTMLInputElement): HTMLElement | undefined {
  const closestFormCheck = target.closest('.form-check');
  return closestFormCheck instanceof HTMLElement ? closestFormCheck : undefined;
}

/**
 * 通常フィールドの直後に invalid-feedback コンテナを取得または生成する。
 *
 * @param target 対象の要素。
 * @return 取得または生成したコンテナ。
 */
function ensureFieldContainer(target: HTMLElement): HTMLElement {
  const nextElement = target.nextElementSibling;
  if (
    nextElement instanceof HTMLElement &&
    nextElement.getAttribute(CONTAINER_ATTRIBUTE) === 'true'
  ) {
    return nextElement;
  }

  const container = document.createElement('div');
  container.className = 'invalid-feedback d-block';
  container.setAttribute(OWNED_ATTRIBUTE, 'true');
  container.setAttribute(CONTAINER_ATTRIBUTE, 'true');
  target.insertAdjacentElement('afterend', container);
  return container;
}

/**
 * checkbox と radio 用に form-check 末尾の invalid-feedback を取得または生成する。
 *
 * @param target 対象の input 要素。
 * @return 取得または生成したコンテナ。
 */
function ensureChoiceContainer(target: HTMLInputElement): HTMLElement {
  const hostElement = resolveChoiceMessageHost(target);
  if (!hostElement) {
    return ensureFieldContainer(target);
  }

  const existingContainer = getDirectOwnedContainer(hostElement);
  if (existingContainer) {
    return existingContainer;
  }

  const container = document.createElement('div');
  container.className = 'invalid-feedback d-block';
  container.setAttribute(OWNED_ATTRIBUTE, 'true');
  container.setAttribute(CONTAINER_ATTRIBUTE, 'true');
  hostElement.appendChild(container);
  return container;
}

/**
 * container target の先頭に alert コンテナを取得または生成する。
 *
 * @param target 対象の要素。
 * @return 取得または生成したコンテナ。
 */
function ensureBlockContainer(target: HTMLElement): HTMLElement {
  const existingContainer = getOwnedDirectChild(target);
  if (existingContainer) {
    return existingContainer;
  }

  const container = document.createElement('div');
  container.className = 'alert alert-danger';
  container.setAttribute('role', 'alert');
  container.setAttribute(OWNED_ATTRIBUTE, 'true');
  container.setAttribute(CONTAINER_ATTRIBUTE, 'true');
  target.insertAdjacentElement('afterbegin', container);
  return container;
}

/**
 * このライブラリが付けた is-invalid 状態だけを外す。
 *
 * @param target 状態を解除する要素。
 * @return 戻り値はない。
 */
function removeOwnedInvalidState(target: HTMLElement): void {
  if (target.getAttribute(INVALID_TARGET_ATTRIBUTE) !== 'true') {
    return;
  }

  target.classList.remove('is-invalid');
  target.removeAttribute(INVALID_TARGET_ATTRIBUTE);
}

/**
 * 管理対象のエラーメッセージを追加する。
 *
 * @param target 追加先の要素。
 * @param message 表示するメッセージ。
 * @return 完了時に解決される Promise。
 */
export function addManagedErrorMessage(target: HTMLElement, message: string): Promise<void> {
  const container = isChoiceInput(target)
    ? ensureChoiceContainer(target)
    : isFieldTarget(target)
      ? ensureFieldContainer(target)
      : ensureBlockContainer(target);
  container.appendChild(createMessageItem(document, message));

  if (isFieldTarget(target)) {
    target.classList.add('is-invalid');
    target.setAttribute(INVALID_TARGET_ATTRIBUTE, 'true');
  }

  return Promise.resolve();
}

/**
 * 管理対象のメッセージを削除する。
 *
 * @param parentOrTarget 削除対象の親要素または対象要素。
 * @return 完了時に解決される Promise。
 */
export function clearManagedMessages(parentOrTarget: HTMLElement): Promise<void> {
  if (isChoiceInput(parentOrTarget)) {
    const hostElement = resolveChoiceMessageHost(parentOrTarget);
    const ownedContainer = hostElement ? getDirectOwnedContainer(hostElement) : undefined;
    ownedContainer?.remove();
    removeOwnedInvalidState(parentOrTarget);
  } else if (isFieldTarget(parentOrTarget)) {
    const nextElement = parentOrTarget.nextElementSibling;
    if (
      nextElement instanceof HTMLElement &&
      nextElement.getAttribute(CONTAINER_ATTRIBUTE) === 'true'
    ) {
      nextElement.remove();
    }
    removeOwnedInvalidState(parentOrTarget);
  }

  const ownedContainers = parentOrTarget.querySelectorAll<HTMLElement>(
    `[${CONTAINER_ATTRIBUTE}="true"]`,
  );
  ownedContainers.forEach((element) => {
    element.remove();
  });

  const invalidTargets = parentOrTarget.querySelectorAll<HTMLElement>(
    `[${INVALID_TARGET_ATTRIBUTE}="true"]`,
  );
  invalidTargets.forEach((element) => {
    removeOwnedInvalidState(element);
  });

  return Promise.resolve();
}
