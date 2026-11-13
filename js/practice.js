/**
 * 文章題から関係図を組み立てるトレーニングモジュール
 */
(function (global) {
  'use strict';

  const STORAGE_STATS_KEY = 'kankeizu_practice_stats_v2';
  const SLOTS = ['baseLabel', 'baseVal', 'ratioVal', 'comparedLabel', 'comparedVal'];

  const state = {
    category: 'all',
    queue: [],
    index: 0,
    currentProblem: null,
    cards: [],
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
    usedHint: false,
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

  function loadProblem(problem, keepHintPenalty = false) {
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
    if (!keepHintPenalty) {
      state.hintOpen = false;
      state.usedHint = false;
    }

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

  function nextProblem() {
    if (state.category === 'generated') {
      state.queue = [global.KankeizuProblems.generateRandomProblem()];
      state.index = 0;
      loadProblem(state.queue[0]);
      return;
    }
    state.index = (state.index + 1) % state.queue.length;
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

    const hintBtn = document.getElementById('btn-p-hint');
    hintBtn.classList.toggle('used', state.usedHint);

    const hintBox = document.getElementById('p-hint-box');
    if (state.hintOpen) {
      hintBox.innerHTML = `<div>💡 ${p.hint}</div><div class="hint-note">※ ヒントを見たため、この問題は「正解」にカウントされません</div>`;
      hintBox.classList.remove('hidden');
    } else {
      hintBox.classList.add('hidden');
    }
  }

  function getSlotPlaceholder(slotName) {
    switch (slotName) {
      case 'baseLabel': return 'なまえ';
      case 'baseVal': return '数量・□';
      case 'ratioVal': return '何倍・□倍';
      case 'comparedLabel': return 'なまえ';
      case 'comparedVal': return '数量・□';
      default: return '';
    }
  }

  function renderBoard() {
    const usedIds = new Set(Object.values(state.placed).filter(Boolean));

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
    [state.placed.baseLabel, state.placed.comparedLabel] = [state.placed.comparedLabel, state.placed.baseLabel];
    [state.placed.baseVal, state.placed.comparedVal] = [state.placed.comparedVal, state.placed.baseVal];
    hideFeedback('p-diagram-feedback');
    renderBoard();
  }

  function hideFeedback(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  }

  function showFeedback(id, kind, html) {
    const el = document.getElementById(id);
    if (!el) return;
    const cls = kind === 'ok' ? 'feedback-ok' : kind === 'warn' ? 'feedback-warn' : 'feedback-ng';
    el.className = 'feedback-box ' + cls;
    el.innerHTML = html;
    el.classList.remove('hidden');
  }

  function checkDiagram() {
    if (state.step1Done) return;
    const p = state.currentProblem;
    if (!p) return;

    const missing = SLOTS.filter((s) => !state.placed[s]);
    if (missing.length > 0) {
      showFeedback('p-diagram-feedback', 'ng', '5か所すべてにカードを置いてください。');
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
      showFeedback('p-diagram-feedback', 'ok', '⭕ 関係図OK！ステップ2へ進もう。');
      unlockStep2();
      renderBoard();
      return;
    }

    let advice = '赤い場所を見直してみよう。';
    if (actual.baseLabel === expected.comparedLabel && actual.comparedLabel === expected.baseLabel) {
      advice = `左右が反対だよ！「〜の」の前（<strong>${p.baseLabel}</strong>）が左（もとにする量）。`;
    } else if (actual.ratioVal !== expected.ratioVal) {
      advice = `矢印の上は「何倍（<code>${p.ratioVal}</code>）」だよ。`;
    } else if (actual.baseVal === expected.comparedVal && actual.comparedVal === expected.baseVal) {
      advice = '下の数量が左右反対だよ。';
    }

    state.stats.streak = 0;
    saveStats();
    renderStats();
    showFeedback('p-diagram-feedback', 'ng', advice);
  }

  function unlockStep2() {
    const p = state.currentProblem;
    const step2 = document.getElementById('practice-step-2');
    step2.classList.remove('step-locked');

    const auxHost = document.getElementById('p-aux-preview');
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

    [...nums, '×', '÷'].forEach((tok) => {
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
      .replace(/＝.*/, '');
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
      if (state.usedHint) {
        state.stats.streak = 0;
        saveStats();
        renderStats();
        showFeedback(
          'p-answer-feedback',
          'warn',
          `できた！（${p.validEqs[0]} ＝ ${p.answer}${p.unit}） ※ヒントを見たため正解になりません <button type="button" id="btn-inline-next" class="mini-btn" style="margin-left:8px;">次の問題へ ➔</button>`
        );
      } else {
        state.stats.solved += 1;
        state.stats.streak += 1;
        saveStats();
        renderStats();
        showFeedback(
          'p-answer-feedback',
          'ok',
          `⭕ 正解！（${p.validEqs[0]} ＝ ${p.answer}${p.unit}） <button type="button" id="btn-inline-next" class="mini-btn" style="margin-left:8px;">次の問題へ ➔</button>`
        );
      }
      const inlineNext = document.getElementById('btn-inline-next');
      if (inlineNext) inlineNext.addEventListener('click', nextProblem);
      return;
    }

    let msg = '';
    if (!eqOk) {
      if (p.unknownTarget === 'ratio') {
        msg += '式がちがうよ（割合 ＝ くらべる量 ÷ もとにする量）。';
      } else if (p.unknownTarget === 'compared') {
        msg += '式がちがうよ（くらべる量 ＝ もとにする量 × 割合）。';
      } else {
        msg += `式がちがうよ（□ × ${p.ratioNum} ＝ ${p.comparedNum}）。`;
      }
    }
    if (!ansOk) {
      msg += (msg ? '<br>' : '') + '答えの計算をやり直してみよう。';
    }
    state.stats.streak = 0;
    saveStats();
    renderStats();
    showFeedback('p-answer-feedback', 'ng', msg);
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

    document.querySelectorAll('.pill-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pill-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        buildQueue(btn.dataset.cat);
        loadProblem(state.queue[0]);
      });
    });

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
      state.usedHint = true;
      state.hintOpen = !state.hintOpen;
      renderQuestionText();
    });
    document.getElementById('btn-p-swap').addEventListener('click', swapLeftRight);
    document.getElementById('btn-p-reset').addEventListener('click', () => {
      if (state.currentProblem) loadProblem(state.currentProblem, true);
    });
    document.getElementById('btn-check-diagram').addEventListener('click', checkDiagram);
    document.getElementById('btn-check-answer').addEventListener('click', checkAnswer);

    loadProblem(state.queue[0]);
  }

  document.addEventListener('DOMContentLoaded', init);
})(window);
