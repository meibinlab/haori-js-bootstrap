import { beforeEach, describe, expect, it, vi } from 'vitest';

import { install, uninstall } from '../src/install';

/**
 * choice input 用 message テストの簡易 Haori スタブを生成する。
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

describe('message management for checkbox and radio', () => {
  beforeEach(() => {
    uninstall();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    window.Haori = createHaoriStub();
    Reflect.deleteProperty(window, 'bootstrap');
  });

  // checkbox では form-check 内の末尾へ invalid-feedback を追加すること。
  it('adds a managed message inside the form-check container for checkbox', async () => {
    install();

    const wrapper = document.createElement('div');
    wrapper.className = 'form-check';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'form-check-input';
    const label = document.createElement('label');
    label.className = 'form-check-label';
    label.textContent = 'Accept';
    wrapper.append(checkbox, label);
    document.body.appendChild(wrapper);

    const haori = window.Haori as unknown as {
      addErrorMessage: (target: HTMLElement, message: string) => Promise<void>;
      clearMessages: (target: HTMLElement) => Promise<void>;
    };

    await haori.addErrorMessage(checkbox, 'You must accept this.');

    const messageContainer = wrapper.querySelector<HTMLElement>(
      '[data-haori-bootstrap-message-container="true"]',
    );
    expect(messageContainer?.textContent).toContain('You must accept this.');
    expect(wrapper.lastElementChild).toBe(messageContainer);
    expect(checkbox.classList.contains('is-invalid')).toBe(true);

    await haori.clearMessages(checkbox);

    expect(wrapper.querySelector('[data-haori-bootstrap-message-container="true"]')).toBeNull();
    expect(checkbox.classList.contains('is-invalid')).toBe(false);
  });

  // radio でも form-check-inline の並びを壊さず末尾へメッセージを追加できること。
  it('adds a managed message at the end of an inline radio wrapper', async () => {
    install();

    const wrapper = document.createElement('div');
    wrapper.className = 'form-check form-check-inline';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.className = 'form-check-input';
    const label = document.createElement('label');
    label.className = 'form-check-label';
    label.textContent = 'Option A';
    wrapper.append(radio, label);
    document.body.appendChild(wrapper);

    const haori = window.Haori as unknown as {
      addErrorMessage: (target: HTMLElement, message: string) => Promise<void>;
    };

    await haori.addErrorMessage(radio, 'Select one option.');

    const messageContainer = wrapper.querySelector<HTMLElement>(
      '[data-haori-bootstrap-message-container="true"]',
    );
    expect(messageContainer?.textContent).toContain('Select one option.');
    expect(wrapper.lastElementChild).toBe(messageContainer);
    expect(radio.classList.contains('is-invalid')).toBe(true);
  });
});