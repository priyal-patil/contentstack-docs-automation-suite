#!/usr/bin/env bash
# =============================================================================
# CMS Batch 2 — 220 flows, 20 shared workers, true idle-browser reuse
#
# Architecture:
#   ONE Playwright invocation with PW_WORKERS=14.
#   All 106 flows from 8 modules share a single worker pool.
#   When any worker finishes a flow it immediately picks up the next queued
#   flow from any module — no idle browsers, no wasted time.
#
# Actual perf (16 workers, 164 flows): 21m 33s → ~2.1 min/flow avg
# Estimated with 20 workers, 220 flows: ~23 min
#
# Workers vs GHA runner (2 CPU cores, 7 GB RAM, headless Chromium ~250 MB):
#   20 workers × 250 MB = 5.0 GB — well within 7 GB limit
#   Raise to PW_WORKERS=24 for max speed (6 GB, still safe on GHA).
#
# Modules (flows after skipping Batch 1 + deletes):
#   environment          :  1 flow
#   language             :  3 flows
#   branches             :  3 flows
#   stack                :  7 flows
#   content-models       : 41 flows  (labels inside content-models)
#   global-field         :  9 flows
#   assets               : 12 flows
#   entries              : 30 flows
#   json-rich-text-editor: 11 flows
#   releases             :  8 flows
#   users-and-roles      :  5 flows
#   live-preview         :  6 flows
#   content-modeling     : 11 flows
#   search               : 12 flows
#   security             :  6 flows
#   tokens               :  2 flows  ← added
#   webhook              :  5 flows  ← added
#   workflows            : 19 flows  ← added (delete-a-publish-rule + revoke-edit-access added to skip)
#   taxonomy             :  8 flows  ← added
#   visual-experience    : 21 flows  ← added (no Batch1 or delete skips needed)
#   ──────────────────────────────────
#   Total                : 220 flows
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
#   PW_WORKERS=20 ./scripts/run-cms-batch2.sh              (max speed, still safe)
#   REPORT_DIR=reports/my-batch2 ./scripts/run-cms-batch2.sh
#   SKIP_SLACK=1 ./scripts/run-cms-batch2.sh
#   PW_RETRIES=0 ./scripts/run-cms-batch2.sh               (disable retries for fast local debug)
#   PW_RETRIES=2 ./scripts/run-cms-batch2.sh               (extra retries for flaky env)
# =============================================================================

set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# ── Cleanup: kill any lingering browser/node processes on exit ───────────────
_CLEANUP_DONE=0
cleanup() {
  [[ "$_CLEANUP_DONE" -eq 1 ]] && return
  _CLEANUP_DONE=1
  echo "" >&2
  echo "🧹  Cleaning up browser processes..." >&2
  pkill -f "chrome-headless-shell" 2>/dev/null || true
  pkill -f "chrome-headless-shell" 2>/dev/null || true   # second pass for stragglers
  echo "🧹  Done." >&2
}
trap cleanup EXIT INT TERM

TS="$(date +%Y%m%d-%H%M%S)"
export REPORT_DIR="${REPORT_DIR:-$ROOT/reports/cms-batch2-$TS}"
LOG="$REPORT_DIR/batch2-run.log"
PARTS_DIR="$REPORT_DIR/playwright-parts"
mkdir -p "$REPORT_DIR" "$PARTS_DIR"

# ── Workers ──────────────────────────────────────────────────────────────────
# 20 workers: 5.0 GB RAM, ~23 min for 220 flows at 2.1 min/flow avg.
# Raise to 24 for max speed (6 GB, still safe on GHA 7 GB runner).
export PW_WORKERS="${PW_WORKERS:-20}"

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
# Batch 1 flows (across all 10 modules) + delete flows, anchored with $ so
# "create-a-global-field" does NOT accidentally match "create-a-global-field-part-2".
# releases: create-a-new-release (Batch 1), delete-a-release + remove-entry-asset-from-a-release (delete)
# json-rich-text-editor: no Batch 1 flows, no delete flows — all 11 flows run
CMS_SKIP_GREP="(create-a-new-stack-part-1|add-an-environment|add-a-language|add-a-custom-language|create-a-branch|create-content-type|create-a-global-field|create-a-global-field-part-2|create-upload-assets|create-a-folder|create-an-entry|add-a-comment|create-and-apply-labels|set-up-live-preview-for-your-stack|create-a-taxonomy|create-a-term|create-a-delivery-token|generate-a-management-token|create-a-webhook|add-workflows-and-stages|delete-a-term|delete-a-taxonomy|delete-a-workflow|delete-an-alias|delete-a-webhook|delete-a-global-field|delete-a-delivery-token|delete-a-management-token|delete-a-release|delete-entries-and-assets-in-bulk|bulk-delete-entries|bulk-delete-assets|bulk-delete-localized-entry-versions|delete-a-folder|delete-an-asset|delete-an-entry|delete-an-entry-part-2|delete-a-language|delete-an-environment|delete-a-branch|delete-content-type|delete-a-stack|edit-or-delete-a-comment|leave-a-stack|transfer-stack-ownership|remove-entry-asset-from-a-release|delete-a-publish-rule|revoke-edit-access-for-an-entry)$"

