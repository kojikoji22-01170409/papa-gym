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
  // ---- 曜日メニュー用の追加種目（下半身）
  { id: 'wide-squat', name: 'ワイドスクワット', category: 'lower', unit: 'reps', amount: 10, sets: 2,
    muscles: '内もも・お尻・太もも',
    steps: ['足を肩幅の1.5倍くらいに開き、つま先を45度ほど外に向ける。', '背すじを伸ばしたまま、膝をつま先と同じ向きに開きながら真下に沈む。', '太ももが床と平行になるあたりまで下げる。', '足の裏で床を押して、ゆっくり立ち上がる。'],
    benefit: '通常のスクワットより内ももとお尻に効きます。足を開く筋肉が働くので、体の横ぶれを抑え、つまずきにくい歩き方につながります。',
    easy: '浅めに沈む。', hard: '沈んだところで2秒止まる。' },
  { id: 'wall-sit', name: '空気いす', category: 'lower', unit: 'sec', amount: 30, sets: 1,
    muscles: '太もも・お尻',
    steps: ['壁に背中をつけて立ち、足を少し前に出す。', '壁に背中をつけたまま、膝が90度になるまで腰を落とす。', '膝がつま先より前に出ないよう、足の位置を調整する。', '呼吸を止めずに、決めた秒数キープする。きつければ少し腰を上げる。'],
    benefit: '動かずに太ももを使い続けるので、脚の粘り強さ（筋持久力）がつきます。膝を大きく動かさないため、関節への衝撃が少ないのも利点です。',
    easy: '膝を120度くらいの浅さでキープする。', hard: '片足を少し浮かせる。' },
  { id: 'side-lunge', name: 'サイドランジ', category: 'lower', unit: 'reps', amount: 8, sets: 1, perSide: true,
    muscles: '内もも・お尻・太もも',
    steps: ['足を腰幅で立ち、片足を真横に大きく一歩出す。', '出した足の側にお尻を引きながら、膝を曲げて腰を落とす。反対の脚はまっすぐ伸ばす。', '胸を張り、つま先と膝は同じ向きにする。', '出した足で床を押して、元の位置に戻る。反対側も同じ回数行う。'],
    benefit: '前後の動きが中心の日常では使いにくい、横方向の動きを鍛えます。内ももとお尻が働き、とっさに横へ踏ん張る力や、転びにくさにつながります。',
    easy: '浅めに行う。', hard: '戻るときに片足を床から浮かせる。' },
  { id: 'split-squat', name: 'スプリットスクワット', category: 'lower', unit: 'reps', amount: 8, sets: 1, perSide: true,
    muscles: '太もも・お尻・バランス',
    steps: ['足を前後に大きく開いて立つ。後ろ足はかかとを上げる。', '上体を起こしたまま、真下に腰を落とす（前の膝が90度くらい）。', '前の足の裏全体で床を押して、立ち上がる。足の位置は動かさない。', '決めた回数が終わったら、足を入れ替える。'],
    benefit: '足の位置を固定したまま片脚ずつ鍛えるので、バックランジより安定して行えます。左右差を整え、歩く・階段を上る動作が楽になります。',
    easy: '壁や椅子に手を添える。', hard: '下ろすのに3秒かける。' },
  { id: 'single-hip-lift', name: '片脚ヒップリフト', category: 'lower', unit: 'reps', amount: 8, sets: 1, perSide: true,
    muscles: 'お尻・太もも裏・腰まわり',
    steps: ['仰向けに寝て、膝を立てる。片脚を持ち上げて、膝を伸ばす。', '床に残した足のかかとで押して、お尻を持ち上げる。', '肩から膝までが一直線になるところで1秒止める。', 'ゆっくり下ろす。回数が終わったら脚を替える。'],
    benefit: 'ヒップリフトの片脚版です。お尻と太もも裏を左右別々に鍛え、骨盤の安定性が上がります。腰への負担を減らす土台づくりに役立ちます。',
    easy: '通常のヒップリフトにする。', hard: '上げたところで3秒止める。' },
  { id: 'good-morning', name: 'グッドモーニング', category: 'lower', unit: 'reps', amount: 10, sets: 1,
    muscles: '太もも裏・お尻・背中',
    steps: ['足を腰幅に開いて立ち、両手を頭の後ろに軽く添える。膝は軽くゆるめる。', '背中をまっすぐにしたまま、お尻を後ろに引きながら上体を前に倒す。', '太もも裏が伸びるのを感じるところ（背中が丸まる手前）で止める。', 'お尻を前に押し出すようにして、上体を起こす。'],
    benefit: '「股関節から曲げる」動き（ヒンジ）の練習です。物を持ち上げるときに腰ではなく脚とお尻を使えるようになり、腰を守ることにつながります。',
    easy: '手を胸の前で組み、浅めに倒す。', hard: '倒したところで2秒止める。' },
  { id: 'single-calf-raise', name: '片脚かかと上げ', category: 'lower', unit: 'reps', amount: 10, sets: 1, perSide: true,
    muscles: 'ふくらはぎ・足首',
    steps: ['壁や椅子に軽く手を添えて立ち、片足を床から少し浮かせる。', 'ゆっくり2秒かけて、かかとを高く上げる。', 'てっぺんで1秒止める。', 'ゆっくり2秒かけて下ろす。回数が終わったら足を替える。'],
    benefit: 'かかと上げの片脚版で、左右のふくらはぎと足首の差を整えます。歩くときに地面を蹴る力がつき、つまずきにくさにもつながります。',
    easy: '両脚のかかと上げにする。', hard: '壁から手を離して行う。' },
  // ---- 上半身（押す）
  { id: 'incline-pushup', name: '斜め腕立て伏せ（椅子）', category: 'upper', unit: 'reps', amount: 10, sets: 2,
    muscles: '胸・肩・腕の裏',
    steps: ['動かない椅子やソファのふちに、肩幅より少し広めに手をつく。', '足を後ろに引き、頭からかかとまで一直線にする。', 'ひじを斜め後ろに曲げて、胸を椅子に近づける。', '胸を押し上げて元に戻る。腰が落ちないようにおなかに力を入れる。'],
    benefit: '床からの腕立て伏せより負荷が軽く、正しいフォームで回数を稼げます。胸と肩をしっかり使い、押す力を安全に伸ばせます。',
    easy: '壁腕立てにする。', hard: '足の位置を椅子に近づけて角度を下げる。' },
  { id: 'wide-pushup', name: 'ワイド腕立て伏せ', category: 'upper', unit: 'reps', amount: 8, sets: 2,
    muscles: '胸・肩の前',
    steps: ['手を肩幅の1.5倍くらいに広げて床につき、頭からかかとまで一直線にする。', 'ひじを外に開きすぎず、斜め後ろに曲げて胸を下ろす。', '胸が床の少し手前まで下がったら、押し戻す。', '腰が反らないようにおなかに力を入れ続ける。'],
    benefit: '手幅を広げることで、胸の筋肉により強く効きます。普通の腕立て伏せと組み合わせると、胸まわりをまんべんなく鍛えられます。',
    easy: '膝をついて行う。', hard: '下ろすのに3秒かける。' },
  { id: 'pike-pushup', name: 'パイクプッシュアップ', category: 'upper', unit: 'reps', amount: 6, sets: 2,
    muscles: '肩・腕の裏・胸の上部',
    steps: ['四つ這いから膝を伸ばし、お尻を高く上げて「への字」の形になる。', '手は肩幅、足は腰幅より少し広めにする。', 'ひじを曲げて、頭を両手の間に向けて下ろす。', '手で床を押して、元の「への字」に戻る。'],
    benefit: '頭の上へ押し上げる動き（肩の押す力）を、器具なしで鍛えます。物を棚に上げるなど、腕を上に伸ばす動作が楽になります。',
    easy: '腰を高く保ち、浅く曲げる。', hard: '片足を床から少し浮かせる。' },
  { id: 'shoulder-tap', name: 'プランク・ショルダータップ', category: 'core', unit: 'reps', amount: 10, sets: 1,
    muscles: 'おなか・肩・背中',
    steps: ['腕立て伏せの姿勢（手は肩の下）になり、足は肩幅くらいに開く。', '腰を動かさないよう、おなかに力を入れる。', '片手を床から離して、反対の肩に軽くタッチする。', '手を戻し、反対側も行う（左右で1回）。'],
    benefit: '片手を上げても体がぶれないように支える練習で、肩と体幹が同時に鍛えられます。体のねじれに強くなります。',
    easy: '膝をついて行う。', hard: '足を閉じて、さらにゆっくり行う。' },
  // ---- 背中・肩甲骨（引く）
  { id: 'towel-pulldown', name: 'うつ伏せタオルプルダウン', category: 'upper', unit: 'reps', amount: 10, sets: 1,
    muscles: '背中・肩甲骨まわり',
    steps: ['うつ伏せになり、タオルを肩幅より広めに持って、両腕を頭の前に伸ばす。', '頭と胸を少しだけ床から浮かせる。', 'タオルを左右に引っぱりながら、ひじを曲げて胸の横に引き寄せる。', 'ゆっくり腕を前に戻す。首は反らさず、目線は床に向ける。'],
    benefit: '器具なしで「引く」動き（背中の筋肉）を鍛えます。押す運動が多いと前に丸まりやすいので、引く運動で猫背と巻き肩を防ぎます。',
    easy: '胸を床につけたまま、腕だけ動かす。', hard: '引いたところで3秒止める。' },
  { id: 'snow-angel', name: 'リバーススノーエンジェル', category: 'upper', unit: 'reps', amount: 8, sets: 1,
    muscles: '背中・肩の後ろ・肩甲骨',
    steps: ['うつ伏せになり、両腕を体の横に置いて、手のひらを床に向ける。', '腕を床から少し浮かせたまま、弧を描くように頭の上まで動かす。', '同じ軌道で、体の横まで戻す。', '首は反らさず、おなかに軽く力を入れる。'],
    benefit: '肩甲骨を動かしながら背中と肩の後ろを鍛えます。デスクワークで固まりやすい肩まわりが動きやすくなり、姿勢が整います。',
    easy: '腕を床に近づけたまま動かす。', hard: '胸も床から浮かせる。' },
  { id: 'prone-y', name: 'うつ伏せY字上げ', category: 'upper', unit: 'reps', amount: 10, sets: 1,
    muscles: '肩甲骨まわり・背中の上部',
    steps: ['うつ伏せになり、両腕を頭の斜め前に伸ばして「Y」の形にする。', '親指を天井に向ける。', '息を吐きながら、両腕を耳の横あたりまで持ち上げる。', '1秒止めて、ゆっくり下ろす。首は反らさない。'],
    benefit: '背中の上部と肩甲骨を支える筋肉を鍛えます。肩が前に出る姿勢を直し、腕を上に上げる動作が軽くなります。',
    easy: '腕の上げる高さを小さくする。', hard: '上げたまま3秒止める。' },
  // ---- 体幹・バランス
  { id: 'curl-up', name: 'カールアップ', category: 'core', unit: 'reps', amount: 6, sets: 1,
    muscles: 'おなか（腹筋）',
    steps: ['仰向けに寝て、片膝を立て、もう片方の脚は伸ばす。両手を腰の下に入れる。', '腰の反りを保ったまま、頭と肩だけを軽く浮かせる（起き上がらない）。', 'その姿勢で3〜5秒キープする。', 'ゆっくり戻る。半分終えたら、立てる脚を替える。'],
    benefit: '腰に負担をかけず、おなかの筋肉を鍛えられる方法として知られています（McGillのビッグ3の一つ）。背骨を支える力がつき、腰を守ることにつながります。',
    easy: '頭だけを少し浮かせる。', hard: 'キープを8〜10秒にする。' },
  { id: 'mountain-climber', name: 'ゆっくりマウンテンクライマー', category: 'core', unit: 'reps', amount: 10, sets: 1,
    muscles: 'おなか・肩・太もも',
    steps: ['腕立て伏せの姿勢（手は肩の下）になる。', 'おなかに力を入れ、腰を反らさない。', '片膝をゆっくり胸の方へ引き寄せ、床の近くに戻す。', '反対側も行う（左右で1回）。速くせず、ゆっくり行う。'],
    benefit: '体幹と肩で上半身を支えながら、脚を動かします。おなかの深い部分に効き、全身の連動した動きが身につきます。',
    easy: '手を椅子に置いて行う。', hard: '膝を引いたところで1秒止める。' },
  { id: 'hollow-hold', name: 'ホロウホールド', category: 'core', unit: 'sec', amount: 15, sets: 1,
    muscles: 'おなか全体',
    steps: ['仰向けに寝て、腕を頭の上に伸ばす。', '腰を床に押しつけたまま、肩と脚を少し浮かせる。', '体がバナナのような形になるイメージで、おなかに力を入れる。', '呼吸を止めずに、決めた秒数キープする。腰が反ったら、膝を曲げる。'],
    benefit: '腰を反らさずにおなかで体を支える力をつけます。体幹の安定性が上がり、立つ・歩く・物を持つ動作がぶれにくくなります。',
    easy: '膝を曲げ、手を体の横に置く。', hard: '脚と腕をさらに低く伸ばす。' },
  { id: 'reverse-crunch', name: 'リバースクランチ', category: 'core', unit: 'reps', amount: 10, sets: 1,
    muscles: 'おなかの下の方',
    steps: ['仰向けに寝て、膝を90度に曲げて脚を持ち上げる。両手は体の横に置く。', '息を吐きながら、膝を胸に近づけて、お尻を少しだけ床から浮かせる。', '反動を使わず、ゆっくり行う。', 'ゆっくり元に戻す。'],
    benefit: 'おなかの下の方を鍛えます。腰に体重をかけずに行えるので、腰が気になる人でも取り組みやすい腹筋です。',
    easy: 'お尻を浮かせず、膝だけ動かす。', hard: '戻すのに3秒かける。' },
  { id: 'single-leg-stand', name: '片脚立ち', category: 'lower', unit: 'sec', amount: 30, sets: 1, perSide: true,
    muscles: 'お尻・太もも・体幹・足首',
    steps: ['壁や椅子のそばに立つ（すぐ手が届くように）。', '片足を床から少し浮かせ、背すじを伸ばす。', '目線は前の一点に向けて、ぐらつかないようにキープする。', '決めた秒数が終わったら、足を替える。不安なら壁に指を添える。'],
    benefit: '日本整形外科学会の「ロコトレ」で勧められている運動です。バランス力が上がり、つまずいたときに踏みとどまる力につながります。',
    easy: '壁に指を添えて行う。', hard: '目を閉じる、または床を柔らかいクッションにする（壁のそばで）。' },
  { id: 'single-leg-reach', name: '片脚デッドリフト（タッチ）', category: 'lower', unit: 'reps', amount: 8, sets: 1, perSide: true,
    muscles: 'お尻・太もも裏・バランス',
    steps: ['片足で立ち、反対の膝は軽くゆるめる。', '背中をまっすぐにしたまま、上げた脚を後ろに伸ばしながら上体を前に倒す。', '両手を床の方へ伸ばす（床につかなくてよい）。', 'お尻に力を入れて、ゆっくり元に戻る。回数が終わったら足を替える。'],
    benefit: '片脚でバランスをとりながらお尻と太もも裏を鍛えます。「股関節から曲げる」動きとバランスを一緒に練習でき、転びにくい体につながります。',
    easy: '壁に片手を添える。', hard: '倒したところで2秒止める。' },
  { id: 'clamshell', name: 'クラムシェル', category: 'lower', unit: 'reps', amount: 12, sets: 1, perSide: true,
    muscles: 'お尻の横・股関節まわり',
    steps: ['横向きに寝て、膝を90度くらいに曲げ、足をそろえる。', '頭は腕か枕にのせ、おなかに軽く力を入れる。', '足をつけたまま、上の膝を貝が開くように持ち上げる（骨盤は後ろに倒さない）。', 'ゆっくり閉じる。回数が終わったら向きを替える。'],
    benefit: 'お尻の横の筋肉（中殿筋）は、片脚で立つときに骨盤を支えます。ここが弱いと歩くときにふらつきやすいので、歩行の安定につながります。',
    easy: '開く幅を小さくする。', hard: '開いたまま2秒止める。' },
  { id: 'side-leg-raise', name: 'サイドレッグレイズ', category: 'lower', unit: 'reps', amount: 12, sets: 1, perSide: true,
    muscles: 'お尻の横・太ももの外側',
    steps: ['横向きに寝て、下の脚を軽く曲げ、上の脚はまっすぐ伸ばす。', '上の脚のつま先を前に向けたまま、ゆっくり持ち上げる（45度くらいまで）。', '1秒止めてから、ゆっくり下ろす。', '回数が終わったら向きを替える。'],
    benefit: 'お尻の横の筋肉を鍛え、片脚立ちや歩くときの骨盤のぐらつきを抑えます。腰や膝への負担を減らすことにもつながります。',
    easy: '脚を上げる高さを低くする。', hard: '上げたところで3秒止める。' },
  { id: 'donkey-kick', name: 'ドンキーキック', category: 'lower', unit: 'reps', amount: 10, sets: 1, perSide: true,
    muscles: 'お尻・太もも裏',
    steps: ['四つ這いになり、手は肩の下、膝は股関節の下に置く。', '背中をまっすぐにしたまま、片脚の膝を曲げたまま、足の裏を天井に向けて持ち上げる。', 'お尻に力が入るところまで上げ、腰は反らさない。', 'ゆっくり戻す。回数が終わったら脚を替える。'],
    benefit: 'お尻の筋肉を意識して鍛えられます。座りっぱなしで弱りやすい部分で、姿勢を整え、腰の負担を減らすことが期待できます。',
    easy: '膝を床から少しだけ浮かせる。', hard: '上げたところで2秒止める。' },
  // ---- ストレッチ（追加）
  { id: 'quad-stretch', name: '太もも前のストレッチ', category: 'stretch', unit: 'sec', amount: 30, sets: 1, perSide: true, target: 'lower',
    muscles: '太ももの前・脚のつけ根',
    steps: ['壁や椅子に片手を添えて立つ。', '片方の膝を曲げ、同じ側の手で足首（またはズボンのすそ）を持つ。', '膝を床に向けたまま、かかとをお尻に近づける。', '腰を反らさず、太ももの前が伸びるところで30秒キープする。反対側も行う。'],
    benefit: '座り姿勢で縮みやすい太もも前をゆるめます。膝まわりが楽になり、腰の反りすぎの予防にもつながります。' },
  { id: 'inner-thigh', name: '内もものストレッチ（あぐら）', category: 'stretch', unit: 'sec', amount: 30, sets: 1, target: 'lower',
    muscles: '内もも・股関節',
    steps: ['床に座り、足の裏を合わせて、かかとを体に引き寄せる。', '手で足先を持ち、背すじを伸ばす。', '息を吐きながら、背中を丸めずに上体をゆっくり前に倒す。', '膝を無理に押さず、内ももが気持ちよく伸びるところで30秒キープする。'],
    benefit: '内ももと股関節をゆるめます。脚の動きがなめらかになり、横に動くときのつっぱり感の軽減が期待できます。' },
  { id: 'side-bend', name: '体の横のストレッチ', category: 'stretch', unit: 'sec', amount: 30, sets: 1, perSide: true, target: 'core',
    muscles: 'わき腹・背中の横',
    steps: ['足を肩幅に開いて立つ。', '片腕を上げて、頭の横を通して反対側に倒す。', '体は前にも後ろにも倒さず、真横に曲げる。', '息を吐きながら、わき腹が伸びるところで30秒キープする。反対側も行う。'],
    benefit: 'わき腹と背中の横は、普段あまり伸ばす機会がありません。ここをほぐすと、深い呼吸がしやすくなり、体をひねる動きも楽になります。' },
  { id: 'neck-stretch', name: '首のストレッチ', category: 'stretch', unit: 'sec', amount: 30, sets: 1, perSide: true, target: 'upper',
    muscles: '首の横・肩の上',
    steps: ['背すじを伸ばして座るか立つ。', '片手を頭の反対側に軽く置き、首を横にゆっくり倒す（手は添えるだけ）。', '反対側の肩は下げたまま、首の横が気持ちよく伸びるところで止める。', '息を止めずに30秒キープする。反対側も行う。'],
    benefit: 'スマホやパソコンで固まりやすい首と肩の上をゆるめます。肩こりや首のつっぱり感の軽減が期待できます。強く引かないのがコツです。' },
  { id: 'triceps-stretch', name: '腕の裏のストレッチ', category: 'stretch', unit: 'sec', amount: 30, sets: 1, perSide: true, target: 'upper',
    muscles: '腕の裏・肩の後ろ',
    steps: ['背すじを伸ばして立つ。', '片腕を上げて、ひじを曲げ、手のひらを背中に向けて下ろす。', '反対の手でそのひじを軽く押して、頭の方へ寄せる。', '腰を反らさず、腕の裏が伸びるところで30秒キープする。反対側も行う。'],
    benefit: '腕を上げる・押す運動のあとに、腕の裏と肩の後ろをゆるめます。肩の動かしやすさが保たれ、腕を上に伸ばす動作が楽になります。' },
  { id: 'rear-shoulder', name: '肩の後ろのストレッチ', category: 'stretch', unit: 'sec', amount: 30, sets: 1, perSide: true, target: 'upper',
    muscles: '肩の後ろ・背中の上部',
    steps: ['背すじを伸ばして立つ。', '片腕を胸の前でまっすぐ伸ばし、反対の腕のひじの内側でかかえる。', '腕を胸に引き寄せて、肩の後ろを伸ばす。', '肩が上がらないようにして、30秒キープする。反対側も行う。'],
    benefit: '肩の後ろの筋肉は、押す動作や引く動作で疲れやすい部分です。ほぐすことで肩の動きがなめらかになり、肩こりの軽減が期待できます。' },
  { id: 'figure-four', name: 'お尻のストレッチ（図の4）', category: 'stretch', unit: 'sec', amount: 30, sets: 1, perSide: true, target: 'lower',
    muscles: 'お尻・太ももの外側',
    steps: ['仰向けに寝て、両膝を立てる。', '片方の足首を、反対側の膝の上にのせる（数字の「4」の形）。', '下の脚の太ももを両手で抱えて、胸の方へ引き寄せる。', 'お尻が伸びるところで30秒キープする。反対側も行う。膝に痛みが出たら中止する。'],
    benefit: 'お尻の深い部分の筋肉をゆるめます。座りっぱなしによる腰やお尻のこわばりを和らげ、腰痛の予防にも役立つとされています。' },
  { id: 'spinal-twist', name: '背中のひねり（仰向け）', category: 'stretch', unit: 'sec', amount: 30, sets: 1, perSide: true, target: 'core',
    muscles: '背中・腰・お尻・わき腹',
    steps: ['仰向けに寝て、両腕を横に広げ、両膝を立てる。', '両膝をそろえたまま、ゆっくり片側に倒す。', '肩は床につけたまま、顔は反対側に向ける。', '腰やわき腹が伸びるところで、深く呼吸しながら30秒キープする。反対側も行う。'],
    benefit: '背骨のねじれやすさを保ちます。腰まわりの緊張がゆるみ、寝る前にやると体がほぐれて眠りやすくなります。' },
  { id: 'cobra', name: 'おなか側のストレッチ（コブラ）', category: 'stretch', unit: 'sec', amount: 30, sets: 1, target: 'core',
    muscles: 'おなか・胸・脚のつけ根の前',
    steps: ['うつ伏せになり、手を胸の横に置く。', '足の甲は床につけたまま、息を吐きながら上体をゆっくり起こす。', '腰が痛くない範囲で止め、肩を下げて胸を開く。', '30秒キープして、ゆっくり下ろす。腰に痛みが出たら、起こす高さを下げる。'],
    benefit: '前かがみの時間が長いと縮みやすい、おなかと胸の前をのばします。背すじが伸びて呼吸がしやすくなり、姿勢の切り替えに役立ちます。' },
  // ---- 準備運動（追加。曜日で変わります）
  { id: 'arm-circle', name: '肩まわし（準備運動）', category: 'stretch', unit: 'reps', amount: 10, sets: 1, warmup: true,
    muscles: '肩・肩甲骨まわり',
    steps: ['足を肩幅に開いて立ち、両腕を横に広げる。', '大きな円を描くように、腕を前から後ろへゆっくり回す。', '半分終えたら、後ろから前へ回す。', '肩をすくめず、呼吸を止めない。'],
    benefit: '肩と肩甲骨まわりを温め、腕を使うトレーニングの前に動きをなめらかにします。ケガの予防にも役立ちます。' },
  { id: 'leg-swing', name: '脚振り（準備運動）', category: 'stretch', unit: 'reps', amount: 10, sets: 1, perSide: true, warmup: true,
    muscles: '股関節・太もも裏・太もも前',
    steps: ['壁や柱に片手を添えて、横向きに立つ。', '背すじを伸ばしたまま、外側の脚をまっすぐ前後に振る。', '反動を使いすぎず、振り幅は気持ちよく動く範囲にする。', '回数が終わったら、向きを替えて反対の脚も行う。'],
    benefit: '股関節まわりを動かして温めます。脚を使うトレーニングの前の準備運動に向いていて、動きの滑らかさが上がります。' },
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

