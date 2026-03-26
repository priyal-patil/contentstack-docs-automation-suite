/**
 * HTML dashboard, master Excel/CSV, per-URL HTML, Slack-oriented JSON.
 */
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { generateFlowReportHtml } from "../flowReportGenerator";
import {
  collectUnifiedRows,
  driftRate,
  projectSummary,
  safeSegment,
  type UnifiedRow,
} from "./unifiedReportModel";

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

function buildInformationalHtml(row: UnifiedRow, audit: any | null): string {
  const docUrl = row.documentUrl;
  const bl = audit?.brokenLinks || [];
  const bi = audit?.brokenImages || [];
  const ta = audit?.tableAudit;
  const oldLogo = audit?.oldLogoDetected || [];

  const linkRows = (bl as any[])
    .map(
      (b) =>
        `<tr><td>${escapeHtml(b.anchorText)}</td><td class="mono"><a href="${escapeHtml(b.brokenUrl)}">${escapeHtml(b.brokenUrl)}</a></td><td>${b.status ?? ""}</td><td>${escapeHtml(b.reason || "")}</td></tr>`
    )
    .join("");
  const imgRows = (bi as any[])
    .map(
      (b) =>
        `<tr><td class="mono"><a href="${escapeHtml(b.imageUrl)}">${escapeHtml(b.imageUrl)}</a></td><td>${escapeHtml(b.alt)}</td><td>${b.status ?? ""}</td><td>${escapeHtml(b.reason || "")}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Informational audit — ${escapeHtml(docUrl)}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; background: #0f172a; color: #e2e8f0; }
    .wrap { max-width: 1100px; margin: 0 auto; padding: 28px; }
    h1 { font-size: 1.2rem; margin: 0 0 12px 0; }
    .meta { color: #94a3b8; font-size: 13px; word-break: break-all; margin-bottom: 20px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
    .pass { background: #14532d; color: #bbf7d0; }
    .warn { background: #713f12; color: #fde68a; }
    .fail { background: #7f1d1d; color: #fecaca; }
    section { background: #1e293b; border-radius: 10px; padding: 18px; margin-bottom: 16px; border: 1px solid #334155; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 8px 10px; border-bottom: 1px solid #334155; text-align: left; vertical-align: top; }
    th { color: #94a3b8; }
    .mono { font-family: ui-monospace, Menlo, monospace; font-size: 12px; word-break: break-all; }
    h2 { font-size: 1rem; margin: 0 0 14px 0; }
  </style>
</head>
<body>
  <div class="wrap">
    <p><span class="badge ${row.status === "PASS" ? "pass" : row.status === "WARNING" ? "warn" : "fail"}">${escapeHtml(row.status)} — ${escapeHtml(row.issueType)}</span></p>
    <h1>Documentation content audit</h1>
    <p class="meta"><a href="${escapeHtml(docUrl)}" target="_blank" rel="noopener">${escapeHtml(docUrl)}</a></p>
    <section>
      <h2>Broken links (${bl.length})</h2>
      <table>
        <thead><tr><th>Anchor</th><th>URL</th><th>HTTP</th><th>Reason</th></tr></thead>
        <tbody>${linkRows || "<tr><td colspan='4'>None</td></tr>"}</tbody>
      </table>
    </section>
    <section>
      <h2>Images (${bi.length})</h2>
      <table>
        <thead><tr><th>URL</th><th>Alt</th><th>HTTP</th><th>Reason</th></tr></thead>
        <tbody>${imgRows || "<tr><td colspan='4'>None</td></tr>"}</tbody>
      </table>
    </section>
    <section>
      <h2>Table audit</h2>
      <pre style="white-space:pre-wrap;font-size:12px;color:#cbd5e1">${escapeHtml(JSON.stringify(ta ?? {}, null, 2))}</pre>
    </section>
    <section>
      <h2>Legacy logo checks (${oldLogo.length})</h2>
      <ul>${(oldLogo as any[]).map((o) => `<li class="mono">${escapeHtml(o.imageUrl)} — ${escapeHtml(o.alt || "")}</li>`).join("") || "<li>None</li>"}</ul>
    </section>
  </div>
</body>
</html>`;
}

function findAuditForUrl(reportDir: string, docUrl: string): any | null {
  const summary = readJson<{ results?: any[] }>(path.join(reportDir, "docs-audit-summary.json"));
  const n = docUrl.trim().replace(/\/$/, "");
  const hit = summary?.results?.find((r) => (r.docUrl || "").trim().replace(/\/$/, "") === n);
  if (hit) return hit;
  const perDir = path.join(reportDir, "docs-audit-per-doc");
  if (!fs.existsSync(perDir)) return null;
  for (const f of fs.readdirSync(perDir)) {
    if (!f.endsWith(".json")) continue;
    try {
      const j = readJson<any>(path.join(perDir, f));
      if (j?.docUrl && j.docUrl.trim().replace(/\/$/, "") === n) return j;
    } catch {
      /* skip */
    }
  }
  return null;
}

export function renderUnifiedReport(
  reportDir: string,
  cwd: string
): { rows: UnifiedRow[]; dashboardPath: string; excelPath: string; csvPath: string; slackPath: string } {
  const rows = collectUnifiedRows({ reportDir, cwd });
  fs.mkdirSync(reportDir, { recursive: true });

  /** Per-URL HTML (one file per executable flow; informational per audit row) */
  const doneExecutable = new Set<string>();
  for (const row of rows) {
    const projDir = path.join(reportDir, "url-reports", safeSegment(row.project));
    fs.mkdirSync(projDir, { recursive: true });

    if (row.urlKind === "Executable") {
      if (doneExecutable.has(row.key)) continue;
      doneExecutable.add(row.key);
      generateFlowReportHtml(row.key, reportDir, {
        subdir: path.join("url-reports", safeSegment(row.project)),
        extraFooterHtml: `<section style="margin-top:20px;padding:12px 16px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;font-size:13px;color:#0c4a6e">
      <strong>Playwright artifacts</strong> — Failure screenshots and video are attached in the HTML test report:
      <a href="../../html/index.html">Open Playwright report</a> (path relative to this file).
    </section>`,
      });
    } else if (row.key.startsWith("http-")) {
      const http = readJson<{ results?: Array<{ url?: string; status?: string; error?: string; httpStatus?: number }> }>(
        path.join(reportDir, "docs-results.json")
      );
      const hit = http?.results?.find((r) => r.url === row.documentUrl);
      const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>HTTP check</title>
<style>body{font-family:system-ui;margin:24px;background:#f8fafc;} code{background:#e2e8f0;padding:2px 6px;border-radius:4px;}</style>
</head><body>
<h1>Doc HTTP reachability</h1>
<p><a href="${escapeHtml(row.documentUrl)}">${escapeHtml(row.documentUrl)}</a></p>
<p>Status: <strong>${escapeHtml(hit?.status || row.status)}</strong></p>
<p>HTTP: ${hit?.httpStatus ?? "—"}</p>
<p>${escapeHtml(hit?.error || row.details)}</p>
<p style="color:#64748b;font-size:14px">Failure screenshots and traces live in the Playwright report: <a href="../html/index.html">html/index.html</a></p>
</body></html>`;
      fs.writeFileSync(path.join(projDir, `${row.key}.html`), html, "utf-8");
    } else {
      const audit = findAuditForUrl(reportDir, row.documentUrl);
      fs.writeFileSync(path.join(projDir, `${row.key}.html`), buildInformationalHtml(row, audit), "utf-8");
    }
  }

  const byProj = projectSummary(rows);
  const generatedAt = new Date().toISOString();

  const cards = [...byProj.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([proj, s]) => {
      const dr = driftRate(proj, rows);
      const total = s.pass + s.warning + s.fail;
      return `<div class="card">
      <h2>${escapeHtml(proj)}</h2>
      <div class="stats">
        <span class="pill ok">${s.pass} Pass</span>
        <span class="pill warn">${s.warning} Warn</span>
        <span class="pill bad">${s.fail} Fail</span>
      </div>
      <p class="drift">Documentation drift rate: <strong>${dr}%</strong> <span class="hint">(executable flows with label/placement mismatch)</span></p>
      <p class="sub">Executable flows: ${s.executable} · Drift issues: ${s.drift} · Gap issues: ${s.gap}</p>
      <p class="sub">Total rows: ${total}</p>
    </div>`;
    })
    .join("");

  const tableRows = rows
    .map(
      (r) => `<tr>
    <td>${escapeHtml(r.project)}</td>
    <td>${escapeHtml(r.urlKind)}</td>
    <td>${escapeHtml(r.module)}</td>
    <td><span class="st ${r.status.toLowerCase()}">${escapeHtml(r.status)}</span></td>
    <td>${escapeHtml(r.issueType)}</td>
    <td class="mono small">${escapeHtml(r.details.slice(0, 400))}</td>
    <td class="mono small"><a href="${escapeHtml(r.reportHref)}">${escapeHtml(r.reportHref)}</a></td>
  </tr>`
    )
    .join("");

  const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Documentation automation — unified report</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, sans-serif; background: linear-gradient(165deg, #0f172a 0%, #1e293b 60%); color: #e2e8f0; min-height: 100vh; }
    .top { max-width: 1280px; margin: 0 auto; padding: 32px 24px 16px; }
    h1 { font-size: 1.65rem; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.02em; }
    .sub { color: #94a3b8; font-size: 0.95rem; margin-bottom: 24px; font-family: ui-monospace, monospace; font-size: 0.85rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; margin-bottom: 36px; }
    .card { background: rgba(30, 41, 59, 0.85); border: 1px solid #334155; border-radius: 14px; padding: 20px 22px; backdrop-filter: blur(8px); }
    .card h2 { margin: 0 0 14px; font-size: 1.15rem; }
    .stats { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .pill { padding: 6px 12px; border-radius: 999px; font-size: 0.8rem; font-weight: 600; }
    .pill.ok { background: #14532d; color: #bbf7d0; }
    .pill.warn { background: #713f12; color: #fde68a; }
    .pill.bad { background: #7f1d1d; color: #fecaca; }
    .drift { margin: 8px 0; font-size: 0.92rem; color: #cbd5e1; }
    .hint { font-size: 0.78rem; color: #64748b; }
    .sub { font-size: 0.82rem; color: #94a3b8; }
    section { max-width: 1280px; margin: 0 auto; padding: 0 24px 40px; }
    section h2 { font-size: 1.1rem; margin-bottom: 14px; }
    table { width: 100%; border-collapse: collapse; font-size: 0.88rem; background: rgba(15, 23, 42, 0.6); border-radius: 12px; overflow: hidden; border: 1px solid #334155; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #1e293b; vertical-align: top; }
    th { background: #1e293b; color: #94a3b8; font-weight: 600; }
    tr:hover td { background: rgba(51, 65, 85, 0.35); }
    .st.pass { color: #4ade80; font-weight: 600; }
    .st.warning { color: #fbbf24; font-weight: 600; }
    .st.fail { color: #f87171; font-weight: 600; }
    .small { font-size: 0.8rem; max-width: 420px; }
    a { color: #38bdf8; }
    .links { margin-top: 16px; font-size: 0.9rem; }
    .links a { margin-right: 16px; }
  </style>
</head>
<body>
  <div class="top">
    <h1>Documentation automation health</h1>
    <p class="sub">Generated ${escapeHtml(generatedAt)} · ${escapeHtml(reportDir)}</p>
    <div class="links">
      <a href="master-report.xlsx">Master Excel</a>
      <a href="master-report.csv">Master CSV</a>
      <a href="unified-report.json">Slack / JSON</a>
      <a href="html/index.html">Playwright HTML</a>
    </div>
  </div>
  <div class="grid">${cards || "<p>No rows yet — run tests and re-generate.</p>"}</div>
  <section>
    <h2>All URLs</h2>
    <table>
      <thead>
        <tr>
          <th>Project</th><th>URL type</th><th>Module</th><th>Status</th><th>Issue</th><th>Details</th><th>Report</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  </section>
</body>
</html>`;

  const dashboardPath = path.join(reportDir, "unified-dashboard.html");
  fs.writeFileSync(dashboardPath, dashboardHtml, "utf-8");

  const excelSheet = [
    [
      "Project",
      "URL Type",
      "Module",
      "Flow ID / Key",
      "Document URL",
      "Status",
      "Issue Type",
      "Details",
      "Playwright status",
      "Doc-step failures",
      "Doc-step warnings",
      "Broken links",
      "Broken images",
      "Table issue",
      "Old logo hits",
      "Report HTML (relative)",
    ],
    ...rows.map((r) => [
      r.project,
      r.urlKind,
      r.module,
      r.key,
      r.documentUrl,
      r.status,
      r.issueType,
      r.details,
      r.playwrightStatus ?? "",
      r.docStepFailures ?? "",
      r.docStepWarnings ?? "",
      r.brokenLinks ?? "",
      r.brokenImages ?? "",
      r.tableIssue ?? "",
      r.oldLogoHits ?? "",
      r.reportHref,
    ]),
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(excelSheet), "Master");
  const excelPath = path.join(reportDir, "master-report.xlsx");
  XLSX.writeFile(wb, excelPath);

  const csvPath = path.join(reportDir, "master-report.csv");
  const csv = excelSheet.map((line) => line.map((c) => csvEscape(String(c))).join(",")).join("\n");
  fs.writeFileSync(csvPath, csv, "utf-8");

  const slackPayload = {
    generatedAt,
    reportDir,
    summary: {
      pass: rows.filter((r) => r.status === "PASS").length,
      warning: rows.filter((r) => r.status === "WARNING").length,
      fail: rows.filter((r) => r.status === "FAIL").length,
    },
    projects: [...byProj.entries()].map(([name, s]) => ({
      name,
      pass: s.pass,
      warning: s.warning,
      fail: s.fail,
      documentationDriftRatePercent: driftRate(name, rows),
      executableFlows: s.executable,
      driftCount: s.drift,
      gapCount: s.gap,
    })),
    rows: rows.map((r) => ({
      project: r.project,
      urlKind: r.urlKind,
      module: r.module,
      key: r.key,
      documentUrl: r.documentUrl,
      status: r.status,
      issueType: r.issueType,
      details: r.details,
      reportHref: r.reportHref,
    })),
  };
  const slackPath = path.join(reportDir, "unified-report.json");
  fs.writeFileSync(slackPath, JSON.stringify(slackPayload, null, 2), "utf-8");

  return { rows, dashboardPath, excelPath, csvPath, slackPath };
}

function csvEscape(s: string): string {
  if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
