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

  const dialog = document.getElementById("industry-detail");
  const heading = dialog.querySelector("#detail-heading");
  const emblem = dialog.querySelector(".detail-emblem");
  const closeButton = dialog.querySelector(".detail-close");
  const reveals = [heading, dialog.querySelector(".catalog"), closeButton];
  let opener = null;
  let closing = false;
  const fullScreen = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

  // Project the four corners, including the tilt of a card in the hero fan.
  function cardOutline(card) {
    const rect = card.getBoundingClientRect();
    const matrix = new DOMMatrixReadOnly(getComputedStyle(card).transform === "none"
      ? undefined : getComputedStyle(card).transform);
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const points = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, y]) => {
      const dx = x * card.offsetWidth / 2;
      const dy = y * card.offsetHeight / 2;
      return `${cx + matrix.a * dx + matrix.c * dy}px ${cy + matrix.b * dx + matrix.d * dy}px`;
    });
    return `polygon(${points.join(", ")})`;
  }

  function emblemOrigin() {
    const source = opener.querySelector("img").getBoundingClientRect();
    const target = emblem.getBoundingClientRect();
    const x = source.left + source.width / 2 - target.left - target.width / 2;
    const y = source.top + source.height / 2 - target.top - target.height / 2;
    return `translate(${x}px, ${y}px) scale(${source.width / target.width})`;
  }

  function openDetails(card) {
    if (dialog.open) return;
    opener = card;
    heading.textContent = card.querySelector(".industry-label").textContent;
    emblem.src = card.querySelector("img").src;
    const theme = getComputedStyle(card);
    for (const name of ["--field", "--ink"]) dialog.style.setProperty(name, theme.getPropertyValue(name));
    dialog.showModal();
    window.showIndustryCatalog(card.dataset.industry);
    dialog.scrollTop = 0;
    if (reducedMotion.matches) return;
    const timing = { duration: 540, easing: "cubic-bezier(.22,.8,.2,1)" };
    dialog.animate([{ clipPath: cardOutline(card) }, { clipPath: fullScreen }], timing);
    emblem.animate([{ transform: emblemOrigin() }, { transform: "none" }], timing);
    reveals.forEach((element, index) => {
      element.animate([{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }],
        { duration: 300, delay: 120 + index * 35, easing: "ease-out", fill: "backwards" });
    });
  }

  function finishClose() {
    // close() restores focus while the opener guard is active, preserving the scroll position.
    dialog.close();
    for (const animation of dialog.getAnimations({ subtree: true })) animation.cancel();
    opener.focus({ preventScroll: true });
    opener = null;
    closing = false;
  }

  function closeDetails() {
    if (!dialog.open || closing) return;
    closing = true;
    if (reducedMotion.matches) return finishClose();
    const currentClip = getComputedStyle(dialog).clipPath;
    const currentEmblem = getComputedStyle(emblem).transform;
    const opacities = reveals.map(element => getComputedStyle(element).opacity);
    for (const animation of dialog.getAnimations({ subtree: true })) animation.cancel();
    const timing = { duration: 340, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" };
    const collapse = dialog.animate([
      { clipPath: currentClip === "none" ? fullScreen : currentClip }, { clipPath: cardOutline(opener) }
    ], timing);
    emblem.animate([{ transform: currentEmblem }, { transform: emblemOrigin() }], timing);
    reveals.forEach((element, index) => element.animate([{ opacity: opacities[index] }, { opacity: 0 }],
      { duration: 130, fill: "forwards" }));
    collapse.onfinish = finishClose;
  }
  closeButton.addEventListener("click", closeDetails);
  dialog.addEventListener("cancel", event => {
    if (event.defaultPrevented) return;
    event.preventDefault();
    closeDetails();
  });

  for (const card of scene.querySelectorAll(".industry-card")) {
    let press = null;
    let wasDragged = false;

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
      wasDragged = false;
      press = { id: event.pointerId, x: event.clientX, y: event.clientY };
      card.setPointerCapture(event.pointerId);
      card.classList.add("is-pressed");
      move(0, 0);
    });

    card.addEventListener("pointermove", (event) => {
      if (!event.isPrimary) return;
      if (press) {
        if (event.pointerId === press.id) {
          if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > 8) wasDragged = true;
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
    card.addEventListener("click", event => {
      if (!event.detail || !wasDragged) openDetails(card);
    });
    card.addEventListener("focus", () => {
      if (opener || !pinned || !card.matches(":focus-visible")) return;
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
