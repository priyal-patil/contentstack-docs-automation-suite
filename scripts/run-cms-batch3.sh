#!/usr/bin/env bash
# =============================================================================
# CMS Batch 3 — all CMS delete flows + trash module (phase-based parallelism)
#
# Runs after Batch 2. Executes every delete-related flow in the CMS project
# in a safe LIFO order, then runs the trash module (restore flows).
# Each phase runs as a single Playwright invocation; independent phases use
# multiple workers, order-sensitive phases use 1.
#
# Phase design:
#   Phase 1  — Content    (10 flows, 5 workers) — all independent
#   Phase 2  — Taxonomy   ( 2 flows, 1 worker)  — term MUST precede taxonomy
#   Phase 3  — Structure  ( 2 flows, 2 workers) — independent
#   Phase 4  — Releases   ( 2 flows, 2 workers) — independent
#   Phase 5  — Services   ( 5 flows, 3 workers) — mostly independent
#   Phase 6  — Branches   ( 2 flows, 1 worker)  — alias MUST precede branch
#   Phase 7  — Env/Lang   ( 2 flows, 2 workers) — independent
#   Phase 8  — Users      ( 2 flows, 2 workers) — independent
#   Phase 9  — Stack      ( 3 flows, 1 worker)  — leave → transfer → delete
#   Phase 10 — Trash      ( 8 flows, 7 workers) — all independent restores
#
# Total: 38 flows | Est. ~32 min (30 delete + 2 min trash)
#
# Usage:
#   ./scripts/run-cms-batch3.sh
#   PLAYWRIGHT_HEADLESS=0 ./scripts/run-cms-batch3.sh
#   REPORT_DIR=reports/my-batch3 ./scripts/run-cms-batch3.sh
#   SKIP_SLACK=1 ./scripts/run-cms-batch3.sh
#   PW_RETRIES=0 ./scripts/run-cms-batch3.sh               (disable retries for fast local debug)
#   PW_RETRIES=2 ./scripts/run-cms-batch3.sh               (extra retries for flaky env)
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
export REPORT_DIR="${REPORT_DIR:-$ROOT/reports/cms-batch3-$TS}"
LOG="$REPORT_DIR/batch3-run.log"
PARTS_DIR="$REPORT_DIR/playwright-parts"
mkdir -p "$REPORT_DIR" "$PARTS_DIR"

export PW_FLOW_MAX_MINUTES="${PW_FLOW_MAX_MINUTES:-5}"
export PW_ACTION_TIMEOUT_MINUTES="${PW_ACTION_TIMEOUT_MINUTES:-3}"
export PW_SLOWMO="${PW_SLOWMO:-0}"
export PLAYWRIGHT_HEADLESS="${PLAYWRIGHT_HEADLESS:-1}"
export CMS_SEQUENTIAL_MODULE_ORDER=0
export CMS_CONTINUE_ON_FAIL=0
export OPEN_FLOW_REPORT="${OPEN_FLOW_REPORT:-false}"

TOTAL_EXIT=0
PHASE_NUM=0

# ── run_phase: one playwright invocation, N workers, grep matches any of the flows ──
run_phase() {
  local label="$1"
  local workers="$2"
  shift 2
  local flows=("$@")
  PHASE_NUM=$(( PHASE_NUM + 1 ))

  # Build alternation pattern: (flow1|flow2|...)$
  local pattern
  pattern="($(printf '%s|' "${flows[@]}" | sed 's/|$//'))\$"

  local start_t; start_t="$(date +%s)"
  echo "" | tee -a "$LOG"
  echo ">>> [Phase ${PHASE_NUM}] ${label} — ${#flows[@]} flows, ${workers} workers" | tee -a "$LOG"
  for f in "${flows[@]}"; do echo "    + ${f}" | tee -a "$LOG"; done

  set +e
  PW_WORKERS="$workers" npx playwright test tests/flows.spec.ts \
    --project=flows \
    --grep "Project=CMS.*${pattern}" \
    2>&1 | tee -a "$LOG"
  local ex=${PIPESTATUS[0]}
  set -e

  local dur=$(( $(date +%s) - start_t ))
  local icon; [[ $ex -eq 0 ]] && icon="✅" || icon="❌"
  echo "    ${icon} Phase ${PHASE_NUM} done — exit=${ex} dur=$(( dur/60 ))m$(( dur%60 ))s" | tee -a "$LOG"

  if [[ -f "$REPORT_DIR/flows-results.json" ]]; then
    cp "$REPORT_DIR/flows-results.json" "$PARTS_DIR/phase${PHASE_NUM}-${label}.json" 2>/dev/null || true
  fi
  if [[ -f "$REPORT_DIR/doc-step-warnings.json" ]]; then
    cp "$REPORT_DIR/doc-step-warnings.json" "$PARTS_DIR/phase${PHASE_NUM}-${label}-warnings.json" 2>/dev/null || true
  fi
  [[ "$ex" -ne 0 ]] && TOTAL_EXIT=1
  return 0
}

