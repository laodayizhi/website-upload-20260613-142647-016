(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-nav-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    var sliders = document.querySelectorAll("[data-slider]");
    sliders.forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".spotlight-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slide-dot]"));
      var current = 0;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-slide-dot")) || 0);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          show(current + 1);
        }, 5600);
      }
    });

    var blocks = document.querySelectorAll("[data-filter-block]");
    blocks.forEach(function (block) {
      var input = block.querySelector("[data-filter-text]");
      var year = block.querySelector("[data-filter-year]");
      var type = block.querySelector("[data-filter-type]");
      var count = block.querySelector("[data-filter-count]");
      var grid = block.querySelector("[data-filter-grid]");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      function apply() {
        var text = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var selectedType = type ? type.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-year") || ""
          ].join(" ").toLowerCase();
          var okText = !text || haystack.indexOf(text) !== -1;
          var okYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
          var okType = !selectedType || card.getAttribute("data-type") === selectedType;
          var ok = okText && okYear && okType;
          card.classList.toggle("is-hidden-card", !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible === cards.length ? "片库浏览" : "筛选完成";
        }
      }

      [input, year, type].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
      }
      apply();
    });

    var config = document.getElementById("player-config");
    var video = document.getElementById("movie-video");
    var playButton = document.getElementById("movie-play");

    if (config && video && playButton) {
      var stream = "";
      try {
        stream = JSON.parse(config.textContent || "{}").src || "";
      } catch (error) {
        stream = "";
      }
      var hlsPlayer = null;
      var prepared = false;

      function preparePlayer() {
        if (prepared || !stream) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsPlayer = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsPlayer.loadSource(stream);
          hlsPlayer.attachMedia(video);
          hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          return;
        }
        video.src = stream;
      }

      function start() {
        playButton.classList.add("is-hidden");
        preparePlayer();
        video.play().catch(function () {});
      }

      playButton.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        playButton.classList.add("is-hidden");
      });
      window.addEventListener("beforeunload", function () {
        if (hlsPlayer) {
          hlsPlayer.destroy();
        }
      });
    }
  });
})();
