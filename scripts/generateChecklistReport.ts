/**
 * Builds the HTML + JSON checklist report from reports/latest/checklist-per-doc/*.json.
 *
 *   npx ts-node scripts/generateChecklistReport.ts
 *
 * Output:
 *   reports/latest/checklist-report.html   — what a writer reads
 *   reports/latest/checklist-report.json   — machine readable roll-up
 */

import fs from "fs";
import path from "path";
import { CHECK_BY_ID, CHECKS } from "../core/checklist/registry";
import type { ChecklistDocResult, CheckStatus } from "../core/checklist/types";

const REPORT_DIR = path.resolve(process.cwd(), process.env.REPORT_DIR || "reports/latest");
const PER_DOC_DIR = path.join(REPORT_DIR, "checklist-per-doc");

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function load(): ChecklistDocResult[] {
  if (!fs.existsSync(PER_DOC_DIR)) return [];
  return fs
    .readdirSync(PER_DOC_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(PER_DOC_DIR, f), "utf-8")) as ChecklistDocResult)
    .sort((a, b) => a.docUrl.localeCompare(b.docUrl));
}

const STATUS_ORDER: CheckStatus[] = ["FAIL", "WARN", "PASS", "NA", "NOT_CHECKED"];
const STATUS_LABEL: Record<CheckStatus, string> = {
  FAIL: "Fail",
  WARN: "Finding",
  PASS: "Pass",
  NA: "N/A",
  NOT_CHECKED: "Not checked",
};

function statusBadge(s: CheckStatus) {
  return `<span class="badge ${s}">${STATUS_LABEL[s]}</span>`;
}

function renderDoc(doc: ChecklistDocResult): string {
  const bySource = (src: string) => doc.results.filter((r) => CHECK_BY_ID.get(r.id)?.source === src || (src === "checklist" && r.id === "CL-0.0"));

  const rows = (ids: typeof doc.results) =>
    ids
      .slice()
      .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || a.id.localeCompare(b.id, undefined, { numeric: true }))
      .map((r) => {
        const def = CHECK_BY_ID.get(r.id);
        const evidence = r.evidence.length
          ? `<table class="ev"><thead><tr><th>Where</th><th>Expected</th><th>Actual</th></tr></thead><tbody>${r.evidence
              .map((e) => `<tr><td>${esc(e.where)}</td><td>${esc(e.expected ?? "—")}</td><td>${esc(e.actual ?? "—")}</td></tr>`)
              .join("")}</tbody></table>`
          : "";
        const bug =
          r.issue || r.rootCause || r.suggestedFix
            ? `<div class="bug">
                 <div><span class="k">Issue</span>${esc(r.issue)}</div>
                 <div><span class="k">Root cause</span>${esc(r.rootCause)}</div>
                 <div><span class="k">Suggested fix</span>${esc(r.suggestedFix)}</div>
               </div>`
            : "";
        return `<tr class="row ${r.status}">
          <td class="id">${esc(r.id)}</td>
          <td>
            <div class="title">${esc(def?.title ?? r.id)}</div>
            <div class="ref">${esc(def?.reference ?? "")}${def ? ` · <em>${esc(def.tier)}</em>` : ""}</div>
            <div class="summary">${esc(r.summary)}</div>
            ${evidence}
            ${bug}
          </td>
          <td class="st">${statusBadge(r.status)}</td>
        </tr>`;
      })
      .join("");

  const c = doc.counts;
  const findings = doc.results.filter((r) => r.status === "WARN" || r.status === "FAIL");

  return `<section class="doc">
    <h2><a href="${esc(doc.docUrl)}" target="_blank" rel="noopener">${esc(doc.pageTitle || doc.docUrl)}</a></h2>
    <div class="meta">
      <code>${esc(doc.docUrl)}</code>
      <span>Project: <b>${esc(doc.project)}</b></span>
      <span>HTTP ${esc(doc.httpStatus ?? "—")}</span>
      <span>Audited ${esc(doc.runStartedAt)}</span>
      <span>${esc(doc.durationMs)} ms</span>
    </div>
    <div class="counts">
      <span class="badge FAIL">${c.FAIL} fail</span>
      <span class="badge WARN">${c.WARN} findings</span>
      <span class="badge PASS">${c.PASS} pass</span>
      <span class="badge NA">${c.NA} n/a</span>
      <span class="badge NOT_CHECKED">${c.NOT_CHECKED} not checked</span>
    </div>

    ${
      findings.length
        ? `<details open><summary class="sum">Findings (${findings.length})</summary>
             <table class="checks"><tbody>${rows(findings)}</tbody></table>
           </details>`
        : `<p class="clean">No findings on this page.</p>`
    }

    <details><summary class="sum">Checklist rules — full result (${bySource("checklist").length})</summary>
      <table class="checks"><tbody>${rows(bySource("checklist"))}</tbody></table>
    </details>

    <details><summary class="sum">Style guide rules — full result (${bySource("style-guide").length})</summary>
      <table class="checks"><tbody>${rows(bySource("style-guide"))}</tbody></table>
    </details>
  </section>`;
}

