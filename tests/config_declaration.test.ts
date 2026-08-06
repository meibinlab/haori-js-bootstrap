import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { readDeclaredInstallOptions } from '../src/config';
import { install, uninstall } from '../src/install';

/**
 * 宣言テスト用の簡易 Haori スタブを生成する。
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
 * 宣言テスト用の Bootstrap Modal スタブを生成する。
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

  return { Modal: FakeModal };
}

/**
 * 属性を宣言した `<script>` 要素を生成する。
 *
 * @param attributes 属性名と値の組。
 * @return 生成した `<script>` 要素。
 */
function createScript(attributes: Record<string, string>): HTMLScriptElement {
  const element = document.createElement('script');
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }
  return element;
}

describe('宣言による導入設定の読み取り', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-haori-dialog-ok-label');
    document.documentElement.removeAttribute('data-haori-dialog-cancel-label');
    document.body.removeAttribute('data-haori-dialog-ok-label');
    document.body.removeAttribute('data-haori-dialog-cancel-label');
  });

  // 自身の <script> タグの属性から読めること（要望 AM の第 1 希望）。
  it('reads the labels from its own script tag', () => {
    const script = createScript({
      'data-dialog-ok-label': 'OK',
      'data-dialog-cancel-label': 'キャンセル',
    });

    expect(readDeclaredInstallOptions(document, script)).toEqual({
      dialogOkLabel: 'OK',
      dialogCancelLabel: 'キャンセル',
    });
  });

  // <html> の属性から読めること（ESM 版で import する構成でも効く）。
  it('reads the labels from the html element', () => {
    document.documentElement.setAttribute('data-haori-dialog-ok-label', '閉じる');
    document.documentElement.setAttribute('data-haori-dialog-cancel-label', 'やめる');

    expect(readDeclaredInstallOptions(document, null)).toEqual({
      dialogOkLabel: '閉じる',
      dialogCancelLabel: 'やめる',
    });
  });

  // <body> の属性からも読めること。
  it('reads the labels from the body element', () => {
    document.body.setAttribute('data-haori-dialog-ok-label', '進む');

    expect(readDeclaredInstallOptions(document, null)).toEqual({ dialogOkLabel: '進む' });
  });

  // 優先順位が script タグ > html > body であること。
  it('prefers the script tag, then html, then body', () => {
    const script = createScript({ 'data-dialog-ok-label': 'スクリプト' });
    document.documentElement.setAttribute('data-haori-dialog-ok-label', 'html');
    document.documentElement.setAttribute('data-haori-dialog-cancel-label', 'html キャンセル');
    document.body.setAttribute('data-haori-dialog-ok-label', 'body');
    document.body.setAttribute('data-haori-dialog-cancel-label', 'body キャンセル');

    expect(readDeclaredInstallOptions(document, script)).toEqual({
      dialogOkLabel: 'スクリプト',
      dialogCancelLabel: 'html キャンセル',
    });
  });

  // 空文字は未指定として扱うこと（文言の無いボタンを作らないため）。
  it('treats a blank value as unspecified', () => {
    const script = createScript({
      'data-dialog-ok-label': '   ',
      'data-dialog-cancel-label': '',
    });

    expect(readDeclaredInstallOptions(document, script)).toEqual({});
  });

  // 宣言が無ければ何も返さないこと。
  it('returns nothing when no declaration exists', () => {
    expect(readDeclaredInstallOptions(document, null)).toEqual({});
  });
});

describe('宣言による導入設定の適用', () => {
  beforeEach(() => {
    uninstall();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    window.Haori = createHaoriStub();
    window.bootstrap = createBootstrapStub();
  });

  afterEach(() => {
    uninstall();
    document.documentElement.removeAttribute('data-haori-dialog-ok-label');
    document.documentElement.removeAttribute('data-haori-dialog-cancel-label');
  });

  /**
   * confirm を開き、ボタンの文言を返す。
   *
   * @return OK ボタンとキャンセルボタンの文言。
   */
  async function openConfirmLabels(): Promise<{ ok?: string; cancel?: string }> {
    const haori = window.Haori as unknown as { confirm: (message: string) => Promise<boolean> };
    const promise = haori.confirm('削除しますか。');
    const modalElement = document.querySelector<HTMLElement>('[data-haori-confirm="true"]');
    const okButton = modalElement?.querySelector<HTMLButtonElement>(
      '[data-haori-confirm-ok="true"]',
    );
    const labels = {
      ok: okButton?.textContent ?? undefined,
      cancel:
        modalElement?.querySelector<HTMLButtonElement>('[data-haori-confirm-cancel="true"]')
          ?.textContent ?? undefined,
    };
    okButton?.click();
    await promise;
    return labels;
  }

  // 宣言だけで（install の引数なしで）文言が変わること。
  it('applies the declared labels without any install argument', async () => {
    document.documentElement.setAttribute('data-haori-dialog-ok-label', 'OK');
    document.documentElement.setAttribute('data-haori-dialog-cancel-label', 'キャンセル');

    install();

    await expect(openConfirmLabels()).resolves.toEqual({
      ok: 'OK',
      cancel: 'キャンセル',
    });
  });

  // install の引数は宣言より優先されること。
  it('lets an explicit install argument win over the declaration', async () => {
    document.documentElement.setAttribute('data-haori-dialog-ok-label', 'OK');
    document.documentElement.setAttribute('data-haori-dialog-cancel-label', 'キャンセル');

    install({ dialogOkLabel: '削除する' });

    // 明示した方だけが上書きされ、宣言した方は残る。
    await expect(openConfirmLabels()).resolves.toEqual({
      ok: '削除する',
      cancel: 'キャンセル',
    });
  });

  // 文言を省略した再 install で、宣言が以前の指定を上書きしないこと。
  it('keeps a previously configured label over the declaration on reinstall', async () => {
    document.documentElement.setAttribute('data-haori-dialog-ok-label', 'OK');

    install({ dialogOkLabel: '削除する' });
    install(); // 文言を省略して再適用

    await expect(openConfirmLabels()).resolves.toEqual({
      ok: '削除する',
      cancel: 'Cancel',
    });
  });

  // 宣言が無ければ英語の既定値のままであること（既存利用者の互換）。
  it('keeps the English defaults when nothing is declared', async () => {
    install();

    await expect(openConfirmLabels()).resolves.toEqual({
      ok: 'OK',
      cancel: 'Cancel',
    });
  });
});
