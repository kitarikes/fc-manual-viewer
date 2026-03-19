# Phase 2 継続セッション用プロンプト

> このファイルは新しいセッションで貼り付けることで、コンテキストを完全に引き継いで作業を継続するためのプロンプトです。
> 最終更新: 2026-03-19

---

## あなたへの依頼

以下のコンテキストを読み込んだ上で、**FC Manual Viewer の Next.js プロジェクトのベース実装**を行ってください。

---

## プロジェクト概要

多店舗展開する飲食チェーン（うなぎ、ラーメン等）のオペレーション品質均一化を目的とした受託開発。
熟練スタッフの動きを「動画マニュアル」として集約し、厨房のタブレットから即座に確認できるプラットフォーム。

**制約（Phase 1）:**
- DBレス・SSR完結（TypeScript 定数ファイル）
- Vercel デプロイ
- 予算・スピード重視

---

## Phase 1 完了済み成果物

リポジトリ: `kitarikes/fc-manual-viewer` ブランチ: `claude/fc-operation-standardizer-setup-s8WUs`

```
docs/
  analysis/
    research_report.md      # YouTube API / 厨房UI / Next.js 15 調査結果
  definition/
    critical_review.md      # チーム論争と5つの合意事項
    roadmap.md              # Phase 1〜4 ロードマップ
    technical_spec.md       # データモデル・URLルーティング・UXフロー仕様
    event_storming.md       # ドメインイベント全体マップ
    auth_spec.md            # 認証・認可仕様（Phase 1 簡易PIN / Phase 2 NextAuth）
  design/
    design_system.md        # デザインシステム（カラー・タイポ・コンポーネント・Tailwind設定）
src/
  types/manual.ts           # 型定義（Brand, Category, Movie, ManualSequence, etc.）
  data/mockData.ts          # サンプルデータ（うなぎ捌き5ステップ, タレ仕込み4ステップ等）
```

---

## 設計の重要な合意事項（必ず守ること）

### 1. DAL (Data Access Layer) パターンの徹底

データへのアクセスは必ず DAL 関数を経由する。**コンポーネントが `mockData` を直接 import することは禁止**。

```typescript
// ✅ 正しい
import { getMovieById } from '@/lib/dal/movies';
const movie = await getMovieById('eel-fillet');

// ❌ 間違い
import { mockDb } from '@/data/mockData';
const movie = mockDb.movies.find(m => m.id === 'eel-fillet');
```

将来 DB に移行する際、`src/lib/dal/` 内の実装だけを変更すればよい設計にする。

### 2. VideoPlayer コンポーネントの抽象化

`VideoPlayer` コンポーネントは `provider: 'youtube' | 'vimeo' | 'self-hosted'` を受け取る。
YouTube 固有のコードは `YouTubePlayer.tsx` に隔離し、将来の差し替えを容易にする。

```typescript
// VideoPlayer が受け取る型（src/types/manual.ts に定義済み）
interface VideoSource {
  provider: VideoProvider;  // 'youtube' | 'vimeo' | 'self-hosted'
  videoId: string;
  startSeconds?: number;
  endSeconds?: number;
}
```

### 3. 厨房ファースト UI（絶対要件）

| 項目 | 基準 |
|------|------|
| タッチターゲット | 最小 64px × 64px（touch-md） |
| カラーテーマ | **ダークテーマ必須**（docs/design/design_system.md 参照） |
| レイアウト | **Landscape（横向き）固定前提** |
| ステップ表示 | **1画面 = 1ステップ**（スクロール禁止） |
| フォントサイズ | 本文 18px 以上、見出し 28px 以上 |
| コントラスト比 | WCAG AA（4.5:1）以上 |

### 4. Phase 1 の認証方針

- 「店舗PIN認証」のみ（個人アカウントなし）
- `sessionStorage` ベースのセッション管理（無操作15分でタイムアウト）
- PIN は Vercel 環境変数で管理（ハードコード禁止）
- NextAuth.js は使用しない（Phase 2 で導入）

---

## URLルーティング設計

```
app/
  page.tsx                       # ブランド一覧
  login/
    page.tsx                     # ログイン画面（PIN入力）
  [brandSlug]/
    page.tsx                     # カテゴリ一覧
    [categorySlug]/
      page.tsx                   # 動画一覧
      [movieId]/
        page.tsx                 # シーケンス再生 Step 1
        [stepNumber]/
          page.tsx               # 特定ステップ直接アクセス（QRコード用）
```

---

## シーケンス再生画面のレイアウト（Landscape 固定）

