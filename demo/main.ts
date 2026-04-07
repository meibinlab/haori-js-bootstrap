const statusElement = document.querySelector<HTMLElement>('#status');

const originalHaori = {
  dialog: async () => undefined,
  confirm: async () => true,
  toast: async () => undefined,
  openDialog: async () => undefined,
  closeDialog: async () => undefined,
  addErrorMessage: async () => undefined,
  clearMessages: async () => undefined,
};

window.Haori = originalHaori;
window.bootstrap = {
  Modal: {},
  Toast: {},
};

await import('../src/index');

if (statusElement) {
  const facadeName = (window.Haori as { name?: string } | undefined)?.name ?? 'BootstrapHaori';
  statusElement.textContent =
    window.Haori === originalHaori
      ? '自動有効化は見送られました。'
      : `${facadeName} が有効です。`;
}
