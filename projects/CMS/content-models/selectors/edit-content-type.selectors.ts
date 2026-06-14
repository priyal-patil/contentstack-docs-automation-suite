export const CLICK_SELECTORS: Record<string, string> = {
  // Actions column header
  "Actions (doc step)":
    '[data-test-id="cs-table-row-action-column-cell--4"], [role="columnheader"]:has-text("Actions")',

  // Vertical ellipsis on the AUTO- row
  "vertical ellipsis (doc step)":
    '[data-test-id="cs-table-action-options"]',

  // Settings menu item inside the row action tooltip
  Settings:
    '[data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-settings"] .ml-8, [data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-settings"]',
  "Settings (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-settings"] .ml-8, [data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-settings"]',

  // Settings panel update button
  Update: '[data-test-id="cs-cb-edit-ct-details"]',

  // Edit menu item inside the row action tooltip
  Edit:
    '[data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-edit"] .ml-8, [data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-edit"]',
  "Edit (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-edit"] .ml-8, [data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-edit"]',

  // Builder save button
  Save: '[data-test-id="cs-ct-save"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  Description: '[data-test-id="cs-ct-edit-details-description"] textarea',
};