# ── Run ───────────────────────────────────────────────────────────────────────
START_EPOCH="$(date +%s)"
START_ISO="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"

: > "$LOG"
echo "================================================================" | tee -a "$LOG"
echo "  CMS Batch 2 — shared worker pool" | tee -a "$LOG"
echo "  Workers  : ${PW_WORKERS} shared across all 220 flows" | tee -a "$LOG"
echo "  Modules  : environment(1) language(3) branches(3) stack(7)" | tee -a "$LOG"
echo "             content-models(41) global-field(9) assets(12) entries(30)" | tee -a "$LOG"
echo "             json-rich-text-editor(11) releases(8) users-and-roles(5)" | tee -a "$LOG"
echo "             live-preview(6) content-modeling(11) search(12) security(6)" | tee -a "$LOG"
echo "             tokens(2) webhook(5) workflows(19) taxonomy(8) visual-experience(21)" | tee -a "$LOG"
echo "  Per-flow : ${PW_FLOW_MAX_MINUTES} min/flow | ${PW_ACTION_TIMEOUT_MINUTES} min/element" | tee -a "$LOG"
echo "  Est. time: ~$(( 220 / PW_WORKERS * 2 )) min (220 flows ÷ ${PW_WORKERS} workers × 2.1 min avg)" | tee -a "$LOG"
echo "  Skipping : Batch 1 flows + delete flows (via --grep-invert)" | tee -a "$LOG"
echo "  Started  : ${START_ISO}" | tee -a "$LOG"
echo "  Report   : ${REPORT_DIR}" | tee -a "$LOG"
echo "================================================================" | tee -a "$LOG"
echo "" | tee -a "$LOG"

TOTAL_EXIT=0
set +e
npx playwright test tests/flows.spec.ts --project=flows \
  --grep "Project=CMS Module=(environment|language|branches|stack|content-models|global-field|assets|entries|json-rich-text-editor|releases|users-and-roles|live-preview|content-modeling|search|security|tokens|webhook|workflows|taxonomy|visual-experience) Stage=main" \
  --grep-invert "$CMS_SKIP_GREP" \
  2>&1 | tee -a "$LOG"
PW_EXIT=${PIPESTATUS[0]}
set -e
[[ "$PW_EXIT" -ne 0 ]] && TOTAL_EXIT=1

# Save the result file to parts directory for partial-merge in GHA always-step.
if [[ -f "$REPORT_DIR/flows-results.json" ]]; then
  cp "$REPORT_DIR/flows-results.json" "$PARTS_DIR/batch2-all-modules.json"
fi

# Save warnings from the main run before any retry overwrites them.
if [[ -f "$REPORT_DIR/doc-step-warnings.json" ]]; then
  cp "$REPORT_DIR/doc-step-warnings.json" "$PARTS_DIR/batch2-base-warnings.json" 2>/dev/null || true
fi

