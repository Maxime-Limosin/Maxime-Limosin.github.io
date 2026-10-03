/**
 * Animated Favicon Controller
 * Cycles through pre-rendered PNG frames to ensure smooth animation.
 */
export function initAnimatedFavicon() {
  const TOTAL_FRAMES = 20;
  const FRAME_INTERVAL_MS = 66; // ~15 FPS
  const FRAMES_DIR = './assets/favicon_frames/';

  let currentFrame = 0;
  const preloadedImages = [];

  let faviconLink = document.querySelector("link[rel~='icon']");
  if (!faviconLink) {
    faviconLink = document.createElement('link');
    faviconLink.rel = 'icon';
    faviconLink.type = 'image/png';
    document.head.appendChild(faviconLink);
  }

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = `${FRAMES_DIR}frame_${i}.png`;
    preloadedImages.push(img);
  }

  setInterval(() => {
    faviconLink.href = preloadedImages[currentFrame].src;
    currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
  }, FRAME_INTERVAL_MS);
}