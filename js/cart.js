(function (global) {
  var lines = [];

  function findIndexById(menuId) {
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].id === menuId) return i;
    }
    return -1;
  }

  function addItem(menuItem) {
    var id = menuItem.id;
    var name = menuItem.name;
    var price = Number(menuItem.price) || 0;
    var idx = findIndexById(id);
    if (idx >= 0) {
      lines[idx].qty += 1;
    } else {
      lines.push({ id: id, name: name, price: price, qty: 1 });
    }
  }

  function setQty(menuId, qty) {
    var q = parseInt(qty, 10);
    if (isNaN(q) || q < 1) q = 1;
    var idx = findIndexById(menuId);
    if (idx < 0) return;
    lines[idx].qty = q;
  }

  function increment(menuId) {
    var idx = findIndexById(menuId);
    if (idx < 0) return;
    lines[idx].qty += 1;
  }

  function decrement(menuId) {
    var idx = findIndexById(menuId);
    if (idx < 0) return;
    lines[idx].qty -= 1;
    if (lines[idx].qty < 1) {
      lines.splice(idx, 1);
    }
  }

  function clear() {
    lines = [];
  }

  function getLines() {
    return lines.map(function (l) {
      return { id: l.id, name: l.name, price: l.price, qty: l.qty };
    });
  }

  function getTotal() {
    var t = 0;
    for (var i = 0; i < lines.length; i++) {
      t += lines[i].price * lines[i].qty;
    }
    return Math.round(t * 100) / 100;
  }

  function isEmpty() {
    return lines.length === 0;
  }

  global.RestaurantCart = {
    addItem: addItem,
    setQty: setQty,
    increment: increment,
    decrement: decrement,
    clear: clear,
    getLines: getLines,
    getTotal: getTotal,
    isEmpty: isEmpty,
  };
})(typeof window !== "undefined" ? window : this);
