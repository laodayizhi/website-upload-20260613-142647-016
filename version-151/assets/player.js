(function () {
  var boxes = Array.prototype.slice.call(document.querySelectorAll('.player-box'));

  boxes.forEach(function (box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('.player-overlay');
    var button = box.querySelector('.play-trigger');
    var stream = video ? video.getAttribute('data-m3u8') : '';
    var attached = false;
    var hlsInstance = null;

    function attachStream() {
      if (!video || !stream || attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      attached = true;
    }

    function startPlayback() {
      attachStream();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayback();
      });
    }

    if (overlay) {
      overlay.addEventListener('click', function () {
        startPlayback();
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('ended', function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
