// core/healing/reportParser.ts
/**
 * Turns a run's `doc-step-failures.json` into `HealTarget[]`.
 *
 * Two details that matter and are easy to get wrong:
 *
 *  1. **Cascade entries must be dropped.** `core/executor.ts` records every step after a
 *     `warnAndFailRest` step as `"Not executed — blocked by step N …"`. Those are not real failures;
 *     healing them would be meaningless. Only genuine step failures are kept.
 *
 *  2. **One target per flow.** The executor stops a flow at its first hard failure, so a flow has at
 *     most one real failure point per run. If several are present, the earliest step wins — later
 *     ones are downstream noise.
 */
import fs from "fs";
import path from "path";
import { classifyFlow } from "./flowClassifier";
import { resolveCurrentSelector } from "./selectorLayers";
import type { HealTarget } from "./types";
import {
  fetchDocContent,
  parseLabelMismatch,
  parseContainerMismatch,
  reconcile,
  renderDocCheck,
  docPhrasesFromLocator,
  type DocCheck,
  type DriftKind,
  appReadingIsSubstantiated,
} from "./docVerifier";

const REPO_ROOT = path.resolve(__dirname, "../..");

type RawFailure = {
  documentUrl?: string;
  flowId?: string;
  stepIndex?: number;
  stepNumber?: number;
  action?: string;
  target?: string;
  errorMessage?: string;
  missingElementSummary?: string;
  screenshotRelativePath?: string;
  step?: Record<string, unknown>;
};

/** Cascade markers written by executor.ts when a warn-and-fail-rest step blocks the remainder. */
const CASCADE = /^Not executed — blocked by step \d+/;

/** Locate a flow JSON by id anywhere under projects/. */
function findFlowPath(flowId: string): string | undefined {
  const root = path.join(REPO_ROOT, "projects");
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop()!;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (e.name === `${flowId}.flow.json`) return p;
    }
  }
  return undefined;
}

/**
 * Human-facing doc title for the commit subject. Prefers the `Doc: <title> —` prefix the repo uses in
 * `automationNotes`, else derives a title from the doc URL slug.
 */
