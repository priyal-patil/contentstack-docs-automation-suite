// core/healing/selectorLayers.ts
/**
 * Reads and writes the selector layers that `loadOverrides()` in `rules/core/actionRules.ts` merges.
 *
 * Layer order there is fixed and **last-wins** (shallow spread per layer):
 *   1 shared/overrides/common.selectors.ts
 *   2 shared/overrides/common.ts (legacy)
 *   3 projects/<P>/selectors/project.selectors.ts
 *   4 projects/<P>/<mod>/selectors/module.selectors.ts
 *   5 projects/<P>/<mod>/selectors/<flowId>.selectors.ts   ← highest ordinary layer
 *   then a large inline fallback map in actionRules.ts, consulted only if the merge misses.
 *
 * The agent therefore always writes to layer 5. It never edits `actionRules.ts` (36k lines), and a
 * target currently served by the global map is healed by *creating* a layer-5 override that wins.
 *
 * WRITE SAFETY — two deliberate choices:
 *  - The agent never rewrites an existing string literal. It appends an `Object.assign(...)` block at
 *    the end of the file. Zero risk of corrupting a hand-authored multi-line selector chain.
 *  - The healed value keeps the original chain FIRST and appends the recovered selector, so a wrong
 *    heal is inert (the old locator still matches first) rather than destructive.
 */
import fs from "fs";
import path from "path";
import type { Candidate, SelectorLayer } from "./types";

export type SelectorKind = "click" | "input";

const REPO_ROOT = path.resolve(__dirname, "../..");

/** Absolute path of the flow-level selectors file for a flow — the only file the agent may write. */
export function flowSelectorPath(project: string, moduleName: string, flowId: string): string {
  return path.join(REPO_ROOT, "projects", project, moduleName, "selectors", `${flowId}.selectors.ts`);
}

/**
 * Guardrail: the agent's write path is restricted to `projects/**\/selectors/*.selectors.ts`.
 * Docs, flow definitions and `actionRules.ts` are all out of bounds by construction.
 */
export function assertWritable(absPath: string): void {
  const rel = path.relative(REPO_ROOT, absPath).split(path.sep).join("/");
  const ok = /^projects\/[^/]+\/[^/]+\/selectors\/[^/]+\.selectors\.ts$/.test(rel);
  if (!ok) {
    throw new Error(
      `Refusing to write outside the allowed selector path: ${rel} ` +
        `(allowed: projects/<Project>/<module>/selectors/<flowId>.selectors.ts)`
    );
  }
}

/** Load a selector module without letting a broken file abort the run. */
function tryRequire(absPath: string): Record<string, any> | undefined {
  try {
    if (!fs.existsSync(absPath)) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(absPath);
  } catch {
    return undefined;
  }
}

/** The layer chain in `loadOverrides()` order, lowest precedence first. */
function layerChain(
  project: string,
  moduleName: string,
  flowId: string
): Array<{ layer: SelectorLayer; file: string }> {
  return [
    { layer: "shared-common", file: path.join(REPO_ROOT, "shared/overrides/common.selectors.ts") },
    { layer: "legacy-common", file: path.join(REPO_ROOT, "shared/overrides/common.ts") },
    { layer: "project", file: path.join(REPO_ROOT, "projects", project, "selectors/project.selectors.ts") },
    {
      layer: "module",
      file: path.join(REPO_ROOT, "projects", project, moduleName, "selectors/module.selectors.ts"),
    },
    { layer: "flow", file: flowSelectorPath(project, moduleName, flowId) },
  ];
}

/**
 * Resolve the selector chain currently in force for a step target, and which layer supplied it.
 * Mirrors the last-wins merge, so the answer matches what the test run actually used.
 */
