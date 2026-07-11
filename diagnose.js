/* popn medal-census DIAGNOSTIC v9 (mu_top structure probe).
   Rebuild target: enumerate songs via 曲データ (mu_top.html) instead of level list.
   Dump the exact DOM layout of the first few song entries + their difficulty rows,
   so we can parse difficulty by position and medal reliably. 1 request. */
void (async function () {
var B = "https://p.eagate.573.jp/game/popn/popn29/playdata", P = new DOMParser(), D = document, b = D.body;
function dec(r) { return r.arrayBuffer().then(function (a) { return ((r.headers.get("Content-Type") || "").indexOf("UTF-8") < 0 ? new TextDecoder("Shift_JIS") : new TextDecoder()).decode(a); }); }
function get(u) { return fetch(u).then(dec).then(function (t) { return P.parseFromString(t, "text/html"); }); }
var pre = D.createElement("pre"); pre.style.cssText = "position:fixed;inset:10px;z-index:99999;overflow:auto;background:#000;color:#0f0;font:11px monospace;padding:12px;white-space:pre-wrap;word-break:break-all";
b.innerHTML = ""; b.appendChild(pre);
function log(s) { pre.textContent += s + "\n"; }
function esc(s) { return (s || "").replace(/</g, "&lt;").replace(/\s+/g, " ").trim(); }

pre.textContent = "mu_top 取得中…";
var doc = await get(B + "/mu_top.html?page=0&version=-1&bemani=0&category=0&keyword=&sort=music&sort_type=up");
pre.textContent = "";
log("=== mu_top.html STRUCTURE PROBE ===");

/* song entries = divs containing an <a href*=mu_detail> with text */
var divs = Array.prototype.slice.call(doc.querySelectorAll("div"));
var entries = divs.filter(function (dv) { var a = dv.querySelector("a"); return a && (a.getAttribute("href") || "").indexOf("mu_detail") >= 0 && (a.textContent || "").trim().length > 0; });
log("song-entry divs on page 0: " + entries.length);
var sp = doc.getElementById("s_page");
log("pagination #s_page options: " + (sp ? sp.querySelectorAll("option").length : "(none)"));
log("");

/* dump first 3 entries + their following siblings */
for (var e = 0; e < Math.min(3, entries.length); e++) {
  var en = entries[e];
  log("######## ENTRY " + e + " ########");
  log("[entry.outerHTML] " + esc(en.outerHTML).slice(0, 400));
  var sib = en.nextElementSibling, n = 0;
  while (sib && n < 7) {
    var imgs = sib.querySelectorAll ? sib.querySelectorAll("img") : [];
    var srcs = [];
    for (var i = 0; i < imgs.length; i++) srcs.push((imgs[i].getAttribute("src") || "").split("/").pop());
    log("  [sib" + n + " <" + sib.tagName + " class=" + (sib.className || "") + ">] imgs=[" + srcs.join(", ") + "] text=\"" + esc(sib.textContent).slice(0, 60) + "\"");
    sib = sib.nextElementSibling; n++;
  }
  log("");
}
log("--- copy everything above and paste back ---");
})();
