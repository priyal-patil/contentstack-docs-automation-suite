#!/usr/bin/env bash
# CMS: run modules sequentially (main flows only, CRUD order within module via CMS_SEQUENTIAL_MODULE_ORDER=1),
# then publish-rules + roles serial chains, then optional retry of failed/timedOut/interrupted (before delete batch),
# then all delete-related flows, then trash, merge Playwright JSON, docs-audit, dashboards, bundle, Slack.
#
# Canonical policy: .cursor/rules/cms-execution-order.mdc
#
# Usage:
#   ./scripts/run-cms-sequential-modules-dashboard.sh
#   REPORT_DIR=reports/my-batch SKIP_SLACK=1 ./scripts/run-cms-sequential-modules-dashboard.sh
#   SKIP_OPEN_DASHBOARD=1 — same as OPEN_CMS_DASHBOARD=0 (used by run-project-batch-background.sh)
#   SKIP_RETRY=1 — do not re-run failed/timed-out tests after the first merge
#   SKIP_CMS_DOCS_SPEC=1 — skip tests/docs.spec.ts (flows/CMS/docs.json HTTP checks) after trash
#   DOCS_AUDIT_BACKGROUND=0 — run docs-audit inline in REPORT_DIR after merge (default: 1 = background)
# Background:
#   nohup ./scripts/run-cms-sequential-modules-dashboard.sh > reports/cms-seq-nohup.log 2>&1 &

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TS="$(date +%Y%m%d-%H%M%S)"
export REPORT_DIR="${REPORT_DIR:-$ROOT/reports/cms-seq-$TS}"
PARTS_DIR="$REPORT_DIR/playwright-parts"
mkdir -p "$REPORT_DIR" "$PARTS_DIR"

