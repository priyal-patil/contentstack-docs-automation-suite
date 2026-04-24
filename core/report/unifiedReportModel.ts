/**
 * Unified documentation automation report model.
 * Executable (browser flows): PASS / WARNING (drift) / FAIL (gap).
 * Informational (content audit): PASS / WARNING / FAIL per broken links, images, tables.
 */
import fs from "fs";
import path from "path";
import {
  collectAllFlowSpecs,
  flowIdFromPlaywrightSpecTitle,
  projectFromPlaywrightSpecTitle,
} from "./parseFlowSpecTitle";
import { expandPlaywrightSpecToFlowResults, type PwStepJson } from "./playwrightFlowStepExpansion";
import { resolveFlowsResultsPath } from "./resolveFlowsResultsPath";

export type UnifiedStatus = "PASS" | "WARNING" | "FAIL";
export type IssueKind = "None" | "Drift" | "Gap" | "Content";
export type UrlKind = "Executable" | "Informational";

export type UnifiedRow = {
  project: string;
  urlKind: UrlKind;
  module: string;
  /** Flow id for executable; doc slug for informational */
  key: string;
  documentUrl: string;
  status: UnifiedStatus;
  issueType: IssueKind;
  /** Human-readable detail for Excel / Slack */
  details: string;
  /** Relative path from REPORT_DIR to individual HTML (forward slashes) */
  reportHref: string;
  /** Playwright status when executable */
  playwrightStatus?: string;
  /** Counts for drill-down */
  docStepFailures?: number;
  docStepWarnings?: number;
  brokenLinks?: number;
  brokenImages?: number;
  tableIssue?: boolean;
  oldLogoHits?: number;
};

const normUrl = (u: string) => u.trim().replace(/\/$/, "");

export type FlowMeta = {
  id: string;
  project: string;
  module: string;
  source: string;
};

function walkFlowFiles(cwd: string, out: FlowMeta[]) {
  const projectsDir = path.join(cwd, "projects");
  if (!fs.existsSync(projectsDir)) return;

  function scan(dir: string) {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) scan(full);
      else if (name.endsWith(".flow.json")) {
        try {
          const j = JSON.parse(fs.readFileSync(full, "utf-8")) as {
            id?: string;
            project?: string;
            module?: string;
            source?: string;
          };
          if (!j.id) continue;
          let project = j.project;
          let moduleName = j.module;
          if (!project || !moduleName) {
            const rel = path.relative(projectsDir, full);
            const parts = rel.split(path.sep);
            if (parts.length >= 2) {
              project = project || parts[0];
              moduleName = moduleName || parts[1];
            }
          }
          out.push({
            id: j.id,
            project: project || "Unknown",
            module: moduleName || "unknown-module",
            source: String(j.source || ""),
          });
        } catch {
          /* skip */
        }
      }
    }
  }

  scan(projectsDir);
}

export function loadFlowMetaById(cwd: string): Map<string, FlowMeta> {
  const list: FlowMeta[] = [];
  walkFlowFiles(cwd, list);
  const m = new Map<string, FlowMeta>();
  for (const f of list) m.set(f.id, f);
  return m;
}

type PwSuite = { title?: string; file?: string; specs?: PwSpec[]; suites?: PwSuite[] };
type PwSpec = {
  title?: string;
  tests?: Array<{
    title?: string;
    results?: Array<{
      status?: string;
      duration?: number;
      error?: { message?: string };
      steps?: PwStepJson[];
    }>;
    status?: string;
  }>;
};
export type PwRoot = { suites?: PwSuite[] };

