# 変更履歴

このファイルには、このプロジェクトの重要な変更を記録します。

## 0.5.31 - 2026-08-22

配布物（`dist`）の内容は変わりません。参照するコアの更新だけです。

- デモ・README が参照するコア Haori.js を `0.45.1` から `0.45.2` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、`demo/dialog-label.html`、README / README.ja の CDN 利用例）。
- **コア 0.45.2 に、このパッケージへの破壊的変更はありません。** 内容は不具合修正 1 件、機能追加 2 件、開発モードの診断の見直し 3 件です。
  - `data-{event}-reset-before` の対象配下で `data-if` が再評価されない問題の修正は、`data-if` の表示判定を正しくするものです。本パッケージのデモは `demo/admin-table.html` に `data-if` を 2 つ持ちますが、`reset-before` は使っていません。
  - 入れ子の `data-each` で行スコープ名を根に持つ配列の行操作は、**本パッケージが通らない経路です**（`src`・`demo`・`playwright` に行操作（`data-{event}-row-*`）の宣言はなく、`data-each` の入れ子もありません）。
  - 開発モードの診断（falsy な `data-if` の報告を非表示への切り替わり時だけにする、式評価の所要時間の集計を明示的な開始まで行わない）は出力のタイミングだけの変更で、描画結果に影響しません。本パッケージは評価プロファイル（`__HAORI_EVALUATION_PROFILE__`）も `Core.dumpScope()` も使っていません。
  - `data-dev="false"` で開発モードを明示的に無効化できるようになりました。デモは `data-dev` を指定していないため、ローカルホストで開くと従来どおり開発モードが有効になります。
- 単体 80 件、E2E 22 件が通過しました。E2E は `demo/cdn.html`・`demo/admin-table.html`・`demo/modal-copy.html`・`demo/dialog-label.html` が jsDelivr 上の `haori@0.45.2` を実際に読み込んで確認しています。

## 0.5.30 - 2026-08-21

配布物（`dist`）の内容は変わりません。参照するコアの更新と、npm 公開の仕組みの変更です。

- デモ・README が参照するコア Haori.js を `0.44.1` から `0.45.1` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、`demo/dialog-label.html`、README / README.ja の CDN 利用例）。
- **コア 0.45.0 / 0.45.1 に、このパッケージへの破壊的変更はありません。** 不具合修正 2 件と開発モードの診断 1 件です。`data-each` の行の中で確定した編集が、そのコミット自身の再描画で失われる問題と、行への `data-{event}-copy` がコピーしていないキーの編集を巻き戻す問題の修正、および型の食い違う厳密比較の警告です。
  - **本パッケージが通らない経路です**（`src`・`demo`・`playwright` に `data-form-list` の編集可能な行、`data-attr-selected` / `data-attr-checked`、行操作（`data-{event}-row-*`）の宣言はありません。`demo/modal-copy.html` の `data-click-copy` はコピー先がモーダルで、編集可能な行ではありません）。
  - 開発モードの警告も対象外です（デモは開発モードを有効にしておらず、`demo/admin-table.html` の `===` は文字列同士の比較です）。
  - 本パッケージは `window.Haori` を Proxy で包んで UI 系メソッドだけを差し替えます。
- **npm 公開の認証を長期トークンから Trusted Publishing（OIDC）へ変更しました**（`.github/workflows/publish-on-release.yml`）。`NPM_TOKEN` の管理と失効による公開失敗が無くなり、出自証明（provenance）が自動で付きます。Trusted Publishing は npm 11.5.1 以降が必要なため、公開ジョブでは公開に使う CLI だけ `npm@^11` へ入れ替えます。
- 単体 80 件、E2E 22 件が通過しました。E2E は `demo/cdn.html`・`demo/admin-table.html`・`demo/modal-copy.html`・`demo/dialog-label.html` が jsDelivr 上の `haori@0.45.1` を実際に読み込んで確認しています。

## 0.5.29 - 2026-08-18

配布物（`dist`）の内容は変わりません。参照するコアの更新だけです。

- デモ・README が参照するコア Haori.js を `0.44.0` から `0.44.1` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、`demo/dialog-label.html`、README / README.ja の CDN 利用例）。
- **コア 0.44.1 に、このパッケージへの破壊的変更はありません。** 不具合修正 1 件です。`readonly` の入力欄が、フォーカス中は宣言バインド（`data-attr-value` / `value="{{式}}"`）の評価結果に追従しなかった問題の修正です。他の項目から算出した値を入れた欄がタブ移動の行き先になると、値が古いまま残っていました。
  - **本パッケージが通らない経路**です（`src`・`demo`・`playwright` に `readonly` の入力欄はありません。`data-attr-value` の宣言は `demo/modal-copy.html` の `type="hidden"` の欄だけで、非表示の欄はフォーカスされないため今回の修正の前後で挙動が変わりません）。
  - 本パッケージは `window.Haori` を Proxy で包んで UI 系メソッドだけを差し替えます。
- 単体 80 件、E2E 22 件が通過しました。E2E は `demo/cdn.html`・`demo/admin-table.html`・`demo/modal-copy.html`・`demo/dialog-label.html` が jsDelivr 上の `haori@0.44.1` を実際に読み込んで確認しています。

## 0.5.28 - 2026-08-17

配布物（`dist`）の内容は変わりません。参照するコアの更新だけです。

- デモ・README が参照するコア Haori.js を `0.43.1` から `0.44.0` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、`demo/dialog-label.html`、README / README.ja の CDN 利用例）。
- **コア 0.44.0 に、このパッケージへの破壊的変更はありません。** 追加 1 件と不具合修正 1 件です。
  - 追加は `data-value-type`（入力欄の収集値の型を `boolean` / `number` / `string` で宣言する属性）です。宣言しない限り従来どおりのため、既存のデモ・利用例に影響しません。
  - 修正は、リセット（`data-{event}-reset` / `-reset-before`）が `<form>` でない要素を対象にしたときに、その要素を一時的な `<form>` へ移して元へ戻していた実装を、DOM の構造を変えない方式へ改めたものです。**本パッケージが通らない経路**です（`src`・`demo`・`playwright` に `data-{event}-reset` 系と `data-fetch-bind` の宣言はありません）。
  - 本パッケージは `window.Haori` を Proxy で包んで UI 系メソッドだけを差し替えます。
- 単体 80 件、E2E 22 件が通過しました。E2E は `demo/cdn.html`・`demo/admin-table.html`・`demo/modal-copy.html`・`demo/dialog-label.html` が jsDelivr 上の `haori@0.44.0` を実際に読み込んで確認しています。

## 0.5.27 - 2026-08-06

配布物（`dist`）の内容は変わりません。参照するコアの更新だけです。

