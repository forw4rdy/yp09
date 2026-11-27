(function () {
  'use strict';

  async function apiRequest(url, options) {
    const opts = options || {};
    const config = {
      method: opts.method || 'GET',
      headers: { Accept: 'application/json' }
    };

    if (opts.body) {
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(opts.body);
    }

    let response;
    try {
      response = await fetch(url, config);
    } catch (err) {
      throw new Error('Не удалось связаться с сервером. Проверьте подключение.');
    }

    let data = null;
    try {
      data = await response.json();
    } catch (err) {
      throw new Error('Сервер вернул некорректный ответ.');
    }

    if (!response.ok || data.ok === false) {
      throw new Error((data && data.error) || 'Произошла ошибка. Попробуйте ещё раз.');
    }

    return data;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatPrice(value) {
    return Number(value).toLocaleString('ru-RU') + ' ₽';
  }

  function initCustomSelect(select) {
    if (!select || select.dataset.cselectReady) return null;
    select.dataset.cselectReady = '1';

    const wrap = document.createElement('div');
    wrap.className = 'cselect';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cselect__btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');

    const valueEl = document.createElement('span');
    valueEl.className = 'cselect__value';

    const caret = document.createElement('span');
    caret.className = 'cselect__caret';
    caret.setAttribute('aria-hidden', 'true');

    btn.appendChild(valueEl);
    btn.appendChild(caret);

    const menu = document.createElement('ul');
    menu.className = 'cselect__menu';
    menu.setAttribute('role', 'listbox');
    menu.hidden = true;

    select.insertAdjacentElement('afterend', wrap);
    wrap.appendChild(btn);
    wrap.appendChild(menu);
    select.classList.add('cselect__native');

    let options = [];

    function addOption(opt) {
      const li = document.createElement('li');
      li.className = 'cselect__opt';
      li.setAttribute('role', 'option');
      li.tabIndex = -1;
      li.dataset.value = opt.value;

      const label = document.createElement('span');
      label.className = 'cselect__opt-text';
      label.textContent = opt.textContent;

      li.appendChild(label);
      li.addEventListener('click', function () {
        choose(opt.value);
      });

      menu.appendChild(li);
      options.push(li);
    }

    function rebuild() {
      menu.textContent = '';
      options = [];

      Array.prototype.forEach.call(select.children, function (node) {
        if (node.tagName === 'OPTGROUP') {
          const group = document.createElement('li');
          group.className = 'cselect__group';
          group.setAttribute('role', 'presentation');
          group.textContent = node.label;
          menu.appendChild(group);
          Array.prototype.forEach.call(node.children, addOption);
        } else if (node.tagName === 'OPTION') {
          addOption(node);
        }
      });

      sync();
    }

    function sync() {
      const opt = select.options[select.selectedIndex];
      valueEl.textContent = opt ? opt.textContent : '';
      options.forEach(function (li) {
        li.setAttribute('aria-selected', String(li.dataset.value === select.value));
      });
    }

    function selectedIndex() {
      for (let i = 0; i < options.length; i++) {
        if (options[i].getAttribute('aria-selected') === 'true') return i;
      }
      return 0;
    }

    function position() {
      const rect = btn.getBoundingClientRect();
      const gap = 8;
      const edge = 8;
      const spaceBelow = window.innerHeight - rect.bottom - gap - edge;
      const spaceAbove = rect.top - gap - edge;
      const up = spaceBelow < 180 && spaceAbove > spaceBelow;

      menu.style.left = Math.max(edge, Math.round(rect.left)) + 'px';
      menu.style.width = Math.round(rect.width) + 'px';
      menu.style.maxHeight =
        Math.max(160, Math.min(296, up ? spaceAbove : spaceBelow)) + 'px';

      if (up) {
        menu.style.top = 'auto';
        menu.style.bottom = Math.round(window.innerHeight - rect.top + gap) + 'px';
      } else {
        menu.style.bottom = 'auto';
        menu.style.top = Math.round(rect.bottom + gap) + 'px';
      }
    }

    function reposition() {
      if (!menu.hidden) position();
    }

    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);

    function open(index) {
      menu.hidden = false;
      wrap.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      position();
      const target = options[index];
      if (target) target.focus();
    }

    function close(returnFocus) {
      if (menu.hidden) return;
      menu.hidden = true;
      wrap.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      if (returnFocus) btn.focus();
    }

    function choose(value) {
      select.value = value;
      sync();
      close(true);
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }

    btn.addEventListener('click', function () {
      if (menu.hidden) open(selectedIndex());
      else close(false);
    });

    document.addEventListener('pointerdown', function (event) {
      if (!menu.hidden && !wrap.contains(event.target)) close(false);
    });

    wrap.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        if (!menu.hidden) {
          event.preventDefault();
          close(true);
        }
        return;
      }

      if (event.key === 'Tab') {
        close(false);
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (menu.hidden) {
          open(event.key === 'ArrowDown' ? selectedIndex() : options.length - 1);
          return;
        }
        let next = options.indexOf(document.activeElement);
        if (next < 0) next = event.key === 'ArrowDown' ? -1 : 0;
        next += event.key === 'ArrowDown' ? 1 : -1;
        if (next < 0) next = options.length - 1;
        if (next >= options.length) next = 0;
        if (options[next]) options[next].focus();
        return;
      }

      if (
        (event.key === 'Enter' || event.key === ' ') &&
        event.target !== btn &&
        event.target.dataset
      ) {
        event.preventDefault();
        choose(event.target.dataset.value);
      }
    });

    rebuild();

    return { rebuild: rebuild, sync: sync, open: open, close: close };
  }

  function formatPhone(value) {
    let digits = String(value).replace(/\D/g, '');

    if (digits.charAt(0) === '8') digits = '7' + digits.slice(1);
    if (digits.charAt(0) !== '7') digits = '7' + digits;
    digits = digits.slice(0, 11);

    const local = digits.slice(1);
    let out = '+7';

    if (local.length) out += ' (' + local.slice(0, 3);
    if (local.length >= 3) out += ')';
    if (local.length > 3) out += ' ' + local.slice(3, 6);
    if (local.length > 6) out += '-' + local.slice(6, 8);
    if (local.length > 8) out += '-' + local.slice(8, 10);

    return out;
  }

  function caretAfterDigits(text, count) {
    if (count <= 0) return 0;
    let seen = 0;
    for (let i = 0; i < text.length; i++) {
      if (text.charAt(i) >= '0' && text.charAt(i) <= '9') {
        seen++;
        if (seen === count) return i + 1;
      }
    }
    return text.length;
  }

  function initPhoneMask(input) {
    if (!input || input.dataset.phoneMask) return;
    input.dataset.phoneMask = '1';

    function toEnd() {
      const len = input.value.length;
      input.setSelectionRange(len, len);
    }

    input.addEventListener('focus', function () {
      if (input.value.replace(/\D/g, '').length <= 1) {
        input.value = '+7 ';
        toEnd();
      }
    });

    input.addEventListener('input', function () {
      const digitsBefore = input
        .value.slice(0, input.selectionStart || 0)
        .replace(/\D/g, '').length;

      const formatted = formatPhone(input.value);
      input.value = formatted === '+7' ? '+7 ' : formatted;

      const pos = caretAfterDigits(input.value, digitsBefore);
      input.setSelectionRange(pos, pos);
    });

    input.addEventListener('blur', function () {
      if (input.value.replace(/\D/g, '').length <= 1) input.value = '';
    });
  }

  window.NM = { apiRequest, escapeHtml, formatPrice, initCustomSelect, formatPhone, initPhoneMask };

  const header = document.getElementById('header');
  let lastScroll = window.scrollY;

  function onScroll() {
    const current = window.scrollY;
    if (header) {
      if (current > lastScroll && current > 240) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
    }
    lastScroll = current;
  }

  window.addEventListener('scroll', onScroll, { passive: true });

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

  const path = window.location.pathname;
  document.querySelectorAll('[data-nav]').forEach(function (link) {
    const href = link.getAttribute('href');
    const isActive =
      href === path ||
      (href !== '/' && path.indexOf(href) === 0);
    if (isActive) link.classList.add('is-active');
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

  if (path.indexOf('/services') === 0) {
    document.querySelectorAll('[data-nav="/services"]').forEach(function (link) {
      link.classList.add('is-active');
    });
  }
})();
