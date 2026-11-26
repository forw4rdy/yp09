(function () {
  'use strict';

  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('#services-grid .svc-card');
  const empty = document.getElementById('services-empty');

  if (!buttons.length || !cards.length) return;

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      const filter = button.getAttribute('data-filter');

      buttons.forEach(function (b) {
        b.classList.toggle('is-active', b === button);
      });

      let shown = 0;

      cards.forEach(function (card) {
        const match = filter === 'all' || card.getAttribute('data-category') === filter;
        card.style.display = match ? '' : 'none';
        if (match) shown += 1;
      });

      if (empty) empty.style.display = shown ? 'none' : '';
    });
  });
})();