const pick = <T,>(list: T[], i: number): T => list[((i % list.length) + list.length) % list.length];

export const warmupExercise = (): Exercise => EXERCISES.find((e) => e.warmup)!;

/**
 * Weekday menu. Each day has a theme of three strength slots and three stretch areas, so every body
 * part is worked about twice a week with 48 h between sessions (MHLW guide / ACSM). Each slot lists
 * exercises from easy to hard; the higher the stage, the more of the list is in play, and the
 * choice then moves on week by week so the same weekday does not repeat the same exercises.
 */
interface DayTheme { title: string; warmup: string; strength: string[][]; stretch: string[][] }

const AREA: Record<string, string[]> = {
  ham: ['hamstring', 'forward-fold'],
  quad: ['quad-stretch'],
  calf: ['calf-stretch'],
  hip: ['hip-flexor', 'inner-thigh'],
  glute: ['glute-hug', 'figure-four'],
  chest: ['chest-shoulder'],
  shoulder: ['scapula-stretch', 'rear-shoulder', 'triceps-stretch'],
  neck: ['neck-stretch'],
  back: ['childs-pose', 'thoracic-reach'],
  twist: ['spinal-twist', 'thoracic-reach'],
  side: ['side-bend'],
  belly: ['cobra'],
};

const SLOT = {
  squat: ['squat', 'wide-squat', 'wall-sit'],
  hinge: ['hip-lift', 'good-morning', 'single-hip-lift'],
  calf: ['calf-raise', 'single-calf-raise'],
  chest: ['wall-pushup', 'incline-pushup', 'pushup', 'wide-pushup'],
  shoulder: ['shoulder-tap', 'pike-pushup'],
  arm: ['chair-dip', 'wall-pushup'],
  curlUp: ['curl-up', 'reverse-crunch', 'hollow-hold'],
  sideCore: ['side-plank', 'side-leg-raise'],
  backCore: ['bird-dog', 'dead-bug', 'superman'],
  lunge: ['split-squat', 'back-lunge', 'side-lunge'],
  balance: ['single-leg-stand', 'single-leg-reach'],
  gluteSide: ['clamshell', 'side-leg-raise', 'donkey-kick'],
  pull: ['superman', 'towel-pulldown', 'prone-y', 'snow-angel'],
  scap: ['prone-y', 'snow-angel', 'towel-pulldown'],
  plank: ['plank', 'mountain-climber', 'dead-bug'],
  light: ['calf-raise', 'single-leg-stand', 'wall-pushup', 'bird-dog'],
};

