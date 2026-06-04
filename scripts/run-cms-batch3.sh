#!/usr/bin/env bash
# =============================================================================
# CMS Batch 3 — all CMS delete flows + trash restores (sequential, 1 worker)
#
# Runs after Batch 2 (edit/update flows). Executes every delete-related flow
# in the CMS project in a safe LIFO order, then runs the trash module
# (restores deleted items so the stack is clean for the next day's run).
#
# WHY sequential (PW_WORKERS=1):
#   Delete order matters. You cannot delete a content-type before its entries,
#   or a stack before its environments/tokens/webhooks. Running 1 worker at a
#   time guarantees the explicit order below is respected.
#
# Execution order (safe LIFO — content before structure, structure before stack):
#   Phase 1 — Content (entries, assets, comments, version names)
#   Phase 2 — Taxonomy (terms before taxonomies)
#   Phase 3 — Content structure (global fields, content types)
#   Phase 4 — Releases
#   Phase 5 — Tokens, webhooks, workflows
#   Phase 6 — Branches and aliases
#   Phase 7 — Environments and languages
#   Phase 8 — Users and roles
#   Phase 9 — Stack (leave, transfer, delete) — always last
#   Phase 10 — Trash (restores) — cleans up deleted items for next run
#
# Total: 30 delete flows
#
# Note: flows with stage=delete (delete-a-branch, delete-content-type,
#       delete-a-stack, delete-a-role, remove-a-user) are also included —
#       grep does NOT filter by Stage=main so all stages are matched.
#
# Usage:
#   ./scripts/run-cms-batch3.sh
#   PLAYWRIGHT_HEADLESS=0 ./scripts/run-cms-batch3.sh    (headed)
#   REPORT_DIR=reports/my-batch3 ./scripts/run-cms-batch3.sh
#   SKIP_SLACK=1 ./scripts/run-cms-batch3.sh
# =============================================================================

set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TS="$(date +%Y%m%d-%H%M%S)"
export REPORT_DIR="${REPORT_DIR:-$ROOT/reports/cms-batch3-$TS}"
LOG="$REPORT_DIR/batch3-run.log"
PARTS_DIR="$REPORT_DIR/playwright-parts"
mkdir -p "$REPORT_DIR" "$PARTS_DIR"

export PW_WORKERS=1
export PW_FLOW_MAX_MINUTES="${PW_FLOW_MAX_MINUTES:-5}"
export PW_ACTION_TIMEOUT_MINUTES="${PW_ACTION_TIMEOUT_MINUTES:-3}"
export PW_SLOWMO="${PW_SLOWMO:-0}"
export PLAYWRIGHT_HEADLESS="${PLAYWRIGHT_HEADLESS:-1}"
export CMS_SEQUENTIAL_MODULE_ORDER=0
export CMS_CONTINUE_ON_FAIL=0
export OPEN_FLOW_REPORT="${OPEN_FLOW_REPORT:-false}"

# ── Delete flow execution order (LIFO — safe dependency order) ───────────────
# Phase 1: Content — delete entries/assets/comments before structure
PHASE1_CONTENT=(
  "edit-or-delete-a-comment"
  "remove-entry-version-names"
  "delete-an-entry"
  "delete-an-entry-part-2"
  "bulk-delete-entries"
  "bulk-delete-localized-entry-versions"
  "delete-a-folder"
  "delete-an-asset"
  "bulk-delete-assets"
  "delete-entries-and-assets-in-bulk"
)

# Phase 2: Taxonomy — terms before taxonomy
PHASE2_TAXONOMY=(
  "delete-a-term"
  "delete-a-taxonomy"
)

# Phase 3: Content structure — global fields before content types
PHASE3_STRUCTURE=(
  "delete-a-global-field"
  "delete-content-type"
)

# Phase 4: Releases
PHASE4_RELEASES=(
  "delete-a-release"
  "remove-entry-asset-from-a-release"
)

# Phase 5: Tokens, webhooks, workflows
PHASE5_SERVICES=(
  "delete-a-delivery-token"
  "delete-a-management-token"
  "delete-a-webhook"
  "revoke-edit-access-for-an-entry"
  "delete-a-publish-rule"
  "delete-a-workflow"
)

# Phase 6: Branches and aliases
PHASE6_BRANCHES=(
  "delete-an-alias"
  "delete-a-branch"
)

# Phase 7: Environments and languages
PHASE7_ENV_LANG=(
  "delete-an-environment"
  "delete-a-language"
)

# Phase 8: Users and roles
PHASE8_USERS=(
  "delete-a-role"
  "remove-a-user"
)

# Phase 9: Stack — always last in delete sequence
PHASE9_STACK=(
  "leave-a-stack"
  "transfer-stack-ownership"
  "delete-a-stack"
)

