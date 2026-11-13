/**
 * オリジナル例題テンプレート・練習問題バンク・ランダム問題ジェネレーター
 */
(function (global) {
  'use strict';

  const PRESETS = {
    'club-ratio': {
      pattern: 'ratio',
      problemText: 'ダンスクラブの定員は10人ですが、希望者は15人いました。希望者は定員の何倍ですか。',
      enableSecond: false,
      auxDiagram: 'tape',
      primary: {
        title: '',
        baseLabel: '定員',
        baseVal: '10',
        baseUnit: '人',
        baseUnknown: false,
        ratioVal: '□',
        ratioUnknown: true,
        ratioStyle: 'bai',
        showReturnArrow: false,
        comparedLabel: '希望者',
        comparedVal: '15',
        comparedUnit: '人',
        comparedUnknown: false,
      },
    },
    'concert-ratio': {
      pattern: 'ratio',
      problemText: '4年生80人のうち、遠足のバスでAコースをえらんだ人は32人でした。全体の人数をもとにしたときの、Aコースの人数の割合を求めましょう。',
      enableSecond: false,
      auxDiagram: 'segment',
      primary: {
        title: '',
        baseLabel: '全体',
        baseVal: '80',
        baseUnit: '人',
        baseUnknown: false,
        ratioVal: '□',
        ratioUnknown: true,
        ratioStyle: 'bai',
        showReturnArrow: false,
        comparedLabel: 'Aコース',
        comparedVal: '32',
        comparedUnit: '人',
        comparedUnknown: false,
      },
    },
    'library-compared': {
      pattern: 'compared',
      problemText: '学校全体で今週かりられた本は300さつで、そのうち4年生がかりたのは全体の0.25倍でした。4年生がかりた本は何さつでしたか。',
      enableSecond: false,
      auxDiagram: 'segment',
      primary: {
        title: '',
        baseLabel: '全体',
        baseVal: '300',
        baseUnit: 'さつ',
        baseUnknown: false,
        ratioVal: '0.25',
        ratioUnknown: false,
        ratioStyle: 'bai',
        showReturnArrow: false,
        comparedLabel: '4年生',
        comparedVal: '□',
        comparedUnit: 'さつ',
        comparedUnknown: true,
      },
    },
    'price-up': {
      pattern: 'compared',
      problemText: '先月200円だったノートが、今月は先月の1.15倍にね上がりしました。今月のねだんは何円ですか。',
      enableSecond: false,
      auxDiagram: 'segment',
      primary: {
        title: '',
        baseLabel: '先月',
        baseVal: '200',
        baseUnit: '円',
        baseUnknown: false,
        ratioVal: '1.15',
        ratioUnknown: false,
        ratioStyle: 'bai',
        showReturnArrow: false,
        comparedLabel: '今月',
        comparedVal: '□',
        comparedUnit: '円',
        comparedUnknown: true,
      },
    },
    'yesterday-base': {
      pattern: 'base',
      problemText: '今日、体育館で遊んだ児童は、きのうの1.4倍にあたる35人でした。きのう遊んだ児童は何人でしたか。',
      enableSecond: false,
      auxDiagram: 'segment',
      primary: {
        title: '',
        baseLabel: 'きのう',
        baseVal: '□',
        baseUnit: '人',
        baseUnknown: true,
        ratioVal: '1.4',
        ratioUnknown: false,
        ratioStyle: 'bai',
        showReturnArrow: true,
        comparedLabel: '今日',
        comparedVal: '35',
        comparedUnit: '人',
        comparedUnknown: false,
      },
    },
    'sale-base': {
      pattern: 'base',
      problemText: 'あるくつが、もとのねだんの0.8倍に値下げされて、3200円で売られています。もとのねだんは何円でしたか。',
      enableSecond: false,
      auxDiagram: 'segment',
      primary: {
        title: '',
        baseLabel: 'もとのねだん',
        baseVal: '□',
        baseUnit: '円',
        baseUnknown: true,
        ratioVal: '0.8',
        ratioUnknown: false,
        ratioStyle: 'bai',
        showReturnArrow: true,
        comparedLabel: 'セール価格',
        comparedVal: '3200',
        comparedUnit: '円',
        comparedUnknown: false,
      },
    },
    'compare-two': {
      pattern: 'ratio',
      problemText: '卓球クラブと料理クラブでは、それぞれ定員の何倍の希望者がいますか。',
      enableSecond: true,
      auxDiagram: 'tape',
      primary: {
        title: '卓球クラブ',
        baseLabel: '定員',
        baseVal: '8',
        baseUnit: '人',
        baseUnknown: false,
        ratioVal: '□',
        ratioUnknown: true,
        ratioStyle: 'bai',
        showReturnArrow: false,
        comparedLabel: '希望者',
        comparedVal: '12',
        comparedUnit: '人',
        comparedUnknown: false,
      },
      second: {
        title: '料理クラブ',
        baseLabel: '定員',
        baseVal: '10',
        baseUnit: '人',
        baseUnknown: false,
        ratioVal: '□',
        ratioUnknown: true,
        ratioStyle: 'bai',
        showReturnArrow: false,
        comparedLabel: '希望者',
        comparedVal: '14',
        comparedUnit: '人',
        comparedUnknown: false,
      },
    },
  };

  /**
   * 練習問題リスト（オリジナル問題12問）
   * segments: 文章中のハイライト部分
   */
  const PRACTICE_PROBLEMS = [
    {
      id: 'p1',
      category: 'ratio',
      levelLabel: 'レベル1・割合を求める',
      textParts: [
        { t: 'バドミントンクラブの' },
        { t: '定員は8人', role: 'base' },
        { t: 'で、' },
        { t: '希望者は12人', role: 'compared' },
        { t: 'でした。希望者は' },
        { t: '定員の何倍', role: 'ratio' },
        { t: 'ですか。' },
      ],
      hint: '「定員の 何倍ですか」と聞かれているね。「〜の」の前にある「定員」がもとにする量（左の箱）だよ！',
      baseLabel: '定員',
      baseVal: '8人',
      comparedLabel: '希望者',
      comparedVal: '12人',
      ratioVal: '□倍',
      unknownTarget: 'ratio',
      baseNum: 8,
      comparedNum: 12,
      ratioNum: 1.5,
      unit: '倍',
      validEqs: ['12÷8'],
      answer: 1.5,
    },
    {
      id: 'p2',
      category: 'ratio',
      levelLabel: 'レベル1・割合を求める',
      textParts: [
        { t: '5年生' },
        { t: '全体120人', role: 'base' },
        { t: 'のうち、水泳教室に参加したのは' },
        { t: '48人', role: 'compared' },
        { t: 'でした。参加した人数は' },
        { t: '全体の何倍（割合）', role: 'ratio' },
        { t: 'ですか。' },
      ],
      hint: '「全体の 何倍」なので、「全体」がもとにする量（左）、「参加した人数」がくらべる量（右）になるよ。',
      baseLabel: '全体',
      baseVal: '120人',
      comparedLabel: '参加した人',
      comparedVal: '48人',
      ratioVal: '□倍',
      unknownTarget: 'ratio',
      baseNum: 120,
      comparedNum: 48,
      ratioNum: 0.4,
      unit: '倍',
      validEqs: ['48÷120'],
      answer: 0.4,
    },
    {
      id: 'p3',
      category: 'ratio',
      levelLabel: 'レベル1・割合を求める',
      textParts: [
        { t: '花だんに植えたチューリップ' },
        { t: '50本', role: 'base' },
        { t: 'のうち、' },
        { t: '赤い花は35本', role: 'compared' },
        { t: 'さきました。赤い花は' },
        { t: '全体の何倍（割合）', role: 'ratio' },
        { t: 'ですか。' },
      ],
      hint: '「全体の」がついている「全体（50本）」がもとにする量だよ。48÷120のように「くらべる ÷ もと」で考えよう！',
      baseLabel: '全体',
      baseVal: '50本',
      comparedLabel: '赤い花',
      comparedVal: '35本',
      ratioVal: '□倍',
      unknownTarget: 'ratio',
      baseNum: 50,
      comparedNum: 35,
      ratioNum: 0.7,
      unit: '倍',
      validEqs: ['35÷50'],
      answer: 0.7,
    },
    {
      id: 'p4',
      category: 'compared',
      levelLabel: 'レベル2・くらべる量を求める',
      textParts: [
        { t: '今週、学校全体で集まったペットボトルは' },
        { t: '400本', role: 'base' },
        { t: 'で、5年生が集めたのは' },
        { t: '全体の0.3倍', role: 'ratio' },
        { t: 'でした。' },
        { t: '5年生が集めた本数', role: 'compared' },
        { t: 'は何本ですか。' },
      ],
      hint: '「全体の 0.3倍」だから、「全体（400本）」がもとにする量（左）！わからない「5年生」が □本（右）だよ。',
      baseLabel: '全体',
      baseVal: '400本',
      comparedLabel: '5年生',
      comparedVal: '□本',
      ratioVal: '0.3倍',
      unknownTarget: 'compared',
      baseNum: 400,
      comparedNum: 120,
      ratioNum: 0.3,
      unit: '本',
      validEqs: ['400×0.3', '0.3×400'],
      answer: 120,
    },
    {
      id: 'p5',
      category: 'compared',
      levelLabel: 'レベル2・くらべる量を求める',
      textParts: [
        { t: '去年' },
        { t: '180円', role: 'base' },
        { t: 'だったリンゴが、ことしは' },
        { t: '去年の1.2倍', role: 'ratio' },
        { t: 'にね上がりしました。' },
        { t: 'ことしのねだん', role: 'compared' },
        { t: 'は何円ですか。' },
      ],
      hint: '「去年の 1.2倍」と書いてあるので、「去年（180円）」がもとにする量（左）になるよ。',
      baseLabel: '去年',
      baseVal: '180円',
      comparedLabel: 'ことし',
      comparedVal: '□円',
      ratioVal: '1.2倍',
      unknownTarget: 'compared',
      baseNum: 180,
      comparedNum: 216,
      ratioNum: 1.2,
      unit: '円',
      validEqs: ['180×1.2', '1.2×180'],
      answer: 216,
    },
    {
      id: 'p6',
      category: 'compared',
      levelLabel: 'レベル2・くらべる量を求める',
      textParts: [
        { t: '長さ' },
        { t: '60mの赤いテープ', role: 'base' },
        { t: 'があります。青いテープの長さは、' },
        { t: '赤いテープの0.65倍', role: 'ratio' },
        { t: 'です。' },
        { t: '青いテープの長さ', role: 'compared' },
        { t: 'は何mですか。' },
      ],
      hint: '「赤いテープの 0.65倍」なので、「赤いテープ（60m）」がもとにする量（左）だね！',
      baseLabel: '赤いテープ',
      baseVal: '60m',
      comparedLabel: '青いテープ',
      comparedVal: '□m',
      ratioVal: '0.65倍',
      unknownTarget: 'compared',
      baseNum: 60,
      comparedNum: 39,
      ratioNum: 0.65,
      unit: 'm',
      validEqs: ['60×0.65', '0.65×60'],
      answer: 39,
    },
    {
      id: 'p7',
      category: 'base',
      levelLabel: 'レベル3・もとにする量を求める',
      textParts: [
        { t: '今日、図書室を利用した人は' },
        { t: 'きのうの1.5倍', role: 'ratio' },
        { t: 'にあたる' },
        { t: '30人', role: 'compared' },
        { t: 'でした。' },
        { t: 'きのう利用した人', role: 'base' },
        { t: 'は何人でしたか。' },
      ],
      hint: '「きのうの 1.5倍」が今日（30人）！だから「きのう」が左の箱で、わからないので □人 になるよ。',
      baseLabel: 'きのう',
      baseVal: '□人',
      comparedLabel: '今日',
      comparedVal: '30人',
      ratioVal: '1.5倍',
      unknownTarget: 'base',
      baseNum: 20,
      comparedNum: 30,
      ratioNum: 1.5,
      unit: '人',
      validEqs: ['30÷1.5'],
      answer: 20,
    },
    {
      id: 'p8',
      category: 'base',
      levelLabel: 'レベル3・もとにする量を求める',
      textParts: [
        { t: 'あるリュックが、' },
        { t: 'もとのねだんの0.8倍', role: 'ratio' },
        { t: 'に値下げされて、' },
        { t: '2400円', role: 'compared' },
        { t: 'で売られています。' },
        { t: 'もとのねだん', role: 'base' },
        { t: 'は何円でしたか。' },
      ],
      hint: '「もとのねだんの 0.8倍」が2400円！もとにする量「もとのねだん」が □円 だよ。',
      baseLabel: 'もとのねだん',
      baseVal: '□円',
      comparedLabel: '今のねだん',
      comparedVal: '2400円',
      ratioVal: '0.8倍',
      unknownTarget: 'base',
      baseNum: 3000,
      comparedNum: 2400,
      ratioNum: 0.8,
      unit: '円',
      validEqs: ['2400÷0.8'],
      answer: 3000,
    },
    {
      id: 'p9',
      category: 'base',
      levelLabel: 'レベル3・もとにする量を求める',
      textParts: [
        { t: 'ゆうたさんの先週の貯金は、' },
        { t: '先々週の0.6倍', role: 'ratio' },
        { t: 'にあたる' },
        { t: '900円', role: 'compared' },
        { t: 'でした。' },
        { t: '先々週の貯金', role: 'base' },
        { t: 'は何円でしたか。' },
      ],
      hint: '「先々週の 0.6倍」と書いてあるので、「先々週」がもとにする量（左・□円）だね！',
      baseLabel: '先々週',
      baseVal: '□円',
      comparedLabel: '先週',
      comparedVal: '900円',
      ratioVal: '0.6倍',
      unknownTarget: 'base',
      baseNum: 1500,
      comparedNum: 900,
      ratioNum: 0.6,
      unit: '円',
      validEqs: ['900÷0.6'],
      answer: 1500,
    },
    {
      id: 'p10',
      category: 'tricky',
      levelLabel: 'レベル4・言葉の順ひっかけ',
      textParts: [
        { t: '折り紙を' },
        { t: 'あおいさんは27まい', role: 'compared' },
        { t: '折りました。これは、' },
        { t: '兄が折った枚数の1.5倍', role: 'ratio' },
        { t: 'です。' },
        { t: '兄が折った枚数', role: 'base' },
        { t: 'は何まいですか。' },
      ],
      hint: '27まいが最初に出てくるけど、だまされないで！「兄が折った枚数の 1.5倍」と書いてあるから、もとにする量（左）は「兄」だよ！',
      baseLabel: '兄',
      baseVal: '□まい',
      comparedLabel: 'あおいさん',
      comparedVal: '27まい',
      ratioVal: '1.5倍',
      unknownTarget: 'base',
      baseNum: 18,
      comparedNum: 27,
      ratioNum: 1.5,
      unit: 'まい',
      validEqs: ['27÷1.5'],
      answer: 18,
    },
    {
      id: 'p11',
      category: 'tricky',
      levelLabel: 'レベル4・言葉の順ひっかけ',
      textParts: [
        { t: '水そうAには' },
        { t: '18L', role: 'compared' },
        { t: 'の水が入っています。これは、' },
        { t: '水そうBの0.75倍', role: 'ratio' },
        { t: 'の量です。' },
        { t: '水そうBの水の量', role: 'base' },
        { t: 'は何Lですか。' },
      ],
      hint: '「水そうBの 0.75倍」なので、「水そうB」がもとにする量（左・□L）、「水そうA」がくらべる量（右・18L）！',
      baseLabel: '水そうB',
      baseVal: '□L',
      comparedLabel: '水そうA',
      comparedVal: '18L',
      ratioVal: '0.75倍',
      unknownTarget: 'base',
      baseNum: 24,
      comparedNum: 18,
      ratioNum: 0.75,
      unit: 'L',
      validEqs: ['18÷0.75'],
      answer: 24,
    },
    {
      id: 'p12',
      category: 'tricky',
      levelLabel: 'レベル4・言葉の順ひっかけ',
      textParts: [
        { t: 'ミニトマトが' },
        { t: '赤組は45個', role: 'base' },
        { t: '、' },
        { t: '白組は36個', role: 'compared' },
        { t: 'とれました。白組の個数は、' },
        { t: '赤組の何倍', role: 'ratio' },
        { t: 'ですか。' },
      ],
      hint: '「赤組の 何倍」と聞かれているよ。「〜の」の前にある「赤組（45個）」が左の箱（もとにする量）だね！',
      baseLabel: '赤組',
      baseVal: '45個',
      comparedLabel: '白組',
      comparedVal: '36個',
      ratioVal: '□倍',
      unknownTarget: 'ratio',
      baseNum: 45,
      comparedNum: 36,
      ratioNum: 0.8,
      unit: '倍',
      validEqs: ['36÷45'],
      answer: 0.8,
    },
  ];

  const SCENARIOS = [
    { base: '去年', comp: '今年', unit: '人', ctx: '科学クラブの人数' },
    { base: 'もとのねだん', comp: 'セール価格', unit: '円', ctx: '文房具セットのねだん' },
    { base: '赤いリボン', comp: '青いリボン', unit: 'cm', ctx: 'リボンの長さ' },
    { base: '1組', comp: '2組', unit: 'さつ', ctx: '1週間に読んだ本' },
    { base: 'きのう', comp: '今日', unit: '個', ctx: '集めたどんぐり' },
    { base: '全体', comp: '合格者', unit: '人', ctx: '検定の受験者' },
  ];

  const CLEAN_PAIRS = [
    { base: 20, ratio: 1.4, comp: 28 },
    { base: 40, ratio: 0.35, comp: 14 },
    { base: 50, ratio: 0.8, comp: 40 },
    { base: 80, ratio: 1.25, comp: 100 },
    { base: 120, ratio: 0.6, comp: 72 },
    { base: 150, ratio: 0.4, comp: 60 },
    { base: 200, ratio: 0.75, comp: 150 },
    { base: 250, ratio: 1.2, comp: 300 },
    { base: 300, ratio: 0.45, comp: 135 },
    { base: 500, ratio: 0.65, comp: 325 },
  ];

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * ランダムな練習問題を生成（毎回違う数値・場面で無限練習）
   */
  function generateRandomProblem() {
    const sc = pick(SCENARIOS);
    const nums = pick(CLEAN_PAIRS);
    const kind = pick(['ratio', 'compared', 'base']);

    const bFull = `${nums.base}${sc.unit}`;
    const cFull = `${nums.comp}${sc.unit}`;
    const rFull = `${nums.ratio}倍`;

    if (kind === 'ratio') {
      return {
        id: 'gen-' + Date.now(),
        category: 'generated',
        levelLabel: '🎲 自動生成・割合を求める',
        textParts: [
          { t: `${sc.ctx}を調べたところ、` },
          { t: `${sc.base}は${bFull}`, role: 'base' },
          { t: `、` },
          { t: `${sc.comp}は${cFull}`, role: 'compared' },
          { t: `でした。${sc.comp}は` },
          { t: `${sc.base}の何倍`, role: 'ratio' },
          { t: `ですか。` },
        ],
        hint: `「${sc.base}の 何倍」だから、「${sc.base}（${bFull}）」が左の箱（もとにする量）だよ！`,
        baseLabel: sc.base,
        baseVal: bFull,
        comparedLabel: sc.comp,
        comparedVal: cFull,
        ratioVal: '□倍',
        unknownTarget: 'ratio',
        baseNum: nums.base,
        comparedNum: nums.comp,
        ratioNum: nums.ratio,
        unit: '倍',
        validEqs: [`${nums.comp}÷${nums.base}`],
        answer: nums.ratio,
      };
    }

    if (kind === 'compared') {
      return {
        id: 'gen-' + Date.now(),
        category: 'generated',
        levelLabel: '🎲 自動生成・くらべる量',
        textParts: [
          { t: `${sc.ctx}で、` },
          { t: `${sc.base}は${bFull}`, role: 'base' },
          { t: `でした。` },
          { t: `${sc.comp}`, role: 'compared' },
          { t: `は` },
          { t: `${sc.base}の${rFull}`, role: 'ratio' },
          { t: `です。${sc.comp}はいくつですか。` },
        ],
        hint: `「${sc.base}の ${rFull}」だから、「${sc.base}（${bFull}）」がもとにする量（左）になるよ！`,
        baseLabel: sc.base,
        baseVal: bFull,
        comparedLabel: sc.comp,
        comparedVal: `□${sc.unit}`,
        ratioVal: rFull,
        unknownTarget: 'compared',
        baseNum: nums.base,
        comparedNum: nums.comp,
        ratioNum: nums.ratio,
        unit: sc.unit,
        validEqs: [`${nums.base}×${nums.ratio}`, `${nums.ratio}×${nums.base}`],
        answer: nums.comp,
      };
    }

    // base
    return {
      id: 'gen-' + Date.now(),
      category: 'generated',
      levelLabel: '🎲 自動生成・もとにする量',
      textParts: [
        { t: `${sc.ctx}で、` },
        { t: `${sc.comp}は${cFull}`, role: 'compared' },
        { t: `で、これは` },
        { t: `${sc.base}の${rFull}`, role: 'ratio' },
        { t: `にあたります。` },
        { t: `${sc.base}`, role: 'base' },
        { t: `はいくつでしたか。` },
      ],
      hint: `「${sc.base}の ${rFull}」と書いてあるね！だから「${sc.base}」がもとにする量（左・□${sc.unit}）だよ。`,
      baseLabel: sc.base,
      baseVal: `□${sc.unit}`,
      comparedLabel: sc.comp,
      comparedVal: cFull,
      ratioVal: rFull,
      unknownTarget: 'base',
      baseNum: nums.base,
      comparedNum: nums.comp,
      ratioNum: nums.ratio,
      unit: sc.unit,
      validEqs: [`${nums.comp}÷${nums.ratio}`],
      answer: nums.base,
    };
  }

  /**
   * エディタで作成した図をそのまま練習問題に変換する
   */
  function createProblemFromEditorState(state) {
    const item = state.primary;
    const parse = global.KankeizuDiagram.parseNumeric;
    const fmt = global.KankeizuDiagram.formatNum;

    const bUnknown = item.baseUnknown || String(item.baseVal).trim() === '□';
    const rUnknown = item.ratioUnknown || String(item.ratioVal).trim() === '□';
    const cUnknown = item.comparedUnknown || String(item.comparedVal).trim() === '□';

    const bNum = parse(item.baseVal);
    const rNum = parse(item.ratioVal);
    const cNum = parse(item.comparedVal);

    let unknownTarget = 'ratio';
    let answer = 0;
    let validEqs = [];
    let unit = '倍';
    let baseNum = bNum;
    let comparedNum = cNum;
    let ratioNum = rNum;

    if (rUnknown && Number.isFinite(bNum) && Number.isFinite(cNum) && bNum !== 0) {
      unknownTarget = 'ratio';
      answer = Number(fmt(cNum / bNum));
      ratioNum = answer;
      validEqs = [`${cNum}÷${bNum}`];
      unit = '倍';
    } else if (cUnknown && Number.isFinite(bNum) && Number.isFinite(rNum)) {
      unknownTarget = 'compared';
      answer = Number(fmt(bNum * rNum));
      comparedNum = answer;
      validEqs = [`${bNum}×${rNum}`, `${rNum}×${bNum}`];
      unit = item.comparedUnit || '';
    } else if (bUnknown && Number.isFinite(cNum) && Number.isFinite(rNum) && rNum !== 0) {
      unknownTarget = 'base';
      answer = Number(fmt(cNum / rNum));
      baseNum = answer;
      validEqs = [`${cNum}÷${rNum}`];
      unit = item.baseUnit || '';
    } else {
      return null;
    }

    const baseValStr = bUnknown ? `□${item.baseUnit || ''}` : `${item.baseVal}${item.baseUnit || ''}`;
    const compValStr = cUnknown ? `□${item.comparedUnit || ''}` : `${item.comparedVal}${item.comparedUnit || ''}`;
    const ratioValStr = rUnknown ? '□倍' : `${item.ratioVal}倍`;

    const fallbackText = `${item.baseLabel}（${baseValStr}）をもとにしたときの、${item.comparedLabel}（${compValStr}）の割合（${ratioValStr}）の関係図を組み立てて、答えを求めましょう。`;

    return {
      id: 'custom-' + Date.now(),
      category: 'custom',
      levelLabel: '✏️ エディタから作成した問題',
      textParts: [{ t: (state.problemText || '').trim() || fallbackText }],
      hint: `もとにする量（左の箱）は「${item.baseLabel}」、くらべる量（右の箱）は「${item.comparedLabel}」だよ！`,
      baseLabel: item.baseLabel || 'もと',
      baseVal: baseValStr,
      comparedLabel: item.comparedLabel || 'くらべる',
      comparedVal: compValStr,
      ratioVal: ratioValStr,
      unknownTarget,
      baseNum,
      comparedNum,
      ratioNum,
      unit,
      validEqs,
      answer,
    };
  }

  global.KankeizuProblems = {
    PRESETS,
    PRACTICE_PROBLEMS,
    generateRandomProblem,
    createProblemFromEditorState,
  };
})(window);
