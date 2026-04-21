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

  // radio では group 単位の末尾へメッセージを追加し、グループ全体へ invalid 状態を付けること。
  it('adds a managed message at the end of the radio group container', async () => {
    install();

    const group = document.createElement('div');
    group.className = 'd-flex flex-wrap gap-3';

    const wrapper = document.createElement('div');
    wrapper.className = 'form-check form-check-inline';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'sample';
    radio.className = 'form-check-input';
    const label = document.createElement('label');
    label.className = 'form-check-label';
    label.textContent = 'Option A';
    wrapper.append(radio, label);

    const wrapperB = document.createElement('div');
    wrapperB.className = 'form-check form-check-inline';
    const radioB = document.createElement('input');
    radioB.type = 'radio';
    radioB.name = 'sample';
    radioB.className = 'form-check-input';
    const labelB = document.createElement('label');
    labelB.className = 'form-check-label';
    labelB.textContent = 'Option B';
    wrapperB.append(radioB, labelB);

    group.append(wrapper, wrapperB);
    document.body.appendChild(group);

    const haori = window.Haori as unknown as {
      addErrorMessage: (target: HTMLElement, message: string) => Promise<void>;
      clearMessages: (target: HTMLElement) => Promise<void>;
    };

    await haori.addErrorMessage(radio, 'Select one option.');

    const messageContainer = group.querySelector<HTMLElement>(
      '[data-haori-bootstrap-message-container="true"]',
    );
    expect(messageContainer?.textContent).toContain('Select one option.');
    expect(group.lastElementChild).toBe(messageContainer);
    expect(radio.classList.contains('is-invalid')).toBe(true);
    expect(radioB.classList.contains('is-invalid')).toBe(true);

    await haori.clearMessages(radio);

    expect(group.querySelector('[data-haori-bootstrap-message-container="true"]')).toBeNull();
    expect(radio.classList.contains('is-invalid')).toBe(false);
    expect(radioB.classList.contains('is-invalid')).toBe(false);
  });
});