# ── run_flow: single flow, always 1 worker (strict order within phase) ──────
run_flow() {
  local flow_id="$1"
  local start_t; start_t="$(date +%s)"
  echo "    ▶ ${flow_id}" | tee -a "$LOG"

  set +e
  PW_WORKERS=1 npx playwright test tests/flows.spec.ts \
    --project=flows \
    --grep "Project=CMS.*${flow_id}\$" \
    2>&1 | tee -a "$LOG"
  local ex=${PIPESTATUS[0]}
  set -e

  local dur=$(( $(date +%s) - start_t ))
  local icon; [[ $ex -eq 0 ]] && icon="✅" || icon="❌"
  echo "      ${icon} exit=${ex} dur=$(( dur/60 ))m$(( dur%60 ))s" | tee -a "$LOG"

  if [[ -f "$REPORT_DIR/flows-results.json" ]]; then
    cp "$REPORT_DIR/flows-results.json" "$PARTS_DIR/${flow_id}.json" 2>/dev/null || true
  fi
  if [[ -f "$REPORT_DIR/doc-step-warnings.json" ]]; then
    cp "$REPORT_DIR/doc-step-warnings.json" "$PARTS_DIR/${flow_id}-warnings.json" 2>/dev/null || true
  fi
  [[ "$ex" -ne 0 ]] && TOTAL_EXIT=1
  return 0
}

START_EPOCH="$(date +%s)"
START_ISO="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"

: > "$LOG"
echo "================================================================" | tee -a "$LOG"
echo "  CMS Batch 3 — 38 flows (30 delete + 8 trash), phase-based parallelism" | tee -a "$LOG"
echo "  Phase 1(5w) → 2(1w) → 3(2w) → 4(2w) → 5(3w)" | tee -a "$LOG"
echo "  → 6(1w) → 7(2w) → 8(2w) → 9(1w) → 10-trash(7w)" | tee -a "$LOG"
echo "  Est. ~32 min | 3 min element timeout | 5 min/flow cap" | tee -a "$LOG"
echo "  Started : ${START_ISO}" | tee -a "$LOG"
echo "  Report  : ${REPORT_DIR}" | tee -a "$LOG"
echo "================================================================" | tee -a "$LOG"

# ── Phase 1: Content (5 workers — all independent) ───────────────────────────
run_phase "content" 5 \
  "edit-or-delete-a-comment" \
  "remove-entry-version-names" \
  "delete-an-entry" \
  "delete-an-entry-part-2" \
  "bulk-delete-entries" \
  "bulk-delete-localized-entry-versions" \
  "delete-a-folder" \
  "delete-an-asset" \
  "bulk-delete-assets" \
  "delete-entries-and-assets-in-bulk"

# ── Phase 2: Taxonomy (1 worker — term MUST precede taxonomy) ────────────────
echo "" | tee -a "$LOG"
echo ">>> [Phase 2] taxonomy — 2 flows, 1 worker (term → taxonomy)" | tee -a "$LOG"
run_flow "delete-a-term"
run_flow "delete-a-taxonomy"

# ── Phase 3: Structure (2 workers — independent) ─────────────────────────────
run_phase "structure" 2 \
  "delete-a-global-field" \
  "delete-content-type"

# ── Phase 4: Releases (2 workers — independent) ──────────────────────────────
run_phase "releases" 2 \
  "delete-a-release" \
  "remove-entry-asset-from-a-release"

# ── Phase 5: Services (3 workers — mostly independent) ───────────────────────
run_phase "services" 3 \
  "delete-a-delivery-token" \
  "delete-a-management-token" \
  "delete-a-webhook" \
  "delete-a-publish-rule" \
  "delete-a-workflow"

# ── Phase 6: Branches (1 worker — alias MUST precede branch) ─────────────────
echo "" | tee -a "$LOG"
echo ">>> [Phase 6] branches — 2 flows, 1 worker (alias → branch)" | tee -a "$LOG"
run_flow "delete-an-alias"
run_flow "delete-a-branch"

# ── Phase 7: Env/Lang (2 workers — independent) ──────────────────────────────
run_phase "env-lang" 2 \
  "delete-an-environment" \
  "delete-a-language"

# ── Phase 8: Users/Roles (2 workers — independent) ───────────────────────────
run_phase "users-roles" 2 \
  "delete-a-role" \
  "remove-a-user"

# ── Phase 9: Stack (1 worker — strict: leave → transfer → delete) ────────────
echo "" | tee -a "$LOG"
echo ">>> [Phase 9] stack — 3 flows, 1 worker (leave → transfer → delete)" | tee -a "$LOG"
run_flow "leave-a-stack"
run_flow "transfer-stack-ownership"
run_flow "delete-a-stack"

