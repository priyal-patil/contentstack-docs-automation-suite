/**
 * Doc-drift checker CLI.
 *
 * Verifies that flow JSON still matches the documentation it was authored from, and reports the
 * exact doc wording to update it to. It never rewrites JSON — that is the reviewing agent's job,
 * under `.cursor/rules/doc-step-parity.mdc`.
 *
 * Usage:
 *   ts-node scripts/docDrift/runDriftCheck.ts --project Studio
 *   ts-node scripts/docDrift/runDriftCheck.ts --project Studio --refresh
 *   ts-node scripts/docDrift/runDriftCheck.ts --project CMS --flow create-a-content-type
 *   ts-node scripts/docDrift/runDriftCheck.ts --all --static-only
 *
 * Flags:
 *   --project <name>   Project under projects/ (repeatable).
 *   --all              Every project.
 *   --flow <id>        Restrict to flows whose id contains this substring.
 *   --refresh          Re-fetch docs instead of reusing data/doc-snapshots/.
 *   --static-only      Layer 1 only; no network.
 *   --report-dir <dir> Output directory (default reports/doc-drift/<timestamp>).
 *   --min-severity <s> Console filter: critical|high|medium|low|info (default info).
 */

import * as fs from "fs";
import * as path from "path";
import { fetchSnapshots } from "./extractDocContent";
import { loadDocsInventory, loadFlows, listProjects, normalizeUrl } from "./loadFlows";
import { staticValidate } from "./staticValidate";
import { compareFlowToDoc } from "./compareFlowToDoc";
import type { DocSnapshot, Finding, Severity } from "./types";

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low", "info"];

function parseArgs(argv: string[]) {
  const opts = {
    projects: [] as string[],
    all: false,
    flow: undefined as string | undefined,
    refresh: false,
    staticOnly: false,
    reportDir: undefined as string | undefined,
    minSeverity: "info" as Severity,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--project") opts.projects.push(argv[++i]);
    else if (a === "--all") opts.all = true;
    else if (a === "--flow") opts.flow = argv[++i];
    else if (a === "--refresh") opts.refresh = true;
    else if (a === "--static-only") opts.staticOnly = true;
    else if (a === "--report-dir") opts.reportDir = argv[++i];
    else if (a === "--min-severity") opts.minSeverity = argv[++i] as Severity;
  }
  return opts;
}

const rank = (s: Severity) => SEVERITY_ORDER.indexOf(s);

function severityCounts(findings: Finding[]): Record<Severity, number> {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 } as Record<Severity, number>;
  for (const f of findings) counts[f.severity]++;
  return counts;
}

