const stages = ["New inquiry", "Contacted", "Booked", "Outcome"];

const phases = {
  foundation: {
    label: "Days 1-30",
    title: "Build the foundation",
    focus: "Audience selection, campaign offer, landing page, tracking, and follow-up setup.",
    milestone: "Campaign ready to launch with baseline measures recorded.",
    actions: ["Confirm primary audience", "Prepare landing page and inquiry tracking", "Approve first educational content"],
    view: "landing"
  },
  launch: {
    label: "Days 31-60",
    title: "Launch and learn",
    focus: "Run the first campaign, publish educational content, monitor inquiry quality, and review booking attendance.",
    milestone: "Initial evidence of which messages generate useful conversations.",
    actions: ["Review new inquiries", "Advance leads through follow-up", "Compare booked and attended consultations"],
    view: "workflow"
  },
  evaluate: {
    label: "Days 61-90",
    title: "Improve and evaluate",
    focus: "Refine targeting, address follow-up gaps, assess sales outcomes, and estimate acquisition costs.",
    milestone: "Documented recommendation to expand, adjust, or stop each activity.",
    actions: ["Inspect acquisition costs", "Separate pending applications from placed policies", "Prepare next-step recommendation"],
    view: "reporting"
  }
};

const state = {
  selectedPhase: "launch",
  selectedLeadId: 1,
  leads: [
    { id: 1, name: "Maya Chen", email: "maya@example.com", phone: "(555) 014-1189", area: "Plano", source: "Landing page", concern: "Protecting my family", time: "Weekday afternoon", stage: "New inquiry", quality: "Qualified", notes: ["Needs coverage for spouse and two children."], followUps: [{ date: "2026-09-28", type: "Call", note: "Confirm budget range and preferred consultation time." }] },
    { id: 2, name: "Andre Brooks", email: "andre@example.com", phone: "(555) 018-2044", area: "Frisco", source: "Facebook campaign", concern: "Mortgage protection", time: "Early evening", stage: "Contacted", quality: "Qualified", notes: ["Asked whether mortgage protection should be separate from family coverage."], followUps: [{ date: "2026-09-29", type: "Email", note: "Send approved explainer and booking link." }] },
    { id: 3, name: "Priya Shah", email: "priya@example.com", phone: "(555) 016-0081", area: "McKinney", source: "Referral", concern: "Understanding my options", time: "Weekday morning", stage: "Booked", quality: "Qualified", notes: ["Booked a needs conversation for next week."], followUps: [] },
    { id: 4, name: "Sam Rivera", email: "sam@example.com", phone: "(555) 011-7761", area: "Dallas", source: "Landing page", concern: "Business continuity", time: "Weekday afternoon", stage: "Outcome", quality: "Application pending", notes: ["Business owner. Application pending underwriting."], followUps: [{ date: "2026-10-02", type: "Task", note: "Check application status." }] },
    { id: 5, name: "Lena Morris", email: "lena@example.com", phone: "(555) 019-4432", area: "Allen", source: "Email link", concern: "Protecting my family", time: "Early evening", stage: "Outcome", quality: "Policy placed", notes: ["Policy placed. Add annual review reminder later."], followUps: [] }
  ],
  generatedFunnelUrl: "",
  baseline: {
    qualified: 42,
    booked: 18,
    attended: 13,
    applications: 7,
    policies: 4,
    retainedCommission: 7600
  }
};

const contentIdeas = [
  ["Post", "How much life insurance do young families usually consider?", "Simple framing around income, debts, dependents, and budget."],
  ["Short video", "What happens during a first consultation?", "A calm walkthrough of the conversation and what Sharon will ask."],
  ["Post", "Life insurance terms in plain English", "Define beneficiary, premium, term, and underwriting without sales pressure."],
  ["Short video", "Mortgage protection vs. family protection", "Explain the overlap and why needs can change over time."],
  ["Post", "Three moments when coverage is worth revisiting", "New child, new home, self-employment, or major income change."],
  ["Post", "Why online quotes are only a starting point", "Position Sharon's role as clarification, not instant product advice."],
  ["Post", "Questions to ask before buying coverage", "Encourage prepared, informed conversations."],
  ["Short video", "Common cost misconceptions", "Address affordability concerns with approved, general language."]
];

