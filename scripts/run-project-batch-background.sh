#!/usr/bin/env bash
# Start a full headless batch in the background; when it finishes, Slack + open dashboards (see inner scripts).
#
# macOS: wraps the inner bash in `caffeinate -i -m -s` so idle sleep is deferred while the batch runs
# (locked screen is OK). Does not override full sleep/hibernate — use AC power, adjust Energy settings, or CI.
# SKIP_CAFFEINATE=1 disables.
#
# Usage:
#   ./scripts/run-project-batch-background.sh CMS
#   ./scripts/run-project-batch-background.sh Launch
#   ./scripts/run-project-batch-background.sh Personalize
#   ./scripts/run-project-batch-background.sh Data-and-Insights
#
# Aliases (case-insensitive): cms, launch, personalize, data-and-insights
#
# Logs: reports/bg-<name>-<timestamp>.log

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RAW="${1:?Usage: $0 CMS|Launch|Personalize|Data-and-Insights}"
KEY="$(echo "$RAW" | tr '[:upper:]' '[:lower:]')"

TS="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$ROOT/reports"

export SKIP_OPEN_DASHBOARD="${SKIP_OPEN_DASHBOARD:-0}"
export SKIP_SLACK="${SKIP_SLACK:-0}"

wrap_inner() {
  local inner_cmd="$1"
  if [[ "${SKIP_CAFFEINATE:-0}" != "1" ]] && command -v caffeinate >/dev/null 2>&1; then
    printf 'caffeinate -i -m -s -- bash -c %q' "$inner_cmd"
  else
    printf 'bash -c %q' "$inner_cmd"
  fi
}

case "$KEY" in
  cms)
    LOG="$ROOT/reports/bg-cms-${TS}.log"
    INNER="cd \"$ROOT\" && bash \"$ROOT/scripts/run-cms-sequential-modules-dashboard.sh\""
    nohup env \
      SKIP_OPEN_DASHBOARD="$SKIP_OPEN_DASHBOARD" \
      SKIP_SLACK="$SKIP_SLACK" \
      PW_WORKERS="${PW_WORKERS:-6}" \
      PW_SLOWMO="${PW_SLOWMO:-0}" \
      PLAYWRIGHT_HEADLESS="${PLAYWRIGHT_HEADLESS:-1}" \
      bash -c "$(wrap_inner "$INNER")" >>"$LOG" 2>&1 &
    PID=$!
    ;;
  launch)
    LOG="$ROOT/reports/bg-launch-${TS}.log"
    INNER="cd \"$ROOT\" && bash \"$ROOT/scripts/run-generic-project-headless.sh\" Launch"
    nohup env \
      SKIP_OPEN_DASHBOARD="$SKIP_OPEN_DASHBOARD" \
      SKIP_SLACK="$SKIP_SLACK" \
      PW_WORKERS="${PW_WORKERS:-6}" \
      PW_SLOWMO="${PW_SLOWMO:-0}" \
      PLAYWRIGHT_HEADLESS="${PLAYWRIGHT_HEADLESS:-1}" \
      bash -c "$(wrap_inner "$INNER")" >>"$LOG" 2>&1 &
    PID=$!
    ;;
  personalize)
    LOG="$ROOT/reports/bg-personalize-${TS}.log"
    INNER="cd \"$ROOT\" && bash \"$ROOT/scripts/run-generic-project-headless.sh\" Personalize"
    nohup env \
      SKIP_OPEN_DASHBOARD="$SKIP_OPEN_DASHBOARD" \
      SKIP_SLACK="$SKIP_SLACK" \
      PW_WORKERS="${PW_WORKERS:-6}" \
      PW_SLOWMO="${PW_SLOWMO:-0}" \
      PLAYWRIGHT_HEADLESS="${PLAYWRIGHT_HEADLESS:-1}" \
      bash -c "$(wrap_inner "$INNER")" >>"$LOG" 2>&1 &
    PID=$!
    ;;
  data-and-insights)
    LOG="$ROOT/reports/bg-data-and-insights-${TS}.log"
    INNER="cd \"$ROOT\" && bash \"$ROOT/scripts/run-generic-project-headless.sh\" Data-and-Insights"
    nohup env \
      SKIP_OPEN_DASHBOARD="$SKIP_OPEN_DASHBOARD" \
      SKIP_SLACK="$SKIP_SLACK" \
      PW_WORKERS="${PW_WORKERS:-6}" \
      PW_SLOWMO="${PW_SLOWMO:-0}" \
      PLAYWRIGHT_HEADLESS="${PLAYWRIGHT_HEADLESS:-1}" \
      bash -c "$(wrap_inner "$INNER")" >>"$LOG" 2>&1 &
    PID=$!
    ;;
  *)
    echo "Unknown project: $RAW — use CMS, Launch, Personalize, or Data-and-Insights" >&2
    exit 1
    ;;
esac

echo "Started background batch (PID $PID)"
echo "Log file: $LOG"
echo "Tail: tail -f \"$LOG\""
if [[ "${SKIP_CAFFEINATE:-0}" != "1" ]] && command -v caffeinate >/dev/null 2>&1; then
  echo "macOS: caffeinate -i -m -s is holding off idle sleep until this job finishes (SKIP_CAFFEINATE=1 to disable)."
fi
