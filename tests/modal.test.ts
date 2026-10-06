import { beforeEach, describe, expect, it, vi } from 'vitest';

import { install, uninstall } from '../src/install';
import { addManagedErrorMessage } from '../src/message';

/**
 * modal テスト用の簡易 Haori スタブを生成する。
 *
 * @return テスト用 Haori スタブ。
 */
function createHaoriStub() {
  return {
    dialog: vi.fn(),
    confirm: vi.fn().mockResolvedValue(true),
    toast: vi.fn(),
    openDialog: vi.fn(),
    closeDialog: vi.fn(),
    addErrorMessage: vi.fn(),
    clearMessages: vi.fn(),
  };
}

/**
 * modal テスト用の Bootstrap Modal スタブを生成する。
 *
 * @return テスト用 Bootstrap スタブ。
 */
function createBootstrapStub() {
  const instances = new WeakMap<Element, FakeModal>();

  class FakeModal {
    private readonly element: HTMLElement;

    constructor(element: Element) {
      this.element = element as HTMLElement;
    }

    public static getOrCreateInstance(element: Element): FakeModal {
      const existing = instances.get(element);
      if (existing) {
        return existing;
      }

      const created = new FakeModal(element);
      instances.set(element, created);
      return created;
    }

    public show(): void {
      this.element.dataset.state = 'shown';
    }

    public hide(): void {
      this.element.dataset.state = 'hidden';
    }
  }

  return {
    Modal: FakeModal,
  };
}

/**
 * 表示アニメーション（フェードイン）を再現する Bootstrap Modal スタブを生成する。
 *
 * <p>Bootstrap 本体と同じく、`show()` で `show.bs.modal` を発火してアニメーションを
 * 開始し、完了時に `shown.bs.modal` を発火する。アニメーション中の `hide()` は無視
 * する。イベントは document へバブリングさせる（本体と同じ）。
 *
 * @return テスト用 Bootstrap スタブ。
 */
function createFadingBootstrapStub() {
  const instances = new WeakMap<Element, FadingModal>();

  class FadingModal {
    private readonly element: HTMLElement;

    /** フェードイン中かどうか。Bootstrap の `_isTransitioning` に対応する。 */
    private isTransitioning = false;

    constructor(element: Element) {
      this.element = element as HTMLElement;
    }

    public static getOrCreateInstance(element: Element): FadingModal {
      const existing = instances.get(element);
      if (existing) {
        return existing;
      }

      const created = new FadingModal(element);
      instances.set(element, created);
      return created;
    }

    public show(): void {
      this.isTransitioning = true;
      this.element.dataset.state = 'shown';
      this.element.dispatchEvent(new Event('show.bs.modal', { bubbles: true }));
      setTimeout(() => {
        this.isTransitioning = false;
        this.element.dispatchEvent(new Event('shown.bs.modal', { bubbles: true }));
      }, 0);
    }

    public hide(): void {
      if (this.isTransitioning) {
        return;
      }
      this.element.dataset.state = 'hidden';
    }
  }

  return {
    Modal: FadingModal,
  };
}

/**
 * フェードインの完了を待つ。
 *
 * @return 完了時に解決される Promise。
 */
function waitForShown(): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}

