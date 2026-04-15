#!/usr/bin/env bash
# Wait for the CMS sequential batch PID to exit, then ensure Slack gets a summary.
# If the main script already posted ("Posted summary to Slack" in log), skips duplicate post.
#
# Usage (from repo root):
#   bash scripts/wait-cms-seq-finish-and-slack.sh
# Env:
#   CMS_SEQ_PID — override PID (default: reports/cms-seq-background.pid)
#   CMS_SEQ_LOG — log path (default: reports/cms-seq-nohup.log)

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PID_FILE="${CMS_SEQ_PID_FILE:-$ROOT/reports/cms-seq-background.pid}"
LOG="${CMS_SEQ_LOG:-$ROOT/reports/cms-seq-nohup.log}"
PID="${CMS_SEQ_PID:-}"
if [[ -z "$PID" && -f "$PID_FILE" ]]; then
  PID="$(tr -d ' \n\r' < "$PID_FILE" || true)"
fi

if [[ -z "$PID" ]]; then
  echo "No PID (set CMS_SEQ_PID or create $PID_FILE)."
  exit 1
fi

REPORT_DIR=""
if [[ -f "$LOG" ]]; then
  REPORT_DIR="$(grep -oE "$ROOT/reports/cms-seq-[0-9]{8}-[0-9]{6}" "$LOG" 2>/dev/null | head -1 || true)"
fi
if [[ -z "$REPORT_DIR" || ! -d "$REPORT_DIR" ]]; then
  REPORT_DIR="$(ls -dt "$ROOT"/reports/cms-seq-* 2>/dev/null | head -1 || true)"
fi
if [[ -z "$REPORT_DIR" || ! -d "$REPORT_DIR" ]]; then
  echo "Could not resolve REPORT_DIR."
  exit 1
fi

echo "Watching PID $PID (log: $LOG)"
echo "Report dir: $REPORT_DIR"
while kill -0 "$PID" 2>/dev/null; do
  sleep 120
done
echo "PID $PID has exited ($(date -Iseconds 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ"))"

if [[ -f "$LOG" ]] && grep -q "Posted summary to Slack" "$LOG"; then
  echo "Main script already posted to Slack — skipping duplicate."
  exit 0
fi

if [[ ! -f "$REPORT_DIR/flows-results.json" ]]; then
  echo "WARNING: No flows-results.json at $REPORT_DIR — merge step may have failed. Not posting Slack."
  exit 1
fi

npx ts-node "$ROOT/scripts/urlRunSummaryAndSlack.ts" --reportDir "$REPORT_DIR"
echo "Slack post attempted for $REPORT_DIR"
