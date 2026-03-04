/**
 * Generate Crawl Dashboard HTML.
 * Reads per-URL reports from reports/crawl-reports (or --reportDir).
 * Writes dashboard to reports/crawl-dashboard/dashboard.html (or --outDir).
 *
 * Usage:
 *   npx ts-node scripts/generateCrawlDashboard.ts
 *   npx ts-node scripts/generateCrawlDashboard.ts --reportDir reports/crawl-reports --outDir reports/crawl-dashboard
 *   npm run crawl:dashboard
 */

import fs from "fs";
import path from "path";

const REPORT_DIR = path.resolve(
  process.cwd(),
  process.argv.includes("--reportDir") ? process.argv[process.argv.indexOf("--reportDir") + 1] : "reports/crawl-reports"
);
const OUT_DIR = path.resolve(
  process.cwd(),
  process.argv.includes("--outDir") ? process.argv[process.argv.indexOf("--outDir") + 1] : "reports/crawl-dashboard"
);
const CSV_PATH = path.resolve(
  process.cwd(),
  process.argv.includes("--csvPath") ? process.argv[process.argv.indexOf("--csvPath") + 1] : "data/crawl-urls.csv"
);

function readUrlsFromCsv(csvPath: string): string[] {
  if (!fs.existsSync(csvPath)) return [];
  const raw = fs.readFileSync(csvPath, "utf-8");
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith("#"));
}

function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeIdFromUrl(url: string): string {
  return "r-" + Buffer.from(url).toString("base64url").slice(0, 60).replace(/[-_]/g, "x");
}

function panelIdByIndex(index: number): string {
  return "report-" + index;
}

type CrawlUrlReport = {
  initialUrl: string;
  pageUrl: string;
  pageStatus?: number;
  pageRedirected?: boolean;
  pageLoadError?: string;
  links: Array<{ url: string; anchorText: string; status?: number; reason: string; redirected?: boolean; finalUrl?: string }>;
  images: Array<{ url: string; alt: string; status?: number; reason: string; redirected?: boolean; finalUrl?: string }>;
  media: Array<{ url: string; type: string; status?: number; reason: string; redirected?: boolean; finalUrl?: string }>;
  summary: {
    linksTotal: number;
    linksOk: number;
    linksRedirect: number;
    linksBroken: number;
    imagesTotal: number;
    imagesOk: number;
    imagesBroken: number;
    mediaTotal: number;
    mediaOk: number;
    mediaBroken: number;
  };
  crawledAt?: string;
};

function loadReports(): CrawlUrlReport[] {
  const reports: CrawlUrlReport[] = [];
  if (!fs.existsSync(REPORT_DIR)) return reports;
  for (const f of fs.readdirSync(REPORT_DIR)) {
    if (!f.endsWith(".json") || f === "summary.json") continue;
    try {
      const r = JSON.parse(fs.readFileSync(path.join(REPORT_DIR, f), "utf-8")) as CrawlUrlReport;
      if (r.initialUrl) reports.push(r);
    } catch {
      // skip
    }
  }
  return reports.sort((a, b) => a.initialUrl.localeCompare(b.initialUrl));
}

