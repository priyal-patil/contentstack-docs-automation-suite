// core/healing/repairLoop.ts
/**
 * The bounded, stateful retry loop — one per failed (flow, step).
 *
 * Replay reuses the real `executeFlow` rather than reimplementing navigation, login, preflights and
 * `{unique}` templating: the prefix runs as a truncated flow with shared steps enabled, and the
 * remainder runs with `skipSharedSteps` so the session and page position are preserved.
 *
 * THE EMPIRICAL GATE: a candidate is accepted only when the action succeeds **and** the rest of the
 * flow then passes. No heal is ever recorded on the strength of a confidence score alone — which is
 * what makes the optional LLM tier safe, since the model only proposes and the browser decides.
 *
 * State across attempts is on disk (`data/dom/healing/<flow>/<step>/<attempt>.{html,json}`), not in
 * memory, because "the next attempt" may be a separate process.
 */
import fs from "fs";
import path from "path";
import type { Browser, Page } from "@playwright/test";
import { executeFlow } from "../executor";
import { clearDocStepFailures } from "../docStepFailureReporter";
import { extractFromPage, saveAttemptSnapshot, latestAttemptSnapshot } from "./domExtract";
import { findCandidates, rankAll } from "./elementMatcher";
import { referenceFromSelector, enrichFromSnapshot, expectedLabelForStep, docFacingLabel } from "./reference";
import { attemptBudget } from "./flowClassifier";
import { appendCandidate, flowSelectorPath } from "./selectorLayers";
import type { AuditLog } from "./auditLog";
import type { AttemptRecord, Candidate, HealConfig, HealResult, HealTarget } from "./types";

const REPO_ROOT = path.resolve(__dirname, "../..");

/** Known-good reference snapshots curated in the repo, used to recover structural context. */
function curatedSnapshots(project: string): string[] {
  const dir = path.join(REPO_ROOT, "data/dom", project);
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".html") && !f.includes("-failure"))
      .map((f) => path.join(dir, f));
  } catch {
    return [];
  }
}

/**
 * Drop the selector module from Node's require cache so `loadOverrides()` in actionRules.ts re-reads
 * it. `loadOverrides` is not memoised — it calls `require(flowPath)` per invocation — so invalidating
 * the cache entry is sufficient for a freshly written override to take effect in-process.
 */
function invalidateSelectorCache(absPath: string): void {
  try {
    delete require.cache[require.resolve(absPath)];
  } catch {
    /* not cached yet */
  }
}

/**
 * One working clone per attempt, whose `steps` window is moved between calls.
 *
 * Critically NOT a fresh clone per `executeFlow` call. Flows stash cross-step state directly on the
 * flow object — `invite-collaborators` writes the generated invite address to
 * `flow.__brandKitInviteCollaboratorEmail` in an early step and later steps throw
 * "no invite email on flow" without it (rules/core/actionRules.ts). Cloning per call sent the prefix's
 * state to one object and the remainder's read to another, so the remainder always failed. That made
 * the empirical gate reject a candidate the matcher had correctly found at 0.95 confidence — a false
 * negative created entirely by the replay harness.
 */
function makeWorkFlow(flow: any): { flow: any; window: (from: number, to?: number) => any } {
  const work: any = { ...flow };
  return {
    flow: work,
    window: (from: number, to?: number) => {
      work.steps = (flow.steps ?? []).slice(from, to);
      return work;
    },
  };
}

/**
 * Is the page in a state where searching for a documented element is meaningless?
 *
 * Checked in the live browser rather than against a saved snapshot, because that is the only place
 * these signals are reliable: the app inlines its whole JS bundle into `page.content()`, so grepping a
 * snapshot for phrases like "something went wrong" matches the bundled i18n table and React component
 * definitions, not rendered UI. The URL and a rendered-body measurement are trustworthy; keyword
 * matching over 25 MB of inlined script is not.
 */
