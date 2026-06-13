import { H as Hls } from './hls.js';

const players = document.querySelectorAll('[data-player]');

players.forEach((player) => {
  const video = player.querySelector('video');
  const button = player.querySelector('[data-play-button]');
  const configNode = player.querySelector('.player-config');
  let streamUrl = '';
  let ready = false;

  try {
    streamUrl = JSON.parse(configNode.textContent).src;
  } catch (error) {
    streamUrl = '';
  }

  const attachStream = () => {
    if (!video || !streamUrl || ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    ready = true;
  };

  const start = async () => {
    attachStream();
    button?.classList.add('hidden');
    video.setAttribute('controls', 'controls');
    try {
      await video.play();
    } catch (error) {
      button?.classList.remove('hidden');
    }
  };

  button?.addEventListener('click', start);
  video?.addEventListener('click', () => {
    if (video.paused) {
      start();
    }
  });
});
