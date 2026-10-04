const slides = Array.from(document.querySelectorAll(".slide"));
const slideCount = document.querySelector("#slide-count");
const progressBar = document.querySelector("#progress-bar");
const dots = document.querySelector("#slide-dots");
const playTourButton = document.querySelector("#play-tour");
const startWalkthroughButton = document.querySelector("#start-walkthrough");
const restartTourButton = document.querySelector("#restart-tour");
const tourNextSlideButton = document.querySelector("#tour-next-slide");
const voiceToggleButton = document.querySelector("#voice-toggle");
const voiceStatus = document.querySelector("#voice-status");
const demoGuide = document.querySelector("#demo-guide");
const demoHighlight = document.querySelector("#demo-highlight");
const demoCursor = document.querySelector("#demo-cursor");
const demoClick = document.querySelector("#demo-click");
let currentSlide = 0;
let tourMode = false;
let audioMode = false;
let guideTimer = 0;
let guideResetTimer = 0;
let activeCueSelectors = null;
let narrationCueTimers = [];
let voiceoverEnabled = true;

const voiceAudio = new Audio();
voiceAudio.preload = "metadata";
const narrationAudioFiles = slides.map((_, index) => `assets/voiceover/slide-${String(index + 1).padStart(2, "0")}.mp3`);

const narrationScripts = [
  "Welcome to the Lead Acquisition System. This guided tour explains how the app helps an agency attract insurance buyers, recruit sales agents, review every lead, and track follow up from one workspace. Use the live preview on the right as the tour moves through each section.",
  "The system starts with two lead streams. One stream captures insurance buyers. The other captures sales agent candidates. Both streams use the same operating layer for intake, approval, scheduling, and reporting, so the team can grow without mixing audiences or losing control of follow up.",
  "The Command Center is the starting dashboard. The cards show buyer leads, agent leads, items waiting for approval, and approved opportunities. These cards are clickable, so a user can jump directly to the stored leads or schedule area instead of hunting through the navigation.",
  "Lead Engines explains where real leads come from. Buyer leads can come from Meta ads, Google Search, local content, and referral partners. Recruiting leads can come from LinkedIn, career search ads, and recruiting content. The important idea is that clicks, forms, comments, and replies feed the same intake process.",
  "The Schedule area keeps approved leads from getting stale. A user can select a lead, set the date and time, add notes, and choose an outcome. This gives the team a simple follow up calendar for buyer consultations and recruiting conversations.",
  "Lead Manager separates Customers and Clients from Sales Agents. Each tab has its own status view, workflow, follow up plan, campaign links, reporting points, and content plan. This keeps consumer acquisition and recruiting organized without forcing both into the same pipeline.",
  "The Customer Page is the buyer destination. It is designed for families, homeowners, and business owners who want help understanding life insurance, mortgage protection, or coverage needs. Submissions become intake records for review before the team reaches out.",
  "The Recruitment Page is the agent candidate destination. It focuses on licensing, mentorship, agency support, and sales opportunity fit. This keeps recruiting language away from consumer insurance offers and gives candidates a clear way to request details.",
  "Social Hub brings enrolled social accounts into one operating area. The user can review platform stats, generate posts, select enrolled accounts, publish or queue content, and see the posting log. This is also where the app explains that account enrollment is required before scans or publishing can run.",
  "Lead Intake turns raw interest into a reviewable record. A captured signal might be an ad click, page visit, comment, reply, or form response. Running intake creates a fit score, lead summary, recommended next step, and draft message for approval.",
  "Compliance Watch supports safer growth. It keeps trusted guidance close to the campaign workflow and reminds the team to review consent, claims, public copy, and outreach before changing scripts or launching new acquisition tactics.",
  "AEO Studio helps the agency answer questions that buyers and agent candidates already ask online. The goal is to turn search questions into plain language content, campaign hooks, and routes to the right page, while keeping public answers reviewable.",
  "The Approval Queue is the control point. Each lead shows its type, score, summary, draft response, and recommended next step. The team can approve or reject before anything moves into follow up, booking, or recruiting action.",
  "Campaign Builder creates links and outreach copy for specific audiences. The user chooses the stream, audience, and offer, then gets a campaign URL and message copy that can be used in ads, posts, email, or referral outreach.",
  "The app includes a dedicated Quick Start Guide page. Each guide card opens a real app section and highlights the actual controls, records, or work areas users should review. The app also keeps the profile menu, resizable sidebar, mobile navigation, light mode, dark mode, and reduced motion settings for daily use.",
  "Reporting gives the team a simple scorecard. It shows total captured leads, average fit score, pending approvals, approved opportunities, and the movement from capture to outcome. This helps the agency see whether campaigns are creating usable opportunities."
];

