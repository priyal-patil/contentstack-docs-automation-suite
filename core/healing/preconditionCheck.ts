// core/healing/preconditionCheck.ts
/**
 * Detects failures where the element was **found** but was not in a usable state.
 *
 * Found by running the agent against the real Developer-Hub run 30870235729: 6 of 13 failures (46%)
 * were `toBeEnabled` / `toBeChecked` assertions, not missing elements. The control was located and
 * visible — it was simply disabled, or a toggle was in the wrong state.
 *
 * This matters because the agent's entire premise is "the element moved, find it again". If the element
 * was never lost, searching for a different selector is wasted work that then gets reported to
 * technical writers as a doc/app mismatch. Both conclusions are wrong: nothing is missing and the
 * documentation is not at fault. The real cause is an unmet precondition — a required field left empty,
 * a quota reached, an entitlement missing.
 *
 * The clearest instance in that run:
 *
 *   Developer Hub "+ New App" (button[data-test-id="new-app-cta"]) did not become enabled.
 *   If this persists, check org Developer Hub app limits, plan entitlements, ...
 *   Expected: enabled / Received: disabled
 *
 * The selector is perfect. The org has hit its app limit.
 */

export type PreconditionKind = "control-disabled" | "wrong-ui-state";

export type PreconditionVerdict = {
  isPrecondition: boolean;
  kind?: PreconditionKind;
  reason: string;
  /** Framework hint about what to satisfy, when the message volunteers one. */
  hint?: string;
};

/** The element was located but is not actionable. */
const DISABLED = [
  /did not become enabled/i,
  /stayed disabled/i,
  /toBeEnabled[\s\S]{0,40}failed/i,
  /Expected:\s*enabled[\s\S]{0,40}Received:\s*disabled/i,
];

/** The element was located but holds the wrong value/state. */
const WRONG_STATE = [
  /toBeChecked[\s\S]{0,40}failed/i,
  /Object\.is equality/i,
  /Expected:\s*checked/i,
];

/**
 * Sentences the framework adds to explain what precondition is unmet. Surfacing these is the whole
 * value of the category — they tell a human exactly what to fix.
 */
function extractHint(message: string): string | undefined {
  const patterns = [
    /If this persists, ([^.]+)\./i,
    /—\s*(provide [^.]+)\./i,
    /—\s*([^.—]*(?:limit|entitlement|required|select)[^.—]*)\./i,
  ];
  for (const p of patterns) {
    const m = p.exec(message);
    if (m?.[1]) return m[1].replace(/\s+/g, " ").trim();
  }
  return undefined;
}

export function checkPrecondition(args: {
  errorMessage?: string;
  missingElementSummary?: string;
}): PreconditionVerdict {
  const message = `${args.errorMessage ?? ""}\n${args.missingElementSummary ?? ""}`;

  if (DISABLED.some((re) => re.test(message))) {
    const hint = extractHint(message);
    return {
      isPrecondition: true,
      kind: "control-disabled",
      hint,
      reason:
        `the control was found but is disabled, so no selector change can help — an unmet precondition ` +
        `is blocking it${hint ? `: ${hint}` : ""}`,
    };
  }

  if (WRONG_STATE.some((re) => re.test(message))) {
    return {
      isPrecondition: true,
      kind: "wrong-ui-state",
      hint: extractHint(message),
      reason:
        "the element was found but holds the wrong state (toggle/value assertion), which is a " +
        "behaviour difference rather than a locator or documentation problem",
    };
  }

  return { isPrecondition: false, reason: "not a precondition failure" };
}

/**
 * An action timed out on a target that a `verify` had just passed.
 *
 * Named for what is OBSERVED, not for a mechanism. An earlier version of this was called
 * "verifiedThenAbsent" and claimed the element had disappeared — that claim was false. Screenshotting
 * BrandKit's `delete-a-voice-profile` immediately after step 9 showed the menu OPEN, with the Delete item
 * present, and still present 20 seconds later. The earlier "element is gone" reading came from the healing
 * agent's own ~58s settle wait: by the time it captured the DOM, the page had moved on. The instrumentation
 * distorted the evidence.
 *
 * What is actually true: step 9 `verify "Delete"` passes, step 10 `click "Delete"` waits out its entire
 * timeout, and the element exists throughout. The likeliest cause is that the ACTION's locator resolves to
 * something different from the one that was verified — in that flow, `rowContains: "AUTO-VP-"` is a prefix
 * matching two rows, so the click can scope to a row whose menu is closed while the verify matched the row
 * whose menu is open.
 *
 * Either way the conclusion is the same and is the only thing this classifier asserts: the target is not
 * missing, so no selector replacement applies, and nothing here is documentation drift. It must not reach
 * the technical writers.
 *
 * Detection relies on a guarantee from `parseFailureReport`: it keeps only the EARLIEST real failure per
 * flow, so if the target is step N then step N-1 did not fail. A preceding `verify` on the same target is
 * therefore known to have passed.
 */export type ActionTimeoutVerdict = {
  /** True when an action waited out its timeout on a target a preceding verify had passed. */
  timedOutAfterVerify: boolean;
  reason: string;
  /** The verify step that passed on the same target, 1-based. */
  verifiedAtStep?: number;
};

/** Errors consistent with waiting for something that never became actionable. */
const WAITED_OUT = [
  /Timeout\s+\d+ms exceeded/i,
  /Target page, context or browser has been closed/i,
  /exceeded while waiting/i,
];

const ACTION_STEP = /^(click|enter|select|upload|press|hover|drag)$/i;

export function checkActionTimedOutAfterVerify(args: {
  /** The flow definition, so the preceding step can be inspected. */
  flow: { steps?: Array<Record<string, unknown>> };
  /** Zero-based index of the failing step. */
  stepIndex: number;
  errorMessage?: string;
}): ActionTimeoutVerdict {
  const steps = args.flow?.steps ?? [];
  const step = steps[args.stepIndex];
  const prev = args.stepIndex > 0 ? steps[args.stepIndex - 1] : undefined;
  const msg = args.errorMessage ?? "";

  if (!step || !prev) return { timedOutAfterVerify: false, reason: "no preceding step to compare" };
  if (!ACTION_STEP.test(String(step["action"] ?? ""))) {
    return { timedOutAfterVerify: false, reason: "failing step is not an action" };
  }
  if (!WAITED_OUT.some((re) => re.test(msg))) {
    return { timedOutAfterVerify: false, reason: "error is not a wait-timeout signature" };
  }
  if (String(prev["action"] ?? "").toLowerCase() !== "verify") {
    return { timedOutAfterVerify: false, reason: "preceding step is not a verify" };
  }
  if (String(prev["target"] ?? "") !== String(step["target"] ?? "")) {
    return { timedOutAfterVerify: false, reason: "preceding verify targets something else" };
  }

  return {
    timedOutAfterVerify: true,
    verifiedAtStep: args.stepIndex,
    reason:
      `step ${args.stepIndex} verified "${step["target"]}" and passed, then step ${args.stepIndex + 1} ` +
      `waited out its timeout acting on the same target. The element is therefore present — what fails is ` +
      `the action's own locator resolution, most often an ambiguous scope (a row hint matching several ` +
      `rows, so the action targets a different element than the verify did). Not locator drift and not ` +
      `documentation drift: the target exists, so no selector replacement applies.`,
  };
}
