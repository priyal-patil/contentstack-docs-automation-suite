export const CLICK_SELECTORS: Record<string, string> = {
  "Hover over branch row (doc step)":
    '[data-test-id="cs-table-body-row-1"], [data-test-id="cs-table-body-row-0"]:has-text("automation_test_branch"), .Table__body__row:has-text("automation_test_branch"), [data-test-id^="cs-table-body-row-"]',
  "Delete icon on branch row (doc step)":
    '[data-test-id="cs-table-body-row-1"] svg[name="Delete"], [data-test-id="cs-table-body-row-1"] button:has(svg[name="Delete"]), .Table__body__row:has-text("automation_test_branch") svg[name="Delete"], [data-test-id^="cs-table-body-row-"] svg[name="Delete"], button[aria-label*="delete" i]:has(svg[name="Delete"]), .Table__body__row:has(svg[name="Delete"])',
  "Delete button in Delete Branch modal (doc step)":
    '[data-test-id="cs-settings-branchs-delete-branch-cta"], [data-test-id="cs-modal-title-delete-branch"] ~ * button:has-text("Delete"), .ReactModal__delete-branches button:has-text("Delete"), button.Button--destructive:has-text("Delete")',
  "Cancel button in Delete Branch modal (doc step)":
    '[data-test-id="cs-settings-branchs-delete-branch-cancel-cta"], button:has-text("Cancel")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Delete Branch modal title (doc step)":
    '[data-test-id="cs-modal-title-delete-branch"], h3:has-text("Delete Branch")',
  "Branch ID input in Delete modal (doc step)":
    '[data-test-id="cs-settings-branchs-delete-branch-text-input"] input, input[placeholder*="Branch ID"], input[placeholder*="branch ID"]',
};