- デモ・README が参照するコア Haori.js を `0.43.0` から `0.43.1` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、`demo/dialog-label.html`、README / README.ja の CDN 利用例）。
- **コア 0.43.1 に、このパッケージへの破壊的変更はありません。** 不具合修正 1 件です。欄から出ずに打鍵した直後にクリア（`data-{event}-reset`）を押すと、フォーカスがボタンへ移らない環境（Safari の `<button>` のクリック、スクリプトからの `click()`）で、編集していない他の欄まで初期化が見送られていた問題の修正です。
  - 修正の対象は、`change` による編集の記録の時点、双方向コミットが運ぶ値の権威、コミットの入力欄への書き戻しの 3 箇所です。**いずれも本パッケージが通らない経路**です（`src`・`demo`・`playwright` に `data-{event}-reset` 系の宣言はなく、値の収集・入力欄への書き戻しにも関与しません）。
  - 本パッケージは `window.Haori` を Proxy で包んで UI 系メソッドだけを差し替えます。
- 単体 80 件、E2E 22 件が通過しました。E2E は `demo/cdn.html`・`demo/admin-table.html`・`demo/modal-copy.html`・`demo/dialog-label.html` が jsDelivr 上の `haori@0.43.1` を実際に読み込んで確認しています。

## 0.5.26 - 2026-08-06

確認ダイアログのボタン文言を、**HTML の属性だけ**で設定できるようにしました。`install()` を呼ぶための JavaScript が不要になります。あわせて参照するコアを更新しました。

- **`<script>` タグの属性で設定できるようにしました**（`data-dialog-ok-label` / `data-dialog-cancel-label`）。IIFE 版を `<script src>` で読み込む構成で、読み込み時に自身のタグの属性を読みます。コア Haori.js が自身の `<script>` タグから `data-prefix` などを読むのと同じ方式です。
- **`<html>` / `<body>` の属性でも設定できるようにしました**（`data-haori-dialog-ok-label` / `data-haori-dialog-cancel-label`）。ESM 版を `import` する構成では、HTML 仕様により自身の `<script>` タグを特定できないため、こちらを使います。
- 優先順位は「`install()` の引数 > `<script>` タグの属性 > `<html>` > `<body>` > 既定値（英語）」です。**既定値は変えていません。** 宣言も引数も無ければ従来どおり `OK` / `Cancel` です。
- 空文字（空白のみ）は未指定として扱い、既定値を使います（文言の無いボタンを作らないため）。
- ボタンの識別属性（`data-haori-confirm-ok` / `data-haori-confirm-cancel` / `data-haori-dialog-ok`）は文言に関わらず変わりません。
- `<body>` の属性は読み込みの時点で `<body>` が解析済みである必要があります。`<head>` で読み込む構成では `<html>` か `<script>` タグの属性を使ってください。
- 宣言で設定できるのはボタンの 2 文言です。他の `install` オプションは従来どおり引数で指定します。
- 一度 `install()` の引数で指定した文言は、文言を省略した再 `install()` でも保持され、宣言では上書きされません（`uninstall()` で解除）。
- デモに「ボタン文言デモ」（`demo/dialog-label.html`）を追加しました。**ページに独自のスクリプトがなく**、`<script>` タグの属性で OK、`<html>` の属性でキャンセルを設定しています。E2E がこのページで実際の IIFE 配布物を読み込んで確認します。
- 参照するコア Haori.js の版数が、デモと README の全箇所で揃っていることを検査するテストを追加しました。コアの版数は `scripts/sync-version.mjs` の対象外で手作業のため、リリース時の取り残しを機械的に止めます。
- デモ・README が参照するコア Haori.js を `0.42.0` から `0.43.0` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、`demo/dialog-label.html`、README / README.ja の CDN 利用例）。
- **コア 0.43.0 に、このパッケージへの破壊的変更はありません。** 履歴を置き換える遷移（`data-{event}-redirect-replace`）の追加と、リセットに重なった入力が宣言バインドの欄で消える不具合の修正です。
  - どちらの経路も使っていないことを確認しました。`src`・`demo`・`playwright` に `data-{event}-redirect` 系と `data-{event}-reset` 系の宣言はありません。`demo/modal-copy.html` の `data-attr-value="{{appealId}}"` は宣言バインドですが、同じ画面にリセットの宣言が無いため修正された経路を通りません。
  - 本パッケージは値の収集・入力欄への書き戻し・遷移に関与せず、`window.Haori` を Proxy で包んで UI 系メソッドだけを差し替えます。
- 単体 80 件、E2E 22 件が通過しました。E2E は `demo/cdn.html`・`demo/admin-table.html`・`demo/modal-copy.html`・`demo/dialog-label.html` が jsDelivr 上の `haori@0.43.0` を実際に読み込んで確認しています。

## 0.5.25 - 2026-08-06

配布物（`dist`）の内容は変わりません。参照するコアの更新だけです。

- デモ・README が参照するコア Haori.js を `0.41.4` から `0.42.0` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、README / README.ja の CDN 利用例）。
- **コア 0.42.0 に、このパッケージへの破壊的変更はありません。** 不具合修正 5 件（式評価の遮断を素通りできる問題、二重送信、`data-form-detach` の無効化、`data-form-list` を併記したチェックボックス群の収集、送信中のチェックボックス群の保護）と、仕様書への明記です。
  - コア側で**既存の画面の挙動が変わる**のは 3 点です。`type="number"` が数値として採用する文字列を HTML の数値文法に限定（`"0x10"` が `16` ではなく `null` になる）、`click` 手続きのロックを応答が返るまで保持、コンテナへ付けた `data-form-detach` が配下すべてに効く。
- コア 0.42.0 の変更に対し、ライブラリ本体（`src`）とデモの改修はいずれも不要です。**変わった経路を使っていない**ことを確認しました。
  - `src`・`demo`・`playwright` に `data-form-detach`・`data-form-list`・`type="number"`・`data-input-*`・`data-click-no-disabled` の宣言はありません。
  - `demo/checkbox-radio.html` のラジオはスタイルの見本で、バインドも収集もしていません。`src/message.ts` が同名ラジオを DOM から引くのは検証メッセージの配置先を決めるためで、コアの収集・保護とは別経路です。
  - `click` のロックが長くなる変更は、フェッチを伴わない `data-click-copy` / `data-click-run` にも及びます（デモが使うのはこの 2 つ）。ボタンが `disabled` のままになる時間が反映の完了まで延びるだけで、デモの操作と E2E の確認には影響しませんでした。
  - 本パッケージは値の収集・入力欄への書き戻しに関与せず、`window.Haori` を Proxy で包んで UI 系メソッドだけを差し替えます。
- 単体 69 件、E2E 21 件が通過しました。E2E は `demo/cdn.html`・`demo/admin-table.html`・`demo/modal-copy.html` が jsDelivr 上の `haori@0.42.0` を実際に読み込んで確認しています。

