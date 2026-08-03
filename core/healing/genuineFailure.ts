// core/healing/genuineFailure.ts
/**
 * Builds the report for failures that are *not* locator drift — the actual product value of the
 * agent. Before declaring a genuine failure we re-fetch the doc source so the report can state
 * precisely what the doc claims versus what the app has, rather than just "selector not found".
 *
 * The doc is fetched over HTTP with axios + cheerio (both existing dependencies) so this works
 * headlessly in CI. Interactively, the `contentstack-docs` MCP is the richer equivalent.
 */
import axios from "axios";
import * as cheerio from "cheerio";
import type { Candidate, HealResult } from "./types";
import { extractAttemptedLocator } from "./reportParser";

export type DocEvidence = {
  url: string;
  title?: string;
  /** The doc sentence(s) mentioning the expected label, so the report can quote the source. */
  mentions: string[];
  fetchedAt: string;
  error?: string;
};

/** Fetch the doc page and pull out sentences that mention the expected label. */
export async function fetchDocEvidence(url: string, expectedLabel: string): Promise<DocEvidence> {
  const fetchedAt = new Date().toISOString();
  if (!/^https?:\/\//i.test(url)) return { url, mentions: [], fetchedAt, error: "no usable doc URL" };

  try {
    const res = await axios.get(url, { timeout: 20000, headers: { "User-Agent": "docs-qa-healing-agent" } });
    const $ = cheerio.load(String(res.data));
    $("script, style, nav, footer").remove();

    const title = $("h1").first().text().replace(/\s+/g, " ").trim() || $("title").text().trim();
    const body = $("main").length ? $("main").text() : $("body").text();
    const flat = body.replace(/\s+/g, " ").trim();

    const needle = expectedLabel.replace(/\s*\(doc step\)\s*$/i, "").trim();
    const mentions: string[] = [];
    if (needle) {
      const re = new RegExp(`[^.]*${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^.]*\\.`, "gi");
      for (const m of flat.match(re) ?? []) {
        const s = m.trim();
        if (s && !mentions.includes(s)) mentions.push(s);
        if (mentions.length >= 3) break;
      }
    }
    return { url, title, mentions, fetchedAt };
  } catch (err: any) {
    return { url, mentions: [], fetchedAt, error: err?.message ?? String(err) };
  }
}

export type GenuineFailureReport = {
  docTitle: string;
  docUrl: string;
  docSection?: string;
  flowId: string;
  project: string;
  module: string;
  stepNumber: number;
  stepDescription: string;
  action: string;
  searchedFor: string;
  attemptedLocator?: string;
  attempts: number;
  reason: string;
  closestCandidates: Array<{ selector: string; strategy: string; confidence: number; rationale: string }>;
  screenshotPath?: string;
  snapshotPath?: string;
  docEvidence: DocEvidence;
};

export async function buildGenuineFailureReport(result: HealResult): Promise<GenuineFailureReport> {
  const t = result.target;
  const searchedFor = t.target.replace(/\s*\(doc step\)\s*$/i, "").trim();
  const docEvidence = await fetchDocEvidence(t.documentUrl, searchedFor);

  const lastSnapshot = [...result.attempts].reverse().find((a) => a.snapshotSaved)?.snapshotSaved;

  return {
    docTitle: t.docTitle,
    docUrl: t.documentUrl,
    docSection: t.documentUrl.includes("#") ? t.documentUrl.split("#")[1] : undefined,
    flowId: t.flowId,
    project: t.project,
    module: t.module,
    stepNumber: t.stepNumber,
    stepDescription: `${t.action} "${searchedFor}"`,
    action: t.action,
    searchedFor,
    attemptedLocator: t.currentSelector ?? extractAttemptedLocator(t.errorMessage),
    attempts: result.attempts.length,
    reason: result.genuineFailureReason ?? "unknown",
    closestCandidates: (result.closestCandidates ?? []).map((c: Candidate) => ({
      selector: c.selector,
      strategy: c.strategy,
      confidence: c.confidence,
      rationale: c.rationale,
    })),
    screenshotPath: t.screenshotPath,
    snapshotPath: lastSnapshot ?? t.snapshotPath,
    docEvidence,
  };
}

/** Markdown for a GitHub issue section / Slack block. One section per flow, batched per run. */
export function renderGenuineFailureMarkdown(r: GenuineFailureReport): string {
  const lines: string[] = [];
  lines.push(`### ${r.docTitle} — step ${r.stepNumber}`);
  lines.push("");
  lines.push(`- **Doc:** ${r.docUrl}${r.docSection ? ` (§${r.docSection})` : ""}`);
  lines.push(`- **Flow:** \`${r.flowId}\` (${r.project} / ${r.module})`);
  lines.push(`- **Step:** ${r.stepDescription}`);
  lines.push(`- **Searched for:** \`${r.searchedFor}\``);
  if (r.attemptedLocator) lines.push(`- **Locator tried:** \`${r.attemptedLocator}\``);
  lines.push(`- **Heal attempts:** ${r.attempts} — ${r.reason}`);

  if (r.docEvidence.mentions.length) {
    lines.push("");
    lines.push(`**The doc says:**`);
    for (const m of r.docEvidence.mentions) lines.push(`> ${m}`);
    lines.push("");
    lines.push(
      `No element with that role or label was found anywhere on the page as of ${r.docEvidence.fetchedAt}.`
    );
  } else if (r.docEvidence.error) {
    lines.push(`- _Doc re-fetch failed: ${r.docEvidence.error}_`);
  } else {
    lines.push(
      `- _The phrase "${r.searchedFor}" was not found in the doc body either — the flow step may be stale rather than the app._`
    );
  }

  if (r.closestCandidates.length) {
    lines.push("");
    lines.push(`**Closest non-matching candidates** (for triage):`);
    for (const c of r.closestCandidates) {
      lines.push(`- \`${c.selector}\` — ${c.strategy}, confidence ${c.confidence} — ${c.rationale}`);
    }
  }

  if (r.screenshotPath || r.snapshotPath) {
    lines.push("");
    if (r.screenshotPath) lines.push(`- Screenshot: \`${r.screenshotPath}\``);
    if (r.snapshotPath) lines.push(`- DOM snapshot: \`${r.snapshotPath}\``);
  }
  return lines.join("\n");
}
