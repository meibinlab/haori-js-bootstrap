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

    const container = section.querySelector('[data-haori-bootstrap-message-container="true"]');
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

    const container = section.querySelector('[data-haori-bootstrap-message-container="true"]');
    expect(container?.className).toContain('alert-info');
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
    expect(section.querySelector('[data-haori-bootstrap-message-container="true"]')).toBeNull();
  });
});
