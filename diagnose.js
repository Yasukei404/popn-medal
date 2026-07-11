/* popn medal-census DIAGNOSTIC v11 (isolate the ~9 cabinet-excluded songs).
   Real cause (confirmed by user): 筐体は「解禁済みの曲」だけ数える。eagate 曲データは
   解禁に関わらず全曲。だから "eagateに記録はあるが筐体で未解禁" の曲が超過になる。
   その曲は EX しか触っていない → L=N=H=none & EX=クリア/FC。
   Sweep 曲データ (mu_top), list songs with THAT tight profile so the 9 pop out.
   ~83 requests. Run on a logged-in playdata page. */
void (async function () {
var B = "https://p.eagate.573.jp/game/popn/popn29/playdata", P = new DOMParser(), D = document, b = D.body, DELAY = 110;
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function dec(r) { return r.arrayBuffer().then(function (a) { return ((r.headers.get("Content-Type") || "").indexOf("UTF-8") < 0 ? new TextDecoder("Shift_JIS") : new TextDecoder()).decode(a); }); }
function get(u) { return fetch(u).then(dec).then(function (t) { return P.parseFromString(t, "text/html"); }); }
var MN = { a: "パーフェクト", b: "FC★", c: "FC◆", d: "FC●", e: "クリア★", f: "クリア◆", g: "クリア●", h: "失敗★", i: "失敗◆", j: "失敗●", k: "イージー", l: "ロングオフ", none: "なし" };
var pre = D.createElement("pre"); pre.style.cssText = "position:fixed;inset:10px;z-index:99999;overflow:auto;background:#000;color:#0f0;font:11px monospace;padding:12px;white-space:pre-wrap;word-break:break-all";
b.innerHTML = ""; b.appendChild(pre);
function log(s) { pre.textContent += s + "\n"; }

var songs = [], seen = {}, pg = 0;
while (1) {
  var doc = await get(B + "/mu_top.html?page=" + pg + "&version=-1&bemani=0&category=0&keyword=&sort=music&sort_type=up");
  var lis = doc.querySelectorAll("ul.mu_list_table>li"); if (!lis.length) break;
  for (var q = 0; q < lis.length; q++) {
    var li = lis[q], a = li.querySelector('a[href*="mu_detail"]'); if (!a) continue;
    var mm = (a.getAttribute("href") || "").match(/[?&]no=([^&"']+)/), no = mm ? mm[1] : a.textContent;
    if (seen[no]) continue; seen[no] = 1;
    var c0 = a.parentElement, ps = c0.querySelectorAll("p");
    var genre = ps[0] ? ps[0].textContent.trim() : "", artist = ps[1] ? ps[1].textContent.trim() : "", title = (a.textContent || "").trim();
    var med = {}, order = ["L", "N", "H", "EX"], slot = c0.nextElementSibling;
    for (var i = 0; i < 4; i++) {
      slot = slot && slot.nextElementSibling; if (!slot) break;
      var sc = (slot.textContent || "").trim();
      if (sc === "-" || sc === "") { med[order[i]] = null; continue; }
      var im = slot.querySelector("img"), md = im && (im.getAttribute("src") || "").match(/meda_([a-z]+)\.png/);
      med[order[i]] = md ? md[1] : "none";
    }
    songs.push({ genre: genre, title: title, artist: artist, med: med });
  }
  pre.textContent = "取得中… " + (pg + 1) + "ページ songs=" + songs.length; pg++; await sleep(DELAY);
}
pre.textContent = "";
log("=== TIGHT PROFILE: all-4-diff exist & L=N=H=none & EX in {b,e,f} ===");
log("total songs: " + songs.length);
var cand = songs.filter(function (s) {
  var m = s.med;
  return m.L && m.N && m.H && m.EX && m.L === "none" && m.N === "none" && m.H === "none" && (m.EX === "b" || m.EX === "e" || m.EX === "f");
});
log("matched: " + cand.length + " songs  (target = 9: 1×FC★ + 3×クリア★ + 5×クリア◆)\n");
["b", "e", "f"].forEach(function (ex) {
  var g = cand.filter(function (s) { return s.med.EX === ex; });
  log("--- EX=" + MN[ex] + " : " + g.length + " songs ---");
  g.forEach(function (s) { log("  " + s.genre + " | " + s.title + "  <" + s.artist + ">"); });
  log("");
});
log("--- copy everything above and paste back ---");
})();
