import { beforeEach, describe, expect, it, vi } from 'vitest';

import { install, uninstall } from '../src/install';

/**
 * dialog 系 API の差し替え前に使う簡易 Haori スタブを生成する。
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
 * dialog テスト用の Bootstrap Modal スタブを生成する。
 *
 * @return テスト用 Bootstrap スタブ。
 */
function createBootstrapStub() {
  class FakeModal {
    private readonly element: HTMLElement;

    private static latestOptions: { backdrop?: 'static' | boolean } | undefined;

    constructor(element: Element, options?: { backdrop?: 'static' | boolean }) {
      this.element = element as HTMLElement;
      FakeModal.latestOptions = options;
    }

    public static getLatestOptions(): { backdrop?: 'static' | boolean } | undefined {
      return FakeModal.latestOptions;
    }

    public static getOrCreateInstance(
      element: Element,
      options?: { backdrop?: 'static' | boolean },
    ): FakeModal {
      return new FakeModal(element, options);
    }

    public show(): void {
      this.element.dispatchEvent(new Event('shown.bs.modal'));
    }

    public hide(): void {
      this.element.dispatchEvent(new Event('hidden.bs.modal'));
    }

    public dispose(): void {}
  }

  return {
    Modal: FakeModal,
  };
}

/**
 * テスト用 Modal スタブが最後に受け取った初期化オプションを返す。
 *
 * @return 直近の Modal 初期化オプション。
 */
function getLatestModalOptions(): { backdrop?: 'static' | boolean } | undefined {
  const modalConstructor = window.bootstrap?.Modal as
    | { getLatestOptions?: () => { backdrop?: 'static' | boolean } | undefined }
    | undefined;
  return modalConstructor?.getLatestOptions?.();
}

describe('dialog and confirm', () => {
  beforeEach(() => {
    uninstall();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    window.Haori = createHaoriStub();
    window.bootstrap = createBootstrapStub();
  });

  // dialog が改行を含むメッセージを text として描画し、OK 操作で閉じること。
  it('renders a Bootstrap dialog with normalized line breaks and resolves after clicking ok', async () => {
    install();
    const haori = window.Haori as unknown as { dialog: (message: string) => Promise<void> };

    const promise = haori.dialog('Hello\\nDialog');
    const modalElement = document.querySelector<HTMLElement>('[data-haori-bootstrap-dialog="true"]');
    const messageElement = modalElement?.querySelector<HTMLElement>('.modal-body p');
    expect(messageElement?.textContent).toBe('Hello\nDialog');
    expect(messageElement?.style.whiteSpace).toBe('pre-line');
    expect(getLatestModalOptions()).toEqual({ backdrop: 'static' });

    const okButton = modalElement?.querySelector<HTMLButtonElement>(
      '[data-haori-bootstrap-action="ok"]',
    );
    okButton?.click();

    await promise;

    expect(document.querySelector('[data-haori-bootstrap-dialog="true"]')).toBeNull();
  });

  // confirm が改行を含むメッセージを text として描画し、OK 操作のみ true を返すこと。
  it('returns true when confirm is accepted with normalized line breaks', async () => {
    install();
    const haori = window.Haori as unknown as { confirm: (message: string) => Promise<boolean> };

    const promise = haori.confirm('Proceed?\\nThis action cannot be undone.');
    const modalElement = document.querySelector<HTMLElement>('[data-haori-bootstrap-dialog="true"]');
    const messageElement = modalElement?.querySelector<HTMLElement>('.modal-body p');
    expect(messageElement?.textContent).toBe('Proceed?\nThis action cannot be undone.');
    expect(messageElement?.style.whiteSpace).toBe('pre-line');
    expect(getLatestModalOptions()).toEqual({ backdrop: 'static' });
    const okButton = modalElement?.querySelector<HTMLButtonElement>(
      '[data-haori-bootstrap-action="ok"]',
    );
    okButton?.click();

    await expect(promise).resolves.toBe(true);
  });
});
