// ==========================================
// BARBAS VEGAN - SEITÁN ARTESANAL
// Formatos, formulario de cotización y detalles de la página
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Safe localStorage helpers (private mode can throw)
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v === null ? fallback : v; } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
    }
  };

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  const icon = (id, cls = '') => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;

  // ---------------- Formats ----------------
  // Simple drawn shapes per format (until there are real photos)
  const FORMAT_ART = {
    laminado: '<div class="art-slices"><span></span><span></span><span></span><span></span><span></span></div>',
    medallones: '<div class="art-medallions"><span></span><span></span><span></span></div>',
    rub: '<div class="art-block art-block--rub"></div>',
    parrillero: '<div class="art-block art-block--grill"></div>'
  };

  function renderFormats() {
    const grid = document.getElementById('format-grid');
    if (!grid || typeof SEITAN_FORMATS === 'undefined') return;

    grid.innerHTML = SEITAN_FORMATS.map(f => `
      <article class="format-card reveal">
        <div class="format-card__art" aria-hidden="true">${FORMAT_ART[f.id] || '<div class="art-block"></div>'}</div>
        <div class="format-card__top">
          <h3 class="format-card__title">${escapeHTML(f.name)}</h3>
          ${f.tagline ? `<span class="badge-sticker badge-green">${escapeHTML(f.tagline)}</span>` : ''}
        </div>
        <p class="format-card__desc">${escapeHTML(f.description)}</p>
        <a href="#cotizar" class="format-card__cta" data-quote-format="${f.id}">
          Cotizar ${escapeHTML(f.name.toLowerCase())} ${icon('i-arrow')}
        </a>
      </article>`).join('');

    const sizes = document.getElementById('seitan-sizes');
    if (sizes && typeof SEITAN_SIZES !== 'undefined') {
      sizes.innerHTML = `<p class="ideas__label">Tamaños de paquete</p>` +
        SEITAN_SIZES.map(s => `<span class="size-pill"><b>${escapeHTML(s.label)}</b>${s.note ? `<small>${escapeHTML(s.note)}</small>` : ''}</span>`).join('');
    }

    const ideas = document.getElementById('seitan-ideas');
    if (ideas && typeof SEITAN_IDEAS !== 'undefined') {
      ideas.innerHTML = `<p class="ideas__label">Ideas para prepararlo</p>` +
        SEITAN_IDEAS.map(i => `<span>${escapeHTML(i)}</span>`).join('');
    }
  }

  // ---------------- Quote form ----------------
  const form = document.getElementById('quote-form');
  const formErrors = document.getElementById('form-errors');
  const formSuccess = document.getElementById('form-success');
  const reopenLink = document.getElementById('reopen-whatsapp');
  const localFields = document.getElementById('local-fields');
  const tipoGroup = document.getElementById('field-tipo');
  const formatOptions = document.getElementById('format-options');
  const freqOptions = document.getElementById('freq-options');

  const fields = {
    localName: document.getElementById('local-name'),
    name: document.getElementById('contact-name'),
    lastName: document.getElementById('contact-lastname'),
    phone: document.getElementById('contact-phone'),
    email: document.getElementById('contact-email'),
    comuna: document.getElementById('contact-comuna'),
    comments: document.getElementById('comments')
  };

  const formatById = (id) => SEITAN_FORMATS.find(f => f.id === id) || { id, name: id };
  const fmtKg = (n) => String(Math.round(n * 100) / 100).replace('.', ',');

  // One row per format: tick it to reveal how many packs of each size
  function renderFormOptions() {
    if (formatOptions && typeof SEITAN_FORMATS !== 'undefined') {
      formatOptions.innerHTML = SEITAN_FORMATS.map(f => `
        <div class="fmt-row" data-format="${f.id}">
          <label class="fmt-row__head">
            <input type="checkbox" name="formato" value="${f.id}" aria-controls="fmt-body-${f.id}" aria-expanded="false">
            <span class="fmt-row__check" aria-hidden="true">${icon('i-check')}</span>
            <span class="fmt-row__name"><b>${escapeHTML(f.name)}</b>${f.tagline ? `<small>${escapeHTML(f.tagline)}</small>` : ''}</span>
          </label>
          <div class="fmt-row__body hidden" id="fmt-body-${f.id}">
            <p class="field-label mt-3" id="sizes-label-${f.id}">¿Cuántos paquetes de cada tamaño? <span class="req" aria-hidden="true">*</span></p>
            <div class="size-grid" role="group" aria-labelledby="sizes-label-${f.id}" aria-describedby="error-qty-${f.id}">
              ${SEITAN_SIZES.map(sz => `
                <div class="size-cell">
                  <label for="qty-${f.id}-${sz.id}"><b>${escapeHTML(sz.label)}</b>${sz.note ? `<small>${escapeHTML(sz.note)}</small>` : ''}</label>
                  <input type="text" id="qty-${f.id}-${sz.id}" class="field size-input" data-row="qty-${f.id}"
                    inputmode="numeric" autocomplete="off" placeholder="0" aria-label="Paquetes de ${escapeHTML(sz.label)} de ${escapeHTML(f.name.toLowerCase())}">
                </div>`).join('')}
            </div>
            <p class="field-error hidden" id="error-qty-${f.id}"></p>
          </div>
        </div>`).join('');
    }
    if (freqOptions && typeof ORDER_FREQUENCIES !== 'undefined') {
      freqOptions.innerHTML = ORDER_FREQUENCIES.map(f => `
        <label class="chip">
          <input type="radio" name="frecuencia" value="${escapeHTML(f)}">
          <span>${icon('i-check')}${escapeHTML(f)}</span>
        </label>`).join('');
    }
  }

  const getTipo = () => (form.querySelector('input[name="tipo"]:checked') || {}).value || '';
  const getFormats = () => [...form.querySelectorAll('input[name="formato"]:checked')].map(i => i.value);

  // Selected formats with the packs requested per size
  function getOrderLines() {
    return getFormats().map(id => {
      const f = formatById(id);
      const sizes = SEITAN_SIZES.map(sz => ({ ...sz, raw: document.getElementById(`qty-${id}-${sz.id}`).value.trim() }));
      return { id, name: f.name, sizes };
    });
  }

  function syncLocalFields() {
    const isLocal = getTipo() === 'local';
    localFields.classList.toggle('hidden', !isLocal);
    if (!isLocal) clearError('local-name');
  }

  function syncFormatRow(checkbox, focus) {
    const row = checkbox.closest('.fmt-row');
    const body = row.querySelector('.fmt-row__body');
    row.classList.toggle('is-selected', checkbox.checked);
    body.classList.toggle('hidden', !checkbox.checked);
    checkbox.setAttribute('aria-expanded', String(checkbox.checked));
    if (!checkbox.checked) {
      clearError(`qty-${checkbox.value}`);
    } else if (focus) {
      const first = body.querySelector('.size-input');
      if (first) first.focus({ preventScroll: true });
    }
  }

  // Error helpers — each error <p> is linked to its field via aria-describedby
  function setError(id, message) {
    const el = document.getElementById(`error-${id}`);
    if (el) {
      el.innerHTML = `${icon('i-alert')}<span>${escapeHTML(message)}</span>`;
      el.classList.remove('hidden');
    }
    const input = document.getElementById(id);
    if (input) input.setAttribute('aria-invalid', 'true');
    if (id === 'tipo') tipoGroup.classList.add('is-invalid');
    if (id === 'formats') formatOptions.classList.add('is-invalid');
  }

  function clearError(id) {
    const el = document.getElementById(`error-${id}`);
    if (el) { el.classList.add('hidden'); el.innerHTML = ''; }
    const input = document.getElementById(id);
    if (input) input.removeAttribute('aria-invalid');
    if (id === 'tipo') tipoGroup.classList.remove('is-invalid');
    if (id === 'formats') formatOptions.classList.remove('is-invalid');
  }

  const allErrorIds = () => ['tipo', 'local-name', 'formats', 'contact-name', 'contact-lastname', 'contact-phone', 'contact-email']
    .concat(SEITAN_FORMATS.map(f => `qty-${f.id}`));

  const phoneDigits = (v) => v.replace(/\D/g, '');

  // Returns a list of { id, focusId, message } for every invalid field
  function validate() {
    const errors = [];
    const tipo = getTipo();

    if (!tipo) errors.push({ id: 'tipo', focusId: 'field-tipo', message: 'Elige si es para ti o para un local.' });
    if (tipo === 'local' && !fields.localName.value.trim()) {
      errors.push({ id: 'local-name', message: 'Escribe el nombre del local.' });
    }

    const lines = getOrderLines();
    if (!lines.length) errors.push({ id: 'formats', focusId: 'format-options', message: 'Elige al menos un formato.' });
    lines.forEach(l => {
      // Packs are whole numbers; empty means "none of this size"
      const bad = l.sizes.some(sz => sz.raw && !/^\d+$/.test(sz.raw));
      const total = l.sizes.reduce((n, sz) => n + (parseInt(sz.raw, 10) || 0), 0);
      if (bad || total === 0) {
        errors.push({
          id: `qty-${l.id}`,
          focusId: `qty-${l.id}-${l.sizes[0].id}`,
          message: bad
            ? `En ${l.name.toLowerCase()}, escribe la cantidad de paquetes con números enteros (ej: 4).`
            : `Indica cuántos paquetes de ${l.name.toLowerCase()} necesitas en al menos un tamaño.`
        });
      }
    });

    if (!fields.name.value.trim()) errors.push({ id: 'contact-name', message: 'Escribe tu nombre.' });
    if (!fields.lastName.value.trim()) errors.push({ id: 'contact-lastname', message: 'Escribe tu apellido.' });

    const digits = phoneDigits(fields.phone.value);
    if (!digits) {
      errors.push({ id: 'contact-phone', message: 'Escribe un teléfono para contactarte.' });
    } else if (digits.length < 8 || digits.length > 15) {
      errors.push({ id: 'contact-phone', message: 'Revisa el teléfono: debería tener entre 8 y 15 dígitos, por ejemplo +56 9 1234 5678.' });
    }

    const email = fields.email.value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ id: 'contact-email', message: 'Revisa el correo, por ejemplo nombre@correo.cl (o déjalo vacío).' });
    }

    return errors;
  }

  function showErrorSummary(errors) {
    formErrors.innerHTML = `
      <p>${icon('i-alert')}Revisa ${errors.length === 1 ? 'este dato' : `estos ${errors.length} datos`}:</p>
      <ul>${errors.map(e => `<li><a href="#${e.focusId || e.id}" data-focus="${e.focusId || e.id}">${escapeHTML(e.message)}</a></li>`).join('')}</ul>`;
    formErrors.classList.remove('hidden');
    formErrors.focus({ preventScroll: true });
    formErrors.scrollIntoView({ block: 'center', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  function buildMessage() {
    const tipo = getTipo();
    const freq = (form.querySelector('input[name="frecuencia"]:checked') || {}).value;

    let m = `*SOLICITUD DE COTIZACIÓN - SEITÁN BARBAS VEGAN*\n`;
    m += `------------------------------------\n`;
    m += `*Tipo:* ${tipo === 'local' ? 'Local / restaurante' : 'Persona (al detalle)'}\n`;
    if (tipo === 'local') {
      m += `*Local:* ${fields.localName.value.trim()}\n`;
      if (freq) m += `*Frecuencia:* ${freq}\n`;
    }
    m += `\n*PEDIDO*\n`;
    let grandKg = 0;
    getOrderLines().forEach(l => {
      const parts = l.sizes.filter(sz => parseInt(sz.raw, 10) > 0)
        .map(sz => `${parseInt(sz.raw, 10)} × ${sz.label}${sz.note ? ` (${sz.note})` : ''}`);
      const kg = l.sizes.reduce((n, sz) => n + (parseInt(sz.raw, 10) || 0) * sz.kg, 0);
      grandKg += kg;
      m += `• ${l.name}: ${parts.join(' + ')} = ${fmtKg(kg)} kg\n`;
    });
    m += `*Total aprox.:* ${fmtKg(grandKg)} kg\n`;
    m += `\n*CONTACTO*\n`;
    m += `*Nombre:* ${fields.name.value.trim()} ${fields.lastName.value.trim()}\n`;
    m += `*Teléfono:* ${fields.phone.value.trim()}\n`;
    if (fields.email.value.trim()) m += `*Correo:* ${fields.email.value.trim()}\n`;
    if (fields.comuna.value.trim()) m += `*Comuna:* ${fields.comuna.value.trim()}\n`;
    if (fields.comments.value.trim()) m += `\n*Comentarios:* ${fields.comments.value.trim()}\n`;
    m += `\n¡Hola Barbas Vegan! Me gustaría recibir una cotización. ¡Gracias!`;
    return m;
  }

  // Validate a single field on blur (only shows errors for fields the user already filled)
  function validateField(id, input) {
    if (!input.value.trim() && id !== 'contact-email') return;
    const err = validate().find(x => x.id === id);
    if (err) setError(id, err.message); else clearError(id);
  }

  if (form) {
    renderFormOptions();

    // Remember contact details for returning visitors
    fields.name.value = store.get('bv_name', '');
    fields.lastName.value = store.get('bv_lastname', '');
    fields.phone.value = store.get('bv_phone', '');

    form.addEventListener('change', (e) => {
      const t = e.target;
      if (t.name === 'tipo') { syncLocalFields(); clearError('tipo'); }
      if (t.name === 'formato') { syncFormatRow(t, true); clearError('formats'); }
    });

    // Blur validation for every text/number field, including the per-format ones (event delegation)
    form.addEventListener('focusout', (e) => {
      const input = e.target;
      if (!input.matches('input[type="text"], input[type="tel"], input[type="email"]') || !input.id) return;
      if (input.dataset.row) {
        // Per-size pack inputs report errors on their format row
        if (!input.value.trim()) return;
        const err = validate().find(x => x.id === input.dataset.row);
        if (err) setError(input.dataset.row, err.message); else clearError(input.dataset.row);
        return;
      }
      if (allErrorIds().includes(input.id)) validateField(input.id, input);
    });
    form.addEventListener('input', (e) => {
      const input = e.target;
      if (input.id && input.getAttribute('aria-invalid')) clearError(input.id);
      if (input.dataset.row) clearError(input.dataset.row);
    });

    formErrors.addEventListener('click', (e) => {
      const link = e.target.closest('[data-focus]');
      if (!link) return;
      e.preventDefault();
      const target = document.getElementById(link.getAttribute('data-focus'));
      if (!target) return;
      const focusable = target.matches('input, textarea') ? target : target.querySelector('input');
      target.scrollIntoView({ block: 'center', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      if (focusable) focusable.focus({ preventScroll: true });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      allErrorIds().forEach(clearError);
      formSuccess.classList.add('hidden');

      const errors = validate();
      if (errors.length) {
        errors.forEach(err => setError(err.id, err.message));
        showErrorSummary(errors);
        return;
      }
      formErrors.classList.add('hidden');

      store.set('bv_name', fields.name.value.trim());
      store.set('bv_lastname', fields.lastName.value.trim());
      store.set('bv_phone', fields.phone.value.trim());

      const url = `https://wa.me/${BUSINESS_CONFIG.whatsappPhone}?text=${encodeURIComponent(buildMessage())}`;
      reopenLink.href = url;
      formSuccess.classList.remove('hidden');
      window.open(url, '_blank');
      formSuccess.focus({ preventScroll: true });
      formSuccess.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  // Shortcut buttons elsewhere on the page pre-fill the form
  document.addEventListener('click', (e) => {
    const typeBtn = e.target.closest('[data-quote-type]');
    const formatBtn = e.target.closest('[data-quote-format]');
    if (!form || (!typeBtn && !formatBtn)) return;

    if (typeBtn) {
      const radio = form.querySelector(`input[name="tipo"][value="${typeBtn.getAttribute('data-quote-type')}"]`);
      if (radio) { radio.checked = true; syncLocalFields(); clearError('tipo'); }
    }
    if (formatBtn) {
      const box = form.querySelector(`input[name="formato"][value="${formatBtn.getAttribute('data-quote-format')}"]`);
      if (box && !box.checked) { box.checked = true; syncFormatRow(box, false); clearError('formats'); }
    }
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
    // Social links in the HTML are kept in sync with the URLs in site-data.js
    [['instagram', 'instagram.com'], ['facebook', 'facebook.com'], ['tiktok', 'tiktok.com']].forEach(([key, host]) => {
      if (!BUSINESS_CONFIG[key]) return;
      document.querySelectorAll(`a[href*="${host}"]`).forEach(link => { link.href = BUSINESS_CONFIG[key]; });
    });
  }

  // ---------------- Delivery apps ----------------
  const DELIVERY_APPS = [
    { key: 'rappi', name: 'Rappi', cls: 'delivery-btn--rappi' },
    { key: 'ubereats', name: 'Uber Eats', cls: 'delivery-btn--uber' }
  ];

  function renderDelivery() {
    const card = document.getElementById('delivery-card');
    const wrap = document.getElementById('delivery-links');
    const links = (typeof BUSINESS_CONFIG !== 'undefined' && BUSINESS_CONFIG.delivery) || {};
    const apps = DELIVERY_APPS.filter(a => links[a.key]);
    if (!card || !wrap || !apps.length) return; // nothing configured: keep the card hidden

    wrap.innerHTML = apps.map(a => `
      <a href="${escapeHTML(links[a.key])}" target="_blank" rel="noopener noreferrer" class="delivery-btn ${a.cls}"
         aria-label="Pedir en ${a.name} (se abre en otra pestaña)">
        <span>${a.name}</span>${icon('i-arrow')}
      </a>`).join('');
    card.classList.remove('hidden');
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
    if (isOpen) label = `Abierto · hasta ${today[1]}`;
    else if (Array.isArray(today) && nowMin < toMin(today[0])) label = `Abre hoy ${today[0]}`;

    document.querySelectorAll('[data-open-status]').forEach(el => { el.textContent = label; });
    document.querySelectorAll('[data-open-chip]').forEach(el => el.classList.toggle('is-open', isOpen));
    document.querySelectorAll('.hours [data-days]').forEach(row => {
      const days = row.getAttribute('data-days').split(',').map(Number);
      row.classList.toggle('is-today', days.includes(day));
    });
  }

  // ---------------- Scroll effects ----------------
  renderFormats(); // before the reveal observer so the cards animate in too

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
  const spySections = [...new Set([...spyLinks].map(l => l.getAttribute('data-spy')))]
    .map(id => document.getElementById(id)).filter(Boolean);

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

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateSpy(); ticking = false; });
  }, { passive: true });

  // ---------------- Boot ----------------
  syncBusinessConfig();
  renderDelivery();
  updateOpenStatus();
  updateSpy();
  setInterval(updateOpenStatus, 60 * 1000);
});
