---
description: "Spring Boot アプリケーションコードを編集するときに使用します。レイヤードアーキテクチャ、依存性注入、例外処理、フレームワーク優先の設計判断を扱います。"
applyTo: "**/src/main/java/**/*.java"
---
# Spring Boot 実装ルール

- Spring Boot の自動設定を優先し、不要な独自設定を増やさない
- Controller、Service、Repository の責務分割を明確にする
- DI はコンストラクタインジェクションを優先する
- Controller に業務ロジックや永続化処理を書かない
- Service はユースケース単位で責務を持ち、複雑化したらクラス分割を検討する
- Repository は永続化責務に限定し、業務判断を持ち込まない
- 設定値は application.yml などの設定ファイルと型安全なプロパティクラスに寄せる
- 例外は共通ハンドラで統一し、エラー応答形式をばらつかせない
- Spring Boot の慣習と既存構成を尊重し、大きな設計変更は必要性を明示する
