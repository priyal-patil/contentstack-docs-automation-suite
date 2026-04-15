#!/usr/bin/env bash
# After a timed-out retry Playwright run: cumulative Slack, regenerate dashboards, open unified HTML.
# Use when the retry dir already has flows-results.json (e.g. in-flight job used an older rerun script).
#
# Usage:
#   ./scripts/finish-cms-retry-slack-dashboard.sh reports/cms-retry-timedout-XXXX reports/cms-seq-.../url-run-summary.json
#
# Env: SKIP_SLACK=1, SKIP_OPEN_DASHBOARD=1

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REPORT_DIR="${1:?first arg: REPORT_DIR}"
BASELINE="${2:?second arg: baseline url-run-summary.json path (relative to repo or absolute)}"

if [[ "$REPORT_DIR" != /* ]]; then REPORT_DIR="$ROOT/$REPORT_DIR"; fi
if [[ "$BASELINE" != /* ]]; then SUMMARY_PATH="$ROOT/$BASELINE"; else SUMMARY_PATH="$BASELINE"; fi
if [[ ! -f "$SUMMARY_PATH" ]]; then
  echo "Baseline not found: $SUMMARY_PATH" >&2
  exit 1
fi

if [[ ! -f "$REPORT_DIR/flows-results.json" ]]; then
  echo "No flows-results.json in $REPORT_DIR — wait for Playwright to finish." >&2
  exit 1
fi

cp "$REPORT_DIR/flows-results.json" "$REPORT_DIR/flows-results-cms.json"

REL_BASELINE="$BASELINE"
if [[ "$SUMMARY_PATH" = "$ROOT"/* ]]; then REL_BASELINE="${SUMMARY_PATH#$ROOT/}"; fi

if [[ "${SKIP_SLACK:-0}" != "1" ]]; then
  npx ts-node "$ROOT/scripts/urlRunSummaryAndSlack.ts" \
    --reportDir "$REPORT_DIR" \
    --mergeBaselineUrlRunSummary "$REL_BASELINE"
else
  echo "SKIP_SLACK=1 — skipping Slack"
fi

npx ts-node "$ROOT/scripts/generateCmsExcelReport.ts" --reportDir "$REPORT_DIR" || true
npx ts-node "$ROOT/scripts/generateCmsDashboardHtml.ts" --reportDir "$REPORT_DIR" || true
npx ts-node "$ROOT/scripts/generateDashboardReport.ts" --reportDir "$REPORT_DIR" || true
npx ts-node "$ROOT/scripts/buildCmsReportBundle.ts" --reportDir "$REPORT_DIR" || true
npx ts-node "$ROOT/scripts/generateUnifiedReport.ts" --reportDir "$REPORT_DIR" || true

echo "$REPORT_DIR" > "$ROOT/reports/latest-cms-retry-dir.txt"

if [[ "${SKIP_OPEN_DASHBOARD:-0}" != "1" ]]; then
  UNIFIED="$REPORT_DIR/unified-dashboard.html"
  if [[ -f "$UNIFIED" ]]; then
    open "$UNIFIED" 2>/dev/null || true
    echo "Opened: file://$UNIFIED"
  else
    echo "WARNING: unified-dashboard.html missing" >&2
  fi
fi

echo "Done: $REPORT_DIR"
