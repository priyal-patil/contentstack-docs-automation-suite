export const CLICK_SELECTORS: Record<string, string> = {
  // Row action "Settings" inside the open popover
  Settings: '[id="tableRowActionNode"] [data-test-id="cs-ct-action-settings"]',

  // Settings panel/drawer open gate button
  Update: '[data-test-id="cs-cb-edit-ct-details"]',

  // Row action "Edit"
  Edit: '[id="tableRowActionNode"] [data-test-id="cs-ct-action-edit"], [data-test-id="cs-ct-action-edit"]',

  // Builder actions
  Save: '[data-test-id="cs-ct-save"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  Description: '[data-test-id="cs-ct-edit-details-description"] textarea',
};