const demoTargets = {
  overview: [".metric-link", ".hero-panel button", ".metric-grid"],
  engines: [".engine-card", ".section-head button", ".engine-grid"],
  schedule: ["#schedule-form button", "#schedule-form", ".schedule-card"],
  pipeline: [".lead-manager-tabs", ".lead-card", ".lead-manager-panel"],
  "customer-page": [".public-lead-form button", ".public-lead-form", ".landing-preview"],
  "recruit-page": [".public-lead-form button", ".public-lead-form", ".landing-preview"],
  social: ["#generate-social-post", "#sync-social", ".account-card"],
  agent: ["#chat-form", "#intake-summary"],
  compliance: ["#refresh-compliance", ".compliance-panel", ".compliance-layout"],
  aeo: [".answer-stack button", ".aeo-signal-grid", ".aeo-layout"],
  approval: ["[data-approve]", ".approval-card", "#approval-grid"],
  campaigns: ["#generate-campaign", "#campaign-form"],
  quickstart: [".quickstart-card button", ".quickstart-page"],
  reporting: [".score-card", "#score-grid", ".chart-panel"]
};

const narrationCues = [
  [{ at: 0, selectors: [".app-title", ".topbar"] }, { at: 6500, selectors: [".live-frame", ".metric-grid"] }],
  [{ at: 0, selectors: [".hero-grid"] }, { at: 7600, selectors: [".metric-grid"] }],
  [{ at: 0, selectors: [".metric-link"] }, { at: 7000, selectors: [".schedule-card", ".metric-grid"] }],
  [{ at: 0, selectors: [".engine-card"] }, { at: 7600, selectors: [".section-head button", ".engine-grid"] }],
  [{ at: 0, selectors: ["#schedule-form"] }, { at: 6500, selectors: ["#schedule-form button", ".schedule-card"] }],
  [{ at: 0, selectors: [".lead-manager-tabs"] }, { at: 7000, selectors: [".lead-card", ".lead-manager-panel"] }],
  [{ at: 0, selectors: [".landing-preview"] }, { at: 6200, selectors: [".public-lead-form button", ".public-lead-form"] }],
  [{ at: 0, selectors: [".landing-preview"] }, { at: 6200, selectors: [".public-lead-form button", ".public-lead-form"] }],
  [{ at: 0, selectors: [".account-card"] }, { at: 7200, selectors: ["#generate-social-post", ".content-studio"] }],
  [{ at: 0, selectors: ["#chat-form"] }, { at: 7000, selectors: ["#intake-summary"] }],
  [{ at: 0, selectors: [".compliance-summary"] }, { at: 6500, selectors: ["#refresh-compliance", ".compliance-panel"] }],
  [{ at: 0, selectors: [".answer-stack button"] }, { at: 7000, selectors: [".aeo-signal-grid", ".aeo-layout"] }],
  [{ at: 0, selectors: [".approval-card"] }, { at: 7200, selectors: ["[data-approve]", "#approval-grid"] }],
  [{ at: 0, selectors: ["#campaign-form"] }, { at: 6800, selectors: ["#generate-campaign", ".generated-url"] }],
  [{ at: 0, selectors: [".quickstart-card button"] }, { at: 7200, selectors: [".quickstart-page"] }],
  [{ at: 0, selectors: [".score-card"] }, { at: 7000, selectors: [".chart-panel", "#funnel"] }]
];

