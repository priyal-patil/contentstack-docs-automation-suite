/**
 * One HTML report per doc combining BOTH halves of a docs QA pass:
 *   A. the documented steps executed against the live app (flow suite)
 *   B. the checklist + style-guide audit of the published page
 *
 *   npx ts-node scripts/generateCombinedDocReport.ts <flow-id> <doc-url>
 *
 * Reads from REPORT_DIR: <flow-id>.flow.json step list, doc-step-failures.json,
 * doc-step-warnings.json and checklist-per-doc/<base64 url>.json.
 */

import fs from "fs";
import path from "path";
import { CHECK_BY_ID } from "../core/checklist/registry";
import type { ChecklistDocResult, CheckStatus } from "../core/checklist/types";

const REPORT_DIR = path.resolve(process.cwd(), process.env.REPORT_DIR || "reports/latest");
const flowId = process.argv[2];
const docUrl = process.argv[3];
if (!flowId || !docUrl) {
  console.error("Usage: ts-node scripts/generateCombinedDocReport.ts <flow-id> <doc-url>");
  process.exit(1);
}

const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function findFlowFile(root: string, id: string): string | null {
  const dir = path.join(root, "projects");
  const walk = (d: string): string | null => {
    for (const n of fs.readdirSync(d)) {
      const p = path.join(d, n);
      if (fs.statSync(p).isDirectory()) { const f = walk(p); if (f) return f; }
      else if (n === `${id}.flow.json`) return p;
    }
    return null;
  };
  return fs.existsSync(dir) ? walk(dir) : null;
}

const readJson = (p: string, fallback: any) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf-8")) : fallback);

const flowPath = findFlowFile(process.cwd(), flowId);
const flow = flowPath ? JSON.parse(fs.readFileSync(flowPath, "utf-8")) : { steps: [] };
const failuresDoc = readJson(path.join(REPORT_DIR, "doc-step-failures.json"), { failures: [] });
const warningsDoc = readJson(path.join(REPORT_DIR, "doc-step-warnings.json"), []);
const failures = (failuresDoc.failures || []).filter((f: any) => f.flowId === flowId);
const warnings = (Array.isArray(warningsDoc) ? warningsDoc : warningsDoc.warnings || []).filter(
  (w: any) => w.flowId === flowId
);
const firstFailure = failures.length ? Math.min(...failures.map((f: any) => f.stepNumber)) : null;
const warnByStep = new Map<number, string>(warnings.map((w: any) => [w.stepNumber, w.warningMessage]));

const safeName = (u: string) => Buffer.from(u).toString("base64").replace(/[/+=]/g, "_");
/** A SKIP_FLOWS pass audits the page without executing the steps — say so rather than showing them as passed. */
const ranManifest = readJson(path.join(REPORT_DIR, "ran-flows.json"), { flows: [] });
const ranEntry = (ranManifest.flows || []).find((f: any) => f.flowId === flowId);
const stepsExecuted = ranEntry ? ranEntry.stepsExecuted !== false : true;

const audit: ChecklistDocResult | null = readJson(
  path.join(REPORT_DIR, "checklist-per-doc", `${safeName(docUrl)}.json`), null
);

type StepRow = { n: number; action: string; target: string; value?: string; status: string; note: string };
const stepRows: StepRow[] = flow.steps.map((s: any, i: number) => {
  const n = i + 1;
  const fail = failures.find((f: any) => f.stepNumber === n);
  const warn = warnByStep.get(n);
  let status = "Passed", note = "";
  if (!stepsExecuted) { status = "Not run"; note = ""; }
  else if (fail) { status = "Failed"; note = fail.missingElementSummary || fail.errorMessage || ""; }
  else if (firstFailure !== null && n > firstFailure) { status = "Skipped"; note = `Not executed after step ${firstFailure} failed.`; }
  else if (warn) { status = "Warning"; note = warn; }
  return { n, action: s.action, target: s.target, value: s.value, status, note };
});

const notRun = stepRows.filter((r) => r.status === "Not run").length;
const passed = stepRows.filter((r) => r.status === "Passed").length;
const warned = stepRows.filter((r) => r.status === "Warning").length;
const failed = stepRows.filter((r) => r.status === "Failed").length;
const skipped = stepRows.filter((r) => r.status === "Skipped").length;

/** Title/lede facts come from the flow file so this works for any flow, not just the one it was written for. */
const flowTitle = String(flow.title || flow.name || "")
  || flowId.replace(/-/g, " ").replace(/\b\w/g, (m: string) => m.toUpperCase());
const flowProject = String(flow.project || "");
const flowModule = String(flow.module || "");
const flowNotes = String(flow.automationNotes || "");

