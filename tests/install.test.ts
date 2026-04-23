import { beforeEach, describe, expect, it, vi } from 'vitest';

import { install, isInstalled, uninstall } from '../src/install';

/**
 * install テスト用の簡易 Haori スタブを生成する。
 *
 * @return テスト用 Haori スタブ。
 */
function createHaoriStub() {
  return {
    runtime: 'embedded',
    setRuntime: vi.fn(),
    dialog: vi.fn(),
    confirm: vi.fn().mockResolvedValue(true),
    toast: vi.fn(),
    openDialog: vi.fn(),
    closeDialog: vi.fn(),
    addErrorMessage: vi.fn(),
    clearMessages: vi.fn(),
  };
}

describe('install', () => {
  beforeEach(() => {
    uninstall();
    vi.restoreAllMocks();
    Reflect.deleteProperty(window, 'Haori');
    Reflect.deleteProperty(window, 'bootstrap');
  });

  // window.Haori が BootstrapHaori に差し替わること。
  it('replaces window.Haori with the bootstrap facade', () => {
    const originalHaori = createHaoriStub();
    window.Haori = originalHaori;

    install();

    expect(window.Haori).not.toBe(originalHaori);
    expect(isInstalled()).toBe(true);
  });

  // uninstall で元の Haori 実装へ戻せること。
  it('restores the original Haori implementation', () => {
    const originalHaori = createHaoriStub();
    window.Haori = originalHaori;

    install();
    uninstall();

    expect(window.Haori).toBe(originalHaori);
    expect(isInstalled()).toBe(false);
  });

  it('applies runtime when provided', () => {
    const originalHaori = createHaoriStub();
    window.Haori = originalHaori;

    install({ runtime: 'demo' });

    expect(originalHaori.setRuntime).toHaveBeenCalledWith('demo');
  });

  it('keeps the previous runtime on reinstall when runtime is omitted', () => {
    const originalHaori = createHaoriStub();
    window.Haori = originalHaori;

    install({ runtime: 'demo' });
    install();

    expect(originalHaori.setRuntime).toHaveBeenLastCalledWith('demo');
  });
});
