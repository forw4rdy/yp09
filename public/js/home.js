(function () {
  'use strict';

  const { apiRequest, escapeHtml, formatPrice, initCustomSelect, initPhoneMask } = window.NM;

  async function loadServices() {
    const box = document.getElementById('home-services');
    if (!box) return;

    try {
      const data = await apiRequest('/api/services');
      const items = data.services.slice(0, 6);

      box.innerHTML = items
        .map(function (svc, i) {
          const num = String(i + 1).padStart(2, '0');
          const feature = i === 0;

          return (
            '<a class="svc-tile' + (feature ? ' svc-tile--feature' : '') +
            '" style="--i:' + i + '" href="/services/' + escapeHtml(svc.slug) + '">' +
            (feature
              ? '<img class="svc-tile__bg" src="/img/' + escapeHtml(svc.image || 'hero.jpg') +
                '" alt="" width="1200" height="800" loading="lazy">'
              : '') +
            '<span class="svc-tile__top">' +
            '<span class="svc-tile__cat">' + escapeHtml(svc.category) + '</span>' +
            '<span class="svc-tile__num">' + num + '</span>' +
            '</span>' +
            '<span class="svc-tile__title">' + escapeHtml(svc.title) + '</span>' +
            '<span class="svc-tile__text">' + escapeHtml(svc.summary) + '</span>' +
            '<span class="svc-tile__foot">' +
            '<span class="svc-tile__price">от ' + formatPrice(svc.price) + '</span>' +
            '<span class="svc-tile__time">' + escapeHtml(svc.duration) + '</span>' +
            '<span class="svc-tile__go" aria-hidden="true">→</span>' +
            '</span>' +
            '</a>'
          );
        })
        .join('') +
        '<a class="svc-tile svc-tile--all" href="/services">' +
        '<span class="svc-tile__top">' +
        '<span class="svc-tile__cat">Все категории</span>' +
        '<span class="svc-tile__num">12</span>' +
        '</span>' +
        '<span class="svc-tile__title">Полный каталог услуг с ценами и сроками</span>' +
        '<span class="svc-tile__text">Диагностика, двигатель, ходовая, электрика, колёса — 12 позиций с гарантией.</span>' +
        '<span class="svc-tile__foot">' +
        '<span class="svc-tile__price">Смотреть каталог</span>' +
        '<span class="svc-tile__go" aria-hidden="true">→</span>' +
        '</span>' +
        '</a>';
    } catch (err) {
      box.innerHTML =
        '<p class="lead" style="padding:24px 0;">' +
        escapeHtml(err.message) +
        '</p>';
    }
  }

  function starRow(rating) {
    let out = '';
    for (let i = 1; i <= 5; i++) {
      out += i <= rating ? '★' : '☆';
    }
    return out;
  }

  async function loadReviews() {
    const box = document.getElementById('home-reviews');
    if (!box) return;

    try {
      const data = await apiRequest('/api/reviews?limit=3');

      const summary =
        '<article class="tile review-summary">' +
        '<div>' +
        '<div class="review-summary__num">4.9<small>/5</small></div>' +
        '<div class="review-summary__stars" aria-hidden="true">★★★★★</div>' +
        '</div>' +
        '<p class="review-summary__label">Средняя оценка по 312 отзывам на Яндекс.Картах и в 2ГИС</p>' +
        '</article>';

      box.innerHTML =
        summary +
        data.reviews
          .map(function (rev, i) {
            return (
              '<article class="tile review-tile" style="--i:' + (i + 1) + '">' +
              '<div class="review-tile__stars" aria-label="Оценка ' + rev.rating + ' из 5">' +
              starRow(rev.rating) +
              '</div>' +
              '<p class="review-tile__text">«' + escapeHtml(rev.text) + '»</p>' +
              '<div class="review-tile__author">' +
              '<span class="review-tile__name">' + escapeHtml(rev.author) + '</span>' +
              '<span class="review-tile__car">' + escapeHtml(rev.car || 'Без указания авто') + '</span>' +
              '</div>' +
              '</article>'
            );
          })
          .join('');
    } catch (err) {
      box.innerHTML =
        '<p class="lead" style="padding:24px;">' + escapeHtml(err.message) + '</p>';
    }
  }

  async function fillServiceSelect() {
    const select = document.getElementById('bk-service');
    if (!select) return;

    try {
      const data = await apiRequest('/api/services');
      const fragment = document.createDocumentFragment();

      data.services.forEach(function (svc) {
        const option = document.createElement('option');
        option.value = String(svc.id);
        option.textContent = svc.title + ' — от ' + formatPrice(svc.price);
        fragment.appendChild(option);
      });

      select.appendChild(fragment);
    } catch (err) {
    }
  }

  const bookingForm = document.getElementById('booking-form');
  let servicePicker = null;

  if (bookingForm) {
    const status = document.getElementById('booking-status');

    const rules = {
      name: function (value) {
        if (value.length < 2) return 'Укажите имя (минимум 2 символа)';
        if (value.length > 60) return 'Слишком длинное имя';
        return '';
      },
      phone: function (value) {
        const digits = value.replace(/\D/g, '');
        if (digits.length < 10) return 'Введите номер полностью: +7 (___) ___-__-__';
        if (digits.length > 15) return 'Номер слишком длинный';
        return '';
      }
    };

    const isEmpty = {
      name: function (value) {
        return value.length === 0;
      },
      phone: function (value) {
        return value.replace(/\D/g, '').length <= 1;
      }
    };

    function showError(field, message) {
      const slot = bookingForm.querySelector('[data-error-for="' + field + '"]');
      if (slot) slot.textContent = message;
      const input = bookingForm.elements[field];
      if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    function validateField(field, skipEmpty) {
      const input = bookingForm.elements[field];
      if (!input || !rules[field]) return true;

      const value = input.value.trim();
      if (skipEmpty && isEmpty[field](value)) {
        showError(field, '');
        return true;
      }

      const message = rules[field](value);
      showError(field, message);
      return !message;
    }

    ['name', 'phone'].forEach(function (field) {
      const input = bookingForm.elements[field];
      if (!input) return;

      input.addEventListener('blur', function () {
        validateField(field, true);
      });

      input.addEventListener('input', function () {
        const slot = bookingForm.querySelector('[data-error-for="' + field + '"]');
        if (slot && slot.textContent) showError(field, '');
      });
    });

    bookingForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      bookingForm.querySelectorAll('.field__error').forEach(function (el) {
        el.textContent = '';
      });
      status.textContent = '';
      status.className = 'form__status';

      const valid = ['name', 'phone']
        .map(function (field) {
          return validateField(field, false);
        })
        .every(Boolean);

      if (!valid) {
        status.textContent = 'Проверьте выделенные поля.';
        status.classList.add('is-err');
        const firstInvalid = bookingForm.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const payload = {
        name: bookingForm.name.value.trim(),
        phone: bookingForm.phone.value.trim(),
        service_id: bookingForm.service_id.value || null,
        comment: bookingForm.comment.value.trim()
      };

      const button = bookingForm.querySelector('button[type="submit"]');
      button.disabled = true;
      const originalText = button.innerHTML;
      button.textContent = 'Отправляем…';

      try {
        const data = await apiRequest('/api/bookings', {
          method: 'POST',
          body: payload
        });

        status.textContent = '✓ ' + data.message;
        status.classList.add('is-ok');
        bookingForm.reset();

        ['name', 'phone'].forEach(function (field) {
          showError(field, '');
        });
        if (servicePicker) servicePicker.sync();
      } catch (err) {
        status.textContent = err.message;
        status.classList.add('is-err');
      } finally {
        button.disabled = false;
        button.innerHTML = originalText;
      }
    });
  }

  loadServices();
  loadReviews();
  fillServiceSelect().then(function () {
    servicePicker = initCustomSelect(document.getElementById('bk-service'));
  });

  if (bookingForm) initPhoneMask(bookingForm.phone);
})();
