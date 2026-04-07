import { beforeEach, describe, expect, it, vi } from 'vitest';

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
    window.bootstrap = { Modal: {}, Toast: {} };

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
