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
