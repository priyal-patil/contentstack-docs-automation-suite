#!/usr/bin/env bash
# =============================================================================
# CMS Batch 1 — 21 create/setup flows in exact sequence, 1 worker, 5 min cap
#
# Execution order (creates stack first, then uses same stack for all others):
#   1. create-a-new-stack-part-1      (stack)
#   2. add-an-environment             (environment)
#   3. add-a-language                 (language)
#   4. add-a-custom-language          (language)
#   5. create-a-branch                (branches)
#   6. create-content-type            (content-models)
#   7. create-a-new-release           (releases)
#   8. create-a-global-field          (global-field)
#   9. create-a-global-field-part-2   (global-field)
#  10. create-upload-assets           (assets)
#  11. create-a-folder                (assets)
#  12. create-an-entry                (entries)
#  13. add-a-comment                  (entries)
#  14. create-and-apply-labels        (content-models)
#  15. set-up-live-preview-for-your-stack (live-preview)
#  16. create-a-taxonomy              (taxonomy)
#  17. create-a-term                  (taxonomy)
#  18. create-a-delivery-token        (tokens)
#  19. generate-a-management-token    (tokens)
#  20. create-a-webhook               (webhook)
#  21. add-workflows-and-stages       (workflows)
#
# Each flow gets a hard 5-minute timeout. Failure captures a screenshot.
# All flows share the same auth session (auth.json generated on first run).
#
# Usage:
#   ./scripts/run-cms-batch1.sh
#   PLAYWRIGHT_HEADLESS=0 ./scripts/run-cms-batch1.sh   (headed)
#   REPORT_DIR=reports/my-batch1 ./scripts/run-cms-batch1.sh
# =============================================================================

set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TS="$(date +%Y%m%d-%H%M%S)"
export REPORT_DIR="${REPORT_DIR:-$ROOT/reports/cms-batch1-$TS}"
LOG="$REPORT_DIR/batch1-run.log"
PARTS_DIR="$REPORT_DIR/playwright-parts"
mkdir -p "$REPORT_DIR" "$PARTS_DIR"

export PW_WORKERS=1
export PW_FLOW_MAX_MINUTES="${PW_FLOW_MAX_MINUTES:-5}"
export PW_SLOWMO="${PW_SLOWMO:-0}"
export PLAYWRIGHT_HEADLESS="${PLAYWRIGHT_HEADLESS:-1}"
# IMPORTANT: Must be 0 for individual flow grep to work.
# With =1, flows.spec.ts batches all flows per module into ONE test titled
# "Project=CMS Module=X Stage=main" — individual flow IDs are NOT in the title.
export CMS_SEQUENTIAL_MODULE_ORDER=0
export CMS_CONTINUE_ON_FAIL=0
export OPEN_FLOW_REPORT="${OPEN_FLOW_REPORT:-false}"

# ── Batch 1 flows in exact execution order ──────────────────────────────────
BATCH1_FLOWS=(
  "create-a-new-stack-part-1"
  "add-an-environment"
  "add-a-language"
  "add-a-custom-language"
  "create-a-branch"
  "create-content-type"
  "create-a-new-release"
  "create-a-global-field"
  "create-a-global-field-part-2"
  "create-upload-assets"
  "create-a-folder"
  "create-an-entry"
  "add-a-comment"
  "create-and-apply-labels"
  "set-up-live-preview-for-your-stack"
  "create-a-taxonomy"
  "create-a-term"
  "create-a-delivery-token"
  "generate-a-management-token"
  "create-a-webhook"
  "add-workflows-and-stages"
)

