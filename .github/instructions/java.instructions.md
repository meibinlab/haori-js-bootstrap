---
description: "このリポジトリの Java 本番ソースを編集するときに使用します。スタイル、JavaDoc、命名、設計、静的解析の制約を扱います。"
applyTo: "**/*.java"
---
# Java 実装ルール

- 回答とコードコメントは日本語で簡潔・実務的にする
- 仕様の参照元は README.md と doc/ を最優先とし、コードから仕様を推測して断定しない
- Java は Google Java Style Guide に従う
- public のクラス、メソッド、フィールドには Google Java Style Guide に準拠した JavaDoc を必須とする
- public のメソッドと public に準ずるメソッドでは、引数と戻り値を JavaDoc に必ず記載する
- package-private や protected であっても外部利用を前提とする要素には、public に準ずるものとしてコメントを必須とする
- private のメソッドやフィールドについても、役割や設計意図が自明でない場合はできるだけコメントを付ける
- フィールドコメントは /** */ 形式で 1 行で記述する
- 1 行コメントは名詞で簡潔にし、文末に句読点を付けない
- コメントに <p> タグを使わない
- 命名は英語フルスペルで統一し、不要な略語やローマ字を使わない
- DRY と SOLID を守り、重複コードを避ける
- Lombok は必要性が明確な場合のみ使う
- 整形は Spotless と eclipse-java-google-style.xml を前提にする
- google_checks_custom.xml と pmd-ruleset.xml は変更しない
