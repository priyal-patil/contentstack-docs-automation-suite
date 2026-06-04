#!/usr/bin/env bash
# =============================================================================
# CMS Batch 2 — 93 flows, 10 shared workers, true idle-browser reuse
#
# Architecture:
#   ONE Playwright invocation with PW_WORKERS=10.
#   All ~93 flows from 7 modules go into a single shared queue.
#   When any worker finishes a flow (even a fast 1-flow module like
#   environment) it immediately picks up the next queued flow from any module.
#   No idle browsers — every worker stays busy until the queue is empty.
#
# Estimated wall time: ~93 flows ÷ 10 workers × 2.5 min avg ≈ 24 min
#
# Workers vs GHA runner (2 CPU cores, 7 GB RAM, headless Chromium ~250 MB):
#   10 workers × 250 MB = 2.5 GB — well within 7 GB limit
#   Headless Chromium is CPU-light; 10 workers on 2 cores is stable.
#   Bump to PW_WORKERS=14 if you want faster runs (still safe on GHA).
#
# Modules (flows after skipping Batch 1 + deletes):
#   environment    :  1 flow
#   language       :  3 flows
#   branches       :  3 flows
#   stack          :  8 flows
#   content-models : 59 flows  ← largest; workers shared so no bottleneck
#   global-field   :  7 flows
#   assets         : 12 flows
#   ─────────────────────────
#   Total          : 93 flows
#
# CRUD order note:
#   With fullyParallel=true and 10 workers, Playwright distributes tests
#   across workers. Most content-models flows are independent field-type
#   demos (boolean, date, custom, etc.) and are safe in any order.
#   The few order-sensitive flows (edit → export → import) are listed first
#   in flows.spec.ts discovery order and tend to be picked up early.
#
# Skips:
#   CMS_SKIP_FLOW_IDS — read by flows.spec.ts, removes Batch 1 + delete flows
#                        from the test queue before Playwright starts
#   --grep-invert      — belt-and-suspenders at the Playwright test-title level
#
# Usage:
#   ./scripts/run-cms-batch2.sh
#   PLAYWRIGHT_HEADLESS=0 ./scripts/run-cms-batch2.sh
#   PW_WORKERS=14 ./scripts/run-cms-batch2.sh          (faster, still safe)
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
# Default 10 — safe on GHA 2-core / 7 GB. Raise to 14 for faster runs.
export PW_WORKERS="${PW_WORKERS:-10}"

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
CMS_SKIP_GREP="(create-a-new-stack-part-1|add-an-environment|add-a-language|add-a-custom-language|create-a-branch|create-content-type|create-a-global-field|create-a-global-field-part-2|create-upload-assets|create-a-folder|create-an-entry|add-a-comment|create-and-apply-labels|set-up-live-preview-for-your-stack|create-a-taxonomy|create-a-term|create-a-delivery-token|generate-a-management-token|create-a-webhook|add-workflows-and-stages|delete-a-term|delete-a-taxonomy|delete-a-workflow|delete-an-alias|delete-a-webhook|delete-a-global-field|delete-a-delivery-token|delete-a-management-token|delete-a-release|delete-entries-and-assets-in-bulk|bulk-delete-entries|bulk-delete-assets|bulk-delete-localized-entry-versions|delete-a-folder|delete-an-asset|delete-an-entry|delete-an-entry-part-2|delete-a-language|delete-an-environment|delete-a-branch|delete-content-type|delete-a-stack|edit-or-delete-a-comment|leave-a-stack|transfer-stack-ownership)$"

# ── Run ───────────────────────────────────────────────────────────────────────
START_EPOCH="$(date +%s)"
START_ISO="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"

: > "$LOG"
echo "================================================================" | tee -a "$LOG"
echo "  CMS Batch 2 — shared worker pool" | tee -a "$LOG"
echo "  Workers  : ${PW_WORKERS} shared across all 93 flows" | tee -a "$LOG"
echo "  Modules  : environment(1) language(3) branches(3) stack(8)" | tee -a "$LOG"
echo "             content-models(59) global-field(7) assets(12)" | tee -a "$LOG"
echo "  Per-flow : ${PW_FLOW_MAX_MINUTES} min/flow | ${PW_ACTION_TIMEOUT_MINUTES} min/element" | tee -a "$LOG"
echo "  Est. time: ~$(( 93 / PW_WORKERS * 3 )) min (93 flows ÷ ${PW_WORKERS} workers × 3 min avg)" | tee -a "$LOG"
echo "  Skipping : 21 Batch 1 flows + 12 delete flows" | tee -a "$LOG"
echo "  Started  : ${START_ISO}" | tee -a "$LOG"
echo "  Report   : ${REPORT_DIR}" | tee -a "$LOG"
echo "================================================================" | tee -a "$LOG"
echo "" | tee -a "$LOG"

TOTAL_EXIT=0
set +e
npx playwright test tests/flows.spec.ts --project=flows \
  --grep "Project=CMS Module=(environment|language|branches|stack|content-models|global-field|assets) Stage=main" \
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
  CMS_BATCH_DURATION_LABEL="CMS Batch 2: environment, language, branches, stack, content-models, global-field, assets (${TOTAL_MIN}m ${TOTAL_SEC}s)" \
    npx ts-node "$ROOT/scripts/urlRunSummaryAndSlack.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
fi

exit $TOTAL_EXIT
