(function () {
  'use strict';

  document.documentElement.classList.add('motion');

  /* ---------- Появление элементов при скролле ---------- */

  const targets = document.querySelectorAll('.reveal');

  function show(el) {
    el.classList.add('is-visible');
  }

  if ('IntersectionObserver' in window && targets.length) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            show(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    targets.forEach(show);
  }

  /* страница считается оживлённой — скрипты загрузились */
  window.NM_REVEALED = true;
})();
