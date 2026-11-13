/**
 * 文章題から関係図を組み立てるインタラクティブ練習モジュール
 */
(function (global) {
  'use strict';

  const STORAGE_STATS_KEY = 'kankeizu_practice_stats_v1';

  const SLOTS = ['baseLabel', 'baseVal', 'ratioVal', 'comparedLabel', 'comparedVal'];

  const state = {
    category: 'all',
    queue: [],
    index: 0,
    currentProblem: null,
    cards: [], // { id, text }
    placed: {
      baseLabel: null,
      baseVal: null,
      ratioVal: null,
      comparedLabel: null,
      comparedVal: null,
    },
    selectedCardId: null,
    activeSlot: null,
    step1Done: false,
    step2Done: false,
    hintOpen: false,
    stats: { solved: 0, streak: 0 },
  };

  function loadStats() {
    try {
      const raw = localStorage.getItem(STORAGE_STATS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state.stats.solved = Number(parsed.solved) || 0;
        state.stats.streak = Number(parsed.streak) || 0;
      }
    } catch (_) {}
  }

  function saveStats() {
    try {
      localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(state.stats));
    } catch (_) {}
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildQueue(category) {
    state.category = category;
    if (category === 'generated') {
      state.queue = [global.KankeizuProblems.generateRandomProblem()];
      state.index = 0;
      return;
    }
    const all = global.KankeizuProblems.PRACTICE_PROBLEMS;
    state.queue = category === 'all' ? all.slice() : all.filter((p) => p.category === category);
    state.index = 0;
  }

  function loadProblem(problem) {
    state.currentProblem = problem;
    state.placed = {
      baseLabel: null,
      baseVal: null,
      ratioVal: null,
      comparedLabel: null,
      comparedVal: null,
    };
    state.selectedCardId = null;
    state.activeSlot = 'baseLabel';
    state.step1Done = false;
    state.step2Done = false;
    state.hintOpen = false;

    const rawCards = [
      { id: 'c_baseLabel', text: problem.baseLabel },
      { id: 'c_baseVal', text: problem.baseVal },
      { id: 'c_ratioVal', text: problem.ratioVal },
      { id: 'c_comparedLabel', text: problem.comparedLabel },
      { id: 'c_comparedVal', text: problem.comparedVal },
    ];
    state.cards = shuffle(rawCards);
    renderAll();
  }

  function startCustomProblem(problem) {
    if (!problem) return;
    state.category = 'custom';
    state.queue = [problem];
    state.index = 0;
    document.querySelectorAll('.pill-btn').forEach((b) => b.classList.remove('active'));
    loadProblem(problem);
  }

  function nextProblem() {
    if (state.category === 'generated') {
      state.queue = [global.KankeizuProblems.generateRandomProblem()];
      state.index = 0;
      loadProblem(state.queue[0]);
      return;
    }
    if (state.category === 'custom') {
      buildQueue('all');
      document.querySelectorAll('.pill-btn').forEach((b) => {
        b.classList.toggle('active', b.dataset.cat === 'all');
      });
    } else {
      state.index = (state.index + 1) % state.queue.length;
    }
    loadProblem(state.queue[state.index]);
  }

  function renderQuestionText() {
    const box = document.getElementById('p-question-box');
    const p = state.currentProblem;
    if (!p) return;

    box.innerHTML = '';
    p.textParts.forEach((part) => {
      if (part.role && state.hintOpen) {
        const span = document.createElement('span');
        span.className =
          part.role === 'base' ? 'hl-base' : part.role === 'compared' ? 'hl-compared' : 'hl-ratio';
        span.textContent = part.t;
        box.appendChild(span);
      } else {
        box.appendChild(document.createTextNode(part.t));
      }
    });

    const hintBox = document.getElementById('p-hint-box');
    if (state.hintOpen) {
      hintBox.textContent = '💡 ' + p.hint;
      hintBox.classList.remove('hidden');
    } else {
      hintBox.classList.add('hidden');
    }
  }

  function getSlotPlaceholder(slotName) {
    switch (slotName) {
      case 'baseLabel': return '左の箱のなまえ';
      case 'baseVal': return '数量（または□）';
      case 'ratioVal': return '何倍？（または□倍）';
      case 'comparedLabel': return '右の箱のなまえ';
      case 'comparedVal': return '数量（または□）';
      default: return '';
    }
  }

  function renderBoard() {
    const usedIds = new Set(Object.values(state.placed).filter(Boolean));

    // Render slots
    SLOTS.forEach((slotName) => {
      const slotEl = document.querySelector(`.drop-slot[data-slot="${slotName}"]`);
      if (!slotEl) return;
      slotEl.classList.toggle('active-target', state.activeSlot === slotName && !state.step1Done);
      slotEl.classList.remove('slot-correct', 'slot-wrong');

      const cardId = state.placed[slotName];
      slotEl.innerHTML = '';
      if (cardId) {
        const card = state.cards.find((c) => c.id === cardId);
        if (card) {
          const chip = document.createElement('span');
          chip.className = 'placed-chip';
          chip.textContent = card.text;
          if (!state.step1Done) {
            const x = document.createElement('span');
            x.className = 'remove-x';
            x.textContent = '✕';
            chip.appendChild(x);
          }
          slotEl.appendChild(chip);
        }
      } else {
        const ph = document.createElement('span');
        ph.className = 'slot-placeholder';
        ph.textContent = getSlotPlaceholder(slotName);
        slotEl.appendChild(ph);
      }
    });

    // Render tray
    const tray = document.getElementById('p-card-tray');
    tray.innerHTML = '';
    state.cards.forEach((card) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tray-card';
      btn.textContent = card.text;
      btn.draggable = !usedIds.has(card.id) && !state.step1Done;
      btn.dataset.cardId = card.id;
      if (usedIds.has(card.id)) btn.classList.add('used');
      if (state.selectedCardId === card.id) btn.classList.add('selected-card');

      btn.addEventListener('click', () => onCardClick(card.id));
      btn.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.id);
        state.selectedCardId = card.id;
      });
      tray.appendChild(btn);
    });
  }

  function advanceActiveSlot() {
    const nextEmpty = SLOTS.find((s) => !state.placed[s]);
    state.activeSlot = nextEmpty || null;
  }

  function placeCard(slotName, cardId) {
    if (state.step1Done) return;
    // Remove card from any previous slot
    SLOTS.forEach((s) => {
      if (state.placed[s] === cardId) state.placed[s] = null;
    });
    state.placed[slotName] = cardId;
    state.selectedCardId = null;
    advanceActiveSlot();
    hideFeedback('p-diagram-feedback');
    renderBoard();
  }

  function onCardClick(cardId) {
    if (state.step1Done) return;
    if (state.activeSlot) {
      placeCard(state.activeSlot, cardId);
      return;
    }
    state.selectedCardId = state.selectedCardId === cardId ? null : cardId;
    renderBoard();
  }

  function onSlotClick(slotName) {
    if (state.step1Done) return;
    if (state.selectedCardId) {
      placeCard(slotName, state.selectedCardId);
      return;
    }
    if (state.placed[slotName]) {
      // Return card to tray & select this slot
      state.placed[slotName] = null;
      state.activeSlot = slotName;
      hideFeedback('p-diagram-feedback');
      renderBoard();
      return;
    }
    state.activeSlot = slotName;
    renderBoard();
  }

  function swapLeftRight() {
    if (state.step1Done) return;
    const tmpLabel = state.placed.baseLabel;
    const tmpVal = state.placed.baseVal;
    state.placed.baseLabel = state.placed.comparedLabel;
    state.placed.baseVal = state.placed.comparedVal;
    state.placed.comparedLabel = tmpLabel;
    state.placed.comparedVal = tmpVal;
    hideFeedback('p-diagram-feedback');
    renderBoard();
  }

  function hideFeedback(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  }

  function showFeedback(id, ok, html) {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = 'feedback-box ' + (ok ? 'feedback-ok' : 'feedback-ng');
    el.innerHTML = html;
    el.classList.remove('hidden');
  }

  function checkDiagram() {
    const p = state.currentProblem;
    if (!p) return;

    const missing = SLOTS.filter((s) => !state.placed[s]);
    if (missing.length > 0) {
      showFeedback('p-diagram-feedback', false, 'まだ空いている場所があるよ！5つの場所すべてにカードを置こう。');
      return;
    }

    const expected = {
      baseLabel: p.baseLabel,
      baseVal: p.baseVal,
      ratioVal: p.ratioVal,
      comparedLabel: p.comparedLabel,
      comparedVal: p.comparedVal,
    };

    const actual = {};
    let allCorrect = true;
    SLOTS.forEach((s) => {
      const card = state.cards.find((c) => c.id === state.placed[s]);
      actual[s] = card ? card.text : '';
      const slotEl = document.querySelector(`.drop-slot[data-slot="${s}"]`);
      const isOk = actual[s] === expected[s];
      if (!isOk) allCorrect = false;
      if (slotEl) {
        slotEl.classList.toggle('slot-correct', isOk);
        slotEl.classList.toggle('slot-wrong', !isOk);
      }
    });

    if (allCorrect) {
      state.step1Done = true;
      showFeedback(
        'p-diagram-feedback',
        true,
        `🎉 大正解！バッチリ関係図が組み立てられたね！（もとにする量：「${p.baseLabel}」 → くらべる量：「${p.comparedLabel}」）<br>下の「ステップ2」で式と答えを求めよう！`
      );
      unlockStep2();
      renderBoard();
      return;
    }

    // Specific pedagogical diagnosis
    let advice = 'おしい！赤いワクの場所をもういちど見直してみよう。';
    if (actual.baseLabel === expected.comparedLabel && actual.comparedLabel === expected.baseLabel) {
      advice = `おしい！<strong>「もとにする量（左）」と「くらべる量（右）」が反対</strong>になっているよ！<br>問題文の「〜の何倍」の『の』の前（<strong>${p.baseLabel}</strong>）が左の箱（もとにする量）だよ。「⇄ 左右をいれかえる」ボタンも使えるよ！`;
    } else if (actual.ratioVal !== expected.ratioVal) {
      advice = `矢印の上には「<strong>何倍か（割合）</strong>」が入るよ！（例：<code>${p.ratioVal}</code>）`;
    } else if (actual.baseVal === expected.comparedVal && actual.comparedVal === expected.baseVal) {
      advice = `箱のなまえは合っているけれど、下の<strong>数量（と□）が左右反対</strong>になっているよ！`;
    }

    state.stats.streak = 0;
    saveStats();
    renderStats();
    showFeedback('p-diagram-feedback', false, advice);
  }

  function unlockStep2() {
    const p = state.currentProblem;
    const step2 = document.getElementById('practice-step-2');
    step2.classList.remove('step-locked');

    // Render SVG diagram + segment diagram preview
    const auxHost = document.getElementById('p-aux-preview');
    const stripUnit = (s) => s.replace(/[^\d.□]/g, '') || s;
    const diagState = {
      theme: 'textbook',
      showRoles: true,
      auxDiagram: 'segment',
      enableSecond: false,
      primary: {
        title: '',
        baseLabel: p.baseLabel,
        baseVal: p.unknownTarget === 'base' ? '□' : String(p.baseNum),
        baseUnit: p.unknownTarget === 'ratio' ? p.baseVal.replace(/[\d.]/g, '') : p.unit,
        baseUnknown: p.unknownTarget === 'base',
        ratioVal: p.unknownTarget === 'ratio' ? '□' : String(p.ratioNum),
        ratioUnknown: p.unknownTarget === 'ratio',
        ratioStyle: 'bai',
        showReturnArrow: p.unknownTarget === 'base',
        comparedLabel: p.comparedLabel,
        comparedVal: p.unknownTarget === 'compared' ? '□' : String(p.comparedNum),
        comparedUnit: p.unknownTarget === 'ratio' ? p.comparedVal.replace(/[\d.]/g, '') : p.unit,
        comparedUnknown: p.unknownTarget === 'compared',
      },
    };
    auxHost.innerHTML = global.KankeizuDiagram.buildSvgString(diagState);

    // Quick-entry buttons for equation
    const quick = document.getElementById('eq-quick-btns');
    quick.innerHTML = '';
    const eqInput = document.getElementById('in-p-eq');
    const ansInput = document.getElementById('in-p-ans');
    eqInput.value = '';
    ansInput.value = '';
    document.getElementById('p-ans-unit').textContent = p.unit;

    const nums = [];
    if (p.unknownTarget !== 'base') nums.push(String(p.baseNum));
    if (p.unknownTarget !== 'compared') nums.push(String(p.comparedNum));
    if (p.unknownTarget !== 'ratio') nums.push(String(p.ratioNum));

    const tokens = [...nums, '×', '÷'];
    tokens.forEach((tok) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mini-btn';
      b.textContent = tok;
      b.addEventListener('click', () => {
        eqInput.value += tok;
        eqInput.focus();
      });
      quick.appendChild(b);
    });
    const clr = document.createElement('button');
    clr.type = 'button';
    clr.className = 'mini-btn';
    clr.textContent = 'クリア';
    clr.addEventListener('click', () => {
      eqInput.value = '';
      eqInput.focus();
    });
    quick.appendChild(clr);
  }

  function normalizeEquation(raw) {
    return String(raw || '')
      .replace(/[０-９．]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
      .replace(/\s+/g, '')
      .replace(/\*/g, '×')
      .replace(/\//g, '÷')
      .replace(/＝.*/, ''); // =以降を書いてもOKにする
  }

  function checkAnswer() {
    if (!state.step1Done || state.step2Done) return;
    const p = state.currentProblem;
    const eqNorm = normalizeEquation(document.getElementById('in-p-eq').value);
    const ansRaw = String(document.getElementById('in-p-ans').value || '')
      .replace(/[０-９．]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
      .trim();
    const ansNum = Number(ansRaw);

    const eqOk = p.validEqs.includes(eqNorm);
    const ansOk = ansRaw !== '' && Number.isFinite(ansNum) && Math.abs(ansNum - p.answer) < 1e-5;

    if (eqOk && ansOk) {
      state.step2Done = true;
      state.stats.solved += 1;
      state.stats.streak += 1;
      saveStats();
      renderStats();
      showFeedback(
        'p-answer-feedback',
        true,
        `🌟 パーフェクト！ 式 <code>${p.validEqs[0]}</code>、答え <strong>${p.answer}${p.unit}</strong> で大正解！ <button type="button" id="btn-inline-next" class="mini-btn" style="margin-left:8px;">次の問題へ ➔</button>`
      );
      const inlineNext = document.getElementById('btn-inline-next');
      if (inlineNext) inlineNext.addEventListener('click', nextProblem);
      return;
    }

    let msg = '';
    if (!eqOk) {
      if (p.unknownTarget === 'ratio') {
        msg += '💡 割合を求めるときは「<strong>くらべる量 ÷ もとにする量</strong>」だよ。<br>';
      } else if (p.unknownTarget === 'compared') {
        msg += '💡 くらべる量を求めるときは「<strong>もとにする量 × 割合</strong>」だよ。<br>';
      } else {
        msg += `💡 <code>□ × ${p.ratioNum} ＝ ${p.comparedNum}</code> だから、<code>□ ＝ ${p.comparedNum} ÷ ${p.ratioNum}</code> で求められるよ。<br>`;
      }
    }
    if (!ansOk) {
      msg += '🔢 答えの計算をもういちどたしかめてみよう（小数点の位置に気をつけてね）。';
    }
    state.stats.streak = 0;
    saveStats();
    renderStats();
    showFeedback('p-answer-feedback', false, msg);
  }

  function renderStats() {
    document.getElementById('stat-solved').textContent = state.stats.solved;
    document.getElementById('stat-streak').textContent = state.stats.streak;
  }

  function renderAll() {
    const p = state.currentProblem;
    if (!p) return;
    document.getElementById('p-badge').textContent = p.levelLabel;
    document.getElementById('p-counter').textContent =
      state.category === 'generated'
        ? '無限モード'
        : `問題 ${state.index + 1} / ${state.queue.length}`;

    renderQuestionText();
    renderBoard();
    renderStats();

    hideFeedback('p-diagram-feedback');
    hideFeedback('p-answer-feedback');
    const step2 = document.getElementById('practice-step-2');
    if (!state.step1Done) {
      step2.classList.add('step-locked');
      document.getElementById('p-aux-preview').innerHTML = '';
    }
  }

  function init() {
    loadStats();
    buildQueue('all');

    // Category filter buttons
    document.querySelectorAll('.pill-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pill-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        buildQueue(btn.dataset.cat);
        loadProblem(state.queue[0]);
      });
    });

    // Drop slots setup (click + drag/drop)
    document.querySelectorAll('.drop-slot').forEach((slotEl) => {
      const slotName = slotEl.dataset.slot;
      slotEl.addEventListener('click', () => onSlotClick(slotName));
      slotEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSlotClick(slotName);
        }
      });
      slotEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        slotEl.classList.add('drag-over');
      });
      slotEl.addEventListener('dragleave', () => {
        slotEl.classList.remove('drag-over');
      });
      slotEl.addEventListener('drop', (e) => {
        e.preventDefault();
        slotEl.classList.remove('drag-over');
        const cardId = e.dataTransfer.getData('text/plain');
        if (cardId) placeCard(slotName, cardId);
      });
    });

    document.getElementById('btn-p-hint').addEventListener('click', () => {
      state.hintOpen = !state.hintOpen;
      renderQuestionText();
    });
    document.getElementById('btn-p-skip').addEventListener('click', nextProblem);
    document.getElementById('btn-p-swap').addEventListener('click', swapLeftRight);
    document.getElementById('btn-p-reset').addEventListener('click', () => {
      if (state.currentProblem) loadProblem(state.currentProblem);
    });
    document.getElementById('btn-check-diagram').addEventListener('click', checkDiagram);
    document.getElementById('btn-check-answer').addEventListener('click', checkAnswer);

    loadProblem(state.queue[0]);
  }

  global.KankeizuPractice = {
    init,
    startCustomProblem,
  };
})(window);
