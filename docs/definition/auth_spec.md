# 認証・認可仕様書: FC Manual Viewer

> 作成日: 2026-03-19
> 作成者: Engineer + Security Reviewer
> ステータス: Phase 1 暫定方針確定 / Phase 2 設計Draft

---

## 1. なぜ認証が必要か（Business Context）

Phase 1 では「5店舗への展開」が目的であり、当初 CEO は認証不要と判断した。
しかし Security Reviewer が以下のリスクを指摘し、**最低限の仕組みを Phase 1 から設計**することで合意した。

### Security Reviewer の指摘

1. **秘伝タレのレシピ動画が競合他社に流出するリスク**
   - 限定公開YouTube URLは「知っている人なら誰でも見られる」
   - QRコードを写真撮影されれば、店外からもアクセス可能

2. **共用タブレットの悪用リスク**
   - キッチンタブレットは複数スタッフが触る
   - 「誰が最後に触ったか」の記録がなければ、事故時の責任追跡が困難

3. **将来のログ収集の土台**
   - Phase 2 で「誰がどの動画を見たか」を収集するには、Phase 1 からアイデンティティの概念が必要

### CEO の最終判断

> **「Phase 1 では軽量な認証（店舗PINのみ）で最速デプロイ。個人識別は Phase 2 でいい。ただし設計は今やっておけ。」**

---

## 2. アクター定義

| アクター | 役割 | 主な操作 |
|---------|------|---------|
| **Staff（スタッフ）** | 現場スタッフ（アルバイト含む） | マニュアル閲覧・シーケンス再生 |
| **Manager（マネージャー）** | 店舗責任者 | スタッフ管理 + Staff のすべての操作 |
| **Owner（オーナー）** | 店舗オーナー | 店舗設定 + Manager のすべての操作 |
| **HQ Admin（本部管理者）** | フランチャイズ本部 | 全店舗・全コンテンツの管理 |

---

## 3. 権限マトリックス

| 操作 | Staff | Manager | Owner | HQ Admin |
|------|-------|---------|-------|----------|
| マニュアル閲覧（自店舗のブランド） | ✅ | ✅ | ✅ | ✅ |
| マニュアル閲覧（全ブランド） | ❌ | ❌ | ❌ | ✅ |
| QRコードからの直接アクセス | ✅ | ✅ | ✅ | ✅ |
| 動画・カテゴリの追加/編集 | ❌ | ❌ | ✅ | ✅ |
| スタッフの追加/PIN リセット | ❌ | ✅ | ✅ | ✅ |
| 視聴ログの閲覧（Phase 2） | ❌ | 自店舗のみ | 自店舗のみ | ✅ |
| 店舗設定の変更 | ❌ | ❌ | ✅ | ✅ |
| 他店舗のデータ閲覧 | ❌ | ❌ | ❌ | ✅ |

---

## 4. Phase 1: 暫定認証方針（軽量実装）

### 4.1 方針: 「店舗PIN認証」

個人認証ではなく**店舗単位の共有PIN**で認証する。
理由: 個人PINの発行・管理コストが高く、Phase 1 のスコープ外。

```
店舗A の全スタッフ: PIN = "1234"（例）
店舗B の全スタッフ: PIN = "5678"（例）
```

**認証フロー:**

```
1. アプリを開く
2. 「店舗名を選択する」ドロップダウン
3. 「PINを入力する」4〜6桁テンキー
4. ✅ 正しい → 店舗ブランドのホーム画面へ
   ❌ 誤り  → 「PINが正しくありません」（3回失敗で10分ロック）
```

**セッション管理:**
- 認証成功後は `sessionStorage` にセッションフラグを保存
- タブ/ブラウザを閉じたらログアウト（`sessionStorage` は自動消去）
- 無操作15分でログアウト（`setTimeout` で実装）

**実装方針（Phase 1）:**
- NextAuth.js は使用しない（複雑すぎる）
- `src/lib/auth/` に独自の軽量認証ユーティリティを実装
- PINは環境変数（Vercel の Environment Variables）に店舗IDをキーとして保存

```typescript
// .env.local（Vercel 環境変数）
STORE_PIN_UNAGI_TOKYO="1234"
STORE_PIN_RAMEN_OSAKA="5678"
```

> ⚠️ **Security Reviewer の注記:** 環境変数のPINは「なりすまし防止」ではなく「URLの直接アクセス防止」に過ぎない。セキュリティレベルは低い。Phase 2 で個人認証へ移行必須。

### 4.2 Phase 1 のアクセス制御

- 認証されていないアクセス → `/login` にリダイレクト（Next.js middleware）
- 認証済みセッションには `branchId` を持たせ、表示コンテンツをフィルタ

```typescript
// セッション型（Phase 1 簡易版）
interface SimpleSession {
  branchId: string;
  brandId: string;
  authenticatedAt: number; // Unix timestamp
  expiresAt: number;       // authenticatedAt + 15分
}
```

