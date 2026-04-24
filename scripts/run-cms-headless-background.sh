#!/usr/bin/env bash
# Start the full CMS pipeline (flows + docs-audit + Excel + dashboards + bundle + Slack) in the background.
# Per-flow HTML is never auto-opened; final report-bundle is not auto-opened unless OPEN_CMS_DASHBOARD=1.
#
# macOS: while this job runs, the script wraps the pipeline in `caffeinate -i -m -s` so the system does not
# idle-sleep (screen lock is fine). That does NOT guarantee completion if the machine fully sleeps or
# hibernates (e.g. lid closed + battery policy) — for that, use AC power, disable sleep for the duration,
# or run on CI / a remote host. Set SKIP_CAFFEINATE=1 to disable.
#
# Usage:
#   npm run test:cms
#   CMS_BG_LOG=reports/my.log bash scripts/run-cms-headless-background.sh
#   OPEN_CMS_DASHBOARD=1 npm run test:cms   # open report-bundle when the batch finishes

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
mkdir -p reports
TS="$(date +%Y%m%d-%H%M%S)"
LOG="${CMS_BG_LOG:-$ROOT/reports/cms-headless-bg-$TS.log}"

RUNNER=(bash "$ROOT/scripts/run-cms-headless-report.sh")
if [[ "${SKIP_CAFFEINATE:-0}" != "1" ]] && command -v caffeinate >/dev/null 2>&1; then
  RUNNER=(caffeinate -i -m -s -- bash "$ROOT/scripts/run-cms-headless-report.sh")
fi

nohup env \
  OPEN_FLOW_REPORT=false \
  OPEN_CMS_DASHBOARD="${OPEN_CMS_DASHBOARD:-0}" \
  "${RUNNER[@]}" >"$LOG" 2>&1 &
PID=$!

echo "CMS sequential modules + delete batch + trash + retry + docs-audit + bundle started in background (PID $PID)."
echo "Log: $LOG"
echo "Tail: tail -f \"$LOG\""
echo "Reports: reports/latest-cms-batch-dir.txt (no auto-open; set OPEN_CMS_DASHBOARD=1 to open bundle when done)."
if [[ "${SKIP_CAFFEINATE:-0}" != "1" ]] && command -v caffeinate >/dev/null 2>&1; then
  echo "macOS: caffeinate -i -m -s is holding off idle/system sleep until this job finishes (SKIP_CAFFEINATE=1 to disable)."
fi
