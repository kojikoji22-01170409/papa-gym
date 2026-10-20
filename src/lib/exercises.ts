export type Category = 'lower' | 'upper' | 'core' | 'stretch' | 'family';
export type Unit = 'reps' | 'sec';

export interface Exercise {
  id: string;
  name: string;
  category: Category;
  unit: Unit;
  amount: number; // default reps or seconds
  sets: number;
  perSide?: boolean;
  muscles: string; // where it works / what it stretches, in plain words
  steps: string[]; // how to do it, in order
  benefit: string; // why it is worth doing (shown as motivation)
  easy?: string; // gentler variant, shown when the knees/back ask for it
  hard?: string; // tougher variant, shown at the top stage
  target?: 'lower' | 'upper' | 'core'; // stretches: which strength day they pair with
  warmup?: boolean; // used as the daily warm-up, never as one of the three stretches
}

export const CATEGORY_LABEL: Record<Category, string> = {
  lower: '下半身',
  upper: '上半身',
  core: '体幹',
  stretch: 'ストレッチ',
  family: '子どもと一緒に',
};

export const EXERCISES: Exercise[] = [
  { id: 'squat', name: 'スクワット', category: 'lower', unit: 'reps', amount: 10, sets: 2,
    muscles: '太もも・お尻',
    steps: ['足を肩幅に開いて立ち、つま先は少し外に向ける。', '息を吸いながら、椅子に座るつもりでお尻を後ろに引いて沈む。', '太ももが床と平行になるあたりまで下げ、膝がつま先より前に出すぎないようにする。', '息を吐きながら、足の裏全体で床を押して立ち上がる。'],
    benefit: '体の中で一番大きい筋肉（太もも・お尻）を使うので、効率よく体力を保てます。階段や立ち上がりが楽になり、転びにくい脚づくりにも役立ちます。',
    easy: '椅子に軽く座って立つ動きにする。', hard: '下ろすのに3秒かけるゆっくりスクワットにする。' },
  { id: 'back-lunge', name: 'バックランジ', category: 'lower', unit: 'reps', amount: 8, sets: 1, perSide: true,
    muscles: '太もも・お尻・バランス',
    steps: ['まっすぐ立ち、片足を大きく一歩うしろへ引く。', '上体を起こしたまま、前の膝が90度になるくらいまで腰を落とす。', '前の足で床を押して、元の位置に戻る。', '8回やったら足を替える。'],
    benefit: '片脚ずつ鍛えるので、左右の差が整い、バランス力が上がります。歩く・走る動きに近く、ふだんの動作が安定します。',
    easy: '壁に手をつき、浅めに行う。', hard: '戻るときに1秒止まり、ゆっくり行う。' },
  { id: 'hip-lift', name: 'ヒップリフト', category: 'lower', unit: 'reps', amount: 12, sets: 2,
    muscles: 'お尻・太もも裏・腰まわり',
    steps: ['仰向けに寝て、膝を立てる（足は肩幅、かかとはお尻に近め）。', '息を吐きながら、お尻を持ち上げる。', '肩から膝までが一直線になったところで1秒止める。', '息を吸いながら、ゆっくり下ろす。'],
    benefit: '座りっぱなしで弱りやすいお尻と太もも裏を目覚めさせます。姿勢が整い、腰への負担を減らすことが期待できます。',
    easy: '回数を半分にする。', hard: '最後の1回は10秒キープする。' },
  { id: 'calf-raise', name: 'かかと上げ', category: 'lower', unit: 'reps', amount: 20, sets: 1,
    muscles: 'ふくらはぎ・足首',
    steps: ['足を腰幅に開いてまっすぐ立つ。', 'ゆっくり2秒かけて、かかとを高く上げる。', 'てっぺんで1秒止める。', 'ゆっくり2秒かけて、かかとを下ろす。'],
    benefit: 'ふくらはぎは「第2の心臓」と呼ばれ、血のめぐりを助けます。足首が強くなり、つまずきにくくなります。',
    easy: '壁に手をつく。', hard: '片足ずつ行う。' },
  { id: 'pushup', name: '腕立て伏せ', category: 'upper', unit: 'reps', amount: 8, sets: 2,
    muscles: '胸・腕の裏・肩',
    steps: ['手を肩幅より少し広めに床につき、頭からかかとまで一直線にする。', '息を吸いながら、ひじを斜め後ろに曲げて胸を床に近づける。', '胸が床の少し手前まで下がったら、息を吐きながら押し戻す。', '腰が反ったり落ちたりしないよう、おなかに力を入れ続ける。'],
    benefit: '胸・肩・腕をまとめて鍛える、上半身の基本の種目です。物を持ち上げる・押す動作が楽になり、猫背の予防にも役立ちます。',
    easy: '膝をついて行う。', hard: '3秒かけて下ろすゆっくり腕立てにする。' },
  { id: 'wall-pushup', name: '壁腕立て', category: 'upper', unit: 'reps', amount: 15, sets: 1,
    muscles: '胸・肩・腕',
    steps: ['壁から腕1本ぶん離れて立ち、肩の高さで壁に手をつく。', '体を一直線にしたまま、ひじを曲げて胸を壁に近づける。', '壁を押して、元の位置に戻る。'],
    benefit: '床に手をつかないので、手首や肩に優しい腕立て伏せです。フォームの練習にもなり、毎日続けやすい種目です。',
    hard: '足を壁から遠くに離して負荷を上げる。' },
  { id: 'chair-dip', name: 'リバースプッシュアップ（椅子）', category: 'upper', unit: 'reps', amount: 8, sets: 1,
    muscles: '腕の裏（二の腕）・肩',
    steps: ['動かない椅子のふちに、指を前に向けて両手をつく。', '足を前に出し、お尻を椅子から浮かせる。', 'ひじを後ろに曲げて、お尻を真下に落とす（肩をすくめない）。', '腕で押して、元の高さに戻る。'],
    benefit: '腕の裏側（二の腕）を鍛えます。押す力や支える力がつき、子どもを抱き上げるときの安定感につながります。',
    easy: '膝を曲げて足を手前に置く。', hard: '片足を床から浮かせる。' },
  { id: 'superman', name: 'スーパーマン', category: 'upper', unit: 'reps', amount: 10, sets: 1,
    muscles: '背中・お尻・腰',
    steps: ['うつ伏せになり、両腕を前に伸ばす。', '息を吐きながら、腕と脚を同時に少しだけ持ち上げる。', '1秒止めてから、ゆっくり下ろす。', '首は反らさず、目線は床に向ける。'],
    benefit: '背中側の筋肉は、姿勢を支える大事な部分です。猫背や丸まりを防ぎ、座り姿勢の疲れにくさにつながります。',
    easy: '片手片足ずつ行う。', hard: '持ち上げたまま3秒キープする。' },
  { id: 'plank', name: 'プランク', category: 'core', unit: 'sec', amount: 30, sets: 1,
    muscles: 'おなか全体・背中・肩',
    steps: ['うつ伏せから、ひじを肩の真下について体を持ち上げる。', 'つま先で支え、頭からかかとまで一直線にする。', 'おなかに軽く力を入れ、腰を反らさない・落とさない。', '呼吸を止めずに、決めた秒数キープする。'],
    benefit: '体の中心（体幹）を鍛えます。腰を守り、姿勢を保つ力がつくので、立ち仕事や座り仕事の疲れにくさにつながります。',
    easy: '膝をついて行う。', hard: '片足を交互に床から少し浮かせる。' },
  { id: 'side-plank', name: 'サイドプランク', category: 'core', unit: 'sec', amount: 20, sets: 1, perSide: true,
    muscles: 'わき腹・腰まわり',
    steps: ['横向きに寝て、ひじを肩の真下につく。', '足は重ねるか、前後にずらして置く。', '腰を持ち上げ、頭から足まで一直線にしてキープする。', '終わったら向きを替える。'],
    benefit: 'わき腹と腰まわりを鍛え、背骨を横から支えます。腰を安定させ、ぎっくり腰の予防に役立つとされています。',
    easy: '膝をついて行う。', hard: '上の足を少し持ち上げる。' },
  { id: 'dead-bug', name: 'デッドバグ', category: 'core', unit: 'reps', amount: 10, sets: 1,
    muscles: 'おなかの深い部分・股関節',
    steps: ['仰向けに寝て、両腕を天井に伸ばし、膝を90度に曲げて脚を上げる。', '腰が床から浮かないように、おなかを軽く引き締める。', '息を吐きながら、右腕と左脚をゆっくり床に近づけて伸ばす。', '息を吸って戻り、反対側も行う（左右で1回）。'],
    benefit: '腰を反らさずに手足を動かす練習で、おなかの奥の筋肉に効きます。腰への負担が少なく、体幹の安定性が上がります。',
    easy: '脚だけ動かす。', hard: '動きを4秒かけてゆっくり行う。' },
  { id: 'bird-dog', name: 'バードドッグ', category: 'core', unit: 'reps', amount: 8, sets: 1, perSide: true,
    muscles: '背中・お尻・おなか',
    steps: ['四つ這いになり、手は肩の下、膝は股関節の下に置く。', '背中をまっすぐにしたまま、右手と左脚をゆっくり伸ばす。', '床と平行になったところで1秒止める。', 'ゆっくり戻り、反対側も行う。'],
    benefit: '背中・お尻・おなかをバランスよく使い、体のぐらつきを抑える力がつきます。腰の安定とバランス感覚の向上に役立ちます。',
    easy: '手だけ伸ばす。', hard: '伸ばした状態で3秒止める。' },
  { id: 'cat-cow', name: '背中・腰のストレッチ（キャット＆カウ）', category: 'stretch', unit: 'reps', amount: 10, sets: 1, warmup: true,
    muscles: '背骨まわり・肩甲骨',
    steps: ['四つ這いになり、手は肩の下、膝は股関節の下に置く。', '息を吐きながら、おへそをのぞき込むように背中を丸める。', '息を吸いながら、胸を前に開いて背中を軽く反らす。', 'ゆっくり、呼吸に合わせて繰り返す。'],
    benefit: '寝起きや座り姿勢で固まった背骨をほぐし、体を温めます。トレーニング前の準備運動として、ケガの予防にも役立ちます。' },
  { id: 'hamstring', name: '太もも裏のストレッチ', category: 'stretch', unit: 'sec', amount: 30, sets: 1, perSide: true, target: 'lower',
    muscles: '太もも裏',
    steps: ['床に座り、片脚を前に伸ばす。もう一方の足は、伸ばした脚の内側につける。', '背すじを伸ばしたまま、おへそから前に倒れる（背中は丸めない）。', '太もも裏が気持ちよく伸びるところで止めて、キープする。', '呼吸は止めず、ゆっくり吐く。終わったら脚を替える。'],
    benefit: '太もも裏が硬いと、腰が丸まり腰痛の一因になります。ここをほぐすと前かがみや歩幅が楽になり、腰の負担を減らすことが期待できます。' },
  { id: 'hip-flexor', name: '股関節のストレッチ', category: 'stretch', unit: 'sec', amount: 30, sets: 1, perSide: true, target: 'lower',
    muscles: '脚のつけ根（股関節の前）',
    steps: ['片膝を床につき、反対の足を前に踏み出す（タオルを膝の下に敷くと楽）。', '背すじを伸ばし、おなかを引き締める。', '骨盤をゆっくり前に押し出し、後ろ脚のつけ根を伸ばす。', '30秒キープして、脚を替える。'],
    benefit: '座りっぱなしで縮みやすい、脚のつけ根をほぐします。歩幅が広がり、姿勢が整い、腰の反りすぎの予防にも役立ちます。' },
  { id: 'chest-shoulder', name: '胸と肩のストレッチ', category: 'stretch', unit: 'sec', amount: 30, sets: 1, target: 'upper',
    muscles: '胸・肩の前',
    steps: ['ドア枠や壁の横に立ち、ひじを90度に曲げて、肩の高さで前腕を当てる。', '足を半歩前に出し、体をゆっくり前に出す。', '胸の前が伸びるところで止めて、キープする。', '息を止めずに、反対側も行う。'],
    benefit: 'スマホやデスクワークで縮んだ胸と肩の前側を開き、猫背や巻き肩を和らげます。呼吸もしやすくなります。' },
  { id: 'calf-stretch', name: 'ふくらはぎのストレッチ', category: 'stretch', unit: 'sec', amount: 30, sets: 1, perSide: true, target: 'lower',
    muscles: 'ふくらはぎ・アキレス腱',
    steps: ['壁に両手をつき、片脚を後ろに大きく引く。', '後ろ脚のひざを伸ばし、かかとを床につけたまま、前の膝を曲げる。', 'ふくらはぎが伸びるところで、体を壁に近づける。', '30秒キープして、脚を替える。'],
    benefit: 'ふくらはぎやアキレス腱をほぐし、足のむくみやだるさの軽減が期待できます。ランニングや階段のあとにもおすすめです。' },
  { id: 'glute-hug', name: 'お尻・腰のストレッチ（片ひざ抱え）', category: 'stretch', unit: 'sec', amount: 30, sets: 1, perSide: true, target: 'lower',
    muscles: 'お尻・腰',
    steps: ['仰向けに寝て、両脚を伸ばす。', '片方の膝を曲げて、両手で抱える。', '息を吐きながら、膝をゆっくり胸に引き寄せる。', '頭と肩は床につけたまま30秒キープして、脚を替える。'],
    benefit: 'お尻と腰まわりの筋肉をゆるめ、腰の張りを和らげます。寝る前にやると、体がほぐれて眠りにつきやすくなります。' },
  { id: 'childs-pose', name: '背中と腰のストレッチ（子どものポーズ）', category: 'stretch', unit: 'sec', amount: 30, sets: 1, target: 'core',
    muscles: '背中・腰・肩',
    steps: ['四つ這いから、お尻をかかとに近づけて座る。', '両腕を前に伸ばし、おでこを床（またはクッション）に近づける。', '背中と脇腹が広がるのを感じながら、ゆっくり深呼吸する。', '30秒キープして、ゆっくり起き上がる。'],
    benefit: '背中・腰・肩をまとめてゆるめます。深い呼吸がしやすくなり、疲れた体と気持ちを落ち着かせる効果が期待できます。' },
  { id: 'scapula-stretch', name: '肩甲骨のストレッチ', category: 'stretch', unit: 'sec', amount: 30, sets: 1, target: 'upper',
    muscles: '肩甲骨まわり・背中の上部',
    steps: ['足を肩幅に開いて立ち、両手を前で組む。', '手を前に伸ばしながら、背中を丸めておへそをのぞき込む。', '肩甲骨の間が広がるのを感じる。', '呼吸を続けながら30秒キープする。'],
    benefit: 'デスクワークで固まりやすい、肩甲骨まわりをほぐします。肩こりの軽減や、腕や肩の動きの滑らかさが期待できます。' },
  { id: 'forward-fold', name: '立って前屈（体の裏側全体）', category: 'stretch', unit: 'sec', amount: 30, sets: 1, target: 'core',
    muscles: '背中・太もも裏・ふくらはぎ',
    steps: ['足を腰幅に開いて立ち、膝は軽くゆるめる。', '息を吐きながら、股関節から折れるように上体を前に倒す。', '手は床や、すねや、ももに置く（無理に床につけなくてよい）。', '頭と腕の力を抜いて、30秒ゆっくり呼吸する。立つときはゆっくり。'],
    benefit: '体の裏側全体（背中・太もも裏・ふくらはぎ）をまとめて伸ばします。血のめぐりが上がり、頭がすっきりする感覚が得られます。' },
  { id: 'thoracic-reach', name: '背中のひねり（四つ這い・片腕を天井へ）', category: 'stretch', unit: 'sec', amount: 30, sets: 1, perSide: true, target: 'core',
    muscles: '背中の上部（胸椎）・胸',
    steps: ['四つ這いになり、片手を頭の後ろに置く。', '息を吐きながら、そのひじを天井に向けて胸を開く。', '目線もひじに合わせ、背中の上のほうがひねられるのを感じる。', '30秒キープ（ゆっくり呼吸）して、反対側も行う。'],
    benefit: '背中の上部（胸椎）のひねりやすさが戻ります。肩や首の負担が減り、デスクワークで固まった上半身がほぐれます。' },
  // 子どもと一緒に（任意。参加は子どもの気分次第で、記録は本人のみ）
  { id: 'carry-squat', name: '抱っこスクワット', category: 'family', unit: 'reps', amount: 8, sets: 1,
    muscles: '太もも・お尻・体幹',
    steps: ['2歳のお子さんをしっかり抱き、足を肩幅に開いて立つ。', '背すじを伸ばしたまま、お尻を後ろに引いて、ゆっくり沈む。', '足の裏で床を押して、立ち上がる。', 'ぐらつくときや、お子さんが嫌がるときは中止する。'],
    benefit: '2歳のお子さんの体重が自然な負荷になり、遊びながら脚を鍛えられます。親子の触れ合いの時間にもなります。',
    easy: '抱っこせず通常のスクワットにする。' },
  { id: 'kid-plank', name: '子どもを背中に乗せてプランク', category: 'family', unit: 'sec', amount: 15, sets: 1,
    muscles: 'おなか・背中・肩',
    steps: ['プランクの姿勢になる。', '10歳のお子さんに、背中へ軽く手を置いてもらう（体重はかけない）。', '腰を落とさず、まっすぐキープする。', '腰が落ちたり痛みを感じたら、すぐに中止する。'],
    benefit: 'お子さんと一緒に取り組むことで、トレーニングが楽しい時間になります。体幹を意識しやすくなる効果もあります。',
    easy: '子どもなしで膝つきプランクにする。' },
];

