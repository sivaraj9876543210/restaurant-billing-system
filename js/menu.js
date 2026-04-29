(function (global) {
  var Storage = global.RestaurantStorage;

  var PLACEHOLDER_IMG =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240"><rect fill="#2a3444" width="320" height="240"/><text x="160" y="125" text-anchor="middle" fill="#8b9cb3" font-family="sans-serif" font-size="14">No image</text></svg>'
    );

  /* Default menu items. Edit in Manage menu anytime. */
  var DEFAULT_MENU = [
    {
      id: "seed-idly",
      name: "Idly",
      price: 40,
      image: "images/idly.jpg",
    },
    {
      id: "seed-vadai",
      name: "Vadai",
      price: 15,
      image: "images/vadai.jpg",
    },
    {
      id: "seed-poori",
      name: "Poori",
      price: 55,
      image: "images/poori.jpg",
    },
    {
      id: "seed-pongal",
      name: "Pongal",
      price: 50,
      image: "images/pongal.jpg",
    },
    {
      id: "seed-chapati",
      name: "Chapati",
      price: 35,
      image: "images/chapati.jpg",
    },
    {
      id: "seed-dosai",
      name: "Dosai",
      price: 60,
      image: "images/dosai.jpg",
    },
    {
      id: "seed-masal-dosai",
      name: "Masal Dosai",
      price: 80,
      image: "images/masal-dosai.jpg",
    },
    {
      id: "seed-tea",
      name: "Tea",
      price: 15,
      image: "images/tea.jpg",
    },
    {
      id: "seed-chicken-briyani",
      name: "Chicken Briyani",
      price: 160,
      image: "images/chicken-briyani.jpg",
    },
    {
      id: "seed-mutton-briyani",
      name: "Mutton Briyani",
      price: 220,
      image: "images/mutton-briyani.jpg",
    },
    {
      id: "seed-kushka",
      name: "Kushka",
      price: 120,
      image: "images/kushka.jpg",
    },
    {
      id: "seed-chicken-rice",
      name: "Chicken Rice",
      price: 150,
      image: "images/chicken-rice.jpg",
    },
    {
      id: "seed-egg-rice",
      name: "Egg Rice",
      price: 130,
      image: "images/egg-rice.jpg",
    },
    {
      id: "seed-noodles",
      name: "Noodles",
      price: 120,
      image: "images/noodles.jpg",
    },
    {
      id: "seed-parota",
      name: "Parota",
      price: 20,
      image: "images/parota.jpg",
    },
    {
      id: "seed-kothu-parota",
      name: "Kothu Parota",
      price: 160,
      image: "images/kothu-parota.jpg",
    },
  ];

  function generateId() {
    return "m-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function ensureMenuSeeded() {
    var menu = Storage.getMenu();
    if (!menu || !Array.isArray(menu) || menu.length === 0) {
      Storage.setMenu(JSON.parse(JSON.stringify(DEFAULT_MENU)));
    }
  }

  function getAll() {
    ensureMenuSeeded();
    return Storage.getMenu();
  }

  function normalizeItem(item) {
    return {
      id: item.id,
      name: String(item.name || "").trim(),
      price: Math.max(0, Number(item.price) || 0),
      image: String(item.image || "").trim() || PLACEHOLDER_IMG,
    };
  }

  function addItem(data) {
    var list = getAll();
    var item = normalizeItem({
      id: generateId(),
      name: data.name,
      price: data.price,
      image: data.image,
    });
    if (!item.name) return null;
    list.push(item);
    Storage.setMenu(list);
    return item;
  }

  function updateItem(id, data) {
    var list = getAll();
    var idx = list.findIndex(function (x) {
      return x.id === id;
    });
    if (idx === -1) return null;
    var merged = normalizeItem({
      id: id,
      name: data.name != null ? data.name : list[idx].name,
      price: data.price != null ? data.price : list[idx].price,
      image: data.image != null ? data.image : list[idx].image,
    });
    if (!merged.name) return null;
    list[idx] = merged;
    Storage.setMenu(list);
    return merged;
  }

  function deleteItem(id) {
    var list = getAll();
    var next = list.filter(function (x) {
      return x.id !== id;
    });
    if (next.length === list.length) return false;
    Storage.setMenu(next);
    return true;
  }

  function getPlaceholderImage() {
    return PLACEHOLDER_IMG;
  }

  global.RestaurantMenu = {
    DEFAULT_MENU: DEFAULT_MENU,
    getAll: getAll,
    addItem: addItem,
    updateItem: updateItem,
    deleteItem: deleteItem,
    ensureMenuSeeded: ensureMenuSeeded,
    getPlaceholderImage: getPlaceholderImage,
  };
})(typeof window !== "undefined" ? window : this);