export function parseExecutableFlowsFromResults(pw: PwRoot | null): Array<{ project: string; flowId: string; pwStatus: string }> {
  const out: Array<{ project: string; flowId: string; pwStatus: string }> = [];
  for (const spec of collectAllFlowSpecs(pw)) {
    const title = String(spec.title || "");
    const project = projectFromPlaywrightSpecTitle(title) || "";
    if (!project) continue;
    const expanded = expandPlaywrightSpecToFlowResults(spec);
    if (expanded.length > 0) {
      for (const e of expanded) {
        out.push({ project, flowId: e.flowId, pwStatus: String(e.status || "unknown") });
      }
      continue;
    }
    const flowId = flowIdFromPlaywrightSpecTitle(title);
    if (!flowId) continue;
    const tr = (spec.tests || [])[0];
    const res = (tr?.results || [])[0];
    const pwStatus = String(res?.status || tr?.status || "unknown");
    out.push({ project, flowId, pwStatus });
  }
  return out;
}

type CumulativeSummaryFile = {
  flows?: Array<{ flowId: string; status: string; project?: string; module?: string }>;
};

/**
 * When `url-run-summary-cumulative.json` exists (baseline + partial retry merge), use one row per
 * baseline flow so dashboards show full batch counts; Playwright JSON in reportDir may only list a subset.
 */
export function parseExecutableFlowsPreferCumulative(
  reportDir: string,
  pw: PwRoot | null
): Array<{ project: string; flowId: string; pwStatus: string }> {
  const cumPath = path.join(reportDir, "url-run-summary-cumulative.json");
  if (!fs.existsSync(cumPath)) {
    return parseExecutableFlowsFromResults(pw);
  }
  try {
    const cum = JSON.parse(fs.readFileSync(cumPath, "utf-8")) as CumulativeSummaryFile;
    if (!cum?.flows?.length) {
      return parseExecutableFlowsFromResults(pw);
    }
    const pwByFlow = new Map<string, string>();
    for (const x of parseExecutableFlowsFromResults(pw)) {
      pwByFlow.set(x.flowId, x.pwStatus);
    }
    return cum.flows.map((f) => ({
      project: f.project || "CMS",
      flowId: f.flowId,
      pwStatus: pwByFlow.get(f.flowId) ?? f.status,
    }));
  } catch {
    return parseExecutableFlowsFromResults(pw);
  }
}

function classifyExecutable(params: {
  pwStatus: string;
  failureCount: number;
  warningCount: number;
}): { status: UnifiedStatus; issue: IssueKind; details: string } {
  const { pwStatus, failureCount, warningCount } = params;
  const pwFail = pwStatus === "failed" || pwStatus === "timedOut";

  if (pwFail || failureCount > 0) {
    const parts: string[] = [];
    if (pwFail) parts.push(`Playwright: ${pwStatus}`);
    if (failureCount > 0) parts.push(`${failureCount} doc-step gap(s) — step could not execute (element not found / timeout)`);
    return { status: "FAIL", issue: "Gap", details: parts.join(" · ") };
  }

  if (warningCount > 0) {
    return {
      status: "WARNING",
      issue: "Drift",
      details: `${warningCount} doc verification drift(s) — label, placement, or modal/title mismatch (flow continued)`,
    };
  }

  if (pwStatus === "passed") {
    return { status: "PASS", issue: "None", details: "UI steps completed; doc verification aligned" };
  }

  return { status: "WARNING", issue: "None", details: `Playwright status: ${pwStatus}` };
}

function isTableMalformed(tableAudit: any): boolean {
  if (!tableAudit?.tableDetected) return false;
  const t = tableAudit;
  if (!t.tableExistsAndVisible) return true;
  if (!t.structure?.headerRowExists) return true;
  if (!t.structure?.minBodyRowsMet) return true;
  if (!t.structure?.columnCountConsistent) return true;
  if ((t.warnings?.length || 0) > 0) return true;
  if (t.noBrokenLayout && t.noBrokenLayout.tableNotEmpty === false) return true;
  if (t.noBrokenLayout && t.noBrokenLayout.noEmptyMessage === false) return true;
  if (t.noBrokenLayout && t.noBrokenLayout.noErrorBanner === false) return true;
  return false;
}

