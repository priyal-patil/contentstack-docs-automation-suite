#!/usr/bin/env bash
# =============================================================================
# Delete ALL content types from PriyalDocsStack — headless loop
#
# Runs the delete-content-type flow repeatedly (1 worker, headless) until no
# more content types remain. Each iteration deletes the first visible row.
# Stops automatically when the flow fails (nothing left to delete).
#
# Usage:
#   ./scripts/run-delete-all-content-types.sh
#   PLAYWRIGHT_HEADLESS=0 ./scripts/run-delete-all-content-types.sh   (headed)
# =============================================================================

set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

_CLEANUP_DONE=0
cleanup() {
  [[ "$_CLEANUP_DONE" -eq 1 ]] && return
  _CLEANUP_DONE=1
  echo "" >&2
  echo "🧹  Cleaning up browser processes..." >&2
  pkill -f "chrome-headless-shell" 2>/dev/null || true
  echo "🧹  Done." >&2
}
trap cleanup EXIT INT TERM

TS="$(date +%Y%m%d-%H%M%S)"
export REPORT_DIR="${REPORT_DIR:-$ROOT/reports/delete-all-content-types-$TS}"
LOG="$REPORT_DIR/delete-loop.log"
mkdir -p "$REPORT_DIR"

export DEFAULT_STACK="PriyalDocsStack"
export PW_WORKERS=1
export PW_FLOW_MAX_MINUTES="${PW_FLOW_MAX_MINUTES:-5}"
export PW_SLOWMO="${PW_SLOWMO:-0}"
export PLAYWRIGHT_HEADLESS="${PLAYWRIGHT_HEADLESS:-1}"
export CMS_SEQUENTIAL_MODULE_ORDER=0
export CMS_CONTINUE_ON_FAIL=0
export OPEN_FLOW_REPORT="false"
export SKIP_SLACK=1

ITER=0
DELETED=0
START_EPOCH="$(date +%s)"

: > "$LOG"
echo "================================================================" | tee -a "$LOG"
echo "  Delete all content types — PriyalDocsStack — headless loop" | tee -a "$LOG"
echo "  Stack   : $DEFAULT_STACK" | tee -a "$LOG"
echo "  Report  : $REPORT_DIR" | tee -a "$LOG"
echo "  Started : $(date -u +'%Y-%m-%dT%H:%M:%SZ')" | tee -a "$LOG"
echo "================================================================" | tee -a "$LOG"

while true; do
  ITER=$(( ITER + 1 ))
  ITER_START="$(date +%s)"
  echo "" | tee -a "$LOG"
  echo "[Iteration ${ITER}] Attempting to delete one content type..." | tee -a "$LOG"

  set +e
  PW_WORKERS=1 npx playwright test tests/flows.spec.ts \
    --project=flows \
    --grep "Project=CMS.*cleanup-delete-one-content-type$" \
    2>&1 | tee -a "$LOG"
  EXIT_CODE=${PIPESTATUS[0]}
  set -e

  ITER_DUR=$(( $(date +%s) - ITER_START ))

  if [[ "$EXIT_CODE" -eq 0 ]]; then
    DELETED=$(( DELETED + 1 ))
    echo "  ✅ Deleted #${DELETED} — $(( ITER_DUR / 60 ))m$(( ITER_DUR % 60 ))s" | tee -a "$LOG"
  else
    echo "  ⏹  Flow failed after ${DELETED} deletion(s) — no more content types found (or an error occurred)." | tee -a "$LOG"
    break
  fi
done

TOTAL_ELAPSED=$(( $(date +%s) - START_EPOCH ))
echo "" | tee -a "$LOG"
echo "================================================================" | tee -a "$LOG"
echo "  COMPLETE" | tee -a "$LOG"
echo "  Content types deleted : $DELETED" | tee -a "$LOG"
echo "  Total iterations      : $ITER" | tee -a "$LOG"
echo "  Total duration        : $(( TOTAL_ELAPSED / 60 ))m$(( TOTAL_ELAPSED % 60 ))s" | tee -a "$LOG"
echo "  Finished : $(date -u +'%Y-%m-%dT%H:%M:%SZ')" | tee -a "$LOG"
echo "================================================================" | tee -a "$LOG"
