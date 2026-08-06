import type { InstallOptions } from './types';

/**
 * 宣言で設定できる導入設定の一覧。
 *
 * 属性名は `<script>` タグでは `data-` を、`<html>` / `<body>` では `data-haori-` を
 * 前置したものになる。前置を分けているのは、`<script>` タグは自身のタグなので衝突の
 * 余地が無く、画面側の要素では本パッケージの識別属性（`data-haori-dialog` など）と
 * 同じ名前空間へ揃えたいためである。
 */
const DECLARED_OPTIONS: ReadonlyArray<{
  /** 前置を除いた属性名。 */
  attribute: string;
  /** 読み取った値を導入設定へ格納する。 */
  apply: (options: InstallOptions, value: string) => void;
}> = [
  {
    attribute: 'dialog-ok-label',
    apply: (options, value) => {
      options.dialogOkLabel = value;
    },
  },
  {
    attribute: 'dialog-cancel-label',
    apply: (options, value) => {
      options.dialogCancelLabel = value;
    },
  },
];

/**
 * 自身の `<script>` タグ。モジュールの評価時に確定させる。
 *
 * `document.currentScript` は**同期実行中**の `<script>` だけを返すため、後から
 * 参照しても null になる。IIFE 版はモジュールの評価が `<script>` の実行そのものな
 * ので、ここで捕捉すれば自身のタグを得られる。ESM 版を `type="module"` で読み込んだ
 * 場合は HTML 仕様により常に null になるため、`<html>` / `<body>` の属性を使う。
 */
const ownScript: HTMLScriptElement | null =
  typeof document !== 'undefined' && document.currentScript instanceof HTMLScriptElement
    ? document.currentScript
    : null;

/**
 * 属性値を読み、空文字（空白のみ）は未指定として扱う。
 *
 * 空文字を採用すると文言の無いボタンを作ってしまうため、指定が無かったものとして
 * 既定値へ委ねる。
 *
 * @param element 読み取り対象の要素。
 * @param attributeName 属性名。
 * @return 属性値。未指定または空文字なら undefined。
 */
function readAttribute(element: Element | null, attributeName: string): string | undefined {
  const value = element?.getAttribute(attributeName) ?? null;
  if (value === null || value.trim() === '') {
    return undefined;
  }
  return value;
}

/**
 * 宣言（HTML の属性）から導入設定を読み取る。
 *
 * <p>優先順位は「自身の `<script>` タグ > `<html>` > `<body>`」で、最初に見つかった値を
 * 採用する。`<body>` は読み取りの時点で解析済みである必要があるため、`<head>` で
 * 読み込む構成では `<html>` か `<script>` タグの属性を使う。
 *
 * @param documentObject 読み取りに使用する document。省略時は現在の document。
 * @param scriptElement 自身の `<script>` タグ。省略時は読み込み時に捕捉したもの。
 * @return 宣言された導入設定。宣言が無ければ空オブジェクト。
 */
export function readDeclaredInstallOptions(
  documentObject: Document | null = typeof document === 'undefined' ? null : document,
  scriptElement: HTMLScriptElement | null = ownScript,
): InstallOptions {
  const declared: InstallOptions = {};
  for (const { attribute, apply } of DECLARED_OPTIONS) {
    const value =
      readAttribute(scriptElement, `data-${attribute}`) ??
      readAttribute(documentObject?.documentElement ?? null, `data-haori-${attribute}`) ??
      readAttribute(documentObject?.body ?? null, `data-haori-${attribute}`);
    if (value !== undefined) {
      apply(declared, value);
    }
  }
  return declared;
}
