#!/usr/bin/env npx ts-node
/**
 * After Playwright: writes url-run-summary JSON/HTML from flows-results.json, then posts counts to Slack.
 *
 * Simple Slack setup: put Bot token in encryption_data.xlsx → Key `slack.authToken`, Value `xoxb-...`.
 * Optional: Key `slack.channelId`, Value `C...` (or env SLACK_CHANNEL_ID). Encrypted cells need encryption.secretKey — see scripts/lib/encryptionData.ts.
 *
 * Usage:
 *   npx ts-node scripts/urlRunSummaryAndSlack.ts
 *   npx ts-node scripts/urlRunSummaryAndSlack.ts --dry-run
 *   npx ts-node scripts/urlRunSummaryAndSlack.ts --slack-test   # one test message only
 *   npx ts-node scripts/urlRunSummaryAndSlack.ts --mergeBaselineUrlRunSummary reports/cms-seq-.../url-run-summary.json
 *     (uses per-flow results from this Playwright JSON run for any flow also in baseline; recounts totals for Slack/HTML)
 *   npx ts-node scripts/slackFromXlsx.ts   # only: xlsx token → one Slack message (simplest)
 *
 * Env: REPORT_DIR, SLACK_CHANNEL_ID (optional), ENCRYPTION_DATA_XLSX, SLACK_BOT_TOKEN (overrides xlsx)
 *      SKIP_SLACK=1 — write url-run-summary JSON/HTML only; do not post to Slack
 */

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv").config();
} catch {
  /* optional */
}

import fs from "fs";
import path from "path";
import { loadFlowMetaById } from "../core/report/unifiedReportModel";
import { resolveFlowsResultsPath } from "../core/report/resolveFlowsResultsPath";
import { expandPlaywrightSpecToFlowResults } from "../core/report/playwrightFlowStepExpansion";
import { resolveSlackBotToken, resolveSlackChannelId } from "./lib/encryptionData";

type FlowRow = {
  flowId: string;
  status: string;
  documentUrl: string;
  project: string;
  module: string;
  error?: string;
};

function getArg(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name);
  if (i === -1) return undefined;
  return argv[i + 1];
}

function hasFlag(argv: string[], name: string): boolean {
  return argv.includes(name);
}

