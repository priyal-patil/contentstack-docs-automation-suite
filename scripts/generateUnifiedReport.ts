#!/usr/bin/env npx ts-node
/**
 * Unified multi-project documentation automation report.
 *
 * Reads (under --reportDir):
 *   - flows-results.json or flows-results-cms.json (executable flows)
 *   - doc-step-failures.json, doc-step-warnings.json
 *   - docs-audit-summary.json (+ optional docs-audit-per-doc/)
 *   - docs-results.json (informational HTTP checks from docs.spec)
 *
 * Writes:
 *   - unified-dashboard.html — health cards per project, drift rate, full table
 *   - master-report.xlsx, master-report.csv
 *   - unified-report.json — Slack-friendly summary + rows
 *   - url-reports/<Project>/… — per-URL HTML (flow step logs; informational link/image lists)
 *
 * CI / nightly (example):
 *   export REPORT_DIR=reports/nightly-$(date +%Y%m%d)
 *   playwright test tests/flows.spec.ts tests/docs-audit.spec.ts tests/docs.spec.ts
 *   npx ts-node scripts/generateUnifiedReport.ts --reportDir "$REPORT_DIR"
 *
 * Slack: POST unified-report.json or use projects[] + summary blocks in your integration.
 */

import path from "path";
import { renderUnifiedReport } from "../core/report/unifiedReportRender";

const reportDirArg = process.argv.includes("--reportDir")
  ? process.argv[process.argv.indexOf("--reportDir") + 1]
  : process.env.REPORT_DIR || "reports/latest";

const reportDir = path.resolve(process.cwd(), reportDirArg);
const cwd = process.cwd();

const { dashboardPath, excelPath, csvPath, slackPath } = renderUnifiedReport(reportDir, cwd);

// eslint-disable-next-line no-console
console.log(`✅ Unified dashboard: ${dashboardPath}`);
// eslint-disable-next-line no-console
console.log(`✅ Master Excel: ${excelPath}`);
// eslint-disable-next-line no-console
console.log(`✅ Master CSV: ${csvPath}`);
// eslint-disable-next-line no-console
console.log(`✅ Slack JSON: ${slackPath}`);
