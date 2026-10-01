const profilePhotoKey = "sharonLeadSystemProfilePhoto";
const validViewIds = new Set(Array.from(document.querySelectorAll(".view")).map((view) => view.id));

const customerMessages = [
  "Hi, I just bought a home and want to understand mortgage protection. I am available after 5 PM.",
  "I have two young kids and need to know how much life insurance makes sense before I choose anything.",
  "I own a small business and want to protect my family if something happens to me."
];

const recruitMessages = [
  "I am interested in becoming a life insurance agent. I am not licensed yet but I want to learn the steps.",
  "I have sales experience and want to know if joining an agency part time is realistic.",
  "I am already licensed and looking for better support, leads, and mentorship."
];

const state = {
  simType: "customer",
  selectedSocial: "facebook",
  selectedLeadManagerType: "customer",
  complianceFeed: null,
  selectedLeadId: 1,
  leads: [
    {
      id: 1,
      type: "customer",
      name: "Maya Chen",
      source: "Mortgage Protection Ad",
      message: "I just bought a house and want to know if mortgage protection is separate from life insurance.",
      score: 91,
      status: "Needs Approval",
      stage: "AI Qualified",
      summary: "Homeowner asking about mortgage protection and life insurance overlap.",
      nextStep: "Approve callback and send booking link for a protection review.",
      aiDraft: "Thanks for reaching out. Sharon can walk through mortgage protection and family coverage options in a short consultation."
    },
    {
      id: 2,
      type: "recruit",
      name: "Andre Brooks",
      source: "Recruiting Landing Page",
      message: "I have sales experience and want to know what it takes to become licensed.",
      score: 84,
      status: "Needs Approval",
      stage: "AI Qualified",
      summary: "Career-change prospect with sales experience and licensing questions.",
      nextStep: "Approve recruiting intro email and invite to a discovery call.",
      aiDraft: "Thanks for your interest. Sharon's team can explain licensing steps, training, and what the agency opportunity looks like."
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
      aiDraft: "Congratulations on the growing family. Sharon can help you review what coverage may fit your needs and budget."
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
      aiDraft: "Thanks for reaching out. Sharon's team can share the support model and schedule a short conversation."
    }
  ]
};

