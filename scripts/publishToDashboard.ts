#!/usr/bin/env npx ts-node
/**
 * Normalizes a Playwright flows-results.json run into the shared dashboard schema
 * (schemaVersion 1) used by docs-automation-dashboard-data, and writes ONE JSON file.
 *
 * This intentionally REUSES the parsing already done by scripts/urlRunSummaryAndSlack.ts
 * (the script that posts the "URL run summary" Slack message) — same flowsResults path
 * resolution, same Playwright JSON → flow-row expansion (test.step aware), same
 * pass/fail/skip/timedOut/interrupted classification, same flow-meta (doc URL) lookup —
 * rather than re-deriving stats from the raw Playwright JSON here.
 *
 * Usage (mirrors urlRunSummaryAndSlack.ts's own invocation from the workflows):
 *   npx ts-node scripts/publishToDashboard.ts \
 *     --reportDir "$REPORT_DIR" \
 *     --suite cms-batch2 \
 *     --suiteLabel "CMS Batch 2" \
 *     --out /tmp/dashboard-cms-batch2.json
 *
 * Env (same ones the Slack step already sets/reads):
 *   REPORT_DIR              — fallback for --reportDir
 *   RUN_URL                 — full GHA run URL (set in the "Post Slack summary" step)
 *   GITHUB_RUN_ID            — GHA run id
 *   GITHUB_SERVER_URL, GITHUB_REPOSITORY — used to build runUrl if RUN_URL absent
 *   DURATION_SECONDS        — preferred: elapsed seconds, computed by the workflow (bash
 *                              already computes ELAPSED_SECS for the Slack step's "Duration"
 *                              field) — pass it straight through instead of re-parsing text.
 *   CMS_BATCH_DURATION_LABEL / BATCH1_DURATION_LABEL / BATCH2_DURATION_LABEL / BATCH3_DURATION_LABEL
 *                            — fallback: human label like "... (12m 24s)" parsed for seconds
 *                              if DURATION_SECONDS isn't set.
 */

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv").config();
} catch {
  /* optional */
}

import fs from "fs";
import path from "path";
import { loadFlowMetaById } from "../core/report/unifiedReportModel";
import { resolveFlowsResultsPath } from "../core/report/resolveFlowsResultsPath";
import { collectFlowResults } from "./urlRunSummaryAndSlack";

function getArg(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name);
  if (i === -1) return undefined;
  return argv[i + 1];
}

function readJson<T>(p: string): T | null {
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
  } catch {
    return null;
  }
}

type DashboardFailedItem = { name: string; detail: string; docLink: string };

type DashboardItemStatus = "pass" | "fail" | "warning" | "skipped";

type DashboardItem = {
  name: string;
  status: DashboardItemStatus;
  detail: string | null;
  docLink: string;
  reportUrl?: string;
};

type DashboardWarning = {
  name: string;
  detail: string;
  docLink: string;
  reportUrl?: string;
};

type DashboardReport = {
  schemaVersion: 1;
  project: string;
  projectLabel: string;
  suite: string;
  suiteLabel: string;
  runId: string;
  runUrl: string;
  artifactsUrl: string;
  timestamp: string;
  durationSeconds: number | null;
  totals: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    warnings: number;
    timedOut: number;
    interrupted: number;
  };
  failedItems: DashboardFailedItem[];
  docLinks: string[];
  items?: DashboardItem[];
  warnings?: DashboardWarning[];
};

/**
 * Maps this repo's actual Playwright/url-run-summary status strings to the
 * shared dashboard schema's item status enum ("pass" | "fail" | "warning" | "skipped").
 * Confirmed status values seen in real url-run-summary.json output: "passed",
 * "failed", "timedOut" (no "skipped"/"interrupted" seen in the sample inspected,
 * but urlRunSummaryAndSlack.ts's own counting logic handles them, so mapped here too).
 * NOTE: this repo never produces a raw "warning" flow status — a flow that passed
 * but also has step warnings stays status "pass" here; its warnings are surfaced
 * separately via the `warnings[]` array, not by promoting the item's status.
 * A human should double check this mapping against a broader sample of runs.
 */
