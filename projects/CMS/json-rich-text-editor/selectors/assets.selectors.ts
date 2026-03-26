/**
 * JSON RTE — Assets doc (asset-icon.html, select-asset.html, upload-asset.html).
 * https://www.contentstack.com/docs/developers/json-rich-text-editor/assets
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "New Entry (doc step)":
    '[data-test-id="cs-new-entry-all-entry"], button[aria-label="Create New Entry"], .PageLayout__head button:has-text("New Entry"), button.Button--primary:has-text("New Entry")',
  "Create Entry (doc step)":
    '[data-test-id="cs-new-entry-single-proceed"], button[aria-label="Proceed"]:not([disabled])',
  "Save entry from editor (doc step)":
    '[data-test-id="cs-entry-not-locked-and-localized-save"], [data-test-id="cs-entry-save"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Entry Title (doc step)":
    '[data-test-id="cs-title-input"] input:not([type="number"]), [data-test-id="cs-single-line-field-title"] input:not([type="number"]), [data-test-id="cs-edit-entry-field-title"] input, input[placeholder*="Type something" i]:not([type="number"])',
  /** Upload Asset(s) modal — Choose Files / dropzone (upload-asset.html). */
  "JSON RTE upload modal file input (doc step)":
    '#scrte-image-modal input[data-testid="drop-input"], #scrte-image-modal input[type="file"]',
};