function renderReportSection(report: CrawlUrlReport, index: number): string {
  const id = panelIdByIndex(index);
  const pageStatusClass = report.pageStatus === 200 ? "status-ok" : report.pageStatus && report.pageStatus >= 400 ? "status-fail" : "status-warn";
  const linkRows =
    report.links.length === 0
      ? ["<tr><td colspan='5' class='empty'>No links</td></tr>"]
      : report.links.slice(0, 200).map(
          (l) => `
        <tr>
          <td class="mono"><a href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.url.length > 60 ? l.url.slice(0, 60) + "…" : l.url)}</a></td>
          <td>${escapeHtml(String(l.anchorText).slice(0, 40))}</td>
          <td class="status-${l.status === 200 ? "ok" : l.status && l.status >= 400 ? "fail" : "warn"}">${l.status ?? "—"}</td>
          <td>${l.redirected ? "Yes" : "—"}</td>
          <td>${escapeHtml(l.reason)}</td>
        </tr>`
        );
  const imageRows =
    report.images.length === 0
      ? ["<tr><td colspan='4' class='empty'>No images</td></tr>"]
      : report.images.slice(0, 100).map(
          (i) => `
        <tr>
          <td class="mono"><a href="${escapeHtml(i.url)}" target="_blank" rel="noopener">${escapeHtml(i.url.length > 50 ? i.url.slice(0, 50) + "…" : i.url)}</a></td>
          <td>${escapeHtml(String(i.alt).slice(0, 30))}</td>
          <td class="status-${i.status === 200 ? "ok" : i.status && i.status >= 400 ? "fail" : "warn"}">${i.status ?? "—"}</td>
          <td>${escapeHtml(i.reason)}</td>
        </tr>`
        );
  const mediaRows =
    report.media.length === 0
      ? ["<tr><td colspan='4' class='empty'>No media</td></tr>"]
      : report.media.map(
          (m) => `
        <tr>
          <td class="mono"><a href="${escapeHtml(m.url)}" target="_blank" rel="noopener">${escapeHtml(m.url.length > 50 ? m.url.slice(0, 50) + "…" : m.url)}</a></td>
          <td>${escapeHtml(m.type)}</td>
          <td class="status-${m.status === 200 ? "ok" : m.status && m.status >= 400 ? "fail" : "warn"}">${m.status ?? "—"}</td>
          <td>${escapeHtml(m.reason)}</td>
        </tr>`
        );

  return `
    <div id="${id}" class="url-report-panel" data-url="${escapeHtml(report.initialUrl)}" data-index="${index}">
      <h2 class="panel-url-title">Report for this URL</h2>
      <p class="panel-url-url">${escapeHtml(report.initialUrl)}</p>
      <p class="meta">Page status: <span class="${pageStatusClass}">${report.pageStatus ?? "—"} ${report.pageRedirected ? "(redirected)" : ""}</span>
        ${report.pageLoadError ? ` · Error: ${escapeHtml(report.pageLoadError)}` : ""}
        · Crawled: ${escapeHtml(report.crawledAt || "")}</p>
      <div class="summary-cards">
        <span class="card">Links: ${report.summary.linksTotal} (${report.summary.linksOk} ok, ${report.summary.linksRedirect} redirect, ${report.summary.linksBroken} broken)</span>
        <span class="card">Images: ${report.summary.imagesTotal} (${report.summary.imagesOk} ok, ${report.summary.imagesBroken} broken)</span>
        <span class="card">Media: ${report.summary.mediaTotal} (${report.summary.mediaOk} ok, ${report.summary.mediaBroken} broken)</span>
      </div>
      <section>
        <h3>Links</h3>
        <table><thead><tr><th>URL</th><th>Anchor</th><th>Status</th><th>Redirect</th><th>Reason</th></tr></thead><tbody>${linkRows.join("")}</tbody></table>
      </section>
      <section>
        <h3>Images</h3>
        <table><thead><tr><th>URL</th><th>Alt</th><th>Status</th><th>Reason</th></tr></thead><tbody>${imageRows.join("")}</tbody></table>
      </section>
      <section>
        <h3>Media</h3>
        <table><thead><tr><th>URL</th><th>Type</th><th>Status</th><th>Reason</th></tr></thead><tbody>${mediaRows.join("")}</tbody></table>
      </section>
    </div>`;
}