# ── Retry failed flows (once) ────────────────────────────────────────────────
if [[ -f "$REPORT_DIR/flows-results.json" ]]; then
  FAILED_FLOWS_STR="$(node -e "
    const fs = require('fs');
    try {
      const j = JSON.parse(fs.readFileSync('$REPORT_DIR/flows-results.json', 'utf-8'));
      const failed = new Set();
      function walk(suite) {
        for (const spec of (suite.specs || [])) {
          for (const t of (spec.tests || [])) {
            const results = t.results || [];
            const last = results[results.length - 1];
            if (!last || last.status === 'passed' || last.status === 'skipped') continue;
            const parts = String(spec.title || '').trim().split(/\s+/).filter(Boolean);
            if (parts.length) failed.add(parts[parts.length - 1]);
          }
        }
        for (const child of (suite.suites || [])) walk(child);
      }
      for (const s of (j.suites || [])) walk(s);
      console.log([...failed].join('\n'));
    } catch(e) {}
  " 2>/dev/null)"

  FAILED_FLOWS=()
  while IFS= read -r _line; do
    [[ -n "${_line// }" ]] && FAILED_FLOWS+=("$_line")
  done <<< "$FAILED_FLOWS_STR"

  if [[ ${#FAILED_FLOWS[@]} -gt 0 ]]; then
    RETRY_PASS=0
    RETRY_FAIL=0

    echo "" | tee -a "$LOG"
    echo "================================================================" | tee -a "$LOG"
    echo "  RETRY — ${#FAILED_FLOWS[@]} failed flow(s) — running once more" | tee -a "$LOG"
    echo "================================================================" | tee -a "$LOG"
    echo "" | tee -a "$LOG"

    RETRY_FILES=()
    for FLOW_ID in "${FAILED_FLOWS[@]}"; do
      [[ -z "${FLOW_ID// }" ]] && continue
      FLOW_START="$(date +%s)"
      echo "[retry] ▶  ${FLOW_ID}" | tee -a "$LOG"

      set +e
      PW_WORKERS=1 npx playwright test tests/flows.spec.ts \
        --project=flows \
        --grep "Project=CMS.*${FLOW_ID}$" \
        2>&1 | tee -a "$LOG"
      FLOW_EXIT=${PIPESTATUS[0]}
      set -e

      FLOW_ELAPSED=$(( $(date +%s) - FLOW_START ))
      FLOW_MIN=$(( FLOW_ELAPSED / 60 ))
      FLOW_SEC=$(( FLOW_ELAPSED % 60 ))

      if [[ "$FLOW_EXIT" -eq 0 ]]; then
        STATUS="✅ PASS (retry)"
        RETRY_PASS=$((RETRY_PASS + 1))
      else
        STATUS="❌ FAIL (retry)"
        RETRY_FAIL=$((RETRY_FAIL + 1))
      fi

      RETRY_OUT="$PARTS_DIR/${FLOW_ID}-retry.json"
      if [[ -f "$REPORT_DIR/flows-results.json" ]]; then
        cp "$REPORT_DIR/flows-results.json" "$RETRY_OUT" 2>/dev/null || true
        RETRY_FILES+=("$RETRY_OUT")
      fi
      if [[ -f "$REPORT_DIR/doc-step-warnings.json" ]]; then
        cp "$REPORT_DIR/doc-step-warnings.json" "$PARTS_DIR/${FLOW_ID}-retry-warnings.json" 2>/dev/null || true
      fi

      echo "     ${STATUS}  — ${FLOW_MIN}m ${FLOW_SEC}s" | tee -a "$LOG"
      echo "" | tee -a "$LOG"
    done

    echo "================================================================" | tee -a "$LOG"
    echo "  RETRY COMPLETE" | tee -a "$LOG"
    echo "  Recovered    : ${RETRY_PASS}/${#FAILED_FLOWS[@]}" | tee -a "$LOG"
    echo "  Still failing: ${RETRY_FAIL}/${#FAILED_FLOWS[@]}" | tee -a "$LOG"
    echo "================================================================" | tee -a "$LOG"

    # Patch the original batch result with retry outcomes and restore flows-results.json.
    if [[ ${#RETRY_FILES[@]} -gt 0 && -f "$PARTS_DIR/batch2-all-modules.json" ]]; then
      npx ts-node "$ROOT/scripts/applyFlowRetries.ts" \
        --base "$PARTS_DIR/batch2-all-modules.json" "${RETRY_FILES[@]}" 2>&1 | tee -a "$LOG" || true
      cp "$PARTS_DIR/batch2-all-modules.json" "$REPORT_DIR/flows-results.json" 2>/dev/null || true
    fi

    # Merge warnings: base run + each retried flow's warnings (retry result overrides by flowId+stepIndex key).
    shopt -s nullglob
    WARN_PARTS=("$PARTS_DIR/batch2-base-warnings.json" "$PARTS_DIR"/*-retry-warnings.json)
    shopt -u nullglob
    if [[ ${#WARN_PARTS[@]} -gt 0 ]]; then
      node -e "
        const fs = require('fs');
        const parts = process.argv.slice(1);
        // Index by flowId|stepIndex so retry entries replace base entries for the same step.
        const byKey = new Map();
        for (const p of parts) {
          try {
            const d = JSON.parse(fs.readFileSync(p, 'utf-8'));
            if (!Array.isArray(d.warnings)) continue;
            for (const w of d.warnings) {
              byKey.set((w.flowId || '') + '|' + (w.stepIndex ?? w.stepNumber ?? ''), w);
            }
          } catch {}
        }
        const all = [...byKey.values()];
        const uniqueFlows = new Set(all.map(w => w.flowId).filter(Boolean)).size;
        fs.writeFileSync(
          '${REPORT_DIR}/doc-step-warnings.json',
          JSON.stringify({ generatedAt: new Date().toISOString(), warningFlows: uniqueFlows, warnings: all }, null, 2)
        );
        console.log('Merged warnings → ' + all.length + ' entries across ' + uniqueFlows + ' flows.');
      " "${WARN_PARTS[@]}" 2>&1 | tee -a "$LOG" || true
    fi

    [[ "$RETRY_FAIL" -eq 0 ]] && TOTAL_EXIT=0 || TOTAL_EXIT=1
  fi
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
  CMS_BATCH_DURATION_LABEL="CMS Batch 2: environment, language, branches, stack, content-models, global-field, assets, entries, json-rich-text-editor, releases, users-and-roles, live-preview, content-modeling, search, security, tokens, webhook, workflows, taxonomy, visual-experience (${TOTAL_MIN}m ${TOTAL_SEC}s)" \
    npx ts-node "$ROOT/scripts/urlRunSummaryAndSlack.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
fi

exit $TOTAL_EXIT
