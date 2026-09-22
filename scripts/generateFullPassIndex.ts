/**
 * Index for a full docs QA pass: one row per doc, both halves side by side.
 *
 *   npx ts-node scripts/generateFullPassIndex.ts
 *
 * Reads REPORT_DIR/ran-flows.json, doc-step-failures.json, doc-step-warnings.json and
 * checklist-per-doc/<base64 url>.json — i.e. exactly what run-docs-full-pass.sh produced.
 */

import fs from "fs";
import path from "path";
import type { ChecklistDocResult } from "../core/checklist/types";

const REPORT_DIR = path.resolve(process.cwd(), process.env.REPORT_DIR || "reports/latest");

const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const readJson = (p: string, fallback: any) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf-8")) : fallback);
const safeName = (u: string) => Buffer.from(u).toString("base64").replace(/[/+=]/g, "_");

type Ran = { flowId: string; project: string; module: string; docUrl: string; stepsExecuted?: boolean };
const manifest = readJson(path.join(REPORT_DIR, "ran-flows.json"), { flows: [] as Ran[] });
const ran: Ran[] = manifest.flows || [];
if (!ran.length) {
  console.log("No flows in ran-flows.json — nothing to index.");
  process.exit(0);
}

const failuresDoc = readJson(path.join(REPORT_DIR, "doc-step-failures.json"), { failures: [] });
const warningsDoc = readJson(path.join(REPORT_DIR, "doc-step-warnings.json"), { warnings: [] });
const allFailures: any[] = failuresDoc.failures || [];
const allWarnings: any[] = Array.isArray(warningsDoc) ? warningsDoc : warningsDoc.warnings || [];

function findFlowFile(id: string): string | null {
  const walk = (d: string): string | null => {
    if (!fs.existsSync(d)) return null;
    for (const n of fs.readdirSync(d)) {
      const p = path.join(d, n);
      if (fs.statSync(p).isDirectory()) { const f = walk(p); if (f) return f; }
      else if (n === `${id}.flow.json`) return p;
    }
    return null;
  };
  return walk(path.join(process.cwd(), "projects"));
}

const rows = ran.map((r) => {
  const flowPath = findFlowFile(r.flowId);
  const flow = flowPath ? JSON.parse(fs.readFileSync(flowPath, "utf-8")) : { steps: [] };
  const totalSteps = (flow.steps || []).length;
  const fails = allFailures.filter((f) => f.flowId === r.flowId);
  const warns = allWarnings.filter((w) => w.flowId === r.flowId);
  const firstFailure = fails.length ? Math.min(...fails.map((f: any) => f.stepNumber)) : null;
  const failed = fails.length;
  const skipped = firstFailure !== null ? Math.max(0, totalSteps - firstFailure) : 0;
  const warned = warns.length;
  const passed = Math.max(0, totalSteps - failed - skipped - warned);

  const audit: ChecklistDocResult | null = readJson(
    path.join(REPORT_DIR, "checklist-per-doc", `${safeName(r.docUrl)}.json`),
    null
  );
  const c = audit?.counts ?? { PASS: 0, WARN: 0, FAIL: 0, NA: 0, NOT_CHECKED: 0 };

  const stepsExecuted = (r as any).stepsExecuted !== false;

  const combined = `${r.flowId}-combined-report.html`;
  const hasCombined = fs.existsSync(path.join(REPORT_DIR, combined));

  return { ...r, totalSteps, stepsExecuted, passed, warned, failed, skipped, audit, c, combined, hasCombined };
});

