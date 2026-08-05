import { createModalInstance } from './bootstrap_resolver';
import { clearManagedMessages } from './message';
import type { ResolvedInstallOptions } from './types';

/**
 * 表示アニメーション中の Modal 要素。Bootstrap が `hide()` を無視する期間を表す。
 *
 * <p>`show.bs.modal` から `shown.bs.modal` までの間だけ在籍する。Bootstrap の
 * Modal イベントはバブリングするため document 委譲で追跡し、このライブラリが
 * 開いた Modal だけでなく、`data-bs-toggle` などでアプリが直接開いた Modal も
 * 対象になる。
 */
const TRANSITIONING_MODALS = new WeakSet<HTMLElement>();

/** 追跡を開始済みかどうか（多重登録の防止）。 */
let transitionTrackingStarted = false;

/** 追跡対象の document。teardown で同じ document から解除するために保持する。 */
let trackedDocument: Document | undefined;

/** `show.bs.modal` ハンドラ。表示アニメーションの開始を記録する。 */
const onModalShow = (event: Event): void => {
  if (event.target instanceof HTMLElement) {
    TRANSITIONING_MODALS.add(event.target);
  }
};

/** `shown.bs.modal` ハンドラ。表示アニメーションの完了を記録する。 */
const onModalShown = (event: Event): void => {
  if (event.target instanceof HTMLElement) {
    TRANSITIONING_MODALS.delete(event.target);
  }
};

/**
 * Modal の表示アニメーションの追跡を開始する。多重呼び出しは無視する。
 *
 * @param doc 対象 document。既定は現在の document。
 * @return 戻り値はない。
 */
export function setupModalTransitionTracking(doc: Document = document): void {
  if (transitionTrackingStarted) {
    return;
  }
  transitionTrackingStarted = true;
  trackedDocument = doc;
  doc.addEventListener('show.bs.modal', onModalShow);
  doc.addEventListener('shown.bs.modal', onModalShown);
}

/**
 * Modal の表示アニメーションの追跡を停止する。
 *
 * @param doc 対象 document。既定は setup 時の document。
 * @return 戻り値はない。
 */
export function teardownModalTransitionTracking(doc: Document = trackedDocument ?? document): void {
  if (!transitionTrackingStarted) {
    return;
  }
  transitionTrackingStarted = false;
  doc.removeEventListener('show.bs.modal', onModalShow);
  doc.removeEventListener('shown.bs.modal', onModalShown);
  trackedDocument = undefined;
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
        modalInstance.hide();
      },
      { once: true },
    );
    return Promise.resolve();
  }

  modalInstance.hide();
  return Promise.resolve();
}
