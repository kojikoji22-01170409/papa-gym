import type { QuizStats, State } from './types';

export interface Quiz {
  id: string;
  q: string;
  choices: [string, string, string];
  answer: 0 | 1 | 2;
  why: string;
}

// Health-related trivia only. Claims are kept modest; sources are named only where they are well known.
export const QUIZZES: Quiz[] = [
  { id: 'who-strength', q: 'WHOのガイドラインで、成人の筋力トレーニングの目安は？', choices: ['週1日', '週2日以上', '毎日'], answer: 1,
    why: 'WHO（2020）は、主な筋肉を使う筋力トレーニングを週2日以上行うことを勧めています。' },
  { id: 'who-aerobic', q: 'WHOが勧める、成人の中強度の有酸素運動は週にどのくらい？', choices: ['週30〜60分', '週150〜300分', '週600分以上'], answer: 1,
    why: 'WHO（2020）は、中強度の有酸素運動を週150〜300分としています。まずは短い運動の積み重ねからで大丈夫です。' },
  { id: 'who-any', q: '運動時間が短いとき、健康面では？', choices: ['何もしないよりは良い', '10分未満は意味がない', '30分以上でないと逆効果'], answer: 0,
    why: 'WHOは、どんなに短い身体活動でも何もしないよりは良いとしています。「1種目だけ」にも意味があります。' },
  { id: 'habit-days', q: '習慣が自動的になるまでの日数は、研究（Lallyら, 2010）の中央値でどのくらい？', choices: ['約3週間', '約2か月', '約1年'], answer: 1,
    why: '中央値は約66日で、18〜254日と個人差が大きいと報告されています。「21日で習慣になる」は目安にすぎません。' },
  { id: 'habit-miss', q: '同じ研究で、1日抜けてしまった場合は？', choices: ['習慣化に大きな影響はなかった', 'ゼロからやり直しになった', '効果が半分になった'], answer: 0,
    why: '1回抜けても、習慣化の進み方に大きな影響はなかったと報告されています。お休みチケットはその考え方です。' },
  { id: 'breathing', q: '筋トレで力を入れる（持ち上げる）ときの呼吸は？', choices: ['息を止める', '息を吸う', '息を吐く'], answer: 2,
    why: '息を止めて力むと血圧が上がりやすくなります。力を入れるときに息を吐くのが基本です。' },
  { id: 'tempo', q: '同じ回数でも筋トレの刺激を増やす簡単な方法は？', choices: ['下ろす動きをゆっくりにする', '反動をつけて速くする', '休憩をなくす'], answer: 0,
    why: '戻す（下ろす）動きをゆっくり行うと、同じ回数でも負荷が増えます。回数を増やす前に試せます。' },
  { id: 'stretch-hold', q: 'ストレッチの基本は？', choices: ['反動をつけて素早く', '反動をつけず20〜30秒キープ', '痛みを我慢して長く'], answer: 1,
    why: '反動をつけず、痛気持ちいい手前でじっくり伸ばすのが基本です。痛みが出る場合は無理をしないでください。' },
  { id: 'older-strength', q: '40代以降の筋トレについて正しいのは？', choices: ['年齢が上がると効果はない', '年齢に関わらず筋力アップが期待できる', '若い人だけに効果がある'], answer: 1,
    why: '加齢で筋肉量は減りやすくなりますが、筋力トレーニングで維持・向上が期待できることが知られています。' },
  { id: 'protein', q: '筋肉の材料になる栄養素は？', choices: ['食物繊維', 'ビタミンC', 'たんぱく質'], answer: 2,
    why: '筋肉はたんぱく質でできています。肉・魚・卵・大豆製品などを毎食に取り入れましょう。' },
  { id: 'talk-test', q: '中強度の運動の目安になる「トークテスト」とは？', choices: ['話はできるが歌は歌えない強さ', '息が切れて話せない強さ', '鼻歌が歌える強さ'], answer: 0,
    why: '会話はできるが歌うのは難しい、くらいが中強度の目安とされています。' },
  { id: 'pain', q: '運動中に膝や腰に痛みが出たら？', choices: ['我慢して続ける', 'もっと強くやる', '中止して、やさしい版や休みにする'], answer: 2,
    why: '違和感の段階で中止し、やさしい版に切り替えるのが安全です。痛みが続くときは医療機関に相談しましょう。' },
  { id: 'recovery', q: '同じ部位を強く鍛えたあと、次はどうするのがよい？', choices: ['翌日も同じ部位を限界まで', '1〜2日あけて回復させる', '1週間はあける'], answer: 1,
    why: '同じ部位の強い筋トレは、1〜2日あけて回復させるのが一般的な目安です。このアプリは日ごとに部位を変えています。' },
  { id: 'water', q: '運動中の水分補給は？', choices: ['のどが渇く前に、こまめに', '終わってから一気に', '汗が出ないので不要'], answer: 0,
    why: '室内でも汗はかきます。のどが渇く前に少しずつ飲むのがおすすめです。' },
  { id: 'sitting', q: '長く座り続けたあと、健康のためにおすすめなのは？', choices: ['そのまま休み続ける', '立ち上がって軽く体を動かす', '何も飲まない'], answer: 1,
    why: 'WHOは座りっぱなしの時間を減らすことも勧めています。仕事の合間のスクワットも立派な1回です。' },
  { id: 'bone', q: '骨の健康に役立つのは？', choices: ['体重をかける運動や筋トレ', '安静にし続けること', '運動を減らすこと'], answer: 0,
    why: 'スクワットなど体重をかける運動や筋トレは、骨や筋肉への刺激になります。' },
  { id: 'mood', q: '定期的な運動で期待できることは？', choices: ['気分の改善やストレス軽減', '睡眠が必ず悪くなる', '集中力が必ず下がる'], answer: 0,
    why: '運動は気分の改善にも役立つとされています。体力チェックと同じく、少しずつ続けるのがコツです。' },
  { id: 'check-balance', q: '体力チェックの「片足立ち」は主に何を見る？', choices: ['バランス能力', '握力', '肺活量'], answer: 0,
    why: 'バランス能力の目安です。バランスは転倒予防にもつながります。' },
  { id: 'check-chair', q: '「30秒椅子立ち上がり」は主に何を見る？', choices: ['腕の筋力', '脚の筋力', '柔軟性'], answer: 1,
    why: '椅子からの立ち座りは脚の筋力の目安として使われます。スクワットとも関係の深い動きです。' },
  { id: 'plank-hips', q: 'プランクで腰が落ちてきたら？', choices: ['そのまま我慢する', '休んで姿勢を直してから続ける', '腰を高く上げる'], answer: 1,
    why: '腰が落ちると腰への負担が増えます。頭からかかとまで一直線の姿勢を保てる時間でやめるのが安全です。' },
  { id: 'floor', q: '床で運動するときのコツは？', choices: ['滑りにくい床やマットの上で、周りに物がない場所', '靴下で滑りやすい床', '家具のすぐ横'], answer: 0,
    why: '滑りにくく、周りに物がない場所で行うとケガを防げます。お子さんが近くにいるときも要注意です。' },
];

export const emptyQuizStats = (): QuizStats => ({ answered: 0, correct: 0, seen: {} });

/** Least-shown question first; ties broken by `seed` so the same break shows the same question. */
export function pickQuiz(seen: Record<string, number>, seed: number): Quiz {
  const min = Math.min(...QUIZZES.map((q) => seen[q.id] ?? 0));
  const pool = QUIZZES.filter((q) => (seen[q.id] ?? 0) === min);
  return pool[Math.abs(seed) % pool.length];
}

export function recordQuiz(state: State, id: string, correct: boolean): State {
  const q = state.quiz ?? emptyQuizStats();
  return {
    ...state,
    quiz: {
      answered: q.answered + 1,
      correct: q.correct + (correct ? 1 : 0),
      seen: { ...q.seen, [id]: (q.seen[id] ?? 0) + 1 },
    },
  };
}
