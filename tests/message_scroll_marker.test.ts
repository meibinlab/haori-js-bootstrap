import { beforeEach, describe, expect, it, vi } from 'vitest';

import { install, uninstall } from '../src/install';

/**
 * エラーの印のテスト用の簡易 Haori スタブを生成する。
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

/** install 後に差し替わる表示 API。 */
type MessageApi = {
  addErrorMessage: (target: HTMLElement, message: string) => Promise<void>;
  addMessage: (target: HTMLElement, message: string, level?: string) => Promise<void>;
  clearMessages: (target: HTMLElement) => Promise<void>;
};

/**
 * 差し替わった表示 API を返す。
 *
 * @return 表示 API。
 */
function api(): MessageApi {
  return window.Haori as unknown as MessageApi;
}

// コアの `data-{event}-scroll-error` は `data-message-level="error"` の最初の要素へ
// スクロールする（コアの仕様「エラーハンドリング」の「表示を差し替えるライブラリは、
// エラーを表示した要素にこの属性を付けることでスクロール先になります」）。
// このパッケージは、全体エラーの枠と、is-invalid を付けた入力欄に付ける。
describe('scroll target marker for error messages', () => {
  beforeEach(() => {
    uninstall();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    window.Haori = createHaoriStub();
    Reflect.deleteProperty(window, 'bootstrap');
    install();
  });

  it('marks the alert placed at the top of a form', async () => {
    const form = document.createElement('form');
    document.body.appendChild(form);

    await api().addErrorMessage(form, '受け付けられません');

    const alert = form.firstElementChild as HTMLElement;
    expect(alert.classList.contains('alert-danger')).toBe(true);
    expect(alert.getAttribute('data-message-level')).toBe('error');
  });

  it('marks the alert placed right after a button', async () => {
    const button = document.createElement('button');
    document.body.appendChild(button);

    await api().addErrorMessage(button, '受け付けられません');

    const alert = button.nextElementSibling as HTMLElement;
    expect(alert.classList.contains('alert')).toBe(true);
    expect(alert.getAttribute('data-message-level')).toBe('error');
  });

  it('marks an invalid field and removes the marker on clear', async () => {
    const input = document.createElement('input');
    document.body.appendChild(input);

    await api().addErrorMessage(input, '必須です');
    expect(input.getAttribute('data-message-level')).toBe('error');

    await api().clearMessages(input);
    expect(input.hasAttribute('data-message-level')).toBe(false);
  });

  it('marks every radio of the group and removes the markers on clear', async () => {
    const group = document.createElement('div');
    group.innerHTML =
      '<div class="form-check"><input type="radio" name="t" value="a"></div>' +
      '<div class="form-check"><input type="radio" name="t" value="b"></div>';
    document.body.appendChild(group);
    const radios = Array.from(group.querySelectorAll('input'));

    await api().addErrorMessage(radios[0], '選んでください。');
    expect(radios.map((radio) => radio.getAttribute('data-message-level'))).toEqual([
      'error',
      'error',
    ]);

    await api().clearMessages(group);
    expect(radios.some((radio) => radio.hasAttribute('data-message-level'))).toBe(false);
  });

  it('marks a level alert only while it shows an error', async () => {
    const errorForm = document.createElement('form');
    document.body.appendChild(errorForm);
    await api().addMessage(errorForm, '受け付けられません', 'error');
    expect((errorForm.firstElementChild as HTMLElement).getAttribute('data-message-level')).toBe(
      'error',
    );

    const form = document.createElement('form');
    document.body.appendChild(form);

    await api().addMessage(form, '確認してください', 'warning');
    const alert = form.firstElementChild as HTMLElement;
    expect(alert.hasAttribute('data-message-level')).toBe(false);

    await api().addMessage(form, '受け付けられません', 'error');
    expect(alert.getAttribute('data-message-level')).toBe('error');

    await api().addMessage(form, 'お知らせ', 'info');
    expect(alert.hasAttribute('data-message-level')).toBe(false);
  });

  it('removes the marker when a field turns valid', async () => {
    const input = document.createElement('input');
    document.body.appendChild(input);

    await api().addMessage(input, '必須です', 'error');
    expect(input.getAttribute('data-message-level')).toBe('error');

    await api().addMessage(input, 'OK', 'success');
    expect(input.hasAttribute('data-message-level')).toBe(false);
  });
});