START_EPOCH="$(date +%s)"
START_ISO="$(date -Iseconds 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "{\"startedAt\":\"$START_ISO\",\"reportDir\":\"$REPORT_DIR\",\"mode\":\"cms-sequential-modules\"}" > "$REPORT_DIR/run-meta.json"

export OPEN_FLOW_REPORT="${OPEN_FLOW_REPORT:-false}"
export PLAYWRIGHT_HEADLESS=1
export PW_SLOWMO="${PW_SLOWMO:-0}"
export PW_WORKERS="${PW_WORKERS:-6}"
# Local default per-test timeout is 3m (playwright.config.ts); retry pass uses parallel per-flow tests and inherits that unless set.
# CI uses 15m. Align full batch (main, retry, delete, trash) so flows don't spuriously "time out" vs individual runs with a higher budget.
export PW_FLOW_MAX_MINUTES="${PW_FLOW_MAX_MINUTES:-15}"
# Background launcher sets SKIP_OPEN_DASHBOARD=1 to suppress macOS open(); honor it here.
if [[ "${SKIP_OPEN_DASHBOARD:-0}" == "1" ]]; then
  export OPEN_CMS_DASHBOARD=0
fi
# Within each CMS module, run flow tests serially in CRUD order (flows.spec.ts).
export CMS_SEQUENTIAL_MODULE_ORDER=1
# Run every URL in a module after a failure (test.step batching); see tests/flows.spec.ts.
export CMS_CONTINUE_ON_FAIL=1
# Optional: max wall time for that whole module test (default 4h in flows.spec.ts). Raise if large modules still time out.
# export CMS_MODULE_BATCH_TIMEOUT_MS=21600000

# Flow titles (flow id) to defer to the delete batch / exclude from main Stage=main module runs.
CMS_DELETE_FLOW_GREP='delete-a-term|delete-a-taxonomy|delete-a-workflow|delete-an-alias|delete-a-webhook|delete-a-global-field|delete-a-delivery-token|delete-a-management-token|delete-a-release|delete-entries-and-assets-in-bulk|bulk-delete-entries|bulk-delete-assets|bulk-delete-localized-entry-versions|delete-a-folder|delete-an-asset|delete-an-entry|delete-an-entry-part-2|delete-a-language|delete-an-environment|delete-a-branch|delete-content-type|delete-a-stack|edit-or-delete-a-comment'

# Cross-module order (directories under projects/CMS/). Missing dirs are skipped.
# "labels": no CMS module folder yet — add to this list when it exists.
CMS_MAIN_MODULES=(
  environment
  language
  branches
  stack
  content-models
  releases
  global-field
  assets
  entries
  labels
  json-rich-text-editor
  users-and-roles
  live-preview
  content-modeling
  search
  security
  tokens
  webhook
  workflows
  taxonomy
  visual-experience
)

TOTAL_EXIT=0
run_playwright_part() {
  local label="$1"
  shift
  set +e
  npx playwright test tests/flows.spec.ts --project=flows "$@" 2>&1 | tee -a "$REPORT_DIR/cms-sequential.log"
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

merge_playwright_parts() {
  shopt -s nullglob
  local PART_FILES=("$PARTS_DIR"/*.json)
  shopt -u nullglob
  if [[ ${#PART_FILES[@]} -eq 0 ]]; then
    echo "No part files to merge." | tee -a "$REPORT_DIR/cms-sequential.log"
    return 0
  fi
  npx ts-node "$ROOT/scripts/mergePlaywrightFlowJsonReports.ts" --out "$REPORT_DIR/flows-results.json" "${PART_FILES[@]}"
}

: > "$REPORT_DIR/cms-sequential.log"
echo "=== CMS sequential modules → $REPORT_DIR ===" | tee -a "$REPORT_DIR/cms-sequential.log"
# Refresh CMS URL list: every *.flow.json source + flows/CMS/docs.json (executable + informational) → data/cms-urls.csv
npx ts-node "$ROOT/scripts/buildCmsUrlsCsv.ts" 2>&1 | tee -a "$REPORT_DIR/cms-sequential.log" || true
export DOCS_URLS_CSV="$ROOT/data/cms-urls.csv"
if [[ ! -f "$ROOT/auth.json" ]]; then
  echo "WARNING: auth.json not found — global-setup will run; headless batch needs CS_EMAIL/CS_PASSWORD (e.g. in .env)." | tee -a "$REPORT_DIR/cms-sequential.log"
fi

DOCS_AUDIT_BACKGROUND="${DOCS_AUDIT_BACKGROUND:-1}"
if [[ "${SKIP_DOCS_AUDIT:-0}" == "1" ]]; then
  echo "SKIP_DOCS_AUDIT=1 — not starting background docs-audit" | tee -a "$REPORT_DIR/cms-sequential.log"
elif [[ "$DOCS_AUDIT_BACKGROUND" == "1" ]]; then
  echo "Starting background docs-audit for CMS (DOCS_URLS_CSV=$DOCS_URLS_CSV)…" | tee -a "$REPORT_DIR/cms-sequential.log"
  npx ts-node "$ROOT/scripts/syncDocsUrlsToCsv.ts" >>"$REPORT_DIR/docs-audit-background.log" 2>&1 || true
  nohup env DOCS_URLS_CSV="$DOCS_URLS_CSV" bash "$ROOT/scripts/run-docs-audit-background.sh" CMS "$REPORT_DIR" >>"$REPORT_DIR/docs-audit-background.log" 2>&1 &
  echo $! >"$REPORT_DIR/docs-audit-background.pid"
  echo "docs-audit background PID $(cat "$REPORT_DIR/docs-audit-background.pid") — log: $REPORT_DIR/docs-audit-background.log" | tee -a "$REPORT_DIR/cms-sequential.log"
fi

n=0
for mod in "${CMS_MAIN_MODULES[@]}"; do
  if [[ ! -d "$ROOT/projects/CMS/$mod" ]]; then
    echo "(skip) No projects/CMS/$mod — not in repo" | tee -a "$REPORT_DIR/cms-sequential.log"
    continue
  fi
  n=$((n + 1))
  printf -v ord "%02d" "$n"
  echo "" | tee -a "$REPORT_DIR/cms-sequential.log"
  echo ">>> [$ord] Project=CMS Module=$mod Stage=main (excluding delete flows)" | tee -a "$REPORT_DIR/cms-sequential.log"
  run_playwright_part "${ord}-module-${mod}" \
    -g "Project=CMS Module=${mod} Stage=main" \
    --grep-invert "$CMS_DELETE_FLOW_GREP"

  if [[ "$mod" == "workflows" ]]; then
    echo "" | tee -a "$REPORT_DIR/cms-sequential.log"
    echo ">>> Publish rules chain (serial, after workflows module)" | tee -a "$REPORT_DIR/cms-sequential.log"
    run_playwright_part "86-publish-rules-chain" -g 'publish rules chain \(serial\)'
  fi

  if [[ "$mod" == "users-and-roles" ]]; then
    echo "" | tee -a "$REPORT_DIR/cms-sequential.log"
    echo ">>> Role lifecycle chain (serial, after users-and-roles module)" | tee -a "$REPORT_DIR/cms-sequential.log"
    run_playwright_part "87-roles-chain" -g 'role lifecycle chain \(serial\)'
  fi
done

# Retry failed / timed-out / interrupted URLs from main + chain parts only — before any delete batch.
# Batched module runs use one Playwright test per module; retry targets flow ids via env from collectRetryFlowTitlesFromJson --exportShell
# (Playwright --grep cannot match per-URL test.step titles). Optional PLAYWRIGHT_RETRY_GREP for title-based cases.
if [[ "${SKIP_RETRY:-0}" != "1" ]]; then
  RETRY_ENV="$(npx ts-node "$ROOT/scripts/collectRetryFlowTitlesFromJson.ts" --partsDir "$PARTS_DIR" --exportShell 2>/dev/null || true)"
  if [[ -n "$RETRY_ENV" ]]; then
    echo "" | tee -a "$REPORT_DIR/cms-sequential.log"
    echo ">>> Retry pass (failed / timedOut / interrupted) — before delete batch" | tee -a "$REPORT_DIR/cms-sequential.log"
    # shellcheck disable=SC2090
    eval "$RETRY_ENV"
    export CMS_SEQUENTIAL_MODULE_ORDER=0
    # macOS bash + set -u: "${arr[@]}" on an empty array errors; branch instead.
    if [[ -n "${PLAYWRIGHT_RETRY_GREP:-}" ]]; then
      run_playwright_part "89-retry-before-delete" -g "$PLAYWRIGHT_RETRY_GREP"
    else
      run_playwright_part "89-retry-before-delete"
    fi
    unset CMS_RETRY_FLOW_IDS CMS_RETRY_PUBLISH_CHAIN CMS_RETRY_ROLES_CHAIN PLAYWRIGHT_RETRY_GREP
    export CMS_SEQUENTIAL_MODULE_ORDER=1
  fi
fi

echo "" | tee -a "$REPORT_DIR/cms-sequential.log"
echo ">>> Delete-related flows (all CMS modules, batched)" | tee -a "$REPORT_DIR/cms-sequential.log"
# Many delete buckets (per module/stage) match this grep; force one worker so buckets are not starved / skipped under load.
_OLD_PW_WORKERS="${PW_WORKERS:-6}"
export PW_WORKERS=1
run_playwright_part "90-delete-batch" \
  -g "Project=CMS" \
  --grep "$CMS_DELETE_FLOW_GREP"
export PW_WORKERS="$_OLD_PW_WORKERS"
unset _OLD_PW_WORKERS

echo "" | tee -a "$REPORT_DIR/cms-sequential.log"
echo ">>> Trash module" | tee -a "$REPORT_DIR/cms-sequential.log"
run_playwright_part "99-trash" \
  -g "Project=CMS Module=trash Stage=main"

# HTTP smoke for informational URLs listed in flows/CMS/docs.json (not *.flow.json).
if [[ "${SKIP_CMS_DOCS_SPEC:-0}" != "1" ]]; then
  echo "" | tee -a "$REPORT_DIR/cms-sequential.log"
  echo ">>> CMS doc-only HTTP checks (flows/CMS/docs.json) — tests/docs.spec.ts" | tee -a "$REPORT_DIR/cms-sequential.log"
  set +e
  REPORT_DIR="$REPORT_DIR" npx playwright test tests/docs.spec.ts --project=default --grep "Docs Project=CMS" 2>&1 | tee -a "$REPORT_DIR/cms-sequential.log"
  DOCS_SPEC_EX=${PIPESTATUS[0]}
  set -e
  if [[ "$DOCS_SPEC_EX" -ne 0 ]]; then
    echo "WARNING: docs.spec (CMS doc-only) exit $DOCS_SPEC_EX (continuing merge)" | tee -a "$REPORT_DIR/cms-sequential.log"
    TOTAL_EXIT=1
  fi
fi

echo "" | tee -a "$REPORT_DIR/cms-sequential.log"
echo ">>> Merging Playwright JSON parts" | tee -a "$REPORT_DIR/cms-sequential.log"
merge_playwright_parts || echo "WARNING: merge_playwright_parts failed (continuing to reports/Slack)" | tee -a "$REPORT_DIR/cms-sequential.log"

if [[ -f "$REPORT_DIR/flows-results.json" ]]; then
  cp "$REPORT_DIR/flows-results.json" "$REPORT_DIR/flows-results-cms.json"
fi

AUDIT_EXIT=0
if [[ "$DOCS_AUDIT_BACKGROUND" == "1" ]]; then
  echo "DOCS_AUDIT_BACKGROUND=1 — inline docs-audit skipped" | tee -a "$REPORT_DIR/cms-sequential.log"
elif [[ "${SKIP_DOCS_AUDIT:-0}" != "1" ]]; then
  npx ts-node "$ROOT/scripts/syncDocsUrlsToCsv.ts" 2>&1 | tee -a "$REPORT_DIR/cms-sequential.log" || true
  export DOCS_URLS_CSV="${DOCS_URLS_CSV:-$ROOT/data/cms-urls.csv}"
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

END_EPOCH="$(date +%s)"
DUR=$((END_EPOCH - START_EPOCH))
END_ISO="$(date -Iseconds 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ")"
node -e "
const fs = require('fs');
const p = process.env.REPORT_DIR + '/run-meta.json';
const j = JSON.parse(fs.readFileSync(p, 'utf-8'));
j.finishedAt = '$END_ISO';
j.durationSeconds = $DUR;
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
echo "durationSeconds=$DUR" | tee -a "$REPORT_DIR/cms-sequential.log"
echo "Bundle: file://$REPORT_DIR/report-bundle/index.html" | tee -a "$REPORT_DIR/cms-sequential.log"

if [[ "${SKIP_SLACK:-0}" != "1" ]]; then
  npx ts-node "$ROOT/scripts/urlRunSummaryAndSlack.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$REPORT_DIR/cms-sequential.log" || true
else
  echo "SKIP_SLACK=1 — not posting to Slack" | tee -a "$REPORT_DIR/cms-sequential.log"
fi

if [[ "${OPEN_CMS_DASHBOARD:-1}" != "0" ]] && command -v open >/dev/null 2>&1; then
  if [[ -f "$REPORT_DIR/report-bundle/index.html" ]]; then
    open "$REPORT_DIR/report-bundle/index.html" || true
  elif [[ -f "$REPORT_DIR/cms-dashboard.html" ]]; then
    open "$REPORT_DIR/cms-dashboard.html" || true
  elif [[ -f "$REPORT_DIR/unified-dashboard.html" ]]; then
    open "$REPORT_DIR/unified-dashboard.html" || true
  fi
fi

exit "$TOTAL_EXIT"