describe('openDialog and closeDialog', () => {
  beforeEach(() => {
    uninstall();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    window.Haori = createHaoriStub();
    window.bootstrap = createBootstrapStub();
  });

  // openDialog が既存の .modal 要素を Modal として表示すること。
  it('opens an existing .modal element as a Bootstrap modal', async () => {
    install();
    const element = document.createElement('div');
    element.classList.add('modal');
    document.body.appendChild(element);

    const haori = window.Haori as unknown as {
      openDialog: (target: HTMLElement) => Promise<void>;
    };

    await haori.openDialog(element);

    expect(element.dataset.state).toBe('shown');
  });

  // closeDialog が同じ .modal 要素の Modal を閉じること。
  it('closes an existing Bootstrap modal element', async () => {
    install();
    const element = document.createElement('div');
    element.classList.add('modal');
    document.body.appendChild(element);

    const haori = window.Haori as unknown as {
      openDialog: (target: HTMLElement) => Promise<void>;
      closeDialog: (target: HTMLElement) => Promise<void>;
    };

    await haori.openDialog(element);
    await haori.closeDialog(element);

    expect(element.dataset.state).toBe('hidden');
  });

  // 非 .modal 要素を渡しても modal 化せず、祖先の .modal を対象に解決すること。
  it('resolves to the nearest ancestor .modal instead of mutating the target', async () => {
    install();
    const modal = document.createElement('div');
    modal.classList.add('modal');
    const button = document.createElement('button');
    button.type = 'button';
    modal.appendChild(button);
    document.body.appendChild(modal);

    const haori = window.Haori as unknown as {
      openDialog: (target: HTMLElement) => Promise<void>;
      closeDialog: (target: HTMLElement) => Promise<void>;
    };

    // 値省略の data-click-close 等で対象がボタン自身に解決される状況を再現。
    await haori.openDialog(button);
    expect(modal.dataset.state).toBe('shown');
    // ボタンが破壊的に modal 化（display:none）されないこと。
    expect(button.classList.contains('modal')).toBe(false);

    await haori.closeDialog(button);
    expect(modal.dataset.state).toBe('hidden');
    expect(button.classList.contains('modal')).toBe(false);
  });

  // 再表示時に、前回付与した管理メッセージと is-invalid 状態がクリアされること。
  it('clears managed messages and validation state on reopen', async () => {
    install();
    const modal = document.createElement('div');
    modal.classList.add('modal');
    const input = document.createElement('input');
    input.type = 'text';
    modal.appendChild(input);
    document.body.appendChild(modal);

    const haori = window.Haori as unknown as {
      openDialog: (target: HTMLElement) => Promise<void>;
      closeDialog: (target: HTMLElement) => Promise<void>;
    };

    // 開いた後に送信エラー相当の管理メッセージを付与する。
    await haori.openDialog(modal);
    await addManagedErrorMessage(input, 'Required field.');
    expect(input.classList.contains('is-invalid')).toBe(true);
    expect(modal.querySelector('[data-haori-message-container="true"]')).not.toBeNull();

    // 閉じてもメッセージは残る（閉じるアニメーション中に消さない）。
    await haori.closeDialog(modal);
    expect(input.classList.contains('is-invalid')).toBe(true);
    expect(modal.querySelector('[data-haori-message-container="true"]')).not.toBeNull();

    // 再度開くと、前回の管理メッセージと is-invalid 状態がクリアされる。
    await haori.openDialog(modal);
    expect(input.classList.contains('is-invalid')).toBe(false);
    expect(modal.querySelector('[data-haori-message-container="true"]')).toBeNull();
    expect(modal.dataset.state).toBe('shown');
  });

  // 開いた直後に追加した管理メッセージは、その表示中はクリアされないこと。
  it('keeps messages added after the modal is opened', async () => {
    install();
    const modal = document.createElement('div');
    modal.classList.add('modal');
    const input = document.createElement('input');
    input.type = 'text';
    modal.appendChild(input);
    document.body.appendChild(modal);

    const haori = window.Haori as unknown as {
      openDialog: (target: HTMLElement) => Promise<void>;
    };

    // クリアは open 時のみ。open 後の addMessage は維持される。
    await haori.openDialog(modal);
    await addManagedErrorMessage(input, 'Required field.');

    expect(input.classList.contains('is-invalid')).toBe(true);
    expect(modal.querySelector('[data-haori-message-container="true"]')).not.toBeNull();
  });

  // フェードイン中に closeDialog を呼んでも閉じること（confirm の報告 AI と同種）。
  it('closes the modal when closeDialog is called while the modal is fading in', async () => {
    window.bootstrap = createFadingBootstrapStub();
    install();
    const modal = document.createElement('div');
    modal.classList.add('modal', 'fade');
    document.body.appendChild(modal);

    const haori = window.Haori as unknown as {
      openDialog: (target: HTMLElement) => Promise<void>;
      closeDialog: (target: HTMLElement) => Promise<void>;
    };

    await haori.openDialog(modal);
    // 表示完了を待たずに閉じる。Bootstrap はこの間の hide() を無視する。
    await haori.closeDialog(modal);
    expect(modal.dataset.state).not.toBe('hidden');

    await waitForShown();
    expect(modal.dataset.state).toBe('hidden');
  });

  // 表示完了後の closeDialog は従来どおり即座に閉じること。
  it('closes the modal immediately when it is already shown', async () => {
    window.bootstrap = createFadingBootstrapStub();
    install();
    const modal = document.createElement('div');
    modal.classList.add('modal', 'fade');
    document.body.appendChild(modal);

    const haori = window.Haori as unknown as {
      openDialog: (target: HTMLElement) => Promise<void>;
      closeDialog: (target: HTMLElement) => Promise<void>;
    };

    await haori.openDialog(modal);
    await waitForShown();
    await haori.closeDialog(modal);

    expect(modal.dataset.state).toBe('hidden');
  });

  // 祖先に .modal が無い場合は modal 化せず、コア実装へフォールバックすること。
  it('falls back to the original Haori method when no .modal ancestor exists', async () => {
    // install 後はファサードへ差し替わるため、元スタブの参照を事前に確保する。
    const originalStub = window.Haori as unknown as {
      closeDialog: ReturnType<typeof vi.fn>;
    };
    install();
    const element = document.createElement('button');
    element.type = 'button';
    document.body.appendChild(element);

    const haori = window.Haori as unknown as {
      closeDialog: (target: HTMLElement) => Promise<void>;
    };

    await haori.closeDialog(element);

    // 破壊的な modal 化は行われない。
    expect(element.classList.contains('modal')).toBe(false);
    // 解決不可のため元のコア closeDialog にフォールバックする。
    expect(originalStub.closeDialog).toHaveBeenCalledWith(element);
  });
});