## 0.5.24 - 2026-08-05

配布物（`dist`）の内容は変わりません。参照するコアの更新だけです。

- デモ・README が参照するコア Haori.js を `0.41.2` から `0.41.4` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、README / README.ja の CDN 利用例）。
- **コア 0.41.3 / 0.41.4 に破壊的変更はありません。** 不具合修正 2 件と、テスト基盤の追加、仕様書への明記です。
  - 0.41.3: 打鍵を伴わない手段（貼り付け・IME 確定・スクリプトからの代入）で入れた値が、行への書き戻しで消える問題の修正（0.41.2 で作り込んだ回帰）。
  - 0.41.4: リセット（`data-{event}-reset`）の途中に打った文字・貼り付けた値が消える問題の修正。あわせて不変条件の常時検査（内部値をバインドデータより先に進めない）と、入力手段の軸を網羅したテストがコア側に入りました。
- コア 0.41.3 / 0.41.4 の変更に対し、ライブラリ本体（`src`）とデモの改修はいずれも不要です。**修正された経路を通らない**ことを確認しました（`src`・`demo`・`playwright` に `data-input-*` の宣言と `data-{event}-reset` の宣言はありません）。本パッケージは値の収集・入力欄への書き戻しに関与せず、`window.Haori` を Proxy で包んで UI 系メソッドだけを差し替えます。
- 単体 69 件、E2E 21 件が通過しました。E2E は `demo/cdn.html`・`demo/admin-table.html`・`demo/modal-copy.html` が jsDelivr 上の `haori@0.41.4` を実際に読み込んで確認しています。

## 0.5.23 - 2026-08-05

表示アニメーション中の操作が失われる不具合の修正 2 件と、ボタン文言の設定追加 1 件です。配布物（`dist`）の内容が変わります。

- **確認ダイアログのフェードイン中に押した操作が無視され、確認が閉じない問題を修正しました**（報告 AI）。Bootstrap は表示アニメーション中の `hide()` を無視するため、フェードイン中（既定 0.15 秒）の押下では `hidden.bs.modal` が発火せず Promise が解決しませんでした。押下ハンドラを `{ once: true }` で登録していたため、無視された 1 回目でハンドラが外れ、押し直しても効かない状態になっていました。報告元の実測では 8 回に 1 回（12%）発生し、そのとき送信（`data-click-fetch`）も実行されていません。
  - 表示完了（`shown.bs.modal`）を待ち、フェードイン中の押下は**閉じる要求として保持して表示完了後に閉じる**ようにしました。押下ハンドラの `{ once: true }` は外し、受け付けるのは最初の要求だけとしました（フェードイン中に OK とキャンセルが続けて押された場合は先に押された結果で確定します）。
  - `dialog()` も同じ構造だったため併せて修正しました。
  - 戻り値の仕様と識別属性は変えていません。
- **`closeDialog()` も、フェードイン中に呼ぶと無視されて Modal が開いたまま残る状態でした**（報告 AI と同種。未報告分を洗い出して修正）。導入時に `show.bs.modal` / `shown.bs.modal` を document で購読して表示アニメーション中の Modal を把握し、その間に呼ばれた場合だけ表示完了を待ってから閉じます。Bootstrap の Modal イベントはバブリングするため、`data-bs-toggle` などでアプリが直接開いた Modal も対象になります。購読は `uninstall()` で解除します。
  - 表示完了後の `closeDialog()` は従来どおり即座に閉じます。戻り値の契約（待たずに解決する）も変えていません。
- **dialog / confirm のボタン文言を install 設定で差し替えられるようにしました**（報告 AH）。`dialogOkLabel`（dialog と confirm の OK。既定 `'OK'`）と `dialogCancelLabel`（confirm のキャンセル。既定 `'Cancel'`）を追加しました。日本語の画面で本文だけが日本語、ボタンが英語になる状態を解消できます。
  - 既定値は英語のままなので、設定しなければ従来と同じ表示です。
  - 識別属性（`data-haori-confirm-ok` / `data-haori-confirm-cancel` / `data-haori-dialog-ok`）は文言に関わらず変わりません。
  - 再 install で文言を省略した場合は、前回の設定を引き継ぎます（`dialogTitle` と同じ扱い）。
- デモ・README が参照するコア Haori.js を `0.41.1` から `0.41.2` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、README / README.ja の CDN 利用例）。
  - **コア 0.41.2 に破壊的変更はありません。** 不具合修正 1 件（反映待ちの書き込みが打鍵中の文字を消す問題）と、仕様書への明記 1 件（打鍵が編集として扱われる範囲）です。
  - コア 0.41.2 の変更に対し、ライブラリ本体（`src`）とデモの改修はいずれも不要です。修正は `input` イベント時の編集の記録を広げるもので、本パッケージは値の収集・入力欄への書き戻しに関与しません（`window.Haori` を Proxy で包み、UI 系メソッドだけを差し替えます）。デモにも `data-input-*` の宣言はありません。
- 単体 69 件、E2E 21 件が通過しました。単体では Modal スタブをフェードイン（`hide()` を表示中は無視する）を再現するものへ差し替えたため、修正前は dialog 系 18 件のうち 16 件と、`closeDialog` の回帰 1 件が失敗します。E2E には実機 Chrome でフェードイン中に OK を押すケースを追加しました（修正前のビルドでは確認が開いたまま残り、呼び出し元へ結果が返りません）。E2E は `demo/cdn.html`・`demo/admin-table.html`・`demo/modal-copy.html` が jsDelivr 上の `haori@0.41.2` を実際に読み込んで確認しています。

## 0.5.22 - 2026-08-04

配布物（`dist`）の内容は変わりません。参照するコアの更新だけです。

- デモ・README が参照するコア Haori.js を `0.41.0` から `0.41.1` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、README / README.ja の CDN 利用例）。
- **コア 0.41.1 に破壊的変更はありません。** 不具合修正 1 件（画面外の入力欄で検証メッセージが表示されない問題）と、仕様書への明記 1 件（検証 UI の表示タイミング）です。
- コア 0.41.1 の変更に対し、ライブラリ本体（`src`）とデモの改修はいずれも不要です。**修正された経路を通らない**ことを確認しました。
  - 修正は `data-{event}-validate` による検証失敗時の表示処理だけを変えるものです。ライブラリ本体とデモには `data-{event}-validate` の宣言も `required` 属性も無いため、この経路に入りません。
  - デモのスクロール関連の宣言（`demo/admin-table.html` の `data-each-visible-root` / `data-intersect-root`）は可視範囲と交差監視の指定で、検証 UI とは無関係です。
  - 画面内に収まっている入力欄の振る舞いはコア側でも変わっていません。
