#!/usr/bin/env ts-node
// scripts/docDriftReport.ts
/**
 * Consolidated documentation-drift report for technical writers.
 *
 * Sweeps every `doc-step-warnings.json` already on disk under `reports/`, deduplicates, checks each
 * finding back against its source document, and groups the results by what a writer has to do.
 *
 * This is the agent's actual product: places where the documentation no longer matches the app.
 * It needs no credentials, no browser and no failing run — only the reports that previous runs already
 * produced, plus read-only HTTP access to the public docs.
 *
 * Usage:
 *   npx ts-node --transpile-only scripts/docDriftReport.ts
 *   npx ts-node --transpile-only scripts/docDriftReport.ts --project CMS --out reports/doc-drift.md
 */
import fs from "fs";
import path from "path";
import {
  classifyDrift,
  summariseWarning,
  deriveDocTitle,
  extractAttemptedLocator,
  type DocDriftWarning,
} from "../core/healing/reportParser";
import {
  fetchDocContent,
  reconcile,
  docPhrasesFromLocator,
  parseLabelMismatch,
  parseContainerMismatch,
  type DocCheck,
} from "../core/healing/docVerifier";

const REPO_ROOT = path.resolve(__dirname, "..");

const argv = process.argv.slice(2);
const opt = (n: string, d?: string) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};
const projectFilter = opt("project");
const outFile = path.resolve(REPO_ROOT, opt("out", "reports/doc-drift-report.md")!);

/** Every doc-step-warnings.json under reports/. */
function warningFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === "doc-step-warnings.json") out.push(p);
    }
  };
  walk(path.join(REPO_ROOT, "reports"));
  return out;
}

/** Index flow id → {path, flow} once, rather than rescanning per warning. */
function indexFlows(): Map<string, { flowPath: string; flow: any }> {
  const index = new Map<string, { flowPath: string; flow: any }>();
  const walk = (dir: string) => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".flow.json")) {
        try {
          const flow = JSON.parse(fs.readFileSync(p, "utf8"));
          if (flow.id) index.set(String(flow.id), { flowPath: p, flow });
        } catch {
          /* skip malformed */
        }
      }
    }
  };
  walk(path.join(REPO_ROOT, "projects"));
  return index;
}

type Finding = DocDriftWarning & { docCheck: DocCheck; seenInRuns: number };

