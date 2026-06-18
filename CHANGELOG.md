# 変更履歴

このファイルには、このプロジェクトの重要な変更を記録します。

## 0.5.4 - 2026-06-19

- `closeDialog` / `openDialog` に非 `.modal` 要素（例: モーダル内の閉じる/キャンセルボタン）が渡された際、その要素自体を破壊的に `.modal` 化し `hide()` していたため、ダイアログが閉じず押したボタンだけが `display:none` で消える不具合を修正しました。値を省略した `data-{event}-close` ではコア Haori.js が対象をトリガー要素自身（ボタン）に解決して `closeDialog(button)` を呼ぶため、本不具合が発生していました。
- 修正方針: `closeDialog` / `openDialog` に渡された要素が `.modal` でない場合は、要素を modal 化せず祖先方向で最も近い `.modal`（`element.closest('.modal')`）を対象に解決するようにしました。解決できない場合は `.modal` 付与を行わず reject し、コア実装へフォールバックします（フェイルセーフ）。要素が既に `.modal` の場合（明示セレクタ指定など）は従来どおりの挙動です。`prepareModalElement` が任意要素を `.modal` 化して hide する破壊的動作を廃止しました。

## 0.5.3 - 2026-06-15

- デモ・README が参照するコア Haori.js を `0.22.0` から `0.22.1` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、README / README.ja の CDN 利用例）。
- コア 0.22.1 は 0.22.0 の `data-{event}-run` await のバグ修正です。`return` を書かない単一式の run（例 `data-click-run="save()"`）が await されず多重実行防止が効かなかった不具合を、単一式本体を `return (body)` で捕捉することで修正したものです。本変更はコア側の挙動修正であり、`window.Haori` 差し替え時の必須メソッド追加を伴わないため、本パッケージのコード改修は不要でした。`demo/admin-table.html` の `data-click-run="navigator.clipboard.writeText(...)"`（return 省略の単一式）は 0.22.1 で初めて await されますが、即時 settle するため挙動は実質不変です（コピー完了までボタンがロックされる点はむしろ堅牢化）。

- デモ・README が参照するコア Haori.js を `0.21.0` から最新版 `0.22.0` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、README / README.ja の CDN 利用例）。
- コア 0.22.0 では `data-{event}-run` が Promise（thenable）戻り値を `await` し、`click` では await 中も多重実行防止ロックを保持するようになりました（async ハンドラの 2 度押しによる重複送信防止）。本変更はコア側の挙動変更であり、`window.Haori` 差し替え時の必須メソッド追加を伴わないため、本パッケージのコード改修は不要でした。`demo/admin-table.html` の `data-click-run="navigator.clipboard.writeText(...)"` は Promise を返しますが、即時 settle するため挙動は実質不変です（コピー完了までボタンがロックされる点はむしろ堅牢化）。

- デモ・README が参照するコア Haori.js を `0.19.0` から最新版 `0.21.0` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、README / README.ja の CDN 利用例）。
- 管理画面デモ（`demo/admin-table.html`）のフッタ可視行範囲表示を、コア 0.21.0 で追加された `data-each-visible` による宣言的実装へ刷新しました。`data-each` の `<tbody>` に `data-each-visible="visible"` / `data-each-visible-root` / `data-each-visible-margin` を付与し、フッタを `{{visible.firstLabel}} - {{visible.lastLabel}} / {{total}} 件` で描画します。これに伴い可視行範囲を自前計算していた補助スクリプト `demo/admin-table.js` を削除しました（IntersectionObserver による行監視はコア側に移譲）。
- コア 0.20.1 で `window.Haori` 差し替え時の必須メソッドに `clearMessages` が追加されましたが、本パッケージは既に `clearMessages` を差し替え対象として公開済みのため対応は不要でした（append 方式メッセージ表示のフェッチ単位クリアはコア側 `handleFetchError` が担います）。
- 一覧行から共有 Bootstrap モーダルへ行のコンテキストを宣言的に渡すパターン（コアの `data-click-copy` / `-copy-params` を利用）のデモ `demo/modal-copy.html` を追加し、README / README.ja に解説を追記しました。手書きの `show.bs.modal` リスナーや行ごとのモーダル複製を不要にする使い方ガイドです（本パッケージのコード変更は伴いません）。

## 0.5.0 - 2026-06-13

