# プロトタイプギャラリー

このディレクトリはUX検証用のHTMLプロトタイプを管理する場所です。本番コードとは別管理され、ユーザー体験の検証や機能のプロトタイピングに用いられます。

## ディレクトリ構成

```
prototype/
├── index.html        # ギャラリーページ
├── manifest.json     # プロトタイプ一覧
├── gallery.css       # ギャラリー共通スタイル
├── README.md         # このファイル
└── YYYYMMDD_テーマ_説明/   # 各プロトタイプ
    ├── meta.json           # メタデータ
    ├── index.html          # エントリーポイント
    └── src/
        ├── styles.css
        └── main.js
```

## 新しいプロトタイプを追加する手順

1. **ディレクトリを作成** - ディレクトリ名は `YYYYMMDD_テーマ_説明` 形式で作成してください。
2. **meta.json を作成** - プロトタイプのメタデータファイルを作成します。`title`、`description`、`verifying`、`author`、`createdAt` フィールドが必須です。
3. **manifest.json を更新** - ルートの `manifest.json` の `prototypes` 配列に新しいディレクトリ名を追加します。

## meta.json スキーマ

| フィールド | 説明 |
|----------|------|
| `title` | プロトタイプの表題 |
| `description` | 何を実装したか |
| `verifying` | 何を検証するか |
| `author` | 作成者のGitHub ID |
| `createdAt` | 作成日（YYYY-MM-DD形式） |

## 命名規則

ディレクトリ名は以下の形式に従います：

- `YYYYMMDD` - 作成日（例：20260403）
- `テーマ` - テーマをケバブケース（kebab-case）で表記
- `説明` - 簡潔な説明をケバブケースで表記

**例**: `20260403_viewer-ux_basic-flow`

## 開き方

### ブラウザで直接開く

```bash
open prototype/index.html
```

### ローカルサーバーで実行する（推奨）

`fetch()` を使用するため、ローカルサーバーが必要になります：

```bash
npx serve prototype
```

その後、ブラウザで `http://localhost:3000` にアクセスしてください。