# ── Phase 10: Trash (7 workers — all restores are independent) ────────────────
# Runs AFTER all deletes so there are items in the trash to restore.
# 7 workers for 8 flows — all restore flows are fully independent.
run_phase "trash" 7 \
  "about-trash" \
  "restore-a-deleted-asset" \
  "restore-a-deleted-asset-folder" \
  "restore-a-deleted-entry" \
  "restore-a-deleted-content-type" \
  "restore-a-deleted-global-field" \
  "restore-a-deleted-term" \
  "restore-a-deleted-taxonomy"

# ── Summary ───────────────────────────────────────────────────────────────────
END_EPOCH="$(date +%s)"
TOTAL_ELAPSED=$(( END_EPOCH - START_EPOCH ))
TOTAL_MIN=$(( TOTAL_ELAPSED / 60 ))
TOTAL_SEC=$(( TOTAL_ELAPSED % 60 ))

echo "" | tee -a "$LOG"
echo "================================================================" | tee -a "$LOG"
echo "  CMS Batch 3 — COMPLETE" | tee -a "$LOG"
echo "  Duration : ${TOTAL_MIN}m ${TOTAL_SEC}s" | tee -a "$LOG"
echo "  Outcome  : $([ $TOTAL_EXIT -eq 0 ] && echo 'success' || echo 'failure')" | tee -a "$LOG"
echo "================================================================" | tee -a "$LOG"

cat > "$REPORT_DIR/timing-summary.txt" <<EOF
CMS Batch 3 — Duration: ${TOTAL_MIN}m ${TOTAL_SEC}s
Started:  ${START_ISO}
Finished: $(date -u +'%Y-%m-%dT%H:%M:%SZ')
Outcome:  $([ $TOTAL_EXIT -eq 0 ] && echo 'success' || echo 'failure')
EOF

# ── Merge parts + generate initial reports ───────────────────────────────────
shopt -s nullglob
PART_FILES=("$PARTS_DIR"/*.json)
# Exclude warning part files from the flows-results merge.
FLOWS_PART_FILES=()
for f in "${PART_FILES[@]}"; do
  [[ "$f" == *-warnings.json ]] && continue
  FLOWS_PART_FILES+=("$f")
done
shopt -u nullglob

if [[ ${#FLOWS_PART_FILES[@]} -gt 0 ]]; then
  npx ts-node "$ROOT/scripts/mergePlaywrightFlowJsonReports.ts" \
    --out "$REPORT_DIR/flows-results.json" "${FLOWS_PART_FILES[@]}" 2>&1 | tee -a "$LOG" || true
fi

# ── Merge per-phase warnings into a single doc-step-warnings.json ─────────────
shopt -s nullglob
WARN_PARTS=("$PARTS_DIR"/*-warnings.json)
shopt -u nullglob
if [[ ${#WARN_PARTS[@]} -gt 0 ]]; then
  node -e "
    const fs = require('fs');
    const parts = process.argv.slice(1);
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
    console.log('Merged ' + parts.length + ' warning parts → ' + all.length + ' warnings across ' + uniqueFlows + ' flows.');
  " "${WARN_PARTS[@]}" 2>&1 | tee -a "$LOG" || true
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

    # Patch merged flows-results.json with retry outcomes.
    if [[ ${#RETRY_FILES[@]} -gt 0 ]]; then
      npx ts-node "$ROOT/scripts/applyFlowRetries.ts" \
        --base "$REPORT_DIR/flows-results.json" "${RETRY_FILES[@]}" 2>&1 | tee -a "$LOG" || true
    fi

    # Re-merge warnings to include retry flow warnings.
    shopt -s nullglob
    ALL_WARN_PARTS=("$PARTS_DIR"/*-warnings.json "$PARTS_DIR"/*-retry-warnings.json)
    shopt -u nullglob
    if [[ ${#ALL_WARN_PARTS[@]} -gt 0 ]]; then
      node -e "
        const fs = require('fs');
        const parts = process.argv.slice(1);
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
        console.log('Re-merged warnings after retry → ' + all.length + ' entries across ' + uniqueFlows + ' flows.');
      " "${ALL_WARN_PARTS[@]}" 2>&1 | tee -a "$LOG" || true
    fi

    [[ "$RETRY_FAIL" -eq 0 ]] && TOTAL_EXIT=0 || TOTAL_EXIT=1
  fi
fi

# ── Reports ───────────────────────────────────────────────────────────────────
if [[ -f "$REPORT_DIR/flows-results.json" ]]; then
  npx ts-node "$ROOT/scripts/generateCmsExcelReport.ts"   --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
  npx ts-node "$ROOT/scripts/generateCmsDashboardHtml.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
  npx ts-node "$ROOT/scripts/generateUnifiedReport.ts"    --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
fi

# ── Slack ─────────────────────────────────────────────────────────────────────
if [[ "${SKIP_SLACK:-0}" != "1" ]]; then
  CMS_BATCH_DURATION_LABEL="CMS Batch 3: delete flows + trash restores (${TOTAL_MIN}m ${TOTAL_SEC}s)" \
    npx ts-node "$ROOT/scripts/urlRunSummaryAndSlack.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$LOG" || true
fi

exit $TOTAL_EXIT
