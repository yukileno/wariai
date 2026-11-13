/**
 * アプリ全体の統合・エディタ状態管理・保存＆書き出し機能
 */
(function (global) {
  'use strict';

  const STORAGE_SAVED_KEY = 'kankeizu_saved_diagrams_v1';

  const editorState = {
    pattern: 'ratio',
    problemText: 'ダンスクラブの定員は10人ですが、希望者は15人いました。希望者は定員の何倍ですか。',
    auxDiagram: 'segment',
    theme: 'textbook',
    showRoles: true,
    showFormula: true,
    hideAnswer: false,
    transparentBg: false,
    enableSecond: false,
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
    second: {
      title: '料理クラブ',
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
  };

  let savedItems = [];
  let toastTimer = null;

  function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 2800);
  }

  function loadSavedItems() {
    try {
      const raw = localStorage.getItem(STORAGE_SAVED_KEY);
      savedItems = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(savedItems)) savedItems = [];
    } catch (_) {
      savedItems = [];
    }
    updateSavedBadge();
  }

  function persistSavedItems() {
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(savedItems));
    } catch (_) {}
    updateSavedBadge();
  }

  function updateSavedBadge() {
    const badge = document.getElementById('saved-count-badge');
    if (badge) badge.textContent = savedItems.length;
  }

  function syncInputsFromState() {
    const p = editorState.primary;
    const s = editorState.second;

    document.querySelectorAll('.type-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.pattern === editorState.pattern);
    });

    document.getElementById('in-base-label').value = p.baseLabel;
    document.getElementById('in-base-val').value = p.baseUnknown ? '□' : p.baseVal;
    document.getElementById('in-base-val').disabled = p.baseUnknown;
    document.getElementById('in-base-unit').value = p.baseUnit;
    document.getElementById('in-base-unknown').checked = p.baseUnknown;

    document.getElementById('in-ratio-val').value = p.ratioUnknown ? '□' : p.ratioVal;
    document.getElementById('in-ratio-val').disabled = p.ratioUnknown;
    document.getElementById('in-ratio-style').value = p.ratioStyle;
    document.getElementById('in-ratio-unknown').checked = p.ratioUnknown;
    document.getElementById('opt-return-arrow').checked = p.showReturnArrow;

    document.getElementById('in-compared-label').value = p.comparedLabel;
    document.getElementById('in-compared-val').value = p.comparedUnknown ? '□' : p.comparedVal;
    document.getElementById('in-compared-val').disabled = p.comparedUnknown;
    document.getElementById('in-compared-unit').value = p.comparedUnit;
    document.getElementById('in-compared-unknown').checked = p.comparedUnknown;

    document.getElementById('opt-second-diagram').checked = editorState.enableSecond;
    document.getElementById('second-diagram-fields').classList.toggle('hidden', !editorState.enableSecond);
    document.getElementById('in1-title').value = p.title || '';
    document.getElementById('in2-title').value = s.title || '';
    document.getElementById('in2-base-label').value = s.baseLabel;
    document.getElementById('in2-base-val').value = s.baseVal;
    document.getElementById('in2-ratio-val').value = s.ratioVal;
    document.getElementById('in2-compared-label').value = s.comparedLabel;
    document.getElementById('in2-compared-val').value = s.comparedVal;
    document.getElementById('in2-unit').value = s.baseUnit || '';

    document.getElementById('in-problem-text').value = editorState.problemText || '';
    document.getElementById('opt-aux-diagram').value = editorState.auxDiagram;
    document.getElementById('opt-theme').value = editorState.theme;
    document.getElementById('opt-show-roles').checked = editorState.showRoles;
    document.getElementById('opt-show-formula').checked = editorState.showFormula;
    document.getElementById('opt-hide-answer').checked = editorState.hideAnswer;
    document.getElementById('opt-transparent-bg').checked = editorState.transparentBg;
  }

  function readStateFromInputs() {
    const p = editorState.primary;
    const s = editorState.second;

    p.baseUnknown = document.getElementById('in-base-unknown').checked;
    p.ratioUnknown = document.getElementById('in-ratio-unknown').checked;
    p.comparedUnknown = document.getElementById('in-compared-unknown').checked;

    p.baseLabel = document.getElementById('in-base-label').value;
    if (!p.baseUnknown) p.baseVal = document.getElementById('in-base-val').value;
    p.baseUnit = document.getElementById('in-base-unit').value;

    if (!p.ratioUnknown) p.ratioVal = document.getElementById('in-ratio-val').value;
    p.ratioStyle = document.getElementById('in-ratio-style').value;
    p.showReturnArrow = document.getElementById('opt-return-arrow').checked;

    p.comparedLabel = document.getElementById('in-compared-label').value;
    if (!p.comparedUnknown) p.comparedVal = document.getElementById('in-compared-val').value;
    p.comparedUnit = document.getElementById('in-compared-unit').value;

    editorState.enableSecond = document.getElementById('opt-second-diagram').checked;
    p.title = editorState.enableSecond ? document.getElementById('in1-title').value : '';

    s.title = document.getElementById('in2-title').value;
    s.baseLabel = document.getElementById('in2-base-label').value;
    s.baseVal = document.getElementById('in2-base-val').value;
    s.baseUnknown = s.baseVal.trim() === '□';
    s.ratioVal = document.getElementById('in2-ratio-val').value;
    s.ratioUnknown = s.ratioVal.trim() === '□';
    s.comparedLabel = document.getElementById('in2-compared-label').value;
    s.comparedVal = document.getElementById('in2-compared-val').value;
    s.comparedUnknown = s.comparedVal.trim() === '□';
    const u2 = document.getElementById('in2-unit').value;
    s.baseUnit = u2;
    s.comparedUnit = u2;
    s.ratioStyle = p.ratioStyle;
    s.showReturnArrow = p.showReturnArrow;

    editorState.problemText = document.getElementById('in-problem-text').value;
    editorState.auxDiagram = document.getElementById('opt-aux-diagram').value;
    editorState.theme = document.getElementById('opt-theme').value;
    editorState.showRoles = document.getElementById('opt-show-roles').checked;
    editorState.showFormula = document.getElementById('opt-show-formula').checked;
    editorState.hideAnswer = document.getElementById('opt-hide-answer').checked;
    editorState.transparentBg = document.getElementById('opt-transparent-bg').checked;
  }

  function renderPreview() {
    // Problem text box
    const probBox = document.getElementById('preview-problem-box');
    const txt = (editorState.problemText || '').trim();
    if (txt) {
      probBox.textContent = txt;
      probBox.classList.remove('hidden');
    } else {
      probBox.classList.add('hidden');
    }

    // Main SVG
    const host = document.getElementById('diagram-svg-host');
    host.innerHTML = global.KankeizuDiagram.buildSvgString(editorState);

    // Clickable SVG regions jump to corresponding input box
    host.querySelectorAll('[data-clickable]').forEach((el) => {
      el.addEventListener('click', () => {
        const target = el.getAttribute('data-clickable');
        const box = document.querySelector(`.input-box[data-focus-target="${target}"]`);
        if (box) {
          box.scrollIntoView({ behavior: 'smooth', block: 'center' });
          box.classList.remove('flash-focus');
          void box.offsetWidth;
          box.classList.add('flash-focus');
          const firstInput = box.querySelector('input[type="text"]:not(:disabled)');
          if (firstInput) firstInput.focus();
        }
      });
    });

    // Formula card
    const fCard = document.getElementById('formula-card');
    if (!editorState.showFormula) {
      fCard.classList.add('hidden');
      return;
    }
    fCard.classList.remove('hidden');
    const info = global.KankeizuDiagram.computeFormulaInfo(editorState.primary, editorState.hideAnswer);
    fCard.innerHTML = `
      <div class="formula-title">考え方・式と答え</div>
      <div class="formula-main">
        <span>${info.formulaText}</span>
        ${info.answerText ? `<span>${info.answerText}</span>` : ''}
      </div>
      ${info.subText ? `<div class="formula-sub">${info.subText}</div>` : ''}
    `;
  }

  function applyPattern(pattern) {
    editorState.pattern = pattern;
    const p = editorState.primary;
    if (pattern === 'ratio') {
      p.baseUnknown = false;
      p.ratioUnknown = true;
      p.comparedUnknown = false;
      p.showReturnArrow = false;
      if (!p.baseVal || p.baseVal === '□') p.baseVal = '10';
      if (!p.comparedVal || p.comparedVal === '□') p.comparedVal = '15';
    } else if (pattern === 'compared') {
      p.baseUnknown = false;
      p.ratioUnknown = false;
      p.comparedUnknown = true;
      p.showReturnArrow = false;
      if (!p.baseVal || p.baseVal === '□') p.baseVal = '200';
      if (!p.ratioVal || p.ratioVal === '□') p.ratioVal = '0.35';
    } else if (pattern === 'base') {
      p.baseUnknown = true;
      p.ratioUnknown = false;
      p.comparedUnknown = false;
      p.showReturnArrow = true;
      if (!p.ratioVal || p.ratioVal === '□') p.ratioVal = '1.6';
      if (!p.comparedVal || p.comparedVal === '□') p.comparedVal = '24';
    }
    syncInputsFromState();
    renderPreview();
  }

  function applyPreset(presetKey) {
    const preset = global.KankeizuProblems.PRESETS[presetKey];
    if (!preset) return;
    editorState.pattern = preset.pattern;
    editorState.problemText = preset.problemText || '';
    editorState.enableSecond = Boolean(preset.enableSecond);
    editorState.auxDiagram = preset.auxDiagram || 'segment';
    editorState.primary = JSON.parse(JSON.stringify(preset.primary));
    if (preset.second) {
      editorState.second = JSON.parse(JSON.stringify(preset.second));
    }
    syncInputsFromState();
    renderPreview();
    showToast('テンプレートを読みこみました');
  }

  function switchView(viewName) {
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn[data-view]').forEach((b) => {
      b.classList.toggle('active', b.dataset.view === viewName);
    });
    const target = document.getElementById('view-' + viewName);
    if (target) target.classList.add('active');
    if (viewName === 'saved') renderSavedGrid();
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleExportPng() {
    const svg = document.querySelector('#diagram-svg-host svg');
    if (!svg) return;
    try {
      const blob = await global.KankeizuDiagram.svgToPngBlob(svg, {
        scale: 2.5,
        transparent: editorState.transparentBg,
      });
      downloadBlob(blob, `kankeizu_${Date.now()}.png`);
      showToast('PNG画像を保存しました！');
    } catch (e) {
      showToast('PNGの保存に失敗しました: ' + e.message);
    }
  }

  async function handleCopyImage() {
    const svg = document.querySelector('#diagram-svg-host svg');
    if (!svg) return;
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
      showToast('このブラウザ環境ではクリップボードコピーに未対応です。「PNGで保存」をご利用ください。');
      return;
    }
    try {
      const blob = await global.KankeizuDiagram.svgToPngBlob(svg, {
        scale: 2.5,
        transparent: editorState.transparentBg,
      });
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      showToast('関係図をクリップボードにコピーしました！スライド等に貼り付けできます');
    } catch (_) {
      showToast('コピーできませんでした（ローカルファイル環境では「PNGで保存」が確実です）');
    }
  }

  function handleExportSvg() {
    const svg = document.querySelector('#diagram-svg-host svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const str = serializer.serializeToString(svg);
    const blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, `kankeizu_${Date.now()}.svg`);
    showToast('SVGファイルを保存しました！');
  }

  function handleSaveLocal() {
    const snapshot = JSON.parse(JSON.stringify(editorState));
    const p = snapshot.primary;
    const title = `${p.baseLabel || 'もと'}(${p.baseUnknown ? '□' : p.baseVal}${p.baseUnit}) → ${p.comparedLabel || 'くらべる'}(${p.comparedUnknown ? '□' : p.comparedVal}${p.comparedUnit})`;
    savedItems.unshift({
      id: 'sv-' + Date.now(),
      title,
      createdAt: new Date().toLocaleString('ja-JP'),
      state: snapshot,
    });
    persistSavedItems();
    showToast('「保存した図」に保存しました！');
  }

  function renderSavedGrid() {
    const grid = document.getElementById('saved-grid');
    grid.innerHTML = '';
    if (savedItems.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <p>まだ保存された関係図がありません。</p>
          <p>「関係図をつくる」画面の「💾 この図を保存」ボタンから追加できます。</p>
        </div>
      `;
      return;
    }

    savedItems.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'saved-item';

      const thumb = document.createElement('div');
      thumb.className = 'saved-item-thumb';
      thumb.innerHTML = global.KankeizuDiagram.buildSvgString(item.state);

      const title = document.createElement('div');
      title.className = 'saved-item-title';
      title.textContent = item.title;

      const meta = document.createElement('div');
      meta.className = 'saved-item-meta';
      meta.textContent = `保存日時: ${item.createdAt}`;

      const btns = document.createElement('div');
      btns.className = 'saved-item-btns';

      const openBtn = document.createElement('button');
      openBtn.type = 'button';
      openBtn.className = 'btn-primary';
      openBtn.textContent = '開いて編集';
      openBtn.addEventListener('click', () => {
        Object.assign(editorState, JSON.parse(JSON.stringify(item.state)));
        syncInputsFromState();
        renderPreview();
        switchView('editor');
        showToast('保存した図を読みこみました');
      });

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn-secondary';
      delBtn.textContent = '削除';
      delBtn.addEventListener('click', () => {
        savedItems.splice(idx, 1);
        persistSavedItems();
        renderSavedGrid();
      });

      btns.append(openBtn, delBtn);
      card.append(thumb, title, meta, btns);
      grid.appendChild(card);
    });
  }

  function bindEvents() {
    // Navigation
    document.querySelectorAll('.nav-btn[data-view]').forEach((btn) => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // Guide modal
    const modal = document.getElementById('guide-modal');
    document.getElementById('btn-open-guide').addEventListener('click', () => modal.classList.remove('hidden'));
    document.getElementById('btn-close-guide').addEventListener('click', () => modal.classList.add('hidden'));
    modal.querySelector('.modal-backdrop').addEventListener('click', () => modal.classList.add('hidden'));

    // Pattern buttons
    document.querySelectorAll('.type-btn').forEach((btn) => {
      btn.addEventListener('click', () => applyPattern(btn.dataset.pattern));
    });

    // Preset select
    document.getElementById('preset-select').addEventListener('change', (e) => {
      if (e.target.value) applyPreset(e.target.value);
    });

    // Swap sides
    document.getElementById('btn-swap-sides').addEventListener('click', () => {
      const p = editorState.primary;
      [p.baseLabel, p.comparedLabel] = [p.comparedLabel, p.baseLabel];
      [p.baseVal, p.comparedVal] = [p.comparedVal, p.baseVal];
      [p.baseUnit, p.comparedUnit] = [p.comparedUnit, p.baseUnit];
      [p.baseUnknown, p.comparedUnknown] = [p.comparedUnknown, p.baseUnknown];
      syncInputsFromState();
      renderPreview();
    });

    // Unit chips
    document.querySelectorAll('.chip-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const u = btn.dataset.unit;
        editorState.primary.baseUnit = u;
        editorState.primary.comparedUnit = u;
        editorState.second.baseUnit = u;
        editorState.second.comparedUnit = u;
        syncInputsFromState();
        renderPreview();
      });
    });

    // All editor inputs -> live update
    const inputIds = [
      'in-base-label', 'in-base-val', 'in-base-unit', 'in-base-unknown',
      'in-ratio-val', 'in-ratio-style', 'in-ratio-unknown', 'opt-return-arrow',
      'in-compared-label', 'in-compared-val', 'in-compared-unit', 'in-compared-unknown',
      'opt-second-diagram', 'in1-title', 'in2-title', 'in2-base-label', 'in2-base-val',
      'in2-ratio-val', 'in2-compared-label', 'in2-compared-val', 'in2-unit',
      'in-problem-text', 'opt-aux-diagram', 'opt-theme', 'opt-show-roles',
      'opt-show-formula', 'opt-hide-answer', 'opt-transparent-bg',
    ];
    inputIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const evt = el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input';
      el.addEventListener(evt, () => {
        readStateFromInputs();
        // Sync disabled states for □ checkboxes
        document.getElementById('in-base-val').disabled = editorState.primary.baseUnknown;
        document.getElementById('in-ratio-val').disabled = editorState.primary.ratioUnknown;
        document.getElementById('in-compared-val').disabled = editorState.primary.comparedUnknown;
        document.getElementById('second-diagram-fields').classList.toggle('hidden', !editorState.enableSecond);
        renderPreview();
      });
    });

    // Export & Action buttons
    document.getElementById('btn-export-png').addEventListener('click', handleExportPng);
    document.getElementById('btn-copy-img').addEventListener('click', handleCopyImage);
    document.getElementById('btn-export-svg').addEventListener('click', handleExportSvg);
    document.getElementById('btn-print').addEventListener('click', () => window.print());
    document.getElementById('btn-save-local').addEventListener('click', handleSaveLocal);

    document.getElementById('btn-make-quiz').addEventListener('click', () => {
      const prob = global.KankeizuProblems.createProblemFromEditorState(editorState);
      if (!prob) {
        showToast('「もと」「割合」「くらべる」のうち1つだけを □ にして、残り2つに数値を入れるとクイズにできます！');
        return;
      }
      global.KankeizuPractice.startCustomProblem(prob);
      switchView('practice');
      showToast('作った関係図をクイズにしました！');
    });

    // JSON Export / Import for saved library
    document.getElementById('btn-export-json').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(savedItems, null, 2)], { type: 'application/json' });
      downloadBlob(blob, `kankeizu_library_${Date.now()}.json`);
      showToast('保存データをJSONで書き出しました');
    });

    document.getElementById('in-import-json').addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const imported = JSON.parse(reader.result);
          if (!Array.isArray(imported)) throw new Error('Invalid format');
          savedItems = [...imported, ...savedItems];
          persistSavedItems();
          renderSavedGrid();
          showToast(`${imported.length}件の図を読みこみました！`);
        } catch (_) {
          showToast('JSONファイルの形式が正しくありません');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });
  }

  function init() {
    loadSavedItems();
    bindEvents();
    applyPreset('club-ratio');
    global.KankeizuPractice.init();
  }

  document.addEventListener('DOMContentLoaded', init);
})(window);
