// The request form is sent to send.php, which forwards it with the photos
// to the master's Telegram through a bot (see docs/plan.md).
const MAX_PHOTOS = 10;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const PHOTO_TYPES = ["image/png", "image/jpeg"];

document.addEventListener("DOMContentLoaded", () => {
  // On phones the call dock shows up once the hero buttons scroll away.
  const dock = document.querySelector(".dock");
  const heroActions = document.getElementById("hero-actions");
  dock.toggleAttribute("data-away", true);
  new IntersectionObserver(([entry]) => {
    dock.toggleAttribute("data-away", entry.isIntersecting);
  }).observe(heroActions);

  // Reviews carousel. The cards are cloned once, so the row can slide past
  // the last review and then jump back to the identical start unnoticed.
  const reviewList = document.getElementById("reviews");
  const reviewCount = reviewList.children.length;
  [...reviewList.children].forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.inert = true;
    reviewList.append(clone);
  });
  let reviewIndex = 0;
  let reviewBusy = false;

  function placeReviews(index, animate) {
    reviewList.classList.toggle("is-instant", !animate);
    reviewList.style.setProperty("--i", index);
    reviewIndex = index;
  }

  document.querySelectorAll(".carousel__btn").forEach((button) => {
    button.addEventListener("click", () => {
      if (reviewBusy) return;
      reviewBusy = true;
      const step = Number(button.dataset.step);
      if (step < 0 && reviewIndex === 0) {
        placeReviews(reviewCount, false);
        void reviewList.offsetWidth; // apply the jump before animating from it
      }
      placeReviews(reviewIndex + step, true);
      setTimeout(() => {
        if (reviewIndex >= reviewCount) placeReviews(reviewIndex - reviewCount, false);
        reviewBusy = false;
      }, 420);
    });
  });

  // Telegram links like "Запросить реквизиты" carry their own pre-filled text.
  document.querySelectorAll("[data-tg-text]").forEach((link) => {
    link.href = `${link.getAttribute("href")}?text=${encodeURIComponent(link.dataset.tgText)}`;
  });

  const form = document.getElementById("zayavka");
  const submit = document.getElementById("f-submit");
  const submitLabel = submit.querySelector("span");
  const submitTick = submit.querySelector("svg");
  const submitError = document.getElementById("f-submit-err");
  const photoInput = document.getElementById("f-photos");
  const photoList = document.getElementById("f-photos-list");
  const photoError = document.getElementById("f-photos-err");
  let photos = [];

  const required = [
    [form.elements.tech, document.getElementById("f-tech-err")],
    [form.elements.problem, document.getElementById("f-problem-err")],
    [form.elements.phone, document.getElementById("f-phone-err")],
  ];

  function check(field, error) {
    const empty = field.value.trim() === "";
    field.setAttribute("aria-invalid", String(empty));
    if (empty) field.setAttribute("aria-describedby", error.id);
    else field.removeAttribute("aria-describedby");
    error.hidden = !empty;
    return !empty;
  }

  required.forEach(([field, error]) => {
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") check(field, error);
    });
  });

  function setSubmit(state) {
    submit.disabled = state === "sending";
    submitTick.hidden = state !== "sent";
    submitLabel.textContent =
      state === "sending" ? "Отправляю…" : state === "sent" ? "Заявка отправлена" : "Отправить заявку";
  }

  // Any change after a successful send means a new request.
  form.addEventListener("input", () => {
    if (!submitTick.hidden) setSubmit("idle");
    submitError.hidden = true;
  });

  function renderPhotos() {
    photoList.replaceChildren(
      ...photos.map((photo, index) => {
        const item = document.createElement("li");
        const img = document.createElement("img");
        img.src = photo.url;
        img.alt = photo.file.name;
        const remove = document.createElement("button");
        remove.type = "button";
        remove.setAttribute("aria-label", `Убрать фото ${photo.file.name}`);
        remove.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-x"/></svg>';
        remove.addEventListener("click", () => {
          URL.revokeObjectURL(photo.url);
          photos.splice(index, 1);
          photoError.hidden = true;
          renderPhotos();
          photoInput.focus();
        });
        item.append(img, remove);
        return item;
      }),
    );
    photoList.hidden = photos.length === 0;
    photoInput.disabled = photos.length >= MAX_PHOTOS;
  }

  photoInput.addEventListener("change", () => {
    const rejected = [];
    for (const file of photoInput.files) {
      if (photos.length >= MAX_PHOTOS) break;
      if (!PHOTO_TYPES.includes(file.type)) rejected.push(`${file.name}: только PNG или JPG`);
      else if (file.size > MAX_PHOTO_BYTES) rejected.push(`${file.name}: больше 10 МБ`);
      else photos.push({ file, url: URL.createObjectURL(file) });
    }
    photoInput.value = "";
    photoError.textContent = rejected.join("; ");
    photoError.hidden = rejected.length === 0;
    renderPhotos();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const results = required.map(([field, error]) => check(field, error));
    if (results.includes(false)) {
      required[results.indexOf(false)][0].focus();
      return;
    }

    const data = new FormData(form);
    photos.forEach(({ file }) => data.append("photos[]", file, file.name));

    setSubmit("sending");
    submitError.hidden = true;
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: data,
        signal: AbortSignal.timeout(60000),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || response.status);
      form.reset();
      photos.forEach((photo) => URL.revokeObjectURL(photo.url));
      photos = [];
      renderPhotos();
      setSubmit("sent");
    } catch {
      setSubmit("idle");
      submitError.hidden = false;
    }
  });
});
