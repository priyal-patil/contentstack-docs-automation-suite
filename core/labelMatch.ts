// core/labelMatch.ts
/**
 * Compares a DOCUMENTED label with the label an element actually exposes.
 *
 * Split out of `rules/core/actionRules.ts` so the rule is unit-testable — the comparison there sat inside
 * `assertLabelMatch`, which needs a live Playwright `Locator` and therefore a browser.
 *
 * THE ICON CONVENTION. Contentstack docs write primary "create" controls with a leading plus —
 * "**+ New Event**", "**+ Invite User**", "**+ Add Stacks**" — where the `+` denotes the button's plus
 * ICON, not literal text. When the app renders that plus as an icon element rather than a text node the
 * accessible name is just "Invite User", and a literal comparison fails even though the document and the
 * application agree completely. 156 `expected.labelEquals` / `modalTitle` values across 10 projects use
 * this convention.
 *
 * This cost real time. Personalize `user-permissions-invite-user` step 12 failed on it; the button was
 * present and correct (its classes included `Button--icon-alignment-left`, i.e. the icon). The
 * self-healing agent then re-found that exact button twice from the saved DOM, replayed through its own
 * correct selector, hit this same comparison, and reported a "genuine doc/app mismatch" — because its
 * success gate only asks whether the flow completed, so it cannot tell a wrong selector from a right
 * selector followed by a broken assertion.
 */

/** Lowercase and collapse whitespace. Mirrors `normalizeLabelText` in actionRules.ts. */
export function normalizeLabelText(s: string): string {
  return (s || "").replace(/\s+/g, " ").trim().toLowerCase();
}

/** Drop a leading `+` (and following space) — the documented stand-in for a plus icon. */
export function withoutLeadingIconGlyph(s: string): string {
  return s.replace(/^\s*\+\s*/, "").trim();
}

export type LabelMatchMode = "exact" | "contains";

/**
 * Does `actual` satisfy the documented `expected`?
 *
 * Only the EXPECTED side is relaxed, and only a LEADING plus:
 *   - a `+` elsewhere in the string stays significant
 *   - a plus the app shows but the document omits is left alone
 *
 * So this cannot mask a genuine wording difference — the case this agent exists to find. It only stops an
 * icon from being compared as though it were text.
 */
export function labelMatches(actualRaw: string, expectedRaw: string, mode: LabelMatchMode = "contains"): boolean {
  const actual = normalizeLabelText(actualRaw);
  const expected = normalizeLabelText(expectedRaw);
  if (!actual || !expected) return false;

  const hit = (exp: string) => (mode === "exact" ? actual === exp : actual.includes(exp));
  if (hit(expected)) return true;

  if (expected.startsWith("+")) {
    const stripped = normalizeLabelText(withoutLeadingIconGlyph(expected));
    // Guard the wildcard: an expected label of just "+" strips to "", and `actual.includes("")` is true
    // for every string, which would make the check pass against any element on the page.
    if (stripped) return hit(stripped);
  }
  return false;
}
