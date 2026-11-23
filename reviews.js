(() => {
  const section = document.getElementById("otzyvy");
  const pin = section.querySelector(".testimonials__pin");
  const controls = section.querySelector(".testimonials__controls");
  const counter = section.querySelector(".testimonials__position");
  const cards = [...section.querySelectorAll(".review")];
  const animated = matchMedia("(min-height: 540px) and (prefers-reduced-motion: no-preference)");
  if (cards.length < 2) return;

  // Allow a little scroll travel after the last review to gather the feed into a deck.
  const feedEnd = .83;
  const last = cards.length - 1;
  const clamp = value => Math.max(0, Math.min(1, value));
  let travel = 0;
  let stride = 0;
  let active = -1;
  let previousProgress;
  let frame = 0;

  function render() {
    frame = 0;
    if (!travel) return;
    const progress = clamp(-section.getBoundingClientRect().top / travel);
    if (previousProgress === progress) return;
    previousProgress = progress;
    const cursor = clamp(progress / feedEnd) * last;
    const closing = clamp((progress - feedEnd) / (1 - feedEnd));
    const stack = closing * closing * (3 - 2 * closing);

    for (const [i, card] of cards.entries()) {
      const distance = i - cursor;
      const edge = clamp(Math.abs(distance) / 1.65);
      const depth = last - i;
      const y = distance * stride * (1 - stack) - depth * 10 * stack;
      const scale = 1 - edge * .12 * (1 - stack) - Math.min(depth, 6) * .023 * stack;
      const opacity = 1 - edge * (1 - stack);
      card.style.transform = `translateY(${y.toFixed(2)}px) scale(${scale.toFixed(4)})`;
      card.style.opacity = opacity.toFixed(3);
      card.style.visibility = opacity < .005 ? "hidden" : "visible";
    }
    const index = Math.round(cursor);
    if (active !== index) {
      active = index;
      counter.textContent = `${index + 1} / ${cards.length}`;
      cards.forEach((card, i) => card.setAttribute("aria-hidden", String(i !== index)));
    }
  }

  function schedule() {
    if (travel && !frame) frame = requestAnimationFrame(render);
  }

  function measure() {
    section.toggleAttribute("data-animated", animated.matches);
    controls.hidden = !animated.matches;
    if (animated.matches) {
      section.style.setProperty("--review-travel", `${(cards.length - 1) * 38 + 38}svh`);
      stride = Math.max(...cards.map(card => card.offsetHeight)) + 24;
      travel = section.offsetHeight - pin.offsetHeight;
      previousProgress = undefined;
      active = -1;
      render();
    } else {
      travel = 0;
      for (const card of cards) {
        card.style.removeProperty("transform");
        card.style.removeProperty("opacity");
        card.style.removeProperty("visibility");
        card.removeAttribute("aria-hidden");
      }
    }
  }

  controls.addEventListener("click", event => {
    const button = event.target.closest("[data-step]");
    if (!button || !travel) return;
    const next = (active + Number(button.dataset.step) + cards.length) % cards.length;
    const sectionTop = window.scrollY + section.getBoundingClientRect().top;
    window.scrollTo({ top: sectionTop + travel * feedEnd * next / last, behavior: "smooth" });
  });

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", measure);
  window.addEventListener("pageshow", measure);
  animated.addEventListener("change", measure);
  document.fonts.ready.then(measure);
  measure();
})();