const metricCopy = {
  qualified: {
    label: "Qualified inquiries",
    note: "People who matched the target area and gave permission for Sharon's team to follow up."
  },
  booked: {
    label: "Consultations booked",
    note: "Qualified leads who moved into a confirmed conversation through the booking flow."
  },
  attended: {
    label: "Attended meetings",
    note: "Booked consultations that became useful live conversations with Sharon."
  },
  policies: {
    label: "Placed policies",
    note: "Closed policy outcomes, shown separately from pending applications."
  }
};

function showView(id) {
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === id));
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === id));
}

const sidebar = document.querySelector(".sidebar");
const menuToggle = document.querySelector(".menu-toggle");
const pipeline = document.querySelector("#pipeline");
const profileUpload = document.querySelector("#profile-upload");
const brandMark = document.querySelector("#brand-mark");
const brandPhoto = document.querySelector("#brand-photo");
const profilePhotoKey = "sharonDemoProfilePhoto";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const holdDelay = 280;
const holdMoveTolerance = 18;
let touchDrag = null;
let parallaxFrame = 0;
let activeMetric = "";

function setMenuOpen(isOpen) {
  if (!sidebar || !menuToggle) return;
  sidebar.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
}

function setBrandPhoto(dataUrl) {
  if (!brandMark || !brandPhoto) return;
  if (dataUrl) {
    brandPhoto.src = dataUrl;
    brandMark.classList.add("has-photo");
  } else {
    brandPhoto.removeAttribute("src");
    brandMark.classList.remove("has-photo");
  }
}

function restoreBrandPhoto() {
  try {
    setBrandPhoto(localStorage.getItem(profilePhotoKey));
  } catch {
    setBrandPhoto("");
  }
}

function updateParallax() {
  parallaxFrame = 0;
  const y = window.scrollY;
  document.documentElement.style.setProperty("--parallax-fast", `${Math.round(y * 0.04)}px`);
  document.documentElement.style.setProperty("--parallax-slow", `${Math.round(y * 0.025)}px`);
  document.documentElement.style.setProperty("--overview-lift", `${Math.round(Math.min(y * 0.018, 8)) * -1}px`);
}

function requestParallaxUpdate() {
  if (reduceMotion.matches || parallaxFrame) return;
  const schedule = window.requestAnimationFrame || ((callback) => window.setTimeout(callback, 16));
  parallaxFrame = schedule(updateParallax);
}

