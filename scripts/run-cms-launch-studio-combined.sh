#!/usr/bin/env bash
# Sequential full batch: CMS (sequential modules pipeline) → Launch flows → Studio flows,
# merge Playwright JSON, regenerate dashboards + CMS bundle, one Slack summary (per-project breakdown),
# then open unified dashboard once (unless SKIP_OPEN_DASHBOARD=1).
#
# Workers: set PW_WORKERS before calling (default 4 — balance throughput vs memory; use 6 on capable hosts).
# Env: REPORT_DIR, SKIP_SLACK (skip final Slack if 1; CMS child always runs with Slack off), SKIP_OPEN_DASHBOARD,
#      PLAYWRIGHT_HEADLESS, PW_FLOW_MAX_MINUTES, OPEN_CMS_DASHBOARD=0 implied during CMS.
#
# Usage:
#   ./scripts/run-cms-launch-studio-combined.sh
#   PW_WORKERS=6 ./scripts/run-cms-launch-studio-combined.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TS="$(date +%Y%m%d-%H%M%S)"
export REPORT_DIR="${REPORT_DIR:-$ROOT/reports/cms-launch-studio-$TS}"
MERGE_DIR="$REPORT_DIR/merge-playwright-parts"
mkdir -p "$REPORT_DIR" "$MERGE_DIR"

# Default: 4 workers (local); override with PW_WORKERS=6 to match single-project background batches.
export PW_WORKERS="${PW_WORKERS:-4}"
export PLAYWRIGHT_HEADLESS="${PLAYWRIGHT_HEADLESS:-1}"
export OPEN_FLOW_REPORT="${OPEN_FLOW_REPORT:-false}"
export PW_FLOW_MAX_MINUTES="${PW_FLOW_MAX_MINUTES:-15}"
export OPEN_CMS_DASHBOARD=0

