#!/usr/bin/env bash
# =============================================================================
# CMS Batch 2 — 106 flows, 14 shared workers, true idle-browser reuse
#
# Architecture:
#   ONE Playwright invocation with PW_WORKERS=14.
#   All 106 flows from 8 modules share a single worker pool.
#   When any worker finishes a flow it immediately picks up the next queued
#   flow from any module — no idle browsers, no wasted time.
#
# Actual perf (10 workers, 87 flows): 12m 24s → ~1.4 min/flow avg
# Estimated with 14 workers, 106 flows: ~11 min
#
# Workers vs GHA runner (2 CPU cores, 7 GB RAM, headless Chromium ~250 MB):
#   14 workers × 250 MB = 3.5 GB — well within 7 GB limit
#   Raise to PW_WORKERS=20 for maximum speed (5 GB, still safe on GHA).
#
# Modules (flows after skipping Batch 1 + deletes):
#   environment    :  1 flow
#   language       :  3 flows
#   branches       :  3 flows
#   stack          :  7 flows
#   content-models : 41 flows
#   global-field   :  9 flows
#   assets         : 12 flows
#   entries        : 30 flows  ← added
#   ─────────────────────────
#   Total          : 106 flows
#
# Skips (via --grep-invert anchored with $):
#   Batch 1 flows : create-an-entry, add-a-comment (entries)
#                   + all other Batch 1 flows in these modules
#   Delete flows  : bulk-delete-entries, bulk-delete-localized-entry-versions,
#                   delete-an-entry, delete-an-entry-part-2, edit-or-delete-a-comment
#                   + all delete flows from other modules
#
# Usage:
#   ./scripts/run-cms-batch2.sh
#   PLAYWRIGHT_HEADLESS=0 ./scripts/run-cms-batch2.sh
#   PW_WORKERS=20 ./scripts/run-cms-batch2.sh       (max speed, still safe)
#   REPORT_DIR=reports/my-batch2 ./scripts/run-cms-batch2.sh
#   SKIP_SLACK=1 ./scripts/run-cms-batch2.sh
# =============================================================================

set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TS="$(date +%Y%m%d-%H%M%S)"
export REPORT_DIR="${REPORT_DIR:-$ROOT/reports/cms-batch2-$TS}"
LOG="$REPORT_DIR/batch2-run.log"
PARTS_DIR="$REPORT_DIR/playwright-parts"
mkdir -p "$REPORT_DIR" "$PARTS_DIR"

# ── Workers ──────────────────────────────────────────────────────────────────
# 14 workers: 3.5 GB RAM, ~11 min for 106 flows at 1.4 min/flow avg.
# Raise to 20 for maximum speed (5 GB, still safe on GHA 7 GB runner).
export PW_WORKERS="${PW_WORKERS:-14}"

# ── Per-flow timeouts ────────────────────────────────────────────────────────
# Each flow is its own Playwright test (CMS_SEQUENTIAL_MODULE_ORDER=0).
# PW_FLOW_MAX_MINUTES caps the entire test; PW_ACTION_TIMEOUT_MINUTES caps
# waiting for any single element/action within a step.
export PW_FLOW_MAX_MINUTES="${PW_FLOW_MAX_MINUTES:-5}"
export PW_ACTION_TIMEOUT_MINUTES="${PW_ACTION_TIMEOUT_MINUTES:-3}"
export PW_SLOWMO="${PW_SLOWMO:-0}"
export PLAYWRIGHT_HEADLESS="${PLAYWRIGHT_HEADLESS:-1}"

# Individual flow tests — no module-batch overhead, no CMS_MODULE_BATCH_TIMEOUT_MS.
# PW_FLOW_MAX_MINUTES=5 is the actual timeout that applies per flow.
export CMS_SEQUENTIAL_MODULE_ORDER=0
# With individual tests, each flow is its own test — no continuation needed.
export CMS_CONTINUE_ON_FAIL=0
export OPEN_FLOW_REPORT="${OPEN_FLOW_REPORT:-false}"