function renderPhasePanel() {
  const phase = phases[state.selectedPhase];
  const panel = document.querySelector("#phase-panel");
  panel.innerHTML = `
    <div>
      <p class="eyebrow">${phase.label}</p>
      <h2>${phase.title}</h2>
      <p>${phase.focus}</p>
    </div>
    <div class="phase-detail">
      <span>Milestone</span>
      <strong>${phase.milestone}</strong>
      <ul>
        ${phase.actions.map((action) => `<li>${action}</li>`).join("")}
      </ul>
      <button type="button" data-phase-view="${phase.view}">Open related demo</button>
    </div>
  `;
  document.querySelectorAll(".phase").forEach((button) => {
    const isActive = button.dataset.phase === state.selectedPhase;
    button.classList.toggle("live", isActive);
    button.classList.toggle("done", button.dataset.phase === "foundation" && state.selectedPhase !== "foundation");
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function totals() {
  const newPolicies = state.leads.filter((lead) => lead.quality === "Policy placed").length;
  const newBooked = state.leads.filter((lead) => ["Booked", "Outcome"].includes(lead.stage)).length;
  return {
    qualified: state.baseline.qualified + state.leads.length,
    booked: state.baseline.booked + newBooked,
    attended: state.baseline.attended + state.leads.filter((lead) => lead.stage === "Outcome").length,
    applications: state.baseline.applications + state.leads.filter((lead) => lead.quality === "Application pending").length,
    policies: state.baseline.policies + newPolicies
  };
}

function updateOverview() {
  const current = totals();
  document.querySelector("#metric-qualified").textContent = current.qualified;
  document.querySelector("#metric-booked").textContent = current.booked;
  document.querySelector("#metric-attended").textContent = current.attended;
  document.querySelector("#metric-policies").textContent = current.policies;
  const max = Math.max(current.qualified, 1);
  const metricSeries = {
    qualified: [state.baseline.qualified * 0.72, state.baseline.qualified * 0.86, state.baseline.qualified, current.qualified],
    booked: [state.baseline.booked * 0.7, state.baseline.booked * 0.86, state.baseline.booked, current.booked],
    attended: [state.baseline.attended * 0.68, state.baseline.attended * 0.84, state.baseline.attended, current.attended],
    policies: [state.baseline.policies * 0.62, state.baseline.policies * 0.78, state.baseline.policies, current.policies]
  };
  Object.entries(metricSeries).forEach(([id, values]) => {
    const points = values.map((value, index) => {
      const x = 8 + index * 34.5;
      const y = 50 - Math.max((value / max) * 42, 4);
      return [x, y];
    });
    const line = document.querySelector(`#graph-${id}-line`);
    const area = document.querySelector(`#graph-${id}-area`);
    const dot = document.querySelector(`#graph-${id}-dot`);
    if (!line || !area || !dot) return;
    const linePath = points.map(([x, y], index) => `${index ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    line.setAttribute("d", linePath);
    area.setAttribute("d", `${linePath} L ${lastPoint[0].toFixed(1)} 54 L ${firstPoint[0].toFixed(1)} 54 Z`);
    dot.setAttribute("cx", lastPoint[0].toFixed(1));
    dot.setAttribute("cy", lastPoint[1].toFixed(1));
  });
  updateMetricBubbles(current);
}

function updateMetricBubbles(current) {
  Object.entries(metricCopy).forEach(([id, detail]) => {
    const bubble = document.querySelector(`#metric-${id}-bubble`);
    if (!bubble) return;
    const baseline = state.baseline[id] || 0;
    const value = current[id] || 0;
    const lift = value - baseline;
    bubble.innerHTML = `
      <strong>${detail.label}: ${value}</strong>
      <p>${detail.note}</p>
      <dl>
        <dt>Starting point</dt>
        <dd>${baseline}</dd>
        <dt>Added in demo</dt>
        <dd>+${lift}</dd>
      </dl>
    `;
  });
}

function showMetricBubble(id) {
  activeMetric = activeMetric === id ? "" : id;
  document.querySelectorAll(".metric").forEach((metric) => {
    const isActive = metric.dataset.metric === activeMetric;
    metric.classList.toggle("show-detail", isActive);
    metric.querySelector(".metric-chart")?.setAttribute("aria-expanded", String(isActive));
  });
}

function closeMetricBubbles() {
  if (!activeMetric) return;
  activeMetric = "";
  document.querySelectorAll(".metric.show-detail").forEach((metric) => {
    metric.classList.remove("show-detail");
    metric.querySelector(".metric-chart")?.setAttribute("aria-expanded", "false");
  });
}

function renderPipeline() {
  const pipeline = document.querySelector("#pipeline");
  pipeline.innerHTML = stages.map((stage) => {
    const cards = state.leads
      .filter((lead) => lead.stage === stage)
      .map((lead) => `
        <article class="lead-card ${lead.id === state.selectedLeadId ? "selected" : ""}" draggable="true" data-lead-id="${lead.id}">
          <strong>${lead.name}</strong>
          <p>${lead.concern}</p>
          <small>${lead.time} | ${lead.quality}</small>
          <small>${lead.followUps.length ? `Next: ${lead.followUps[0].date}` : "No follow-up scheduled"}</small>
          <button type="button" data-select="${lead.id}">Select</button>
        </article>
      `).join("");
    return `<section class="pipeline-column" data-stage="${stage}"><h3>${stage}</h3>${cards || "<p class='fineprint'>No leads in this stage.</p>"}</section>`;
  }).join("");
}

function selectedLead() {
  return state.leads.find((lead) => lead.id === state.selectedLeadId);
}

function renderLeadManager() {
  const table = document.querySelector("#lead-table");
  table.innerHTML = `
    <div class="lead-table-head">
      <span>Name</span>
      <span>Need</span>
      <span>Source</span>
      <span>Next follow-up</span>
      <span>Status</span>
    </div>
    ${state.leads.map((lead) => `
      <button class="lead-row ${lead.id === state.selectedLeadId ? "selected" : ""}" type="button" data-select="${lead.id}">
        <span>${lead.name}</span>
        <span>${lead.concern}</span>
        <span>${lead.source || "Landing page"}</span>
        <span>${lead.followUps[0]?.date || "Not scheduled"}</span>
        <span>${lead.stage}</span>
      </button>
    `).join("")}
  `;

  const lead = selectedLead();
  const detail = document.querySelector("#lead-detail");
  if (!lead) {
    detail.innerHTML = "<p class='fineprint'>Select a lead to view details, add notes, and schedule follow-ups.</p>";
    return;
  }

  detail.innerHTML = `
    <div class="detail-header">
      <div>
        <p class="eyebrow">Selected lead</p>
        <h3>${lead.name}</h3>
      </div>
      <span class="status-pill">${lead.quality}</span>
    </div>
    <dl class="detail-grid">
      <div><dt>Email</dt><dd>${lead.email || "Not provided"}</dd></div>
      <div><dt>Phone</dt><dd>${lead.phone || "Not provided"}</dd></div>
      <div><dt>Area</dt><dd>${lead.area || "Not provided"}</dd></div>
      <div><dt>Source</dt><dd>${lead.source || "Landing page"}</dd></div>
    </dl>
    <form class="inline-form" id="note-form">
      <label>
        Add note
        <textarea name="note" rows="3" placeholder="Document the conversation, objections, or next step." required></textarea>
      </label>
      <button type="submit">Save note</button>
    </form>
    <form class="inline-form" id="followup-form">
      <label>
        Follow-up date
        <input name="date" type="date" required />
      </label>
      <label>
        Type
        <select name="type">
          <option>Call</option>
          <option>Email</option>
          <option>Text</option>
          <option>Task</option>
        </select>
      </label>
      <label>
        Reminder note
        <input name="note" placeholder="Confirm appointment and send reminder." required />
      </label>
      <button type="submit">Schedule follow-up</button>
    </form>
    <div class="activity-list">
      <h4>Notes</h4>
      ${lead.notes.map((note) => `<p>${note}</p>`).join("") || "<p>No notes yet.</p>"}
      <h4>Scheduled follow-ups</h4>
      ${lead.followUps.map((item) => `<p><strong>${item.date}</strong> - ${item.type}: ${item.note}</p>`).join("") || "<p>No follow-ups scheduled.</p>"}
    </div>
  `;
}

function renderReport() {
  const current = totals();
  const adSpend = Number(document.querySelector("#ad-spend").value || 0);
  const agencyFee = Number(document.querySelector("#agency-fee").value || 0);
  const totalCost = adSpend + agencyFee;
  const costPerQualified = totalCost / Math.max(current.qualified, 1);
  const costPerClient = totalCost / Math.max(current.policies, 1);
  const retained = state.baseline.retainedCommission + current.policies * 1900;
  const roi = ((retained - totalCost) / Math.max(totalCost, 1)) * 100;

  document.querySelector("#score-grid").innerHTML = [
    ["Cost per qualified inquiry", `$${Math.round(costPerQualified)}`, "Ad spend plus agency fee"],
    ["Cost per placed policy", `$${Math.round(costPerClient)}`, "Uses policies placed in force"],
    ["Estimated retained commission", `$${retained.toLocaleString()}`, "Demo figure for evaluation"],
    ["Pilot return estimate", `${Math.round(roi)}%`, "Before servicing costs or reversals"]
  ].map(([label, value, note]) => `<article class="score-card"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join("");

  const rows = [
    ["Qualified inquiries", current.qualified],
    ["Consultations booked", current.booked],
    ["Attended meetings", current.attended],
    ["Applications", current.applications],
    ["Policies placed", current.policies]
  ];
  const max = rows[0][1];
  document.querySelector("#funnel").innerHTML = rows.map(([label, value]) => `
    <div class="funnel-row">
      <strong>${label}</strong>
      <div class="bar" style="width:${Math.max((value / max) * 100, 8)}%"></div>
      <span>${value}</span>
    </div>
  `).join("");
}

function renderContent(offset = 0) {
  const selected = [...contentIdeas.slice(offset), ...contentIdeas.slice(0, offset)].slice(0, 6);
  document.querySelector("#content-board").innerHTML = selected.map(([type, title, note]) => `
    <article class="content-card">
      <span class="content-type">${type}</span>
      <h3>${title}</h3>
      <p>${note}</p>
    </article>
  `).join("");
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function renderFunnel() {
  const form = new FormData(document.querySelector("#funnel-form"));
  const campaign = form.get("campaign");
  const audience = form.get("audience");
  const offer = form.get("offer");
  const destination = form.get("destination");
  const basePath = window.location.pathname.replace(/\/$/, "");
  const base = `${window.location.origin}${basePath}`;
  const params = new URLSearchParams({
    funnel: slugify(campaign),
    audience: slugify(audience),
    offer: slugify(offer),
    source: "email"
  });
  const hash = destination === "landing" ? "" : `#${destination}`;
  const url = `${base}/?${params.toString()}${hash}`;
  const emailCopy = `Subject: ${campaign}\n\nHi,\n\nI thought this might be useful if you have questions about life insurance options for ${audience.toLowerCase()}.\n\nYou can book a no-obligation conversation with Sharon here:\n${url}\n\nThe conversation is meant to help you understand your options. Product advice, quotes, and applications are handled by Sharon and her licensed team.\n\nBest,`;

  state.generatedFunnelUrl = url;
  document.querySelector("#generated-url").textContent = url;
  document.querySelector("#email-copy").value = emailCopy;
  document.querySelector("#email-link").href = `mailto:?subject=${encodeURIComponent(campaign)}&body=${encodeURIComponent(emailCopy.replace(/^Subject:.*\n\n/, ""))}`;
}

function clearPipelineTargets() {
  document.querySelectorAll(".pipeline-column").forEach((column) => column.classList.remove("drop-target"));
}

function highlightPipelineTarget(column) {
  document.querySelectorAll(".pipeline-column").forEach((item) => item.classList.toggle("drop-target", item === column));
}

function moveLeadToStage(leadId, stage) {
  const lead = state.leads.find((item) => item.id === leadId);
  if (!lead || !stage) return;
  lead.stage = stage;
  if (lead.stage === "Outcome" && lead.quality === "Qualified") lead.quality = "Application pending";
  state.selectedLeadId = lead.id;
  refresh();
}

function startHoldDrag({ card, leadId, pointerId, startX, startY }) {
  cancelHoldDrag();
  touchDrag = {
    card,
    leadId,
    pointerId,
    startX,
    startY,
    targetColumn: null,
    moved: false,
    armed: false,
    suppressClick: false,
    holdTimer: window.setTimeout(() => {
      if (!touchDrag || touchDrag.card !== card) return;
      touchDrag.armed = true;
      card.classList.add("hold-ready", "dragging", "touch-dragging");
    }, holdDelay)
  };
}

function cancelHoldDrag() {
  if (!touchDrag || touchDrag.suppressClick) return;
  window.clearTimeout(touchDrag.holdTimer);
  touchDrag.card?.classList.remove("hold-ready", "dragging", "touch-dragging");
  if (touchDrag.card) touchDrag.card.style.transform = "";
  clearPipelineTargets();
  touchDrag = null;
}

function updateHoldDrag(clientX, clientY) {
  if (!touchDrag) return false;
  const dx = clientX - touchDrag.startX;
  const dy = clientY - touchDrag.startY;
  if (!touchDrag.armed) {
    if (Math.hypot(dx, dy) > holdMoveTolerance) cancelHoldDrag();
    return false;
  }
  touchDrag.moved = true;
  touchDrag.card.style.transform = `translate(${dx}px, ${dy}px)`;
  const element = document.elementFromPoint(clientX, clientY);
  const column = element?.closest?.(".pipeline-column");
  touchDrag.targetColumn = column;
  highlightPipelineTarget(column);
  return true;
}

function finishHoldDrag() {
  if (!touchDrag) return;
  const { card, leadId, targetColumn, moved, armed } = touchDrag;
  window.clearTimeout(touchDrag.holdTimer);
  card.classList.remove("hold-ready", "dragging", "touch-dragging");
  card.style.transform = "";
  clearPipelineTargets();
  touchDrag = armed ? { suppressClick: true } : null;
  if (armed && moved && targetColumn) moveLeadToStage(leadId, targetColumn.dataset.stage);
}

function refresh() {
  renderPhasePanel();
  updateOverview();
  renderPipeline();
  renderLeadManager();
  renderReport();
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    showView(button.dataset.view);
    setMenuOpen(false);
  });
});

menuToggle?.addEventListener("click", () => {
  setMenuOpen(!sidebar?.classList.contains("menu-open"));
});

profileUpload?.addEventListener("change", () => {
  const file = profileUpload.files?.[0];
  if (!file || !file.type.startsWith("image/")) {
    setBrandPhoto("");
    return;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const dataUrl = String(reader.result || "");
    setBrandPhoto(dataUrl);
    try {
      localStorage.setItem(profilePhotoKey, dataUrl);
    } catch {
      // The preview still works even if browser storage is full or unavailable.
    }
  });
  reader.readAsDataURL(file);
});

document.querySelectorAll("[data-open]").forEach((card) => {
  card.addEventListener("click", () => showView(card.dataset.open));
});

document.querySelectorAll(".phase").forEach((button) => {
  button.addEventListener("click", () => {
    state.selectedPhase = button.dataset.phase;
    renderPhasePanel();
  });
});

document.querySelector(".metric-grid").addEventListener("click", (event) => {
  const chart = event.target.closest("[data-metric-chart]");
  if (!chart) return;
  event.stopPropagation();
  showMetricBubble(chart.dataset.metricChart);
});

document.querySelector(".metric-grid").addEventListener("keydown", (event) => {
  if (!["Enter", " "].includes(event.key)) return;
  const chart = event.target.closest("[data-metric-chart]");
  if (!chart) return;
  event.preventDefault();
  showMetricBubble(chart.dataset.metricChart);
});

document.addEventListener("click", (event) => {
  if (event.target.closest(".metric")) return;
  closeMetricBubbles();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMetricBubbles();
});

document.querySelector("#phase-panel").addEventListener("click", (event) => {
  const button = event.target.closest("[data-phase-view]");
  if (!button) return;
  showView(button.dataset.phaseView);
});

document.querySelector("#booking-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const lead = {
    id: Date.now(),
    name: form.get("name"),
    email: form.get("email"),
    phone: "",
    area: "",
    source: "Landing page",
    concern: form.get("concern"),
    time: form.get("time"),
    stage: "New inquiry",
    quality: "Qualified",
    notes: ["Submitted consultation request from the landing page."],
    followUps: []
  };
  state.leads.unshift(lead);
  state.selectedLeadId = lead.id;
  document.querySelector("#confirmation").textContent = `${lead.name} was added to the follow-up workflow.`;
  event.currentTarget.reset();
  refresh();
});

