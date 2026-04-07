type DemoHaori = {
  dialog: (message: string) => Promise<void>;
  confirm: (message: string) => Promise<boolean>;
  toast: (message: string, level?: string) => Promise<void>;
  addErrorMessage: (target: HTMLElement, message: string) => Promise<void>;
  clearMessages: (parentOrTarget: HTMLElement) => Promise<void>;
};

const statusElement = document.querySelector<HTMLElement>('#status');
const dialogButton = document.querySelector<HTMLButtonElement>('#show-dialog');
const confirmButton = document.querySelector<HTMLButtonElement>('#show-confirm');
const toastButton = document.querySelector<HTMLButtonElement>('#show-toast');
const addMessageButton = document.querySelector<HTMLButtonElement>('#add-message');
const clearMessageButton = document.querySelector<HTMLButtonElement>('#clear-message');
const sampleInput = document.querySelector<HTMLInputElement>('#sample-input');

const originalHaori: DemoHaori = {
  dialog: async () => undefined,
  confirm: async () => true,
  toast: async () => undefined,
  addErrorMessage: async () => undefined,
  clearMessages: async () => undefined,
};

window.Haori = originalHaori;

await import('../src/index');

const haori = window.Haori as unknown as DemoHaori;

if (statusElement) {
  const facadeName = (window.Haori as { name?: string } | undefined)?.name ?? 'BootstrapHaori';
  statusElement.textContent =
    window.Haori === originalHaori
      ? '自動有効化は見送られました。'
      : `${facadeName} が有効です。`;
}

dialogButton?.addEventListener('click', async () => {
  await haori.dialog('Haori.js Bootstrap の dialog サンプルです。');
});

confirmButton?.addEventListener('click', async () => {
  const confirmed = await haori.confirm('confirm の挙動を確認しますか。');
  if (statusElement) {
    statusElement.textContent = confirmed ? 'confirm は true を返しました。' : 'confirm は false を返しました。';
  }
});

toastButton?.addEventListener('click', async () => {
  await haori.toast('toast を表示しました。', 'warning');
});

addMessageButton?.addEventListener('click', async () => {
  if (!sampleInput) {
    return;
  }

  await haori.clearMessages(sampleInput);
  await haori.addErrorMessage(sampleInput, '入力内容を確認してください。');
});

clearMessageButton?.addEventListener('click', async () => {
  if (!sampleInput) {
    return;
  }

  await haori.clearMessages(sampleInput);
});
