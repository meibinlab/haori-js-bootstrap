const OWNED_ATTRIBUTE = 'data-haori-bootstrap-owned';
const CONTAINER_ATTRIBUTE = 'data-haori-bootstrap-message-container';
const INVALID_TARGET_ATTRIBUTE = 'data-haori-bootstrap-invalid-target';

function isFieldTarget(
  target: HTMLElement,
): target is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  );
}

function createMessageItem(documentObject: Document, message: string): HTMLDivElement {
  const messageElement = documentObject.createElement('div');
  messageElement.setAttribute(OWNED_ATTRIBUTE, 'true');
  messageElement.textContent = message;
  return messageElement;
}

function getOwnedDirectChild(target: HTMLElement): HTMLElement | undefined {
  return Array.from(target.children).find(
    (element): element is HTMLElement =>
      element instanceof HTMLElement && element.getAttribute(CONTAINER_ATTRIBUTE) === 'true',
  );
}

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
  const container = isFieldTarget(target) ? ensureFieldContainer(target) : ensureBlockContainer(target);
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
  if (isFieldTarget(parentOrTarget)) {
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
