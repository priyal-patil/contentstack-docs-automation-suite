#!/usr/bin/env bash
# =============================================================================
# CMS Workflows — 18 flows in CRUD sequence, 1 worker, 5 min cap
#
# Execution order (CRUD):
#   Read (about/info):
#     1.  about-workflows
#     2.  about-workflow-stages
#     3.  about-workflow-tasks
#     4.  workflows-use-cases
#   Create:
#     5.  get-started-with-workflows
#     6.  add-workflows-and-stages
#     7.  add-a-publish-rule
#   Read (operational):
#     8.  set-edit-access-permissions-for-workflow-stages
#     9.  change-entry-workflow-stage
#     10. use-task-filter
#     11. send-an-entry-for-edit-access-approval
#     12. approve-edit-access-request-for-an-entry
#     13. revoke-edit-access-for-an-entry
#     14. send-an-entry-for-publish-or-unpublish-approval
#   Update:
#     15. update-a-workflow
#     16. update-a-publish-rule
#     17. enable-or-disable-a-workflow-part-1
#     18. enable-or-disable-a-workflow-part-2
#   Delete: (handled by Batch 3 global delete sweep)
#
# Each flow gets a hard 5-minute timeout. Failure captures a screenshot.
# All flows share the same auth session (auth.json generated on first run).
#
# Usage:
#   ./scripts/run-cms-workflows.sh
#   PLAYWRIGHT_HEADLESS=0 ./scripts/run-cms-workflows.sh   (headed)
#   REPORT_DIR=reports/my-workflows ./scripts/run-cms-workflows.sh
#   PW_RETRIES=0 ./scripts/run-cms-workflows.sh            (disable retries)
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
  pkill -f "chrome-headless-shell" 2>/dev/null || true
  echo "🧹  Done." >&2
}
trap cleanup EXIT INT TERM

TS="$(date +%Y%m%d-%H%M%S)"
export REPORT_DIR="${REPORT_DIR:-$ROOT/reports/cms-workflows-$TS}"
LOG="$REPORT_DIR/workflows-run.log"
PARTS_DIR="$REPORT_DIR/playwright-parts"
mkdir -p "$REPORT_DIR" "$PARTS_DIR"

export PW_WORKERS=1
export PW_FLOW_MAX_MINUTES="${PW_FLOW_MAX_MINUTES:-5}"
export PW_SLOWMO="${PW_SLOWMO:-0}"
export PLAYWRIGHT_HEADLESS="${PLAYWRIGHT_HEADLESS:-1}"
export CMS_SEQUENTIAL_MODULE_ORDER=0
export CMS_CONTINUE_ON_FAIL=0
export OPEN_FLOW_REPORT="${OPEN_FLOW_REPORT:-false}"

WORKFLOWS_FLOWS=(
  "about-workflows"
  "about-workflow-stages"
  "about-workflow-tasks"
  "workflows-use-cases"
  "get-started-with-workflows"
  "add-workflows-and-stages"
  "add-a-publish-rule"
  "set-edit-access-permissions-for-workflow-stages"
  "change-entry-workflow-stage"
  "use-task-filter"
  "send-an-entry-for-edit-access-approval"
  "approve-edit-access-request-for-an-entry"
  "revoke-edit-access-for-an-entry"
  "send-an-entry-for-publish-or-unpublish-approval"
  "update-a-workflow"
  "update-a-publish-rule"
  "enable-or-disable-a-workflow-part-1"
  "enable-or-disable-a-workflow-part-2"
)