function mapFlowStatusToItemStatus(status: string): DashboardItemStatus {
  switch (status) {
    case "passed":
      return "pass";
    case "skipped":
      return "skipped";
    case "failed":
    case "timedOut":
    case "interrupted":
      return "fail";
    default:
      return "fail";
  }
}

/**
 * Recursively locates the per-flow Playwright HTML report for `flowId` under
 * `reportDir/playwright-parts`. Confirmed two different folder conventions in
 * the wild (`playwright-parts/<flowId>-retry-run/<flowId>-report.html` and
 * `playwright-parts/module-<name>/<flowId>-report.html`), so this walks the
 * whole tree looking for the filename rather than hardcoding either pattern.
 */
function findFlowReportHtml(reportDir: string, flowId: string): string | undefined {
  const root = path.join(reportDir, "playwright-parts");
  if (!fs.existsSync(root)) return undefined;
  const target = `${flowId}-report.html`;

  const stack: string[] = [root];
  while (stack.length) {
    const dir = stack.pop()!;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile() && entry.name === target) {
        return full;
      }
    }
  }
  return undefined;
}

/**
 * Stages a copy of `srcHtmlPath` into `reportsOutDir` as a flat file named
 * `<flowId>-report.html` (no subfolders — matches what scripts/publish.js in
 * docs-automation-dashboard-data expects to copy into data/<project>/<suite>/reports/).
 * Returns the repo-relative reportUrl to use in the normalized JSON, or undefined
 * if no reports dir was requested / no HTML file was found for this flow.
 */
function stageFlowReportHtml(
  reportsOutDir: string | undefined,
  project: string,
  suite: string,
  reportDir: string,
  flowId: string,
  staged: Set<string>
): string | undefined {
  if (!reportsOutDir || !flowId) return undefined;
  const src = findFlowReportHtml(reportDir, flowId);
  if (!src) return undefined;
  const fileName = `${flowId}-report.html`;
  if (!staged.has(fileName)) {
    fs.mkdirSync(reportsOutDir, { recursive: true });
    fs.copyFileSync(src, path.join(reportsOutDir, fileName));
    staged.add(fileName);
  }
  return `data/${project}/${suite}/reports/${fileName}`;
}

/** Parse a "(12m 24s)" / "(1h 2m 3s)" style duration tail out of a human label, in seconds. */
function parseDurationLabelToSeconds(label: string | undefined): number | null {
  if (!label) return null;
  const m = label.match(/\(([^)]*)\)\s*$/);
  const inner = m ? m[1] : label;
  const hM = inner.match(/(\d+)\s*h/i);
  const mM = inner.match(/(\d+)\s*m(?!s)/i);
  const sM = inner.match(/(\d+)\s*s/i);
  if (!hM && !mM && !sM) return null;
  const h = hM ? Number(hM[1]) : 0;
  const min = mM ? Number(mM[1]) : 0;
  const s = sM ? Number(sM[1]) : 0;
  return h * 3600 + min * 60 + s;
}

function resolveDurationSeconds(): number | null {
  const explicit = process.env.DURATION_SECONDS;
  if (explicit && !Number.isNaN(Number(explicit))) return Number(explicit);
  const label =
    process.env.CMS_BATCH_DURATION_LABEL ||
    process.env.BATCH1_DURATION_LABEL ||
    process.env.BATCH2_DURATION_LABEL ||
    process.env.BATCH3_DURATION_LABEL ||
    process.env.CMS_BATCH1_DURATION;
  return parseDurationLabelToSeconds(label);
}

function resolveRunUrl(): string {
  if (process.env.RUN_URL) return process.env.RUN_URL;
  const serverUrl = process.env.GITHUB_SERVER_URL || "https://github.com";
  const repo = process.env.GITHUB_REPOSITORY || "priyal-patil/docs-contentstack-ai-automation";
  const runId = process.env.GITHUB_RUN_ID || "";
  return `${serverUrl}/${repo}/actions/runs/${runId}`;
}

