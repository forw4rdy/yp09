(function () {
  'use strict';

  const NM = window.NM || {};
  const formatPrice = NM.formatPrice || function (v) {
    return Number(v).toLocaleString('ru-RU') + ' ₽';
  };

  /* ---------- Счётчики в блоке статистики ---------- */

  const counters = document.querySelectorAll('.count[data-count]');

  function runCounter(el) {
    const target = Number(el.getAttribute('data-count')) || 0;

    if (!('IntersectionObserver' in window)) {
      el.textContent = target.toLocaleString('ru-RU');
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(el);

        const started = performance.now();
        const duration = 1200;

        function step(now) {
          const p = Math.min((now - started) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString('ru-RU');
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target.toLocaleString('ru-RU');
        }

        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });

    observer.observe(el);
  }

  counters.forEach(runCounter);

  /* ---------- Свет, следующий за курсором в тайл-герое ---------- */

  document.querySelectorAll('.tile--spot').forEach(function (tile) {
    tile.addEventListener('pointermove', function (event) {
      const rect = tile.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      tile.style.setProperty('--mx', x.toFixed(1) + '%');
      tile.style.setProperty('--my', y.toFixed(1) + '%');
    });
  });

  /* ---------- Форма записи ---------- */

  if (typeof NM.attachForm === 'function') {
    NM.attachForm(
      'booking-form',
      'booking-status',
      function (form) {
        const errors = {};
        const nameInput = form.querySelector('[name="name"]');
        const phoneInput = form.querySelector('[name="phone"]');
        const name = ((nameInput && nameInput.value) || '').trim();
        const phone = (phoneInput && phoneInput.value) || '';

        if (name.length < 2) errors.name = 'Укажите имя — хотя бы 2 символа.';

        if (NM.digits(phone).length < 10) {
          errors.phone = 'Нужен номер телефона: не меньше 10 цифр.';
        }

        return errors;
      },
      '✓ Спасибо! Заявка принята — перезвоним в течение 15 минут.'
    );
  }
})();