function classifyInformational(audit: {
  brokenLinks?: unknown[];
  brokenImages?: unknown[];
  tableAudit?: any;
  oldLogoDetected?: unknown[];
}): { status: UnifiedStatus; issue: IssueKind; details: string } {
  const nL = audit.brokenLinks?.length ?? 0;
  const nI = audit.brokenImages?.length ?? 0;
  const badTable = isTableMalformed(audit.tableAudit);
  const nOld = audit.oldLogoDetected?.length ?? 0;

  if (nL > 0 || nI > 0 || badTable) {
    const parts: string[] = [];
    if (nL) parts.push(`${nL} broken link(s) (404/410/5xx)`);
    if (nI) parts.push(`${nI} broken image(s)`);
    if (badTable) parts.push("Malformed or failed table checks on page");
    return { status: "FAIL", issue: "Content", details: parts.join(" · ") };
  }

  if (nOld > 0) {
    return {
      status: "WARNING",
      issue: "Content",
      details: `${nOld} image(s) match legacy logo reference (content branding drift)`,
    };
  }

  return { status: "PASS", issue: "None", details: "No broken links/images; table checks OK" };
}

export type CollectInputs = {
  reportDir: string;
  cwd: string;
};

export function collectUnifiedRows(input: CollectInputs): UnifiedRow[] {
  const { reportDir, cwd } = input;
  const flowsPath = resolveFlowsResultsPath(reportDir);
  const failuresPath = path.join(reportDir, "doc-step-failures.json");
  const warningsPath = path.join(reportDir, "doc-step-warnings.json");
  const auditPath = path.join(reportDir, "docs-audit-summary.json");
  const docsHttpPath = path.join(reportDir, "docs-results.json");

  const pw = readJson<PwRoot>(flowsPath);
  const failuresDoc = readJson<{
    failures?: Array<{
      flowId: string;
      documentUrl?: string;
      stepNumber?: number;
      target?: string;
      errorMessage?: string;
      missingElementSummary?: string;
    }>;
  }>(failuresPath);
  const warningsDoc = readJson<{
    warnings?: Array<{ flowId: string; documentUrl?: string; stepNumber?: number; target?: string; warningMessage?: string }>;
  }>(warningsPath);
  const audit = readJson<{
    results?: Array<{
      docUrl: string;
      brokenLinks?: unknown[];
      brokenImages?: unknown[];
      tableAudit?: any;
      oldLogoDetected?: unknown[];
    }>;
  }>(auditPath);
  const docsHttp = readJson<{
    results?: Array<{ project?: string; url?: string; status?: string; error?: string; httpStatus?: number }>;
  }>(docsHttpPath);

  const metaById = loadFlowMetaById(cwd);
  const failures = failuresDoc?.failures || [];
  const warnings = warningsDoc?.warnings || [];

  const rows: UnifiedRow[] = [];
  const execSpecs = parseExecutableFlowsPreferCumulative(reportDir, pw);

  for (const ex of execSpecs) {
    const m = metaById.get(ex.flowId);
    const project = m?.project || ex.project;
    const module = m?.module || "unknown-module";
    const documentUrl = m?.source || "";
    const fc = failures.filter((f) => f.flowId === ex.flowId).length;
    const wc = warnings.filter((w) => w.flowId === ex.flowId).length;
    const c = classifyExecutable({ pwStatus: ex.pwStatus, failureCount: fc, warningCount: wc });

    /** Must match `${flowId}-report.html` from generateFlowReportHtml */
    const reportHref = `url-reports/${safeSegment(project)}/${ex.flowId}-report.html`;

    let details = c.details;
    if (fc > 0) {
      const first = failures.find((f) => f.flowId === ex.flowId);
      if (first) {
        const gap =
          (first.missingElementSummary || "").trim() ||
          `${first.target}: ${(first.errorMessage || "").slice(0, 240)}`;
        details += ` · First gap: step ${first.stepNumber} — ${gap.slice(0, 320)}`;
      }
    } else if (wc > 0) {
      const first = warnings.find((w) => w.flowId === ex.flowId);
      if (first) details += ` · Example drift: step ${first.stepNumber} — ${(first.warningMessage || "").slice(0, 240)}`;
    }

    rows.push({
      project,
      urlKind: "Executable",
      module,
      key: ex.flowId,
      documentUrl,
      status: c.status,
      issueType: c.issue,
      details,
      reportHref,
      playwrightStatus: ex.pwStatus,
      docStepFailures: fc,
      docStepWarnings: wc,
    });
  }

  for (const r of audit?.results || []) {
    const docUrl = r.docUrl;
    let project = "Unknown";
    let module = "unknown-module";
    for (const fm of metaById.values()) {
      if (fm.source && normUrl(fm.source) === normUrl(docUrl)) {
        project = fm.project;
        module = fm.module;
        break;
      }
    }
    if (project === "Unknown") {
      try {
        const u = new URL(docUrl);
        const parts = u.pathname.split("/").filter(Boolean);
        if (parts[0] === "docs" && parts.length >= 2) project = parts[1] === "content-managers" ? "CMS" : parts[1] || "Docs";
      } catch {
        /* ignore */
      }
    }

    const c = classifyInformational(r);
    const slug = `info-${safeSegment(Buffer.from(docUrl).toString("base64").replace(/[/+=]/g, "_"))}`;
    const reportHref = `url-reports/${safeSegment(project)}/${slug}.html`;

    rows.push({
      project,
      urlKind: "Informational",
      module,
      key: slug,
      documentUrl: docUrl,
      status: c.status,
      issueType: c.issue,
      details: c.details,
      reportHref,
      brokenLinks: r.brokenLinks?.length ?? 0,
      brokenImages: r.brokenImages?.length ?? 0,
      tableIssue: isTableMalformed(r.tableAudit),
      oldLogoHits: r.oldLogoDetected?.length ?? 0,
    });
  }

  for (const d of docsHttp?.results || []) {
    const url = String(d.url || "");
    const project = String(d.project || "Unknown");
    const st = d.status === "passed" ? "PASS" : "FAIL";
    const details =
      d.status === "passed"
        ? `HTTP ${d.httpStatus ?? "OK"} — title reachable`
        : `HTTP/doc check failed: ${(d.error || "failed").slice(0, 500)}`;
    const slug = `http-${safeSegment(Buffer.from(url).toString("base64").replace(/[/+=]/g, "_"))}`;
    rows.push({
      project,
      urlKind: "Informational",
      module: "doc-http-check",
      key: slug,
      documentUrl: url,
      status: st as UnifiedStatus,
      issueType: st === "FAIL" ? "Content" : "None",
      details,
      reportHref: `url-reports/${safeSegment(project)}/${slug}.html`,
    });
  }

  return rows;
}

function readJson<T>(p: string): T | null {
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
  } catch {
    return null;
  }
}

export function safeSegment(s: string): string {
  return String(s || "unknown")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "item";
}

export function projectSummary(rows: UnifiedRow[]) {
  const byProject = new Map<
    string,
    { pass: number; warning: number; fail: number; drift: number; gap: number; executable: number }
  >();
  for (const r of rows) {
    if (!byProject.has(r.project)) {
      byProject.set(r.project, { pass: 0, warning: 0, fail: 0, drift: 0, gap: 0, executable: 0 });
    }
    const b = byProject.get(r.project)!;
    if (r.status === "PASS") b.pass++;
    else if (r.status === "WARNING") b.warning++;
    else b.fail++;
    if (r.urlKind === "Executable") {
      b.executable++;
      if (r.issueType === "Drift") b.drift++;
      if (r.issueType === "Gap") b.gap++;
    }
  }
  return byProject;
}

export function driftRate(project: string, rows: UnifiedRow[]): number {
  const ex = rows.filter((r) => r.project === project && r.urlKind === "Executable");
  if (ex.length === 0) return 0;
  const drift = ex.filter((r) => r.issueType === "Drift").length;
  return Math.round((drift / ex.length) * 1000) / 10;
}
