const statusElement = document.querySelector("#status");
const haoriVersionElement = document.querySelector("#haori-version");
const dialogButton = document.querySelector("#show-dialog");
const confirmButton = document.querySelector("#show-confirm");
const toastInfoButton = document.querySelector("#show-toast-info");
const toastWarningButton = document.querySelector("#show-toast-warning");
const toastErrorButton = document.querySelector("#show-toast-error");
const openExistingDialogButton = document.querySelector("#open-existing-dialog");
const closeExistingDialogButton = document.querySelector("#close-existing-dialog");
const addMessageButton = document.querySelector("#add-message");
const clearMessageButton = document.querySelector("#clear-message");
const closeInsideDialogButton = document.querySelector("#close-inside-dialog");
const sampleInput = document.querySelector("#sample-input");
const existingDialog = document.querySelector("#existing-dialog");

const haori = window.Haori;
const haoriBootstrap = window.HaoriBootstrap;
const haoriBootstrapVersion =
  typeof haoriBootstrap?.version === "string" ? haoriBootstrap.version : null;
const isReady = Boolean(
  haoriBootstrap &&
    haoriBootstrapVersion === "0.1.0" &&
    typeof haoriBootstrap.isInstalled === "function" &&
    haoriBootstrap.isInstalled() &&
  haori &&
    typeof haori.dialog === "function" &&
    typeof haori.confirm === "function" &&
    typeof haori.toast === "function",
);

if (haoriVersionElement) {
  haoriVersionElement.textContent = typeof haori?.version === "string" ? haori.version : "loaded";
}

if (!isReady) {
  if (statusElement) {
    statusElement.textContent =
      "CDN 読み込みに失敗しました。haori-js-bootstrap の公開 IIFE 読み込みと自動有効化を確認してください。";
  }
} else if (statusElement) {
  statusElement.textContent =
    `CDN 版 Haori.js Bootstrap ${haoriBootstrapVersion} が有効です。公開済み配布物で動作確認できます。`;
}

dialogButton?.addEventListener("click", async () => {
  if (!isReady) {
    return;
  }

  await haori.dialog("CDN 版 dialog サンプルです。\n2行目も表示されます。");
});

confirmButton?.addEventListener("click", async () => {
  if (!isReady) {
    return;
  }

  const confirmed = await haori.confirm(
    "CDN 版 confirm の挙動を確認しますか。\nこの操作は表示確認のみです。",
  );
  if (statusElement) {
    statusElement.textContent = confirmed
      ? "confirm は true を返しました。"
      : "confirm は false を返しました。";
  }
});

toastInfoButton?.addEventListener("click", async () => {
  if (!isReady) {
    return;
  }

  await haori.toast("CDN 版 info toast を表示しました。\n2行目の通知です。", "info");
});

toastWarningButton?.addEventListener("click", async () => {
  if (!isReady) {
    return;
  }

  await haori.toast("CDN 版 warning toast を表示しました。\n確認が必要な通知です。", "warning");
});

toastErrorButton?.addEventListener("click", async () => {
  if (!isReady) {
    return;
  }

  await haori.toast("CDN 版 error toast を表示しました。\n対応が必要な通知です。", "error");
});

openExistingDialogButton?.addEventListener("click", async () => {
  if (!isReady || !existingDialog) {
    return;
  }

  await haori.openDialog(existingDialog);
});

closeExistingDialogButton?.addEventListener("click", async () => {
  if (!isReady || !existingDialog) {
    return;
  }

  await haori.closeDialog(existingDialog);
});

closeInsideDialogButton?.addEventListener("click", async () => {
  if (!isReady || !existingDialog) {
    return;
  }

  await haori.closeDialog(existingDialog);
});

addMessageButton?.addEventListener("click", async () => {
  if (!isReady || !sampleInput) {
    return;
  }

  await haori.clearMessages(sampleInput);
  await haori.addErrorMessage(sampleInput, "CDN 版で入力内容を確認してください。");
});

clearMessageButton?.addEventListener("click", async () => {
  if (!isReady || !sampleInput) {
    return;
  }

  await haori.clearMessages(sampleInput);
});