#!/usr/bin/env bash
# Run all Playwright flows for Project=CMS in headless mode, then docs link-audit (cms-urls.csv),
# then cms-dashboard.html, cms-automation-report.xlsx (incl. docs audit sheets), shared dashboard,
# and report-bundle/ (HTML organized by CMS module).
# Uses an isolated REPORT_DIR so concurrent local work on flows does not overwrite reports/latest.
#
# Usage:
#   ./scripts/run-cms-headless-report.sh
#   REPORT_DIR=reports/my-run ./scripts/run-cms-headless-report.sh
# Background:
#   nohup ./scripts/run-cms-headless-report.sh > reports/cms-nohup.log 2>&1 &

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TS="$(date +%Y%m%d-%H%M%S)"
export REPORT_DIR="${REPORT_DIR:-$ROOT/reports/cms-headless-$TS}"
mkdir -p "$REPORT_DIR"

START_EPOCH="$(date +%s)"
START_ISO="$(date -Iseconds 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ")"

echo "{\"startedAt\":\"$START_ISO\",\"reportDir\":\"$REPORT_DIR\",\"mode\":\"cms-headless\"}" > "$REPORT_DIR/run-meta.json"

export PW_SLOWMO="${PW_SLOWMO:-0}"
# Parallel across modules (flows.spec.ts); cap if your machine struggles (e.g. PW_WORKERS=4).
export PW_WORKERS="${PW_WORKERS:-6}"
# Allow disabling parallel test dispatch: PW_FULLY_PARALLEL=0
export PW_FULLY_PARALLEL="${PW_FULLY_PARALLEL:-1}"
export PLAYWRIGHT_HEADLESS=1

# URLs for docs-audit (same doc set as CMS flows + flows/CMS/docs.json)
if [[ ! -f "$ROOT/data/cms-urls.csv" ]]; then
  npx ts-node "$ROOT/scripts/buildCmsUrlsCsv.ts"
fi
export DOCS_URLS_CSV="$ROOT/data/cms-urls.csv"

RUN_EXIT=0
set +e
npx playwright test tests/flows.spec.ts -g "Project=CMS" --project=default 2>&1 | tee "$REPORT_DIR/cms-playwright.log"
RUN_EXIT=${PIPESTATUS[0]}
set -e

# Preserve CMS Playwright JSON — a second Playwright run for docs-audit would overwrite flows-results.json
if [[ -f "$REPORT_DIR/flows-results.json" ]]; then
  cp "$REPORT_DIR/flows-results.json" "$REPORT_DIR/flows-results-cms.json"
fi

AUDIT_EXIT=0
set +e
npx playwright test tests/docs-audit.spec.ts --project=docs-audit 2>&1 | tee -a "$REPORT_DIR/cms-playwright.log"
AUDIT_EXIT=${PIPESTATUS[0]}
set -e
if [[ "$AUDIT_EXIT" -ne 0 ]]; then
  echo "⚠️  Docs-audit exited with code $AUDIT_EXIT (often still produced per-doc JSON). Continuing report generation." | tee -a "$REPORT_DIR/cms-playwright.log"
fi

END_EPOCH="$(date +%s)"
DUR=$((END_EPOCH - START_EPOCH))
END_ISO="$(date -Iseconds 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ")"

node -e "
const fs = require('fs');
const p = process.env.REPORT_DIR + '/run-meta.json';
const j = JSON.parse(fs.readFileSync(p, 'utf-8'));
j.finishedAt = '$END_ISO';
j.durationSeconds = $DUR;
j.playwrightExitCode = $RUN_EXIT;
fs.writeFileSync(p, JSON.stringify(j, null, 2));
"

npx ts-node "$ROOT/scripts/generateCmsExcelReport.ts" --reportDir "$REPORT_DIR"
npx ts-node "$ROOT/scripts/generateCmsDashboardHtml.ts" --reportDir "$REPORT_DIR"
npx ts-node "$ROOT/scripts/generateDashboardReport.ts" --reportDir "$REPORT_DIR" || true
npx ts-node "$ROOT/scripts/buildCmsReportBundle.ts" --reportDir "$REPORT_DIR"
npx ts-node "$ROOT/scripts/generateUnifiedReport.ts" --reportDir "$REPORT_DIR"

echo "" | tee -a "$REPORT_DIR/cms-playwright.log"
echo "=== CMS headless batch complete ===" | tee -a "$REPORT_DIR/cms-playwright.log"
echo "REPORT_DIR=$REPORT_DIR" | tee -a "$REPORT_DIR/cms-playwright.log"
echo "durationSeconds=$DUR" | tee -a "$REPORT_DIR/cms-playwright.log"
echo "playwrightExitCode=$RUN_EXIT" | tee -a "$REPORT_DIR/cms-playwright.log"
echo "docsAuditExitCode=$AUDIT_EXIT" | tee -a "$REPORT_DIR/cms-playwright.log"
echo "Open: file://$REPORT_DIR/report-bundle/index.html  (main bundle)" | tee -a "$REPORT_DIR/cms-playwright.log"
echo "Unified (multi-project): file://$REPORT_DIR/unified-dashboard.html" | tee -a "$REPORT_DIR/cms-playwright.log"
echo "Also: file://$REPORT_DIR/cms-dashboard.html" | tee -a "$REPORT_DIR/cms-playwright.log"
echo "Excel: $REPORT_DIR/cms-automation-report.xlsx" | tee -a "$REPORT_DIR/cms-playwright.log"

echo "$REPORT_DIR" > "$ROOT/reports/latest-cms-batch-dir.txt"

# Non-zero if CMS flows failed (docs-audit is informational)
exit "$RUN_EXIT"
