(() => {
  const artwork = document.querySelector("[data-ascii-art]");
  if (!artwork || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const source = artwork.textContent.replace(/^\n|\n\s*$/g, "");
  const lines = source.split("\n");
  const width = Math.max(...lines.map((line) => line.length));
  const center = Math.floor(width / 2);
  const glyphs = [".", ":", "+", "*", "+", ":"];
  let previousTick = -1;

  const render = (time) => {
    const tick = Math.floor(time / 110);
    if (tick !== previousTick) {
      previousTick = tick;
      const reach = Math.round((Math.sin(time / 900) + 1) * 1.5);

      artwork.textContent = lines.map((rawLine, row) => {
        const line = rawLine.padEnd(width, " ");
        const drift = Math.round(Math.sin(time / 650 + row * .46) * 1.4);
        const left = line.slice(0, center).trimEnd();
        const right = line.slice(center).trimStart();
        const gap = Math.max(1, width - left.length - right.length - reach);
        let animated = `${" ".repeat(Math.max(0, drift + 2))}${left}${" ".repeat(gap)}${right}`;

        if (row >= lines.length - 3) {
          const pulse = glyphs[(tick + row) % glyphs.length];
          animated = animated.replace(/::|\.\.|><|>\s+</, `${pulse}${pulse}`);
        }
        return animated.trimEnd();
      }).join("\n");
    }
    window.requestAnimationFrame(render);
  };

  artwork.classList.add("is-animated");
  window.requestAnimationFrame(render);
})();
