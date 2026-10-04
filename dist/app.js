const profilePhotoKey = "leadSystemProfilePhoto";
const profileNameKey = "leadSystemProfileName";
const reducedMotionKey = "leadSystemReducedMotion";
const themeKey = "leadSystemTheme";
const sidebarWidthKey = "leadSystemSidebarWidth";
const defaultProfilePhoto = "assets/sharon.png";
const defaultProfileName = "Sharon Martin";
const validViewIds = new Set(Array.from(document.querySelectorAll(".view")).map((view) => view.id));
const maxProfilePhotoBytes = 750000;

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function safeExternalUrl(value) {
  try {
    const url = new URL(String(value || ""), window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}

const customerMessages = [
  "Captured buyer signal: clicked the mortgage protection ad, watched the family coverage video, and requested a protection review after 5 PM.",
  "Captured buyer signal: saved a life insurance checklist post, clicked the Google Search ad, and asked how much coverage a young family should consider.",
  "Captured buyer signal: opened the business continuity campaign link, visited the customer page, and requested a callback."
];

const recruitMessages = [
  "Captured recruiting signal: clicked the LinkedIn career post, opened the recruitment page, and asked about licensing steps.",
  "Captured recruiting signal: engaged with the sales opportunity video, clicked the recruiting campaign link, and asked if part-time is realistic.",
  "Captured recruiting signal: licensed agent viewed the mentorship post, clicked the agency opportunity link, and requested a conversation."
];

const state = {
  simType: "customer",
  selectedSocial: "facebook",
  selectedLeadManagerType: "customer",
  complianceFeed: null,
  selectedLeadId: 1,
  selectedScheduleId: 1,
  generatedPosts: [],
  postingLog: [],
  leads: [
    {
      id: 1,
      type: "customer",
      name: "Maya Chen",
      source: "Mortgage Protection Ad",
      message: "I just bought a house and want to know if mortgage protection is separate from life insurance.",
      score: 91,
      status: "Needs Approval",
      stage: "Intake Qualified",
      summary: "Homeowner asking about mortgage protection and life insurance overlap.",
      nextStep: "Approve callback and send booking link for a protection review.",
      aiDraft: "Thanks for reaching out. The team can walk through mortgage protection and family coverage options in a short consultation."
    },
    {
      id: 2,
      type: "recruit",
      name: "Andre Brooks",
      source: "Recruiting Landing Page",
      message: "I have sales experience and want to know what it takes to become licensed.",
      score: 84,
      status: "Needs Approval",
      stage: "Intake Qualified",
      summary: "Career-change prospect with sales experience and licensing questions.",
      nextStep: "Approve recruiting intro email and invite to a discovery call.",
      aiDraft: "Thanks for your interest. The team can explain licensing steps, training, and what the agency opportunity looks like."
    },
    {
      id: 3,
      type: "customer",
      name: "Priya Shah",
      source: "Referral Link",
      message: "I want to review coverage before our second child arrives.",
      score: 88,
      status: "Approved",
      stage: "Callback Ready",
      summary: "Family protection lead with a clear life event and near-term need.",
      nextStep: "Call during weekday morning window.",
      aiDraft: "Congratulations on the growing family. The team can help you review what coverage may fit your needs and budget."
    },
    {
      id: 4,
      type: "recruit",
      name: "Lena Morris",
      source: "LinkedIn Recruiting Post",
      message: "I am licensed and looking for an agency with better mentorship.",
      score: 93,
      status: "Approved",
      stage: "Interview Ready",
      summary: "Licensed agent prospect looking for mentorship and agency support.",
      nextStep: "Send interview scheduler and agency overview.",
      aiDraft: "Thanks for reaching out. The team can share the support model and schedule a short conversation."
    }
  ]
};
let skipAccountPromptOnce = false;

const socialAccounts = {
  facebook: {
    label: "Facebook",
    handle: "Lead Acquisition Agency",
    status: "Connected",
    audience: "Local Families",
    views: 18420,
    engagements: 1268,
    clicks: 312,
    leads: 42,
    customerLeads: 34,
    agentLeads: 8,
    topPost: "Mortgage Protection Basics",
    recommendation: "Boost the mortgage protection post and send comment replies into guided intake."
  },
  instagram: {
    label: "Instagram",
    handle: "@agencyprotects",
    status: "Connected",
    audience: "Young Families",
    views: 22380,
    engagements: 1744,
    clicks: 276,
    leads: 36,
    customerLeads: 30,
    agentLeads: 6,
    topPost: "Family Coverage Checklist",
    recommendation: "Turn story replies into consultation prompts and retarget profile visitors."
  },
  linkedin: {
    label: "LinkedIn",
    handle: "Agency Recruiting",
    status: "Connected",
    audience: "Career Switchers",
    views: 9710,
    engagements: 684,
    clicks: 198,
    leads: 28,
    customerLeads: 7,
    agentLeads: 21,
    topPost: "Why Insurance Sales Needs Educators",
    recommendation: "Route career comments into the sales agent recruiting sequence."
  },
  tiktok: {
    label: "TikTok",
    handle: "@agencyinsurance",
    status: "Ready To Connect",
    audience: "Short-Form Viewers",
    views: 31500,
    engagements: 2380,
    clicks: 164,
    leads: 19,
    customerLeads: 16,
    agentLeads: 3,
    topPost: "Life Insurance Terms In 30 Seconds",
    recommendation: "Use educational videos for top-of-funnel customer capture."
  },
  youtube: {
    label: "YouTube",
    handle: "Lead Acquisition Agency",
    status: "Ready To Connect",
    audience: "Search And Education",
    views: 12880,
    engagements: 522,
    clicks: 141,
    leads: 17,
    customerLeads: 14,
    agentLeads: 3,
    topPost: "First Consultation Walkthrough",
    recommendation: "Add lead links below educational videos and send form fills into approval."
  }
};

const leadManagerContent = {
  customer: {
    status: "Consumer acquisition is focused on people asking about protection, coverage, mortgage needs, and family planning.",
    flow: ["Social / Search Click", "Customer Page", "Guided Intake", "Human Approval", "Callback Or Booking"],
    followUp: ["Approve consultation invite", "Send booking link", "Call within preferred window", "Move qualified buyers to quote review"],
    links: ["Customer Page", "Protection Review Campaign", "Family Coverage Retargeting"],
    reporting: ["Customer lead volume", "Approval rate", "Callback-ready leads", "Policy opportunity count"],
    contentPlan: ["Mortgage Protection Basics", "How Much Coverage Families Consider", "What Happens In A Protection Review"]
  },
  recruit: {
    status: "Recruiting acquisition is focused on people interested in licensing, sales support, mentorship, and joining the agency.",
    flow: ["Recruiting Post / Ad", "Recruitment Page", "Fit Screening", "Human Approval", "Interview Or Licensing Review"],
    followUp: ["Approve recruiting intro", "Send opportunity overview", "Ask license-status questions", "Route strong fits to interview"],
    links: ["Recruitment Page", "Agent Opportunity Campaign", "Licensed Agent Outreach"],
    reporting: ["Agent lead volume", "Approval rate", "Interview-ready leads", "Licensing review count"],
    contentPlan: ["How To Start In Insurance Sales", "What Support New Agents Need", "Licensed Agent Mentorship Post"]
  }
};

const fallbackComplianceFeed = {
  lastChecked: "Pending Scheduled Check",
  summary: {
    status: "Ready",
    note: "The monitor watches life insurance advertising, lead-generation consent, social media communications, producer licensing, and telemarketing guidance."
  },
  recommendations: [
    "Use separate acquisition pages for insurance customers and sales agent recruiting so each form has clear intent and consent.",
    "Keep system-generated outreach behind human approval before sending messages, booking calls, or confirming next steps.",
    "Avoid guarantees, exaggerated claims, misleading role titles, or product-specific advice in public acquisition content.",
    "Keep proof of consent, source, timestamp, and campaign context for every lead routed to calling, texting, or email follow-up."
  ],
  sources: [
    { name: "NAIC Life Insurance Advertising", authority: "NAIC", status: "Watched", matchedTopics: ["life insurance advertising", "misleading claims", "guarantees"], url: "https://content.naic.org/es/node/5321", snippet: "Model guidance for life insurance and annuity advertising." },
    { name: "NAIC Producer Licensing", authority: "NAIC", status: "Watched", matchedTopics: ["producer licensing", "sales and marketing"], url: "https://content.naic.org/insurance-topics/producer-licensing", snippet: "Producer licensing and state oversight context." },
    { name: "FINRA Social Media", authority: "FINRA", status: "Watched", matchedTopics: ["social media", "balanced communications", "approval"], url: "https://www.finra.org/rules-guidance/key-topics/social-media", snippet: "Communications must follow rules regardless of medium." },
    { name: "FTC Telemarketing Sales Rule", authority: "FTC", status: "Watched", matchedTopics: ["telemarketing", "lead generators", "permission"], url: "https://www.ftc.gov/business-guidance/resources/complying-telemarketing-sales-rule", snippet: "Telemarketing and seller permission guidance." },
    { name: "FCC TCPA Lead Generation", authority: "FCC", status: "Watched", matchedTopics: ["consent", "robocalls", "robotexts"], url: "https://www.federalregister.gov/documents/2024/01/26/2023-28832/targeting-and-eliminating-unlawful-text-messages-implementation-of-the-telephone-consumer-protection", snippet: "Lead-generation consent and TCPA-related updates." }
  ]
};

function showView(id) {
  if (!validViewIds.has(id)) return;
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === id));
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === id));
  document.querySelector(".sidebar")?.classList.remove("menu-open");
  document.querySelector(".menu-toggle")?.setAttribute("aria-expanded", "false");
  if (id === "social" && !hasConnectedSocialAccounts() && !skipAccountPromptOnce) showAccountPrompt();
  skipAccountPromptOnce = false;
}

