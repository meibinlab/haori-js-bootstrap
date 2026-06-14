/**
 * 行 → 共有モーダルデモの補助スクリプト。
 *
 * 行から共有モーダルへの値の引き渡しはコアの宣言的属性（data-click-copy /
 * data-click-copy-params）が担うため、このスクリプトは CDN 読み込み状態の表示
 * （Haori.js のバージョン）だけを行う。
 */

const haoriVersionElement = document.querySelector("#haori-version");
const haori = window.Haori;

if (haoriVersionElement) {
  haoriVersionElement.textContent =
    typeof haori?.version === "string" ? haori.version : "loaded";
}
