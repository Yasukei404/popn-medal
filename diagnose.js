/* popn medal-census DIAGNOSTIC v3 (Method B step 1).
   Dump the filter <select> options (version / bemani / category) available on the
   playdata list page, so we can see what "version" values exist to cross-check the
   song set against version=-1. Cheap: a couple of requests. Output is copyable. */
void (async function () {
var B = "https://p.eagate.573.jp/game/popn/popn29/playdata", P = new DOMParser(), D = document, b = D.body;
function dec(r) { return r.arrayBuffer().then(function (a) { return ((r.headers.get("Content-Type") || "").indexOf("UTF-8") < 0 ? new TextDecoder("Shift_JIS") : new TextDecoder()).decode(a); }); }
function get(u) { return fetch(u).then(dec).then(function (t) { return P.parseFromString(t, "text/html"); }); }
var pre = D.createElement("pre"); pre.style.cssText = "position:fixed;inset:10px;z-index:99999;overflow:auto;background:#000;color:#0f0;font:11px monospace;padding:12px;white-space:pre-wrap;word-break:break-all";
b.innerHTML = ""; b.appendChild(pre);
function log(s) { pre.textContent += s + "\n"; }

log("=== FILTER OPTIONS DUMP ===");
var urls = [B + "/mu_top.html?page=0&version=-1&bemani=0&category=0&keyword=&sort=music&sort_type=up", B + "/mu_lv.html?page=0&version=-1&bemani=0&category=0&keyword=&sort=none&lv=1"];
for (var u = 0; u < urls.length; u++) {
  log("\n### URL: " + urls[u].replace(B, "") + " ###");
  var doc;
  try { doc = await get(urls[u]); } catch (e) { log("fetch error: " + e.message); continue; }
  var sels = doc.querySelectorAll("select");
  log("selects found: " + sels.length);
  for (var s = 0; s < sels.length; s++) {
    var sel = sels[s], nm = sel.getAttribute("name") || sel.id || ("select#" + s);
    var opts = sel.querySelectorAll("option");
    log("\n[select name=" + nm + "] (" + opts.length + " options)");
    for (var o = 0; o < opts.length; o++) {
      log("  value=" + JSON.stringify(opts[o].getAttribute("value")) + "  text=" + JSON.stringify(opts[o].textContent.trim()));
    }
  }
  /* also show any form action / hidden inputs that hint at parameters */
  var forms = doc.querySelectorAll("form");
  for (var f = 0; f < forms.length; f++) {
    var hid = forms[f].querySelectorAll("input[type=hidden]");
    if (hid.length) { log("\n[form action=" + JSON.stringify(forms[f].getAttribute("action")) + "] hidden:"); for (var h = 0; h < hid.length; h++) log("  " + hid[h].getAttribute("name") + "=" + JSON.stringify(hid[h].getAttribute("value"))); }
  }
}
log("\n--- copy everything above and paste back ---");
})();
