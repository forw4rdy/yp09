(function () {
  'use strict';

  const { apiRequest, escapeHtml, formatPrice } = window.NM;

  const slug = window.location.pathname.split('/').filter(Boolean).pop();

  const titleEl = document.getElementById('svc-title');
  const categoryEl = document.getElementById('svc-category');
  const crumbEl = document.getElementById('crumb-current');
  const detailEl = document.getElementById('svc-detail');
  const asideEl = document.getElementById('svc-aside');
  const relatedSection = document.getElementById('related-section');
  const relatedList = document.getElementById('related-list');

  function renderNotFound(message) {
    document.title = 'Услуга не найдена — Надежный мотор';
    titleEl.textContent = 'Услуга не найдена';
    crumbEl.textContent = 'Не найдено';
    detailEl.innerHTML =
      '<div>' +
      '<p class="lead">' + escapeHtml(message) + '</p>' +
      '<p style="margin-top:28px;"><a class="btn btn--ghost" href="/services">Вернуться к списку услуг</a></p>' +
      '</div>';
    asideEl.remove();
  }

  function renderService(svc) {
    document.title = svc.title + ' — ' + formatPrice(svc.price) + ' | Надежный мотор';

    titleEl.textContent = svc.title;
    categoryEl.textContent = svc.category;
    crumbEl.textContent = svc.title;

    const includes = Array.isArray(svc.includes) ? svc.includes : [];

    detailEl.innerHTML =
      '<div>' +
      '<img class="svc-detail__img" src="/img/' + escapeHtml(svc.image || 'hero.jpg') +
      '" alt="' + escapeHtml(svc.title) + '" width="1200" height="800">' +
      '<p class="svc-detail__desc">' + escapeHtml(svc.description) + '</p>' +
      '<h2 class="includes-title">Что входит в работу</h2>' +
      '<ul class="includes">' +
      includes
        .map(function (item) {
          return '<li>' + escapeHtml(item) + '</li>';
        })
        .join('') +
      '</ul>' +
      '</div>';

    detailEl.appendChild(asideEl);

    asideEl.removeAttribute('aria-hidden');
    asideEl.innerHTML =
      '<p class="mono-label">Стоимость работы</p>' +
      '<div class="svc-aside__price">от ' + formatPrice(svc.price) + '</div>' +
      '<p class="svc-aside__note">' + escapeHtml(svc.price_note || 'цена ориентировочная, точная — после диагностики') + '</p>' +
      '<ul class="svc-aside__facts">' +
      '<li><b>Срок</b><span>' + escapeHtml(svc.duration || 'уточняется') + '</span></li>' +
      '<li><b>Гарантия</b><span>' + escapeHtml(svc.warranty || '12 месяцев') + '</span></li>' +
      '<li><b>Диагностика</b><span>при ремонте — бесплатно</span></li>' +
      '</ul>' +
      '<a class="btn btn--block" href="/contacts#zapis">Записаться на услугу' +
      '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h12M9 3l5 5-5 5" stroke="currentColor" stroke-width="1.6"/></svg>' +
      '</a>';
  }

  function renderRelated(items) {
    if (!items.length) return;

    relatedSection.style.display = '';
    relatedList.innerHTML = items
      .map(function (svc) {
        return (
          '<a class="related__item" href="/services/' + escapeHtml(svc.slug) + '">' +
          '<span class="mono-label">Услуга</span>' +
          '<span class="related__title">' + escapeHtml(svc.title) + '</span>' +
          '<span class="related__meta">от ' + formatPrice(svc.price) + ' · ' + escapeHtml(svc.duration) + '</span>' +
          '</a>'
        );
      })
      .join('');
  }

  async function load() {
    try {
      const data = await apiRequest('/api/services/' + encodeURIComponent(slug));
      renderService(data.service);
      renderRelated(data.related || []);
    } catch (err) {
      renderNotFound(err.message);
    }
  }

  load();
})();