# All flows in execution order
ALL_FLOWS=(
  "${PHASE1_CONTENT[@]}"
  "${PHASE2_TAXONOMY[@]}"
  "${PHASE3_STRUCTURE[@]}"
  "${PHASE4_RELEASES[@]}"
  "${PHASE5_SERVICES[@]}"
  "${PHASE6_BRANCHES[@]}"
  "${PHASE7_ENV_LANG[@]}"
  "${PHASE8_USERS[@]}"
  "${PHASE9_STACK[@]}"
)

TOTAL_FLOWS=${#ALL_FLOWS[@]}
PASS_COUNT=0
FAIL_COUNT=0
TOTAL_EXIT=0
declare -a FLOW_RESULTS=()

START_EPOCH="$(date +%s)"
START_ISO="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"

: > "$LOG"
echo "================================================================" | tee -a "$LOG"
echo "  CMS Batch 3 — ${TOTAL_FLOWS} delete flows | 1 worker | ${PW_FLOW_MAX_MINUTES} min/flow" | tee -a "$LOG"
echo "  Phases: content → taxonomy → structure → releases → services" | tee -a "$LOG"
echo "          → branches → env/lang → users → stack (last)" | tee -a "$LOG"
echo "  Started : ${START_ISO}" | tee -a "$LOG"
echo "  Report  : ${REPORT_DIR}" | tee -a "$LOG"
echo "================================================================" | tee -a "$LOG"
echo "" | tee -a "$LOG"

# ── Run each flow individually in order ──────────────────────────────────────
IDX=0
for FLOW_ID in "${ALL_FLOWS[@]}"; do
  IDX=$(( IDX + 1 ))
  FLOW_START="$(date +%s)"
  FLOW_START_ISO="$(date -u +'%H:%M:%SZ')"

  echo "[${IDX}/${TOTAL_FLOWS}] ▶  ${FLOW_ID}  (${FLOW_START_ISO})" | tee -a "$LOG"

  set +e
  # Do NOT filter by Stage=main — some delete flows have stage=delete
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
    PASS_COUNT=$(( PASS_COUNT + 1 ))
  else
    STATUS="❌ FAIL"
    FAIL_COUNT=$(( FAIL_COUNT + 1 ))
    TOTAL_EXIT=1
  fi

  FLOW_RESULTS+=("  ${STATUS}  ${FLOW_ID}  (${FLOW_MIN}m ${FLOW_SEC}s)")
  echo "     ${STATUS}  — ${FLOW_MIN}m ${FLOW_SEC}s" | tee -a "$LOG"

  if [[ -f "$REPORT_DIR/flows-results.json" ]]; then
    cp "$REPORT_DIR/flows-results.json" "$PARTS_DIR/${FLOW_ID}.json" 2>/dev/null || true
  fi
  echo "" | tee -a "$LOG"
done

# ── Summary ───────────────────────────────────────────────────────────────────
END_EPOCH="$(date +%s)"
TOTAL_ELAPSED=$(( END_EPOCH - START_EPOCH ))
TOTAL_MIN=$(( TOTAL_ELAPSED / 60 ))
TOTAL_SEC=$(( TOTAL_ELAPSED % 60 ))

echo "================================================================" | tee -a "$LOG"
echo "  CMS Batch 3 — COMPLETE" | tee -a "$LOG"
echo "  Duration : ${TOTAL_MIN}m ${TOTAL_SEC}s" | tee -a "$LOG"
echo "  Passed   : ${PASS_COUNT}/${TOTAL_FLOWS}" | tee -a "$LOG"
echo "  Failed   : ${FAIL_COUNT}/${TOTAL_FLOWS}" | tee -a "$LOG"
echo "" | tee -a "$LOG"
echo "  Per-flow results:" | tee -a "$LOG"
for r in "${FLOW_RESULTS[@]}"; do
  echo "$r" | tee -a "$LOG"
done
echo "================================================================" | tee -a "$LOG"

cat > "$REPORT_DIR/timing-summary.txt" <<EOF
CMS Batch 3 — Duration: ${TOTAL_MIN}m ${TOTAL_SEC}s
Started:  ${START_ISO}
Finished: $(date -u +'%Y-%m-%dT%H:%M:%SZ')
Outcome:  $([ $TOTAL_EXIT -eq 0 ] && echo 'success' || echo 'failure')
Flows:    ${PASS_COUNT} passed, ${FAIL_COUNT} failed of ${TOTAL_FLOWS}
EOF

# ── Merge parts + generate reports ───────────────────────────────────────────
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

# ── Slack ─────────────────────────────────────────────────────────────────────
if [[ "${SKIP_SLACK:-0}" != "1" ]]; then
  CMS_BATCH_DURATION_LABEL="CMS Batch 3: all delete flows + trash restores (${TOTAL_MIN}m ${TOTAL_SEC}s)" \
    npx ts-node "$ROOT/scripts/urlRunSummaryAndSlack.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
fi

exit $TOTAL_EXIT
