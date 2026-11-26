(function () {
  'use strict';

  const header = document.getElementById('header');
  let lastScroll = window.scrollY;

  function onScroll() {
    const current = window.scrollY;
    if (header) {
      header.classList.toggle('is-scrolled', current > 8);
      if (current > lastScroll && current > 260) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
    }
    lastScroll = current;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobile-menu');

  function closeMenu() {
    if (!burger || !mobileMenu) return;
    burger.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      const open = mobileMenu.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }


  const page = location.pathname.split('/').pop() || 'index.html';
  const section = page.indexOf('service') === 0 ? 'services.html' : page;

  document.querySelectorAll('[data-nav]').forEach(function (link) {
    if (link.getAttribute('data-nav') === section) link.classList.add('is-active');
  });


  const revealTargets = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealTargets.length) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealTargets.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }


  document.querySelectorAll('.faq__q').forEach(function (button) {
    button.addEventListener('click', function () {
      const item = button.closest('.faq__item');
      const answer = item.querySelector('.faq__a');
      const isOpen = item.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
      answer.style.maxHeight = isOpen ? answer.scrollHeight + 'px' : '0px';
    });
  });


  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });


  function fillServiceSelects() {
    const data = window.NM_DATA;
    if (!data) return;

    document.querySelectorAll('select[name="service_id"]').forEach(function (select) {
      const fragment = document.createDocumentFragment();
      data.services.forEach(function (svc) {
        const option = document.createElement('option');
        option.value = svc.slug;
        option.textContent = svc.title + ' — от ' + svc.price.toLocaleString('ru-RU') + ' ₽';
        fragment.appendChild(option);
      });
      select.appendChild(fragment);
    });
  }

  fillServiceSelects();

  /* содержимое страницы оживлено — снимаем страховку из <head> */
  window.NM_REVEALED = true;


  function formatPrice(value) {
    return Number(value).toLocaleString('ru-RU') + ' ₽';
  }

  window.NM = {
    formatPrice: formatPrice,

    digits: function (value) {
      return String(value || '').replace(/\D/g, '');
    },

    setError: function (form, name, message) {
      const box = form.querySelector('[data-error-for="' + name + '"]');
      if (box) box.textContent = message || '';
    },

    attachForm: function (formId, statusId, validate, successText) {
      const form = document.getElementById(formId);
      if (!form) return;

      const status = statusId ? document.getElementById(statusId) : null;

      form.addEventListener('submit', function (event) {
        event.preventDefault();

        form.querySelectorAll('.field__error').forEach(function (el) {
          el.textContent = '';
        });
        if (status) {
          status.textContent = '';
          status.className = 'form__status';
        }

        const errors = validate(form) || {};
        const names = Object.keys(errors);

        if (names.length) {
          names.forEach(function (name) {
            window.NM.setError(form, name, errors[name]);
          });
          if (status) {
            status.textContent = 'Проверьте отмеченные поля.';
            status.classList.add('is-err');
          }
          return;
        }

        const button = form.querySelector('button[type="submit"]');
        if (button) {
          button.disabled = true;
          button.textContent = 'Отправляем…';
          window.setTimeout(function () {
            button.disabled = false;
            button.textContent = button.getAttribute('data-label') || 'Отправить';
          }, 700);
        }

        if (status) {
          status.textContent = successText;
          status.classList.add('is-ok');
        }
        form.reset();
      });
    }
  };
})();