export function resolveCurrentSelector(
  project: string,
  moduleName: string,
  flowId: string,
  target: string
): { selector?: string; layer: SelectorLayer; kind?: SelectorKind } {
  let found: { selector: string; layer: SelectorLayer; kind: SelectorKind } | undefined;

  for (const { layer, file } of layerChain(project, moduleName, flowId)) {
    const m = tryRequire(file);
    if (!m) continue;
    const click = m.CLICK_SELECTORS ?? m.COMMON_CLICK_SELECTORS;
    const input = m.INPUT_SELECTORS;
    if (input && typeof input[target] === "string") found = { selector: input[target], layer, kind: "input" };
    if (click && typeof click[target] === "string") found = { selector: click[target], layer, kind: "click" };
  }
  if (found) return found;

  // Not in any override layer — check the inline fallback map in actionRules.ts. Read as text: the
  // module has heavy import side effects and we only need to know whether the key is present.
  try {
    const ar = fs.readFileSync(path.join(REPO_ROOT, "rules/core/actionRules.ts"), "utf8");
    if (ar.includes(`"${target}"`) || ar.includes(`'${target}'`)) {
      return { layer: "global-actionrules" };
    }
  } catch {
    /* best effort */
  }
  return { layer: "none" };
}

/** True when `selector` already appears in `chain` (so re-runs stay idempotent). */
function chainContains(chain: string | undefined, selector: string): boolean {
  if (!chain) return false;
  const norm = (s: string) => s.replace(/\s+/g, " ").trim();
  return norm(chain).includes(norm(selector));
}

/** Minimal scaffold for a flow that has no layer-5 file yet. */
function scaffold(flowId: string): string {
  return `/**
 * ${flowId} — flow-level selector overrides.
 * Created by self-healing-docs-qa-agent (no hand-authored layer-5 file existed).
 */

export const CLICK_SELECTORS: Record<string, string> = {};

export const INPUT_SELECTORS: Record<string, string> = {};
`;
}

export type AppendResult = {
  file: string;
  /** Full chain now in force: original first, recovered selector appended. */
  newChain: string;
  created: boolean;
  /** True when the selector was already present, so nothing was written. */
  noop: boolean;
};

/**
 * Append a recovered selector to the chain for `target` in the flow-level selectors file.
 *
 * `inheritedChain` is the chain that was in force before healing (possibly from a lower layer or the
 * global map). It is written out explicitly and first, so the override is a superset of what the flow
 * already had rather than a replacement.
 */
export function appendCandidate(opts: {
  project: string;
  moduleName: string;
  flowId: string;
  target: string;
  kind: SelectorKind;
  candidate: Candidate;
  inheritedChain?: string;
  stepNumber: number;
  runId?: string;
  dryRun?: boolean;
}): AppendResult {
  const file = flowSelectorPath(opts.project, opts.moduleName, opts.flowId);
  assertWritable(file);

  const mapName = opts.kind === "input" ? "INPUT_SELECTORS" : "CLICK_SELECTORS";
  const created = !fs.existsSync(file);
  let src = created ? scaffold(opts.flowId) : fs.readFileSync(file, "utf8");

  // Already healed to this selector on a previous run — nothing to do.
  const existing = resolveCurrentSelector(opts.project, opts.moduleName, opts.flowId, opts.target).selector;
  const effective = opts.inheritedChain ?? existing;
  if (chainContains(effective, opts.candidate.selector)) {
    return { file, newChain: effective ?? opts.candidate.selector, created: false, noop: true };
  }

  const newChain = effective ? `${effective}, ${opts.candidate.selector}` : opts.candidate.selector;

  // The map must exist for Object.assign to target it.
  if (!new RegExp(`export const ${mapName}\\b`).test(src)) {
    src += `\nexport const ${mapName}: Record<string, string> = {};\n`;
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const runNote = opts.runId ? ` · run ${opts.runId}` : "";
  const block = `
/* ── auto-healed by self-healing-docs-qa-agent ──────────────────────────────
 * Appended, not rewritten: the original chain stays first, so if this recovered
 * selector is wrong it is inert rather than destructive.
 */
Object.assign(${mapName}, {
  // ${stamp} · step ${opts.stepNumber} · ${opts.candidate.strategy} (confidence ${opts.candidate.confidence})${runNote}
  // rationale: ${opts.candidate.rationale.replace(/\n/g, " ")}
  ${JSON.stringify(opts.target)}:
    ${JSON.stringify(newChain)},
});
`;

  if (!opts.dryRun) fs.writeFileSync(file, `${src.replace(/\s*$/, "\n")}${block}`, "utf8");
  return { file, newChain, created, noop: false };
}