function markdownReport(
  projects: string[],
  findings: Finding[],
  snapshots: Map<string, DocSnapshot>,
  staticOnly: boolean
): string {
  const counts = severityCounts(findings);
  const lines: string[] = [];

  lines.push("# Doc-drift report");
  lines.push("");
  lines.push(`- Generated: ${new Date().toISOString()}`);
  lines.push(`- Projects: ${projects.join(", ")}`);
  lines.push(`- Mode: ${staticOnly ? "static only (no doc fetch)" : "static + doc comparison"}`);
  lines.push(`- Docs fetched/loaded: ${snapshots.size}`);
  lines.push(
    `- Findings: ${findings.length} — ` +
      SEVERITY_ORDER.map((s) => `${counts[s]} ${s}`).join(", ")
  );
  lines.push("");

  // Findings needing human triage first — the critical ones destroy work if auto-fixed.
  const byCode = new Map<string, Finding[]>();
  for (const f of findings) byCode.set(f.code, [...(byCode.get(f.code) ?? []), f]);

  lines.push("## Summary by finding type");
  lines.push("");
  lines.push("| Severity | Code | Count | Auto-fixable |");
  lines.push("|---|---|---|---|");
  for (const [code, list] of [...byCode.entries()].sort(
    (a, b) => rank(a[1][0].severity) - rank(b[1][0].severity) || b[1].length - a[1].length
  )) {
    lines.push(`| ${list[0].severity} | \`${code}\` | ${list.length} | ${list[0].autoFixable ? "yes" : "no — triage"} |`);
  }
  lines.push("");

  const byFlow = new Map<string, Finding[]>();
  for (const f of findings) {
    const key = f.flow ?? "(project-level)";
    byFlow.set(key, [...(byFlow.get(key) ?? []), f]);
  }

  lines.push("## Findings by flow");
  lines.push("");
  for (const [flowPath, list] of [...byFlow.entries()].sort((a, b) => {
    const worst = (l: Finding[]) => Math.min(...l.map((f) => rank(f.severity)));
    return worst(a[1]) - worst(b[1]) || a[0].localeCompare(b[0]);
  })) {
    lines.push(`### \`${flowPath}\``);
    const snap = [...snapshots.values()].find((s) =>
      list.some((f) => f.actual === s.url) || false
    );
    if (snap?.lastUpdated) lines.push(`Doc: "${snap.title}" — ${snap.lastUpdated}`);
    lines.push("");
    for (const f of list.sort((a, b) => rank(a.severity) - rank(b.severity))) {
      const loc = f.stepIndex !== undefined ? ` (step ${f.stepIndex + 1})` : "";
      lines.push(`- **${f.severity.toUpperCase()}** \`${f.code}\`${loc} — ${f.message}`);
      if (f.actual && f.suggested) lines.push(`  - JSON has \`${f.actual}\` → doc says \`${f.suggested}\``);
      else if (f.actual && !f.suggested) lines.push(`  - Value: \`${f.actual}\``);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const projects = opts.all ? listProjects() : opts.projects;

  if (projects.length === 0) {
    console.error("Specify --project <name> (repeatable) or --all.");
    process.exit(2);
  }

  const reportDir =
    opts.reportDir ?? path.join("reports", "doc-drift", new Date().toISOString().replace(/[:.]/g, "-"));

  const allFindings: Finding[] = [];
  const allSnapshots = new Map<string, DocSnapshot>();

  for (const project of projects) {
    const { files, parseErrors } = loadFlows(project);
    for (const pe of parseErrors) {
      allFindings.push({
        severity: "critical",
        code: "flow-json-parse-error",
        message: `Invalid JSON: ${pe.error}`,
        flow: pe.path,
        autoFixable: false,
      });
    }

    const scoped = opts.flow ? files.filter((f) => (f.flow.id ?? "").includes(opts.flow!)) : files;

    console.log(
      `\n[${project}] ${scoped.length} flow(s)` +
        (opts.flow ? ` matching id ~ "${opts.flow}"` : "") +
        `, ${loadDocsInventory(project).length} URL(s) in docs.json`
    );

    allFindings.push(...staticValidate(project, scoped));

    if (opts.staticOnly) continue;

    const urls = [...new Set(scoped.map((f) => f.flow.source).filter((s): s is string => !!s).map(normalizeUrl))];
    if (urls.length === 0) {
      console.log(`[${project}] no \`source\` URLs to fetch.`);
      continue;
    }

    console.log(`[${project}] resolving ${urls.length} doc URL(s)${opts.refresh ? " (forced refresh)" : ""}…`);
    const snapshots = await fetchSnapshots(project, urls, {
      refresh: opts.refresh,
      onProgress: (url, snap, cached) => {
        const status = snap.error ? `ERROR ${snap.error}` : `${snap.orderedSteps.length} steps, ${snap.boldLabels.length} labels`;
        console.log(`  ${cached ? "cached" : "fetched"}  ${snap.title || "(no title)"} — ${status}  ${url}`);
      },
    });
    for (const [url, snap] of snapshots) allSnapshots.set(url, snap);

    for (const { path: fp, flow } of scoped) {
      if (!flow.source) continue;
      const snap = snapshots.get(normalizeUrl(flow.source));
      if (!snap) continue;
      allFindings.push(...compareFlowToDoc(fp, flow, snap));
    }
  }

  fs.mkdirSync(reportDir, { recursive: true });
  const jsonPath = path.join(reportDir, "doc-drift.json");
  const mdPath = path.join(reportDir, "doc-drift.md");
  fs.writeFileSync(
    jsonPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        projects,
        mode: opts.staticOnly ? "static-only" : "full",
        counts: severityCounts(allFindings),
        findings: allFindings,
      },
      null,
      2
    )}\n`
  );
  fs.writeFileSync(mdPath, markdownReport(projects, allFindings, allSnapshots, opts.staticOnly));

  const counts = severityCounts(allFindings);
  console.log("\n" + "-".repeat(70));
  for (const s of SEVERITY_ORDER) {
    const shown = allFindings.filter((f) => f.severity === s && rank(s) <= rank(opts.minSeverity));
    if (shown.length === 0) continue;
    console.log(`\n${s.toUpperCase()} (${shown.length})`);
    // Project-level bulk findings (e.g. 27 uncovered URLs) collapse to one line + a list.
    const bulk = new Map<string, Finding[]>();
    for (const f of shown) {
      if (!f.flow && f.actual) {
        bulk.set(f.code, [...(bulk.get(f.code) ?? []), f]);
        continue;
      }
      const loc = f.stepIndex !== undefined ? `:step${f.stepIndex + 1}` : "";
      console.log(`  [${f.code}] ${f.flow ?? ""}${loc}`);
      console.log(`    ${f.message}`);
      if (f.suggested) console.log(`    → doc says: "${f.suggested}"`);
      else if (f.actual) console.log(`    value: ${f.actual}`);
    }
    for (const [code, list] of bulk) {
      console.log(`  [${code}] ${list.length}× — ${list[0].message}`);
      for (const f of list) console.log(`    - ${f.actual}`);
    }
  }
  console.log("\n" + "-".repeat(70));
  console.log(
    `Total ${allFindings.length}: ` + SEVERITY_ORDER.map((s) => `${counts[s]} ${s}`).join(", ")
  );
  console.log(`Report: ${mdPath}`);
  console.log(`JSON:   ${jsonPath}`);

  // Non-zero exit only for findings that cannot be auto-resolved and block a run.
  process.exit(counts.critical > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
