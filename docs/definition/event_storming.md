# イベントストーミング: FC Manual Viewer

> 手法: Event Storming (Big Picture + Design Level)
> 作成日: 2026-03-19
> 参加者: CEO, PdM, Engineer, Designer, Security Reviewer

---

## 凡例

| 色（ポストイット） | 種類 | 説明 |
|-----------------|------|------|
| 🟠 橙 | **Domain Event** | 「過去形」で起きた事実。不変。 |
| 🔵 青 | **Command** | イベントを引き起こすアクション（ユーザーの意図） |
| 🟡 黄 | **Aggregate** | ビジネスルールを守る責任を持つ集約 |
| 🟣 紫 | **Policy** | 「〜が起きたとき、〜する」の自動反応ルール |
| 🟢 緑 | **Read Model** | 画面に表示するデータの投影（クエリ結果） |
| 🔴 赤 | **External System** | 外部サービス・APIとの連携 |
| 🧑 人 | **Actor** | イベントを起こすユーザー（役割） |

---

## ドメイン全体マップ

```
【認証ドメイン】→【閲覧ドメイン】→【視聴ドメイン】→【記録ドメイン】
      ↕                                                      ↕
【管理ドメイン】←────────────────── 【分析ドメイン】──────────────
```

---

## 1. 認証ドメイン

### タイムライン

```
[スタッフ] → 🔵 デバイスで開く
                 ↓
            🟠 デバイスでアプリが起動した
                 ↓
[スタッフ] → 🔵 PINコードを入力する
                 ↓
🟡 Auth Aggregate ── ルール: PIN は 4〜6桁。5回失敗で30分ロック
                 ↓
            🟠 スタッフ認証に成功した  ────→  🟣 セッションを開始する
            🟠 スタッフ認証に失敗した  ────→  🟣 失敗回数をカウントする
            🟠 連続失敗ロックが発動した ────→  🟣 管理者に通知する（Phase 2）
```

### Actors
- **Staff**（現場スタッフ）: PIN入力でログイン
- **Manager**（店舗マネージャー）: スタッフのPINをリセット可能
- **HQ Admin**（本部管理者）: 全店舗の設定を管理

### Events

| # | Domain Event | Trigger Command | Aggregate |
|---|-------------|----------------|-----------|
| A-1 | スタッフ認証に成功した | PINコードを入力する | Auth |
| A-2 | スタッフ認証に失敗した | PINコードを入力する | Auth |
| A-3 | 連続失敗ロックが発動した | (Policy: A-2が5回) | Auth |
| A-4 | セッションが開始された | (Policy: A-1の後) | Auth |
| A-5 | セッションが自動タイムアウトした | (Policy: 無操作15分) | Auth |
| A-6 | スタッフがログアウトした | ログアウトボタンを押す | Auth |
| A-7 | PINがリセットされた | マネージャーがPINリセットした | Auth |

### Policies

| Policy | Trigger | Action |
|--------|---------|--------|
| セッション開始 | A-1（認証成功） | セッションCookieを発行し、最終ログイン日時を記録 |
| 自動タイムアウト | 無操作15分経過 | セッション破棄 → ログイン画面へリダイレクト |
| ロック発動 | 認証失敗5回 | 30分ロック。管理者にアラート（Phase 2） |
| ログ記録 | 全認証イベント | 認証ログに記録（Phase 2） |

---

## 2. 閲覧ドメイン（コンテンツ選択）

### タイムライン

```
[スタッフ] → 🔵 ホーム画面を開く
                 ↓
            🟢 ブランド一覧（Read Model）
                 ↓
[スタッフ] → 🔵 業態を選択する（例: うなぎ）
                 ↓
            🟠 業態が選択された
                 ↓
            🟢 カテゴリ一覧（Read Model）
                 ↓
[スタッフ] → 🔵 カテゴリを選択する（例: うなぎ捌き）
                 ↓
            🟠 カテゴリが選択された
                 ↓
            🟢 動画一覧（Read Model）
                 ↓
[スタッフ] → 🔵 動画を選択する（例: うなぎの捌き方）
                 ↓
            🟠 動画が選択された
```

### Events

