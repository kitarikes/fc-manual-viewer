/**
 * FC Manual Viewer Prototype — Data & Navigation
 *
 * モックデータをインライン埋め込みして、
 * URLパラメータによるページ内状態管理を実現する。
 */

(function () {

// ============================================================
// Mock Data
// ============================================================

const BRANDS = [
  {
    id: 'unagi',
    name: 'うなぎ業態',
    slug: 'unagi',
    description: 'うなぎ専門店グループのオペレーションマニュアル。\n捌き・仕込み・焼き・盛り付けの全工程を網羅。',
    icon: '🐟',
  },
  {
    id: 'ramen',
    name: 'ラーメン業態',
    slug: 'ramen',
    description: '醤油・塩・味噌ラーメン専門店グループのオペレーションマニュアル。\nスープから麺の茹で方まで詳細に解説。',
    icon: '🍜',
  },
];

const CATEGORIES = [
  { id: 'eel-processing', brandId: 'unagi', name: 'うなぎ下処理', slug: 'eel-processing', description: '活うなぎの締め・捌き・骨取りの基本工程', icon: '🐟', movieCount: 2 },
  { id: 'tare-preparation', brandId: 'unagi', name: 'タレ・山椒仕込み', slug: 'tare-preparation', description: '秘伝のタレと山椒の仕込み手順', icon: '🧪', movieCount: 1 },
  { id: 'grilling', brandId: 'unagi', name: '焼き工程', slug: 'grilling', description: '白焼き・蒸し・本焼きの三工程', icon: '🔥', movieCount: 0 },
  { id: 'plating', brandId: 'unagi', name: '盛り付け・提供', slug: 'plating', description: '器への盛り付けと提供タイミングの基準', icon: '🍱', movieCount: 0 },
  { id: 'soup-base', brandId: 'ramen', name: 'スープ仕込み', slug: 'soup-base', description: 'スープ（豚骨・鶏白湯・昆布）の仕込み手順', icon: '🫕', movieCount: 1 },
  { id: 'noodles', brandId: 'ramen', name: '麺の茹で方', slug: 'noodles', description: '麺種別の茹で時間・水切り・盛り付け基準', icon: '🫙', movieCount: 0 },
];

const MOVIES = [
  {
    id: 'eel-fillet',
    categoryId: 'eel-processing',
    title: 'うなぎの捌き方（関東開き）',
    description: '活うなぎを関東開きで捌く基本手順。頭の落とし方から骨取りまで5ステップで習得する。',
    totalSteps: 5,
    estimatedMinutes: 15,
    difficulty: 'intermediate',
    tags: ['捌き', '包丁', '骨取り', '関東開き'],
  },
  {
    id: 'eel-stunning',
    categoryId: 'eel-processing',
    title: 'うなぎの締め方',
    description: '活うなぎを人道的かつ安全に締める手順。目打ち・頭落としの基本。',
    totalSteps: 3,
    estimatedMinutes: 5,
    difficulty: 'beginner',
    tags: ['締め', '目打ち', '下処理'],
  },
  {
    id: 'secret-tare',
    categoryId: 'tare-preparation',
    title: '秘伝タレの仕込み（醤油ベース）',
    description: '代々受け継がれる秘伝タレの仕込み手順。醤油・みりん・砂糖の配合と火入れの温度管理。',
    totalSteps: 4,
    estimatedMinutes: 30,
    difficulty: 'advanced',
    tags: ['タレ', '醤油', '温度管理', '継ぎ足し'],
  },
  {
    id: 'tonkotsu-soup',
    categoryId: 'soup-base',
    title: '豚骨スープ仕込み（12時間炊き）',
    description: '白濁した豚骨スープを12時間かけて炊き上げる手順。骨の下処理から完成まで。',
    totalSteps: 6,
    estimatedMinutes: 45,
    difficulty: 'advanced',
    tags: ['豚骨', 'スープ', '白濁', '長時間炊き'],
  },
];

const SEQUENCES = {
  'eel-fillet': [
    {
      stepNumber: 1, title: '道具の準備と衛生確認', videoId: 'PLACEHOLDER_STEP1',
      durationSeconds: 90,
      description: '捌き作業を始める前に、目打ち・包丁・まな板を清潔な状態に整えます。まな板は水で濡らし、滑り止めの布巾を敷いてください。',
      keyPoints: ['包丁は研ぎたての状態であることを確認する', 'まな板は専用の「魚用まな板」を使用する（肉・野菜との共用禁止）', '作業前に必ず手洗いと使い捨てグローブ着用'],
      warnings: ['手洗いをせずに作業開始することは食品衛生法違反になります'],
    },
    {
      stepNumber: 2, title: '目打ちで頭を固定する', videoId: 'PLACEHOLDER_STEP2',
      durationSeconds: 120,
      description: 'うなぎの頭部をまな板に目打ちで固定します。目の後ろ1cmほどの位置を狙い、一気に打ち込みます。力が入りすぎると身が崩れるため注意してください。',
      keyPoints: ['目打ちの位置は「目の後ろ約1cm」', '斜め45度の角度で力強く一気に打つ', '固定後、うなぎの動きが止まったことを確認してから作業継続'],
      warnings: ['目打ちは鋭利な刃物です。指を固定位置の近くに置かないこと', '不慣れな場合はシニアスタッフの立ち合いのもとで行うこと'],
    },
    {
      stepNumber: 3, title: '背びれに沿って包丁を入れる（関東開き）', videoId: 'PLACEHOLDER_STEP3',
      durationSeconds: 180,
      description: '関東開きは「背開き」とも呼ばれます。背びれに沿って包丁を頭側から尾に向かって一直線に引きます。刃は骨に当たるように角度を調整してください。',
      keyPoints: ['包丁を骨に沿わせることが「きれいな身」のコツ', '一度で引ける長い包丁（うなぎ包丁）を使用する', '切り口が曲がらないよう、まな板に対して水平に保つ'],
      warnings: ['包丁を手前に引く方向に人がいないことを確認すること'],
    },
    {
      stepNumber: 4, title: '内臓の取り除き', videoId: 'PLACEHOLDER_STEP4',
      durationSeconds: 150,
      description: '開いた腹側から内臓を取り除きます。胆嚢（緑色の袋）を破ると苦味の原因になるため、絶対に傷つけないよう丁寧に取り除いてください。',
      keyPoints: ['胆嚢は緑色の小さな袋。慎重につまんで取り除く', '内臓除去後は流水で身全体を洗い流す', '血合いの部分は丁寧に水で流す（臭みの原因になる）'],
      warnings: ['胆嚢を破ると周囲の身が苦くなります。破ってしまった場合は直ちにシニアスタッフへ報告'],
    },
    {
      stepNumber: 5, title: '骨取りと仕上げ', videoId: 'PLACEHOLDER_STEP5',
      durationSeconds: 200,
      description: '中骨を取り除き、身を整えます。骨抜きを使って小骨を1本ずつ丁寧に取り除いてください。最後に水気を拭き取り、ラップで包んで冷蔵保管します。',
      keyPoints: ['骨抜きは身に対して垂直方向に引く', '骨を見落とさないよう、指の腹で身を撫でて確認する', '処理済みの身は2時間以内に使用、または冷蔵保管（4℃以下）'],
      warnings: ['骨取り後の廃棄物（頭・内臓・骨）は専用の廃棄容器に入れること'],
    },
  ],
  'eel-stunning': [
    {
      stepNumber: 1, title: '活魚の確認と準備', videoId: 'PLACEHOLDER_STUNNING_S1',
      durationSeconds: 60,
      description: '水槽から活うなぎを取り出す前に、元気があること（活きが良いこと）を確認します。弱っている個体は使用を避け、担当者に報告してください。',
      keyPoints: ['活きの良い個体は水槽内で活発に動いている', '弱っている・浮いている個体は使用不可', '取り出す際は専用のトングを使用（素手禁止）'],
      warnings: [],
    },
    {
      stepNumber: 2, title: '目打ちによる締め', videoId: 'PLACEHOLDER_STUNNING_S2',
      durationSeconds: 90,
      description: 'うなぎをまな板に置き、頭を素早く目打ちで固定・締めます。動きが止まるまで1〜2秒待ちます。',
      keyPoints: ['目打ちは目の後ろに垂直に打つ', '動きが止まるまで手を離さない'],
      warnings: ['必ず目打ちを使うこと。素手や他の道具での代替は禁止'],
    },
    {
      stepNumber: 3, title: '頭を落として捌き作業へ引き渡し', videoId: 'PLACEHOLDER_STUNNING_S3',
      durationSeconds: 60,
      description: '締め終わったうなぎの頭を包丁で落とし、次の「捌き」工程に渡します。切断面は清潔な布巾で拭き取ってください。',
      keyPoints: ['包丁は頭の付け根に直角に入れ、一度で切り落とす', '切断後のうなぎは10分以内に捌き工程へ'],
      warnings: [],
    },
  ],
  'secret-tare': [
    {
      stepNumber: 1, title: '材料の計量と確認', videoId: 'PLACEHOLDER_TARE_S1',
      durationSeconds: 120,
      description: '醤油・みりん・砂糖・清酒を所定の配合比率で正確に計量します。配合比率は「タレレシピカード」を必ず参照してください。',
      keyPoints: ['計量は0.1g単位のデジタルスケールを使用すること', 'みりんは本みりんを使用（みりん風調味料は不可）', '醤油は当店指定銘柄のみ（代替品は使用不可）'],
      warnings: ['配合比率は機密情報です。記録や撮影は禁止'],
    },
    {
      stepNumber: 2, title: '合わせて火にかける', videoId: 'PLACEHOLDER_TARE_S2',
      durationSeconds: 240,
      description: '計量した材料を鍋に合わせ、中火で加熱します。沸騰前に弱火に落とし、アルコール分を飛ばします。この工程でタレの深みが決まります。',
      keyPoints: ['沸騰させすぎると醤油の風味が飛ぶ（80〜85℃をキープ）', 'アルコール分が飛んだ目安: 炎に近づけて引火しなくなること', '木べらで底を定期的にかき混ぜる（焦げ付き防止）'],
      warnings: ['引火テストは必ず換気扇をONにして行うこと'],
    },
    {
      stepNumber: 3, title: '継ぎ足しタレへの合流', videoId: 'PLACEHOLDER_TARE_S3',
      durationSeconds: 90,
      description: '新しく作ったタレを既存の「継ぎ足しタレ」に加えます。継ぎ足しタレの量が鍋の1/3を下回った時点でこの工程を行います。',
      keyPoints: ['継ぎ足し前に継ぎ足しタレの温度が60℃以上あることを確認', '新タレを少しずつ注ぎながら木べらで混ぜる', '混合後の温度が70℃以上になるまで加熱を継続'],
      warnings: [],
    },
    {
      stepNumber: 4, title: '品質確認と記録', videoId: 'PLACEHOLDER_TARE_S4',
      durationSeconds: 90,
      description: '仕込み完了後、色・香り・濃度の基準値を確認します。所定の「タレ管理台帳」に仕込み日時・担当者・継ぎ足し量を記録してください。',
      keyPoints: ['色基準: 深い茶褐色（サンプルカラーチャートと比較）', '濃度基準: スプーンからゆっくり落ちる程度のとろみ', '台帳への記録は当日中に必ず行うこと'],
      warnings: [],
    },
  ],
  'tonkotsu-soup': [
    {
      stepNumber: 1, title: '骨の下処理（血抜き・下茹で）', videoId: 'PLACEHOLDER_TONKOTSU_S1',
      durationSeconds: 180,
      description: '豚骨を冷水に一晩浸けて血抜きします。翌日、沸騰したお湯で5分間下茹でし、出てきたアクを捨てます。骨を流水でよく洗ってください。',
      keyPoints: ['血抜きは最低4時間、理想は一晩（8時間以上）', '下茹でのお湯は必ず捨てること（アク・臭みの原因）', '洗った骨はすぐに本茹での鍋へ'],
      warnings: [],
    },
    {
      stepNumber: 2, title: '強火で白濁させる（最初の1時間）', videoId: 'PLACEHOLDER_TONKOTSU_S2',
      durationSeconds: 300,
      description: '洗った骨を大鍋に入れ、たっぷりの水から強火にかけます。最初の1時間は強火を維持し、スープを白濁させます。アクが出たら都度すくってください。',
      keyPoints: ['白濁の原因: 骨髄のコラーゲンが乳化すること', '強火を維持することで乳化が進む', 'アクは出たら都度取り除く（風味が濁る原因）'],
      warnings: ['吹きこぼれ注意。鍋の容量の70%以上は水を入れない'],
    },
    {
      stepNumber: 3, title: '中火で煮込む（〜12時間）', videoId: 'PLACEHOLDER_TONKOTSU_S3',
      durationSeconds: 240,
      description: '白濁したら中火に落とし、合計12時間を目標に煮込みます。水分が蒸発して減ってきたら、熱湯（必ず熱湯）を足してください。',
      keyPoints: ['水を足す場合は必ず熱湯（冷水はNG: 温度が下がり乳化が止まる）', '目標水量: 最終的に骨がひたひたの状態', '途中で火を止めないこと'],
      warnings: ['長時間加熱中は定期的に確認すること（焦げ付き防止）'],
    },
    {
      stepNumber: 4, title: '仕上げ調味', videoId: 'PLACEHOLDER_TONKOTSU_S4',
      durationSeconds: 120,
      description: '12時間後、スープを一度ざるで濾して骨・残渣を除きます。塩・醤油で基本味を整えます。各店舗の「スープ配合カード」に従ってください。',
      keyPoints: ['ざる濾しは2回行う（1回目: 粗め、2回目: 細め）', '調味前に少量味見し、スープの濃度を確認', '配合カードの分量を厳守'],
      warnings: [],
    },
  ],
};

// ============================================================
// URL Param Utilities
// ============================================================

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// ============================================================
// Render Utilities
// ============================================================

function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function difficultyLabel(d) {
  const map = { beginner: '初級', intermediate: '中級', advanced: '上級' };
  return map[d] || d;
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}分` : `${m}分${s}秒`;
}

// ============================================================
// Exported helpers (attached to window for HTML pages)
// ============================================================

window.AppData = { BRANDS, CATEGORIES, MOVIES, SEQUENCES };
window.AppUtils = { getParam, escHtml, difficultyLabel, formatDuration };

})();
