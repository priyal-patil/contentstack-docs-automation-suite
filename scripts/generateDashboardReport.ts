/**
 * Generate a dashboard HTML report from flows-results.json and docs-audit data.
 * Docs-audit: reads docs-audit-summary.json, or if missing/empty, aggregates from reports/latest/docs-audit-per-doc/*.json
 * (each doc-audit test writes its result there so the dashboard has 404s, tables, old logo even when summary runs early).
 * Run after test:flows and test:docs-audit. Output: reports/latest/dashboard.html
 *
 * Usage:
 *   npx ts-node scripts/generateDashboardReport.ts [--reportDir reports/latest]
 *   npm run report:dashboard
 */

import fs from "fs";
import path from "path";

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

function readJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return null;
  }
}

type DocAuditResult = {
  docUrl: string;
  brokenLinks?: Array<{ docUrl: string; brokenUrl: string; anchorText: string; status?: number; reason?: string }>;
  brokenImages?: Array<{ docUrl: string; imageUrl: string; alt: string; status?: number; reason?: string }>;
  tableAudit?: any;
  oldLogoDetected?: Array<{ docUrl: string; imageUrl: string; alt: string }>;
};

type DocAuditSummary = {
  scannedDocs?: number;
  docsWithBrokenLinks?: number;
  docsWithBrokenImages?: number;
  docsWithTables?: number;
  docsWithOldLogo?: number;
  results?: DocAuditResult[];
};

/** Load docs-audit: prefer summary.json; fallback to aggregating docs-audit-per-doc/*.json */
function loadDocsAuditSummary(): DocAuditSummary {
  const summaryPath = path.join(REPORT_DIR, "docs-audit-summary.json");
  const summary = readJson<DocAuditSummary>(summaryPath);
  if (summary?.results && summary.results.length > 0)
    return summary;

  const perDocDir = path.join(REPORT_DIR, "docs-audit-per-doc");
  if (!fs.existsSync(perDocDir)) return summary || {};

  const results: DocAuditResult[] = [];
  for (const f of fs.readdirSync(perDocDir)) {
    if (!f.endsWith(".json")) continue;
    try {
      const doc = readJson<DocAuditResult>(path.join(perDocDir, f));
      if (doc?.docUrl) results.push(doc);
    } catch {
      // skip invalid files
    }
  }

  const docsWithBrokenLinks = results.filter((r) => (r.brokenLinks?.length ?? 0) > 0).length;
  const docsWithBrokenImages = results.filter((r) => (r.brokenImages?.length ?? 0) > 0).length;
  const docsWithTables = results.filter((r) => r.tableAudit?.tableDetected).length;
  const docsWithOldLogo = results.filter((r) => (r.oldLogoDetected?.length ?? 0) > 0).length;

  return {
    scannedDocs: results.length,
    docsWithBrokenLinks,
    docsWithBrokenImages,
    docsWithTables,
    docsWithOldLogo,
    results,
  };
}

type FlowRow = { id: string; status: string; error?: string };
function collectFlowResults(pw: any): FlowRow[] {
  const rows: FlowRow[] = [];
  function walk(suite: any) {
    for (const spec of suite?.specs || []) {
      const title = String(spec?.title || "");
      if (!title) continue;
      for (const t of spec?.tests || []) {
        const res = (t?.results || [])[0];
        const status = res?.status || t?.status || (spec?.ok === false ? "failed" : "passed");
        const err = (res?.error?.message || t?.error?.message || "").slice(0, 500);
        rows.push({ id: title, status, error: err || undefined });
      }
    }
    for (const child of suite?.suites || []) walk(child);
  }
  for (const s of pw?.suites || []) {
    if (String(s?.file || "").includes("flows.spec")) walk(s);
  }
  return rows;
}

