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
 * <p>表示アニメーション（フェードイン）を再現する。Bootstrap 本体は
 * `hide()` を `_isTransitioning` の間は無視し、アニメーション完了時に
 * `shown.bs.modal` を発火する。ここも同じ順序で振る舞わせる。
 *
 * @return テスト用 Bootstrap スタブ。
 */
function createBootstrapStub() {
  class FakeModal {
    private readonly element: HTMLElement;

    /** フェードイン中かどうか。Bootstrap の `_isTransitioning` に対応する。 */
    private isTransitioning = false;

    private static latestOptions: { backdrop?: 'static' | boolean; keyboard?: boolean } | undefined;

    constructor(element: Element, options?: { backdrop?: 'static' | boolean; keyboard?: boolean }) {
      this.element = element as HTMLElement;
      FakeModal.latestOptions = options;
    }

    public static getLatestOptions():
      | { backdrop?: 'static' | boolean; keyboard?: boolean }
      | undefined {
      return FakeModal.latestOptions;
    }

    public static getOrCreateInstance(
      element: Element,
      options?: { backdrop?: 'static' | boolean; keyboard?: boolean },
    ): FakeModal {
      return new FakeModal(element, options);
    }

    public show(): void {
      this.isTransitioning = true;
      this.element.dispatchEvent(new Event('show.bs.modal'));
      setTimeout(() => {
        this.isTransitioning = false;
        this.element.dispatchEvent(new Event('shown.bs.modal'));
      }, 0);
    }

    public hide(): void {
      // Bootstrap は表示アニメーション中の hide() を無視する。
      if (this.isTransitioning) {
        return;
      }
      this.element.dispatchEvent(new Event('hidden.bs.modal'));
    }

    public dispose(): void {}
  }

  return {
    Modal: FakeModal,
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

/**
 * テスト用 Modal スタブが最後に受け取った初期化オプションを返す。
 *
 * @return 直近の Modal 初期化オプション。
 */
function getLatestModalOptions():
  | { backdrop?: 'static' | boolean; keyboard?: boolean }
  | undefined {
  const modalConstructor = window.bootstrap?.Modal as
    | { getLatestOptions?: () => { backdrop?: 'static' | boolean; keyboard?: boolean } | undefined }
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
    const modalElement = document.querySelector<HTMLElement>('[data-haori-dialog="true"]');
    const messageElement = modalElement?.querySelector<HTMLElement>('.modal-body p');
    expect(messageElement?.textContent).toBe('Hello\nDialog');
    expect(messageElement?.style.whiteSpace).toBe('pre-line');
    expect(getLatestModalOptions()).toEqual({ backdrop: 'static', keyboard: false });

    const okButton = modalElement?.querySelector<HTMLButtonElement>(
      '[data-haori-dialog-ok="true"]',
    );
    okButton?.click();

    await promise;

    expect(document.querySelector('[data-haori-dialog="true"]')).toBeNull();
  });

  // confirm が改行を含むメッセージを text として描画し、専用の識別属性を持ち、OK 操作のみ true を返すこと。
  it('returns true when confirm is accepted with normalized line breaks', async () => {
    install();
    const haori = window.Haori as unknown as { confirm: (message: string) => Promise<boolean> };

    const promise = haori.confirm('Proceed?\\nThis action cannot be undone.');
    const modalElement = document.querySelector<HTMLElement>('[data-haori-confirm="true"]');
    expect(modalElement).not.toBeNull();
    // confirm は info ダイアログとは別の識別属性を持つこと。
    expect(document.querySelector('[data-haori-dialog="true"]')).toBeNull();
    const messageElement = modalElement?.querySelector<HTMLElement>('.modal-body p');
    expect(messageElement?.textContent).toBe('Proceed?\nThis action cannot be undone.');
    expect(messageElement?.style.whiteSpace).toBe('pre-line');
    expect(getLatestModalOptions()).toEqual({ backdrop: 'static', keyboard: false });
    const okButton = modalElement?.querySelector<HTMLButtonElement>(
      '[data-haori-confirm-ok="true"]',
    );
    okButton?.click();

    await expect(promise).resolves.toBe(true);
  });

  // dialogTitle を指定するとヘッダータイトルが表示され aria-labelledby が設定されること。
  it('renders a modal header with the dialog title and aria-labelledby when dialogTitle is set', async () => {
    install({ dialogTitle: '確認' });
    const haori = window.Haori as unknown as { dialog: (message: string) => Promise<void> };

    const promise = haori.dialog('処理を実行します。');
    const modalElement = document.querySelector<HTMLElement>('[data-haori-dialog="true"]');
    const titleElement = modalElement?.querySelector<HTMLElement>(
      '[data-haori-dialog-title="true"]',
    );

    expect(titleElement?.textContent).toBe('確認');
    expect(titleElement?.className).toContain('modal-title');
    const labelledById = modalElement?.getAttribute('aria-labelledby');
    expect(labelledById).toBeTruthy();
    expect(titleElement?.id).toBe(labelledById);

    const okButton = modalElement?.querySelector<HTMLButtonElement>(
      '[data-haori-dialog-ok="true"]',
    );
    okButton?.click();
    await promise;
  });

  // dialogTitle 未指定のときはヘッダーが存在しないこと。
  it('does not render a modal header when dialogTitle is not set', async () => {
    install();
    const haori = window.Haori as unknown as { dialog: (message: string) => Promise<void> };

    const promise = haori.dialog('メッセージ');
    const modalElement = document.querySelector<HTMLElement>('[data-haori-dialog="true"]');

    expect(modalElement?.querySelector('.modal-header')).toBeNull();
    expect(modalElement?.getAttribute('aria-labelledby')).toBeNull();

    const okButton = modalElement?.querySelector<HTMLButtonElement>(
      '[data-haori-dialog-ok="true"]',
    );
    okButton?.click();
    await promise;
  });

  // confirm でも dialogTitle が有効なこと。
  it('renders a modal header with the dialog title for confirm', async () => {
    install({ dialogTitle: '確認' });
    const haori = window.Haori as unknown as { confirm: (message: string) => Promise<boolean> };

    const promise = haori.confirm('実行しますか？');
    const modalElement = document.querySelector<HTMLElement>('[data-haori-confirm="true"]');
    const titleElement = modalElement?.querySelector<HTMLElement>(
      '[data-haori-dialog-title="true"]',
    );

    expect(titleElement?.textContent).toBe('確認');
    expect(titleElement?.className).toContain('modal-title');
    const labelledById = modalElement?.getAttribute('aria-labelledby');
    expect(labelledById).toBeTruthy();
    expect(titleElement?.id).toBe(labelledById);

    const okButton = modalElement?.querySelector<HTMLButtonElement>(
      '[data-haori-confirm-ok="true"]',
    );
    okButton?.click();
    await promise;
  });

  // confirm でキャンセルボタンが false を返すこと。
  it('returns false when confirm cancel button is clicked', async () => {
    install();
    const haori = window.Haori as unknown as { confirm: (message: string) => Promise<boolean> };

    const promise = haori.confirm('Delete?');
    const modalElement = document.querySelector<HTMLElement>('[data-haori-confirm="true"]');
    const cancelButton = modalElement?.querySelector<HTMLButtonElement>(
      '[data-haori-confirm-cancel="true"]',
    );
    cancelButton?.click();

    await expect(promise).resolves.toBe(false);
  });

  // confirm でボタン操作なしに閉じられた場合 false を返すこと。
  it('returns false when confirm modal is dismissed without button click', async () => {
    install();
    const haori = window.Haori as unknown as { confirm: (message: string) => Promise<boolean> };

    const promise = haori.confirm('Delete?');
    const modalElement = document.querySelector<HTMLElement>('[data-haori-confirm="true"]');
    modalElement?.dispatchEvent(new Event('hidden.bs.modal'));

    await expect(promise).resolves.toBe(false);
  });

  // dialogContainerSelector で指定したコンテナに dialog を挿入すること。
  it('appends dialog to the element matching dialogContainerSelector', async () => {
    const container = document.createElement('div');
    container.id = 'dialog-root';
    document.body.appendChild(container);

    install({ dialogContainerSelector: '#dialog-root' });
    const haori = window.Haori as unknown as { dialog: (message: string) => Promise<void> };

    const promise = haori.dialog('Hello');
    const modalElement = container.querySelector('[data-haori-dialog="true"]');
    expect(modalElement).not.toBeNull();

    const okButton = modalElement?.querySelector<HTMLButtonElement>(
      '[data-haori-dialog-ok="true"]',
    );
    okButton?.click();
    await promise;
  });

  // フェードイン中に OK を押しても確認が閉じ、true を返すこと（報告 AI の回帰）。
  it('resolves true when confirm ok is clicked while the modal is fading in', async () => {
    install();
    const haori = window.Haori as unknown as { confirm: (message: string) => Promise<boolean> };

    const promise = haori.confirm('集約しますか。');
    const modalElement = document.querySelector<HTMLElement>('[data-haori-confirm="true"]');
    // 表示完了（shown.bs.modal）を待たずに押す。Bootstrap はこの間の hide() を無視する。
    modalElement?.querySelector<HTMLButtonElement>('[data-haori-confirm-ok="true"]')?.click();

    await expect(promise).resolves.toBe(true);
    expect(document.querySelector('[data-haori-confirm="true"]')).toBeNull();
  });

  // フェードイン中にキャンセルを押しても false で確定すること（報告 AI の回帰）。
  it('resolves false when confirm cancel is clicked while the modal is fading in', async () => {
    install();
    const haori = window.Haori as unknown as { confirm: (message: string) => Promise<boolean> };

    const promise = haori.confirm('集約しますか。');
    const modalElement = document.querySelector<HTMLElement>('[data-haori-confirm="true"]');
    modalElement?.querySelector<HTMLButtonElement>('[data-haori-confirm-cancel="true"]')?.click();

    await expect(promise).resolves.toBe(false);
  });

  // フェードイン中に続けて押された場合は先の操作で確定すること。
  it('keeps the first result when both buttons are clicked while fading in', async () => {
    install();
    const haori = window.Haori as unknown as { confirm: (message: string) => Promise<boolean> };

    const promise = haori.confirm('集約しますか。');
    const modalElement = document.querySelector<HTMLElement>('[data-haori-confirm="true"]');
    modalElement?.querySelector<HTMLButtonElement>('[data-haori-confirm-ok="true"]')?.click();
    modalElement?.querySelector<HTMLButtonElement>('[data-haori-confirm-cancel="true"]')?.click();

    await expect(promise).resolves.toBe(true);
  });

  // 情報ダイアログもフェードイン中の OK で閉じること（報告 AI の回帰）。
  it('closes the dialog when ok is clicked while the modal is fading in', async () => {
    install();
    const haori = window.Haori as unknown as { dialog: (message: string) => Promise<void> };

    const promise = haori.dialog('保存しました。');
    const modalElement = document.querySelector<HTMLElement>('[data-haori-dialog="true"]');
    modalElement?.querySelector<HTMLButtonElement>('[data-haori-dialog-ok="true"]')?.click();

    await promise;
    expect(document.querySelector('[data-haori-dialog="true"]')).toBeNull();
  });

  // 表示完了後に押した場合も従来どおり閉じること。
  it('closes the confirm when ok is clicked after the modal is shown', async () => {
    install();
    const haori = window.Haori as unknown as { confirm: (message: string) => Promise<boolean> };

    const promise = haori.confirm('集約しますか。');
    await waitForShown();
    const modalElement = document.querySelector<HTMLElement>('[data-haori-confirm="true"]');
    modalElement?.querySelector<HTMLButtonElement>('[data-haori-confirm-ok="true"]')?.click();

    await expect(promise).resolves.toBe(true);
  });

  // dialogOkLabel / dialogCancelLabel でボタン文言を差し替えられること（報告 AH）。
  it('uses the configured ok and cancel labels', async () => {
    install({ dialogOkLabel: '削除する', dialogCancelLabel: 'やめる' });
    const haori = window.Haori as unknown as { confirm: (message: string) => Promise<boolean> };

    const promise = haori.confirm('削除しますか。');
    const modalElement = document.querySelector<HTMLElement>('[data-haori-confirm="true"]');
    const okButton = modalElement?.querySelector<HTMLButtonElement>(
      '[data-haori-confirm-ok="true"]',
    );
    const cancelButton = modalElement?.querySelector<HTMLButtonElement>(
      '[data-haori-confirm-cancel="true"]',
    );

    // 識別属性は文言に関わらず維持される。
    expect(okButton?.textContent).toBe('削除する');
    expect(cancelButton?.textContent).toBe('やめる');

    okButton?.click();
    await promise;
  });

  // dialogOkLabel は情報ダイアログにも効くこと（報告 AH）。
  it('uses the configured ok label for the dialog', async () => {
    install({ dialogOkLabel: '閉じる' });
    const haori = window.Haori as unknown as { dialog: (message: string) => Promise<void> };

    const promise = haori.dialog('保存しました。');
    const okButton = document.querySelector<HTMLButtonElement>('[data-haori-dialog-ok="true"]');
    expect(okButton?.textContent).toBe('閉じる');

    okButton?.click();
    await promise;
  });

  // 文言を指定しない場合は英語の既定値のままであること（既存利用者の互換）。
  it('falls back to the English labels when no label is configured', async () => {
    install();
    const haori = window.Haori as unknown as { confirm: (message: string) => Promise<boolean> };

    const promise = haori.confirm('Delete?');
    const modalElement = document.querySelector<HTMLElement>('[data-haori-confirm="true"]');
    const okButton = modalElement?.querySelector<HTMLButtonElement>(
      '[data-haori-confirm-ok="true"]',
    );
    expect(okButton?.textContent).toBe('OK');
    expect(
      modalElement?.querySelector<HTMLButtonElement>('[data-haori-confirm-cancel="true"]')
        ?.textContent,
    ).toBe('Cancel');

    okButton?.click();
    await promise;
  });

  // 再 install 時もボタン文言が引き継がれること（報告 AH）。
  it('keeps the configured labels after reinstall without labels', async () => {
    install({ dialogOkLabel: '削除する', dialogCancelLabel: 'やめる' });
    install(); // 文言を省略して再適用
    const haori = window.Haori as unknown as { confirm: (message: string) => Promise<boolean> };

    const promise = haori.confirm('削除しますか。');
    const modalElement = document.querySelector<HTMLElement>('[data-haori-confirm="true"]');
    const okButton = modalElement?.querySelector<HTMLButtonElement>(
      '[data-haori-confirm-ok="true"]',
    );
    expect(okButton?.textContent).toBe('削除する');

    okButton?.click();
    await promise;
  });

  // 再 install 時も dialogContainerSelector が引き継がれること。
  it('keeps dialogContainerSelector after reinstall without selector', async () => {
    const container = document.createElement('div');
    container.id = 'dialog-root';
    document.body.appendChild(container);

    install({ dialogContainerSelector: '#dialog-root' });
    install(); // selector を省略して再適用

    const haori = window.Haori as unknown as { dialog: (message: string) => Promise<void> };

    const promise = haori.dialog('Hello');
    const modalElement = container.querySelector('[data-haori-dialog="true"]');
    expect(modalElement).not.toBeNull();

    const okButton = modalElement?.querySelector<HTMLButtonElement>(
      '[data-haori-dialog-ok="true"]',
    );
    okButton?.click();
    await promise;
  });
});
