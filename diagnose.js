/* popn medal-census DIAGNOSTIC v2. Run on a logged-in playdata page.
   Goal: characterize the ~+32 charts that (no+difficulty) keeps but the arcade
   doesn't count. Shows row structure, per-difficulty deduped counts, alternative
   key counts, and the title+diff groups that span multiple `no` (crossover?). */
void (async function () {
var B = "https://p.eagate.573.jp/game/popn/popn29/playdata", P = new DOMParser(), D = document, b = D.body, DELAY = 100;
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function dec(r) { return r.arrayBuffer().then(function (a) { return ((r.headers.get("Content-Type") || "").indexOf("UTF-8") < 0 ? new TextDecoder("Shift_JIS") : new TextDecoder()).decode(a); }); }
function get(u) { return fetch(u).then(dec).then(function (t) { return P.parseFromString(t, "text/html"); }); }
function diff(li) {
  var g = li.querySelectorAll("img"), i, x;
  for (i = 0; i < g.length; i++) { x = ((g[i].getAttribute("src") || "") + " " + (g[i].getAttribute("alt") || "") + " " + (g[i].getAttribute("title") || "")).toLowerCase(); if (x.indexOf("meda_") >= 0) continue; if (/(^|[^a-z])ex([^a-z]|$)/.test(x) || x.indexOf("_ex") >= 0) return "EX"; if (x.indexOf("hyper") >= 0 || /_h[._]/.test(x)) return "HYPER"; if (x.indexOf("normal") >= 0 || /_n[._]/.test(x)) return "NORMAL"; if (x.indexOf("light") >= 0 || x.indexOf("easy") >= 0 || /_[le][._]/.test(x)) return "LIGHT"; }
  var a = li.querySelectorAll("*"); for (i = 0; i < a.length; i++) { x = (a[i].className || "").toString().toLowerCase(); if (/(^|[^a-z])ex([^a-z]|$)/.test(x)) return "EX"; if (/hyper/.test(x)) return "HYPER"; if (/normal/.test(x)) return "NORMAL"; if (/light|easy/.test(x)) return "LIGHT"; }
  x = (li.textContent || "").toUpperCase(); if (/(^|[^A-Z])EX([^A-Z]|$)/.test(x)) return "EX"; if (/HYPER/.test(x)) return "HYPER"; if (/NORMAL/.test(x)) return "NORMAL"; if (/LIGHT|EASY/.test(x)) return "LIGHT"; return "unknown";
}
var pre = D.createElement("pre"); pre.style.cssText = "position:fixed;inset:10px;z-index:99999;overflow:auto;background:#000;color:#0f0;font:11px monospace;padding:12px;white-space:pre-wrap;word-break:break-all";
b.innerHTML = ""; b.appendChild(pre);
function log(s) { pre.textContent += s + "\n"; }

var rows = [], sampleHtml = [];
for (var lv = 1; lv <= 50; lv++) {
  var pg = 0;
  while (1) {
    var doc = await get(B + "/mu_lv.html?page=" + pg + "&version=-1&bemani=0&category=0&keyword=&sort=none&lv=" + lv);
    var L = doc.querySelectorAll("ul.mu_list_lv_table>li"); if (!L.length) break;
    for (var q = 0; q < L.length; q++) {
      var li = L[q]; if (li.className == "st_th") continue;
      var a = li.querySelector('a[href*="mu_detail"]'), href = a ? a.getAttribute("href") : null, mm = href && href.match(/[?&]no=([^&"']+)/);
      var titleA = li.querySelector("a"), title = titleA ? titleA.textContent.trim() : "";
      var c0 = li.children[0], ps = c0 ? c0.querySelectorAll("p") : [];
      var genre = ps[0] ? ps[0].textContent.trim() : "", artist = ps[1] ? ps[1].textContent.trim() : "";
      if (sampleHtml.length < 2 && c0) sampleHtml.push(c0.outerHTML);
      rows.push({ no: mm ? mm[1] : null, lv: lv, d: diff(li), title: title, genre: genre, artist: artist });
    }
    pre.textContent = "取得中… LV" + lv + " rows=" + rows.length; pg++; await sleep(DELAY);
  }
}
pre.textContent = "";

function uniq(fn) { var s = {}; rows.forEach(function (r) { s[fn(r)] = 1; }); return Object.keys(s).length; }
function perDiff(fn) { var s = { LIGHT: {}, NORMAL: {}, HYPER: {}, EX: {}, unknown: {} }; rows.forEach(function (r) { (s[r.d] || (s[r.d] = {}))[fn(r)] = 1; }); return ["LIGHT", "NORMAL", "HYPER", "EX"].map(function (k) { return k + "=" + Object.keys(s[k]).length; }).join("  "); }

log("=== DIAGNOSTIC v2 ===");
log("total rows            : " + rows.length);
log("distinct no (songs)   : " + uniq(function (r) { return r.no; }));
log("");
log("chart counts by key (deduped), per difficulty:");
log(" no+diff        : " + perDiff(function (r) { return r.no; }));
log(" genre+title    : " + perDiff(function (r) { return r.genre + "\x1f" + r.title; }));
log(" genre+ttl+artist: " + perDiff(function (r) { return r.genre + "\x1f" + r.title + "\x1f" + r.artist; }));
log("");
log("totals: no+diff=" + uniq(function (r) { return r.no + "|" + r.d; }) +
    "  gt+diff=" + uniq(function (r) { return r.genre + "\x1f" + r.title + "|" + r.d; }) +
    "  gta+diff=" + uniq(function (r) { return r.genre + "\x1f" + r.title + "\x1f" + r.artist + "|" + r.d; }));
log("");
log("--- children[0] sample HTML (structure) ---");
sampleHtml.forEach(function (h) { log(h.slice(0, 300)); });

/* title+diff groups spanning MULTIPLE distinct `no` (crossover or same-title-different-song) */
var byTD = {};
rows.forEach(function (r) { var k = r.title + "|" + r.d; (byTD[k] = byTD[k] || {})[r.no] = r; });
var span = Object.keys(byTD).filter(function (k) { return Object.keys(byTD[k]).length > 1; });
log("\n(title+diff) groups spanning >1 no: " + span.length);
log("--- first 20: title | diff | per-no [no8 genre / artist] ---");
span.slice(0, 20).forEach(function (k) {
  var g = byTD[k], nos = Object.keys(g);
  log((g[nos[0]].title || "?").slice(0, 18) + " | " + g[nos[0]].d + " | " + nos.map(function (n) { var r = g[n]; return "[" + n.slice(0, 8) + " " + (r.genre || "?").slice(0, 10) + " / " + (r.artist || "?").slice(0, 10) + "]"; }).join(" "));
});
log("\n--- copy everything above and paste back ---");
})();