| # | Domain Event | Trigger Command | Read Model |
|---|-------------|----------------|-----------|
| B-1 | ブランド一覧が表示された | ホーム画面を開く | BrandListView |
| B-2 | 業態が選択された | 業態カードをタップする | CategoryListView |
| B-3 | カテゴリが選択された | カテゴリカードをタップする | MovieListView |
| B-4 | 動画が選択された | 動画カードをタップする | SequencePlayerView |
| B-5 | QRコードで特定ステップが開かれた | QRコードをスキャンする | SequencePlayerView（指定ステップ） |

### Read Models

```
BrandListView:
  - brand.id, brand.name, brand.themeColor, brand.isActive
  - ※ allowedBranchIds フィルタ適用（Phase 2: ログインユーザーの店舗IDで絞り込み）

CategoryListView:
  - category.id, category.name, category.iconEmoji, category.displayOrder
  - categoryWithMovieCount（集計値）

MovieListView:
  - movie.id, movie.title, movie.thumbnailUrl, movie.totalSteps
  - movie.estimatedMinutes, movie.difficulty

SequencePlayerView:
  - brand, category, movie（全フィールド）
  - sequences[]（currentStep含む全ステップ）
  - currentSequence
```

---

## 3. 視聴ドメイン（シーケンス再生）

### タイムライン

```
[スタッフ] → 🔵 シーケンス再生画面を開く
                 ↓
            🟠 Step 1 の動画再生が開始された
                 ↓
🔴 YouTube API ── onStateChange イベント受信
                 ↓
            🟠 動画の再生が開始された
            🟠 動画の再生が停止された（一時停止）
            🟠 動画の再生が完了した ────────→ 🟣 「次へ」ボタンをハイライト表示する
                 ↓
[スタッフ] → 🔵 「次のステップ」ボタンをタップする
                 ↓
🟡 ManualSession Aggregate ── ルール: stepNumber は 1〜totalSteps の範囲
                 ↓
            🟠 次のステップに進んだ
                 ↓
            🟠 最終ステップの動画が完了した ──→ 🟣 完了画面を表示する
                                           ──→ 🟣 視聴完了ログを保存する（Phase 2）
```

### Events

| # | Domain Event | Trigger | Notes |
|---|-------------|---------|-------|
| C-1 | シーケンス再生が開始された | 動画選択 or QRスキャン | stepNumber=1 から開始 |
| C-2 | 動画の再生が開始された | YouTubeのonPlay | 視聴ログの startedAt を記録（Phase 2） |
| C-3 | 動画の再生が停止された | YouTubeのonPause | |
| C-4 | 動画の再生が完了した | YouTubeのonStateChange(0) | 「次へ」ボタン強調表示 |
| C-5 | 自動再生がブロックされた | YouTubeのonAutoplayBlocked | フォールバックUI表示 |
| C-6 | 動画読み込みエラーが発生した | YouTubeのonError | エラー表示 + リトライボタン |
| C-7 | 次のステップに進んだ | 「次へ」ボタンタップ | stepNumber++ |
| C-8 | 前のステップに戻った | 「前へ」ボタンタップ | stepNumber-- |
| C-9 | 最終ステップを完了した | 最終ステップで「次へ」タップ | 完了画面表示 |
| C-10 | シーケンスを最初からやり直した | 「もう一度見る」タップ | stepNumber=1 にリセット |
| C-11 | 一覧に戻った | 「一覧に戻る」タップ | |

### Policies

| Policy | Trigger | Action |
|--------|---------|--------|
| 次へボタン強調 | C-4（動画完了） | NavigationButtons の「次へ」を pulse アニメーション |
| 完了画面表示 | C-9（最終ステップ完了） | 完了モーダル or 専用画面表示 |
| 視聴ログ保存 | C-9 | ViewingLog を保存（Phase 2） |
| エラーフォールバック | C-6 | エラーメッセージ + リトライ表示 |

---

## 4. 管理ドメイン（コンテンツ管理）

> Phase 1 では実装しない。型定義と設計のみ。

### Events（Phase 2 以降）

