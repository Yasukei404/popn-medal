/* popn medal-census DIAGNOSTIC v9b (mu_top structure probe, fixed).
   Target the actual song-row element (the one whose DIRECT child is the mu_detail
   anchor) and dump it plus its following siblings (the per-difficulty rows). */
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
log("=== mu_top.html STRUCTURE PROBE (v9b) ===");

/* the song-title anchors */
var anchors = Array.prototype.slice.call(doc.querySelectorAll('a[href*="mu_detail"]')).filter(function (a) { return (a.textContent || "").trim().length > 0; });
log("mu_detail anchors (songs) on page 0: " + anchors.length);
var sp = doc.getElementById("s_page");
log("#s_page options: " + (sp ? sp.querySelectorAll("option").length : "(none)"));
log("");

for (var e = 0; e < Math.min(2, anchors.length); e++) {
  var a = anchors[e];
  log("######## SONG " + e + ": " + esc(a.textContent) + " ########");
  /* ancestor path */
  var path = [], p = a;
  for (var u = 0; u < 6 && p; u++) { path.push("<" + p.tagName + (p.id ? "#" + p.id : "") + (p.className ? "." + (p.className + "").split(" ").join(".") : "") + ">"); p = p.parentElement; }
  log("[anchor ancestor path] " + path.join(" < "));
  /* the row element = the anchor's parent that is a direct child of the song-list container.
     Heuristic: climb until the element has following siblings that contain medal imgs. */
  var row = a.parentElement;
  log("[row.outerHTML] " + esc(row.outerHTML).slice(0, 500));
  var sib = row.nextElementSibling, n = 0;
  while (sib && n < 8) {
    var imgs = sib.querySelectorAll("img"), srcs = [];
    for (var i = 0; i < imgs.length; i++) srcs.push((imgs[i].getAttribute("src") || "").split("/").pop());
    log("  [sib" + n + " <" + sib.tagName + " class=" + (sib.className || "") + ">] imgs=[" + srcs.join(", ") + "] text=\"" + esc(sib.textContent).slice(0, 50) + "\"");
    sib = sib.nextElementSibling; n++;
  }
  log("");
}
log("--- copy everything above and paste back ---");
})();
