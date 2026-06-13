(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
        }
        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                show(position);
                start();
            });
        });
        start();
    }

    function setupRails() {
        document.querySelectorAll(".content-section").forEach(function (section) {
            var rail = section.querySelector("[data-rail]");
            if (!rail) {
                return;
            }
            section.querySelectorAll("[data-scroll]").forEach(function (button) {
                button.addEventListener("click", function () {
                    var direction = button.getAttribute("data-scroll") === "left" ? -1 : 1;
                    rail.scrollBy({ left: direction * 520, behavior: "smooth" });
                });
            });
        });
    }

    function cardText(card) {
        return normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags"),
            card.textContent
        ].join(" "));
    }

    function applyFilter(input) {
        var target = document.querySelector(input.getAttribute("data-target"));
        if (!target) {
            return;
        }
        var query = normalize(input.value);
        Array.prototype.slice.call(target.children).forEach(function (card) {
            card.classList.toggle("is-filtered-out", query && cardText(card).indexOf(query) === -1);
        });
    }

    function setupFilters() {
        document.querySelectorAll(".local-search").forEach(function (input) {
            input.addEventListener("input", function () {
                applyFilter(input);
            });
        });
        document.querySelectorAll(".sort-select").forEach(function (select) {
            select.addEventListener("change", function () {
                var target = document.querySelector(select.getAttribute("data-target"));
                if (!target) {
                    return;
                }
                var cards = Array.prototype.slice.call(target.children);
                var mode = select.value;
                if (mode === "default") {
                    cards.sort(function (a, b) {
                        return Number(a.getAttribute("data-original-index") || 0) - Number(b.getAttribute("data-original-index") || 0);
                    });
                } else if (mode === "year-asc") {
                    cards.sort(function (a, b) {
                        return Number(a.getAttribute("data-year") || 0) - Number(b.getAttribute("data-year") || 0);
                    });
                } else if (mode === "title-asc") {
                    cards.sort(function (a, b) {
                        return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
                    });
                } else {
                    cards.sort(function (a, b) {
                        return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                    });
                }
                cards.forEach(function (card) {
                    target.appendChild(card);
                });
            });
        });
        document.querySelectorAll(".movie-grid, .ranking-grid-page").forEach(function (grid) {
            Array.prototype.slice.call(grid.children).forEach(function (card, index) {
                card.setAttribute("data-original-index", String(index));
            });
        });
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        var searchInput = document.querySelector(".search-query");
        if (query && searchInput) {
            searchInput.value = query;
            applyFilter(searchInput);
        }
    }

    function setupPlayers() {
        document.querySelectorAll(".stream-player").forEach(function (player) {
            var video = player.querySelector("video");
            var source = video ? video.querySelector("source") : null;
            var overlay = player.querySelector(".player-overlay");
            if (!video || !source) {
                return;
            }
            var stream = source.getAttribute("src");
            var hls = null;
            function bind() {
                if (video.dataset.ready === "true") {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
                video.dataset.ready = "true";
            }
            function play() {
                bind();
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }
            if (overlay) {
                overlay.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupRails();
        setupFilters();
        setupPlayers();
    });
}());
