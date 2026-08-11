/**
 * Generate a per-flow HTML report (steps + warnings) for EVERY flow that ran in a
 * report dir, so publishToDashboard.ts's findFlowReportHtml() can locate a reportUrl
 * for each item instead of always getting null.
 *
 * Writes <reportDir>/playwright-parts/<flowId>-report.html for each flow spec found in
 * the resolved flows-results JSON (works across all projects — CMS, Launch, Personalize,
 * Administration, etc. — not just CMS).
 *
 * Some runners (e.g. scripts/run-cms-batch2.sh) shard each module into its own Playwright
 * invocation with REPORT_DIR="$MODULE_DIR" under playwright-parts/module-<name>/, so
 * tests/flows.spec.ts's own afterAll hook already writes a *complete* <flowId>-report.html
 * there (with that module's own doc-step-failures.json/doc-step-warnings.json). Failure
 * detail for those isn't merged up to the top-level reportDir, so if we blindly wrote a flat
 * <reportDir>/playwright-parts/<flowId>-report.html for every flow, it could shadow/duplicate
 * an already-correct nested report with an inferior one (missing failure detail) — and
 * findFlowReportHtml()'s tree walk would non-deterministically pick either. To stay safe we
 * skip generating when a report for that flowId already exists anywhere under playwright-parts.
 *
 * No-ops gracefully (exit 0, just logs) when the flows-results file is missing or has no
 * flow specs, so it's safe to call unconditionally in CI right alongside the other
 * scripts/generate*.ts calls (same `... 2>&1 || true` convention used for those).
 *
 * NOTE on flow-id extraction: this deliberately does NOT use
 * core/report/parseFlowSpecTitle.ts's collectAllFlowSpecs()/collectCmsFlowSpecs(). Those
 * filter on spec.title containing "Project=...", but tests/flows.spec.ts actually puts
 * that on the enclosing suite (`test.describe(\`Project=${p} Module=${m} Stage=${s}\`, …)`)
 * and registers each test with just the bare flow id
 * (`test(flow.id, …)` in registerModuleFlowTests). So in real Playwright JSON output,
 * spec.title IS the flow id already — collectAllFlowSpecs finds zero matches against it.
 * Confirmed against a real production report dir (cms-batch2-reports-27999942372-1):
 * unified-report.json had rows:[] / totalAudited:0 and cms-dashboard.html showed 0 flows
 * everywhere, despite 218 flows having actually run and produced their own report.html
 * files (written directly by flows.spec.ts's own afterAll hook, which tracks ranFlowIds
 * in-process and doesn't go through this parsing). This looks like a separate, pre-existing
 * bug affecting generateCmsDashboardHtml.ts / generateUnifiedReport.ts / buildCmsReportBundle.ts
 * too — worth flagging to a human — but fixing it is out of scope here. To make THIS script
 * actually work in production regardless, we walk the suite tree ourselves and treat every
 * spec.title as a flow id (also splitting serial "chain" test titles like
 * "add-a-publish-rule → update-a-publish-rule → delete-a-publish-rule" on the arrow, since
 * each linked flow id has its own <id>.flow.json and gets its own report).
 *
 * Usage: npx ts-node scripts/generateAllFlowReportsHtml.ts [--reportDir reports/latest]
 */
import fs from "fs";
import path from "path";
import { generateFlowReportHtml } from "../core/flowReportGenerator";
import { resolveFlowsResultsPath } from "../core/report/resolveFlowsResultsPath";

type PwSpec = { title?: string };
type PwSuite = { title?: string; specs?: PwSpec[]; suites?: PwSuite[] };

/** Collect every spec title anywhere in the suite tree (see NOTE above for why we don't
 * filter by "Project=" prefix — that lives on the suite, not the spec, in real output). */
function collectAllSpecTitles(pw: { suites?: PwSuite[] } | null | undefined): string[] {
  const out: string[] = [];
  function walk(suite: PwSuite) {
    for (const spec of suite.specs || []) {
      if (spec.title) out.push(String(spec.title));
    }
    for (const child of suite.suites || []) walk(child);
  }
  for (const s of pw?.suites || []) walk(s);
  return out;
}

/** Chain tests (serial publish-rule / role-lifecycle / quick-start-guide chains) are titled
 * "flowA → flowB → flowC" — split so each linked flow id resolves to its own .flow.json. */
function expandFlowIds(specTitle: string): string[] {
  return specTitle
    .split(/\s*(?:→|->)\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function readJson<T>(p: string): T | null {
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
  } catch {
    return null;
  }
}

/** Mirrors findFlowReportHtml() in scripts/publishToDashboard.ts — true if a report for
 * this flowId already exists anywhere under <reportDir>/playwright-parts (e.g. written by
 * a sharded module runner's own flows.spec.ts afterAll hook). */
function flowReportAlreadyExists(reportDir: string, flowId: string): boolean {
  const root = path.join(reportDir, "playwright-parts");
  if (!fs.existsSync(root)) return false;
  const target = `${flowId}-report.html`;
  const stack: string[] = [root];
  while (stack.length) {
    const dir = stack.pop()!;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && entry.name === target) return true;
    }
  }
  return false;
}

function main() {
  const reportDir = path.resolve(process.cwd(), arg("--reportDir", "reports/latest"));
  const flowsPath = resolveFlowsResultsPath(reportDir);

  const pw = readJson<{ suites?: PwSuite[] }>(flowsPath);
  if (!pw) {
    // eslint-disable-next-line no-console
    console.log(`generateAllFlowReportsHtml: no flows results at ${flowsPath} — skipping.`);
    return;
  }

  const flowIds = new Set(collectAllSpecTitles(pw).flatMap(expandFlowIds));

  if (!flowIds.size) {
    // eslint-disable-next-line no-console
    console.log("generateAllFlowReportsHtml: no flow specs found in flows results — skipping.");
    return;
  }

  let written = 0;
  let alreadyPresent = 0;
  for (const flowId of flowIds) {
    if (flowReportAlreadyExists(reportDir, flowId)) {
      alreadyPresent++;
      continue;
    }
    const out = generateFlowReportHtml(flowId, reportDir, { subdir: "playwright-parts" });
    if (out) {
      written++;
    } else {
      // eslint-disable-next-line no-console
      console.log(`generateAllFlowReportsHtml: no flow file found for "${flowId}" — skipped.`);
    }
  }
  // eslint-disable-next-line no-console
  console.log(
    `✅ generateAllFlowReportsHtml: wrote ${written}/${flowIds.size} per-flow HTML report(s) under ${path.join(reportDir, "playwright-parts")} (${alreadyPresent} already had one from a sharded module run)`
  );
}

main();
