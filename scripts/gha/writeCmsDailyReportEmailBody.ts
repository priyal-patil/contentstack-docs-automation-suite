/**
 * Builds plain-text body for CMS daily GitHub Actions email (SMTP step).
 * Reads REPORT_DIR/url-run-summary.json when the sequential batch wrote it.
 * Falls back to flows-results.json stats + cancellation-summary.txt when
 * the job was cancelled or timed out before the normal report scripts ran.
 *
 * Usage (CI): REPORT_DIR=... CMS_STEP_OUTCOME=success npx ts-node scripts/gha/writeCmsDailyReportEmailBody.ts <out-file>
 */
import fs from "fs";
import path from "path";

interface PlaywrightStats {
  expected?: number;
  unexpected?: number;
  flaky?: number;
  skipped?: number;
  duration?: number;
}

function parseFlowsResultsStats(filePath: string): PlaywrightStats | null {
  try {
    const j = JSON.parse(fs.readFileSync(filePath, "utf-8")) as {
      stats?: PlaywrightStats;
    };
    return j.stats ?? null;
  } catch {
    return null;
  }
}

function main(): void {
  const outFile = process.argv[2];
  const reportDir = process.env.REPORT_DIR?.trim();
  const conclusion = process.env.CMS_STEP_OUTCOME?.trim() || "unknown";
  const runUrl =
    process.env.GITHUB_SERVER_URL &&
    process.env.GITHUB_REPOSITORY &&
    process.env.GITHUB_RUN_ID
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : "";

  if (!outFile) {
    // eslint-disable-next-line no-console
    console.error("usage: writeCmsDailyReportEmailBody.ts <out-file>");
    process.exit(2);
  }

  const isCancelledOrTimeout =
    conclusion === "cancelled" || conclusion === "timed_out";

  const lines: string[] = [
    "CMS — daily documentation URL automation",
    "",
    `Playwright CMS batch step outcome: ${conclusion}${isCancelledOrTimeout ? " ⚠️ (job was cancelled/timed out — partial report below)" : ""}`,
    "",
    "---",
    "",
  ];

  if (reportDir && fs.existsSync(reportDir)) {
    const summaryPath = path.join(reportDir, "url-run-summary.json");
    const flowsResultsPath = path.join(reportDir, "flows-results.json");
    const cancelSummaryPath = path.join(reportDir, "cancellation-summary.txt");

    // Primary source: url-run-summary.json (written on normal completion)
    if (fs.existsSync(summaryPath)) {
      try {
        const j = JSON.parse(fs.readFileSync(summaryPath, "utf-8")) as {
          generatedAt?: string;
          counts?: Record<string, number>;
        };
        const c = j.counts || {};
        lines.push(
          `Summary generated at: ${j.generatedAt || "unknown"}`,
          ""
        );
        lines.push(
          `Flows — total: ${c.total ?? "—"}, passed: ${c.passed ?? "—"}, failed: ${c.failed ?? "—"}, skipped: ${c.skipped ?? "—"}, timed out: ${c.timedOut ?? "—"}, interrupted: ${c.interrupted ?? "—"}`
        );
        lines.push("");
      } catch {
        lines.push("(Could not parse url-run-summary.json)", "");
      }
    } else if (fs.existsSync(flowsResultsPath)) {
      // Fallback: parse flows-results.json directly (partial run / cancellation)
      lines.push(
        "⚠️  Partial report — job was cancelled or timed out before full summary was generated.",
        ""
      );
      const stats = parseFlowsResultsStats(flowsResultsPath);
      if (stats) {
        const durMin =
          stats.duration != null
            ? ` (duration: ${Math.round(stats.duration / 60000)} min)`
            : "";
        lines.push(
          `Flows executed so far${durMin}:`,
          `  passed      : ${stats.expected ?? "—"}`,
          `  failed      : ${stats.unexpected ?? "—"}`,
          `  skipped     : ${stats.skipped ?? "—"}`,
          `  flaky       : ${stats.flaky ?? "—"}`,
          ""
        );
      } else {
        lines.push(
          "(flows-results.json found but stats could not be parsed)",
          ""
        );
      }
    } else {
      lines.push(
        "No url-run-summary.json or flows-results.json in REPORT_DIR — the batch may have been cancelled before any tests completed.",
        ""
      );
    }

    // Cancellation phase summary (written by the partial-merge GHA step)
    if (fs.existsSync(cancelSummaryPath)) {
      lines.push("--- Phase execution summary ---", "");
      lines.push(fs.readFileSync(cancelSummaryPath, "utf-8").trim(), "");
    }
  } else {
    lines.push(
      `REPORT_DIR missing or not found (${reportDir || "unset"}).`,
      ""
    );
  }

  if (runUrl) {
    lines.push("Workflow run (download artifacts):", runUrl, "");
  }

  lines.push(
    "Artifacts (when available):",
    "  • cms-reports-* — Excel, dashboards, flows-results.json, cms-sequential.log",
    "  • playwright-html-* — Playwright HTML report",
    ""
  );

  fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
  fs.writeFileSync(outFile, lines.join("\n"), "utf-8");
  // eslint-disable-next-line no-console
  console.log(`Wrote ${outFile}`);
}

main();