- 単体 58 件、E2E 20 件が通過しました（`demo/cdn.html`・`demo/admin-table.html`・`demo/modal-copy.html` は jsDelivr 上の `haori@0.41.1` を実際に読み込んで動作を確認しています）。

## 0.5.21 - 2026-08-04

配布物（`dist`）の内容は変わりません。参照するコアの更新だけです。

- デモ・README が参照するコア Haori.js を `0.40.0` から `0.41.0` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、README / README.ja の CDN 利用例）。
- **コア 0.41.0 に破壊的変更はありません。** 不具合修正 3 件と仕様書の明確化 4 件です。
- コア 0.41.0 の変更に対し、ライブラリ本体（`src`）とデモの改修はいずれも不要です。影響の確認結果は次のとおりです。
  - **`data-each-key` の値が重複したときの行の取り違えを修正しました**。デモの `data-each-key` は `demo/admin-table.html` の `id`（5 ページ分 100 件がすべて一意）と `demo/modal-copy.html` の `appealId`（3 件が一意）で、いずれも重複しません。キーが一意な場合の対応付けは修正前と同一です。
  - **行への書き込み（`data-{event}-copy` / `data-{event}-bind` が行要素に解決した場合）で、重複キーの 2 行目以降が 1 行目のレコードへ入る問題を修正しました**。`demo/modal-copy.html` の `data-click-copy` はモーダル（`#acceptModal`）を指しており行要素ではないため、この経路を通りません。
  - **`data-each` の取得元と `data-form-list` の収集先が別の配列になる構成の修正**。デモに `data-form-list` の宣言はありません。
  - **`data-if` で隠した値が保存値・送信データに残る問題の修正**。デモに `data-if` による入力欄の出し分けはありません。
  - **仕様書の明確化 4 件**（JSON 形式の送信データ属性のテンプレート式、`data-each-key` の一意性、交差監視の送信データ属性名、`_poll` の非ミラー）。いずれも実装の振る舞いは変わりません。交差監視については `demo/admin-table.html` が `data-intersect-fetch` を使いますが、送信データ属性（`data-intersect-data`）は指定していません。
- 単体 58 件、E2E 20 件が通過しました（`demo/cdn.html`・`demo/admin-table.html`・`demo/modal-copy.html` は jsDelivr 上の `haori@0.41.0` を実際に読み込んで動作を確認しています）。

## 0.5.20 - 2026-08-04

配布物（`dist`）の内容は変わりません。参照するコアの更新だけです。

- デモ・README が参照するコア Haori.js を `0.39.2` から `0.40.0` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、README / README.ja の CDN 利用例）。
- **コア 0.40.0 には破壊的変更が 1 件ありますが、本パッケージは影響を受けません。** `Haori.Core.setBindingData()` の第 3 引数以降が省略可能な 1 つのオブジェクトへまとまりましたが、本パッケージはこのメソッドを**呼び出しません**。`window.Haori` を Proxy で包み、`dialog` / `confirm` / `toast` / メッセージ系の UI メソッドだけを差し替えて、それ以外は元の実装へそのまま委譲します（`src/install.ts`）。委譲されていることは `tests/install.test.ts` が固定しています。
- コア 0.40.0 の変更に対し、ライブラリ本体（`src`）とデモの改修はいずれも不要です。0.40.0 は値の供給と利用者の編集のどちらが勝つかを構造で決める変更で、本パッケージはそのいずれにも関与しません。影響の確認結果は次のとおりです。
  - **通番と種別による権威の解決に統一されました**。適用可否の判定はコア内部の宛先（入力欄とバインドデータの経路）で行われ、宣言の書き方も既定の振る舞いも変わりません。
  - **`data-bind` 属性へのミラーの取りこぼしを修正しました**。取りこぼしが解消する方向の修正で、デモは属性を読んで状態を復元する構成ではありません。
  - **実行時に付与した `data-fetch` / `data-import` が実行されるようになりました**。デモは属性を実行時に付与しません（`data-intersect-fetch` は宣言済みの属性で、この経路とは別です）。
  - **入れ子の `data-each` で `data-each-key` の宣言を見つけられない問題を修正しました**。`demo/admin-table.html` と `demo/modal-copy.html` の `data-each` はいずれも 1 段で、入れ子はありません。
  - **リセットも 1 つの供給として後勝ちで解決すると仕様に明記されました**。デモに `data-{event}-reset` の宣言はありません。
- 単体 58 件、E2E 20 件が通過しました（`demo/cdn.html`・`demo/admin-table.html`・`demo/modal-copy.html` は jsDelivr 上の `haori@0.40.0` を実際に読み込んで動作を確認しています）。

## 0.5.19 - 2026-08-03

配布物（`dist`）の内容は変わりません。参照するコアの更新だけです。

- デモ・README が参照するコア Haori.js を `0.39.1` から `0.39.2` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、README / README.ja の CDN 利用例）。
- コア 0.39.2 の変更に対し、ライブラリ本体（`src`）とデモの改修はいずれも不要です。9 件はすべて値の収集・入力欄への書き戻し・行の対応付け・式評価に関する修正で、本パッケージはそのいずれにも関与しません（`window.Haori` を Proxy で包み、`dialog` / `confirm` / `toast` / メッセージ系の UI メソッドだけを差し替えます）。影響の確認結果は次のとおりです。
  - **リセットに割り込む書き戻しを止めました**。デモに `data-{event}-reset` の宣言はありません。
  - **行の挿入・削除で後続の行の入力欄がずれる問題と、行の値の取り違えを修正しました**。デモに `data-form-list`（編集可能な行リスト）の宣言はありません。`demo/admin-table.html` と `demo/modal-copy.html` の `data-each` は表示専用で、いずれも `data-each-key` を宣言済みです。
  - **外部から `data-bind` 属性を書き換えたときに配下を再評価するようになりました**。本パッケージは `data-bind` 属性を書き換えません（バインドデータの更新はコア API へ委譲します）。
  - **ストレージ参照が例外になる環境で式評価が失敗する問題を修正しました**。コア側の修正で、本パッケージからの利用条件は変わりません。
  - **収集値の重ね合わせで `__proto__` などを読み飛ばすようになりました**。本パッケージはフォーム値を収集しません。
- 編集可能な行リスト（`data-form-list` と `data-each` の併用）を使う利用側では、コア 0.39.2 から `data-each-key` の宣言が推奨になりました。本パッケージのデモは該当しません。
- 単体 58 件、E2E 20 件が通過しました（`demo/cdn.html`・`demo/admin-table.html`・`demo/modal-copy.html` は jsDelivr 上の `haori@0.39.2` を実際に読み込んで動作を確認しています）。

## 0.5.18 - 2026-08-03

配布物（`dist`）の内容は変わりません。参照するコアの更新だけです。

