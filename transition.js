// Menu transition: the screen fills with flickering symbols, the page jumps
// to the section underneath, then opens up again through growing holes.
(() => {
  const CHARS = "0123456789ABCDEF!@#$%&*()[]{}<>/\\;:?=+~.|";
  const SHADES = ["#ffffff", "#c3cbd6", "#8794a8", "#4e5d78"];
  const SHADE_WEIGHTS = [0.35, 0.3, 0.2, 0.15];
  const BACKGROUND = "#142139";
  const FONT_FAMILY = 'Consolas, "SF Mono", Menlo, "Roboto Mono", monospace';
  const FONT_SIZE = 14;
  const CELL_W = 12;
  const CELL_H = 18;
  const COVER_MS = 500;
  const HOLD_MS = 300;
  const REVEAL_MS = 650;
  const FLICKER = 0.15;

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let running = false;

  const ease = (p) => 0.5 - Math.cos(Math.PI * Math.min(Math.max(p, 0), 1)) / 2;
  const randomGlyph = () => Math.floor(Math.random() * CHARS.length);

  function randomShade() {
    let r = Math.random();
    for (let i = 0; i < SHADE_WEIGHTS.length; i++) {
      r -= SHADE_WEIGHTS[i];
      if (r < 0) return i;
    }
    return SHADE_WEIGHTS.length - 1;
  }

  // Every symbol in every shade, drawn once on its own background,
  // so a cell is painted with a single drawImage.
  function glyphAtlas(cw, ch, fontSize) {
    const atlas = document.createElement("canvas");
    atlas.width = CHARS.length * cw;
    atlas.height = SHADES.length * ch;
    const ctx = atlas.getContext("2d");
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, atlas.width, atlas.height);
    ctx.font = `${fontSize}px ${FONT_FAMILY}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    SHADES.forEach((shade, row) => {
      ctx.fillStyle = shade;
      [...CHARS].forEach((char, col) => {
        ctx.fillText(char, col * cw + cw / 2, row * ch + ch / 2 + 1);
      });
    });
    return atlas;
  }

  // Smooth random field, so spots grow as blobs rather than circles.
  function noiseField(cols, rows, scale) {
    const gw = Math.ceil(cols / scale) + 2;
    const gh = Math.ceil(rows / scale) + 2;
    const grid = Float32Array.from({ length: gw * gh }, Math.random);
    const at = (i, j) => grid[j * gw + i];
    const smooth = (t) => t * t * (3 - 2 * t);
    return (x, y) => {
      const x0 = Math.floor(x / scale);
      const y0 = Math.floor(y / scale);
      const tx = smooth(x / scale - x0);
      const ty = smooth(y / scale - y0);
      const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * tx;
      const bottom = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * tx;
      return top + (bottom - top) * ty;
    };
  }

  // When each cell flips, from 0 to 1. Spots grow from a few random points;
  // the noise makes ragged edges and the jitter leaves single stray cells.
  function flipOrder(cols, rows, spots) {
    const seeds = Array.from({ length: spots }, () => [Math.random() * cols, Math.random() * rows]);
    const coarse = noiseField(cols, rows, 9);
    const fine = noiseField(cols, rows, 3);
    const diagonal = Math.hypot(cols * CELL_W, rows * CELL_H);
    const score = new Float32Array(cols * rows);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let distance = Infinity;
        for (const [sx, sy] of seeds) {
          distance = Math.min(distance, Math.hypot((x - sx) * CELL_W, (y - sy) * CELL_H));
        }
        score[y * cols + x] =
          distance / diagonal + coarse(x, y) * 0.35 + fine(x, y) * 0.12 + Math.random() * 0.04;
      }
    }
    // Ranks instead of raw scores keep the covered area growing evenly.
    const order = Array.from(score.keys()).sort((a, b) => score[a] - score[b]);
    const rank = new Float32Array(score.length);
    order.forEach((cell, i) => {
      rank[cell] = i / order.length;
    });
    return rank;
  }

  function jumpTo(target) {
    history.pushState(null, "", `#${target.id}`);
    target.scrollIntoView({ behavior: "instant" });
    // Keyboard users continue from the section, as with a normal anchor.
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }

  function play(target) {
    running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = Math.round(CELL_W * dpr);
    const ch = Math.round(CELL_H * dpr);
    const canvas = document.createElement("canvas");
    canvas.className = "shift";
    canvas.setAttribute("aria-hidden", "true");
    canvas.width = Math.round(document.documentElement.clientWidth * dpr);
    canvas.height = Math.round(document.documentElement.clientHeight * dpr);
    document.body.append(canvas);

    const ctx = canvas.getContext("2d");
    const atlas = glyphAtlas(cw, ch, Math.round(FONT_SIZE * dpr));
    const cols = Math.ceil(canvas.width / cw);
    const rows = Math.ceil(canvas.height / ch);
    const total = cols * rows;
    const cover = flipOrder(cols, rows, 4);
    const reveal = flipOrder(cols, rows, 2);
    const glyph = Uint8Array.from({ length: total }, randomGlyph);
    const shade = Uint8Array.from({ length: total }, randomShade);
    const shown = new Uint8Array(total);

    const draw = (i) =>
      ctx.drawImage(atlas, glyph[i] * cw, shade[i] * ch, cw, ch, (i % cols) * cw, Math.floor(i / cols) * ch, cw, ch);
    const erase = (i) => ctx.clearRect((i % cols) * cw, Math.floor(i / cols) * ch, cw, ch);

    let jumped = false;
    let start = null;

    function frame(now) {
      start ??= now;
      const t = now - start;
      const covering = t < COVER_MS;
      const holding = !covering && t < COVER_MS + HOLD_MS;
      const progress = covering ? ease(t / COVER_MS) : ease((t - COVER_MS - HOLD_MS) / REVEAL_MS);

      for (let i = 0; i < total; i++) {
        const want = covering ? cover[i] < progress : holding || reveal[i] >= progress;
        if (want !== Boolean(shown[i])) {
          shown[i] = want ? 1 : 0;
          if (want) draw(i);
          else erase(i);
        } else if (want && Math.random() < FLICKER) {
          glyph[i] = randomGlyph();
          if (Math.random() < 0.3) shade[i] = randomShade();
          draw(i);
        }
      }

      if (!jumped && !covering) {
        jumped = true;
        jumpTo(target);
      }

      if (t < COVER_MS + HOLD_MS + REVEAL_MS) {
        requestAnimationFrame(frame);
      } else {
        canvas.remove();
        running = false;
      }
    }

    requestAnimationFrame(frame);
  }

  document.querySelectorAll('.top__nav a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.getElementById(link.hash.slice(1));
      if (!target || reduceMotion.matches) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (!running) play(target);
    });
  });
})();
