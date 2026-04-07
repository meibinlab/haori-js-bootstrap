/**
 * デモ用の簡易 Haori スタブを読み込み前に登録し、差し替え後の Haori を返す。
 *
 * @param originalHaori 読み込み前に登録する簡易スタブ。
 * @return 差し替え後の Haori。
 */
export async function initializeDemoHaori<T extends object>(originalHaori: T): Promise<T> {
  window.Haori = originalHaori;
  await import('../src/index');
  return window.Haori as T;
}