const socialAccounts = {
  facebook: {
    label: "Facebook",
    handle: "Sharon Martin Agency",
    status: "Connected",
    audience: "Local Families",
    views: 18420,
    engagements: 1268,
    clicks: 312,
    leads: 42,
    customerLeads: 34,
    agentLeads: 8,
    topPost: "Mortgage Protection Basics",
    recommendation: "Boost the mortgage protection post and send comment replies into AI intake."
  },
  instagram: {
    label: "Instagram",
    handle: "@sharonprotects",
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
    handle: "Sharon Martin",
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
    handle: "@sharoninsurance",
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
    handle: "Sharon Martin Agency",
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
    flow: ["Social / Search Click", "Customer Page", "AI Intake", "Human Approval", "Callback Or Booking"],
    followUp: ["Approve consultation invite", "Send booking link", "Call within preferred window", "Move qualified buyers to quote review"],
    links: ["Customer Page", "Protection Review Campaign", "Family Coverage Retargeting"],
    reporting: ["Customer lead volume", "Approval rate", "Callback-ready leads", "Policy opportunity count"],
    contentPlan: ["Mortgage Protection Basics", "How Much Coverage Families Consider", "What Happens In A Protection Review"]
  },
  recruit: {
    status: "Recruiting acquisition is focused on people interested in licensing, sales support, mentorship, and joining the agency.",
    flow: ["Recruiting Post / Ad", "Recruitment Page", "AI Screening", "Human Approval", "Interview Or Licensing Review"],
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
    "Keep AI-generated outreach behind human approval before sending messages, booking calls, or confirming next steps.",
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
}

function requestedView() {
  const params = new URLSearchParams(window.location.search);
  return params.get("presentationView") || params.get("slide") || params.get("view") || params.get("presentation");
}

function leadTypeLabel(type) {
  return type === "customer" ? "Insurance Customer" : "Sales Agent";
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
    ? "Thanks for reaching out. Sharon can help you understand your options in a short protection review."
    : "Thanks for your interest. Sharon's team can explain the opportunity, licensing steps, and next conversation.";
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
    stage: "AI Qualified",
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
      <p>${message}</p>
    </div>
    <div class="chat-message outbound">
      <span>AI Intake Agent</span>
      <p>I can qualify this lead, identify the correct stream, and prepare a next step for approval.</p>
    </div>
  `;
}

function renderAiSummary(lead) {
  const panel = document.querySelector("#ai-summary");
  if (!lead) {
    panel.innerHTML = `
      <p class="eyebrow">AI Output</p>
      <h3>Ready To Qualify</h3>
      <p>Choose a lead type and run the intake simulator to generate a score, summary, and approval-ready next step.</p>
    `;
    return;
  }
  panel.innerHTML = `
    <p class="eyebrow">${leadTypeLabel(lead.type)}</p>
    <h3>${lead.name}</h3>
    <div class="score-ring">${lead.score}</div>
    <p><strong>AI Summary:</strong> ${lead.summary}</p>
    <p><strong>Recommended Next Step:</strong> ${lead.nextStep}</p>
    <div class="draft-box">${lead.aiDraft}</div>
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
    container.innerHTML = `<article class="empty-state"><h3>No Leads Waiting</h3><p>Run the AI intake simulator or generate sample leads to refill the approval queue.</p></article>`;
    return;
  }
  container.innerHTML = pending.map((lead) => `
    <article class="approval-card" data-lead-id="${lead.id}">
      <div class="card-topline">
        <span>${leadTypeLabel(lead.type)}</span>
        <strong>${lead.score}</strong>
      </div>
      <h3>${lead.name}</h3>
      <p>${lead.summary}</p>
      <div class="draft-box">${lead.aiDraft}</div>
      <small>${lead.nextStep}</small>
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
      <p>${content.status}</p>
      <div class="mini-stats">
        <span>${pending} Pending</span>
        <span>${approved} Approved</span>
        <span>${avgScore} Avg Score</span>
      </div>
    </article>
    <article class="manager-module">
      <span>Flow</span>
      <ol>${content.flow.map((item) => `<li>${item}</li>`).join("")}</ol>
    </article>
    <article class="manager-module">
      <span>Follow-Up</span>
      <ul>${content.followUp.map((item) => `<li>${item}</li>`).join("")}</ul>
    </article>
    <article class="manager-module">
      <span>Links</span>
      <ul>${content.links.map((item) => `<li>${item}</li>`).join("")}</ul>
    </article>
    <article class="manager-module">
      <span>Reporting</span>
      <ul>${content.reporting.map((item) => `<li>${item}</li>`).join("")}</ul>
    </article>
    <article class="manager-module">
      <span>Content Plan</span>
      <ul>${content.contentPlan.map((item) => `<li>${item}</li>`).join("")}</ul>
    </article>
  `;
}

function renderStageColumns(type, stages) {
  return stages.map((stage) => {
    const cards = state.leads
      .filter((lead) => lead.type === type && lead.status === "Approved" && leadStageGroup(lead) === stage)
      .map((lead) => `
        <article class="lead-card">
          <strong>${lead.name}</strong>
          <p>${lead.summary}</p>
          <small>${lead.source}</small>
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
    ["Average AI Score", avgScore, "Demo fit score across all leads"],
    ["Pending Approval", pending, "Waiting for human review"],
    ["Approved Leads", approved, "Ready for next-step routing"]
  ].map(([label, value, note]) => `<article class="score-card"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join("");
  const rows = [
    ["Captured", state.leads.length],
    ["AI Qualified", state.leads.filter((lead) => lead.score >= 75).length],
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
        <span>${account.label}</span>
        <strong>${account.handle}</strong>
        <small>${account.status}</small>
      </button>
    `).join("")}
  `;

  document.querySelector("#social-tabs").innerHTML = accounts.map(([id, account]) => `
    <button class="${id === state.selectedSocial ? "active" : ""}" type="button" data-social-tab="${id}">${account.label}</button>
  `).join("");

  const engagementRate = ((selected.engagements / Math.max(selected.views, 1)) * 100).toFixed(1);
  const clickRate = ((selected.clicks / Math.max(selected.views, 1)) * 100).toFixed(1);
  document.querySelector("#social-overview").innerHTML = `
    <div class="social-heading">
      <div>
        <p class="eyebrow">${selected.label}</p>
        <h3>${selected.handle}</h3>
      </div>
      <span>${selected.audience}</span>
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
      <strong>Top Content: ${selected.topPost}</strong>
      <p>${selected.recommendation}</p>
    </div>
  `;
}

function renderComplianceWatch() {
  const feed = state.complianceFeed || fallbackComplianceFeed;
  document.querySelector("#compliance-summary").innerHTML = `
    <p class="eyebrow">Last Checked</p>
    <h3>${feed.lastChecked}</h3>
    <p>${feed.summary?.note || "Monitoring acquisition and compliance sources for updates."}</p>
    <div class="recommendation-list">
      ${(feed.recommendations || []).map((item) => `<article><span>Review</span><p>${item}</p></article>`).join("")}
    </div>
  `;
  document.querySelector("#compliance-sources").innerHTML = (feed.sources || []).map((source) => `
    <article class="source-card">
      <div class="card-topline">
        <span>${source.authority || "Source"}</span>
        <strong>${source.status || "Watched"}</strong>
      </div>
      <h4>${source.name}</h4>
      <p>${source.snippet || "Source monitored for relevant acquisition guidance."}</p>
      <div class="topic-list">
        ${(source.matchedTopics || []).slice(0, 4).map((topic) => `<span>${topic}</span>`).join("")}
      </div>
      <a href="${source.url}" target="_blank" rel="noreferrer">Open Source</a>
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
    ? `Campaign: ${offer}\n\nAudience: ${audience}\n\nMessage: If protecting your family, home, or business has been on your mind, this short review helps you understand your options before choosing a policy.\n\nLead Link: ${url}\n\nAutomation: AI intake asks the first questions, scores the lead, and sends qualified conversations to approval.`
    : `Campaign: ${offer}\n\nAudience: ${audience}\n\nMessage: Curious about life insurance sales or joining a supportive agency? Start with a short fit conversation and learn the next steps.\n\nLead Link: ${url}\n\nAutomation: AI intake screens interest, licensing status, and experience before routing to approval.`;
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
  renderComplianceWatch();
  renderApprovalQueue();
  renderPipeline();
  renderReport();
}

function setBrandPhoto(dataUrl) {
  const brandMark = document.querySelector("#brand-mark");
  const brandPhoto = document.querySelector("#brand-photo");
  if (!brandMark || !brandPhoto) return;
  if (dataUrl) {
    brandPhoto.src = dataUrl;
    brandMark.classList.add("has-photo");
  } else {
    brandPhoto.removeAttribute("src");
    brandMark.classList.remove("has-photo");
  }
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

document.querySelector(".menu-toggle")?.addEventListener("click", () => {
  const sidebar = document.querySelector(".sidebar");
  const isOpen = !sidebar.classList.contains("menu-open");
  sidebar.classList.toggle("menu-open", isOpen);
  document.querySelector(".menu-toggle").setAttribute("aria-expanded", String(isOpen));
});

document.querySelector("#profile-upload")?.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file || !file.type.startsWith("image/")) return;
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

document.querySelectorAll("[data-open]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.agentType) setSimType(button.dataset.agentType);
    showView(button.dataset.open);
  });
});

document.querySelectorAll("[data-sim-type]").forEach((button) => {
  button.addEventListener("click", () => setSimType(button.dataset.simType));
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
  Object.values(socialAccounts).forEach((account) => {
    account.views += Math.floor(Math.random() * 900) + 120;
    account.engagements += Math.floor(Math.random() * 90) + 12;
    account.clicks += Math.floor(Math.random() * 24) + 3;
    account.leads += Math.floor(Math.random() * 3);
  });
  renderSocialHub();
});

document.querySelector("#refresh-compliance").addEventListener("click", loadComplianceWatch);

document.querySelector("#generate-campaign").addEventListener("click", renderCampaign);
document.querySelector("#campaign-form").addEventListener("input", renderCampaign);

try {
  setBrandPhoto(localStorage.getItem(profilePhotoKey));
} catch {
  setBrandPhoto("");
}

setSimType("customer");
renderCampaign();
refresh();
loadComplianceWatch();
showView(requestedView() || "overview");
