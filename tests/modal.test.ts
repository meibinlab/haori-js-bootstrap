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