const STATUS_ORDER: CheckStatus[] = ["FAIL", "WARN", "PASS", "NA", "NOT_CHECKED"];
const LABEL: Record<CheckStatus, string> = { FAIL: "Fail", WARN: "Finding", PASS: "Pass", NA: "N/A", NOT_CHECKED: "Not checked" };

function auditRows(results: ChecklistDocResult["results"]) {
  return results
    .slice()
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || a.id.localeCompare(b.id, undefined, { numeric: true }))
    .map((r) => {
      const def = CHECK_BY_ID.get(r.id);
      const ev = r.evidence.length
        ? `<table class="ev"><thead><tr><th>Where</th><th>Expected</th><th>Actual</th></tr></thead><tbody>${r.evidence
            .map((e) => `<tr><td>${esc(e.where)}</td><td>${esc(e.expected ?? "—")}</td><td>${esc(e.actual ?? "—")}</td></tr>`)
            .join("")}</tbody></table>` : "";
      const bug = r.issue
        ? `<div class="bug"><div><span class="k">Issue</span>${esc(r.issue)}</div><div><span class="k">Root cause</span>${esc(r.rootCause)}</div><div><span class="k">Suggested fix</span>${esc(r.suggestedFix)}</div></div>` : "";
      return `<tr class="row ${r.status}"><td class="id">${esc(r.id)}</td><td>
        <div class="title">${esc(def?.title ?? r.id)}</div>
        <div class="ref">${esc(def?.reference ?? "")}${def ? ` · <em>${esc(def.tier)}</em>` : ""}</div>
        <div class="summary">${esc(r.summary)}</div>${ev}${bug}</td>
        <td class="st"><span class="badge ${r.status}">${LABEL[r.status]}</span></td></tr>`;
    }).join("");
}

