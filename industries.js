(() => {
  const scene = document.getElementById("industry-scene");
  if (!scene) return;

  const viewport = scene.querySelector(".industry-viewport");
  const intro = scene.querySelector(".industry-intro");
  document.documentElement.classList.add("industry-ready");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const completedAt = 0.83;
  let travel = 0;
  let pinned = false;
  let stickyTop = 0;
  let pendingFrame = 0;
  let progress;
  let previousFrame = 0;

  function updateProgress(now) {
    pendingFrame = 0;
    const rect = scene.getBoundingClientRect();
    const distance = stickyTop - rect.top;
    const raw = pinned ? clamp(distance / (travel * completedAt), 0, 1) : 1;
    // Ease both ends of the scroll, then soften wheel steps without taking over scrolling.
    const target = raw * raw * (3 - 2 * raw);
    const elapsed = clamp(now - previousFrame, 1, 64);
    previousFrame = now;
    if (progress === undefined || !pinned || rect.bottom < 0 || rect.top >= innerHeight) {
      progress = target;
    } else {
      progress += (target - progress) * (1 - Math.exp(-elapsed / 60));
      if (Math.abs(target - progress) < 0.0004) progress = target;
    }
    const hideIntro = pinned && progress > 0.42;
    if (intro.inert !== hideIntro) intro.inert = hideIntro;
    scene.style.setProperty("--industry-progress", progress.toFixed(4));
    if (progress !== target) requestProgress();
  }

  function requestProgress() {
    if (!pendingFrame) pendingFrame = requestAnimationFrame(updateProgress);
  }

  function measure() {
    const style = getComputedStyle(viewport);
    stickyTop = parseFloat(style.top) || 0;
    travel = scene.offsetHeight - viewport.offsetHeight;
    pinned = style.position === "sticky" && travel > 0 && !reducedMotion.matches;
    requestProgress();
  }

  const sizes = new ResizeObserver(measure);
  sizes.observe(scene);
  sizes.observe(viewport);
  window.addEventListener("scroll", requestProgress, { passive: true });
  window.addEventListener("resize", measure);
  window.addEventListener("pageshow", measure);
  reducedMotion.addEventListener("change", measure);
  measure();

  for (const card of scene.querySelectorAll(".industry-card")) {
    let press = null;

    function move(x, y) {
      if (reducedMotion.matches) return;
      card.style.setProperty("--drag-x", x.toFixed(1) + "px");
      card.style.setProperty("--drag-y", y.toFixed(1) + "px");
      card.style.setProperty("--tilt", (x * 0.14).toFixed(2) + "deg");
    }

    function reset() {
      const pointer = press?.id;
      press = null;
      if (pointer != null && card.hasPointerCapture(pointer)) card.releasePointerCapture(pointer);
      card.classList.remove("is-pressed");
      card.style.removeProperty("--drag-x");
      card.style.removeProperty("--drag-y");
      card.style.removeProperty("--tilt");
    }

    card.addEventListener("pointerdown", (event) => {
      if (!event.isPrimary || event.button !== 0 || press) return;
      press = { id: event.pointerId, x: event.clientX, y: event.clientY };
      card.setPointerCapture(event.pointerId);
      card.classList.add("is-pressed");
      move(0, 0);
    });

    card.addEventListener("pointermove", (event) => {
      if (!event.isPrimary || reducedMotion.matches) return;
      if (press) {
        if (event.pointerId === press.id) {
          move(clamp((event.clientX - press.x) * 0.46, -26, 26),
            clamp((event.clientY - press.y) * 0.46, -22, 22));
        }
      } else if (event.pointerType === "mouse" || event.pointerType === "pen") {
        const rect = card.getBoundingClientRect();
        move(((event.clientX - rect.left) / rect.width - 0.5) * 16,
          ((event.clientY - rect.top) / rect.height - 0.5) * 12);
      }
    });

    for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
      card.addEventListener(type, (event) => {
        if (press?.id === event.pointerId) reset();
      });
    }
    card.addEventListener("pointerleave", () => {
      if (!press) reset();
    });
    card.addEventListener("focus", () => {
      if (!pinned || !card.matches(":focus-visible")) return;
      const remaining = scene.getBoundingClientRect().top - stickyTop + travel * completedAt;
      if (remaining > 0) window.scrollBy({ top: Math.ceil(remaining), behavior: "instant" });
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") card.classList.add("is-pressed");
    });
    card.addEventListener("keyup", (event) => {
      if (event.key === " " || event.key === "Enter") reset();
    });
    card.addEventListener("dragstart", (event) => event.preventDefault());
    card.addEventListener("blur", reset);
    window.addEventListener("blur", reset);
    reducedMotion.addEventListener("change", reset);
  }
})();
