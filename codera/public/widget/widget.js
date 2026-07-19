/**
 * Codera embeddable try-on widget.
 *
 * Drop on any product page (Shopify, custom site, etc.):
 *   <script src="https://app.codera.app/widget.js"
 *           data-store="noor" data-product="123"></script>
 *
 * Renders a "جرّبيها" button that opens the Codera try-on experience for the
 * given product in an overlay iframe. The heavy lifting stays server-side.
 */
(function () {
  var script = document.currentScript;
  var store = script.getAttribute('data-store');
  var product = script.getAttribute('data-product');
  var origin = new URL(script.src).origin;
  var label = script.getAttribute('data-label') || 'جرّبيها بالذكاء الاصطناعي';
  if (!store) { console.warn('[Codera] data-store is required'); return; }

  var btn = document.createElement('button');
  btn.textContent = '✨ ' + label;
  btn.setAttribute('dir', 'rtl');
  btn.style.cssText = 'display:inline-flex;align-items:center;gap:8px;background:linear-gradient(180deg,#e6c56f,#c9a24a);color:#2a2113;border:none;border-radius:999px;padding:12px 22px;font-weight:800;font-size:15px;cursor:pointer;font-family:Tahoma,sans-serif';

  var overlay, iframe;
  btn.onclick = function () {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:2147483000;display:flex;align-items:center;justify-content:center';
      overlay.onclick = function (e) { if (e.target === overlay) overlay.style.display = 'none'; };
      iframe = document.createElement('iframe');
      var src = origin + '/store?tenant=' + encodeURIComponent(store) + (product ? '&product=' + encodeURIComponent(product) : '') + '&embed=1';
      iframe.src = src;
      iframe.style.cssText = 'width:100%;max-width:760px;height:92vh;border:none;border-radius:18px;background:#100e0c;box-shadow:0 20px 60px rgba(0,0,0,.6)';
      overlay.appendChild(iframe);
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
  };

  if (script.parentNode) script.parentNode.insertBefore(btn, script.nextSibling);
})();