pipeline.addEventListener("click", (event) => {
  if (touchDrag?.suppressClick) {
    event.preventDefault();
    event.stopPropagation();
    touchDrag = null;
    return;
  }
  const button = event.target.closest("[data-select]");
  if (!button) return;
  state.selectedLeadId = Number(button.dataset.select);
  renderPipeline();
  renderLeadManager();
});

pipeline.addEventListener("dragstart", (event) => {
  const card = event.target.closest(".lead-card");
  if (!card) return;
  event.dataTransfer.setData("text/plain", card.dataset.leadId);
  event.dataTransfer.effectAllowed = "move";
  card.classList.add("dragging");
});

pipeline.addEventListener("dragend", (event) => {
  const card = event.target.closest(".lead-card");
  if (card) card.classList.remove("dragging");
  clearPipelineTargets();
});

pipeline.addEventListener("dragover", (event) => {
  const column = event.target.closest(".pipeline-column");
  if (!column) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  highlightPipelineTarget(column);
});

pipeline.addEventListener("dragleave", (event) => {
  const column = event.target.closest(".pipeline-column");
  if (!column || column.contains(event.relatedTarget)) return;
  column.classList.remove("drop-target");
});

pipeline.addEventListener("drop", (event) => {
  const column = event.target.closest(".pipeline-column");
  if (!column) return;
  event.preventDefault();
  const leadId = Number(event.dataTransfer.getData("text/plain"));
  moveLeadToStage(leadId, column.dataset.stage);
});