```
┌─────────────────────────────────────────────────────────────────────┐
│  ← 戻る      カテゴリ名 > 動画タイトル      ステップ 3 / 5   [🏠]  │  h: 60px
├────────────────────────────────┬────────────────────────────────────┤
│                                │  ステップタイトル (text-2xl)       │
│      YouTube Player            │                                    │
│        (aspect-video)          │  説明テキスト (text-base)          │
│        h: calc(100vh - 180px)  │                                    │
│                                │  ✅ ポイント (text-lg):             │
│                                │  • 箇条書き1                       │
│                                │  • 箇条書き2                       │
│                                │                                    │
│                                │  ⚠️ 注意事項 (semantic-warning)    │
├────────────────────────────────┴────────────────────────────────────┤
│    [← 前のステップ]      3 / 5        [次のステップ →]              │  h: 80px
├─────────────────────────────────────────────────────────────────────┤
│              ●●●○○  StepIndicator                                  │  h: 40px
└─────────────────────────────────────────────────────────────────────┘
```

---

## 型定義のポイント（src/types/manual.ts）

Phase 1 のデータ構造に加えて、以下の **optional フィールドが将来用に存在する**:

```typescript
// Brand, Category, Movie に存在する将来フィールド
allowedBranchIds?: string[] | null;  // Phase 2: 店舗別アクセス制御
i18n?: { [locale: string]: { title?: string; description?: string } }; // Phase 3: 多言語

// 将来のエンティティ（型定義のみ、Phase 1 では使わない）
interface ViewingLog { ... }  // Phase 2: 視聴ログ
interface Branch { ... }      // Phase 2: 店舗
interface Staff { ... }       // Phase 2: スタッフ個人

// UI 用型（積極的に使うこと）
type SequenceViewerData = {
  brand: Brand;
  category: Category;
  movie: Movie;
  sequences: ManualSequence[];
  currentSequence: ManualSequence;
};
```

---

## コンポーネント構成

```
src/
  app/
    layout.tsx              # グローバルレイアウト（ダークテーマ body クラス）
    page.tsx                # ブランド一覧
    login/page.tsx          # ログイン画面
    [brandSlug]/...
  components/
    layout/
      Header.tsx
    manual/
      BrandCard.tsx
      CategoryCard.tsx
      MovieCard.tsx
      SequencePlayer.tsx    # 再生画面のメインコンポーネント
      StepIndicator.tsx
      StepDescription.tsx
      NavigationButtons.tsx
    video/
      VideoPlayer.tsx       # 抽象プロバイダー
      YouTubePlayer.tsx     # YouTube 固有実装
    ui/
      Button.tsx
      Card.tsx
      Badge.tsx
  lib/
    dal/
      brands.ts             # getBrands(), getBrandBySlug()
      categories.ts         # getCategories(), getCategoryBySlug()
      movies.ts             # getMovies(), getMovieById()
      sequences.ts          # getSequences(), getSequenceByStep()
    auth/
      session.ts            # Phase 1 簡易セッション管理
  types/
    manual.ts               # 既存
    auth.ts                 # 認証関連型（新規作成）
  data/
    mockData.ts             # 既存（DAL 以外から直接 import 禁止）
```

---

## デザインシステム（Tailwind カスタムカラー）

```
surface.DEFAULT  = #0F0F1A  (最暗背景)
surface.raised   = #1A1A2E  (カード背景)
text.primary     = #F5F5FF  (メインテキスト)
text.secondary   = #A0A0C0  (補足テキスト)
action.primary   = #FF6B35  (オレンジ CTA)
action.secondary = #00B894  (緑 CTA)
semantic.warning = #FDCB6E  (注意)
semantic.error   = #E17055  (エラー)
semantic.success = #55EFC4  (完了)
step.current     = #FF6B35  (現在ステップ)
step.completed   = #55EFC4  (完了ステップ)
step.pending     = #3A3A5A  (未完了ステップ)
```

完全な Tailwind 設定は `docs/design/design_system.md` の Section 9 を参照。

---

## サンプルデータ（src/data/mockData.ts）

2つのブランドが定義済み:
- **unagi**: うなぎ業態（カテゴリ4, 動画3+メタデータ）
- **ramen**: ラーメン業態（カテゴリ2, 動画1メタデータ）

完全なシーケンスデータが存在するもの:
- `eel-fillet`（うなぎの捌き方 5ステップ）
- `eel-stunning`（うなぎの締め方 3ステップ）
- `secret-tare`（秘伝タレ仕込み 4ステップ）

---

## Phase 1 で実装すること（このセッションのタスク）

### Step 1: Next.js プロジェクト初期化

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

設定:
- `tailwind.config.ts` にデザインシステムのカスタムカラー等を追加（`docs/design/design_system.md` Section 9 の設定を適用）
- `next.config.ts` に `experimental.typedRoutes: true` を追加