function clearNarrationCues() {
  narrationCueTimers.forEach((timer) => window.clearTimeout(timer));
  narrationCueTimers = [];
  activeCueSelectors = null;
}

function scheduleNarrationCues() {
  clearNarrationCues();
  const cues = narrationCues[currentSlide] || [];
  cues.forEach((cue) => {
    narrationCueTimers.push(window.setTimeout(() => {
      activeCueSelectors = cue.selectors;
      scheduleDemoGuide(80);
    }, cue.at));
  });
}

function setIframeView(iframe, view) {
  if (!iframe || !view) return;
  const nextSrc = `index.html?presentationView=${encodeURIComponent(view)}&v=${Date.now()}`;
  iframe.addEventListener("load", () => scheduleDemoGuide(520), { once: true });
  iframe.src = nextSrc;
}

function supportsVoiceover() {
  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function setVoiceStatus(message) {
  if (voiceStatus) voiceStatus.textContent = message;
}

function updateVoiceToggle() {
  if (!voiceToggleButton) return;
  voiceToggleButton.textContent = voiceoverEnabled ? "Turn Voiceover Off" : "Turn Voiceover On";
  voiceToggleButton.setAttribute("aria-pressed", String(voiceoverEnabled));
}

function getPreferredVoice() {
  if (!supportsVoiceover()) return null;
  const voices = window.speechSynthesis.getVoices();
  const englishVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith("en"));
  return englishVoices.find((voice) => /natural|premium|microsoft|google|samantha|daniel/i.test(voice.name)) || englishVoices[0] || voices[0] || null;
}

function resetPauseButton() {
  return;
}

function stopVoiceover(status = "Voiceover Ready") {
  tourMode = false;
  audioMode = false;
  clearNarrationCues();
  voiceAudio.pause();
  voiceAudio.removeAttribute("src");
  voiceAudio.load();
  if (supportsVoiceover()) window.speechSynthesis.cancel();
  resetPauseButton();
  setVoiceStatus(status);
}

function useSpeechFallback({ continueTour = false } = {}) {
  if (!supportsVoiceover()) {
    setVoiceStatus("Voiceover Not Supported");
    return;
  }

  audioMode = false;
  scheduleNarrationCues();
  window.speechSynthesis.cancel();
  resetPauseButton();

  const title = slides[currentSlide]?.dataset.title || `Slide ${currentSlide + 1}`;
  const script = narrationScripts[currentSlide] || title;
  const utterance = new SpeechSynthesisUtterance(script);
  const selectedVoice = getPreferredVoice();
  if (selectedVoice) utterance.voice = selectedVoice;
  utterance.rate = 0.92;
  utterance.pitch = 1;
  utterance.volume = 1;

  utterance.onstart = () => setVoiceStatus(`Narrating ${currentSlide + 1} / ${slides.length}`);
  utterance.onend = () => {
    if (tourMode && continueTour && currentSlide < slides.length - 1) {
      updateSlide(currentSlide + 1, { narrate: true });
      return;
    }
    tourMode = false;
    setVoiceStatus("Voiceover Complete");
    resetPauseButton();
  };
  utterance.onerror = () => stopVoiceover("Voiceover Stopped");

  window.speechSynthesis.speak(utterance);
}

function speakCurrentSlide({ continueTour = false } = {}) {
  if (!voiceoverEnabled) {
    setVoiceStatus("Voiceover Off");
    if (tourMode && continueTour && currentSlide < slides.length - 1) {
      window.setTimeout(() => updateSlide(currentSlide + 1, { narrate: true }), 1300);
    }
    return;
  }
  scheduleNarrationCues();
  voiceAudio.pause();
  if (supportsVoiceover()) {
    window.speechSynthesis.cancel();
  }
  audioMode = true;
  resetPauseButton();
  voiceAudio.src = narrationAudioFiles[currentSlide];
  voiceAudio.currentTime = 0;
  voiceAudio.onplay = () => setVoiceStatus(`Playing ${currentSlide + 1} / ${slides.length}`);
  voiceAudio.onended = () => {
    if (tourMode && continueTour && currentSlide < slides.length - 1) {
      updateSlide(currentSlide + 1, { narrate: true });
      return;
    }
    tourMode = false;
    setVoiceStatus("Voiceover Complete");
    resetPauseButton();
  };
  voiceAudio.onerror = () => useSpeechFallback({ continueTour });
  voiceAudio.play().catch(() => useSpeechFallback({ continueTour }));
}

