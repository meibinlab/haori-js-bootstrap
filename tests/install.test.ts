import { beforeEach, describe, expect, it, vi } from 'vitest';

import { install, isInstalled, uninstall } from '../src/install';

/**
 * install テスト用の簡易 Haori スタブを生成する。
 *
 * @return テスト用 Haori スタブ。
 */
function createHaoriStub() {
  return {
    runtime: 'embedded' as const,
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

  // コア API（Core / waitForRenders / version 等）が導入後も委譲されること。
  it('delegates core APIs (Core, waitForRenders, version) to the original Haori', () => {
    const core = { dumpScope: vi.fn(() => ({ resolved: {}, sources: {} })) };
    const waitForRenders = vi.fn().mockResolvedValue(undefined);
    const setBindingData = vi.fn();
    const originalHaori = {
      ...createHaoriStub(),
      Core: core,
      waitForRenders,
      setBindingData,
      version: '0.10.1',
    };
    window.Haori = originalHaori;

    install();

    // コア API は元実装へ委譲される。
    expect(window.Haori.Core).toBe(core);
    expect(window.Haori.waitForRenders).toBe(waitForRenders);
    expect(window.Haori.setBindingData).toBe(setBindingData);
    expect(window.Haori.version).toBe('0.10.1');
    expect('Core' in (window.Haori as object)).toBe(true);

    // 呼び出しても元実装が動く。
    (window.Haori.waitForRenders as () => Promise<void>)();
    expect(waitForRenders).toHaveBeenCalledTimes(1);
  });

  // UI 系メソッドは BootstrapHaori 側へ差し替わること（元実装は呼ばれない）。
  it('overrides UI methods with the bootstrap facade (not the original)', () => {
    const originalHaori = createHaoriStub();
    window.Haori = originalHaori;

    install();

    expect(window.Haori.dialog).not.toBe(originalHaori.dialog);
    expect(window.Haori.toast).not.toBe(originalHaori.toast);
    expect(window.Haori.openDialog).not.toBe(originalHaori.openDialog);
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

  // install → uninstall → install で runtime が汚染されないこと。
  it('restores original runtime on uninstall so reinstall does not inherit it', () => {
    const originalHaori = {
      runtime: undefined as 'embedded' | 'demo' | undefined,
      setRuntime: vi.fn((r: 'embedded' | 'demo') => {
        originalHaori.runtime = r;
      }),
      dialog: vi.fn(),
      confirm: vi.fn().mockResolvedValue(true),
      toast: vi.fn(),
      openDialog: vi.fn(),
      closeDialog: vi.fn(),
      addErrorMessage: vi.fn(),
      clearMessages: vi.fn(),
    };
    window.Haori = originalHaori;

    install({ runtime: 'demo' });
    expect(originalHaori.runtime).toBe('demo');

    // uninstall は setRuntime 経由で導入前の runtime（undefined）へ復元する。
    uninstall();
    expect(originalHaori.runtime).toBeUndefined();
    expect(originalHaori.setRuntime).toHaveBeenLastCalledWith(undefined);

    // 2 回目の install（runtime 未指定）は 'demo' を再適用しない。
    install();
    expect(originalHaori.runtime).toBeUndefined();
    expect(originalHaori.setRuntime).not.toHaveBeenLastCalledWith('demo');
  });

  // runtime が getter のみ（core Haori 相当）でも uninstall が例外なく復元できること。
  it('restores runtime via setRuntime when runtime is getter-only', () => {
    let internalRuntime: 'embedded' | 'demo' = 'embedded';
    const originalHaori = {
      // runtime は getter のみ（setter なし）。直接代入は TypeError になる。
      get runtime(): 'embedded' | 'demo' {
        return internalRuntime;
      },
      setRuntime: vi.fn((r: 'embedded' | 'demo') => {
        internalRuntime = r;
      }),
      dialog: vi.fn(),
      confirm: vi.fn().mockResolvedValue(true),
      toast: vi.fn(),
      openDialog: vi.fn(),
      closeDialog: vi.fn(),
      addErrorMessage: vi.fn(),
      clearMessages: vi.fn(),
    };
    window.Haori = originalHaori;

    install({ runtime: 'demo' });
    expect(internalRuntime).toBe('demo');

    expect(() => uninstall()).not.toThrow();
    // 導入前の runtime（'embedded'）へ復元される。
    expect(internalRuntime).toBe('embedded');
    expect(window.Haori).toBe(originalHaori);
  });
});
