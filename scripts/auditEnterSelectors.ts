#!/usr/bin/env ts-node
/**
 * Lists `enter` steps that cannot resolve a selector, and so fall back to searching the page for their
 * own internal target string.
 *
 * WHY THIS EXISTS. A step's `target` is an internal identifier, usually carrying a `(doc step)` suffix.
 * When no selector override resolves, the `enter` action's last resort used to interpolate that raw
 * string into `getByLabel` / `getByPlaceholder` / `input[name=…]`, so the run searched real pages for
 * text no page can contain and timed out after 30s. The wall of locator text it printed read like
 * application drift, not a missing selector — which is how one such step (Personalize
 * `get-started-…-ab-test` step 10) survived long enough to be investigated as a documentation problem.
 *
 * The runner now fails immediately with the file to add the key to. This script finds the rest, before
 * anyone spends time on them.
 *
 * THE COMMON CAUSE IS SCOPING, NOT AN ABSENT SELECTOR. Overrides merge as
 *
 *   shared -> legacy -> project -> module -> flow
 *
 * so a key in `projects/P/M/selectors/<someOtherFlow>.selectors.ts` is invisible to every flow but that
 * one. `create-personalize-project` and `get-started-…-ab-test` share a step target verbatim; the former
 * resolved it and passed, the latter could not see it and failed. Roughly three quarters of the findings
 * in the first sweep were this, not a selector nobody had written.
 *
 * Run:  npm run audit:enter-selectors
 *       npm run audit:enter-selectors -- --project Personalize --verbose
 */
import fs from "fs";
import path from "path";

const REPO_ROOT = path.resolve(__dirname, "..");

const argv = process.argv.slice(2);
const opt = (name: string): string | undefined => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const projectFilter = opt("project");
const verbose = argv.includes("--verbose");

/** Selector-map keys are object literal keys; accept all three quoting styles. */
const KEY_PATTERNS = [/"([^"\n]{4,150}?)"\s*:/g, /'([^'\n]{4,150}?)'\s*:/g, /`([^`\n]{4,150}?)`\s*:/g];

const keyCache = new Map<string, Set<string>>();
function keysOf(file: string): Set<string> {
  const cached = keyCache.get(file);
  if (cached) return cached;
  const keys = new Set<string>();
  if (fs.existsSync(file)) {
    const src = fs.readFileSync(file, "utf8");
    for (const re of KEY_PATTERNS) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(src))) keys.add(m[1]);
    }
  }
  keyCache.set(file, keys);
  return keys;
}

/** Exactly the files `loadOverrides()` consults, in the same order. */
function reachableKeys(project: string, moduleName: string, flowId: string): Set<string> {
  const files = [
    path.join(REPO_ROOT, "shared/overrides/common.selectors.ts"),
    path.join(REPO_ROOT, "rules/overrides/common.selectors.ts"),
    path.join(REPO_ROOT, `projects/${project}/selectors/project.selectors.ts`),
    path.join(REPO_ROOT, `projects/${project}/${moduleName}/selectors/module.selectors.ts`),
    path.join(REPO_ROOT, `rules/overrides/modules/${moduleName}.selectors.ts`),
    path.join(REPO_ROOT, `projects/${project}/${moduleName}/selectors/${flowId}.selectors.ts`),
    path.join(REPO_ROOT, `rules/overrides/docs/${flowId}.selectors.ts`),
  ];
  const all = new Set<string>();
  for (const f of files) for (const k of keysOf(f)) all.add(k);
  return all;
}

/**
 * `actionRules.ts` with comments removed.
 *
 * A target named only in prose is NOT handled — an early version of this audit counted comment mentions
 * as code paths and under-reported by 96, including the very step whose failure prompted the audit.
 */
function actionRulesCode(): string {
  const p = path.join(REPO_ROOT, "rules/core/actionRules.ts");
  if (!fs.existsSync(p)) return "";
  const src = fs.readFileSync(p, "utf8");
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((l) => l.replace(/\/\/.*$/, ""))
    .join("\n");
}

