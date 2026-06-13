(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupSearchForms() {
        selectAll('[data-site-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[type="search"]');
                var query = input ? input.value.trim() : '';
                var target = './search.html';
                if (query) {
                    target += '?q=' + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function valueMatches(card, query, region, year) {
        var text = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var okQuery = !query || text.indexOf(query.toLowerCase()) !== -1;
        var okRegion = !region || (card.getAttribute('data-region') || '') === region;
        var okYear = !year || (card.getAttribute('data-year') || '') === year;
        return okQuery && okRegion && okYear;
    }

    function setupFilters() {
        var form = document.querySelector('[data-filter-form]');
        if (!form) {
            return;
        }
        var cards = selectAll('[data-movie-card]');
        var queryInput = form.querySelector('[data-filter-query]');
        var regionSelect = form.querySelector('[data-filter-region]');
        var yearSelect = form.querySelector('[data-filter-year]');
        var count = document.querySelector('[data-result-count]');
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        if (initialQuery && queryInput) {
            queryInput.value = initialQuery;
        }
        function apply() {
            var query = queryInput ? queryInput.value.trim() : '';
            var region = regionSelect ? regionSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var matched = valueMatches(card, query, region, year);
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = String(visible);
            }
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }
        ['input', 'change'].forEach(function (eventName) {
            form.addEventListener(eventName, apply);
        });
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            apply();
        });
        apply();
    }

    function loadPlayer(video, sourceUrl) {
        if (!video || !sourceUrl) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.src !== sourceUrl) {
                video.src = sourceUrl;
            }
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (!video.__hlsInstance) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                video.__hlsInstance = hls;
            }
            return;
        }
        if (video.src !== sourceUrl) {
            video.src = sourceUrl;
        }
    }

    window.initDetailPlayer = function (sourceUrl) {
        var video = document.getElementById('moviePlayer');
        var overlay = document.querySelector('[data-player-overlay]');
        var button = document.querySelector('[data-play-button]');
        var start = function (event) {
            if (event) {
                event.preventDefault();
            }
            if (!video) {
                return;
            }
            loadPlayer(video, sourceUrl);
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            video.controls = true;
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        };
        if (button) {
            button.addEventListener('click', start);
        }
        if (overlay) {
            overlay.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
        }
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupNavigation();
        setupSearchForms();
        setupHero();
        setupFilters();
    });
})();
