# 変更履歴

このファイルには、このプロジェクトの重要な変更を記録します。

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