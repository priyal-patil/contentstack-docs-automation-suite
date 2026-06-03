#!/usr/bin/env bash
# =============================================================================
# CMS Batch 2 — 7 modules in parallel (7 workers, CRUD order)
#
# Modules (one worker per module, all run simultaneously):
#   environment, language, branches, stack, content-models, global-field, assets
#
# Skips:
#   • All 21 Batch 1 bootstrap flows (already executed)
#   • All delete-related flows
#
# CRUD execution order within each module:
#   1. Create / Add      (any not already in Batch 1)
#   2. Edit / Update     (rename, edit, update, customize, etc.)
#   3. Move / Import / Export / Publish / Copy
#   4. Misc / View / Monitor
#   (Delete flows are always skipped)
#
# Timeout: PW_ACTION_TIMEOUT_MINUTES=3 — if stuck on an element for >3 min, step fails.
# Per-module test timeout: PW_FLOW_MAX_MINUTES=60 (generous for large modules like content-models).
#
# Stack: uses stack created in Batch 1; falls back to DEFAULT_STACK / PriyalDocsStack
#        via core/navigation.ts selectStack().
#
# Usage:
#   ./scripts/run-cms-batch2.sh
#   PLAYWRIGHT_HEADLESS=0 ./scripts/run-cms-batch2.sh          (headed)
#   REPORT_DIR=reports/my-batch2 ./scripts/run-cms-batch2.sh
#   SKIP_SLACK=1 ./scripts/run-cms-batch2.sh                   (no Slack)
# =============================================================================

set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TS="$(date +%Y%m%d-%H%M%S)"
export REPORT_DIR="${REPORT_DIR:-$ROOT/reports/cms-batch2-$TS}"
LOG="$REPORT_DIR/batch2-run.log"
PARTS_DIR="$REPORT_DIR/playwright-parts"
mkdir -p "$REPORT_DIR" "$PARTS_DIR"

# ── Runtime settings ─────────────────────────────────────────────────────────
export PW_WORKERS=7
# Per-module test timeout — content-models has 30+ flows so be generous.
export PW_FLOW_MAX_MINUTES="${PW_FLOW_MAX_MINUTES:-60}"
# Element/action timeout: if an element is not found within 3 min, fail the step.
export PW_ACTION_TIMEOUT_MINUTES="${PW_ACTION_TIMEOUT_MINUTES:-3}"
export PW_SLOWMO="${PW_SLOWMO:-0}"
export PLAYWRIGHT_HEADLESS="${PLAYWRIGHT_HEADLESS:-1}"
# One Playwright test per module; flows within module run serially in CRUD order.
export CMS_SEQUENTIAL_MODULE_ORDER=1
# Continue running remaining flows in a module after a step failure.
export CMS_CONTINUE_ON_FAIL=1
export OPEN_FLOW_REPORT="${OPEN_FLOW_REPORT:-false}"

# ── Batch 1 flows to skip (already executed) ─────────────────────────────────
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
export CMS_SKIP_FLOW_IDS="$(printf '%s,' "${CMS_BATCH1_FLOWS[@]}" | sed 's/,$//')"

# ── Delete flows to skip (same list as run-cms-sequential-modules-dashboard.sh) ──
CMS_DELETE_FLOW_GREP='delete-a-term|delete-a-taxonomy|delete-a-workflow|delete-an-alias|delete-a-webhook|delete-a-global-field|delete-a-delivery-token|delete-a-management-token|delete-a-release|delete-entries-and-assets-in-bulk|bulk-delete-entries|bulk-delete-assets|bulk-delete-localized-entry-versions|delete-a-folder|delete-an-asset|delete-an-entry|delete-an-entry-part-2|delete-a-language|delete-an-environment|delete-a-branch|delete-content-type|delete-a-stack|edit-or-delete-a-comment'

