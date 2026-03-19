# リサーチレポート: FC Manual Viewer

> 作成日: 2026-03-19
> 目的: プロジェクト設計判断の根拠となる技術的・UX的エビデンスの収集

---

## 1. YouTube IFrame API 2024–2026 最新仕様

### 1.1 限定公開（Unlisted）動画の制御

- **埋め込み可否:** 限定公開動画は `?listType=user_uploads` などのプレイリスト参照なしでも、直接 `videoId` で IFrame に埋め込み可能。
- **視聴制限の実装:** 動画単位の「埋め込み許可/禁止」はYouTube Studio側で設定。埋め込みを禁止した動画は IFrame 内でエラーコード `101` または `150` を返す。
- **セキュリティ:** URLを知っている者だけが視聴可能（非公開との違いは検索に出ないだけ）。本番では **非公開動画 + Google アカウント認証** または **Vimeoプライベート設定** も代替として検討が必要。

### 1.2 ドメイン制限（Referer ポリシー）

- YouTube は `HTTP Referer` ヘッダーで呼び出し元ドメインを識別する。
- Googleが推奨する設定: `Referrer-Policy: strict-origin-when-cross-origin`（多くのブラウザのデフォルト）。
- **WebView（モバイルアプリ・タブレットブラウザ）では Referer が空になる場合がある**。この場合、アプリ側で明示的に Referer を設定する必要がある。
- 本プロジェクトでは Vercel デプロイ（HTTPS + 正規ドメイン）のため、通常のブラウザアクセスなら問題なし。ただし**タブレットをキオスクモード（フルスクリーンWebアプリ）で運用する場合は要検証**。

### 1.3 モバイルブラウザでの自動再生制約

| 条件 | 自動再生の可否 |
|------|---------------|
| ミュート状態 (`mute=1`) | **可能**（iOSも含む） |
| 音ありで自動再生 | ブラウザがブロック（ほぼ全環境） |
| ユーザー操作後に `playVideo()` | **可能** |
| ページロード時に `playVideo()` | ブラウザ依存でブロックされる場合あり |

- **新イベント `onAutoplayBlocked`**: 自動再生がブロックされた際に通知されるイベントが追加済み（2025年対応）。このイベントを使って「タップして再生」UIにフォールバックすること。
- **IFrame 内 autoplay パラメータ使用時の注意:** 自動再生が有効な場合、ページロード時にユーザー操作なしで視聴データが収集・共有される（Googleのポリシー）。
- 同一ページに複数のYouTubeプレーヤーを自動再生することは**ポリシー違反**。

### 1.4 廃止されたパラメータ（要注意）

以下のパラメータは**2024年以降無効**:
- `modestbranding` - YouTubeロゴを小さくする（廃止）
- `showinfo` - 動画タイトル非表示（廃止）
- `autohide` - コントロール自動非表示（廃止）

### 1.5 実装上の推奨事項

```typescript
// 推奨: ユーザー操作後に再生開始
player.loadVideoById(videoId); // または playVideo()

// 推奨: onAutoplayBlocked で fallback UI を用意
events: {
  onAutoplayBlocked: () => showTapToPlayUI(),
  onError: (e) => handlePlayerError(e.data),
}
```

**リスク評価:** YouTube IFrame API は「サードパーティサービス依存」であり、APIの変更・廃止・レート制限が将来的なリスク。動画本体はYouTubeに依存するが、**プレーヤーロジックは抽象化レイヤーで包み、将来のVimeo等への移行を容易にすること**を推奨する。

---

## 2. 飲食店DX: 厨房タブレットUI/UXのベストプラクティス

### 2.1 タッチターゲットのサイズ基準

| 機関/標準 | 最小サイズ |
|----------|-----------|
| Apple HIG | 44×44pt |
| Google Material Design | 48×48dp |
| WCAG 2.5.5 (AAA) | 44×44px |
| 厨房・キオスク環境 | **9〜12mm（約50〜68px @ 160dpi）** |

**厨房特有の課題:**
- 手袋・濡れた手でのタッチ → ターゲットは通常の1.5〜2倍必要
- 油汚れによる画面汚染 → 背景色と操作ボタンのコントラスト比は **WCAG AA（4.5:1）以上**
- キッチンの照明（蛍光灯・白熱灯）→ 明度差のみに依存しない色設計

### 2.2 横持ち固定タブレットの設計原則

