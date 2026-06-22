# Haori.js Bootstrap

Haori.js Bootstrap は、Haori.js 向けの Bootstrap ベース UI 拡張ライブラリです。

Version: 0.5.5

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
<script src="https://cdn.jsdelivr.net/npm/haori@0.22.1/dist/haori.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/haori-bootstrap@0.5.5/dist/haori-bootstrap.iife.js"></script>
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
  runtime: 'demo',
});
```

## 公開 API

| API | 目的 | 戻り値 |
| ---- | ---- | ---- |
| dialog(message) | 情報表示ダイアログ | Promise<void> |
| confirm(message) | 確認ダイアログ | Promise<boolean> |
| toast(message, level) | トースト通知 | Promise<void> |
| openDialog(element) | 対象の Modal を開く（`.modal` 自身またはその子孫を渡す。非 `.modal` の場合は祖先方向で最も近い `.modal` に解決）。表示前に対象 Modal 配下の管理メッセージと `is-invalid` / `is-valid` 状態をクリアするため、再表示時はクリーンな状態で開く。 | Promise<void> |
| closeDialog(element) | 対象の Modal を閉じる（`.modal` 自身またはその子孫を渡す。非 `.modal` の場合は祖先方向で最も近い `.modal` に解決） | Promise<void> |
| addErrorMessage(target, message) | 管理対象エラーメッセージの追加 | Promise<void> |
| addMessage(target, message, level?) | レベル付き管理対象メッセージを追加（`'error'` \| `'success'` \| `'warning'` \| `'info'`）。再呼び出し時は Bootstrap 検証クラス（`is-invalid` / `is-valid`）も切り替わります。 | Promise<void> |
| clearMessages(parentOrTarget) | 管理対象メッセージのみ削除 | Promise<void> |
| install(options) | Bootstrap 対応 Haori を再適用し、runtime を含めて設定を上書き | void |
| uninstall() | 元の Haori 実装を復元 | void |

### install オプション

| オプション | 型 | デフォルト | 説明 |
| ---- | ---- | ---- | ---- |
| toastPosition | `'top-start' \| 'top-center' \| 'top-end' \| 'bottom-start' \| 'bottom-center' \| 'bottom-end'` | `'bottom-end'` | トーストコンテナの表示位置。変更は次のトースト表示時に反映されます。 |
| toastDelay | `number` | Bootstrap デフォルト (5000ms) | トースト通知の自動非表示までの時間 (ms)。 |

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

## collapse 開閉状態の永続化

Bootstrap collapse 要素に `data-haori-persist="キー名"` を付与すると、開閉状態を sessionStorage に保存し、ページ再訪時に復元します。

```html
<button data-bs-toggle="collapse" data-bs-target="#sideMenu">メニュー</button>
<div class="collapse" id="sideMenu" data-haori-persist="side-menu">
  ...
</div>
```

- `shown.bs.collapse` / `hidden.bs.collapse` を監視して `shown` / `hidden` を保存します。
- `install()` 時に既存要素を復元し、`data-import` などで後から挿入されたフラグメントにも `MutationObserver` で復元を適用します。
- 復元時は紐づくトグル要素（`data-bs-toggle="collapse"` で `data-bs-target` / `href` が当該 collapse を指すもの）の `aria-expanded` と `collapsed` クラスも同期します。トグル同期には collapse 要素の `id` が必要です。
- 保存キーごとに状態を区別します。同一キーを複数要素に付けると状態を共有します。
- ストレージが使えない環境（プライベートモード等）では黙って無効化し、例外は送出しません。
- `uninstall()` で監視を解除します。

## 一覧行から共有モーダルへコンテキストを渡す

一覧（`data-each` の各行）の操作ボタンから**共有モーダル**（1 つだけ）を開き、その行のコンテキスト（対象 ID・種別など）をモーダル内で使いたい場合は、Haori コアの宣言的な `data-{event}-copy` を利用します。手書きの `show.bs.modal` リスナーや、行ごとのモーダル複製は不要です。

`data-{event}-copy` はバインディング値を対象要素のスコープへコピーするアクションで、`data-{event}-fetch` とは独立に動作します。`data-{event}-form` が無い場合のコピー元は**トリガ要素の `data-bind` / 継承済みバインディングデータ**（＝その行のスコープ）です。`data-{event}-copy-params` で転送するキーを `&` 区切りで選び（先頭 `!` は除外）、コピー先の既存キーは保持しつつ同名キーだけを上書きします。

```html
<!-- 行ボタン（data-each 内）: 共有モーダルを開きつつ、行のスコープをコピーする -->
<button
  data-bs-toggle="modal"
  data-bs-target="#acceptModal"
  data-click-copy="#acceptModal"
  data-click-copy-params="appealId&targetType"
>
  承認
</button>

