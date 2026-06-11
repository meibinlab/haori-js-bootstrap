/**
 * @fileoverview Bootstrap collapse の開閉状態を sessionStorage へ永続化する。
 *
 * `data-haori-bootstrap-persist="キー名"` を collapse 要素（`.collapse`）に付与すると、
 * `shown.bs.collapse` / `hidden.bs.collapse` を監視して開閉状態を保存し、ページ再訪時や
 * `data-import` で後から挿入されたフラグメントにも保存済みの状態を復元する。
 *
 * Haori 本体の式サンドボックスはストレージ操作を禁止しているため、ストレージを使う
 * 永続化は Bootstrap 連携の責務として本パッケージ側に置く。
 */

/** sessionStorage キーの接頭辞。 */
const STORAGE_PREFIX = 'haori-bootstrap:collapse:';

/** 永続化対象を示す属性名。属性値が保存キーになる。 */
const PERSIST_ATTR = 'data-haori-bootstrap-persist';

/** 開閉状態。 */
type CollapseState = 'shown' | 'hidden';

/** 多重 setup を防ぐフラグ。 */
let started = false;

/** 挿入監視用の MutationObserver。 */
let observer: MutationObserver | undefined;

/** setup 時に監視対象とした document。 */
let observedDocument: Document | undefined;

/**
 * 保存キーから sessionStorage のキーを生成する。
 *
 * @param key 永続化キー。
 * @return sessionStorage のキー。
 */
function storageKey(key: string): string {
  return STORAGE_PREFIX + key;
}

/**
 * 保存済みの開閉状態を読み出す。
 *
 * @param key 永続化キー。
 * @return 保存済み状態。未保存・取得不可なら undefined。
 */
function readState(key: string): CollapseState | undefined {
  try {
    const value = window.sessionStorage.getItem(storageKey(key));
    return value === 'shown' || value === 'hidden' ? value : undefined;
  } catch {
    // プライベートモードやストレージ無効時は黙って諦める。
    return undefined;
  }
}

/**
 * 開閉状態を保存する。
 *
 * @param key 永続化キー。
 * @param state 保存する開閉状態。
 * @return 戻り値はない。
 */
function writeState(key: string, state: CollapseState): void {
  try {
    window.sessionStorage.setItem(storageKey(key), state);
  } catch {
    // 保存できない環境では永続化を諦める（機能は無効化するだけで例外は伝播させない）。
  }
}

/**
 * collapse に紐づくトグル要素（`data-bs-toggle="collapse"`）の aria-expanded と
 * `collapsed` クラスを開閉状態へ同期する。直接クラスを操作して復元するため、
 * Bootstrap が次回トグルするまでの間もトグル表示が状態と一致するようにする。
 *
 * @param collapseElement 対象の collapse 要素。
 * @param shown 展開状態なら true。
 * @return 戻り値はない。
 */
function syncToggles(collapseElement: HTMLElement, shown: boolean): void {
  const id = collapseElement.id;
  const selectors = [`[data-bs-toggle="collapse"][data-bs-target="#${id}"]`];
  if (id) {
    selectors.push(`[data-bs-toggle="collapse"][href="#${id}"]`);
  }
  if (!id) {
    return;
  }
  const doc = collapseElement.ownerDocument;
  doc.querySelectorAll<HTMLElement>(selectors.join(',')).forEach(toggle => {
    toggle.setAttribute('aria-expanded', shown ? 'true' : 'false');
    toggle.classList.toggle('collapsed', !shown);
  });
}

/**
 * 1 つの collapse 要素へ保存済み状態を復元する。
 *
 * @param element 対象要素。
 * @return 戻り値はない。
 */
function restoreElement(element: HTMLElement): void {
  const key = element.getAttribute(PERSIST_ATTR);
  if (!key) {
    return;
  }
  const state = readState(key);
  if (!state) {
    return;
  }
  const isShown = element.classList.contains('show');
  if (state === 'shown' && !isShown) {
    element.classList.add('show');
    syncToggles(element, true);
  } else if (state === 'hidden' && isShown) {
    element.classList.remove('show');
    syncToggles(element, false);
  }
}

/**
 * ルート配下（およびルート自身）のすべての永続化対象を復元する。
 *
 * @param root 探索の起点。
 * @return 戻り値はない。
 */
function restoreWithin(root: ParentNode | HTMLElement): void {
  if (root instanceof HTMLElement && root.hasAttribute(PERSIST_ATTR)) {
    restoreElement(root);
  }
  root
    .querySelectorAll<HTMLElement>(`[${PERSIST_ATTR}]`)
    .forEach(restoreElement);
}

/**
 * Bootstrap collapse の開閉イベントを受けて状態を保存する。
 *
 * @param event collapse イベント。
 * @param state 保存する開閉状態。
 * @return 戻り値はない。
 */
function handleToggle(event: Event, state: CollapseState): void {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  const key = target.getAttribute(PERSIST_ATTR);
  if (key) {
    writeState(key, state);
  }
}

/** `shown.bs.collapse` ハンドラ。 */
const onShown = (event: Event): void => handleToggle(event, 'shown');

/** `hidden.bs.collapse` ハンドラ。 */
const onHidden = (event: Event): void => handleToggle(event, 'hidden');

/**
 * collapse 永続化を有効化する。多重呼び出しは無視する。
 *
 * body が未生成の場合は DOMContentLoaded を待ってから初期化する。
 *
 * @param doc 対象 document。既定は現在の document。
 * @return 戻り値はない。
 */
export function setupCollapsePersistence(doc: Document = document): void {
  if (started) {
    return;
  }
  started = true;
  observedDocument = doc;

  // Bootstrap 5 の collapse イベントはバブリングするため document 委譲で受ける。
  doc.addEventListener('shown.bs.collapse', onShown);
  doc.addEventListener('hidden.bs.collapse', onHidden);

  const initialize = (): void => {
    restoreWithin(doc);
    // data-import などで後から挿入されるフラグメントにも復元を適用する。
    observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            restoreWithin(node);
          }
        });
      }
    });
    if (doc.body) {
      observer.observe(doc.body, { childList: true, subtree: true });
    }
  };

  if (doc.body) {
    initialize();
  } else {
    doc.addEventListener('DOMContentLoaded', initialize, { once: true });
  }
}

/**
 * collapse 永続化を無効化し、監視を解除する。
 *
 * @param doc 対象 document。既定は setup 時の document。
 * @return 戻り値はない。
 */
export function teardownCollapsePersistence(
  doc: Document = observedDocument ?? document,
): void {
  if (!started) {
    return;
  }
  started = false;
  doc.removeEventListener('shown.bs.collapse', onShown);
  doc.removeEventListener('hidden.bs.collapse', onHidden);
  observer?.disconnect();
  observer = undefined;
  observedDocument = undefined;
}