function main(): void {
  const argv = process.argv.slice(2);

  const reportDir = path.resolve(process.cwd(), getArg(argv, "--reportDir") || process.env.REPORT_DIR || "reports/latest");
  const suite = getArg(argv, "--suite") || process.env.DASHBOARD_SUITE;
  const suiteLabel = getArg(argv, "--suiteLabel") || process.env.DASHBOARD_SUITE_LABEL || suite;
  const outPath = getArg(argv, "--out");
  const reportsOutDir = getArg(argv, "--reportsOutDir") || process.env.DASHBOARD_REPORTS_OUT_DIR;

  if (!suite || !suiteLabel) {
    // eslint-disable-next-line no-console
    console.error("publishToDashboard.ts: --suite and --suiteLabel are required (or DASHBOARD_SUITE / DASHBOARD_SUITE_LABEL env).");
    process.exitCode = 1;
    return;
  }

  // Same parsing the Slack script uses: resolve which Playwright JSON has flow results,
  // expand test.step-batched specs into one row per flow, and attach doc URL / project / module
  // from the flow-meta index (projects/**/*.json via loadFlowMetaById).
  const flowsPath = resolveFlowsResultsPath(reportDir);
  const pw = readJson<any>(flowsPath);
  const rawRows = pw ? collectFlowResults(pw) : [];
  const metaById = loadFlowMetaById(process.cwd());

  const rows = rawRows.map((r) => {
    const m = metaById.get(r.id);
    return {
      flowId: r.id,
      status: r.status,
      documentUrl: m?.source || "",
      error: r.error,
    };
  });

  let passed = 0;
  let failed = 0; // includes timedOut, matching the Slack message's "Failed (incl. N timed out)"
  let skipped = 0;
  let timedOut = 0;
  let interrupted = 0;

  for (const r of rows) {
    const s = r.status;
    if (s === "passed") passed++;
    else if (s === "failed") failed++;
    else if (s === "timedOut") {
      failed++;
      timedOut++;
    } else if (s === "skipped") skipped++;
    else if (s === "interrupted") interrupted++;
  }

  const total = rows.length;

  // Warnings: same doc-step-warnings.json logic as urlRunSummaryAndSlack.ts — unique flowIds
  // with at least one warning, excluding flows that already failed/timed out.
  const failedFlowIds = new Set(
    rows.filter((r) => r.status === "failed" || r.status === "timedOut").map((r) => r.flowId).filter(Boolean)
  );
  let warnings = 0;
  try {
    const warningsPath = path.join(reportDir, "doc-step-warnings.json");
    if (fs.existsSync(warningsPath)) {
      const warningsData = JSON.parse(fs.readFileSync(warningsPath, "utf-8")) as {
        warnings?: Array<{ flowId?: string }>;
        warningFlows?: number;
      };
      if (Array.isArray(warningsData.warnings) && warningsData.warnings.length > 0) {
        const uniqueFlowIds = new Set(
          warningsData.warnings.map((w) => w.flowId).filter((id): id is string => !!id && !failedFlowIds.has(id))
        );
        warnings = uniqueFlowIds.size;
      } else {
        warnings = warningsData.warningFlows ?? 0;
      }
    }
  } catch {
    /* warnings count is optional */
  }

  const failedItems: DashboardFailedItem[] = rows
    .filter((r) => r.status === "failed" || r.status === "timedOut")
    .map((r) => ({
      name: r.documentUrl || r.flowId,
      detail: (r.error || "").slice(0, 500),
      docLink: r.documentUrl || "",
    }));

  const docLinks = [...new Set(rows.map((r) => r.documentUrl).filter((u): u is string => !!u))];

  const project = "docs-contentstack-ai-automation";
  const stagedReportFiles = new Set<string>();

  // items[]: EVERY checked flow (pass or fail), superset of failedItems. Prefer
  // url-run-summary.json's own `flows` array (already written earlier in the same
  // job by urlRunSummaryAndSlack.ts, same reportDir) since it's the exact source
  // this task asked to reuse; fall back to the `rows` already derived above from
  // raw Playwright JSON + flow-meta if that file is missing/malformed so this adapter
  // still degrades gracefully instead of throwing.
  let items: DashboardItem[] | undefined;
  try {
    const summaryPath = path.join(reportDir, "url-run-summary.json");
    const summary = readJson<{ flows?: Array<{ flowId: string; status: string; documentUrl?: string; error?: string }> }>(
      summaryPath
    );
    const summaryFlows = summary?.flows;
    const sourceRows =
      Array.isArray(summaryFlows) && summaryFlows.length > 0
        ? summaryFlows.map((f) => ({ flowId: f.flowId, status: f.status, documentUrl: f.documentUrl || "", error: f.error }))
        : rows;

    if (sourceRows.length > 0) {
      items = sourceRows.map((r) => {
        const status = mapFlowStatusToItemStatus(r.status);
        const reportUrl = stageFlowReportHtml(reportsOutDir, project, suite, reportDir, r.flowId, stagedReportFiles);
        return {
          name: r.documentUrl || r.flowId,
          status,
          detail: status === "pass" || status === "skipped" ? null : (r.error || "").slice(0, 500) || null,
          docLink: r.documentUrl || "",
          ...(reportUrl ? { reportUrl } : {}),
        };
      });
    }
  } catch {
    /* items[] is optional — degrade gracefully rather than fail the whole publish */
  }

  // warnings[]: flat list from doc-step-warnings.json's `warnings` array (every
  // individual warning, not deduped per-flow like the totals.warnings count above).
  let dashboardWarnings: DashboardWarning[] | undefined;
  try {
    const warningsPath = path.join(reportDir, "doc-step-warnings.json");
    const warningsData = readJson<{ warnings?: Array<{ documentUrl?: string; flowId?: string; warningMessage?: string }> }>(
      warningsPath
    );
    if (Array.isArray(warningsData?.warnings) && warningsData.warnings.length > 0) {
      dashboardWarnings = warningsData.warnings.map((w) => {
        const reportUrl = w.flowId
          ? stageFlowReportHtml(reportsOutDir, project, suite, reportDir, w.flowId, stagedReportFiles)
          : undefined;
        return {
          name: w.documentUrl || w.flowId || "",
          detail: w.warningMessage || "",
          docLink: w.documentUrl || "",
          ...(reportUrl ? { reportUrl } : {}),
        };
      });
    }
  } catch {
    /* warnings[] is optional — degrade gracefully rather than fail the whole publish */
  }

  const runId = process.env.GITHUB_RUN_ID || "";
  const runUrl = resolveRunUrl();

  const report: DashboardReport = {
    schemaVersion: 1,
    project,
    projectLabel: "Docs Contentstack AI Automation",
    suite,
    suiteLabel,
    runId,
    runUrl,
    artifactsUrl: `${runUrl}#artifacts`,
    timestamp: new Date().toISOString(),
    durationSeconds: resolveDurationSeconds(),
    totals: { total, passed, failed, skipped, warnings, timedOut, interrupted },
    failedItems,
    docLinks,
    ...(items && items.length > 0 ? { items } : {}),
    ...(dashboardWarnings && dashboardWarnings.length > 0 ? { warnings: dashboardWarnings } : {}),
  };

  if (reportsOutDir && stagedReportFiles.size > 0) {
    // eslint-disable-next-line no-console
    console.log(`✅ Staged ${stagedReportFiles.size} per-flow report HTML file(s) into ${reportsOutDir}`);
  }

  const json = JSON.stringify(report, null, 2);
  if (outPath) {
    fs.mkdirSync(path.dirname(path.resolve(process.cwd(), outPath)), { recursive: true });
    fs.writeFileSync(path.resolve(process.cwd(), outPath), json, "utf-8");
    // eslint-disable-next-line no-console
    console.log(`✅ Wrote dashboard report: ${outPath}`);
  } else {
    // eslint-disable-next-line no-console
    console.log(json);
  }
}

main();
