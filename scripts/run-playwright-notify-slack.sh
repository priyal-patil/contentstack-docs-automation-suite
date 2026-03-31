#!/usr/bin/env bash
# Run Playwright tests, then generate url-run-summary (JSON + HTML) and post to Slack.
# Does not modify project source — only invokes existing CLI + new scripts/urlRunSummaryAndSlack.ts
#
# Usage:
#   ./scripts/run-playwright-notify-slack.sh tests/flows.spec.ts -g "Project=CMS Module=content-models"
#   REPORT_DIR=reports/nightly ./scripts/run-playwright-notify-slack.sh tests/flows.spec.ts
#
# Slack: set SLACK_BOT_TOKEN or slack.authToken in encryption_data.xlsx; set ENCRYPTION_SECRET_KEY to decrypt encrypt_* (Contentstack AESEncryptionManager-compatible).
# Optional: SLACK_CHANNEL_ID (defaults to C09GMK1NL14).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REPORT_DIR="${REPORT_DIR:-reports/latest}"
export REPORT_DIR

npx playwright test "$@"

npx ts-node scripts/urlRunSummaryAndSlack.ts --reportDir "$REPORT_DIR"
