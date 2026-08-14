// core/fieldLabelFromTarget.ts
/**
 * Decides whether a step's `target` may be used as UI text when no selector override resolved.
 *
 * Step targets are INTERNAL identifiers. They routinely carry a `(doc step)` suffix and often a
 * `<Doc name> doc:` prefix, and they frequently describe a control rather than naming it
 * ("Personalize New Project Name field"). The `enter` action's last-resort resolver used to interpolate
 * the raw target into `getByLabel` / `getByPlaceholder` / `input[name=…]`, which searched real pages for
 * strings no page can contain:
 *
 *   getByLabel(/Personalize New Project Name field \(doc step\)/i)
 *
 * Every such step failed on a 30s timeout, and the resulting wall of locator text read like application
 * drift rather than a missing selector — which is how one of them survived long enough to be diagnosed
 * as a doc problem. Measured across the repo, at least 162 `enter` steps were in this state, with no
 * reachable selector key and no dedicated branch.
 *
 * Extracted from `rules/core/actionRules.ts` so the rule is unit-testable; that file is ~1.9M characters
 * and the logic sat inside one arm of a very large switch.
 */

/** Nouns that name a KIND of control rather than a control's label. */
const CONTROL_KIND_TAIL = /\b(field|input|textbox|textarea|dropdown|button|icon|modal|panel|row|tab|menu|link|checkbox|toggle|pill|confirmation)$/i;

export type FieldLabelDecision = {
  /** The target with the repo's internal decorations removed. */
  uiName: string;
  /** Whether `uiName` may be searched for as a field label/placeholder/name. */
  usable: boolean;
  /** Why it was rejected — used to build an actionable error. */
  reason?: "empty" | "internal-prefix" | "too-long" | "describes-a-control";
};

/**
 * Strip the internal decorations, then decide whether what remains is plausibly a field label.
 *
 * Conservative by design. A wrong guess here does not fail the step — it fills the WRONG field and lets
 * the run continue green, which corrupts the result far more expensively than stopping does. So anything
 * still bearing the shape of an internal name is rejected rather than approximated.
 */
export function fieldLabelFromTarget(target: string): FieldLabelDecision {
  const uiName = String(target ?? "")
    // "Create Event doc: Foo" -> "Foo"; also handles "DAL Lytics doc: Title field".
    .replace(/\s*\(doc step\)\s*$/i, "")
    .replace(/^.*?\bdoc:\s*/i, "")
    .trim();

  if (!uiName) return { uiName, usable: false, reason: "empty" };
  // A surviving colon means a qualifier we failed to strip, so we are still holding an internal name.
  if (uiName.includes(":")) return { uiName, usable: false, reason: "internal-prefix" };
  if (uiName.split(/\s+/).length > 5) return { uiName, usable: false, reason: "too-long" };
  // Multi-word phrases ENDING in a kind word describe the control ("Name field") instead of naming it
  // ("Name"). A bare kind word is a legitimate label and must survive — CMS really does have a field
  // labelled "Description", and Personalize a button labelled "Proceed".
  if (uiName.split(/\s+/).length >= 2 && CONTROL_KIND_TAIL.test(uiName)) {
    return { uiName, usable: false, reason: "describes-a-control" };
  }
  return { uiName, usable: true };
}

/** The actionable message for a step whose target cannot stand in for a selector. */
export function missingSelectorMessage(args: {
  target: string;
  project?: string;
  module?: string;
  flowId?: string;
  reason?: FieldLabelDecision["reason"];
}): string {
  const project = args.project || "<project>";
  const moduleName = args.module || "<module>";
  const flowId = args.flowId || "<flowId>";
  return (
    `${flowId}: no selector resolved for enter step "${args.target}", and its target is an internal ` +
    `identifier (${args.reason ?? "not a field label"}) rather than a field label, so it cannot be ` +
    `searched for on the page.\n` +
    `Add it to projects/${project}/${moduleName}/selectors/${flowId}.selectors.ts (flow-scoped), or to ` +
    `projects/${project}/${moduleName}/selectors/module.selectors.ts / ` +
    `projects/${project}/selectors/project.selectors.ts when several flows share the field.\n` +
    `NOTE: a key defined in ANOTHER flow's .selectors.ts is not visible here — overrides merge as ` +
    `shared -> legacy -> project -> module -> flow, so a flow-scoped file applies to that flow alone. ` +
    `This is the most common cause: the key exists, filed where this flow cannot reach it.`
  );
}
