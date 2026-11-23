(() => {
  const industry = document.getElementById("industry-detail");
  const rail = industry.querySelector(".catalog-rail");
  const sheet = document.getElementById("block-detail");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const lineup = industry.querySelector(".lineup");
  const modelList = lineup.querySelector(".lineup-list");
  const canvas = lineup.querySelector(".block-viewer");
  let brands = [];
  let activeBrand = null;
  let activeModel = null;
  let disposeViewer = null;
  let hold = null;
  let moved = false;
  let tapHandled = false;
  let frame = 0;
  let lastTime = 0;
  let cycle = 0;
  let glide = null;

  function scrollRail(position) {
    // Both halves contain the same brands, so crossing either seam is continuous.
    rail.scrollLeft = ((position % cycle) + cycle) % cycle;
  }

  function tick(now) {
    frame = 0;
    if (!glide || !industry.open || sheet.open || document.hidden || !cycle) {
      glide = null;
      return;
    }
    const elapsed = Math.min(now - lastTime, 50);
    glide.position += (glide.target - glide.position) * (1 - Math.exp(-elapsed / 60));
    if (reduced.matches || Math.abs(glide.target - glide.position) < .5) {
      scrollRail(glide.target);
      glide = null;
      return;
    }
    scrollRail(glide.position);
    lastTime = now;
    frame = requestAnimationFrame(tick);
  }

  function clearHold() {
    if (hold) clearTimeout(hold.timer);
    if (hold?.dragging) {
      rail.classList.remove("is-dragging");
      if (rail.hasPointerCapture(hold.id)) rail.releasePointerCapture(hold.id);
    }
    glide = null;
    hold = null;
    modelList.querySelector(".holding")?.classList.remove("holding");
  }

  function addSource(parent, label, url) {
    const link = document.createElement("a");
    link.textContent = label;
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener";
    parent.append(link);
  }

  function showBlock(item) {
    if (sheet.open) return;
    const photo = sheet.querySelector(".block-photo");
    sheet.querySelector(".block-illustration").hidden = !item.image;
    if (item.image) {
      photo.src = item.image;
      photo.alt = item.imageAlt || item.brand + " " + item.model;
    } else photo.removeAttribute("src");
    const caption = sheet.querySelector(".block-caption");
    caption.textContent = item.imageCaption || "";
    caption.hidden = !item.imageCaption;
    sheet.querySelector(".block-maker").textContent = item.brand + (item.finland ? " · Финляндия" : "");
    sheet.querySelector("#block-title").textContent = item.model;
    sheet.querySelector(".block-use").textContent = item.use;
    sheet.querySelector(".block-repair").textContent = item.repair;
    const software = sheet.querySelector(".block-tool");
    software.replaceChildren();
    for (const part of item.tool.split(/(CODESYS)/ig)) {
      if (part.toUpperCase() === "CODESYS") {
        const mark = document.createElement("strong");
        mark.textContent = "CODESYS";
        software.append(mark);
      } else software.append(part);
    }
    const sources = sheet.querySelector(".block-sources");
    sources.replaceChildren();
    addSource(sources, item.source || "Документация", item.url);
    if (item.toolUrl && item.toolUrl !== item.url) addSource(sources, item.toolSourceLabel || "Документация по ПО", item.toolUrl);
    if (item.imageSource && item.imageSource !== item.url && item.imageSource !== item.toolUrl)
      addSource(sources, item.imageSourceLabel || "Источник иллюстрации", item.imageSource);
    sheet.showModal();
    sheet.scrollTop = 0;
  }

  const plural = new Intl.PluralRules("ru");
  function modelCount(count) {
    const forms = { one: "модель", few: "модели", many: "моделей" };
    return count + " " + (forms[plural.select(count)] || "моделей");
  }

  function createBrandCard(group, index, copy) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "catalog-card";
    card.dataset.brandIndex = index;
    card.setAttribute("aria-controls", "brand-lineup");
    card.setAttribute("aria-pressed", "false");
    if (copy) {
      card.tabIndex = -1;
      card.setAttribute("aria-hidden", "true");
    }
    const name = document.createElement("span");
    name.className = "catalog-brand-name";
    name.textContent = group.name;
    card.append(name);
    if (group.items.some(item => item.finland)) {
      const flag = document.createElement("span");
      flag.className = "catalog-country";
      flag.textContent = "Финляндия";
      card.append(flag);
    }
    const count = document.createElement("span");
    count.className = "catalog-count";
    count.textContent = modelCount(group.items.length);
    card.append(count);
    return card;
  }

  function selectModel(item) {
    if (activeModel === item) return;
    disposeViewer?.();
    activeModel = item;
    lineup.querySelector(".viewer-model").textContent = item.model;
    canvas.setAttribute("aria-label", "Вращение 3D-модели " + item.brand + " " + item.model);
    disposeViewer = window.mountBlockViewer(canvas, item);
    Array.from(modelList.children).forEach((button, index) => {
      button.setAttribute("aria-pressed", String(activeBrand.items[index] === item));
    });
  }

  function resetCatalog() {
    cancelAnimationFrame(frame);
    frame = 0;
    clearHold();
    disposeViewer?.();
    disposeViewer = null;
    activeBrand = null;
    activeModel = null;
  }

  function selectBrand(button) {
    const group = brands[Number(button.dataset.brandIndex)];
    if (activeBrand === group) return;
    activeBrand = group;
    rail.querySelectorAll(".catalog-card").forEach(card => {
      card.setAttribute("aria-pressed", String(card.dataset.brandIndex === button.dataset.brandIndex));
    });
    lineup.querySelector("#brand-name").textContent = group.name;
    modelList.replaceChildren(...group.items.map((item, index) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "lineup-item";
      row.dataset.index = index;
      row.textContent = item.model;
      return row;
    }));
    selectModel(group.items[0]);
  }

  function openBrand(button, keyboard) {
    clearHold();
    selectBrand(button);
    if (keyboard) modelList.querySelector('[aria-pressed="true"]').focus({ preventScroll: true });
    lineup.scrollIntoView({ block: "nearest", behavior: keyboard || reduced.matches ? "instant" : "smooth" });
  }

  lineup.querySelector(".viewer-details").addEventListener("click", () => showBlock(activeModel));

  function measure() {
    const first = rail.children[0];
    const duplicate = rail.children[brands.length];
    cycle = first && duplicate ? duplicate.offsetLeft - first.offsetLeft : 0;
    glide = null;
  }
  new ResizeObserver(measure).observe(rail);

  window.showIndustryCatalog = key => {
    resetCatalog();
    const entries = window.industryCatalog[key];
    const byName = new Map();
    for (const item of entries) {
      if (!byName.has(item.brand)) byName.set(item.brand, { name: item.brand, items: [] });
      byName.get(item.brand).items.push(item);
    }
    brands = [...byName.values()];
    const featured = [...new Set(entries.filter(item => item.finland).map(item => item.brand))];
    const brandNames = new Intl.ListFormat("ru").format(featured);
    industry.querySelector(".catalog-scope").textContent = brandNames
      ? `Работаем с блоками ${brandNames}. Ниже — примеры оборудования. Возможность ремонта конкретной модели уточняем по маркировке.`
      : "Примеры оборудования в отрасли. Возможность ремонта конкретного блока уточняем по маркировке.";
    const cards = brands.map((group, index) => createBrandCard(group, index, false));
    const copies = brands.map((group, index) => createBrandCard(group, index, true));
    rail.replaceChildren(...cards, ...copies);
    selectBrand(cards[0]);
    rail.scrollLeft = 0;
    measure();
    moved = false;
  };

  function beginHold(event) {
    if (!event.isPrimary || event.button !== 0) return;
    clearHold();
    moved = false;
    hold = { id: event.pointerId, x: event.clientX, y: event.clientY };
    const row = event.target.closest(".lineup-item");
    if (row) {
      row.classList.add("holding");
      hold.timer = setTimeout(() => {
        const item = activeBrand.items[Number(row.dataset.index)];
        clearHold();
        selectModel(item);
        showBlock(item);
      }, 520);
    } else {
      hold.railStart = rail.scrollLeft;
      if (event.pointerType === "touch") hold.touchCard = event.target.closest(".catalog-card");
    }
  }

  rail.addEventListener("pointerdown", beginHold);
  modelList.addEventListener("pointerdown", beginHold);
  industry.addEventListener("pointerdown", () => { tapHandled = false; }, true);
  industry.addEventListener("click", event => {
    // Opening the lineup can move a different control under the finger before click fires.
    if (!tapHandled || !event.detail) return;
    tapHandled = false;
    event.preventDefault();
    event.stopPropagation();
  }, true);
  window.addEventListener("pointermove", event => {
    if (!hold || event.pointerId !== hold.id) return;
    const dx = event.clientX - hold.x;
    const dy = event.clientY - hold.y;
    if (!moved && Math.hypot(dx, dy) > 8) {
      moved = true;
      clearTimeout(hold.timer);
      modelList.querySelector(".holding")?.classList.remove("holding");
      if (hold.railStart !== undefined && cycle && Math.abs(dx) > Math.abs(dy)) {
        hold.dragging = true;
        rail.setPointerCapture(hold.id);
        rail.classList.add("is-dragging");
      }
    }
    if (hold.dragging) scrollRail(hold.railStart - dx);
  });
  for (const type of ["pointerup", "pointercancel"]) {
    window.addEventListener(type, event => {
      if (hold?.id !== event.pointerId) return;
      const tapped = type === "pointerup" && !moved && hold.touchCard;
      clearHold();
      // Some touch browsers suppress the compatibility click immediately after a swipe.
      if (tapped && tapped.contains(document.elementFromPoint(event.clientX, event.clientY))) {
        tapHandled = true;
        openBrand(tapped, false);
      }
    });
  }
  rail.addEventListener("click", event => {
    const card = event.target.closest(".catalog-card");
    if (card && (!moved || event.detail === 0)) openBrand(card, event.detail === 0);
  });
  modelList.addEventListener("click", event => {
    const row = event.target.closest(".lineup-item");
    if (row && !sheet.open && (!moved || event.detail === 0)) selectModel(activeBrand.items[Number(row.dataset.index)]);
  });
  modelList.addEventListener("contextmenu", event => event.preventDefault());
  function glideTo(target) {
    if (reduced.matches) {
      glide = null;
      scrollRail(target);
      return;
    }
    glide = { position: glide?.position ?? rail.scrollLeft, target };
    if (!frame) {
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }

  rail.addEventListener("wheel", event => {
    if (!cycle || hold || event.ctrlKey || event.metaKey || !event.cancelable) return;
    const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16
      : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? rail.clientWidth : 1;
    const delta = (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * unit;
    if (!delta) return;
    event.preventDefault();
    // Keep successive wheel ticks together, but reverse immediately when the user does.
    const changingDirection = glide && (glide.target - glide.position) * delta < 0;
    const base = changingDirection ? glide.position : (glide?.target ?? rail.scrollLeft);
    glideTo(base + delta);
  }, { passive: false });

  function navigate(step) {
    if (!cycle) return;
    const stride = cycle / brands.length;
    const index = Math.round((glide?.target ?? rail.scrollLeft) / stride);
    glideTo((index + step) * stride);
  }
  industry.querySelector(".catalog-prev").addEventListener("click", () => navigate(-1));
  industry.querySelector(".catalog-next").addEventListener("click", () => navigate(1));
  industry.addEventListener("close", () => { if (!industry.open) resetCatalog(); });
  sheet.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    sheet.close();
  });
  sheet.querySelector(".block-close").addEventListener("click", () => sheet.close());
  if (!("closedBy" in sheet)) {
    // Older dialog implementations send backdrop pointer events to the dialog itself.
    const onBackdrop = event => {
      if (event.target !== sheet) return false;
      const { left, right, top, bottom } = sheet.getBoundingClientRect();
      return event.clientX < left || event.clientX >= right || event.clientY < top || event.clientY >= bottom;
    };
    let pressedBackdrop = false;
    sheet.addEventListener("pointerdown", event => {
      pressedBackdrop = event.isPrimary && event.button === 0 && onBackdrop(event);
    });
    sheet.addEventListener("pointercancel", () => { pressedBackdrop = false; });
    sheet.addEventListener("click", event => {
      if (pressedBackdrop && onBackdrop(event)) sheet.close();
      pressedBackdrop = false;
    });
  }
  window.addEventListener("blur", clearHold);
  document.addEventListener("visibilitychange", clearHold);
})();
