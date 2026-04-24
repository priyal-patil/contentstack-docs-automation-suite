/**
 * Playwright JSON reporter: when a CMS module uses one test + many test.step() (continue-on-fail),
 * per-flow results live under results[0].steps (category "test.step", title = flow id).
 * Playwright 1.58+ JSON often omits `category` on those leaves; we treat title-only leaves the same.
 * This module expands those into one row per flow for merge/summary/Excel/retry scripts.
 */
import { flowIdFromPlaywrightSpecTitle } from "./parseFlowSpecTitle";

export type PwStepJson = {
  title?: string;
  category?: string;
  duration?: number;
  error?: { message?: string };
  steps?: PwStepJson[];
};

export type ExpandedFlowResult = {
  flowId: string;
  status: string;
  durationMs: number;
  error?: string;
};

function inferStatusFromErrorMessage(msg: string): "failed" | "timedOut" {
  return /timeout/i.test(msg) ? "timedOut" : "failed";
}

function pushFlowStepLeaf(s: PwStepJson, title: string, out: ExpandedFlowResult[]): void {
  const msg = String(s.error?.message || "").trim();
  if (msg) {
    const st = inferStatusFromErrorMessage(msg);
    out.push({
      flowId: title,
      status: st,
      durationMs: Number(s.duration ?? 0),
      error: msg.slice(0, 2000),
    });
  } else {
    out.push({
      flowId: title,
      status: "passed",
      durationMs: Number(s.duration ?? 0),
    });
  }
}

function collectTestStepFlows(steps: PwStepJson[] | undefined, out: ExpandedFlowResult[]): void {
  for (const s of steps || []) {
    const cat = String(s.category || "").toLowerCase();
    const title = String(s.title || "").trim();
    const childSteps = s.steps?.length ? s.steps : undefined;

    if (cat === "test.step" && title) {
      pushFlowStepLeaf(s, title, out);
      continue;
    }

    // JSON reporter may omit category on test.step leaves (title still = flow id).
    if (cat === "" && title && !childSteps) {
      pushFlowStepLeaf(s, title, out);
      continue;
    }

    if (childSteps) collectTestStepFlows(childSteps, out);
  }
}

/**
 * One spec → one or more flow rows (multi-row when test.step batching is used).
 */
export function expandPlaywrightSpecToFlowResults(spec: {
  title?: string;
  tests?: Array<{
    results?: Array<{
      status?: string;
      duration?: number;
      error?: { message?: string };
      steps?: PwStepJson[];
    }>;
  }>;
}): ExpandedFlowResult[] {
  const t = spec.tests?.[0];
  const r = t?.results?.[0];
  if (!r) return [];

  const fromSteps: ExpandedFlowResult[] = [];
  collectTestStepFlows(r.steps, fromSteps);
  if (fromSteps.length > 0) return fromSteps;

  const status = String(r.status || "unknown");
  const flowId = flowIdFromPlaywrightSpecTitle(String(spec.title || ""));
  const err = String(r.error?.message || "").trim();
  return [
    {
      flowId,
      status,
      durationMs: Number(r.duration ?? 0),
      error: err ? err.slice(0, 2000) : undefined,
    },
  ];
}

/** Collect flow ids from failed / timedOut test.step leaves (for --grep retry). */
export function collectFailedTitlesFromTestSteps(steps: PwStepJson[] | undefined, failedTitles: Set<string>): void {
  for (const s of steps || []) {
    const cat = String(s.category || "").toLowerCase();
    const title = String(s.title || "").trim();
    const childSteps = s.steps?.length ? s.steps : undefined;

    if (cat === "test.step" && title) {
      const msg = String(s.error?.message || "").trim();
      if (msg) failedTitles.add(title);
      continue;
    }

    if (cat === "" && title && !childSteps) {
      const msg = String(s.error?.message || "").trim();
      if (msg) failedTitles.add(title);
      continue;
    }

    if (childSteps) collectFailedTitlesFromTestSteps(childSteps, failedTitles);
  }
}
