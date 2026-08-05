// core/healing/runOutcome.ts
/**
 * Reads each flow's FINAL outcome from `flows-results.json`, so a step that failed on one attempt but
 * passed on retry is not mistaken for a failure.
 *
 * WHY. The agent's targets come from `doc-step-failures.json`, which `core/docStepFailureReporter.ts`
 * appends to as each step fails. That file records failures from EVERY attempt and knows nothing about
 * retries or the final result. Playwright retries flows, so a flow can fail on attempt 0, pass on retry 1,
 * and end up `ok: true` — while its attempt-0 failures still sit in the file.
 *
 * In a real Personalize run three flows were in exactly that state:
 *
 *   edit-audience          ['failed', 'passed']   ok=true
 *   edit-custom-attribute  ['failed', 'passed']   ok=true
 *   edit-experience        ['failed', 'passed']   ok=true
 *   delete-audience        ['failed', 'failed']   ok=false   <- genuinely failing
 *
 * The agent treated all four as failures. That was wrong in two ways. It misreported the run — 13 flows
 * were worked, 3 of which had passed, while the summary spoke of 12 failures. And it was actively harmful:
 * those three retry-passers were three of the five flows where the matcher proposed a WEAKER selector (the
 * containing `<ul>` in place of the specific menu item), so the agent was rewriting selectors that already
 * worked.
 *
 * Flakiness is still real signal — a flow that only passes on retry often has a fragile selector — so this
 * does not discard those targets. It labels them, keeps them out of the failure count, and leaves it to the
 * caller whether to attempt them (`--include-flaky`). Silently dropping a signal would be its own bug.
 */
import fs from "fs";
import path from "path";

/**
 * Deliberately walks the suite tree here rather than importing `core/report/parseFlowSpecTitle`.
 *
 * That collector tests `spec.title` for `Project=`, but Playwright puts the
 * `Project=… Module=… Stage=…` context on an ANCESTOR SUITE and leaves the bare flow id as the spec
 * title — so it returns zero specs. Reusing it here silently produced "outcome unknown" for all 23 flows,
 * which would have quietly restored the exact behaviour this module exists to prevent. The fix for that
 * collector is in a separate change; this module must not depend on it landing first.
 */
type PwSpec = { title?: string; ok?: boolean; tests?: Array<{ results?: Array<{ status?: string }> }> };
type PwSuite = { title?: string; specs?: PwSpec[]; suites?: PwSuite[] };

/** Last whitespace-separated token of the reconstructed title is the flow id. */
function flowIdFromTitle(title: string): string {
  const parts = String(title || "").trim().split(/\s+/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "";
}

/** Every spec whose inherited context names a project, with its full title rebuilt. */
function collectSpecs(pw: { suites?: PwSuite[] } | null | undefined): PwSpec[] {
  const out: PwSpec[] = [];
  const CONTEXT = /[A-Za-z]+=[A-Za-z0-9_-]+/;

  function walk(suite: PwSuite, inherited: string) {
    const own = String(suite.title || "");
    const context = CONTEXT.test(own) ? [inherited, own].filter(Boolean).join(" ") : inherited;
    for (const spec of suite.specs || []) {
      const title = [context, String(spec.title || "")].filter(Boolean).join(" ").trim();
      if (/Project=[A-Za-z0-9_-]+\b/.test(title)) out.push({ ...spec, title });
    }
    for (const child of suite.suites || []) walk(child, context);
  }

  for (const s of pw?.suites || []) walk(s, "");
  return out;
}

export type FlowRunOutcome = {
  /** True when the spec ended green, whatever happened on earlier attempts. */
  ok: boolean;
  /** Per-attempt statuses in order, e.g. ["failed", "passed"]. */
  attempts: string[];
  /** Failed at least once AND ended green — i.e. flaky. */
  passedOnRetry: boolean;
};

/**
 * Map flow id -> final outcome. Empty when the file is absent or unparseable, in which case callers must
 * fall back to treating every recorded failure as a failure (the previous behaviour).
 */
export function readFlowOutcomes(reportDir: string): Map<string, FlowRunOutcome> {
  const out = new Map<string, FlowRunOutcome>();
  const file = path.join(reportDir, "flows-results.json");
  if (!fs.existsSync(file)) return out;

  let pw: any;
  try {
    pw = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return out;
  }

  for (const spec of collectSpecs(pw)) {
    const flowId = flowIdFromTitle(String(spec.title ?? ""));
    if (!flowId) continue;

    const attempts: string[] = [];
    for (const test of spec.tests ?? []) {
      for (const result of test?.results ?? []) {
        if (result?.status) attempts.push(String(result.status));
      }
    }
    // `spec.ok` is authoritative when present; otherwise infer from the last attempt.
    const ok = typeof spec.ok === "boolean" ? spec.ok : attempts[attempts.length - 1] === "passed";
    const failedOnce = attempts.some((s) => s === "failed" || s === "timedOut");

    // A flow id can appear more than once (multiple stages). Keep the pessimistic view: if any instance
    // ended red the flow is a failure, and only call it flaky when it ended green despite failing once.
    const prior = out.get(flowId);
    const merged: FlowRunOutcome = prior
      ? {
          ok: prior.ok && ok,
          attempts: [...prior.attempts, ...attempts],
          passedOnRetry: (prior.ok && ok) && (prior.passedOnRetry || (ok && failedOnce)),
        }
      : { ok, attempts, passedOnRetry: ok && failedOnce };
    out.set(flowId, merged);
  }

  return out;
}

/** One-line description for the report, e.g. `failed, passed` -> "flaky (passed on retry 1 of 2)". */
export function describeOutcome(o: FlowRunOutcome | undefined): string {
  if (!o) return "outcome unknown (no flows-results.json entry)";
  if (o.passedOnRetry) {
    return `FLAKY — passed on retry (attempts: ${o.attempts.join(" -> ")}); the run ended GREEN for this flow`;
  }
  return o.ok ? `passed (attempts: ${o.attempts.join(" -> ")})` : `failed (attempts: ${o.attempts.join(" -> ")})`;
}
