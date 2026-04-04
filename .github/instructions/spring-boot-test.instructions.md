---
description: "Spring Boot のテストを編集するときに使用します。テストスライス、結合テスト範囲、再現性、Web 層や永続化層の検証を扱います。"
applyTo: "**/src/test/java/**/*ControllerTest.java, **/src/test/java/**/*ServiceTest.java, **/src/test/java/**/*RepositoryTest.java, **/src/test/java/**/*IntegrationTest.java, **/src/test/java/**/*ApplicationTest.java"
---
# Spring Boot テスト実装ルール

- 単体テスト、スライステスト、結合テストの目的を分ける
- Web 層は WebMvcTest、永続化層は DataJpaTest など、必要最小限のテストスライスを優先する
- SpringBootTest はアプリ全体の起動確認や統合確認など必要な場合に限定する
- 正常系、異常系、バリデーションエラー、例外変換を確認する
- テストデータは各テストで自己完結させ、実行順序に依存させない
- モックの使いすぎで実装詳細に結び付いたテストにしない
- API や永続化のテストでは境界値と代表的な失敗ケースを明確にする