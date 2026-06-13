(function () {
    function toggleMobileMenu() {
        var button = document.querySelector('[data-menu-button]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHeroSlider() {
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
            }, 5200);
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

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var root = panel.parentElement || document;
            var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
            var input = panel.querySelector('[data-card-search]');
            var typeSelect = panel.querySelector('[data-type-filter]');
            var yearSelect = panel.querySelector('[data-year-filter]');
            var regionSelect = panel.querySelector('[data-region-filter]');
            var count = panel.querySelector('[data-filter-count]');

            function valueOf(element) {
                return element ? element.value.trim().toLowerCase() : '';
            }

            function apply() {
                var keyword = valueOf(input);
                var type = valueOf(typeSelect);
                var year = valueOf(yearSelect);
                var region = valueOf(regionSelect);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search') || '').toLowerCase();
                    var cardType = (card.getAttribute('data-type') || '').toLowerCase();
                    var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
                    var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
                    var matched = true;

                    if (keyword && text.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }
                    if (region && cardRegion !== region) {
                        matched = false;
                    }

                    card.classList.toggle('is-hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = '当前显示 ' + visible + ' 部';
                }
            }

            [input, typeSelect, yearSelect, regionSelect].forEach(function (element) {
                if (element) {
                    element.addEventListener('input', apply);
                    element.addEventListener('change', apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query && input) {
                input.value = query;
            }
            apply();
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var cover = player.querySelector('[data-play-cover]');
            var button = player.querySelector('[data-play-button]');
            var streamUrl = player.getAttribute('data-stream') || '';
            var hls = null;

            if (!video || !streamUrl) {
                return;
            }

            function bindStream() {
                if (video.getAttribute('data-bound') === '1') {
                    return;
                }
                video.setAttribute('data-bound', '1');

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    return;
                }

                video.src = streamUrl;
            }

            function playVideo() {
                bindStream();
                player.classList.add('is-playing');
                video.controls = true;
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            }

            if (cover) {
                cover.addEventListener('click', playVideo);
            }
            if (button) {
                button.addEventListener('click', playVideo);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });
            window.addEventListener('pagehide', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        toggleMobileMenu();
        initHeroSlider();
        initFilters();
        initPlayers();
    });
}());
