/**
 * FC Manual Viewer - モックデータ
 *
 * 実運用を想定したサンプルデータ。
 * DAL（Data Access Layer）経由で取得すること。直接インポートしないこと。
 *
 * Phase 1: このファイルがデータソース
 * Phase 2: このファイルをSupabase/Prismaクエリに差し替える
 */

import type {
  Brand,
  Category,
  Movie,
  ManualSequence,
} from '../types/manual';

// ============================================================
// ブランド
// ============================================================

export const brands: Brand[] = [
  {
    id: 'unagi',
    name: 'うなぎ業態',
    slug: 'unagi',
    description: 'うなぎ専門店グループのオペレーションマニュアル',
    themeColor: '#8B4513',
    isActive: true,
    displayOrder: 1,
    allowedBranchIds: null,
  },
  {
    id: 'ramen',
    name: 'ラーメン業態',
    slug: 'ramen',
    description: '醤油・塩・味噌ラーメン専門店グループのオペレーションマニュアル',
    themeColor: '#CC3300',
    isActive: true,
    displayOrder: 2,
    allowedBranchIds: null,
  },
];

// ============================================================
// カテゴリ
// ============================================================

export const categories: Category[] = [
  // ----- うなぎ業態 -----
  {
    id: 'eel-processing',
    brandId: 'unagi',
    name: 'うなぎ下処理',
    slug: 'eel-processing',
    description: '活うなぎの締め・捌き・骨取りの基本工程',
    iconEmoji: '🐟',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'tare-preparation',
    brandId: 'unagi',
    name: 'タレ・山椒仕込み',
    slug: 'tare-preparation',
    description: '秘伝のタレと山椒の仕込み手順',
    iconEmoji: '🧪',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'grilling',
    brandId: 'unagi',
    name: '焼き工程',
    slug: 'grilling',
    description: '白焼き・蒸し・本焼きの三工程',
    iconEmoji: '🔥',
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 'plating',
    brandId: 'unagi',
    name: '盛り付け・提供',
    slug: 'plating',
    description: '器への盛り付けと提供タイミングの基準',
    iconEmoji: '🍱',
    displayOrder: 4,
    isActive: true,
  },
  // ----- ラーメン業態 -----
  {
    id: 'soup-base',
    brandId: 'ramen',
    name: 'スープ仕込み',
    slug: 'soup-base',
    description: 'スープ（豚骨・鶏白湯・昆布）の仕込み手順',
    iconEmoji: '🍜',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'noodles',
    brandId: 'ramen',
    name: '麺の茹で方',
    slug: 'noodles',
    description: '麺種別の茹で時間・水切り・盛り付け基準',
    iconEmoji: '🫙',
    displayOrder: 2,
    isActive: true,
  },
];

// ============================================================
// 動画（マニュアル）
// ============================================================

