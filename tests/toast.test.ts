import { beforeEach, describe, expect, it, vi } from 'vitest';

import { install, uninstall } from '../src/install';

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

  // toast がレベルに応じた Bootstrap class を付けて生成されること。
  it('renders a Bootstrap toast with the mapped level class', async () => {
    install();
    const haori = window.Haori as unknown as {
      toast: (message: string, level?: string) => Promise<void>;
    };

    await haori.toast('Saved', 'error');

    const toastElement = document.querySelector<HTMLElement>('[data-haori-bootstrap-toast="true"]');
    expect(toastElement?.textContent).toContain('Saved');
    expect(toastElement?.className).toContain('text-bg-danger');
  });
});
