# Event Storming Diagram Generator

イベントストーミングを実施し、draw.io XML 形式でダイアグラムを生成する。

## 呼び出し方

```
/project:event-storming [引数]
```

引数の種類：
- **空（省略）**: プロジェクトの全ドメインを対象に `docs/definition/event_storming.md` を読む
- **ドメイン名**: 例 `認証`、`auth`、`視聴`、`viewing` → 該当ドメインのみを対象
- **自由記述**: 例 `注文管理システム: 顧客が商品を選び注文するフロー` → プロジェクトdocを読まず記述内容をモデリング

---

## Phase 1: Discovery（スコープ確認）

### 1a. 入力を解決する

`$ARGUMENTS` が **空** の場合:
- `docs/definition/event_storming.md` を読む
- `docs/definition/technical_spec.md` が存在すれば読む
- `docs/definition/roadmap.md` が存在すれば読む
- スコープを「全ドメイン」に設定する

`$ARGUMENTS` が **単語 or 短いキーワード**（ドメイン名と判断できる）の場合:
- `docs/definition/event_storming.md` を読む
- 一致するドメインのセクションのみを対象とする
- 該当ドメインが見つからない場合は候補一覧を提示してユーザーに選択を促す

`$ARGUMENTS` が **長い自由記述**（ドメイン名ではなくシステム説明）の場合:
- プロジェクトdocを読まない
- 提供された記述内容に基づいてモデリングを行う

### 1b. スコープ確認

処理を進める前に以下のブロックを出力し、ユーザーに確認を取る:

```
## Event Storming スコープ確認
- 対象: [ドメイン名 または "全ドメイン"]
- ソース: [読んだファイルパス または "提供された記述"]
- モデリング対象ドメイン: [一覧]
- 検出された要素の概算: [イベント数、コマンド数など]
```

「この内容でモデリングを進めてよいですか？ (y/修正指示)」と問う。

`y` の回答を受けてから Phase 2 へ進む。修正指示があれば内容を調整して再提示する。

---

## Phase 2: Event Storming モデリング

ソース文書を分析し、以下の分類で要素を抽出する。

### 要素の分類

| 種類 | 色 | 形状 | ルール |
|------|----|------|--------|
| Domain Event（ドメインイベント） | 橙 `#FF8000` | Rectangle | 「〜した」過去形の事実。不変。 |
| Command（コマンド） | 青 `#0066CC` | Rectangle | イベントを引き起こすユーザーアクション |
| Aggregate（集約） | 黄 `#FFFF00` | Rectangle | ビジネスルールを守る責任を持つ集約 |
| Policy（ポリシー） | 紫 `#9933FF` | Rectangle | 「〜が起きたとき、〜する」自動反応ルール |
| Read Model（リードモデル） | 緑 `#00CC66` | Rectangle | UIに表示するデータの投影（クエリ結果） |
| External System（外部システム） | 赤 `#FF3333` | Rectangle | 外部API・サービス |
| Actor（アクター） | ピンク `#FFCCCC` | Person shape | イベントを起こすユーザー役割 |

### 抽出ルール

各ドメインについて以下を列挙する:
1. **Actors** — 関係する役割（スタッフ、マネージャーなど）
2. **Commands** — タイムライン順のユーザーアクション
3. **Domain Events** — コマンドまたはポリシーによって引き起こされた事実
4. **Aggregates** — ビジネスルール守護と不変条件
5. **Policies** — 「トリガー → アクション」ペア
6. **Read Models** — UI表示用データ投影
7. **External Systems** — 外部サービス・API

### ドメインごとにモデリングサマリー表を出力する

```
### [ドメイン名]

| 順番 | 種類 | ラベル | トリガー | 備考 |
|------|------|--------|----------|------|
| 1 | Actor | スタッフ | — | 現場スタッフ |
| 2 | Command | PINコードを入力する | スタッフ | — |
| 3 | Aggregate | Auth | PINコードを入力する | 4〜6桁ルール |
| 4 | Domain Event | スタッフ認証に成功した | Auth | — |
| 5 | Policy | セッションを開始する | 認証成功 | — |
...
```