function requestedView() {
  const params = new URLSearchParams(window.location.search);
  return params.get("presentationView") || params.get("slide") || params.get("view") || params.get("presentation");
}

function leadTypeLabel(type) {
  return type === "customer" ? "Insurance Customer" : "Sales Agent";
}

function defaultFollowUpDate(index = 0) {
  const date = new Date();
  date.setDate(date.getDate() + index + 1);
  return date.toISOString().slice(0, 10);
}

function ensureLeadSchedule(lead, index = 0) {
  if (!lead.followUpDate) lead.followUpDate = defaultFollowUpDate(index);
  if (!lead.followUpTime) lead.followUpTime = lead.type === "customer" ? "10:00" : "14:00";
  if (!lead.outcome) {
    lead.outcome = lead.status === "Approved"
      ? (lead.type === "customer" ? "Callback Scheduled" : "Interview Scheduled")
      : lead.status;
  }
  if (!lead.note) lead.note = lead.nextStep || "Review next step before outreach.";
  return lead;
}

function formatScheduleDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return { day: "--", month: "Date" };
  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: date.toLocaleDateString(undefined, { month: "short" })
  };
}

function leadStageGroup(lead) {
  if (lead.status === "Needs Approval") return "Needs Approval";
  if (lead.status === "Rejected") return "Rejected";
  return lead.stage;
}

function selectedMessages() {
  return state.simType === "customer" ? customerMessages : recruitMessages;
}

function suggestedName(type) {
  const customerNames = ["Jordan Rivera", "Camille Wright", "Noah Patel", "Sofia Bennett"];
  const recruitNames = ["Marcus Reed", "Taylor Brooks", "Nina Alvarez", "Devon Carter"];
  const names = type === "customer" ? customerNames : recruitNames;
  return names[Math.floor(Math.random() * names.length)];
}

function qualifyLead(type, message) {
  const text = message.toLowerCase();
  const customerSignals = ["family", "home", "mortgage", "kids", "coverage", "business", "life insurance"];
  const recruitSignals = ["agent", "licensed", "licensing", "sales", "career", "agency", "part time", "mentorship"];
  const signals = type === "customer" ? customerSignals : recruitSignals;
  const matches = signals.filter((signal) => text.includes(signal)).length;
  const score = Math.min(98, 62 + matches * 8 + Math.floor(Math.random() * 9));
  const summary = type === "customer"
    ? "Potential insurance customer with a clear protection question and follow-up intent."
    : "Potential sales agent prospect with interest in licensing, support, or agency opportunity.";
  const nextStep = type === "customer"
    ? "Approve a consultation invitation and route to customer follow-up."
    : "Approve a recruiting intro and route to the agent opportunity pipeline.";
  const aiDraft = type === "customer"
    ? "Thanks for reaching out. The team can help you understand your options in a short protection review."
    : "Thanks for your interest. The team can explain the opportunity, licensing steps, and next conversation.";
  return { score, summary, nextStep, aiDraft };
}

function createLead(type, message, name = suggestedName(type), source = "") {
  const qualified = qualifyLead(type, message);
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    type,
    name,
    source: source || (type === "customer" ? "Customer Acquisition Campaign" : "Agent Recruiting Campaign"),
    message,
    status: "Needs Approval",
    stage: "Intake Qualified",
    ...qualified
  };
}

function setSimType(type) {
  state.simType = type;
  document.querySelectorAll("[data-sim-type]").forEach((button) => {
    button.classList.toggle("active", button.dataset.simType === type);
  });
  const sample = selectedMessages()[0];
  document.querySelector("#lead-message").value = sample;
  renderChat(sample);
  renderAiSummary(null);
}

