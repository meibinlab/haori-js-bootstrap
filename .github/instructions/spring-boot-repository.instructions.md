---
description: "Spring Boot の Repository、JPA Entity、永続化関連クラスを編集するときに使用します。永続化境界、Entity 設計、クエリの安全性を扱います。"
applyTo: "**/src/main/java/**/*Repository.java, **/src/main/java/**/*Entity.java, **/src/main/java/**/*JpaRepository.java"
---
# Spring Boot Repository 実装ルール

- Repository は永続化責務に限定し、業務ロジックを持ち込まない
- Entity を API の入出力モデルとして直接使い回さない
- JPA を使う場合は N+1 や遅延読み込みの影響を意識する
- クエリは性能と可読性の両方を考慮し、複雑になりすぎたら責務を見直す
- DB 方言依存の実装は必要性を明示し、影響範囲を把握する
- 永続化層の都合を上位層へ漏らしすぎないようにする