- **Landscape（横向き）固定前提でレイアウト設計:** 縦向きはほぼ使用されない
- 動画（16:9）と操作ボタンを **左右分割レイアウト**（動画70% + 操作パネル30%）が厨房での視認性向上に有効
- 「次のステップ」「前のステップ」ボタンは **画面下部の親指届く範囲**に配置
- タブレットを台や棚に置いた状態でも操作可能な**大型ボタン設計**

### 2.3 推奨カラーパレット（厨房環境）

```
背景:       #1A1A2E（濃紺）または #0D0D0D（ほぼ黒）
テキスト:   #FFFFFF または #F0F0F0
アクション: #FF6B35（オレンジ）または #00B894（緑）
警告:       #FDCB6E（黄）
エラー:     #E17055（赤）
```

- **ダークテーマ推奨:** 厨房の光環境でのまぶしさ軽減 + 省電力（OLED タブレット）
- コントラスト比: 少なくとも **7:1**（WCAG AAA）を目標とする

### 2.4 認知負荷の最小化

- 1画面に表示する情報は**現在のステップのみ**（スクロール禁止設計）
- ステップ番号は **常に可視化**（例:「3 / 8」）
- フォントサイズ: 最小 **18px**、見出しは **28px以上**
- アイコン + テキストの**ペアリング**（アイコン単体はNG）

---

## 3. Next.js 15 (App Router) DBレスデータ管理

### 3.1 静的データ管理パターンの比較

| パターン | 適用場面 | 利点 | 限界 |
|---------|---------|------|------|
| TypeScript定数ファイル | 〜数百件のデータ | 型安全・シンプル | コード変更でデプロイ必要 |
| ローカルJSONファイル | 〜数千件のデータ | ファイル分割可能 | 同上 |
| MDXファイル | コンテンツ重視 | マークダウン編集 | 構造化クエリ不向き |
| CMS (Headless) | 頻繁更新・非エンジニア編集 | 管理UI付き | コスト・複雑度上昇 |
| DB + API | 万件以上・動的 | スケーラブル | インフラ費用 |

### 3.2 本プロジェクトへの推奨: DAL (Data Access Layer) パターン

```
src/
  data/
    mockData.ts          # データ本体（将来はAPI呼び出しに差し替え）
  lib/
    dal/
      categories.ts      # カテゴリ取得ロジック
      movies.ts          # 動画取得ロジック
      sequences.ts       # シーケンス取得ロジック
  types/
    manual.ts            # 共通型定義
```

- **`react.cache()`** を使ってサーバーサイドでデータを重複なく取得
- データ取得関数のインターフェース（引数・戻り値の型）をDBレスでも同一に保つことで、将来のDB移行時にDAL内の実装を差し替えるだけで済む

### 3.3 型安全な静的データの管理

```typescript
// next.config.ts で型付きルートを有効化
const config: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
};

// データ取得関数（将来のDB化を見据えたシグネチャ）
export async function getMovieById(id: string): Promise<Movie | null> {
  // Phase 1: 静的データから取得
  return mockData.movies.find(m => m.id === id) ?? null;
  // Phase 2 (将来): return await db.movie.findUnique({ where: { id } })
}
```

### 3.4 スケーラビリティ上の限界と移行トリガー

| 状況 | 推奨アクション |
|------|---------------|
| データ件数 > 500件 | CMS (Contentful/Sanity) 検討 |
| 非エンジニアが編集したい | 管理画面の実装またはCMS移行 |
| 視聴ログ収集が必要 | DB（Supabase/PlanetScale）追加 |
| 多言語対応が必要 | i18n + CMSのロケール機能 |
| オフライン対応が必要 | PWA + Service Worker + IndexedDB |

---

## 参考リンク

- [YouTube IFrame Player API Reference](https://developers.google.com/youtube/iframe_api_reference)
- [YouTube Player Parameters](https://developers.google.com/youtube/player_parameters)
- [YouTube Required Minimum Functionality](https://developers.google.com/youtube/terms/required-minimum-functionality)
- [Tablet UI Design Guide (Koombea)](https://www.koombea.com/blog/tablet-ui/)
- [Designing for Touch (Devoq / Medium)](https://devoq.medium.com/designing-for-touch-mobile-ui-ux-best-practices-c0c71aa615ee)
- [Next.js 15 App Router Guide](https://nextjs.org/docs/app)
- [Next.js 15 Advanced Patterns 2026 (Johal.in)](https://johal.in/next-js-15-advanced-patterns-app-router-server-actions-and-caching-strategies-for-2026/)
