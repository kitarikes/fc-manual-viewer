/**
 * FC Manual Viewer - 型定義
 *
 * 設計方針:
 * - Phase 1 (DBレス) から Phase 2+ (DB移行) を完全に見据えた型定義
 * - 将来の多言語化・店舗別制御・視聴ログに備えた optional フィールドを含む
 * - VideoSource は抽象化されており、YouTube/Vimeo/自前ホスティングを切り替え可能
 */

// ============================================================
// 基底型・共通型
// ============================================================

/** 動画プロバイダー識別子 */
export type VideoProvider = 'youtube' | 'vimeo' | 'self-hosted';

/** 難易度 */
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

/** 多言語対応ロケール */
export type Locale = 'ja' | 'en' | 'vi' | 'zh';

/** 多言語テキストフィールド（将来のi18n用） */
export type I18nText = Partial<Record<Locale, string>>;

/**
 * 動画ソース情報
 * VideoPlayer コンポーネントが受け取る抽象化された動画参照。
 * プロバイダーを切り替えてもアプリコードの変更が不要になる設計。
 */
export interface VideoSource {
  provider: VideoProvider;
  /** YouTube: videoId, Vimeo: videoId, self-hosted: ファイルURL */
  videoId: string;
  /** 再生開始位置（秒）: 部分的な手順の切り出しに使用 */
  startSeconds?: number;
  /** 再生終了位置（秒）*/
  endSeconds?: number;
}

// ============================================================
// ブランド（業態）
// ============================================================

/**
 * ブランド（飲食業態）
 * 例: 鰻のエイト, GYOKOTSUYA
 * FC展開では複数ブランドが1プラットフォーム上に共存する
 */
export interface Brand {
  id: string;
  name: string;
  /** URLスラッグ: /[brandSlug]/... */
  slug: string;
  description?: string;
  logoUrl?: string;
  /** テーマカラー（Tailwind CSS クラス名またはHEX） */
  themeColor?: string;
  isActive: boolean;
  displayOrder: number;
  /** 将来: この業態を表示可能な店舗IDのリスト（null = 全店舗） */
  allowedBranchIds?: string[] | null;
  /** 将来: 多言語フィールド */
  i18n?: Partial<Record<Locale, Pick<Brand, 'name' | 'description'>>>;
}

// ============================================================
// カテゴリ（工程区分）
// ============================================================

/**
 * カテゴリ（作業工程の分類）
 * 例: うなぎ捌き, タレ仕込み, 焼き工程, 接客基礎
 */
export interface Category {
  id: string;
  brandId: string;
  name: string;
  /** URLスラッグ: /[brandSlug]/[categorySlug]/... */
  slug: string;
  description?: string;
  /** カテゴリを視覚的に識別する絵文字アイコン */
  iconEmoji?: string;
  /** サムネイル画像URL */
  thumbnailUrl?: string;
  displayOrder: number;
  isActive: boolean;
  /** 将来: 多言語フィールド */
  i18n?: Partial<Record<Locale, Pick<Category, 'name' | 'description'>>>;
  /** 将来: このカテゴリを閲覧可能なロールの制限 */
  requiredRole?: string[];
}

// ============================================================
// 動画/マニュアル
// ============================================================

/**
 * 動画（作業マニュアル）
 * 1つの「作業」を表す単位。内部に複数の ManualSequence（ステップ）を持つ。
 * 例: 「うなぎの捌き方 完全版」（5ステップ構成）
 */
export interface Movie {
  id: string;
  categoryId: string;
  title: string;
  description?: string;
  /** OGP・サムネイル用画像 */
  thumbnailUrl?: string;
  /** ManualSequence の数（正規化カラム。sequencesの長さと一致すること） */
  totalSteps: number;
  /** 全ステップ視聴の目安時間（分） */
  estimatedMinutes: number;
  difficulty: DifficultyLevel;
  /** 検索・フィルタリング用タグ */
  tags: string[];
  displayOrder: number;
  isActive: boolean;
  /** ISO 8601 */
  createdAt: string;
  updatedAt: string;
  /** 将来: 多言語フィールド */
  i18n?: Partial<Record<Locale, Pick<Movie, 'title' | 'description'>>>;
  /** 将来: この動画を閲覧可能な店舗IDのリスト（null = 全店舗） */
  allowedBranchIds?: string[] | null;
}

