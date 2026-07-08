#!/usr/bin/env bash
# Run ALL AgentOS flows (agent-os, agents, automations, polaris, get-started) in headless mode.
# On failure, DOM is auto-saved to data/dom/AgentOS/<module>/ by the executor.
# Retries 4 times before marking a URL failed.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPORT_DIR="${REPORT_DIR:-$ROOT/reports/latest}"
mkdir -p "$REPORT_DIR"

PASS=0
FAIL=0
SKIP=0
FAILED_FLOWS=()

run_flow() {
  local FLOW_ID="$1"
  local MODULE="$2"

  echo ""
  echo "══════════════════════════════════════════════════════════"
  echo "▶ [$MODULE] $FLOW_ID"
  echo "══════════════════════════════════════════════════════════"

  OPEN_FLOW_REPORT=false \
  REPORT_DIR="$REPORT_DIR" \
  PW_RETRIES=4 \
    npx playwright test tests/flows.spec.ts \
      --project=flows \
      --grep="${FLOW_ID}$" \
      --reporter=line \
    && PASS=$((PASS + 1)) || {
      echo "⚠  Flow failed after all retries: [$MODULE] $FLOW_ID"
      FAIL=$((FAIL + 1))
      FAILED_FLOWS+=("[$MODULE] $FLOW_ID")
    }

  REPORT_FILE="$REPORT_DIR/${FLOW_ID}-report.html"
  if [ -f "$REPORT_FILE" ]; then
    echo "📄 Report: file://$REPORT_FILE"
    open "$REPORT_FILE" 2>/dev/null || true
  fi
}

# ── get-started (informational — registered in docs-urls.csv, no steps to run) ──
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  AgentOS: get-started (informational flows)              ║"
echo "╚══════════════════════════════════════════════════════════╝"
GET_STARTED_FLOWS=(
  "agent-os-and-its-components-agents-and-automations"
  "agent-os-architecture"
  "agent-os-usage-limits"
  "components-of-an-agent"
  "difference-between-agents-and-automations"
  "supported-capabilities-of-agent-os"
  "what-is-an-agent"
  "what-is-contentstack-agent-os"
)
for FLOW_ID in "${GET_STARTED_FLOWS[@]}"; do
  run_flow "$FLOW_ID" "get-started"
done

# ── agent-os ─────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  AgentOS: agent-os module                                ║"
echo "╚══════════════════════════════════════════════════════════╝"
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
for FLOW_ID in "${AGENT_OS_FLOWS[@]}"; do
  run_flow "$FLOW_ID" "agent-os"
done

# ── agents ────────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  AgentOS: agents module                                  ║"
echo "╚══════════════════════════════════════════════════════════╝"
AGENTS_FLOWS=(
  "create-an-agent"
  "edit-an-agent"
  "delete-an-agent"
)
for FLOW_ID in "${AGENTS_FLOWS[@]}"; do
  run_flow "$FLOW_ID" "agents"
done

# ── polaris ───────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  AgentOS: polaris module                                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
POLARIS_FLOWS=(
  "get-started-with-polaris"
)
for FLOW_ID in "${POLARIS_FLOWS[@]}"; do
  run_flow "$FLOW_ID" "polaris"
done

# ── automations ───────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  AgentOS: automations module                             ║"
echo "╚══════════════════════════════════════════════════════════╝"
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
  "using-repeat-paths-to-automate-repetitive-tasks"
  "add-new-entries-to-algolia-s-search-index"
  "backup-entries-or-assets-to-aws-s3"
  "chatgpt-use-cases"
  "create-an-algolia-object-using-entry-uid"
  "send-newly-transformed-data-via-email"
  "translate-data-using-smartling"
  "automating-asset-management-with-contentstack-automate"
)
for FLOW_ID in "${AUTOMATIONS_FLOWS[@]}"; do
  run_flow "$FLOW_ID" "automations"
done

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════════"
echo "  FINAL SUMMARY"
echo "  Passed : $PASS"
echo "  Failed : $FAIL"
echo "══════════════════════════════════════════════════════════"
if [ ${#FAILED_FLOWS[@]} -gt 0 ]; then
  echo "  Failed flows:"
  for f in "${FAILED_FLOWS[@]}"; do
    echo "    - $f"
  done
fi
echo "══════════════════════════════════════════════════════════"
