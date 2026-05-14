#!/usr/bin/env bash
# Run docs-audit (links, images, tables, logo) in a separate REPORT_DIR so flow runs are never blocked or overwritten.
#
# Usage:
#   ./scripts/run-docs-audit-background.sh CMS [flowReportDir]
#   ./scripts/run-docs-audit-background.sh Launch [flowReportDir]
#   ./scripts/run-docs-audit-background.sh Data-and-Insights [flowReportDir]
#   DOCS_AUDIT_PROJECT=CMS REPORT_DIR=reports/my-audit npx playwright test ...
#
# Env:
#   AUDIT_REPORT_DIR — override output directory (default: reports/docs-audit-<Project>-<timestamp>)
#   DOCS_URLS_CSV — default data/docs-urls.csv; set e.g. data/launch-urls.csv for a project-only CSV

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT="${1:?Usage: $0 CMS|Launch|Personalize|Data-and-Insights [flowReportDir]}"
FLOW_REPORT_DIR="${2:-}"

TS="$(date +%Y%m%d-%H%M%S)"
AUDIT_REPORT_DIR="${AUDIT_REPORT_DIR:-$ROOT/reports/docs-audit-${PROJECT}-${TS}}"
mkdir -p "$AUDIT_REPORT_DIR"
cd "$ROOT"

{
  echo "=== docs-audit (background) project=${PROJECT} ==="
  echo "AUDIT_REPORT_DIR=${AUDIT_REPORT_DIR}"
  date -Iseconds 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ"
} >>"$AUDIT_REPORT_DIR/docs-audit-run.log"

npx ts-node "$ROOT/scripts/syncDocsUrlsToCsv.ts" >>"$AUDIT_REPORT_DIR/docs-audit-run.log" 2>&1 || true

# CMS batch: scope audit to executable + flows/CMS/docs.json URLs unless caller set DOCS_URLS_CSV.
if [[ -n "${DOCS_URLS_CSV:-}" ]]; then
  DOCS_CSV_FOR_AUDIT="$DOCS_URLS_CSV"
elif [[ "$PROJECT" == "CMS" ]]; then
  DOCS_CSV_FOR_AUDIT="$ROOT/data/cms-urls.csv"
else
  DOCS_CSV_FOR_AUDIT="$ROOT/data/docs-urls.csv"
fi

set +e
REPORT_DIR="$AUDIT_REPORT_DIR" \
  DOCS_URLS_CSV="$DOCS_CSV_FOR_AUDIT" \
  DOCS_AUDIT_PROJECT="$PROJECT" \
  npx playwright test tests/docs-audit.spec.ts --project=docs-audit >>"$AUDIT_REPORT_DIR/docs-audit-run.log" 2>&1
EX=$?
set -e

echo "$EX" >"$AUDIT_REPORT_DIR/docs-audit.exitcode"

npx ts-node "$ROOT/scripts/generateDashboardReport.ts" --reportDir "$AUDIT_REPORT_DIR" >>"$AUDIT_REPORT_DIR/docs-audit-run.log" 2>&1 || true

if [[ -n "$FLOW_REPORT_DIR" && -d "$FLOW_REPORT_DIR" ]]; then
  echo "$(date -Iseconds 2>/dev/null || true) docs-audit project=${PROJECT} exit=${EX} AUDIT_REPORT_DIR=${AUDIT_REPORT_DIR}" >>"$FLOW_REPORT_DIR/docs-audit-background.log" || true
fi

exit 0
