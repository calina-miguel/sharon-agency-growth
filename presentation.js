const slides = Array.from(document.querySelectorAll(".slide"));
const previousButton = document.querySelector("#prev-slide");
const nextButton = document.querySelector("#next-slide");
const slideCount = document.querySelector("#slide-count");
const progressBar = document.querySelector("#progress-bar");
const dots = document.querySelector("#slide-dots");
let currentSlide = 0;

function setIframeView(iframe, view) {
  if (!iframe || !view) return;
  iframe.src = `index.html?presentationView=${encodeURIComponent(view)}&v=${Date.now()}`;
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
  const activeView = activeSlide.dataset.view;
  activeSlide.querySelectorAll("iframe").forEach((iframe) => setIframeView(iframe, activeView || "overview"));
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

document.querySelectorAll("[data-view-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const slide = button.closest(".slide");
    const iframe = slide?.querySelector("iframe");
    setIframeView(iframe, button.dataset.viewTarget);
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
