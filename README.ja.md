# Haori.js Bootstrap

Haori.js Bootstrap は、Haori.js 向けの Bootstrap ベース UI 拡張ライブラリです。

このリポジトリには、ライブラリ本体の実装、テスト、デモ、および初期設計と関連文書を配置しています。

## 概要

- 正式名称: Haori.js Bootstrap
- パッケージ識別子: haori-js-bootstrap
- 参照元 Haori.js リポジトリ: https://github.com/meibinlab/haori-js
- 対応予定 Bootstrap バージョン: 5.3.x
- 配布予定形式: ESM と IIFE

目的は、Haori.js の dialog、confirm、toast、openDialog、closeDialog、addErrorMessage、clearMessages などの UI 系静的メソッドを Bootstrap ベース実装へ差し替えつつ、既存の Procedure 連携を維持することです。

## 現在の状態

- 初期設計を作成済み
- コア実装と単体テストを整備済み
- ライブラリとデモのビルドを実行可能

## リポジトリ構成

- リポジトリは、上流 Haori.js に近い top-level の src、tests、demo、doc を中心に構成しています。
- ソースコードは TypeScript ベースの ESM モジュールとし、src は index、browser、install、bootstrap_haori、dialog、toast、modal、message などを中心にフラット構成です。
- テストとデモは機能別に分け、Procedure 互換、フォールバック、ブラウザ直読み込みの確認を並行して進められる形にしています。
- 初期設計書は、実装参照用ドキュメントとして引き続き doc 配下に置いています。

## 対象範囲

- Haori.js の UI 系静的メソッドを Bootstrap ベースへ差し替える
- ブラウザ直読み込みと ESM 読み込み時の自動有効化をサポートする
- data-click-* を用いた既存 Procedure の利用継続を重視する
- Bootstrap JS が利用できない場合のフォールバック方針を持つ

## 公開 API 設計

現在の実装は、次の API 設計を対象としています。

| API | 目的 | 戻り値 |
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

## 配布物

- npm 公開の primary entry は dist/haori-js-bootstrap.js で、types は dist/index.d.ts を公開します。
- ブラウザ直読み込み向けには dist/haori-js-bootstrap.iife.js を配布し、window.HaoriBootstrap から補助 API を参照できます。
- package.json の exports は root のみを公開し、./browser や ./install などの内部 entry は初期版では公開しません。

## 統合

### ブラウザ直読み込み

次の順で読み込む想定です。

1. Haori.js
2. Bootstrap CSS
3. bootstrap.bundle.js
4. haori-js-bootstrap

IIFE 版は、window.Haori と window.bootstrap が存在する場合のみ、読み込み時点で自動有効化します。
必要に応じて window.HaoriBootstrap.install と window.HaoriBootstrap.uninstall を補助導線として持てますが、install は既定設定の上書きや再適用に使う補助 API とします。

### ESM

ESM 版も、window.Haori と window.bootstrap が利用可能な場合は import 時点で自動有効化します。既定設定を変更したい場合のみ install を追加で呼び出します。

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

## 文書

- English README: [README.md](README.md)
- 初期設計書: [doc/Haori.js Bootstrap初期設計書.md](doc/Haori.js Bootstrap初期設計書.md)

## 補足

- Bootstrap CSS と JS は利用者側で用意する前提です。
- Haori.js は peer 相当の前提依存として扱い、本ライブラリへ同梱しない方針です。
- 初期版では dialog と toast の message に HTML を許可しない想定です。
