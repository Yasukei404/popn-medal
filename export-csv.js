/* popn 曲データ CSV エクスポート.
   Sweep 曲データ (mu_top.html) 全ページ、取得できた全曲を CSV でダウンロード。
   列: no, ジャンル, 曲名, アーティスト, LIGHT, NORMAL, HYPER, EX
   譜面なし=空欄, 未プレイ=メダルなし。~83 requests。ログイン状態のプレイデータページで実行。 */
void (async function () {
var B = "https://p.eagate.573.jp/game/popn/popn29/playdata", P = new DOMParser(), D = document, b = D.body, DELAY = 110;
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function dec(r) { return r.arrayBuffer().then(function (a) { return ((r.headers.get("Content-Type") || "").indexOf("UTF-8") < 0 ? new TextDecoder("Shift_JIS") : new TextDecoder()).decode(a); }); }
function get(u) { return fetch(u).then(dec).then(function (t) { return P.parseFromString(t, "text/html"); }); }
var MN = { a: "パーフェクト", b: "FC★", c: "FC◆", d: "FC●", e: "クリア★", f: "クリア◆", g: "クリア●", h: "失敗★", i: "失敗◆", j: "失敗●", k: "イージー", l: "ロングオフ", none: "メダルなし" };
var pre = D.createElement("pre"); pre.style.cssText = "position:fixed;inset:10px;z-index:99999;overflow:auto;background:#000;color:#0f0;font:12px monospace;padding:12px;white-space:pre-wrap;word-break:break-all";
b.innerHTML = ""; b.appendChild(pre);
function log(s) { pre.textContent += s + "\n"; }

var songs = [], seen = {}, pg = 0;
while (1) {
  var doc = await get(B + "/mu_top.html?page=" + pg + "&version=-1&bemani=0&category=0&keyword=&sort=music&sort_type=up");
  var lis = doc.querySelectorAll("ul.mu_list_table>li"); if (!lis.length) break;
  for (var q = 0; q < lis.length; q++) {
    var li = lis[q], a = li.querySelector('a[href*="mu_detail"]'); if (!a) continue;
    var mm = (a.getAttribute("href") || "").match(/[?&]no=([^&"']+)/), no = mm ? decodeURIComponent(mm[1]) : "";
    if (seen[no]) continue; seen[no] = 1;
    var c0 = a.parentElement, ps = c0.querySelectorAll("p");
    var genre = ps[0] ? ps[0].textContent.trim() : "", artist = ps[1] ? ps[1].textContent.trim() : "", title = (a.textContent || "").trim();
    var med = {}, order = ["L", "N", "H", "EX"], slot = c0.nextElementSibling;
    for (var i = 0; i < 4; i++) {
      slot = slot && slot.nextElementSibling;
      if (!slot) { med[order[i]] = ""; continue; }
      var sc = (slot.textContent || "").trim();
      if (sc === "-" || sc === "") { med[order[i]] = ""; continue; } /* 譜面なし */
      var im = slot.querySelector("img"), md = im && (im.getAttribute("src") || "").match(/meda_([a-z]+)\.png/);
      med[order[i]] = MN[md ? md[1] : "none"] || "メダルなし";
    }
    songs.push({ no: no, genre: genre, title: title, artist: artist, med: med });
  }
  pre.textContent = "取得中… " + (pg + 1) + "ページ  " + songs.length + " 曲"; pg++; await sleep(DELAY);
}

function esc(v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; }
var rows = [["no", "ジャンル", "曲名", "アーティスト", "LIGHT", "NORMAL", "HYPER", "EX"].join(",")];
songs.forEach(function (s) {
  rows.push([s.no, s.genre, s.title, s.artist, s.med.L, s.med.N, s.med.H, s.med.EX].map(esc).join(","));
});
var csv = "﻿" + rows.join("\r\n");
var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
var url = URL.createObjectURL(blob);
var a = D.createElement("a"); a.href = url; a.download = "popn29_songs.csv"; D.body.appendChild(a); a.click();
setTimeout(function () { URL.revokeObjectURL(url); }, 4000);

pre.textContent = "";
log("完了：" + songs.length + " 曲を popn29_songs.csv にダウンロードしました。");
log("（ダウンロードが始まらない場合は下のリンクをクリック）");
var link = D.createElement("a"); link.href = url; link.download = "popn29_songs.csv";
link.textContent = "▶ popn29_songs.csv をダウンロード";
link.style.cssText = "color:#8cf;font:14px monospace;display:block;margin-top:10px";
pre.appendChild(link);
})();
