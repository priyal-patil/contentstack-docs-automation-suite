#!/usr/bin/env bash
# Start a full headless batch in the background; when it finishes, Slack + open dashboards (see inner scripts).
#
# Usage:
#   ./scripts/run-project-batch-background.sh CMS
#   ./scripts/run-project-batch-background.sh Launch
#   ./scripts/run-project-batch-background.sh Personalize
#
# Aliases (case-insensitive): cms, launch, personalize
#
# Logs: reports/bg-<name>-<timestamp>.log

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RAW="${1:?Usage: $0 CMS|Launch|Personalize}"
KEY="$(echo "$RAW" | tr '[:upper:]' '[:lower:]')"

TS="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$ROOT/reports"

export SKIP_OPEN_DASHBOARD="${SKIP_OPEN_DASHBOARD:-0}"
export SKIP_SLACK="${SKIP_SLACK:-0}"

case "$KEY" in
  cms)
    LOG="$ROOT/reports/bg-cms-${TS}.log"
    nohup env \
      SKIP_OPEN_DASHBOARD="$SKIP_OPEN_DASHBOARD" \
      SKIP_SLACK="$SKIP_SLACK" \
      PW_WORKERS="${PW_WORKERS:-6}" \
      PW_SLOWMO="${PW_SLOWMO:-0}" \
      PLAYWRIGHT_HEADLESS="${PLAYWRIGHT_HEADLESS:-1}" \
      bash -c "cd \"$ROOT\" && bash \"$ROOT/scripts/run-cms-sequential-modules-dashboard.sh\"" >>"$LOG" 2>&1 &
    PID=$!
    ;;
  launch)
    LOG="$ROOT/reports/bg-launch-${TS}.log"
    nohup env \
      SKIP_OPEN_DASHBOARD="$SKIP_OPEN_DASHBOARD" \
      SKIP_SLACK="$SKIP_SLACK" \
      PW_WORKERS="${PW_WORKERS:-6}" \
      PW_SLOWMO="${PW_SLOWMO:-0}" \
      PLAYWRIGHT_HEADLESS="${PLAYWRIGHT_HEADLESS:-1}" \
      bash -c "cd \"$ROOT\" && bash \"$ROOT/scripts/run-generic-project-headless.sh\" Launch" >>"$LOG" 2>&1 &
    PID=$!
    ;;
  personalize)
    LOG="$ROOT/reports/bg-personalize-${TS}.log"
    nohup env \
      SKIP_OPEN_DASHBOARD="$SKIP_OPEN_DASHBOARD" \
      SKIP_SLACK="$SKIP_SLACK" \
      PW_WORKERS="${PW_WORKERS:-6}" \
      PW_SLOWMO="${PW_SLOWMO:-0}" \
      PLAYWRIGHT_HEADLESS="${PLAYWRIGHT_HEADLESS:-1}" \
      bash -c "cd \"$ROOT\" && bash \"$ROOT/scripts/run-generic-project-headless.sh\" Personalize" >>"$LOG" 2>&1 &
    PID=$!
    ;;
  *)
    echo "Unknown project: $RAW — use CMS, Launch, or Personalize" >&2
    exit 1
    ;;
esac

echo "Started background batch (PID $PID)"
echo "Log file: $LOG"
echo "Tail: tail -f \"$LOG\""
