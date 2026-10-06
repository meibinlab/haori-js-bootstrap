import { createModalInstance } from './bootstrap_resolver';
import { clearManagedMessages } from './message';
import type { BootstrapModalInstance, ResolvedInstallOptions } from './types';

/**
 * 表示アニメーション中の Modal 要素。Bootstrap が `hide()` を無視する期間を表す。
 *
 * <p>`show.bs.modal` から `shown.bs.modal` までの間だけ在籍する。Bootstrap の
 * Modal イベントはバブリングするため document 委譲で追跡し、このライブラリが
 * 開いた Modal だけでなく、`data-bs-toggle` などでアプリが直接開いた Modal も
 * 対象になる。
 */
const TRANSITIONING_MODALS = new WeakSet<HTMLElement>();

/**
 * 宣言があれば、haori 以外の閉じる操作を止める `.modal` の属性。
 *
 * <p>Esc キー・背景のクリック・`data-bs-dismiss`・画面のスクリプトが直接呼ぶ
 * `Modal.hide()` は、いずれも `hide.bs.modal` を経るため、そこで取り消す。値は
 * 問わず、属性の有無だけで判定する。式で書いた場合、偽になるとコアが属性を消す。
 */
const DISMISS_LOCK_ATTRIBUTE = 'data-haori-dismiss-lock';

/**
 * haori の閉じる操作（`closeDialogElement`）で `hide()` を呼んでいる最中の Modal 要素。
 *
 * <p>Bootstrap は `hide()` の中で `hide.bs.modal` を同期で発火するため、呼び出しの
 * 前後だけ在籍させれば、`data-{event}-close` などの閉じる操作を宣言の対象から外せる。
 */
const HAORI_CLOSING_MODALS = new WeakSet<HTMLElement>();

/**
 * 最後にフォーカスを受けた要素。
 *
 * <p>Haori が押したボタンは手続きの間 `disabled` になってフォーカスを失うため、
 * `show.bs.modal` の時点の `document.activeElement` では子を開いた要素を取れない。
 * 文書の `focusin` で覚えておく。
 */
let lastFocusedElement: HTMLElement | null = null;

/**
 * モーダルごとの、そのモーダルを開いた要素。入れ子で開いた子が閉じた後の
 * フォーカスの戻し先になる。親の中に無い要素は、戻すときに除く。uninstall で
 * 作り直し、それより前に覚えた要素を使わない。
 */
let modalOpeners = new WeakMap<HTMLElement, HTMLElement>();

/**
 * 入れ子で開いた子が閉じた後に、このライブラリがフォーカスを閉じ込めるモーダル。
 *
 * <p>Bootstrap の子の FocusTrap は、子を閉じても親の監視を付け直さないため、
 * 残ったモーダルの中に Tab キーのフォーカスが留まらない。別のモーダルを開いたとき
 * （Bootstrap が閉じ込める）と、すべてのモーダルが閉じたときに外す。
 */
let trappedModal: HTMLElement | null = null;

/** 直前の Tab キーが Shift 付きだったか。閉じ込めで戻す先（最初か最後か）を決める。 */
let lastTabBackward = false;

/** Bootstrap の FocusTrap と同じ、Tab キーで移れる要素のセレクタ。 */
const FOCUSABLE_SELECTOR = [
  'a',
  'button',
  'input',
  'textarea',
  'select',
  'details',
  '[tabindex]',
  '[contenteditable="true"]',
]
  .map((selector) => `${selector}:not([tabindex^="-"])`)
  .join(',');

/** 監視を開始済みかどうか（多重登録の防止）。 */
let modalEventHandlingStarted = false;

/** 監視対象の document。teardown で同じ document から解除するために保持する。 */
let handledDocument: Document | undefined;

/**
 * 対象を除いて、開いている Modal 要素を文書の順で返す。
 *
 * @param modalElement 除く Modal 要素。
 * @return 開いている Modal 要素の一覧。
 */
function getOtherOpenModals(modalElement: HTMLElement): HTMLElement[] {
  return Array.from(modalElement.ownerDocument.querySelectorAll<HTMLElement>('.modal.show')).filter(
    (element) => element !== modalElement,
  );
}

