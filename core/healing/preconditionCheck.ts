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
