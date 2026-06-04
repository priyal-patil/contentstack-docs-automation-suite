#!/usr/bin/env bash
# =============================================================================
# CMS Batch 2 — 7 modules, 7 PARALLEL SUBPROCESSES (one per module)
#
# Architecture (fixes the 3-hour timeout + idle browser problems):
#   • Each module runs as its OWN playwright invocation in the background
#   • Each module: CMS_SEQUENTIAL_MODULE_ORDER=0 (individual flow tests)
#                  PW_WORKERS=1 (sequential CRUD order within module)
#   • When a small module finishes (e.g. environment = 1 flow, ~3 min),
#     its process exits immediately — NO idle browser sitting around
#   • Each module has its own REPORT_DIR so results never overwrite each other
#   • Per-flow results are written as each module completes, so even if the
#     job is cancelled mid-run, completed modules' counts appear in Slack
#
# Per-flow timeout: PW_FLOW_MAX_MINUTES=5 (individual flow cap)
# Element timeout : PW_ACTION_TIMEOUT_MINUTES=3
#
# Modules:
#   environment (1 flow) | language (3) | branches (3) | stack (8)
#   content-models (59) | global-field (7) | assets (12)
#   Total: ~93 flows
#
# Skips: all 21 Batch 1 flows + all delete flows (via CMS_SKIP_FLOW_IDS
#        inside each module + --grep-invert on individual test titles)
#
# Usage:
#   ./scripts/run-cms-batch2.sh
#   PLAYWRIGHT_HEADLESS=0 ./scripts/run-cms-batch2.sh
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

# ── Per-flow timeout — individual flows, not module batches ──────────────────
# PW_FLOW_MAX_MINUTES=5 caps each individual flow test.
# With CMS_SEQUENTIAL_MODULE_ORDER=0 there is no CMS_MODULE_BATCH_TIMEOUT_MS
# override — so this actually applies.
export PW_FLOW_MAX_MINUTES="${PW_FLOW_MAX_MINUTES:-5}"
export PW_ACTION_TIMEOUT_MINUTES="${PW_ACTION_TIMEOUT_MINUTES:-3}"
export PW_SLOWMO="${PW_SLOWMO:-0}"
export PLAYWRIGHT_HEADLESS="${PLAYWRIGHT_HEADLESS:-1}"
export OPEN_FLOW_REPORT="${OPEN_FLOW_REPORT:-false}"

# ── Flows to skip — built into each module's environment ─────────────────────
# CMS_SKIP_FLOW_IDS is read by flows.spec.ts to exclude flow IDs from running.
# --grep-invert on delete patterns adds a second layer for individual tests.

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
export CMS_SKIP_FLOW_IDS="$(printf '%s,' "${ALL_SKIP_FLOWS[@]}" | sed 's/,$//')"

# Works at individual-test-title level (CMS_SEQUENTIAL_MODULE_ORDER=0)
CMS_DELETE_FLOW_GREP='delete-a-term|delete-a-taxonomy|delete-a-workflow|delete-an-alias|delete-a-webhook|delete-a-global-field|delete-a-delivery-token|delete-a-management-token|delete-a-release|delete-entries-and-assets-in-bulk|bulk-delete-entries|bulk-delete-assets|bulk-delete-localized-entry-versions|delete-a-folder|delete-an-asset|delete-an-entry|delete-an-entry-part-2|delete-a-language|delete-an-environment|delete-a-branch|delete-content-type|delete-a-stack|edit-or-delete-a-comment|leave-a-stack|transfer-stack-ownership'

# ── Per-module runner ─────────────────────────────────────────────────────────
# Each module runs in its own subprocess with its own REPORT_DIR.
# Results are copied to PARTS_DIR as soon as the module finishes.
# If this process is killed (GHA timeout), only completed modules' parts are lost;
# the merge step picks up whatever exists in PARTS_DIR.
run_module() {
  local module="$1"
  local MODULE_DIR="$REPORT_DIR/module-${module}"
  mkdir -p "$MODULE_DIR"
  local MODULE_LOG="$MODULE_DIR/module.log"
  local start_t; start_t="$(date +%s)"

  echo "[$(date -u +'%H:%M:%SZ')] ▶ START ${module}" >> "$LOG"

  set +e
  # Each module subprocess:
  #   CMS_SEQUENTIAL_MODULE_ORDER=0 → each flow is its own Playwright test
  #   PW_WORKERS=1                  → flows run sequentially in CRUD order
  #   CMS_CONTINUE_ON_FAIL=0        → a failing flow doesn't block the next
  #   REPORT_DIR=MODULE_DIR          → isolated results, no overwrites
  REPORT_DIR="$MODULE_DIR" \
    PW_WORKERS=1 \
    CMS_SEQUENTIAL_MODULE_ORDER=0 \
    CMS_CONTINUE_ON_FAIL=0 \
    npx playwright test tests/flows.spec.ts --project=flows \
      --grep "Project=CMS Module=${module} Stage=main" \
      --grep-invert "$CMS_DELETE_FLOW_GREP" \
      > "$MODULE_LOG" 2>&1
  local ex=$?
  set -e

  local end_t; end_t="$(date +%s)"
  local dur=$(( end_t - start_t ))
  local dur_min=$(( dur / 60 ))
  local dur_sec=$(( dur % 60 ))

  if [[ -f "$MODULE_DIR/flows-results.json" ]]; then
    cp "$MODULE_DIR/flows-results.json" "$PARTS_DIR/module-${module}.json"
    local icon; [[ $ex -eq 0 ]] && icon="✅" || icon="❌"
    echo "[$(date -u +'%H:%M:%SZ')] ${icon} DONE  ${module} — exit=${ex} dur=${dur_min}m${dur_sec}s" >> "$LOG"
  else
    echo "[$(date -u +'%H:%M:%SZ')] ⚠  DONE  ${module} — no flows-results.json, exit=${ex} dur=${dur_min}m${dur_sec}s" >> "$LOG"
  fi

  return $ex
}