export const movies: Movie[] = [
  // ----- うなぎ下処理 -----
  {
    id: 'eel-fillet',
    categoryId: 'eel-processing',
    title: 'うなぎの捌き方（関東開き）',
    description:
      '活うなぎを関東開きで捌く基本手順。頭の落とし方から骨取りまで5ステップで習得する。',
    thumbnailUrl: '/thumbnails/eel-fillet.jpg',
    totalSteps: 5,
    estimatedMinutes: 15,
    difficulty: 'intermediate',
    tags: ['捌き', '包丁', '骨取り', '関東開き'],
    displayOrder: 1,
    isActive: true,
    createdAt: '2026-01-10T09:00:00+09:00',
    updatedAt: '2026-03-01T14:30:00+09:00',
  },
  {
    id: 'eel-stunning',
    categoryId: 'eel-processing',
    title: 'うなぎの締め方',
    description:
      '活うなぎを人道的かつ安全に締める手順。目打ち・頭落としの基本。',
    thumbnailUrl: '/thumbnails/eel-stunning.jpg',
    totalSteps: 3,
    estimatedMinutes: 5,
    difficulty: 'beginner',
    tags: ['締め', '目打ち', '下処理'],
    displayOrder: 2,
    isActive: true,
    createdAt: '2026-01-10T09:00:00+09:00',
    updatedAt: '2026-03-01T14:30:00+09:00',
  },
  // ----- タレ仕込み -----
  {
    id: 'secret-tare',
    categoryId: 'tare-preparation',
    title: '秘伝タレの仕込み（醤油ベース）',
    description:
      '代々受け継がれる秘伝タレの仕込み手順。醤油・みりん・砂糖の配合と火入れの温度管理。',
    thumbnailUrl: '/thumbnails/secret-tare.jpg',
    totalSteps: 4,
    estimatedMinutes: 30,
    difficulty: 'advanced',
    tags: ['タレ', '醤油', '温度管理', '継ぎ足し'],
    displayOrder: 1,
    isActive: true,
    createdAt: '2026-01-15T10:00:00+09:00',
    updatedAt: '2026-02-20T11:00:00+09:00',
  },
  // ----- ラーメン: スープ仕込み -----
  {
    id: 'tonkotsu-soup',
    categoryId: 'soup-base',
    title: '豚骨スープ仕込み（12時間炊き）',
    description:
      '白濁した豚骨スープを12時間かけて炊き上げる手順。骨の下処理から完成まで。',
    thumbnailUrl: '/thumbnails/tonkotsu-soup.jpg',
    totalSteps: 6,
    estimatedMinutes: 45,
    difficulty: 'advanced',
    tags: ['豚骨', 'スープ', '白濁', '長時間炊き'],
    displayOrder: 1,
    isActive: true,
    createdAt: '2026-02-01T08:00:00+09:00',
    updatedAt: '2026-03-10T16:00:00+09:00',
  },
];

// ============================================================
// マニュアルシーケンス（ステップ）
// ============================================================

