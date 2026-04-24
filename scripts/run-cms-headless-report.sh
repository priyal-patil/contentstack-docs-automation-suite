#!/usr/bin/env bash
# Full CMS batch: sequential module order, CRUD order within each module, delete batch, trash,
# optional retry of failed/timed-out tests, docs-audit (background by default), Excel + dashboards + report-bundle + Slack,
# then open report-bundle (unless OPEN_CMS_DASHBOARD=0).
#
# Implementation: delegates to scripts/run-cms-sequential-modules-dashboard.sh (single source of truth).
#
# Usage:
#   ./scripts/run-cms-headless-report.sh
#   REPORT_DIR=reports/my-run ./scripts/run-cms-headless-report.sh
#   SKIP_SLACK=1 SKIP_RETRY=1 OPEN_CMS_DASHBOARD=0 ./scripts/run-cms-headless-report.sh
# Background:
#   npm run test:cms   # → run-cms-headless-background.sh → this script

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TS="$(date +%Y%m%d-%H%M%S)"
export REPORT_DIR="${REPORT_DIR:-$ROOT/reports/cms-headless-$TS}"
mkdir -p "$REPORT_DIR"

export PW_SLOWMO="${PW_SLOWMO:-0}"
export PW_WORKERS="${PW_WORKERS:-6}"
export PW_FULLY_PARALLEL="${PW_FULLY_PARALLEL:-1}"
export PLAYWRIGHT_HEADLESS=1
# Never pop a browser/HTML after each URL in this headless pipeline (ignore inherited OPEN_FLOW_REPORT=true).
export OPEN_FLOW_REPORT=false
export DOCS_AUDIT_BACKGROUND="${DOCS_AUDIT_BACKGROUND:-1}"
export DOCS_URLS_CSV="${DOCS_URLS_CSV:-$ROOT/data/cms-urls.csv}"

if [[ ! -f "$ROOT/data/cms-urls.csv" ]]; then
  npx ts-node "$ROOT/scripts/buildCmsUrlsCsv.ts"
fi

exec bash "$ROOT/scripts/run-cms-sequential-modules-dashboard.sh"
