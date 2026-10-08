import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const sources = [
  {
    name: "NAIC Model Laws",
    authority: "NAIC",
    url: "https://content.naic.org/es/node/5321",
    topics: ["life insurance advertising", "annuities", "model regulation", "misleading", "disclosure"]
  },
  {
    name: "NAIC Producer Licensing",
    authority: "NAIC",
    url: "https://content.naic.org/insurance-topics/producer-licensing",
    topics: ["producer licensing", "sales and marketing", "state insurance departments", "solicit", "negotiate"]
  },
  {
    name: "NAIC Life Insurance Illustrations",
    authority: "NAIC",
    url: "https://content.naic.org/insurance-topics/life-insurance-illustrations",
    topics: ["life insurance illustrations", "marketing", "guaranteed", "non-guaranteed", "consumer"]
  },
  {
    name: "FINRA Social Media",
    authority: "FINRA",
    url: "https://www.finra.org/rules-guidance/key-topics/social-media",
    topics: ["social media", "communications", "misleading", "balanced", "approval"]
  },
  {
    name: "FINRA Advertising Filing Guide",
    authority: "FINRA",
    url: "https://www.finra.org/about/how-we-operate/advertising-regulation/what-when-to-file",
    topics: ["retail communications", "public media", "social media", "principal approval", "filing"]
  },
  {
    name: "FTC Telemarketing Sales Rule",
    authority: "FTC",
    url: "https://www.ftc.gov/business-guidance/resources/complying-telemarketing-sales-rule",
    topics: ["telemarketing", "lead generator", "permission", "seller", "written permission"]
  },
  {
    name: "FTC Lead Generation Bait And Switch",
    authority: "FTC",
    url: "https://consumer.ftc.gov/consumer-alerts/2019/04/lead-generation-bait-switch",
    topics: ["lead generation", "bait-and-switch", "unwanted calls", "phone numbers", "consumer"]
  },
  {
    name: "FCC TCPA Lead Generation Consent",
    authority: "FCC",
    url: "https://www.federalregister.gov/documents/2024/01/26/2023-28832/targeting-and-eliminating-unlawful-text-messages-implementation-of-the-telephone-consumer-protection",
    topics: ["lead generator", "consent", "robocall", "robotext", "clear and conspicuous"]
  }
];

const recommendations = [
  "Separate insurance customer acquisition from sales agent recruiting so each page, ad, and consent path has a clear purpose.",
  "Keep generated scripts, replies, and booking invitations behind human approval before they reach prospects.",
  "Avoid public claims that imply guaranteed results, guaranteed policy outcomes, investment performance, or product advice without licensed review.",
  "Capture proof of source, timestamp, disclosure, opt-in language, and campaign context before calling, texting, or emailing leads.",
  "Route social comments and direct messages into intake, but do not let automation confirm appointments or recruiting steps without review."
];

function normalize(text) {
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFrom(html, fallback) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return normalize(title || fallback).slice(0, 140);
}

function snippetFor(text, topics) {
  const lower = text.toLowerCase();
  const topic = topics.find((item) => lower.includes(item.toLowerCase()));
  if (!topic) return text.slice(0, 220);
  const index = Math.max(0, lower.indexOf(topic.toLowerCase()) - 90);
  return text.slice(index, index + 260).trim();
}

async function previousHashes() {
  try {
    const previous = JSON.parse(await readFile("data/compliance-watch.json", "utf8"));
    return new Map((previous.sources || []).map((source) => [source.url, source.hash]));
  } catch {
    return new Map();
  }
}

async function fetchSource(source, hashes) {
  try {
    const response = await fetch(source.url, {
      headers: {
        "user-agent": "SharonLeadAcquisitionComplianceWatch/1.0"
      }
    });
    const html = await response.text();
    const text = normalize(html);
    const hash = createHash("sha256").update(text).digest("hex").slice(0, 16);
    const matchedTopics = source.topics.filter((topic) => text.toLowerCase().includes(topic.toLowerCase()));
    return {
      ...source,
      status: response.ok ? "Watched" : `HTTP ${response.status}`,
      title: titleFrom(html, source.name),
      hash,
      changedSinceLastRun: hashes.has(source.url) && hashes.get(source.url) !== hash,
      matchedTopics,
      snippet: snippetFor(text, source.topics)
    };
  } catch (error) {
    return {
      ...source,
      status: "Fetch Failed",
      changedSinceLastRun: false,
      matchedTopics: [],
      snippet: error instanceof Error ? error.message : "Unknown fetch error"
    };
  }
}

const hashes = await previousHashes();
const checkedSources = await Promise.all(sources.map((source) => fetchSource(source, hashes)));
const changedCount = checkedSources.filter((source) => source.changedSinceLastRun).length;

const feed = {
  lastChecked: new Date().toISOString(),
  summary: {
    status: changedCount ? "Review Needed" : "No Source Changes Detected",
    changedCount,
    note: changedCount
      ? `${changedCount} monitored source${changedCount === 1 ? "" : "s"} changed since the last run. Review before updating acquisition copy or automation.`
      : "No monitored source changes were detected. Continue routing new tactics through human compliance review."
  },
  recommendations,
  sources: checkedSources
};

await mkdir("data", { recursive: true });
await writeFile("data/compliance-watch.json", `${JSON.stringify(feed, null, 2)}\n`);
console.log(`Compliance watch updated: ${checkedSources.length} sources, ${changedCount} changed.`);
