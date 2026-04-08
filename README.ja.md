# Haori.js Bootstrap

Haori.js Bootstrap は、Haori.js 向けの Bootstrap ベース UI 拡張ライブラリです。

現時点のこのリポジトリには、ライブラリ本体の実装ではなく、初期設計と関連文書を配置しています。実装とテストはこれから着手する前提です。

## 概要

- 正式名称: Haori.js Bootstrap
- パッケージ識別子: haori-js-bootstrap
- 参照元 Haori.js リポジトリ: https://github.com/meibinlab/haori-js
- 対応予定 Bootstrap バージョン: 5.3.x
- 配布予定形式: ESM と IIFE

目的は、Haori.js の dialog、confirm、toast、openDialog、closeDialog、addErrorMessage、clearMessages などの UI 系静的メソッドを Bootstrap ベース実装へ差し替えつつ、既存の Procedure 連携を維持することです。

## 現在の状態

- 初期設計を作成済み
- README と設計書を整備済み
- ソースコードとテストは未実装

## 想定リポジトリ構成

- 実装リポジトリは、上流 Haori.js に合わせて top-level に src、tests、demo、docs/ja、playwright を持つ構成を想定しています。
- ソースコードは TypeScript ベースの ESM モジュールとし、src は index、browser、install、bootstrap_haori、dialog、toast、modal、message などを中心にフラット構成で開始する想定です。
- テストとデモは機能別に分け、Procedure 互換、フォールバック、ブラウザ直読み込みの確認を並行して進められる形を想定しています。
- 現在の初期設計書は設計フェーズのため doc 配下に置いていますが、実装開始時には docs/ja 配下へ移す想定です。

## 対象範囲

- Haori.js の UI 系静的メソッドを Bootstrap ベースへ差し替える
- ブラウザ直読み込みと ESM 読み込み時の自動有効化をサポートする
- data-click-* を用いた既存 Procedure の利用継続を重視する
- Bootstrap JS が利用できない場合のフォールバック方針を持つ

## 公開 API 案

現時点の設計では、次の API を想定しています。

| API | 目的 | 想定戻り値 |
| ---- | ---- | ---- |
| dialog(message) | 情報表示ダイアログ | Promise<void> |
| confirm(message) | 確認ダイアログ | Promise<boolean> |
| toast(message, level) | トースト通知 | Promise<void> |
| openDialog(element) | 任意要素の表示 | Promise<void> |
| closeDialog(element) | 任意要素の非表示 | Promise<void> |
| addErrorMessage(target, message) | 管理対象エラーメッセージの追加 | Promise<void> |
| clearMessages(parentOrTarget) | 管理対象メッセージのみ削除 | Promise<void> |
| install(options) | Bootstrap 対応 Haori を再適用し設定を上書き | void |
| uninstall() | 元の Haori 実装を復元 | void |

## 想定配布物

- npm 公開の primary entry は dist/haori-js-bootstrap.js とし、types は dist/index.d.ts を公開します。
- ブラウザ直読み込み向けには dist/haori-js-bootstrap.iife.js を配布し、window.HaoriBootstrap から補助 API を参照できる想定です。
- package.json の exports は root のみを公開し、./browser や ./install などの内部 entry は初期版では公開しません。

## 統合予定

### ブラウザ直読み込み

次の順で読み込む想定です。

1. Haori.js
2. Bootstrap CSS
3. bootstrap.bundle.js
4. haori-js-bootstrap

IIFE 版は、window.Haori と window.bootstrap が存在する場合のみ、読み込み時点で自動有効化する設計です。
必要に応じて window.HaoriBootstrap.install と window.HaoriBootstrap.uninstall を補助導線として持てますが、install は既定設定の上書きや再適用に使う補助 API とします。

### ESM

ESM 版も、window.Haori と window.bootstrap が利用可能な場合は import 時点で自動有効化する想定です。既定設定を変更したい場合のみ install を追加で呼び出します。

```js
import 'haori-js-bootstrap';
```

既定設定を上書きしたい場合の例:

```js
import { install } from 'haori-js-bootstrap';

install({
  fallbackToNative: true,
});
```

## Procedure 連携の実運用サンプル

既存の Procedure が data-click-* と data-click-*-message を使って Haori の静的メソッドを呼び出す構成では、そのまま Bootstrap UI 側へ置き換わります。

```html
<button
  type="button"
  data-click-confirm="deleteUser"
  data-click-confirm-message="ユーザーを削除しますか。\nこの操作は元に戻せません。"
>
  削除
</button>

<button
  type="button"
  data-click-dialog="showHelp"
  data-click-dialog-message="1行目の案内です。\n2行目の補足も表示されます。"
>
  ヘルプを表示
</button>

<button
  type="button"
  data-click-toast="notifySaved"
  data-click-toast-message="保存しました。\n一覧を再読み込みしてください。"
>
  保存通知
</button>
```

- message は HTML としては解釈されず、常にプレーンテキストとして描画されます。
- message 中の `\n` は改行へ正規化され、dialog、confirm、toast の各 UI で複数行表示されます。
- 実際の data-click-* の解釈とイベント実行は Haori.js / Procedure 側が担当し、本ライブラリは渡された message の表示だけを Bootstrap UI に差し替えます。

## 文書

- English README: [README.md](README.md)
- 初期設計書: [doc/Haori.js Bootstrap初期設計書.md](doc/Haori.js Bootstrap初期設計書.md)

## 補足

- Bootstrap CSS と JS は利用者側で用意する前提です。
- Haori.js は peer 相当の前提依存として扱い、本ライブラリへ同梱しない方針です。
- 初期版では dialog と toast の message に HTML を許可しない想定です。
- dialog、confirm、toast の message はプレーンテキストのまま扱い、文字列中の `\n` は改行へ正規化して `white-space: pre-line` で描画します。
- toast の既定コンテナは画面右下に生成し、toast 本体は白背景に `info`、`warning`、`error` に応じた左アクセント帯を付けて表示します。
- デモ HTML を単純な static server で配信する場合は、先に `npm run build` を実行して `dist/haori-js-bootstrap.js` を生成してください。
- 事前ビルド済みの static デモ一式が必要な場合は、`npm run build:demo` 実行後に `dist-demo/` を配信してください。