export const manualSequences: ManualSequence[] = [
  // ============================================================
  // うなぎの捌き方（関東開き）- 5ステップ
  // ============================================================
  {
    id: 'eel-fillet-step-01',
    movieId: 'eel-fillet',
    stepNumber: 1,
    title: 'ステップ1: 道具の準備と衛生確認',
    description:
      '捌き作業を始める前に、目打ち・包丁・まな板を清潔な状態に整えます。まな板は水で濡らし、滑り止めの布巾を敷いてください。',
    video: {
      provider: 'youtube',
      videoId: 'PLACEHOLDER_STEP1_VIDEO_ID',
    },
    durationSeconds: 90,
    keyPoints: [
      '包丁は研ぎたての状態であることを確認する',
      'まな板は専用の「魚用まな板」を使用する（肉・野菜との共用禁止）',
      '作業前に必ず手洗いと使い捨てグローブ着用',
    ],
    warnings: ['手洗いをせずに作業開始することは食品衛生法違反になります'],
    isActive: true,
  },
  {
    id: 'eel-fillet-step-02',
    movieId: 'eel-fillet',
    stepNumber: 2,
    title: 'ステップ2: 目打ちで頭を固定する',
    description:
      'うなぎの頭部をまな板に目打ちで固定します。目の後ろ1cmほどの位置を狙い、一気に打ち込みます。力が入りすぎると身が崩れるため注意してください。',
    video: {
      provider: 'youtube',
      videoId: 'PLACEHOLDER_STEP2_VIDEO_ID',
    },
    durationSeconds: 120,
    keyPoints: [
      '目打ちの位置は「目の後ろ約1cm」',
      '斜め45度の角度で力強く一気に打つ',
      '固定後、うなぎの動きが止まったことを確認してから作業継続',
    ],
    warnings: [
      '目打ちは鋭利な刃物です。指を固定位置の近くに置かないこと',
      '不慣れな場合はシニアスタッフの立ち合いのもとで行うこと',
    ],
    isActive: true,
  },
  {
    id: 'eel-fillet-step-03',
    movieId: 'eel-fillet',
    stepNumber: 3,
    title: 'ステップ3: 背びれに沿って包丁を入れる（関東開き）',
    description:
      '関東開きは「背開き」とも呼ばれます。背びれに沿って包丁を頭側から尾に向かって一直線に引きます。刃は骨に当たるように角度を調整してください。',
    video: {
      provider: 'youtube',
      videoId: 'PLACEHOLDER_STEP3_VIDEO_ID',
    },
    durationSeconds: 180,
    keyPoints: [
      '包丁を骨に沿わせることが「きれいな身」のコツ',
      '一度で引ける長い包丁（うなぎ包丁）を使用する',
      '切り口が曲がらないよう、まな板に対して水平に保つ',
    ],
    warnings: ['包丁を手前に引く方向に人がいないことを確認すること'],
    isActive: true,
  },
  {
    id: 'eel-fillet-step-04',
    movieId: 'eel-fillet',
    stepNumber: 4,
    title: 'ステップ4: 内臓の取り除き',
    description:
      '開いた腹側から内臓を取り除きます。胆嚢（緑色の袋）を破ると苦味の原因になるため、絶対に傷つけないよう丁寧に取り除いてください。',
    video: {
      provider: 'youtube',
      videoId: 'PLACEHOLDER_STEP4_VIDEO_ID',
    },
    durationSeconds: 150,
    keyPoints: [
      '胆嚢は緑色の小さな袋。慎重につまんで取り除く',
      '内臓除去後は流水で身全体を洗い流す',
      '血合いの部分は丁寧に水で流す（臭みの原因になる）',
    ],
    warnings: [
      '胆嚢を破ると周囲の身が苦くなります。破ってしまった場合は直ちにシニアスタッフへ報告',
    ],
    isActive: true,
  },
  {
    id: 'eel-fillet-step-05',
    movieId: 'eel-fillet',
    stepNumber: 5,
    title: 'ステップ5: 骨取りと仕上げ',
    description:
      '中骨を取り除き、身を整えます。骨抜きを使って小骨を1本ずつ丁寧に取り除いてください。最後に水気を拭き取り、ラップで包んで冷蔵保管します。',
    video: {
      provider: 'youtube',
      videoId: 'PLACEHOLDER_STEP5_VIDEO_ID',
    },
    durationSeconds: 200,
    keyPoints: [
      '骨抜きは身に対して垂直方向に引く',
      '骨を見落とさないよう、指の腹で身を撫でて確認する',
      '処理済みの身は2時間以内に使用、または冷蔵保管（4℃以下）',
    ],
    warnings: ['骨取り後の廃棄物（頭・内臓・骨）は専用の廃棄容器に入れること'],
    isActive: true,
  },

  // ============================================================
  // うなぎの締め方 - 3ステップ
  // ============================================================
  {
    id: 'eel-stunning-step-01',
    movieId: 'eel-stunning',
    stepNumber: 1,
    title: 'ステップ1: 活魚の確認と準備',
    description:
      '水槽から活うなぎを取り出す前に、元気があること（活きが良いこと）を確認します。弱っている個体は使用を避け、担当者に報告してください。',
    video: {
      provider: 'youtube',
      videoId: 'PLACEHOLDER_STUNNING_S1_VIDEO_ID',
    },
    durationSeconds: 60,
    keyPoints: [
      '活きの良い個体は水槽内で活発に動いている',
      '弱っている・浮いている個体は使用不可',
      '取り出す際は専用のトングを使用（素手禁止）',
    ],
    isActive: true,
  },
  {
    id: 'eel-stunning-step-02',
    movieId: 'eel-stunning',
    stepNumber: 2,
    title: 'ステップ2: 目打ちによる締め',
    description:
      'うなぎをまな板に置き、頭を素早く目打ちで固定・締めます。動きが止まるまで1〜2秒待ちます。',
    video: {
      provider: 'youtube',
      videoId: 'PLACEHOLDER_STUNNING_S2_VIDEO_ID',
    },
    durationSeconds: 90,
    keyPoints: [
      '目打ちは目の後ろに垂直に打つ',
      '動きが止まるまで手を離さない',
    ],
    warnings: ['必ず目打ちを使うこと。素手や他の道具での代替は禁止'],
    isActive: true,
  },
  {
    id: 'eel-stunning-step-03',
    movieId: 'eel-stunning',
    stepNumber: 3,
    title: 'ステップ3: 頭を落として捌き作業へ引き渡し',
    description:
      '締め終わったうなぎの頭を包丁で落とし、次の「捌き」工程に渡します。切断面は清潔な布巾で拭き取ってください。',
    video: {
      provider: 'youtube',
      videoId: 'PLACEHOLDER_STUNNING_S3_VIDEO_ID',
    },
    durationSeconds: 60,
    keyPoints: [
      '包丁は頭の付け根に直角に入れ、一度で切り落とす',
      '切断後のうなぎは10分以内に捌き工程へ',
    ],
    isActive: true,
  },

  // ============================================================
  // 秘伝タレの仕込み - 4ステップ
  // ============================================================
  {
    id: 'secret-tare-step-01',
    movieId: 'secret-tare',
    stepNumber: 1,
    title: 'ステップ1: 材料の計量と確認',
    description:
      '醤油・みりん・砂糖・清酒を所定の配合比率で正確に計量します。配合比率は「タレレシピカード」（厨房内の所定位置に保管）を必ず参照してください。',
    video: {
      provider: 'youtube',
      videoId: 'PLACEHOLDER_TARE_S1_VIDEO_ID',
    },
    durationSeconds: 120,
    keyPoints: [
      '計量は0.1g単位のデジタルスケールを使用すること',
      'みりんは本みりんを使用（みりん風調味料は不可）',
      '醤油は当店指定銘柄のみ（代替品は使用不可）',
    ],
    warnings: ['配合比率は機密情報です。記録や撮影は禁止'],
    isActive: true,
  },
  {
    id: 'secret-tare-step-02',
    movieId: 'secret-tare',
    stepNumber: 2,
    title: 'ステップ2: 合わせて火にかける',
    description:
      '計量した材料を鍋に合わせ、中火で加熱します。沸騰前に弱火に落とし、アルコール分を飛ばします。この工程でタレの深みが決まります。',
    video: {
      provider: 'youtube',
      videoId: 'PLACEHOLDER_TARE_S2_VIDEO_ID',
    },
    durationSeconds: 240,
    keyPoints: [
      '沸騰させすぎると醤油の風味が飛ぶ（80〜85℃をキープ）',
      'アルコール分が飛んだ目安: 炎に近づけて引火しなくなること',
      '木べらで底を定期的にかき混ぜる（焦げ付き防止）',
    ],
    warnings: ['引火テストは必ず換気扇をONにして行うこと'],
    isActive: true,
  },
  {
    id: 'secret-tare-step-03',
    movieId: 'secret-tare',
    stepNumber: 3,
    title: 'ステップ3: 継ぎ足しタレへの合流',
    description:
      '新しく作ったタレを既存の「継ぎ足しタレ」に加えます。継ぎ足しタレの量が鍋の1/3を下回った時点でこの工程を行います。',
    video: {
      provider: 'youtube',
      videoId: 'PLACEHOLDER_TARE_S3_VIDEO_ID',
    },
    durationSeconds: 90,
    keyPoints: [
      '継ぎ足し前に継ぎ足しタレの温度が60℃以上あることを確認',
      '新タレを少しずつ注ぎながら木べらで混ぜる',
      '混合後の温度が70℃以上になるまで加熱を継続',
    ],
    isActive: true,
  },
  {
    id: 'secret-tare-step-04',
    movieId: 'secret-tare',
    stepNumber: 4,
    title: 'ステップ4: 品質確認と記録',
    description:
      '仕込み完了後、色・香り・濃度の基準値を確認します。所定の「タレ管理台帳」に仕込み日時・担当者・継ぎ足し量を記録してください。',
    video: {
      provider: 'youtube',
      videoId: 'PLACEHOLDER_TARE_S4_VIDEO_ID',
    },
    durationSeconds: 90,
    keyPoints: [
      '色基準: 深い茶褐色（サンプルカラーチャートと比較）',
      '濃度基準: スプーンからゆっくり落ちる程度のとろみ',
      '台帳への記録は当日中に必ず行うこと',
    ],
    isActive: true,
  },
];

// ============================================================
// 集約データオブジェクト（DAL からのアクセス用）
// ============================================================

export const mockDb = {
  brands,
  categories,
  movies,
  manualSequences,
} as const;

export type MockDb = typeof mockDb;
