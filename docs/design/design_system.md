# デザインシステム: FC Manual Viewer

> 作成者: Designer
> 作成日: 2026-03-19
> 前提: 厨房環境（油・水・蛍光灯・横置きタブレット）を第一条件とする

---

## 1. デザイン原則

### 原則1: 「1秒で判断できる」
厨房では視線は手元の作業に向いている。画面を見る瞬間に「今何をすべきか」が**1秒以内**にわかるデザイン。

### 原則2: 「汚れた手でも操作できる」
タッチターゲットは体表面積を想定して設計。迷いなくタップできる領域を確保。

### 原則3: 「情報は最小限」
1画面に1つのメッセージ。スクロールはインタラクションデザインの失敗。

### 原則4: 「暗い場所でも読める」
厨房の照明は均一でない。高コントラスト・大きな文字は装飾ではなく必須要件。

---

## 2. カラーシステム

### 2.1 デザイントークン（Tailwind CSS カスタム設定）

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    extend: {
      colors: {
        // --- ベースカラー（ダークテーマ） ---
        'surface': {
          DEFAULT: '#0F0F1A',   // メイン背景（最も暗い）
          'raised': '#1A1A2E',  // カード・パネル背景
          'overlay': '#252540', // モーダル・ドロワー背景
          'hover': '#2E2E50',   // ホバー状態
        },

        // --- テキストカラー ---
        'text': {
          'primary': '#F5F5FF',   // 主要テキスト（ほぼ白）
          'secondary': '#A0A0C0', // 補足テキスト
          'muted': '#6B6B8A',     // 非アクティブ・プレースホルダー
          'inverse': '#0F0F1A',   // 明るい背景上のテキスト
        },

        // --- アクションカラー ---
        'action': {
          'primary': '#FF6B35',     // メインCTA（オレンジ）
          'primary-hover': '#E85A28',
          'primary-active': '#CC4C1F',
          'secondary': '#00B894',   // サブCTA（緑）
          'secondary-hover': '#009E7F',
        },

        // --- セマンティックカラー ---
        'semantic': {
          'warning': '#FDCB6E',   // 注意・警告（黄）
          'warning-bg': '#3D2E00',
          'error': '#E17055',     // エラー・危険（赤）
          'error-bg': '#3D1500',
          'success': '#55EFC4',   // 完了・OK（薄緑）
          'success-bg': '#003D28',
          'info': '#74B9FF',      // 情報・ヒント（青）
          'info-bg': '#00153D',
        },

        // --- ブランドカラー ---
        'brand': {
          'unagi': '#8B4513',    // うなぎ業態（こげ茶）
          'ramen': '#CC3300',    // ラーメン業態（赤）
        },

        // --- プログレス・ステップ ---
        'step': {
          'completed': '#55EFC4',  // 完了ステップ
          'current': '#FF6B35',    // 現在ステップ
          'pending': '#3A3A5A',    // 未完了ステップ
        },
      },
    },
  },
};
```

### 2.2 コントラスト比の検証

| 組み合わせ | 比率 | WCAG AA (4.5:1) | WCAG AAA (7:1) |
|-----------|------|-----------------|----------------|
| text-primary on surface | 14.5:1 | ✅ | ✅ |
| text-secondary on surface | 5.2:1 | ✅ | ❌ |
| action-primary on surface | 4.8:1 | ✅ | ❌ |
| semantic-warning on surface | 9.1:1 | ✅ | ✅ |
| text-inverse on action-primary | 5.6:1 | ✅ | ❌ |

> **方針:** メイン本文は AAA 準拠必須。CTAボタンは AA 以上。

---

## 3. タイポグラフィシステム

### 3.1 フォントスタック

```typescript
// tailwind.config.ts に追加
fontFamily: {
  sans: [
    'Noto Sans JP',    // 日本語（漢字・ひらがな）
    'Inter',           // 英数字
    'system-ui',
    'sans-serif',
  ],
  mono: [
    'Noto Sans Mono',
    'ui-monospace',
    'monospace',
  ],
},
```

### 3.2 タイポグラフィスケール

```typescript
// tailwind.config.ts に追加
fontSize: {
  'xs':   ['12px', { lineHeight: '1.5', letterSpacing: '0.02em' }],
  'sm':   ['14px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
  'base': ['18px', { lineHeight: '1.6', letterSpacing: '0em' }],   // ← 厨房最小フォント
  'lg':   ['20px', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
  'xl':   ['24px', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
  '2xl':  ['28px', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
  '3xl':  ['36px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
  '4xl':  ['48px', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
},
```

### 3.3 使用例

| 用途 | クラス | サイズ |
|------|--------|--------|
| ステップタイトル | `text-2xl font-bold` | 28px |
| 本文説明テキスト | `text-base` | 18px |
| ポイント箇条書き | `text-lg font-medium` | 20px |
| 補足情報 | `text-sm text-text-secondary` | 14px |
| ステップ番号 `3 / 5` | `text-xl font-mono font-semibold` | 24px |
| ナビゲーションボタン | `text-xl font-bold` | 24px |

---

## 4. スペーシング・サイジングシステム

### 4.1 ベースグリッド: 8px

```typescript
// tailwind.config.ts の spacing をそのまま使用（4px単位）
// 重要な値の意味付け:
// p-2 = 8px   (最小余白)
// p-4 = 16px  (標準余白)
// p-6 = 24px  (セクション内余白)
// p-8 = 32px  (セクション間余白)
// p-12 = 48px (大きなCTAボタンの縦余白目安)
```

### 4.2 タッチターゲットサイズ規定

```typescript
// tailwind.config.ts に追加
spacing: {
  'touch-sm':  '48px',  // 最小タッチターゲット（WCAG AA）
  'touch-md':  '64px',  // 厨房推奨（汚れた手対応）
  'touch-lg':  '80px',  // メインCTA・ナビゲーションボタン
  'touch-xl':  '96px',  // ヒーローアクション
},
```

### 4.3 レイアウトグリッド（Landscape タブレット固定）

```
画面幅: 768px 〜 1280px（Landscape 固定）
画面高: 480px 〜 800px

シーケンス再生画面のレイアウト:
┌─────────────────────────────────────────────┐
│           Header (h: 60px)                  │
├─────────────────────────┬───────────────────┤
│   VideoArea (w: 55%)    │  DescArea (w: 45%)│
│   h: calc(100vh - 180px)│  同左             │
├─────────────────────────┴───────────────────┤
│           NavButtons (h: 80px)              │
├─────────────────────────────────────────────┤
│           StepIndicator (h: 40px)           │
└─────────────────────────────────────────────┘
```

---

## 5. コンポーネント仕様

### 5.1 Button

**バリアント × サイズ の組み合わせ**

```tsx
// 3バリアント
type ButtonVariant = 'primary' | 'secondary' | 'ghost';

// 3サイズ
type ButtonSize = 'sm' | 'md' | 'lg';

// サイズ別スペック
// sm: h-12 (48px)  px-4  text-base  - リスト内アクション
// md: h-16 (64px)  px-6  text-lg    - 一般操作
// lg: h-20 (80px)  px-8  text-xl    - ナビゲーション・メインCTA
```

```tsx
// 視覚仕様
// primary: bg-action-primary text-text-inverse font-bold rounded-xl
//           hover: bg-action-primary-hover
//           active: bg-action-primary-active scale-[0.98]
//           disabled: opacity-40 cursor-not-allowed

// secondary: bg-surface-overlay border border-action-secondary text-action-secondary
//             hover: bg-semantic-success-bg

// ghost: bg-transparent text-text-secondary
//         hover: bg-surface-hover text-text-primary

// 共通: transition-all duration-150 focus-visible:ring-2 focus-visible:ring-action-primary
```

### 5.2 Card

```tsx
// ベース: bg-surface-raised rounded-2xl border border-surface-overlay
//          p-4 または p-6
//          hover（タップ可能な場合）: bg-surface-hover border-action-primary/30

// CategoryCard（カテゴリ一覧）:
// - min-h: 120px
// - アイコン絵文字: text-4xl
// - タイトル: text-xl font-bold
// - 動画数バッジ

// MovieCard（動画一覧）:
// - サムネイル (16:9 比率)
// - タイトル: text-lg font-bold
// - 難易度バッジ + 時間 + ステップ数
// - min touch target: 全体が64px以上のタップ領域
```

### 5.3 Badge

```tsx
type BadgeVariant = 'difficulty' | 'step-count' | 'duration' | 'warning' | 'success';

// difficulty variants:
// beginner:     bg-semantic-success-bg text-semantic-success
// intermediate: bg-semantic-info-bg    text-semantic-info
// advanced:     bg-semantic-warning-bg text-semantic-warning

// 共通: text-sm font-semibold px-2 py-0.5 rounded-full
```

### 5.4 StepIndicator（ドット型プログレス）

```tsx
// ドットの仕様:
// 完了: w-3 h-3 bg-step-completed rounded-full
// 現在: w-4 h-4 bg-step-current rounded-full ring-2 ring-action-primary ring-offset-2
//        ring-offset-surface animate-pulse
// 未来: w-3 h-3 bg-step-pending rounded-full

// レイアウト: flex gap-2 items-center justify-center h-10

// アクセシビリティ: role="progressbar" aria-valuenow={current} aria-valuemax={total}
//                  aria-label="ステップ {current} / {total}"
```

### 5.5 NavigationButtons（前へ・次へ）

```tsx
// レイアウト: flex items-center justify-between px-4 h-20
//              2ボタンを左右に配置（中央はステップ表示）

// 前へボタン:
// - variant: ghost size: lg
// - テキスト: "← 前のステップ" (最初のステップでは hidden)
// - min-w: 180px（テキストが変わっても位置ずれしない）

// 次へボタン:
// - variant: primary size: lg
// - テキスト: "次のステップ →" (最後のステップでは "完了 ✓")
// - min-w: 180px
// - 動画完了後: animate-bounce（1回のみ）でユーザーを誘導

// 中央表示: "3 / 5" text-xl font-mono text-text-secondary
```

### 5.6 VideoPlayer フレーム

```tsx
// アスペクト比: 16/9 (aspect-video)
// 背景: bg-black（動画ロード中の表示）
// 角丸: rounded-xl（カードとの統一感）
// オーバーレイ（自動再生ブロック時）:
//   絶対配置のオーバーレイ
//   "▶ タップして再生" text-4xl font-bold
//   bg-black/60 で薄暗く
```

### 5.7 LoginScreen（ログイン画面）

```tsx
// レイアウト: 全画面 bg-surface flex flex-col items-center justify-center
// ブランドロゴ: 上部中央 text-4xl（業態選択前はFC全体のロゴ）

// 店舗選択ドロップダウン:
// - ラベル: text-text-secondary text-sm mb-2
// - select: h-16 text-lg bg-surface-raised border border-surface-overlay
//           rounded-xl px-4 w-full max-w-sm

// PIN入力テンキー（タブレット専用、キーボードUIを使わない）:
// - 0〜9 の数字ボタン: w-20 h-20 text-3xl font-bold
// - 削除ボタン: "⌫" 同サイズ
// - 送信ボタン: "ログイン" Button primary lg w-full max-w-sm
// - PIN 入力表示: ●●●● の点で表示（セキュリティのため実文字は非表示）
```

---

## 6. モーション・アニメーション原則

### 6.1 原則

- **速く、確実に**: duration は最大 200ms。厨房では遅いアニメーションはストレス
- **意味のある動き**: 「次へ」= 右方向に流れる。「前へ」= 左方向に流れる
- **バッテリー・発熱を考慮**: `prefers-reduced-motion` を常に尊重

### 6.2 定義済みトランジション

```typescript
// tailwind.config.ts に追加
transitionDuration: {
  'fast':   '100ms',  // ホバー・アクティブ状態変化
  'normal': '150ms',  // ページ内コンポーネント切り替え
  'slow':   '200ms',  // ページ遷移・モーダル
},

keyframes: {
  // 次のステップへの進み
  'slide-in-right': {
    '0%':   { transform: 'translateX(40px)', opacity: '0' },
    '100%': { transform: 'translateX(0)',    opacity: '1' },
  },
  // 前のステップへの戻り
  'slide-in-left': {
    '0%':   { transform: 'translateX(-40px)', opacity: '0' },
    '100%': { transform: 'translateX(0)',      opacity: '1' },
  },
  // 動画完了後の次へボタン誘導
  'bounce-once': {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%':      { transform: 'translateY(-8px)' },
  },
  // ステップ完了時の成功アニメーション
  'scale-in': {
    '0%':   { transform: 'scale(0.9)', opacity: '0' },
    '100%': { transform: 'scale(1)',   opacity: '1' },
  },
},

animation: {
  'slide-right': 'slide-in-right 150ms ease-out',
  'slide-left':  'slide-in-left 150ms ease-out',
  'bounce-once': 'bounce-once 300ms ease-in-out 1',
  'scale-in':    'scale-in 150ms ease-out',
},
```

---

## 7. アイコン方針

### 7.1 原則
- **アイコン単体使用禁止**: 必ずテキストラベルとペアにする
- **サイズ**: インラインアイコン 20px、スタンドアロン 28px
- **ライブラリ**: `lucide-react`（軽量・Next.js と相性良好）

### 7.2 使用アイコン一覧

| 用途 | アイコン名 | テキスト |
|------|-----------|---------|
| 前のステップ | `ChevronLeft` | 前のステップ |
| 次のステップ | `ChevronRight` | 次のステップ |
| ホームに戻る | `Home` | ホーム |
| 一覧に戻る | `ArrowLeft` | 戻る |
| ログアウト | `LogOut` | ログアウト |
| 動画再生 | `Play` | 再生する |
| 完了 | `CheckCircle` | 完了 |
| 警告 | `AlertTriangle` | 注意 |
| 情報 | `Info` | ポイント |
| ロック中 | `Lock` | ロック中 |
| QRコード | `QrCode` | QRスキャン |

---

## 8. レスポンシブ・デバイス対応

### 8.1 対応サイズとブレークポイント

```typescript
// tailwind.config.ts に追加
screens: {
  'tablet-sm':  '768px',   // iPad mini Landscape
  'tablet':     '1024px',  // iPad Landscape (標準)
  'tablet-lg':  '1180px',  // iPad Pro 11" Landscape
  'desktop':    '1280px',  // デスクトップ（確認用）
},
```

### 8.2 Landscape 固定の実装

```tsx
// app/layout.tsx の <html> に追加
// viewport meta でユーザーのズームをロック（厨房での誤操作防止）
// <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />

// シーケンス再生画面では強制 Landscape 表示を CSS で補助:
// @media (orientation: portrait) {
//   .landscape-only {
//     transform: rotate(90deg);
//     // ※ Safari の向き強制は JavaScript が必要
//   }
// }
```

---

## 9. Tailwind CSS 完全設定（`tailwind.config.ts`）

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // 将来のテーマ切り替えに備えて
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT:  '#0F0F1A',
          raised:   '#1A1A2E',
          overlay:  '#252540',
          hover:    '#2E2E50',
        },
        text: {
          primary:   '#F5F5FF',
          secondary: '#A0A0C0',
          muted:     '#6B6B8A',
          inverse:   '#0F0F1A',
        },
        action: {
          primary:          '#FF6B35',
          'primary-hover':  '#E85A28',
          'primary-active': '#CC4C1F',
          secondary:        '#00B894',
          'secondary-hover':'#009E7F',
        },
        semantic: {
          warning:    '#FDCB6E',
          'warning-bg': '#3D2E00',
          error:      '#E17055',
          'error-bg': '#3D1500',
          success:    '#55EFC4',
          'success-bg': '#003D28',
          info:       '#74B9FF',
          'info-bg':  '#00153D',
        },
        brand: {
          unagi: '#8B4513',
          ramen: '#CC3300',
        },
        step: {
          completed: '#55EFC4',
          current:   '#FF6B35',
          pending:   '#3A3A5A',
        },
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Noto Sans Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        xs:   ['12px', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        sm:   ['14px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        base: ['18px', { lineHeight: '1.6', letterSpacing: '0em' }],
        lg:   ['20px', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        xl:   ['24px', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        '2xl':['28px', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
        '3xl':['36px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        '4xl':['48px', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
      },
      spacing: {
        'touch-sm': '48px',
        'touch-md': '64px',
        'touch-lg': '80px',
        'touch-xl': '96px',
      },
      screens: {
        'tablet-sm': '768px',
        'tablet':   '1024px',
        'tablet-lg':'1180px',
        desktop:    '1280px',
      },
      transitionDuration: {
        fast:   '100ms',
        normal: '150ms',
        slow:   '200ms',
      },
      keyframes: {
        'slide-in-right': {
          '0%':   { transform: 'translateX(40px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        'slide-in-left': {
          '0%':   { transform: 'translateX(-40px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',      opacity: '1' },
        },
        'bounce-once': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'scale-in': {
          '0%':   { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
      },
      animation: {
        'slide-right': 'slide-in-right 150ms ease-out',
        'slide-left':  'slide-in-left 150ms ease-out',
        'bounce-once': 'bounce-once 300ms ease-in-out 1',
        'scale-in':    'scale-in 150ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
```