全ドメインの表を表示後、「このモデリング内容でdraw.ioを生成してよいですか？ (y/修正指示)」と問う。

---

## Phase 3: Draw.io XML 生成

### キャンバス設定

- ページサイズ: A3横（幅1654px）
- ページ高さ: `60 + (ドメイン数 × 230)` px（凡例バー60px + ドメインあたり230px）
- グリッド: 10px

### レイアウトアルゴリズム

**凡例バー（y=10）:**
凡例バーをキャンバス最上部（y=10）に配置する。要素タイプごとに20×20pxの色付きボックスとラベルを横並びに配置（間隔160px）。

```
x=10:  [橙] Domain Event
x=170: [青] Command
x=330: [黄] Aggregate
x=490: [紫] Policy
x=650: [緑] Read Model
x=810: [赤] External System
x=970: [ピンク人型] Actor
```

**スイムレーン（ドメインごと）:**
- 幅: 1600px
- 高さ: 220px
- 縦位置: `y = 60 + (ドメインインデックス × 230)`（10pxのギャップ）
- 左側ラベル: ドメイン名（縦書き）

**レーン内の要素配置:**
- タイムライン: 左→右
- 開始x: 80px（レーン左端からのオフセット）
- 要素サイズ: 幅160px × 高さ60px
- 要素間ギャップ: 20px（1要素あたりの水平スパン: 180px）
- レーン内の垂直中央: `y = 80`（レーン相対座標）
- 配置順序: `Actor → Command → [Aggregate] → Domain Event → Policy/ReadModel`
- Policyが複数ある場合: 同じx位置で縦に積む（y offset +70）
- Phase 2以降の要素: 同色 + `dashed=1;` をスタイルに追加
- Hot Spot: 赤いダイヤモンド形で "HS-N" ラベルを付ける

**矢印:**
- Actor → Command、Command → Event、Event → Policy のつながりを矢印で表す
- 座標はスイムレーン相対

**ID割り当て規則:**
- `id="0"` と `id="1"` は予約（rootセル）
- 凡例セル: `id="leg-[type]"` （例: `leg-event`, `leg-command`）
- スイムレーン: `id="lane-[domainIndex]"` （例: `lane-0`, `lane-1`）
- レーン内要素: `id="[laneId]-[elementIndex]"` （例: `lane-0-1`, `lane-0-2`）
- 矢印: `id="arr-[sequential]"` （例: `arr-1`, `arr-2`）

### スタイル文字列（必ずこの値を使う）

**Domain Event（橙）:**
```
rounded=1;whiteSpace=wrap;html=1;fillColor=#FF8000;strokeColor=#CC6600;fontColor=#FFFFFF;fontStyle=1;fontSize=11;
```

**Command（青）:**
```
rounded=1;whiteSpace=wrap;html=1;fillColor=#0066CC;strokeColor=#004499;fontColor=#FFFFFF;fontStyle=1;fontSize=11;
```

**Aggregate（黄）:**
```
rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFF00;strokeColor=#CCCC00;fontColor=#000000;fontStyle=1;fontSize=11;
```

**Policy（紫）:**
```
rounded=1;whiteSpace=wrap;html=1;fillColor=#9933FF;strokeColor=#6600CC;fontColor=#FFFFFF;fontStyle=1;fontSize=11;
```

**Read Model（緑）:**
```
rounded=1;whiteSpace=wrap;html=1;fillColor=#00CC66;strokeColor=#009944;fontColor=#FFFFFF;fontStyle=1;fontSize=11;
```

**External System（赤）:**
```
rounded=1;whiteSpace=wrap;html=1;fillColor=#FF3333;strokeColor=#CC0000;fontColor=#FFFFFF;fontStyle=1;fontSize=11;
```

**Actor（Person shape、ピンク）:**
```
shape=mxgraph.basic.person;fillColor=#FFCCCC;strokeColor=#CC9999;fontColor=#000000;fontStyle=1;fontSize=11;
```

