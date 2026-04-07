import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * window.Haori の差し替え前に使う簡易スタブを生成する。
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
 * 自動有効化テスト用の Bootstrap スタブを生成する。
 *
 * @return テスト用 Bootstrap スタブ。
 */
function createBootstrapStub() {
  class FakeModal {
    constructor(_element: Element) {}

    public static getOrCreateInstance(element: Element): FakeModal {
      return new FakeModal(element);
    }

    public show(): void {}

    public hide(): void {}
  }

  class FakeToast {
    constructor(_element: Element) {}

    public static getOrCreateInstance(element: Element): FakeToast {
      return new FakeToast(element);
    }

    public show(): void {}
  }

  return {
    Modal: FakeModal,
    Toast: FakeToast,
  };
}

describe('browser auto-enable', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    Reflect.deleteProperty(window, 'Haori');
    Reflect.deleteProperty(window, 'bootstrap');
    Reflect.deleteProperty(window, '__haoriJsBootstrapAutoEnabled__');
  });

  // 前提が揃うと import 時に自動有効化されること。
  it('auto-enables when Haori and Bootstrap are available', async () => {
    const originalHaori = createHaoriStub();
    window.Haori = originalHaori;
    window.bootstrap = createBootstrapStub();

    await import('../src/index');

    expect(window.Haori).not.toBe(originalHaori);
  });

  // Bootstrap がない場合は自動有効化を見送ること。
  it('skips auto-enable when Bootstrap is missing', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const originalHaori = createHaoriStub();
    window.Haori = originalHaori;

    await import('../src/index');

    expect(window.Haori).toBe(originalHaori);
    expect(warnSpy).toHaveBeenCalled();
  });
});