/**
 * 閉じる操作の取り消しを再現する Bootstrap Modal スタブを生成する。
 *
 * <p>Bootstrap 本体と同じく、`hide()` で取り消しのできる `hide.bs.modal` を発火し、
 * 取り消された場合は閉じない。Esc キー・背景のクリック・`data-bs-dismiss` は、
 * 本体ではいずれもこの `hide()` を呼ぶ。`fading` を指定すると、`show()` から
 * `shown.bs.modal` までの間の `hide()` を無視する（フェードインの再現）。
 *
 * @param fading フェードインを再現するかどうか。
 * @return テスト用 Bootstrap スタブ。
 */
function createDismissableBootstrapStub(fading = false) {
  const instances = new WeakMap<Element, DismissableModal>();

  class DismissableModal {
    private readonly element: HTMLElement;

    /** フェードイン中かどうか。Bootstrap の `_isTransitioning` に対応する。 */
    private isTransitioning = false;

    constructor(element: Element) {
      this.element = element as HTMLElement;
    }

    public static getOrCreateInstance(element: Element): DismissableModal {
      const existing = instances.get(element);
      if (existing) {
        return existing;
      }

      const created = new DismissableModal(element);
      instances.set(element, created);
      return created;
    }

    public show(): void {
      this.element.dataset.state = 'shown';
      this.element.dispatchEvent(new Event('show.bs.modal', { bubbles: true }));
      if (!fading) {
        this.element.dispatchEvent(new Event('shown.bs.modal', { bubbles: true }));
        return;
      }
      this.isTransitioning = true;
      setTimeout(() => {
        this.isTransitioning = false;
        this.element.dispatchEvent(new Event('shown.bs.modal', { bubbles: true }));
      }, 0);
    }

    public hide(): void {
      if (this.isTransitioning) {
        return;
      }
      const hideEvent = new Event('hide.bs.modal', { bubbles: true, cancelable: true });
      this.element.dispatchEvent(hideEvent);
      if (hideEvent.defaultPrevented) {
        return;
      }
      this.element.dataset.state = 'hidden';
    }
  }

  return {
    Modal: DismissableModal,
  };
}

/**
 * Esc キー・背景のクリック・`data-bs-dismiss` と同じ経路で Modal を閉じる。
 *
 * <p>Bootstrap 本体は、これらの操作でインスタンスの `hide()` を直接呼ぶ。
 *
 * @param element 対象の `.modal` 要素。
 * @return 戻り値はない。
 */
function dismissLikeBootstrap(element: HTMLElement): void {
  const bootstrap = window.bootstrap as unknown as {
    Modal: { getOrCreateInstance: (target: Element) => { hide: () => void } };
  };
  bootstrap.Modal.getOrCreateInstance(element).hide();
}

