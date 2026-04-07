import { initializeDemoHaori } from "./demo-setup.js";

const statusElement = document.querySelector("#status");
const dialogButton = document.querySelector("#show-dialog");
const confirmButton = document.querySelector("#show-confirm");
const toastButton = document.querySelector("#show-toast");
const openExistingDialogButton = document.querySelector(
  "#open-existing-dialog",
);
const closeExistingDialogButton = document.querySelector(
  "#close-existing-dialog",
);
const addMessageButton = document.querySelector("#add-message");
const clearMessageButton = document.querySelector("#clear-message");
const closeInsideDialogButton = document.querySelector("#close-inside-dialog");
const sampleInput = document.querySelector("#sample-input");
const existingDialog = document.querySelector("#existing-dialog");

const haori = await initializeDemoHaori({
  dialog: async () => undefined,
  confirm: async () => true,
  toast: async () => undefined,
  openDialog: async () => undefined,
  closeDialog: async () => undefined,
  addErrorMessage: async () => undefined,
  clearMessages: async () => undefined,
});

if (statusElement) {
  statusElement.textContent = "BootstrapHaori が有効です。";
}

dialogButton?.addEventListener("click", async () => {
  await haori.dialog("Haori.js Bootstrap の dialog サンプルです。");
});

confirmButton?.addEventListener("click", async () => {
  const confirmed = await haori.confirm("confirm の挙動を確認しますか。");
  if (statusElement) {
    statusElement.textContent = confirmed
      ? "confirm は true を返しました。"
      : "confirm は false を返しました。";
  }
});

toastButton?.addEventListener("click", async () => {
  await haori.toast("toast を表示しました。", "warning");
});

openExistingDialogButton?.addEventListener("click", async () => {
  if (!existingDialog) {
    return;
  }

  await haori.openDialog(existingDialog);
});

closeExistingDialogButton?.addEventListener("click", async () => {
  if (!existingDialog) {
    return;
  }

  await haori.closeDialog(existingDialog);
});

closeInsideDialogButton?.addEventListener("click", async () => {
  if (!existingDialog) {
    return;
  }

  await haori.closeDialog(existingDialog);
});

addMessageButton?.addEventListener("click", async () => {
  if (!sampleInput) {
    return;
  }

  await haori.clearMessages(sampleInput);
  await haori.addErrorMessage(sampleInput, "入力内容を確認してください。");
});

clearMessageButton?.addEventListener("click", async () => {
  if (!sampleInput) {
    return;
  }

  await haori.clearMessages(sampleInput);
});