// ============================================================
// マニュアルシーケンス（ステップ）
// ============================================================

/**
 * マニュアルシーケンス（手順の1ステップ）
 * 動画1本 = 1ステップが推奨構成。
 * ユーザーは「次へ」ボタンで順番に全ステップを視聴する。
 */
export interface ManualSequence {
  id: string;
  movieId: string;
  /** 1始まりの連番（表示・URLパラメータに使用） */
  stepNumber: number;
  title: string;
  /** 手順の詳細説明（厨房内で読める簡潔な文章） */
  description: string;
  video: VideoSource;
  /** 動画の長さ（秒）: UIのプログレスバー・目安時間表示に使用 */
  durationSeconds: number;
  /** このステップで習得すべきポイント（箇条書き、最大3〜5件推奨） */
  keyPoints: string[];
  /** 注意事項・危険警告 */
  warnings?: string[];
  isActive: boolean;
  /** 将来: 多言語フィールド */
  i18n?: Partial<Record<Locale, Pick<ManualSequence, 'title' | 'description' | 'keyPoints' | 'warnings'>>>;
}

// ============================================================
// 将来のエンティティ（型のみ定義・Phase 2以降に実装）
// ============================================================

/**
 * 店舗（ブランチ）
 * Phase 2: 店舗別のアクセス制御に使用
 */
export interface Branch {
  id: string;
  name: string;
  brandId: string;
  /** この店舗で閲覧可能なカテゴリID（null = 全カテゴリ） */
  allowedCategoryIds?: string[] | null;
  isActive: boolean;
}

/**
 * 視聴ログ
 * Phase 2: Supabase等のDBで収集・分析する
 * Phase 1では収集しないが、型定義だけ用意しておく
 */
export interface ViewingLog {
  id: string;
  /** Phase 2でNextAuth.jsのセッションユーザーIDと紐付け */
  userId: string;
  sequenceId: string;
  movieId: string;
  branchId: string;
  watchedAt: string;
  /** 視聴完了率: 0〜100 */
  completedPercent: number;
  /** 動画を最後まで見たか */
  isCompleted: boolean;
}

/**
 * スタッフ
 * Phase 2: 認証・ロール管理に使用
 */
export interface Staff {
  id: string;
  name: string;
  branchId: string;
  role: 'owner' | 'manager' | 'staff';
  isActive: boolean;
}

// ============================================================
// DAL（Data Access Layer）用の入出力型
// ============================================================

/**
 * リスト取得時のフィルター・ソートオプション
 * Phase 1では使用しないが、将来のDAL拡張に備えて定義
 */
export interface ListOptions {
  brandId?: string;
  categoryId?: string;
  isActive?: boolean;
  locale?: Locale;
  limit?: number;
  offset?: number;
}

/**
 * DAL 関数の共通レスポンス型
 * エラーハンドリングを統一するための型
 */
export type DalResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================
// UI/表示用の型（型エイリアス・ユーティリティ型）
// ============================================================

/** シーケンス再生画面で使用する現在の状態 */
export interface PlayerState {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  isCompleted: boolean;
}

/** カテゴリ一覧画面で使用する、動画数を含んだカテゴリ */
export type CategoryWithMovieCount = Category & {
  movieCount: number;
};

/** 動画詳細画面で使用する、シーケンス一覧を含んだ動画 */
export type MovieWithSequences = Movie & {
  sequences: ManualSequence[];
};

/** シーケンス再生画面用の完全な情報 */
export type SequenceViewerData = {
  brand: Brand;
  category: Category;
  movie: Movie;
  sequences: ManualSequence[];
  currentSequence: ManualSequence;
};