/** Collect flow tests from Playwright JSON (same shape as scripts/generateDashboardReport.ts). */
function collectFlowResults(pw: any): Array<{ id: string; status: string; error?: string }> {
  const rows: Array<{ id: string; status: string; error?: string }> = [];
  function walk(suite: any) {
    for (const spec of suite?.specs || []) {
      const title = String(spec?.title || "");
      if (!title) continue;
      const expanded = expandPlaywrightSpecToFlowResults(spec);
      for (const e of expanded) {
        rows.push({
          id: e.flowId,
          status: e.status,
          error: e.error ? e.error.slice(0, 500) : undefined,
        });
      }
    }
    for (const child of suite?.suites || []) walk(child);
  }
  for (const s of pw?.suites || []) {
    if (String(s?.file || "").includes("flows.spec")) walk(s);
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

function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSummaryHtml(payload: {
  generatedAt: string;
  reportDir: string;
  flowsFile: string;
  counts: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    timedOut: number;
    interrupted: number;
    other: number;
  };
  rows: FlowRow[];
}): string {
  const c = payload.counts;
  const rows = payload.rows
    .map(
      (r) =>
        `<tr class="st-${escapeHtml(r.status)}"><td><code>${escapeHtml(r.flowId)}</code></td><td>${escapeHtml(
          r.status
        )}</td><td class="url"><a href="${escapeHtml(r.documentUrl)}" target="_blank" rel="noopener">${escapeHtml(
          r.documentUrl || "—"
        )}</a></td><td>${escapeHtml(r.error || "—")}</td></tr>`
    )
    .join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>URL run summary</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
    .wrap { max-width: 960px; margin: 0 auto; padding: 28px 20px; }
    h1 { font-size: 1.35rem; margin: 0 0 8px; }
    .meta { color: #94a3b8; font-size: 0.88rem; margin-bottom: 22px; word-break: break-all; }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 14px; margin-bottom: 28px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; }
    .card .n { font-size: 1.75rem; font-weight: 700; }
    .card .lbl { font-size: 0.75rem; color: #94a3b8; margin-top: 6px; }
    .card.passed .n { color: #4ade80; }
    .card.failed .n { color: #f87171; }
    .card.total .n { color: #38bdf8; }
    table { width: 100%; border-collapse: collapse; font-size: 0.86rem; background: #1e293b; border-radius: 10px; overflow: hidden; border: 1px solid #334155; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #334155; vertical-align: top; }
    th { background: #334155; color: #cbd5e1; }
    tr:hover td { background: rgba(51, 65, 85, 0.4); }
    .url { max-width: 360px; word-break: break-all; }
    code { font-size: 0.85em; }
    .st-passed td:nth-child(2) { color: #4ade80; font-weight: 600; }
    .st-failed td:nth-child(2), .st-timedOut td:nth-child(2) { color: #f87171; font-weight: 600; }
    .st-skipped td:nth-child(2) { color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Documentation URL run summary</h1>
    <p class="meta">Generated ${escapeHtml(payload.generatedAt)}<br/>Report dir: ${escapeHtml(
      payload.reportDir
    )}<br/>Source: ${escapeHtml(payload.flowsFile)}</p>
    <div class="cards">
      <div class="card total"><div class="n">${c.total}</div><div class="lbl">Total URLs (flows) run</div></div>
      <div class="card passed"><div class="n">${c.passed}</div><div class="lbl">Passed</div></div>
      <div class="card failed"><div class="n">${c.failed}</div><div class="lbl">Failed</div></div>
      <div class="card"><div class="n">${c.skipped}</div><div class="lbl">Skipped</div></div>
      <div class="card"><div class="n">${c.timedOut}</div><div class="lbl">Timed out</div></div>
      <div class="card"><div class="n">${c.interrupted}</div><div class="lbl">Interrupted</div></div>
      <div class="card"><div class="n">${c.other}</div><div class="lbl">Other</div></div>
    </div>
    <h2 style="font-size:1rem;margin-bottom:12px">Per-flow</h2>
    <table>
      <thead><tr><th>Flow ID</th><th>Status</th><th>Document URL</th><th>Error (truncated)</th></tr></thead>
      <tbody>${rows || "<tr><td colspan='4'>No flow rows</td></tr>"}</tbody>
    </table>
  </div>
</body>
</html>`;
}

/** Per-project flow counts for Slack (CMS / Launch / Studio combined batches). */
function buildPerProjectBreakdownMrkdwn(rows: FlowRow[]): string | null {
  if (rows.length === 0) return null;
  type Acc = { total: number; passed: number; failed: number; skipped: number; timedOut: number; interrupted: number; other: number };
  const by = new Map<string, Acc>();
  for (const r of rows) {
    const p = (r.project || "").trim() || "Unknown";
    if (!by.has(p)) {
      by.set(p, { total: 0, passed: 0, failed: 0, skipped: 0, timedOut: 0, interrupted: 0, other: 0 });
    }
    const a = by.get(p)!;
    a.total++;
    const s = r.status;
    if (s === "passed") a.passed++;
    else if (s === "failed") a.failed++;
    else if (s === "skipped") a.skipped++;
    else if (s === "timedOut") a.timedOut++;
    else if (s === "interrupted") a.interrupted++;
    else a.other++;
  }
  if (by.size < 2) return null;

  const order = ["CMS", "Launch", "Studio", "Personalize", "Analytics", "Data-and-Insights"];
  const keys = [...by.keys()].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });

  const lines = keys.map((p) => {
    const a = by.get(p)!;
    return `• *${p}:* ${a.passed} passed · ${a.failed} failed · ${a.total} total (skipped ${a.skipped}, timedOut ${a.timedOut})`;
  });
  return lines.join("\n");
}

function buildSlackPayload(summary: {
  reportDir: string;
  flowsFile: string;
  counts: { total: number; passed: number; failed: number; skipped: number; timedOut: number; interrupted: number; other: number };
  failedSamples: Array<{ flowId: string; documentUrl: string; error?: string }>;
  cumulativeNote?: string;
  perProjectBreakdown?: string | null;
  warningFlows?: number;
  runUrl?: string;
  duration?: string;
}): { text: string; blocks: unknown[] } {
  const { counts: c } = summary;
  const failedLines = summary.failedSamples
    .slice(0, 8)
    .map((f) => `• *${f.flowId}* — ${f.documentUrl || "no URL in flow meta"}\n  _${(f.error || "").slice(0, 200)}_`)
    .join("\n");

  const runLink = summary.runUrl ? ` <${summary.runUrl}|Open run>` : "";
  const dur = summary.duration ? ` · ${summary.duration}` : "";
  const cum = summary.cumulativeNote ? ` ${summary.cumulativeNote}` : "";
  const warnCount = summary.warningFlows ?? 0;
  const text = `Doc automation: ${c.passed} passed, ${c.failed} failed, ${warnCount} warnings, ${c.total} total (flows).${cum}${dur}${runLink}`;

  const icon = c.failed === 0 ? ":white_check_mark:" : ":x:";
  // CMS_SLACK_TITLE overrides the header (e.g. "CMS Batch 2 — URL run summary").
  // Falls back to the first segment of CMS_BATCH_DURATION_LABEL (strips the duration part),
  // then to the legacy default so Batch 1 is unaffected.
  const defaultTitle = (() => {
    const label = process.env.CMS_SLACK_TITLE?.trim();
    if (label) return label;
    const durLabel = process.env.CMS_BATCH_DURATION_LABEL?.trim();
    if (durLabel) {
      // e.g. "CMS Batch 2: environment, ... (12m 24s)" → "CMS Batch 2 — URL run summary"
      const batchMatch = durLabel.match(/^(CMS\s+Batch\s+\d+)/i);
      if (batchMatch) return `${batchMatch[1]} — URL run summary`;
    }
    return "CMS Batch 1 — URL run summary";
  })();
  const header = summary.cumulativeNote ? "Documentation URL run summary (cumulative)" : defaultTitle;

  const blocks: unknown[] = [
    {
      type: "header",
      text: { type: "plain_text", text: `${icon}  ${header}`, emoji: true },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Total URLs*\n${c.total}` },
        { type: "mrkdwn", text: `*Passed ✅*\n${c.passed}` },
        { type: "mrkdwn", text: `*Failed ❌*\n${c.failed}` },
        { type: "mrkdwn", text: `*Warnings ⚠️*\n${warnCount}` },
      ],
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Skipped*\n${c.skipped}` },
        { type: "mrkdwn", text: `*Timed out*\n${c.timedOut}` },
        { type: "mrkdwn", text: `*Interrupted*\n${c.interrupted}` },
        { type: "mrkdwn", text: `*Duration*\n${summary.duration || "—"}` },
      ],
    },
    ...(summary.perProjectBreakdown
      ? [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*By project*\n${summary.perProjectBreakdown}`,
            },
          },
        ]
      : []),
    ...(summary.cumulativeNote
      ? [
          {
            type: "context",
            elements: [{ type: "mrkdwn", text: summary.cumulativeNote }],
          },
        ]
      : []),
  ];

  // Report links block
  const reportLinks: string[] = [];
  if (summary.runUrl) reportLinks.push(`<${summary.runUrl}|:github: Open GitHub Actions run>`);
  if (summary.runUrl) reportLinks.push(`<${summary.runUrl}#artifacts|:page_facing_up: Download reports & screenshots>`);
  if (reportLinks.length > 0) {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `*Reports*\n${reportLinks.join("  ·  ")}` },
    });
  }

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `Run dir: \`${path.basename(summary.reportDir)}\`  ·  Source: \`${summary.flowsFile}\``,
      },
    ],
  });

  return { text, blocks };
}