- デモ・README が参照するコア Haori.js を `0.39.0` から `0.39.1` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、README / README.ja の CDN 利用例）。
- コア 0.39.1 の変更に対し、ライブラリ本体（`src`）とデモの改修はいずれも不要です。5 件はすべて値収集・入力欄への書き戻し・条件式の評価スコープに関する修正で、本パッケージはそのいずれにも関与しません（`window.Haori` を Proxy で包んで UI 系メソッドだけを差し替えます）。影響の確認結果は次のとおりです。
  - **収集が内部値を書き換えなくなりました**（0.39.0 の回帰修正）。デモに `data-validity` の宣言はなく、入力の確定を続けて行う画面もありません。
  - **チェック状態の判定に DOM の送信値を使うようになりました**。`demo/checkbox-radio.html` のチェックボックス・ラジオはメッセージ表示のデモで、バインドデータからの書き戻し対象ではありません。
  - **候補を `data-each` で流し込む `<select>` へ、候補が揃った時点で値を載せ直すようになりました**。デモに該当する構成はありません。
  - **反映待ちの間に来た値が捨てられなくなり、待機中の利用者編集が保護されるようになりました**。`demo/modal-copy.html` の `data-click-copy` は行の値をまとめて 1 回反映するため、同一フレームで二重に反映する経路はありません。
  - **条件式の評価スコープの修正**: デモに `data-validity` / `data-{event}-if` の宣言はありません。
- 単体 58 件、E2E 20 件が通過しました（`demo/cdn.html`・`demo/admin-table.html`・`demo/modal-copy.html` は jsDelivr 上の `haori@0.39.1` を実際に読み込んで動作を確認しています）。

## 0.5.17 - 2026-08-02

配布物（`dist`）の内容は変わりません。参照するコアの更新と、デモページ・開発時の検査・記述様式の修正です。

- デモ・README が参照するコア Haori.js を `0.38.0` から `0.39.0` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、README / README.ja の CDN 利用例）。
- コア 0.39.0 の変更に対し、ライブラリ本体（`src`）とデモの改修はいずれも不要です。影響の確認結果は次のとおりです。
  - **値収集が DOM を真とするようになりました**（イベントを伴わない `element.value` への代入も収集されます。同名グループの checkbox / radio でチェック済みの値も DOM の `value` から取ります）。本パッケージは値収集に関与せず（`window.Haori` を Proxy で包んで UI 系メソッドだけを差し替えます）、デモの入力欄も宣言バインドか利用者操作で値が入るため、DOM と内部値は一致しており収集結果は変わりません。
    - `demo/modal-copy.html` の `<input type="hidden" name="appealId" data-attr-value="{{appealId}}">` は、宣言バインドが `value` 属性・`element.value`・内部値を同じ描画キュータスクで揃えるため変化しません。
    - `demo/checkbox-radio.html` のチェックボックス・ラジオはメッセージ表示のデモで、`<form>` の値収集の対象ではありません。
  - **`data-import` で取り込んだ断片が、取り込み側のバインドスコープを継承するようになりました。** `src/collapse_persist.ts` は「後から挿入された断片にも折りたたみ状態を復元する」処理を持ちますが、MutationObserver で追加ノードを拾って属性を復元するだけで、式の評価スコープには依存しません。
  - 開発モード診断の誤警告修正: 警告出力のみの変更で、式の評価結果は変わりません。
- 単体 58 件、E2E 20 件が通過しました（`demo/cdn.html`・`demo/admin-table.html`・`demo/modal-copy.html` は jsDelivr 上の `haori@0.39.0` を実際に読み込んで動作を確認しています）。
- **デモ 2 ページが読み込む haori-bootstrap の版数が取り残されていた問題を修正しました**。`demo/admin-table.html` と `demo/modal-copy.html` は `0.5.3` を読み込み続けており、13 版分ドリフトしていました。`scripts/sync-version.mjs` の更新対象が `demo/cdn.html` だけだったためです。この 2 ページの E2E は、コアは最新でも本パッケージは公開済み `0.5.3` との組み合わせを見ていました。
  - 2 ページを `sync-version` の更新対象に追加し、`npm version` で他のページと一緒に追従するようにしました（`package.json` の `version` スクリプトの `git add` 対象にも追加）。
  - 公開 IIFE の URL を差し替えるパターンを共通化し、追加漏れが起きにくいようにしました。
  - 参照を公開済みの `0.5.16` へ更新しました。E2E 20 件が、`haori@0.38.0` と `haori-bootstrap@0.5.16` の組み合わせで通過します。
- **`npm run lint` が 281 件のエラーで失敗していた問題を修正しました**。すべて `.mamori/`（Mamori Inspector がローカルに置くディレクトリ。`.git/info/exclude` で除外済みでリポジトリの管理対象外）の 28 ファイル由来でした。`eslint.config.js` の除外に `.mamori` と `test-results` を追加しました。ライブラリのコードに指摘はありません。
- **`npm run format:check` が 34 ファイルで失敗していた問題を修正しました**。
  - Prettier の設定ファイルがありませんでした。既定値で整形するとコード全体の体裁が変わってしまうため、既存の記述様式を測って `.prettierrc.json` に落としました（`printWidth: 100`、`.ts` はシングルクォート、`demo` 配下の `.js` / `.html` はダブルクォート）。桁幅は 80 / 90 / 96 / 100 / 110 を試し、既存コードとの差分が最小になる 100 を採りました。
  - 失敗のうち約半分は改行コードだけの不一致でした。`.gitattributes` に `* text=auto eol=lf` を宣言し、作業ツリーの改行を LF に統一しました（リポジトリに格納される内容は従来から LF のため、差分は生じません）。Windows で `core.autocrlf=true` の場合、この宣言が無いと作業ツリーが CRLF になり、改行だけを理由に失敗します。
  - 残る差は `npm run format` で解消しました。処理の変更はありません。iife 版のビルド成果物はバイト単位で一致し、ES 版は空白を除去すると完全に一致します（折り返し位置だけの差）。
- `npm test` の `posttest` へ `lint` と `format:check` を追加しました。CI は `npm run test` を実行するため、検査漏れが CI とローカルの両方で検知されます。

## 0.5.16 - 2026-08-01

