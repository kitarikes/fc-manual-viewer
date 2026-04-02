---
name: prototype-builder
description: Use when user wants to build a prototype, verify UX, or create new prototype screens for fc-manual-viewer. Triggers on "プロトタイプを作って", "UXを検証したい", "新しいプロト画面が欲しい".
---

# Prototype Builder

## Overview

fc-manual-viewer のプロトタイプを素早く作るスキル。設計フェーズを Sonnet が担い、実装フェーズは役割分担して進める。

## Workflow

### Phase 1: 設計（Sonnet が行う）

ユーザーに以下を確認・整理する：

1. **検証目的** — 何を確かめたいか（UX フローの問題点、情報設計など）
2. **必要な画面** — 画面リストと画面間遷移を設計する
3. **URL パラメータ設計** — `?brand=`, `?category=`, `?movie=` 等を決める
4. **デザイン方針** — 既存スタイルを踏襲するか、新規要素があるか

設計をユーザーと確認してから実装フェーズへ進む。

### Phase 2: 実装（役割分担）

**haiku subagent に並行して委譲するファイル：**
- `meta.json` — プロトタイプのメタデータ
- `README.md` — 検証目的・画面構成の説明
- `src/main.js` — モックデータ（window.AppData）+ ナビゲーション utils

**Sonnet 自身が書くファイル（デザイン重視）：**
- `src/styles.css` — デザイン変数・共通スタイル
- 各 HTML 画面（index.html, category.html 等）

## ディレクトリ・ファイル規約

### ディレクトリ名

```
prototype/YYYYMMDD_テーマ_説明/
```

例: `20260403_viewer-ux_basic-flow`

### ファイル構成

```
prototype/YYYYMMDD_テーマ_説明/
  meta.json
  README.md
  index.html        # トップ / ブランド選択
  [画面名].html     # 追加画面
  src/
    main.js         # window.AppData + window.AppUtils
    styles.css      # 共通スタイル
```

### meta.json 必須フィールド

```json
{
  "title": "プロトタイプ名（日本語）",
  "description": "概要説明",
  "verifying": "検証したい体験・仮説",
  "author": "kitarikes",
  "createdAt": "YYYY-MM-DD"
}
```

### manifest.json への追記

実装後、`prototype/manifest.json` の `prototypes` 配列に追加する：

```json
{
  "prototypes": [
    "20260403_viewer-ux_basic-flow",
    "YYYYMMDD_新しいプロト"
  ]
}
```

## デザイン変数（必ず使うこと）

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;500;600&family=Noto+Sans+JP:wght@300;400;500&display=swap');

:root {
  --ivory: #fdf8f0;
  --ivory-dark: #f5ede0;
  --ivory-border: #e8d9c4;
  --primary: #5c2d0a;       /* 深みブラウン */
  --primary-light: #7a3e14;
  --gold: #c9914a;           /* アンティークゴールド */
  --gold-light: #dba96a;
  --gold-pale: #f5e8cf;
  --text-main: #2d1a0a;
  --text-sub: #6b4d2c;
  --text-muted: #a88a6a;
  --serif: 'Noto Serif JP', Georgia, serif;
  --sans: 'Noto Sans JP', sans-serif;
}
```

**禁止事項：**
- 黒（`#000`, `#111` 等）の多用禁止 — 高級うなぎ店システムの雰囲気を維持
- 上記デザイン変数を無視した配色禁止

## src/main.js の構造

```js
// モックデータ
const BRANDS = [...];
const CATEGORIES = [...];
const MOVIES = [...];

// URL パラメータ取得
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// エスケープ・ユーティリティ
function escHtml(s) { ... }

// navbar 生成ユーティリティ
function buildNavbar({ backHref, backLabel, breadcrumbs, title }) { ... }

// グローバル公開
window.AppData = { BRANDS, CATEGORIES, MOVIES };
window.AppUtils = { getParam, escHtml, buildNavbar };
```

参考実装: `prototype/20260403_viewer-ux_basic-flow/src/main.js`

## 画面間ナビゲーション

- 各 HTML ヘッダーの `<nav class="navbar">` で完結させる
- `buildNavbar()` を使ってパンくず + 戻るリンクを生成する
- 画面遷移は URL パラメータで状態を渡す（例: `category.html?brand=unagi`）

## 参照ファイル

- **参考実装**: `prototype/20260403_viewer-ux_basic-flow/`
- **データ型**: `src/types/manual.ts`
- **サンプルデータ**: `src/data/mockData.ts`

## 実装チェックリスト

- [ ] 設計をユーザーと確認した
- [ ] ディレクトリ名が `YYYYMMDD_テーマ_説明` 形式
- [ ] meta.json の必須フィールドがすべて揃っている
- [ ] prototype/manifest.json の prototypes 配列に追記した
- [ ] デザイン変数を使用している（黒多用なし）
- [ ] 画面ナビが navbar で完結している
- [ ] モックデータが window.AppData として公開されている