function renderChat(message = document.querySelector("#lead-message")?.value || "") {
  const channel = state.simType === "customer" ? "Customer Lead" : "Recruiting Lead";
  document.querySelector("#chat-window").innerHTML = `
    <div class="chat-message inbound">
      <span>${channel}</span>
      <p>${escapeHTML(message)}</p>
    </div>
    <div class="chat-message outbound">
      <span>Intake Assistant</span>
      <p>I can qualify this lead, identify the correct stream, and prepare a next step for approval.</p>
    </div>
  `;
}

function renderAiSummary(lead) {
  const panel = document.querySelector("#intake-summary");
  if (!lead) {
    panel.innerHTML = `
      <p class="eyebrow">Intake Output</p>
      <h3>Ready To Qualify</h3>
      <p>Choose a lead type and send a connected ad response, form fill, comment, reply, or click signal into intake for scoring and approval.</p>
    `;
    return;
  }
  panel.innerHTML = `
    <p class="eyebrow">${leadTypeLabel(lead.type)}</p>
    <h3>${escapeHTML(lead.name)}</h3>
    <div class="score-ring">${lead.score}</div>
    <p><strong>Lead Summary:</strong> ${escapeHTML(lead.summary)}</p>
    <p><strong>Recommended Next Step:</strong> ${escapeHTML(lead.nextStep)}</p>
    <div class="draft-box">${escapeHTML(lead.aiDraft)}</div>
    <button type="button" data-open="approval">Review In Approval Queue</button>
  `;
}

function renderMetrics() {
  const customerCount = state.leads.filter((lead) => lead.type === "customer").length;
  const agentCount = state.leads.filter((lead) => lead.type === "recruit").length;
  const approvalCount = state.leads.filter((lead) => lead.status === "Needs Approval").length;
  const approvedCount = state.leads.filter((lead) => lead.status === "Approved").length;
  document.querySelector("#metric-customers").textContent = customerCount;
  document.querySelector("#metric-agents").textContent = agentCount;
  document.querySelector("#metric-approval").textContent = approvalCount;
  document.querySelector("#metric-approved").textContent = approvedCount;
  document.querySelector("#total-leads").textContent = state.leads.length;
}

function renderApprovalQueue() {
  const pending = state.leads.filter((lead) => lead.status === "Needs Approval");
  const container = document.querySelector("#approval-grid");
  if (!pending.length) {
    container.innerHTML = `<article class="empty-state"><h3>No Leads Waiting</h3><p>Scan buyer or agent interest to pull captured clicks, form fills, and replies into the approval queue.</p></article>`;
    return;
  }
  container.innerHTML = pending.map((lead) => `
    <article class="approval-card" data-lead-id="${lead.id}">
      <div class="card-topline">
        <span>${leadTypeLabel(lead.type)}</span>
        <strong>${lead.score}</strong>
      </div>
      <h3>${escapeHTML(lead.name)}</h3>
      <p>${escapeHTML(lead.summary)}</p>
      <div class="draft-box">${escapeHTML(lead.aiDraft)}</div>
      <small>${escapeHTML(lead.nextStep)}</small>
      <div class="button-row">
        <button type="button" data-approve="${lead.id}">Approve</button>
        <button class="secondary" type="button" data-reject="${lead.id}">Reject</button>
      </div>
    </article>
  `).join("");
}

function renderPipeline() {
  const customerStages = ["Callback Ready", "Consultation Booked", "Quoted", "Policy Opportunity"];
  const recruitStages = ["Interview Ready", "Licensing Review", "Contracting", "Agent Opportunity"];
  const isCustomer = state.selectedLeadManagerType === "customer";
  const type = isCustomer ? "customer" : "recruit";
  const stages = isCustomer ? customerStages : recruitStages;
  const leadCount = state.leads.filter((lead) => lead.type === type).length;
  const approvedCount = state.leads.filter((lead) => lead.type === type && lead.status === "Approved").length;
  document.querySelectorAll("[data-lead-manager-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.leadManagerTab === state.selectedLeadManagerType);
  });
  document.querySelector("#lead-manager-head").innerHTML = `
    <div>
      <p class="eyebrow">${isCustomer ? "Customers / Clients" : "Sales Agents"}</p>
      <h3>${isCustomer ? "Insurance Customer Follow-Up" : "Recruiting Follow-Up"}</h3>
    </div>
    <div class="lead-manager-stats">
      <span>${leadCount} Total</span>
      <span>${approvedCount} Approved</span>
    </div>
  `;
  let overview = document.querySelector("#lead-manager-overview");
  if (!overview) {
    overview = document.createElement("div");
    overview.className = "lead-manager-overview";
    overview.id = "lead-manager-overview";
    document.querySelector("#lead-manager-pipeline")?.before(overview);
  }
  overview.innerHTML = renderLeadManagerOverview(type);
  document.querySelector("#lead-manager-pipeline").innerHTML = renderStageColumns(type, stages);
}

function renderSchedule() {
  state.leads.forEach((lead, index) => ensureLeadSchedule(lead, index));
  if (!state.leads.some((lead) => lead.id === state.selectedScheduleId)) {
    state.selectedScheduleId = state.leads[0]?.id || null;
  }
  const selected = state.leads.find((lead) => lead.id === state.selectedScheduleId) || state.leads[0];
  const sortedLeads = [...state.leads].sort((a, b) => {
    const aTime = `${a.followUpDate || ""} ${a.followUpTime || ""}`;
    const bTime = `${b.followUpDate || ""} ${b.followUpTime || ""}`;
    return aTime.localeCompare(bTime);
  });

  document.querySelector("#schedule-list").innerHTML = sortedLeads.map((lead) => {
    const date = formatScheduleDate(lead.followUpDate);
    return `
      <button class="schedule-card ${lead.id === state.selectedScheduleId ? "active" : ""}" type="button" data-schedule-lead="${lead.id}">
        <span class="schedule-date-chip"><span>${date.month}</span>${date.day}</span>
        <span>
          <strong>${escapeHTML(lead.name)}</strong>
          <p>${leadTypeLabel(lead.type)} · ${lead.followUpTime || "Set time"}</p>
          <small>${escapeHTML(lead.outcome || lead.status)}</small>
        </span>
      </button>
    `;
  }).join("");

  const leadSelect = document.querySelector("#schedule-lead");
  leadSelect.innerHTML = state.leads.map((lead) => `<option value="${lead.id}">${escapeHTML(lead.name)} · ${leadTypeLabel(lead.type)}</option>`).join("");

  if (selected) {
    leadSelect.value = String(selected.id);
    document.querySelector("#schedule-date").value = selected.followUpDate || "";
    document.querySelector("#schedule-time").value = selected.followUpTime || "";
    document.querySelector("#schedule-outcome").value = selected.outcome || selected.status;
    document.querySelector("#schedule-note").value = selected.note || "";
  }
}

