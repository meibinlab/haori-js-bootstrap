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
function createBootstrapStub(onCreated?: (options: { delay?: number } | undefined) => void) {
  class FakeToast {
    private readonly element: HTMLElement;

    constructor(element: Element, options?: { delay?: number }) {
      this.element = element as HTMLElement;
      onCreated?.(options);
    }

    public static getOrCreateInstance(element: Element, options?: { delay?: number }): FakeToast {
      return new FakeToast(element, options);
    }

    public show(): void {
      this.element.dispatchEvent(new Event('shown.bs.toast'));
    }

    public hide(): void {
      this.element.dispatchEvent(new Event('hidden.bs.toast'));
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
    window.bootstrap = createBootstrapStub(undefined);
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

  // toastDelay を指定すると Bootstrap Toast コンストラクターに delay が渡ること。
  it('passes toastDelay to the Bootstrap Toast constructor', async () => {
    let capturedOptions: { delay?: number } | undefined;
    window.bootstrap = createBootstrapStub((opts) => {
      capturedOptions = opts;
    });
    install({ toastDelay: 10000 });
    const haori = window.Haori as unknown as {
      toast: (message: string) => Promise<void>;
    };

    await haori.toast('テスト');

    expect(capturedOptions).toEqual({ delay: 10000 });
  });

  // toastDelay 未指定の場合は options を渡さないこと。
  it('does not pass options when toastDelay is not set', async () => {
    let capturedOptions: { delay?: number } | undefined = { delay: 999 };
    window.bootstrap = createBootstrapStub((opts) => {
      capturedOptions = opts;
    });
    install();
    const haori = window.Haori as unknown as {
      toast: (message: string) => Promise<void>;
    };

    await haori.toast('テスト');

    expect(capturedOptions).toBeUndefined();
  });

  // toastContainerSelector で指定したコンテナに toast を挿入すること。
  it('appends toast container to the element matching toastContainerSelector', async () => {
    const root = document.createElement('div');
    root.id = 'toast-root';
    document.body.appendChild(root);

    install({ toastContainerSelector: '#toast-root' });
    const haori = window.Haori as unknown as {
      toast: (message: string, level?: string) => Promise<void>;
    };

    await haori.toast('Hello');

    const container = root.querySelector('[data-haori-bootstrap-toast-container="true"]');
    expect(container).not.toBeNull();
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

  // toast に dismiss ボタンが含まれること。
  it('includes a dismiss button in the toast', async () => {
    install();
    const haori = window.Haori as unknown as {
      toast: (message: string) => Promise<void>;
    };

    await haori.toast('通知です。');

    const toastElement = document.querySelector<HTMLElement>('[data-haori-bootstrap-toast="true"]');
    const dismissButton = toastElement?.querySelector<HTMLElement>(
      '[data-haori-bootstrap-toast-dismiss="true"]',
    );
    expect(dismissButton).not.toBeNull();
    expect(dismissButton?.getAttribute('aria-label')).toBe('Close');
  });

  // dismiss ボタンをクリックするとトーストが消えること。
  it('removes the toast when the dismiss button is clicked', async () => {
    install();
    const haori = window.Haori as unknown as {
      toast: (message: string) => Promise<void>;
    };

    await haori.toast('通知です。');

    const toastElement = document.querySelector<HTMLElement>('[data-haori-bootstrap-toast="true"]');
    const dismissButton = toastElement?.querySelector<HTMLButtonElement>(
      '[data-haori-bootstrap-toast-dismiss="true"]',
    );
    dismissButton?.click();

    expect(document.querySelector('[data-haori-bootstrap-toast="true"]')).toBeNull();
  });
});
