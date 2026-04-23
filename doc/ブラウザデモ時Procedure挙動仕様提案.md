# Haori.js デモ時 Procedure 挙動仕様提案

## 1. 目的

本書は、Haori.js をシステム組込時とデモ表示時で切り替えるための仕様案を整理する。主眼は、既存の Procedure 属性体系を大きく増やさず、組込時の HTTP 意味論を壊さずに、デモ表示時だけ見せ方に適した通信挙動へ切り替えることである。

## 2. 対象範囲

- Haori.js の実行モード識別
- Procedure の `data-fetch` 系通信挙動
- 既存イベントを利用したログ表示方針
- haori-js-bootstrap の demo 表示で併用しやすい追加仕様

## 3. 前提

- Procedure は `data-fetch`、`data-click-fetch`、`data-click-fetch-method` などの fetch 系属性を扱う。
- 既存 Procedure は `GET` / `HEAD` / `OPTIONS` の場合に payload をクエリ化し、それ以外は `Content-Type` に応じて body 化する。
- 実行順序として `before-run` / `after-run` があり、通信イベントとして `haori:fetchstart` / `haori:fetchend` / `haori:fetcherror` がある。
- Env.detect は `data-dev` と localhost 系ホストで開発モードを判定するが、組込時とデモ表示時を直接分離する公開概念はまだない。
- デモ表示時は、ブラウザ上で通信内容を見せやすいことを優先する。

## 4. 推奨仕様

### 4.1 実行モード名

実行モード名は次の 2 値を推奨する。

- `embedded`: システム組込時
- `demo`: デモ表示時

`browser-demo` は意味が明確ではあるが長いため、公開仕様では `demo` を推奨する。

### 4.2 切替方法

切替は明示 opt-in を基本とする。

公開 API 名は次の形で確定する。

- runtime 名: `embedded` | `demo`
- IIFE 導線: `data-runtime="demo"`
- ESM 導線: `install({runtime: 'demo'})`
- 既存 API 維持: `install(options)` / `uninstall()` / `isInstalled()`

トップレベルの `setRuntime()` は追加しない。runtime は既存の options 集約方針に合わせて `InstallOptions.runtime` で受ける。

#### IIFE 利用時

haori.js の script 属性で指定する。

```html
<script src="/dist/haori.iife.js" data-runtime="demo"></script>
```

#### ESM 利用時

既存の install options で指定する。

```js
import { install } from 'haori-bootstrap';

install({runtime: 'demo'});
```

#### 既定値

- 既定値は `embedded`
- localhost だから自動的に `demo` にする設計は採らない

### 4.3 Procedure の挙動

`runtime === 'demo'` の場合に限り、Procedure の通信処理を次のように変更する。

1. `data-fetch-method` または `data-click-fetch-method` が未指定なら現行どおり `GET` とする。
2. 指定メソッドが `GET` / `HEAD` / `OPTIONS` の場合は現行どおりとする。
3. 指定メソッドがそれ以外の場合は、次の 2 つを分離する。
   - `requestedMethod`: 属性で指定された本来メソッド
   - `effectiveMethod`: 実際の通信メソッド。`GET` 固定
4. payload は既存の `GET` 系ルールと同じくクエリパラメータへ直列化する。
5. body は送らない。
6. `Content-Type` は body 用の意味を持たないため、省略を基本とする。

この仕様により、マークアップ上は既存の `POST` / `DELETE` 意図を保持しつつ、デモ表示では一覧取得や疑似削除のような説明を `GET` ベースで見せやすくする。

### 4.4 適用範囲

本仕様は Procedure の fetch 系に適用する。

- `data-fetch`
- `data-click-fetch`
- `data-change-fetch`
- `data-intersect-fetch`
- その他 `data-{event}-fetch` 系

要素単位で個別に切り替えるのではなく、runtime 単位で一括適用する。

haori-js-bootstrap 側では runtime の導線だけを公開し、実際の判定と通信正規化は haori-js 側の責務とする。

### 4.5 ログ仕様

デモ表示時に非 `GET` 系を `GET` 化した場合は、通信直前に送信予定パラメータをログ出力する。

推奨ログ内容:

- `runtime`
- `requestedMethod`
- `effectiveMethod`
- `url`
- `payload`
- `queryString`
- `triggerAttribute`

推奨出力先:

1. 既存の `Log` 経由の構造化ログ
2. `haori:fetchstart` detail の拡張

`haori:fetchstart` の追加 detail 候補:

```ts
{
  runtime: 'embedded' | 'demo',
  requestedMethod: string,
  effectiveMethod: string,
  transportMode: 'http' | 'query-get',
  payload?: Record<string, unknown>,
  queryString?: string,
}
```