function renderLeadManagerOverview(type) {
  const content = leadManagerContent[type];
  const leads = state.leads.filter((lead) => lead.type === type);
  const pending = leads.filter((lead) => lead.status === "Needs Approval").length;
  const approved = leads.filter((lead) => lead.status === "Approved").length;
  const avgScore = Math.round(leads.reduce((sum, lead) => sum + lead.score, 0) / Math.max(leads.length, 1));
  return `
    <article class="manager-module manager-status">
      <span>Status</span>
      <strong>${leads.length} Leads</strong>
      <p>${escapeHTML(content.status)}</p>
      <div class="mini-stats">
        <span>${pending} Pending</span>
        <span>${approved} Approved</span>
        <span>${avgScore} Avg Score</span>
      </div>
    </article>
    <article class="manager-module">
      <span>Flow</span>
      <ol>${content.flow.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ol>
    </article>
    <article class="manager-module">
      <span>Follow-Up</span>
      <ul>${content.followUp.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
    </article>
    <article class="manager-module">
      <span>Links</span>
      <ul>${content.links.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
    </article>
    <article class="manager-module">
      <span>Reporting</span>
      <ul>${content.reporting.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
    </article>
    <article class="manager-module">
      <span>Content Plan</span>
      <ul>${content.contentPlan.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
    </article>
  `;
}

function renderStageColumns(type, stages) {
  return stages.map((stage) => {
    const cards = state.leads
      .filter((lead) => lead.type === type && lead.status === "Approved" && leadStageGroup(lead) === stage)
      .map((lead) => `
        <article class="lead-card">
          <strong>${escapeHTML(lead.name)}</strong>
          <p>${escapeHTML(lead.summary)}</p>
          <small>${escapeHTML(lead.source)}</small>
        </article>
      `).join("");
    return `<section class="pipeline-column"><h4>${stage}</h4>${cards || "<p class='fineprint'>No leads in this stage.</p>"}</section>`;
  }).join("");
}

