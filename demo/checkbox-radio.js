import { initializeDemoHaori } from "./demo-setup.js";

const checkbox = document.querySelector("#terms-checkbox");
const radio = document.querySelector("#sample-radio-a");
const showCheckboxErrorButton = document.querySelector("#show-checkbox-error");
const clearCheckboxErrorButton = document.querySelector(
  "#clear-checkbox-error",
);
const showRadioErrorButton = document.querySelector("#show-radio-error");
const clearRadioErrorButton = document.querySelector("#clear-radio-error");

const haori = await initializeDemoHaori({
  addErrorMessage: async () => undefined,
  clearMessages: async () => undefined,
});

showCheckboxErrorButton?.addEventListener("click", async () => {
  if (!checkbox) {
    return;
  }

  await haori.clearMessages(checkbox);
  await haori.addErrorMessage(checkbox, "利用規約への同意が必要です。");
});

clearCheckboxErrorButton?.addEventListener("click", async () => {
  if (!checkbox) {
    return;
  }

  await haori.clearMessages(checkbox);
});

showRadioErrorButton?.addEventListener("click", async () => {
  if (!radio) {
    return;
  }

  await haori.clearMessages(radio);
  await haori.addErrorMessage(radio, "いずれかの選択肢を選んでください。");
});

clearRadioErrorButton?.addEventListener("click", async () => {
  if (!radio) {
    return;
  }

  await haori.clearMessages(radio);
});
