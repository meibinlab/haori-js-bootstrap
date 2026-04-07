---
description: "Spring Boot アプリケーションの domain パッケージ配下にある Entity クラスを編集するときに使用します。Entity の責務、永続化アノテーション、ドメインモデルの整合性を扱います。"
applyTo: "**/src/main/java/**/domain/**/*Entity.java"
---
# Spring Boot Domain Entity 実装ルール

- Entity は domain パッケージ内の永続化対象ドメインモデルとして扱い、Controller や API 都合の責務を持ち込まない
- Entity の責務は状態と整合性の表現に寄せ、画面表示用やレスポンス整形用の処理を入れない
- JPA アノテーションは必要最小限にとどめ、永続化都合でドメインの意味を壊さない
- ID、必須項目、関連の多重度は仕様書や ER 図を正として表現する
- 可変項目の更新は無秩序な setter 乱用を避け、整合性を保てるメソッド設計を優先する
- equals と hashCode の実装や Lombok 利用は JPA の挙動を踏まえて慎重に扱う
- 双方向関連は必要性を明確にし、循環参照や過剰な関連付けを避ける
- Entity を API の入出力 DTO として直接公開しない
- 命名は英語フルスペルで統一し、テーブル都合だけの略語をクラス名やフィールド名へ持ち込まない