/**
 * モーダルの中で Tab キーで移れる要素を、文書の順で返す。
 *
 * <p>Bootstrap の `SelectorEngine.focusableChildren()` と同じく、無効な要素と
 * 表示されていない要素を除く。表示の判定は `checkVisibility()` が使えるときだけ行う。
 *
 * @param modalElement 対象の Modal 要素。
 * @return 移れる要素の一覧。
 */
function getFocusableChildren(modalElement: HTMLElement): HTMLElement[] {
  return Array.from(modalElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      !element.classList.contains('disabled') &&
      (typeof element.checkVisibility !== 'function' ||
        element.checkVisibility({ visibilityProperty: true })),
  );
}

/**
 * `focusin` ハンドラ。最後にフォーカスを受けた要素を覚え、閉じ込め先のモーダルの
 * 外へ出たフォーカスを中へ戻す。
 */
const onFocusIn = (event: Event): void => {
  const target = event.target;
  if (target instanceof HTMLElement) {
    lastFocusedElement = target;
  }
  if (!trappedModal || !(target instanceof Element) || trappedModal.contains(target)) {
    return;
  }
  const elements = getFocusableChildren(trappedModal);
  if (elements.length === 0) {
    trappedModal.focus();
  } else if (lastTabBackward) {
    elements[elements.length - 1].focus();
  } else {
    elements[0].focus();
  }
};

/** `keydown` ハンドラ。Tab キーの向きを覚える。 */
const onKeyDown = (event: Event): void => {
  if (event instanceof KeyboardEvent && event.key === 'Tab') {
    lastTabBackward = event.shiftKey;
  }
};

/**
 * `show.bs.modal` ハンドラ。表示アニメーションの開始を記録し、モーダルを開いた
 * 要素を覚える。
 */
const onModalShow = (event: Event): void => {
  if (!(event.target instanceof HTMLElement)) {
    return;
  }
  const modalElement = event.target;
  TRANSITIONING_MODALS.add(modalElement);
  // 開いたモーダルは Bootstrap が閉じ込める。
  trappedModal = null;
  if (lastFocusedElement) {
    modalOpeners.set(modalElement, lastFocusedElement);
  }
};

/**
 * `shown.bs.modal` ハンドラ。表示アニメーションの完了を記録し、入れ子で開いた
 * 子からフォーカスが外れていれば子へ移す。
 *
 * <p>Bootstrap の子の FocusTrap は、子へフォーカスを移した後で親の監視を外すため、
 * 親を開いてから最初に開いた子では、フォーカスが親の中へ引き戻される。
 */
const onModalShown = (event: Event): void => {
  if (!(event.target instanceof HTMLElement)) {
    return;
  }
  const modalElement = event.target;
  TRANSITIONING_MODALS.delete(modalElement);
  if (
    modalElement.getAttribute('data-bs-focus') !== 'false' &&
    getOtherOpenModals(modalElement).length > 0 &&
    !modalElement.contains(modalElement.ownerDocument.activeElement)
  ) {
    modalElement.focus();
  }
};

/**
 * `hidden.bs.modal` ハンドラ。入れ子で開いた子が閉じたとき、`body` へ `modal-open` を
 * 付け直し、文書の中で最後にある（いちばん手前に表示される）モーダルへフォーカスを
 * 閉じ込める。残ったモーダルのどれにもフォーカスが無ければ、子を開いた要素へ戻す。
 * 戻せなければ、いちばん手前のモーダルへ戻す。
 */
const onModalHidden = (event: Event): void => {
  if (!(event.target instanceof HTMLElement)) {
    return;
  }
  const modalElement = event.target;
  const opener = modalOpeners.get(modalElement);
  const openModals = getOtherOpenModals(modalElement);
  if (openModals.length === 0) {
    trappedModal = null;
    return;
  }
  // Bootstrap の _hideModal() は、他のモーダルが開いていても外す。
  modalElement.ownerDocument.body.classList.add('modal-open');
  const frontModal = openModals[openModals.length - 1];
  trappedModal = frontModal.getAttribute('data-bs-focus') === 'false' ? null : frontModal;
  const activeElement = modalElement.ownerDocument.activeElement;
  if (openModals.some((element) => element.contains(activeElement))) {
    return;
  }
  if (opener && openModals.some((element) => element.contains(opener))) {
    opener.focus();
    // 文書から外れた・無効になったなどの要素は、focus() を呼んでもフォーカスを受けない。
    if (modalElement.ownerDocument.activeElement === opener) {
      return;
    }
  }
  frontModal.focus();
};