pipeline.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse") return;
  if (event.target.closest("button")) return;
  const card = event.target.closest(".lead-card");
  if (!card) return;
  startHoldDrag({
    card,
    leadId: Number(card.dataset.leadId),
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY
  });
  try {
    card.setPointerCapture?.(event.pointerId);
  } catch {
    // Some mobile browsers reject pointer capture for synthetic or interrupted gestures.
  }
});

pipeline.addEventListener("pointermove", (event) => {
  if (!touchDrag || event.pointerId !== touchDrag.pointerId) return;
  if (updateHoldDrag(event.clientX, event.clientY)) event.preventDefault();
});

pipeline.addEventListener("pointerup", (event) => {
  if (!touchDrag || event.pointerId !== touchDrag.pointerId) return;
  const { card } = touchDrag;
  try {
    if (card.hasPointerCapture?.(event.pointerId)) card.releasePointerCapture?.(event.pointerId);
  } catch {
    // If capture was lost mid-gesture, still finish the drop cleanup.
  }
  finishHoldDrag();
});

pipeline.addEventListener("pointercancel", (event) => {
  if (!touchDrag || event.pointerId !== touchDrag.pointerId) return;
  cancelHoldDrag();
});

pipeline.addEventListener("touchstart", (event) => {
  if (touchDrag || event.touches.length !== 1) return;
  if (event.target.closest("button")) return;
  const card = event.target.closest(".lead-card");
  if (!card) return;
  const touch = event.touches[0];
  startHoldDrag({
    card,
    leadId: Number(card.dataset.leadId),
    pointerId: "touch",
    startX: touch.clientX,
    startY: touch.clientY
  });
}, { passive: true });

