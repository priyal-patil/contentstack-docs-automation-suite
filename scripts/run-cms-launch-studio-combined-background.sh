#!/usr/bin/env bash
# Run CMS + Launch + Studio combined batch in the background (one merged Slack + open unified dashboard at end).
# See run-cms-launch-studio-combined.sh
#
# Logs: reports/bg-cms-launch-studio-<timestamp>.log
# Env: PW_WORKERS (default 4), SKIP_SLACK=1, SKIP_OPEN_DASHBOARD=1, SKIP_CAFFEINATE=1

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TS="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$ROOT/reports"
LOG="$ROOT/reports/bg-cms-launch-studio-${TS}.log"

wrap_inner() {
  local inner_cmd="$1"
  if [[ "${SKIP_CAFFEINATE:-0}" != "1" ]] && command -v caffeinate >/dev/null 2>&1; then
    printf 'caffeinate -i -m -s -- bash -c %q' "$inner_cmd"
  else
    printf 'bash -c %q' "$inner_cmd"
  fi
}

INNER="cd \"$ROOT\" && bash \"$ROOT/scripts/run-cms-launch-studio-combined.sh\""
nohup env \
  PW_WORKERS="${PW_WORKERS:-4}" \
  SKIP_SLACK="${SKIP_SLACK:-0}" \
  SKIP_OPEN_DASHBOARD="${SKIP_OPEN_DASHBOARD:-0}" \
  PLAYWRIGHT_HEADLESS="${PLAYWRIGHT_HEADLESS:-1}" \
  PW_FLOW_MAX_MINUTES="${PW_FLOW_MAX_MINUTES:-15}" \
  bash -c "$(wrap_inner "$INNER")" >>"$LOG" 2>&1 &
PID=$!

echo "Started CMS + Launch + Studio combined batch (PID $PID)"
echo "Log file: $LOG"
echo "Tail: tail -f \"$LOG\""
if [[ "${SKIP_CAFFEINATE:-0}" != "1" ]] && command -v caffeinate >/dev/null 2>&1; then
  echo "macOS: caffeinate is holding off idle sleep until this job finishes (SKIP_CAFFEINATE=1 to disable)."
fi