const c = audit?.counts ?? { PASS: 0, WARN: 0, FAIL: 0, NA: 0, NOT_CHECKED: 0 };
const auditFindings = audit ? audit.results.filter((r) => r.status === "WARN" || r.status === "FAIL") : [];

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Docs QA — ${esc(flowId)}</title>
<style>
 :root{--bg:#fff;--fg:#1b1c1e;--muted:#6b7280;--line:#e5e7eb;--card:#f9fafb;--fail:#b91c1c;--warn:#b45309;--pass:#15803d;--na:#6b7280;--nc:#6d28d9;--skip:#94a3b8}
 @media (prefers-color-scheme:dark){:root{--bg:#0f1115;--fg:#e6e8eb;--muted:#9aa1ab;--line:#272b33;--card:#161a20;--fail:#f87171;--warn:#fbbf24;--pass:#4ade80;--na:#9aa1ab;--nc:#c4b5fd;--skip:#64748b}}
 *{box-sizing:border-box} body{margin:0;padding:32px 20px 64px;background:var(--bg);color:var(--fg);font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
 .wrap{max-width:1120px;margin:0 auto} h1{font-size:26px;margin:0 0 4px} h2{font-size:20px;margin:34px 0 10px}
 .lede{color:var(--muted);margin:0 0 22px}
 .card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px 18px;margin-bottom:18px}
 .badge{display:inline-block;padding:2px 9px;border-radius:99px;font-size:12px;font-weight:600;border:1px solid currentColor}
 .badge.FAIL,.badge.Failed{color:var(--fail)} .badge.WARN,.badge.Warning{color:var(--warn)} .badge.PASS,.badge.Passed{color:var(--pass)}
 .badge.NA{color:var(--na)} .badge.NOT_CHECKED{color:var(--nc)} .badge.Skipped,.badge.Not_run{color:var(--skip)}
 .counts .badge{margin-right:8px}
 table{width:100%;border-collapse:collapse} td,th{border-top:1px solid var(--line);padding:9px 8px;vertical-align:top;text-align:left}
 th{color:var(--muted);font-size:12.5px;border-top:none}
 td.n{width:44px;color:var(--muted);font-family:ui-monospace,Menlo,monospace;font-size:12.5px}
 td.act{width:78px;font-family:ui-monospace,Menlo,monospace;font-size:12.5px;color:var(--muted)}
 td.stt{width:96px;text-align:right}
 td.id{width:96px;font-family:ui-monospace,Menlo,monospace;font-size:12.5px;color:var(--muted);white-space:nowrap}
 td.st{width:110px;text-align:right}
 .title{font-weight:600} .ref{color:var(--muted);font-size:12px;margin:1px 0 4px} .summary{margin-bottom:6px}
 table.ev{margin:6px 0;font-size:12.5px} table.ev th{border-bottom:1px solid var(--line)}
 .bug{margin-top:8px;padding:10px 12px;border-left:3px solid var(--warn);background:var(--bg);border-radius:0 6px 6px 0;font-size:13.5px}
 .bug .k{display:inline-block;min-width:96px;font-weight:600;color:var(--muted)}
 .note{color:var(--muted);font-size:13px;margin-top:3px}
 summary.sum{cursor:pointer;font-weight:600;margin:12px 0 6px}
 .callout{border-left:3px solid var(--warn);padding:10px 14px;background:var(--card);border-radius:0 6px 6px 0;margin:12px 0}
 footer{color:var(--muted);font-size:12.5px;margin-top:36px;border-top:1px solid var(--line);padding-top:14px}
 code{font-family:ui-monospace,Menlo,monospace;font-size:12.5px}
</style></head><body><div class="wrap">

<h1>Docs QA — ${esc(flowTitle)}</h1>
<p class="lede">${esc([flowProject, flowModule].filter(Boolean).join(" · "))} · <a href="${esc(docUrl)}" target="_blank" rel="noopener">${esc(docUrl)}</a><br>
Both halves of a docs QA pass: the documented steps executed against the live app, and the published page audited against the Doc Testing Checklist and the Style Guide v1.0.3.</p>

<div class="card">
  <b>A. Documented steps in the app</b>
  <div class="counts" style="margin-top:8px">
    ${stepsExecuted
      ? `<span class="badge Passed">${passed} passed</span>
    <span class="badge Warning">${warned} warning</span>
    <span class="badge Failed">${failed} failed</span>
    <span class="badge Skipped">${skipped} skipped</span>`
      : `<span class="badge Skipped">${notRun} not run</span>`}
    <span style="color:var(--muted)">of ${stepRows.length} steps</span>
  </div>
  <b style="display:block;margin-top:14px">B. Page audit</b>
  <div class="counts" style="margin-top:8px">
    <span class="badge FAIL">${c.FAIL} fail</span>
    <span class="badge WARN">${c.WARN} findings</span>
    <span class="badge PASS">${c.PASS} pass</span>
    <span class="badge NA">${c.NA} n/a</span>
    <span class="badge NOT_CHECKED">${c.NOT_CHECKED} not checked</span>
  </div>
</div>

<h2>A. Documented steps executed in the app</h2>
${stepsExecuted ? "" : `<div class="callout"><b>Steps were not executed in this pass.</b> The flow half was skipped (<code>SKIP_FLOWS=1</code>), so the rows below list what the document instructs, not what the app did. Only section B was verified.</div>`}
${flowNotes ? `<p class="note">${esc(flowNotes)}</p>` : ""}
<table><thead><tr><th>#</th><th>Action</th><th>Target (doc step)</th><th>Result</th></tr></thead><tbody>
${stepRows.map((r) => `<tr><td class="n">${r.n}</td><td class="act">${esc(r.action)}</td>
  <td>${esc(r.target)}${r.value ? ` <span class="note">value: <code>${esc(r.value)}</code></span>` : ""}
  ${r.note ? `<div class="note">${esc(r.note)}</div>` : ""}</td>
  <td class="stt"><span class="badge ${r.status.replace(/\s+/g, "_")}">${r.status}</span></td></tr>`).join("")}
</tbody></table>

<h2>B. Checklist &amp; Style Guide audit of the page</h2>
${audit ? `
${auditFindings.length ? `<details open><summary class="sum">Findings (${auditFindings.length})</summary>
  <table><tbody>${auditRows(auditFindings)}</tbody></table></details>` : `<p>No findings on this page.</p>`}
<details><summary class="sum">Checklist rules — full result</summary>
  <table><tbody>${auditRows(audit.results.filter((r) => CHECK_BY_ID.get(r.id)?.source === "checklist"))}</tbody></table></details>
<details><summary class="sum">Style guide rules — full result</summary>
  <table><tbody>${auditRows(audit.results.filter((r) => CHECK_BY_ID.get(r.id)?.source === "style-guide"))}</tbody></table></details>
` : `<p>No page-audit result found. Run the docs-checklist project for this URL.</p>`}

<footer>Generated ${esc(new Date().toISOString())} · flow <code>${esc(flowId)}</code> · report dir <code>${esc(path.relative(process.cwd(), REPORT_DIR))}</code><br>
Rules tiered <em>manual</em> are always reported “Not checked” — they need a human or a vision model, and this report says so rather than implying coverage.</footer>
</div></body></html>`;

const out = path.join(REPORT_DIR, `${flowId}-combined-report.html`);
fs.writeFileSync(out, html, "utf-8");
console.log("Combined report:", out);
console.log(
  stepsExecuted
    ? `steps: ${passed} passed / ${warned} warning / ${failed} failed / ${skipped} skipped`
    : `steps: not run (${notRun} documented steps listed, app half skipped)`
);
console.log(`audit: ${c.PASS} pass / ${c.WARN} findings / ${c.NA} n-a / ${c.NOT_CHECKED} not-checked`);
