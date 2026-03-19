# 技術仕様書: FC Manual Viewer

> 作成日: 2026-03-19
> ステータス: Phase 1 確定版

---

## 1. データモデル設計

### 1.1 エンティティ関係

```
Brand (ブランド)
  └── Category (カテゴリ)
        └── Movie (動画/マニュアル)
              └── ManualSequence (ステップ)
```

### 1.2 エンティティ詳細

#### Brand（ブランド/業態）

複数の飲食業態（うなぎ、ラーメン等）を管理するトップレベルのエンティティ。

```typescript
interface Brand {
  id: string;           // "unagi" | "ramen" など
  name: string;         // "うなぎ業態"
  slug: string;         // URLスラッグ "unagi"
  logoUrl?: string;
  isActive: boolean;
  allowedBranchIds?: string[];  // 将来: 表示許可店舗ID一覧
}
```

#### Category（カテゴリ/工程区分）

業態内の作業工程を分類するエンティティ。1つのBrandに複数のCategoryが属する。

```typescript
interface Category {
  id: string;           // "eel-processing"
  brandId: string;      // 親ブランドID
  name: string;         // "うなぎ捌き"
  slug: string;         // URLスラッグ
  description?: string;
  iconEmoji?: string;   // "🐟"
  displayOrder: number; // 表示順
  isActive: boolean;
}
```

#### Movie（動画/マニュアル）

1つの作業マニュアルを表すエンティティ。1つのCategoryに複数のMovieが属する。

```typescript
interface Movie {
  id: string;           // "eel-fillet"
  categoryId: string;   // 親カテゴリID
  title: string;        // "うなぎの捌き方 完全版"
  description?: string;
  thumbnailUrl?: string;
  totalSteps: number;   // シーケンス数（表示用・正規化）
  estimatedMinutes: number; // 習得目安時間
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  displayOrder: number;
  isActive: boolean;
  createdAt: string;    // ISO 8601
  updatedAt: string;
}
```

#### ManualSequence（シーケンス/ステップ）

動画マニュアルの1ステップを表すエンティティ。1つのMovieに複数のManualSequenceが属する。
**YouTubeの動画単位ではなく「手順ステップ単位」であることに注意**（1ステップ = 1YouTube動画を推奨）。

```typescript
interface ManualSequence {
  id: string;            // "eel-fillet-step-01"
  movieId: string;       // 親動画ID
  stepNumber: number;    // 1始まりの連番
  title: string;         // "ステップ1: 頭の下処理"
  description: string;   // 手順の詳細説明テキスト
  video: VideoSource;    // 動画ソース情報
  durationSeconds: number; // 動画の長さ（秒）
  keyPoints: string[];   // このステップのポイント（箇条書き）
  warnings?: string[];   // 注意事項（任意）
  isActive: boolean;
}

interface VideoSource {
  provider: 'youtube' | 'vimeo' | 'self-hosted';
  videoId: string;       // YouTubeの場合: "dQw4w9WgXcQ"
  startSeconds?: number; // 指定秒数から再生開始（任意）
  endSeconds?: number;   // 指定秒数で再生終了（任意）
}
```

---

### 1.3 リレーション構造図

```
Brand (1)
  ├── id: "unagi"
  ├── name: "うなぎ業態"
  └── categories: Category[] (N)
        ├── id: "eel-processing"
        ├── brandId: "unagi"
        └── movies: Movie[] (N)
              ├── id: "eel-fillet"
              ├── categoryId: "eel-processing"
              └── sequences: ManualSequence[] (N)
                    ├── id: "eel-fillet-step-01"
                    ├── movieId: "eel-fillet"
                    ├── stepNumber: 1
                    └── video: VideoSource
```

---

### 1.4 将来拡張のための予約フィールド

Phase 2以降に対応予定のフィールドを型定義に含めておく（全て optional）:

```typescript
// 将来の多言語化
interface I18nFields {
  i18n?: {
    [locale: string]: {    // "ja" | "en" | "vi" | "zh"
      title?: string;
      description?: string;
    };
  };
}

// 将来の視聴ログ（ログ収集の「型」だけ定義）
interface ViewingLog {
  id: string;
  userId: string;
  sequenceId: string;
  watchedAt: string;      // ISO 8601
  completedPercent: number; // 0-100
  branchId: string;
}

// 将来の店舗アクセス制御
interface Branch {
  id: string;
  name: string;
  brandId: string;
  allowedCategoryIds?: string[];
}
```

---

## 2. URLルーティング設計

### 2.1 App Router構造

```
app/
  page.tsx                     # ブランド一覧 (トップ)
  [brandSlug]/
    page.tsx                   # カテゴリ一覧
    [categorySlug]/
      page.tsx                 # 動画一覧
      [movieId]/
        page.tsx               # シーケンス再生（Step 1から開始）
        [stepNumber]/
          page.tsx             # 特定ステップへ直接ジャンプ（QRコード対応）
```

### 2.2 URL例