# ── Batch 2 flow inventory (for reference only — actual filtering handled by env vars above) ──
#
# environment  : edit-an-environment
# language     : rename-a-language, update-fallback-language, non-localizable-field
# branches     : assign-an-alias-to-a-branch, edit-an-alias,
#                use-branches-and-aliases-to-drive-ci-cd
# stack        : view-stack-details, edit-a-stack,
#                customize-your-dashboard-view-part-1/2, default-dashboard-extensions,
#                getting-started-with-contentstack-and-ai, import-prebuilt-stack,
#                monitor-stack-activities-in-audit-log
# content-models: edit-content-type, about-field-properties,
#                add-a-field-visibility-rule-part-1/2/3,
#                boolean-part-1/2, content-type-versioning, copy-content-type,
#                custom, date-part-1, default-value, display-name, example-from-bulk,
#                example-from-csv, export-content-type, global-part-1,
#                group-part-1/2, html-based-rich-text-editor-part-1/2/2-b,
#                import-content-type, instruction-value, manage-labels,
#                managing-non-localizable-fields, mandatory,
#                minimum-and-maximum-limit-part-1/2, modular-blocks/part-2,
#                multiple-part-1, quickstart-in-5-mins, select-extension-app-for-custom-field-only,
#                show-as-tab, switch-between-alphabetical-and-label-view,
#                unique-id, unique-part-1, use-default-url-pattern,
#                validation-error-message, validation-regex-part-1
# global-field : edit-a-global-field, add-the-global-field-to-content-types,
#                copy-a-global-field, export-a-global-field, import-a-global-field,
#                global-fields-within-group-fields, group-fields-within-global-fields,
#                modular-blocks-within-global-fields, reference-fields-within-global-fields
# assets       : edit-an-asset, rename-a-folder, rename-asset-versions, name-asset-versions,
#                move-a-folder, move-assets-to-folder-in-bulk,
#                publish-an-asset, unpublish-an-asset,
#                bulk-publish-assets, bulk-unpublish-assets,
#                generate-a-permanent-asset-url, restore-old-asset-version

TOTAL_EXIT=0

run_playwright_part() {
  local label="$1"
  shift
  set +e
  npx playwright test tests/flows.spec.ts --project=flows "$@" 2>&1 | tee -a "$LOG"
  local ex=${PIPESTATUS[0]}
  set -e
  if [[ -f "$REPORT_DIR/flows-results.json" ]]; then
    cp "$REPORT_DIR/flows-results.json" "$PARTS_DIR/${label}.json"
  else
    echo "WARNING: No flows-results.json for part ${label} (exit ${ex})" | tee -a "$LOG"
  fi
  if [[ "$ex" -ne 0 ]]; then TOTAL_EXIT=1; fi
  return 0
}

START_EPOCH="$(date +%s)"
START_ISO="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"

: > "$LOG"
echo "================================================================" | tee -a "$LOG"
echo "  CMS Batch 2" | tee -a "$LOG"
echo "  Modules  : environment, language, branches, stack," | tee -a "$LOG"
echo "             content-models, global-field, assets" | tee -a "$LOG"
echo "  Workers  : ${PW_WORKERS} (one per module)" | tee -a "$LOG"
echo "  Timeout  : ${PW_FLOW_MAX_MINUTES} min/module | ${PW_ACTION_TIMEOUT_MINUTES} min element" | tee -a "$LOG"
echo "  Skipping : Batch 1 flows + delete flows" | tee -a "$LOG"
echo "  Started  : ${START_ISO}" | tee -a "$LOG"
echo "  Report   : ${REPORT_DIR}" | tee -a "$LOG"
echo "================================================================" | tee -a "$LOG"
echo "" | tee -a "$LOG"

# ── Main run: all 7 modules in parallel ──────────────────────────────────────
# PW_WORKERS=7 means Playwright runs up to 7 module-batch tests simultaneously.
# CMS_SEQUENTIAL_MODULE_ORDER=1 groups each module's flows into one test;
# within each test, flows execute in CRUD order (defined by flows.spec.ts).
# CMS_SKIP_FLOW_IDS excludes Batch 1 flows; --grep-invert excludes deletes.
echo ">>> [Batch 2] All 7 modules — parallel start ($(date -u +'%H:%M:%SZ'))" | tee -a "$LOG"
run_playwright_part "batch2-all-modules" \
  --grep "Project=CMS Module=(environment|language|branches|stack|content-models|global-field|assets) Stage=main" \
  --grep-invert "$CMS_DELETE_FLOW_GREP"

# ── Summary ──────────────────────────────────────────────────────────────────
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

# Write timing summary for GHA/email
cat > "$REPORT_DIR/timing-summary.txt" <<EOF
CMS Batch 2 — Duration: ${TOTAL_MIN}m ${TOTAL_SEC}s
Started:  ${START_ISO}
Finished: $(date -u +'%Y-%m-%dT%H:%M:%SZ')
Outcome:  $([ $TOTAL_EXIT -eq 0 ] && echo 'success' || echo 'failure')
Modules:  environment, language, branches, stack, content-models, global-field, assets
EOF

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
  CMS_BATCH_DURATION_LABEL="CMS Batch 2: environment, language, branches, stack, content-models, global-field, assets (${TOTAL_MIN}m ${TOTAL_SEC}s)" \
    npx ts-node "$ROOT/scripts/urlRunSummaryAndSlack.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
fi

exit $TOTAL_EXIT
