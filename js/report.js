(function (global) {
  var Storage = global.RestaurantStorage;
  var Checkout = global.RestaurantCheckout;

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function parseMonth(value) {
    if (!value || typeof value !== "string") return null;
    var parts = value.split("-");
    if (parts.length !== 2) return null;
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    if (isNaN(y) || isNaN(m) || m < 1 || m > 12) return null;
    return { year: y, month: m };
  }

  function orderInMonth(order, ym) {
    if (!ym || !order.dateISO) return false;
    var d = new Date(order.dateISO);
    if (isNaN(d.getTime())) return false;
    return d.getFullYear() === ym.year && d.getMonth() + 1 === ym.month;
  }

  function filterOrdersForMonth(monthValue) {
    var ym = parseMonth(monthValue);
    if (!ym) return [];
    return Storage.getOrders().filter(function (o) {
      return orderInMonth(o, ym);
    });
  }

  function summarize(orders) {
    var count = orders.length;
    var revenue = 0;
    for (var i = 0; i < orders.length; i++) {
      revenue += Number(orders[i].total) || 0;
    }
    revenue = Math.round(revenue * 100) / 100;
    return { count: count, revenue: revenue };
  }

  function formatItemsSummary(items) {
    if (!items || !items.length) return "—";
    return items
      .map(function (it) {
        return escapeHtml(it.name) + " ×" + it.qty;
      })
      .join(", ");
  }

  function renderReport(monthInput, summaryEl, tbodyEl) {
    var monthVal = monthInput.value;
    if (!monthVal) {
      summaryEl.innerHTML = "<p class=\"cart-empty\">Select a month.</p>";
      tbodyEl.innerHTML = "";
      return;
    }
    var orders = filterOrdersForMonth(monthVal);
    var s = summarize(orders);
    summaryEl.innerHTML =
      '<div class="report-stat"><strong>Orders</strong><span>' +
      s.count +
      '</span></div><div class="report-stat"><strong>Revenue</strong><span>' +
      Checkout.formatInr(s.revenue) +
      "</span></div>";

    if (orders.length === 0) {
      tbodyEl.innerHTML =
        '<tr><td colspan="4" class="cart-empty">No sales this month.</td></tr>';
      return;
    }

    var rows = orders
      .slice()
      .sort(function (a, b) {
        return new Date(b.dateISO) - new Date(a.dateISO);
      })
      .map(function (o) {
        var d = new Date(o.dateISO);
        var dateStr = isNaN(d.getTime()) ? o.dateISO : d.toLocaleString();
        return (
          "<tr><td>" +
          escapeHtml(dateStr) +
          "</td><td>" +
          escapeHtml(o.id) +
          "</td><td>" +
          formatItemsSummary(o.items) +
          "</td><td>" +
          Checkout.formatInr(o.total) +
          "</td></tr>"
        );
      })
      .join("");
    tbodyEl.innerHTML = rows;
  }

  function setDefaultMonth(monthInput) {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    monthInput.value = y + "-" + m;
  }

  global.RestaurantReport = {
    filterOrdersForMonth: filterOrdersForMonth,
    renderReport: renderReport,
    setDefaultMonth: setDefaultMonth,
  };
})(typeof window !== "undefined" ? window : this);