**Swimlane:**
```
swimlane;startSize=30;fillColor=#f5f5f5;fontColor=#333333;strokeColor=#666666;fontSize=14;fontStyle=1;
```

**Arrow:**
```
edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;
```

**Phase 2以降の要素（破線ボーダーを追加）:**
上記スタイルの末尾に `dashed=1;dashPattern=8 4;` を追加する。

**Hot Spot（赤ダイヤモンド）:**
```
rhombus;whiteSpace=wrap;html=1;fillColor=#FF0000;strokeColor=#CC0000;fontColor=#FFFFFF;fontStyle=1;fontSize=10;
```

### XMLテンプレート

以下の構造に従って完全な有効XMLを生成する。**子要素の座標は必ずスイムレーンからの相対座標にする**（`parent="[swimlane_id]"` を使用）。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1654" pageHeight="[COMPUTED]" math="0" shadow="0">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>

    <!-- 凡例バー -->
    <mxCell id="leg-title" value="凡例" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;fontSize=13;fontStyle=1;" vertex="1" parent="1">
      <mxGeometry x="10" y="10" width="60" height="30" as="geometry"/>
    </mxCell>
    <!-- 要素タイプごとの凡例ボックス（x=80から開始、160px間隔） -->
    <mxCell id="leg-event" value="Domain Event" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FF8000;strokeColor=#CC6600;fontColor=#FFFFFF;fontStyle=1;fontSize=10;" vertex="1" parent="1">
      <mxGeometry x="80" y="10" width="120" height="30" as="geometry"/>
    </mxCell>
    <mxCell id="leg-command" value="Command" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#0066CC;strokeColor=#004499;fontColor=#FFFFFF;fontStyle=1;fontSize=10;" vertex="1" parent="1">
      <mxGeometry x="210" y="10" width="120" height="30" as="geometry"/>
    </mxCell>
    <mxCell id="leg-aggregate" value="Aggregate" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFF00;strokeColor=#CCCC00;fontColor=#000000;fontStyle=1;fontSize=10;" vertex="1" parent="1">
      <mxGeometry x="340" y="10" width="120" height="30" as="geometry"/>
    </mxCell>
    <mxCell id="leg-policy" value="Policy" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#9933FF;strokeColor=#6600CC;fontColor=#FFFFFF;fontStyle=1;fontSize=10;" vertex="1" parent="1">
      <mxGeometry x="470" y="10" width="120" height="30" as="geometry"/>
    </mxCell>
    <mxCell id="leg-readmodel" value="Read Model" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#00CC66;strokeColor=#009944;fontColor=#FFFFFF;fontStyle=1;fontSize=10;" vertex="1" parent="1">
      <mxGeometry x="600" y="10" width="120" height="30" as="geometry"/>
    </mxCell>
    <mxCell id="leg-external" value="External System" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FF3333;strokeColor=#CC0000;fontColor=#FFFFFF;fontStyle=1;fontSize=10;" vertex="1" parent="1">
      <mxGeometry x="730" y="10" width="120" height="30" as="geometry"/>
    </mxCell>
    <mxCell id="leg-actor" value="Actor" style="shape=mxgraph.basic.person;fillColor=#FFCCCC;strokeColor=#CC9999;fontColor=#000000;fontStyle=1;fontSize=10;" vertex="1" parent="1">
      <mxGeometry x="860" y="10" width="40" height="30" as="geometry"/>
    </mxCell>

    <!-- ドメインスイムレーン（domainIndex=0から順に） -->
    <mxCell id="lane-0" value="[ドメイン名]" style="swimlane;startSize=30;fillColor=#f5f5f5;fontColor=#333333;strokeColor=#666666;fontSize=14;fontStyle=1;" vertex="1" parent="1">
      <mxGeometry x="27" y="60" width="1600" height="220" as="geometry"/>
    </mxCell>
    <!-- レーン内要素（相対座標） -->
    <mxCell id="lane-0-1" value="[Actor名]" style="shape=mxgraph.basic.person;fillColor=#FFCCCC;strokeColor=#CC9999;fontColor=#000000;fontStyle=1;fontSize=11;" vertex="1" parent="lane-0">
      <mxGeometry x="30" y="80" width="60" height="60" as="geometry"/>
    </mxCell>
    <mxCell id="lane-0-2" value="[Command名]" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#0066CC;strokeColor=#004499;fontColor=#FFFFFF;fontStyle=1;fontSize=11;" vertex="1" parent="lane-0">
      <mxGeometry x="120" y="80" width="160" height="60" as="geometry"/>
    </mxCell>
    <!-- ... 以降の要素を続ける ... -->

    <!-- 矢印 -->
    <mxCell id="arr-1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" source="lane-0-1" target="lane-0-2" parent="lane-0">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>

  </root>
