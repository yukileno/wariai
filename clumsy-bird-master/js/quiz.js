/**
 * クラムジーバード用 20秒ごとの割合クイズ＆日本語UIコントローラ
 */
(function (global) {
  'use strict';

  const QUIZ_INTERVAL_MS = 20000;
  const SLOTS = ['baseLabel', 'baseVal', 'ratioVal', 'comparedLabel', 'comparedVal'];

  const PROBLEMS = [
    {
      textParts: [
        { t: 'バドミントンクラブの' },
        { t: '定員は8人', role: 'base' },
        { t: 'で、' },
        { t: '希望者は12人', role: 'compared' },
        { t: 'でした。希望者は' },
        { t: '定員の何倍', role: 'ratio' },
        { t: 'ですか。' },
      ],
      hint: '「定員の 何倍」→「〜の」の前（定員）がもとにする量（左）',
      baseLabel: '定員', baseVal: '8人',
      comparedLabel: '希望者', comparedVal: '12人',
      ratioVal: '□倍',
      unknownTarget: 'ratio', baseNum: 8, comparedNum: 12, ratioNum: 1.5, unit: '倍',
      validEqs: ['12÷8'], answer: 1.5,
    },
    {
      textParts: [
        { t: '5年生' },
        { t: '全体120人', role: 'base' },
        { t: 'のうち、水泳教室に参加したのは' },
        { t: '48人', role: 'compared' },
        { t: 'でした。参加した人は' },
        { t: '全体の何倍', role: 'ratio' },
        { t: 'ですか。' },
      ],
      hint: '「全体の 何倍」→「全体（120人）」がもとにする量（左）',
      baseLabel: '全体', baseVal: '120人',
      comparedLabel: '参加した人', comparedVal: '48人',
      ratioVal: '□倍',
      unknownTarget: 'ratio', baseNum: 120, comparedNum: 48, ratioNum: 0.4, unit: '倍',
      validEqs: ['48÷120'], answer: 0.4,
    },
    {
      textParts: [
        { t: '学校全体で集まったペットボトルは' },
        { t: '400本', role: 'base' },
        { t: 'で、5年生が集めたのは' },
        { t: '全体の0.3倍', role: 'ratio' },
        { t: 'でした。' },
        { t: '5年生が集めた本数', role: 'compared' },
        { t: 'は何本ですか。' },
      ],
      hint: '「全体の 0.3倍」→「全体（400本）」がもとにする量（左）',
      baseLabel: '全体', baseVal: '400本',
      comparedLabel: '5年生', comparedVal: '□本',
      ratioVal: '0.3倍',
      unknownTarget: 'compared', baseNum: 400, comparedNum: 120, ratioNum: 0.3, unit: '本',
      validEqs: ['400×0.3', '0.3×400'], answer: 120,
    },
    {
      textParts: [
        { t: '去年' },
        { t: '180円', role: 'base' },
        { t: 'だったリンゴが、ことしは' },
        { t: '去年の1.2倍', role: 'ratio' },
        { t: 'になりました。' },
        { t: 'ことしのねだん', role: 'compared' },
        { t: 'は何円ですか。' },
      ],
      hint: '「去年の 1.2倍」→「去年（180円）」がもとにする量（左）',
      baseLabel: '去年', baseVal: '180円',
      comparedLabel: 'ことし', comparedVal: '□円',
      ratioVal: '1.2倍',
      unknownTarget: 'compared', baseNum: 180, comparedNum: 216, ratioNum: 1.2, unit: '円',
      validEqs: ['180×1.2', '1.2×180'], answer: 216,
    },
    {
      textParts: [
        { t: '今日、図書室を利用した人は' },
        { t: 'きのうの1.5倍', role: 'ratio' },
        { t: 'にあたる' },
        { t: '30人', role: 'compared' },
        { t: 'でした。' },
        { t: 'きのう利用した人', role: 'base' },
        { t: 'は何人でしたか。' },
      ],
      hint: '「きのうの 1.5倍」→「きのう（□人）」がもとにする量（左）',
      baseLabel: 'きのう', baseVal: '□人',
      comparedLabel: '今日', comparedVal: '30人',
      ratioVal: '1.5倍',
      unknownTarget: 'base', baseNum: 20, comparedNum: 30, ratioNum: 1.5, unit: '人',
      validEqs: ['30÷1.5'], answer: 20,
    },
    {
      textParts: [
        { t: 'あるリュックが、' },
        { t: 'もとのねだんの0.8倍', role: 'ratio' },
        { t: 'になって、' },
        { t: '2400円', role: 'compared' },
        { t: 'で売られています。' },
        { t: 'もとのねだん', role: 'base' },
        { t: 'は何円でしたか。' },
      ],
      hint: '「もとのねだんの 0.8倍」→「もとのねだん（□円）」が左の箱',
      baseLabel: 'もとのねだん', baseVal: '□円',
      comparedLabel: '今のねだん', comparedVal: '2400円',
      ratioVal: '0.8倍',
      unknownTarget: 'base', baseNum: 3000, comparedNum: 2400, ratioNum: 0.8, unit: '円',
      validEqs: ['2400÷0.8'], answer: 3000,
    },
    {
      textParts: [
        { t: '折り紙を' },
        { t: 'あおいさんは27まい', role: 'compared' },
        { t: '折りました。これは' },
        { t: '兄の1.5倍', role: 'ratio' },
        { t: 'です。' },
        { t: '兄が折った枚数', role: 'base' },
        { t: 'は何まいですか。' },
      ],
      hint: '「兄の 1.5倍」→「兄（□まい）」がもとにする量（左）',
      baseLabel: '兄', baseVal: '□まい',
      comparedLabel: 'あおいさん', comparedVal: '27まい',
      ratioVal: '1.5倍',
      unknownTarget: 'base', baseNum: 18, comparedNum: 27, ratioNum: 1.5, unit: 'まい',
      validEqs: ['27÷1.5'], answer: 18,
    },
    {
      textParts: [
        { t: '水そうAには' },
        { t: '18L', role: 'compared' },
        { t: 'の水が入っています。これは' },
        { t: '水そうBの0.75倍', role: 'ratio' },
        { t: 'です。' },
        { t: '水そうBの量', role: 'base' },
        { t: 'は何Lですか。' },
      ],
      hint: '「水そうBの 0.75倍」→「水そうB（□L）」がもとにする量（左）',
      baseLabel: '水そうB', baseVal: '□L',
      comparedLabel: '水そうA', comparedVal: '18L',
      ratioVal: '0.75倍',
      unknownTarget: 'base', baseNum: 24, comparedNum: 18, ratioNum: 0.75, unit: 'L',
      validEqs: ['18÷0.75'], answer: 24,
    },
  ];

  const SCENARIOS = [
    { base: '去年', comp: '今年', unit: '人', ctx: 'クラブの人数' },
    { base: '定価', comp: 'セール価格', unit: '円', ctx: 'ノートのねだん' },
    { base: '赤いテープ', comp: '青いテープ', unit: 'cm', ctx: 'テープの長さ' },
    { base: '1組', comp: '2組', unit: 'さつ', ctx: '読んだ本の数' },
    { base: 'きのう', comp: '今日', unit: '個', ctx: 'とれたトマト' },
  ];

  const CLEAN_PAIRS = [
    { base: 20, ratio: 1.4, comp: 28 },
    { base: 40, ratio: 0.35, comp: 14 },
    { base: 50, ratio: 0.8, comp: 40 },
    { base: 80, ratio: 1.25, comp: 100 },
    { base: 120, ratio: 0.6, comp: 72 },
    { base: 200, ratio: 0.75, comp: 150 },
    { base: 250, ratio: 1.2, comp: 300 },
    { base: 300, ratio: 0.45, comp: 135 },
  ];

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function generateProblem() {
    if (Math.random() < 0.55) {
      return pick(PROBLEMS);
    }
    const sc = pick(SCENARIOS);
    const nums = pick(CLEAN_PAIRS);
    const kind = pick(['ratio', 'compared', 'base']);
    const bFull = `${nums.base}${sc.unit}`;
    const cFull = `${nums.comp}${sc.unit}`;
    const rFull = `${nums.ratio}倍`;

    if (kind === 'ratio') {
      return {
        textParts: [
          { t: `${sc.ctx}は、` },
          { t: `${sc.base}が${bFull}`, role: 'base' },
          { t: `、` },
          { t: `${sc.comp}が${cFull}`, role: 'compared' },
          { t: `でした。${sc.comp}は` },
          { t: `${sc.base}の何倍`, role: 'ratio' },
          { t: `ですか。` },
        ],
        hint: `「${sc.base}の 何倍」→「${sc.base}（${bFull}）」が左（もとにする量）`,
        baseLabel: sc.base, baseVal: bFull,
        comparedLabel: sc.comp, comparedVal: cFull,
        ratioVal: '□倍',
        unknownTarget: 'ratio', baseNum: nums.base, comparedNum: nums.comp, ratioNum: nums.ratio, unit: '倍',
        validEqs: [`${nums.comp}÷${nums.base}`], answer: nums.ratio,
      };
    }
    if (kind === 'compared') {
      return {
        textParts: [
          { t: `${sc.ctx}で、` },
          { t: `${sc.base}は${bFull}`, role: 'base' },
          { t: `でした。` },
          { t: `${sc.comp}`, role: 'compared' },
          { t: `は` },
          { t: `${sc.base}の${rFull}`, role: 'ratio' },
          { t: `です。${sc.comp}はいくつですか。` },
        ],
        hint: `「${sc.base}の ${rFull}」→「${sc.base}（${bFull}）」が左（もとにする量）`,
        baseLabel: sc.base, baseVal: bFull,
        comparedLabel: sc.comp, comparedVal: `□${sc.unit}`,
        ratioVal: rFull,
        unknownTarget: 'compared', baseNum: nums.base, comparedNum: nums.comp, ratioNum: nums.ratio, unit: sc.unit,
        validEqs: [`${nums.base}×${nums.ratio}`, `${nums.ratio}×${nums.base}`], answer: nums.comp,
      };
    }
    return {
      textParts: [
        { t: `${sc.ctx}で、` },
        { t: `${sc.comp}は${cFull}`, role: 'compared' },
        { t: `で、これは` },
        { t: `${sc.base}の${rFull}`, role: 'ratio' },
        { t: `です。` },
        { t: `${sc.base}`, role: 'base' },
        { t: `はいくつでしたか。` },
      ],
      hint: `「${sc.base}の ${rFull}」→「${sc.base}（□${sc.unit}）」が左（もとにする量）`,
      baseLabel: sc.base, baseVal: `□${sc.unit}`,
      comparedLabel: sc.comp, comparedVal: cFull,
      ratioVal: rFull,
      unknownTarget: 'base', baseNum: nums.base, comparedNum: nums.comp, ratioNum: nums.ratio, unit: sc.unit,
      validEqs: [`${nums.comp}÷${nums.ratio}`], answer: nums.base,
    };
  }

  function buildRelationSvg(p) {
    const font = '"BIZ UDPGothic", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", sans-serif';
    const bVal = p.unknownTarget === 'base' ? '□' + p.unit : p.baseVal;
    const cVal = p.unknownTarget === 'compared' ? '□' + p.unit : p.comparedVal;
    const rVal = p.unknownTarget === 'ratio' ? '□倍' : p.ratioVal;
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430 130" width="410" height="124">
        <rect x="20" y="34" width="120" height="36" rx="6" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
        <text x="80" y="58" text-anchor="middle" font-family=${JSON.stringify(font)} font-size="15" font-weight="800" fill="#14532d">${p.baseLabel}</text>
        <text x="80" y="94" text-anchor="middle" font-family=${JSON.stringify(font)} font-size="16" font-weight="800" fill="#14532d">${bVal}</text>

        <text x="215" y="28" text-anchor="middle" font-family=${JSON.stringify(font)} font-size="16" font-weight="800" fill="#0369a1">${rVal}</text>
        <line x1="148" y1="52" x2="274" y2="52" stroke="#334155" stroke-width="2.5" stroke-linecap="round" />
        <polygon points="282,52 272,46 272,58" fill="#334155" />

        <rect x="290" y="34" width="120" height="36" rx="6" fill="#fce7f3" stroke="#db2777" stroke-width="2" />
        <text x="350" y="58" text-anchor="middle" font-family=${JSON.stringify(font)} font-size="15" font-weight="800" fill="#831843">${p.comparedLabel}</text>
        <text x="350" y="94" text-anchor="middle" font-family=${JSON.stringify(font)} font-size="16" font-weight="800" fill="#831843">${cVal}</text>
      </svg>
    `;
  }

  const state = {
    timerId: null,
    lastTick: 0,
    remainingMs: QUIZ_INTERVAL_MS,
    problem: null,
    cards: [],
    placed: {},
    activeSlot: null,
    step1Done: false,
    step2Done: false,
    hintOpen: false,
    hadMistake: false,
    isPenaltyRound: false,
    initialized: false,
  };

  function el(id) {
    return document.getElementById(id);
  }

  function updateHud() {
    const cd = el('quiz-countdown');
    if (cd) cd.textContent = Math.max(0, Math.ceil(state.remainingMs / 1000));
  }

  function showHud() {
    updateHud();
    el('quiz-hud').classList.remove('hidden');
  }

  function startSession() {
    // 失敗してやり直しても残り時間はリセットしない（0以下のときのみ20秒に戻す）
    if (!Number.isFinite(state.remainingMs) || state.remainingMs <= 0) {
      state.remainingMs = QUIZ_INTERVAL_MS;
    }
    state.lastTick = Date.now();
    updateHud();
    el('quiz-hud').classList.remove('hidden');

    if (state.timerId) clearInterval(state.timerId);
    state.timerId = setInterval(() => {
      const now = Date.now();
      const dt = now - state.lastTick;
      state.lastTick = now;

      if (
        typeof game === 'undefined' ||
        !me.state.isCurrent(me.state.PLAY) ||
        !game.data.start ||
        game.data.quizPaused ||
        game.data.resuming
      ) {
        return;
      }

      state.remainingMs -= dt;
      updateHud();
      if (state.remainingMs <= 0) {
        state.remainingMs = 0;
        updateHud();
        openQuiz(false);
      }
    }, 200);
  }

  function stopSession() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
    el('quiz-hud').classList.add('hidden');
    el('quiz-modal').classList.add('hidden');
    el('resume-overlay').classList.add('hidden');
  }

  function unbindGameControlsForQuiz() {
    me.input.unbindKey(me.input.KEY.SPACE);
    me.input.unbindPointer(me.input.pointer.LEFT);
  }

  function rebindGameControlsAfterQuiz() {
    me.input.bindKey(me.input.KEY.SPACE, 'fly', true);
    me.input.bindPointer(me.input.pointer.LEFT, me.input.KEY.SPACE);
  }

  function openQuiz(isPenaltyRound) {
    game.data.quizPaused = true;
    unbindGameControlsForQuiz();
    state.isPenaltyRound = Boolean(isPenaltyRound);
    loadQuizProblem(generateProblem());
    el('quiz-modal').classList.remove('hidden');
  }

  function loadQuizProblem(problem) {
    state.problem = problem;
    state.placed = { baseLabel: null, baseVal: null, ratioVal: null, comparedLabel: null, comparedVal: null };
    state.activeSlot = 'baseLabel';
    state.step1Done = false;
    state.step2Done = false;
    state.hintOpen = false;
    state.hadMistake = false;

    state.cards = shuffle([
      { id: 'c1', text: problem.baseLabel },
      { id: 'c2', text: problem.baseVal },
      { id: 'c3', text: problem.ratioVal },
      { id: 'c4', text: problem.comparedLabel },
      { id: 'c5', text: problem.comparedVal },
    ]);

    renderQuiz();
  }

  function renderStatus() {
    const st = el('qm-status');
    st.classList.remove('penalty');
    if (state.hadMistake) {
      st.textContent = '⚠️ まちがいあり！解けたあと「もう1問」チャレンジ';
      st.classList.add('penalty');
    } else if (state.isPenaltyRound) {
      st.textContent = '🔥 もう1問チャレンジ！間違えずに解けたらゲームにもどれるよ';
      st.classList.add('penalty');
    } else {
      st.textContent = '間違えずに解けたらゲームにもどれるよ';
    }
  }

  function renderQuestion() {
    const qBox = el('qm-question');
    const p = state.problem;
    qBox.innerHTML = '';
    p.textParts.forEach((part) => {
      if (part.role && state.hintOpen) {
        const s = document.createElement('span');
        s.className = part.role === 'base' ? 'hl-base' : part.role === 'compared' ? 'hl-compared' : 'hl-ratio';
        s.textContent = part.t;
        qBox.appendChild(s);
      } else {
        qBox.appendChild(document.createTextNode(part.t));
      }
    });
    const hBox = el('qm-hint-box');
    if (state.hintOpen) {
      hBox.textContent = '💡 ' + p.hint;
      hBox.classList.remove('hidden');
    } else {
      hBox.classList.add('hidden');
    }
  }

  function placeholderOf(slot) {
    switch (slot) {
      case 'baseLabel': return 'なまえ';
      case 'baseVal': return '数量・□';
      case 'ratioVal': return '何倍・□倍';
      case 'comparedLabel': return 'なまえ';
      case 'comparedVal': return '数量・□';
      default: return '';
    }
  }

  function renderBoard() {
    const used = new Set(Object.values(state.placed).filter(Boolean));
    SLOTS.forEach((slot) => {
      const sEl = document.querySelector(`.qm-slot[data-slot="${slot}"]`);
      if (!sEl) return;
      sEl.classList.toggle('active-target', state.activeSlot === slot && !state.step1Done);
      sEl.classList.remove('slot-correct', 'slot-wrong');
      sEl.innerHTML = '';
      if (state.placed[slot]) {
        const card = state.cards.find((c) => c.id === state.placed[slot]);
        const chip = document.createElement('span');
        chip.className = 'qm-placed';
        chip.textContent = card ? card.text : '';
        sEl.appendChild(chip);
      } else {
        sEl.textContent = placeholderOf(slot);
      }
    });

    const tray = el('qm-tray');
    tray.innerHTML = '';
    state.cards.forEach((c) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'qm-card';
      btn.textContent = c.text;
      if (used.has(c.id)) btn.classList.add('used');
      btn.addEventListener('click', () => {
        if (state.step1Done) return;
        const target = state.activeSlot || SLOTS.find((s) => !state.placed[s]);
        if (!target) return;
        SLOTS.forEach((s) => { if (state.placed[s] === c.id) state.placed[s] = null; });
        state.placed[target] = c.id;
        state.activeSlot = SLOTS.find((s) => !state.placed[s]) || null;
        el('qm-diag-fb').classList.add('hidden');
        renderBoard();
      });
      tray.appendChild(btn);
    });
  }

  function renderQuiz() {
    renderStatus();
    renderQuestion();
    renderBoard();
    el('qm-diag-fb').classList.add('hidden');
    el('qm-ans-fb').classList.add('hidden');
    el('qm-step-2').classList.add('qm-locked');
    el('qm-svg-preview').innerHTML = '';
    el('qm-eq-in').value = '';
    el('qm-ans-in').value = '';
  }

  function showFb(id, cls, msg) {
    const f = el(id);
    f.className = 'qm-fb ' + cls;
    f.innerHTML = msg;
    f.classList.remove('hidden');
  }

  function checkDiagram() {
    if (state.step1Done) return;
    const p = state.problem;
    if (SLOTS.some((s) => !state.placed[s])) {
      showFb('qm-diag-fb', 'ng', '5か所すべてにカードを置いてね。');
      return;
    }

    const expected = {
      baseLabel: p.baseLabel,
      baseVal: p.baseVal,
      ratioVal: p.ratioVal,
      comparedLabel: p.comparedLabel,
      comparedVal: p.comparedVal,
    };

    let allOk = true;
    const actual = {};
    SLOTS.forEach((s) => {
      const c = state.cards.find((x) => x.id === state.placed[s]);
      actual[s] = c ? c.text : '';
      const ok = actual[s] === expected[s];
      if (!ok) allOk = false;
      const sEl = document.querySelector(`.qm-slot[data-slot="${s}"]`);
      if (sEl) {
        sEl.classList.toggle('slot-correct', ok);
        sEl.classList.toggle('slot-wrong', !ok);
      }
    });

    if (allOk) {
      state.step1Done = true;
      showFb('qm-diag-fb', 'ok', '⭕ 関係図OK！ステップ2で式と答えを出そう。');
      unlockStep2();
      return;
    }

    state.hadMistake = true;
    renderStatus();

    let msg = '赤い場所を見直そう。（※まちがえたので解いたあと「もう1問」になります）';
    if (actual.baseLabel === expected.comparedLabel && actual.comparedLabel === expected.baseLabel) {
      msg = `左右が反対だよ！「〜の」の前（<strong>${p.baseLabel}</strong>）が左（もとにする量）！（※解いたあと「もう1問」になります）`;
    }
    showFb('qm-diag-fb', 'ng', msg);
  }

  function unlockStep2() {
    const p = state.problem;
    el('qm-step-2').classList.remove('qm-locked');
    el('qm-svg-preview').innerHTML = buildRelationSvg(p);
    el('qm-ans-unit').textContent = p.unit;

    const eqIn = el('qm-eq-in');
    const btns = el('qm-eq-btns');
    btns.innerHTML = '';

    const nums = [];
    if (p.unknownTarget !== 'base') nums.push(String(p.baseNum));
    if (p.unknownTarget !== 'compared') nums.push(String(p.comparedNum));
    if (p.unknownTarget !== 'ratio') nums.push(String(p.ratioNum));

    [...nums, '×', '÷'].forEach((tok) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'qm-mini-btn';
      b.textContent = tok;
      b.addEventListener('click', () => {
        eqIn.value += tok;
        eqIn.focus();
      });
      btns.appendChild(b);
    });
    const clr = document.createElement('button');
    clr.type = 'button';
    clr.className = 'qm-mini-btn';
    clr.textContent = 'クリア';
    clr.addEventListener('click', () => {
      eqIn.value = '';
      eqIn.focus();
    });
    btns.appendChild(clr);
  }

  function normEq(raw) {
    return String(raw || '')
      .replace(/[０-９．]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
      .replace(/\s+/g, '')
      .replace(/\*/g, '×')
      .replace(/\//g, '÷')
      .replace(/＝.*/, '');
  }

  function checkAnswer() {
    if (!state.step1Done || state.step2Done) return;
    const p = state.problem;
    const eqNorm = normEq(el('qm-eq-in').value);
    const ansRaw = String(el('qm-ans-in').value || '')
      .replace(/[０-９．]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
      .trim();
    const ansNum = Number(ansRaw);

    const eqOk = p.validEqs.includes(eqNorm);
    const ansOk = ansRaw !== '' && Number.isFinite(ansNum) && Math.abs(ansNum - p.answer) < 1e-5;

    if (eqOk && ansOk) {
      state.step2Done = true;
      if (typeof game !== 'undefined' && game.data) {
        game.data.quizSolved = (game.data.quizSolved || 0) + 1;
      }
      if (!state.hadMistake) {
        showFb('qm-ans-fb', 'ok', `⭕ ノーミス正解！（${p.validEqs[0]} ＝ ${p.answer}${p.unit}）ゲームにもどります！`);
        setTimeout(() => {
          el('quiz-modal').classList.add('hidden');
          resumeWithCountdown();
        }, 950);
      } else {
        showFb('qm-ans-fb', 'warn', `できた！（${p.validEqs[0]} ＝ ${p.answer}${p.unit}）途中でまちがえたので、もう1問チャレンジ！`);
        setTimeout(() => {
          state.isPenaltyRound = true;
          loadQuizProblem(generateProblem());
        }, 1250);
      }
      return;
    }

    state.hadMistake = true;
    renderStatus();

    let msg = '';
    if (!eqOk) msg += '式がちがうよ（図の「もと」「くらべる」「割合」を見てみよう）。';
    if (!ansOk) msg += (msg ? '<br>' : '') + '答えの計算をもういちど確かめよう。';
    msg += '<br>（※まちがえたので、この問題を解いたあと「もう1問」出ます）';
    showFb('qm-ans-fb', 'ng', msg);
  }

  function resumeWithCountdown() {
    game.data.quizPaused = false;
    game.data.resuming = true;
    game.resetBirdAfterQuiz();

    const ov = el('resume-overlay');
    const numEl = el('resume-num');
    let count = 3;
    numEl.textContent = String(count);
    ov.classList.remove('hidden');

    const cdTimer = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(cdTimer);
        ov.classList.add('hidden');
        game.data.resuming = false;
        game.resetBirdAfterQuiz();
        rebindGameControlsAfterQuiz();
        state.remainingMs = QUIZ_INTERVAL_MS;
        state.lastTick = Date.now();
        updateHud();
        return;
      }
      numEl.textContent = String(count);
    }, 650);
  }

  function bindUi() {
    if (state.initialized) return;
    state.initialized = true;

    document.querySelectorAll('.qm-slot').forEach((slotEl) => {
      const slot = slotEl.dataset.slot;
      slotEl.addEventListener('click', () => {
        if (state.step1Done) return;
        if (state.placed[slot]) {
          state.placed[slot] = null;
          state.activeSlot = slot;
          el('qm-diag-fb').classList.add('hidden');
          renderBoard();
        } else {
          state.activeSlot = slot;
          renderBoard();
        }
      });
    });

    el('qm-hint-btn').addEventListener('click', () => {
      state.hintOpen = !state.hintOpen;
      renderQuestion();
    });

    el('qm-swap-btn').addEventListener('click', () => {
      if (state.step1Done) return;
      [state.placed.baseLabel, state.placed.comparedLabel] = [state.placed.comparedLabel, state.placed.baseLabel];
      [state.placed.baseVal, state.placed.comparedVal] = [state.placed.comparedVal, state.placed.baseVal];
      el('qm-diag-fb').classList.add('hidden');
      renderBoard();
    });

    el('qm-reset-btn').addEventListener('click', () => {
      if (state.step1Done) return;
      state.placed = { baseLabel: null, baseVal: null, ratioVal: null, comparedLabel: null, comparedVal: null };
      state.activeSlot = 'baseLabel';
      el('qm-diag-fb').classList.add('hidden');
      renderBoard();
    });

    el('qm-check-diag').addEventListener('click', checkDiagram);
    el('qm-check-ans').addEventListener('click', checkAnswer);
    el('qm-ans-in').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkAnswer();
    });
    el('quiz-modal').addEventListener('mousedown', (e) => e.stopPropagation());
    el('quiz-modal').addEventListener('touchstart', (e) => e.stopPropagation());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindUi);
  } else {
    bindUi();
  }

  global.BirdQuiz = {
    showHud,
    startSession,
    stopSession,
    openQuiz, // デバッグ・確認用にも利用可
  };
})(window);