# ── Flows to skip ─────────────────────────────────────────────────────────────
CMS_BATCH1_FLOWS=(
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

CMS_DELETE_FLOWS=(
  "delete-an-environment"
  "delete-a-language"
  "delete-a-branch"
  "delete-an-alias"
  "delete-a-stack"
  "leave-a-stack"
  "transfer-stack-ownership"
  "delete-content-type"
  "delete-a-global-field"
  "delete-a-folder"
  "delete-an-asset"
  "bulk-delete-assets"
)

ALL_SKIP_FLOWS=("${CMS_BATCH1_FLOWS[@]}" "${CMS_DELETE_FLOWS[@]}")
# Consumed by flows.spec.ts to exclude these flow IDs from the test queue.
export CMS_SKIP_FLOW_IDS="$(printf '%s,' "${ALL_SKIP_FLOWS[@]}" | sed 's/,$//')"

# ── --grep-invert pattern ─────────────────────────────────────────────────────
# WHY this matters with CMS_SEQUENTIAL_MODULE_ORDER=0:
#   In individual-flow mode each test title ends with the flow ID, e.g.:
#     "Project=CMS Module=stack Stage=main create-a-new-stack-part-1"
#   CMS_SKIP_FLOW_IDS is only read by flows.spec.ts in module-batch mode (=1).
#   With =0 it has NO effect — only --grep-invert reliably excludes flows.
#
# Pattern is anchored with $ so "create-a-global-field" does NOT exclude
# "create-a-global-field-part-2" (different flow ID at end of title).
#
# Covers: all 21 Batch 1 flows (in these 7 modules) + all delete flows.
# Batch 1 flows (across all 8 modules) + delete flows, anchored with $ so
# "create-a-global-field" does NOT accidentally match "create-a-global-field-part-2".
CMS_SKIP_GREP="(create-a-new-stack-part-1|add-an-environment|add-a-language|add-a-custom-language|create-a-branch|create-content-type|create-a-global-field|create-a-global-field-part-2|create-upload-assets|create-a-folder|create-an-entry|add-a-comment|create-and-apply-labels|set-up-live-preview-for-your-stack|create-a-taxonomy|create-a-term|create-a-delivery-token|generate-a-management-token|create-a-webhook|add-workflows-and-stages|delete-a-term|delete-a-taxonomy|delete-a-workflow|delete-an-alias|delete-a-webhook|delete-a-global-field|delete-a-delivery-token|delete-a-management-token|delete-a-release|delete-entries-and-assets-in-bulk|bulk-delete-entries|bulk-delete-assets|bulk-delete-localized-entry-versions|delete-a-folder|delete-an-asset|delete-an-entry|delete-an-entry-part-2|delete-a-language|delete-an-environment|delete-a-branch|delete-content-type|delete-a-stack|edit-or-delete-a-comment|leave-a-stack|transfer-stack-ownership)$"

# ── Run ───────────────────────────────────────────────────────────────────────
START_EPOCH="$(date +%s)"
START_ISO="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"

: > "$LOG"
echo "================================================================" | tee -a "$LOG"
echo "  CMS Batch 2 — shared worker pool" | tee -a "$LOG"
echo "  Workers  : ${PW_WORKERS} shared across all 106 flows" | tee -a "$LOG"
echo "  Modules  : environment(1) language(3) branches(3) stack(7)" | tee -a "$LOG"
echo "             content-models(41) global-field(9) assets(12) entries(30)" | tee -a "$LOG"
echo "  Per-flow : ${PW_FLOW_MAX_MINUTES} min/flow | ${PW_ACTION_TIMEOUT_MINUTES} min/element" | tee -a "$LOG"
echo "  Est. time: ~$(( 106 / PW_WORKERS * 2 )) min (106 flows ÷ ${PW_WORKERS} workers × 1.4 min avg)" | tee -a "$LOG"
echo "  Skipping : Batch 1 flows + delete flows (via --grep-invert)" | tee -a "$LOG"
echo "  Started  : ${START_ISO}" | tee -a "$LOG"
echo "  Report   : ${REPORT_DIR}" | tee -a "$LOG"
echo "================================================================" | tee -a "$LOG"
echo "" | tee -a "$LOG"

TOTAL_EXIT=0
set +e
npx playwright test tests/flows.spec.ts --project=flows \
  --grep "Project=CMS Module=(environment|language|branches|stack|content-models|global-field|assets|entries) Stage=main" \
  --grep-invert "$CMS_SKIP_GREP" \
  2>&1 | tee -a "$LOG"
PW_EXIT=${PIPESTATUS[0]}
set -e
[[ "$PW_EXIT" -ne 0 ]] && TOTAL_EXIT=1

# Save the result file to parts directory for partial-merge in GHA always-step.
if [[ -f "$REPORT_DIR/flows-results.json" ]]; then
  cp "$REPORT_DIR/flows-results.json" "$PARTS_DIR/batch2-all-modules.json"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
END_EPOCH="$(date +%s)"
TOTAL_ELAPSED=$(( END_EPOCH - START_EPOCH ))
TOTAL_MIN=$(( TOTAL_ELAPSED / 60 ))
TOTAL_SEC=$(( TOTAL_ELAPSED % 60 ))

echo "" | tee -a "$LOG"
echo "================================================================" | tee -a "$LOG"
echo "  CMS Batch 2 — COMPLETE" | tee -a "$LOG"
echo "  Duration : ${TOTAL_MIN}m ${TOTAL_SEC}s" | tee -a "$LOG"
echo "  Outcome  : $([ $TOTAL_EXIT -eq 0 ] && echo 'success' || echo 'failure')" | tee -a "$LOG"
echo "================================================================" | tee -a "$LOG"

cat > "$REPORT_DIR/timing-summary.txt" <<EOF
CMS Batch 2 — Duration: ${TOTAL_MIN}m ${TOTAL_SEC}s
Started:  ${START_ISO}
Finished: $(date -u +'%Y-%m-%dT%H:%M:%SZ')
Outcome:  $([ $TOTAL_EXIT -eq 0 ] && echo 'success' || echo 'failure')
Workers:  ${PW_WORKERS}
Modules:  environment, language, branches, stack, content-models, global-field, assets
EOF

# ── Reports ───────────────────────────────────────────────────────────────────
if [[ -f "$REPORT_DIR/flows-results.json" ]]; then
  npx ts-node "$ROOT/scripts/generateCmsExcelReport.ts"   --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
  npx ts-node "$ROOT/scripts/generateCmsDashboardHtml.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
  npx ts-node "$ROOT/scripts/generateUnifiedReport.ts"    --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
fi

# ── Slack ─────────────────────────────────────────────────────────────────────
if [[ "${SKIP_SLACK:-0}" != "1" ]]; then
  CMS_BATCH_DURATION_LABEL="CMS Batch 2: environment, language, branches, stack, content-models, global-field, assets, entries (${TOTAL_MIN}m ${TOTAL_SEC}s)" \
    npx ts-node "$ROOT/scripts/urlRunSummaryAndSlack.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
fi

exit $TOTAL_EXIT
