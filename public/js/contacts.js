(function () {
  'use strict';

  const NM = window.NM;

  if (typeof NM !== 'object' || typeof NM.attachForm !== 'function') return;

  NM.attachForm(
    'contact-form',
    'contact-status',
    function (form) {
      const errors = {};

      const value = function (selector) {
        const el = form.querySelector(selector);
        return el ? el.value.trim() : '';
      };

      const name = value('[name="name"]');
      const phone = value('[name="phone"]');
      const email = value('[name="email"]');
      const message = value('[name="message"]');

      if (name.length < 2) errors.name = 'Напишите, как к вам обращаться.';
      if (message.length < 5) errors.message = 'Опишите вопрос хотя бы парой предложений.';

      if (phone && NM.digits(phone).length < 10) {
        errors.phone = 'Похоже, в номере меньше 10 цифр.';
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        errors.email = 'Проверьте адрес почты.';
      }

      return errors;
    },
    '✓ Спасибо! Сообщение принято — ответим в течение рабочего дня.'
  );
})();
