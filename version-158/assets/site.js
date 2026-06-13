(function () {
    var headerSearch = document.querySelector('[data-header-search]');
    var headerSearchButton = document.querySelector('[data-search-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    var mobileButton = document.querySelector('[data-mobile-toggle]');

    if (headerSearchButton && headerSearch) {
        headerSearchButton.addEventListener('click', function () {
            headerSearch.classList.toggle('is-open');
            var input = headerSearch.querySelector('input');
            if (headerSearch.classList.contains('is-open') && input) {
                input.focus();
            }
        });
    }

    if (mobileButton && mobileMenu) {
        mobileButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var previous = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                schedule();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                schedule();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                schedule();
            });
        }

        show(0);
        schedule();
    });

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function applyFilters(scope) {
        var keywordInput = scope.querySelector('[data-filter-keyword]');
        var typeSelect = scope.querySelector('[data-filter-type]');
        var yearSelect = scope.querySelector('[data-filter-year]');
        var empty = scope.querySelector('[data-empty-state]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));
        var keyword = normalize(keywordInput && keywordInput.value);
        var selectedType = normalize(typeSelect && typeSelect.value);
        var selectedYear = normalize(yearSelect && yearSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta'));
            var cardType = normalize(card.getAttribute('data-type'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var matched = true;

            if (keyword && text.indexOf(keyword) === -1) {
                matched = false;
            }
            if (selectedType && cardType !== selectedType) {
                matched = false;
            }
            if (selectedYear && cardYear !== selectedYear) {
                matched = false;
            }

            card.classList.toggle('is-hidden', !matched);
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        scope.querySelectorAll('[data-filter-keyword], [data-filter-type], [data-filter-year]').forEach(function (control) {
            control.addEventListener('input', function () {
                applyFilters(scope);
            });
            control.addEventListener('change', function () {
                applyFilters(scope);
            });
        });
        applyFilters(scope);
    });

    document.querySelectorAll('[data-scroll-row]').forEach(function (row) {
        row.addEventListener('wheel', function (event) {
            if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
                row.scrollLeft += event.deltaY;
            }
        }, { passive: true });
    });
})();
