# Haori.js Bootstrap

Haori.js Bootstrap は、Haori.js 向けの Bootstrap ベース UI 拡張ライブラリです。

Version: 0.2.0

## 概要

- 正式名称: Haori.js Bootstrap
- パッケージ識別子: haori-bootstrap
- 参照元 Haori.js リポジトリ: https://github.com/meibinlab/haori-js
- GitHub リポジトリ: https://github.com/meibinlab/haori-js-bootstrap
- 対応 Bootstrap バージョン: 5.3.x
- 配布形式: ESM と IIFE

npm パッケージ名は `haori-js-bootstrap` から `haori-bootstrap` へ変更し、旧 package は deprecated にしました。既存利用者は新しい package 名へ移行してください。GitHub リポジトリ名は変更していません。

Haori.js の dialog、confirm、toast、openDialog、closeDialog、addErrorMessage、clearMessages などの UI 系静的メソッドを Bootstrap ベース実装へ差し替えつつ、既存の Procedure 連携を維持します。

## インストール

npm からインストールします。

```bash
npm install haori-bootstrap
```

利用時は、アプリケーション側で Haori.js と Bootstrap CSS/JS を別途読み込んでください。

## CDN 利用

ブラウザ直読み込み時は、次の順で依存を読み込みます。

1. Haori.js
2. Bootstrap CSS
3. bootstrap.bundle.js
4. haori-bootstrap

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
/>
<script src="https://cdn.jsdelivr.net/npm/haori@0.1.2/dist/haori.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/haori-bootstrap@0.2.0/dist/haori-bootstrap.iife.js"></script>
```

IIFE 版は、window.Haori と window.bootstrap が利用可能な場合に自動で有効化されます。

## ESM 利用

ESM 版も、window.Haori と window.bootstrap が利用可能な場合は import 時点で自動有効化されます。

```js
import 'haori-bootstrap';
```

既定設定を上書きしたい場合は install を明示的に呼び出します。

```js
import { install } from 'haori-bootstrap';

install({
  fallbackToNative: true,
});
```

## 公開 API

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

## Procedure 連携例

既存の Procedure は、data-click-* と data-click-*-message をそのまま利用できます。

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
  data-click-toast="notifySaved"
  data-click-toast-message="保存しました。\n一覧を再読み込みしてください。"
>
  保存通知
</button>
```

- message は HTML として解釈せず、プレーンテキストとして描画します。
- message 中の `\n` は改行へ正規化され、dialog、confirm、toast で複数行表示されます。
- data-click-* の解釈とイベント実行は Haori.js / Procedure 側が担当します。

## Build & Publish

ローカル確認手順:

```bash
npm install
npm run compile
npm run test
npm run build
npm pack --dry-run
```

通常リリース手順:

```bash
npm version patch
git push origin main --follow-tags
```

push 後に、そのタグから GitHub Release を published にします。公開 workflow が npm publish と `dist.zip` 添付を自動で実行します。

次回 patch リリースの例:

```bash
# version が 0.2.1 になる
npm version patch
git push origin main --follow-tags
```

その後、push 済みタグの GitHub Release を作成して published にします。例として次回は `0.2.1` タグになります。

自動公開:

- `npm version patch` で、src/index.ts の公開用 `version` 定数も package.json と同期されます。
- publish-on-release.yml がパッケージを build し、npm publish を実行します。
- release-archive.yml が dist/ を build し、dist.zip を同じ GitHub Release へ添付します。

初回公開のみ:

- current version が未公開の場合は、`npm version patch` を実行せず、対象 version のタグをそのまま作成して push します。
- npm アカウント上で `Read and write` 権限の granular access token を作成し、リポジトリシークレット `NPM_TOKEN` として登録します。
- npm アカウントで 2FA を有効化している場合は、write 操作用の bypass 2FA を有効にした token を使います。
- `NPM_TOKEN` の作成に、パッケージの事前公開は不要です。

名称変更後の初回 `0.2.0` 公開の例:

```bash
git push origin main
git tag 0.2.0
git push origin 0.2.0
```

初回公開チェックリスト:

1. npm 上で `haori-bootstrap` の名前が空いていることを確認する。
2. `NPM_TOKEN` を作成して GitHub repository secrets に登録する。
3. ローカル確認と `npm pack --dry-run` を実行する。
4. リリースタグを push する。
5. そのタグから GitHub Release を published にする。

## 文書

- English README: [README.md](README.md)
- 初期設計書: [doc/Haori.js Bootstrap初期設計書.md](doc/Haori.js Bootstrap初期設計書.md)
- 変更履歴: [CHANGELOG.md](CHANGELOG.md)

## 補足

- Bootstrap CSS と JS は利用者側で用意する前提です。
- Haori.js は前提依存として扱い、本ライブラリへ同梱しません。
- CDN でブラウザ直読み込みする場合の配布物は dist/haori-bootstrap.iife.js です。
- npm 公開時のエントリは dist/haori-bootstrap.js、型定義は dist/index.d.ts です。