describe('data-haori-dismiss-lock', () => {
  const haori = () =>
    window.Haori as unknown as {
      openDialog: (target: HTMLElement) => Promise<void>;
      closeDialog: (target: HTMLElement) => Promise<void>;
    };

  /**
   * テスト用の `.modal` 要素を作る。
   *
   * @param lock `data-haori-dismiss-lock` の値。null なら宣言しない。
   * @return 作成した要素。
   */
  function createModal(lock: string | null): HTMLElement {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    if (lock !== null) {
      modal.setAttribute('data-haori-dismiss-lock', lock);
    }
    document.body.appendChild(modal);
    return modal;
  }

  beforeEach(() => {
    uninstall();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    window.Haori = createHaoriStub();
    window.bootstrap = createDismissableBootstrapStub();
  });

  // 宣言がある間は、Esc キー・背景のクリック・data-bs-dismiss の経路では閉じないこと。
  it('keeps the modal open against Bootstrap dismissal while locked', async () => {
    install();
    const modal = createModal('true');

    await haori().openDialog(modal);
    dismissLikeBootstrap(modal);

    expect(modal.dataset.state).toBe('shown');
  });

  // 宣言の値が何であっても、属性があれば閉じないこと。
  it('treats the attribute as a lock regardless of its value', async () => {
    install();
    const modal = createModal('false');

    await haori().openDialog(modal);
    dismissLikeBootstrap(modal);

    expect(modal.dataset.state).toBe('shown');
  });

  // 宣言がある間も、haori の閉じる操作（data-{event}-close など）では閉じること。
  it('lets closeDialog close a locked modal', async () => {
    install();
    const modal = createModal('true');

    await haori().openDialog(modal);
    await haori().closeDialog(modal);

    expect(modal.dataset.state).toBe('hidden');
  });

  // フェードイン中の closeDialog が表示完了後に閉じ直す経路でも、宣言を通り抜けること。
  it('lets closeDialog close a locked modal while it is fading in', async () => {
    window.bootstrap = createDismissableBootstrapStub(true);
    install();
    const modal = createModal('true');

    await haori().openDialog(modal);
    await haori().closeDialog(modal);
    await waitForShown();

    expect(modal.dataset.state).toBe('hidden');
  });

  // closeDialog が通り抜けた後は、再び Bootstrap の閉じる操作を止めること。
  it('locks the modal again after closeDialog has closed it', async () => {
    install();
    const modal = createModal('true');

    await haori().openDialog(modal);
    await haori().closeDialog(modal);
    await haori().openDialog(modal);
    dismissLikeBootstrap(modal);

    expect(modal.dataset.state).toBe('shown');
  });

  // 属性が消えた後は、Modal の既定どおり閉じること。
  it('closes the modal by Bootstrap dismissal once the lock is removed', async () => {
    install();
    const modal = createModal('true');

    await haori().openDialog(modal);
    modal.removeAttribute('data-haori-dismiss-lock');
    dismissLikeBootstrap(modal);

    expect(modal.dataset.state).toBe('hidden');
  });

  // uninstall の後は、宣言があっても閉じる操作を止めないこと。
  it('stops locking after uninstall', async () => {
    install();
    const modal = createModal('true');
    await haori().openDialog(modal);

    uninstall();
    dismissLikeBootstrap(modal);

    expect(modal.dataset.state).toBe('hidden');
  });
});

