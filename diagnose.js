/* popn medal-census DIAGNOSTIC v5 (Method B step 3).
   The extras are ~9 songs among the 125 "pop'n 家庭用" (version=0) songs that the
   arcade does NOT count. Dump all version=0 songs (deduped by no) with
   genre / title / artist / difficulties so we can cross-check which are AC-unlisted. */
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

var songs = {}; /* no -> {genre,title,artist,diffs:{}} */
for (var lv = 1; lv <= 50; lv++) {
  var pg = 0;
  while (1) {
    var doc = await get(B + "/mu_lv.html?page=" + pg + "&version=0&bemani=0&category=0&keyword=&sort=none&lv=" + lv);
    var L = doc.querySelectorAll("ul.mu_list_lv_table>li"); if (!L.length) break;
    for (var q = 0; q < L.length; q++) {
      var li = L[q]; if (li.className == "st_th") continue;
      var a = li.querySelector('a[href*="mu_detail"]'), mm = a && (a.getAttribute("href") || "").match(/[?&]no=([^&"']+)/), no = mm ? mm[1] : ("?" + q);
      var titleA = li.querySelector("a"), title = titleA ? titleA.textContent.trim() : "";
      var c0 = li.children[0], ps = c0 ? c0.querySelectorAll("p") : [];
      var genre = ps[0] ? ps[0].textContent.trim() : "", artist = ps[1] ? ps[1].textContent.trim() : "";
      var s = songs[no] || (songs[no] = { genre: genre, title: title, artist: artist, diffs: {} });
      s.diffs[diff(li)] = 1;
    }
    pre.textContent = "家庭用 取得中… LV" + lv + " songs=" + Object.keys(songs).length; pg++; await sleep(DELAY);
  }
}
pre.textContent = "";
var keys = Object.keys(songs);
log("=== version=0 (家庭用) SONGS : " + keys.length + " ===");
log("format: genre | title | artist | diffs");
keys.forEach(function (no) {
  var s = songs[no], dl = ["L", "N", "H", "EX"].filter(function (d) { return s.diffs[d]; }).join(",");
  log(s.genre + " | " + s.title + " | " + s.artist + " | " + dl);
});
log("\n--- copy everything above and paste back ---");
})();
