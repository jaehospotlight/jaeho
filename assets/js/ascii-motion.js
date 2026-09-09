(() => {
  'use strict';
  const canvas = document.querySelector('[data-ascii-art]');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const figure = canvas.closest('.ascii-visual');
  const toggle = figure.querySelector('.ascii-toggle');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Geometry exists only in this small, offscreen luminance buffer. The visible
  // canvas draws exclusively printable ASCII glyphs, never paths or images.
  const source = document.createElement('canvas');
  const paint = source.getContext('2d', { willReadFrequently: true });
  if (!paint) return;
  const W = 1000, H = 426;
  let cols, rows, width, height, cellX, cellY, offsetX, offsetY, levels;
  let frame = 0, last = 0, elapsed = 0, visible = true, paused = reduced.matches;
  const ramp = ' .,:;irsXA253hMHGS#9B&@';
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

  function path(d, fill) {
    paint.fillStyle = fill;
    paint.fill(new Path2D(d));
  }
  function stroke(d, size, fill) {
    paint.lineWidth = size;
    paint.lineCap = 'round';
    paint.lineJoin = 'round';
    paint.strokeStyle = fill;
    paint.stroke(new Path2D(d));
  }
  function shade(x, y, radius, bright = 235) {
    const g = paint.createRadialGradient(x, y, 2, x, y, radius);
    g.addColorStop(0, `rgb(${bright},${bright},${bright})`);
    g.addColorStop(.5, '#989898');
    g.addColorStop(1, '#292929');
    return g;
  }
  function joint(x, y, r) {
    paint.fillStyle = '#383838';
    paint.beginPath(); paint.arc(x, y, r, 0, Math.PI * 2); paint.fill();
    paint.fillStyle = '#aaaaaa';
    paint.beginPath(); paint.arc(x - 1, y - 2, r * .55, 0, Math.PI * 2); paint.fill();
    paint.fillStyle = '#454545';
    paint.beginPath(); paint.arc(x - 1, y - 2, r * .22, 0, Math.PI * 2); paint.fill();
  }
  function machine(t, reach) {
    paint.save();
    paint.translate(reach * 9, Math.sin(t * .32) * 2);
    // Long plated forearm, wrist, and a broad metacarpal plane.
    path('M-45 337 L145 251 L192 232 L232 284 L170 324 L-30 428 Z', shade(131, 278, 180));
    path('M-15 353 L130 283 L148 309 L-14 390 Z', '#555555');
    stroke('M-10 344 L142 272 M0 406 L164 321', 4, '#cecece');
    path('M147 247 L179 233 L221 295 L190 316 Z', '#3b3b3b');
    stroke('M158 244 L200 308 M170 239 L212 302', 5, '#c8c8c8');
    path('M182 234 L226 189 Q245 179 273 188 L318 210 L326 249 L298 289 L239 309 L213 289 Z', shade(251, 211, 105));
    path('M196 236 L231 202 L271 205 L294 228 L279 270 L240 288 L217 270 Z', shade(245, 216, 80, 210));
    stroke('M212 240 L236 218 L267 223 M231 277 L260 260', 3, '#dedede');
    // Three curled fingers have separate knuckles and negative-space gaps.
    const fingers = [
      ['M297 238 L342 266 L349 291 L329 304', 25, 316, 250],
      ['M281 267 L317 295 L319 317 L299 326', 24, 295, 280],
      ['M251 289 L282 313 L279 337 L262 338', 21, 266, 301]
    ];
    for (const [d, size, x, y] of fingers) {
      stroke(d, size + 5, '#242424'); stroke(d, size, shade(x, y, 70));
    }
    joint(340, 274, 10); joint(312, 302, 9); joint(278, 320, 8);
    // Index: articulated links, tapered toward the shared point of contact.
    const flex = Math.sin(t * .42) * 2;
    stroke(`M288 208 L345 184 L409 ${184 + flex} L482 200`, 28, '#262626');
    stroke('M292 202 L341 182', 25, shade(319, 178, 64));
    stroke(`M351 181 L406 ${182 + flex}`, 21, shade(378, 176, 60));
    stroke(`M418 ${185 + flex} L478 198`, 16, shade(465, 190, 66));
    joint(346, 184, 12); joint(411, 185 + flex, 10);
    stroke('M472 195 L485 200', 10, '#e8e8e8');
    // Thumb rises from the palm, leaving an open web below the index.
    stroke('M238 241 Q264 218 288 230 L316 244 L342 233', 24, '#303030');
    stroke('M238 236 Q264 215 288 228 L315 239 L340 231', 18, shade(283, 217, 65));
    joint(312, 238, 8);
    paint.restore();
  }
  function human(t, reach) {
    paint.save();
    paint.translate(-reach * 9, Math.sin(t * .32 + 1.5) * 2);
    // A continuous organic contour, coming down from the opposite corner.
    path('M1040 69 L902 101 Q858 114 824 143 L794 160 Q771 151 748 159 Q716 168 692 183 L644 185 Q605 184 580 189 L522 198 Q512 201 517 209 Q521 217 539 215 L591 211 L651 212 Q674 211 688 218 Q677 233 660 244 L625 258 Q613 264 616 274 Q620 283 633 280 L675 265 L704 245 Q699 263 680 285 L654 303 Q645 311 653 319 Q660 325 670 318 L701 297 L727 263 Q724 284 712 309 L695 329 Q688 339 697 344 Q705 349 714 340 L737 314 L753 280 Q759 294 752 316 L743 334 Q739 345 748 348 Q757 350 763 338 L781 302 Q794 283 799 256 Q809 235 833 219 L872 196 L1030 156 Z', shade(756, 186, 230));
    // Soft muscle volumes. These are clipped to the silhouette above.
    paint.globalCompositeOperation = 'source-atop';
    stroke('M1010 111 Q883 137 814 188', 39, shade(857, 147, 170, 220));
    stroke('M790 185 Q750 178 706 202 Q686 216 663 239', 27, shade(735, 183, 100, 227));
    stroke('M649 198 Q591 195 535 205', 10, shade(582, 191, 110));
    // Creases and tendons stay low contrast, so they read as skin, not plates.
    stroke('M788 204 Q767 219 757 250 M774 204 Q747 217 731 248 M813 169 Q832 158 849 154', 2.4, '#747474');
    stroke('M700 233 L711 238 M679 283 L689 289 M713 303 L723 307 M751 316 L758 319', 2, '#646464');
    stroke('M590 196 L589 207 M641 193 L640 205', 1.8, '#989898');
    // A pale, gently curved index nail.
    path('M521 201 Q529 198 542 200 L546 206 Q535 210 523 208 Z', '#bfbfbf');
    paint.globalCompositeOperation = 'source-over';
    paint.restore();
  }
  function render() {
    const t = elapsed / 1000;
    const reach = .5 - .5 * Math.cos(t * Math.PI * 2 / 14);
    paint.setTransform(source.width / W, 0, 0, source.height / H, 0, 0);
    paint.clearRect(0, 0, W, H);
    machine(t, reach);
    human(t, reach);
    const data = paint.getImageData(0, 0, cols, rows).data;
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#f5f5f2';
    const pulse = (.5 + .5 * Math.sin(t * 1.2)) * (.25 + reach * .75);
    const lines = [];
    for (let y = 0; y < rows; y++) {
      let line = '';
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x, p = i * 4;
        const px = (x + .5) / cols * W, py = (y + .5) / rows * H;
        const distance = Math.hypot(px - 503, (py - 205) * 1.1);
        const halo = Math.exp(-distance * distance / 430) * pulse;
        let light = data[p] / 255 * data[p + 3] / 255;
        // A slow lighting pass alters density, without random glyph flicker.
        light *= .94 + .06 * Math.sin(px * .006 - t * .4);
        light = Math.max(light, halo * .66);
        const target = light * (ramp.length - 1);
        const old = levels[i];
        // Hysteresis holds each character around thresholds as the hands move.
        if (Math.abs(target - old) > .75) levels[i] = Math.round(target);
        const level = clamp(levels[i], 0, ramp.length - 1);
        const glyph = ramp[level];
        line += glyph;
        if (level) {
          context.globalAlpha = clamp(.36 + light * .85, .36, 1);
          context.fillText(glyph, offsetX + (x + .5) * cellX, offsetY + (y + .5) * cellY);
        }
      }
      lines.push(line);
    }
    context.globalAlpha = 1;
    // Also keep a real text frame for the static fallback and easy inspection.
    canvas.dataset.columns = cols;
    canvas.dataset.rows = rows;
    canvas.dataset.frame = Math.round(elapsed);
    canvas.dataset.asciiFrame = lines.join('\n');
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    width = rect.width; height = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const artWidth = Math.min(width, height * W / H);
    cols = Math.round(clamp(artWidth / 6, 86, 176));
    rows = Math.round(cols * H / W / 1.65);
    source.width = cols; source.height = rows;
    levels = new Uint8Array(cols * rows);
    cellX = artWidth / cols; offsetX = (width - artWidth) / 2;
    const artHeight = Math.min(height, width * H / W);
    cellY = artHeight / rows; offsetY = (height - artHeight) / 2;
    context.font = `${Math.min(cellX * 1.42, cellY * .95)}px "SFMono-Regular", Consolas, "Liberation Mono", monospace`;
    context.textAlign = 'center'; context.textBaseline = 'middle';
    render();
    figure.classList.add('is-ready');
  }
  function tick(now) {
    frame = 0;
    if (paused || !visible || document.hidden) return;
    if (!last) last = now;
    const delta = now - last;
    if (delta >= 1000 / 30) {
      elapsed += Math.min(delta, 65); last = now; render();
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    toggle.textContent = paused ? 'Play animation' : 'Pause animation';
    toggle.setAttribute('aria-pressed', String(paused));
    if (!paused && visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  toggle.hidden = false;
  toggle.addEventListener('click', () => { paused = !paused; sync(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(canvas);
  new ResizeObserver(resize).observe(canvas);
  resize(); sync();
})();