function main() {
  const docs = load();
  if (!docs.length) {
    console.error(`No per-doc results found in ${PER_DOC_DIR}. Run the docs-checklist project first.`);
    process.exit(1);
  }

  const total = docs.reduce(
    (acc, d) => {
      for (const k of Object.keys(d.counts) as CheckStatus[]) acc[k] += d.counts[k];
      return acc;
    },
    { PASS: 0, WARN: 0, FAIL: 0, NA: 0, NOT_CHECKED: 0 } as Record<CheckStatus, number>
  );

  // Which rules fired most often across the run.
  const byRule = new Map<string, number>();
  for (const d of docs) for (const r of d.results) if (r.status === "WARN" || r.status === "FAIL") byRule.set(r.id, (byRule.get(r.id) || 0) + 1);
  const topRules = [...byRule.entries()].sort((a, b) => b[1] - a[1]);

  const generatedAt = new Date().toISOString();
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Docs Checklist &amp; Style Guide Report</title>
<style>
  :root { --bg:#ffffff; --fg:#1b1c1e; --muted:#6b7280; --line:#e5e7eb; --card:#f9fafb;
          --fail:#b91c1c; --warn:#b45309; --pass:#15803d; --na:#6b7280; --nc:#6d28d9; }
  @media (prefers-color-scheme: dark) {
    :root { --bg:#0f1115; --fg:#e6e8eb; --muted:#9aa1ab; --line:#272b33; --card:#161a20;
            --fail:#f87171; --warn:#fbbf24; --pass:#4ade80; --na:#9aa1ab; --nc:#c4b5fd; }
  }
  * { box-sizing: border-box; }
  body { margin:0; padding:32px 20px 64px; background:var(--bg); color:var(--fg);
         font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif; }
  .wrap { max-width: 1100px; margin: 0 auto; }
  h1 { font-size: 26px; margin: 0 0 4px; }
  h2 { font-size: 19px; margin: 0 0 6px; }
  .lede { color: var(--muted); margin: 0 0 24px; }
  .summary-card { background: var(--card); border:1px solid var(--line); border-radius:10px; padding:16px 18px; margin-bottom: 28px; }
  .badge { display:inline-block; padding:2px 9px; border-radius:99px; font-size:12px; font-weight:600; border:1px solid currentColor; }
  .badge.FAIL{color:var(--fail)} .badge.WARN{color:var(--warn)} .badge.PASS{color:var(--pass)}
  .badge.NA{color:var(--na)} .badge.NOT_CHECKED{color:var(--nc)}
  .counts .badge { margin-right:8px; }
  .doc { border:1px solid var(--line); border-radius:10px; padding:18px; margin-bottom:22px; background:var(--card); }
  .meta { color:var(--muted); font-size:13px; display:flex; flex-wrap:wrap; gap:14px; margin-bottom:10px; }
  .meta code { font-size:12px; }
  .counts { margin: 10px 0 14px; }
  .sum { cursor:pointer; font-weight:600; margin:12px 0 6px; }
  table.checks { width:100%; border-collapse:collapse; }
  table.checks td { border-top:1px solid var(--line); padding:10px 8px; vertical-align:top; }
  td.id { width:96px; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:12.5px; color:var(--muted); white-space:nowrap; }
  td.st { width:110px; text-align:right; }
  .title { font-weight:600; }
  .ref { color:var(--muted); font-size:12px; margin:1px 0 4px; }
  .summary { margin-bottom:6px; }
  table.ev { width:100%; border-collapse:collapse; margin:6px 0; font-size:12.5px; }
  table.ev th { text-align:left; color:var(--muted); font-weight:600; border-bottom:1px solid var(--line); padding:4px 6px; }
  table.ev td { border-top:1px solid var(--line); padding:4px 6px; word-break:break-word; }
  .bug { margin-top:8px; padding:10px 12px; border-left:3px solid var(--warn); background:var(--bg); border-radius:0 6px 6px 0; font-size:13.5px; }
  .bug .k { display:inline-block; min-width:96px; font-weight:600; color:var(--muted); }
  .clean { color: var(--pass); font-weight:600; }
  .overflow { overflow-x:auto; }
  ul.rules { margin:8px 0 0; padding-left:20px; }
  footer { color:var(--muted); font-size:12.5px; margin-top:34px; border-top:1px solid var(--line); padding-top:14px; }
</style></head>
<body><div class="wrap">
  <h1>Docs Checklist &amp; Style Guide Report</h1>
  <p class="lede">Doc Testing Checklist (<code>Checklist</code> tab) + Contentstack Technical Documentation Style Guide v1.0.3, evaluated against published pages. Findings are advisory — they never fail the run.</p>

  <div class="summary-card">
    <div class="counts">
      <span class="badge FAIL">${total.FAIL} fail</span>
      <span class="badge WARN">${total.WARN} findings</span>
      <span class="badge PASS">${total.PASS} pass</span>
      <span class="badge NA">${total.NA} n/a</span>
      <span class="badge NOT_CHECKED">${total.NOT_CHECKED} not checked</span>
      &nbsp;across <b>${docs.length}</b> page(s), <b>${CHECKS.length}</b> rules per page.
    </div>
    ${
      topRules.length
        ? `<div style="margin-top:10px"><b>Rules firing most often</b><ul class="rules">${topRules
            .slice(0, 12)
            .map(([id, n]) => `<li><code>${esc(id)}</code> — ${esc(CHECK_BY_ID.get(id)?.title ?? "")} <span style="color:var(--muted)">(${n} page${n > 1 ? "s" : ""})</span></li>`)
            .join("")}</ul></div>`
        : ""
    }
  </div>

  ${docs.map(renderDoc).join("\n")}

  <footer>
    Generated ${esc(generatedAt)} · ${esc(docs.length)} page(s) ·
    Rules marked <em>manual</em> in the registry are always reported as “Not checked” — they need a human or a vision model, and the report says so rather than implying coverage.
  </footer>
</div></body></html>`;

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const htmlPath = path.join(REPORT_DIR, "checklist-report.html");
  const jsonPath = path.join(REPORT_DIR, "checklist-report.json");
  fs.writeFileSync(htmlPath, html, "utf-8");
  fs.writeFileSync(
    jsonPath,
    JSON.stringify({ generatedAt, totals: total, pages: docs, rulesFired: Object.fromEntries(topRules) }, null, 2),
    "utf-8"
  );
  console.log("HTML:", htmlPath);
  console.log("JSON:", jsonPath);
}

main();
