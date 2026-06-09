/**
 * Flow: create-and-apply-labels
 * Source: https://www.contentstack.com/docs/developers/create-content-types/create-and-apply-labels
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Content Models (doc step)":
    '[data-test-id="cms-nav-content-models"], a:has-text("Content Models"), button:has-text("Content Models")',
  "First Content Type row (doc step)":
    '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-truncate"], [data-test-id="cs-table-body-row-0"] a, [data-test-id="cs-table-body-row-0"]',
  "Apply Label dropdown (doc step)":
    '[data-test-id="cs-save-content-page-add-label-select"], button:has-text("Apply Label"), [aria-label="Apply Label"]',
  "+ New Label option (doc step)":
    'button:has-text("New Label"), [role="option"]:has-text("New Label"), li:has-text("New Label")',
  "Create button (doc step)":
    'button:has-text("Create"):not(:has-text("Apply")), [data-test-id="cs-button"]:has-text("Create"):not(:has-text("Apply"))',
  "Create and Apply button (doc step)":
    'button:has-text("Create & Apply"), [data-test-id="cs-button"]:has-text("Create & Apply")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Name field label (doc step)":
    'label:has-text("Name"), [data-test-id="cs-field-label"]:has-text("Name")',
  "Nest Label Under field label (doc step)":
    'label:has-text("Nest Label Under"), [data-test-id="cs-field-label"]:has-text("Nest Label Under")',
  "Name field (doc step)":
    'input[name="name"], input[placeholder*="label name" i], input[aria-label*="name" i]',
};
