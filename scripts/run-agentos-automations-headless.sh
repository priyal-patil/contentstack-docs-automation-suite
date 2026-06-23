#!/usr/bin/env bash
# Run AgentOS automations module flows in headless mode.
# Each URL runs serially; report opens after each. Retries 3 times before failing a URL.
# On failure, executor saves DOM to data/dom/AgentOS/automations/; next retry searches it.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPORT_DIR="${REPORT_DIR:-$ROOT/reports/latest}"
mkdir -p "$REPORT_DIR"

AUTOMATIONS_FLOWS=(
  "automation-sharing"
  "clone-an-automation"
  "executing-an-automation"
  "export-and-import-an-automation"
  "get-started-with-automations"
  "managing-automations"
  "managing-triggers"
  "on-demand-automation-app"
  "using-conditional-paths-to-customize-automations"
)

PASS=0
FAIL=0

run_flow() {
  local FLOW_ID="$1"
  echo ""
  echo "══════════════════════════════════════════"
  echo "▶ Flow: $FLOW_ID"
  echo "══════════════════════════════════════════"

  # OPEN_FLOW_REPORT=false suppresses the global afterAll open; we open per-URL below.
  OPEN_FLOW_REPORT=false \
  REPORT_DIR="$REPORT_DIR" \
  PW_RETRIES=3 \
    npx playwright test tests/flows.spec.ts \
      --project=flows \
      --grep="${FLOW_ID}$" \
      --reporter=line \
    && PASS=$((PASS + 1)) || {
      echo "⚠  Flow failed after all retries: $FLOW_ID — moving to next URL"
      FAIL=$((FAIL + 1))
    }

  REPORT_FILE="$REPORT_DIR/${FLOW_ID}-report.html"
  if [ -f "$REPORT_FILE" ]; then
    echo "📄 Opening report: file://$REPORT_FILE"
    open "$REPORT_FILE" 2>/dev/null || true
  else
    echo "ℹ  No HTML report found for $FLOW_ID (check $REPORT_DIR)"
  fi
}

echo "╔══════════════════════════════════════════╗"
echo "║  AgentOS: automations module             ║"
echo "╚══════════════════════════════════════════╝"
for FLOW_ID in "${AUTOMATIONS_FLOWS[@]}"; do
  run_flow "$FLOW_ID"
done

echo ""
echo "══════════════════════════════════════════"
echo "✅ Passed: $PASS   ❌ Failed: $FAIL"
echo "══════════════════════════════════════════"
