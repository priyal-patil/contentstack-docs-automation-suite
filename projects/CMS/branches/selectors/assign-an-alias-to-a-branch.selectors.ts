export const CLICK_SELECTORS: Record<string, string> = {
  "Assign New Alias modal (doc step)":
    '[data-test-id="cs-edit-branch-alias-title"]:has-text("Assign New Alias"), .create-new-alias-title:has-text("Assign New Alias"), .ReactModal__alias',
  "Save button in Assign New Alias modal (doc step)":
    '[data-test-id="cs-settings-branches-edit-alias-name-create-branch-save-cta"], .ReactModal__alias button:has-text("Save")',
  "Cancel button in Assign New Alias modal (doc step)":
    '[data-test-id="cs-settings-branches-edit-alias-name-target-branch-cancel-cta"], .ReactModal__alias button:has-text("Cancel")',
  "Target Branch dropdown (doc step)":
    '[data-test-id="cs-branches-new-branch-source-select"] .Portal__control, [data-test-id="cs-branches-new-branch-source-select"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Alias ID label (doc step)":
    '[data-test-id="cs-settings-branches-create-alias-name-field"], label:has-text("Alias ID")',
  "Target Branch label (doc step)":
    '[data-test-id="cs-settings-branches-edit-alias-name-target-branch-field"], label:has-text("Target Branch")',
  "Alias ID input (doc step)":
    '[data-test-id="cs-settings-branches-create-alias-name-text-input"] input, input[name="alias"], input[placeholder*="alias ID"]',
};
