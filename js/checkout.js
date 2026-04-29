(function (global) {
  var Storage = global.RestaurantStorage;
  var Cart = global.RestaurantCart;

  var qrInstance = null;

  function formatInr(n) {
    return "₹" + Number(n).toFixed(2);
  }

  function buildUpiUri(upiId, payeeName, amount) {
    var pa = encodeURIComponent(upiId.trim());
    var pn = encodeURIComponent((payeeName || "Merchant").trim());
    var am = Number(amount).toFixed(2);
    return "upi://pay?pa=" + pa + "&pn=" + pn + "&am=" + am + "&cu=INR";
  }

  function clearQrContainer(el) {
    if (!el) return;
    el.innerHTML = "";
    qrInstance = null;
  }

  function renderQr(el, text) {
    clearQrContainer(el);
    if (typeof QRCode === "function") {
      try {
        var opts = {
          text: text,
          width: 200,
          height: 200,
          colorDark: "#000000",
          colorLight: "#ffffff",
        };
        if (QRCode.CorrectLevel) {
          opts.correctLevel = QRCode.CorrectLevel.M;
        }
        qrInstance = new QRCode(el, opts);
      } catch (err) {
        el.textContent = "Could not generate QR. Pay using UPI apps with this link: " + text;
      }
    } else {
      el.innerHTML =
        '<p style="color:#8b9cb3;font-size:0.85rem;">QR library failed to load. Pay manually: <code style="word-break:break-all">' +
        text.replace(/</g, "&lt;") +
        "</code></p>";
    }
  }

  function openPayModal(modalEl, qrEl, amountEl) {
    var settings = Storage.getSettings();
    var total = Cart.getTotal();
    if (total <= 0) return false;
    if (!settings.upiId || !settings.upiId.trim()) {
      alert("Please set your UPI ID under Manage menu → Payment settings.");
      return false;
    }
    var uri = buildUpiUri(settings.upiId, settings.payeeName, total);
    amountEl.textContent = formatInr(total);
    renderQr(qrEl, uri);
    modalEl.hidden = false;
    return true;
  }

  function closePayModal(modalEl, qrEl) {
    modalEl.hidden = true;
    clearQrContainer(qrEl);
  }

  function confirmPayment() {
    var lines = Cart.getLines();
    if (lines.length === 0) return null;
    var total = Cart.getTotal();
    var order = {
      id: "o-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6),
      dateISO: new Date().toISOString(),
      items: lines.map(function (l) {
        return { name: l.name, price: l.price, qty: l.qty };
      }),
      total: total,
    };
    Storage.appendOrder(order);
    Cart.clear();
    return order;
  }

  global.RestaurantCheckout = {
    formatInr: formatInr,
    buildUpiUri: buildUpiUri,
    openPayModal: openPayModal,
    closePayModal: closePayModal,
    confirmPayment: confirmPayment,
  };
})(typeof window !== "undefined" ? window : this);
