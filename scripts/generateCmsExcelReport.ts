/**
 * Build cms-automation-report.xlsx from flows-results.json, doc-step-failures.json,
 * doc-step-warnings.json, docs-audit-summary.json (optional), and flow metadata under projects/CMS.
 *
 * Usage: npx ts-node scripts/generateCmsExcelReport.ts [--reportDir reports/latest]
 */

import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { collectCmsFlowSpecs } from "../core/report/parseFlowSpecTitle";
import { expandPlaywrightSpecToFlowResults } from "../core/report/playwrightFlowStepExpansion";
import { resolveFlowsResultsPath } from "../core/report/resolveFlowsResultsPath";

const REPORT_DIR = path.resolve(
  process.cwd(),
  process.argv.includes("--reportDir") ? process.argv[process.argv.indexOf("--reportDir") + 1] : "reports/latest"
);

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

type PwResult = { status?: string; duration?: number; error?: { message?: string } };
type PwTest = { results?: PwResult[]; title?: string };
type PwSpec = { title?: string; tests?: PwTest[] };
type PwSuite = { title?: string; specs?: PwSpec[]; suites?: PwSuite[] };

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

function normUrl(u: string): string {
  return u.trim().replace(/\/$/, "");
}

type FlowMeta = { flowId: string; module: string; source: string };

/** Map normalized source URL -> flow id + module */
function collectFlowMetaBySource(): Map<string, FlowMeta> {
  const bySource = new Map<string, FlowMeta>();
  const cmsRoot = path.join(process.cwd(), "projects", "CMS");
  if (!fs.existsSync(cmsRoot)) return bySource;
  for (const mod of fs.readdirSync(cmsRoot)) {
    const modPath = path.join(cmsRoot, mod);
    if (!fs.statSync(modPath).isDirectory()) continue;
    const flowsDir = path.join(modPath, "flows");
    if (!fs.existsSync(flowsDir)) continue;
    for (const f of fs.readdirSync(flowsDir)) {
      if (!f.endsWith(".flow.json")) continue;
      try {
        const j = JSON.parse(fs.readFileSync(path.join(flowsDir, f), "utf-8")) as { id?: string; source?: string };
        if (j.id && j.source) bySource.set(normUrl(String(j.source)), { flowId: j.id, module: mod, source: String(j.source) });
      } catch {
        /* skip */
      }
    }
  }
  return bySource;
}

type DocAuditRow = {
  docUrl: string;
  brokenLinks: Array<{ brokenUrl: string; anchorText: string; status?: number; reason?: string }>;
  brokenImages: Array<{ imageUrl: string; alt: string; status?: number; reason?: string }>;
  tableAudit?: { tableDetected?: boolean; warnings?: string[] };
  oldLogoDetected?: unknown[];
};

