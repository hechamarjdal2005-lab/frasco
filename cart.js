/* ============================================================
   FRASCO BEAUTY — cart.js
   ------------------------------------------------------------
   • Shared product catalogue (edit PRODUCTS to update the shop)
   • localStorage-backed cart (persists across every page)
   • Cart drawer rendering, quantity, remove, totals
   • "Order via WhatsApp" message builder + redirect
   ============================================================ */

/* ------------------------------------------------------------
   PRODUCT CATALOGUE
   Fields: id, name, brand, category, price, oldPrice?, img, promo?
   Categories: Perfumes | Skin Care | Body Care | Hair Care | Dental Care
   Prices in Moroccan Dirham (DH). Replace `img` with your own URLs.
   ------------------------------------------------------------ */
const PRODUCTS = [
  // ---------------- Perfumes ----------------
  { id: 'p1', name: 'Bvlgari Omnia Crystalline EDP', brand: 'Bvlgari', category: 'Perfumes', price: 890, oldPrice: 1150, promo: true, img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=80' },
  { id: 'p2', name: 'Bvlgari Pour Homme EDP', brand: 'Bvlgari', category: 'Perfumes', price: 950, img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=700&q=80' },
  { id: 'p3', name: 'Bvlgari Goldea The Roman Night', brand: 'Bvlgari', category: 'Perfumes', price: 1090, oldPrice: 1320, promo: true, img: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=700&q=80' },
  { id: 'p4', name: 'Rose d\'Orient Signature Parfum', brand: 'Frasco', category: 'Perfumes', price: 420, img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=700&q=80' },
  { id: 'p5', name: 'Amber Nuit Eau de Parfum', brand: 'Frasco', category: 'Perfumes', price: 480, oldPrice: 620, promo: true, img: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=700&q=80' },
  { id: 'p6', name: 'Oud Royal Intense EDP', brand: 'Frasco', category: 'Perfumes', price: 560, img: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=700&q=80' },

  // ---------------- Skin Care ----------------
  { id: 's1', name: 'Radiance Vitamin C Serum', brand: 'Frasco Skin', category: 'Skin Care', price: 240, oldPrice: 320, promo: true, img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=700&q=80' },
  { id: 's2', name: 'Hydra Glow Day Cream', brand: 'Frasco Skin', category: 'Skin Care', price: 195, img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=700&q=80' },
  { id: 's3', name: 'Gentle Foaming Cleanser', brand: 'Frasco Skin', category: 'Skin Care', price: 130, img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=700&q=80' },
  { id: 's4', name: 'Rose Facial Toner Mist', brand: 'Frasco Skin', category: 'Skin Care', price: 115, oldPrice: 150, promo: true, img: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=80' },

  // ---------------- Body Care ----------------
  { id: 'b1', name: 'Argan Body Silk Lotion', brand: 'Frasco Body', category: 'Body Care', price: 165, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=700&q=80' },
  { id: 'b2', name: 'Moroccan Black Soap Scrub', brand: 'Frasco Body', category: 'Body Care', price: 140, oldPrice: 180, promo: true, img: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=700&q=80' },
  { id: 'b3', name: 'Shea & Gold Body Butter', brand: 'Frasco Body', category: 'Body Care', price: 180, img: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?auto=format&fit=crop&w=700&q=80' },

  // ---------------- Hair Care ----------------
  { id: 'h1', name: 'Argan Repair Hair Oil', brand: 'Frasco Hair', category: 'Hair Care', price: 150, oldPrice: 210, promo: true, img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80' },
  { id: 'h2', name: 'Nourishing Keratin Shampoo', brand: 'Frasco Hair', category: 'Hair Care', price: 120, img: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?auto=format&fit=crop&w=700&q=80' },
  { id: 'h3', name: 'Deep Hydration Hair Mask', brand: 'Frasco Hair', category: 'Hair Care', price: 145, img: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=700&q=80' },

  // ---------------- Dental Care ----------------
  { id: 'd1', name: 'Whitening Charcoal Toothpaste', brand: 'Frasco Smile', category: 'Dental Care', price: 85, oldPrice: 120, promo: true, img: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=700&q=80' },
  { id: 'd2', name: 'Fresh Mint Oral Rinse', brand: 'Frasco Smile', category: 'Dental Care', price: 95, img: 'https://images.unsplash.com/photo-1559591930-40fb6e4e0a8e?auto=format&fit=crop&w=700&q=80' },
  { id: 'd3', name: 'Bamboo Soft Toothbrush Set', brand: 'Frasco Smile', category: 'Dental Care', price: 70, img: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=700&q=80' }
];

/* Expose for other scripts (featured render, shop render) */
window.PRODUCTS = PRODUCTS;

const WHATSAPP_NUMBER = '212632542894'; // 06 32 54 28 94 → international format
const STORAGE_KEY = 'frasco_cart_v1';

/* ------------------------------------------------------------
   CART STATE
   ------------------------------------------------------------ */
let cart = loadCart();

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function getProduct(id) {
  return PRODUCTS.find(function (p) { return p.id === id; });
}

function countItems() {
  return Object.values(cart).reduce(function (sum, q) { return sum + q; }, 0);
}

function cartTotal() {
  return Object.keys(cart).reduce(function (sum, id) {
    var p = getProduct(id);
    return p ? sum + p.price * cart[id] : sum;
  }, 0);
}

/* ------------------------------------------------------------
   ADD / REMOVE / UPDATE
   ------------------------------------------------------------ */
function addToCart(id, qty) {
  qty = qty || 1;
  var product = getProduct(id);
  if (!product) return;
  cart[id] = (cart[id] || 0) + qty;
  saveCart();
  renderCart();
  animateAddToCart(id);
  openCart();
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  delete cart[id];
  saveCart();
  renderCart();
}

/* Micro-interaction: button label + navbar cart bounce */
function animateAddToCart(id) {
  var btns = document.querySelectorAll('[data-add="' + id + '"]');
  btns.forEach(function (btn) {
    var original = btn.dataset.label || btn.innerHTML;
    btn.dataset.label = original;
    btn.innerHTML = '✓ Added';
    btn.classList.add('added');
    setTimeout(function () {
      btn.innerHTML = original;
      btn.classList.remove('added');
    }, 1200);
  });

  var cartBtn = document.querySelector('.cart-btn');
  if (cartBtn) {
    cartBtn.classList.remove('bump');
    void cartBtn.offsetWidth;
    cartBtn.classList.add('bump');
    setTimeout(function () { cartBtn.classList.remove('bump'); }, 600);
  }
}

/* ------------------------------------------------------------
   RENDER
   ------------------------------------------------------------ */
function renderCart() {
  var list = document.getElementById('cartItems');
  var foot = document.getElementById('cartFoot');
  if (!list) return;

  var ids = Object.keys(cart);

  if (!ids.length) {
    list.innerHTML =
      '<div class="cart-empty">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12.3a2 2 0 0 0 2 1.7h7.7a2 2 0 0 0 2-1.6L21 7H6"/></svg>' +
        '<p>Your cart is empty.<br>Discover our authentic collection.</p>' +
        '<p style="margin-top:10px"><a href="shop.html">Browse the shop →</a></p>' +
      '</div>';
    if (foot) foot.style.display = 'none';
    return;
  }

  if (foot) foot.style.display = 'block';

  list.innerHTML = ids.map(function (id) {
    var p = getProduct(id);
    if (!p) return '';
    return (
      '<article class="cart-item">' +
        '<img src="' + p.img + '" alt="' + p.name + '" loading="lazy">' +
        '<div class="cart-item-info">' +
          '<h4>' + p.name + '</h4>' +
          '<div class="ci-price">' + p.price + ' DH</div>' +
        '</div>' +
        '<div class="cart-item-right">' +
          '<button class="remove-btn" aria-label="Remove ' + p.name + '" data-remove="' + id + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>' +
          '</button>' +
          '<div class="qty">' +
            '<button data-dec="' + id + '" aria-label="Decrease">−</button>' +
            '<span>' + cart[id] + '</span>' +
            '<button data-inc="' + id + '" aria-label="Increase">+</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }).join('');

  var totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = cartTotal().toLocaleString('fr-FR') + ' DH';

  var countEl = document.getElementById('cartCountLabel');
  if (countEl) countEl.textContent = countItems();
}

/* Badge in navbar */
function updateCartBadge() {
  var badge = document.getElementById('cartCount');
  if (!badge) return;
  var n = countItems();
  badge.textContent = n;
  if (n > 0) {
    badge.classList.add('show');
    badge.classList.remove('pulse');
    void badge.offsetWidth;
    badge.classList.add('pulse');
  } else {
    badge.classList.remove('show');
  }
}

/* ------------------------------------------------------------
   CART OPEN / CLOSE
   ------------------------------------------------------------ */
function openCart() {
  var panel = document.getElementById('cartPanel');
  var overlay = document.getElementById('overlay');
  if (!panel) return;
  panel.classList.add('open');
  if (overlay) overlay.classList.add('open');
  document.body.classList.add('no-scroll');
}

function closeCart() {
  var panel = document.getElementById('cartPanel');
  var overlay = document.getElementById('overlay');
  if (panel) panel.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  downloadBodyScrollUnlock();
}

function downloadBodyScrollUnlock() {
  // only unlock if the mobile menu is also closed
  var drawer = document.getElementById('drawer');
  if (!drawer || !drawer.classList.contains('open')) {
    document.body.classList.remove('no-scroll');
  }
}

/* ------------------------------------------------------------
   WHATSAPP ORDER
   ------------------------------------------------------------ */
function orderViaWhatsApp() {
  var ids = Object.keys(cart);
  if (!ids.length) return;

  var lines = ids.map(function (id) {
    var p = getProduct(id);
    return '• ' + p.name + ' (x' + cart[id] + ')';
  });

  var message =
    'Hello Frasco Beauty! I would like to order:\n' +
    lines.join('\n') +
    '\n\nTotal: ' + cartTotal().toLocaleString('fr-FR') + ' DH';

  var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
  window.open(url, '_blank');
}

/* ------------------------------------------------------------
   EVENT DELEGATION
   ------------------------------------------------------------ */
document.addEventListener('click', function (e) {
  var add = e.target.closest('[data-add]');
  if (add) {
    e.preventDefault();
    addToCart(add.dataset.add);
    return;
  }

  var open = e.target.closest('[data-cart-open]');
  if (open) {
    e.preventDefault();
    openCart();
    return;
  }

  var close = e.target.closest('[data-cart-close]');
  if (close) {
    e.preventDefault();
    closeCart();
    return;
  }

  var inc = e.target.closest('[data-inc]');
  if (inc) { changeQty(inc.dataset.inc, 1); return; }

  var dec = e.target.closest('[data-dec]');
  if (dec) { changeQty(dec.dataset.dec, -1); return; }

  var rem = e.target.closest('[data-remove]');
  if (rem) { removeFromCart(rem.dataset.remove); return; }

  var order = e.target.closest('[data-order-wa]');
  if (order) { orderViaWhatsApp(); return; }
});

/* Sync badge + cart across tabs */
window.addEventListener('storage', function (e) {
  if (e.key === STORAGE_KEY) {
    cart = loadCart();
    updateCartBadge();
    renderCart();
  }
});

document.addEventListener('DOMContentLoaded', function () {
  updateCartBadge();
  renderCart();
});
