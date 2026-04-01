import fs from "fs";
import path from "path";

type FlowMeta = { id: string; source: string };
type FlowResultRow = { id: string; status: string; error?: string };
type DocsResult = { project: string; url: string; status: "passed" | "failed"; httpStatus?: number; error?: string; title?: string };
type StepWarning = { documentUrl: string; flowId?: string; stepNumber?: number; target?: string; warningMessage?: string };
type DocsAuditPerDoc = {
  docUrl: string;
  brokenLinks?: Array<{ brokenUrl: string; status?: number; reason?: string }>;
  brokenImages?: Array<{ imageUrl: string; status?: number; reason?: string }>;
  tableAudit?: { warnings?: string[]; tableDetected?: boolean };
  oldLogoDetected?: Array<{ imageUrl: string }>;
};

function readJson<T>(p: string): T | null {
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
  } catch {
    return null;
  }
}

function escapeHtml(s: string): string {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function walkFlowFiles(dir: string, files: string[]) {
  if (!fs.existsSync(dir)) return;
  for (const n of fs.readdirSync(dir)) {
    const p = path.join(dir, n);
    const st = fs.statSync(p);
    if (st.isDirectory()) walkFlowFiles(p, files);
    else if (p.endsWith(".flow.json")) files.push(p);
  }
}

function loadCmsFlowMeta(root: string): FlowMeta[] {
  const files: string[] = [];
  walkFlowFiles(path.join(root, "projects", "CMS"), files);
  const out: FlowMeta[] = [];
  for (const f of files) {
    try {
      const j = JSON.parse(fs.readFileSync(f, "utf-8")) as { id?: string; source?: string };
      if (j.id && j.source) out.push({ id: j.id, source: j.source });
    } catch {
      // ignore
    }
  }
  return out;
}

function flowIdFromSpecTitle(title: string): string {
  const t = String(title || "").trim();
  if (/Project=CMS\b/.test(t)) {
    const parts = t.split(/\s+/).filter(Boolean);
    return parts.length ? parts[parts.length - 1] : t;
  }
  return t;
}

function collectFlowResults(flowsResults: any): FlowResultRow[] {
  const rows: FlowResultRow[] = [];
  const walkSuite = (suite: any, inCms: boolean) => {
    const suiteTitle = String(suite?.title || "");
    const hereIsCms = inCms || suiteTitle.includes("Project=CMS");
    for (const spec of suite?.specs || []) {
      const specTitle = String(spec?.title || "");
      const specIsCms = /Project=CMS\b/.test(specTitle);
      if (!hereIsCms && !specIsCms) continue;
      const id = flowIdFromSpecTitle(specTitle);
      for (const t of spec?.tests || []) {
        const results = Array.isArray(t?.results) ? t.results : [];
        const failed = results.find((x: any) => x?.status === "failed" || x?.status === "timedOut");
        const passed = results.find((x: any) => x?.status === "passed");
        const picked = failed || passed || results[0] || {};
        const status = String(picked?.status || t?.status || "unknown");
        const error = String(picked?.error?.message || t?.error?.message || "").slice(0, 500);
        rows.push({ id, status, error: error || undefined });
      }
    }
    for (const child of suite?.suites || []) walkSuite(child, hereIsCms);
  };
  for (const s of flowsResults?.suites || []) walkSuite(s, false);
  return rows;
}

function main() {
  const root = process.cwd();
  const arg = (name: string, fallback: string) => {
    const i = process.argv.indexOf(name);
    return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
  };
  const outDir = path.resolve(root, arg("--outDir", "reports/cms-run"));
  const flowsDir = path.resolve(root, arg("--flowsDir", outDir));
  const docsDir = path.resolve(root, arg("--docsDir", outDir));
  const auditDir = path.resolve(root, arg("--auditDir", outDir));

  const flowsResults = readJson<any>(path.join(flowsDir, "flows-results.json"));
  const docsResultsPayload = readJson<{ results?: DocsResult[] }>(path.join(docsDir, "docs-results.json"));
  const stepWarningsPayload = readJson<{ warnings?: StepWarning[] }>(path.join(flowsDir, "doc-step-warnings.json"));
  const docsAuditSummary = readJson<{ results?: DocsAuditPerDoc[] }>(path.join(auditDir, "docs-audit-summary.json"));

  const cmsFlowMeta = loadCmsFlowMeta(root);
  const flowRows = collectFlowResults(flowsResults);
  const flowStatusById = new Map<string, FlowResultRow>();
  for (const r of flowRows) flowStatusById.set(r.id, r);

  const executableRows = cmsFlowMeta.map((m) => {
    const res = flowStatusById.get(m.id);
    return {
      flowId: m.id,
      url: m.source,
      status: res?.status || "not_run",
      error: res?.error || "",
    };
  });

  const informationalRows = (docsResultsPayload?.results || [])
    .filter((r) => r.project === "CMS")
    .map((r) => ({
      url: r.url,
      status: r.status,
      error: r.error || "",
      httpStatus: r.httpStatus,
    }));

  const warningsByUrl = new Map<string, string[]>();
  for (const w of stepWarningsPayload?.warnings || []) {
    const url = String(w.documentUrl || "").trim();
    if (!url) continue;
    const msg = `Flow warning${w.flowId ? ` (${w.flowId})` : ""}${w.stepNumber ? ` step ${w.stepNumber}` : ""}: ${w.warningMessage || "mismatch warning"}`;
    const arr = warningsByUrl.get(url) || [];
    arr.push(msg);
    warningsByUrl.set(url, arr);
  }
  let auditResults: DocsAuditPerDoc[] = docsAuditSummary?.results || [];
  if (!auditResults.length) {
    const perDocDir = path.join(auditDir, "docs-audit-per-doc");
    if (fs.existsSync(perDocDir)) {
      for (const f of fs.readdirSync(perDocDir)) {
        if (!f.endsWith(".json")) continue;
        const doc = readJson<DocsAuditPerDoc>(path.join(perDocDir, f));
        if (doc?.docUrl) auditResults.push(doc);
      }
    }
  }

  for (const d of auditResults) {
    const url = d.docUrl;
    const arr = warningsByUrl.get(url) || [];
    for (const b of d.brokenLinks || []) arr.push(`Docs-audit broken link: ${b.brokenUrl} (${b.status ?? "ERR"}${b.reason ? `, ${b.reason}` : ""})`);
    for (const b of d.brokenImages || []) arr.push(`Docs-audit broken image: ${b.imageUrl} (${b.status ?? "ERR"}${b.reason ? `, ${b.reason}` : ""})`);
    for (const t of d.tableAudit?.warnings || []) arr.push(`Docs-audit table warning: ${t}`);
    if ((d.oldLogoDetected || []).length > 0) arr.push(`Docs-audit old logo detected: ${d.oldLogoDetected!.length}`);
    if (arr.length) warningsByUrl.set(url, arr);
  }

  const execPassed = executableRows.filter((r) => r.status === "passed").length;
  const execFailed = executableRows.filter((r) => r.status === "failed" || r.status === "timedOut").length;
  const infoPassed = informationalRows.filter((r) => r.status === "passed").length;
  const infoFailed = informationalRows.filter((r) => r.status === "failed").length;
  const warnedUrls = Array.from(warningsByUrl.keys()).length;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CMS URL Dashboard</title>
  <style>
    body{font-family:system-ui,-apple-system,sans-serif;background:#f6f7fb;margin:0;padding:24px;color:#1f2937}
    .wrap{max-width:1300px;margin:0 auto}
    h1{margin:0 0 8px 0}
    .meta{color:#6b7280;font-size:13px;margin-bottom:20px}
    .cards{display:grid;grid-template-columns:repeat(6,minmax(120px,1fr));gap:12px;margin-bottom:20px}
    .card{background:white;border-radius:10px;padding:14px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
    .value{font-size:26px;font-weight:700}
    .label{font-size:12px;color:#6b7280}
    .green{color:#15803d}.red{color:#b91c1c}.amber{color:#b45309}
    section{background:white;border-radius:10px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.08);margin-bottom:14px}
    h2{font-size:17px;margin:0 0 12px 0}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th,td{padding:9px 10px;border-bottom:1px solid #eceff3;text-align:left;vertical-align:top}
    th{background:#f8fafc}
    .mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;word-break:break-all}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>CMS URL Dashboard</h1>
    <div class="meta">Generated: ${escapeHtml(new Date().toISOString())}</div>
    <div class="cards">
      <div class="card"><div class="value">${executableRows.length}</div><div class="label">Executable URLs</div></div>
      <div class="card"><div class="value green">${execPassed}</div><div class="label">Executable Passed</div></div>
      <div class="card"><div class="value red">${execFailed}</div><div class="label">Executable Failed</div></div>
      <div class="card"><div class="value">${informationalRows.length}</div><div class="label">Informational URLs</div></div>
      <div class="card"><div class="value green">${infoPassed}</div><div class="label">Informational Passed</div></div>
      <div class="card"><div class="value amber">${warnedUrls}</div><div class="label">URLs with Warnings</div></div>
    </div>

    <section>
      <h2>Executable URLs (Flow runs)</h2>
      <table>
        <thead><tr><th>Flow ID</th><th>URL</th><th>Status</th><th>Error</th></tr></thead>
        <tbody>
          ${executableRows.map((r) => `<tr><td class="mono">${escapeHtml(r.flowId)}</td><td class="mono">${escapeHtml(r.url)}</td><td>${escapeHtml(r.status)}</td><td>${escapeHtml(r.error || "—")}</td></tr>`).join("") || "<tr><td colspan='4'>No rows</td></tr>"}
        </tbody>
      </table>
    </section>

    <section>
      <h2>Informational URLs (Docs checks)</h2>
      <table>
        <thead><tr><th>URL</th><th>Status</th><th>HTTP</th><th>Error</th></tr></thead>
        <tbody>
          ${informationalRows.map((r) => `<tr><td class="mono">${escapeHtml(r.url)}</td><td>${escapeHtml(r.status)}</td><td>${escapeHtml(String(r.httpStatus ?? "—"))}</td><td>${escapeHtml(r.error || "—")}</td></tr>`).join("") || "<tr><td colspan='4'>No rows</td></tr>"}
        </tbody>
      </table>
    </section>

    <section>
      <h2>Warnings by URL</h2>
      <table>
        <thead><tr><th>URL</th><th>Warnings</th></tr></thead>
        <tbody>
          ${Array.from(warningsByUrl.entries()).map(([url, items]) => `<tr><td class="mono">${escapeHtml(url)}</td><td>${items.map((i) => escapeHtml(i)).join("<br/>")}</td></tr>`).join("") || "<tr><td colspan='2'>No warnings</td></tr>"}
        </tbody>
      </table>
    </section>
  </div>
</body>
</html>`;

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "cms-url-dashboard.html"), html, "utf-8");

  const jsonSummary = {
    generatedAt: new Date().toISOString(),
    counts: {
      executableTotal: executableRows.length,
      executablePassed: execPassed,
      executableFailed: execFailed,
      informationalTotal: informationalRows.length,
      informationalPassed: infoPassed,
      informationalFailed: infoFailed,
      urlsWithWarnings: warnedUrls,
    },
    executable: executableRows,
    informational: informationalRows,
    warningsByUrl: Object.fromEntries(warningsByUrl),
  };
  fs.writeFileSync(path.join(outDir, "cms-url-report.json"), JSON.stringify(jsonSummary, null, 2), "utf-8");
  // eslint-disable-next-line no-console
  console.log("✅ CMS URL dashboard:", path.join(outDir, "cms-url-dashboard.html"));
  // eslint-disable-next-line no-console
  console.log("✅ CMS URL report:", path.join(outDir, "cms-url-report.json"));
}

main();