</mxGraphModel>
```

### 生成時の注意点

1. 各ドメインを `event_storming.md` に記載された順序で処理する
2. **子要素の座標は必ずスイムレーン相対座標**（絶対座標にしない）
3. Phase 2以降のイベントは破線ボーダーで区別する
4. 要素数が多い場合、x座標をはみ出させず x=1580 を超えないこと（超える場合は y 方向に折り返す）
5. Policyが複数ある場合は同じx列で y を +75 ずつずらして積む

---

## Phase 4: ファイル出力

### 出力ファイル名の決定

| 入力パターン | ファイル名 |
|-------------|-----------|
| 空（全ドメイン） | `all-domains.drawio` |
| 「認証」「auth」 | `auth.drawio` |
| 「閲覧」「browsing」 | `browsing.drawio` |
| 「視聴」「viewing」 | `viewing.drawio` |
| 「管理」「management」 | `management.drawio` |
| 「分析」「analytics」 | `analytics.drawio` |
| 自由記述 | 記述から適切な英語スラッグを生成 |

### ファイル書き込み手順

1. `docs/event-storming/` ディレクトリが存在しない場合は作成する
2. 上記で決定したパスに XML を書き込む
3. 書き込み完了後、絶対パスをユーザーに通知する

---

## Phase 5: レビューサマリー

ファイル書き込み完了後、以下の形式でサマリーを出力する:

```
## 生成完了: docs/event-storming/[ファイル名]

### 含まれる要素数
| ドメイン | Events | Commands | Aggregates | Policies | ReadModels | ExternalSystems | Actors |
|---------|--------|----------|------------|---------|------------|-----------------|--------|
| [ドメイン名] | N | N | N | N | N | N | N |
| 合計 | N | N | N | N | N | N | N |

### Hot Spots（未解決課題）
- HS-N: [内容]

### draw.io での開き方
1. https://app.diagrams.net を開く → File > Open from > Device でファイルを選択
2. または VSCode の「Draw.io Integration」拡張機能で `.drawio` ファイルを直接開く

### 次のステップ提案
- 特定ドメインのみ再生成: `/project:event-storming [ドメイン名]`
- ドキュメントを更新後に全体を再生成: `/project:event-storming`
- Hot Spot の議論が完了したら `docs/definition/event_storming.md` を更新してから再実行を推奨
```

---

## エラーハンドリング

**ソースdocが存在せず引数もない場合:**
```
エラー: イベントストーミングドキュメントが見つかりません。
`docs/definition/event_storming.md` を作成するか、ドメイン説明を引数として渡してください。
例: /project:event-storming ユーザー認証システム: ユーザーがIDとパスワードでログインするフロー
```

**指定ドメインが見つからない場合:**
```
「[ARGUMENTS]」に一致するドメインが見つかりませんでした。
以下から選択してください:
- 認証（auth）
- 閲覧（browsing）
- 視聴（viewing）
- 管理（management）
- 分析（analytics）
```

**要素数が多すぎる場合（8ドメイン超 or 60要素超）:**
複数ファイルに分割する（例: `all-domains-part1.drawio`, `all-domains-part2.drawio`）。
どのドメインがどのファイルに含まれるかをサマリーに記載する。
