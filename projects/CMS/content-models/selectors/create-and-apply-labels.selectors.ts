/**
 * Flow: create-and-apply-labels
 * Source: https://www.contentstack.com/docs/developers/create-content-types/create-and-apply-labels
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Content Models (doc step)":
    '[data-test-id="cms-nav-content-models"], a:has-text("Content Models"), button:has-text("Content Models")',
  "First Content Type row (doc step)":
    '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-truncate"], [data-test-id="cs-table-body-row-0"] a, [data-test-id="cs-table-body-row-0"]',
  // React Select: click must land on .Select__control (the element that fires mousedown to open).
  // Clicking the outer wrapper div alone is unreliable — the control is the interactive target.
  "Apply Label dropdown (doc step)":
    '[data-test-id="cs-save-content-page-add-label-select"] .Select__control, [data-test-id="cs-save-content-page-add-label-select"]',
  "+ New Label option (doc step)":
    'button:has-text("New Label"), [role="option"]:has-text("New Label"), li:has-text("New Label")',
  "Create button (doc step)":
    'button:has-text("Create"):not(:has-text("Apply")), [data-test-id="cs-button"]:has-text("Create"):not(:has-text("Apply"))',
  "Create and Apply button (doc step)":
    'button:has-text("Create & Apply"), [data-test-id="cs-button"]:has-text("Create & Apply")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  // Verify uses the wrapper so toBeVisible() checks the entire React Select component is present.
  // The aria-label on the inner input is "cs-select-aria" (not "Apply Label") — never use [aria-label="Apply Label"].
  "Apply Label dropdown (doc step)":
    '[data-test-id="cs-save-content-page-add-label-select"], [data-test-id="cs-save-content-page-add-label-select"] .Select__placeholder',
  "Name field label (doc step)":
    'label:has-text("Name"), [data-test-id="cs-field-label"]:has-text("Name")',
  "Nest Label Under field label (doc step)":
    'label:has-text("Nest Label Under"), [data-test-id="cs-field-label"]:has-text("Nest Label Under")',
  "Name field (doc step)":
    'input[name="name"], input[placeholder*="label name" i], input[aria-label*="name" i]',
};
