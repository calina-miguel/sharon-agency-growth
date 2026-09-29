const slides = Array.from(document.querySelectorAll(".slide"));
const previousButton = document.querySelector("#prev-slide");
const nextButton = document.querySelector("#next-slide");
const slideCount = document.querySelector("#slide-count");
const progressBar = document.querySelector("#progress-bar");
const dots = document.querySelector("#slide-dots");
let currentSlide = 0;

function setIframeView(iframe, view) {
  if (!iframe || !view) return;
  const applyView = () => {
    try {
      const doc = iframe.contentDocument;
      if (!doc) return;
      doc.querySelectorAll(".view").forEach((section) => section.classList.toggle("active", section.id === view));
      doc.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
      doc.querySelector(".sidebar")?.classList.remove("menu-open");
      doc.querySelector(".menu-toggle")?.setAttribute("aria-expanded", "false");
      doc.defaultView?.scrollTo({ top: 0, behavior: "auto" });
    } catch {
      iframe.src = `index.html?slide=${view}`;
    }
  };
  if (iframe.contentDocument?.readyState === "complete") {
    applyView();
  } else {
    iframe.addEventListener("load", applyView, { once: true });
  }
}

function updateSlide(index) {
  currentSlide = Math.max(0, Math.min(index, slides.length - 1));
  slides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === currentSlide));
  slideCount.textContent = `${currentSlide + 1} / ${slides.length}`;
  previousButton.disabled = currentSlide === 0;
  nextButton.disabled = currentSlide === slides.length - 1;
  progressBar.style.width = `${((currentSlide + 1) / slides.length) * 100}%`;
  dots.querySelectorAll("button").forEach((button, dotIndex) => button.classList.toggle("active", dotIndex === currentSlide));
  const activeSlide = slides[currentSlide];
  const activeDemo = activeSlide.dataset.demo;
  activeSlide.querySelectorAll("iframe").forEach((iframe) => setIframeView(iframe, activeDemo || "overview"));
}

slides.forEach((slide, index) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.textContent = slide.dataset.title || `Slide ${index + 1}`;
  dot.addEventListener("click", () => updateSlide(index));
  dots.append(dot);
});

previousButton.addEventListener("click", () => updateSlide(currentSlide - 1));
nextButton.addEventListener("click", () => updateSlide(currentSlide + 1));

document.querySelectorAll("[data-jump]").forEach((button) => {
  button.addEventListener("click", () => updateSlide(Number(button.dataset.jump)));
});

document.querySelectorAll("[data-demo-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const slide = button.closest(".slide");
    const iframe = slide?.querySelector("iframe");
    setIframeView(iframe, button.dataset.demoTarget);
  });
});

document.addEventListener("keydown", (event) => {
  if (["ArrowRight", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    updateSlide(currentSlide + 1);
  }
  if (["ArrowLeft", "PageUp"].includes(event.key)) {
    event.preventDefault();
    updateSlide(currentSlide - 1);
  }
  if (event.key === "Home") updateSlide(0);
  if (event.key === "End") updateSlide(slides.length - 1);
});

updateSlide(0);
