const slides = Array.from(document.querySelectorAll(".slide"));
const slideCount = document.querySelector("#slide-count");
const progressBar = document.querySelector("#progress-bar");
const dots = document.querySelector("#slide-dots");
const playTourButton = document.querySelector("#play-tour");
const startWalkthroughButton = document.querySelector("#start-walkthrough");
const restartTourButton = document.querySelector("#restart-tour");
const tourPrevSlideButton = document.querySelector("#tour-prev-slide");
const tourNextSlideButton = document.querySelector("#tour-next-slide");
const mobileTourStartButton = document.querySelector("#mobile-tour-start");
const mobileTourPrevButton = document.querySelector("#mobile-tour-prev");
const mobileTourPlayButton = document.querySelector("#mobile-tour-play");
const mobileTourNextButton = document.querySelector("#mobile-tour-next");
const mobileSlideToggle = document.querySelector("#mobile-slide-toggle");
const voiceToggleButton = document.querySelector("#voice-toggle");
const voiceStatus = document.querySelector("#voice-status");
const tourGuide = document.querySelector("#tour-guide");
const tourHighlight = document.querySelector("#tour-highlight");
const tourCursor = document.querySelector("#tour-cursor");
const tourClick = document.querySelector("#tour-click");
let currentSlide = 0;
let tourMode = false;
let audioMode = false;
let playbackPaused = false;
let guideTimer = 0;
let guideResetTimer = 0;
let guideRefineTimers = [];
let activeGuideToken = 0;
let activeCueSelectors = null;
let narrationCueTimers = [];
let voiceoverEnabled = true;

const voiceAudio = new Audio();
voiceAudio.preload = "metadata";
const narrationAudioFiles = slides.map((_, index) => `assets/voiceover/slide-${String(index + 1).padStart(2, "0")}.mp3`);
const mobileNarrationAudioFiles = [...narrationAudioFiles];
mobileNarrationAudioFiles[0] = "assets/voiceover/slide-01-mobile.mp3";

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
  "The app includes a dedicated Quick Start Guide page. Each guide card opens a real app section and highlights the actual controls, records, or work areas users should review. The current interface uses SM branding, keeps the profile row and navigation left aligned, supports a resizable desktop sidebar, shows a compact floating menu after mobile scrolling, and keeps workflow rows, schedule cards, and lead records connected to the right section or detail view.",
  "Reporting gives the team a simple scorecard. It shows total captured leads, average fit score, pending approvals, approved opportunities, and the movement from capture to outcome. This helps the agency see whether campaigns are creating usable opportunities."
];

const mobileNarrationScripts = [...narrationScripts];
mobileNarrationScripts[0] = "Welcome to the Lead Acquisition System. This guided tour explains how the app helps an agency attract insurance buyers, recruit sales agents, review every lead, and track follow up from one workspace. Use the live preview at the bottom as the tour moves through each section.";

const tourTargets = {
  overview: { id: "overview-metrics", selectors: [".metric-grid", ".metric-link"] },
  engines: { id: "engine-cards", selectors: [".engine-grid", ".engine-card"] },
  schedule: { id: "schedule-form", selectors: ["#schedule-form", ".schedule-card"] },
  pipeline: { id: "pipeline-cards", selectors: [".lead-manager-panel", ".lead-card"] },
  "customer-page": { id: "customer-form", selectors: [".public-lead-form", ".landing-preview"] },
  "recruit-page": { id: "recruit-form", selectors: [".public-lead-form", ".landing-preview"] },
  social: { id: "social-accounts", selectors: [".account-card", "#sync-social"] },
  agent: { id: "intake-form", selectors: ["#chat-form", "#intake-summary"] },
  compliance: { id: "compliance-panel", selectors: [".compliance-panel", ".compliance-summary"] },
  aeo: { id: "aeo-answers", selectors: [".answer-stack button", ".aeo-layout"] },
  approval: { id: "approval-card", selectors: [".approval-card", "#approval-grid"] },
  campaigns: { id: "campaign-form", selectors: ["#campaign-form", "#generate-campaign"] },
  quickstart: { id: "quickstart-cards", selectors: [".quickstart-page", ".quickstart-card button"] },
  reporting: { id: "reporting-scorecards", selectors: ["#score-grid", ".score-card"] }
};

