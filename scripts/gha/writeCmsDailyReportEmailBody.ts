/**
 * Builds plain-text body for CMS daily GitHub Actions email (SMTP step).
 * Reads REPORT_DIR/url-run-summary.json when the sequential batch wrote it.
 *
 * Usage (CI): REPORT_DIR=... CMS_STEP_OUTCOME=success npx ts-node scripts/gha/writeCmsDailyReportEmailBody.ts <out-file>
 */
import fs from "fs";
import path from "path";

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

  const lines: string[] = [
    "CMS — daily documentation URL automation",
    "",
    `Playwright CMS batch step outcome: ${conclusion}`,
    "",
    "---",
    "",
  ];

  if (reportDir && fs.existsSync(reportDir)) {
    const jsonPath = path.join(reportDir, "url-run-summary.json");
    if (fs.existsSync(jsonPath)) {
      try {
        const j = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as {
          generatedAt?: string;
          counts?: Record<string, number>;
        };
        const c = j.counts || {};
        lines.push(`Summary generated at: ${j.generatedAt || "unknown"}`, "");
        lines.push(
          `Flows — total: ${c.total ?? "—"}, passed: ${c.passed ?? "—"}, failed: ${c.failed ?? "—"}, skipped: ${c.skipped ?? "—"}, timed out: ${c.timedOut ?? "—"}, interrupted: ${c.interrupted ?? "—"}`
        );
        lines.push("");
      } catch {
        lines.push("(Could not parse url-run-summary.json)", "");
      }
    } else {
      lines.push(
        "No url-run-summary.json in REPORT_DIR — the batch may have failed before reports were merged.",
        ""
      );
    }
  } else {
    lines.push(`REPORT_DIR missing or not found (${reportDir || "unset"}).`, "");
  }

  if (runUrl) {
    lines.push("Workflow run (download artifacts):", runUrl, "");
  }

  lines.push(
    "Typical artifacts:",
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