function renderReport() {
  const pending = state.leads.filter((lead) => lead.status === "Needs Approval").length;
  const approved = state.leads.filter((lead) => lead.status === "Approved").length;
  const rejected = state.leads.filter((lead) => lead.status === "Rejected").length;
  const avgScore = Math.round(state.leads.reduce((sum, lead) => sum + lead.score, 0) / Math.max(state.leads.length, 1));
  document.querySelector("#score-grid").innerHTML = [
    ["Total Captured", state.leads.length, "Across customer and recruiting streams"],
    ["Average Fit Score", avgScore, "Fit score across all leads"],
    ["Pending Approval", pending, "Waiting for human review"],
    ["Approved Leads", approved, "Ready for next-step routing"]
  ].map(([label, value, note]) => `<article class="score-card"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join("");
  const rows = [
    ["Captured", state.leads.length],
    ["Intake Qualified", state.leads.filter((lead) => lead.score >= 75).length],
    ["Approved", approved],
    ["Rejected", rejected]
  ];
  const max = Math.max(rows[0][1], 1);
  document.querySelector("#funnel").innerHTML = rows.map(([label, value]) => `
    <div class="funnel-row">
      <strong>${label}</strong>
      <div class="bar" style="width:${Math.max((value / max) * 100, 8)}%"></div>
      <span>${value}</span>
    </div>
  `).join("");
}

function renderSocialHub() {
  const accounts = Object.entries(socialAccounts);
  const selected = socialAccounts[state.selectedSocial] || socialAccounts.facebook;
  const totals = accounts.reduce((sum, [, account]) => ({
    views: sum.views + account.views,
    engagements: sum.engagements + account.engagements,
    clicks: sum.clicks + account.clicks,
    leads: sum.leads + account.leads,
    customerLeads: sum.customerLeads + account.customerLeads,
    agentLeads: sum.agentLeads + account.agentLeads
  }), { views: 0, engagements: 0, clicks: 0, leads: 0, customerLeads: 0, agentLeads: 0 });

  document.querySelector("#connected-accounts").innerHTML = `
    <article class="social-total">
      <p class="eyebrow">Unified Social Intake</p>
      <h3>${totals.leads} Leads Attributed</h3>
      <p>Customer and recruiting leads from connected social media activity.</p>
    </article>
    ${accounts.map(([id, account]) => `
      <button class="account-card ${id === state.selectedSocial ? "active" : ""}" type="button" data-social-account="${id}">
        <span>${escapeHTML(account.label)}</span>
        <strong>${escapeHTML(account.handle)}</strong>
        <small>${escapeHTML(account.status)}</small>
      </button>
    `).join("")}
  `;

  document.querySelector("#social-tabs").innerHTML = accounts.map(([id, account]) => `
    <button class="${id === state.selectedSocial ? "active" : ""}" type="button" data-social-tab="${id}">${escapeHTML(account.label)}</button>
  `).join("");

  const engagementRate = ((selected.engagements / Math.max(selected.views, 1)) * 100).toFixed(1);
  const clickRate = ((selected.clicks / Math.max(selected.views, 1)) * 100).toFixed(1);
  document.querySelector("#social-overview").innerHTML = `
    <div class="social-heading">
      <div>
        <p class="eyebrow">${escapeHTML(selected.label)}</p>
        <h3>${escapeHTML(selected.handle)}</h3>
      </div>
      <span>${escapeHTML(selected.audience)}</span>
    </div>
    <div class="social-stat-grid">
      <article><span>Post Views</span><strong>${selected.views.toLocaleString()}</strong></article>
      <article><span>Engagements</span><strong>${selected.engagements.toLocaleString()}</strong></article>
      <article><span>Link Clicks</span><strong>${selected.clicks.toLocaleString()}</strong></article>
      <article><span>Leads Captured</span><strong>${selected.leads}</strong></article>
    </div>
    <div class="social-bars">
      <div><span>Engagement Rate</span><div class="social-bar"><i style="width:${Math.min(Number(engagementRate) * 8, 100)}%"></i></div><strong>${engagementRate}%</strong></div>
      <div><span>Click Rate</span><div class="social-bar"><i style="width:${Math.min(Number(clickRate) * 24, 100)}%"></i></div><strong>${clickRate}%</strong></div>
      <div><span>Customer Leads</span><div class="social-bar"><i style="width:${(selected.customerLeads / Math.max(selected.leads, 1)) * 100}%"></i></div><strong>${selected.customerLeads}</strong></div>
      <div><span>Agent Leads</span><div class="social-bar"><i style="width:${(selected.agentLeads / Math.max(selected.leads, 1)) * 100}%"></i></div><strong>${selected.agentLeads}</strong></div>
    </div>
    <div class="social-recommendation">
      <strong>Top Content: ${escapeHTML(selected.topPost)}</strong>
      <p>${escapeHTML(selected.recommendation)}</p>
    </div>
  `;
}

function hasConnectedSocialAccounts() {
  return Object.values(socialAccounts).some((account) => account.status === "Connected");
}

function connectedSocialEntries() {
  return Object.entries(socialAccounts).filter(([, account]) => account.status === "Connected");
}

function defaultPostSet() {
  const form = document.querySelector("#content-form");
  const data = form ? new FormData(form) : new FormData();
  const goal = data.get("goal") || "customer";
  const topic = String(data.get("topic") || (goal === "customer" ? "Family protection review" : "Insurance sales opportunity")).trim();
  const cta = String(data.get("cta") || (goal === "customer" ? "Request a short review" : "Request recruiting details")).trim();
  const isCustomer = goal === "customer";
  const leadPath = isCustomer ? "customer-page" : "recruit-page";
  return connectedSocialEntries().map(([id, account]) => {
    const isLinkedIn = id === "linkedin";
    const hook = isCustomer
      ? `Families often wait until a major life change to review coverage. ${topic} gives them a simple starting point.`
      : `${topic} can help sales-minded people understand whether life insurance fits their goals, schedule, and support needs.`;
    const body = isLinkedIn
      ? `${hook}\n\nWhat the team can do next: answer the first questions, collect intent, and route interested people into a reviewed follow-up process.\n\n${cta}: ${window.location.origin}${window.location.pathname}?view=${leadPath}`
      : `${hook}\n\n${cta}: ${window.location.origin}${window.location.pathname}?view=${leadPath}`;
    return {
      id,
      label: account.label,
      handle: account.handle,
      goal,
      topic,
      body
    };
  });
}

function renderPublisherAccounts() {
  const container = document.querySelector("#publisher-accounts");
  if (!container) return;
  const accounts = connectedSocialEntries();
  if (!accounts.length) {
    container.innerHTML = `<p class="fineprint">No social accounts are enrolled yet. Connect campaign accounts before publishing.</p>`;
    return;
  }
  container.innerHTML = accounts.map(([id, account]) => `
    <label>
      <input type="checkbox" name="accounts" value="${id}" checked />
      <span>${escapeHTML(account.label)}</span>
      <small>${escapeHTML(account.handle)}</small>
    </label>
  `).join("");
}

function renderPostPreviews() {
  const container = document.querySelector("#post-preview-list");
  if (!container) return;
  const posts = state.generatedPosts.length ? state.generatedPosts : defaultPostSet();
  state.generatedPosts = posts;
  if (!posts.length) {
    container.innerHTML = `<article class="empty-state"><h3>No Accounts Selected</h3><p>Connect social accounts to generate post previews.</p></article>`;
    return;
  }
  container.innerHTML = posts.map((post) => `
    <article class="post-preview-card" data-post-account="${escapeHTML(post.id)}">
      <div class="card-topline">
        <span>${escapeHTML(post.label)}</span>
        <strong>${escapeHTML(post.goal === "customer" ? "Buyer Leads" : "Recruiting")}</strong>
      </div>
      <p>${escapeHTML(post.body)}</p>
    </article>
  `).join("");
}

function renderPostingLog() {
  const container = document.querySelector("#posting-log");
  if (!container) return;
  if (!state.postingLog.length) {
    container.innerHTML = `<p class="fineprint">Generated posts will appear here after they are queued or published.</p>`;
    return;
  }
  container.innerHTML = state.postingLog.map((item) => `
    <article>
      <span>${escapeHTML(item.status)}</span>
      <strong>${escapeHTML(item.account)}</strong>
      <p>${escapeHTML(item.summary)}</p>
      <small>${escapeHTML(item.time)}</small>
    </article>
  `).join("");
}

function renderContentStudio() {
  renderPublisherAccounts();
  renderPostPreviews();
  renderPostingLog();
}

function selectedPublisherAccounts() {
  return Array.from(document.querySelectorAll("#publisher-accounts input[name='accounts']:checked")).map((input) => input.value);
}

function submitGeneratedPosts(status) {
  if (!hasConnectedSocialAccounts()) {
    showAccountPrompt();
    return;
  }
  if (!state.generatedPosts.length) state.generatedPosts = defaultPostSet();
  const selected = new Set(selectedPublisherAccounts());
  const posts = state.generatedPosts.filter((post) => selected.has(post.id));
  if (!posts.length) {
    state.postingLog.unshift({
      status: "Needs Account Selection",
      account: "No account selected",
      summary: "Select at least one enrolled account before publishing or queuing content.",
      time: new Date().toLocaleString()
    });
    renderPostingLog();
    return;
  }
  posts.forEach((post) => {
    state.postingLog.unshift({
      status,
      account: post.label,
      summary: `${post.topic} post prepared for ${post.goal === "customer" ? "insurance buyers" : "agent recruiting"}.`,
      time: new Date().toLocaleString()
    });
    const account = socialAccounts[post.id];
    if (status === "Published" && account) {
      account.views += Math.floor(Math.random() * 240) + 60;
      account.engagements += Math.floor(Math.random() * 30) + 6;
      account.clicks += Math.floor(Math.random() * 10) + 2;
    }
  });
  renderPostingLog();
  renderSocialHub();
}

function showAccountPrompt() {
  const prompt = document.querySelector("#account-prompt");
  if (!prompt) return;
  prompt.hidden = false;
  document.body.classList.add("modal-open");
  document.querySelector("#account-prompt-dismiss")?.focus();
}

function hideAccountPrompt() {
  const prompt = document.querySelector("#account-prompt");
  if (!prompt) return;
  prompt.hidden = true;
  document.body.classList.remove("modal-open");
}

function renderComplianceWatch() {
  const feed = state.complianceFeed || fallbackComplianceFeed;
  document.querySelector("#compliance-summary").innerHTML = `
    <p class="eyebrow">Last Checked</p>
    <h3>${escapeHTML(feed.lastChecked)}</h3>
    <p>${escapeHTML(feed.summary?.note || "Monitoring acquisition and compliance sources for updates.")}</p>
    <div class="recommendation-list">
      ${(feed.recommendations || []).map((item) => `<article><span>Review</span><p>${escapeHTML(item)}</p></article>`).join("")}
    </div>
  `;
  document.querySelector("#compliance-sources").innerHTML = (feed.sources || []).map((source) => `
    <article class="source-card">
      <div class="card-topline">
        <span>${escapeHTML(source.authority || "Source")}</span>
        <strong>${escapeHTML(source.status || "Watched")}</strong>
      </div>
      <h4>${escapeHTML(source.name)}</h4>
      <p>${escapeHTML(source.snippet || "Source monitored for relevant acquisition guidance.")}</p>
      <div class="topic-list">
        ${(source.matchedTopics || []).slice(0, 4).map((topic) => `<span>${escapeHTML(topic)}</span>`).join("")}
      </div>
      <a href="${safeExternalUrl(source.url)}" target="_blank" rel="noopener noreferrer">Open Source</a>
    </article>
  `).join("");
}

async function loadComplianceWatch() {
  try {
    const response = await fetch("data/compliance-watch.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Watchlist unavailable: ${response.status}`);
    state.complianceFeed = await response.json();
  } catch {
    state.complianceFeed = fallbackComplianceFeed;
  }
  renderComplianceWatch();
}

