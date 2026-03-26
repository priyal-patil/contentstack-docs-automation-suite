/**
 * After CMS flows + docs-audit, organize HTML into report-bundle/CMS/<module>/
 * and write report-bundle/index.html (main entry) plus per-module index pages.
 * Also emits per-doc link-audit HTML pages next to flow reports.
 *
 * Usage: npx ts-node scripts/buildCmsReportBundle.ts [--reportDir reports/latest]
 */

import fs from "fs";
import path from "path";
import { generateFlowReportHtml } from "../core/flowReportGenerator";

const REPORT_DIR = path.resolve(
  process.cwd(),
  process.argv.includes("--reportDir") ? process.argv[process.argv.indexOf("--reportDir") + 1] : "reports/latest"
);

const BUNDLE_ROOT = "report-bundle";

function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeFileNameFromUrl(url: string): string {
  return Buffer.from(url).toString("base64").replace(/[/+=]/g, "_");
}

function normalizeDocUrl(u: string): string {
  return u.trim().replace(/\/$/, "");
}

function readJson<T>(p: string): T | null {
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
  } catch {
    return null;
  }
}

type CmsFlowMeta = { id: string; module: string; source: string };

function collectCmsFlowMeta(): Map<string, CmsFlowMeta> {
  const byId = new Map<string, CmsFlowMeta>();
  const cmsRoot = path.join(process.cwd(), "projects", "CMS");
  if (!fs.existsSync(cmsRoot)) return byId;
  for (const mod of fs.readdirSync(cmsRoot)) {
    const modPath = path.join(cmsRoot, mod);
    if (!fs.statSync(modPath).isDirectory()) continue;
    const flowsDir = path.join(modPath, "flows");
    if (!fs.existsSync(flowsDir)) continue;
    for (const f of fs.readdirSync(flowsDir)) {
      if (!f.endsWith(".flow.json")) continue;
      try {
        const j = JSON.parse(fs.readFileSync(path.join(flowsDir, f), "utf-8")) as {
          id?: string;
          source?: string;
        };
        if (j.id) byId.set(j.id, { id: j.id, module: mod, source: String(j.source || "") });
      } catch {
        /* skip */
      }
    }
  }
  return byId;
}

function moduleForDocUrl(docUrl: string, byId: Map<string, CmsFlowMeta>): string {
  const n = normalizeDocUrl(docUrl);
  for (const m of byId.values()) {
    if (!m.source) continue;
    if (normalizeDocUrl(m.source) === n) return m.module;
  }
  try {
    const u = new URL(docUrl);
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts[0] === "docs" && parts.length >= 3) return parts[2] || "_unmapped";
  } catch {
    /* ignore */
  }
  return "_unmapped";
}

type BrokenLink = { docUrl: string; brokenUrl: string; anchorText: string; status?: number; reason?: string };
type BrokenImage = { docUrl: string; imageUrl: string; alt: string; status?: number; reason?: string };
type DocAuditResult = {
  docUrl: string;
  brokenLinks: BrokenLink[];
  brokenImages: BrokenImage[];
  tableAudit?: { tableDetected?: boolean; warnings?: string[] };
  oldLogoDetected?: Array<{ docUrl: string; imageUrl: string; alt: string }>;
};

