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

  // success レベルで bg-success のアクセント帯が付くこと。
  it('applies bg-success accent for the success level', async () => {
    install();
    const haori = window.Haori as unknown as {
      toast: (message: string, level?: string) => Promise<void>;
    };

    await haori.toast('完了しました。', 'success');

    const accentElement = document.querySelector<HTMLElement>(
      '[data-haori-bootstrap-toast-accent="true"]',
    );
    expect(accentElement?.className).toContain('bg-success');
  });

  // warning レベルで bg-warning のアクセント帯が付くこと。
  it('applies bg-warning accent for the warning level', async () => {
    install();
    const haori = window.Haori as unknown as {
      toast: (message: string, level?: string) => Promise<void>;
    };

    await haori.toast('注意が必要です。', 'warning');

    const accentElement = document.querySelector<HTMLElement>(
      '[data-haori-bootstrap-toast-accent="true"]',
    );
    expect(accentElement?.className).toContain('bg-warning');
  });

  // level 未指定で bg-info のアクセント帯が付くこと。
  it('applies bg-info accent when level is omitted', async () => {
    install();
    const haori = window.Haori as unknown as {
      toast: (message: string, level?: string) => Promise<void>;
    };

    await haori.toast('お知らせです。');

    const accentElement = document.querySelector<HTMLElement>(
      '[data-haori-bootstrap-toast-accent="true"]',
    );
    expect(accentElement?.className).toContain('bg-info');
  });
});