function renderCampaign() {
  const form = new FormData(document.querySelector("#campaign-form"));
  const stream = form.get("stream");
  const audience = form.get("audience");
  const offer = form.get("offer");
  const base = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, "/")}`;
  const url = `${base}?stream=${encodeURIComponent(stream)}&audience=${encodeURIComponent(audience.toLowerCase().replaceAll(" ", "-"))}`;
  const copy = stream === "customer"
    ? `Campaign: ${offer}\n\nAudience: ${audience}\n\nMessage: If protecting your family, home, or business has been on your mind, this short review helps you understand your options before choosing a policy.\n\nLead Link: ${url}\n\nAutomation: Guided intake asks the first questions, scores the lead, and sends qualified conversations to approval.`
    : `Campaign: ${offer}\n\nAudience: ${audience}\n\nMessage: Curious about life insurance sales or joining a supportive agency? Start with a short fit conversation and learn the next steps.\n\nLead Link: ${url}\n\nAutomation: Guided intake screens interest, licensing status, and experience before routing to approval.`;
  document.querySelector("#generated-url").textContent = url;
  document.querySelector("#campaign-copy").value = copy;
}

function approveLead(id) {
  const lead = state.leads.find((item) => item.id === id);
  if (!lead) return;
  lead.status = "Approved";
  lead.stage = lead.type === "customer" ? "Callback Ready" : "Interview Ready";
  refresh();
}

function rejectLead(id) {
  const lead = state.leads.find((item) => item.id === id);
  if (!lead) return;
  lead.status = "Rejected";
  lead.stage = "Rejected";
  refresh();
}

function seedLead(type) {
  const messages = type === "customer" ? customerMessages : recruitMessages;
  const message = messages[Math.floor(Math.random() * messages.length)];
  const lead = createLead(type, message);
  state.leads.unshift(lead);
  state.selectedLeadId = lead.id;
  renderChat(message);
  renderAiSummary(lead);
  refresh();
  return lead;
}

function refresh() {
  renderMetrics();
  renderSocialHub();
  renderContentStudio();
  renderComplianceWatch();
  renderApprovalQueue();
  renderPipeline();
  renderSchedule();
  renderReport();
}

function setBrandPhoto(dataUrl) {
  const brandMark = document.querySelector("#brand-mark");
  const brandPhoto = document.querySelector("#brand-photo");
  if (!brandMark || !brandPhoto) return;
  brandPhoto.src = dataUrl || defaultProfilePhoto;
  brandMark.classList.add("has-photo");
}

function setProfileName(name) {
  const nextName = name.trim() || defaultProfileName;
  const display = document.querySelector("#profile-display-name");
  const input = document.querySelector("#profile-name-input");
  const initials = document.querySelector("#brand-initials");
  if (display) display.textContent = nextName;
  if (input) input.value = nextName;
  if (initials) {
    initials.textContent = nextName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "SM";
  }
}

function setReducedMotionPreference(enabled) {
  document.body.classList.toggle("reduce-motion", enabled);
  const toggle = document.querySelector("#compact-motion-toggle");
  if (toggle) toggle.checked = enabled;
  if (enabled) {
    document.documentElement.style.setProperty("--parallax-x", "0px");
    document.documentElement.style.setProperty("--parallax-y", "0px");
  }
}

function setThemePreference(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-mode", isDark);
  const toggle = document.querySelector("#theme-toggle");
  if (toggle) {
    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.querySelector("span").textContent = isDark ? "☀" : "☾";
  }
}

function setSidebarWidth(width) {
  const nextWidth = Math.min(Math.max(width, 280), 460);
  document.documentElement.style.setProperty("--sidebar-width", `${nextWidth}px`);
  return nextWidth;
}

function restoreSidebarWidth() {
  try {
    const savedWidth = Number(localStorage.getItem(sidebarWidthKey));
    if (savedWidth) setSidebarWidth(savedWidth);
  } catch {
    // Resizing still works for the current session when storage is unavailable.
  }
}

function initMotionReveal() {
  const revealItems = document.querySelectorAll(".metric-link, .schedule-card, .account-card, .nav-item, .feature-focus");
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  revealItems.forEach((item) => item.classList.add("motion-reveal"));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  revealItems.forEach((item) => observer.observe(item));
}

function initAmbientParallax() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let frame = 0;
  let nextX = 0;
  let nextY = 0;
  const setParallax = () => {
    document.documentElement.style.setProperty("--parallax-x", `${nextX.toFixed(2)}px`);
    document.documentElement.style.setProperty("--parallax-y", `${nextY.toFixed(2)}px`);
    frame = 0;
  };
  window.addEventListener("pointermove", (event) => {
    if (document.body.classList.contains("reduce-motion")) return;
    nextX = ((event.clientX / Math.max(window.innerWidth, 1)) - 0.5) * 34;
    nextY = ((event.clientY / Math.max(window.innerHeight, 1)) - 0.5) * 34;
    if (!frame) frame = requestAnimationFrame(setParallax);
  }, { passive: true });
  window.addEventListener("pointerleave", () => {
    nextX = 0;
    nextY = 0;
    if (!frame) frame = requestAnimationFrame(setParallax);
  });
}

const quickstartSteps = [
  {
    view: "overview",
    selector: ".topbar",
    title: "Start With The Command Center",
    copy: "This top area explains the system's purpose and shows the live total of buyer and recruiting leads in the workspace."
  },
  {
    view: "overview",
    selector: ".hero-grid",
    title: "Choose A Lead Stream",
    copy: "Use the two stream cards to scan buyer interest or agent recruiting interest. Each stream stays separate from the first click."
  },
  {
    view: "overview",
    selector: ".metric-grid",
    title: "Open Stored Leads Quickly",
    copy: "These cards are clickable shortcuts. They take users directly to the matching lead records, approval queue, or schedule."
  },
  {
    view: "agent",
    selector: "#chat-form",
    title: "Send Interest To Intake",
    copy: "Lead Intake receives real campaign signals from connected social and ad accounts, then turns clicks, forms, comments, and replies into scored records."
  },
  {
    view: "approval",
    selector: "#approval-grid",
    title: "Review Before Action",
    copy: "The Approval Queue is where a person approves or rejects the system's recommendation before outreach or scheduling."
  },
  {
    view: "pipeline",
    selector: ".lead-manager-panel",
    title: "Manage Buyers And Agent Candidates",
    copy: "Lead Manager separates customers from sales agents, including their stage, follow-up flow, campaign links, reporting, and content plan."
  },
  {
    view: "social",
    selector: ".content-studio",
    title: "Create And Queue Social Content",
    copy: "Social Hub can generate post sets, select enrolled accounts, and queue or publish content once campaign accounts are connected."
  },
  {
    view: "schedule",
    selector: ".schedule-panel",
    title: "Schedule Follow-Up",
    copy: "Use the schedule panel to pick a lead, set the date and time, add notes, and choose the next outcome."
  }
];

let quickstartIndex = 0;

function positionQuickstartStep() {
  const helper = document.querySelector("#quickstart-helper");
  if (!helper || helper.hidden) return;
  const step = quickstartSteps[quickstartIndex];
  const target = document.querySelector(step.selector);
  const focus = document.querySelector("#quickstart-focus");
  const popover = document.querySelector("#quickstart-popover");
  if (!target || !focus || !popover) return;

  const targetRect = target.getBoundingClientRect();
  const pad = 10;
  const focusLeft = Math.max(8, targetRect.left - pad);
  const focusTop = Math.max(8, targetRect.top - pad);
  const focusWidth = Math.min(window.innerWidth - focusLeft - 8, targetRect.width + pad * 2);
  const focusHeight = Math.min(window.innerHeight - focusTop - 8, targetRect.height + pad * 2);
  focus.style.left = `${focusLeft}px`;
  focus.style.top = `${focusTop}px`;
  focus.style.width = `${focusWidth}px`;
  focus.style.height = `${focusHeight}px`;

  const popoverRect = popover.getBoundingClientRect();
  const spaceBelow = window.innerHeight - targetRect.bottom;
  const preferredTop = spaceBelow > popoverRect.height + 28 ? targetRect.bottom + 18 : targetRect.top - popoverRect.height - 18;
  const top = Math.max(16, Math.min(preferredTop, window.innerHeight - popoverRect.height - 16));
  const left = Math.max(16, Math.min(targetRect.left, window.innerWidth - popoverRect.width - 16));
  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}

function renderQuickstartStep() {
  const step = quickstartSteps[quickstartIndex];
  if (step.view === "social") skipAccountPromptOnce = true;
  showView(step.view);
  document.querySelector("#quickstart-step").textContent = `Step ${quickstartIndex + 1} Of ${quickstartSteps.length}`;
  document.querySelector("#quickstart-title").textContent = step.title;
  document.querySelector("#quickstart-copy").textContent = step.copy;
  document.querySelector("#quickstart-prev").disabled = quickstartIndex === 0;
  document.querySelector("#quickstart-next").textContent = quickstartIndex === quickstartSteps.length - 1 ? "Finish" : "Next";
  requestAnimationFrame(positionQuickstartStep);
}

function startQuickstart() {
  const helper = document.querySelector("#quickstart-helper");
  if (!helper) return;
  quickstartIndex = 0;
  helper.hidden = false;
  renderQuickstartStep();
}

function closeQuickstart() {
  const helper = document.querySelector("#quickstart-helper");
  if (helper) helper.hidden = true;
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

document.querySelectorAll("button[data-view]:not(.nav-item)").forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

document.querySelectorAll("[data-metric-view]").forEach((card) => {
  const openMetricTarget = () => {
    if (card.dataset.leadType) state.selectedLeadManagerType = card.dataset.leadType;
    showView(card.dataset.metricView);
    refresh();
  };
  card.addEventListener("click", openMetricTarget);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMetricTarget();
    }
  });
});

document.querySelector(".menu-toggle")?.addEventListener("click", () => {
  const sidebar = document.querySelector(".sidebar");
  const isOpen = !sidebar.classList.contains("menu-open");
  sidebar.classList.toggle("menu-open", isOpen);
  document.querySelector(".menu-toggle").setAttribute("aria-expanded", String(isOpen));
});

document.querySelector("#guide-launch")?.addEventListener("click", startQuickstart);
document.querySelector("#quickstart-skip")?.addEventListener("click", closeQuickstart);
document.querySelector("#quickstart-backdrop")?.addEventListener("click", closeQuickstart);
document.querySelector("#quickstart-prev")?.addEventListener("click", () => {
  quickstartIndex = Math.max(0, quickstartIndex - 1);
  renderQuickstartStep();
});
document.querySelector("#quickstart-next")?.addEventListener("click", () => {
  if (quickstartIndex >= quickstartSteps.length - 1) {
    closeQuickstart();
    return;
  }
  quickstartIndex += 1;
  renderQuickstartStep();
});
window.addEventListener("resize", positionQuickstartStep);
window.addEventListener("scroll", positionQuickstartStep, { passive: true });

document.querySelector("#sidebar-resizer")?.addEventListener("pointerdown", (event) => {
  if (window.matchMedia("(max-width: 1100px)").matches) return;
  event.preventDefault();
  const resizer = event.currentTarget;
  resizer.setPointerCapture(event.pointerId);
  document.body.classList.add("sidebar-resizing");

  const onPointerMove = (moveEvent) => {
    const width = setSidebarWidth(moveEvent.clientX);
    try {
      localStorage.setItem(sidebarWidthKey, String(width));
    } catch {
      // Width remains applied even if persistence is blocked.
    }
  };

  const onPointerUp = () => {
    document.body.classList.remove("sidebar-resizing");
    resizer.removeEventListener("pointermove", onPointerMove);
    resizer.removeEventListener("pointerup", onPointerUp);
    resizer.removeEventListener("pointercancel", onPointerUp);
  };

  resizer.addEventListener("pointermove", onPointerMove);
  resizer.addEventListener("pointerup", onPointerUp);
  resizer.addEventListener("pointercancel", onPointerUp);
});

document.querySelector("#profile-upload")?.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file || !file.type.startsWith("image/")) return;
  if (file.size > maxProfilePhotoBytes) {
    alert("Please choose an image under 750 KB for the profile portrait.");
    event.target.value = "";
    return;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const dataUrl = String(reader.result || "");
    setBrandPhoto(dataUrl);
    try {
      localStorage.setItem(profilePhotoKey, dataUrl);
    } catch {
      // The preview still works if local storage is unavailable.
    }
  });
  reader.readAsDataURL(file);
});

document.querySelector("#profile-trigger")?.addEventListener("click", (event) => {
  event.stopPropagation();
  const dropdown = document.querySelector("#profile-dropdown");
  const isOpen = !dropdown.classList.contains("open");
  dropdown.classList.toggle("open", isOpen);
  document.querySelector("#profile-trigger").setAttribute("aria-expanded", String(isOpen));
});

document.querySelector("#profile-dropdown")?.addEventListener("click", (event) => {
  event.stopPropagation();
});

document.addEventListener("click", () => {
  const dropdown = document.querySelector("#profile-dropdown");
  if (!dropdown?.classList.contains("open")) return;
  dropdown.classList.remove("open");
  document.querySelector("#profile-trigger")?.setAttribute("aria-expanded", "false");
});

document.querySelector("#profile-name-input")?.addEventListener("input", (event) => {
  setProfileName(event.target.value);
  try {
    localStorage.setItem(profileNameKey, event.target.value.trim());
  } catch {
    // Name still updates for the current session.
  }
});

document.querySelector("#compact-motion-toggle")?.addEventListener("change", (event) => {
  setReducedMotionPreference(event.target.checked);
  try {
    localStorage.setItem(reducedMotionKey, String(event.target.checked));
  } catch {
    // Preference still updates for the current session.
  }
});

document.querySelector("#theme-toggle")?.addEventListener("click", () => {
  const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
  setThemePreference(nextTheme);
  try {
    localStorage.setItem(themeKey, nextTheme);
  } catch {
    // Theme still updates for the current session.
  }
});

document.querySelector("#profile-reset")?.addEventListener("click", () => {
  setBrandPhoto(defaultProfilePhoto);
  setProfileName(defaultProfileName);
  setReducedMotionPreference(false);
  setThemePreference("light");
  try {
    localStorage.removeItem(profilePhotoKey);
    localStorage.removeItem(profileNameKey);
    localStorage.removeItem(reducedMotionKey);
    localStorage.removeItem(themeKey);
  } catch {
    // Reset still applies for the current session.
  }
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open]");
  if (!button) return;
  if (button.dataset.agentType) setSimType(button.dataset.agentType);
  showView(button.dataset.open);
});

document.querySelectorAll("[data-sim-type]").forEach((button) => {
  button.addEventListener("click", () => setSimType(button.dataset.simType));
});

document.querySelector("#schedule-list")?.addEventListener("click", (event) => {
  const card = event.target.closest("[data-schedule-lead]");
  if (!card) return;
  state.selectedScheduleId = Number(card.dataset.scheduleLead);
  renderSchedule();
});

document.querySelector("#schedule-lead")?.addEventListener("change", (event) => {
  state.selectedScheduleId = Number(event.target.value);
  renderSchedule();
});

document.querySelector("#schedule-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const lead = state.leads.find((item) => item.id === state.selectedScheduleId);
  if (!lead) return;
  lead.followUpDate = document.querySelector("#schedule-date").value;
  lead.followUpTime = document.querySelector("#schedule-time").value;
  lead.outcome = document.querySelector("#schedule-outcome").value;
  lead.note = document.querySelector("#schedule-note").value.trim();
  if (["Rejected", "Closed"].includes(lead.outcome)) lead.status = lead.outcome;
  if (["Callback Scheduled", "Consultation Booked", "Interview Scheduled", "Follow-Up Needed"].includes(lead.outcome)) {
    lead.status = "Approved";
    lead.stage = lead.outcome;
  }
  refresh();
});

document.querySelector("#chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const message = document.querySelector("#lead-message").value.trim();
  if (!message) return;
  const lead = createLead(state.simType, message);
  state.leads.unshift(lead);
  state.selectedLeadId = lead.id;
  renderChat(message);
  renderAiSummary(lead);
  refresh();
});

document.querySelectorAll(".public-lead-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const type = form.dataset.publicForm;
    const name = String(data.get("name") || suggestedName(type));
    const concern = String(data.get("concern") || "");
    const message = `${concern}. ${String(data.get("message") || "")}`.trim();
    const source = type === "customer" ? "Insurance Customer Page" : "Recruitment Page";
    const lead = createLead(type, message, name, source);
    state.leads.unshift(lead);
    state.simType = type;
    renderChat(message);
    renderAiSummary(lead);
    refresh();
    showView("approval");
  });
});

document.querySelector("#seed-both").addEventListener("click", () => {
  seedLead("customer");
  seedLead("recruit");
  showView("approval");
});

document.querySelector("#approval-grid").addEventListener("click", (event) => {
  const approve = event.target.closest("[data-approve]");
  const reject = event.target.closest("[data-reject]");
  if (approve) approveLead(Number(approve.dataset.approve));
  if (reject) rejectLead(Number(reject.dataset.reject));
});

document.querySelectorAll("[data-lead-manager-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    state.selectedLeadManagerType = button.dataset.leadManagerTab;
    renderPipeline();
  });
});

document.querySelector("#social").addEventListener("click", (event) => {
  const tab = event.target.closest("[data-social-tab], [data-social-account]");
  if (!tab) return;
  state.selectedSocial = tab.dataset.socialTab || tab.dataset.socialAccount;
  renderSocialHub();
});

document.querySelector("#sync-social").addEventListener("click", () => {
  if (!hasConnectedSocialAccounts()) {
    showAccountPrompt();
    return;
  }
  Object.values(socialAccounts).forEach((account) => {
    account.views += Math.floor(Math.random() * 900) + 120;
    account.engagements += Math.floor(Math.random() * 90) + 12;
    account.clicks += Math.floor(Math.random() * 24) + 3;
    account.leads += Math.floor(Math.random() * 3);
  });
  renderSocialHub();
});

document.querySelector("#generate-social-post")?.addEventListener("click", () => {
  if (!hasConnectedSocialAccounts()) {
    showAccountPrompt();
    return;
  }
  state.generatedPosts = defaultPostSet();
  renderPostPreviews();
});

document.querySelector("#content-form")?.addEventListener("input", () => {
  state.generatedPosts = defaultPostSet();
  renderPostPreviews();
});

document.querySelector("#publish-social-posts")?.addEventListener("click", () => submitGeneratedPosts("Published"));
document.querySelector("#queue-social-posts")?.addEventListener("click", () => submitGeneratedPosts("Queued For Review"));

document.querySelector("#account-prompt-close")?.addEventListener("click", hideAccountPrompt);
document.querySelector("#account-prompt-dismiss")?.addEventListener("click", hideAccountPrompt);
document.querySelector("#account-prompt-primary")?.addEventListener("click", () => {
  hideAccountPrompt();
  skipAccountPromptOnce = true;
  showView("social");
});

document.querySelector("#account-prompt")?.addEventListener("click", (event) => {
  if (event.target.id === "account-prompt") hideAccountPrompt();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideAccountPrompt();
    closeQuickstart();
  }
});

document.querySelector("#refresh-compliance").addEventListener("click", loadComplianceWatch);

document.querySelector("#generate-campaign").addEventListener("click", renderCampaign);
document.querySelector("#campaign-form").addEventListener("input", renderCampaign);

try {
  setBrandPhoto(localStorage.getItem(profilePhotoKey) || defaultProfilePhoto);
  setProfileName(localStorage.getItem(profileNameKey) || defaultProfileName);
  setReducedMotionPreference(localStorage.getItem(reducedMotionKey) === "true");
  setThemePreference(localStorage.getItem(themeKey) || "light");
} catch {
  setBrandPhoto(defaultProfilePhoto);
  setProfileName(defaultProfileName);
  setReducedMotionPreference(false);
  setThemePreference("light");
}

restoreSidebarWidth();
setSimType("customer");
renderCampaign();
refresh();
loadComplianceWatch();
showView(requestedView() || "overview");
initMotionReveal();
initAmbientParallax();