// Sunday first (matches Date.getDay()).
const THEMES: DayTheme[] = [
  { title: 'ストレッチの日', warmup: 'cat-cow', strength: [SLOT.light], stretch: [AREA.ham, AREA.hip, AREA.back, AREA.shoulder, AREA.side] },
  { title: '下半身', warmup: 'leg-swing', strength: [SLOT.squat, SLOT.hinge, SLOT.calf], stretch: [AREA.ham, AREA.quad, AREA.calf] },
  { title: '上半身（押す）', warmup: 'arm-circle', strength: [SLOT.chest, SLOT.shoulder, SLOT.arm], stretch: [AREA.chest, AREA.shoulder, AREA.neck] },
  { title: '体幹（ビッグ3）', warmup: 'cat-cow', strength: [SLOT.curlUp, SLOT.sideCore, SLOT.backCore], stretch: [AREA.back, AREA.side, AREA.glute] },
  { title: '片脚・バランス', warmup: 'leg-swing', strength: [SLOT.lunge, SLOT.balance, SLOT.gluteSide], stretch: [AREA.hip, AREA.quad, AREA.glute] },
  { title: '上半身（引く）', warmup: 'arm-circle', strength: [SLOT.pull, SLOT.scap, SLOT.arm], stretch: [AREA.shoulder, AREA.back, AREA.chest] },
  { title: '体幹・バランス', warmup: 'cat-cow', strength: [SLOT.plank, SLOT.balance, ['hip-lift', 'single-hip-lift']], stretch: [AREA.ham, AREA.twist, AREA.belly] },
];

