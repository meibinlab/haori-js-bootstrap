import { beforeEach, describe, expect, it, vi } from 'vitest';

import { install, uninstall } from '../src/install';

/**
 * message テスト用の簡易 Haori スタブを生成する。
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

describe('message management', () => {
  beforeEach(() => {
    uninstall();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    window.Haori = createHaoriStub();
    Reflect.deleteProperty(window, 'bootstrap');
  });

  // field target に invalid-feedback を追加し、clear で除去できること。
  it('adds and clears owned field messages', async () => {
    install();
    const input = document.createElement('input');
    document.body.appendChild(input);

    const haori = window.Haori as unknown as {
      addErrorMessage: (target: HTMLElement, message: string) => Promise<void>;
      clearMessages: (target: HTMLElement) => Promise<void>;
    };

    await haori.addErrorMessage(input, 'Required');

    expect(input.classList.contains('is-invalid')).toBe(true);
    expect(input.nextElementSibling?.textContent).toContain('Required');

    await haori.clearMessages(input);

    expect(input.classList.contains('is-invalid')).toBe(false);
    expect(input.nextElementSibling).toBeNull();
  });

  // addMessage('success') で is-valid と valid-feedback が付くこと。
  it('adds is-valid and valid-feedback for success level', async () => {
    install();
    const input = document.createElement('input');
    document.body.appendChild(input);

    const haori = window.Haori as unknown as {
      addMessage: (target: HTMLElement, message: string, level?: string) => Promise<void>;
      clearMessages: (target: HTMLElement) => Promise<void>;
    };

    await haori.addMessage(input, '入力が正しいです。', 'success');

    expect(input.classList.contains('is-valid')).toBe(true);
    const feedback = input.nextElementSibling;
    expect(feedback?.className).toContain('valid-feedback');
    expect(feedback?.textContent).toContain('入力が正しいです。');
  });

  // clearMessages で is-valid も除去されること。
  it('clears is-valid state when clearMessages is called', async () => {
    install();
    const input = document.createElement('input');
    document.body.appendChild(input);

    const haori = window.Haori as unknown as {
      addMessage: (target: HTMLElement, message: string, level?: string) => Promise<void>;
      clearMessages: (target: HTMLElement) => Promise<void>;
    };

    await haori.addMessage(input, '入力が正しいです。', 'success');
    await haori.clearMessages(input);

    expect(input.classList.contains('is-valid')).toBe(false);
    expect(input.nextElementSibling).toBeNull();
  });

  // addMessage('warning') でブロックコンテナに alert-warning が付くこと。
  it('adds alert-warning block container for warning level', async () => {
    install();
    const section = document.createElement('section');
    document.body.appendChild(section);

    const haori = window.Haori as unknown as {
      addMessage: (target: HTMLElement, message: string, level?: string) => Promise<void>;
    };

    await haori.addMessage(section, '注意が必要です。', 'warning');

    const container = section.querySelector('[data-haori-message-container="true"]');
    expect(container?.className).toContain('alert-warning');
    expect(container?.textContent).toContain('注意が必要です。');
  });

  // addMessage('info') でブロックコンテナに alert-info が付くこと。
  it('adds alert-info block container for info level', async () => {
    install();
    const section = document.createElement('section');
    document.body.appendChild(section);

    const haori = window.Haori as unknown as {
      addMessage: (target: HTMLElement, message: string, level?: string) => Promise<void>;
    };

    await haori.addMessage(section, 'お知らせです。', 'info');

    const container = section.querySelector('[data-haori-message-container="true"]');
    expect(container?.className).toContain('alert-info');
  });

  // addMessage を error → success に切り替えると container と状態クラスが更新されること。
  it('updates container class and state when level switches from error to success', async () => {
    install();
    const input = document.createElement('input');
    document.body.appendChild(input);

    const haori = window.Haori as unknown as {
      addMessage: (target: HTMLElement, message: string, level?: string) => Promise<void>;
    };

    await haori.addMessage(input, 'エラーです。', 'error');
    expect(input.classList.contains('is-invalid')).toBe(true);
    expect(input.nextElementSibling?.className).toContain('invalid-feedback');

    await haori.addMessage(input, '正しいです。', 'success');
    expect(input.classList.contains('is-invalid')).toBe(false);
    expect(input.classList.contains('is-valid')).toBe(true);
    expect(input.nextElementSibling?.className).toContain('valid-feedback');
    expect(input.nextElementSibling?.className).not.toContain('invalid-feedback');
  });

  // addMessage を success → error に切り替えると container と状態クラスが更新されること。
  it('updates container class and state when level switches from success to error', async () => {
    install();
    const input = document.createElement('input');
    document.body.appendChild(input);

    const haori = window.Haori as unknown as {
      addMessage: (target: HTMLElement, message: string, level?: string) => Promise<void>;
    };

    await haori.addMessage(input, '正しいです。', 'success');
    expect(input.classList.contains('is-valid')).toBe(true);

    await haori.addMessage(input, 'エラーです。', 'error');
    expect(input.classList.contains('is-valid')).toBe(false);
    expect(input.classList.contains('is-invalid')).toBe(true);
    expect(input.nextElementSibling?.className).toBe('invalid-feedback d-block');
  });

  // block コンテナで level を切り替えると alert クラスが更新されること。
  it('updates block container alert class when level switches', async () => {
    install();
    const section = document.createElement('section');
    document.body.appendChild(section);

    const haori = window.Haori as unknown as {
      addMessage: (target: HTMLElement, message: string, level?: string) => Promise<void>;
    };

    await haori.addMessage(section, 'エラー', 'error');
    const container = section.querySelector('[data-haori-message-container="true"]');
    expect(container?.className).toContain('alert-danger');

    await haori.addMessage(section, '成功', 'success');
    expect(container?.className).toContain('alert-success');
    expect(container?.className).not.toContain('alert-danger');
  });

  // success → warning に切り替えると is-valid が外れること。
  it('clears is-valid when switching from success to warning', async () => {
    install();
    const input = document.createElement('input');
    document.body.appendChild(input);

    const haori = window.Haori as unknown as {
      addMessage: (target: HTMLElement, message: string, level?: string) => Promise<void>;
    };

    await haori.addMessage(input, '正しいです。', 'success');
    expect(input.classList.contains('is-valid')).toBe(true);

    await haori.addMessage(input, '注意が必要です。', 'warning');
    expect(input.classList.contains('is-valid')).toBe(false);
    expect(input.classList.contains('is-invalid')).toBe(false);
  });

  // success → info に切り替えると is-valid が外れること。
  it('clears is-valid when switching from success to info', async () => {
    install();
    const input = document.createElement('input');
    document.body.appendChild(input);

    const haori = window.Haori as unknown as {
      addMessage: (target: HTMLElement, message: string, level?: string) => Promise<void>;
    };

    await haori.addMessage(input, '正しいです。', 'success');
    expect(input.classList.contains('is-valid')).toBe(true);

    await haori.addMessage(input, 'お知らせです。', 'info');
    expect(input.classList.contains('is-valid')).toBe(false);
    expect(input.classList.contains('is-invalid')).toBe(false);
  });

  // 自前のメッセージは clearMessages の削除対象に含まれないこと。
  it('does not remove user-managed nodes', async () => {
    install();
    const section = document.createElement('section');
    const preserved = document.createElement('div');
    preserved.textContent = 'keep';
    section.appendChild(preserved);
    document.body.appendChild(section);

    const haori = window.Haori as unknown as {
      addErrorMessage: (target: HTMLElement, message: string) => Promise<void>;
      clearMessages: (target: HTMLElement) => Promise<void>;
    };

    await haori.addErrorMessage(section, 'Error');
    await haori.clearMessages(section);

    expect(section.textContent).toContain('keep');
    expect(section.querySelector('[data-haori-message-container="true"]')).toBeNull();
  });

  describe('elements that must not contain the alert', () => {
    /** テストで使う Haori のメッセージ API。 */
    type MessageApi = {
      addErrorMessage: (target: HTMLElement, message: string) => Promise<void>;
      addMessage: (target: HTMLElement, message: string, level?: string) => Promise<void>;
      clearMessages: (target: HTMLElement) => Promise<void>;
    };

    /**
     * 親要素へ子要素を足して返す。
     *
     * @param html 親要素の中身。
     * @return 親要素。
     */
    function mount(html: string): HTMLElement {
      const parent = document.createElement('div');
      parent.innerHTML = html;
      document.body.appendChild(parent);
      return parent;
    }

    // button の中ではなく直後に alert を置くこと。
    it('places the alert right after a button', async () => {
      // 仕様「11.4 メッセージ DOM 所有権」の「target が button、a、または子要素を
      // 持てない要素（img、hr などの HTML の空要素）の場合は、target の直後に
      // alert-danger 互換の所有コンテナを生成する」。
      install();
      const parent = mount('<button id="export" type="button">CSVエクスポート</button>');
      const button = parent.querySelector('#export') as HTMLElement;
      const haori = window.Haori as unknown as MessageApi;

      await haori.addErrorMessage(button, '出力できませんでした');

      expect(button.querySelector('[data-haori-message-container="true"]')).toBeNull();
      expect(button.textContent).toBe('CSVエクスポート');
      const container = button.nextElementSibling as HTMLElement;
      expect(container.getAttribute('data-haori-message-container')).toBe('true');
      expect(container.className).toContain('alert-danger');
      expect(container.textContent).toBe('出力できませんでした');
    });

    // a と空要素も直後に置き、レベル付きの追加でも同じであること。
    it('places the level-aware alert right after a link and a void element', async () => {
      // 仕様「11.4 メッセージ DOM 所有権」の「target が button、a、または子要素を
      // 持てない要素（img、hr などの HTML の空要素）の場合は、target の直後に
      // alert-danger 互換の所有コンテナを生成する」。addMessage も同じ所有コンテナを使う。
      install();
      const parent = mount('<a id="link" href="#">削除</a><img id="icon" alt="">');
      const link = parent.querySelector('#link') as HTMLElement;
      const icon = parent.querySelector('#icon') as HTMLElement;
      const haori = window.Haori as unknown as MessageApi;

      await haori.addMessage(link, '注意', 'warning');
      await haori.addErrorMessage(icon, '失敗');

      expect(link.children).toHaveLength(0);
      expect(link.nextElementSibling?.className).toContain('alert-warning');
      expect(link.nextElementSibling?.textContent).toBe('注意');
      expect(icon.nextElementSibling?.className).toContain('alert-danger');
      expect(icon.nextElementSibling?.textContent).toBe('失敗');
    });

    // HTML の空要素はどれも直後に置くこと。
    it.each(['area', 'br', 'col', 'embed', 'hr', 'img', 'source', 'track', 'wbr'])(
      'places the alert right after a void <%s> element',
      async (tagName) => {
        // 仕様「11.4 メッセージ DOM 所有権」の「子要素を持てない要素（img、hr などの
        // HTML の空要素）の場合は、target の直後に alert-danger 互換の所有コンテナを
        // 生成する」。
        install();
        const parent = mount('');
        const element = document.createElement(tagName);
        parent.appendChild(element);
        const haori = window.Haori as unknown as MessageApi;

        await haori.addErrorMessage(element, '失敗');

        expect(element.children).toHaveLength(0);
        expect(element.nextElementSibling?.getAttribute('data-haori-message-container')).toBe(
          'true',
        );
      },
    );

    // 同じボタンへの追加は直後の所有コンテナを再利用すること。
    it('reuses the alert placed after the button', async () => {
      // 仕様「11.4 メッセージ DOM 所有権」の「addErrorMessage は target ごとに 1 つの
      // 所有コンテナを再利用し、同一 target に対して不要なノード増殖を防ぐ」。
      install();
      const parent = mount('<button id="export" type="button">出力</button>');
      const button = parent.querySelector('#export') as HTMLElement;
      const haori = window.Haori as unknown as MessageApi;

      await haori.addErrorMessage(button, '1 件目');
      await haori.addMessage(button, '2 件目', 'error');

      expect(parent.querySelectorAll('[data-haori-message-container="true"]')).toHaveLength(1);
      expect(button.nextElementSibling?.textContent).toBe('1 件目2 件目');
    });

    // clearMessages(button) で直後の所有コンテナを消すこと。
    it('clears the alert placed after the button', async () => {
      // 仕様「11.4 メッセージ DOM 所有権」の「引数自身が button、a、または子要素を
      // 持てない要素の場合も、配下探索に加えて、その要素直後の所有コンテナを削除対象に
      // 含める」。
      install();
      const parent = mount('<button id="export" type="button">出力</button><p>説明</p>');
      const button = parent.querySelector('#export') as HTMLElement;
      const haori = window.Haori as unknown as MessageApi;

      await haori.addErrorMessage(button, '失敗');
      await haori.clearMessages(button);

      expect(parent.querySelector('[data-haori-message-container="true"]')).toBeNull();
      expect(button.nextElementSibling?.tagName).toBe('P');
    });
  });
});
