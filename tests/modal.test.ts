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
