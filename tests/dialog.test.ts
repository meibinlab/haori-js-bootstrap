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

    constructor(element: Element) {
      this.element = element as HTMLElement;
    }

    public static getOrCreateInstance(element: Element): FakeModal {
      return new FakeModal(element);
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

describe('dialog and confirm', () => {
  beforeEach(() => {
    uninstall();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    window.Haori = createHaoriStub();
    window.bootstrap = createBootstrapStub();
  });

  // dialog が Bootstrap Modal を生成し、OK 操作で閉じること。
  it('renders a Bootstrap dialog and resolves after clicking ok', async () => {
    install();
    const haori = window.Haori as unknown as { dialog: (message: string) => Promise<void> };

    const promise = haori.dialog('Hello dialog');
    const modalElement = document.querySelector<HTMLElement>('[data-haori-bootstrap-dialog="true"]');
    expect(modalElement?.textContent).toContain('Hello dialog');

    const okButton = modalElement?.querySelector<HTMLButtonElement>(
      '[data-haori-bootstrap-action="ok"]',
    );
    okButton?.click();

    await promise;

    expect(document.querySelector('[data-haori-bootstrap-dialog="true"]')).toBeNull();
  });

  // confirm が OK 操作のみ true を返すこと。
  it('returns true when confirm is accepted', async () => {
    install();
    const haori = window.Haori as unknown as { confirm: (message: string) => Promise<boolean> };

    const promise = haori.confirm('Proceed?');
    const modalElement = document.querySelector<HTMLElement>('[data-haori-bootstrap-dialog="true"]');
    const okButton = modalElement?.querySelector<HTMLButtonElement>(
      '[data-haori-bootstrap-action="ok"]',
    );
    okButton?.click();

    await expect(promise).resolves.toBe(true);
  });
});
