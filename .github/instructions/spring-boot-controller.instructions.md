---
description: "Spring Boot の Controller や REST エンドポイントを編集するときに使用します。リクエストとレスポンス設計、バリデーション、HTTP の意味付け、薄い Controller の原則を扱います。"
applyTo: "**/src/main/java/**/*Controller.java, **/src/main/java/**/*RestController.java"
---
# Spring Boot Controller 実装ルール

- Controller は HTTP 入出力の責務に限定し、業務ロジックを持たせない
- リクエスト DTO とレスポンス DTO を必要に応じて分離する
- 入力検証は Bean Validation を優先し、手続き的なバリデーションの重複を避ける
- HTTP ステータスコードは処理結果に応じて一貫した意味で返す
- API のエラー応答形式は共通化し、個別 Controller ごとの差異を増やさない
- パラメータ名、レスポンス項目名、メソッド名は英語フルスペルで統一する
- OpenAPI や doc/ に API 仕様がある場合はそれを正とする
