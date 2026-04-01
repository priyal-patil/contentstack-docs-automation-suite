/**
 * High-level, actionable Slack message for Nightly Docs-QA (mrkdwn).
 */
import type { UnifiedRow } from "./unifiedReportModel";

const MAX_EACH = 5;
const MAX_DETAIL = 160;

export type SlackDocsQaPayload = {
  version: 1;
  projectLabel: string;
  completedAtDisplay: string;
  pipelineLabel: string;
  counts: {
    totalAudited: number;
    executable: number;
    informational: number;
    pass: number;
    warning: number;
    fail: number;
  };
  topIssues: {
    criticalGaps: string[];
    driftAlerts: string[];
    contentIssues: string[];
  };
  links: {
    dashboardUrl: string;
    excelUrl: string;
  };
  /** Post this to Slack Incoming Webhook `text` (mrkdwn) or use `blocks` later */
  mrkdwnText: string;
};

function truncate(s: string, n: number): string {
  const t = (s || "").replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  return t.slice(0, n - 1) + "…";
}

function primaryProjectLabel(rows: UnifiedRow[]): string {
  const env = process.env.SLACK_PROJECT_LABEL?.trim();
  if (env) return env;
  const set = new Set(rows.map((r) => r.project));
  if (set.size === 1) return [...set][0];
  if (set.size === 0) return "Docs";
  return "Multi-project";
}

function formatCompletedAt(iso: string): string {
  const tz = process.env.SLACK_TIMEZONE || "UTC";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", { timeZone: tz, dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function pipelineLabel(): string {
  if (process.env.GITHUB_ACTIONS === "true" || process.env.CI) return "CI/CD Pipeline";
  return "Local run";
}

function resolveLinks(): { dashboardUrl: string; excelUrl: string } {
  const customDash = process.env.SLACK_DASHBOARD_URL?.trim();
  const customExcel = process.env.SLACK_EXCEL_URL?.trim();
  const run =
    process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : "";
  const dashboardUrl = customDash || run || "";
  const excelUrl = customExcel || run || dashboardUrl;
  return { dashboardUrl, excelUrl };
}

function pickTopIssues(rows: UnifiedRow[]): {
  criticalGaps: string[];
  driftAlerts: string[];
  contentIssues: string[];
} {
  const gaps = rows
    .filter((r) => r.status === "FAIL" && r.urlKind === "Executable")
    .slice(0, MAX_EACH)
    .map((r) => `Critical Gap: *${r.key}* — ${truncate(r.details, MAX_DETAIL)}`);

  const drifts = rows
    .filter((r) => r.status === "WARNING" && r.issueType === "Drift")
    .slice(0, MAX_EACH)
    .map((r) => `Drift Alert: *${r.key}* — ${truncate(r.details, MAX_DETAIL)}`);

  const content = rows
    .filter(
      (r) =>
        r.status === "FAIL" &&
        (r.urlKind === "Informational" || r.issueType === "Content")
    )
    .slice(0, MAX_EACH)
    .map((r) => {
      const tag =
        (r.brokenLinks || 0) > 0 || (r.brokenImages || 0) > 0
          ? `Content Issue: *${r.module || r.key}* — ${truncate(r.details, MAX_DETAIL)}`
          : `Content Issue: *${r.key}* — ${truncate(r.details, MAX_DETAIL)}`;
      return tag;
    });

  return { criticalGaps: gaps, driftAlerts: drifts, contentIssues: content };
}

export function buildSlackDocsQaPayload(rows: UnifiedRow[], generatedAt: string): SlackDocsQaPayload {
  const executable = rows.filter((r) => r.urlKind === "Executable").length;
  const informational = rows.filter((r) => r.urlKind === "Informational").length;
  const pass = rows.filter((r) => r.status === "PASS").length;
  const warning = rows.filter((r) => r.status === "WARNING").length;
  const fail = rows.filter((r) => r.status === "FAIL").length;

  const projectLabel = primaryProjectLabel(rows);
  const completedAtDisplay = formatCompletedAt(generatedAt);
  const pipe = pipelineLabel();
  const topIssues = pickTopIssues(rows);
  const links = resolveLinks();

  const lines: string[] = [];
  lines.push(`🚀 *Nightly Docs-QA Audit: ${projectLabel}*`);
  lines.push(`_Status: Completed at ${completedAtDisplay} via ${pipe}_`);
  lines.push("");
  lines.push("*Summary*");
  lines.push(
    `Total Audited: *${rows.length}* URLs (${executable} Executable | ${informational} Informational)`
  );
  lines.push("");
  lines.push(`✅ Pass: *${pass}* (Perfect Alignment)`);
  lines.push(`⚠️ Warnings: *${warning}* (Documentation Drift – UI labels or positions have changed)`);
  lines.push(`❌ Failures: *${fail}* (Critical Gaps – Broken links, 404s, or missing UI steps)`);
  lines.push("");
  lines.push("*Detailed Drill-down (Top Issues)*");
  lines.push("");

  const hasAny =
    topIssues.criticalGaps.length + topIssues.driftAlerts.length + topIssues.contentIssues.length > 0;
  if (!hasAny) {
    lines.push("_No failures or warnings in this run._");
  } else {
    if (topIssues.criticalGaps.length) {
      lines.push(topIssues.criticalGaps.join("\n"));
      lines.push("");
    }
    if (topIssues.driftAlerts.length) {
      lines.push(topIssues.driftAlerts.join("\n"));
      lines.push("");
    }
    if (topIssues.contentIssues.length) {
      lines.push(topIssues.contentIssues.join("\n"));
      lines.push("");
    }
  }

  if (links.dashboardUrl || links.excelUrl) {
    const d = links.dashboardUrl ? `<${links.dashboardUrl}|View Interactive Dashboard>` : "_(Dashboard URL not set)_";
    const e = links.excelUrl ? `<${links.excelUrl}|Download Excel Audit Trail>` : "_(Excel URL not set)_";
    lines.push(`📂 ${d} | 📊 ${e}`);
  } else {
    lines.push(
      `📂 _Open your report folder for \`unified-dashboard.html\` · 📊 \`master-report.xlsx\`_`
    );
  }

  const mrkdwnText = lines.join("\n");

  return {
    version: 1,
    projectLabel,
    completedAtDisplay,
    pipelineLabel: pipe,
    counts: {
      totalAudited: rows.length,
      executable,
      informational,
      pass,
      warning,
      fail,
    },
    topIssues,
    links,
    mrkdwnText,
  };
}