pipeline.addEventListener("touchmove", (event) => {
  if (!touchDrag || touchDrag.pointerId !== "touch" || event.touches.length !== 1) return;
  const touch = event.touches[0];
  if (updateHoldDrag(touch.clientX, touch.clientY)) event.preventDefault();
}, { passive: false });

pipeline.addEventListener("touchend", () => {
  if (!touchDrag || touchDrag.pointerId !== "touch") return;
  finishHoldDrag();
});

pipeline.addEventListener("touchcancel", () => {
  if (!touchDrag || touchDrag.pointerId !== "touch") return;
  cancelHoldDrag();
});

pipeline.addEventListener("contextmenu", (event) => {
  if (!event.target.closest(".lead-card")) return;
  event.preventDefault();
});

document.querySelector("#lead-table").addEventListener("click", (event) => {
  const row = event.target.closest("[data-select]");
  if (!row) return;
  state.selectedLeadId = Number(row.dataset.select);
  renderPipeline();
  renderLeadManager();
});

document.querySelector("#lead-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const note = form.get("note");
  const lead = {
    id: Date.now(),
    name: form.get("name"),
    email: form.get("email"),
    phone: form.get("phone"),
    area: form.get("area"),
    source: form.get("source"),
    concern: form.get("concern"),
    time: "To schedule",
    stage: "New inquiry",
    quality: "Qualified",
    notes: note ? [note] : [],
    followUps: []
  };
  state.leads.unshift(lead);
  state.selectedLeadId = lead.id;
  event.currentTarget.reset();
  refresh();
});