既存の `url` や `options` などは維持し、追加項目のみを増やす。

### 4.6 実行順序

- `before-run` は現行仕様どおり先に実行する。
- `demo` 用の `GET` 正規化は `before-run` の結果確定後、`fetchstart` 発火前に行う。
- `after-run` は現行どおりレスポンス処理後に動作する。

### 4.7 API 確定理由

API 名は `install({runtime})` を採用する。

| 候補 | 採否 | 理由 |
| ---- | ---- | ---- |
| `install({runtime: 'demo'})` | 採用 | 既存の `install(options)` と同系統で、設定を `InstallOptions` に集約できる |
| `setRuntime('demo')` | 不採用 | `install` と別系統の状態 API になり、呼び出し順依存と責務分散が増える |
| `configure({runtime: 'demo'})` | 不採用 | `install` と役割が重複し、公開面だけ増える |

## 5. 代替案

| 案 | 内容 | 利点 | 懸念 |
| ---- | ---- | ---- | ---- |
| 推奨案 | `runtime="demo"` で一括切替する | 既存マークアップ修正が少ない | Env と Procedure の両方に手が入る |
| 代替案 A | `data-fetch-transport="http|query-get"` を要素単位で指定する | 画面単位で細かく制御できる | 属性が増え、説明が複雑になる |
| 代替案 B | `before-run` で都度書き換える | コア実装変更を最小化しやすい | ロジックが画面に分散する |

## 6. デモ表示向けの追加仕様候補

以下は Procedure 本体へ必須で入れるのではなく、haori-js-bootstrap の demo 表示補助として実装候補にする。

### 6.1 リクエストログパネル

- `haori:fetchstart` / `haori:fetchend` / `haori:fetcherror` を一覧表示する。
- URL、`requestedMethod`、`effectiveMethod`、payload、所要時間を表示する。

### 6.2 変換バッジ

- `DELETE -> GET` のように変換結果を見せる。
- デモでの正規化を誤解なく説明できる。

### 6.3 注意ラベル

- 画面上に「demo モードのため非 GET は GET に変換して送信」と明示する。

### 6.4 レスポンス表示

- 最後のレスポンス JSON を整形表示する。
- バインド結果と並べて見せると理解しやすい。

## 7. 実装タスク

### 7.1 haori-js

1. `embedded` / `demo` の runtime 型を定義し、Env に既定値 `embedded` の runtime 保持と参照 API を追加する。
2. Env.detect で haori.js script の `data-runtime` を読み取り、無効値は `embedded` に正規化する。
3. Procedure の fetch 実行経路で runtime を参照し、`demo` 時だけ非 `GET` / `HEAD` / `OPTIONS` を `effectiveMethod='GET'`、query 化、body 省略へ正規化する。
4. `haori:fetchstart` detail とログに `runtime`、`requestedMethod`、`effectiveMethod`、`transportMode`、`payload`、`queryString` を追加し、既存項目互換を維持する。
5. runtime 判定と demo 正規化の単体テストを追加し、既存 fetch 系テストが通ることを確認する。
6. README と docs/ja/specs.md に `data-runtime`、既定値 `embedded`、demo 時の通信正規化を追記する。

### 7.2 haori-js-bootstrap

1. `InstallOptions` に `runtime?: 'embedded' | 'demo'` を追加し、`install({runtime})` が haori-js 側の runtime へ反映されるようにする。
2. install の解決済み設定に runtime を含め、再 install 時も runtime が維持されることを確認する。
3. README、README.ja.md、demo、提案書の ESM 例を `install({runtime: 'demo'})` に統一し、IIFE 例は `data-runtime` 前提で整合させる。
4. install options の runtime 指定と demo 動作のテストを追加し、公開 API 契約が固定化されていることを確認する。

## 8. 未解決事項

- `Log` と console のどちらを既定出力にするか。
- `haori:fetchstart` detail に payload を必須で載せるか。

## 9. 推奨結論

推奨結論は、`runtime` の値として `embedded` と `demo` を用意し、`demo` 時だけ Procedure の非 `GET` 系通信を実通信上 `GET` に正規化する案である。公開 API は `install({runtime})` / `uninstall()` / `isInstalled()` で確定し、既存の `data-click-fetch-method` などは変更しない。本来の HTTP 意図は `requestedMethod` として保持し、`haori:fetchstart` detail とログで `effectiveMethod`、payload、queryString を可視化する構成が最も整合的である。

この案なら、組込時の HTTP 意味論を既定で守りつつ、ブラウザ単体デモでは説明しやすい挙動にできる。