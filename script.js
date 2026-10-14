/* ============================================================
   FRASCO BEAUTY — script.js
   ------------------------------------------------------------
   • Navbar scroll state + mobile drawer
   • Scroll-reveal animations (IntersectionObserver)
   • Animated stat counters
   • Product card builder (shared by Home featured + Shop)
   • Shop: category filter, live search, price sort
   • Contact form (client-side only) + dynamic year
   ============================================================ */

/* ------------------------------------------------------------
   1. NAVBAR + MOBILE DRAWER
   ------------------------------------------------------------ */
function initNav() {
  var navbar = document.querySelector('.navbar');
  var burger = document.querySelector('.hamburger');
  var drawer = document.getElementById('drawer');
  var overlay = document.getElementById('overlay');

  // condense navbar on scroll
  function onScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    if (burger) burger.classList.remove('open');
    burger && burger.setAttribute('aria-expanded', 'false');
    // keep overlay if the cart is open
    var cart = document.getElementById('cartPanel');
    if (overlay && (!cart || !cart.classList.contains('open'))) overlay.classList.remove('open');
    if (!cart || !cart.classList.contains('open')) document.body.classList.remove('no-scroll');
  }

  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var isOpen = drawer.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      if (overlay) overlay.classList.toggle('open', isOpen);
      document.body.classList.toggle('no-scroll', isOpen);
    });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeDrawer);
    });
  }

  // overlay click closes whichever panel is open
  if (overlay) {
    overlay.addEventListener('click', function () {
      closeDrawer();
      if (typeof closeCart === 'function') closeCart();
    });
  }

  // ESC closes everything
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeDrawer();
      if (typeof closeCart === 'function') closeCart();
    }
  });
}

/* ------------------------------------------------------------
   2. SCROLL REVEAL
   ------------------------------------------------------------ */
function initReveal() {
  var items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(function (el) { observer.observe(el); });
}

/* stagger delays for grid children */
function applyStagger(container) {
  if (!container) return;
  Array.prototype.forEach.call(container.children, function (child, i) {
    child.style.setProperty('--i', i);
  });
}

/* ------------------------------------------------------------
   3. ANIMATED COUNTERS
   ------------------------------------------------------------ */
function animateCount(el, target, suffix) {
  var duration = 1600;
  var start = null;
  function step(ts) {
    if (!start) start = ts;
    var progress = Math.min((ts - start) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var value = Math.floor(eased * target);
    el.textContent = value.toLocaleString('en-US') + (suffix || '');
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString('en-US') + (suffix || '');
  }
  requestAnimationFrame(step);
}

function initCounters() {
  var counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        animateCount(el, parseInt(el.dataset.count, 10), el.dataset.suffix || '');
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function (el) { observer.observe(el); });
}

/* ------------------------------------------------------------
   4. PRODUCT CARD BUILDER
   ------------------------------------------------------------ */
function productCardHTML(p) {
  var promo = p.promo
    ? '<span class="badge-promo">Promo</span>'
    : '';
  var old = p.oldPrice
    ? '<span class="price-old">' + p.oldPrice + ' DH</span>'
    : '';

  return (
    '<article class="product-card" data-reveal="zoom" data-category="' + p.category + '" data-name="' + p.name.toLowerCase() + '" data-price="' + p.price + '">' +
      '<div class="product-media">' +
        promo +
        '<span class="badge-cat">' + p.category + '</span>' +
        '<img src="' + p.img + '" alt="' + p.name + '" loading="lazy">' +
      '</div>' +
      '<div class="product-body">' +
        '<span class="product-brand">' + p.brand + '</span>' +
        '<h3 class="product-name">' + p.name + '</h3>' +
        '<div class="product-price-row">' +
          '<span class="price">' + p.price + ' DH</span>' +
          old +
        '</div>' +
        '<button class="add-btn" data-add="' + p.id + '" type="button">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12.3a2 2 0 0 0 2 1.7h7.7a2 2 0 0 0 2-1.6L21 7H6"/></svg>' +
          'Add to cart' +
        '</button>' +
      '</div>' +
    '</article>'
  );
}

/* ------------------------------------------------------------
   5. HOME — FEATURED PRODUCTS
   ------------------------------------------------------------ */
function initFeatured() {
  var grid = document.getElementById('featuredGrid');
  if (!grid || !window.PRODUCTS) return;
  var featured = window.PRODUCTS.slice(0, 6);
  grid.innerHTML = featured.map(productCardHTML).join('');
  applyStagger(grid);
  initReveal();
}

/* ------------------------------------------------------------
   6. SHOP — FILTER / SEARCH / SORT
   ------------------------------------------------------------ */
function initShop() {
  var grid = document.getElementById('shopGrid');
  if (!grid || !window.PRODUCTS) return;

  var chips = document.querySelectorAll('.chip[data-filter]');
  var search = document.getElementById('searchInput');
  var sort = document.getElementById('sortSelect');
  var noResults = document.getElementById('noResults');

  var state = { category: 'all', query: '', sort: 'default' };

  function render() {
    var list = window.PRODUCTS.slice();

    if (state.category !== 'all') {
      list = list.filter(function (p) { return p.category === state.category; });
    }

    if (state.query) {
      var q = state.query.toLowerCase();
      list = list.filter(function (p) {
        return (p.name + ' ' + p.brand + ' ' + p.category).toLowerCase().indexOf(q) !== -1;
      });
    }

    if (state.sort === 'low') list.sort(function (a, b) { return a.price - b.price; });
    if (state.sort === 'high') list.sort(function (a, b) { return b.price - a.price; });

    if (!list.length) {
      grid.innerHTML = '';
      if (noResults) noResults.style.display = 'block';
      return;
    }
    if (noResults) noResults.style.display = 'none';

    grid.innerHTML = list.map(productCardHTML).join('');
    applyStagger(grid);
    // reveal immediately (they are in viewport after filtering)
    grid.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      state.category = chip.dataset.filter;
      render();
    });
  });

  if (search) {
    search.addEventListener('input', function () {
      state.query = search.value.trim();
      render();
    });
  }

  if (sort) {
    sort.addEventListener('change', function () {
      state.sort = sort.value;
      render();
    });
  }

  render();
}

/* ------------------------------------------------------------
   7. CONTACT FORM (no backend)
   ------------------------------------------------------------ */
function initContactForm() {
  var form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var note = document.getElementById('formNote');
    if (note) note.classList.add('show');
    form.reset();
  });
}

/* ------------------------------------------------------------
   8. MISC
   ------------------------------------------------------------ */
function initMisc() {
  // year in footer
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // graceful image fallback → tinted emerald placeholder
  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.style.background = 'linear-gradient(160deg,#0f4a34,#04170f)';
      img.style.objectFit = 'contain';
      img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#0a3324"/><text x="50%" y="50%" fill="#c9a24b" font-family="serif" font-size="120" text-anchor="middle" dominant-baseline="central">FR</text></svg>'
      );
    }, { once: true });
  });
}

/* ------------------------------------------------------------
   BOOT
   ------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', function () {
  initNav();
  initReveal();
  initCounters();
  initFeatured();
  initShop();
  initContactForm();
  initMisc();
});
