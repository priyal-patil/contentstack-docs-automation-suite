/**
 * Block-level properties (doc part 1) — formating-menu.html, add-property-modal.html
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "New Entry (doc step)":
    '[data-test-id="cs-new-entry-all-entry"], button[aria-label="Create New Entry"], .PageLayout__head button:has-text("New Entry"), button.Button--primary:has-text("New Entry")',
  "Create Entry (doc step)":
    '[data-test-id="cs-new-entry-single-proceed"], button[aria-label="Proceed"]:not([disabled])',
  "JSON RTE floating toolbar Property (doc step)":
    '#scrte-toolbar [data-icon="property"], .scrte-hovering-toolbar [data-icon="property"], span[data-icon="property"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Entry Title (doc step)":
    '[data-test-id="cs-title-input"] input:not([type="number"]), [data-test-id="cs-single-line-field-title"] input:not([type="number"]), [data-test-id="cs-edit-entry-field-title"] input, input[placeholder*="Type something" i]:not([type="number"])',
};