```
/                                          # ブランド選択画面
/unagi                                     # うなぎ業態のカテゴリ一覧
/unagi/eel-processing                      # 「うなぎ捌き」カテゴリの動画一覧
/unagi/eel-processing/eel-fillet           # 「うなぎの捌き方」Step 1 から再生
/unagi/eel-processing/eel-fillet/3         # Step 3 に直接ジャンプ（QRコード用）
```

---

## 3. シーケンス再生 UXフロー

### 3.1 シーケンス再生画面の構造（Landscape固定）

```
┌─────────────────────────────────────────────────────────────────────┐
│  ← 戻る      うなぎの捌き方         ステップ 3 / 5     [ホーム 🏠]  │  ← ヘッダー（高さ: 60px）
├────────────────────────────────┬────────────────────────────────────┤
│                                │                                    │
│                                │  ステップ3: 腹を開く               │
│      YouTube Player            │                                    │
│        (16:9 比率)             │  包丁を腹側から入れ、             │
│                                │  内臓を傷つけないように           │
│                                │  ゆっくりと開く。                  │
│                                │                                    │
│                                │  ⚠️ 包丁の向きに注意              │
│                                │                                    │
│                                │  ✅ ポイント:                      │
│                                │  • 刃は内側向き                    │
│                                │  • 力を入れすぎない                │
│                                │                                    │
├────────────────────────────────┴────────────────────────────────────┤
│         [← 前のステップ]              [次のステップ →]               │  ← フッター（高さ: 80px）
├─────────────────────────────────────────────────────────────────────┤
│  ●●●○○   プログレスインジケーター（ステップ数に応じたドット）       │  ← インジケーター（高さ: 40px）
└─────────────────────────────────────────────────────────────────────┘

動画エリア: 画面幅の 55%
テキストエリア: 画面幅の 45%
```

### 3.2 状態遷移フロー

```
[動画一覧画面]
      ↓ 動画をタップ
[シーケンス再生画面: Step 1]
  - YouTube動画がロード
  - ステップ説明テキストを表示
  - 「次のステップ →」ボタンを表示
      ↓ 「次のステップ」をタップ
[シーケンス再生画面: Step 2]
      ...
      ↓ 最終ステップで「次のステップ」をタップ
[完了画面]
  - 「全ステップ完了！」を表示
  - 「もう一度見る」「一覧に戻る」ボタン
```

### 3.3 エラー状態の処理

```
YouTube動画読み込みエラー
  → 「動画を読み込めませんでした」メッセージ + リトライボタン

自動再生ブロック
  → 「▶ タップして再生」の大きなオーバーレイボタン

最初/最後のステップ
  → 「← 前のステップ」ボタンを非表示（最初）または「一覧に戻る」に変更（最後）
```

---

## 4. コンポーネント設計

### 4.1 コンポーネント一覧

```
components/
  layout/
    Header.tsx            # グローバルヘッダー
    Footer.tsx
  manual/
    BrandCard.tsx         # ブランド選択カード
    CategoryCard.tsx      # カテゴリカード
    MovieCard.tsx         # 動画リストアイテム
    SequencePlayer.tsx    # シーケンス再生メインコンポーネント
    StepIndicator.tsx     # ステップ進捗インジケーター
    StepDescription.tsx   # ステップ説明テキストパネル
    NavigationButtons.tsx # 前へ/次へボタン
  video/
    VideoPlayer.tsx       # 動画プレーヤー抽象化コンポーネント
    YouTubePlayer.tsx     # YouTube実装
  ui/
    Button.tsx
    Card.tsx
    Badge.tsx
```

### 4.2 VideoPlayer コンポーネントのインターフェース

```typescript
// 将来のプロバイダー切り替えに対応した抽象インターフェース
interface VideoPlayerProps {
  source: VideoSource;
  autoPlay?: boolean;
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
  onError?: (errorCode: number) => void;
  onAutoplayBlocked?: () => void;  // YouTube onAutoplayBlocked 対応
  className?: string;
}
```

---

## 5. 非機能要件

### 5.1 パフォーマンス

- FCP (First Contentful Paint): **< 2秒**（WiFi環境）
- LCP (Largest Contentful Paint): **< 3秒**
- YouTubeプレーヤーは**Intersection Observer**でビューポートに入ったときのみロード

### 5.2 アクセシビリティ

- WCAG 2.1 AA 準拠
- 全インタラクティブ要素にキーボードフォーカス対応
- スクリーンリーダー対応（aria-label / role 適切な付与）

### 5.3 対応環境

| 環境 | バージョン |
|------|----------|
| Chrome (Android) | 最新2バージョン |
| Safari (iOS/iPadOS) | 最新2バージョン |
| Chrome (Desktop) | 最新2バージョン |
| 画面サイズ | 768px 〜 1280px（タブレット中心）|
| 向き | Landscape 固定（縦向きでも最低限表示） |

### 5.4 セキュリティ

- CSP (Content Security Policy) で `frame-src youtube.com` のみ許可
- 環境変数で管理するデータ（将来のAPIキー等）は `.env.local` に格納、Vercelの環境変数として設定
- 動画IDはクライアントから丸見えになる点を許容（Phase 1の制約として合意済み）