async function environmentFailure(page: Page): Promise<string | undefined> {
  const url = page.url();
  if (/#!\/login|\/login\b|\/sso\/|accounts\.contentstack\.com/i.test(url)) {
    return `session is not authenticated (landed on ${url})`;
  }
  if (/^about:blank$/i.test(url)) return "page never navigated (about:blank)";

  const state = await page
    .evaluate(() => {
      const body = document.body;
      return {
        renderedChars: (body?.innerText ?? "").replace(/\s+/g, " ").trim().length,
        interactive: document.querySelectorAll("button, a, input, [role]").length,
      };
    })
    .catch(() => undefined);

  if (!state) return "could not evaluate page state";
  // A real app screen always renders some text and some controls.
  if (state.renderedChars < 40 && state.interactive < 3) {
    return `page did not render (${state.renderedChars} visible chars, ${state.interactive} controls)`;
  }
  return undefined;
}

/**
 * Flows whose preflight consumes leading steps cannot be safely truncated — the indices in
 * `preflight.leadingStepsBeforeExecuteFlowBefore` would no longer line up.
 */
function unsafeToTruncate(flow: any, resumeStep: number): string | undefined {
  const pf = flow?.preflight;
  if (!pf || typeof pf !== "object") return undefined;
  const leading = Number(pf.leadingStepsBeforeExecuteFlowBefore);
  if (Number.isFinite(leading) && leading > 0 && resumeStep < leading) {
    return `flow has preflight.leadingStepsBeforeExecuteFlowBefore=${leading} and the failure is at step ${resumeStep + 1}; truncating would misalign preflight indices`;
  }
  return undefined;
}

export type RepairDeps = {
  browser: Browser;
  audit: AuditLog;
  /** Optional LLM tier, consulted only when every rule tier misses. */
  escalate?: (args: {
    target: HealTarget;
    live: ReturnType<typeof rankAll> extends any ? any : never;
    expectedLabel: string;
  }) => Promise<Candidate | undefined>;
  /** Absolute deadline for the whole run. */
  deadline: number;
  log?: (msg: string) => void;
};

/**
 * Replay a whole flow and report whether it completes.
 *
 * Used to verify a doc-sourced flow-JSON correction. Applying the edit is not evidence that it worked:
 * the spec this implements requires re-running the corrected step, and a correction that still fails is a
 * genuine documentation defect rather than a fixed test. Without this the agent would claim a fix it had
 * never exercised.
 */
export async function replayFlowAfterCorrection(args: {
  browser: Browser;
  flowPath: string;
  log?: (m: string) => void;
}): Promise<{ passed: boolean; failedStepNumber?: number; error?: string }> {
  const flow = JSON.parse(fs.readFileSync(args.flowPath, "utf8"));
  invalidateSelectorCache(
    flowSelectorPath(String(flow.project ?? ""), String(flow.module ?? ""), String(flow.id ?? ""))
  );

  const context = await args.browser.newContext({
    storageState: fs.existsSync(path.join(REPO_ROOT, "auth.json"))
      ? path.join(REPO_ROOT, "auth.json")
      : undefined,
  });
  const page = await context.newPage();

  clearDocStepFailures();
  try {
    await executeFlow(page, flow);
    return { passed: true };
  } catch (err: any) {
    const { getDocStepFailures } = require("../docStepFailureReporter");
    const fails = (getDocStepFailures?.() ?? []) as Array<{ stepNumber?: number }>;
    return {
      passed: false,
      failedStepNumber: fails.find((f) => typeof f.stepNumber === "number")?.stepNumber,
      error: String(err?.message ?? err).split("\n")[0],
    };
  } finally {
    clearDocStepFailures();
    await context.close().catch(() => {});
  }
}

