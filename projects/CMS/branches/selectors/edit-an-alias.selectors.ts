export const CLICK_SELECTORS: Record<string, string> = {
  "Hover over alias row (doc step)":
    '[data-test-id="cs-table-body-row-0"], .Table__body__row:has-text("automation_test_alias"), [data-test-id^="cs-table-body-row-"]',
  "Edit icon on alias row (doc step)":
    '[data-test-id^="cs-table-body-row-"] button:has(svg[name="Edit"]), [data-test-id^="cs-table-body-row-"] svg[name="Edit"], .Table__body__row:has-text("automation_test_alias") button:has(svg[name="Edit"]), [data-test-id="cs-alias-edit"]',
  "Edit Alias modal (doc step)":
    '[data-test-id="cs-edit-branch-alias-title"]:has-text("Edit Alias"), .create-new-alias-title:has-text("Edit Alias"), .ReactModal__alias',
  "Save button in Edit Alias modal (doc step)":
    '[data-test-id="cs-settings-branches-edit-alias-name-create-branch-save-cta"], .ReactModal__alias button:has-text("Save")',
  "Target Branch dropdown in Edit Alias (doc step)":
    '[data-test-id="cs-branches-new-branch-source-select"] .Portal__control, [data-test-id="cs-branches-new-branch-source-select"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Edit Alias modal title (doc step)":
    '[data-test-id="cs-edit-branch-alias-title"], .create-new-alias-title',
  "Alias ID label in Edit modal (doc step)":
    '[data-test-id="cs-settings-branches-edit-alias-name-field"], label:has-text("Alias ID")',
  "Target Branch label in Edit modal (doc step)":
    '[data-test-id="cs-settings-branches-edit-alias-name-target-branch-field"], label:has-text("Target Branch")',
};
