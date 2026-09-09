(() => {
  'use strict';
  const canvas = document.querySelector('[data-ascii-art]');
  if (!canvas || !canvas.dataset.video) return;
  const ctx = canvas.getContext('2d');
  const sample = document.createElement('canvas');
  const pixels = sample.getContext('2d', { willReadFrequently: true });
  if (!ctx || !pixels) return;
  const figure = canvas.closest('.ascii-visual');
  const button = figure.querySelector('.ascii-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'auto';
  const ramp = ' .,:;irsXA253hMHGS#9B&@';
  let paused = reduced.matches, visible = true, frame = 0, last = 0;
  let width = 0, height = 0, columns = 0, rows = 0, cw, ch, ox, oy, levels;

  function render() {
    if (video.readyState < 2 || !columns) return;
    pixels.drawImage(video, 0, 0, columns, rows);
    const data = pixels.getImageData(0, 0, columns, rows).data;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f5f5f2';
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const i = y * columns + x, p = i * 4;
        const luminance = (.2126 * data[p] + .7152 * data[p + 1] + .0722 * data[p + 2]) / 255;
        // Lift the metal's midtones while keeping the black field empty.
        const light = luminance < .025 ? 0 : Math.pow((luminance - .025) / .975, .62);
        const target = light * (ramp.length - 1);
        if (Math.abs(target - levels[i]) > .65) levels[i] = Math.round(target);
        const glyph = ramp[levels[i]];
        if (glyph !== ' ') {
          ctx.globalAlpha = Math.min(1, .38 + light * .85);
          ctx.fillText(glyph, ox + (x + .5) * cw, oy + (y + .5) * ch);
        }
      }
    }
    ctx.globalAlpha = 1;
    canvas.dataset.frame = video.currentTime.toFixed(3);
    figure.classList.add('is-ready');
  }
  function resize() {
    const box = canvas.getBoundingClientRect();
    width = box.width; height = box.height;
    if (!width || !height) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const ratio = 640 / 280;
    const artWidth = Math.min(width, height * ratio), artHeight = artWidth / ratio;
    columns = Math.round(Math.max(86, Math.min(176, artWidth / 4.3)));
    rows = Math.round(columns / ratio / 1.6);
    sample.width = columns; sample.height = rows;
    levels = new Uint8Array(columns * rows);
    cw = artWidth / columns; ch = artHeight / rows;
    ox = (width - artWidth) / 2; oy = (height - artHeight) / 2;
    ctx.font = `${Math.min(cw * 1.45, ch * .95)}px "SFMono-Regular", Consolas, "Liberation Mono", monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    render();
  }
  function tick(now) {
    frame = 0;
    if (paused || !visible || document.hidden || video.paused) return;
    if (now - last >= 1000 / 30) { render(); last = now; }
    frame = requestAnimationFrame(tick);
  }
  function label() {
    button.textContent = paused ? 'Play animation' : 'Pause animation';
    button.setAttribute('aria-pressed', String(paused));
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    label();
    if (paused || !visible || document.hidden) { video.pause(); return; }
    video.play().then(() => {
      if (paused || !visible || document.hidden) { video.pause(); return; }
      if (!frame) frame = requestAnimationFrame(tick);
    }).catch(() => { paused = true; label(); render(); });
  }
  button.addEventListener('click', () => { paused = !paused; sync(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  video.addEventListener('loadeddata', () => {
    button.hidden = false;
    if (paused) video.currentTime = 4;
    render(); sync();
  }, { once: true });
  video.addEventListener('seeked', render);
  video.addEventListener('error', () => {
    cancelAnimationFrame(frame); video.pause(); button.hidden = true;
    // Keep the already rendered still, or the HTML ASCII fallback if loading failed.
  });
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(canvas);
  resize(); label();
  video.src = canvas.dataset.video;
})();
