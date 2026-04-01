#!/usr/bin/env bash
# Run CMS Playwright flows in headed (visible) mode.
# Pass one or more grep patterns; they are OR'd so matching tests all run.
# Flow test titles look like: Project=CMS Module=workflows Stage=main <flow-id>
# Doc URL slug usually matches flow id, e.g. delete-a-publish-rule, update-a-publish-rule.
#
# Usage:
#   ./scripts/run-cms-headed.sh delete-a-publish-rule
#   ./scripts/run-cms-headed.sh delete-a-publish-rule update-a-publish-rule
#   ./scripts/run-cms-headed.sh "add-a-publish-rule → update"
#
# Extra Playwright args after -- :
#   ./scripts/run-cms-headed.sh delete-a-publish-rule -- --repeat-each=1

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PLAYWRIGHT_HEADLESS=0
export PW_WORKERS="${PW_WORKERS:-1}"

ARGS=()
GREP_PARTS=()
while [[ $# -gt 0 ]]; do
  if [[ "$1" == "--" ]]; then
    shift
    ARGS+=("$@")
    break
  fi
  GREP_PARTS+=("$1")
  shift
done

if [[ ${#GREP_PARTS[@]} -eq 0 ]]; then
  echo "Usage: $0 <grep-pattern> [<grep-pattern> ...] [-- extra playwright args]"
  echo "Examples:"
  echo "  $0 delete-a-publish-rule"
  echo "  $0 delete-a-publish-rule update-a-publish-rule"
  echo "  $0 \"add-a-publish-rule → update\""
  exit 1
fi

PATTERN=""
for p in "${GREP_PARTS[@]}"; do
  if [[ -n "$PATTERN" ]]; then PATTERN="${PATTERN}|"; fi
  PATTERN="${PATTERN}${p}"
done

# Avoid "${ARGS[@]}" when empty with set -u (unbound variable).
if [[ ${#ARGS[@]} -eq 0 ]]; then
  exec npx playwright test tests/flows.spec.ts --project=flows --headed -g "$PATTERN"
else
  exec npx playwright test tests/flows.spec.ts --project=flows --headed -g "$PATTERN" "${ARGS[@]}"
fi
