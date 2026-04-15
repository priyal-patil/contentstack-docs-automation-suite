#!/usr/bin/env bash
# CMS: run modules sequentially (main flows only), then all delete-related flows, then trash.
# Headless, no per-URL HTML open (OPEN_FLOW_REPORT=false). Merges Playwright JSON, then dashboard + Slack.
#
# Canonical module order, CRUD policy, delete batch, and trash-last: .cursor/rules/cms-execution-order.mdc
#
# Usage:
#   ./scripts/run-cms-sequential-modules-dashboard.sh
#   REPORT_DIR=reports/my-batch SKIP_SLACK=1 SKIP_DOCS_AUDIT=1 ./scripts/run-cms-sequential-modules-dashboard.sh
#   DOCS_AUDIT_BACKGROUND=0 SKIP_DOCS_AUDIT=0 — run docs-audit inline at end (same REPORT_DIR; overwrites flows-results.json)
# Background:
#   nohup ./scripts/run-cms-sequential-modules-dashboard.sh > reports/cms-seq-nohup.log 2>&1 &
#
# Repeat this full workflow later by asking: "Run the CMS sequential module batch (headless, dashboard, Slack)."

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TS="$(date +%Y%m%d-%H%M%S)"
export REPORT_DIR="${REPORT_DIR:-$ROOT/reports/cms-seq-$TS}"
PARTS_DIR="$REPORT_DIR/playwright-parts"
mkdir -p "$REPORT_DIR" "$PARTS_DIR"

