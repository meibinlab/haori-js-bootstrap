import { initializeDemoHaori } from "./demo-setup.js";

const statusElement = document.querySelector("#procedure-status");

const haori = await initializeDemoHaori({
  dialog: async () => undefined,
  confirm: async () => true,
  toast: async () => undefined,
});

if (statusElement) {
  statusElement.textContent = "Procedure 互換の data-click-* モックが有効です。";
}

document.addEventListener("click", async (event) => {
  const button = event.target instanceof Element ? event.target.closest("button") : null;
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  if (button.dataset.clickDialogMessage) {
    await haori.dialog(button.dataset.clickDialogMessage);
    if (statusElement) {
      statusElement.textContent = "data-click-dialog を実行しました。";
    }
    return;
  }

  if (button.dataset.clickConfirmMessage) {
    const confirmed = await haori.confirm(button.dataset.clickConfirmMessage);
    if (statusElement) {
      statusElement.textContent = confirmed
        ? "data-click-confirm は true を返しました。"
        : "data-click-confirm は false を返しました。";
    }
    return;
  }

  if (button.dataset.clickToastMessage) {
    await haori.toast(button.dataset.clickToastMessage, "info");
    if (statusElement) {
      statusElement.textContent = "data-click-toast を実行しました。";
    }
  }
});