describe('nested modal focus', () => {
  /**
   * テスト用の `.modal` 要素を作る。
   *
   * @param id 要素の id。
   * @param inner 中に置く HTML。
   * @return 作成した要素。
   */
  function createModal(id: string, inner = ''): HTMLElement {
    const modal = document.createElement('div');
    modal.id = id;
    modal.classList.add('modal');
    modal.tabIndex = -1;
    modal.innerHTML = inner;
    document.body.appendChild(modal);
    return modal;
  }

  /**
   * Bootstrap と同じ順で、モーダルを開くときのイベントを発火する。
   *
   * <p>`show.bs.modal` の後に `.show` を付ける。`pull` を渡すと、子のフォーカスの
   * トラップを有効にする時点で親のトラップがフォーカスを引き戻す動きを再現する。
   *
   * @param modal 開くモーダル。
   * @param pull 引き戻し先の要素。
   * @return 戻り値はない。
   */
  function showLikeBootstrap(modal: HTMLElement, pull?: HTMLElement): void {
    modal.dispatchEvent(new Event('show.bs.modal', { bubbles: true }));
    modal.classList.add('show');
    modal.focus();
    pull?.focus();
    modal.dispatchEvent(new Event('shown.bs.modal', { bubbles: true }));
  }

  /**
   * Bootstrap と同じ順で、モーダルを閉じるときのイベントを発火する。
   *
   * <p>閉じたモーダルは非表示になり、その中のフォーカスは失われる。
   *
   * @param modal 閉じるモーダル。
   * @return 戻り値はない。
   */
  function hideLikeBootstrap(modal: HTMLElement): void {
    modal.classList.remove('show');
    if (modal.contains(document.activeElement)) {
      (document.activeElement as HTMLElement).blur();
    }
    modal.dispatchEvent(new Event('hidden.bs.modal', { bubbles: true }));
  }

  /**
   * 親を開き、その中のボタンへフォーカスを置いた状態を作る。
   *
   * @return 親と、その中の要素。
   */
  function openParent() {
    const parent = createModal(
      'parent',
      '<button id="close" type="button">×</button><button id="opener" type="button">開く</button>',
    );
    showLikeBootstrap(parent);
    const opener = parent.querySelector<HTMLButtonElement>('#opener')!;
    const close = parent.querySelector<HTMLButtonElement>('#close')!;
    opener.focus();
    return { parent, opener, close };
  }

  beforeEach(() => {
    uninstall();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    window.Haori = createHaoriStub();
    window.bootstrap = createBootstrapStub();
    install();
  });

  // 設計書「11.7 入れ子のモーダルのフォーカス」の「他に開いているモーダルがあり、
  // フォーカスが子の外にあれば、子のモーダル要素へフォーカスを移す」。
  it('moves focus to the child when the parent pulled it back', () => {
    const { close } = openParent();
    const child = createModal('child', '<input id="child-input">');

    showLikeBootstrap(child, close);

    expect(document.activeElement).toBe(child);
  });

  // 設計書「11.7 入れ子のモーダルのフォーカス」の「他に開いているモーダル（.modal.show）が
  // 無いときは何もしない。入れ子でないモーダルの動作は変えない。」
  it('leaves focus alone when no other modal is open', () => {
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    const modal = createModal('single');

    showLikeBootstrap(modal, outside);

    expect(document.activeElement).toBe(outside);
  });

  // README「入れ子のモーダルのフォーカス」の「子の中の入力欄などへ先にフォーカスを
  // 移していれば、そのままにします。」
  it('keeps focus that is already inside the child', () => {
    openParent();
    const child = createModal('child', '<input id="child-input">');
    const input = child.querySelector<HTMLInputElement>('#child-input')!;

    showLikeBootstrap(child, input);

    expect(document.activeElement).toBe(input);
  });

  // 設計書「11.7 入れ子のモーダルのフォーカス」の「子に data-bs-focus="false" があれば
  // 移さない。」
  it('does not move focus to a child that declares data-bs-focus="false"', () => {
    const { close } = openParent();
    const child = createModal('child');
    child.setAttribute('data-bs-focus', 'false');

    showLikeBootstrap(child, close);

    expect(document.activeElement).toBe(close);
  });

  // 設計書「11.7 入れ子のモーダルのフォーカス」の「他に開いているモーダルが残り、
  // フォーカスがそのどれにも無ければ、覚えた要素へフォーカスを戻す。」
  it('returns focus to the element that opened the child', () => {
    const { opener, close } = openParent();
    const child = createModal('child');
    showLikeBootstrap(child, close);

    hideLikeBootstrap(child);

    expect(document.activeElement).toBe(opener);
  });

  // 設計書「11.7 入れ子のモーダルのフォーカス」の「押したボタンは手続きの間 disabled に
  // なってフォーカスを失うため、show.bs.modal の時点の document.activeElement では
  // 取れない。」
  it('remembers the opener even after it lost focus by being disabled', () => {
    const { opener, close } = openParent();
    opener.disabled = true;
    opener.blur();
    const child = createModal('child');
    showLikeBootstrap(child, close);
    opener.disabled = false;

    hideLikeBootstrap(child);

    expect(document.activeElement).toBe(opener);
  });

  // 設計書「11.7 入れ子のモーダルのフォーカス」の「覚えた要素が開いているモーダルの外に
  // あるとき、またはフォーカスを受けられなかったとき（文書から外れた・無効になったなど）は、
  // 開いているモーダルのうち文書の中で最後にあるモーダル要素へ戻す。」
  it('returns focus to the parent modal when the opener is disabled', () => {
    const { parent, opener, close } = openParent();
    const child = createModal('child');
    showLikeBootstrap(child, close);
    opener.disabled = true;

    hideLikeBootstrap(child);

    expect(document.activeElement).toBe(parent);
  });

  // 設計書「11.7 入れ子のモーダルのフォーカス」の「覚えた要素が開いているモーダルの外に
  // あるとき、またはフォーカスを受けられなかったとき（文書から外れた・無効になったなど）は、
  // 開いているモーダルのうち文書の中で最後にあるモーダル要素へ戻す。」
  it('returns focus to the parent modal when the opener was removed', () => {
    const { parent, opener, close } = openParent();
    const child = createModal('child');
    showLikeBootstrap(child, close);
    opener.remove();

    hideLikeBootstrap(child);

    expect(document.activeElement).toBe(parent);
  });

  // 設計書「11.7 入れ子のモーダルのフォーカス」の「覚えた要素が開いているモーダルの外に
  // あるとき、またはフォーカスを受けられなかったとき（文書から外れた・無効になったなど）は、
  // 開いているモーダルのうち文書の中で最後にあるモーダル要素へ戻す。」
  it('returns focus to the parent modal when the opener is outside open modals', () => {
    const { parent } = openParent();
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();
    const child = createModal('child');
    showLikeBootstrap(child);

    hideLikeBootstrap(child);

    expect(document.activeElement).toBe(parent);
  });

  // 設計書「11.7 入れ子のモーダルのフォーカス」の「.modal の z-index はどれも同じため、
  // 文書の中で後ろにあるものほど手前に表示される。」
  it('picks the open modal that comes last in the document', () => {
    openParent();
    const middle = createModal('middle');
    showLikeBootstrap(middle);
    const child = createModal('child');
    showLikeBootstrap(child);
    document.getElementById('opener')!.remove();

    hideLikeBootstrap(child);

    expect(document.activeElement).toBe(middle);
  });

  // 設計書「11.7 入れ子のモーダルのフォーカス」の「他に開いているモーダルが残り、
  // フォーカスがそのどれにも無ければ」。
  it('keeps focus that is already inside a remaining modal', () => {
    const { close } = openParent();
    const child = createModal('child');
    showLikeBootstrap(child, close);
    child.classList.remove('show');
    close.focus();

    child.dispatchEvent(new Event('hidden.bs.modal', { bubbles: true }));

    expect(document.activeElement).toBe(close);
  });

  // 設計書「11.7 入れ子のモーダルのフォーカス」の「他に開いているモーダル（.modal.show）が
  // 無いときは何もしない。」
  it('does not move focus when the last modal is hidden', () => {
    const modal = createModal('single', '<button id="inner" type="button">中</button>');
    showLikeBootstrap(modal);
    modal.querySelector<HTMLButtonElement>('#inner')!.focus();
    const errors = vi.fn((event: ErrorEvent) => event.preventDefault());
    window.addEventListener('error', errors);

    try {
      hideLikeBootstrap(modal);
    } finally {
      window.removeEventListener('error', errors);
    }

    expect(errors).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(document.body);
  });

  // 設計書「11.7 入れ子のモーダルのフォーカス」の「これらの監視は install の間だけ行い、
  // uninstall で止める。」
  it('stops moving focus to the child after uninstall', () => {
    const { close } = openParent();
    const child = createModal('child');
    uninstall();

    showLikeBootstrap(child, close);

    expect(document.activeElement).toBe(close);
  });

  // 設計書「11.7 入れ子のモーダルのフォーカス」の「これらの監視は install の間だけ行い、
  // uninstall で止める。」
  it('stops returning focus after uninstall', () => {
    const { close } = openParent();
    const child = createModal('child');
    showLikeBootstrap(child, close);
    uninstall();

    hideLikeBootstrap(child);

    expect(document.activeElement).toBe(document.body);
  });

  // 設計書「11.7 入れ子のモーダルのフォーカス」の「これらの監視は install の間だけ行い、
  // uninstall で止める。uninstall の前に覚えた要素は、再び install した後には使わない。」
  it('does not use focus remembered before or outside install', () => {
    const { parent, close } = openParent();
    uninstall();
    close.focus();
    install();
    const child = createModal('child');
    showLikeBootstrap(child, close);

    hideLikeBootstrap(child);

    expect(document.activeElement).toBe(parent);
  });

  // 設計書「11.7 入れ子のモーダルのフォーカス」の「uninstall の前に覚えた要素は、再び
  // install した後には使わない。」同じ子を開き直す場合も同じ。
  it('does not reuse the opener remembered for the same child before uninstall', () => {
    const { parent, close } = openParent();
    const child = createModal('child');
    showLikeBootstrap(child, close);
    hideLikeBootstrap(child);
    uninstall();
    install();

    showLikeBootstrap(child, close);
    hideLikeBootstrap(child);

    expect(document.activeElement).toBe(parent);
  });
});
