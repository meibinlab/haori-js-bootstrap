---
description: "Spring Boot の設定ファイルや設定クラスを編集するときに使用します。プロファイル分離、型安全なプロパティ、セキュアな設定管理を扱います。"
applyTo: "**/src/main/resources/application*.yml, **/src/main/resources/application*.yaml, **/src/main/java/**/*Config.java, **/src/main/java/**/*Configuration.java, **/src/main/java/**/*Properties.java"
---
# Spring Boot Config 実装ルール

- 環境差分は profile ごとに整理し、設定の責務を分離する
- 機密情報をソースコードや設定ファイルへ直書きしない
- 設定値は ConfigurationProperties など型安全な方法で扱うことを優先する
- Bean 定義は必要最小限にし、自動設定で足りるものは重複定義しない
- 設定キー名は意味が分かる英語フルスペルで統一する
- 設定追加時は既存環境への互換性と初期値の妥当性を確認する
