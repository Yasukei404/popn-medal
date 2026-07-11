/* popn medal-census DIAGNOSTIC v4 (Method B step 2).
   Hypothesis: the ~+32 extra charts are "pop'n 家庭用" (version=0, consumer) songs
   that version=-1 (ALL) includes but the arcade TOTAL MEDALS does not count.
   Sweep version=0 (get its song no-set) and version=-1 (all charts), then report
   version=-1 counts EXCLUDING the version=0 songs. Compare to the arcade numbers. */
void (async function () {
var B = "https://p.eagate.573.jp/game/popn/popn29/playdata", P = new DOMParser(), D = document, b = D.body, DELAY = 90;
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

async function sweepVer(ver, label) {
  var out = [];
  for (var lv = 1; lv <= 50; lv++) {
    var pg = 0;
    while (1) {
      var doc = await get(B + "/mu_lv.html?page=" + pg + "&version=" + ver + "&bemani=0&category=0&keyword=&sort=none&lv=" + lv);
      var L = doc.querySelectorAll("ul.mu_list_lv_table>li"); if (!L.length) break;
      for (var q = 0; q < L.length; q++) {
        var li = L[q]; if (li.className == "st_th") continue;
        var a = li.querySelector('a[href*="mu_detail"]'), mm = a && (a.getAttribute("href") || "").match(/[?&]no=([^&"']+)/);
        out.push({ no: mm ? mm[1] : null, d: diff(li) });
      }
      pre.textContent = label + " 取得中… LV" + lv + " rows=" + out.length; pg++; await sleep(DELAY);
    }
  }
  return out;
}
function counts(rows, exclSet) {
  var seen = {}, per = { LIGHT: 0, NORMAL: 0, HYPER: 0, EX: 0, unknown: 0 }, songs = {};
  rows.forEach(function (r) {
    if (exclSet && exclSet[r.no]) return;
    var k = r.no + "|" + r.d; if (seen[k]) return; seen[k] = 1;
    per[r.d] = (per[r.d] || 0) + 1; songs[r.no] = 1;
  });
  var tot = per.LIGHT + per.NORMAL + per.HYPER + per.EX + (per.unknown || 0);
  return { per: per, tot: tot, songs: Object.keys(songs).length };
}
function fmt(c) { return "L=" + c.per.LIGHT + " N=" + c.per.NORMAL + " H=" + c.per.HYPER + " EX=" + c.per.EX + (c.per.unknown ? " ?=" + c.per.unknown : "") + "  total=" + c.tot + "  songs=" + c.songs; }

var v0 = await sweepVer(0, "version=0(家庭用)");
var S0 = {}; v0.forEach(function (r) { S0[r.no] = 1; });
var vAll = await sweepVer(-1, "version=-1(ALL)");
pre.textContent = "";

log("=== METHOD B: exclude 家庭用(version=0) ? ===");
log("arcade target      : L=1219 N=2064 H=2029 EX=1901  total=7213");
log("");
log("version=0 (家庭用) : " + fmt(counts(v0, null)));
log("version=-1 (ALL)   : " + fmt(counts(vAll, null)));
log("ALL minus 家庭用no : " + fmt(counts(vAll, S0)));
log("");
log("(if 'ALL minus 家庭用no' == arcade target, excluding version=0 songs is the fix)");
log("\n--- copy everything above and paste back ---");
})();
