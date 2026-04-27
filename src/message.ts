const OWNED_ATTRIBUTE = 'data-haori-bootstrap-owned';
const CONTAINER_ATTRIBUTE = 'data-haori-bootstrap-message-container';
const INVALID_TARGET_ATTRIBUTE = 'data-haori-bootstrap-invalid-target';
const VALID_TARGET_ATTRIBUTE = 'data-haori-bootstrap-valid-target';

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
 * 対象要素が radio input かどうかを判定する。
 *
 * @param target 判定対象の要素。
 * @return radio の input 要素なら true。
 */
function isRadioInput(target: HTMLElement): target is HTMLInputElement {
  return target instanceof HTMLInputElement && target.type === 'radio';
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
 * 指定した radio と同じグループに属する radio 要素一覧を取得する。
 *
 * @param target 基準となる radio 要素。
 * @return 同じグループに属する radio 要素一覧。
 */
function getRadioGroupTargets(target: HTMLInputElement): HTMLInputElement[] {
  if (target.name) {
    const rootNode = target.form ?? target.ownerDocument;
    const escapedName = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
      ? CSS.escape(target.name)
      : target.name.replace(/(["\\])/g, '\\$1');
    const groupTargets = Array.from(
      rootNode.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${escapedName}"]`),
    );
    if (groupTargets.length > 0) {
      return groupTargets;
    }
  }

  return [target];
}

/**
 * 複数要素の最も近い共通祖先要素を返す。
 *
 * @param elements 判定対象の要素一覧。
 * @return 共通祖先要素。見つからない場合は undefined。
 */
function findCommonAncestor(elements: readonly HTMLElement[]): HTMLElement | undefined {
  const [firstElement, ...restElements] = elements;
  if (!firstElement) {
    return undefined;
  }

  let candidate: HTMLElement | null = firstElement;
  while (candidate) {
    if (restElements.every((element) => candidate?.contains(element))) {
      return candidate;
    }
    candidate = candidate.parentElement;
  }

  return undefined;
}

/**
 * radio group のメッセージ挿入先を解決する。
 *
 * @param target 対象の radio 要素。
 * @return 挿入先の要素。見つからない場合は undefined。
 */
function resolveRadioMessageHost(target: HTMLInputElement): HTMLElement | undefined {
  const groupTargets = getRadioGroupTargets(target);
  const wrappers = groupTargets
    .map((element) => element.closest('.form-check'))
    .filter((element): element is HTMLElement => element instanceof HTMLElement);

  if (wrappers.length > 1) {
    const commonAncestor = findCommonAncestor(wrappers);
    if (commonAncestor && !wrappers.includes(commonAncestor)) {
      return commonAncestor;
    }
  }

  return resolveChoiceMessageHost(target);
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
  const hostElement = isRadioInput(target)
    ? resolveRadioMessageHost(target)
    : resolveChoiceMessageHost(target);
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
 * このライブラリが付けた is-valid 状態だけを外す。
 *
 * @param target 状態を解除する要素。
 * @return 戻り値はない。
 */
function removeOwnedValidState(target: HTMLElement): void {
  if (target.getAttribute(VALID_TARGET_ATTRIBUTE) !== 'true') {
    return;
  }

  target.classList.remove('is-valid');
  target.removeAttribute(VALID_TARGET_ATTRIBUTE);
}

/**
 * レベルに応じた alert クラスを返す。
 *
 * @param level メッセージレベル。
 * @return 対応する alert クラス文字列。
 */
function resolveBlockAlertClass(level?: string): string {
  switch (level) {
    case 'success':
      return 'alert alert-success';
    case 'warning':
      return 'alert alert-warning';
    case 'info':
      return 'alert alert-info';
    default:
      return 'alert alert-danger';
  }
}

/**
 * レベルに応じた feedback クラスを返す。
 *
 * @param level メッセージレベル。
 * @return 対応する feedback クラス文字列。
 */
function resolveFieldFeedbackClass(level?: string): string {
  return level === 'success' ? 'valid-feedback d-block' : 'invalid-feedback d-block';
}

/**
 * choice input に対して、このライブラリが付けた invalid 状態を付与する。
 *
 * @param target 対象の input 要素。
 * @return 戻り値はない。
 */
function markChoiceInvalidState(target: HTMLInputElement): void {
  const targets = isRadioInput(target) ? getRadioGroupTargets(target) : [target];
  targets.forEach((element) => {
    element.classList.add('is-invalid');
    element.setAttribute(INVALID_TARGET_ATTRIBUTE, 'true');
  });
}

/**
 * choice input に対して、このライブラリが付けた invalid 状態を解除する。
 *
 * @param target 対象の input 要素。
 * @return 戻り値はない。
 */
function clearChoiceInvalidState(target: HTMLInputElement): void {
  const targets = isRadioInput(target) ? getRadioGroupTargets(target) : [target];
  targets.forEach((element) => {
    removeOwnedInvalidState(element);
  });
}

/**
 * レベルに応じたフィールド用コンテナを取得または生成する。
 *
 * @param target 対象要素。
 * @param level メッセージレベル。
 * @return 取得または生成したコンテナ。
 */
function ensureFieldContainerForLevel(target: HTMLElement, level?: string): HTMLElement {
  const nextElement = target.nextElementSibling;
  if (
    nextElement instanceof HTMLElement &&
    nextElement.getAttribute(CONTAINER_ATTRIBUTE) === 'true'
  ) {
    nextElement.className = resolveFieldFeedbackClass(level);
    return nextElement;
  }

  const container = document.createElement('div');
  container.className = resolveFieldFeedbackClass(level);
  container.setAttribute(OWNED_ATTRIBUTE, 'true');
  container.setAttribute(CONTAINER_ATTRIBUTE, 'true');
  target.insertAdjacentElement('afterend', container);
  return container;
}

/**
 * レベルに応じた choice 用コンテナを取得または生成する。
 *
 * @param target 対象の input 要素。
 * @param level メッセージレベル。
 * @return 取得または生成したコンテナ。
 */
function ensureChoiceContainerForLevel(target: HTMLInputElement, level?: string): HTMLElement {
  const hostElement = isRadioInput(target)
    ? resolveRadioMessageHost(target)
    : resolveChoiceMessageHost(target);
  if (!hostElement) {
    return ensureFieldContainerForLevel(target, level);
  }

  const existingContainer = getDirectOwnedContainer(hostElement);
  if (existingContainer) {
    existingContainer.className = resolveFieldFeedbackClass(level);
    return existingContainer;
  }

  const container = document.createElement('div');
  container.className = resolveFieldFeedbackClass(level);
  container.setAttribute(OWNED_ATTRIBUTE, 'true');
  container.setAttribute(CONTAINER_ATTRIBUTE, 'true');
  hostElement.appendChild(container);
  return container;
}

/**
 * レベルに応じたブロック用コンテナを取得または生成する。
 *
 * @param target 対象要素。
 * @param level メッセージレベル。
 * @return 取得または生成したコンテナ。
 */
function ensureBlockContainerForLevel(target: HTMLElement, level?: string): HTMLElement {
  const existingContainer = getOwnedDirectChild(target);
  if (existingContainer) {
    existingContainer.className = resolveBlockAlertClass(level);
    return existingContainer;
  }

  const container = document.createElement('div');
  container.className = resolveBlockAlertClass(level);
  container.setAttribute('role', 'alert');
  container.setAttribute(OWNED_ATTRIBUTE, 'true');
  container.setAttribute(CONTAINER_ATTRIBUTE, 'true');
  target.insertAdjacentElement('afterbegin', container);
  return container;
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

  if (isChoiceInput(target)) {
    markChoiceInvalidState(target);
  } else if (isFieldTarget(target)) {
    target.classList.add('is-invalid');
    target.setAttribute(INVALID_TARGET_ATTRIBUTE, 'true');
  }

  return Promise.resolve();
}

/**
 * 管理対象のメッセージをレベル付きで追加する。
 *
 * @param target 追加先の要素。
 * @param message 表示するメッセージ。
 * @param level メッセージレベル (error / success / warning / info)。省略時は error。
 * @return 完了時に解決される Promise。
 */
export function addManagedMessage(
  target: HTMLElement,
  message: string,
  level?: string,
): Promise<void> {
  const container = isChoiceInput(target)
    ? ensureChoiceContainerForLevel(target, level)
    : isFieldTarget(target)
      ? ensureFieldContainerForLevel(target, level)
      : ensureBlockContainerForLevel(target, level);
  container.appendChild(createMessageItem(document, message));

  if (isChoiceInput(target)) {
    const targets = isRadioInput(target) ? getRadioGroupTargets(target) : [target];
    if (level === 'success') {
      targets.forEach((element) => {
        removeOwnedInvalidState(element);
        element.classList.add('is-valid');
        element.setAttribute(VALID_TARGET_ATTRIBUTE, 'true');
      });
    } else if (!level || level === 'error') {
      targets.forEach((element) => removeOwnedValidState(element));
      markChoiceInvalidState(target);
    }
  } else if (isFieldTarget(target)) {
    if (level === 'success') {
      removeOwnedInvalidState(target);
      target.classList.add('is-valid');
      target.setAttribute(VALID_TARGET_ATTRIBUTE, 'true');
    } else if (!level || level === 'error') {
      removeOwnedValidState(target);
      target.classList.add('is-invalid');
      target.setAttribute(INVALID_TARGET_ATTRIBUTE, 'true');
    }
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
    const hostElement = isRadioInput(parentOrTarget)
      ? resolveRadioMessageHost(parentOrTarget)
      : resolveChoiceMessageHost(parentOrTarget);
    const ownedContainer = hostElement ? getDirectOwnedContainer(hostElement) : undefined;
    ownedContainer?.remove();
    clearChoiceInvalidState(parentOrTarget);
    const choiceTargets = isRadioInput(parentOrTarget)
      ? getRadioGroupTargets(parentOrTarget)
      : [parentOrTarget];
    choiceTargets.forEach((element) => removeOwnedValidState(element));
  } else if (isFieldTarget(parentOrTarget)) {
    const nextElement = parentOrTarget.nextElementSibling;
    if (
      nextElement instanceof HTMLElement &&
      nextElement.getAttribute(CONTAINER_ATTRIBUTE) === 'true'
    ) {
      nextElement.remove();
    }
    removeOwnedInvalidState(parentOrTarget);
    removeOwnedValidState(parentOrTarget);
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

  const validTargets = parentOrTarget.querySelectorAll<HTMLElement>(
    `[${VALID_TARGET_ATTRIBUTE}="true"]`,
  );
  validTargets.forEach((element) => {
    removeOwnedValidState(element);
  });

  return Promise.resolve();
}
