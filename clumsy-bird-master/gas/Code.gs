/**
 * クラムジーバード（割合チャレンジ版）共有ランキング用 Google Apps Script
 * 対象スプレッドシートID: 1mEh0lkapIp-UmHJ2_dLaAzk9I1h9q--_3EoK59CVo1w
 */
var TARGET_SPREADSHEET_ID = '1mEh0lkapIp-UmHJ2_dLaAzk9I1h9q--_3EoK59CVo1w';
var DEFAULT_SHEET_NAME = '割合ゲーム_ランキング';

/** 初回セットアップ用（エディタで一度「実行」するとシート作成＆権限許可が完了します） */
function initRankingSheet() {
  var sheet = getSheet_(DEFAULT_SHEET_NAME);
  Logger.log('準備完了: ' + sheet.getName());
}

function getSpreadsheet_() {
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  return SpreadsheetApp.openById(TARGET_SPREADSHEET_ID);
}

function getSheet_(sheetName) {
  var ss = getSpreadsheet_();
  var name = sheetName || DEFAULT_SHEET_NAME;
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(['ID', 'なまえ', 'スコア(てん)', 'クイズ正解数', '日時']);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#e0f2fe');
  }
  return sheet;
}

function readTop_(sheetName, limit) {
  var sheet = getSheet_(sheetName);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var values = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  var items = values.map(function (row) {
    return {
      id: String(row[0] || ''),
      name: String(row[1] || 'ななし'),
      score: Number(row[2]) || 0,
      quizSolved: Number(row[3]) || 0,
      createdAt: row[4] instanceof Date ? row[4].toISOString() : String(row[4] || ''),
    };
  });

  items.sort(function (a, b) {
    if (b.score !== a.score) return b.score - a.score;
    if (b.quizSolved !== a.quizSolved) return b.quizSolved - a.quizSolved;
    return a.createdAt < b.createdAt ? -1 : 1;
  });

  return items.slice(0, limit || 30);
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var board = (e && e.parameter && e.parameter.board)
    ? String(e.parameter.board).replace(/[^\w\u3040-\u30ff\u4e00-\u9faf-]/g, '')
    : DEFAULT_SHEET_NAME;
  var items = readTop_(board || DEFAULT_SHEET_NAME, 30);
  return jsonOut_({ ok: true, sheetName: board || DEFAULT_SHEET_NAME, items: items });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var data = JSON.parse(raw);
    var board = data.board
      ? String(data.board).replace(/[^\w\u3040-\u30ff\u4e00-\u9faf-]/g, '')
      : DEFAULT_SHEET_NAME;
    var name = String(data.name || '').trim().slice(0, 20) || 'ななし';
    var score = Math.max(0, Math.min(99999, Math.floor(Number(data.score) || 0)));
    var quizSolved = Math.max(0, Math.min(9999, Math.floor(Number(data.quizSolved) || 0)));
    var id = String(data.id || ('r-' + Date.now()));
    var createdAt = new Date().toISOString();

    var sheet = getSheet_(board || DEFAULT_SHEET_NAME);
    sheet.appendRow([id, name, score, quizSolved, createdAt]);

    var items = readTop_(board || DEFAULT_SHEET_NAME, 30);
    return jsonOut_({ ok: true, id: id, items: items });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
