(function () {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover)').matches;

  root.classList.add('motion');

  const header = document.getElementById('header');

  function updateHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  const counters = document.querySelectorAll('.count[data-count]');

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    if (!Number.isFinite(target)) return;

    if (reduceMotion) {
      el.textContent = formatNumber(target);
      return;
    }

    const duration = 1500;
    const start = performance.now();

    function step(now) {
      const progressValue = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progressValue, 3);
      el.textContent = formatNumber(Math.round(target * eased));
      if (progressValue < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function formatNumber(value) {
    return Number(value).toLocaleString('ru-RU');
  }

  if ('IntersectionObserver' in window && counters.length) {
    const counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach(function (el) {
      counterObserver.observe(el);
    });
  } else {
    counters.forEach(animateCounter);
  }

  if (canHover) {
    document.querySelectorAll('.tile--spot').forEach(function (tile) {
      tile.addEventListener('pointermove', function (event) {
        const rect = tile.getBoundingClientRect();
        tile.style.setProperty('--mx', ((event.clientX - rect.left) / rect.width) * 100 + '%');
        tile.style.setProperty('--my', ((event.clientY - rect.top) / rect.height) * 100 + '%');
      });
    });
  }

  if (canHover) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);

    const ease = 0.14;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let frame = null;
    let lastTick = 0;
    let direct = false;
    let shown = false;

    function paint() {
      glow.style.transform =
        'translate3d(' + curX.toFixed(1) + 'px, ' + curY.toFixed(1) + 'px, 0)';
    }

    function tick(now) {
      lastTick = now;

      const dx = targetX - curX;
      const dy = targetY - curY;

      if (Math.abs(dx) < 0.3 && Math.abs(dy) < 0.3) {
        curX = targetX;
        curY = targetY;
        paint();
        frame = null;
        return;
      }

      curX += dx * ease;
      curY += dy * ease;
      paint();
      frame = requestAnimationFrame(tick);
    }

    function start() {
      if (direct || frame !== null) return;
      frame = requestAnimationFrame(tick);

      window.setTimeout(function () {
        if (frame !== null && performance.now() - lastTick > 500) {
          window.cancelAnimationFrame(frame);
          frame = null;
          direct = true;
          curX = targetX;
          curY = targetY;
          paint();
        }
      }, 700);
    }

    window.addEventListener(
      'pointermove',
      function (event) {
        if (event.pointerType === 'touch') return;

        targetX = event.clientX;
        targetY = event.clientY;

        if (!shown) {
          shown = true;
          curX = targetX;
          curY = targetY;
          paint();
          glow.classList.add('is-on');
          start();
          return;
        }

        if (direct) {
          curX = targetX;
          curY = targetY;
          paint();
          return;
        }

        if (frame === null) start();
      },
      { passive: true }
    );

    function hide() {
      if (!shown) return;
      shown = false;
      glow.classList.remove('is-on');
    }

    document.addEventListener('pointerout', function (event) {
      if (!event.relatedTarget) hide();
    });
    window.addEventListener('blur', hide);
  }

  if (canHover && !reduceMotion) {
    document.querySelectorAll('.tilt').forEach(function (tile) {
      let frame = null;

      function reset() {
        tile.style.transform = '';
        if (frame) cancelAnimationFrame(frame);
        frame = null;
      }

      tile.addEventListener('pointermove', function (event) {
        const rect = tile.getBoundingClientRect();
        const dx = (event.clientX - rect.left) / rect.width - 0.5;
        const dy = (event.clientY - rect.top) / rect.height - 0.5;

        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(function () {
          tile.style.transform =
            'perspective(900px) rotateX(' + (-dy * 3.2).toFixed(2) + 'deg) rotateY(' +
            (dx * 3.2).toFixed(2) + 'deg) translateY(-2px)';
        });
      });

      tile.addEventListener('pointerleave', reset);
    });
  }

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }
})();
