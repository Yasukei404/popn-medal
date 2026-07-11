/* popn medal-census DIAGNOSTIC v7 (Method B — exclude LONG versions).
   User facts: LONG-version charts are NOT in the current AC (exclude);
   ウラ / LIVE / REMIX ARE in the AC (keep). Sweep version=-1, dedupe by no+diff,
   then report totals ALL / LONG-only / ALL-minus-LONG per difficulty vs the arcade
   target, plus ウラ/LIVE/REMIX reference counts, and a list of the LONG songs. */
void (async function () {
var B = "https://p.eagate.573.jp/game/popn/popn29/playdata", P = new DOMParser(), D = document, b = D.body, DELAY = 90;
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function dec(r) { return r.arrayBuffer().then(function (a) { return ((r.headers.get("Content-Type") || "").indexOf("UTF-8") < 0 ? new TextDecoder("Shift_JIS") : new TextDecoder()).decode(a); }); }
function get(u) { return fetch(u).then(dec).then(function (t) { return P.parseFromString(t, "text/html"); }); }
function diff(li) {
  var g = li.querySelectorAll("img"), i, x;
  for (i = 0; i < g.length; i++) { x = ((g[i].getAttribute("src") || "") + " " + (g[i].getAttribute("alt") || "") + " " + (g[i].getAttribute("title") || "")).toLowerCase(); if (x.indexOf("meda_") >= 0) continue; if (/(^|[^a-z])ex([^a-z]|$)/.test(x) || x.indexOf("_ex") >= 0) return "EX"; if (x.indexOf("hyper") >= 0 || /_h[._]/.test(x)) return "H"; if (x.indexOf("normal") >= 0 || /_n[._]/.test(x)) return "N"; if (x.indexOf("light") >= 0 || x.indexOf("easy") >= 0 || /_[le][._]/.test(x)) return "L"; }
  var a = li.querySelectorAll("*"); for (i = 0; i < a.length; i++) { x = (a[i].className || "").toString().toLowerCase(); if (/(^|[^a-z])ex([^a-z]|$)/.test(x)) return "EX"; if (/hyper/.test(x)) return "H"; if (/normal/.test(x)) return "N"; if (/light|easy/.test(x)) return "L"; }
  x = (li.textContent || "").toUpperCase(); if (/(^|[^A-Z])EX([^A-Z]|$)/.test(x)) return "EX"; if (/HYPER/.test(x)) return "H"; if (/NORMAL/.test(x)) return "N"; if (/LIGHT|EASY/.test(x)) return "L"; return "?";
}
/* full-width latin -> half-width, upper-case, for keyword matching */
function nz(s) { return (s || "").replace(/[！-～]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); }).toUpperCase(); }
var pre = D.createElement("pre"); pre.style.cssText = "position:fixed;inset:10px;z-index:99999;overflow:auto;background:#000;color:#0f0;font:11px monospace;padding:12px;white-space:pre-wrap;word-break:break-all";
b.innerHTML = ""; b.appendChild(pre);
function log(s) { pre.textContent += s + "\n"; }

var rows = []; /* {no,d,genre,title,artist,lv} */
for (var lv = 1; lv <= 50; lv++) {
  var pg = 0;
  while (1) {
    var doc = await get(B + "/mu_lv.html?page=" + pg + "&version=-1&bemani=0&category=0&keyword=&sort=none&lv=" + lv);
    var L = doc.querySelectorAll("ul.mu_list_lv_table>li"); if (!L.length) break;
    for (var q = 0; q < L.length; q++) {
      var li = L[q]; if (li.className == "st_th") continue;
      var a = li.querySelector('a[href*="mu_detail"]'), mm = a && (a.getAttribute("href") || "").match(/[?&]no=([^&"']+)/);
      var titleA = li.querySelector("a"), title = titleA ? titleA.textContent.trim() : "";
      var c0 = li.children[0], ps = c0 ? c0.querySelectorAll("p") : [];
      var genre = ps[0] ? ps[0].textContent.trim() : "", artist = ps[1] ? ps[1].textContent.trim() : "";
      rows.push({ no: mm ? mm[1] : ("?" + lv + "_" + q), d: diff(li), genre: genre, title: title, artist: artist, lv: lv });
    }
    pre.textContent = "取得中… LV" + lv + " rows=" + rows.length; pg++; await sleep(DELAY);
  }
}
pre.textContent = "";

var isLONG = function (r) { return nz(r.genre).indexOf("LONG") >= 0; };
var isURA = function (r) { return r.genre.indexOf("ウラ") >= 0 || nz(r.genre).indexOf("URA") >= 0; };
var isLIVE = function (r) { return nz(r.genre).indexOf("LIVE") >= 0; };
var isREMIX = function (r) { return nz(r.genre).indexOf("REMIX") >= 0; };
function counts(filter) {
  var seen = {}, per = { L: 0, N: 0, H: 0, EX: 0, "?": 0 };
  rows.forEach(function (r) { if (filter && !filter(r)) return; var k = r.no + "|" + r.d; if (seen[k]) return; seen[k] = 1; per[r.d] = (per[r.d] || 0) + 1; });
  per.total = per.L + per.N + per.H + per.EX + per["?"];
  return per;
}
function excl(filter) {
  var seen = {}, per = { L: 0, N: 0, H: 0, EX: 0, "?": 0 };
  rows.forEach(function (r) { if (filter(r)) return; var k = r.no + "|" + r.d; if (seen[k]) return; seen[k] = 1; per[r.d] = (per[r.d] || 0) + 1; });
  per.total = per.L + per.N + per.H + per.EX + per["?"];
  return per;
}
function f(c) { return "L=" + c.L + " N=" + c.N + " H=" + c.H + " EX=" + c.EX + (c["?"] ? " ?=" + c["?"] : "") + " total=" + c.total; }

log("=== v7: exclude LONG (dedup no+diff) ===");
log("arcade target : L=1219 N=2064 H=2029 EX=1901 total=7213");
log("ALL           : " + f(counts(null)));
log("LONG only     : " + f(counts(isLONG)));
log("ALL minus LONG: " + f(excl(isLONG)) + "   <= compare to arcade");
log("");
log("(ref, NOT excluded) ウラ: " + f(counts(isURA)) + " | LIVE: " + f(counts(isLIVE)) + " | REMIX: " + f(counts(isREMIX)));
log("");
/* list LONG songs, deduped by no, with levels */
var ls = {};
rows.forEach(function (r) { if (!isLONG(r)) return; var s = ls[r.no] || (ls[r.no] = { genre: r.genre, title: r.title, artist: r.artist, lv: {} }); s.lv[r.d] = r.lv; });
var lk = Object.keys(ls);
log("=== LONG songs (dedup by no) : " + lk.length + " ===");
log("EX HY NO LI | genre | title | artist");
function p2(v) { return v == null ? "--" : (v < 10 ? " " + v : "" + v); }
lk.map(function (k) { return ls[k]; }).sort(function (a, b2) { return (b2.lv.EX || b2.lv.H || 0) - (a.lv.EX || a.lv.H || 0); }).forEach(function (s) {
  log(p2(s.lv.EX) + " " + p2(s.lv.H) + " " + p2(s.lv.N) + " " + p2(s.lv.L) + " | " + s.genre + " | " + s.title + " | " + s.artist);
});
log("\n--- copy everything above and paste back ---");
})();
