#!/usr/bin/env npx ts-node
/**
 * Merge multiple Playwright JSON reports from sequential runs (same flows.spec.ts shape).
 * Concatenates inner "Flow suite" module describe blocks so dashboard / Slack see all results.
 *
 * Usage:
 *   npx ts-node scripts/mergePlaywrightFlowJsonReports.ts --out reports/batch/flows-results.json part1.json part2.json ...
 *   npx ts-node scripts/mergePlaywrightFlowJsonReports.ts --out reports/batch/flows-results.json --glob "reports/batch/parts/flows-results-*.json"
 */

import fs from "fs";
import path from "path";

function getArg(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name);
  if (i === -1) return undefined;
  return argv[i + 1];
}

function hasFlag(argv: string[], name: string): boolean {
  return argv.includes(name);
}

function readJson(p: string): any {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

/** Inner suites under: suites[0] flows.spec → suites[0] "Flow suite ..." */
function extractModuleSuites(doc: any): any[] {
  const root = doc?.suites?.[0];
  const flowOuter = root?.suites?.[0];
  return Array.isArray(flowOuter?.suites) ? flowOuter.suites : [];
}

function collectStats(suites: any[]): { expected: number; ok: number; skipped: number; unexpected: number } {
  let expected = 0;
  let ok = 0;
  let skipped = 0;
  let unexpected = 0;

  const walk = (s: any) => {
    for (const spec of s?.specs || []) {
      for (const t of spec?.tests || []) {
        expected++;
        const st = (t?.results?.[0]?.status || t?.status || "").toLowerCase();
        if (st === "skipped") skipped++;
        else if (st === "passed") ok++;
        else unexpected++;
      }
    }
    for (const c of s?.suites || []) walk(c);
  };
  for (const s of suites) walk(s);
  return { expected, ok, skipped, unexpected };
}


function main() {
  const argv = process.argv.slice(2);
  const outPath = path.resolve(getArg(argv, "--out") || "");
  if (!outPath) {
    console.error("Usage: mergePlaywrightFlowJsonReports.ts --out <file> <inputs...> | --glob <pattern>");
    process.exit(1);
  }

  let inputs: string[] = [];
  if (hasFlag(argv, "--glob")) {
    const pat = getArg(argv, "--glob") || "";
    const dir = path.dirname(pat);
    const base = path.basename(pat);
    const re = new RegExp("^" + base.replace(/\*/g, ".*").replace(/\?/g, ".") + "$");
    if (!fs.existsSync(dir)) {
      console.error("Glob dir missing:", dir);
      process.exit(1);
    }
    inputs = fs
      .readdirSync(dir)
      .filter((f) => re.test(f))
      .map((f) => path.join(dir, f))
      .sort();
  } else {
    const outIdx = argv.indexOf("--out");
    inputs = argv
      .filter((a, i) => {
        if (a === "--out" || (outIdx >= 0 && i === outIdx + 1)) return false;
        if (a.startsWith("--")) return false;
        return true;
      })
      .map((p) => path.resolve(p));
  }

  if (inputs.length === 0) {
    console.error("No input JSON files.");
    process.exit(1);
  }

  const docs = inputs.map((p) => {
    if (!fs.existsSync(p)) {
      console.error("Missing:", p);
      process.exit(1);
    }
    return readJson(p);
  });

  const base = JSON.parse(JSON.stringify(docs[docs.length - 1]));
  const mergedModules: any[] = [];
  for (const d of docs) {
    mergedModules.push(...extractModuleSuites(d));
  }

  try {
    base.suites[0].suites[0].suites = mergedModules;
  } catch {
    console.error("Unexpected JSON shape: could not set Flow suite children.");
    process.exit(1);
  }

  const st = collectStats(mergedModules);
  base.stats = {
    ...(base.stats || {}),
    expected: st.expected,
    ok: st.ok,
    skipped: st.skipped,
    unexpected: st.unexpected,
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(base, null, 2), "utf-8");
  console.log("Merged", inputs.length, "parts →", outPath, "tests:", st.expected, "passed:", st.ok, "failed/other:", st.unexpected);
}

main();