function setDemoBox(element, rect, pad = 8) {
  if (!element || !rect) return;
  const left = Math.max(8, rect.left - pad);
  const top = Math.max(8, rect.top - pad);
  const width = Math.min(window.innerWidth - left - 8, rect.width + pad * 2);
  const height = Math.min(window.innerHeight - top - 8, rect.height + pad * 2);
  element.style.left = `${left}px`;
  element.style.top = `${top}px`;
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
}

function iframeTargetRect(iframe, selectors = []) {
  try {
    if (!iframe?.contentWindow?.document) return null;
    const doc = iframe.contentWindow.document;
    const target = selectors.map((selector) => doc.querySelector(selector)).find(Boolean);
    if (!target) return null;
    target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    return { iframe, target };
  } catch {
    return null;
  }
}

function resolveDemoTarget() {
  const activeSlide = slides[currentSlide];
  const activeView = activeSlide?.dataset.view;
  const iframe = activeSlide?.querySelector("iframe");
  const targetSelectors = activeCueSelectors || demoTargets[activeView] || [];
  const iframeMatch = iframeTargetRect(iframe, targetSelectors);
  if (iframeMatch) return iframeMatch;
  const target = activeCueSelectors?.map((selector) => activeSlide?.querySelector(selector)).find(Boolean) || activeSlide?.querySelector(".feature-focus") || activeSlide?.querySelector(".cover-actions button") || activeSlide?.querySelector(".feature-strip") || activeSlide?.querySelector(".live-frame") || activeSlide?.querySelector(".cover-frame");
  return target ? { target } : null;
}

function screenRectForTarget(match) {
  const targetRect = match.target.getBoundingClientRect();
  if (!match.iframe) return targetRect;
  const iframeRect = match.iframe.getBoundingClientRect();
  const left = Math.max(iframeRect.left + targetRect.left, iframeRect.left + 8);
  const top = Math.max(iframeRect.top + targetRect.top, iframeRect.top + 8);
  const right = Math.min(iframeRect.left + targetRect.right, iframeRect.right - 8);
  const bottom = Math.min(iframeRect.top + targetRect.bottom, iframeRect.bottom - 8);
  if (right <= left || bottom <= top) {
    return {
      left: iframeRect.left + iframeRect.width * 0.18,
      top: iframeRect.top + iframeRect.height * 0.28,
      width: iframeRect.width * 0.64,
      height: Math.min(iframeRect.height * 0.34, 220),
      right: iframeRect.left + iframeRect.width * 0.82,
      bottom: iframeRect.top + iframeRect.height * 0.62
    };
  }
  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
    right,
    bottom
  };
}

