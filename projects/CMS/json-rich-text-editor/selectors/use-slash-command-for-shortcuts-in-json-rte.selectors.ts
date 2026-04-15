/**
 * Flow-specific overrides for use-slash-command-for-shortcuts-in-json-rte.
 * Recovery locators from live app / manual runs (see doc-step-failures if a step flakes).
 */

export const CLICK_SELECTORS: Record<string, string> = {
  /** Entries listing — primary control from app (top toolbar). */
  "New Entry (doc step)":
    '[data-test-id="cs-new-entry-all-entry"], button[aria-label="Create New Entry"], .PageLayout__head button:has-text("New Entry"), button.Button--primary:has-text("New Entry")',
  /** After row select: enabled id is cs-new-entry-single-proceed; disabled is cs-new-entry-single-proceed-disable. */
  "Proceed (Select Content Type modal) (doc step)":
    '[data-test-id="cs-new-entry-single-proceed"], button[aria-label="Proceed"]:not([disabled])',
  "Create Entry (doc step)":
    '[data-test-id="cs-new-entry-single-proceed"], button[aria-label="Proceed"]:not([disabled])',
  /** Entry editor Save (not locked / localized save variant). */
  "Save entry from editor (doc step)":
    '[data-test-id="cs-entry-not-locked-and-localized-save"], [data-test-id="cs-entry-save"]',
};

/** Title field on new entry: live stack may use placeholder "Type something..." without cs-title-input. */
export const INPUT_SELECTORS: Record<string, string> = {
  "Entry Title (doc step)":
    '[data-test-id="cs-title-input"] input:not([type="number"]), [data-test-id="cs-single-line-field-title"] input:not([type="number"]), [data-test-id="cs-edit-entry-field-title"] input, input[placeholder*="Type something" i]:not([type="number"])',
};
