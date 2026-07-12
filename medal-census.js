/* pop'n TOTAL MEDALS - difficulty x medal count (symbols) with localStorage cache. */
/* v2: enumerate via 曲データ (mu_top.html) — difficulty by POSITION (no guessing),
   each song once (no dedup needed), ~83 requests. Run on a logged-in playdata page. */
void (async function () {
var B = "https://p.eagate.573.jp/game/popn/popn29/playdata", P = new DOMParser(), D = document, b = D.body;
var VER = "2.0", CK = "popn_medal_cache_v2", TTL = 12 * 3600 * 1000, DELAY = 120;
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function dec(r) { return r.arrayBuffer().then(function (a) { return ((r.headers.get("Content-Type") || "").indexOf("UTF-8") < 0 ? new TextDecoder("Shift_JIS") : new TextDecoder()).decode(a); }); }
function get(u) { return fetch(u).then(dec).then(function (t) { return P.parseFromString(t, "text/html"); }); }

/* mu_top: each <li> = one song. After the title div, sibling divs are the difficulty
   slots in fixed order [OTHER, LIGHT, NORMAL, HYPER, EX]. A slot whose score text is
   "-" has no chart; otherwise the chart exists (medal from meda_X.png, none = unplayed). */
async function sweep(onProg) {
  var R = [], seen = {}, order = ["LIGHT", "NORMAL", "HYPER", "EX"], pg = 0;
  while (1) {
    var doc = await get(B + "/mu_top.html?page=" + pg + "&version=-1&bemani=0&category=0&keyword=&sort=music&sort_type=up");
    var lis = doc.querySelectorAll("ul.mu_list_table>li"); if (!lis.length) break;
    for (var q = 0; q < lis.length; q++) {
      var li = lis[q], a = li.querySelector('a[href*="mu_detail"]'); if (!a) continue;
      var mm = (a.getAttribute("href") || "").match(/[?&]no=([^&"']+)/), no = mm ? mm[1] : a.textContent;
      if (seen[no]) continue; seen[no] = 1;
      var slot = a.parentElement.nextElementSibling; /* [0] = OTHER */
      for (var i = 0; i < 4; i++) {
        slot = slot && slot.nextElementSibling; /* advance to LIGHT, NORMAL, HYPER, EX */
        if (!slot) break;
        var sc = (slot.textContent || "").trim(); if (sc === "-" || sc === "") continue;
        var im = slot.querySelector("img"), md = im && (im.getAttribute("src") || "").match(/meda_([a-z]+)\.png/);
        R.push({ d: order[i], m: md ? md[1] : "none" });
      }
    }
    onProg(pg + 1, R.length); pg++; await sleep(DELAY);
  }
  return R;
}
function agg(R) {
  var C = {}; O.forEach(function (o) { C[o[0]] = { LIGHT: 0, NORMAL: 0, HYPER: 0, EX: 0, T: 0 }; });
  R.forEach(function (r) { var k = C[r.m] ? r.m : "none"; C[k][r.d]++; C[k].T++; });
  return { C: C, cols: ["LIGHT", "NORMAL", "HYPER", "EX"], n: R.length };
}
function load() { try { var s = localStorage.getItem(CK); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
function save(A, t) { try { localStorage.setItem(CK, JSON.stringify({ v: VER, t: t, C: A.C, cols: A.cols, n: A.n })); } catch (e) {} }

var O = [["a", "★", "r", "パーフェクト"], ["b", "★", "#9aa4ad", "フルコンボ"], ["c", "◆", "#9aa4ad", "フルコンボ"], ["d", "●", "#9aa4ad", "フルコンボ"], ["e", "★", "#e2445c", "クリア"], ["f", "◆", "#e2445c", "クリア"], ["g", "●", "#e2445c", "クリア"], ["l", "✿", "#f0932b", "ロングオフクリア"], ["k", "✿", "#3aae5a", "イージークリア"], ["h", "★", "#3a7bd5", "クリア失敗"], ["i", "◆", "#3a7bd5", "クリア失敗"], ["j", "●", "#3a7bd5", "クリア失敗"], ["none", "○", "#bbb", "メダルなし"]];
var FC = { LIGHT: "#3a7bd5", NORMAL: "#2e9e4f", HYPER: "#c98a00", EX: "#d82f66" }, CL = { LIGHT: "LIGHT", NORMAL: "NORMAL", HYPER: "HYPER", EX: "EX" };
function setStatus(t) { var e = D.getElementById("mcst"); if (e) e.textContent = t; }
function sym(o) { return o[2] == "r" ? '<span class=s style="background:linear-gradient(90deg,#e2445c,#e8b923,#3aae5a,#3a7bd5);-webkit-background-clip:text;color:transparent">' + o[1] + "</span>" : '<span class=s style="color:' + o[2] + '">' + o[1] + "</span>"; }
function render(A, meta) {
  var C = A.C, cols = A.cols;
  var H = '<tr><th class=lc>メダル</th>'; cols.forEach(function (k) { H += '<th style="color:' + FC[k] + '">' + CL[k] + "</th>"; }); H += "<th>合計</th></tr>";
  var BD = ""; O.forEach(function (o) { var c = C[o[0]]; BD += '<tr' + (o[0] == "h" ? ' class=sep' : '') + '><td class=l>' + sym(o) + ' <span style="color:#666">' + o[3] + "</span></td>"; cols.forEach(function (k) { var v = c[k]; BD += "<td" + (v ? "" : ' style="color:#ccc"') + ">" + v + "</td>"; }); BD += '<td class=b>' + c.T + "</td></tr>"; });
  var TT = {}, TC = {}, gt = 0, gc = 0; cols.forEach(function (k) { TT[k] = 0; TC[k] = 0; });
  O.forEach(function (o, ix) { cols.forEach(function (k) { TT[k] += C[o[0]][k]; if (ix < 9) TC[k] += C[o[0]][k]; }); });
  var FT = '<tr class=f><td class=lc>クリア / 総数</td>'; cols.forEach(function (k) { FT += '<td class=b>' + TC[k] + ' <span class=n style="color:#888;font-weight:normal;font-size:11px">/ ' + TT[k] + "</span></td>"; gt += TT[k]; gc += TC[k]; }); FT += '<td class=b>' + gc + ' <span class=n style="color:#888;font-weight:normal;font-size:11px">/ ' + gt + "</span></td></tr>";
  var ts = meta.t ? new Date(meta.t).toLocaleString() : "";
  var lab = (meta.cached ? "前回取得 " + ts + "（キャッシュ・0リクエスト）" + (meta.stale ? " ⚠古い可能性→更新" : "") : "最終更新 " + ts);
  var bar = '<div id=mcbar><span id=mcst>' + lab + '</span><button id=mcbtn>更新</button></div>';
  var tstyle = "width:auto!important;max-width:560px!important;min-width:0!important;table-layout:auto!important;margin:0 auto!important;border-collapse:collapse!important;background:#fff!important;border-radius:8px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,.15)";
  b.innerHTML = "<style>#mc{font:13px sans-serif;color:#333;padding:16px}#mc td,#mc th{padding:4px 10px!important;text-align:center;border-bottom:1px solid rgba(0,0,0,.05);width:auto!important;white-space:normal}#mc th{border-bottom:2px solid #d82f66;font-size:12px}#mc td:nth-child(1),#mc th:nth-child(1){background:#fbfbe6}#mc td:nth-child(2),#mc th:nth-child(2){background:#dcefff}#mc td:nth-child(3),#mc th:nth-child(3){background:#dcf6dc}#mc td:nth-child(4),#mc th:nth-child(4){background:#fff2b8}#mc td:nth-child(5),#mc th:nth-child(5){background:#ffdde6}#mc td:nth-child(6),#mc th:nth-child(6){background:#ededed}#mc .l{text-align:left;white-space:nowrap}#mc .lc{text-align:center;white-space:nowrap}#mc .b{font-weight:bold}#mc .s{font-size:17px;display:inline-block;width:1.4em;text-align:center}#mc .sep td{border-top:2px solid #888}#mc .f td{border-top:2px solid #d82f66;font-weight:bold}#mc .n{white-space:nowrap}#mc h2{color:#d82f66;font-size:16px;text-align:center;margin:0 0 10px}#mcbar{max-width:560px;margin:8px auto 0;text-align:center;font-size:11px;color:#888}#mcbtn{margin-left:8px;font-size:11px;cursor:pointer}#mcnote{max-width:560px;margin:6px auto 0;text-align:center;font-size:10px;color:#aaa;line-height:1.6}</style>" +
    '<div id=mc><h2>TOTAL MEDALS</h2><table style="' + tstyle + '"><thead>' + H + "</thead><tbody>" + BD + FT + "</tbody></table>" + '<div id=mcnote>※EXTRA・特殊解禁曲を含む eagate 上の全曲を集計しています。<br>アーケード筐体の TOTAL MEDALS とは数譜面ずれることがあります（仕様）。<br>※未解禁の曲は eagate に表示されないため、合計にも反映されません。</div>' + bar + "</div>";
  var btn = D.getElementById("mcbtn"); if (btn) btn.onclick = function () { btn.disabled = true; refresh(); };
}
async function refresh() {
  setStatus("更新中…");
  var R = await sweep(function (pg, n) { setStatus("更新中… " + pg + "ページ目（" + n + " 譜面）"); });
  if (!R.length) { setStatus("取得失敗：ログイン状態を確認してください"); var btn = D.getElementById("mcbtn"); if (btn) btn.disabled = false; return; }
  var A = agg(R), t = Date.now(); save(A, t); render(A, { t: t, cached: false });
}
var ch = load();
if (ch && ch.v == VER && ch.C) {
  render({ C: ch.C, cols: ch.cols, n: ch.n }, { t: ch.t, cached: true, stale: Date.now() - ch.t >= TTL });
} else {
  b.innerHTML = '<div id=mcst style="padding:24px;font:14px sans-serif;text-align:center;color:#333">取得中…</div>';
  refresh();
}
})();
