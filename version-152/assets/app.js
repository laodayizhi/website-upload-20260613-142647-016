(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var menu = document.querySelector('[data-nav-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5200);
    }
  }

  var filterList = document.querySelector('[data-filter-list]');
  if (filterList) {
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
    var input = document.querySelector('[data-filter-input]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var count = document.querySelector('[data-filter-count]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function uniqueValues(attribute) {
      var values = cards.map(function (card) {
        return card.getAttribute(attribute) || '';
      }).filter(Boolean);
      return Array.from(new Set(values)).sort(function (a, b) {
        return String(b).localeCompare(String(a), 'zh-CN');
      });
    }

    function fillSelect(select, values) {
      if (!select) {
        return;
      }
      values.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fillSelect(yearSelect, uniqueValues('data-year'));
    fillSelect(typeSelect, uniqueValues('data-type'));

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function applyFilters() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matchType = !type || card.getAttribute('data-type') === type;
        var matched = matchKeyword && matchYear && matchType;
        card.classList.toggle('is-filter-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    [input, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  var video = document.getElementById('movie-player');
  var playButton = document.querySelector('[data-play-button]');

  if (video && playButton) {
    var hlsInstance = null;
    var started = false;

    function attachSource() {
      if (started) {
        return Promise.resolve();
      }
      started = true;
      var url = video.getAttribute('data-src');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        return new Promise(function (resolve) {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
        });
      }

      video.src = url;
      return Promise.resolve();
    }

    function startVideo() {
      playButton.classList.add('is-hidden');
      attachSource().then(function () {
        var playback = video.play();
        if (playback && typeof playback.catch === 'function') {
          playback.catch(function () {
            playButton.classList.remove('is-hidden');
          });
        }
      });
    }

    playButton.addEventListener('click', startVideo);
    video.addEventListener('click', function () {
      if (!started || video.paused) {
        startVideo();
      }
    });
    video.addEventListener('play', function () {
      playButton.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        playButton.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