START_ISO="$(date -Iseconds 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "{\"startedAt\":\"$START_ISO\",\"reportDir\":\"$REPORT_DIR\",\"mode\":\"cms-sequential-modules\"}" > "$REPORT_DIR/run-meta.json"

export OPEN_FLOW_REPORT="${OPEN_FLOW_REPORT:-false}"
export PLAYWRIGHT_HEADLESS=1
export PW_SLOWMO="${PW_SLOWMO:-0}"
export PW_WORKERS="${PW_WORKERS:-6}"

# Flow titles (flow id) to defer to the delete batch / exclude from main Stage=main module runs.
CMS_DELETE_FLOW_GREP='delete-a-term|delete-a-taxonomy|delete-a-workflow|delete-an-alias|delete-a-webhook|delete-a-global-field|delete-a-delivery-token|delete-a-management-token|delete-a-release|delete-entries-and-assets-in-bulk|bulk-delete-entries|bulk-delete-assets|bulk-delete-localized-entry-versions|delete-a-folder|delete-an-asset|delete-an-entry|delete-an-entry-part-2|delete-a-language|delete-an-environment|delete-a-branch|delete-content-type|delete-a-stack|edit-or-delete-a-comment'

# Module order: environment → locales (language) → stack → content types → … → trash last (handled separately).
CMS_MAIN_MODULES=(
  environment
  language
  stack
  content-models
  content-modeling
  global-field
  assets
  entries
  live-preview
  releases
  search
  security
  branches
  tokens
  webhook
  workflows
  taxonomy
  json-rich-text-editor
  visual-experience
)

TOTAL_EXIT=0
run_playwright_part() {
  local label="$1"
  shift
  set +e
  npx playwright test tests/flows.spec.ts --project=default "$@" 2>&1 | tee -a "$REPORT_DIR/cms-sequential.log"
  local ex=${PIPESTATUS[0]}
  set -e
  if [[ -f "$REPORT_DIR/flows-results.json" ]]; then
    cp "$REPORT_DIR/flows-results.json" "$PARTS_DIR/${label}.json"
  else
    echo "WARNING: No flows-results.json for part $label (exit $ex)" | tee -a "$REPORT_DIR/cms-sequential.log"
  fi
  if [[ "$ex" -ne 0 ]]; then TOTAL_EXIT=1; fi
  return 0
}

: > "$REPORT_DIR/cms-sequential.log"
echo "=== CMS sequential modules → $REPORT_DIR ===" | tee -a "$REPORT_DIR/cms-sequential.log"

DOCS_AUDIT_BACKGROUND="${DOCS_AUDIT_BACKGROUND:-1}"
if [[ "$DOCS_AUDIT_BACKGROUND" == "1" ]]; then
  echo "Starting background docs-audit for CMS (separate REPORT_DIR; does not block flows)…" | tee -a "$REPORT_DIR/cms-sequential.log"
  npx ts-node "$ROOT/scripts/syncDocsUrlsToCsv.ts" >>"$REPORT_DIR/docs-audit-background.log" 2>&1 || true
  nohup bash "$ROOT/scripts/run-docs-audit-background.sh" CMS "$REPORT_DIR" >>"$REPORT_DIR/docs-audit-background.log" 2>&1 &
  echo $! >"$REPORT_DIR/docs-audit-background.pid"
  echo "docs-audit background PID $(cat "$REPORT_DIR/docs-audit-background.pid") — log: $REPORT_DIR/docs-audit-background.log" | tee -a "$REPORT_DIR/cms-sequential.log"
fi

n=0
for mod in "${CMS_MAIN_MODULES[@]}"; do
  n=$((n + 1))
  printf -v ord "%02d" "$n"
  echo "" | tee -a "$REPORT_DIR/cms-sequential.log"
  echo ">>> [$ord] Project=CMS Module=$mod Stage=main (excluding delete flows)" | tee -a "$REPORT_DIR/cms-sequential.log"
  run_playwright_part "${ord}-module-${mod}" \
    -g "Project=CMS Module=${mod} Stage=main" \
    --grep-invert "$CMS_DELETE_FLOW_GREP"
done

echo "" | tee -a "$REPORT_DIR/cms-sequential.log"
echo ">>> Delete-related flows (all CMS modules, batched)" | tee -a "$REPORT_DIR/cms-sequential.log"
run_playwright_part "90-delete-batch" \
  -g "Project=CMS" \
  --grep "$CMS_DELETE_FLOW_GREP"

echo "" | tee -a "$REPORT_DIR/cms-sequential.log"
echo ">>> Trash module" | tee -a "$REPORT_DIR/cms-sequential.log"
run_playwright_part "99-trash" \
  -g "Project=CMS Module=trash Stage=main"

echo "" | tee -a "$REPORT_DIR/cms-sequential.log"
echo ">>> Merging Playwright JSON parts" | tee -a "$REPORT_DIR/cms-sequential.log"
shopt -s nullglob
PART_FILES=("$PARTS_DIR"/*.json)
shopt -u nullglob
if [[ ${#PART_FILES[@]} -eq 0 ]]; then
  echo "No part files to merge." | tee -a "$REPORT_DIR/cms-sequential.log"
else
  npx ts-node "$ROOT/scripts/mergePlaywrightFlowJsonReports.ts" --out "$REPORT_DIR/flows-results.json" "${PART_FILES[@]}"
fi

# docs-audit overwrites flows-results.json with audit-only JSON (no flows.spec) — keep CMS flow JSON for Slack/dashboard.
if [[ -f "$REPORT_DIR/flows-results.json" ]]; then
  cp "$REPORT_DIR/flows-results.json" "$REPORT_DIR/flows-results-cms.json"
fi

AUDIT_EXIT=0
if [[ "$DOCS_AUDIT_BACKGROUND" == "1" ]]; then
  echo "DOCS_AUDIT_BACKGROUND=1 — inline docs-audit skipped (see reports/docs-audit-CMS-* and docs-audit-background.log)" | tee -a "$REPORT_DIR/cms-sequential.log"
elif [[ "${SKIP_DOCS_AUDIT:-0}" != "1" ]]; then
  npx ts-node "$ROOT/scripts/syncDocsUrlsToCsv.ts" 2>&1 | tee -a "$REPORT_DIR/cms-sequential.log" || true
  export DOCS_URLS_CSV="$ROOT/data/docs-urls.csv"
  export DOCS_AUDIT_PROJECT=CMS
  set +e
  npx playwright test tests/docs-audit.spec.ts --project=docs-audit 2>&1 | tee -a "$REPORT_DIR/cms-sequential.log"
  AUDIT_EXIT=${PIPESTATUS[0]}
  set -e
  if [[ "$AUDIT_EXIT" -ne 0 ]]; then
    echo "WARNING: docs-audit exit $AUDIT_EXIT (continuing reports)" | tee -a "$REPORT_DIR/cms-sequential.log"
  fi
else
  echo "SKIP_DOCS_AUDIT=1 — skipping inline docs-audit" | tee -a "$REPORT_DIR/cms-sequential.log"
fi

END_ISO="$(date -Iseconds 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ")"
node -e "
const fs = require('fs');
const p = process.env.REPORT_DIR + '/run-meta.json';
const j = JSON.parse(fs.readFileSync(p, 'utf-8'));
j.finishedAt = '$END_ISO';
j.sequentialExit = $TOTAL_EXIT;
j.docsAuditExitCode = $AUDIT_EXIT;
fs.writeFileSync(p, JSON.stringify(j, null, 2));
" || true

npx ts-node "$ROOT/scripts/generateCmsExcelReport.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$REPORT_DIR/cms-sequential.log" || true
npx ts-node "$ROOT/scripts/generateCmsDashboardHtml.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$REPORT_DIR/cms-sequential.log" || true
npx ts-node "$ROOT/scripts/generateDashboardReport.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$REPORT_DIR/cms-sequential.log" || true
npx ts-node "$ROOT/scripts/buildCmsReportBundle.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$REPORT_DIR/cms-sequential.log" || true
npx ts-node "$ROOT/scripts/generateUnifiedReport.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$REPORT_DIR/cms-sequential.log" || true

echo "$REPORT_DIR" > "$ROOT/reports/latest-cms-batch-dir.txt"

echo "" | tee -a "$REPORT_DIR/cms-sequential.log"
echo "=== CMS sequential batch complete ===" | tee -a "$REPORT_DIR/cms-sequential.log"
echo "REPORT_DIR=$REPORT_DIR" | tee -a "$REPORT_DIR/cms-sequential.log"
echo "Unified dashboard: file://$REPORT_DIR/unified-dashboard.html" | tee -a "$REPORT_DIR/cms-sequential.log"
echo "CMS dashboard: file://$REPORT_DIR/cms-dashboard.html" | tee -a "$REPORT_DIR/cms-sequential.log"
echo "Bundle: file://$REPORT_DIR/report-bundle/index.html" | tee -a "$REPORT_DIR/cms-sequential.log"

if [[ "${SKIP_SLACK:-0}" != "1" ]]; then
  npx ts-node "$ROOT/scripts/urlRunSummaryAndSlack.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$REPORT_DIR/cms-sequential.log" || true
else
  echo "SKIP_SLACK=1 — not posting to Slack" | tee -a "$REPORT_DIR/cms-sequential.log"
fi

if [[ "${SKIP_OPEN_DASHBOARD:-0}" != "1" ]]; then
  if [[ -f "$REPORT_DIR/unified-dashboard.html" ]]; then
    open "$REPORT_DIR/unified-dashboard.html" 2>/dev/null || true
    echo "Opened: file://$REPORT_DIR/unified-dashboard.html" | tee -a "$REPORT_DIR/cms-sequential.log"
  fi
  if [[ -f "$REPORT_DIR/report-bundle/index.html" ]]; then
    open "$REPORT_DIR/report-bundle/index.html" 2>/dev/null || true
    echo "Opened: file://$REPORT_DIR/report-bundle/index.html" | tee -a "$REPORT_DIR/cms-sequential.log"
  fi
fi

exit "$TOTAL_EXIT"