export const byId = (id: string): Exercise | undefined => EXERCISES.find((e) => e.id === id);

const MAIN_CATS: Category[] = ['lower', 'upper', 'core'];

function ofCat(c: Category): Exercise[] {
  return EXERCISES.filter((e) => e.category === c);
}

/** Stretches that pair with a strength day (the warm-up cat-cow is not part of any pool). */
const stretchPool = (c: Category): Exercise[] => EXERCISES.filter((e) => e.category === 'stretch' && !e.warmup && e.target === c);

const pick = <T,>(list: T[], i: number): T => list[((i % list.length) + list.length) % list.length];

export const warmupExercise = (): Exercise => EXERCISES.find((e) => e.warmup)!;

/**
 * Goal menu for a given "rotation number" (days since start): warm-up, then 2 from the day's focus
 * category and 1 from the next, then 3 stretches matched to what was just worked. Deterministic so
 * the menu is stable within a day. A stretch day (recovery weeks) is warm-up, 1 light strength, 5 stretches.
 */
export function goalMenu(rotation: number, stretchDay = false): Exercise[] {
  const n = Math.abs(rotation);
  const cat = MAIN_CATS[n % 3];
  const otherCat = MAIN_CATS[(n + 1) % 3];
  const focus = ofCat(cat);
  const round = Math.floor(n / 3);
  if (stretchDay) {
    const all = EXERCISES.filter((e) => e.category === 'stretch' && !e.warmup);
    return [warmupExercise(), pick(focus, round * 2), ...[0, 1, 2, 3, 4].map((i) => pick(all, n * 5 + i))];
  }
  const other = ofCat(otherCat);
  return [
    warmupExercise(),
    pick(focus, round * 2),
    pick(focus, round * 2 + 1),
    pick(other, round),
    pick(stretchPool(cat), round * 2),
    pick(stretchPool(cat), round * 2 + 1),
    pick(stretchPool(otherCat), round),
  ];
}

/** The strength exercise suggested for the 1-exercise minimum line. */
export function minimumPick(rotation: number): Exercise {
  return goalMenu(rotation).find((e) => e.category !== 'stretch')!;
}

export function setLabel(e: Exercise, amount: number): string {
  const per = e.unit === 'reps' ? `${amount}回` : `${amount}秒`;
  const side = e.perSide ? '（左右それぞれ）' : '';
  const sets = e.sets > 1 ? ` × ${e.sets}セット` : '';
  return `${per}${side}${sets}`;
}

/** Animated demo (side-view stick figure) generated by scripts/gen-gifs.py. */
export const gifUrl = (id: string): string => `${import.meta.env.BASE_URL}gifs/${id}.gif`;

/** Reps for rep-based exercises (per-side exercises count both sides), 0 for timed ones. */
export function repsOf(e: Exercise, amount: number): number {
  return e.unit === 'reps' ? amount * e.sets * (e.perSide ? 2 : 1) : 0;
}

/** Seconds held for timed exercises, 0 for rep-based ones. */
export function holdSecOf(e: Exercise, amount: number): number {
  return e.unit === 'sec' ? amount * e.sets * (e.perSide ? 2 : 1) : 0;
}