- **破壊的変更:** 本パッケージが付与・参照する識別属性の接頭辞を、すべて `data-haori-bootstrap-*` から `data-haori-*` へ統一しました。旧 `data-haori-bootstrap-*` 属性は廃止されたため、旧属性を HTML に記述・参照している箇所（利用側の HTML、セレクタ、e2e テスト等）は新属性への更新が必要です。
- **破壊的変更:** `dialog` / `confirm` / `toast` が描画する要素の識別属性を、文言・ロケール非依存の e2e 向け安定セレクタとして整理しました。トースト: `data-haori-toast` / `data-haori-toast-container` / `data-haori-toast-accent` / `data-haori-toast-dismiss`。ダイアログ: 情報ダイアログ `data-haori-dialog`、確認ダイアログ `data-haori-confirm`（両者をルート属性で区別可能に）、OK ボタンはそれぞれ `data-haori-dialog-ok` / `data-haori-confirm-ok`、キャンセルは `data-haori-confirm-cancel`、タイトルは `data-haori-dialog-title`。旧 `data-haori-bootstrap-action="ok|cancel"` 属性は廃止しました。
- **破壊的変更:** collapse 永続化属性を `data-haori-bootstrap-persist` から `data-haori-persist` へ変更しました。利用側の HTML に付与している属性名の更新が必要です。
- **破壊的変更:** 管理対象メッセージ関連の内部属性を `data-haori-bootstrap-message-container` / `-owned` / `-invalid-target` / `-valid-target` から、それぞれ `data-haori-message-container` / `data-haori-owned` / `data-haori-invalid-target` / `data-haori-valid-target` へ変更しました。
- トーストのルート要素に正規化済みレベルを示す `data-haori-toast-level="success|warning|error|info"` を追加しました。これによりアクセントのクラス名を解析せずにレベルを検証できます。
- README / README.ja に「e2e 向け安定セレクタ」一覧を公開仕様として明記しました。
- 上記の unit テストと Playwright e2e テストを更新・追加しました。
- CDN デモ e2e の `#haori-version` 検証を、コア haori が `version` 文字列を公開する場合にも読み込み成功と判定できるよう緩和しました（`"loaded"` または版数文字列を許容）。
- デモ・テスト・README が参照するコア Haori.js を最新版 `0.19.0` に更新しました（`demo/cdn.html` の `haori@0.1.5`、`demo/admin-table.html` の `haori@0.14.0`、README の CDN 利用例）。あわせて `demo/admin-table.html` の `haori-bootstrap` 参照を旧 `0.3.2` から本リリース `0.5.0` へ更新しました。

## 0.4.0 - 2026-06-11

- Bootstrap collapse の開閉状態を sessionStorage へ宣言的に永続化する機能を追加しました。collapse 要素（`.collapse`）に `data-haori-bootstrap-persist="キー名"` を付与すると、`shown.bs.collapse` / `hidden.bs.collapse` を監視して開閉状態を保存し、ページ再訪時に復元します。`data-import` で後から挿入されたフラグメントにも `MutationObserver` で復元を適用し、復元時は紐づくトグル要素（`data-bs-toggle="collapse"`）の `aria-expanded` と `collapsed` クラスも同期します。`install()` で有効化、`uninstall()` で解除します。ストレージが利用できない環境（プライベートモード等）では黙って無効化します。
- 上記の unit テストを追加しました。

## 0.3.2 - 2026-06-03

- `install()` 時に `window.Haori` を UI 専用ファサードで全置換していたため、`Haori.Core` / `Haori.waitForRenders` / `Haori.version` などのコア API がブラウザのグローバルから消失していた問題を修正しました。Proxy で UI 系メソッド（dialog / confirm / toast / openDialog / closeDialog / addErrorMessage / addMessage / clearMessages）のみを差し替え、それ以外のコア API・名前付きエクスポートは元の Haori 実装へ委譲するようにしました。これにより、Playwright 等の外部テストから `Haori.waitForRenders()` や `Haori.Core.dumpScope()` を引き続き利用できます。
- コア API（`Core` / `waitForRenders` / `version` 等）の委譲と、UI 系メソッドの差し替えを検証する unit テストを追加しました。

## 0.3.1 - 2026-04-27

- `addMessage()` を追加し、success / warning / info を含むレベル付きメッセージを表示できるようにしました。
- `dialogTitle` を追加し、dialog と confirm にヘッダー付きタイトルを表示できるようにしました。
- `toastPosition` と `toastDelay` を追加し、トーストの表示位置と自動非表示時間を設定できるようにしました。
- トーストに閉じるボタンを追加し、任意のタイミングで dismiss できるようにしました。
- install / uninstall の再実行時に runtime や各種設定が正しく引き継がれるように改善しました。
- README、デモ、E2E / unit テストを更新し、新しい API と挙動を検証できるようにしました。

## 0.3.0 - 2026-04-24

- `install()` に `runtime` サポートを追加し、Bootstrap 経由の Haori で embedded モードと demo モードを切り替えられるようにしました。
- ブラウザデモ時 Procedure 挙動の提案書、README、README.ja を更新し、runtime オプションと demo の挙動を記載しました。
- runtime のインストールと再インストールの挙動を検証する回帰テストを追加しました。

## 0.2.0 - 2026-04-21

- npm パッケージ名を haori-js-bootstrap から haori-bootstrap に変更しました。
- 配布バンドルのファイル名を haori-bootstrap.js と haori-bootstrap.iife.js に変更しました。
- 新しいパッケージ名に合わせて、README、README.ja、デモページ、CDN 参照、リリース手順を更新しました。
- 旧パッケージ名を npm 上で非推奨にできるよう、移行案内を追加しました。

## 0.1.0 - 2026-04-21

- Haori.js Bootstrap の初回公開版です。
- GitHub Release の公開をきっかけに npm リリースを実行する自動化を追加しました。
- dist/ から生成した dist.zip をアップロードするリリース成果物の自動化を追加しました。
- npm でのインストール方法、CDN の利用方法、リリース手順を記載しました。