async function main(): Promise<void> {
  const flows = indexFlows();
  const files = warningFiles();
  console.log(`Scanning ${files.length} warning file(s) across reports/…`);

  // Dedupe across runs: the same drift recurs every night, and a writer wants it once.
  const byKey = new Map<string, { w: DocDriftWarning; runs: number }>();

  for (const file of files) {
    let raw: Array<Record<string, any>>;
    try {
      const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
      raw = Array.isArray(parsed) ? parsed : (parsed.warnings ?? []);
    } catch {
      continue;
    }

    for (const w of raw) {
      const flowId = String(w.flowId ?? "");
      if (!flowId) continue;
      const located = flows.get(flowId);
      const flow = located?.flow ?? {};
      const project = String(flow.project ?? "");
      if (projectFilter && project !== projectFilter) continue;

      const documentUrl = String(w.documentUrl ?? flow.source ?? "");
      if (!documentUrl) continue;

      const stepNumber = Number(w.stepNumber ?? (Number(w.stepIndex ?? 0) + 1));
      const message = String(w.warningMessage ?? "");
      const key = `${flowId}::${stepNumber}::${summariseWarning(message)}`;

      const hit = byKey.get(key);
      if (hit) {
        hit.runs += 1;
        continue;
      }
      byKey.set(key, {
        runs: 1,
        w: {
          flowId,
          project,
          module: String(flow.module ?? ""),
          documentUrl,
          docTitle: deriveDocTitle(flow, documentUrl),
          stepNumber,
          action: String(w.action ?? ""),
          target: String(w.target ?? ""),
          warningMessage: message,
        },
      });
    }
  }

  console.log(`${byKey.size} distinct finding(s) after dedupe. Checking against source documents…`);

  const findings: Finding[] = [];
  let n = 0;
  for (const { w, runs } of byKey.values()) {
    n += 1;
    if (n % 25 === 0) console.log(`  …${n}/${byKey.size}`);

    const kind = classifyDrift(w.warningMessage);
    const doc = await fetchDocContent(w.documentUrl); // cached per URL
    const label = parseLabelMismatch(w.warningMessage);
    const container = parseContainerMismatch(w.warningMessage);

    findings.push({
      ...w,
      seenInRuns: runs,
      docCheck: reconcile({
        docText: doc.text,
        docUrl: w.documentUrl,
        docError: doc.error,
        expectedByFlow: label?.expected ?? container?.expected,
        expectedCandidates: [
          ...docPhrasesFromLocator(extractAttemptedLocator(w.warningMessage)),
          w.target.replace(/\s*\(doc step\)\s*$/i, "").trim(),
        ],
        seenInApp: label?.got ?? container?.resolved,
        kind,
      }),
    });
  }

  // Most actionable first: a confirmed doc/app wording mismatch is something a writer can fix today.
  const noDrift = findings.filter((f) => f.docCheck.verdict === "no-drift");
  // Wording drift and location drift need different edits, so they are reported separately.
  const wordingDrift = findings.filter(
    (f) =>
      f.docCheck.verdict === "doc-confirms-flow" &&
      f.docCheck.seenInApp &&
      f.docCheck.kind === "label-mismatch"
  );
  const flowJsonStale = findings.filter((f) => f.docCheck.verdict === "doc-matches-app");
  const notFound = findings.filter(
    (f) => f.docCheck.verdict === "doc-confirms-flow" && !f.docCheck.seenInApp
  );
  const needsReview = findings.filter((f) => f.docCheck.verdict === "doc-mentions-neither");
  const unreadable = findings.filter((f) => f.docCheck.verdict === "doc-unavailable");

  const section = (title: string, blurb: string, items: Finding[]): string[] => {
    if (!items.length) return [];
    const byDoc = new Map<string, Finding[]>();
    for (const f of items) {
      const list = byDoc.get(f.documentUrl) ?? [];
      list.push(f);
      byDoc.set(f.documentUrl, list);
    }
    const lines = [`## ${title} (${items.length})`, ``, blurb, ``];
    for (const [url, fs_] of byDoc) {
      lines.push(`### ${fs_[0].docTitle}`);
      lines.push(`${url}`);
      lines.push(``);
      for (const f of fs_) {
        const seen = f.seenInRuns > 1 ? ` _(seen in ${f.seenInRuns} runs)_` : "";
        lines.push(`- **step ${f.stepNumber}** (${f.action})${seen}`);
        if (f.docCheck.seenInApp && f.docCheck.expectedByFlow) {
          lines.push(`  - doc says **"${f.docCheck.expectedByFlow}"** · app shows **"${f.docCheck.seenInApp}"**`);
        } else {
          lines.push(`  - ${summariseWarning(f.warningMessage)}`);
        }
        if (f.docCheck.docQuote) lines.push(`  - > ${f.docCheck.docQuote.slice(0, 300)}`);
      }
      lines.push(``);
    }
    return lines;
  };

  const md = [
    `# Documentation drift report`,
    ``,
    `Generated from ${files.length} historical run report(s) · ${byKey.size} distinct findings`,
    projectFilter ? `Project filter: **${projectFilter}**` : `All projects`,
    ``,
    `| Category | Count | Owner |`,
    `|---|---|---|`,
    `| Doc wording is out of date | ${wordingDrift.length} | technical writers |`,
    `| Selector-scoping check failed (not doc drift) | ${noDrift.length} | automation |`,
    `| Documented element not found | ${notFound.length} | verify, then writers |`,
    `| Our flow JSON is out of date | ${flowJsonStale.length} | automation |`,
    `| Needs review | ${needsReview.length} | — |`,
    `| Doc unreadable | ${unreadable.length} | — |`,
    ``,
    ...section(
      "Doc wording is out of date",
      "Both sides are known: the doc says one label, the app renders another. Highest confidence — a writer can correct the wording directly.",
      wordingDrift
    ),
    ...section(
      "Selector-scoping check failed (not documentation drift)",
      "The step resolved outside the container the flow expected. This is an assertion about our own test scoping, not about the document — review the step's `expected.within`. Listed for the automation team, not the writers.",
      noDrift
    ),
    ...section(
      "Documented element not found in the app",
      "The doc documents this control but it was not found at that step. Confirm whether the app removed or renamed it, or whether the step ran on the wrong screen, before editing the doc.",
      notFound
    ),
    ...section(
      "Our flow JSON is out of date",
      "The document already matches the app; our transcription of it is stale. No doc change needed — fix the flow definition to the doc's wording.",
      flowJsonStale
    ),
    ...section("Needs review", "The doc mentions neither wording. Either it was rewritten or the flow step is wrong.", needsReview),
    ...section("Doc unreadable", "The source document could not be fetched.", unreadable),
  ].join("\n");

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, md, "utf8");

  console.log(`\n${"─".repeat(60)}`);
  console.log(`Doc wording out of date : ${wordingDrift.length}   ← for the writers`);
  console.log(`Scoping check (not drift): ${noDrift.length}   ← automation, not writers`);
  console.log(`Element not found       : ${notFound.length}`);
  console.log(`Flow JSON out of date   : ${flowJsonStale.length}`);
  console.log(`Needs review            : ${needsReview.length}`);
  console.log(`Doc unreadable          : ${unreadable.length}`);
  console.log(`\n📄 ${path.relative(REPO_ROOT, outFile)}`);
}

main().catch((err) => {
  console.error(`Fatal: ${err?.stack ?? err}`);
  process.exit(1);
});
