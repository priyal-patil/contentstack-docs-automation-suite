#!/usr/bin/env bash
# =============================================================================
# CMS Batch 2 — RERUN of the 95 flows that were still failing after the
# built-in retry pass in GHA run 28905983278 (2026-07-07 cms-full-5am-ist).
# Continues where that run left off: only re-executes the failed flow IDs,
# grouped by module, in parallel (one Playwright invocation per module).
# =============================================================================

set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

cleanup() {
  echo "" >&2
  echo "🧹  Cleaning up browser processes..." >&2
  pkill -f "chrome-headless-shell" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

TS="$(date +%Y%m%d-%H%M%S)"
export REPORT_DIR="${REPORT_DIR:-$ROOT/reports/cms-batch2-rerun-$TS}"
PARTS_DIR="$REPORT_DIR/playwright-parts"
mkdir -p "$REPORT_DIR" "$PARTS_DIR"
LOG="$REPORT_DIR/rerun.log"
: > "$LOG"

export PW_FLOW_MAX_MINUTES="${PW_FLOW_MAX_MINUTES:-5}"
export PW_ACTION_TIMEOUT_MINUTES="${PW_ACTION_TIMEOUT_MINUTES:-3}"
export PLAYWRIGHT_HEADLESS=1
export CMS_SEQUENTIAL_MODULE_ORDER=0
export CMS_CONTINUE_ON_FAIL=0
export OPEN_FLOW_REPORT=false

# macOS ships bash 3.2 (no associative arrays) — use parallel indexed arrays instead.
MODULES=(
  "workflows" "security" "content-models" "visual-experience" "entries"
  "json-rich-text-editor" "users-and-roles" "assets" "releases" "stack"
  "taxonomy" "branches" "content-modeling" "global-field" "language"
  "live-preview" "webhook"
)
MODULE_FLOW_PATTERNS=(
  "about-workflow-tasks|approve-edit-access-request-for-an-entry|change-entry-workflow-stage|enable-or-disable-a-workflow-part-1|enable-or-disable-a-workflow-part-2|get-started-with-workflows|revoke-edit-access-for-an-entry|send-an-entry-for-edit-access-approval|send-an-entry-for-publish-or-unpublish-approval|set-edit-access-permissions-for-workflow-stages|update-a-workflow|workflows-use-cases"
  "account-lockout-policy|change-personal-details"
  "add-a-field-visibility-rule-part-1|add-a-field-visibility-rule-part-2|add-a-field-visibility-rule-part-3|copy-content-type|manage-labels|modular-blocks|quickstart-in-5-mins|show-as-tab"
  "add-a-review-comment|add-to-release|audience-preview|audiences|automate|change-workflow|create-new-page|discussions|drafts|edit-page|form|navigating-your-website-in-visual-editor|preview-content-across-a-timeline|preview-entry|publish-page|reopen-a-review-comment|reply-to-a-review-comment|resolve-a-review-comment|share-a-preview|status|widgets"
  "adding-terms-to-entries-with-taxonomy|bulk-export-entries|bulk-publish-entries|bulk-unpublish-entries|compare-entry-versions|copy-an-entry|name-entry-versions|publish-an-entry|relink-a-discussion|rename-entry-versions|reopen-a-discussion|reply-to-a-comment|resolve-a-discussion|restore-old-entry-version|unpublish-an-entry|unpublish-an-entry-part-2|view-discussions-timeline|view-entry-references|working-with-entry-tabs"
  "assets|basic-formatting|block-and-inline-properties-part-1|block-and-inline-properties-part-2|embed-entries-or-assets-part-1|embed-entries-or-assets-part-2|markdown-content|videos-and-social-embeds"
  "assign-role-to-a-user|examples-to-create-custom-roles-scenario-1"
  "bulk-publish-assets|bulk-unpublish-assets|edit-an-asset|generate-a-permanent-asset-url|name-asset-versions|publish-an-asset|rename-asset-versions|restore-old-asset-version|unpublish-an-asset"
  "create-a-new-release"
  "customize-your-dashboard-view-part-1|import-prebuilt-stack"
  "edit-a-term|setting-up-taxonomy-based-permissions-for-regional-content-management|taxonomy-for-a-basic-blog-website"
  "edit-an-alias|use-branches-and-aliases-to-drive-continuous-integration-and-deployment"
  "import-prebuilt-content-models|product-listing-page"
  "modular-blocks-within-global-fields"
  "non-localizable-field"
  "track-and-edit-content-in-real-time"
  "view-webhook-logs"
)

echo "================================================================" | tee -a "$LOG"
echo "  CMS Batch 2 RERUN — ${#MODULES[@]} modules, 95 flows total" | tee -a "$LOG"
echo "  Report: ${REPORT_DIR}" | tee -a "$LOG"
echo "================================================================" | tee -a "$LOG"

MODULE_PIDS=()
MODULE_DIRS=()
MAX_CONCURRENT=8
RUNNING=0
NUM_MODULES=${#MODULES[@]}

for (( i=0; i<NUM_MODULES; i++ )); do
  MODULE="${MODULES[$i]}"
  FLOW_PATTERN="${MODULE_FLOW_PATTERNS[$i]}"

  while [[ $RUNNING -ge $MAX_CONCURRENT ]]; do
    wait -n 2>/dev/null || true
    RUNNING=$(( RUNNING - 1 ))
  done

  MODULE_DIR="$PARTS_DIR/module-${MODULE}"
  mkdir -p "$MODULE_DIR"
  MODULE_DIRS[$i]="$MODULE_DIR"
  MODULE_LOG="$MODULE_DIR/module.log"

  (
    if [[ "$MODULE" == "visual-experience" ]]; then
      export DEFAULT_STACK="Compass starter app"
    fi
    : > "$MODULE_LOG"
    set +e
    REPORT_DIR="$MODULE_DIR" \
    PW_WORKERS=1 \
      npx playwright test tests/flows.spec.ts \
        --project=flows \
        --grep "Project=CMS Module=${MODULE} Stage=main.*(${FLOW_PATTERN})$" \
        >> "$MODULE_LOG" 2>&1
    exit $?
  ) &
  MODULE_PIDS[$i]=$!
  RUNNING=$(( RUNNING + 1 ))
  echo "  ▶  ${MODULE} (pid ${MODULE_PIDS[$i]})" | tee -a "$LOG"
  sleep 3
done

TOTAL_EXIT=0
for (( i=0; i<NUM_MODULES; i++ )); do
  MODULE="${MODULES[$i]}"
  wait "${MODULE_PIDS[$i]}" 2>/dev/null || true
  EXIT_CODE=$?
  if [[ "$EXIT_CODE" -ne 0 ]]; then
    TOTAL_EXIT=1
    echo "  ❌  ${MODULE} — exit ${EXIT_CODE}" | tee -a "$LOG"
  else
    echo "  ✅  ${MODULE} — passed" | tee -a "$LOG"
  fi
done

for (( i=0; i<NUM_MODULES; i++ )); do
  MODULE="${MODULES[$i]}"
  MODULE_LOG="${MODULE_DIRS[$i]}/module.log"
  echo "" >> "$LOG"
  echo "--- ${MODULE} ---" >> "$LOG"
  cat "$MODULE_LOG" >> "$LOG" 2>/dev/null || true
done

PART_JSON_FILES=()
for (( i=0; i<NUM_MODULES; i++ )); do
  MODULE="${MODULES[$i]}"
  MODULE_DIR="${MODULE_DIRS[$i]}"
  if [[ -f "$MODULE_DIR/flows-results.json" ]]; then
    cp "$MODULE_DIR/flows-results.json" "$PARTS_DIR/module-${MODULE}.json" 2>/dev/null || true
    PART_JSON_FILES+=("$PARTS_DIR/module-${MODULE}.json")
  fi
done

if [[ ${#PART_JSON_FILES[@]} -gt 0 ]]; then
  npx ts-node "$ROOT/scripts/mergePlaywrightFlowJsonReports.ts" \
    --out "$REPORT_DIR/flows-results.json" "${PART_JSON_FILES[@]}" 2>&1 | tee -a "$LOG" || true
fi

if [[ -f "$REPORT_DIR/flows-results.json" ]]; then
  npx ts-node "$ROOT/scripts/generateCmsExcelReport.ts"   --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
  npx ts-node "$ROOT/scripts/generateCmsDashboardHtml.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
  npx ts-node "$ROOT/scripts/generateUnifiedReport.ts"    --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
fi

echo "" | tee -a "$LOG"
echo "RERUN COMPLETE — outcome: $([ $TOTAL_EXIT -eq 0 ] && echo success || echo failure)" | tee -a "$LOG"
echo "Report dir: $REPORT_DIR" | tee -a "$LOG"

exit $TOTAL_EXIT
