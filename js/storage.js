(function (global) {
  var KEYS = {
    menu: "restaurant_menu",
    orders: "restaurant_orders",
    settings: "restaurant_settings",
  };

  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getMenu() {
    return readJson(KEYS.menu, null);
  }

  function setMenu(items) {
    writeJson(KEYS.menu, items);
  }

  function getOrders() {
    var list = readJson(KEYS.orders, []);
    return Array.isArray(list) ? list : [];
  }

  function setOrders(list) {
    writeJson(KEYS.orders, list);
  }

  function appendOrder(order) {
    var list = getOrders();
    list.push(order);
    setOrders(list);
    return order;
  }

  function getSettings() {
    var s = readJson(KEYS.settings, {});
    return {
      upiId: typeof s.upiId === "string" ? s.upiId : "",
      payeeName: typeof s.payeeName === "string" ? s.payeeName : "Restaurant",
    };
  }

  function setSettings(settings) {
    writeJson(KEYS.settings, {
      upiId: settings.upiId || "",
      payeeName: settings.payeeName || "Restaurant",
    });
  }

  global.RestaurantStorage = {
    KEYS: KEYS,
    getMenu: getMenu,
    setMenu: setMenu,
    getOrders: getOrders,
    setOrders: setOrders,
    appendOrder: appendOrder,
    getSettings: getSettings,
    setSettings: setSettings,
  };
})(typeof window !== "undefined" ? window : this);
