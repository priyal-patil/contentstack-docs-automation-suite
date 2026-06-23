#!/usr/bin/env bash
# Run AgentOS agent-os and agents module flows in headless mode.
# Each URL runs serially; report opens after each. Retries 3 times before failing a URL.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPORT_DIR="${REPORT_DIR:-$ROOT/reports/latest}"
mkdir -p "$REPORT_DIR"

AGENT_OS_FLOWS=(
  "agent-os-dashboard"
  "error-notification"
  "executions-in-agent-os"
  "managing-projects"
  "managing-projects-2"
  "monitor-agent-os-activities-in-audit-log"
  "project-sharing"
  "view-execution-log-of-agent-os"
)

AGENTS_FLOWS=(
  "create-an-agent"
  "edit-an-agent"
  "delete-an-agent"
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
echo "║  AgentOS: agent-os module                ║"
echo "╚══════════════════════════════════════════╝"
for FLOW_ID in "${AGENT_OS_FLOWS[@]}"; do
  run_flow "$FLOW_ID"
done

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  AgentOS: agents module                  ║"
echo "╚══════════════════════════════════════════╝"
for FLOW_ID in "${AGENTS_FLOWS[@]}"; do
  run_flow "$FLOW_ID"
done

echo ""
echo "══════════════════════════════════════════"
echo "✅ Passed: $PASS   ❌ Failed: $FAIL"
echo "══════════════════════════════════════════"