/**
 * `hide.bs.modal` ハンドラ。`data-haori-dismiss-lock` を宣言した Modal で、haori
 * 以外の閉じる操作を取り消す。
 */
const onModalHide = (event: Event): void => {
  const target = event.target;
  if (
    target instanceof HTMLElement &&
    target.hasAttribute(DISMISS_LOCK_ATTRIBUTE) &&
    !HAORI_CLOSING_MODALS.has(target)
  ) {
    event.preventDefault();
  }
};

/**
 * haori の閉じる操作として Modal を閉じる。
 *
 * <p>`data-haori-dismiss-lock` を宣言した Modal でも閉じられるよう、`hide()` を
 * 呼ぶ間だけ印を付ける。
 *
 * @param modalElement 対象の `.modal` 要素。
 * @param modalInstance 対象の Modal インスタンス。
 * @return 戻り値はない。
 */
function hideAsHaori(modalElement: HTMLElement, modalInstance: BootstrapModalInstance): void {
  HAORI_CLOSING_MODALS.add(modalElement);
  try {
    modalInstance.hide();
  } finally {
    HAORI_CLOSING_MODALS.delete(modalElement);
  }
}

/**
 * Modal のイベントの監視を開始する。多重呼び出しは無視する。
 *
 * <p>表示アニメーション中の把握（フェードイン中の close を取りこぼさない）と、
 * `data-haori-dismiss-lock` による閉じる操作の取り消しと、入れ子のモーダルの
 * フォーカスの受け渡し・閉じ込めと `modal-open` の付け直しを行う。
 *
 * @param doc 対象 document。既定は現在の document。
 * @return 戻り値はない。
 */
export function setupModalEventHandling(doc: Document = document): void {
  if (modalEventHandlingStarted) {
    return;
  }
  modalEventHandlingStarted = true;
  handledDocument = doc;
  doc.addEventListener('focusin', onFocusIn);
  doc.addEventListener('keydown', onKeyDown);
  doc.addEventListener('show.bs.modal', onModalShow);
  doc.addEventListener('shown.bs.modal', onModalShown);
  doc.addEventListener('hide.bs.modal', onModalHide);
  doc.addEventListener('hidden.bs.modal', onModalHidden);
}

/**
 * Modal のイベントの監視を停止する。
 *
 * @param doc 対象 document。既定は setup 時の document。
 * @return 戻り値はない。
 */
export function teardownModalEventHandling(doc: Document = handledDocument ?? document): void {
  if (!modalEventHandlingStarted) {
    return;
  }
  modalEventHandlingStarted = false;
  doc.removeEventListener('focusin', onFocusIn);
  doc.removeEventListener('keydown', onKeyDown);
  doc.removeEventListener('show.bs.modal', onModalShow);
  doc.removeEventListener('shown.bs.modal', onModalShown);
  doc.removeEventListener('hide.bs.modal', onModalHide);
  doc.removeEventListener('hidden.bs.modal', onModalHidden);
  handledDocument = undefined;
  lastFocusedElement = null;
  modalOpeners = new WeakMap();
  trappedModal = null;
  lastTabBackward = false;
}

/**
 * 操作対象の Bootstrap Modal 要素を解決する。
 *
 * <p>渡された要素が `.modal` の場合はその要素を、そうでない場合は祖先方向で
 * 最も近い `.modal` を返す。値を省略した `data-{event}-close` などで対象が
 * トリガー要素自身（例: モーダル内の閉じるボタン）に解決された場合でも、
 * 本来のモーダルへ正しく辿れるようにするための関数。任意要素を `.modal`
 * 化する破壊的処理は行わない。
 *
 * @param element 操作対象として渡された要素。
 * @return 解決された `.modal` 要素。見つからない場合は null。
 */
