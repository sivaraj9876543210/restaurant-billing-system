(function () {
  var Menu = window.RestaurantMenu;
  var Cart = window.RestaurantCart;
  var Storage = window.RestaurantStorage;
  var Checkout = window.RestaurantCheckout;
  var Report = window.RestaurantReport;

  var els = {};
  var uploadedImageDataUrl = "";

  function $(id) {
    return document.getElementById(id);
  }

  function formatInr(n) {
    return Checkout.formatInr(n);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function bindImageFallback(img, ph) {
    img.onerror = function () {
      this.onerror = null;
      this.src = ph;
    };
  }

  function isValidImagePath(value) {
    if (!value) return true;
    return /\\.(jpg|jpeg|png)(?:[?#].*)?$/i.test(value);
  }

  function isValidImageFile(file) {
    if (!file) return false;
    return /image\/(jpeg|png)/i.test(file.type) || /\.(jpg|jpeg|png)$/i.test(file.name || "");
  }

  function clearUploadedPreview() {
    uploadedImageDataUrl = "";
    if (els.menuImageFile) {
      els.menuImageFile.value = "";
    }
    if (els.menuImageUploadPreviewWrap) {
      els.menuImageUploadPreviewWrap.hidden = true;
    }
    if (els.menuImageUploadPreview) {
      els.menuImageUploadPreview.src = "";
    }
  }

  function bindEls() {
    els.menuGrid = $("menu-grid");
    els.cartLines = $("cart-lines");
    els.cartTotal = $("cart-total");
    els.btnClearCart = $("btn-clear-cart");
    els.btnPrintBill = $("btn-print-bill");
    els.btnPayNow = $("btn-pay-now");
    els.payModal = $("pay-modal");
    els.payModalAmount = $("pay-modal-amount");
    els.payQr = $("pay-qr");
    els.btnConfirmPayment = $("btn-confirm-payment");
    els.printBill = $("print-bill");
    els.printDate = $("print-date");
    els.printLines = $("print-lines");
    els.printTotal = $("print-total");
    els.menuForm = $("menu-form");
    els.menuEditId = $("menu-edit-id");
    els.menuName = $("menu-name");
    els.menuPrice = $("menu-price");
    els.menuImage = $("menu-image");
    els.menuImageFile = $("menu-image-file");
    els.menuImageUploadPreviewWrap = $("menu-image-upload-preview-wrap");
    els.menuImageUploadPreview = $("menu-image-upload-preview");
    els.menuSubmit = $("menu-submit");
    els.menuCancelEdit = $("menu-cancel-edit");
    els.btnClearMenu = $("btn-clear-menu");
    els.menuAdminBody = $("menu-admin-body");
    els.settingUpi = $("setting-upi");
    els.settingPayee = $("setting-payee");
    els.btnSaveSettings = $("btn-save-settings");
    els.reportMonth = $("report-month");
    els.btnRefreshReport = $("btn-refresh-report");
    els.reportSummary = $("report-summary");
    els.reportOrdersBody = $("report-orders-body");
    els.tabs = document.querySelectorAll(".tab");
    els.panels = document.querySelectorAll(".panel");
  }

  function switchTab(name) {
    els.tabs.forEach(function (t) {
      var on = t.getAttribute("data-tab") === name;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    els.panels.forEach(function (p) {
      var on = p.getAttribute("data-panel") === name;
      p.hidden = !on;
      p.classList.toggle("active", on);
    });
    if (name === "report") {
      Report.renderReport(els.reportMonth, els.reportSummary, els.reportOrdersBody);
    }
    if (name === "menu") {
      renderAdminMenu();
      loadSettingsFields();
    }
  }

  function renderMenuGrid() {
    var items = Menu.getAll();
    var ph = Menu.getPlaceholderImage();
    els.menuGrid.innerHTML = items
      .map(function (item) {
        var src = item.image || ph;
        return (
          '<button type="button" class="menu-card" data-id="' +
          escapeHtml(item.id) +
          '" aria-label="Add ' +
          escapeHtml(item.name) +
          ' to cart">' +
          '<div class="menu-card-img-wrap"><img src="' +
          escapeHtml(src) +
          '" alt="" loading="lazy" /></div>' +
          '<div class="menu-card-body"><p class="menu-card-name">' +
          escapeHtml(item.name) +
          '</p><p class="menu-card-price">' +
          formatInr(item.price) +
          "</p></div></button>"
        );
      })
      .join("");

    els.menuGrid.querySelectorAll(".menu-card img").forEach(function (img) {
      bindImageFallback(img, ph);
    });

    els.menuGrid.querySelectorAll(".menu-card").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        var item = items.find(function (x) {
          return x.id === id;
        });
        if (item) {
          Cart.addItem(item);
          renderCart();
        }
      });
    });
  }

  function renderCart() {
    var lines = Cart.getLines();
    var total = Cart.getTotal();
    els.cartTotal.textContent = formatInr(total);
    els.btnPayNow.disabled = Cart.isEmpty();

    if (lines.length === 0) {
      els.cartLines.innerHTML = '<p class="cart-empty">Tap a menu item to add.</p>';
      return;
    }

    els.cartLines.innerHTML = lines
      .map(function (l) {
        var lineTotal = l.price * l.qty;
        return (
          '<div class="cart-line" data-id="' +
          escapeHtml(l.id) +
          '">' +
          '<div><span class="cart-line-name">' +
          escapeHtml(l.name) +
          '</span><div class="cart-line-meta">' +
          formatInr(l.price) +
          " each · " +
          formatInr(lineTotal) +
          "</div></div>" +
          '<div class="cart-line-controls">' +
          '<button type="button" data-act="dec" aria-label="Decrease ' +
          escapeHtml(l.name) +
          '">−</button>' +
          "<span>" +
          l.qty +
          "</span>" +
          '<button type="button" data-act="inc" aria-label="Increase ' +
          escapeHtml(l.name) +
          '">+</button>' +
          "</div></div>"
        );
      })
      .join("");

    els.cartLines.querySelectorAll(".cart-line").forEach(function (row) {
      var id = row.getAttribute("data-id");
      row.querySelectorAll("button[data-act]").forEach(function (b) {
        b.addEventListener("click", function () {
          if (b.getAttribute("data-act") === "inc") Cart.increment(id);
          else Cart.decrement(id);
          renderCart();
        });
      });
    });
  }

  function fillPrintBill() {
    var lines = Cart.getLines();
    var total = Cart.getTotal();
    els.printDate.textContent = new Date().toLocaleString();
    els.printTotal.textContent = formatInr(total);
    els.printLines.innerHTML = lines
      .map(function (l) {
        var lt = l.price * l.qty;
        return (
          "<tr><td>" +
          escapeHtml(l.name) +
          "</td><td>" +
          l.qty +
          "</td><td>" +
          formatInr(l.price) +
          "</td><td>" +
          formatInr(lt) +
          "</td></tr>"
        );
      })
      .join("");
  }

  function renderAdminMenu() {
    var items = Menu.getAll();
    var ph = Menu.getPlaceholderImage();
    els.menuAdminBody.innerHTML = items
      .map(function (item) {
        var src = item.image || ph;
        return (
          "<tr>" +
          '<td><img class="admin-thumb" src="' +
          escapeHtml(src) +
          '" alt="" /></td>' +
          "<td>" +
          escapeHtml(item.name) +
          "</td>" +
          "<td>" +
          formatInr(item.price) +
          "</td>" +
          "<td>" +
          '<button type="button" class="btn btn-secondary btn-admin-edit" data-id="' +
          escapeHtml(item.id) +
          '">Edit</button> ' +
          '<button type="button" class="btn btn-danger btn-admin-delete" data-id="' +
          escapeHtml(item.id) +
          '">Delete</button>' +
          "</td></tr>"
        );
      })
      .join("");

    els.menuAdminBody.querySelectorAll(".admin-thumb").forEach(function (img) {
      bindImageFallback(img, ph);
    });

    els.menuAdminBody.querySelectorAll(".btn-admin-edit").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        var item = items.find(function (x) {
          return x.id === id;
        });
        if (!item) return;
        els.menuEditId.value = item.id;
        els.menuName.value = item.name;
        els.menuPrice.value = item.price;
        els.menuImage.value = item.image === ph ? "" : item.image;
        els.menuSubmit.textContent = "Update item";
        els.menuCancelEdit.hidden = false;
      });
    });

    els.menuAdminBody.querySelectorAll(".btn-admin-delete").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        if (!confirm("Delete this item from the menu?")) return;
        Menu.deleteItem(id);
        renderAdminMenu();
        renderMenuGrid();
        renderCart();
      });
    });
  }

  function resetMenuForm() {
    els.menuForm.reset();
    els.menuEditId.value = "";
    els.menuSubmit.textContent = "Add item";
    els.menuCancelEdit.hidden = true;
    clearUploadedPreview();
  }

  function loadSettingsFields() {
    var s = Storage.getSettings();
    els.settingUpi.value = s.upiId;
    els.settingPayee.value = s.payeeName;
  }

  function init() {
    bindEls();
    Menu.ensureMenuSeeded();

    els.tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        switchTab(tab.getAttribute("data-tab"));
      });
    });

    els.btnClearCart.addEventListener("click", function () {
      Cart.clear();
      renderCart();
    });

    els.btnPrintBill.addEventListener("click", function () {
      if (Cart.isEmpty()) {
        alert("Cart is empty.");
        return;
      }
      fillPrintBill();
      window.print();
    });

    els.btnPayNow.addEventListener("click", function () {
      Checkout.openPayModal(els.payModal, els.payQr, els.payModalAmount);
    });

    els.btnConfirmPayment.addEventListener("click", function () {
      Checkout.confirmPayment();
      Checkout.closePayModal(els.payModal, els.payQr);
      renderCart();
      Report.renderReport(els.reportMonth, els.reportSummary, els.reportOrdersBody);
    });

    els.payModal.querySelectorAll("[data-close-modal]").forEach(function (node) {
      node.addEventListener("click", function () {
        Checkout.closePayModal(els.payModal, els.payQr);
      });
    });

    els.menuForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = els.menuName.value.trim();
      var price = parseFloat(els.menuPrice.value);
      var image = uploadedImageDataUrl || els.menuImage.value.trim();
      var editId = els.menuEditId.value.trim();
      if (!uploadedImageDataUrl && !isValidImagePath(image)) {
        alert("Please enter an image path or URL ending with .jpg, .jpeg, or .png.");
        return;
      }
      if (editId) {
        Menu.updateItem(editId, { name: name, price: price, image: image });
      } else {
        Menu.addItem({ name: name, price: price, image: image });
      }
      resetMenuForm();
      renderAdminMenu();
      renderMenuGrid();
    });

    els.menuImageFile.addEventListener("change", function () {
      var file = els.menuImageFile.files && els.menuImageFile.files[0];
      if (!file) {
        clearUploadedPreview();
        return;
      }
      if (!isValidImageFile(file)) {
        clearUploadedPreview();
        alert("Please upload a JPG or PNG file.");
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        uploadedImageDataUrl = String(reader.result || "");
        els.menuImageUploadPreview.src = uploadedImageDataUrl;
        els.menuImageUploadPreviewWrap.hidden = !uploadedImageDataUrl;
      };
      reader.readAsDataURL(file);
    });

    els.menuCancelEdit.addEventListener("click", resetMenuForm);
    els.btnClearMenu.addEventListener("click", function () {
      if (!confirm("Clear all saved menu items and start fresh?")) return;
      localStorage.removeItem(Storage.KEYS.menu);
      Menu.ensureMenuSeeded();
      resetMenuForm();
      renderAdminMenu();
      renderMenuGrid();
      renderCart();
      alert("Saved menu cleared. You can now add your new menu list.");
    });

    els.btnSaveSettings.addEventListener("click", function () {
      Storage.setSettings({
        upiId: els.settingUpi.value.trim(),
        payeeName: els.settingPayee.value.trim() || "Restaurant",
      });
      alert("Settings saved.");
    });

    Report.setDefaultMonth(els.reportMonth);
    els.btnRefreshReport.addEventListener("click", function () {
      Report.renderReport(els.reportMonth, els.reportSummary, els.reportOrdersBody);
    });
    els.reportMonth.addEventListener("change", function () {
      Report.renderReport(els.reportMonth, els.reportSummary, els.reportOrdersBody);
    });

    renderMenuGrid();
    renderCart();
    loadSettingsFields();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
