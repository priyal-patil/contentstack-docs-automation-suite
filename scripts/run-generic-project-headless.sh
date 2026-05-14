#!/usr/bin/env bash
# Headless Playwright for a single project (Launch, Personalize, Data-and-Insights, …), then dashboards + Slack + open unified HTML.
# Docs-audit runs in the background by default (DOCS_AUDIT_BACKGROUND=1) in a separate REPORT_DIR.
#
# Usage:
#   ./scripts/run-generic-project-headless.sh Launch
#   ./scripts/run-generic-project-headless.sh Personalize
#   ./scripts/run-generic-project-headless.sh Data-and-Insights
#
# Env: REPORT_DIR, SKIP_SLACK=1, SKIP_OPEN_DASHBOARD=1, PW_WORKERS

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT="${1:?Usage: $0 <Project> (directory must exist under projects/)}"
PROJECT_DIR="$ROOT/projects/$PROJECT"
if [[ ! -d "$PROJECT_DIR" ]]; then
  echo "Unknown project: $PROJECT — expected directory $PROJECT_DIR (CMS uses run-cms-sequential-modules-dashboard.sh)." >&2
  exit 1
fi

TS="$(date +%Y%m%d-%H%M%S)"
SAFE="$(echo "$PROJECT" | tr '[:upper:]' '[:lower:]')"
export REPORT_DIR="${REPORT_DIR:-$ROOT/reports/${SAFE}-batch-$TS}"
mkdir -p "$REPORT_DIR"

START_ISO="$(date -Iseconds 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "{\"startedAt\":\"$START_ISO\",\"reportDir\":\"$REPORT_DIR\",\"mode\":\"project-headless\",\"project\":\"$PROJECT\"}" > "$REPORT_DIR/run-meta.json"

export PLAYWRIGHT_HEADLESS=1
export OPEN_FLOW_REPORT="${OPEN_FLOW_REPORT:-false}"
export PW_WORKERS="${PW_WORKERS:-6}"
# Full-project runs need more than the 3m local default per flow (see playwright.config.ts)
export PW_FLOW_MAX_MINUTES="${PW_FLOW_MAX_MINUTES:-15}"

: > "$REPORT_DIR/playwright.log"
echo "=== Project=$PROJECT headless → $REPORT_DIR ===" | tee -a "$REPORT_DIR/playwright.log"

DOCS_AUDIT_BACKGROUND="${DOCS_AUDIT_BACKGROUND:-1}"
if [[ "$DOCS_AUDIT_BACKGROUND" == "1" ]]; then
  echo "Starting background docs-audit for $PROJECT (separate REPORT_DIR)…" | tee -a "$REPORT_DIR/playwright.log"
  npx ts-node "$ROOT/scripts/syncDocsUrlsToCsv.ts" >>"$REPORT_DIR/docs-audit-background.log" 2>&1 || true
  nohup bash "$ROOT/scripts/run-docs-audit-background.sh" "$PROJECT" "$REPORT_DIR" >>"$REPORT_DIR/docs-audit-background.log" 2>&1 &
  echo $! >"$REPORT_DIR/docs-audit-background.pid"
  echo "docs-audit background PID $(cat "$REPORT_DIR/docs-audit-background.pid")" | tee -a "$REPORT_DIR/playwright.log"
fi

set +e
npx playwright test tests/flows.spec.ts --project=flows -g "Project=$PROJECT" 2>&1 | tee -a "$REPORT_DIR/playwright.log"
PW_EXIT=${PIPESTATUS[0]}
set -e

END_ISO="$(date -Iseconds 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ")"
REPORT_DIR="$REPORT_DIR" PW_EXIT="$PW_EXIT" node -e '
  const fs = require("fs");
  const p = process.env.REPORT_DIR + "/run-meta.json";
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  j.finishedAt = new Date().toISOString();
  j.playwrightExit = Number(process.env.PW_EXIT);
  fs.writeFileSync(p, JSON.stringify(j, null, 2));
' || true

npx ts-node "$ROOT/scripts/generateDashboardReport.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$REPORT_DIR/playwright.log" || true
npx ts-node "$ROOT/scripts/generateUnifiedReport.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$REPORT_DIR/playwright.log" || true

echo "$REPORT_DIR" > "$ROOT/reports/latest-${SAFE}-batch-dir.txt"

if [[ "${SKIP_SLACK:-0}" != "1" ]]; then
  npx ts-node "$ROOT/scripts/urlRunSummaryAndSlack.ts" --reportDir "$REPORT_DIR" 2>&1 | tee -a "$REPORT_DIR/playwright.log" || true
else
  echo "SKIP_SLACK=1 — not posting to Slack" | tee -a "$REPORT_DIR/playwright.log"
fi

if [[ "${SKIP_OPEN_DASHBOARD:-0}" != "1" ]]; then
  if [[ -f "$REPORT_DIR/unified-dashboard.html" ]]; then
    open "$REPORT_DIR/unified-dashboard.html" 2>/dev/null || true
    echo "Opened: file://$REPORT_DIR/unified-dashboard.html" | tee -a "$REPORT_DIR/playwright.log"
  fi
fi

echo "=== Done (playwright exit $PW_EXIT) ===" | tee -a "$REPORT_DIR/playwright.log"
exit "$PW_EXIT"