const totalFailed = rows.reduce((n, r) => n + r.failed, 0);
const totalFindings = rows.reduce((n, r) => n + r.c.WARN + r.c.FAIL, 0);
const auditedUrls = new Set(rows.filter((r) => r.audit).map((r) => r.docUrl)).size;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Docs QA full pass</title>
<style>
 :root{--bg:#fff;--fg:#1b1c1e;--muted:#6b7280;--line:#e5e7eb;--card:#f9fafb;--fail:#b91c1c;--warn:#b45309;--pass:#15803d;--na:#6b7280;--nc:#6d28d9}
 @media (prefers-color-scheme:dark){:root{--bg:#0f1115;--fg:#e6e8eb;--muted:#9aa1ab;--line:#272b33;--card:#161a20;--fail:#f87171;--warn:#fbbf24;--pass:#4ade80;--na:#9aa1ab;--nc:#c4b5fd}}
 *{box-sizing:border-box} body{margin:0;padding:32px 20px 64px;background:var(--bg);color:var(--fg);font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
 .wrap{max-width:1180px;margin:0 auto} h1{font-size:26px;margin:0 0 4px} .lede{color:var(--muted);margin:0 0 22px}
 .card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px 18px;margin-bottom:22px}
 .badge{display:inline-block;padding:2px 9px;border-radius:99px;font-size:12px;font-weight:600;border:1px solid currentColor;margin-right:6px}
 .badge.FAIL{color:var(--fail)} .badge.WARN{color:var(--warn)} .badge.PASS{color:var(--pass)}
 .badge.NA{color:var(--na)} .badge.NOT_CHECKED{color:var(--nc)}
 table{width:100%;border-collapse:collapse} td,th{border-top:1px solid var(--line);padding:10px 8px;vertical-align:top;text-align:left}
 th{color:var(--muted);font-size:12.5px;border-top:none} td.num{white-space:nowrap}
 .doc{font-size:12.5px;color:var(--muted);word-break:break-all}
 a{color:inherit} footer{color:var(--muted);font-size:12.5px;margin-top:36px;border-top:1px solid var(--line);padding-top:14px}
 code{font-family:ui-monospace,Menlo,monospace;font-size:12.5px}
</style></head><body><div class="wrap">
<h1>Docs QA full pass</h1>
<p class="lede">${rows.length} flow(s) · ${auditedUrls} page(s) audited · generated ${esc(new Date().toISOString())}</p>

<div class="card">
  <b>A. Documented steps in the app</b> — ${rows.some((r) => r.stepsExecuted)
    ? `<span class="badge FAIL">${totalFailed} failed step(s)</span> <span style="color:var(--muted)">across ${rows.filter((r) => r.stepsExecuted).length} flow(s)</span>`
    : `<span style="color:var(--muted)">not run in this pass (SKIP_FLOWS) — only the page audit below was verified</span>`}
  <div style="margin-top:12px"><b>B. Checklist &amp; Style Guide</b> —
  <span class="badge WARN">${totalFindings} finding(s)</span>
  <span style="color:var(--muted)">findings never fail the pass; only an unloadable page does</span></div>
</div>

<table><thead><tr>
  <th>Flow</th><th>Doc</th>
  <th class="num">Steps<br><span style="font-weight:400">pass / warn / fail / skip</span></th>
  <th class="num">Page audit<br><span style="font-weight:400">pass / find / n-a / not-checked</span></th>
  <th>Report</th>
</tr></thead><tbody>
${rows.map((r) => `<tr>
  <td><b>${esc(r.flowId)}</b><div class="doc">${esc(r.project)} · ${esc(r.module)}</div></td>
  <td class="doc"><a href="${esc(r.docUrl)}" target="_blank" rel="noopener">${esc(r.docUrl)}</a></td>
  <td class="num">${r.stepsExecuted
    ? `<span class="badge PASS">${r.passed}</span><span class="badge WARN">${r.warned}</span><span class="badge FAIL">${r.failed}</span><span class="badge NA">${r.skipped}</span>`
    : `<span style="color:var(--muted)">not run (${r.totalSteps} steps)</span>`}</td>
  <td class="num">${r.audit
    ? `<span class="badge PASS">${r.c.PASS}</span><span class="badge WARN">${r.c.WARN + r.c.FAIL}</span><span class="badge NA">${r.c.NA}</span><span class="badge NOT_CHECKED">${r.c.NOT_CHECKED}</span>`
    : `<span style="color:var(--muted)">not audited</span>`}</td>
  <td>${r.hasCombined ? `<a href="${esc(r.combined)}">combined report →</a>` : `<span style="color:var(--muted)">—</span>`}</td>
</tr>`).join("")}
</tbody></table>

<footer>Report dir <code>${esc(path.relative(process.cwd(), REPORT_DIR))}</code>.
Half A answers “do the documented steps work”; half B answers “does the page follow our own documentation rules”.
Rules automation cannot judge are reported “Not checked” rather than silently passed.</footer>
</div></body></html>`;

const out = path.join(REPORT_DIR, "full-pass-index.html");
fs.writeFileSync(out, html, "utf-8");
console.log("Full-pass index:", out);
console.log(`steps: ${totalFailed} failed across ${rows.length} flow(s) · audit: ${totalFindings} finding(s) on ${auditedUrls} page(s)`);
