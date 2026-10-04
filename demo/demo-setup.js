/**
 * デモ用の簡易 Haori スタブを読み込み前に登録し、差し替え後の Haori を返す。
 *
 * @param {object} originalHaori 読み込み前に登録する簡易スタブ。
 * @return {Promise<object>} 差し替え後の Haori。
 */
export async function initializeDemoHaori(originalHaori) {
  window.Haori = originalHaori;
  await import("../dist/haori-bootstrap.js");
  return window.Haori;
}

/**
 * デモの準備（ボタンへの処理の登録）が終わったことを示す。
 *
 * <p>デモのスクリプトは配布物を動的に読み込んでから処理を登録するため、ページの
 * 読み込みが終わっても、しばらくはボタンを押しても何も起きない。E2E はこの印を
 * 待ってから操作する。
 *
 * @return {void} 戻り値はない。
 */
export function markDemoReady() {
  document.documentElement.dataset.demoReady = "true";
}
