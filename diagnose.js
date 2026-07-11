/* popn medal-census DIAGNOSTIC v6 (Method B' — checklist with levels).
   Dump all version=0 (家庭用) songs with per-difficulty LEVELS, so they can be
   looked up on the wiki's per-level song lists to see which are NOT in the arcade. */
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
var pre = D.createElement("pre"); pre.style.cssText = "position:fixed;inset:10px;z-index:99999;overflow:auto;background:#000;color:#0f0;font:11px monospace;padding:12px;white-space:pre-wrap;word-break:break-all";
b.innerHTML = ""; b.appendChild(pre);
function log(s) { pre.textContent += s + "\n"; }

var songs = {}; /* no -> {genre,title,artist,lv:{L,N,H,EX}} */
for (var lv = 1; lv <= 50; lv++) {
  var pg = 0;
  while (1) {
    var doc = await get(B + "/mu_lv.html?page=" + pg + "&version=0&bemani=0&category=0&keyword=&sort=none&lv=" + lv);
    var L = doc.querySelectorAll("ul.mu_list_lv_table>li"); if (!L.length) break;
    for (var q = 0; q < L.length; q++) {
      var li = L[q]; if (li.className == "st_th") continue;
      var a = li.querySelector('a[href*="mu_detail"]'), mm = a && (a.getAttribute("href") || "").match(/[?&]no=([^&"']+)/), no = mm ? mm[1] : ("?" + lv + "_" + q);
      var titleA = li.querySelector("a"), title = titleA ? titleA.textContent.trim() : "";
      var c0 = li.children[0], ps = c0 ? c0.querySelectorAll("p") : [];
      var genre = ps[0] ? ps[0].textContent.trim() : "", artist = ps[1] ? ps[1].textContent.trim() : "";
      var s = songs[no] || (songs[no] = { genre: genre, title: title, artist: artist, lv: {} });
      s.lv[diff(li)] = lv;
    }
    pre.textContent = "家庭用 取得中… LV" + lv + " songs=" + Object.keys(songs).length; pg++; await sleep(DELAY);
  }
}
pre.textContent = "";
var arr = Object.keys(songs).map(function (k) { return songs[k]; });
arr.sort(function (a, b2) { return (b2.lv.EX || b2.lv.H || b2.lv.N || 0) - (a.lv.EX || a.lv.H || a.lv.N || 0); });
function p2(v) { return v == null ? "--" : (v < 10 ? " " + v : "" + v); }
log("=== version=0 (家庭用) : " + arr.length + " songs  (sorted by EX level desc) ===");
log("EX HY NO LI | genre | title | artist");
arr.forEach(function (s) {
  log(p2(s.lv.EX) + " " + p2(s.lv.H) + " " + p2(s.lv.N) + " " + p2(s.lv.L) + " | " + s.genre + " | " + s.title + " | " + s.artist);
});
log("\n--- copy everything above and paste back ---");
})();
