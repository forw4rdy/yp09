(function () {
  'use strict';

  function esc(value) {
    return String(value)
      .replace(/&/g, '&' + 'amp;')
      .replace(/</g, '&' + 'lt;')
      .replace(/>/g, '&' + 'gt;')
      .replace(/"/g, '&' + 'quot;');
  }

  const services = (window.NM_DATA && window.NM_DATA.services) || [];
  const detail = document.getElementById('svc-detail');

  if (!services.length) {
    if (detail) {
      detail.innerHTML =
        '<div><p class="lead">Список услуг временно недоступен. ' +
        'Позвоните нам: <a href="tel:+73532124590">+7 (3532) 12-45-90</a>.</p></div>';
    }
    return;
  }

  const slug = new URLSearchParams(location.search).get('slug');
  const svc = services.find(function (item) {
    return item.slug === slug;
  }) || services[0];

  document.title = svc.title + ' — автосервис «Надежный мотор»';

  const crumb = document.getElementById('crumb-current');
  if (crumb) crumb.textContent = svc.title;

  const title = document.getElementById('svc-title');
  if (title) title.textContent = svc.title;

  const category = document.getElementById('svc-category');
  if (category) category.textContent = svc.category;

  const formatPrice = function (value) {
    return Number(value).toLocaleString('ru-RU') + ' ₽';
  };

  const includes = (svc.includes || [])
    .map(function (item) {
      return '<li>' + esc(item) + '</li>';
    })
    .join('');

  if (detail) {
    detail.innerHTML =
      '<div>' +
        '<img class="svc-detail__img" src="img/' + esc(svc.image) + '" alt="' + esc(svc.title) + '" width="1280" height="854">' +
        '<p class="svc-detail__desc">' + esc(svc.description) + '</p>' +
        '<p class="includes-title">Что входит в работу</p>' +
        '<ul class="includes">' + includes + '</ul>' +
      '</div>' +
      '<aside class="svc-aside">' +
        '<p class="mono-label">Стоимость работ</p>' +
        '<p class="svc-aside__price">от ' + formatPrice(svc.price) + '</p>' +
        '<p class="svc-aside__note">' + esc(svc.priceNote || 'цена работы, запчасти оплачиваются отдельно') + '</p>' +
        '<ul class="svc-aside__facts">' +
          '<li><b>Срок</b><span>' + esc(svc.duration) + '</span></li>' +
          '<li><b>Категория</b><span>' + esc(svc.category) + '</span></li>' +
          '<li><b>Гарантия</b><span>' + esc(svc.warranty || '—') + '</span></li>' +
        '</ul>' +
        '<a class="btn btn--block" href="contacts.html#zapis">' +
          'Записаться на работу' +
          '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h12M9 3l5 5-5 5" stroke="currentColor" stroke-width="1.6"/></svg>' +
        '</a>' +
      '</aside>';
  }

  /* ---------- Похожие услуги ---------- */

  const sameCategory = services.filter(function (item) {
    return item.category === svc.category && item.slug !== svc.slug;
  });
  const rest = services.filter(function (item) {
    return item.slug !== svc.slug;
  });
  const related = (sameCategory.length ? sameCategory : rest).slice(0, 3);

  const relatedSection = document.getElementById('related-section');
  const relatedList = document.getElementById('related-list');

  if (relatedSection && relatedList && related.length) {
    relatedSection.style.display = '';
    relatedList.innerHTML = related
      .map(function (item) {
        return (
          '<a class="related__item" href="service.html?slug=' + esc(item.slug) + '">' +
            '<span class="related__title">' + esc(item.title) + '</span>' +
            '<span class="related__meta">от ' + formatPrice(item.price) + ' · ' + esc(item.duration) + '</span>' +
          '</a>'
        );
      })
      .join('');
  }
})();
