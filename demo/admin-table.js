/**
 * 管理画面デモの補助スクリプト。
 *
 * いま画面に見えている行の範囲をフッタ（先頭 - 末尾）に表示する。行データの取得・
 * 描画・無限スクロールはすべて Haori の宣言的属性（data-each / data-intersect-*）が
 * 担っており、このスクリプトは可視行範囲の表示更新だけを担当する。
 *
 * スクロールを滑らかに保つため、可視判定は IntersectionObserver に任せ、スクロールの
 * たびに getBoundingClientRect でレイアウトを測り直すことはしない（毎フレームの強制
 * レイアウトがスクロールのカクつきの原因になるため）。
 */

const scrollContainer = document.querySelector(".table-scroll");
const tableBody = scrollContainer
  ? scrollContainer.querySelector("tbody")
  : null;
const rangeOutput = document.querySelector("#visible-range");

/** いま可視帯に入っている行番号（1 始まり）の集合。 */
const visibleRows = new Set();

/** 行を監視する IntersectionObserver。行の追加時に貼り直す。 */
let observer = null;

/**
 * 可視集合から先頭・末尾の行番号を求めてフッタへ反映する。
 *
 * @return {void} 戻り値はない。
 */
function render() {
  if (!rangeOutput) {
    return;
  }
  if (visibleRows.size === 0) {
    rangeOutput.textContent = "0 - 0";
    return;
  }
  let min = Infinity;
  let max = -Infinity;
  visibleRows.forEach((index) => {
    if (index < min) {
      min = index;
    }
    if (index > max) {
      max = index;
    }
  });
  rangeOutput.textContent = `${min} - ${max}`;
}

/**
 * 行の監視を貼り直す（初期描画後・無限スクロールの追記後・リサイズ時に呼ぶ）。
 *
 * sticky ヘッダーに隠れる領域を rootMargin の負値で監視対象から除外する。
 *
 * @return {void} 戻り値はない。
 */
function observeRows() {
  if (!scrollContainer || !tableBody) {
    return;
  }
  const thead = scrollContainer.querySelector("thead");
  const headerHeight = thead
    ? Math.ceil(thead.getBoundingClientRect().height)
    : 0;

  if (observer) {
    observer.disconnect();
  }
  visibleRows.clear();

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        // 行の現在位置（1 始まり）。可視判定の変化時だけ実行されるので低コスト。
        const index =
          Array.prototype.indexOf.call(tableBody.children, entry.target) + 1;
        if (index <= 0) {
          continue;
        }
        if (entry.isIntersecting) {
          visibleRows.add(index);
        } else {
          visibleRows.delete(index);
        }
      }
      render();
    },
    {
      root: scrollContainer,
      // sticky ヘッダーの高さ分だけ上端を狭め、隠れた行を可視扱いしない。
      rootMargin: `-${headerHeight}px 0px 0px 0px`,
      threshold: 0,
    },
  );

  for (const row of tableBody.children) {
    observer.observe(row);
  }
}

// 無限スクロールで行が追記された後に監視を貼り直す（data-each の更新通知）。
if (tableBody) {
  tableBody.addEventListener("haori:eachupdate", observeRows);
}
// リサイズでヘッダー高さが変わる場合に備えて貼り直す。
window.addEventListener("resize", observeRows);
// 初期描画後の初回計算。
window.addEventListener("load", observeRows);
observeRows();