const narrationCues = [
  [{ at: 0, id: "app-title", selectors: [".app-title", ".topbar"] }, { at: 6500, id: "overview-metrics", selectors: [".metric-grid", ".metric-link"] }],
  [{ at: 0, id: "lead-streams", selectors: [".hero-grid"] }, { at: 7600, id: "lead-shortcuts", selectors: [".metric-grid"] }],
  [{ at: 0, id: "metric-cards", selectors: [".metric-grid", ".metric-link"] }, { at: 7000, id: "schedule-cards", selectors: [".schedule-card", ".metric-grid"] }],
  [{ at: 0, id: "engine-cards", selectors: [".engine-grid", ".engine-card"] }, { at: 7600, id: "engine-actions", selectors: [".section-head button", ".engine-grid"] }],
  [{ at: 0, id: "schedule-form", selectors: ["#schedule-form"] }, { at: 6500, id: "schedule-save", selectors: ["#schedule-form button", ".schedule-card"] }],
  [{ at: 0, id: "lead-manager-tabs", selectors: [".lead-manager-tabs"] }, { at: 7000, id: "lead-manager-cards", selectors: [".lead-manager-panel", ".lead-card"] }],
  [{ at: 0, id: "customer-page", selectors: [".landing-preview"] }, { at: 6200, id: "customer-form", selectors: [".public-lead-form", ".public-lead-form button"] }],
  [{ at: 0, id: "recruit-page", selectors: [".landing-preview"] }, { at: 6200, id: "recruit-form", selectors: [".public-lead-form", ".public-lead-form button"] }],
  [{ at: 0, id: "social-accounts", selectors: [".account-card"] }, { at: 7200, id: "social-studio", selectors: [".content-studio", "#generate-social-post"] }],
  [{ at: 0, id: "intake-form", selectors: ["#chat-form"] }, { at: 7000, id: "intake-summary", selectors: ["#intake-summary"] }],
  [{ at: 0, id: "compliance-summary", selectors: [".compliance-summary"] }, { at: 6500, id: "compliance-panel", selectors: [".compliance-panel", "#refresh-compliance"] }],
  [{ at: 0, id: "aeo-question", selectors: [".answer-stack button"] }, { at: 7000, id: "aeo-layout", selectors: [".aeo-layout", ".aeo-signal-grid"] }],
  [{ at: 0, id: "approval-card", selectors: [".approval-card"] }, { at: 7200, id: "approve-button", selectors: ["[data-approve]", "#approval-grid"] }],
  [{ at: 0, id: "campaign-form", selectors: ["#campaign-form"] }, { at: 6800, id: "campaign-output", selectors: [".generated-url", "#generate-campaign"] }],
  [{ at: 0, id: "quickstart-button", selectors: [".quickstart-card button"] }, { at: 7200, id: "quickstart-page", selectors: [".quickstart-page"] }],
  [{ at: 0, id: "score-grid", selectors: ["#score-grid", ".score-card"] }, { at: 7000, id: "funnel-chart", selectors: [".chart-panel", "#funnel"] }]
];

function clearNarrationCues() {
  narrationCueTimers.forEach((timer) => window.clearTimeout(timer));
  narrationCueTimers = [];
  guideRefineTimers.forEach((timer) => window.clearTimeout(timer));
  guideRefineTimers = [];
  activeGuideToken += 1;
  activeCueSelectors = null;
  hideTourGuide();
}

function scheduleNarrationCues() {
  clearNarrationCues();
  const cues = narrationCues[currentSlide] || [];
  cues.forEach((cue) => {
    narrationCueTimers.push(window.setTimeout(() => {
      activeCueSelectors = cue;
      scheduleTourGuide(80);
    }, cue.at));
  });
}

