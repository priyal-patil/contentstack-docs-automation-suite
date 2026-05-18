#!/usr/bin/env bash
# Headless Playwright: Developer-Hub → create-apps module only (`projects/Developer-Hub/create-apps`), then dashboards.
#
# Usage (foreground): ./scripts/run-developer-hub-create-apps-headless.sh
# Background example:
#   nohup env SKIP_SLACK=1 SKIP_OPEN_DASHBOARD=1 ./scripts/run-developer-hub-create-apps-headless.sh >> reports/bg-devhub-create-apps.log 2>&1 &
#
# Env: REPORT_DIR, PW_WORKERS, PW_FLOW_MAX_MINUTES, SKIP_SLACK (passed through to Slack step if unset)

set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TS="$(date +%Y%m%d-%H%M%S)"
SAFE="developerhub-create-apps"
export REPORT_DIR="${REPORT_DIR:-$ROOT/reports/devhub-create-apps-$TS}"
mkdir -p "$REPORT_DIR"

export PLAYWRIGHT_HEADLESS="${PLAYWRIGHT_HEADLESS:-1}"
export OPEN_FLOW_REPORT="${OPEN_FLOW_REPORT:-false}"
export PW_WORKERS="${PW_WORKERS:-6}"
export PW_FLOW_MAX_MINUTES="${PW_FLOW_MAX_MINUTES:-60}"

echo "=== Developer-Hub create-apps (headless) → $REPORT_DIR ==="

set +e
npx playwright test tests/flows.spec.ts --project=flows -g "Project=Developer-Hub Module=create-apps Stage=main" 2>&1 | tee -a "$REPORT_DIR/playwright.log"
PW_EXIT=${PIPESTATUS[0]}
set -e

npx ts-node "$ROOT/scripts/generateDashboardReport.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$REPORT_DIR/playwright.log" || true
npx ts-node "$ROOT/scripts/generateUnifiedReport.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$REPORT_DIR/playwright.log" || true

echo "$REPORT_DIR" > "$ROOT/reports/latest-developerhub-create-apps-batch-dir.txt"

if [[ "${SKIP_SLACK:-0}" != "1" ]]; then
  npx ts-node "$ROOT/scripts/urlRunSummaryAndSlack.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$REPORT_DIR/playwright.log" || true
fi

if [[ "${SKIP_OPEN_DASHBOARD:-0}" != "1" ]] && command -v open >/dev/null 2>&1; then
  [[ -f "$REPORT_DIR/unified-dashboard.html" ]] && open "$REPORT_DIR/unified-dashboard.html" || true
fi

echo "=== Done (playwright exit $PW_EXIT) — unified: file://$REPORT_DIR/unified-dashboard.html ==="
exit "$PW_EXIT"
