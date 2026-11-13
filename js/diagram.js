/**
 * 関係図・線分図・テープ図 SVG レンダリングエンジン
 * 完全クライアントサイド・外部依存なし
 */
(function (global) {
  'use strict';

  const THEMES = {
    textbook: {
      baseFill: '#dcfce7',
      baseStroke: '#16a34a',
      baseText: '#14532d',
      comparedFill: '#fce7f3',
      comparedStroke: '#db2777',
      comparedText: '#831843',
      ratioColor: '#0369a1',
      ratioBg: '#e0f2fe',
      arrowColor: '#334155',
      returnArrowColor: '#64748b',
      unknownStroke: '#16a34a',
      unknownFill: '#ffffff',
      tagBg: '#ffffff',
      tagStroke: '#64748b',
      tagText: '#1e293b',
      lineColor: '#334155',
      arcColor: '#475569',
      titleBg: '#eff6ff',
      titleStroke: '#3b82f6',
      titleText: '#1e40af',
    },
    ud: {
      baseFill: '#bbf7d0',
      baseStroke: '#15803d',
      baseText: '#052e16',
      comparedFill: '#fed7aa',
      comparedStroke: '#c2410c',
      comparedText: '#431407',
      ratioColor: '#1d4ed8',
      ratioBg: '#dbeafe',
      arrowColor: '#0f172a',
      returnArrowColor: '#475569',
      unknownStroke: '#0f172a',
      unknownFill: '#ffffff',
      tagBg: '#ffffff',
      tagStroke: '#0f172a',
      tagText: '#0f172a',
      lineColor: '#0f172a',
      arcColor: '#1e293b',
      titleBg: '#f1f5f9',
      titleStroke: '#0f172a',
      titleText: '#0f172a',
    },
    mono: {
      baseFill: '#f1f5f9',
      baseStroke: '#1e293b',
      baseText: '#0f172a',
      comparedFill: '#ffffff',
      comparedStroke: '#1e293b',
      comparedText: '#0f172a',
      ratioColor: '#0f172a',
      ratioBg: '#f8fafc',
      arrowColor: '#0f172a',
      returnArrowColor: '#475569',
      unknownStroke: '#0f172a',
      unknownFill: '#ffffff',
      tagBg: '#ffffff',
      tagStroke: '#334155',
      tagText: '#0f172a',
      lineColor: '#0f172a',
      arcColor: '#334155',
      titleBg: '#f8fafc',
      titleStroke: '#334155',
      titleText: '#0f172a',
    },
  };

  const FONT_FAMILY = '"BIZ UDPGothic", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", "Meiryo", sans-serif';

  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * 文字列の表示幅（px概算）を計算（日本語全角=16px, 半角=9px）
   */
  function estimateTextWidth(str, fontSize = 16) {
    const s = String(str ?? '');
    let units = 0;
    for (const ch of s) {
      units += ch.charCodeAt(0) > 255 ? 1.0 : 0.58;
    }
    return units * fontSize;
  }

  function parseNumeric(val) {
    if (val === null || val === undefined) return NaN;
    const cleaned = String(val).replace(/[,，\s]/g, '').trim();
    if (!cleaned || cleaned === '□' || cleaned === '?') return NaN;
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : NaN;
  }

  function formatNum(n) {
    if (!Number.isFinite(n)) return '';
    const rounded = Math.round(n * 100000) / 100000;
    return String(rounded);
  }

  function formatRatioText(val, isUnknown, style) {
    const raw = isUnknown ? '□' : (String(val || '').trim() || '□');
    switch (style) {
      case 'mul-bai':
        return `× ${raw}倍`;
      case 'mul':
        return `× ${raw}`;
      case 'percent':
        if (isUnknown) return '□％';
        const num = parseNumeric(raw);
        if (Number.isFinite(num) && num <= 5 && !String(val).includes('%')) {
          return `${formatNum(num * 100)}％`;
        }
        return `${raw}％`;
      case 'raw':
        return raw;
      case 'bai':
      default:
        return `${raw}倍`;
    }
  }

  /**
   * 「□」または「数値＋単位」をきれいなSVG要素として描画（中央揃え）
   */
  function renderValueWithSquare(cx, y, val, isUnknown, unit, color, theme, fontSize = 17) {
    const u = esc(unit || '');
    const showSquare = isUnknown || String(val).trim() === '□' || String(val).trim() === '';
    if (!showSquare) {
      const text = `${esc(val)}${u}`;
      return `<text x="${cx}" y="${y}" text-anchor="middle" font-family=${JSON.stringify(FONT_FAMILY)} font-size="${fontSize}" font-weight="700" fill="${color}">${text}</text>`;
    }

    const boxSize = Math.round(fontSize * 1.25);
    const unitW = estimateTextWidth(unit || '', fontSize);
    const gap = unit ? 4 : 0;
    const totalW = boxSize + gap + unitW;
    const startX = cx - totalW / 2;
    const boxY = y - boxSize + 3;

    let svg = `<rect x="${startX}" y="${boxY}" width="${boxSize}" height="${boxSize}" rx="3" fill="${theme.unknownFill}" stroke="${theme.unknownStroke}" stroke-width="2" />`;
    if (unit) {
      svg += `<text x="${startX + boxSize + gap}" y="${y}" text-anchor="start" font-family=${JSON.stringify(FONT_FAMILY)} font-size="${fontSize}" font-weight="700" fill="${color}">${u}</text>`;
    }
    return svg;
  }

  /**
   * 割合テキスト（矢印の上）に□が含まれる場合は四角枠つきで描画
   */
  function renderRatioLabel(cx, y, val, isUnknown, style, theme) {
    const str = formatRatioText(val, isUnknown, style);
    if (!str.includes('□')) {
      return `<text x="${cx}" y="${y}" text-anchor="middle" font-family=${JSON.stringify(FONT_FAMILY)} font-size="16" font-weight="800" fill="${theme.ratioColor}">${esc(str)}</text>`;
    }
    // Split around □
    const parts = str.split('□');
    const prefix = parts[0] || '';
    const suffix = parts.slice(1).join('□');
    const fontSize = 16;
    const boxSize = 20;
    const preW = estimateTextWidth(prefix, fontSize);
    const sufW = estimateTextWidth(suffix, fontSize);
    const gap1 = prefix ? 3 : 0;
    const gap2 = suffix ? 3 : 0;
    const totalW = preW + gap1 + boxSize + gap2 + sufW;
    let curX = cx - totalW / 2;

    let svg = '';
    if (prefix) {
      svg += `<text x="${curX}" y="${y}" text-anchor="start" font-family=${JSON.stringify(FONT_FAMILY)} font-size="${fontSize}" font-weight="800" fill="${theme.ratioColor}">${esc(prefix)}</text>`;
      curX += preW + gap1;
    }
    svg += `<rect x="${curX}" y="${y - boxSize + 3}" width="${boxSize}" height="${boxSize}" rx="3" fill="${theme.unknownFill}" stroke="${theme.unknownStroke}" stroke-width="2" />`;
    curX += boxSize + gap2;
    if (suffix) {
      svg += `<text x="${curX}" y="${y}" text-anchor="start" font-family=${JSON.stringify(FONT_FAMILY)} font-size="${fontSize}" font-weight="800" fill="${theme.ratioColor}">${esc(suffix)}</text>`;
    }
    return svg;
  }

  /**
   * 役割タグ（「もとにする量」「くらべる量」「割合」）を描画
   */
  function renderRoleTag(cx, y, label, pointerDir, theme, accentStroke) {
    const w = Math.max(82, estimateTextWidth(label, 12) + 18);
    const h = 22;
    const x = cx - w / 2;
    let pointer = '';
    if (pointerDir === 'down') {
      pointer = `<polygon points="${cx - 5},${y + h} ${cx + 5},${y + h} ${cx},${y + h + 6}" fill="${theme.tagBg}" stroke="${accentStroke}" stroke-width="1.4" />
                 <line x1="${cx - 4}" y1="${y + h}" x2="${cx + 4}" y2="${y + h}" stroke="${theme.tagBg}" stroke-width="2" />`;
    } else if (pointerDir === 'up') {
      pointer = `<polygon points="${cx - 5},${y} ${cx + 5},${y} ${cx},${y - 6}" fill="${theme.tagBg}" stroke="${accentStroke}" stroke-width="1.4" />
                 <line x1="${cx - 4}" y1="${y}" x2="${cx + 4}" y2="${y}" stroke="${theme.tagBg}" stroke-width="2" />`;
    }
    return `
      <g>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${theme.tagBg}" stroke="${accentStroke}" stroke-width="1.4" />
        ${pointer}
        <text x="${cx}" y="${y + 15}" text-anchor="middle" font-family=${JSON.stringify(FONT_FAMILY)} font-size="12" font-weight="700" fill="${theme.tagText}">${esc(label)}</text>
      </g>
    `;
  }

  /**
   * 単一の関係図ブロックを描画（指定Yオフセットに配置）
   */
  function renderSingleRelationBlock(item, opts, originX, originY, blockWidth) {
    const theme = THEMES[opts.theme] || THEMES.textbook;
    const showRoles = Boolean(opts.showRoles);
    const showReturn = Boolean(item.showReturnArrow);

    const baseTextW = estimateTextWidth(item.baseLabel || 'もと', 16);
    const compTextW = estimateTextWidth(item.comparedLabel || 'くらべる', 16);
    const baseBoxW = Math.max(106, Math.min(200, baseTextW + 28));
    const compBoxW = Math.max(106, Math.min(200, compTextW + 28));
    const boxH = 38;
    const arrowLen = 112;

    const totalDiagW = baseBoxW + arrowLen + compBoxW;
    const startX = originX + (blockWidth - totalDiagW) / 2;

    let curY = originY;
    let svg = '';

    // Optional Title Pill (used in comparison mode)
    if (item.title) {
      const tw = Math.max(84, estimateTextWidth(item.title, 13) + 24);
      svg += `
        <rect x="${startX}" y="${curY}" width="${tw}" height="24" rx="12" fill="${theme.titleBg}" stroke="${theme.titleStroke}" stroke-width="1.6" />
        <text x="${startX + tw / 2}" y="${curY + 16}" text-anchor="middle" font-family=${JSON.stringify(FONT_FAMILY)} font-size="13" font-weight="800" fill="${theme.titleText}">${esc(item.title)}</text>
      `;
      curY += 32;
    }

    const baseCx = startX + baseBoxW / 2;
    const arrowStartX = startX + baseBoxW + 6;
    const arrowEndX = startX + baseBoxW + arrowLen - 6;
    const arrowCx = (arrowStartX + arrowEndX) / 2;
    const compX = startX + baseBoxW + arrowLen;
    const compCx = compX + compBoxW / 2;

    if (showRoles) {
      svg += renderRoleTag(arrowCx, curY, '割 合', 'down', theme, theme.ratioColor);
      curY += 32;
    } else {
      curY += 6;
    }

    const boxY = curY + 24;
    const arrowY = boxY + boxH / 2;

    // Ratio label above arrow
    svg += `<g data-clickable="ratio">`;
    svg += renderRatioLabel(arrowCx, boxY + 6, item.ratioVal, item.ratioUnknown, item.ratioStyle, theme);
    svg += `</g>`;

    // Left Box (もとにする量)
    svg += `
      <g data-clickable="base">
        <rect x="${startX}" y="${boxY}" width="${baseBoxW}" height="${boxH}" rx="4" fill="${theme.baseFill}" stroke="${theme.baseStroke}" stroke-width="2" />
        <text x="${baseCx}" y="${boxY + 25}" text-anchor="middle" font-family=${JSON.stringify(FONT_FAMILY)} font-size="16" font-weight="800" fill="${theme.baseText}">${esc(item.baseLabel || 'もと')}</text>
      </g>
    `;

    // Arrow (Base -> Compared)
    svg += `
      <g data-clickable="ratio">
        <line x1="${arrowStartX}" y1="${arrowY}" x2="${arrowEndX - 8}" y2="${arrowY}" stroke="${theme.arrowColor}" stroke-width="2.5" stroke-linecap="round" />
        <polygon points="${arrowEndX},${arrowY} ${arrowEndX - 10},${arrowY - 5.5} ${arrowEndX - 10},${arrowY + 5.5}" fill="${theme.arrowColor}" />
      </g>
    `;

    // Right Box (くらべる量)
    svg += `
      <g data-clickable="compared">
        <rect x="${compX}" y="${boxY}" width="${compBoxW}" height="${boxH}" rx="4" fill="${theme.comparedFill}" stroke="${theme.comparedStroke}" stroke-width="2" />
        <text x="${compCx}" y="${boxY + 25}" text-anchor="middle" font-family=${JSON.stringify(FONT_FAMILY)} font-size="16" font-weight="800" fill="${theme.comparedText}">${esc(item.comparedLabel || 'くらべる')}</text>
      </g>
    `;

    // Values beneath boxes
    const valY = boxY + boxH + 25;
    svg += `<g data-clickable="base">${renderValueWithSquare(baseCx, valY, item.baseVal, item.baseUnknown, item.baseUnit, theme.baseText, theme, 17)}</g>`;
    svg += `<g data-clickable="compared">${renderValueWithSquare(compCx, valY, item.comparedVal, item.comparedUnknown, item.comparedUnit, theme.comparedText, theme, 17)}</g>`;

    let bottomY = valY + 12;

    if (showRoles) {
      svg += renderRoleTag(baseCx, bottomY, 'もとにする量', 'up', theme, theme.baseStroke);
      svg += renderRoleTag(compCx, bottomY, 'くらべる量', 'up', theme, theme.comparedStroke);
      bottomY += 30;
    }

    if (showReturn) {
      const ry = bottomY + 4;
      const ctrlY = ry + 34;
      const rText = item.ratioUnknown ? '÷ □' : `÷ ${esc(item.ratioVal || '割合')}`;
      svg += `
        <g data-clickable="ratio">
          <path d="M ${compCx} ${ry} Q ${arrowCx} ${ctrlY} ${baseCx + 6} ${ry + 3}" fill="none" stroke="${theme.returnArrowColor}" stroke-width="1.8" stroke-dasharray="5 4" />
          <polygon points="${baseCx},${ry} ${baseCx + 10},${ry - 1} ${baseCx + 6},${ry + 8}" fill="${theme.returnArrowColor}" />
          <rect x="${arrowCx - 34}" y="${ctrlY - 19}" width="68" height="20" rx="10" fill="#ffffff" stroke="${theme.returnArrowColor}" stroke-width="1.2" />
          <text x="${arrowCx}" y="${ctrlY - 5}" text-anchor="middle" font-family=${JSON.stringify(FONT_FAMILY)} font-size="12" font-weight="700" fill="${theme.returnArrowColor}">${rText}</text>
        </g>
      `;
      bottomY = ctrlY + 14;
    }

    return { svg, height: bottomY - originY };
  }

  /**
   * 実際の数値比率を推定（線分図・テープ図用）
   */
  function resolveVisualRatio(item) {
    const r = parseNumeric(item.ratioVal);
    if (!item.ratioUnknown && Number.isFinite(r) && r > 0) return r;

    const b = parseNumeric(item.baseVal);
    const c = parseNumeric(item.comparedVal);
    if (!item.baseUnknown && !item.comparedUnknown && Number.isFinite(b) && Number.isFinite(c) && b > 0) {
      return c / b;
    }
    return 0.42; // 未知のときの標準見やすい比率
  }

  /**
   * 教科書スタイルの「線分図（アーチ型）」を描画
   */
  function renderSegmentDiagram(item, opts, originX, originY, blockWidth) {
    const theme = THEMES[opts.theme] || THEMES.textbook;
    const ratio = resolveVisualRatio(item);
    const lineW = Math.min(340, blockWidth - 40);
    const leftX = originX + (blockWidth - lineW) / 2;
    const rightX = leftX + lineW;
    const midY = originY + 62;

    const baseValStr = item.baseUnknown || String(item.baseVal).trim() === '□' ? '□' : String(item.baseVal || '?');
    const compValStr = item.comparedUnknown || String(item.comparedVal).trim() === '□' ? '□' : String(item.comparedVal || '?');
    const ratioStr = item.ratioUnknown || String(item.ratioVal).trim() === '□' ? '□' : String(item.ratioVal || '?');

    const baseFull = `${baseValStr}${item.baseUnit || ''}`;
    const compFull = `${compValStr}${item.comparedUnit || ''}`;

    const isLessOrEqual = ratio <= 1.0001;
    // Split point along the baseline
    let splitX;
    if (isLessOrEqual) {
      const clamped = Math.max(0.18, Math.min(0.85, ratio));
      splitX = leftX + lineW * clamped;
    } else {
      const inv = 1 / ratio;
      const clamped = Math.max(0.22, Math.min(0.84, inv));
      splitX = leftX + lineW * clamped;
    }

    function arcLabel(cx, cy, text, color, strokeColor) {
      const w = Math.max(26, estimateTextWidth(text, 13) + 12);
      return `
        <rect x="${cx - w / 2}" y="${cy - 10}" width="${w}" height="19" rx="4" fill="#ffffff" />
        <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-family=${JSON.stringify(FONT_FAMILY)} font-size="13" font-weight="800" fill="${color}">${esc(text)}</text>
      `;
    }

    let svg = '';
    // Baseline & ticks
    svg += `<line x1="${leftX}" y1="${midY}" x2="${rightX}" y2="${midY}" stroke="${theme.lineColor}" stroke-width="2" />`;
    svg += `<line x1="${leftX}" y1="${midY - 8}" x2="${leftX}" y2="${midY + 8}" stroke="${theme.lineColor}" stroke-width="2" />`;
    svg += `<line x1="${rightX}" y1="${midY - 8}" x2="${rightX}" y2="${midY + 8}" stroke="${theme.lineColor}" stroke-width="2" />`;
    if (Math.abs(ratio - 1) > 0.001) {
      svg += `<line x1="${splitX}" y1="${midY - 7}" x2="${splitX}" y2="${midY + 7}" stroke="${theme.lineColor}" stroke-width="1.8" />`;
    }

    if (isLessOrEqual) {
      // Full width = 1 (base), inner = ratio (compared)
      svg += `<path d="M ${leftX} ${midY} Q ${(leftX + rightX) / 2} ${midY - 74} ${rightX} ${midY}" fill="none" stroke="${theme.arcColor}" stroke-width="1.5" />`;
      svg += arcLabel((leftX + rightX) / 2, midY - 37, '1', theme.baseText);

      svg += `<path d="M ${leftX} ${midY} Q ${(leftX + splitX) / 2} ${midY - 38} ${splitX} ${midY}" fill="none" stroke="${theme.ratioColor}" stroke-width="1.6" />`;
      svg += arcLabel((leftX + splitX) / 2, midY - 19, ratioStr, theme.ratioColor);

      svg += `<path d="M ${leftX} ${midY} Q ${(leftX + splitX) / 2} ${midY + 38} ${splitX} ${midY}" fill="none" stroke="${theme.comparedStroke}" stroke-width="1.6" />`;
      svg += arcLabel((leftX + splitX) / 2, midY + 19, compFull, theme.comparedText);

      svg += `<path d="M ${leftX} ${midY} Q ${(leftX + rightX) / 2} ${midY + 74} ${rightX} ${midY}" fill="none" stroke="${theme.baseStroke}" stroke-width="1.5" />`;
      svg += arcLabel((leftX + rightX) / 2, midY + 37, baseFull, theme.baseText);
    } else {
      // Full width = ratio (compared), inner = 1 (base)
      svg += `<path d="M ${leftX} ${midY} Q ${(leftX + rightX) / 2} ${midY - 74} ${rightX} ${midY}" fill="none" stroke="${theme.ratioColor}" stroke-width="1.6" />`;
      svg += arcLabel((leftX + rightX) / 2, midY - 37, ratioStr, theme.ratioColor);

      svg += `<path d="M ${leftX} ${midY} Q ${(leftX + splitX) / 2} ${midY - 38} ${splitX} ${midY}" fill="none" stroke="${theme.baseStroke}" stroke-width="1.5" />`;
      svg += arcLabel((leftX + splitX) / 2, midY - 19, '1', theme.baseText);

      svg += `<path d="M ${leftX} ${midY} Q ${(leftX + splitX) / 2} ${midY + 38} ${splitX} ${midY}" fill="none" stroke="${theme.baseStroke}" stroke-width="1.5" />`;
      svg += arcLabel((leftX + splitX) / 2, midY + 19, baseFull, theme.baseText);

      svg += `<path d="M ${leftX} ${midY} Q ${(leftX + rightX) / 2} ${midY + 74} ${rightX} ${midY}" fill="none" stroke="${theme.comparedStroke}" stroke-width="1.6" />`;
      svg += arcLabel((leftX + rightX) / 2, midY + 37, compFull, theme.comparedText);
    }

    return { svg, height: 126 };
  }

  /**
   * 教科書p.175スタイルの「2段テープ図＋倍数直線」を描画
   */
  function renderTapeDiagram(item, opts, originX, originY, blockWidth) {
    const theme = THEMES[opts.theme] || THEMES.textbook;
    const ratio = resolveVisualRatio(item);
    const maxScale = Math.max(2, Math.ceil(ratio + 0.3));
    const axisW = Math.min(280, blockWidth - 110);
    const labelColW = 72;
    const leftX = originX + (blockWidth - (labelColW + axisW + 30)) / 2 + labelColW;

    const unitW = axisW / maxScale;
    const baseW = unitW * 1;
    const compW = Math.max(24, Math.min(axisW, unitW * ratio));

    const baseValStr = item.baseUnknown || String(item.baseVal).trim() === '□' ? '□' : String(item.baseVal || '?');
    const compValStr = item.comparedUnknown || String(item.comparedVal).trim() === '□' ? '□' : String(item.comparedVal || '?');
    const ratioStr = item.ratioUnknown || String(item.ratioVal).trim() === '□' ? '□' : String(item.ratioVal || '?');

    const baseFull = `${baseValStr}${item.baseUnit || ''}`;
    const compFull = `${compValStr}${item.comparedUnit || ''}`;

    const y1 = originY + 12;
    const y2 = y1 + 28;
    const axisY = y2 + 30;

    let svg = '';
    // Top bar: Compared
    svg += `<text x="${leftX - 8}" y="${y1 + 15}" text-anchor="end" font-family=${JSON.stringify(FONT_FAMILY)} font-size="12" font-weight="700" fill="${theme.comparedText}">${esc(item.comparedLabel || 'くらべる')}</text>`;
    svg += `<rect x="${leftX}" y="${y1}" width="${compW}" height="18" fill="${theme.comparedFill}" stroke="${theme.comparedStroke}" stroke-width="1.6" />`;
    svg += `<text x="${leftX + compW + 6}" y="${y1 + 14}" text-anchor="start" font-family=${JSON.stringify(FONT_FAMILY)} font-size="13" font-weight="700" fill="${theme.comparedText}">${esc(compFull)}</text>`;

    // Bottom bar: Base
    svg += `<text x="${leftX - 8}" y="${y2 + 15}" text-anchor="end" font-family=${JSON.stringify(FONT_FAMILY)} font-size="12" font-weight="700" fill="${theme.baseText}">${esc(item.baseLabel || 'もと')}</text>`;
    svg += `<rect x="${leftX}" y="${y2}" width="${baseW}" height="18" fill="${theme.baseFill}" stroke="${theme.baseStroke}" stroke-width="1.6" />`;
    svg += `<text x="${leftX + baseW + 6}" y="${y2 + 14}" text-anchor="start" font-family=${JSON.stringify(FONT_FAMILY)} font-size="13" font-weight="700" fill="${theme.baseText}">${esc(baseFull)}</text>`;

    // Dashed alignment guides
    svg += `<line x1="${leftX + baseW}" y1="${y2 + 18}" x2="${leftX + baseW}" y2="${axisY}" stroke="#94a3b8" stroke-dasharray="3 3" stroke-width="1.2" />`;
    svg += `<line x1="${leftX + compW}" y1="${y1 + 18}" x2="${leftX + compW}" y2="${axisY}" stroke="#94a3b8" stroke-dasharray="3 3" stroke-width="1.2" />`;

    // Number line
    svg += `<line x1="${leftX}" y1="${axisY}" x2="${leftX + axisW + 14}" y2="${axisY}" stroke="${theme.lineColor}" stroke-width="1.8" />`;
    svg += `<line x1="${leftX}" y1="${axisY - 5}" x2="${leftX}" y2="${axisY + 5}" stroke="${theme.lineColor}" stroke-width="1.8" />`;
    svg += `<text x="${leftX}" y="${axisY + 19}" text-anchor="middle" font-family=${JSON.stringify(FONT_FAMILY)} font-size="12" font-weight="700" fill="${theme.lineColor}">0</text>`;

    svg += `<line x1="${leftX + baseW}" y1="${axisY - 5}" x2="${leftX + baseW}" y2="${axisY + 5}" stroke="${theme.lineColor}" stroke-width="1.8" />`;
    svg += `<text x="${leftX + baseW}" y="${axisY + 19}" text-anchor="middle" font-family=${JSON.stringify(FONT_FAMILY)} font-size="12" font-weight="700" fill="${theme.baseText}">1</text>`;

    // Ratio tick
    if (Math.abs(compW - baseW) > 8) {
      svg += `<line x1="${leftX + compW}" y1="${axisY - 5}" x2="${leftX + compW}" y2="${axisY + 5}" stroke="${theme.ratioColor}" stroke-width="2" />`;
      svg += `<text x="${leftX + compW}" y="${axisY + 19}" text-anchor="middle" font-family=${JSON.stringify(FONT_FAMILY)} font-size="12" font-weight="800" fill="${theme.ratioColor}">${esc(ratioStr)}</text>`;
    }

    // Max scale tick + (倍)
    const maxTickX = leftX + axisW;
    svg += `<line x1="${maxTickX}" y1="${axisY - 5}" x2="${maxTickX}" y2="${axisY + 5}" stroke="${theme.lineColor}" stroke-width="1.5" />`;
    svg += `<text x="${maxTickX}" y="${axisY + 19}" text-anchor="middle" font-family=${JSON.stringify(FONT_FAMILY)} font-size="12" fill="${theme.lineColor}">${maxScale} (倍)</text>`;

    return { svg, height: 102 };
  }

  /**
   * 全体のSVGを生成して返す
   */
  function buildSvgString(state) {
    const auxMode = state.auxDiagram || 'none';
    const hasSecond = Boolean(state.enableSecond && state.second);
    const padding = 20;

    // Layout: if auxMode != none and !hasSecond, place 関係図 left & 補助図 right (side-by-side on wide canvas)
    const sideBySide = auxMode !== 'none';
    const relBlockW = 410;
    const auxBlockW = sideBySide ? 360 : 0;
    const gapW = sideBySide ? 24 : 0;
    const totalW = padding * 2 + relBlockW + gapW + auxBlockW;

    const items = [state.primary];
    if (hasSecond) items.push(state.second);

    let curY = padding;
    let bodySvg = '';

    items.forEach((item, idx) => {
      if (idx > 0) {
        // subtle divider between 2 diagrams
        bodySvg += `<line x1="${padding}" y1="${curY - 8}" x2="${totalW - padding}" y2="${curY - 8}" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="6 4" />`;
        curY += 12;
      }

      const rel = renderSingleRelationBlock(item, state, padding, curY, relBlockW);
      let rowH = rel.height;
      bodySvg += rel.svg;

      if (auxMode === 'segment') {
        const seg = renderSegmentDiagram(item, state, padding + relBlockW + gapW, curY + 10, auxBlockW);
        bodySvg += seg.svg;
        rowH = Math.max(rowH, seg.height + 16);
      } else if (auxMode === 'tape') {
        const tape = renderTapeDiagram(item, state, padding + relBlockW + gapW, curY + 14, auxBlockW);
        bodySvg += tape.svg;
        rowH = Math.max(rowH, tape.height + 20);
      }

      curY += rowH + 16;
    });

    const totalH = Math.max(170, curY + padding - 10);

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}" role="img" aria-label="割合の関係図">${bodySvg}</svg>`;
  }

  /**
   * 数値から式と答えを自動計算して整形する
   */
  function computeFormulaInfo(item, hideAnswer) {
    const bUnknown = item.baseUnknown || String(item.baseVal).trim() === '□';
    const rUnknown = item.ratioUnknown || String(item.ratioVal).trim() === '□';
    const cUnknown = item.comparedUnknown || String(item.comparedVal).trim() === '□';

    const bNum = parseNumeric(item.baseVal);
    const rNum = parseNumeric(item.ratioVal);
    const cNum = parseNumeric(item.comparedVal);

    const unknownCount = [bUnknown, rUnknown, cUnknown].filter(Boolean).length;
    if (unknownCount !== 1) {
      return {
        formulaText: 'くらべる量 ＝ もとにする量 × 割合',
        answerText: '',
        subText: '「もとにする量」「割合」「くらべる量」のうち1つを □ にすると自動で式と答えが出ます。',
      };
    }

    if (rUnknown && Number.isFinite(bNum) && Number.isFinite(cNum) && bNum !== 0) {
      const ans = formatNum(cNum / bNum);
      return {
        formulaText: `式： ${cNum} ÷ ${bNum} ＝ ${hideAnswer ? '□' : ans}`,
        answerText: hideAnswer ? '答え： □ 倍' : `答え： ${ans} 倍`,
        subText: '割合 ＝ くらべる量 ÷ もとにする量',
      };
    }

    if (cUnknown && Number.isFinite(bNum) && Number.isFinite(rNum)) {
      const ans = formatNum(bNum * rNum);
      return {
        formulaText: `式： ${bNum} × ${rNum} ＝ ${hideAnswer ? '□' : ans}`,
        answerText: hideAnswer ? `答え： □ ${item.comparedUnit || ''}` : `答え： ${ans} ${item.comparedUnit || ''}`,
        subText: 'くらべる量 ＝ もとにする量 × 割合',
      };
    }

    if (bUnknown && Number.isFinite(cNum) && Number.isFinite(rNum) && rNum !== 0) {
      const ans = formatNum(cNum / rNum);
      return {
        formulaText: `式： ${cNum} ÷ ${rNum} ＝ ${hideAnswer ? '□' : ans}`,
        answerText: hideAnswer ? `答え： □ ${item.baseUnit || ''}` : `答え： ${ans} ${item.baseUnit || ''}`,
        subText: `考え方： □ × ${rNum} ＝ ${cNum}　だから　□ ＝ ${cNum} ÷ ${rNum}`,
      };
    }

    return {
      formulaText: '数値を入力すると、ここに式と答えが表示されます',
      answerText: '',
      subText: '',
    };
  }

  /**
   * SVG文字列をPNG Blobに変換する（高解像度2.5x）
   */
  function svgToPngBlob(svgEl, { scale = 2.5, transparent = false } = {}) {
    return new Promise((resolve, reject) => {
      try {
        const clone = svgEl.cloneNode(true);
        const vb = clone.viewBox.baseVal;
        const w = (vb && vb.width) || Number(clone.getAttribute('width')) || 600;
        const h = (vb && vb.height) || Number(clone.getAttribute('height')) || 240;
        clone.setAttribute('width', w);
        clone.setAttribute('height', h);

        const serializer = new XMLSerializer();
        const svgStr = serializer.serializeToString(clone);
        const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(w * scale);
          canvas.height = Math.round(h * scale);
          const ctx = canvas.getContext('2d');
          if (!transparent) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(url);
          canvas.toBlob((pngBlob) => {
            if (pngBlob) resolve(pngBlob);
            else reject(new Error('PNG生成に失敗しました'));
          }, 'image/png');
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('SVG画像の読み込みに失敗しました'));
        };
        img.src = url;
      } catch (err) {
        reject(err);
      }
    });
  }

  global.KankeizuDiagram = {
    buildSvgString,
    renderSegmentDiagram,
    renderTapeDiagram,
    computeFormulaInfo,
    svgToPngBlob,
    parseNumeric,
    formatNum,
  };
})(window);
