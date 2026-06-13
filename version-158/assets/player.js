(function () {
    function attachPlayer(panel) {
        var video = panel.querySelector('video');
        var button = panel.querySelector('[data-url]');
        var cover = panel.querySelector('.player-cover');
        if (!video || !button) {
            return;
        }

        var url = button.getAttribute('data-url');
        var loaded = false;
        var hlsInstance = null;

        function loadVideo() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function start() {
            loadVideo();
            panel.classList.add('is-playing');
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    panel.classList.remove('is-playing');
                });
            }
        }

        button.addEventListener('click', start);
        if (cover) {
            cover.addEventListener('click', start);
        }
        video.addEventListener('play', function () {
            panel.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            if (!video.ended && video.currentTime === 0) {
                panel.classList.remove('is-playing');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.querySelectorAll('.player-panel').forEach(attachPlayer);
})();
