(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            var nextState = nav.hasAttribute('hidden');
            nav.toggleAttribute('hidden', !nextState);
            toggle.setAttribute('aria-expanded', String(nextState));
        });
    }

    function initHeaderSearch() {
        var trigger = document.querySelector('[data-search-toggle]');
        var panel = document.querySelector('[data-header-search]');
        if (trigger && panel) {
            trigger.addEventListener('click', function () {
                var willOpen = panel.hasAttribute('hidden');
                panel.toggleAttribute('hidden', !willOpen);
                if (willOpen) {
                    var input = panel.querySelector('input');
                    if (input) {
                        input.focus();
                    }
                }
            });
        }
        document.querySelectorAll('[data-header-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var value = input ? input.value.trim() : '';
                var target = './library.html';
                if (value) {
                    target += '?q=' + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });
    }

    function initHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });
        start();
    }

    function initRows() {
        document.querySelectorAll('[data-scroll-row]').forEach(function (button) {
            button.addEventListener('click', function () {
                var targetId = button.getAttribute('data-scroll-row');
                var direction = button.getAttribute('data-direction') === 'left' ? -1 : 1;
                var target = document.getElementById(targetId);
                if (!target) {
                    return;
                }
                target.scrollBy({
                    left: direction * 420,
                    behavior: 'smooth'
                });
            });
        });
    }

    function initCardFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var searchInput = document.querySelector('[data-card-search]');
        var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
        var emptyState = document.querySelector('[data-empty-state]');
        if (!cards.length || (!searchInput && !selects.length)) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        if (initialQuery && searchInput) {
            searchInput.value = initialQuery;
        }
        function cardMatches(card, query) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            if (query && text.indexOf(query) === -1) {
                return false;
            }
            for (var i = 0; i < selects.length; i += 1) {
                var select = selects[i];
                var key = select.getAttribute('data-filter-select');
                var value = select.value;
                if (value && card.getAttribute('data-' + key) !== value) {
                    return false;
                }
            }
            return true;
        }
        function apply() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var visible = 0;
            cards.forEach(function (card) {
                var match = cardMatches(card, query);
                card.classList.toggle('is-filtered', !match);
                if (match) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.toggleAttribute('hidden', visible !== 0);
            }
        }
        if (searchInput) {
            searchInput.addEventListener('input', apply);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
        apply();
    }

    function initPlayer() {
        var video = document.querySelector('[data-player-video]');
        var trigger = document.querySelector('[data-player-trigger]');
        if (!video || !trigger) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var loaded = false;
        var hls = null;
        function attach() {
            if (loaded || !stream) {
                return;
            }
            loaded = true;
            video.controls = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 30,
                    backBufferLength: 30
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                if (window.Hls.Events && window.Hls.ErrorTypes) {
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                            return;
                        }
                        hls.destroy();
                    });
                }
            } else {
                video.src = stream;
            }
        }
        function play() {
            attach();
            trigger.classList.add('is-hidden');
            var request = video.play();
            if (request && typeof request.catch === 'function') {
                request.catch(function () {
                    trigger.classList.remove('is-hidden');
                });
            }
        }
        trigger.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (!loaded) {
                play();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHeaderSearch();
        initHero();
        initRows();
        initCardFilters();
        initPlayer();
    });
})();