TOTAL_FLOWS=${#WORKFLOWS_FLOWS[@]}
PASS_COUNT=0
FAIL_COUNT=0
TOTAL_EXIT=0
declare -a FLOW_RESULTS=()
declare -a FAILED_FLOWS=()

START_EPOCH="$(date +%s)"
START_ISO="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"

: > "$LOG"
echo "================================================================" | tee -a "$LOG"
echo "  CMS Workflows — ${TOTAL_FLOWS} flows (deletes in Batch 3) | 1 worker | ${PW_FLOW_MAX_MINUTES} min cap" | tee -a "$LOG"
echo "  Started: ${START_ISO}" | tee -a "$LOG"
echo "  Report:  ${REPORT_DIR}" | tee -a "$LOG"
echo "================================================================" | tee -a "$LOG"
echo "" | tee -a "$LOG"

IDX=0
for FLOW_ID in "${WORKFLOWS_FLOWS[@]}"; do
  IDX=$((IDX + 1))
  FLOW_START="$(date +%s)"
  FLOW_START_ISO="$(date -u +'%H:%M:%SZ')"

  echo "[${IDX}/${TOTAL_FLOWS}] ▶  ${FLOW_ID}  (${FLOW_START_ISO})" | tee -a "$LOG"

  FLOW_TIMEOUT_MINUTES="${PW_FLOW_MAX_MINUTES}"
  [[ "${FLOW_ID}" == "get-started-with-workflows" ]] && FLOW_TIMEOUT_MINUTES=10

  set +e
  PW_FLOW_MAX_MINUTES="${FLOW_TIMEOUT_MINUTES}" npx playwright test tests/flows.spec.ts \
    --project=flows \
    --grep "Project=CMS.*${FLOW_ID}$" \
    2>&1 | tee -a "$LOG"
  FLOW_EXIT=${PIPESTATUS[0]}
  set -e

  FLOW_END="$(date +%s)"
  FLOW_ELAPSED=$(( FLOW_END - FLOW_START ))
  FLOW_MIN=$(( FLOW_ELAPSED / 60 ))
  FLOW_SEC=$(( FLOW_ELAPSED % 60 ))

  if [[ "$FLOW_EXIT" -eq 0 ]]; then
    STATUS="✅ PASS"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    STATUS="❌ FAIL"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    TOTAL_EXIT=1
    FAILED_FLOWS+=("$FLOW_ID")
  fi

  FLOW_RESULTS+=("  ${STATUS}  ${FLOW_ID}  (${FLOW_MIN}m ${FLOW_SEC}s)")
  echo "     ${STATUS}  — ${FLOW_MIN}m ${FLOW_SEC}s" | tee -a "$LOG"

  if [[ -f "$REPORT_DIR/flows-results.json" ]]; then
    cp "$REPORT_DIR/flows-results.json" "$PARTS_DIR/${FLOW_ID}.json" 2>/dev/null || true
  fi
  if [[ -f "$REPORT_DIR/doc-step-warnings.json" ]]; then
    cp "$REPORT_DIR/doc-step-warnings.json" "$PARTS_DIR/${FLOW_ID}-warnings.json" 2>/dev/null || true
  fi

  echo "" | tee -a "$LOG"
done

END_EPOCH="$(date +%s)"
TOTAL_ELAPSED=$(( END_EPOCH - START_EPOCH ))
TOTAL_MIN=$(( TOTAL_ELAPSED / 60 ))
TOTAL_SEC=$(( TOTAL_ELAPSED % 60 ))

echo "================================================================" | tee -a "$LOG"
echo "  CMS Workflows — COMPLETE" | tee -a "$LOG"
echo "  Duration : ${TOTAL_MIN}m ${TOTAL_SEC}s" | tee -a "$LOG"
echo "  Passed   : ${PASS_COUNT}/${TOTAL_FLOWS}" | tee -a "$LOG"
echo "  Failed   : ${FAIL_COUNT}/${TOTAL_FLOWS}" | tee -a "$LOG"
echo "" | tee -a "$LOG"
echo "  Per-flow results:" | tee -a "$LOG"
for r in "${FLOW_RESULTS[@]}"; do
  echo "$r" | tee -a "$LOG"
done
echo "================================================================" | tee -a "$LOG"

if [[ ${#FAILED_FLOWS[@]} -gt 0 ]]; then
  RETRY_PASS=0
  RETRY_FAIL=0

  echo "" | tee -a "$LOG"
  echo "================================================================" | tee -a "$LOG"
  echo "  RETRY — ${#FAILED_FLOWS[@]} failed flow(s) — running once more" | tee -a "$LOG"
  echo "================================================================" | tee -a "$LOG"
  echo "" | tee -a "$LOG"

  for FLOW_ID in "${FAILED_FLOWS[@]}"; do
    FLOW_START="$(date +%s)"
    FLOW_START_ISO="$(date -u +'%H:%M:%SZ')"
    echo "[retry] ▶  ${FLOW_ID}  (${FLOW_START_ISO})" | tee -a "$LOG"

    FLOW_TIMEOUT_MINUTES="${PW_FLOW_MAX_MINUTES}"
    [[ "${FLOW_ID}" == "get-started-with-workflows" ]] && FLOW_TIMEOUT_MINUTES=10

    set +e
    PW_FLOW_MAX_MINUTES="${FLOW_TIMEOUT_MINUTES}" npx playwright test tests/flows.spec.ts \
      --project=flows \
      --grep "Project=CMS.*${FLOW_ID}$" \
      2>&1 | tee -a "$LOG"
    FLOW_EXIT=${PIPESTATUS[0]}
    set -e

    FLOW_END="$(date +%s)"
    FLOW_ELAPSED=$(( FLOW_END - FLOW_START ))
    FLOW_MIN=$(( FLOW_ELAPSED / 60 ))
    FLOW_SEC=$(( FLOW_ELAPSED % 60 ))

    if [[ "$FLOW_EXIT" -eq 0 ]]; then
      STATUS="✅ PASS (retry)"
      RETRY_PASS=$((RETRY_PASS + 1))
      PASS_COUNT=$((PASS_COUNT + 1))
      FAIL_COUNT=$((FAIL_COUNT - 1))
    else
      STATUS="❌ FAIL (retry)"
      RETRY_FAIL=$((RETRY_FAIL + 1))
    fi

    if [[ -f "$REPORT_DIR/flows-results.json" ]]; then
      cp "$REPORT_DIR/flows-results.json" "$PARTS_DIR/${FLOW_ID}.json" 2>/dev/null || true
    fi
    if [[ -f "$REPORT_DIR/doc-step-warnings.json" ]]; then
      cp "$REPORT_DIR/doc-step-warnings.json" "$PARTS_DIR/${FLOW_ID}-warnings.json" 2>/dev/null || true
    fi

    echo "     ${STATUS}  — ${FLOW_MIN}m ${FLOW_SEC}s" | tee -a "$LOG"
    echo "" | tee -a "$LOG"
  done

  echo "================================================================" | tee -a "$LOG"
  echo "  RETRY COMPLETE" | tee -a "$LOG"
  echo "  Recovered    : ${RETRY_PASS}/${#FAILED_FLOWS[@]}" | tee -a "$LOG"
  echo "  Still failing: ${RETRY_FAIL}/${#FAILED_FLOWS[@]}" | tee -a "$LOG"
  echo "  Final passed : ${PASS_COUNT}/${TOTAL_FLOWS}" | tee -a "$LOG"
  echo "  Final failed : ${FAIL_COUNT}/${TOTAL_FLOWS}" | tee -a "$LOG"
  echo "================================================================" | tee -a "$LOG"

  [[ "$RETRY_FAIL" -eq 0 ]] && TOTAL_EXIT=0 || TOTAL_EXIT=1
fi

shopt -s nullglob
PART_FILES=("$PARTS_DIR"/*.json)
WARNING_PARTS=("$PARTS_DIR"/*-warnings.json)
shopt -u nullglob

if [[ ${#WARNING_PARTS[@]} -gt 0 ]]; then
  node -e "
    const fs = require('fs');
    const parts = process.argv.slice(1);
    const all = [];
    for (const p of parts) {
      try {
        const d = JSON.parse(fs.readFileSync(p, 'utf-8'));
        if (Array.isArray(d.warnings)) all.push(...d.warnings);
      } catch {}
    }
    const uniqueFlows = new Set(all.map(w => w.flowId).filter(Boolean)).size;
    fs.writeFileSync(
      '${REPORT_DIR}/doc-step-warnings.json',
      JSON.stringify({ generatedAt: new Date().toISOString(), warningFlows: uniqueFlows, warnings: all }, null, 2)
    );
    console.log('Merged ' + parts.length + ' warning parts → ' + all.length + ' warnings across ' + uniqueFlows + ' flows.');
  " "${WARNING_PARTS[@]}" 2>&1 | tee -a "$LOG" || true
fi

if [[ ${#PART_FILES[@]} -gt 0 ]]; then
  FLOWS_PART_FILES=()
  for f in "${PART_FILES[@]}"; do
    [[ "$f" == *-warnings.json ]] && continue
    FLOWS_PART_FILES+=("$f")
  done
  if [[ ${#FLOWS_PART_FILES[@]} -gt 0 ]]; then
    npx ts-node "$ROOT/scripts/mergePlaywrightFlowJsonReports.ts" \
      --out "$REPORT_DIR/flows-results.json" "${FLOWS_PART_FILES[@]}" 2>&1 | tee -a "$LOG" || true
  fi
  npx ts-node "$ROOT/scripts/generateCmsExcelReport.ts"   --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
  npx ts-node "$ROOT/scripts/generateCmsDashboardHtml.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
  npx ts-node "$ROOT/scripts/generateUnifiedReport.ts"    --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
fi

if [[ "${OPEN_FLOW_REPORT}" != "false" && "${CI:-0}" != "true" ]]; then
  [[ -f "$REPORT_DIR/dashboard.html" ]] && open "$REPORT_DIR/dashboard.html" || true
fi

if [[ "${SKIP_SLACK:-0}" != "1" ]]; then
  SKIP_SLACK=0 npx ts-node "$ROOT/scripts/urlRunSummaryAndSlack.ts" 2>&1 | tee -a "$LOG" || true
fi

exit $TOTAL_EXIT