function main() {
  const reports = loadReports();
  const allUrlsFromCsv = readUrlsFromCsv(CSV_PATH);
  const urlToReportIndex = new Map<string, number>();
  reports.forEach((r, i) => urlToReportIndex.set(r.initialUrl, i));
  const totalExpected = allUrlsFromCsv.length > 0 ? allUrlsFromCsv.length : reports.length;
  const generatedAt = new Date().toISOString();

  const overall = {
    total: reports.length,
    totalExpected,
    pageOk: reports.filter((r) => r.pageStatus === 200).length,
    pageRedirect: reports.filter((r) => r.pageRedirected).length,
    pageError: reports.filter((r) => r.pageLoadError || (r.pageStatus !== undefined && r.pageStatus >= 400)).length,
    totalLinks: reports.reduce((s, r) => s + r.summary.linksTotal, 0),
    totalLinksBroken: reports.reduce((s, r) => s + r.summary.linksBroken, 0),
    totalImages: reports.reduce((s, r) => s + r.summary.imagesTotal, 0),
    totalImagesBroken: reports.reduce((s, r) => s + r.summary.imagesBroken, 0),
  };

  const urlListItems: string[] = (allUrlsFromCsv.length > 0 ? allUrlsFromCsv : reports.map((r) => r.initialUrl)).map((url) => {
    const reportIndex = urlToReportIndex.get(url);
    if (reportIndex !== undefined) {
      const r = reports[reportIndex];
      return `<li><a href="#${panelIdByIndex(reportIndex)}" class="url-link" data-panel-id="${panelIdByIndex(reportIndex)}" data-url="${escapeHtml(url)}">${escapeHtml(url.length > 55 ? url.slice(0, 55) + "…" : url)}</a> <span class="badge status-${r.pageStatus === 200 ? "ok" : "warn"}">${r.pageStatus ?? "—"}</span></li>`;
    }
    return `<li><span class="url-pending" data-url="${escapeHtml(url)}" data-pending="true">${escapeHtml(url.length > 55 ? url.slice(0, 55) + "…" : url)}</span> <span class="badge badge-pending">Pending</span></li>`;
  });

  const panelsHtml = reports.map((r, i) => renderReportSection(r, i)).join("\n");
  const pendingPanelHtml = `
    <div id="pending-placeholder" class="url-report-panel pending-panel pending-placeholder" data-url="">
      <h2 class="panel-url-title">No report yet</h2>
      <p class="panel-url-url pending-url-display"></p>
      <p class="meta">Run the crawl to generate this URL's report.</p>
      <p class="meta">Command: <code>npm run crawl</code> or <code>npm run crawl -- --url-file data/crawl-urls.csv</code></p>
    </div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Crawl Dashboard</title>
  <style>
    * { box-sizing: border-box; }
    html, body { height: 100%; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; background: #1a1a2e; color: #eee; }
    .app { display: flex; flex-direction: column; height: 100vh; }
    .dashboard-header { flex: 0 0 auto; height: 30vh; min-height: 200px; width: 100%; background: #16213e; border-bottom: 2px solid #0f3460; padding: 20px 24px; overflow-y: auto; }
    .dashboard-header h1 { font-size: 1.4rem; margin: 0 0 8px 0; color: #e94560; }
    .dashboard-header .meta-top { color: #888; font-size: 0.85rem; margin-bottom: 16px; }
    .dashboard-header .overview { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; }
    .dashboard-header .card { background: #0f3460; padding: 10px 14px; border-radius: 8px; text-align: center; }
    .dashboard-header .card .value { font-size: 1.35rem; font-weight: 700; }
    .dashboard-header .card .label { font-size: 0.7rem; color: #888; margin-top: 2px; }
    .dashboard-body { flex: 1; min-height: 0; display: flex; width: 100%; }
    .sidebar { width: 30%; min-width: 260px; background: #16213e; padding: 16px; overflow-y: auto; border-right: 1px solid #0f3460; }
    .sidebar h2 { font-size: 0.95rem; margin: 0 0 12px 0; color: #e94560; }
    .sidebar ul { list-style: none; padding: 0; margin: 0; }
    .sidebar li { margin-bottom: 8px; }
    .sidebar a { color: #a2d2ff; text-decoration: none; font-size: 0.85rem; word-break: break-all; }
    .sidebar a:hover { text-decoration: underline; }
    .sidebar a.active { color: #7dd3fc; font-weight: 600; }
    .sidebar .badge { font-size: 0.7rem; margin-left: 4px; padding: 2px 6px; border-radius: 4px; }
    .sidebar .badge-pending { background: #444; color: #aaa; }
    .sidebar .url-pending { color: #666; font-size: 0.85rem; word-break: break-all; cursor: default; }
    .main { flex: 1; padding: 20px; overflow-y: auto; min-width: 0; }
    .main .body-title { font-size: 1rem; color: #a2d2ff; margin-bottom: 12px; }
    .status-ok { color: #4ade80; }
    .status-fail { color: #f87171; }
    .status-warn { color: #fbbf24; }
    .card .value.status-ok { color: #4ade80; }
    .card .value.status-fail { color: #f87171; }
    .card .value.status-warn { color: #fbbf24; }
    .url-report-panel { display: none; background: #16213e; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 1px solid #0f3460; height: 100%; }
    .url-report-panel.active { display: block; }
    .url-report-panel h2.panel-url-title { font-size: 0.9rem; color: #a2d2ff; margin-bottom: 4px; }
    .url-report-panel .panel-url-url { font-size: 0.95rem; color: #e94560; margin-bottom: 12px; word-break: break-all; }
    .url-report-panel .meta { color: #888; font-size: 0.85rem; margin-bottom: 12px; }
    .url-report-panel .summary-cards { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .url-report-panel .summary-cards .card { padding: 8px 12px; font-size: 0.8rem; background: #0f3460; }
    .url-report-panel section { margin-top: 20px; }
    .url-report-panel h3 { font-size: 0.95rem; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
    th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #0f3460; }
    th { background: #0f3460; color: #a2d2ff; }
    .mono { font-family: ui-monospace, monospace; font-size: 0.8em; }
    .url-report-panel table a { color: #7dd3fc; text-decoration: underline; }
    .url-report-panel table a:hover { color: #bae6fd; }
    .empty { color: #666; font-style: italic; }
    .panels { height: 100%; }
    .url-report-panel.pending-panel .panel-url-url { color: #888; }
    code { background: #0f3460; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; }
  </style>
</head>
<body>
  <div class="app">
    <header class="dashboard-header">
      <h1>Completed Crawl Dashboard</h1>
      <p class="meta-top">Consolidated audit report: <strong>${overall.total}</strong> of <strong>${overall.totalExpected}</strong> URL${overall.totalExpected !== 1 ? "s" : ""} have reports. Generated: ${escapeHtml(generatedAt)}</p>
      <p class="meta-top">Verified: Links (a href), Images (img), Media (video/audio/source). CSV: ${escapeHtml(CSV_PATH)} · Reports: ${escapeHtml(REPORT_DIR)}</p>
      <div class="overview">
        <div class="card"><div class="value">${overall.total}</div><div class="label">With report</div></div>
        <div class="card"><div class="value status-warn">${overall.totalExpected - overall.total}</div><div class="label">Pending</div></div>
        <div class="card"><div class="value status-ok">${overall.pageOk}</div><div class="label">Page 200</div></div>
        <div class="card"><div class="value status-warn">${overall.pageRedirect}</div><div class="label">Redirects</div></div>
        <div class="card"><div class="value status-fail">${overall.pageError}</div><div class="label">Page errors</div></div>
        <div class="card"><div class="value">${overall.totalLinks}</div><div class="label">Total links</div></div>
        <div class="card"><div class="value status-fail">${overall.totalLinksBroken}</div><div class="label">Broken links</div></div>
        <div class="card"><div class="value">${overall.totalImages}</div><div class="label">Total images</div></div>
        <div class="card"><div class="value status-fail">${overall.totalImagesBroken}</div><div class="label">Broken images</div></div>
      </div>
    </header>
    <div class="dashboard-body">
      <aside class="sidebar">
        <h2>URLs (${urlListItems.length})</h2>
        <p style="color:#888;font-size:0.8rem;margin-bottom:12px;">Click a URL to see its report. Pending = run crawl to generate.</p>
        <ul>${urlListItems.join("")}</ul>
      </aside>
      <div class="main">
        <p class="body-title">URL report — select a URL from the left</p>
        <div class="panels">${panelsHtml}${pendingPanelHtml}</div>
      </div>
    </div>
  </div>
  <script>
    (function() {
      var panels = document.querySelectorAll(".url-report-panel");
      var links = document.querySelectorAll(".sidebar a.url-link");
      var pendingEls = document.querySelectorAll(".sidebar .url-pending");
      var bodyTitle = document.querySelector(".main .body-title");
      var pendingPanel = document.getElementById("pending-placeholder");
      var pendingUrlDisplay = pendingPanel ? pendingPanel.querySelector(".pending-url-display") : null;
      var hash = window.location.hash.slice(1);
      function showPanel(id) {
        if (!id) return;
        panels.forEach(function(p) { p.classList.remove("active"); });
        links.forEach(function(a) { a.classList.remove("active"); });
        var el = document.getElementById(id);
        if (el) {
          el.classList.add("active");
          var url = el.getAttribute("data-url") || "";
          if (bodyTitle) bodyTitle.textContent = "URL report: " + (url.length > 70 ? url.slice(0, 70) + "…" : url);
          var link = document.querySelector('.sidebar a[data-panel-id="' + id + '"]');
          if (link) link.classList.add("active");
          try { window.history.replaceState(null, "", "#" + id); } catch (e) {}
        }
      }
      function showPending(url) {
        panels.forEach(function(p) { p.classList.remove("active"); });
        links.forEach(function(a) { a.classList.remove("active"); });
        if (pendingPanel) {
          pendingPanel.classList.add("active");
          if (pendingUrlDisplay) pendingUrlDisplay.textContent = url;
          pendingPanel.setAttribute("data-url", url);
        }
        if (bodyTitle) bodyTitle.textContent = "No report yet: " + (url.length > 60 ? url.slice(0, 60) + "…" : url);
        try { window.history.replaceState(null, "", "#pending"); } catch (e) {}
      }
      if (hash && hash !== "pending" && document.getElementById(hash)) showPanel(hash);
      else if (hash === "pending" && pendingPanel) showPending(pendingPanel.getAttribute("data-url") || "");
      else if (panels.length) {
        var first = document.querySelector(".url-report-panel:not(.pending-panel)");
        if (first) { showPanel(first.id); } else if (pendingPanel) pendingPanel.classList.add("active");
      }
      links.forEach(function(a) {
        a.addEventListener("click", function(e) {
          e.preventDefault();
          var id = a.getAttribute("data-panel-id");
          if (id) showPanel(id);
        });
      });
      pendingEls.forEach(function(span) {
        span.addEventListener("click", function() {
          var url = span.getAttribute("data-url") || "";
          showPending(url);
        });
      });
      window.addEventListener("hashchange", function() {
        var id = window.location.hash.slice(1);
        if (id === "pending") showPending(pendingPanel ? pendingPanel.getAttribute("data-url") || "" : "");
        else if (id && document.getElementById(id)) showPanel(id);
      });
    })();
  </script>
</body>
</html>`;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, "dashboard.html");
  fs.writeFileSync(outPath, html, "utf-8");
  console.log("Crawl dashboard written to", outPath);
}

main();
