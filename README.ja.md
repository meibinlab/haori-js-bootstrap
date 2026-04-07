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

## 対象範囲

- Haori.js の UI 系静的メソッドを Bootstrap ベースへ差し替える
- ブラウザ直読み込みと ESM の明示 install をサポートする
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
| install(options) | Bootstrap 対応 Haori を適用 | void |
| uninstall() | 元の Haori 実装を復元 | void |

## 統合予定

### ブラウザ直読み込み

次の順で読み込む想定です。

1. Haori.js
2. Bootstrap CSS
3. bootstrap.bundle.js
4. haori-js-bootstrap

IIFE 版は、window.Haori と window.bootstrap が存在する場合のみ自動インストールする設計です。

### ESM

ESM 版は import 時の副作用を避け、明示的な install 呼び出しを必須とする想定です。

```js
import { install } from 'haori-js-bootstrap';

install({
  fallbackToNative: true,
});
```

## 文書

- English README: [README.md](README.md)
- 初期設計書: [doc/Haori.js Bootstrap初期設計書.md](doc/Haori.js Bootstrap初期設計書.md)

## 補足

- Bootstrap CSS と JS は利用者側で用意する前提です。
- Haori.js は peer 相当の前提依存として扱い、本ライブラリへ同梱しない方針です。
- 初期版では dialog と toast の message に HTML を許可しない想定です。