| # | Domain Event | Actor | Notes |
|---|-------------|-------|-------|
| D-1 | 新しい動画が追加された | Manager / HQ Admin | CMS or 管理画面から |
| D-2 | 動画が非アクティブ化された | Manager / HQ Admin | isActive = false |
| D-3 | カテゴリの表示順が変更された | Manager / HQ Admin | |
| D-4 | 新しいスタッフが登録された | Manager | branchId と初期PIN を設定 |
| D-5 | スタッフのPINがリセットされた | Manager | |
| D-6 | 店舗が追加された | HQ Admin | brandId と allowedCategoryIds を設定 |
| D-7 | 動画のQRコードが発行された | Manager | URL → QRコード生成 → 印刷 |

---

## 5. 分析ドメイン（視聴ログ分析）

> Phase 2 以降。型定義は Phase 1 から存在。

### Events（Phase 2 以降）

| # | Domain Event | Trigger | Notes |
|---|-------------|---------|-------|
| E-1 | 視聴完了率が集計された | 日次バッチ or リアルタイム | 店舗別・動画別 |
| E-2 | 低完了率動画が検出された | Policy: 完了率 < 50% | マネージャーに通知 |
| E-3 | スタッフの習熟スコアが更新された | 視聴ログ蓄積後 | Phase 3 |
| E-4 | 月次レポートが生成された | 月初バッチ | 本部へ配信 |

---

## 6. 外部システム連携

```
🔴 YouTube IFrame API
  接続元: VideoPlayer コンポーネント（YouTubePlayer.tsx）
  イベント: onReady, onStateChange, onError, onAutoplayBlocked
  リスク: API廃止・仕様変更（VideoPlayer抽象化で緩和）

🔴 NextAuth.js（Phase 2）
  接続元: auth/ ルートグループ
  用途: スタッフ認証・セッション管理
  Provider: Credentials（PIN入力）+ 将来: QRコード

🔴 Supabase / PlanetScale（Phase 2）
  接続元: DAL関数（lib/dal/*.ts）
  用途: ManualSequence, ViewingLog, Staff, Branch の永続化

🔴 CMS: Contentful / Sanity（Phase 2）
  接続元: DAL関数（lib/dal/content.ts）
  用途: Brand, Category, Movie の非エンジニア編集

🔴 QRコードジェネレーター（Phase 2）
  接続元: 管理画面の「QR発行」ボタン
  用途: `/[brand]/[category]/[movie]/[step]` URLをQRコードに変換
```

---

## 7. 集約（Aggregates）の責務まとめ

### Manual Aggregate
- **責務:** マニュアルコンテンツの整合性を守る
- **不変条件:** `movie.totalSteps == sequences.length`、`sequence.stepNumber` は1始まり連番
- **ルート:** Movie

### ManualSession Aggregate（Phase 1 はクライアント状態のみ）
- **責務:** 視聴セッションの状態遷移を管理
- **不変条件:** `currentStep` は `1 〜 totalSteps` の範囲、完了済みセッションは再進行不可
- **ルート:** ViewingSession（Phase 2でDB化）

### Auth Aggregate（Phase 2 実装）
- **責務:** 認証・認可ルールの適用
- **不変条件:** ロールは `owner > manager > staff` の階層、PINは必ずハッシュ化して保存
- **ルート:** Staff

### Store Aggregate（Phase 2 実装）
- **責務:** 店舗ごとの閲覧権限管理
- **不変条件:** Branch は必ず1つの Brand に属する、allowedCategoryIds は Brand のカテゴリIDの部分集合
- **ルート:** Branch

---

## 8. 未解決のドメイン疑問（Hot Spots）

> イベントストーミングで「議論が紛糾した」または「未確定」の箇所

| # | 疑問 | 影響度 | 優先度 |
|---|------|--------|--------|
| HS-1 | 「動画を最後まで見た」の定義は？（95%視聴？最後のフレーム？「完了」ボタン押下？） | 高 | Phase 2前に確定 |
| HS-2 | 共用タブレットで「誰が見たか」を識別する必要があるか？（個人別ログ vs 店舗ログ） | 高 | Phase 2前に確定 |
| HS-3 | QRコードで開いたとき、認証が先か動画が先か？（UX vs セキュリティのトレードオフ） | 中 | Phase 2設計時 |
| HS-4 | オフラインでのステップ記録をどう扱うか？（Phase 3のPWAで再考） | 低 | Phase 3 |
| HS-5 | 秘伝タレのレシピ動画は「業態をまたいで共有」可能か？（権限の粒度） | 中 | Phase 2前に確定 |
