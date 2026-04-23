# 変更履歴

このファイルには、このプロジェクトの重要な変更を記録します。

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