function resolveModalElement(element: HTMLElement): HTMLElement | null {
  if (element.classList.contains('modal')) {
    return element;
  }

  return element.closest('.modal');
}

/**
 * 解決済みの Bootstrap Modal 要素へ最低限の属性を補う。
 *
 * <p>対象は必ず `.modal` 要素であることを前提とし、`.modal` クラスの付与は
 * 行わない（非 modal 要素を破壊的に modal 化しない）。
 *
 * @param element 整形対象の `.modal` 要素。
 * @return 戻り値はない。
 */
function prepareModalElement(element: HTMLElement): void {
  if (element.tabIndex < 0) {
    element.tabIndex = -1;
  }

  if (!element.hasAttribute('aria-hidden')) {
    element.setAttribute('aria-hidden', 'true');
  }
}

/**
 * 対象の Bootstrap Modal を開く。
 *
 * <p>渡された要素が `.modal` でない場合は祖先方向で最も近い `.modal` を
 * 対象に解決する。解決できない場合は要素を modal 化せず reject する。
 *
 * <p>再表示時に前回の管理メッセージ（`is-invalid` / `is-valid` 状態や
 * `invalid-feedback` / `alert` コンテナ）が残らないよう、表示前に対象
 * `.modal` 配下の管理メッセージをクリアする。
 *
 * @param element 開く対象の要素（`.modal` 自身またはその子孫）。
 * @param options 解決済み導入設定。
 * @return 完了時に解決される Promise。
 */
export function openDialogElement(
  element: HTMLElement,
  options: ResolvedInstallOptions,
): Promise<void> {
  const modalElement = resolveModalElement(element);
  if (!modalElement) {
    return Promise.reject(new Error('No ancestor ".modal" element was found for the target.'));
  }

  prepareModalElement(modalElement);
  // 再表示時に前回のメッセージが残らないよう、開く前にクリアする。
  void clearManagedMessages(modalElement);
  const modalInstance = createModalInstance(modalElement, undefined, options.bootstrap);
  if (!modalInstance) {
    return Promise.reject(new Error('Bootstrap Modal is unavailable.'));
  }

  modalInstance.show();
  return Promise.resolve();
}

/**
 * 対象の Bootstrap Modal を閉じる。
 *
 * <p>渡された要素が `.modal` でない場合は祖先方向で最も近い `.modal` を
 * 対象に解決する。解決できない場合は要素を modal 化せず reject する。
 *
 * <p>Bootstrap は表示アニメーション中の `hide()` を無視するため、フェードイン中
 * （既定 0.15 秒）に呼ばれた場合は表示完了を待ってから閉じる。そのまま呼ぶと
 * 閉じる操作が失われ、Modal が開いたまま残る。
 *
 * <p>`data-haori-dismiss-lock` を宣言した Modal も閉じる（宣言が止めるのは haori
 * 以外の閉じる操作）。
 *
 * @param element 閉じる対象の要素（`.modal` 自身またはその子孫）。
 * @param options 解決済み導入設定。
 * @return 完了時に解決される Promise。
 */
export function closeDialogElement(
  element: HTMLElement,
  options: ResolvedInstallOptions,
): Promise<void> {
  const modalElement = resolveModalElement(element);
  if (!modalElement) {
    return Promise.reject(new Error('No ancestor ".modal" element was found for the target.'));
  }

  prepareModalElement(modalElement);
  const modalInstance = createModalInstance(modalElement, undefined, options.bootstrap);
  if (!modalInstance) {
    return Promise.reject(new Error('Bootstrap Modal is unavailable.'));
  }

  if (TRANSITIONING_MODALS.has(modalElement)) {
    // フェードイン中は hide() が無視されるため、完了の通知で閉じ直す。
    // 追跡できている（＝この表示に対して shown が必ず来る）ときだけ登録するので、
    // リスナーが残って後の表示を勝手に閉じることはない。
    modalElement.addEventListener(
      'shown.bs.modal',
      () => {
        hideAsHaori(modalElement, modalInstance);
      },
      { once: true },
    );
    return Promise.resolve();
  }

  hideAsHaori(modalElement, modalInstance);
  return Promise.resolve();
}