- デモ・README が参照するコア Haori.js を `0.37.1` から `0.38.0` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、README / README.ja の CDN 利用例）。
- コア 0.38.0 の変更に対し、ライブラリ本体（`src`）とデモの改修はいずれも不要です。影響の確認結果は次のとおりです。
  - **ブラウザのグローバル `window.Haori` の形が変わりました**（モジュールの名前空間オブジェクト → `Haori` クラス本体）。本パッケージは `window.Haori` を Proxy で包んで UI 系メソッドだけを差し替えるため、包む対象が関数（クラス）になっても成立します。実コア 0.38.0 の配布物と本パッケージのビルドを同一 window へ載せて確認しました。
    - 差し替え後も `Haori.Core` / `Haori.Env` / `Haori.Form` / `Haori.version` / `Haori.waitForRenders` / `Haori.enhancers` が素通しされます。
    - 静的ゲッターの `Haori.runtime` も Proxy 経由で読めます。
    - `uninstall()` で元のグローバルと `runtime` が復元されます。
    - **`install({runtime})` が実際に効くようになりました**。0.37.1 以前のグローバルには `setRuntime` が無く、`Haori.setRuntime が利用できません。runtime 設定は無視されます。` を警告して設定を捨てていました。0.38.0 ではクラスの静的 API として公開されるため、警告は出ず設定が反映されます。本パッケージ側のコード変更は不要です。
  - 0.38.0 の行イベント（`haori:rowadd` / `haori:rowremove` / `haori:rowmove`）と `haori:ready` の実装: いずれも購読しなければ何も起こらない追加です。`src`・`demo`・`tests` にこれらの購読はありません。
  - 0.38.0 の「編集可能な行への書き戻し」の不具合修正 3 件: 対象は `data-each` と `data-form-list` を併用した行です。`src`・`demo`・`tests` に `data-form-list` の指定はありません。
  - 0.38.0 の開発モード診断の誤警告修正: 開発モードでの警告出力のみの変更で、式の評価結果は変わりません。
  - 0.38.0 の公開デモサイトの修正・移行注記の追加: いずれもコア側のリポジトリ内の変更で、本パッケージへの影響はありません。
- 単体 58 件、E2E 20 件が通過しました（`demo/cdn.html`・`demo/admin-table.html`・`demo/modal-copy.html` は jsDelivr 上の `haori@0.38.0` を実際に読み込んで動作を確認しています）。
  - なお `demo/admin-table.html` と `demo/modal-copy.html` が読み込む haori-bootstrap 側は `0.5.3` 固定のままです（`scripts/sync-version.mjs` の更新対象に入っていません）。この 2 ページの E2E は、コアは 0.38.0、本パッケージは公開済み `0.5.3` の組み合わせを見ています。作業ツリーのコードとコア 0.38.0 の組み合わせは、上記の直接確認で担保しています。

## 0.5.15 - 2026-07-31

- デモ・README が参照するコア Haori.js を `0.32.0` から `0.37.1` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、README / README.ja の CDN 利用例）。
- コア 0.33.0 〜 0.37.1 の変更に対し、ライブラリ本体（`src`）の改修は不要です。デモは 1 か所の書き方を更新しました（下記 0.33.0）。影響の確認結果は次のとおりです。
  - 0.33.0（編集可能な行への `data-{event}-copy` / `-bind` を配列要素へ書き戻す）: 行への書き戻しは `data-each` と `data-form-list` を併用した行が対象で、`src`・`demo`・`tests` に `data-form-list` の指定はありません。ただし同じ変更で**コピー元の解釈が「その要素自身が持つ値」に変わり**（祖先から継承した値を含めない）、ボタン自身を暗黙のコピー元にしていた `demo/modal-copy.html` の「行 → 共有モーダル」は何もコピーされなくなりました。行に一意な id を付けて `data-click-copy-source="#appeal-row-{{appealId}}"` で行を明示するように更新しました（コア側のデモと同じ書き方です）。
  - 0.34.0（`data-validity` / `data-{event}-if` による手続きのブロック）: これらの属性の指定はありません。
  - 0.35.0（バインド後に実行するアクション属性を使用直前に評価）: `data-click-toast` / `data-click-dialog` の属性値の評価タイミングが変わりますが、差し替える `toast` / `dialog` は評価済みの文字列を受け取るため改修は不要です。デモの宣言はいずれも `{{}}` を含まない静的な文字列です。
  - 0.36.0（行の値反映で解決済みの宣言バインドを優先、別スコープ供給キーの診断）: 対象は `data-each` の行単位の値反映です。`data-attr-value` を使うのは `demo/modal-copy.html` の共有モーダル内の hidden 1 か所で、行の外にあるため対象外です。
  - 0.37.0（`data-enhance` / `data-enhance-new` による外部ライブラリ連携）: 宣言が無ければ何も起こらない追加機能です。本パッケージは `window.Haori` を Proxy で包んで UI 系メソッドだけを差し替えるため、`Haori.enhancers` の参照はそのまま素通しされます。
  - 0.37.1（`data-prefix` で接頭辞を変えたページでの式評価の修正）: `data-prefix` の指定はありません。
- 単体 58 件、E2E 20 件が通過しました（`demo/admin-table.html` と `demo/modal-copy.html` は jsDelivr 上の `haori@0.37.1` を実際に読み込んで動作を確認しています）。

## 0.5.14 - 2026-07-30

- デモ・README が参照するコア Haori.js を `0.31.0` から `0.32.0` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、README / README.ja の CDN 利用例）。
- コア 0.32.0 の変更（`data-store` によるブラウザストレージ連携の追加、セレクタを値に取る属性でのテンプレート式評価）に対し、本パッケージのコード改修は不要です。影響の確認結果は次のとおりです。
  - `data-store` 系はすべて `data-store` を宣言した要素だけを対象とします。`src`・`demo`・`tests` に `data-store` の指定はありません。
  - 本パッケージも Bootstrap collapse の開閉状態を sessionStorage へ永続化しますが（`src/collapse_persist.ts`）、属性は `data-haori-persist`、キーは `haori-bootstrap:collapse:` 接頭辞で、コアの `data-store` とは属性もキー空間も重なりません。
  - セレクタ属性のテンプレート式評価は、`{{}}` を含まない静的なセレクタでは従来と同じ結果になります。本パッケージでセレクタを値に取る属性を使うのは `demo/admin-table.html` の `data-intersect-bind="#admin-state"` と `demo/modal-copy.html` の `data-click-copy="#acceptModal"` の 2 箇所だけで、いずれも静的です。
  - 差し替える UI 系メソッド（`dialog` / `confirm` / `toast` / `openDialog` / `closeDialog` / `addErrorMessage` / `addMessage` / `clearMessages`）は、バインドデータの更新やセレクタの解決に関与しません。
- 単体 58 件、E2E 20 件が通過しました（`demo/admin-table.html` と `demo/modal-copy.html` は jsDelivr 上の `haori@0.32.0` を実際に読み込んで動作を確認しています）。

## 0.5.13 - 2026-07-30

