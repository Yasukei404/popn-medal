/* pop'n TOTAL MEDALS - difficulty x medal count (symbols). Run on a logged-in playdata page. */
void (async function () {
var B = "https://p.eagate.573.jp/game/popn/popn29/playdata", P = new DOMParser(), D = document, b = D.body;
var s = D.createElement("div"); s.style.cssText = "padding:24px;font:14px sans-serif;text-align:center"; s.textContent = "取得中…"; b.innerHTML = ""; b.appendChild(s);
function dec(r) { return r.arrayBuffer().then(function (a) { return ((r.headers.get("Content-Type") || "").indexOf("UTF-8") < 0 ? new TextDecoder("Shift_JIS") : new TextDecoder()).decode(a); }); }
function get(u) { return fetch(u).then(dec).then(function (t) { return P.parseFromString(t, "text/html"); }); }
function diff(li) {
  var g = li.querySelectorAll("img"), i, x;
  for (i = 0; i < g.length; i++) { x = ((g[i].getAttribute("src") || "") + " " + (g[i].getAttribute("alt") || "") + " " + (g[i].getAttribute("title") || "")).toLowerCase(); if (x.indexOf("meda_") >= 0) continue; if (/(^|[^a-z])ex([^a-z]|$)/.test(x) || x.indexOf("_ex") >= 0) return "EX"; if (x.indexOf("hyper") >= 0 || /_h[._]/.test(x)) return "HYPER"; if (x.indexOf("normal") >= 0 || /_n[._]/.test(x)) return "NORMAL"; if (x.indexOf("light") >= 0 || x.indexOf("easy") >= 0 || /_[le][._]/.test(x)) return "LIGHT"; }
  var a = li.querySelectorAll("*"); for (i = 0; i < a.length; i++) { x = (a[i].className || "").toString().toLowerCase(); if (/(^|[^a-z])ex([^a-z]|$)/.test(x)) return "EX"; if (/hyper/.test(x)) return "HYPER"; if (/normal/.test(x)) return "NORMAL"; if (/light|easy/.test(x)) return "LIGHT"; }
  x = (li.textContent || "").toUpperCase(); if (/(^|[^A-Z])EX([^A-Z]|$)/.test(x)) return "EX"; if (/HYPER/.test(x)) return "HYPER"; if (/NORMAL/.test(x)) return "NORMAL"; if (/LIGHT|EASY/.test(x)) return "LIGHT"; return "unknown";
}
var R = [], lv, pg, doc, L, q, e, m;
for (lv = 1; lv <= 50; lv++) {
  pg = 0;
  while (1) {
    doc = await get(B + "/mu_lv.html?page=" + pg + "&version=-1&bemani=0&category=0&keyword=&sort=none&lv=" + lv);
    L = doc.querySelectorAll("ul.mu_list_lv_table>li"); if (!L.length) break;
    for (q = 0; q < L.length; q++) { if (L[q].className == "st_th") continue; e = L[q].children[3]; m = e && e.querySelector("img"); m = m && (m.getAttribute("src") || "").match(/meda_([a-z]+)\.png/); R.push({ d: diff(L[q]), m: m ? m[1] : "none" }); }
    s.textContent = "取得中… LV" + lv + "（" + R.length + "）"; pg++;
  }
}
if (!R.length) { s.innerHTML = "取得できませんでした。ログイン状態でプレーデータのページから実行してください。"; return; }

var O = [["a", "★", "r", "パーフェクト"], ["b", "★", "#9aa4ad", "フルコンボ"], ["c", "◆", "#9aa4ad", "フルコンボ"], ["d", "●", "#9aa4ad", "フルコンボ"], ["e", "★", "#e2445c", "クリア"], ["f", "◆", "#e2445c", "クリア"], ["g", "●", "#e2445c", "クリア"], ["l", "✿", "#f0932b", "ロングオフクリア"], ["k", "✿", "#3aae5a", "イージークリア"], ["h", "★", "#3a7bd5", "クリア失敗"], ["i", "◆", "#3a7bd5", "クリア失敗"], ["j", "●", "#3a7bd5", "クリア失敗"], ["none", "–", "#bbb", "メダルなし"]];
var F = ["LIGHT", "NORMAL", "HYPER", "EX"], FC = { LIGHT: "#3a7bd5", NORMAL: "#2e9e4f", HYPER: "#c98a00", EX: "#d82f66", unknown: "#888" }, CL = { LIGHT: "LIGHT", NORMAL: "NORMAL", HYPER: "HYPER", EX: "EX", unknown: "不明" };
var C = {}, UK = 0; O.forEach(function (o) { C[o[0]] = { LIGHT: 0, NORMAL: 0, HYPER: 0, EX: 0, unknown: 0, T: 0 }; });
R.forEach(function (r) { var k = C[r.m] ? r.m : "none"; C[k][r.d]++; C[k].T++; if (r.d == "unknown") UK++; });
var cols = F.slice(); if (UK) cols.push("unknown");

function sym(o) { return o[2] == "r" ? '<span class=s style="background:linear-gradient(90deg,#e2445c,#e8b923,#3aae5a,#3a7bd5);-webkit-background-clip:text;color:transparent">' + o[1] + "</span>" : '<span class=s style="color:' + o[2] + '">' + o[1] + "</span>"; }
var H = '<tr><th class=l>メダル</th>'; cols.forEach(function (k) { H += '<th style="color:' + FC[k] + '">' + CL[k] + "</th>"; }); H += "<th>合計</th></tr>";
var BD = ""; O.forEach(function (o) { if (o[0] == "h") BD += '<tr><td class=d colspan=' + (cols.length + 2) + "></td></tr>"; var c = C[o[0]]; BD += '<tr><td class=l>' + sym(o) + ' <span style="color:#666">' + o[3] + "</span></td>"; cols.forEach(function (k) { var v = c[k]; BD += "<td" + (v ? "" : ' style="color:#ccc"') + ">" + v + "</td>"; }); BD += '<td class=b>' + c.T + "</td></tr>"; });
var TT = {}, TC = {}, gt = 0, gc = 0; cols.forEach(function (k) { TT[k] = 0; TC[k] = 0; });
O.forEach(function (o, ix) { cols.forEach(function (k) { TT[k] += C[o[0]][k]; if (ix < 9) TC[k] += C[o[0]][k]; }); });
var FT = '<tr class=f><td class=l>クリア / 総数</td>'; cols.forEach(function (k) { FT += '<td class=b>' + TC[k] + ' <span class=n style="color:#888;font-weight:normal;font-size:11px">/ ' + TT[k] + "</span></td>"; gt += TT[k]; gc += TC[k]; }); FT += '<td class=b>' + gc + ' <span class=n style="color:#888;font-weight:normal;font-size:11px">/ ' + gt + "</span></td></tr>";

b.innerHTML = "<style>#mc{font:13px sans-serif;color:#333;padding:16px}#mc table{border-collapse:collapse;background:#feffb7;margin:0 auto}#mc td,#mc th{padding:3px 8px;text-align:center;border-bottom:1px solid #f0e9a0}#mc th{border-bottom:2px solid #d82f66;font-size:12px}#mc .l{text-align:left;white-space:nowrap}#mc .b{font-weight:bold}#mc .s{font-size:17px}#mc .d{border-top:2px solid #888}#mc .f td{border-top:2px solid #d82f66;font-weight:bold}#mc .n{white-space:nowrap}#mc h2{color:#d82f66;font-size:16px;text-align:center;margin:0 0 10px}</style>" +
  '<div id=mc><h2>TOTAL MEDALS</h2><table><thead>' + H + "</thead><tbody>" + BD + FT + "</tbody></table></div>";
})();
