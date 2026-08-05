// core/healing/flowJsonWriter.ts
/**
 * Updates a flow JSON's expected label to match the DOCUMENT.
 *
 * A flow JSON is a transcription of a document, so the document is its specification. When the two
 * disagree, the JSON is corrected — to the document's wording, never to the app's. Copying the app's
 * text would quietly retrain the test to assert whatever the app currently does, destroying the very
 * signal this agent exists to produce.
 *
 * Enforced, not merely intended:
 *   - `isSourcedFromDoc()` is re-checked here even though `reconcile()` already checked it. A write is
 *     the irreversible step, so the invariant is verified at the point of the write.
 *   - The write path is restricted to `projects/**\/flows/*.flow.json`. Documentation is never touched.
 *   - Only the one `expected.labelEquals` / `expected.modalTitle` value for the identified step changes.
 *     Nothing else in the file is rewritten.
 *
 * Formatting is preserved by editing the file as TEXT rather than round-tripping through
 * `JSON.stringify`, which would reindent the whole file and bury a one-word change in a whole-file diff.
 */
import fs from "fs";
import path from "path";
import { isSourcedFromDoc } from "./docVerifier";

const REPO_ROOT = path.resolve(__dirname, "../..");

export type FlowUpdateResult = {
  applied: boolean;
  file: string;
  field?: "labelEquals" | "modalTitle";
  from?: string;
  to?: string;
  reason: string;
};

/** Guardrail: only flow definitions, and only inside projects/. */
export function assertFlowWritable(absPath: string): void {
  const rel = path.relative(REPO_ROOT, absPath).split(path.sep).join("/");
  if (!/^projects\/[^/]+\/[^/]+\/flows\/[^/]+\.flow\.json$/.test(rel)) {
    throw new Error(
      `Refusing to write outside the allowed flow path: ${rel} ` +
        `(allowed: projects/<Project>/<module>/flows/<flowId>.flow.json)`
    );
  }
}

/** Escape for use inside a RegExp. */
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Replace the Nth occurrence of `"<field>": "<from>"` — N derived from how many times that exact
 * pairing appears at or before the target step. Identical labels recur across steps, so a naive
 * global replace would rewrite unrelated steps.
 */
function replaceNth(src: string, field: string, from: string, to: string, nth: number): string | undefined {
  const re = new RegExp(`("${field}"\\s*:\\s*)"${esc(from)}"`, "g");
  let seen = 0;
  let out: string | undefined;
  out = src.replace(re, (match, prefix) => {
    seen += 1;
    return seen === nth ? `${prefix}${JSON.stringify(to)}` : match;
  });
  return seen >= nth ? out : undefined;
}

/**
 * Apply a doc-sourced label correction to one step of one flow.
 *
 * `docText` is required: without the document there is no way to verify the new value came from it, and
 * an unverifiable write is refused rather than guessed at.
 */
export function applyFlowLabelUpdate(args: {
  flowPath: string;
  stepIndex: number;
  from: string;
  to: string;
  docText: string;
  dryRun?: boolean;
}): FlowUpdateResult {
  const { flowPath, stepIndex, from, to, docText } = args;
  const file = path.isAbsolute(flowPath) ? flowPath : path.join(REPO_ROOT, flowPath);
  assertFlowWritable(file);

  if (!to.trim()) return { applied: false, file, reason: "proposed value is empty" };

  // The invariant, re-checked at the point of the irreversible action.
  if (!isSourcedFromDoc(docText, to)) {
    return {
      applied: false,
      file,
      from,
      to,
      reason: `refused: "${to}" does not appear in the document, so it is not doc-sourced`,
    };
  }

  let src: string;
  let flow: any;
  try {
    src = fs.readFileSync(file, "utf8");
    flow = JSON.parse(src);
  } catch (err: any) {
    return { applied: false, file, reason: `could not read/parse flow: ${err?.message ?? err}` };
  }

  const steps: any[] = Array.isArray(flow.steps) ? flow.steps : [];
  const step = steps[stepIndex];
  if (!step) return { applied: false, file, reason: `step index ${stepIndex} does not exist` };

  const field: "labelEquals" | "modalTitle" | undefined =
    step?.expected?.labelEquals === from ? "labelEquals" : step?.expected?.modalTitle === from ? "modalTitle" : undefined;
  if (!field) {
    return {
      applied: false,
      file,
      from,
      to,
      reason: `step ${stepIndex + 1} does not currently expect "${from}" — refusing to guess which field to change`,
    };
  }

  // Which occurrence of this exact pairing is ours?
  let nth = 0;
  for (let i = 0; i <= stepIndex; i++) {
    if (steps[i]?.expected?.[field] === from) nth += 1;
  }

  const updated = replaceNth(src, field, from, to, nth);
  if (!updated || updated === src) {
    return { applied: false, file, from, to, reason: "could not locate the value as text; file left untouched" };
  }

  // Parse the result before writing: a corrupted flow file would break the suite far worse than a
  // stale label.
  try {
    const reparsed = JSON.parse(updated);
    if (reparsed.steps?.[stepIndex]?.expected?.[field] !== to) {
      return { applied: false, file, from, to, reason: "post-edit verification failed; file left untouched" };
    }
  } catch (err: any) {
    return { applied: false, file, from, to, reason: `edit produced invalid JSON (${err?.message}); file left untouched` };
  }

  if (!args.dryRun) fs.writeFileSync(file, updated, "utf8");

  return {
    applied: !args.dryRun,
    file,
    field,
    from,
    to,
    reason: args.dryRun
      ? `dry run — would update step ${stepIndex + 1} ${field}: "${from}" -> "${to}" (doc-sourced)`
      : `updated step ${stepIndex + 1} ${field}: "${from}" -> "${to}" (doc-sourced)`,
  };
}
