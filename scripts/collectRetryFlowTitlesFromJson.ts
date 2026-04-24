#!/usr/bin/env npx ts-node
/**
 * Build retry metadata from Playwright JSON report part(s).
 * Used in the CMS sequential batch after main modules + chains, before delete batch.
 *
 * - **--exportShell** (preferred): prints `export VAR=...` lines for eval:
 *   - `CMS_RETRY_FLOW_IDS` — comma-separated flow ids (failed `test.step` leaves + non-batched failures)
 *   - `CMS_RETRY_PUBLISH_CHAIN=1` / `CMS_RETRY_ROLES_CHAIN=1` when those serial chains failed
 *   With `test.step` batching (`run-all-flows-continue-on-fail`), per-URL titles are step titles only;
 *   `--grep` cannot target individual flows, so the batch driver uses env + `flows.spec.ts` filtering.
 *
 * Legacy: without `--exportShell`, prints one line: a `--grep` regex (escaped), or nothing.
 *
 * Usage:
 *   eval "$(npx ts-node scripts/collectRetryFlowTitlesFromJson.ts --partsDir reports/batch/playwright-parts --exportShell)"
 *   npx ts-node scripts/collectRetryFlowTitlesFromJson.ts --file reports/batch/flows-results.json
 */

import fs from "fs";
import path from "path";
import { flowIdFromPlaywrightSpecTitle } from "../core/report/parseFlowSpecTitle";
import { collectFailedTitlesFromTestSteps } from "../core/report/playwrightFlowStepExpansion";

/** Keep in sync with tests/flows.spec.ts PUBLISH_RULE_CHAIN_SERIAL */
const PUBLISH_RULE_CHAIN_IDS = ["add-a-publish-rule", "update-a-publish-rule", "delete-a-publish-rule"];
/** Keep in sync with tests/flows.spec.ts ROLES_CHAIN_SERIAL */
const ROLES_CHAIN_IDS = ["create-a-role", "update-a-role", "delete-a-role"];

function getArg(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name);
  if (i === -1) return undefined;
  return argv[i + 1];
}

function hasFlag(argv: string[], name: string): boolean {
  return argv.includes(name);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeShellSingleQuoted(s: string): string {
  return s.replace(/'/g, `'\"'\"'`);
}

function readJson(p: string): any {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function leafTitle(specTitle: string): string {
  const t = String(specTitle || "").trim();
  if (t.includes("›")) {
    const parts = t.split("›");
    return parts[parts.length - 1]?.trim() || t;
  }
  return t;
}

function collectRetryPlanFromSuite(
  suite: any,
  flowIds: Set<string>,
  grepTitles: Set<string>,
  publishChain: { v: boolean },
  rolesChain: { v: boolean }
): void {
  for (const spec of suite.specs || []) {
    const specTitle = String(spec.title || "");
    const isContinueOnFailBatch = specTitle.includes("run-all-flows-continue-on-fail");

    for (const t of spec.tests || []) {
      const res = t?.results?.[0];
      const st = String(res?.status || t?.status || "").toLowerCase();
      const testTitle = String(t?.title || specTitle || "").trim();

      if (res?.steps?.length) {
        collectFailedTitlesFromTestSteps(res.steps, flowIds);
      }

      if (st === "passed" || st === "skipped") continue;
      if (st !== "failed" && st !== "timedout" && st !== "interrupted") continue;

      const chainTitle = testTitle || specTitle;
      const isPublishChainFail = PUBLISH_RULE_CHAIN_IDS.some((id) => chainTitle.includes(id));
      const isRolesChainFail = ROLES_CHAIN_IDS.some((id) => chainTitle.includes(id));
      if (isPublishChainFail) publishChain.v = true;
      if (isRolesChainFail) rolesChain.v = true;

      if (isContinueOnFailBatch) {
        continue;
      }

      if (isPublishChainFail || isRolesChainFail) {
        continue;
      }

      const leaf = leafTitle(specTitle);
      const leafTest = leafTitle(testTitle);
      if (leaf.includes("→") || leafTest.includes("→")) {
        grepTitles.add(leafTest || leaf);
        continue;
      }

      const fid = flowIdFromPlaywrightSpecTitle(leaf);
      if (fid && !fid.includes("run-all-flows-continue-on-fail")) {
        flowIds.add(fid);
      }
    }
  }
  for (const c of suite.suites || []) collectRetryPlanFromSuite(c, flowIds, grepTitles, publishChain, rolesChain);
}

function walkDoc(doc: any, flowIds: Set<string>, grepTitles: Set<string>, publishChain: { v: boolean }, rolesChain: { v: boolean }): void {
  const fileSuite = doc?.suites?.[0];
  if (!fileSuite?.suites) return;
  for (const child of fileSuite.suites) collectRetryPlanFromSuite(child, flowIds, grepTitles, publishChain, rolesChain);
}

function collectFromPartsDir(dir: string, flowIds: Set<string>, grepTitles: Set<string>, publishChain: { v: boolean }, rolesChain: { v: boolean }): void {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".json") || f.startsWith(".")) continue;
    try {
      walkDoc(readJson(path.join(dir, f)), flowIds, grepTitles, publishChain, rolesChain);
    } catch {
      /* ignore malformed part */
    }
  }
}

function emitShell(flowIds: Set<string>, grepTitles: Set<string>, publishChain: boolean, rolesChain: boolean): void {
  const lines: string[] = [];
  if (flowIds.size > 0) {
    const joined = [...flowIds].join(",");
    lines.push(`export CMS_RETRY_FLOW_IDS='${escapeShellSingleQuoted(joined)}'`);
  }
  if (publishChain) lines.push(`export CMS_RETRY_PUBLISH_CHAIN='1'`);
  if (rolesChain) lines.push(`export CMS_RETRY_ROLES_CHAIN='1'`);
  const grepParts = [...grepTitles].map((g) => g.trim()).filter(Boolean).map(escapeRegex);
  if (grepParts.length > 0) {
    lines.push(`export PLAYWRIGHT_RETRY_GREP='${escapeShellSingleQuoted(grepParts.join("|"))}'`);
  }
  if (lines.length === 0) return;
  process.stdout.write(lines.join("\n") + "\n");
}

function emitLegacyGrep(flowIds: Set<string>, grepTitles: Set<string>): void {
  const tokens = [...grepTitles, ...flowIds];
  if (tokens.length === 0) return;
  const pattern = tokens.map(escapeRegex).join("|");
  process.stdout.write(pattern);
}

function main(): void {
  const argv = process.argv.slice(2);
  const partsDir = getArg(argv, "--partsDir");
  const file = getArg(argv, "--file");
  const exportShell = hasFlag(argv, "--exportShell");

  const flowIds = new Set<string>();
  const grepTitles = new Set<string>();
  const publishChain = { v: false };
  const rolesChain = { v: false };

  if (partsDir) {
    collectFromPartsDir(path.resolve(partsDir), flowIds, grepTitles, publishChain, rolesChain);
  } else if (file) {
    const p = path.resolve(file);
    if (fs.existsSync(p)) {
      try {
        walkDoc(readJson(p), flowIds, grepTitles, publishChain, rolesChain);
      } catch {
        process.exit(0);
      }
    }
  } else {
    console.error(
      "Usage: collectRetryFlowTitlesFromJson.ts --partsDir <dir> [--exportShell] | --file <flows-results.json> [--exportShell]"
    );
    process.exit(2);
  }

  if (exportShell) {
    emitShell(flowIds, grepTitles, publishChain.v, rolesChain.v);
    process.exit(0);
  }

  emitLegacyGrep(flowIds, grepTitles);
}

main();
