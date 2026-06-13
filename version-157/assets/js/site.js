(() => {
  const menuButton = document.querySelector('[data-menu-button]');
  if (menuButton) {
    menuButton.addEventListener('click', () => {
      document.body.classList.toggle('menu-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const previous = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let activeIndex = 0;

    const showSlide = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, current) => {
        slide.classList.toggle('active', current === activeIndex);
      });
      dots.forEach((dot, current) => {
        dot.classList.toggle('active', current === activeIndex);
      });
    };

    previous?.addEventListener('click', () => showSlide(activeIndex - 1));
    next?.addEventListener('click', () => showSlide(activeIndex + 1));
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => showSlide(index));
    });

    window.setInterval(() => {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  const filterInput = document.querySelector('[data-filter-input]');
  const yearFilter = document.querySelector('[data-year-filter]');
  const regionFilter = document.querySelector('[data-region-filter]');
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
  const emptyState = document.querySelector('[data-empty-state]');

  if (filterInput && filterInput.hasAttribute('data-read-query')) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query) {
      filterInput.value = query;
    }
  }

  const applyFilters = () => {
    const query = (filterInput?.value || '').trim().toLowerCase();
    const year = yearFilter?.value || '';
    const region = regionFilter?.value || '';
    let visibleCount = 0;

    cards.forEach((card) => {
      const text = [
        card.dataset.title,
        card.dataset.year,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.tags
      ].join(' ').toLowerCase();
      const matchQuery = !query || text.includes(query);
      const matchYear = !year || card.dataset.year === year;
      const matchRegion = !region || card.dataset.region === region;
      const visible = matchQuery && matchYear && matchRegion;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  };

  filterInput?.addEventListener('input', applyFilters);
  yearFilter?.addEventListener('change', applyFilters);
  regionFilter?.addEventListener('change', applyFilters);

  if (filterInput || yearFilter || regionFilter) {
    applyFilters();
  }
})();
