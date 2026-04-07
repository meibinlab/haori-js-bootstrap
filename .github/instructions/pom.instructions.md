---
description: "pom.xml を編集するときに使用します。親 POM の使い方、依存管理、プラグイン整合性、Maven 設定の安全性を扱います。"
applyTo: "**/pom.xml"
---
# pom.xml 実装ルール

- このリポジトリは Maven 親 POM の共通化を目的とすることを前提にする
- 既存の親子構成、pluginManagement、dependencyManagement の責務を崩さない
- 依存やプラグインの追加変更は必要性を明確にし、影響範囲を意識する
- バージョンは既存の管理方式に合わせ、重複定義を避ける
- google_checks_custom.xml と pmd-ruleset.xml を利用する前提を崩さない
- spotless、checkstyle、pmd、jacoco など品質系設定は安易に緩めない
- 子プロジェクト利用を前提に、再利用性と互換性を優先する
