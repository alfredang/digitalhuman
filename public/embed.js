/* Tertiary Infotech — Digital Human Educator embed loader.
 * Usage: <script src="https://YOUR_APP/embed.js" data-avatar="EMBED_KEY" async></script>
 * Optional attributes: data-color="#4f46e5", data-position="right|left"
 */
(function () {
  var current =
    document.currentScript ||
    (function () {
      var s = document.getElementsByTagName("script");
      return s[s.length - 1];
    })();
  if (!current) return;

  var key = current.getAttribute("data-avatar");
  if (!key) {
    console.error("[DigitalHuman] Missing data-avatar attribute on embed script.");
    return;
  }
  var origin = new URL(current.src).origin;
  var color = current.getAttribute("data-color") || "#4f46e5";
  var side = current.getAttribute("data-position") === "left" ? "left" : "right";

  // Floating launcher button
  var btn = document.createElement("button");
  btn.setAttribute("aria-label", "Chat with our AI course advisor");
  btn.innerHTML = "💬";
  styleBtn(btn);

  // Chat panel (iframe)
  var panel = document.createElement("div");
  panel.style.cssText = [
    "position:fixed",
    "bottom:88px",
    side + ":20px",
    "width:380px",
    "max-width:calc(100vw - 40px)",
    "height:600px",
    "max-height:calc(100vh - 120px)",
    "z-index:2147483647",
    "border-radius:18px",
    "overflow:hidden",
    "box-shadow:0 12px 48px rgba(0,0,0,.25)",
    "display:none",
    "background:#fff",
  ].join(";");

  var iframe = document.createElement("iframe");
  iframe.src = origin + "/embed/" + encodeURIComponent(key);
  iframe.allow = "microphone; autoplay; camera";
  iframe.style.cssText = "width:100%;height:100%;border:0;";
  panel.appendChild(iframe);

  var open = false;
  btn.addEventListener("click", function () {
    open = !open;
    panel.style.display = open ? "block" : "none";
    btn.innerHTML = open ? "✕" : "💬";
  });

  function styleBtn(b) {
    b.style.cssText = [
      "position:fixed",
      "bottom:20px",
      side + ":20px",
      "width:60px",
      "height:60px",
      "border-radius:50%",
      "border:0",
      "cursor:pointer",
      "font-size:26px",
      "color:#fff",
      "background:" + color,
      "box-shadow:0 6px 20px rgba(0,0,0,.25)",
      "z-index:2147483647",
    ].join(";");
  }

  function mount() {
    document.body.appendChild(btn);
    document.body.appendChild(panel);
  }
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
