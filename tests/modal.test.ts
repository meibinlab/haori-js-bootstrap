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

function createBootstrapStub() {
  const instances = new WeakMap<Element, FakeModal>();

  class FakeModal {
    private readonly element: HTMLElement;

    constructor(element: Element) {
      this.element = element as HTMLElement;
    }

    public static getOrCreateInstance(element: Element): FakeModal {
      const existing = instances.get(element);
      if (existing) {
        return existing;
      }

      const created = new FakeModal(element);
      instances.set(element, created);
      return created;
    }

    public show(): void {
      this.element.dataset.state = 'shown';
    }

    public hide(): void {
      this.element.dataset.state = 'hidden';
    }
  }

  return {
    Modal: FakeModal,
  };
}

describe('openDialog and closeDialog', () => {
  beforeEach(() => {
    uninstall();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    window.Haori = createHaoriStub();
    window.bootstrap = createBootstrapStub();
  });

  // openDialog が既存要素を Modal として表示すること。
  it('opens an existing element as a Bootstrap modal', async () => {
    install();
    const element = document.createElement('div');
    document.body.appendChild(element);

    const haori = window.Haori as unknown as {
      openDialog: (target: HTMLElement) => Promise<void>;
    };

    await haori.openDialog(element);

    expect(element.classList.contains('modal')).toBe(true);
    expect(element.dataset.state).toBe('shown');
  });

  // closeDialog が同じ要素の Modal を閉じること。
  it('closes an existing Bootstrap modal element', async () => {
    install();
    const element = document.createElement('div');
    document.body.appendChild(element);

    const haori = window.Haori as unknown as {
      openDialog: (target: HTMLElement) => Promise<void>;
      closeDialog: (target: HTMLElement) => Promise<void>;
    };

    await haori.openDialog(element);
    await haori.closeDialog(element);

    expect(element.dataset.state).toBe('hidden');
  });
});