# ── Launch all 7 modules in parallel ─────────────────────────────────────────
START_EPOCH="$(date +%s)"
START_ISO="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"

: > "$LOG"
echo "================================================================" | tee -a "$LOG"
echo "  CMS Batch 2 — 7 parallel module subprocesses" | tee -a "$LOG"
echo "  Modules  : environment(1) language(3) branches(3) stack(8)" | tee -a "$LOG"
echo "             content-models(59) global-field(7) assets(12)" | tee -a "$LOG"
echo "  Per-flow : ${PW_FLOW_MAX_MINUTES} min/flow | ${PW_ACTION_TIMEOUT_MINUTES} min element timeout" | tee -a "$LOG"
echo "  Mode     : CMS_SEQUENTIAL_MODULE_ORDER=0, PW_WORKERS=1/module" | tee -a "$LOG"
echo "  Skipping : Batch 1 flows + delete flows" | tee -a "$LOG"
echo "  Started  : ${START_ISO}" | tee -a "$LOG"
echo "  Report   : ${REPORT_DIR}" | tee -a "$LOG"
echo "================================================================" | tee -a "$LOG"
echo "" >> "$LOG"

MODULES=(environment language branches stack content-models global-field assets)
PIDS=()
for module in "${MODULES[@]}"; do
  run_module "$module" &
  PIDS+=($!)
  echo "  Launched ${module} (PID $!)" >> "$LOG"
done

echo "" >> "$LOG"
echo "All 7 modules running — waiting for completion…" >> "$LOG"

# Collect exit codes from each module subprocess
TOTAL_EXIT=0
MODULE_EXITS=()
for i in "${!PIDS[@]}"; do
  pid="${PIDS[$i]}"
  module="${MODULES[$i]}"
  if wait "$pid"; then
    MODULE_EXITS+=("${module}=0")
  else
    MODULE_EXITS+=("${module}=$?")
    TOTAL_EXIT=1
  fi
done

# ── Summary ──────────────────────────────────────────────────────────────────
END_EPOCH="$(date +%s)"
TOTAL_ELAPSED=$(( END_EPOCH - START_EPOCH ))
TOTAL_MIN=$(( TOTAL_ELAPSED / 60 ))
TOTAL_SEC=$(( TOTAL_ELAPSED % 60 ))

echo "" | tee -a "$LOG"
echo "================================================================" | tee -a "$LOG"
echo "  CMS Batch 2 — ALL MODULES COMPLETE" | tee -a "$LOG"
echo "  Duration : ${TOTAL_MIN}m ${TOTAL_SEC}s" | tee -a "$LOG"
for mx in "${MODULE_EXITS[@]}"; do
  echo "  ${mx}" | tee -a "$LOG"
done
echo "================================================================" | tee -a "$LOG"

cat > "$REPORT_DIR/timing-summary.txt" <<EOF
CMS Batch 2 — Duration: ${TOTAL_MIN}m ${TOTAL_SEC}s
Started:  ${START_ISO}
Finished: $(date -u +'%Y-%m-%dT%H:%M:%SZ')
Outcome:  $([ $TOTAL_EXIT -eq 0 ] && echo 'success' || echo 'failure')
Modules:  environment, language, branches, stack, content-models, global-field, assets
EOF

# ── Merge per-module results + generate reports ───────────────────────────────
shopt -s nullglob
PART_FILES=("$PARTS_DIR"/module-*.json)
shopt -u nullglob

if [[ ${#PART_FILES[@]} -gt 0 ]]; then
  echo "" | tee -a "$LOG"
  echo "Merging ${#PART_FILES[@]}/${#MODULES[@]} module result files…" | tee -a "$LOG"
  npx ts-node "$ROOT/scripts/mergePlaywrightFlowJsonReports.ts" \
    --out "$REPORT_DIR/flows-results.json" "${PART_FILES[@]}" 2>&1 | tee -a "$LOG" || true
  npx ts-node "$ROOT/scripts/generateCmsExcelReport.ts"   --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
  npx ts-node "$ROOT/scripts/generateCmsDashboardHtml.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
  npx ts-node "$ROOT/scripts/generateUnifiedReport.ts"    --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
else
  echo "WARNING: No module result files found — all subprocesses may have been killed." | tee -a "$LOG"
fi

# ── Slack ─────────────────────────────────────────────────────────────────────
if [[ "${SKIP_SLACK:-0}" != "1" ]]; then
  CMS_BATCH_DURATION_LABEL="CMS Batch 2: environment, language, branches, stack, content-models, global-field, assets (${TOTAL_MIN}m ${TOTAL_SEC}s)" \
    npx ts-node "$ROOT/scripts/urlRunSummaryAndSlack.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
fi

exit $TOTAL_EXIT
