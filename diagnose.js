/* popn medal-census DIAGNOSTIC v10 (narrow the 9 arcade-excluded songs).
   Deduced: the 9 extras have all 4 difficulties, LIGHT = none (unplayed), and
   EX medal in {b=フルコンボ★ x1, e=クリア★ x3, f=クリア◆ x5}.
   Sweep 曲データ (mu_top), list songs matching that profile with genre/title and
   their N/H medals so we can pin the 9. ~83 requests. */
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
    var genre = ps[0] ? ps[0].textContent.trim() : "", title = (a.textContent || "").trim();
    var med = {}, order = ["L", "N", "H", "EX"], slot = c0.nextElementSibling;
    for (var i = 0; i < 4; i++) {
      slot = slot && slot.nextElementSibling; if (!slot) break;
      var sc = (slot.textContent || "").trim();
      if (sc === "-" || sc === "") { med[order[i]] = null; continue; }
      var im = slot.querySelector("img"), md = im && (im.getAttribute("src") || "").match(/meda_([a-z]+)\.png/);
      med[order[i]] = md ? md[1] : "none";
    }
    songs.push({ genre: genre, title: title, med: med });
  }
  pre.textContent = "取得中… " + (pg + 1) + "ページ songs=" + songs.length; pg++; await sleep(DELAY);
}
pre.textContent = "";
log("=== CANDIDATE FILTER: all-4-diff & LIGHT=none & EX in {b,e,f} ===");
log("total songs: " + songs.length);
var cand = songs.filter(function (s) {
  return s.med.L && s.med.N && s.med.H && s.med.EX && s.med.L === "none" && (s.med.EX === "b" || s.med.EX === "e" || s.med.EX === "f");
});
["b", "e", "f"].forEach(function (ex) {
  var g = cand.filter(function (s) { return s.med.EX === ex; });
  log("\n--- EX=" + MN[ex] + " : " + g.length + " songs (need " + (ex === "b" ? 1 : ex === "e" ? 3 : 5) + ") ---");
  g.forEach(function (s) { log("[N=" + MN[s.med.N] + " H=" + MN[s.med.H] + "] " + s.genre + " | " + s.title); });
});
log("\n--- copy everything above and paste back ---");
})();
