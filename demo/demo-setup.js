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
