/**
 * CMS-only dashboard: timings, status, aligned tables. Reads same artifacts as generateCmsExcelReport.
 * Output: <reportDir>/cms-dashboard.html
 *
 * Usage: npx ts-node scripts/generateCmsDashboardHtml.ts [--reportDir reports/latest]
 */

import fs from "fs";
import path from "path";
import { collectCmsFlowSpecs, flowIdFromPlaywrightSpecTitle } from "../core/report/parseFlowSpecTitle";
import { resolveFlowsResultsPath } from "../core/report/resolveFlowsResultsPath";
import { parseExecutableFlowsPreferCumulative } from "../core/report/unifiedReportModel";

const REPORT_DIR = path.resolve(
  process.cwd(),
  process.argv.includes("--reportDir") ? process.argv[process.argv.indexOf("--reportDir") + 1] : "reports/latest"
);

function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function readJson<T>(p: string): T | null {
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
  } catch {
    return null;
  }
}

function walkFlowSources(cmsRoot: string, out: Map<string, string>) {
  if (!fs.existsSync(cmsRoot)) return;
  for (const name of fs.readdirSync(cmsRoot)) {
    const full = path.join(cmsRoot, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walkFlowSources(full, out);
    else if (name.endsWith(".flow.json")) {
      try {
        const j = JSON.parse(fs.readFileSync(full, "utf-8")) as { id?: string; source?: string };
        if (j.id && j.source) out.set(j.id, j.source);
      } catch {
        /* skip */
      }
    }
  }
}

type PwSuite = { title?: string; specs?: Array<{ title?: string; tests?: Array<{ results?: Array<{ status?: string; duration?: number; error?: { message?: string } }> }>; ok?: boolean }>; suites?: PwSuite[] };

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

function main() {
  const metaPath = path.join(REPORT_DIR, "run-meta.json");
  const flowsPath = resolveFlowsResultsPath(REPORT_DIR);
  const failuresPath = path.join(REPORT_DIR, "doc-step-failures.json");
  const warningsPath = path.join(REPORT_DIR, "doc-step-warnings.json");

  const meta = readJson<{
    startedAt?: string;
    finishedAt?: string;
    durationSeconds?: number;
    reportDir?: string;
  }>(metaPath);

  const pw = readJson<{ suites?: PwSuite[] }>(flowsPath);
  const failuresDoc = readJson<{ failures?: Array<{ flowId: string; documentUrl: string; stepNumber: number; target: string; errorMessage?: string }> }>(failuresPath);
  const warningsDoc = readJson<{ warnings?: Array<{ flowId: string; documentUrl: string; stepNumber: number; target: string; warningMessage?: string }> }>(warningsPath);

  const sourceByFlow = new Map<string, string>();
  walkFlowSources(path.join(process.cwd(), "projects", "CMS"), sourceByFlow);

  const cmsSpecs: NonNullable<PwSuite["specs"]> = collectCmsFlowSpecs(pw as { suites?: PwSuite[] });

  const durationByFlow = new Map<string, { durationMs: number; err: string }>();
  for (const spec of cmsSpecs) {
    const flowId = String(spec.title || "");
    const res = (spec.tests || [])[0]?.results?.[0] || {};
    const durationMs = Number(res.duration ?? 0);
    const err = String(res.error?.message || "").slice(0, 500);
    durationByFlow.set(flowId, { durationMs, err });
  }

  const docUrlFromCumulative = new Map<string, string>();
  const cumPath = path.join(REPORT_DIR, "url-run-summary-cumulative.json");
  if (fs.existsSync(cumPath)) {
    try {
      const cum = JSON.parse(fs.readFileSync(cumPath, "utf-8")) as {
        flows?: Array<{ flowId: string; documentUrl?: string }>;
      };
      for (const f of cum.flows || []) {
        if (f.flowId && f.documentUrl) docUrlFromCumulative.set(f.flowId, f.documentUrl);
      }
    } catch {
      /* ignore */
    }
  }

  type Row = {
    flowId: string;
    documentUrl: string;
    status: string;
    durationMs: number;
    durationHuman: string;
    err: string;
    wc: number;
    fc: number;
  };

  const failures = failuresDoc?.failures || [];
  const warnings = warningsDoc?.warnings || [];

  const rows: Row[] = [];
  const execSpecs = parseExecutableFlowsPreferCumulative(REPORT_DIR, pw);
  for (const ex of execSpecs) {
    if (ex.project !== "CMS") continue;
    const flowId = ex.flowId;
    const status = ex.pwStatus;
    const timing = durationByFlow.get(flowId);
    const durationMs = timing?.durationMs ?? 0;
    const err = timing?.err ?? "";
    const documentUrl = sourceByFlow.get(flowId) || docUrlFromCumulative.get(flowId) || "";
    const fc = failures.filter((f) => f.flowId === flowId).length;
    const wc = warnings.filter((w) => w.flowId === flowId).length;
    rows.push({
      flowId,
      documentUrl,
      status,
      durationMs,
      durationHuman: durationMs ? formatDuration(durationMs) : "—",
      err,
      wc,
      fc,
    });
  }

  const totalDurationMs = rows.reduce((a, r) => a + r.durationMs, 0);
  const passed = rows.filter((r) => r.status === "passed").length;
  const failed = rows.filter((r) => r.status === "failed" || r.status === "timedOut").length;
  const withWarnOnly = rows.filter((r) => r.status === "passed" && r.wc > 0).length;
  const docsWithWarnings = new Set(warnings.map((w) => w.flowId).filter(Boolean)).size;

  const durWall = meta?.durationSeconds != null ? `${meta.durationSeconds}s` : "— (see run-meta.json after batch script)";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CMS automation dashboard</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, Segoe UI, sans-serif; margin: 0; padding: 28px; background: #eef1f5; color: #1a1d21; }
    .wrap { max-width: 1280px; margin: 0 auto; }
    h1 { font-size: 1.6rem; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.02em; }
    .sub { color: #5c6570; font-size: 0.92rem; margin-bottom: 22px; line-height: 1.45; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; margin-bottom: 22px; }
    .card { background: #fff; border-radius: 10px; padding: 16px 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); text-align: center; border: 1px solid #e2e6eb; }
    .card .num { font-size: 1.65rem; font-weight: 700; line-height: 1.2; }
    .card .lbl { font-size: 0.78rem; color: #6b7280; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.04em; }
    .card.ok .num { color: #0d7d2e; }
    .card.bad .num { color: #c02626; }
    .card.warn .num { color: #b45309; }
    section { background: #fff; border-radius: 10px; padding: 20px 22px; margin-bottom: 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 1px solid #e2e6eb; }
    section h2 { font-size: 1.05rem; margin: 0 0 14px 0; padding-bottom: 10px; border-bottom: 1px solid #edf0f3; font-weight: 650; }
    table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #eef1f4; vertical-align: top; }
    th { background: #f6f8fa; font-weight: 600; color: #374151; white-space: nowrap; }
    tr:hover td { background: #fafbfd; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.82rem; word-break: break-all; }
    .st-pass { color: #0d7d2e; font-weight: 600; }
    .st-fail { color: #c02626; font-weight: 600; }
    .st-warn { color: #b45309; font-weight: 600; }
    .muted { color: #6b7280; }
    a { color: #1565c0; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>CMS documentation automation — run summary</h1>
    <p class="sub">
      Report directory: <span class="mono">${escapeHtml(REPORT_DIR)}</span><br />
      Wall-clock duration (batch): <strong>${escapeHtml(durWall)}</strong>
      ${meta?.startedAt ? ` · Started: ${escapeHtml(meta.startedAt)}` : ""}
      ${meta?.finishedAt ? ` · Finished: ${escapeHtml(meta.finishedAt)}` : ""}<br />
      Sum of per-flow durations (approx.): <strong>${escapeHtml(formatDuration(totalDurationMs))}</strong>
    </p>

    <div class="grid">
      <div class="card"><div class="num">${rows.length}</div><div class="lbl">CMS flows run</div></div>
      <div class="card ok"><div class="num">${passed}</div><div class="lbl">Passed</div></div>
      <div class="card bad"><div class="num">${failed}</div><div class="lbl">Failed</div></div>
      <div class="card warn"><div class="num">${withWarnOnly}</div><div class="lbl">Passed w/ doc warnings</div></div>
      <div class="card warn"><div class="num">${docsWithWarnings}</div><div class="lbl">Docs with warnings</div></div>
      <div class="card"><div class="num">${failures.length}</div><div class="lbl">Doc-step failure rows</div></div>
    </div>

    <section>
      <h2>All CMS flows</h2>
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Duration</th>
            <th>Flow ID</th>
            <th>Document URL</th>
            <th>Doc failures</th>
            <th>Doc warnings</th>
            <th>Playwright error</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (r) => `<tr>
            <td class="${r.status === "passed" ? "st-pass" : r.status === "failed" || r.status === "timedOut" ? "st-fail" : "st-warn"}">${escapeHtml(r.status)}</td>
            <td>${escapeHtml(r.durationHuman)}</td>
            <td class="mono">${escapeHtml(r.flowId)}</td>
            <td class="mono">${r.documentUrl ? `<a href="${escapeHtml(r.documentUrl)}" target="_blank" rel="noopener">${escapeHtml(r.documentUrl)}</a>` : "—"}</td>
            <td>${r.fc}</td>
            <td>${r.wc}</td>
            <td class="muted mono">${r.err ? escapeHtml(r.err) : "—"}</td>
          </tr>`
            )
            .join("")}
          ${rows.length === 0 ? "<tr><td colspan='7' class='muted'>No CMS flow results in flows-results.json for this report directory.</td></tr>" : ""}
        </tbody>
      </table>
    </section>

    <section>
      <h2>Doc-step warnings (detail)</h2>
      <table>
        <thead><tr><th>Flow</th><th>Step</th><th>Target</th><th>Message</th><th>Document URL</th></tr></thead>
        <tbody>
          ${warnings
            .map(
              (w) => `<tr>
            <td class="mono">${escapeHtml(w.flowId)}</td>
            <td>${w.stepNumber}</td>
            <td class="mono">${escapeHtml(w.target)}</td>
            <td>${escapeHtml(w.warningMessage || "")}</td>
            <td class="mono"><a href="${escapeHtml(w.documentUrl)}" target="_blank" rel="noopener">${escapeHtml(w.documentUrl)}</a></td>
          </tr>`
            )
            .join("")}
          ${warnings.length === 0 ? "<tr><td colspan='5' class='muted'>None</td></tr>" : ""}
        </tbody>
      </table>
    </section>

    <section>
      <h2>Doc-step failures (detail)</h2>
      <table>
        <thead><tr><th>Flow</th><th>Step</th><th>Target</th><th>Error</th><th>Document URL</th></tr></thead>
        <tbody>
          ${failures
            .map(
              (f) => `<tr>
            <td class="mono">${escapeHtml(f.flowId)}</td>
            <td>${f.stepNumber}</td>
            <td class="mono">${escapeHtml(f.target)}</td>
            <td class="muted">${escapeHtml(f.errorMessage || "")}</td>
            <td class="mono"><a href="${escapeHtml(f.documentUrl)}" target="_blank" rel="noopener">${escapeHtml(f.documentUrl)}</a></td>
          </tr>`
            )
            .join("")}
          ${failures.length === 0 ? "<tr><td colspan='5' class='muted'>None</td></tr>" : ""}
        </tbody>
      </table>
    </section>

    <p class="sub">Also open <span class="mono">cms-automation-report.xlsx</span> in this folder for the same data in Excel (multiple sheets).</p>
  </div>
</body>
</html>`;

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const out = path.join(REPORT_DIR, "cms-dashboard.html");
  fs.writeFileSync(out, html, "utf-8");
  // eslint-disable-next-line no-console
  console.log(`✅ CMS dashboard HTML: ${out}`);
}

main();
