/**
 * [Create an Entry Variant](https://www.contentstack.com/docs/content-managers/entry-variants/create-an-entry-variant)
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Create an Entry Variant doc: entry editor variant scope dropdown [Base Entry] (doc step)":
    'button:has-text("Base Entry"), button:has-text("[Base Entry]"), [aria-haspopup="listbox"]:has-text("Base Entry"), combobox:has-text("Base Entry")',

  /** Prefer **`actionRules`** pick step (`rowContains` / env); this is fallback only */
  "Create an Entry Variant doc: variant scope dropdown option fallback (doc step)":
    '[role="listbox"] [role="option"], ul[role="listbox"] [role="option"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  /**
   * This flow types into the CMS entry editor, but its `Entry Title (doc step)` key lived only in
   * `projects/CMS/entries/selectors/module.selectors.ts` — another project's module map, which is not on
   * this flow's override chain (shared -> legacy -> project -> module -> flow). With nothing resolving,
   * `enter` fell back to searching the page for the literal string "Entry Title (doc step)", which cannot
   * match. Copied verbatim from the CMS map rather than re-derived.
   */
  "Entry Title (doc step)":
    '[data-test-id="cs-title-input"] input, input[name="title"], input[placeholder*="title" i], input[aria-label*="title" i]',
};