<!-- 共有モーダル: スコープのルートにするため data-bind を付与し、コピー値を参照する -->
<div class="modal" id="acceptModal" data-bind="{}">
  <input type="hidden" name="appealId" data-attr-value="{{appealId}}" />
  <p>{{ targetType == 'account' ? '利用停止を解除します。' : 'コンテンツを復元します。' }}</p>
</div>
```

- `data-{event}-copy` / `-copy-params` / `-copy-source` は Haori **コア**の機能です（本パッケージ固有ではありません）。詳細な仕様は haori-js のドキュメントを参照してください。
- 共有モーダルには `data-bind`（空の `{}` で可）を付け、コピー値がマージされるスコープのルートにします。
- 文言の出し分けは、コピーしたキーをモーダル側の `{{ ... }}` で直接参照すれば足りるため、キーのリネームや計算は通常不要です。
- 動作例は `demo/modal-copy.html` を参照してください。

## e2e 向け安定セレクタ

`dialog` / `confirm` / `toast` が描画する要素には、文言・ロケールに依存しない安定した識別属性を付与しています。Playwright などの e2e テストでは、表示文言やボタン名ではなくこれらの属性でセレクタを組むことを推奨します（文言変更やロケール差で壊れません）。

| 要素 | 属性 | 値 |
| ---- | ---- | ---- |
| トーストルート | `data-haori-toast` | `"true"` |
| トーストのレベル | `data-haori-toast-level` | `"success"` \| `"warning"` \| `"error"` \| `"info"` |
| トーストの閉じるボタン | `data-haori-toast-dismiss` | `"true"` |
| トーストコンテナ | `data-haori-toast-container` | `"true"` |
| 情報ダイアログのルート | `data-haori-dialog` | `"true"` |
| 情報ダイアログの OK ボタン | `data-haori-dialog-ok` | `"true"` |
| 確認ダイアログのルート | `data-haori-confirm` | `"true"` |
| 確認ダイアログの OK ボタン | `data-haori-confirm-ok` | `"true"` |
| 確認ダイアログのキャンセルボタン | `data-haori-confirm-cancel` | `"true"` |
| ダイアログのタイトル | `data-haori-dialog-title` | `"true"` |
| 管理対象メッセージのコンテナ | `data-haori-message-container` | `"true"` |

```ts
// 例: 文言に依存せず確認ダイアログを操作する
await page.locator('[data-haori-confirm-ok="true"]').click();

// 例: トーストのレベルを検証する
await expect(page.locator('[data-haori-toast="true"]').last())
  .toHaveAttribute('data-haori-toast-level', 'success');
```

> 上記属性は安定した公開契約として維持します。情報ダイアログ (`data-haori-dialog`) と確認ダイアログ (`data-haori-confirm`) はルート属性で区別できます。

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
# version が 0.5.6 になる
npm version patch
git push origin main --follow-tags
```

その後、push 済みタグの GitHub Release を作成して published にします。例として次回は `0.5.6` タグになります。

自動公開:

- `npm version patch` で、src/index.ts の公開用 `version` 定数、README の例、CDN デモ、Playwright の CDN 確認も package.json と同期されます。
- publish-on-release.yml がパッケージを build し、npm publish を実行します。
- release-archive.yml が dist/ を build し、dist.zip を同じ GitHub Release へ添付します。

初回公開のみ:

- current version が未公開の場合は、`npm version patch` を実行せず、対象 version のタグをそのまま作成して push します。
- npm アカウント上で `Read and write` 権限の granular access token を作成し、リポジトリシークレット `NPM_TOKEN` として登録します。
- npm アカウントで 2FA を有効化している場合は、write 操作用の bypass 2FA を有効にした token を使います。
- `NPM_TOKEN` の作成に、パッケージの事前公開は不要です。

名称変更後の初回 `0.3.1` 公開の例:

```bash
git push origin main
git tag 0.3.1
git push origin 0.3.1
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
- ブラウザデモ時の Procedure 挙動提案: [doc/ブラウザデモ時Procedure挙動仕様提案.md](doc/%E3%83%96%E3%83%A9%E3%82%A6%E3%82%B6%E3%83%87%E3%83%A2%E6%99%82Procedure%E6%8C%99%E5%8B%95%E4%BB%95%E6%A7%98%E6%8F%90%E6%A1%88.md)
- 変更履歴: [CHANGELOG.md](CHANGELOG.md)

## 補足

- Bootstrap CSS と JS は利用者側で用意する前提です。
- Haori.js は前提依存として扱い、本ライブラリへ同梱しません。
- CDN でブラウザ直読み込みする場合の配布物は dist/haori-bootstrap.iife.js です。
- npm 公開時のエントリは dist/haori-bootstrap.js、型定義は dist/index.d.ts です。
- ブラウザデモ時の通信正規化は上記の提案書で検討しており、現時点の公開 API には含めていません。