function animateDemoGuide(settled = false) {
  window.clearTimeout(guideTimer);
  if (!demoGuide || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const match = resolveDemoTarget();
  if (!match || !demoHighlight || !demoCursor || !demoClick) {
    demoGuide.classList.add("is-hidden");
    return;
  }

  if (match.iframe && !settled) {
    scheduleDemoGuide(560, true);
    return;
  }

  demoGuide.classList.remove("is-hidden");
  const rect = screenRectForTarget(match);
  const startX = Math.max(24, rect.left - 72);
  const startY = Math.max(86, rect.top - 34);
  const endX = rect.left + Math.min(rect.width - 12, Math.max(20, rect.width * 0.72));
  const endY = rect.top + Math.min(rect.height - 12, Math.max(18, rect.height * 0.52));

  demoHighlight.classList.remove("is-active");
  demoCursor.classList.remove("is-active", "is-clicking");
  demoClick.classList.remove("is-active");
  setDemoBox(demoHighlight, rect, match.iframe ? 0 : 10);
  demoCursor.style.left = `${startX}px`;
  demoCursor.style.top = `${startY}px`;
  demoClick.style.left = `${endX}px`;
  demoClick.style.top = `${endY}px`;

  requestAnimationFrame(() => {
    demoHighlight.classList.add("is-active");
    demoCursor.classList.add("is-active");
    demoCursor.style.left = `${endX}px`;
    demoCursor.style.top = `${endY}px`;
  });

  guideTimer = window.setTimeout(() => {
    demoCursor.classList.add("is-clicking");
    demoClick.classList.remove("is-active");
    void demoClick.offsetWidth;
    demoClick.classList.add("is-active");
  }, 760);
  window.setTimeout(() => demoCursor?.classList.remove("is-clicking"), 1120);
}

function scheduleDemoGuide(delay = 0, settled = false) {
  window.clearTimeout(guideResetTimer);
  guideResetTimer = window.setTimeout(() => animateDemoGuide(settled), delay);
}

function updateSlide(index, options = {}) {
  clearNarrationCues();
  currentSlide = Math.max(0, Math.min(index, slides.length - 1));
  slides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === currentSlide));
  slideCount.textContent = `${currentSlide + 1} / ${slides.length}`;
  if (tourNextSlideButton) tourNextSlideButton.disabled = currentSlide === slides.length - 1;
  progressBar.style.width = `${((currentSlide + 1) / slides.length) * 100}%`;
  dots.querySelectorAll("button").forEach((button, dotIndex) => button.classList.toggle("active", dotIndex === currentSlide));
  const activeSlide = slides[currentSlide];
  const activeView = activeSlide.dataset.view;
  activeSlide.querySelectorAll("iframe").forEach((iframe) => setIframeView(iframe, activeView || "overview"));
  scheduleDemoGuide(180);
  if (options.narrate || (tourMode && options.userInitiated)) {
    speakCurrentSlide({ continueTour: tourMode });
  }
}

slides.forEach((slide, index) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.textContent = slide.dataset.title || `Slide ${index + 1}`;
  dot.addEventListener("click", () => updateSlide(index, { userInitiated: true }));
  dots.append(dot);
});

function startTour() {
  tourMode = true;
  speakCurrentSlide({ continueTour: true });
}

playTourButton?.addEventListener("click", startTour);
startWalkthroughButton?.addEventListener("click", startTour);

voiceToggleButton?.addEventListener("click", () => {
  voiceoverEnabled = !voiceoverEnabled;
  if (!voiceoverEnabled) {
    stopVoiceover("Voiceover Off");
  } else {
    setVoiceStatus("Voiceover Ready");
  }
  updateVoiceToggle();
});

restartTourButton?.addEventListener("click", () => {
  stopVoiceover("Voiceover Ready");
  updateSlide(0, { userInitiated: true });
});

tourNextSlideButton?.addEventListener("click", () => {
  stopVoiceover("Voiceover Ready");
  updateSlide(currentSlide + 1, { userInitiated: true });
});

document.querySelectorAll("[data-jump]").forEach((button) => {
  button.addEventListener("click", () => updateSlide(Number(button.dataset.jump), { userInitiated: true }));
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
    updateSlide(currentSlide + 1, { userInitiated: true });
  }
  if (["ArrowLeft", "PageUp"].includes(event.key)) {
    event.preventDefault();
    updateSlide(currentSlide - 1, { userInitiated: true });
  }
  if (event.key === "Home") updateSlide(0, { userInitiated: true });
  if (event.key === "End") updateSlide(slides.length - 1, { userInitiated: true });
});

if (supportsVoiceover()) {
  window.speechSynthesis.onvoiceschanged = getPreferredVoice;
} else {
  setVoiceStatus("Voiceover Not Supported");
}

window.addEventListener("resize", animateDemoGuide);
updateVoiceToggle();
updateSlide(0);
