#!/usr/bin/env bash
# Record UI actions with Playwright Codegen using the same storage state as flows (auth.json).
#
# Usage:
#   npm run codegen:app
#   npm run codegen:app -- 'https://app.contentstack.com/#!/brand-kit/...'
#   CODEGEN_START_URL='https://...' npm run codegen:app
#
# After recording, paste the generated script (or the ⋯ / menu / modal locators) into the chat;
# we map them into flow JSON + rules/core/actionRules.ts + *.selectors.ts (not raw codegen as tests).

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env 2>/dev/null || true
  set +a
fi

START="${1:-${CODEGEN_START_URL:-${CS_APP_ORIGIN:-https://app.contentstack.com}}}"

if [[ ! -f auth.json ]]; then
  echo "auth.json not found. Run a flow once (global-setup will create it) or log in via tests first." >&2
  exit 1
fi

exec npx playwright codegen --load-storage=auth.json "$START"