TOTAL_FLOWS=${#BATCH1_FLOWS[@]}
PASS_COUNT=0
FAIL_COUNT=0
TOTAL_EXIT=0
declare -a FLOW_RESULTS=()

START_EPOCH="$(date +%s)"
START_ISO="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"

: > "$LOG"
echo "================================================================" | tee -a "$LOG"
echo "  CMS Batch 1 — ${TOTAL_FLOWS} flows | 1 worker | ${PW_FLOW_MAX_MINUTES} min cap" | tee -a "$LOG"
echo "  Started: ${START_ISO}" | tee -a "$LOG"
echo "  Report:  ${REPORT_DIR}" | tee -a "$LOG"
echo "================================================================" | tee -a "$LOG"
echo "" | tee -a "$LOG"

# ── Run each flow individually in order ─────────────────────────────────────
IDX=0
for FLOW_ID in "${BATCH1_FLOWS[@]}"; do
  IDX=$((IDX + 1))
  FLOW_START="$(date +%s)"
  FLOW_START_ISO="$(date -u +'%H:%M:%SZ')"

  echo "[${IDX}/${TOTAL_FLOWS}] ▶  ${FLOW_ID}  (${FLOW_START_ISO})" | tee -a "$LOG"

  set +e
  # Use "Project=CMS.*<id>$" to:
  #   1. Only match CMS project flows (not Personalize/Launch/etc with same name)
  #   2. Anchor with $ so "create-an-entry" doesn't match "create-an-entry-variant"
  npx playwright test tests/flows.spec.ts \
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
  fi

  FLOW_RESULTS+=("  ${STATUS}  ${FLOW_ID}  (${FLOW_MIN}m ${FLOW_SEC}s)")
  echo "     ${STATUS}  — ${FLOW_MIN}m ${FLOW_SEC}s" | tee -a "$LOG"

  # Copy per-flow Playwright results
  if [[ -f "$REPORT_DIR/flows-results.json" ]]; then
    cp "$REPORT_DIR/flows-results.json" "$PARTS_DIR/${FLOW_ID}.json" 2>/dev/null || true
  fi

  echo "" | tee -a "$LOG"
done

# ── Summary ──────────────────────────────────────────────────────────────────
END_EPOCH="$(date +%s)"
TOTAL_ELAPSED=$(( END_EPOCH - START_EPOCH ))
TOTAL_MIN=$(( TOTAL_ELAPSED / 60 ))
TOTAL_SEC=$(( TOTAL_ELAPSED % 60 ))

echo "================================================================" | tee -a "$LOG"
echo "  CMS Batch 1 — COMPLETE" | tee -a "$LOG"
echo "  Duration : ${TOTAL_MIN}m ${TOTAL_SEC}s" | tee -a "$LOG"
echo "  Passed   : ${PASS_COUNT}/${TOTAL_FLOWS}" | tee -a "$LOG"
echo "  Failed   : ${FAIL_COUNT}/${TOTAL_FLOWS}" | tee -a "$LOG"
echo "" | tee -a "$LOG"
echo "  Per-flow results:" | tee -a "$LOG"
for r in "${FLOW_RESULTS[@]}"; do
  echo "$r" | tee -a "$LOG"
done
echo "================================================================" | tee -a "$LOG"

# ── Merge parts + generate reports ──────────────────────────────────────────
shopt -s nullglob
PART_FILES=("$PARTS_DIR"/*.json)
shopt -u nullglob
if [[ ${#PART_FILES[@]} -gt 0 ]]; then
  npx ts-node "$ROOT/scripts/mergePlaywrightFlowJsonReports.ts" \
    --out "$REPORT_DIR/flows-results.json" "${PART_FILES[@]}" 2>&1 | tee -a "$LOG" || true
  npx ts-node "$ROOT/scripts/generateCmsExcelReport.ts"   --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
  npx ts-node "$ROOT/scripts/generateCmsDashboardHtml.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
  npx ts-node "$ROOT/scripts/generateUnifiedReport.ts"    --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
fi

# Open dashboard locally if not in CI
if [[ "${OPEN_FLOW_REPORT}" != "false" && "${CI:-0}" != "true" ]]; then
  [[ -f "$REPORT_DIR/dashboard.html" ]] && open "$REPORT_DIR/dashboard.html" || true
fi

# ── Slack (if configured) ────────────────────────────────────────────────────
if [[ "${SKIP_SLACK:-0}" != "1" ]]; then
  SKIP_SLACK=0 npx ts-node "$ROOT/scripts/urlRunSummaryAndSlack.ts" 2>&1 | tee -a "$LOG" || true
fi

exit $TOTAL_EXIT