START_ISO="$(date -Iseconds 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "{\"startedAt\":\"$START_ISO\",\"reportDir\":\"$REPORT_DIR\",\"mode\":\"cms-launch-studio-combined\"}" >"$REPORT_DIR/run-meta.json"

COMBINED_LOG="$REPORT_DIR/combined-cms-launch-studio.log"
: >"$COMBINED_LOG"

ANY_FAIL=0

echo "=== CMS + Launch + Studio combined batch → $REPORT_DIR ===" | tee -a "$COMBINED_LOG"
echo "PW_WORKERS=$PW_WORKERS PLAYWRIGHT_HEADLESS=$PLAYWRIGHT_HEADLESS" | tee -a "$COMBINED_LOG"

set +e
echo "" | tee -a "$COMBINED_LOG"
echo ">>> [1/3] CMS sequential modules (full pipeline)" | tee -a "$COMBINED_LOG"
# Inner CMS: no Slack, no HTML open (single open at end of this script)
SKIP_SLACK=1 SKIP_OPEN_DASHBOARD=1 OPEN_CMS_DASHBOARD=0 \
  bash "$ROOT/scripts/run-cms-sequential-modules-dashboard.sh" 2>&1 | tee -a "$COMBINED_LOG"
CMS_EX=${PIPESTATUS[0]}
set -e
if [[ "$CMS_EX" -ne 0 ]]; then
  ANY_FAIL=1
  echo "WARNING: CMS pipeline exited $CMS_EX — continuing with Launch and Studio" | tee -a "$COMBINED_LOG"
fi

if [[ ! -f "$REPORT_DIR/flows-results.json" ]]; then
  echo "ERROR: Missing $REPORT_DIR/flows-results.json after CMS — aborting." | tee -a "$COMBINED_LOG"
  exit 1
fi
cp "$REPORT_DIR/flows-results.json" "$MERGE_DIR/cms.json"
echo "Saved merge part: cms.json ($(wc -c <"$MERGE_DIR/cms.json") bytes)" | tee -a "$COMBINED_LOG"

set +e
echo "" | tee -a "$COMBINED_LOG"
echo ">>> [2/3] Launch flows (Project=Launch)" | tee -a "$COMBINED_LOG"
npx playwright test tests/flows.spec.ts --project=flows -g "Project=Launch" 2>&1 | tee -a "$COMBINED_LOG"
LAUNCH_EX=${PIPESTATUS[0]}
set -e
if [[ "$LAUNCH_EX" -ne 0 ]]; then
  ANY_FAIL=1
  echo "WARNING: Launch Playwright exited $LAUNCH_EX" | tee -a "$COMBINED_LOG"
fi
if [[ ! -f "$REPORT_DIR/flows-results.json" ]]; then
  echo "ERROR: Missing flows-results.json after Launch" | tee -a "$COMBINED_LOG"
  exit 1
fi
cp "$REPORT_DIR/flows-results.json" "$MERGE_DIR/launch.json"
echo "Saved merge part: launch.json" | tee -a "$COMBINED_LOG"

set +e
echo "" | tee -a "$COMBINED_LOG"
echo ">>> [3/3] Studio flows (Project=Studio)" | tee -a "$COMBINED_LOG"
npx playwright test tests/flows.spec.ts --project=flows -g "Project=Studio" 2>&1 | tee -a "$COMBINED_LOG"
STUDIO_EX=${PIPESTATUS[0]}
set -e
if [[ "$STUDIO_EX" -ne 0 ]]; then
  ANY_FAIL=1
  echo "WARNING: Studio Playwright exited $STUDIO_EX" | tee -a "$COMBINED_LOG"
fi
if [[ ! -f "$REPORT_DIR/flows-results.json" ]]; then
  echo "ERROR: Missing flows-results.json after Studio" | tee -a "$COMBINED_LOG"
  exit 1
fi
cp "$REPORT_DIR/flows-results.json" "$MERGE_DIR/studio.json"
echo "Saved merge part: studio.json" | tee -a "$COMBINED_LOG"

echo "" | tee -a "$COMBINED_LOG"
echo ">>> Merging Playwright JSON (CMS + Launch + Studio)" | tee -a "$COMBINED_LOG"
npx ts-node "$ROOT/scripts/mergePlaywrightFlowJsonReports.ts" --out "$REPORT_DIR/flows-results.json" \
  "$MERGE_DIR/cms.json" "$MERGE_DIR/launch.json" "$MERGE_DIR/studio.json" 2>&1 | tee -a "$COMBINED_LOG"

echo "" | tee -a "$COMBINED_LOG"
echo ">>> Regenerating reports (merged flows-results.json)" | tee -a "$COMBINED_LOG"
npx ts-node "$ROOT/scripts/generateCmsExcelReport.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$COMBINED_LOG" || true
npx ts-node "$ROOT/scripts/generateCmsDashboardHtml.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$COMBINED_LOG" || true
npx ts-node "$ROOT/scripts/generateDashboardReport.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$COMBINED_LOG" || true
npx ts-node "$ROOT/scripts/buildCmsReportBundle.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$COMBINED_LOG" || true
npx ts-node "$ROOT/scripts/generateUnifiedReport.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$COMBINED_LOG" || true

echo "$REPORT_DIR" >"$ROOT/reports/latest-cms-batch-dir.txt"
echo "$REPORT_DIR" >"$ROOT/reports/latest-combined-cms-launch-studio-dir.txt"

END_ISO="$(date -Iseconds 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ")"
REPORT_DIR="$REPORT_DIR" CMS_EX="$CMS_EX" LAUNCH_EX="$LAUNCH_EX" STUDIO_EX="$STUDIO_EX" ANY_FAIL="$ANY_FAIL" END_ISO="$END_ISO" node -e "
const fs = require('fs');
const p = process.env.REPORT_DIR + '/run-meta.json';
const j = JSON.parse(fs.readFileSync(p, 'utf8'));
j.finishedAt = process.env.END_ISO;
j.phases = {
  cmsExit: Number(process.env.CMS_EX),
  launchExit: Number(process.env.LAUNCH_EX),
  studioExit: Number(process.env.STUDIO_EX),
  anyFail: Number(process.env.ANY_FAIL),
};
fs.writeFileSync(p, JSON.stringify(j, null, 2));
" || true

echo "" | tee -a "$COMBINED_LOG"
echo ">>> Slack summary (CMS + Launch + Studio — merged flows-results.json)" | tee -a "$COMBINED_LOG"
if [[ "${SKIP_SLACK:-0}" != "1" ]]; then
  npx ts-node "$ROOT/scripts/urlRunSummaryAndSlack.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$COMBINED_LOG" || true
else
  echo "SKIP_SLACK=1 — skipping Slack" | tee -a "$COMBINED_LOG"
fi

if [[ "${SKIP_OPEN_DASHBOARD:-0}" != "1" ]]; then
  if [[ -f "$REPORT_DIR/unified-dashboard.html" ]]; then
    open "$REPORT_DIR/unified-dashboard.html" 2>/dev/null || true
    echo "Opened unified dashboard: file://$REPORT_DIR/unified-dashboard.html" | tee -a "$COMBINED_LOG"
  elif [[ -f "$REPORT_DIR/report-bundle/index.html" ]]; then
    open "$REPORT_DIR/report-bundle/index.html" 2>/dev/null || true
    echo "Opened report bundle: file://$REPORT_DIR/report-bundle/index.html" | tee -a "$COMBINED_LOG"
  fi
else
  echo "SKIP_OPEN_DASHBOARD=1 — not opening HTML" | tee -a "$COMBINED_LOG"
fi

echo "" | tee -a "$COMBINED_LOG"
echo "=== Combined batch complete (anyPhaseFail=$ANY_FAIL) ===" | tee -a "$COMBINED_LOG"
echo "REPORT_DIR=$REPORT_DIR" | tee -a "$COMBINED_LOG"

exit "$ANY_FAIL"