export const dayTheme = (date: string): string => THEMES[new Date(`${date}T12:00:00`).getDay()].title;
export const isStretchDay = (date: string): boolean => new Date(`${date}T12:00:00`).getDay() === 0;

/** Weeks since a fixed Monday, so the rotation does not depend on when the user started. */
const weekNo = (date: string): number => Math.floor((Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10)) - Date.UTC(2024, 0, 1)) / 86400000 / 7);

/** How many of a slot's exercises are in play (easy ones first; more at higher stages). */
const unlockedOf = (ids: string[], stage: number): string[] => ids.slice(0, Math.max(2, Math.min(ids.length, Math.ceil((ids.length * (stage + 2)) / 5))));

/** Index for a slot this week; the extra term shifts the cycle so slots do not all repeat in step. */
const spin = (week: number, i: number, len: number): number => week + i + Math.floor(week / len) * (i + 1);

function pickUnique(pool: string[], start: number, used: Set<string>): Exercise {
  for (let i = 0; i < pool.length; i++) {
    const id = pick(pool, start + i);
    if (!used.has(id)) { used.add(id); return byId(id)!; }
  }
  const id = pick(pool, start);
  used.add(id);
  return byId(id)!;
}

export function goalMenu(date: string, stage = 2): Exercise[] {
  const dow = new Date(`${date}T12:00:00`).getDay();
  const theme = THEMES[dow];
  const week = weekNo(date);
  const used = new Set<string>();
  const warm = byId(theme.warmup)!;
  used.add(warm.id);
  const strength = theme.strength.map((slot, i) => pickUnique(unlockedOf(slot, stage), spin(week, i, unlockedOf(slot, stage).length), used));
  const stretches = theme.stretch.map((area, i) => pickUnique(area, spin(week, i + 3, area.length), used));
  return [warm, ...strength, ...stretches];
}

/** The strength exercise suggested for the 1-exercise minimum line. */
export function minimumPick(date: string, stage = 2): Exercise {
  return goalMenu(date, stage).find((e) => e.category !== 'stretch')!;
}

export function setLabel(e: Exercise, amount: number): string {
  const per = e.unit === 'reps' ? `${amount}回` : `${amount}秒`;
  const side = e.perSide ? '（左右それぞれ）' : '';
  const sets = e.sets > 1 ? ` × ${e.sets}セット` : '';
  return `${per}${side}${sets}`;
}

/** Compact label for lists, e.g. "10回 × 2", "左右 8回", "30秒". */
export function shortLabel(e: Exercise, amount: number): string {
  const per = e.unit === 'reps' ? `${amount}回` : `${amount}秒`;
  return `${e.perSide ? '左右 ' : ''}${per}${e.sets > 1 ? ` × ${e.sets}` : ''}`;
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