function main() {
  const flowsBackup = path.join(REPORT_DIR, "flows-results-cms.json");
  const flowsPath = fs.existsSync(flowsBackup) ? flowsBackup : path.join(REPORT_DIR, "flows-results.json");
  const failuresPath = path.join(REPORT_DIR, "doc-step-failures.json");

  const pw = readJson<{ suites?: any[] }>(flowsPath);
  const audit = loadDocsAuditSummary();
  const failures = readJson<{ failures?: Array<{ flowId: string; stepNumber: number; target: string; errorMessage?: string }> }>(failuresPath);

  const flowRows = pw ? collectFlowResults(pw) : [];
  const flowPassed = flowRows.filter((r) => r.status === "passed").length;
  const flowFailed = flowRows.filter((r) => r.status === "failed" || r.status === "timedOut").length;

  const failureByFlow = new Map<string, string>();
  for (const f of failures?.failures || []) {
    const key = f.flowId;
    const msg = `Step ${f.stepNumber}: ${f.target} — ${f.errorMessage || "element not found"}`;
    failureByFlow.set(key, (failureByFlow.get(key) || "") + msg + "; ");
  }

  const generatedAt = new Date().toISOString();
  const results = audit?.results || [];
  const brokenLinksFlat: Array<{ docUrl: string; brokenUrl: string; status?: number; anchorText: string; reason?: string }> = [];
  const brokenImagesFlat: Array<{ docUrl: string; imageUrl: string; status?: number; alt: string; reason?: string }> = [];
  const tableRows: Array<{ docUrl: string; ok: boolean; bodyRows: number; warnings: string }> = [];
  const oldLogoFlat: Array<{ docUrl: string; imageUrl: string; alt: string }> = [];
  const docsWithWarnings = new Map<
    string,
    { brokenLinks: number; brokenImages: number; tableWarn: boolean; oldLogo: number; warningTypes: string }
  >();

  for (const r of results) {
    const nLinks = r.brokenLinks?.length ?? 0;
    const nImages = r.brokenImages?.length ?? 0;
    const hasTableWarn =
      r.tableAudit?.tableDetected &&
      !(
        r.tableAudit?.tableExistsAndVisible &&
        r.tableAudit?.structure?.minBodyRowsMet &&
        r.tableAudit?.noBrokenLayout?.tableNotEmpty !== false &&
        (r.tableAudit?.warnings?.length || 0) === 0
      );
    const nOldLogo = r.oldLogoDetected?.length ?? 0;
    if (nLinks > 0 || nImages > 0 || hasTableWarn || nOldLogo > 0) {
      const parts: string[] = [];
      if (nLinks) parts.push(`${nLinks}× Broken link (404/410/5xx)`);
      if (nImages) parts.push(`${nImages}× Broken image (404/5xx or rendered broken)`);
      if (hasTableWarn) parts.push("Table warnings");
      if (nOldLogo) parts.push(`${nOldLogo}× Old logo`);
      docsWithWarnings.set(r.docUrl, {
        brokenLinks: nLinks,
        brokenImages: nImages,
        tableWarn: hasTableWarn,
        oldLogo: nOldLogo,
        warningTypes: parts.join("; "),
      });
    }
    for (const b of r.brokenLinks || [])
      brokenLinksFlat.push({
        docUrl: r.docUrl,
        brokenUrl: b.brokenUrl,
        anchorText: b.anchorText,
        status: b.status,
        reason: b.reason,
      });
    for (const b of r.brokenImages || [])
      brokenImagesFlat.push({
        docUrl: r.docUrl,
        imageUrl: b.imageUrl,
        alt: b.alt,
        status: b.status,
        reason: b.reason,
      });
    if (r.tableAudit?.tableDetected) {
      const t = r.tableAudit;
      const ok =
        t.tableExistsAndVisible &&
        t.structure?.minBodyRowsMet &&
        t.noBrokenLayout?.tableNotEmpty !== false &&
        (t.warnings?.length || 0) === 0;
      tableRows.push({
        docUrl: r.docUrl,
        ok,
        bodyRows: t.structure?.bodyRowCount ?? 0,
        warnings: (t.warnings || []).join("; ") || "—",
      });
    }
    for (const o of r.oldLogoDetected || [])
      oldLogoFlat.push({ docUrl: r.docUrl, imageUrl: o.imageUrl, alt: o.alt });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Automation Dashboard — Flows &amp; Docs Audit</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 24px; background: #f5f5f5; color: #1a1a1a; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 1.75rem; margin-bottom: 8px; }
    .meta { color: #666; font-size: 0.9rem; margin-bottom: 24px; }
    section { background: #fff; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    section h2 { font-size: 1.15rem; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 1px solid #eee; }
    .overview { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .card { background: #fff; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); text-align: center; }
    .card .value { font-size: 1.75rem; font-weight: 700; }
    .card .label { font-size: 0.8rem; color: #666; margin-top: 4px; }
    .card.passed .value { color: #0a0; }
    .card.failed .value { color: #c00; }
    .card.warn .value { color: #e09000; }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #eee; }
    th { background: #f8f8f8; font-weight: 600; }
    tr:hover { background: #fafafa; }
    .status-pass { color: #0a0; }
    .status-fail { color: #c00; }
    .status-warn { color: #e09000; }
    .mono { font-family: ui-monospace, monospace; font-size: 0.85em; }
    .empty { color: #888; font-style: italic; }
    a { color: #06c; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Automation Dashboard</h1>
    <p class="meta">Generated: ${escapeHtml(generatedAt)} · Report dir: ${escapeHtml(REPORT_DIR)}</p>
    <p class="meta">Includes: <strong>Flows</strong> (URLs with step JSON) · <strong>Docs audit</strong> (404s/broken links, broken images, table verification, old logo)</p>
    <p class="meta"><strong>How 404s are verified:</strong> Links and images are fetched using the same browser context as the loaded page (same cookies). Only <strong>404 Not Found</strong>, <strong>410 Gone</strong>, and <strong>5xx</strong> server errors are counted as broken; 401/403 are not counted to reduce false positives from bot protection.</p>
    <p class="meta"><strong>Old logo:</strong> Detection requires a reference image at <code>data/reference-old-logo.png</code>. If missing, the count is 0.</p>

    <div class="overview">
      <div class="card ${flowFailed > 0 ? "failed" : "passed"}">
        <div class="value">${flowRows.length}</div>
        <div class="label">Flows run</div>
      </div>
      <div class="card passed">
        <div class="value">${flowPassed}</div>
        <div class="label">Flows passed</div>
      </div>
      <div class="card failed">
        <div class="value">${flowFailed}</div>
        <div class="label">Flows failed</div>
      </div>
      <div class="card">
        <div class="value">${audit?.scannedDocs ?? 0}</div>
        <div class="label">Docs audited</div>
      </div>
      <div class="card warn">
        <div class="value">${audit?.docsWithBrokenLinks ?? 0}</div>
        <div class="label">Docs with broken links</div>
      </div>
      <div class="card warn">
        <div class="value">${audit?.docsWithBrokenImages ?? 0}</div>
        <div class="label">Docs with broken images</div>
      </div>
      <div class="card">
        <div class="value">${audit?.docsWithTables ?? 0}</div>
        <div class="label">Docs with tables</div>
      </div>
      <div class="card warn">
        <div class="value">${audit?.docsWithOldLogo ?? 0}</div>
        <div class="label">Docs with old logo</div>
      </div>
      <div class="card warn">
        <div class="value">${docsWithWarnings.size}</div>
        <div class="label">Docs with warnings</div>
      </div>
    </div>

    <section>
      <h2>Flow results (URLs with step JSON)</h2>
      <table>
        <thead><tr><th>Flow ID</th><th>Status</th><th>Error / details</th></tr></thead>
        <tbody>
          ${flowRows.length === 0 ? "<tr><td colspan='3' class='empty'>No flow results. Run test:flows first.</td></tr>" : flowRows.map((r) => `<tr>
            <td class="mono">${escapeHtml(r.id)}</td>
            <td class="status-${r.status === "passed" ? "pass" : "fail"}">${escapeHtml(r.status)}</td>
            <td>${escapeHtml(r.error || failureByFlow.get(r.id) || "—")}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </section>

    <section>
      <h2>Documents with warnings (summary)</h2>
      <p class="meta">Document URLs that have at least one warning. Warning types column describes the format of each issue.</p>
      <table>
        <thead><tr><th>Doc URL</th><th>Broken links</th><th>Broken images</th><th>Table warnings</th><th>Old logo</th><th>Warning types</th></tr></thead>
        <tbody>
          ${docsWithWarnings.size === 0 ? "<tr><td colspan='6' class='empty'>None</td></tr>" : Array.from(docsWithWarnings.entries()).map(([url, w]) => `<tr>
            <td class="mono"><a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(url.length > 70 ? url.slice(0, 70) + "…" : url)}</a></td>
            <td>${w.brokenLinks}</td>
            <td>${w.brokenImages}</td>
            <td class="status-${w.tableWarn ? "warn" : "pass"}">${w.tableWarn ? "Yes" : "—"}</td>
            <td>${w.oldLogo}</td>
            <td>${escapeHtml(w.warningTypes)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </section>

    <section>
      <h2>404s &amp; broken links</h2>
      <p class="meta">Only 404, 410, and 5xx are counted. Warning type describes the failure in a standard format.</p>
      <table>
        <thead><tr><th>Doc URL</th><th>Broken URL</th><th>Status</th><th>Anchor</th><th>Warning type</th></tr></thead>
        <tbody>
          ${brokenLinksFlat.length === 0 ? "<tr><td colspan='5' class='empty'>None</td></tr>" : brokenLinksFlat.map((b) => `<tr>
            <td class="mono"><a href="${escapeHtml(b.docUrl)}" target="_blank" rel="noopener">${escapeHtml(b.docUrl.slice(0, 60))}…</a></td>
            <td class="mono">${escapeHtml(String(b.brokenUrl).slice(0, 50))}…</td>
            <td>${b.status ?? "ERR"}</td>
            <td>${escapeHtml(String(b.anchorText).slice(0, 40))}</td>
            <td>${escapeHtml(String(b.reason ?? ""))}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </section>

    <section>
      <h2>Broken images</h2>
      <p class="meta">404/410/5xx or rendered broken (naturalWidth=0). Warning type describes the failure.</p>
      <table>
        <thead><tr><th>Doc URL</th><th>Image URL</th><th>Status</th><th>Alt</th><th>Warning type</th></tr></thead>
        <tbody>
          ${brokenImagesFlat.length === 0 ? "<tr><td colspan='5' class='empty'>None</td></tr>" : brokenImagesFlat.map((b) => `<tr>
            <td class="mono"><a href="${escapeHtml(b.docUrl)}" target="_blank" rel="noopener">${escapeHtml(b.docUrl.slice(0, 50))}…</a></td>
            <td class="mono">${escapeHtml(String(b.imageUrl).slice(0, 50))}…</td>
            <td>${b.status ?? "—"}</td>
            <td>${escapeHtml(String(b.alt).slice(0, 30))}</td>
            <td>${escapeHtml(String(b.reason ?? ""))}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </section>

    <section>
      <h2>Table verification</h2>
      <p class="meta">Warnings column lists specific issues (e.g. not visible, missing header, column count inconsistent).</p>
      <table>
        <thead><tr><th>Doc URL</th><th>Status</th><th>Body rows</th><th>Warnings</th></tr></thead>
        <tbody>
          ${tableRows.length === 0 ? "<tr><td colspan='4' class='empty'>No tables detected</td></tr>" : tableRows.map((t) => `<tr>
            <td class="mono"><a href="${escapeHtml(t.docUrl)}" target="_blank" rel="noopener">${escapeHtml(t.docUrl.slice(0, 55))}…</a></td>
            <td class="status-${t.ok ? "pass" : "warn"}">${t.ok ? "Pass" : "Warnings"}</td>
            <td>${t.bodyRows}</td>
            <td>${escapeHtml(t.warnings)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </section>

    <section>
      <h2>Old (orange) logo detected</h2>
      <p class="meta">Requires reference image at <code>data/reference-old-logo.png</code>. If the file is missing, no logos are detected and the count is 0.</p>
      <table>
        <thead><tr><th>Doc URL</th><th>Image URL</th><th>Alt</th></tr></thead>
        <tbody>
          ${oldLogoFlat.length === 0 ? "<tr><td colspan='3' class='empty'>None</td></tr>" : oldLogoFlat.map((o) => `<tr>
            <td class="mono"><a href="${escapeHtml(o.docUrl)}" target="_blank" rel="noopener">${escapeHtml(o.docUrl.slice(0, 50))}…</a></td>
            <td class="mono">${escapeHtml(o.imageUrl.slice(0, 50))}…</td>
            <td>${escapeHtml(o.alt)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </section>
  </div>
</body>
</html>`;

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const outPath = path.join(REPORT_DIR, "dashboard.html");
  fs.writeFileSync(outPath, html, "utf-8");
  console.log("✅ Dashboard written to", outPath);
}

main();