- デモ・README が参照するコア Haori.js を `0.30.1` から `0.31.0` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、README / README.ja の CDN 利用例）。
- コア 0.31.0 の変更（`data-form-arg` を指定したフォームへ祖先のバインドデータを反映する機能の追加）に対し、本パッケージのコード改修は不要です。影響の確認結果は次のとおりです。
  - 変更はいずれも `data-form-arg` を指定したフォームだけを対象とします。`src`・`demo`・`tests` に `data-form-arg` の指定はありません（双方向コミットの土台、リセットの戻り先、初期表示・祖先更新時の反映のすべてが対象外）。
  - 差し替える UI 系メソッド（`dialog` / `confirm` / `toast` / `openDialog` / `closeDialog` / `addErrorMessage` / `addMessage` / `clearMessages`）は、いずれもフォーム値の書き戻しやバインドデータの更新に関与しません。
  - 送信後に行われた編集の保護がフォーム以外へのバインドにも適用されるようになりました。デモは `demo/admin-table.html` の `#admin-state` と `demo/modal-copy.html` のモーダルへバインドしますが、配下に `data-form-arg` フォームが無いため、追加された経路は該当なしで従来と同じ結果になります。
- 単体 58 件、E2E 20 件が通過しました（`demo/admin-table.html` と `demo/modal-copy.html` は jsDelivr 上の `haori@0.31.0` を実際に読み込んで動作を確認しています）。

## 0.5.12 - 2026-07-30

- デモ・README が参照するコア Haori.js を `0.30.0` から `0.30.1` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、README / README.ja の CDN 利用例）。
- コア 0.30.1 の修正（キュー待ちの属性削除が後続の書き込みを消す競合）に対し、本パッケージのコード改修は不要です。影響の確認結果は次のとおりです。
  - 本パッケージはメッセージ表示を差し替えており（`addErrorMessage` / `addMessage` / `clearMessages`）、コアの `data-message` 属性への書き込みは使いません。表示・解除はいずれも DOM を同期的に操作します。したがってコアの不具合が報告している「フェッチエラー再試行時に `data-message` が付かない」現象は本パッケージでは起こりません。
  - ただし解除処理（`clearManagedMessages`）は管理用の印（`data-haori-invalid-target` / `data-haori-valid-target`）を DOM から直接削除するため、その削除はコアの `MutationObserver` の反映経路を通ります。競合が成立すると、直後に付け直した印がコア側の遅延削除で消され、次回の解除で `is-invalid` が外れずフィールドの赤い装飾が残ったままになり得ました。コア 0.30.1 でこの経路が解消され、本パッケージ側の対処は不要です。
  - コンテナ要素（`invalid-feedback` / `alert`）の追加・削除は要素の増減であり、属性削除の経路とは別のため影響を受けません。
- 単体 58 件、E2E 20 件が通過しました（`demo/admin-table.html` と `demo/modal-copy.html` は jsDelivr 上の `haori@0.30.1` を実際に読み込んで動作を確認しています）。

## 0.5.11 - 2026-07-29

- デモ・README が参照するコア Haori.js を `0.29.0` から `0.30.0` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、README / README.ja の CDN 利用例）。
- コア 0.30.0 の変更に対し、本パッケージのコード改修は不要です。差し替える UI 系メソッド（`dialog` / `confirm` / `toast` / `openDialog` / `closeDialog` / `addErrorMessage` / `addMessage` / `clearMessages`）はいずれも式評価・バリデーション・フォーム値の書き戻しに関与しません。デモへの影響も次のとおり確認済みです。
  - `data-if` が偽の分岐をバリデーション対象から外す変更（配下のフォームコントロールへ `disabled` を付与）: デモの `data-if` は `demo/admin-table.html` の無限スクロール番兵（`data-if="hasMore"`）と「すべて表示しました」の 2 か所で、いずれも配下に入力要素を持たないため付与対象がありません。
  - 識別子として使えないバインドキーを式のスコープから外す変更: デモ・`src` にドットや記号を含む `name` やバインドキーはありません。追加された `haori.data` は任意利用のため既存の式に影響しません。
  - 入力要素の `data-{event}-bind` が編集済みの印を解除しなくなった修正: デモに `data-change-bind` / `data-input-bind` を使う箇所はありません。
  - `data-{event}-reset` で `data-each` の行が復元されるようになった修正: デモに `data-{event}-reset` / `-reset-before` を使う箇所はありません。
- 単体 58 件、E2E 20 件が通過しました（`demo/admin-table.html` と `demo/modal-copy.html` は jsDelivr 上の `haori@0.30.0` を実際に読み込んで動作を確認しています）。

## 0.5.10 - 2026-07-28

- デモ・README が参照するコア Haori.js を `0.28.0` から `0.29.0` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、README / README.ja の CDN 利用例）。
- コア 0.29.0 は破壊的変更を含みますが、本パッケージのコード改修は不要です。差し替える UI 系メソッド（`dialog` / `confirm` / `toast` / `openDialog` / `closeDialog` / `addErrorMessage` / `addMessage` / `clearMessages`）はいずれも宣言バインドの再評価やフォーム値の書き戻しに関与しません。デモへの影響も次のとおり確認済みです。
  - 確定したユーザー編集を宣言バインドの再適用より優先する変更: デモの宣言バインドは `demo/modal-copy.html` の送信用 hidden（`data-attr-value="{{appealId}}"`）だけです。`type="hidden"` は利用者が編集できないため編集済みの印が付かず、再適用の抑止は働きません。加えて式が参照するキーと入力の `name` はどちらも `appealId` で一致しています。値の供給元である `data-click-copy` は印を解除する側の操作でもあります。
  - 双方向コミットが祖先のバインドデータをフォームへ焼き付けなくなった修正: デモのフォーム内の式が参照するキー（`appealId`）は `data-click-copy` がフォーム自身へ供給するため、祖先からの継承に依存していません。
  - `data-form-arg` のコミット先の修正: デモに `data-form-arg` を指定したフォームはありません。
  - `data-{event}-reset` の初期化の修正: デモに `data-{event}-reset` / `-reset-before` を使う箇所はありません。
  - 未解決参照の開発モード警告の追加: デモは開発モード（`data-dev`）を使用しないため出力されません。
- 単体 58 件、E2E 20 件が通過しました（`demo/admin-table.html` と `demo/modal-copy.html` は jsDelivr 上の `haori@0.29.0` を実際に読み込んで動作を確認しています）。

## 0.5.9 - 2026-07-28

