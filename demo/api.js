import { initializeDemoHaori } from "./demo-setup.js";

const statusElement = document.querySelector("#status");
const dialogButton = document.querySelector("#show-dialog");
const confirmButton = document.querySelector("#show-confirm");
const toastInfoButton = document.querySelector("#show-toast-info");
const toastWarningButton = document.querySelector("#show-toast-warning");
const toastErrorButton = document.querySelector("#show-toast-error");
const toastSuccessButton = document.querySelector("#show-toast-success");
const toastShortDelayButton = document.querySelector("#show-toast-short-delay");
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
  await haori.dialog("Haori.js Bootstrap の dialog サンプルです。\\n2行目も表示されます。");
});

confirmButton?.addEventListener("click", async () => {
  const confirmed = await haori.confirm(
    "confirm の挙動を確認しますか。\\nこの操作はデモ用の表示確認です。",
  );
  if (statusElement) {
    statusElement.textContent = confirmed
      ? "confirm は true を返しました。"
      : "confirm は false を返しました。";
  }
});

toastInfoButton?.addEventListener("click", async () => {
  await haori.toast("info の toast を表示しました。\n2行目の通知です。", "info");
});

toastWarningButton?.addEventListener("click", async () => {
  await haori.toast("warning の toast を表示しました。\n確認が必要な通知です。", "warning");
});

toastErrorButton?.addEventListener("click", async () => {
  await haori.toast("error の toast を表示しました。\n対応が必要な通知です。", "error");
});

toastSuccessButton?.addEventListener("click", async () => {
  await haori.toast("success の toast を表示しました。\n処理が完了しました。", "success");
});

toastShortDelayButton?.addEventListener("click", async () => {
  const { install } = await import("../dist/haori-bootstrap.js");
  install({ toastDelay: 500 });
  await haori.toast("短時間 toast (500ms で消えます)", "info");
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