function buildLinkAuditHtml(doc: DocAuditResult, module: string): string {
  const bl = doc.brokenLinks || [];
  const bi = doc.brokenImages || [];
  const ta = doc.tableAudit;
  const oldL = doc.oldLogoDetected || [];
  const rowsBl = bl
    .map(
      (b) =>
        `<tr><td class="mono">${escapeHtml(b.anchorText)}</td><td class="mono"><a href="${escapeHtml(b.brokenUrl)}">${escapeHtml(b.brokenUrl)}</a></td><td>${b.status ?? "—"}</td><td>${escapeHtml(b.reason || "")}</td></tr>`
    )
    .join("");
  const rowsBi = bi
    .map(
      (b) =>
        `<tr><td class="mono"><a href="${escapeHtml(b.imageUrl)}">${escapeHtml(b.imageUrl)}</a></td><td>${escapeHtml(b.alt)}</td><td>${b.status ?? "—"}</td><td>${escapeHtml(b.reason || "")}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Link audit — ${escapeHtml(doc.docUrl)}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; background: #f6f7fb; color: #1f2937; }
    .wrap { max-width: 1100px; margin: 0 auto; }
    h1 { font-size: 1.15rem; }
    .meta { color: #6b7280; font-size: 13px; margin-bottom: 16px; word-break: break-all; }
    section { background: #fff; border-radius: 10px; padding: 16px; margin-bottom: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 8px 10px; border-bottom: 1px solid #eceff3; text-align: left; vertical-align: top; }
    th { background: #f8fafc; }
    .mono { font-family: ui-monospace, Menlo, monospace; font-size: 12px; word-break: break-all; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 12px; background: #eef2ff; }
  </style>
</head>
<body>
  <div class="wrap">
    <p><span class="badge">CMS / ${escapeHtml(module)}</span></p>
    <h1>Documentation link &amp; asset audit</h1>
    <p class="meta">Document: <a href="${escapeHtml(doc.docUrl)}" target="_blank" rel="noopener">${escapeHtml(doc.docUrl)}</a></p>
    <section>
      <h2>Broken links (${bl.length})</h2>
      <table>
        <thead><tr><th>Anchor text</th><th>URL</th><th>HTTP</th><th>Reason</th></tr></thead>
        <tbody>${rowsBl || "<tr><td colspan='4'>None</td></tr>"}</tbody>
      </table>
    </section>
    <section>
      <h2>Broken / suspect images (${bi.length})</h2>
      <table>
        <thead><tr><th>URL</th><th>Alt</th><th>HTTP</th><th>Reason</th></tr></thead>
        <tbody>${rowsBi || "<tr><td colspan='4'>None</td></tr>"}</tbody>
      </table>
    </section>
    <section>
      <h2>Table audit</h2>
      <p>Detected: ${ta?.tableDetected ? "yes" : "no"}</p>
      ${(ta?.warnings || []).length ? `<ul>${(ta!.warnings || []).map((w) => `<li>${escapeHtml(w)}</li>`).join("")}</ul>` : "<p>—</p>"}
    </section>
    <section>
      <h2>Old logo check</h2>
      <p>Matches: ${oldL.length}</p>
      ${oldL.length ? `<ul>${oldL.map((o) => `<li class="mono">${escapeHtml(o.imageUrl)} (${escapeHtml(o.alt)})</li>`).join("")}</ul>` : "<p>None</p>"}
    </section>
  </div>
</body>
</html>`;
}

type PwSuite = { title?: string; specs?: Array<{ title?: string }>; suites?: PwSuite[] };

function collectCmsFlowIdsFromResults(flowsPath: string): string[] {
  const pw = readJson<{ suites?: PwSuite[] }>(flowsPath);
  const ids: string[] = [];
  function visit(suite: PwSuite) {
    const t = String(suite?.title || "");
    if (/Project=CMS\b/.test(t)) {
      for (const spec of suite.specs || []) {
        const id = String(spec.title || "").trim();
        if (id) ids.push(id);
      }
    }
    for (const c of suite.suites || []) visit(c);
  }
  for (const s of pw?.suites || []) visit(s);
  return ids;
}

function main() {
  const flowsBackup = path.join(REPORT_DIR, "flows-results-cms.json");
  const flowsPath = fs.existsSync(flowsBackup) ? flowsBackup : path.join(REPORT_DIR, "flows-results.json");
  const summaryPath = path.join(REPORT_DIR, "docs-audit-summary.json");

  const byFlowId = collectCmsFlowMeta();
  const ranIds = new Set(collectCmsFlowIdsFromResults(flowsPath));

  const bundleAbs = path.join(REPORT_DIR, BUNDLE_ROOT);
  const cmsAbs = path.join(bundleAbs, "CMS");
  fs.mkdirSync(cmsAbs, { recursive: true });

  /** module -> { flowHtml[], linkAuditHtml[] } relative paths from bundle root */
  const moduleFiles = new Map<string, { flowReports: string[]; linkAudits: string[] }>();

  function ensureModule(m: string) {
    if (!moduleFiles.has(m)) moduleFiles.set(m, { flowReports: [], linkAudits: [] });
    return moduleFiles.get(m)!;
  }

  for (const flowId of ranIds) {
    const meta = byFlowId.get(flowId);
    const module = meta?.module || "_unknown";
    const subdir = path.join(BUNDLE_ROOT, "CMS", module);
    const rel = generateFlowReportHtml(flowId, REPORT_DIR, { subdir });
    if (rel) {
      const relFromBundle = path.relative(bundleAbs, rel).split(path.sep).join("/");
      ensureModule(module).flowReports.push(relFromBundle);
    }
  }

  const auditSummary = readJson<{
    results?: DocAuditResult[];
  }>(summaryPath);

  if (auditSummary?.results?.length) {
    for (const doc of auditSummary.results) {
      const mod = moduleForDocUrl(doc.docUrl, byFlowId);
      const modDir = path.join(cmsAbs, mod);
      fs.mkdirSync(modDir, { recursive: true });
      const fname = `link-audit-${safeFileNameFromUrl(doc.docUrl)}.html`;
      const out = path.join(modDir, fname);
      fs.writeFileSync(out, buildLinkAuditHtml(doc, mod), "utf-8");
      const relFromBundle = path.relative(bundleAbs, out).split(path.sep).join("/");
      ensureModule(mod).linkAudits.push(relFromBundle);
    }
  }

  /** Per-module index.html */
  for (const [mod, files] of moduleFiles) {
    const modDir = path.join(cmsAbs, mod);
    fs.mkdirSync(modDir, { recursive: true });
    const flowRows = [...new Set(files.flowReports)]
      .sort()
      .map((rel) => {
        const base = path.basename(rel);
        return `<li><a href="${escapeHtml(base)}">${escapeHtml(base)}</a> — flow step report</li>`;
      })
      .join("");
    const linkRows = [...new Set(files.linkAudits)]
      .sort()
      .map((rel) => {
        const base = path.basename(rel);
        return `<li><a href="${escapeHtml(base)}">${escapeHtml(base)}</a> — docs link / asset audit</li>`;
      })
      .join("");

    const modHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CMS — ${escapeHtml(mod)}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 28px; background: #eef1f5; color: #1a1d21; }
    .wrap { max-width: 900px; margin: 0 auto; }
    h1 { font-size: 1.35rem; }
    a { color: #1565c0; }
    section { background: #fff; border-radius: 10px; padding: 18px 20px; margin-bottom: 16px; border: 1px solid #e2e6eb; }
    ul { line-height: 1.7; }
    .back { margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="wrap">
    <p class="back"><a href="../../index.html">← Main report bundle</a></p>
    <h1>CMS · ${escapeHtml(mod)}</h1>
    <section>
      <h2>Flow reports (${files.flowReports.length})</h2>
      <ul>${flowRows || "<li class='muted'>None</li>"}</ul>
    </section>
    <section>
      <h2>Docs link-audit pages (${files.linkAudits.length})</h2>
      <ul>${linkRows || "<li class='muted'>None (run docs-audit with same REPORT_DIR)</li>"}</ul>
    </section>
  </div>
</body>
</html>`;
    fs.writeFileSync(path.join(modDir, "index.html"), modHtml, "utf-8");
  }

  const modulesSorted = [...moduleFiles.keys()].sort();
  const moduleLinks = modulesSorted
    .map(
      (m) =>
        `<tr><td><strong>${escapeHtml(m)}</strong></td><td><a href="CMS/${escapeHtml(m)}/index.html">Open module folder</a></td></tr>`
    )
    .join("");

  const mainHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CMS unified report bundle</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 28px; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
    .wrap { max-width: 960px; margin: 0 auto; }
    h1 { font-size: 1.5rem; font-weight: 700; margin: 0 0 10px 0; }
    .sub { color: #94a3b8; margin-bottom: 24px; font-size: 0.95rem; word-break: break-all; }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .card { background: #1e293b; border-radius: 10px; padding: 16px; border: 1px solid #334155; }
    .card a { color: #7dd3fc; font-weight: 600; text-decoration: none; }
    .card a:hover { text-decoration: underline; }
    .card p { margin: 8px 0 0 0; font-size: 0.8rem; color: #94a3b8; }
    section { background: #1e293b; border-radius: 10px; padding: 20px; margin-bottom: 18px; border: 1px solid #334155; }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #334155; }
    th { color: #94a3b8; font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>CMS automation &amp; docs link-audit — report bundle</h1>
    <p class="sub">Report directory: ${escapeHtml(REPORT_DIR)}</p>
    <div class="cards">
      <div class="card"><a href="../cms-dashboard.html">CMS dashboard</a><p>Flows, warnings, failures</p></div>
      <div class="card"><a href="../dashboard.html">Project dashboard</a><p>Flows + docs-audit merge</p></div>
      <div class="card"><a href="../cms-automation-report.xlsx">Excel workbook</a><p>All URLs, steps, link audit</p></div>
      <div class="card"><a href="../html/index.html">Playwright HTML report</a><p>Raw test run</p></div>
    </div>
    <section>
      <h2 style="margin-top:0">By module (project CMS)</h2>
      <table>
        <thead><tr><th>Module</th><th>Folder</th></tr></thead>
        <tbody>${moduleLinks || "<tr><td colspan='2'>No module reports generated yet.</td></tr>"}</tbody>
      </table>
    </section>
    <p style="color:#64748b;font-size:0.88rem">Flow HTML files live under <code>CMS/&lt;module&gt;/</code>. Each module page lists flow step reports and link-audit pages for that area.</p>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(bundleAbs, "index.html"), mainHtml, "utf-8");
  // eslint-disable-next-line no-console
  console.log(`✅ Report bundle: ${path.join(bundleAbs, "index.html")}`);
}

main();