export async function repairLoop(
  target: HealTarget,
  cfg: HealConfig,
  deps: RepairDeps
): Promise<HealResult> {
  const log = deps.log ?? ((m: string) => console.log(m));
  const flow = JSON.parse(fs.readFileSync(target.flowPath, "utf8"));
  const budget = attemptBudget(target.mutability, cfg);
  const attempts: AttemptRecord[] = [];
  const flowDeadline = Date.now() + cfg.perFlowTimeoutMs;

  deps.audit.targetStarted(target.flowId, target.stepNumber, target.target, budget);

  // A heal needs something to search WITH: either a doc-facing label, or a stable attribute carried in
  // the failed selector. With neither, the fuzzy tier ends up comparing an internal identifier against
  // real accessible names, matches nothing, and the result is misreported as genuine doc/app drift.
  // Five attempts of ~60s polling are spent proving nothing. Decide this before opening a browser.
  {
    const step0 = flow.steps?.[target.stepIndex] ?? {};
    const { label, source } = docFacingLabel(step0, target.target, target.currentSelector);
    const ref0 = referenceFromSelector(target.currentSelector, label);
    const hasAnchor = !!(ref0?.testId || ref0?.ariaLabel || ref0?.name || ref0?.id);
    if (!label && !hasAnchor) {
      const result: HealResult = {
        target,
        outcome: "skipped",
        attempts,
        genuineFailureReason:
          `No usable search term: the step has no expected label, its selector has no text predicate, ` +
          `and "${target.target}" is an internal identifier rather than a UI label. This is NOT a ` +
          `documentation finding — the agent had nothing to search for. Add expected.labelEquals to the ` +
          `step, or a :has-text() predicate to its selector, to make it healable.`,
      };
      log(`⏭️  no usable search term (label source: ${source}) — not attempted, and not reported as drift`);
      deps.audit.targetFinished(result);
      return result;
    }
  }

  const blocked = unsafeToTruncate(flow, target.stepIndex);
  if (blocked) {
    const result: HealResult = {
      target,
      outcome: "skipped",
      attempts,
      genuineFailureReason: `Not attempted: ${blocked}`,
    };
    deps.audit.targetFinished(result);
    return result;
  }

  // Attempt budget is scoped per (flowId, stepIndex): healing step 3 then failing at step 5 gives
  // step 5 its own fresh budget, rather than inheriting a partly-spent counter.
  const spent = new Map<number, number>();
  let resumeStep = target.stepIndex;
  let closest: Candidate[] = [];
  let envFailures = 0;

  while (true) {
    const used = spent.get(resumeStep) ?? 0;
    if (used >= budget) break;
    if (Date.now() > Math.min(deps.deadline, flowDeadline)) {
      log(`⏱️  timeout reached for ${target.flowId}; stopping`);
      break;
    }
    spent.set(resumeStep, used + 1);
    const attempt = used + 1;

    const record: AttemptRecord = { attempt, stepIndex: resumeStep, strategiesTried: [] };
    // Fresh context per attempt — no cookies or state leaking between attempts or flows.
    const context = await deps.browser.newContext({
      storageState: fs.existsSync(path.join(REPO_ROOT, "auth.json"))
        ? path.join(REPO_ROOT, "auth.json")
        : undefined,
    });
    const page = await context.newPage();

    try {
      const step = flow.steps[resumeStep];
      // Doc-facing label only — never the raw internal target. See docFacingLabel().
      const expectedLabel =
        docFacingLabel(step, target.target, target.currentSelector).label ??
        expectedLabelForStep(step, target.target);
      // Shared across the prefix and remainder runs of THIS attempt so flow-object state survives.
      const work = makeWorkFlow(flow);

      // ---- Replay the already-passing prefix through the real executor --------------------------
      if (resumeStep > 0) {
        clearDocStepFailures();
        await executeFlow(page, work.window(0, resumeStep));
        clearDocStepFailures(); // replay failures must not pollute the original report
      }

      // ---- Environment precondition ------------------------------------------------------------
      // If the session died or the page never rendered, the element's absence says nothing about the
      // documentation. Retry (it may be transient), but never let this become a doc-drift report.
      const envProblem = await environmentFailure(page);
      if (envProblem) {
        envFailures += 1;
        record.error = `environment: ${envProblem}`;
        record.strategiesTried.push({
          strategy: "original-selector",
          confidence: 0,
          note: `skipped matching — ${envProblem}`,
        });
        const saved = await saveAttemptSnapshot(page, {
          snapshotDir: cfg.snapshotDir,
          flowId: target.flowId,
          stepIndex: resumeStep,
          attempt,
        });
        record.snapshotSaved = saved?.htmlPath;
        record.screenshotSaved = saved?.pngPath;
        attempts.push(record);
        deps.audit.attempt(target.flowId, record);
        log(`🌐 attempt ${attempt}: ${envProblem}`);
        continue;
      }

      // ---- Build the reference -----------------------------------------------------------------
      let reference = referenceFromSelector(target.currentSelector, expectedLabel);
      if (reference) {
        const priorSnapshot = latestAttemptSnapshot(cfg.snapshotDir, target.flowId, resumeStep);
        reference = enrichFromSnapshot(reference, [
          ...(priorSnapshot ? [priorSnapshot] : []),
          ...(target.snapshotPath ? [target.snapshotPath] : []),
          ...curatedSnapshots(target.project),
        ]);
      }

      // ---- Wait for the app to render, then search ----------------------------------------------
      //
      // A normal Playwright step gets auto-waiting for free: `expect(locator).toBeVisible({timeout})`
      // retries for up to 90s. Snapshotting the DOM once, immediately, does not — and this app inlines
      // a multi-megabyte JS bundle, so `page.content()` is large and superficially plausible while the
      // SPA has rendered nothing at all. Reading it too early yields "element not found" and would be
      // reported as genuine doc drift. So poll until a candidate appears or the step's own timeout
      // budget is spent.
      const settleMs = Math.min(60_000, Math.max(15_000, Number(step?.timeoutMs ?? 30_000)));
      const settleDeadline = Date.now() + settleMs;

      await page.waitForLoadState("domcontentloaded").catch(() => {});
      await page.waitForLoadState("networkidle").catch(() => {});

      let live = await extractFromPage(page);
      let matchInput = { reference, expectedLabel, live, confidenceThreshold: cfg.confidenceThreshold };
      let candidates = findCandidates(matchInput);
      let polls = 0;

      while (!candidates.length && Date.now() < settleDeadline) {
        await page.waitForTimeout(1500);
        polls += 1;
        live = await extractFromPage(page);
        matchInput = { reference, expectedLabel, live, confidenceThreshold: cfg.confidenceThreshold };
        candidates = findCandidates(matchInput);
      }
      closest = rankAll(matchInput).slice(0, 5);

      if (polls > 0) {
        record.strategiesTried.push({
          strategy: "original-selector",
          confidence: 0,
          note: `waited ${polls} poll(s) (~${(polls * 1.5).toFixed(1)}s) for the app to render; ${live.length} elements visible at match time`,
        });
      }

      for (const c of candidates) {
        record.strategiesTried.push({ strategy: c.strategy, confidence: c.confidence, selector: c.selector });
      }

      // ---- Optional LLM tier: only when every rule tier missed ---------------------------------
      if (!candidates.length && cfg.enableLlmEscalation && deps.escalate) {
        const proposed = await deps
          .escalate({ target, live, expectedLabel })
          .catch(() => undefined);
        if (proposed) {
          candidates = [proposed];
          record.strategiesTried.push({
            strategy: "llm-escalation",
            confidence: proposed.confidence,
            selector: proposed.selector,
            note: "proposal only — accepted solely if the empirical replay passes",
          });
        }
      }

      if (!candidates.length) {
        record.strategiesTried.push({ strategy: "stable-attribute", confidence: 0, note: "no candidate cleared threshold" });
        const saved = await saveAttemptSnapshot(page, {
          snapshotDir: cfg.snapshotDir,
          flowId: target.flowId,
          stepIndex: resumeStep,
          attempt,
        });
        record.snapshotSaved = saved?.htmlPath;
        record.screenshotSaved = saved?.pngPath;
        attempts.push(record);
        deps.audit.attempt(target.flowId, record);
        continue;
      }

      // ---- Apply the candidate by WRITING it, then let the browser decide -----------------------
      //
      // Driving the locator directly for just the failing step is not enough. This repo routinely
      // reuses one target key across consecutive steps — `create-a-brand-kit` has `verify` then
      // `click` on "Brand Kits page New Brand Kit primary" — and every later step re-resolves its
      // selector from the file. A direct-apply therefore heals the verify and then fails on the click
      // with the same stale selector.
      //
      // Writing the fix first fixes every step that shares the key, and means the empirical gate runs
      // through the real `loadOverrides()` resolution path instead of a bypass. That also proves the
      // override actually intercepts the code path, which a direct-apply can never show.
      const chosen = candidates[0];
      record.chosen = chosen;

      const selFile = flowSelectorPath(target.project, target.module, target.flowId);
      const fileBefore = fs.existsSync(selFile) ? fs.readFileSync(selFile, "utf8") : undefined;

      const written = appendCandidate({
        project: target.project,
        moduleName: target.module,
        flowId: target.flowId,
        target: target.target,
        kind: target.action.toLowerCase() === "enter" ? "input" : "click",
        candidate: chosen,
        inheritedChain: target.currentSelector,
        stepNumber: target.stepNumber,
        runId: process.env.GITHUB_RUN_ID,
        dryRun: false, // always written for the test; reverted below unless the heal is confirmed
      });

      /** Restore the selector file to exactly its pre-attempt state. */
      const revertFile = () => {
        try {
          if (fileBefore === undefined) fs.rmSync(selFile, { force: true });
          else fs.writeFileSync(selFile, fileBefore, "utf8");
        } catch {
          /* best effort */
        }
        invalidateSelectorCache(selFile);
      };

      invalidateSelectorCache(selFile);
      record.actionSucceeded = true; // the fix is in place; the replay below is the real verdict

      // ---- Replay from the failed step onward; a heal only counts if the flow finishes ----------
      let remainderError: string | undefined;
      let failedDownstreamAt: number | undefined;
      clearDocStepFailures();
      try {
        // Includes the previously failing step, which now resolves through the written override.
        await executeFlow(page, work.window(resumeStep), { skipSharedSteps: true });
        record.remainderPassed = true;
      } catch (err: any) {
        record.remainderPassed = false;
        remainderError = err?.message ?? String(err);
        // Map the downstream failure back to an absolute index in the original flow.
        const { getDocStepFailures } = require("../docStepFailureReporter");
        const fails = (getDocStepFailures?.() ?? []) as Array<{ stepIndex?: number }>;
        const rel = fails.find((f) => typeof f.stepIndex === "number")?.stepIndex;
        failedDownstreamAt = typeof rel === "number" ? resumeStep + rel : undefined;
      } finally {
        clearDocStepFailures();
      }

      // Keep the write only on a confirmed heal outside dry-run; otherwise leave the tree untouched.
      if (!record.remainderPassed || cfg.dryRun) revertFile();

      const saved = await saveAttemptSnapshot(page, {
        snapshotDir: cfg.snapshotDir,
        flowId: target.flowId,
        stepIndex: resumeStep,
        attempt,
      });
      record.snapshotSaved = saved?.htmlPath;
        record.screenshotSaved = saved?.pngPath;

      if (record.remainderPassed) {
        attempts.push(record);
        deps.audit.attempt(target.flowId, record);
        const result: HealResult = {
          target,
          outcome: "healed",
          attempts,
          resolvedSelector: chosen.selector,
          newChain: written.newChain,
          writtenTo: cfg.dryRun ? undefined : written.file,
          resolvedBy: chosen.strategy,
          closestCandidates: closest,
        };
        deps.audit.targetFinished(result);
        return result;
      }

      // Progressive advancement: this step is healed, but a later step failed. Retarget the loop at
      // the new failure point, which gets its own fresh budget.
      record.error = remainderError;
      attempts.push(record);
      deps.audit.attempt(target.flowId, record);

      if (typeof failedDownstreamAt === "number" && failedDownstreamAt !== resumeStep) {
        log(`↪️  ${target.flowId}: step ${resumeStep + 1} healed, now failing at step ${failedDownstreamAt + 1}`);
        resumeStep = failedDownstreamAt;
      }
    } catch (err: any) {
      record.error = err?.message ?? String(err);
      attempts.push(record);
      deps.audit.attempt(target.flowId, record);
    } finally {
      await context.close().catch(() => {});
    }
  }

  // Every attempt hit an environment problem, so we never actually got to look for the element. This
  // is infrastructure noise, not documentation drift — keep it out of the writers' report.
  if (attempts.length > 0 && envFailures === attempts.length) {
    const result: HealResult = {
      target,
      outcome: "environment-failure",
      attempts,
      genuineFailureReason: `Could not evaluate the step: ${attempts[attempts.length - 1].error ?? "environment failure"}. No conclusion about the documentation.`,
      closestCandidates: [],
    };
    deps.audit.targetFinished(result);
    return result;
  }

  const result: HealResult = {
    target,
    outcome: "genuine-failure",
    attempts,
    genuineFailureReason:
      attempts.some((a) => a.chosen)
        ? `A candidate was found and applied but the flow still did not complete after ${attempts.length} attempt(s).`
        : `No element candidate cleared the confidence threshold (${cfg.confidenceThreshold}) in ${attempts.length} attempt(s).`,
    closestCandidates: closest,
  };
  deps.audit.targetFinished(result);
  return result;
}
