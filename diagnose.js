/* popn medal-census DIAGNOSTIC v8 (probe mu_detail structure).
   Investigate whether the per-song detail page exposes arcade-availability info
   (収録バージョン / version folders / etc.) that could tell which songs the arcade
   TOTAL MEDALS counts. Dumps the detail page structure for a few songs. */
void (async function () {
var B = "https://p.eagate.573.jp/game/popn/popn29/playdata", P = new DOMParser(), D = document, b = D.body;
function dec(r) { return r.arrayBuffer().then(function (a) { return ((r.headers.get("Content-Type") || "").indexOf("UTF-8") < 0 ? new TextDecoder("Shift_JIS") : new TextDecoder()).decode(a); }); }
function get(u) { return fetch(u).then(dec).then(function (t) { return P.parseFromString(t, "text/html"); }); }
var pre = D.createElement("pre"); pre.style.cssText = "position:fixed;inset:10px;z-index:99999;overflow:auto;background:#000;color:#0f0;font:11px monospace;padding:12px;white-space:pre-wrap;word-break:break-all";
b.innerHTML = ""; b.appendChild(pre);
function log(s) { pre.textContent += s + "\n"; }

/* grab a few song no's + titles from a level list */
pre.textContent = "曲リスト取得中…";
var doc0 = await get(B + "/mu_lv.html?page=0&version=-1&bemani=0&category=0&keyword=&sort=none&lv=45");
var lis = doc0.querySelectorAll("ul.mu_list_lv_table>li");
var targets = [];
for (var i = 0; i < lis.length && targets.length < 3; i++) {
  var li = lis[i]; if (li.className == "st_th") continue;
  var a = li.querySelector('a[href*="mu_detail"]'), mm = a && (a.getAttribute("href") || "").match(/[?&]no=([^&"']+)/);
  if (mm) targets.push({ no: mm[1], title: (li.querySelector("a") || {}).textContent || "" });
}
pre.textContent = "";
log("=== mu_detail STRUCTURE PROBE ===");
for (var t = 0; t < targets.length; t++) {
  var tg = targets[t];
  log("\n############ no=" + tg.no + "  title=" + tg.title + " ############");
  var d;
  try { d = await get(B + "/mu_detail.html?no=" + encodeURIComponent(tg.no) + "&back=index"); } catch (e) { log("fetch error: " + e.message); continue; }
  /* element ids present */
  var ided = d.querySelectorAll("[id]"); var ids = [];
  for (var x = 0; x < ided.length; x++) ids.push(ided[x].id);
  log("[ids] " + ids.join(", "));
  /* any element whose text mentions version/収録/対応 keywords */
  var all = d.querySelectorAll("body *"), hits = [];
  for (var y = 0; y < all.length; y++) {
    var el = all[y]; if (el.children.length) continue; /* leaf text nodes only */
    var tx = (el.textContent || "").trim();
    if (!tx) continue;
    if (/バージョン|収録|対応|VERSION|Lively|ライブリ|家庭用|AC|アーケード/.test(tx)) hits.push(el.tagName + (el.className ? "." + el.className : "") + ": " + tx.slice(0, 60));
  }
  log("[version/収録 keyword hits] " + (hits.length ? "\n  " + hits.slice(0, 20).join("\n  ") : "(none)"));
  /* trimmed full text of the detail page for manual inspection */
  var txt = (d.body.textContent || "").replace(/\s+/g, " ").trim();
  log("[body text ~900chars] " + txt.slice(0, 900));
}
log("\n--- copy everything above and paste back ---");
})();