### Step 2: グローバルレイアウト

- `app/layout.tsx`: `bg-surface text-text-primary` のダークテーマ適用
- `app/globals.css`: Tailwind ディレクティブ + フォントインポート（Noto Sans JP）
- viewport meta: `maximum-scale=1, user-scalable=no`（タブレット誤ズーム防止）

### Step 3: DAL 関数の実装

```typescript
// src/lib/dal/brands.ts
export async function getBrands(): Promise<Brand[]>
export async function getBrandBySlug(slug: string): Promise<Brand | null>

// src/lib/dal/categories.ts
export async function getCategoriesByBrand(brandId: string): Promise<CategoryWithMovieCount[]>
export async function getCategoryBySlug(brandId: string, slug: string): Promise<Category | null>

// src/lib/dal/movies.ts
export async function getMoviesByCategory(categoryId: string): Promise<Movie[]>
export async function getMovieById(id: string): Promise<Movie | null>

// src/lib/dal/sequences.ts
export async function getSequencesByMovie(movieId: string): Promise<ManualSequence[]>
export async function getSequenceViewerData(
  brandSlug: string,
  categorySlug: string,
  movieId: string,
  stepNumber: number
): Promise<SequenceViewerData | null>
```

### Step 4: UI コンポーネント実装

優先順位順:
1. `ui/Button.tsx` - 3バリアント × 3サイズ
2. `ui/Card.tsx` - ベースカード
3. `ui/Badge.tsx` - 難易度・タグバッジ
4. `video/VideoPlayer.tsx` + `video/YouTubePlayer.tsx`
5. `manual/StepIndicator.tsx`
6. `manual/NavigationButtons.tsx`
7. `manual/StepDescription.tsx`
8. `manual/SequencePlayer.tsx`（上記を組み合わせたメインコンポーネント）
9. `manual/BrandCard.tsx`
10. `manual/CategoryCard.tsx`
11. `manual/MovieCard.tsx`

### Step 5: ページ実装

1. `app/login/page.tsx` - PIN入力ログイン画面（テンキーUI）
2. `app/page.tsx` - ブランド一覧（BrandCard 一覧）
3. `app/[brandSlug]/page.tsx` - カテゴリ一覧（CategoryCard 一覧）
4. `app/[brandSlug]/[categorySlug]/page.tsx` - 動画一覧（MovieCard 一覧）
5. `app/[brandSlug]/[categorySlug]/[movieId]/page.tsx` - SequencePlayer（Step 1から）
6. `app/[brandSlug]/[categorySlug]/[movieId]/[stepNumber]/page.tsx` - SequencePlayer（指定ステップ）

### Step 6: 簡易認証ミドルウェア

```typescript
// src/lib/auth/session.ts - SimpleSession の管理
// src/middleware.ts - 未認証の場合 /login にリダイレクト
```

---

## イベントストーミングで確認された主要ドメインイベント（実装時の参考）

| Event | 実装箇所 |
|-------|---------|
| 動画の再生が開始された | YouTubePlayer の `onPlay` ハンドラ |
| 動画の再生が完了した | YouTubePlayer の `onStateChange(0)` → NavigationButtons をパルスアニメーション |
| 自動再生がブロックされた | `onAutoplayBlocked` → フォールバックUIオーバーレイ表示 |
| 次のステップに進んだ | `[stepNumber]` ルートへの `router.push` |
| 最終ステップを完了した | 完了モーダル表示 |

---

## ホットスポット（未解決事項）

実装前に確認が必要な疑問:

1. **HS-1**: 「動画を最後まで見た」= 95%視聴？最後のフレーム到達？「完了」ボタン押下？
2. **HS-2**: 共用タブレットで個人識別が必要か？（現状は不要・Phase 2 で再考）
3. **Auth-1**: Phase 1 の PIN 管理方法（Vercel 環境変数の具体的な命名規則）

---

## 参照ドキュメント一覧

| ドキュメント | 参照すべきタイミング |
|------------|------------------|
| `docs/definition/technical_spec.md` | データモデル・URL設計の確認 |
| `docs/definition/event_storming.md` | ドメインロジック実装時 |
| `docs/definition/auth_spec.md` | 認証実装時 |
| `docs/design/design_system.md` | コンポーネント・スタイル実装時（Tailwind設定はSection 9） |
| `docs/definition/critical_review.md` | 設計判断の根拠を確認したいとき |
| `docs/definition/roadmap.md` | Phase 2以降の設計に影響する決断をするとき |
| `src/types/manual.ts` | 型定義の確認 |
| `src/data/mockData.ts` | サンプルデータの確認（DAL 経由でアクセスすること） |