- デモ・README が参照するコア Haori.js を `0.27.0` から `0.28.0` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、README / README.ja の CDN 利用例）。
- コア 0.28.0 は破壊的変更を含みますが、本パッケージのコード改修は不要です。差し替える UI 系メソッド（`dialog` / `confirm` / `toast` / `openDialog` / `closeDialog` / `addErrorMessage` / `addMessage` / `clearMessages`）はいずれも描画の再評価やフォーム値の直列化に関与しません。デモへの影響も次のとおり確認済みです。
  - `data-each` の行が行外データの更新へ追従する変更: デモの `data-each`（`demo/admin-table.html` の `users`、`demo/modal-copy.html` の `appeals`）はいずれも `data-each-arg` を指定していないため、新しい規則では常に行の子孫を再評価する側になります。描画結果は変わらず、再評価の回数だけが増えます。行数は `admin-table` が可視範囲つきの一覧、`modal-copy` が数行のため、体感できる差はありません。
  - テキストで送る経路の入れ子データの直列化変更: デモに `data-form-list` の行データを GET で送る構成はありません。
  - 同名リスト（入力要素の `data-form-list`）の修正: デモに該当する構成はありません。
  - `<form>` の named access の修正: デモに `name="id"` の入力はなく、開発モード（`data-dev`）も使用していません。
  - 応答の書き戻しで送信後の編集を保護する変更: 保護は編集された入力欄のキーだけを上書きし直すもので、編集が無ければ応答がそのまま反映されます。デモの挙動は変わりません。
- 単体 58 件、E2E 20 件が通過しました（`demo/admin-table.html` と `demo/modal-copy.html` は jsDelivr 上の `haori@0.28.0` を実際に読み込んで動作を確認しています）。

## 0.5.8 - 2026-07-28

- デモ・README が参照するコア Haori.js を `0.26.2` から `0.27.0` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、README / README.ja の CDN 利用例）。
- コア 0.27.0 は破壊的変更を含みますが、本パッケージのコード改修は不要です。差し替える UI 系メソッド（`dialog` / `confirm` / `toast` / `openDialog` / `closeDialog` / `addErrorMessage` / `addMessage` / `clearMessages`）はいずれも式評価やフォーム値の収集に関与しません。デモへの影響も次のとおり確認済みです。
  - 未解決参照を正常系として扱う変更（暗黙のオプショナルチェーン、判定する式の真偽決定）: デモの式が参照するキー（`hasMore` / `status` / `name` など）は `data-bind` の初期値と応答 JSON の双方で必ず供給されるため、未解決参照の経路に入りません。`data-intersect-disabled="{{!hasMore}}"` も `hasMore` が常に存在するため真偽決定の規則は働きません。
  - 式の識別子をグローバルへ解決しなくなった変更: デモの式で使う識別子と要素の `id` に重複はありません。`name` / `status` はブラウザの同名グローバルと重なりますが、いずれも行データから供給されるため解決結果は変わりません。
  - 宣言バインドの `value` 同期（`data-attr-value` の収集値反映）: `demo/modal-copy.html` の送信用 hidden が該当し、`data-click-copy` で複製した行の値が送信ペイロードへ載ることを E2E で確認しています。
  - demo ランタイムの通信の正規化: 本パッケージのデモは `data-runtime` を指定しないため対象外です。
- 単体 58 件、E2E 20 件が通過しました（CDN デモは jsDelivr 上の `haori@0.27.0` を実際に読み込んで確認）。デモ各ページの初期表示でコンソールエラーが増えていないことも確認済みです。

## 0.5.7 - 2026-07-26

- デモ・README が参照するコア Haori.js を `0.26.1` から `0.26.2` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、README / README.ja の CDN 利用例）。
- コア 0.26.2 は、チェック状態（`checked` / `selected`）の収集値と内部値を DOM と一致させる修正です。boolean チェックボックス（`value="true"` / `value="false"`）の収集根拠を内部値から DOM の `checked` へ変更し、宣言バインド（`checked="{{式}}"` / `data-attr-checked` / `data-attr-selected`）でチェック状態を書き換えたときに内部値も同期するようになりました。
- 本パッケージのコード改修は不要です。差し替える UI 系メソッド（`dialog` / `confirm` / `toast` / `openDialog` / `closeDialog` / `addErrorMessage` / `addMessage` / `clearMessages`）はいずれもフォーム値の収集や属性評価に関与せず、デモにもチェックボックスを持つフォームは存在しないため、参照版数のみの更新です。

## 0.5.6 - 2026-07-26

- デモ・README が参照するコア Haori.js を `0.23.0` から `0.26.1` に更新しました（`demo/cdn.html`、`demo/admin-table.html`、`demo/modal-copy.html`、README / README.ja の CDN 利用例）。
- コア 0.24.0 / 0.25.0 / 0.26.0 / 0.26.1 はいずれも本パッケージのコード改修を伴わないため、参照版数のみの更新です。内訳は次のとおりです。
  - 0.24.0（`<head>` / `<title>` の実行時バインド、`data-if` が false の分岐配下をフォーム値収集から除外）: 本パッケージは `<head>` 系の属性を使用せず、デモの `data-if` も `data-each` 行内の表示切替でフォーム配下にないため影響しません。
  - 0.25.0（組み込みヘルパー `haori.now` / `haori.today` の追加）: 追加のみで既存挙動の変更はなく、本パッケージは未使用です。
  - 0.26.0（`input[type=file]` の値収集、`data-each-rendered-change`、初期スキャン中に発火したイベントの保留・再生）: 初期化順序が変わり、イベントリスナーの登録が初期スキャンより前になりました。本パッケージの `autoEnable()` はスクリプト評価時に同期実行されるため、コアの保留解除（初期化完了時）より必ず先に install が完了し、保留された手続きからも差し替え済みの UI メソッドが使われます。挙動変更「フォームコンテナを持たない `change` / `input` で対象入力の値が送信データへ反映される」は、該当する構成がデモに存在しないため影響しません。
  - 0.26.1（連続編集時にフォームの書き戻しが古い収集値で巻き戻る不具合の修正）: コア内部の修正で、本パッケージが差し替える UI メソッドとは独立しています。
- `window.Haori` の差し替えは UI 系メソッド（`dialog` / `confirm` / `toast` / `openDialog` / `closeDialog` / `addErrorMessage` / `addMessage` / `clearMessages`）のみを Proxy で上書きし、それ以外はコア実装へ委譲する方式のため、コア側の API 追加による追随は不要です。

## 0.5.5 - 2026-06-22

- `openDialog`（`data-click-open` 経由を含む）でダイアログを開く際、対象 `.modal` 配下の管理メッセージ（`invalid-feedback` / `valid-feedback` / `alert` コンテナ）と `is-invalid` / `is-valid` 状態を表示前にクリアするようにしました。これにより、バリデーションエラーを表示したモーダルを一度閉じて再度開いたとき、前回のエラーメッセージや `is-invalid` 状態が残る不具合を修正しました。クリアは open 時のみで、`closeDialog` では行いません（閉じるアニメーション中に消えるのを避けるため）。なお、コア Haori.js 0.22.3 の同種クリアはネイティブ `<dialog>` ＋ コアの `data-message` 方式専用で、Bootstrap modal ＋ 本パッケージの管理メッセージには作用しないため、本パッケージ側での対応が必要でした。

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