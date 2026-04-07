import { initializeDemoHaori } from './demo-setup';

type DemoHaori = {
  dialog: (message: string) => Promise<void>;
  confirm: (message: string) => Promise<boolean>;
  toast: (message: string, level?: string) => Promise<void>;
  openDialog: (target: HTMLElement) => Promise<void>;
  closeDialog: (target: HTMLElement) => Promise<void>;
  addErrorMessage: (target: HTMLElement, message: string) => Promise<void>;
  clearMessages: (parentOrTarget: HTMLElement) => Promise<void>;
};

const statusElement = document.querySelector<HTMLElement>('#status');
const dialogButton = document.querySelector<HTMLButtonElement>('#show-dialog');
const confirmButton = document.querySelector<HTMLButtonElement>('#show-confirm');
const toastButton = document.querySelector<HTMLButtonElement>('#show-toast');
const openExistingDialogButton = document.querySelector<HTMLButtonElement>('#open-existing-dialog');
const closeExistingDialogButton = document.querySelector<HTMLButtonElement>('#close-existing-dialog');
const addMessageButton = document.querySelector<HTMLButtonElement>('#add-message');
const clearMessageButton = document.querySelector<HTMLButtonElement>('#clear-message');
const closeInsideDialogButton = document.querySelector<HTMLButtonElement>('#close-inside-dialog');
const sampleInput = document.querySelector<HTMLInputElement>('#sample-input');
const existingDialog = document.querySelector<HTMLElement>('#existing-dialog');

const haori = await initializeDemoHaori<DemoHaori>({
  dialog: async () => undefined,
  confirm: async () => true,
  toast: async () => undefined,
  openDialog: async () => undefined,
  closeDialog: async () => undefined,
  addErrorMessage: async () => undefined,
  clearMessages: async () => undefined,
});

if (statusElement) {
  const facadeName = (window.Haori as { name?: string } | undefined)?.name ?? 'BootstrapHaori';
  statusElement.textContent = `${facadeName} が有効です。`;
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

openExistingDialogButton?.addEventListener('click', async () => {
  if (!existingDialog) {
    return;
  }

  await haori.openDialog(existingDialog);
});

closeExistingDialogButton?.addEventListener('click', async () => {
  if (!existingDialog) {
    return;
  }

  await haori.closeDialog(existingDialog);
});

closeInsideDialogButton?.addEventListener('click', async () => {
  if (!existingDialog) {
    return;
  }

  await haori.closeDialog(existingDialog);
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