export function deriveDocTitle(flow: any, documentUrl: string): string {
  const notes = String(flow?.automationNotes ?? "");
  const m = /^\s*Doc:\s*([^—\-\n]+)/i.exec(notes);
  if (m?.[1]?.trim()) return m[1].trim();

  const slug = documentUrl.split("?")[0].replace(/\/$/, "").split("/").pop() ?? flow?.id ?? "unknown";
  return slug
    .split("-")
    .map((w: string) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** Saved failure DOM that `core/executor.ts` persisted for this step, if it exists. */
function findSavedSnapshot(
  project: string,
  moduleName: string,
  flowId: string,
  stepNumber: number,
  reportDir: string
): string | undefined {
  const safe = flowId.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const candidates = [
    path.join(REPO_ROOT, "data/dom", project, moduleName, `${safe}-step-${stepNumber}-failure.html`),
    path.join(reportDir, "flow-screenshots", `${safe}-step-${stepNumber}.html`),
  ];
  return candidates.find((p) => fs.existsSync(p));
}

/**
 * Gather failures from a sharded run.
 *
 * CMS runs each flow in its own Playwright part and leaves the results under
 * `playwright-parts/<flowId>-retry-run/doc-step-failures.json` — 117 such files in the 11 Aug batch-2 run —
 * with no consolidated file at the top level. This merges them into the same shape the top-level file has,
 * so everything downstream is unchanged.
 *
 * Exported for testing; `parseFailureReport` calls it only when the top-level file is absent, so a project
 * that writes both is unaffected.
 */
export function collectShardedFailures(dir: string): RawFailure[] {
  const partsDir = path.join(dir, "playwright-parts");
  if (!fs.existsSync(partsDir)) return [];

  const out: RawFailure[] = [];
  let files = 0;
  for (const entry of fs.readdirSync(partsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const p = path.join(partsDir, entry.name, "doc-step-failures.json");
    if (!fs.existsSync(p)) continue;
    try {
      const parsed = JSON.parse(fs.readFileSync(p, "utf8"));
      const rows: RawFailure[] = Array.isArray(parsed) ? parsed : (parsed.failures ?? []);
      out.push(...rows);
      files += 1;
    } catch {
      // A single unreadable shard must not lose the other 116.
    }
  }
  if (files) {
    // eslint-disable-next-line no-console
    console.log(`ℹ️  merged ${out.length} failure record(s) from ${files} sharded part(s) under playwright-parts/`);
  }
  return out;
}

export function parseFailureReport(
  reportDir: string,
  opts?: { projectFilter?: string; flowFilter?: string[] }
): HealTarget[] {
  const dir = path.isAbsolute(reportDir) ? reportDir : path.join(REPO_ROOT, reportDir);
  const file = path.join(dir, "doc-step-failures.json");

  let raw: RawFailure[];
  if (fs.existsSync(file)) {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    raw = Array.isArray(parsed) ? parsed : (parsed.failures ?? []);
  } else {
    // CMS shards its run one directory per flow under `playwright-parts/<flowId>-retry-run/`, each with its
    // OWN doc-step-failures.json, and never writes a consolidated file. Every other project writes one at
    // the top level, so the agent simply threw "No doc-step-failures.json found" and did no work at all on
    // the largest project in the repo — 215 URLs in batch 2 alone, 97 of them failing. It would have failed
    // that way every night, on the first line of work, silently.
    raw = collectShardedFailures(dir);
    if (!raw.length) {
      throw new Error(
        `No doc-step-failures.json at ${file}, and no shard files under ${path.join(dir, "playwright-parts")} ` +
          `either. Nothing to triage — check that the report artifact downloaded completely.`
      );
    }
  }

  // Earliest real failure per flow.
  const earliest = new Map<string, RawFailure>();
  for (const f of raw) {
    if (!f.flowId || typeof f.stepIndex !== "number") continue;
    if (CASCADE.test(String(f.errorMessage ?? ""))) continue;
    const prev = earliest.get(f.flowId);
    if (!prev || (prev.stepIndex ?? Infinity) > f.stepIndex) earliest.set(f.flowId, f);
  }

  const out: HealTarget[] = [];
  for (const [flowId, f] of earliest) {
    if (opts?.flowFilter?.length && !opts.flowFilter.includes(flowId)) continue;

    const flowPath = findFlowPath(flowId);
    if (!flowPath) continue;

    let flow: any;
    try {
      flow = JSON.parse(fs.readFileSync(flowPath, "utf8"));
    } catch {
      continue;
    }

    const project = String(flow.project ?? "");
    const moduleName = String(flow.module ?? "");
    if (opts?.projectFilter && project !== opts.projectFilter) continue;

    const documentUrl = String(f.documentUrl ?? flow.source ?? "");
    const stepNumber = f.stepNumber ?? (f.stepIndex ?? 0) + 1;
    const target = String(f.target ?? "");

    const resolved = resolveCurrentSelector(project, moduleName, flowId, target);

    out.push({
      flowId,
      project,
      module: moduleName,
      documentUrl,
      docTitle: deriveDocTitle(flow, documentUrl),
      stepIndex: f.stepIndex as number,
      stepNumber,
      action: String(f.action ?? ""),
      target,
      errorMessage: String(f.errorMessage ?? ""),
      currentSelector: resolved.selector,
      currentSelectorLayer: resolved.layer,
      screenshotPath: f.screenshotRelativePath
        ? path.join(reportDir, f.screenshotRelativePath)
        : undefined,
      snapshotPath: findSavedSnapshot(project, moduleName, flowId, stepNumber, reportDir),
      mutability: classifyFlow(flow),
      flowPath,
      step: f.step ?? {},
    });
  }

  return out.sort((a, b) => a.flowId.localeCompare(b.flowId));
}

/**
 * Doc-wording mismatches recorded as *failures*, from **every** record — not just the earliest.
 *
 * `parseFailureReport` deliberately keeps only the earliest failure per flow, because the executor
 * stops a flow at its first hard failure and later entries are downstream noise. That is right for
 * healing and wrong for drift detection, and it cost us the single most valuable finding in a real
 * BrandKit run: `get-started-with-brand-kit` failed at step 14 (a stale-fixture click timeout) *and*
 * step 16, where the doc documents "+ New Voice Profile" but the app renders it without the "+".
 * Keeping only step 14 discarded the one thing a technical writer could act on.
 *
 * A label mismatch can never be repaired by changing a selector — both sides were found, they simply
 * disagree — so these are routed to the drift report rather than the heal queue.
 */
export function parseFailureDrift(
  reportDir: string,
  opts?: { projectFilter?: string; flowFilter?: string[] }
): DocDriftWarning[] {
  const file = path.isAbsolute(reportDir)
    ? path.join(reportDir, "doc-step-failures.json")
    : path.join(REPO_ROOT, reportDir, "doc-step-failures.json");
  if (!fs.existsSync(file)) return [];

  let raw: RawFailure[];
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    raw = Array.isArray(parsed) ? parsed : (parsed.failures ?? []);
  } catch {
    return [];
  }

  const out: DocDriftWarning[] = [];
  const seen = new Set<string>();

  for (const f of raw) {
    if (!f.flowId) continue;
    if (CASCADE.test(String(f.errorMessage ?? ""))) continue;
    if (opts?.flowFilter?.length && !opts.flowFilter.includes(f.flowId)) continue;

    // Only wording disagreements. Missing elements are heal targets and are handled elsewhere.
    if (classifyDrift(String(f.errorMessage ?? "")) !== "label-mismatch") continue;

    const key = `${f.flowId}::${f.stepNumber}::${f.errorMessage}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const flowPath = findFlowPath(f.flowId);
    let flow: any = {};
    try {
      if (flowPath) flow = JSON.parse(fs.readFileSync(flowPath, "utf8"));
    } catch {
      /* fall through with blanks */
    }
    const project = String(flow.project ?? "");
    if (opts?.projectFilter && project && project !== opts.projectFilter) continue;

    const documentUrl = String(f.documentUrl ?? flow.source ?? "");
    out.push({
      flowId: f.flowId,
      project,
      module: String(flow.module ?? ""),
      documentUrl,
      docTitle: deriveDocTitle(flow, documentUrl),
      stepNumber: f.stepNumber ?? (f.stepIndex ?? 0) + 1,
      action: String(f.action ?? ""),
      target: String(f.target ?? ""),
      warningMessage: String(f.errorMessage ?? ""),
      snapshotPath: findSavedSnapshot(project, String(flow.module ?? ""), String(f.flowId ?? ""), Number(f.stepNumber ?? (Number(f.stepIndex ?? 0) + 1)), reportDir),
      flowPath,
      stepIndex: f.stepIndex ?? (f.stepNumber ?? 1) - 1,
    });
  }
  return out;
}

/**
 * Extract the locator string Playwright reported, so the audit trail records what was actually tried
 * even though `DocStepFailure` has no dedicated `selectorUsed` field.
 */
export function extractAttemptedLocator(errorMessage: string): string | undefined {
  const m = /Locator:\s*locator\((['"])([\s\S]*?)\1\)/.exec(errorMessage);
  return m?.[2];
}

/**
 * A documented behaviour the app no longer matches, which the flow tolerated instead of failing on.
 *
 * These are real doc/app drift and the highest-signal output for technical writers, but they are easy
 * to lose: flows mark them `alwaysWarn` / `warnOnly` and fall back to an alternative route, so the run
 * goes green. `create-a-brand-kit` is the worked example — the doc says Brand Kit appears in the left
 * navigation, the app only exposes it via the Organization dashboard tile, and the flow warns and takes
 * the tile. Nothing fails, so nothing was ever reported.
 */
export type DocDriftWarning = {
  flowId: string;
  project: string;
  module: string;
  documentUrl: string;
  docTitle: string;
  stepNumber: number;
  action: string;
  target: string;
  warningMessage: string;
  /** Which of doc / flow-JSON / app is wrong. Filled in by `verifyWarningsAgainstDocs()`. */
  docCheck?: DocCheck;
  /** Absolute path of the flow definition, so a doc-sourced label correction can be applied. */
  flowPath?: string;
  /**
   * Saved failure DOM for this step, when the run kept one. Used to check that the app-side label the
   * warning quotes actually exists on the page, before any claim is made about the document.
   */
  snapshotPath?: string;
  /** Zero-based step index within that flow. */
  stepIndex?: number;
};

/**
 * Parse `doc-step-warnings.json` into doc-drift warnings.
 *
 * Deliberately separate from healing: a warning means the documented element was absent but the flow
 * carried on, so there is no failing selector to repair — only a discrepancy for a human to judge.
 */
export function parseWarningReport(
  reportDir: string,
  opts?: { projectFilter?: string; flowFilter?: string[] }
): DocDriftWarning[] {
  const file = path.isAbsolute(reportDir)
    ? path.join(reportDir, "doc-step-warnings.json")
    : path.join(REPO_ROOT, reportDir, "doc-step-warnings.json");

  if (!fs.existsSync(file)) return [];

  let raw: Array<Record<string, any>>;
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    raw = Array.isArray(parsed) ? parsed : (parsed.warnings ?? []);
  } catch {
    return [];
  }

  const out: DocDriftWarning[] = [];
  const seen = new Set<string>();

  for (const w of raw) {
    const flowId = String(w.flowId ?? "");
    if (!flowId) continue;
    if (opts?.flowFilter?.length && !opts.flowFilter.includes(flowId)) continue;

    // Flows can warn on the same step across retries; report each (flow, step, message) once.
    const key = `${flowId}::${w.stepNumber}::${w.warningMessage}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const flowPath = findFlowPath(flowId);
    let flow: any = {};
    let project = "";
    let moduleName = "";
    if (flowPath) {
      try {
        flow = JSON.parse(fs.readFileSync(flowPath, "utf8"));
        project = String(flow.project ?? "");
        moduleName = String(flow.module ?? "");
      } catch {
        /* fall through with blanks */
      }
    }
    if (opts?.projectFilter && project && project !== opts.projectFilter) continue;

    const documentUrl = String(w.documentUrl ?? flow.source ?? "");
    out.push({
      flowId,
      project,
      module: moduleName,
      documentUrl,
      docTitle: deriveDocTitle(flow, documentUrl),
      stepNumber: Number(w.stepNumber ?? (Number(w.stepIndex ?? 0) + 1)),
      action: String(w.action ?? ""),
      target: String(w.target ?? ""),
      warningMessage: String(w.warningMessage ?? ""),
      snapshotPath: findSavedSnapshot(project, moduleName, String(w.flowId ?? ""), Number(w.stepNumber ?? (Number(w.stepIndex ?? 0) + 1)), reportDir),
      flowPath,
      stepIndex: Number(w.stepIndex ?? Number(w.stepNumber ?? 1) - 1),
    });
  }

  return out.sort((a, b) => a.flowId.localeCompare(b.flowId) || a.stepNumber - b.stepNumber);
}

/**
 * Condense a raw framework warning into one readable line.
 *
 * The raw messages embed a full Playwright failure — ANSI colour codes, `Expected: visible`, a
 * `Call log:` block and the whole selector chain — which buries the part a technical writer needs. The
 * genuinely useful signal is either an explicit mismatch ("expected X, got Y") or simply "not found,
 * here is what we looked for".
 */
export function summariseWarning(raw: string): string {
  // eslint-disable-next-line no-control-regex
  const plain = raw.replace(/\[[0-9;]*m/g, "");

  // Explicit mismatches are already human-readable — keep them, minus any Playwright tail.
  const mismatch = /((?:Doc container mismatch|Label validation failed)[^\n]*)/.exec(plain);
  if (mismatch) return mismatch[1].replace(/\s+/g, " ").trim();

  const locator = extractAttemptedLocator(plain);
  const prefix = plain.split(/expect\(/)[0].replace(/[\s—-]+$/, "").replace(/\s+/g, " ").trim();

  if (locator) {
    // Show the first couple of alternatives from the chain; the rest is noise at this level.
    const parts = locator.split(",").map((p) => p.trim()).filter(Boolean);
    const shown = parts.slice(0, 2).join(", ");
    const more = parts.length > 2 ? ` (+${parts.length - 2} more)` : "";
    return `${prefix || "element not found"} — looked for: \`${shown}\`${more}`;
  }

  return (prefix || plain).replace(/\s+/g, " ").trim().slice(0, 240);
}

/**
 * Classify what kind of difference a warning describes. A wrong name is a warning; a step that cannot
 * be performed is a failure — so this drives severity, not just wording.
 */
export function classifyDrift(message: string): DriftKind {
  if (parseLabelMismatch(message)) return "label-mismatch";
  if (parseContainerMismatch(message)) return "container-mismatch";
  return "element-missing";
}

/**
 * Go back to the source document for every warning and decide which side is stale.
 *
 * This is the step that turns "a selector did not match" into something a technical writer can act on:
 * it distinguishes "the doc is wrong" from "our transcription of the doc is wrong".
 */
export async function verifyWarningsAgainstDocs(
  warnings: DocDriftWarning[]
): Promise<DocDriftWarning[]> {
  const out: DocDriftWarning[] = [];
  for (const w of warnings) {
    const kind = classifyDrift(w.warningMessage);
    const doc = await fetchDocContent(w.documentUrl);

    const label = parseLabelMismatch(w.warningMessage);
    const container = parseContainerMismatch(w.warningMessage);

    // Check the app-side reading against the page that was saved at this step. `undefined` when no DOM was
    // kept — the caller then behaves exactly as before rather than guessing.
    let appReadingSubstantiated: boolean | undefined;
    const readback = label?.got ?? container?.resolved;
    if (readback && w.snapshotPath && fs.existsSync(w.snapshotPath)) {
      try {
        appReadingSubstantiated = appReadingIsSubstantiated(fs.readFileSync(w.snapshotPath, "utf8"), readback);
      } catch {
        appReadingSubstantiated = undefined;
      }
    }

    // For a plain "not found", the flow's own expectation is the best statement of what the doc claims.
    const expectedByFlow = label?.expected ?? container?.expected;
    const seenInApp = label?.got ?? container?.resolved;
    // For a plain "not found", the doc-facing wording is inside the locator's text predicates, not in
    // our internal target name — which the doc would never contain verbatim.
    const expectedCandidates = [
      ...docPhrasesFromLocator(extractAttemptedLocator(w.warningMessage)),
      w.target.replace(/\s*\(doc step\)\s*$/i, "").trim(),
    ];

    out.push({
      ...w,
      docCheck: reconcile({
        docText: doc.text,
        docUrl: w.documentUrl,
        docError: doc.error,
        expectedByFlow,
        expectedCandidates,
        seenInApp,
        appReadingSubstantiated,
        kind,
      }),
    });
  }
  return out;
}

/**
 * Markdown for the doc-drift section, split by severity.
 *
 * Policy: a wrong or misplaced *name* is a warning — report it and move on. A step that cannot be
 * performed at all is a failure, because the documented procedure is genuinely broken for a reader.
 * The framework logs both as `warnOnly`, so the split is applied here rather than inherited.
 */
export function renderWarningsMarkdown(warnings: DocDriftWarning[]): string[] {
  if (!warnings.length) return [];

  // Anything the doc check settled as "not drift" (selector-scoping assertions, identical sides) is an
  // automation concern. It must not appear in the writers' sections at all, or the signal drowns.
  const notDrift = warnings.filter((w) => w.docCheck?.verdict === "no-drift");
  const real = warnings.filter((w) => w.docCheck?.verdict !== "no-drift");
  const failures = real.filter((w) => w.docCheck?.severity === "failure");
  const minor = real.filter((w) => w.docCheck?.severity !== "failure");

  const section = (title: string, blurb: string[], items: DocDriftWarning[]): string[] => {
    if (!items.length) return [];
    const byFlow = new Map<string, DocDriftWarning[]>();
    for (const w of items) {
      const list = byFlow.get(w.flowId) ?? [];
      list.push(w);
      byFlow.set(w.flowId, list);
    }
    const lines: string[] = [title, ``, ...blurb, ``];
    for (const [flowId, ws] of byFlow) {
      lines.push(`### ${ws[0].docTitle} — \`${flowId}\``);
      lines.push(`- **Doc:** ${ws[0].documentUrl}`);
      for (const w of ws) {
        lines.push(`- **step ${w.stepNumber}** (${w.action}) — ${summariseWarning(w.warningMessage)}`);
        if (w.docCheck) lines.push(`  - ${renderDocCheck(w.docCheck).replace(/\n/g, "\n  ")}`);
      }
      lines.push(``);
    }
    return lines;
  };

  return [
    ...section(
      `## Documented steps that cannot be performed (failures)`,
      [
        `The documented element could not be found in the app at all, so a reader following this page`,
        `would get stuck. Each entry names whether the **doc** or our **flow definition** is out of date.`,
      ],
      failures
    ),
    ...section(
      `## Documentation drift (warnings)`,
      [
        `The step still works, but a name or label does not match the doc. Reported so the wording can`,
        `be corrected; the flow continued past it.`,
      ],
      minor
    ),
    ...section(
      `## Not documentation drift (for the automation team)`,
      [
        `Selector-scoping assertions and same-string mismatches. Nothing here is about the docs — listed`,
        `only so the count reconciles.`,
      ],
      notDrift
    ),
  ];
}

