#!/usr/bin/env npx ts-node
/**
 * Patch flows-results.json in-place with results from individual retry JSON files.
 * Each retry JSON is a single-flow Playwright JSON produced by a --grep one-flow run.
 * For every matching flow ID, the spec's test array is replaced with the retry result.
 * Stats (expected/ok/skipped/unexpected) are recalculated after patching.
 *
 * Usage:
 *   npx ts-node scripts/applyFlowRetries.ts --base reports/latest/flows-results.json retry1.json retry2.json ...
 *
 * Called by run-cms-batch2.sh and run-cms-batch3.sh after their retry loops.
 */

import fs from "fs";
import path from "path";

function getArg(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name);
  if (i === -1) return undefined;
  return argv[i + 1];
}

function flowIdFromTitle(title: string): string {
  const parts = String(title || "").trim().split(/\s+/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "";
}

type AnyObj = Record<string, unknown>;
type Spec = AnyObj & { title?: string; tests?: AnyObj[] };
type Suite = AnyObj & { specs?: Spec[]; suites?: Suite[] };

function walkSpecs(suite: Suite, out: Map<string, Spec>): void {
  for (const spec of suite.specs || []) {
    const id = flowIdFromTitle(String(spec.title || ""));
    if (id) out.set(id, spec);
  }
  for (const child of suite.suites || []) walkSpecs(child, out);
}

function collectStats(suites: Suite[]): { expected: number; ok: number; skipped: number; unexpected: number } {
  let expected = 0, ok = 0, skipped = 0, unexpected = 0;
  function walk(s: Suite) {
    for (const spec of s.specs || []) {
      for (const t of spec.tests || []) {
        expected++;
        const r = (t as AnyObj).results as AnyObj[] | undefined;
        const st = String(r?.[0]?.status ?? (t as AnyObj).status ?? "").toLowerCase();
        if (st === "skipped") skipped++;
        else if (st === "passed") ok++;
        else unexpected++;
      }
    }
    for (const c of s.suites || []) walk(c);
  }
  for (const s of suites) walk(s);
  return { expected, ok, skipped, unexpected };
}

function main(): void {
  const argv = process.argv.slice(2);
  const basePath = path.resolve(getArg(argv, "--base") || "");
  if (!basePath || !fs.existsSync(basePath)) {
    // eslint-disable-next-line no-console
    console.error("Usage: applyFlowRetries.ts --base <flows-results.json> <retry1.json> ...");
    process.exit(1);
  }

  const baseIdx = argv.indexOf("--base");
  const retryPaths = argv
    .filter((a, i) => {
      if (a === "--base") return false;
      if (baseIdx >= 0 && i === baseIdx + 1) return false;
      if (a.startsWith("--")) return false;
      return true;
    })
    .map((p) => path.resolve(p))
    .filter((p) => fs.existsSync(p));

  if (retryPaths.length === 0) {
    // eslint-disable-next-line no-console
    console.log("No retry files to apply — base unchanged.");
    return;
  }

  const base = JSON.parse(fs.readFileSync(basePath, "utf-8")) as AnyObj & { suites?: Suite[]; stats?: AnyObj };

  // Index all specs in base by flow ID
  const baseSpecMap = new Map<string, Spec>();
  for (const s of base.suites || []) walkSpecs(s, baseSpecMap);

  let patched = 0;
  for (const retryPath of retryPaths) {
    let retry: AnyObj & { suites?: Suite[] };
    try {
      retry = JSON.parse(fs.readFileSync(retryPath, "utf-8")) as AnyObj & { suites?: Suite[] };
    } catch {
      // eslint-disable-next-line no-console
      console.warn(`Skipping unreadable retry file: ${retryPath}`);
      continue;
    }
    const retrySpecMap = new Map<string, Spec>();
    for (const s of retry.suites || []) walkSpecs(s, retrySpecMap);

    for (const [flowId, retrySpec] of retrySpecMap) {
      const baseSpec = baseSpecMap.get(flowId);
      if (baseSpec && retrySpec.tests) {
        baseSpec.tests = retrySpec.tests;
        patched++;
        // eslint-disable-next-line no-console
        console.log(`  Patched: ${flowId}`);
      }
    }
  }

  // Rebuild stats from patched data
  const st = collectStats(base.suites || []);
  base.stats = { ...(base.stats || {}), ...st };

  fs.writeFileSync(basePath, JSON.stringify(base, null, 2), "utf-8");
  // eslint-disable-next-line no-console
  console.log(`Applied ${patched} retry patch(es) → ${path.relative(process.cwd(), basePath)}  (passed: ${st.ok}, failed: ${st.unexpected})`);
}

main();
