#!/usr/bin/env bash
# Rerun flows that were timedOut in a prior url-run-summary.json (headless), then post cumulative Slack counts.
#
# Usage:
#   ./scripts/rerun-cms-timed-out-from-summary.sh reports/cms-seq-20260413-185351/url-run-summary.json
#
# Env: SKIP_SLACK=1, PW_WORKERS (default 6), BASELINE can be overridden as first arg

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BASELINE="${1:-reports/cms-seq-20260413-185351/url-run-summary.json}"
if [[ "$BASELINE" = /* ]]; then SUMMARY_PATH="$BASELINE"; else SUMMARY_PATH="$ROOT/$BASELINE"; fi
if [[ ! -f "$SUMMARY_PATH" ]]; then
  echo "Baseline not found: $SUMMARY_PATH" >&2
  exit 1
fi

TS="$(date +%Y%m%d-%H%M%S)"
export REPORT_DIR="${REPORT_DIR:-$ROOT/reports/cms-retry-timedout-$TS}"
mkdir -p "$REPORT_DIR"

GREP="$(SUMMARY_PATH="$SUMMARY_PATH" node -e '
  const fs = require("fs");
  const p = process.env.SUMMARY_PATH;
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  const ids = j.flows.filter((f) => f.status === "timedOut").map((f) => f.flowId);
  if (!ids.length) {
    console.error("No timedOut flows in", p);
    process.exit(1);
  }
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  console.log(ids.map(esc).join("|"));
')"

export PLAYWRIGHT_HEADLESS=1
export OPEN_FLOW_REPORT="${OPEN_FLOW_REPORT:-false}"
export PW_WORKERS="${PW_WORKERS:-6}"

echo "{\"startedAt\":\"$(date -Iseconds 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ")\",\"reportDir\":\"$REPORT_DIR\",\"mode\":\"cms-retry-timedout\",\"baseline\":\"$SUMMARY_PATH\"}" > "$REPORT_DIR/run-meta.json"

echo "=== Rerun timedOut flows → $REPORT_DIR (baseline: $SUMMARY_PATH) ===" | tee "$REPORT_DIR/retry.log"
set +e
npx playwright test tests/flows.spec.ts --project=default -g "$GREP" 2>&1 | tee -a "$REPORT_DIR/retry.log"
PW_EXIT=${PIPESTATUS[0]}
set -e

if [[ -f "$REPORT_DIR/flows-results.json" ]]; then
  cp "$REPORT_DIR/flows-results.json" "$REPORT_DIR/flows-results-cms.json"
fi

REPORT_DIR="$REPORT_DIR" PW_EXIT="$PW_EXIT" node -e '
 const fs = require("fs");
  const p = process.env.REPORT_DIR + "/run-meta.json";
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  j.finishedAt = new Date().toISOString();
  j.playwrightExit = Number(process.env.PW_EXIT);
  fs.writeFileSync(p, JSON.stringify(j, null, 2));
' || true

REL_BASELINE="${BASELINE}"
if [[ "$SUMMARY_PATH" = "$ROOT"/* ]]; then REL_BASELINE="${SUMMARY_PATH#$ROOT/}"; fi

if [[ "${SKIP_SLACK:-0}" != "1" ]]; then
  npx ts-node "$ROOT/scripts/urlRunSummaryAndSlack.ts" \
    --reportDir "$REPORT_DIR" \
    --mergeBaselineUrlRunSummary "$REL_BASELINE" 2>&1 | tee -a "$REPORT_DIR/retry.log" || true
else
  echo "SKIP_SLACK=1 — run manually: npx ts-node scripts/urlRunSummaryAndSlack.ts --reportDir \"$REPORT_DIR\" --mergeBaselineUrlRunSummary \"$REL_BASELINE\"" | tee -a "$REPORT_DIR/retry.log"
fi

echo "" | tee -a "$REPORT_DIR/retry.log"
echo ">>> Dashboard / unified report (retry dir)" | tee -a "$REPORT_DIR/retry.log"
npx ts-node "$ROOT/scripts/generateCmsExcelReport.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$REPORT_DIR/retry.log" || true
npx ts-node "$ROOT/scripts/generateCmsDashboardHtml.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$REPORT_DIR/retry.log" || true
npx ts-node "$ROOT/scripts/generateDashboardReport.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$REPORT_DIR/retry.log" || true
npx ts-node "$ROOT/scripts/buildCmsReportBundle.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$REPORT_DIR/retry.log" || true
npx ts-node "$ROOT/scripts/generateUnifiedReport.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$REPORT_DIR/retry.log" || true

if [[ "${SKIP_OPEN_DASHBOARD:-0}" != "1" ]]; then
  UNIFIED="$REPORT_DIR/unified-dashboard.html"
  if [[ -f "$UNIFIED" ]]; then
    open "$UNIFIED" 2>/dev/null || true
    echo "Opened: file://$UNIFIED" | tee -a "$REPORT_DIR/retry.log"
  else
    echo "WARNING: unified-dashboard.html missing — check generateUnifiedReport output" | tee -a "$REPORT_DIR/retry.log"
  fi
fi

echo "$REPORT_DIR" > "$ROOT/reports/latest-cms-retry-dir.txt"
echo "=== Done (playwright exit $PW_EXIT) ===" | tee -a "$REPORT_DIR/retry.log"
exit "$PW_EXIT"
