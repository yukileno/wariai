/**
 * クラムジーバード ランキング機能
 * ・初期設定不要の localStorage ランキング（即利用可能）
 * ・無料の Google Apps Script (GAS) ＋ スプレッドシート連携（?gas=URL でも自動設定）
 */
(function (global) {
  'use strict';

  const STORAGE_LOCAL_KEY = 'clumsy_wariai_ranking_v1';
  const STORAGE_NAME_KEY = 'clumsy_wariai_player_name_v1';
  const STORAGE_GAS_KEY = 'clumsy_wariai_gas_url_v1';
  const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbzlCiikCRC-T_VeCT0bHPTkw0z5JwgbsFe-uqEu5D6HUi4Ho-PafnM0qpDooMlaSfjlLQ/exec';
  const BOARD_NAME = '割合ゲーム_ランキング';
  const MAX_ITEMS = 20;

  let currentScreen = 'none';
  let submittedThisRun = false;
  let lastSavedId = null;

  function el(id) {
    return document.getElementById(id);
  }

  function getGasUrl() {
    try {
      const params = new URLSearchParams(global.location.search);
      const fromQuery = params.get('gas');
      if (fromQuery && fromQuery.startsWith('https://script.google.com/')) {
        localStorage.setItem(STORAGE_GAS_KEY, fromQuery);
        return fromQuery;
      }
      const saved = localStorage.getItem(STORAGE_GAS_KEY);
      if (saved === 'off') return '';
      return saved || DEFAULT_GAS_URL;
    } catch (_) {
      return DEFAULT_GAS_URL;
    }
  }

  function setGasUrl(url) {
    try {
      const trimmed = String(url || '').trim();
      if (trimmed) localStorage.setItem(STORAGE_GAS_KEY, trimmed);
      else localStorage.removeItem(STORAGE_GAS_KEY);
    } catch (_) {}
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_LOCAL_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_) {
      return [];
    }
  }

  function saveLocal(items) {
    try {
      localStorage.setItem(STORAGE_LOCAL_KEY, JSON.stringify(items.slice(0, 50)));
    } catch (_) {}
  }

  function sortItems(items) {
    return items.slice().sort((a, b) => {
      if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
      if ((b.quizSolved || 0) !== (a.quizSolved || 0)) return (b.quizSolved || 0) - (a.quizSolved || 0);
      return String(a.createdAt || '') < String(b.createdAt || '') ? -1 : 1;
    });
  }

  function formatDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${m}/${day} ${hh}:${mm}`;
  }

  async function fetchRanking() {
    const gasUrl = getGasUrl();
    if (!gasUrl) {
      return { mode: 'local', items: sortItems(loadLocal()).slice(0, MAX_ITEMS) };
    }
    try {
      const sep = gasUrl.includes('?') ? '&' : '?';
      const res = await fetch(`${gasUrl}${sep}board=${encodeURIComponent(BOARD_NAME)}&t=${Date.now()}`);
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.items)) {
        return { mode: 'gas', items: sortItems(data.items).slice(0, MAX_ITEMS) };
      }
      throw new Error('Invalid GAS response');
    } catch (_) {
      return { mode: 'local-fallback', items: sortItems(loadLocal()).slice(0, MAX_ITEMS) };
    }
  }

  async function submitScore(name, score, quizSolved) {
    const cleanName = String(name || '').trim().slice(0, 16) || 'ななし';
    try {
      localStorage.setItem(STORAGE_NAME_KEY, cleanName);
    } catch (_) {}

    const entry = {
      id: 'r-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      name: cleanName,
      score: Math.max(0, Math.floor(Number(score) || 0)),
      quizSolved: Math.max(0, Math.floor(Number(quizSolved) || 0)),
      createdAt: new Date().toISOString(),
    };
    lastSavedId = entry.id;

    // 常にローカルにも保存
    const localList = sortItems([...loadLocal(), entry]).slice(0, 50);
    saveLocal(localList);

    const gasUrl = getGasUrl();
    if (gasUrl) {
      try {
        const res = await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            board: BOARD_NAME,
            id: entry.id,
            name: entry.name,
            score: entry.score,
            quizSolved: entry.quizSolved,
          }),
        });
        const data = await res.json();
        if (data && data.ok && Array.isArray(data.items)) {
          const sorted = sortItems(data.items).slice(0, MAX_ITEMS);
          const idx = sorted.findIndex((x) => x.id === entry.id);
          return { mode: 'gas', rank: idx >= 0 ? idx + 1 : null, items: sorted };
        }
      } catch (_) {}
    }

    const top = localList.slice(0, MAX_ITEMS);
    const idx = top.findIndex((x) => x.id === entry.id);
    return { mode: 'local', rank: idx >= 0 ? idx + 1 : null, items: top };
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderTable(result) {
    const badge = el('rk-mode-badge');
    const tbody = el('rk-tbody');
    const resetBtn = el('rk-reset-local');

    if (result.mode === 'gas') {
      badge.textContent = '共有ランキング (Googleスプレッドシート)';
      badge.className = 'rk-mode-badge gas';
      resetBtn.classList.add('hidden');
    } else if (result.mode === 'local-fallback') {
      badge.textContent = '端末内の記録（スプレッドシート接続待ち）';
      badge.className = 'rk-mode-badge';
      resetBtn.classList.remove('hidden');
    } else {
      badge.textContent = 'この端末のランキング';
      badge.className = 'rk-mode-badge';
      resetBtn.classList.remove('hidden');
    }

    if (!result.items.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="rk-empty">まだきろくがありません。ゲームをあそんで登録しよう！</td></tr>';
      return;
    }

    tbody.innerHTML = result.items
      .map((item, idx) => {
        const rank = idx + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : String(rank);
        const isMine = lastSavedId && item.id === lastSavedId;
        return `
          <tr class="${isMine ? 'rk-mine' : ''}">
            <td class="rk-rank">${medal}</td>
            <td class="rk-name">${escapeHtml(item.name)}</td>
            <td class="rk-score">${item.score} てん</td>
            <td class="rk-quiz">${item.quizSolved || 0} 問</td>
            <td class="rk-date">${formatDate(item.createdAt)}</td>
          </tr>
        `;
      })
      .join('');
  }

  function syncGameInputLock(locked) {
    if (typeof game !== 'undefined' && game.data) {
      game.data.uiBlocking = locked;
    }
    if (typeof me === 'undefined' || !me.input) return;
    if (locked) {
      me.input.unbindKey(me.input.KEY.ENTER);
      me.input.unbindKey(me.input.KEY.SPACE);
      me.input.unbindPointer(me.input.pointer.LEFT);
    } else if (currentScreen === 'title' || currentScreen === 'gameover') {
      me.input.bindKey(me.input.KEY.ENTER, 'enter', true);
      me.input.bindKey(me.input.KEY.SPACE, 'enter', currentScreen === 'title');
      me.input.bindPointer(me.input.pointer.LEFT, me.input.KEY.ENTER);
    }
  }

  async function openModal() {
    syncGameInputLock(true);
    el('ranking-modal').classList.remove('hidden');
    el('rk-gas-in').value = getGasUrl();
    el('rk-tbody').innerHTML = '<tr><td colspan="5" class="rk-empty">よみこみ中...</td></tr>';
    const result = await fetchRanking();
    renderTable(result);
  }

  function closeModal() {
    el('ranking-modal').classList.add('hidden');
    syncGameInputLock(false);
  }

  function setScreen(screen) {
    currentScreen = screen;
    const rankBtn = el('btn-open-ranking');
    const goBar = el('gameover-submit-bar');

    if (screen === 'title') {
      rankBtn.classList.remove('hidden');
      goBar.classList.add('hidden');
    } else if (screen === 'gameover') {
      rankBtn.classList.remove('hidden');
      submittedThisRun = false;
      const steps = (typeof game !== 'undefined' && game.data) ? (game.data.steps || 0) : 0;
      const qSolved = (typeof game !== 'undefined' && game.data) ? (game.data.quizSolved || 0) : 0;
      el('go-score-summary').textContent = `${steps} てん（クイズ ${qSolved}問）`;
      try {
        el('go-name-in').value = localStorage.getItem(STORAGE_NAME_KEY) || '';
      } catch (_) {}
      el('go-submit-btn').disabled = false;
      el('go-submit-btn').textContent = '🏆 ランキングに登録';
      el('go-submit-msg').classList.add('hidden');
      goBar.classList.remove('hidden');
    } else {
      rankBtn.classList.add('hidden');
      goBar.classList.add('hidden');
      if (!el('ranking-modal').classList.contains('hidden')) {
        closeModal();
      }
    }
  }

  function stopBubble(node) {
    if (!node) return;
    ['mousedown', 'pointerdown', 'touchstart', 'click'].forEach((ev) => {
      node.addEventListener(ev, (e) => e.stopPropagation());
    });
  }

  function init() {
    const rankBtn = el('btn-open-ranking');
    const goBar = el('gameover-submit-bar');
    const modal = el('ranking-modal');

    stopBubble(rankBtn);
    stopBubble(goBar);
    stopBubble(modal);

    rankBtn.addEventListener('click', openModal);
    el('rk-close-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    el('rk-refresh-btn').addEventListener('click', async () => {
      el('rk-tbody').innerHTML = '<tr><td colspan="5" class="rk-empty">よみこみ中...</td></tr>';
      renderTable(await fetchRanking());
    });

    el('rk-toggle-gas').addEventListener('click', () => {
      el('rk-gas-panel').classList.toggle('hidden');
    });

    el('rk-save-gas').addEventListener('click', async () => {
      setGasUrl(el('rk-gas-in').value);
      el('rk-gas-panel').classList.add('hidden');
      renderTable(await fetchRanking());
    });

    el('rk-reset-local').addEventListener('click', async () => {
      if (!confirm('この端末に保存されたランキング記録をすべて消去しますか？')) return;
      saveLocal([]);
      lastSavedId = null;
      renderTable(await fetchRanking());
    });

    const nameInput = el('go-name-in');
    nameInput.addEventListener('focus', () => {
      if (typeof game !== 'undefined' && game.data) game.data.uiBlocking = true;
    });
    nameInput.addEventListener('blur', () => {
      if (typeof game !== 'undefined' && game.data && el('ranking-modal').classList.contains('hidden')) {
        game.data.uiBlocking = false;
      }
    });
    nameInput.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') el('go-submit-btn').click();
    });

    el('go-submit-btn').addEventListener('click', async () => {
      if (submittedThisRun) return;
      const btn = el('go-submit-btn');
      btn.disabled = true;
      btn.textContent = '登録中...';

      const steps = (typeof game !== 'undefined' && game.data) ? (game.data.steps || 0) : 0;
      const qSolved = (typeof game !== 'undefined' && game.data) ? (game.data.quizSolved || 0) : 0;
      const res = await submitScore(nameInput.value, steps, qSolved);

      submittedThisRun = true;
      btn.textContent = '✓ 登録ずみ';
      const msg = el('go-submit-msg');
      msg.textContent = res.rank ? `🎉 ${res.rank}位にランクイン！` : '✓ ランキングに記録しました！';
      msg.classList.remove('hidden');
    });

    el('go-to-title-btn').addEventListener('click', () => {
      if (typeof me !== 'undefined' && me.state) {
        if (typeof game !== 'undefined' && game.data) game.data.uiBlocking = false;
        me.state.change(me.state.MENU);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.BirdRanking = {
    setScreen,
    openModal,
    closeModal,
  };
})(window);