---

## 5. Phase 2: 本格認証設計（NextAuth.js + DB）

### 5.1 認証方式の選択肢と採用方針

| 方式 | 利点 | 欠点 | 評価 |
|------|------|------|------|
| **Credentials（個人PIN）** | シンプル・コスト低 | パスワードリセット運用が必要 | **採用** |
| QRコードログイン | 素早い・非識字者にも使いやすい | QRコード管理が必要 | Phase 2後半で検討 |
| Google / LINE OAuth | 既存アカウントが使える | スタッフが個人SNSアカウントを使うことへの懸念 | 不採用（個人情報問題） |
| Magic Link (メール) | パスワードレス | 厨房にメール確認環境なし | 不採用 |

### 5.2 認証フロー（Phase 2）

```
【初回ログイン】
1. Manager がダッシュボードでスタッフを登録（名前 + 初期PIN設定）
2. スタッフがタブレットで「スタッフIDを入力」+「PINを入力」
3. NextAuth の Credentials Provider で認証
4. JWT セッション発行（有効期限: 8時間 = シフト1本）
5. 自動タイムアウト: 無操作15分でセッション終了

【PIN変更】
1. スタッフがログイン後、設定画面から自分のPINを変更可能
2. 変更時に「現在のPIN」を要求（ブルートフォース対策）

【PIN リセット（忘れた場合）】
1. スタッフが Manager に申請
2. Manager がダッシュボードからリセット（新しい一時PINを発行）
3. スタッフが次回ログイン時に一時PINで入り、新PINに変更必須
```

### 5.3 共用タブレット向けの UX 設計

厨房タブレットは複数スタッフが使う。以下の設計原則を守る:

**「ログアウト」を必ず簡単にする:**
```
ヘッダー右端に常時表示: [スタッフ名] [ログアウト 🚪]
タップ1回でログアウト（確認ダイアログなし）
```

**シフト交代時の自動ログアウト:**
```
- セッション有効期限: 8時間（1シフト）
- 無操作タイムアウト: 15分
- タイムアウト前に60秒の警告バナー表示（操作で延長可能）
```

**ロック画面（スクリーンセーバー代替）:**
```
無操作5分 → 暗転 + 「タップして再開」画面
（認証は維持したまま、画面だけ消す）
無操作15分 → 完全ログアウト
```

### 5.4 セキュリティ要件（Phase 2）

| 要件 | 実装方法 |
|------|---------|
| PIN はハッシュ化して保存 | bcrypt（cost factor: 10） |
| HTTPS 必須 | Vercel がデフォルトで対応 |
| CSRF 対策 | NextAuth が標準提供 |
| Rate Limiting | Upstash Redis + @upstash/ratelimit |
| 認証ログ | Supabase の auth.logs テーブル |
| セッションの無効化 | DB セッションテーブル + JWT blocklist |

---

## 6. Phase 1 の実装スコープ（明確な境界線）

### **やること（Phase 1）**

- [x] ログインページ（`/login`）の UI 作成
- [x] 店舗PIN による簡易認証
- [x] `sessionStorage` ベースのセッション管理（15分タイムアウト）
- [x] Next.js Middleware による未認証リダイレクト
- [x] `branchId` に基づくコンテンツフィルタリング（DAL レベル）

### **やらないこと（Phase 1 スコープ外）**

- ❌ 個人ごとのアカウント・PIN 管理
- ❌ NextAuth.js の導入
- ❌ 視聴ログの収集
- ❌ 管理ダッシュボード
- ❌ パスワードリセット機能
- ❌ 2FA / MFA

---

## 7. Auth 関連の型定義（`src/types/auth.ts` に追加予定）

```typescript
/** Phase 1 簡易セッション */
export interface SimpleSession {
  branchId: string;
  brandId: string;
  authenticatedAt: number;
  expiresAt: number;
}

/** Phase 2 スタッフセッション（NextAuth Session 拡張） */
export interface StaffSession {
  staff: {
    id: string;
    name: string;
    branchId: string;
    role: 'owner' | 'manager' | 'staff';
  };
  expires: string; // ISO 8601
}

/** ログイン試行結果 */
export type LoginResult =
  | { success: true; session: SimpleSession }
  | { success: false; reason: 'invalid_pin' | 'locked' | 'branch_not_found' };
```

---

## 8. 未解決の認証設計疑問

| # | 疑問 | 決定期限 |
|---|------|---------|
| Auth-1 | Phase 1 の PIN はハードコードするか、Vercel 環境変数か、静的ファイルか？ | 実装前 |
| Auth-2 | QRコードスキャンで直接動画を開く場合、認証をバイパスするか？ | Phase 2 設計時 |
| Auth-3 | 「スタッフID」は必要か？（名前だけで識別するか、数値IDを使うか） | Phase 2 設計時 |
| Auth-4 | HQ Admin のログインは通常スタッフと同じUIか、別の管理画面か？ | Phase 2 設計時 |
