type DemoHaori = {
  addErrorMessage: (target: HTMLElement, message: string) => Promise<void>;
  clearMessages: (parentOrTarget: HTMLElement) => Promise<void>;
};

const checkbox = document.querySelector<HTMLInputElement>('#terms-checkbox');
const radio = document.querySelector<HTMLInputElement>('#sample-radio-a');
const showCheckboxErrorButton = document.querySelector<HTMLButtonElement>('#show-checkbox-error');
const clearCheckboxErrorButton = document.querySelector<HTMLButtonElement>('#clear-checkbox-error');
const showRadioErrorButton = document.querySelector<HTMLButtonElement>('#show-radio-error');
const clearRadioErrorButton = document.querySelector<HTMLButtonElement>('#clear-radio-error');

const originalHaori: DemoHaori = {
  addErrorMessage: async () => undefined,
  clearMessages: async () => undefined,
};

window.Haori = originalHaori;

await import('../src/index');

const haori = window.Haori as unknown as DemoHaori;

showCheckboxErrorButton?.addEventListener('click', async () => {
  if (!checkbox) {
    return;
  }

  await haori.clearMessages(checkbox);
  await haori.addErrorMessage(checkbox, '利用規約への同意が必要です。');
});

clearCheckboxErrorButton?.addEventListener('click', async () => {
  if (!checkbox) {
    return;
  }

  await haori.clearMessages(checkbox);
});

showRadioErrorButton?.addEventListener('click', async () => {
  if (!radio) {
    return;
  }

  await haori.clearMessages(radio);
  await haori.addErrorMessage(radio, 'いずれかの選択肢を選んでください。');
});

clearRadioErrorButton?.addEventListener('click', async () => {
  if (!radio) {
    return;
  }

  await haori.clearMessages(radio);
});