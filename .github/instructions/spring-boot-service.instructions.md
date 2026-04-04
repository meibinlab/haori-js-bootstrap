---
description: "Spring Boot の Service クラスを編集するときに使用します。トランザクション境界、ユースケース単位のメソッド設計、業務ロジックとアダプタの分離を扱います。"
applyTo: "**/src/main/java/**/*Service.java, **/src/main/java/**/*ServiceImpl.java"
---
# Spring Boot Service 実装ルール

- Service はユースケース単位で責務を持ち、Controller と Repository の橋渡し以上の意味を持たせる
- トランザクション境界は Service 層で明確にする
- 外部連携、永続化、計算ロジックが混在する場合は責務分離を検討する
- 条件分岐が増えた場合は private メソッドや補助クラスへ分割する
- 例外は握りつぶさず、上位層で扱える形にそろえる
- 再利用のためだけに過度に汎用化せず、現在のユースケースに対して読みやすく保つ