type Finding = { project: string; module: string; flowId: string; target: string; keyExistsElsewhere: boolean };

/** Every `(doc step)` key defined anywhere — used to tell a mis-filed key from an absent one. */
function allDefinedKeys(): Set<string> {
  const all = new Set<string>();
  const roots = [path.join(REPO_ROOT, "projects"), path.join(REPO_ROOT, "rules"), path.join(REPO_ROOT, "shared")];
  const walk = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".selectors.ts")) for (const k of keysOf(p)) all.add(k);
    }
  };
  roots.forEach(walk);
  return all;
}

function main(): void {
  const code = actionRulesCode();
  const defined = allDefinedKeys();
  const findings: Finding[] = [];
  let considered = 0;

  const projectsDir = path.join(REPO_ROOT, "projects");
  for (const project of fs.readdirSync(projectsDir).sort()) {
    if (projectFilter && project !== projectFilter) continue;
    const pDir = path.join(projectsDir, project);
    if (!fs.statSync(pDir).isDirectory()) continue;
    for (const moduleName of fs.readdirSync(pDir).sort()) {
      const flowsDir = path.join(pDir, moduleName, "flows");
      if (!fs.existsSync(flowsDir)) continue;
      for (const file of fs.readdirSync(flowsDir).sort()) {
        if (!file.endsWith(".flow.json")) continue;
        const flowId = file.replace(/\.flow\.json$/, "");
        let flow: any;
        try {
          flow = JSON.parse(fs.readFileSync(path.join(flowsDir, file), "utf8"));
        } catch {
          continue;
        }
        const reachable = reachableKeys(project, moduleName, flowId);
        for (const step of flow.steps ?? []) {
          if (step?.action !== "enter" || step?.selector) continue;
          const target = String(step.target ?? "");
          if (!target.includes("(doc step)")) continue; // a plain label may legitimately resolve by text
          considered += 1;
          if (reachable.has(target) || code.includes(target)) continue;
          findings.push({ project, module: moduleName, flowId, target, keyExistsElsewhere: defined.has(target) });
        }
      }
    }
  }

  const byProject = new Map<string, Finding[]>();
  for (const f of findings) byProject.set(f.project, [...(byProject.get(f.project) ?? []), f]);

  console.log(`Audited ${considered} 'enter' step(s) whose target carries "(doc step)" and has no inline selector.\n`);
  console.log(`${"project".padEnd(22)}${"unresolvable".padStart(13)}${"mis-filed".padStart(11)}${"absent".padStart(9)}`);
  for (const [project, list] of [...byProject.entries()].sort()) {
    const misfiled = list.filter((f) => f.keyExistsElsewhere).length;
    console.log(
      `${project.padEnd(22)}${String(list.length).padStart(13)}${String(misfiled).padStart(11)}${String(list.length - misfiled).padStart(9)}`
    );
  }
  const misfiledTotal = findings.filter((f) => f.keyExistsElsewhere).length;
  console.log(
    `\nTOTAL ${findings.length} unresolvable — ${misfiledTotal} already defined but out of scope, ` +
      `${findings.length - misfiledTotal} never defined.`
  );
  console.log(
    `\nNote: a target excluded because it appears in actionRules.ts may still be unreachable if that ` +
      `branch is guarded by a different flow id, so treat ${findings.length} as a lower bound.`
  );

  if (verbose) {
    for (const [project, list] of [...byProject.entries()].sort()) {
      console.log(`\n### ${project}`);
      for (const f of list) {
        console.log(`  ${f.module}/${f.flowId}`);
        console.log(`     ${f.target}${f.keyExistsElsewhere ? "   <-- defined elsewhere; copy it into a reachable file" : ""}`);
      }
    }
  } else if (findings.length) {
    console.log(`\nRe-run with --verbose to list them, or --project <Name> to narrow.`);
  }

  // Reporting tool, not a gate: exit 0 so it can run in CI for visibility without breaking builds.
  process.exit(0);
}

main();