function main() {
  const flowsPath = resolveFlowsResultsPath(REPORT_DIR);
  const failuresPath = path.join(REPORT_DIR, "doc-step-failures.json");
  const warningsPath = path.join(REPORT_DIR, "doc-step-warnings.json");
  const docsAuditPath = path.join(REPORT_DIR, "docs-audit-summary.json");
  const outXlsx = path.join(REPORT_DIR, "cms-automation-report.xlsx");

  const metaBySource = collectFlowMetaBySource();

  const pw = readJson<{ suites?: PwSuite[] }>(flowsPath);
  const failuresDoc = readJson<{
    failures?: Array<{
      flowId: string;
      documentUrl: string;
      stepNumber: number;
      target: string;
      errorMessage?: string;
    }>;
  }>(failuresPath);
  const warningsDoc = readJson<{
    warnings?: Array<{
      flowId: string;
      documentUrl: string;
      stepNumber: number;
      target: string;
      warningMessage?: string;
    }>;
  }>(warningsPath);

  const sourceByFlow = new Map<string, string>();
  walkFlowSources(path.join(process.cwd(), "projects", "CMS"), sourceByFlow);

  const cmsSpecs: PwSpec[] = collectCmsFlowSpecs(pw as { suites?: PwSuite[] });

  const rows: Array<{
    flowId: string;
    documentUrl: string;
    status: string;
    durationMs: number;
    durationHuman: string;
    errorSummary: string;
    docStepFailureCount: number;
    docStepWarningCount: number;
  }> = [];

  const failures = failuresDoc?.failures || [];
  const warnings = warningsDoc?.warnings || [];

  const docsAudit = readJson<{
    scannedDocs?: number;
    docsWithBrokenLinks?: number;
    docsWithBrokenImages?: number;
    results?: DocAuditRow[];
  }>(docsAuditPath);
  const auditResults: DocAuditRow[] = docsAudit?.results || [];

  for (const spec of cmsSpecs) {
    const expanded = expandPlaywrightSpecToFlowResults(spec);
    for (const e of expanded) {
      const flowId = e.flowId;
      const status = String(e.status || "unknown");
      const durationMs = Number(e.durationMs ?? 0);
      const err = String(e.error || "").slice(0, 2000);
      const documentUrl = sourceByFlow.get(flowId) || "";
      const fc = failures.filter((f) => f.flowId === flowId).length;
      const wc = warnings.filter((w) => w.flowId === flowId).length;
      rows.push({
        flowId,
        documentUrl,
        status,
        durationMs,
        durationHuman: formatDuration(durationMs),
        errorSummary: err,
        docStepFailureCount: fc,
        docStepWarningCount: wc,
      });
    }
  }

  const totalDurationMs = rows.reduce((a, r) => a + r.durationMs, 0);
  const passed = rows.filter((r) => r.status === "passed").length;
  const failed = rows.filter((r) => r.status === "failed" || r.status === "timedOut").length;
  const withWarnings = rows.filter((r) => r.docStepWarningCount > 0 && r.status === "passed").length;

  const summaryRows = [
    ["Metric", "Value"],
    ["Report directory", REPORT_DIR],
    ["Total CMS flows executed", String(rows.length)],
    ["Passed", String(passed)],
    ["Failed (Playwright)", String(failed)],
    ["Passed with doc-step warnings only", String(withWarnings)],
    ["Sum of per-test durations (approx.)", formatDuration(totalDurationMs)],
    ["Doc-step failure rows (total)", String(failures.length)],
    ["Doc-step warning rows (total)", String(warnings.length)],
    ["Docs link-audit: pages scanned", String(docsAudit?.scannedDocs ?? auditResults.length)],
    ["Docs link-audit: pages with broken links", String(docsAudit?.docsWithBrokenLinks ?? "—")],
    ["Docs link-audit: pages with broken images", String(docsAudit?.docsWithBrokenImages ?? "—")],
  ];

  const allSheet = [
    [
      "Flow ID",
      "Document URL",
      "Playwright status",
      "Duration (ms)",
      "Duration",
      "Doc-step failures count",
      "Doc-step warnings count",
      "Playwright error (truncated)",
    ],
    ...rows.map((r) => [
      r.flowId,
      r.documentUrl,
      r.status,
      r.durationMs,
      r.durationHuman,
      r.docStepFailureCount,
      r.docStepWarningCount,
      r.errorSummary,
    ]),
  ];

  const failedSheet = [
    ["Flow ID", "Document URL", "Status", "Duration", "Error"],
    ...rows
      .filter((r) => r.status === "failed" || r.status === "timedOut")
      .map((r) => [r.flowId, r.documentUrl, r.status, r.durationHuman, r.errorSummary]),
  ];

  const warnFlowsSheet = [
    ["Flow ID", "Document URL", "Playwright status", "Warning count"],
    ...rows
      .filter((r) => r.docStepWarningCount > 0)
      .map((r) => [r.flowId, r.documentUrl, r.status, r.docStepWarningCount]),
  ];

  const warnDetailSheet = [
    ["Flow ID", "Document URL", "Step #", "Target", "Warning message"],
    ...warnings.map((w) => [
      w.flowId,
      w.documentUrl,
      w.stepNumber,
      w.target,
      w.warningMessage || "",
    ]),
  ];

  const failDetailSheet = [
    ["Flow ID", "Document URL", "Step #", "Target", "Error message"],
    ...failures.map((f) => [
      f.flowId,
      f.documentUrl,
      f.stepNumber,
      f.target,
      f.errorMessage || "",
    ]),
  ];

  const auditByUrl = new Map<string, DocAuditRow>();
  for (const r of auditResults) auditByUrl.set(normUrl(r.docUrl), r);

  const allUrls = new Set<string>();
  for (const r of rows) {
    if (r.documentUrl) allUrls.add(normUrl(r.documentUrl));
  }
  for (const r of auditResults) allUrls.add(normUrl(r.docUrl));

  const masterRows: (string | number)[][] = [
    [
      "Document URL",
      "Module",
      "Flow ID",
      "Playwright status",
      "Duration",
      "First failed step #",
      "First failure message",
      "Doc-step warnings (count)",
      "Warning steps (summary)",
      "Docs audit: broken links (count)",
      "Docs audit: broken images (count)",
      "Docs audit: table warnings",
      "Docs audit: old logo hits",
    ],
  ];

  for (const u of [...allUrls].sort((a, b) => a.localeCompare(b))) {
    const flowRow = rows.find((r) => r.documentUrl && normUrl(r.documentUrl) === u);
    const flowId = flowRow?.flowId || "";
    let modResolved = metaBySource.get(u)?.module || "";
    if (!modResolved && flowId) {
      const src = sourceByFlow.get(flowId);
      if (src) modResolved = metaBySource.get(normUrl(src))?.module || "";
    }

    const flowFails = failures.filter((f) => f.flowId === flowId).sort((a, b) => a.stepNumber - b.stepNumber);
    const firstFail = flowFails[0];
    const flowWarns = warnings.filter((w) => w.flowId === flowId);
    const warnSummary = flowWarns
      .slice(0, 12)
      .map((w) => `Step ${w.stepNumber}: ${(w.warningMessage || "").slice(0, 120)}`)
      .join(" | ");

    const au = auditByUrl.get(u);
    const bl = au?.brokenLinks?.length ?? 0;
    const bi = au?.brokenImages?.length ?? 0;
    const tw = (au?.tableAudit?.warnings || []).join("; ").slice(0, 2000);
    const oldLogo = au?.oldLogoDetected?.length ?? 0;

    masterRows.push([
      flowRow?.documentUrl || u,
      modResolved || "—",
      flowId || "—",
      flowRow?.status || "—",
      flowRow?.durationHuman || "—",
      firstFail?.stepNumber ?? "—",
      (firstFail?.errorMessage || "").slice(0, 2000),
      flowWarns.length,
      warnSummary.slice(0, 3200),
      bl,
      bi,
      tw || "—",
      oldLogo,
    ]);
  }

  const docsLinkSummarySheet = [
    [
      "Document URL",
      "Module",
      "Broken links (count)",
      "Broken images (count)",
      "Table detected",
      "Table warnings",
      "Old logo detections",
    ],
    ...auditResults.map((r) => {
      const m = metaBySource.get(normUrl(r.docUrl))?.module || "—";
      const ta = r.tableAudit;
      return [
        r.docUrl,
        m,
        r.brokenLinks?.length ?? 0,
        r.brokenImages?.length ?? 0,
        ta?.tableDetected ? "yes" : "no",
        (ta?.warnings || []).join("; ").slice(0, 2000),
        r.oldLogoDetected?.length ?? 0,
      ];
    }),
  ];

  const docsBrokenLinksSheet = [
    ["Document URL", "Broken URL", "Anchor text", "HTTP status", "Reason"],
    ...auditResults.flatMap((r) =>
      (r.brokenLinks || []).map((b) => [r.docUrl, b.brokenUrl, b.anchorText, b.status ?? "", b.reason || ""])
    ),
  ];

  const docsBrokenImagesSheet = [
    ["Document URL", "Image URL", "Alt", "HTTP status", "Reason"],
    ...auditResults.flatMap((r) =>
      (r.brokenImages || []).map((b) => [r.docUrl, b.imageUrl, b.alt, b.status ?? "", b.reason || ""])
    ),
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryRows), "Summary");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(masterRows), "All URLs master");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(allSheet), "All CMS flows");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(failedSheet), "Failed flows");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(warnFlowsSheet), "Flows with warnings");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(warnDetailSheet), "Warning details");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(failDetailSheet), "Failure details");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(docsLinkSummarySheet), "Docs link audit");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(docsBrokenLinksSheet), "Docs broken links");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(docsBrokenImagesSheet), "Docs broken images");

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  XLSX.writeFile(wb, outXlsx);
  // eslint-disable-next-line no-console
  console.log(`✅ CMS Excel report: ${outXlsx}`);
}

main();