function setIframeView(iframe, view) {
  if (!iframe || !view) return;
  const nextSrc = `index.html?presentationView=${encodeURIComponent(view)}&v=${Date.now()}`;
  iframe.addEventListener("load", () => scheduleTourGuide(520), { once: true });
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

function updatePlayButton() {
  const isPlaying = tourMode && !playbackPaused;
  [playTourButton, mobileTourPlayButton].forEach((button) => {
    if (!button) return;
    button.textContent = isPlaying ? "Pause" : "Play";
    button.setAttribute("aria-pressed", String(isPlaying));
  });
}

function stopVoiceover(status = "Voiceover Ready") {
  tourMode = false;
  audioMode = false;
  playbackPaused = false;
  clearNarrationCues();
  voiceAudio.pause();
  voiceAudio.removeAttribute("src");
  voiceAudio.load();
  if (supportsVoiceover()) window.speechSynthesis.cancel();
  updatePlayButton();
  setVoiceStatus(status);
}

function useSpeechFallback({ continueTour = false } = {}) {
  if (!supportsVoiceover()) {
    setVoiceStatus("Voiceover Not Supported");
    return;
  }

  audioMode = false;
  playbackPaused = false;
  scheduleNarrationCues();
  window.speechSynthesis.cancel();
  updatePlayButton();

  const title = slides[currentSlide]?.dataset.title || `Slide ${currentSlide + 1}`;
  const scriptSet = window.matchMedia("(max-width: 900px)").matches ? mobileNarrationScripts : narrationScripts;
  const script = scriptSet[currentSlide] || title;
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
    playbackPaused = false;
    setVoiceStatus("Voiceover Complete");
    updatePlayButton();
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
  playbackPaused = false;
  updatePlayButton();
  const audioSet = window.matchMedia("(max-width: 900px)").matches ? mobileNarrationAudioFiles : narrationAudioFiles;
  voiceAudio.src = audioSet[currentSlide];
  voiceAudio.currentTime = 0;
  voiceAudio.onplay = () => setVoiceStatus(`Playing ${currentSlide + 1} / ${slides.length}`);
  voiceAudio.onended = () => {
    if (tourMode && continueTour && currentSlide < slides.length - 1) {
      updateSlide(currentSlide + 1, { narrate: true });
      return;
    }
    tourMode = false;
    playbackPaused = false;
    setVoiceStatus("Voiceover Complete");
    updatePlayButton();
  };
  voiceAudio.onerror = () => useSpeechFallback({ continueTour });
  voiceAudio.play().catch(() => useSpeechFallback({ continueTour }));
}

function setTourBox(element, rect, pad = 8) {
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

function hideTourGuide() {
  if (!tourGuide) return;
  tourGuide.classList.add("is-hidden");
  tourHighlight?.classList.remove("is-active");
  tourCursor?.classList.remove("is-active", "is-clicking");
  tourClick?.classList.remove("is-active");
  if (tourHighlight) {
    tourHighlight.removeAttribute("data-cue-id");
    tourHighlight.style.left = "-9999px";
    tourHighlight.style.top = "-9999px";
    tourHighlight.style.width = "0px";
    tourHighlight.style.height = "0px";
  }
  if (tourCursor) {
    tourCursor.style.left = "-9999px";
    tourCursor.style.top = "-9999px";
  }
  if (tourClick) {
    tourClick.style.left = "-9999px";
    tourClick.style.top = "-9999px";
  }
}

function placeTourGuide(match) {
  const rect = screenRectForTarget(match);
  if (!rect) return null;
  const startX = Math.max(24, rect.left - 72);
  const startY = Math.max(86, rect.top - 34);
  const endX = rect.left + Math.min(rect.width - 12, Math.max(20, rect.width * 0.72));
  const endY = rect.top + Math.min(rect.height - 12, Math.max(18, rect.height * 0.52));

  setTourBox(tourHighlight, rect, match.iframe ? 0 : 10);
  tourCursor.style.left = `${startX}px`;
  tourCursor.style.top = `${startY}px`;
  tourClick.style.left = `${endX}px`;
  tourClick.style.top = `${endY}px`;

  return { endX, endY };
}

function refineTourGuide(match) {
  guideRefineTimers.forEach((timer) => window.clearTimeout(timer));
  guideRefineTimers = [];
  if (!match?.iframe) return;
  const guideToken = activeGuideToken;
  const refineDelays = [140, 360, 760];
  const runRefine = () => {
    try {
      if (guideToken !== activeGuideToken) return;
      if (!document.contains(match.iframe) || !match.target.isConnected) return;
      const placement = placeTourGuide(match);
      if (!placement) return;
      const { endX, endY } = placement;
      tourCursor.style.left = `${endX}px`;
      tourCursor.style.top = `${endY}px`;
      tourClick.style.left = `${endX}px`;
      tourClick.style.top = `${endY}px`;
    } catch {
      // If the embedded view changed, the next cue will place the guide again.
    }
  };
  refineDelays.forEach((delay) => {
    guideRefineTimers.push(window.setTimeout(runRefine, delay));
  });
}

function iframeTargetRect(iframe, selectors = [], options = {}) {
  try {
    if (!iframe?.contentWindow?.document) return null;
    const doc = iframe.contentWindow.document;
    const target = selectors.map((selector) => doc.querySelector(selector)).find(Boolean);
    if (!target) return null;
    if (options.scroll !== false) {
      iframe.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      target.scrollIntoView({ behavior: options.instant ? "auto" : "smooth", block: "center", inline: "center" });
    }
    return { iframe, target };
  } catch {
    return null;
  }
}

function resolveTourTarget(options = {}) {
  const activeSlide = slides[currentSlide];
  const activeView = activeSlide?.dataset.view;
  const iframe = activeSlide?.querySelector("iframe");
  const targetCue = activeCueSelectors || tourTargets[activeView] || {};
  const targetSelectors = Array.isArray(targetCue) ? targetCue : targetCue.selectors || [];
  const iframeMatch = iframeTargetRect(iframe, targetSelectors, options);
  if (iframeMatch) return { ...iframeMatch, cueId: targetCue.id || activeView };
  const target = targetSelectors.map((selector) => activeSlide?.querySelector(selector)).find(Boolean) || activeSlide?.querySelector(".feature-focus") || activeSlide?.querySelector(".cover-actions button") || activeSlide?.querySelector(".feature-strip") || activeSlide?.querySelector(".live-frame") || activeSlide?.querySelector(".cover-frame");
  return target ? { target, cueId: targetCue.id || activeView } : null;
}

function screenRectForTarget(match) {
  const targetRect = match.target.getBoundingClientRect();
  if (!match.iframe) return targetRect;
  const iframeRect = match.iframe.getBoundingClientRect();
  const iframeStyle = window.getComputedStyle(match.iframe);
  const borderLeft = Number.parseFloat(iframeStyle.borderLeftWidth) || 0;
  const borderTop = Number.parseFloat(iframeStyle.borderTopWidth) || 0;
  const contentLeft = iframeRect.left + borderLeft;
  const contentTop = iframeRect.top + borderTop;
  const contentRight = iframeRect.right - (Number.parseFloat(iframeStyle.borderRightWidth) || 0);
  const contentBottom = iframeRect.bottom - (Number.parseFloat(iframeStyle.borderBottomWidth) || 0);
  const contentWidth = Math.max(1, contentRight - contentLeft);
  const contentHeight = Math.max(1, contentBottom - contentTop);
  const iframeWindow = match.iframe.contentWindow;
  const iframeDoc = iframeWindow?.document;
  const viewport = iframeWindow?.visualViewport;
  const layoutWidth = viewport?.width || iframeDoc?.documentElement?.clientWidth || match.iframe.clientWidth || contentWidth;
  const layoutHeight = viewport?.height || iframeDoc?.documentElement?.clientHeight || match.iframe.clientHeight || contentHeight;
  const viewportLeft = viewport?.offsetLeft || 0;
  const viewportTop = viewport?.offsetTop || 0;
  const scaleX = contentWidth / Math.max(1, layoutWidth);
  const scaleY = contentHeight / Math.max(1, layoutHeight);
  const left = Math.max(contentLeft + ((targetRect.left - viewportLeft) * scaleX), contentLeft + 6);
  const top = Math.max(contentTop + ((targetRect.top - viewportTop) * scaleY), contentTop + 6);
  const right = Math.min(contentLeft + ((targetRect.right - viewportLeft) * scaleX), contentRight - 6);
  const bottom = Math.min(contentTop + ((targetRect.bottom - viewportTop) * scaleY), contentBottom - 6);
  if (right <= left || bottom <= top) {
    return null;
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

function markIframeTarget(match) {
  if (!match.iframe) return;
  try {
    const doc = match.iframe.contentWindow.document;
    doc.querySelectorAll(".presentation-cue-focus").forEach((node) => node.classList.remove("presentation-cue-focus"));
    match.target.classList.add("presentation-cue-focus");
    if (match.cueId) match.target.dataset.presentationCue = match.cueId;
    window.setTimeout(() => match.target.classList.remove("presentation-cue-focus"), 2600);
  } catch {
    // The overlay still works even if the embedded page cannot be marked.
  }
}

function animateTourGuide(settled = false) {
  window.clearTimeout(guideTimer);
  guideRefineTimers.forEach((timer) => window.clearTimeout(timer));
  guideRefineTimers = [];
  const guideToken = activeGuideToken + 1;
  activeGuideToken = guideToken;
  if (!tourGuide || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const match = resolveTourTarget({ scroll: !settled, instant: !!activeCueSelectors });
  if (!match || !tourHighlight || !tourCursor || !tourClick) {
    hideTourGuide();
    return;
  }

  if (match.iframe && !settled) {
    scheduleTourGuide(activeCueSelectors ? 720 : 560, true);
    return;
  }

  tourGuide.classList.remove("is-hidden");
  markIframeTarget(match);

  tourHighlight.classList.remove("is-active");
  tourCursor.classList.remove("is-active", "is-clicking");
  tourClick.classList.remove("is-active");
  if (match.cueId) tourHighlight.dataset.cueId = match.cueId;
  const placement = placeTourGuide(match);
  if (!placement) {
    hideTourGuide();
    if (!settled) guideTimer = window.setTimeout(() => animateTourGuide(true), 260);
    return;
  }
  const { endX, endY } = placement;

  requestAnimationFrame(() => {
    if (guideToken !== activeGuideToken) return;
    tourHighlight.classList.add("is-active");
    tourCursor.classList.add("is-active");
    tourCursor.style.left = `${endX}px`;
    tourCursor.style.top = `${endY}px`;
  });
  refineTourGuide(match);

  guideTimer = window.setTimeout(() => {
    tourCursor.classList.add("is-clicking");
    tourClick.classList.remove("is-active");
    void tourClick.offsetWidth;
    tourClick.classList.add("is-active");
  }, 760);
  window.setTimeout(() => tourCursor?.classList.remove("is-clicking"), 1120);
}

function scheduleTourGuide(delay = 0, settled = false) {
  window.clearTimeout(guideResetTimer);
  guideResetTimer = window.setTimeout(() => animateTourGuide(settled), delay);
}

function updateSlide(index, options = {}) {
  clearNarrationCues();
  currentSlide = Math.max(0, Math.min(index, slides.length - 1));
  slides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === currentSlide));
  slideCount.textContent = `${currentSlide + 1} / ${slides.length}`;
  if (tourPrevSlideButton) tourPrevSlideButton.disabled = currentSlide === 0;
  if (tourNextSlideButton) tourNextSlideButton.disabled = currentSlide === slides.length - 1;
  if (mobileTourPrevButton) mobileTourPrevButton.disabled = currentSlide === 0;
  if (mobileTourNextButton) mobileTourNextButton.disabled = currentSlide === slides.length - 1;
  progressBar.style.width = `${((currentSlide + 1) / slides.length) * 100}%`;
  dots.querySelectorAll("button").forEach((button, dotIndex) => button.classList.toggle("active", dotIndex === currentSlide));
  const activeSlide = slides[currentSlide];
  const activeView = activeSlide.dataset.view;
  activeSlide.querySelectorAll("iframe").forEach((iframe) => setIframeView(iframe, activeView || "overview"));
  scheduleTourGuide(180);
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
  if (tourMode && !playbackPaused) {
    playbackPaused = true;
    clearNarrationCues();
    voiceAudio.pause();
    if (!audioMode && supportsVoiceover()) window.speechSynthesis.pause();
    setVoiceStatus("Voiceover Paused");
    updatePlayButton();
    return;
  }

  if (tourMode && playbackPaused) {
    playbackPaused = false;
    scheduleNarrationCues();
    if (audioMode && voiceAudio.src) {
      voiceAudio.play().catch(() => useSpeechFallback({ continueTour: true }));
    } else if (supportsVoiceover() && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    } else {
      speakCurrentSlide({ continueTour: true });
    }
    setVoiceStatus(`Playing ${currentSlide + 1} / ${slides.length}`);
    updatePlayButton();
    return;
  }

  tourMode = true;
  playbackPaused = false;
  updatePlayButton();
  speakCurrentSlide({ continueTour: true });
}

function closeMobileSlideNav() {
  const mobileNav = document.querySelector(".mobile-slide-nav");
  mobileNav?.classList.remove("open");
  mobileSlideToggle?.setAttribute("aria-expanded", "false");
}

function updateMobileSlideNavVisibility() {
  const mobileNav = document.querySelector(".mobile-slide-nav");
  if (!mobileNav) return;
  const threshold = Math.max(360, window.innerHeight * 0.45);
  const isVisible = window.scrollY > threshold;
  mobileNav.classList.toggle("is-visible", isVisible);
  if (!isVisible) closeMobileSlideNav();
}

window.addEventListener("scroll", updateMobileSlideNavVisibility, { passive: true });
window.addEventListener("resize", updateMobileSlideNavVisibility);
updateMobileSlideNavVisibility();

playTourButton?.addEventListener("click", startTour);
startWalkthroughButton?.addEventListener("click", startTour);
mobileTourPlayButton?.addEventListener("click", () => {
  closeMobileSlideNav();
  startTour();
});

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

mobileTourStartButton?.addEventListener("click", () => {
  closeMobileSlideNav();
  stopVoiceover("Voiceover Ready");
  updateSlide(0, { userInitiated: true });
});

tourNextSlideButton?.addEventListener("click", () => {
  stopVoiceover("Voiceover Ready");
  updateSlide(currentSlide + 1, { userInitiated: true });
});

mobileTourNextButton?.addEventListener("click", () => {
  closeMobileSlideNav();
  stopVoiceover("Voiceover Ready");
  updateSlide(currentSlide + 1, { userInitiated: true });
});

tourPrevSlideButton?.addEventListener("click", () => {
  stopVoiceover("Voiceover Ready");
  updateSlide(currentSlide - 1, { userInitiated: true });
});

mobileTourPrevButton?.addEventListener("click", () => {
  closeMobileSlideNav();
  stopVoiceover("Voiceover Ready");
  updateSlide(currentSlide - 1, { userInitiated: true });
});

mobileSlideToggle?.addEventListener("click", (event) => {
  event.stopPropagation();
  const mobileNav = document.querySelector(".mobile-slide-nav");
  const isOpen = mobileNav?.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

document.addEventListener("click", (event) => {
  const mobileNav = document.querySelector(".mobile-slide-nav");
  if (!mobileNav || mobileNav.contains(event.target)) return;
  closeMobileSlideNav();
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

window.addEventListener("resize", animateTourGuide);
updateVoiceToggle();
updatePlayButton();
updateSlide(0);
