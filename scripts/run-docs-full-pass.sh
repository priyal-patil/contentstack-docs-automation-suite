#!/usr/bin/env bash
# Full docs QA pass: BOTH halves of a doc in one run, into one report directory.
#
#   A. the documented steps executed against the live app   (tests/flows.spec.ts, --project=flows)
#   B. the Doc Testing Checklist + Style Guide audit of the published page
#      (tests/docs-checklist.spec.ts, --project=docs-checklist)
#
# then one combined HTML report per doc plus an index.
#
# Usage:
#   ./scripts/run-docs-full-pass.sh "Project=Administration Module=organizations"
#   ./scripts/run-docs-full-pass.sh "organization-information"
#
# Env:
#   REPORT_DIR          output dir (default: reports/full-pass-<timestamp>)
#   PLAYWRIGHT_HEADLESS 1 (default here) — the pass is meant to be unattended
#   PW_WORKERS          default 1
#   SKIP_FLOWS=1        audit-only pass (B) over the URLs already in ran-flows.json
#   SKIP_CHECKLIST=1    steps-only pass (A), for debugging
#
# Findings from half B never fail the pass (DOCS-AUTOMATION-COMMON.md rule 5):
# a capitalisation nit must not turn a batch red. The exit code reflects half A only.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

GREP="${1:?Usage: $0 \"<playwright -g pattern>\"  e.g. \"Project=Administration Module=organizations\"}"
TS="$(date +%Y%m%d-%H%M%S)"
REPORT_DIR="${REPORT_DIR:-$ROOT/reports/full-pass-${TS}}"
mkdir -p "$REPORT_DIR"
LOG="$REPORT_DIR/full-pass.log"

export REPORT_DIR
export PLAYWRIGHT_HEADLESS="${PLAYWRIGHT_HEADLESS:-1}"
export PW_WORKERS="${PW_WORKERS:-1}"
export OPEN_FLOW_REPORT=false

{
  echo "=== docs full pass ==="
  echo "grep       = $GREP"
  echo "REPORT_DIR = $REPORT_DIR"
  echo "headless   = $PLAYWRIGHT_HEADLESS"
  date -Iseconds 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ"
} | tee -a "$LOG"

FLOW_EXIT=0

# ---------- A. documented steps in the app ----------
if [[ "${SKIP_FLOWS:-0}" != "1" ]]; then
  echo "--- A. steps (flows) ---" | tee -a "$LOG"
  npx playwright test tests/flows.spec.ts --project=flows -g "$GREP" 2>&1 | tee -a "$LOG"
  FLOW_EXIT="${PIPESTATUS[0]}"
  echo "flows exit=$FLOW_EXIT" | tee -a "$LOG"
else
  # Audit-only pass: build the manifest from the flow files so half B still runs over the
  # right pages. Entries carry stepsExecuted:false, so nothing claims the steps passed.
  echo "--- A. steps SKIPPED (SKIP_FLOWS=1) ---" | tee -a "$LOG"
  npx ts-node scripts/buildRanFlowsManifest.ts "$GREP" 2>&1 | tee -a "$LOG"
fi

MANIFEST="$REPORT_DIR/ran-flows.json"
if [[ ! -f "$MANIFEST" ]]; then
  echo "No $MANIFEST — no flow matched \"$GREP\", so there is nothing to audit." | tee -a "$LOG"
  exit "$FLOW_EXIT"
fi

# ---------- B. checklist + style guide audit of the same pages ----------
# Dedupe by URL: multi-part flows share one `source`, and the page audit is expensive.
URLS="$(node -e '
const m = require(process.argv[1]);
const seen = new Set();
for (const f of m.flows || []) { const u = f.docUrl.replace(/\/$/, ""); if (u) seen.add(u); }
process.stdout.write([...seen].join(","));
' "$MANIFEST")"

if [[ -z "$URLS" ]]; then
  echo "Manifest has no doc URLs — skipping the page audit." | tee -a "$LOG"
elif [[ "${SKIP_CHECKLIST:-0}" == "1" ]]; then
  echo "SKIP_CHECKLIST=1 — page audit skipped." | tee -a "$LOG"
else
  echo "--- B. page audit (checklist + style guide) ---" | tee -a "$LOG"
  echo "urls: $URLS" | tee -a "$LOG"
  # SKIP_LOGIN=1: the page audit is anonymous. Never spend a login attempt on it.
  SKIP_LOGIN=1 DOCS_CHECKLIST_URL="$URLS" \
    npx playwright test tests/docs-checklist.spec.ts --project=docs-checklist 2>&1 | tee -a "$LOG"
  echo "checklist exit=${PIPESTATUS[0]} (findings never fail the pass)" | tee -a "$LOG"
fi

# ---------- combined report per doc + index ----------
echo "--- combined reports ---" | tee -a "$LOG"
while IFS=$'\t' read -r FLOW_ID DOC_URL; do
  [[ -z "$FLOW_ID" ]] && continue
  npx ts-node scripts/generateCombinedDocReport.ts "$FLOW_ID" "$DOC_URL" 2>&1 | tee -a "$LOG"
done < <(node -e '
const m = require(process.argv[1]);
for (const f of m.flows || []) console.log(`${f.flowId}\t${f.docUrl}`);
' "$MANIFEST")

npx ts-node scripts/generateFullPassIndex.ts 2>&1 | tee -a "$LOG"

echo "" | tee -a "$LOG"
echo "Report dir: $REPORT_DIR" | tee -a "$LOG"
echo "Index:      file://$REPORT_DIR/full-pass-index.html" | tee -a "$LOG"
exit "$FLOW_EXIT"
