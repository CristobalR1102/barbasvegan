// ==========================================
// BARBAS VEGAN - APP LOGIC & CART SYSTEM
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Safe localStorage helpers (private mode can throw)
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v === null ? fallback : v; } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
    }
  };

  function loadCart() {
    try { return JSON.parse(store.get('barbas_cart', '[]')) || []; } catch (e) { return []; }
  }

  // Every product that can go in the cart: carta + seitán para cocinar
  const ALL_PRODUCTS = MENU_ITEMS.concat(typeof SEITAN_PRODUCTS !== 'undefined' ? SEITAN_PRODUCTS : []);

  // Application State
  const state = {
    activeCategory: 'all',
    searchQuery: '',
    selectedVariants: {}, // itemId -> variantId
    cart: loadCart(),
    customerName: store.get('barbas_customer_name', '')
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // DOM Elements
  const categoriesContainer = document.getElementById('categories-container');
  const menuGrid = document.getElementById('menu-grid');
  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear');
  const itemsCountEl = document.getElementById('items-count');
  const menuToolbar = document.getElementById('menu-toolbar');
  const cartaSection = document.getElementById('carta');

  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartCloseBtn = document.getElementById('btn-close-cart');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartEmptyState = document.getElementById('cart-empty-state');
  const cartFooter = document.getElementById('cart-footer');
  const cartSubtitle = document.getElementById('cart-subtitle');
  const cartTotalAmount = document.getElementById('cart-total-amount');
  const cartBadgeCount = document.querySelectorAll('.cart-badge-count');
  const cartTotalEls = document.querySelectorAll('[data-cart-total]');
  const dockCart = document.getElementById('dock-cart');
  const customerNameInput = document.getElementById('customer-name');
  const orderNotesInput = document.getElementById('order-notes');
  const btnSendWhatsapp = document.getElementById('btn-send-whatsapp');
  const toastEl = document.getElementById('toast');

  const originalMenuModal = document.getElementById('original-menu-modal');
  const originalMenuCloseBtn = document.getElementById('btn-close-original-menu');

  let lastFocused = null;

  // Format price utility (Chilean Peso style: $6.790)
  function formatPrice(amount) {
    return '$' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  const icon = (id, cls = '') => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;

  // Toast Notification
  let toastTimer;
  function showToast(message) {
    if (!toastEl) return;
    toastEl.innerHTML = `${icon('i-check')}<span>${escapeHTML(message)}</span>`;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }

  function saveCart() {
    store.set('barbas_cart', JSON.stringify(state.cart));
    updateCartUI();
  }

  function initVariants() {
    MENU_ITEMS.forEach(item => {
      if (item.hasVariants && item.variants && item.variants.length > 0) {
        state.selectedVariants[item.id] = item.defaultVariant || item.variants[0].id;
      }
    });
  }

  // ---------------- Categories ----------------
  function categoryCount(catId) {
    return catId === 'all' ? MENU_ITEMS.length : MENU_ITEMS.filter(i => i.category === catId).length;
  }

  function renderCategories() {
    if (!categoriesContainer) return;
    categoriesContainer.innerHTML = '';

    MENU_CATEGORIES.forEach(cat => {
      const isActive = state.activeCategory === cat.id;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `category-tab${isActive ? ' active' : ''}`;
      btn.setAttribute('aria-pressed', String(isActive));
      btn.innerHTML = `<span>${escapeHTML(cat.name)}</span><span class="count">${categoryCount(cat.id)}</span>`;
      btn.addEventListener('click', () => {
        if (state.activeCategory === cat.id) return;
        state.activeCategory = cat.id;
        renderCategories();
        renderMenuItems();
        scrollToMenuTop();
      });
      categoriesContainer.appendChild(btn);

      // Center the active chip horizontally without moving the page
      if (isActive) {
        requestAnimationFrame(() => {
          const c = categoriesContainer.getBoundingClientRect();
          const b = btn.getBoundingClientRect();
          const left = categoriesContainer.scrollLeft + (b.left - c.left) - (c.width - b.width) / 2;
          categoriesContainer.scrollTo({ left: Math.max(0, left), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
      }
    });
  }

  // When filtering while the toolbar is stuck, bring the first results into view
  function scrollToMenuTop() {
    if (!menuToolbar || !menuGrid) return;
    const headerH = 64;
    const toolbarRect = menuToolbar.getBoundingClientRect();
    const gridTop = menuGrid.getBoundingClientRect().top;
    if (toolbarRect.top <= headerH + 1 && gridTop < toolbarRect.bottom) {
      const y = window.scrollY + gridTop - toolbarRect.height - headerH - 12;
      window.scrollTo({ top: y, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  }

  // ---------------- Menu ----------------
  function getFilteredItems() {
    const q = state.searchQuery.toLowerCase().trim();
    return MENU_ITEMS.filter(item => {
      const matchesCategory = state.activeCategory === 'all' || item.category === state.activeCategory;
      if (!q) return matchesCategory;
      const matchesName = item.name.toLowerCase().includes(q);
      const matchesDesc = item.description.toLowerCase().includes(q);
      const matchesTags = item.tags && item.tags.some(t => t.toLowerCase().includes(q));
      return matchesCategory && (matchesName || matchesDesc || matchesTags);
    });
  }

  function badgeClass(badge) {
    if (/Estrella|Recomendado|Popular|Favorit|Fresca/.test(badge)) return 'badge-green';
    if (/Bajón|Promo|Ventas|Combo/.test(badge)) return 'badge-yellow';
    return 'badge-purple';
  }

  function resetFilters() {
    state.activeCategory = 'all';
    state.searchQuery = '';
    if (searchInput) searchInput.value = '';
    if (searchClearBtn) searchClearBtn.classList.add('hidden');
    renderCategories();
    renderMenuItems();
  }

  function renderMenuItems() {
    if (!menuGrid) return;
    const items = getFilteredItems();

    if (itemsCountEl) {
      itemsCountEl.textContent = `${items.length} ${items.length === 1 ? 'producto' : 'productos'}`;
    }

    if (items.length === 0) {
      menuGrid.innerHTML = `
        <div class="empty-results">
          <p class="font-bebas text-4xl text-white">Nada por aquí</p>
          <p class="text-slate-400 text-[15px] max-w-sm mx-auto mt-2 mb-5">
            Prueba con “seitán”, “palta”, “cheddar” o “papas”, o revisa otra categoría.
          </p>
          <button type="button" id="btn-reset-filters" class="btn btn--primary btn--sm">Ver toda la carta</button>
        </div>
      `;
      document.getElementById('btn-reset-filters').addEventListener('click', resetFilters);
      return;
    }

    menuGrid.innerHTML = '';

    items.forEach((item, idx) => {
      const card = document.createElement('article');
      card.className = `menu-card${item.featured ? ' is-featured' : ''}`;
      if (!prefersReducedMotion) {
        card.classList.add('enter');
        card.style.animationDelay = `${Math.min(idx, 8) * 40}ms`;
      }

      let currentPrice = item.price;
      let selectedVariant = null;
      if (item.hasVariants && item.variants) {
        const selectedId = state.selectedVariants[item.id] || item.variants[0].id;
        selectedVariant = item.variants.find(v => v.id === selectedId) || item.variants[0];
        currentPrice = selectedVariant.price;
      }

      const badgeHTML = item.badge ? `<span class="badge-sticker ${badgeClass(item.badge)}">${escapeHTML(item.badge)}</span>` : '';
      const portionHTML = item.portion ? `<p class="menu-card__portion">${escapeHTML(item.portion)}</p>` : '';
      // "100% Vegano" is implicit on every dish — skip that tag to reduce noise
      const tags = (item.tags || []).filter(t => t !== '100% Vegano');
      const tagsHTML = tags.length ? `<div class="menu-card__tags">${tags.map(t => `<span>${escapeHTML(t)}</span>`).join('')}</div>` : '';

      let variantHTML = '';
      if (item.hasVariants && item.variants) {
        variantHTML = `
          <div class="variant-group" role="radiogroup" aria-label="Formato de ${escapeHTML(item.name)}">
            ${item.variants.map(v => {
              const sel = selectedVariant && selectedVariant.id === v.id;
              const label = v.label.replace(' (con papas)', ' + papas');
              return `
                <button type="button" role="radio" aria-checked="${sel}" data-item-id="${item.id}" data-variant-id="${v.id}"
                  class="variant-btn${sel ? ' selected' : ''}">
                  <span class="variant-btn__label">${escapeHTML(label)}</span>
                  <span class="variant-btn__price">${formatPrice(v.price)}</span>
                </button>`;
            }).join('')}
          </div>
          ${item.variants.some(v => v.id === 'as')
            ? '<p class="variant-hint">As: seitán · Salchicha: vienesa vegana · Champipleto: champiñones</p>'
            : ''}`;
      }

      card.innerHTML = `
        <div class="menu-card__body">
          <div class="menu-card__head">
            <div class="min-w-0">
              <h3 class="menu-card__title">${escapeHTML(item.name)}</h3>
              ${portionHTML}
            </div>
            ${badgeHTML}
          </div>
          <p class="menu-card__desc">${escapeHTML(item.description)}</p>
          ${tagsHTML}
          ${variantHTML}
        </div>
        <div class="menu-card__foot">
          <span class="price-xl" id="price-display-${item.id}">${formatPrice(currentPrice)}</span>
          <button type="button" class="btn-add" data-add-item="${item.id}" aria-label="Agregar ${escapeHTML(item.name)} al pedido">
            ${icon('i-plus', 'w-5 h-5')}<span>Agregar</span>
          </button>
        </div>
      `;

      if (item.hasVariants && item.variants) {
        const variantButtons = card.querySelectorAll('[data-variant-id]');
        variantButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            const vId = btn.getAttribute('data-variant-id');
            state.selectedVariants[item.id] = vId;
            variantButtons.forEach(b => {
              const on = b === btn;
              b.classList.toggle('selected', on);
              b.setAttribute('aria-checked', String(on));
            });
            const chosen = item.variants.find(v => v.id === vId);
            const priceEl = card.querySelector(`#price-display-${item.id}`);
            if (chosen && priceEl) priceEl.textContent = formatPrice(chosen.price);
          });
        });
      }

      menuGrid.appendChild(card);
    });
  }

  // ---------------- Seitán para cocinar ----------------
  function renderSeitanShop() {
    const grid = document.getElementById('seitan-grid');
    const ideas = document.getElementById('seitan-ideas');
    if (typeof SEITAN_PRODUCTS === 'undefined') return;

    if (ideas && typeof SEITAN_IDEAS !== 'undefined') {
      ideas.innerHTML = `<p class="shop__ideas-label">Ideas para prepararlo</p>` +
        SEITAN_IDEAS.map(i => `<span>${escapeHTML(i)}</span>`).join('');
    }

    if (!grid) return;
    grid.innerHTML = SEITAN_PRODUCTS.map(p => `
      <article class="shop-card reveal">
        <div class="shop-card__top">
          <span class="shop-card__weight">${escapeHTML(p.weight)}</span>
          ${p.badge ? `<span class="badge-sticker badge-green">${escapeHTML(p.badge)}</span>` : ''}
        </div>
        <div class="shop-card__body">
          <h3 class="shop-card__title">${escapeHTML(p.shortName || p.name)}</h3>
          <p class="shop-card__desc">${escapeHTML(p.description)}</p>
          <div class="shop-card__foot">
            <span class="price-xl">${formatPrice(p.price)}</span>
            <button type="button" class="btn-add" data-add-item="${p.id}" aria-label="Agregar ${escapeHTML(p.name)} al pedido">
              ${icon('i-plus', 'w-5 h-5')}<span>Agregar</span>
            </button>
          </div>
        </div>
      </article>`).join('');
  }

  // ---------------- Cart ----------------
  function addToCart(item, sourceBtn, subtypes) {
    let variantObj = null;
    let finalPrice = item.price;
    let variantName = '';

    if (item.hasVariants && item.variants) {
      const selectedId = state.selectedVariants[item.id] || item.variants[0].id;
      variantObj = item.variants.find(v => v.id === selectedId) || item.variants[0];
      finalPrice = variantObj.price;
      variantName = variantObj.label;
    }

    // Chosen completo type(s): As / Salchicha / Champipleto
    let subtypeKey = '';
    if (subtypes && subtypes.length) {
      variantName = subtypes.length === 1
        ? `${subtypes[0].label} (${subtypes[0].desc.toLowerCase()})`
        : subtypes.map(t => t.label).join(' + ');
      // Order-insensitive key so "As + Salchicha" and "Salchicha + As" stack together
      subtypeKey = '-' + subtypes.map(t => t.id).sort().join('-');
    }

    const cartItemId = item.id + (variantObj ? `-${variantObj.id}` : '') + subtypeKey;
    const existing = state.cart.find(ci => ci.cartItemId === cartItemId);

    if (existing) {
      existing.quantity += 1;
    } else {
      state.cart.push({ cartItemId, itemId: item.id, name: item.name, variantName, price: finalPrice, quantity: 1 });
    }

    saveCart();
    showToast(`${item.name} agregado`);

    if (navigator.vibrate) { try { navigator.vibrate(12); } catch (e) { /* ignore */ } }

    if (sourceBtn) {
      const label = sourceBtn.querySelector('span');
      sourceBtn.classList.remove('is-added');
      void sourceBtn.offsetWidth;
      sourceBtn.classList.add('is-added');
      if (label) label.textContent = 'Listo';
      clearTimeout(sourceBtn._t);
      sourceBtn._t = setTimeout(() => {
        sourceBtn.classList.remove('is-added');
        if (label) label.textContent = 'Agregar';
      }, 1100);
    }

    if (dockCart) {
      dockCart.classList.remove('bump');
      void dockCart.offsetWidth;
      dockCart.classList.add('bump');
    }
  }

  function updateCartUI() {
    const totalItems = state.cart.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = state.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    cartBadgeCount.forEach(badge => {
      badge.textContent = totalItems;
      badge.classList.toggle('hidden', totalItems === 0);
    });
    cartTotalEls.forEach(el => { el.textContent = formatPrice(totalPrice); });
    if (dockCart) dockCart.setAttribute('aria-label', totalItems ? `Ver pedido: ${totalItems} productos, ${formatPrice(totalPrice)}` : 'Ver pedido (vacío)');
    if (cartTotalAmount) cartTotalAmount.textContent = formatPrice(totalPrice);
    if (cartSubtitle) {
      cartSubtitle.textContent = totalItems
        ? `${totalItems} ${totalItems === 1 ? 'producto' : 'productos'} · se envía por WhatsApp`
        : 'Se envía directo por WhatsApp';
    }

    if (!cartItemsList) return;

    if (state.cart.length === 0) {
      cartItemsList.innerHTML = '';
      cartItemsList.classList.add('hidden');
      if (cartEmptyState) cartEmptyState.classList.remove('hidden');
      if (cartFooter) cartFooter.classList.add('is-disabled');
      return;
    }

    cartItemsList.classList.remove('hidden');
    if (cartEmptyState) cartEmptyState.classList.add('hidden');
    if (cartFooter) cartFooter.classList.remove('is-disabled');

    cartItemsList.innerHTML = state.cart.map((item, index) => `
      <div class="cart-item">
        <div class="flex-1 min-w-0">
          <p class="cart-item__name">${escapeHTML(item.name)}</p>
          ${item.variantName ? `<p class="cart-item__variant">${escapeHTML(item.variantName)}</p>` : ''}
          <p class="cart-item__price">${formatPrice(item.price * item.quantity)}</p>
        </div>
        <div class="stepper">
          <button type="button" data-cart-action="decrease" data-index="${index}" aria-label="${item.quantity > 1 ? 'Quitar uno' : 'Eliminar'}: ${escapeHTML(item.name)}">
            ${icon(item.quantity > 1 ? 'i-minus' : 'i-trash')}
          </button>
          <output aria-label="Cantidad">${item.quantity}</output>
          <button type="button" data-cart-action="increase" data-index="${index}" aria-label="Agregar uno más: ${escapeHTML(item.name)}">
            ${icon('i-plus')}
          </button>
        </div>
      </div>
    `).join('');
  }

  if (cartItemsList) {
    cartItemsList.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cart-action]');
      if (!btn) return;
      const index = parseInt(btn.getAttribute('data-index'), 10);
      const action = btn.getAttribute('data-cart-action');
      if (!state.cart[index]) return;
      if (action === 'increase') {
        state.cart[index].quantity += 1;
      } else if (action === 'decrease') {
        if (state.cart[index].quantity > 1) state.cart[index].quantity -= 1;
        else state.cart.splice(index, 1);
      }
      saveCart();
    });
  }

  // ---------------- Overlays (cart + scanned menu) ----------------
  function lockScroll(lock) {
    document.body.style.overflow = lock ? 'hidden' : '';
  }

  function openCart() {
    if (!cartDrawer || !cartOverlay) return;
    lastFocused = document.activeElement;
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
    cartDrawer.setAttribute('aria-hidden', 'false');
    lockScroll(true);
    setTimeout(() => cartCloseBtn && cartCloseBtn.focus({ preventScroll: true }), 50);
  }

  function closeCart() {
    if (!cartDrawer || !cartOverlay || !cartDrawer.classList.contains('active')) return;
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
    cartDrawer.setAttribute('aria-hidden', 'true');
    lockScroll(false);
    if (lastFocused && lastFocused.focus) lastFocused.focus({ preventScroll: true });
  }

  document.querySelectorAll('.btn-open-cart').forEach(btn => btn.addEventListener('click', openCart));
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  document.querySelectorAll('[data-close-cart]').forEach(el => el.addEventListener('click', closeCart));

  // Swipe down on the sheet handle area to dismiss (mobile)
  if (cartDrawer) {
    let startY = null;
    cartDrawer.addEventListener('touchstart', (e) => {
      const inList = e.target.closest('#cart-items-list, #cart-footer');
      startY = inList ? null : e.touches[0].clientY;
    }, { passive: true });
    cartDrawer.addEventListener('touchend', (e) => {
      if (startY === null) return;
      const dy = e.changedTouches[0].clientY - startY;
      startY = null;
      if (dy > 70 && window.innerWidth < 768) closeCart();
    }, { passive: true });
  }

  function openOriginalMenu() {
    if (!originalMenuModal) return;
    lastFocused = document.activeElement;
    originalMenuModal.classList.add('active');
    originalMenuModal.setAttribute('aria-hidden', 'false');
    lockScroll(true);
    setTimeout(() => originalMenuCloseBtn && originalMenuCloseBtn.focus({ preventScroll: true }), 50);
  }

  function closeOriginalMenu() {
    if (!originalMenuModal || !originalMenuModal.classList.contains('active')) return;
    originalMenuModal.classList.remove('active');
    originalMenuModal.setAttribute('aria-hidden', 'true');
    lockScroll(false);
    if (lastFocused && lastFocused.focus) lastFocused.focus({ preventScroll: true });
  }

  document.querySelectorAll('.btn-open-original-menu').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); openOriginalMenu(); });
  });
  if (originalMenuCloseBtn) originalMenuCloseBtn.addEventListener('click', closeOriginalMenu);
  if (originalMenuModal) {
    originalMenuModal.addEventListener('click', (e) => { if (e.target === originalMenuModal) closeOriginalMenu(); });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeTypePicker(); closeCart(); closeOriginalMenu(); }
  });

  // ---------------- WhatsApp order ----------------
  if (btnSendWhatsapp) {
    btnSendWhatsapp.addEventListener('click', () => {
      if (state.cart.length === 0) {
        showToast('Tu pedido está vacío');
        return;
      }

      const clientName = customerNameInput ? customerNameInput.value.trim() : '';
      const notes = orderNotesInput ? orderNotesInput.value.trim() : '';
      if (clientName) store.set('barbas_customer_name', clientName);

      const totalPrice = state.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

      let message = `*NUEVO PEDIDO - BARBAS VEGAN FOOD TRUCK*\n`;
      message += `------------------------------------\n`;
      if (clientName) message += `*Cliente:* ${clientName}\n`;
      message += `*Modalidad:* Retiro en Food Truck\n\n`;
      message += `*DETALLE DEL PEDIDO:*\n`;

      state.cart.forEach(item => {
        const variantText = item.variantName ? ` (${item.variantName})` : '';
        message += `• ${item.quantity}x *${item.name}*${variantText} - ${formatPrice(item.price * item.quantity)}\n`;
      });

      message += `\n------------------------------------\n`;
      message += `*TOTAL:* ${formatPrice(totalPrice)} CLP\n`;
      if (notes) message += `*Comentarios/Alergias:* ${notes}\n`;
      message += `\n¡Hola equipo de Barbas Vegan! Quiero confirmar este pedido para retirar en el food truck. ¡Muchas gracias!`;

      window.open(`https://wa.me/${BUSINESS_CONFIG.whatsappPhone}?text=${encodeURIComponent(message)}`, '_blank');
    });
  }

  // ---------------- Search ----------------
  let searchTimer;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (searchClearBtn) searchClearBtn.classList.toggle('hidden', state.searchQuery.length === 0);
      clearTimeout(searchTimer);
      searchTimer = setTimeout(renderMenuItems, 120);
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') searchInput.blur();
    });
  }

  if (searchClearBtn && searchInput) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      searchClearBtn.classList.add('hidden');
      renderMenuItems();
      searchInput.focus();
    });
  }

  // ---------------- Type picker (As / Salchicha / Champipleto) ----------------
  // Sandwiches in "As" format ask once; completo promos ask once per completo.
  const typePicker = document.getElementById('type-picker');
  const typePickerOverlay = document.getElementById('type-picker-overlay');
  const typePickerOptions = document.getElementById('type-picker-options');
  const typePickerItem = document.getElementById('type-picker-item');
  const typePickerTitle = document.getElementById('type-picker-title');
  const typePickerClose = document.getElementById('type-picker-close');
  let pickerContext = null; // { item, btn, total, picks: [] }

  // How many completo types must be chosen for this item (0 = none)
  function typeChoicesNeeded(item) {
    if (typeof COMPLETO_TYPES === 'undefined') return 0;
    if (item.completoChoices) return item.completoChoices;
    if (!item.hasVariants || !item.variants) return 0;
    const selectedId = state.selectedVariants[item.id] || item.variants[0].id;
    return selectedId === 'as' ? 1 : 0;
  }

  function renderPickerStep() {
    const { item, total, picks } = pickerContext;
    const variant = item.hasVariants && item.variants ? item.variants.find(v => v.id === 'as') : null;
    const step = picks.length + 1;

    typePickerItem.textContent = `${item.name} · ${formatPrice(variant ? variant.price : item.price)}`;
    typePickerTitle.textContent = total > 1 ? `Completo ${step} de ${total}` : '¿Cuál quieres?';

    const backHTML = picks.length
      ? `<button type="button" class="picker__back" data-picker-back>
           ${icon('i-arrow', 'picker__back-icon')}
           <span>Completo ${picks.length}: <b>${escapeHTML(picks[picks.length - 1].label)}</b> · cambiar</span>
         </button>`
      : '';

    typePickerOptions.innerHTML = backHTML + COMPLETO_TYPES.map(t => `
      <button type="button" class="picker__option" data-type-id="${t.id}">
        <span class="flex-1 min-w-0">
          <span class="picker__option-name">${escapeHTML(t.label)}</span>
          <span class="picker__option-desc">${escapeHTML(t.desc)}</span>
        </span>
        <span class="picker__option-plus" aria-hidden="true">${icon(step < total ? 'i-arrow' : 'i-plus')}</span>
      </button>`).join('');

    setTimeout(() => {
      const first = typePickerOptions.querySelector('[data-type-id]');
      if (first) first.focus({ preventScroll: true });
    }, 50);
  }

  function openTypePicker(item, btn, total) {
    if (!typePicker) { addToCart(item, btn); return; }
    pickerContext = { item, btn, total, picks: [] };
    renderPickerStep();
    typePicker.classList.add('active');
    typePickerOverlay.classList.add('active');
    typePicker.setAttribute('aria-hidden', 'false');
    lockScroll(true);
  }

  function closeTypePicker() {
    if (!typePicker || !typePicker.classList.contains('active')) return;
    typePicker.classList.remove('active');
    typePickerOverlay.classList.remove('active');
    typePicker.setAttribute('aria-hidden', 'true');
    lockScroll(false);
    const btn = pickerContext && pickerContext.btn;
    pickerContext = null;
    if (btn && btn.focus) btn.focus({ preventScroll: true });
  }

  if (typePickerOptions) {
    typePickerOptions.addEventListener('click', (e) => {
      if (!pickerContext) return;

      if (e.target.closest('[data-picker-back]')) {
        pickerContext.picks.pop();
        renderPickerStep();
        return;
      }

      const opt = e.target.closest('[data-type-id]');
      if (!opt) return;
      pickerContext.picks.push(COMPLETO_TYPES.find(t => t.id === opt.getAttribute('data-type-id')));

      if (pickerContext.picks.length < pickerContext.total) {
        renderPickerStep();
        return;
      }

      const { item, btn, picks } = pickerContext;
      closeTypePicker();
      addToCart(item, btn, picks);
    });
  }
  if (typePickerClose) typePickerClose.addEventListener('click', closeTypePicker);
  if (typePickerOverlay) typePickerOverlay.addEventListener('click', closeTypePicker);

  // Global listener for all "Agregar" buttons
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add-item]');
    if (!addBtn) return;
    e.preventDefault();
    const item = ALL_PRODUCTS.find(i => i.id === addBtn.getAttribute('data-add-item'));
    if (!item) return;
    const choices = typeChoicesNeeded(item);
    if (choices > 0) openTypePicker(item, addBtn, choices);
    else addToCart(item, addBtn);
  });

  // ---------------- Business config sync ----------------
  function syncBusinessConfig() {
    if (typeof BUSINESS_CONFIG === 'undefined') return;
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
      const href = link.getAttribute('href');
      link.href = href.includes('text=')
        ? `https://wa.me/${BUSINESS_CONFIG.whatsappPhone}?text=${href.split('text=')[1]}`
        : `https://wa.me/${BUSINESS_CONFIG.whatsappPhone}`;
    });
    if (BUSINESS_CONFIG.instagram) {
      document.querySelectorAll('a[href*="instagram.com"]').forEach(link => { link.href = BUSINESS_CONFIG.instagram; });
    }
  }

  // ---------------- Open / closed status ----------------
  function updateOpenStatus() {
    if (typeof WEEK_HOURS === 'undefined') return;

    const tz = (BUSINESS_CONFIG && BUSINESS_CONFIG.location && BUSINESS_CONFIG.location.timezone) || 'America/Santiago';
    let now;
    try { now = new Date(new Date().toLocaleString('en-US', { timeZone: tz })); } catch (e) { now = new Date(); }

    const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
    const day = now.getDay();
    const today = WEEK_HOURS[day];
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const isOpen = Array.isArray(today) && nowMin >= toMin(today[0]) && nowMin < toMin(today[1]);

    let label = 'Cerrado ahora';
    if (isOpen) {
      label = `Abierto · hasta ${today[1]}`;
    } else if (Array.isArray(today) && nowMin < toMin(today[0])) {
      label = `Abre hoy ${today[0]}`;
    }

    document.querySelectorAll('[data-open-status]').forEach(el => { el.textContent = label; });
    document.querySelectorAll('[data-open-chip]').forEach(el => el.classList.toggle('is-open', isOpen));

    document.querySelectorAll('.hours [data-days]').forEach(row => {
      const days = row.getAttribute('data-days').split(',').map(Number);
      row.classList.toggle('is-today', days.includes(day));
    });
  }

  // ---------------- Scroll effects ----------------
  // Reveal on scroll
  renderSeitanShop();
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // Scroll-spy for dock + desktop nav
  const spyLinks = document.querySelectorAll('[data-spy]');
  const spyIds = [...new Set([...spyLinks].map(l => l.getAttribute('data-spy')))];
  const spySections = spyIds.map(id => document.getElementById(id)).filter(Boolean);

  function updateSpy() {
    const probe = window.innerHeight * 0.35;
    // The active section is the one whose top most recently crossed the probe line
    let current = null;
    let bestTop = -Infinity;
    spySections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= probe && top > bestTop) { bestTop = top; current = sec.id; }
    });
    spyLinks.forEach(l => {
      const on = l.getAttribute('data-spy') === current;
      l.classList.toggle('is-active', on);
      if (on) l.setAttribute('aria-current', 'location'); else l.removeAttribute('aria-current');
    });
  }

  // Sticky toolbar hairline
  function updateToolbar() {
    if (!menuToolbar) return;
    menuToolbar.classList.toggle('is-stuck', menuToolbar.getBoundingClientRect().top <= 65);
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateSpy(); updateToolbar(); ticking = false; });
  }, { passive: true });

  // Favorites rail progress indicator
  const favRail = document.getElementById('fav-rail');
  const railBar = document.getElementById('rail-progress-bar');
  if (favRail && railBar) {
    const updateRail = () => {
      const max = favRail.scrollWidth - favRail.clientWidth;
      const visible = favRail.clientWidth / favRail.scrollWidth;
      const p = max > 0 ? favRail.scrollLeft / max : 0;
      railBar.style.width = `${Math.max(visible, 0.2) * 100}%`;
      railBar.style.transform = `translateX(${p * (1 / Math.max(visible, 0.2) - 1) * 100}%)`;
    };
    favRail.addEventListener('scroll', updateRail, { passive: true });
    window.addEventListener('resize', updateRail);
    updateRail();
  }

  // Deep link: focus the carta when arriving via #carta
  if (cartaSection && location.hash === '#carta') cartaSection.focus({ preventScroll: true });

  // ---------------- Boot ----------------
  initVariants();
  renderCategories();
  renderMenuItems();
  updateCartUI();
  syncBusinessConfig();
  updateOpenStatus();
  updateSpy();
  updateToolbar();
  setInterval(updateOpenStatus, 60 * 1000);

  if (customerNameInput && state.customerName) customerNameInput.value = state.customerName;
});