/** https://api.slack.com/methods/chat.postMessage */
async function postSlackChatPostMessage(
  botToken: string,
  channelId: string,
  summary: Parameters<typeof buildSlackPayload>[0]
): Promise<void> {
  const { text, blocks } = buildSlackPayload(summary);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  let res: Response;
  try {
    res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify({
        channel: channelId,
        text,
        blocks,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  const raw = await res.text();
  let data: { ok?: boolean; error?: string };
  try {
    data = JSON.parse(raw) as { ok?: boolean; error?: string };
  } catch {
    throw new Error(`Slack API: invalid JSON (HTTP ${res.status}): ${raw.slice(0, 300)}`);
  }
  if (!data.ok) {
    throw new Error(`Slack API chat.postMessage: ${data.error || "unknown error"} (HTTP ${res.status})`);
  }
}

/** Minimal message to verify bot token + channel (chat.postMessage). */
async function postSlackConnectivityTest(botToken: string, channelId: string): Promise<void> {
  const text = `Docs automation Slack test — ${new Date().toISOString()}\n\`urlRunSummaryAndSlack.ts --slack-test\``;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify({ channel: channelId, text }),
      signal: controller.signal,
    });
    const raw = await res.text();
    let data: { ok?: boolean; error?: string };
    try {
      data = JSON.parse(raw) as { ok?: boolean; error?: string };
    } catch {
      throw new Error(`Slack API: invalid JSON (HTTP ${res.status}): ${raw.slice(0, 300)}`);
    }
    if (!data.ok) {
      throw new Error(`Slack API chat.postMessage: ${data.error || "unknown error"} (HTTP ${res.status})`);
    }
  } finally {
    clearTimeout(timer);
  }
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);

  if (hasFlag(argv, "--slack-test")) {
    const channelId = resolveSlackChannelId(process.cwd());
    let botToken: string | undefined;
    try {
      botToken = resolveSlackBotToken(process.cwd());
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error((e as Error).message);
      process.exitCode = 1;
      return;
    }
    if (!botToken) {
      // eslint-disable-next-line no-console
      console.error("No token: add slack.authToken (xoxb-...) to encryption_data.xlsx — or run scripts/slackFromXlsx.ts for the same.");
      process.exitCode = 1;
      return;
    }
    await postSlackConnectivityTest(botToken, channelId);
    // eslint-disable-next-line no-console
    console.log(`✅ Slack test message posted to channel ${channelId}`);
    return;
  }

  const reportDir = path.resolve(process.cwd(), getArg(argv, "--reportDir") || process.env.REPORT_DIR || "reports/latest");
  const dryRun = hasFlag(argv, "--dry-run");
  const noHtml = hasFlag(argv, "--no-html");
  const mergeBaselineArg = getArg(argv, "--mergeBaselineUrlRunSummary");

  const flowsPath = resolveFlowsResultsPath(reportDir);
  const flowsFileLabel = path.relative(process.cwd(), flowsPath) || flowsPath;

  const pw = readJson<any>(flowsPath);
  const rawRows = pw ? collectFlowResults(pw) : [];
  const metaById = loadFlowMetaById(process.cwd());

  let rows: FlowRow[];
  let cumulativeNote: string | undefined;

  if (mergeBaselineArg) {
    const baselinePath = path.resolve(process.cwd(), mergeBaselineArg);
    const baseline = readJson<{ flows?: FlowRow[]; reportDir?: string }>(baselinePath);
    if (!baseline?.flows?.length) {
      // eslint-disable-next-line no-console
      console.error(`Invalid or empty baseline url-run-summary: ${baselinePath}`);
      process.exitCode = 1;
      return;
    }
    const rerunMap = new Map(rawRows.map((r) => [r.id, r]));
    const baselineIds = new Set(baseline.flows.map((f) => f.flowId));
    const unknownRerun = [...rerunMap.keys()].filter((id) => !baselineIds.has(id));
    if (unknownRerun.length) {
      // eslint-disable-next-line no-console
      console.warn("Rerun includes flow ids not in baseline (ignored for merge):", unknownRerun.join(", "));
    }
    rows = baseline.flows.map((bf) => {
      const r = rerunMap.get(bf.flowId);
      if (r) {
        return {
          ...bf,
          status: r.status,
          error: r.error,
        };
      }
      return { ...bf };
    });
    const relBase = path.relative(process.cwd(), baselinePath) || baselinePath;
    cumulativeNote = `_Cumulative_: retried flows merged into baseline \`${relBase}\` (${baseline.flows.length} URLs). This report dir is the retry Playwright output.`;
  } else {
    rows = rawRows.map((r) => {
      const m = metaById.get(r.id);
      return {
        flowId: r.id,
        status: r.status,
        documentUrl: m?.source || "",
        project: m?.project || "",
        module: m?.module || "",
        error: r.error,
      };
    });
  }

  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let timedOut = 0;
  let interrupted = 0;
  let other = 0;

  for (const r of rows) {
    const s = r.status;
    if (s === "passed") passed++;
    else if (s === "failed") failed++;
    else if (s === "skipped") skipped++;
    else if (s === "timedOut") timedOut++;
    else if (s === "interrupted") interrupted++;
    else other++;
  }

  const total = rows.length;
  const counts = { total, passed, failed, skipped, timedOut, interrupted, other };

  const generatedAt = new Date().toISOString();
  const jsonOut = {
    generatedAt,
    description: mergeBaselineArg
      ? `Cumulative counts: baseline url-run-summary merged with Playwright results in ${flowsFileLabel} for overlapping flow ids.`
      : "Executable doc URL (flow) counts for the last Playwright run that wrote flows-results.json. Total reflects only flows executed in that run (e.g. after -g filter).",
    reportDir,
    flowsSourceFile: flowsFileLabel,
    ...(mergeBaselineArg
      ? { mergedFromBaseline: path.relative(process.cwd(), path.resolve(process.cwd(), mergeBaselineArg)) || mergeBaselineArg }
      : {}),
    counts,
    flows: rows,
  };

  fs.mkdirSync(reportDir, { recursive: true });
  const summaryBase = mergeBaselineArg ? "url-run-summary-cumulative" : "url-run-summary";
  const jsonPath = path.join(reportDir, `${summaryBase}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(jsonOut, null, 2), "utf-8");
  // eslint-disable-next-line no-console
  console.log(`✅ Wrote ${path.relative(process.cwd(), jsonPath) || jsonPath}`);

  if (!noHtml) {
    const htmlPath = path.join(reportDir, `${summaryBase}.html`);
    fs.writeFileSync(
      htmlPath,
      buildSummaryHtml({
        generatedAt,
        reportDir,
        flowsFile: flowsFileLabel,
        counts,
        rows,
      }),
      "utf-8"
    );
    // eslint-disable-next-line no-console
    console.log(`✅ Wrote ${path.relative(process.cwd(), htmlPath) || htmlPath}`);
  }

  const channelId = resolveSlackChannelId(process.cwd());

  if (dryRun) {
    // eslint-disable-next-line no-console
    console.log("Dry run: skipping Slack. Summary:", JSON.stringify({ counts, cumulativeNote }));
    return;
  }

  if (process.env.SKIP_SLACK === "1") {
    // eslint-disable-next-line no-console
    console.log("SKIP_SLACK=1 — not posting to Slack (url-run-summary files were written).");
    return;
  }

  let botToken: string | undefined;
  try {
    botToken = resolveSlackBotToken(process.cwd());
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error((e as Error).message);
    process.exitCode = 1;
    return;
  }

  if (!botToken) {
    // eslint-disable-next-line no-console
    console.warn("Slack: no token — add slack.authToken (xoxb-...) to encryption_data.xlsx or set SLACK_BOT_TOKEN.");
    return;
  }

  const failedSamples = rows
    .filter((r) => r.status === "failed" || r.status === "timedOut")
    .map((r) => ({ flowId: r.flowId, documentUrl: r.documentUrl, error: r.error }));

  const perProjectBreakdown = buildPerProjectBreakdownMrkdwn(rows);

  // Read doc-step warnings count from doc-step-warnings.json if present
  let warningFlows = 0;
  try {
    const warningsPath = path.join(reportDir, "doc-step-warnings.json");
    if (fs.existsSync(warningsPath)) {
      const warningsData = JSON.parse(fs.readFileSync(warningsPath, "utf-8")) as { warningFlows?: number };
      warningFlows = warningsData.warningFlows ?? 0;
    }
  } catch {
    // non-fatal: warnings count is optional
  }

  // GHA run URL from env (set in cms-batch1-scheduled.yml Post Slack step)
  const runUrl = process.env.RUN_URL || "";
  const duration = process.env.CMS_BATCH_DURATION_LABEL || process.env.BATCH1_DURATION_LABEL || process.env.CMS_BATCH1_DURATION || "";

  await postSlackChatPostMessage(botToken, channelId, {
    reportDir,
    flowsFile: flowsFileLabel,
    counts,
    failedSamples,
    cumulativeNote,
    perProjectBreakdown,
    warningFlows,
    runUrl,
    duration,
  });
  // eslint-disable-next-line no-console
  console.log("✅ Posted summary to Slack");
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e?.stack || String(e));
  process.exitCode = 1;
});
