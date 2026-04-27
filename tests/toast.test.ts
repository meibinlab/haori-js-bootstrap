import { beforeEach, describe, expect, it, vi } from 'vitest';

import { install, uninstall } from '../src/install';

/**
 * toast テスト用の簡易 Haori スタブを生成する。
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
 * toast テスト用の Bootstrap Toast スタブを生成する。
 *
 * @return テスト用 Bootstrap スタブ。
 */
function createBootstrapStub() {
  class FakeToast {
    private readonly element: HTMLElement;

    constructor(element: Element) {
      this.element = element as HTMLElement;
    }

    public static getOrCreateInstance(element: Element): FakeToast {
      return new FakeToast(element);
    }

    public show(): void {
      this.element.dispatchEvent(new Event('shown.bs.toast'));
    }

    public dispose(): void {}
  }

  return {
    Toast: FakeToast,
  };
}

describe('toast', () => {
  beforeEach(() => {
    uninstall();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    window.Haori = createHaoriStub();
    window.bootstrap = createBootstrapStub();
  });

  // toast が右下へ表示され、白背景と左アクセント帯で改行付き message を描画すること。
  it('renders a Bootstrap toast at the bottom-right with normalized line breaks and an accent strip', async () => {
    install();
    const haori = window.Haori as unknown as {
      toast: (message: string, level?: string) => Promise<void>;
    };

    await haori.toast('Saved\\nPlease refresh the list.', 'error');

    const containerElement = document.querySelector<HTMLElement>(
      '[data-haori-bootstrap-toast-container="true"]',
    );
    const toastElement = document.querySelector<HTMLElement>('[data-haori-bootstrap-toast="true"]');
    const bodyElement = toastElement?.querySelector<HTMLElement>('.toast-body');
    const accentElement = toastElement?.querySelector<HTMLElement>(
      '[data-haori-bootstrap-toast-accent="true"]',
    );

    expect(containerElement?.className).toContain('bottom-0');
    expect(containerElement?.className).toContain('end-0');
    expect(bodyElement?.textContent).toBe('Saved\nPlease refresh the list.');
    expect(bodyElement?.style.whiteSpace).toBe('pre-line');
    expect(toastElement?.className).toContain('bg-body');
    expect(toastElement?.className).toContain('text-body');
    expect(accentElement?.className).toContain('bg-danger');
  });

  // toastPosition: 'top-end' で上端右寄りのクラスが付くこと。
  it('applies top-end position classes when toastPosition is top-end', async () => {
    install({ toastPosition: 'top-end' });
    const haori = window.Haori as unknown as {
      toast: (message: string) => Promise<void>;
    };

    await haori.toast('通知です。');

    const containerElement = document.querySelector<HTMLElement>(
      '[data-haori-bootstrap-toast-container="true"]',
    );
    expect(containerElement?.className).toContain('top-0');
    expect(containerElement?.className).toContain('end-0');
  });

  // toastPosition: 'top-start' で上端左寄りのクラスが付くこと。
  it('applies top-start position classes when toastPosition is top-start', async () => {
    install({ toastPosition: 'top-start' });
    const haori = window.Haori as unknown as {
      toast: (message: string) => Promise<void>;
    };

    await haori.toast('通知です。');

    const containerElement = document.querySelector<HTMLElement>(
      '[data-haori-bootstrap-toast-container="true"]',
    );
    expect(containerElement?.className).toContain('top-0');
    expect(containerElement?.className).toContain('start-0');
  });

  // install を呼び直すとコンテナの位置クラスが更新されること。
  it('updates container position classes when install is called again', async () => {
    install({ toastPosition: 'bottom-end' });
    const haori = window.Haori as unknown as {
      toast: (message: string) => Promise<void>;
    };

    await haori.toast('first');

    install({ toastPosition: 'top-start' });
    await haori.toast('second');

    const containerElement = document.querySelector<HTMLElement>(
      '[data-haori-bootstrap-toast-container="true"]',
    );
    expect(containerElement?.className).toContain('top-0');
    expect(containerElement?.className).toContain('start-0');
    expect(containerElement?.className).not.toContain('bottom-0');
    expect(containerElement?.className).not.toContain('end-0');
  });

  // toastPosition 未指定のとき bottom-end がデフォルト位置になること。
  it('defaults to bottom-end position when toastPosition is not set', async () => {
    install();
    const haori = window.Haori as unknown as {
      toast: (message: string) => Promise<void>;
    };

    await haori.toast('通知です。');

    const containerElement = document.querySelector<HTMLElement>(
      '[data-haori-bootstrap-toast-container="true"]',
    );
    expect(containerElement?.className).toContain('bottom-0');
    expect(containerElement?.className).toContain('end-0');
  });
});
