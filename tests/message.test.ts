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
