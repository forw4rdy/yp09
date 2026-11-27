(function () {
  'use strict';

  const { apiRequest, escapeHtml, formatPrice } = window.NM;

  const grid = document.getElementById('services-grid');
  const filtersBox = document.getElementById('filters');
  const emptyBox = document.getElementById('services-empty');

  let activeCategory = 'Все';

  const ARROW_SVG =
    '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h12M9 3l5 5-5 5" stroke="currentColor" stroke-width="1.6"/></svg>';

  function renderServices(services) {
    if (!services.length) {
      grid.innerHTML = '';
      emptyBox.style.display = 'block';
      return;
    }

    emptyBox.style.display = 'none';

    grid.innerHTML = services
      .map(function (svc, i) {
        const delay = Math.min(i * 0.06, 0.3);
        return (
          '<a class="svc-card reveal" style="--delay:' + delay + 's" href="/services/' +
          escapeHtml(svc.slug) + '">' +
          '<span class="svc-card__media">' +
          '<img class="svc-card__img" src="/img/' + escapeHtml(svc.image || 'hero.jpg') +
          '" alt="' + escapeHtml(svc.title) + '" width="800" height="1000" loading="lazy">' +
          '</span>' +
          '<span class="svc-card__body">' +
          '<span class="svc-card__cat">' + escapeHtml(svc.category) + '</span>' +
          '<span class="svc-card__title">' + escapeHtml(svc.title) + '</span>' +
          '<span class="svc-card__text">' + escapeHtml(svc.summary) + '</span>' +
          '<span class="svc-card__foot">' +
          '<span class="svc-card__price">от ' + formatPrice(svc.price) + '</span>' +
          '<span class="svc-card__more">Подробнее ' + ARROW_SVG + '</span>' +
          '</span>' +
          '</span>' +
          '</a>'
        );
      })
      .join('');

    requestAnimationFrame(function () {
      grid.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
    });
  }

  async function loadServices(category) {
    const url =
      '/api/services' +
      (category && category !== 'Все'
        ? '?category=' + encodeURIComponent(category)
        : '');

    grid.setAttribute('aria-busy', 'true');

    try {
      const data = await apiRequest(url);
      renderServices(data.services);
    } catch (err) {
      grid.innerHTML =
        '<p class="lead" style="grid-column:1/-1; padding:32px 0;">' +
        escapeHtml(err.message) +
        '</p>';
    } finally {
      grid.removeAttribute('aria-busy');
    }
  }

  function renderFilters(categories) {
    const all = ['Все'].concat(categories);

    filtersBox.innerHTML = all
      .map(function (cat) {
        const isActive = cat === activeCategory;
        return (
          '<button class="filter-btn' + (isActive ? ' is-active' : '') +
          '" type="button" data-category="' + escapeHtml(cat) +
          '" aria-pressed="' + isActive + '">' +
          escapeHtml(cat) +
          '</button>'
        );
      })
      .join('');
  }

  async function loadFilters() {
    try {
      const data = await apiRequest('/api/services/categories');
      renderFilters(data.categories);
    } catch (err) {
    }
  }

  if (filtersBox) {
    filtersBox.addEventListener('click', function (event) {
      const button = event.target.closest('.filter-btn');
      if (!button) return;

      activeCategory = button.getAttribute('data-category');

      filtersBox.querySelectorAll('.filter-btn').forEach(function (btn) {
        const isActive = btn === button;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
      });

      loadServices(activeCategory);
    });
  }

  loadFilters();
  loadServices(activeCategory);
})();