document.querySelector("#lead-detail").addEventListener("submit", (event) => {
  event.preventDefault();
  const lead = selectedLead();
  if (!lead) return;
  const form = new FormData(event.target);
  if (event.target.id === "note-form") {
    lead.notes.unshift(form.get("note"));
  }
  if (event.target.id === "followup-form") {
    lead.followUps.unshift({ date: form.get("date"), type: form.get("type"), note: form.get("note") });
    lead.followUps.sort((a, b) => a.date.localeCompare(b.date));
  }
  event.target.reset();
  refresh();
});

document.querySelector("#seed-followup").addEventListener("click", () => {
  const lead = selectedLead();
  if (!lead) return;
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  lead.followUps.unshift({ date: tomorrow, type: "Call", note: "Confirm interest and offer booking times." });
  lead.followUps.sort((a, b) => a.date.localeCompare(b.date));
  refresh();
});

document.querySelector("#ad-spend").addEventListener("input", renderReport);
document.querySelector("#agency-fee").addEventListener("input", renderReport);
document.querySelector("#generate-funnel").addEventListener("click", renderFunnel);
document.querySelector("#funnel-form").addEventListener("input", renderFunnel);
document.querySelector("#copy-link").addEventListener("click", async () => {
  if (!state.generatedFunnelUrl) renderFunnel();
  await navigator.clipboard.writeText(state.generatedFunnelUrl);
  document.querySelector("#copy-link").textContent = "Copied";
  setTimeout(() => {
    document.querySelector("#copy-link").textContent = "Copy link";
  }, 1400);
});

let contentOffset = 0;
document.querySelector("#shuffle-content").addEventListener("click", () => {
  contentOffset = (contentOffset + 2) % contentIdeas.length;
  renderContent(contentOffset);
});

window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
reduceMotion.addEventListener?.("change", () => {
  if (!reduceMotion.matches) requestParallaxUpdate();
});

restoreBrandPhoto();
requestParallaxUpdate();
renderContent();
renderFunnel();
refresh();
