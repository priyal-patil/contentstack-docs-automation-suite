import fs from "fs";
import path from "path";

/**
 * Choose which Playwright JSON output contains **flow** results (`flows.spec.ts`).
 *
 * - `flows-results.json` is overwritten on **every** Playwright run for that `REPORT_DIR` (latest run).
 * - `flows-results-cms.json` is a **backup** copied before docs-audit in `run-cms-headless-report.sh`
 *   so flow results survive when docs-audit overwrites `flows-results.json`.
 *
 * Preferring the backup **whenever it existed** was wrong: after a later flow-only run,
 * `flows-results.json` updates but the old backup can remain → Slack/dashboard showed stale counts.
 *
 * Resolution:
 * 1. If only one file exists, use it.
 * 2. If `flows-results.json` still contains a `flows.spec.ts` suite (flow run output), use it (latest flow run).
 * 3. Otherwise use `flows-results-cms.json` if present (typical: primary was replaced by docs-audit only).
 * 4. Fall back to `flows-results.json`.
 */
export function resolveFlowsResultsPath(reportDir: string): string {
  const primary = path.join(reportDir, "flows-results.json");
  const backup = path.join(reportDir, "flows-results-cms.json");

  const hasPrimary = fs.existsSync(primary);
  const hasBackup = fs.existsSync(backup);

  if (hasPrimary && !hasBackup) return primary;
  if (!hasPrimary && hasBackup) return backup;
  if (!hasPrimary && !hasBackup) return primary;

  try {
    const raw = fs.readFileSync(primary, "utf-8");
    const pw = JSON.parse(raw) as { suites?: unknown[] };
    if (hasFlowsSpecSuite(pw)) return primary;
  } catch {
    if (hasBackup) return backup;
    return primary;
  }

  if (hasBackup) return backup;
  return primary;
}

/** True if Playwright JSON still includes flow suite output (not replaced by docs-audit-only JSON). */
function hasFlowsSpecSuite(pw: { suites?: unknown[] }): boolean {
  let found = false;
  function walk(suite: any) {
    if (String(suite?.file || "").includes("flows.spec")) {
      found = true;
      return;
    }
    for (const child of suite?.suites || []) {
      walk(child);
      if (found) return;
    }
  }
  for (const s of pw?.suites || []) walk(s);
  return found;
}
