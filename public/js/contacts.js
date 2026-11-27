(function () {
  'use strict';

  const { apiRequest, initCustomSelect, initPhoneMask } = window.NM;

  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = document.getElementById('contact-status');

  const rules = {
    name: function (value) {
      if (value.length < 2) return 'Укажите имя (минимум 2 символа)';
      if (value.length > 60) return 'Слишком длинное имя';
      return '';
    },
    phone: function (value) {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 1) return '';
      if (digits.length < 10) return 'Номер слишком короткий';
      if (digits.length > 15) return 'Номер слишком длинный';
      return '';
    },
    email: function (value) {
      if (!value) return '';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'Проверьте адрес почты';
      return '';
    },
    message: function (value) {
      if (value.length < 5) return 'Сообщение слишком короткое (минимум 5 символов)';
      if (value.length > 2000) return 'Максимум 2000 символов';
      return '';
    }
  };

  function showError(fieldName, message) {
    const slot = form.querySelector('[data-error-for="' + fieldName + '"]');
    if (slot) slot.textContent = message;
    const input = form.elements[fieldName];
    if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validateField(fieldName) {
    const input = form.elements[fieldName];
    if (!input || !rules[fieldName]) return true;
    const message = rules[fieldName](input.value.trim());
    showError(fieldName, message);
    return !message;
  }

  ['name', 'phone', 'email', 'message'].forEach(function (fieldName) {
    const input = form.elements[fieldName];
    if (input) {
      input.addEventListener('blur', function () {
        validateField(fieldName);
      });
      input.addEventListener('input', function () {
        const slot = form.querySelector('[data-error-for="' + fieldName + '"]');
        if (slot && slot.textContent) showError(fieldName, '');
      });
    }
  });

  async function fillServiceSelect() {
    const select = form.elements.service_id;
    if (!select) return;

    try {
      const { services } = await apiRequest('/api/services');
      const fragment = document.createDocumentFragment();
      const groups = {};

      services.forEach(function (svc) {
        let group = groups[svc.category];
        if (!group) {
          group = document.createElement('optgroup');
          group.label = svc.category;
          groups[svc.category] = group;
          fragment.appendChild(group);
        }
        const option = document.createElement('option');
        option.value = String(svc.id);
        option.textContent = svc.title + ' — от ' +
          Number(svc.price).toLocaleString('ru-RU') + ' ₽';
        group.appendChild(option);
      });

      select.appendChild(fragment);
    } catch (err) {
    }
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    status.textContent = '';
    status.className = 'form__status';

    const fields = ['name', 'phone', 'email', 'message'];
    const valid = fields.map(validateField).every(Boolean);

    if (!valid) {
      status.textContent = 'Проверьте выделенные поля.';
      status.classList.add('is-err');
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const payload = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      service_id: form.service_id && form.service_id.value
        ? Number(form.service_id.value)
        : null,
      message: form.message.value.trim()
    };

    const button = form.querySelector('button[type="submit"]');
    const originalText = button.innerHTML;
    button.disabled = true;
    button.textContent = 'Отправляем…';

    try {
      const data = await apiRequest('/api/messages', {
        method: 'POST',
        body: payload
      });

      status.textContent = '✓ ' + data.message;
      status.classList.add('is-ok');
      form.reset();

      fields.forEach(function (fieldName) {
        showError(fieldName, '');
      });
    } catch (err) {
      status.textContent = err.message;
      status.classList.add('is-err');
    } finally {
      button.disabled = false;
      button.innerHTML = originalText;
    }
  });

  initPhoneMask(form.phone);

  fillServiceSelect().then(function () {
    initCustomSelect(form.elements.service_id);
  });
})();
