export const CLICK_SELECTORS: Record<string, string> = {
  "Hover over alias row (doc step)":
    '[data-test-id="cs-table-body-row-0"], .Table__body__row:has-text("automation_test_alias"), [data-test-id^="cs-table-body-row-"]',
  "More Options icon on alias row (doc step)":
    '[data-test-id="cs-table-action-options"], [data-test-id="cs-table-body-row-0"] [data-test-id="cs-table-action-options"]',
  "Delete Alias option in menu (doc step)":
    '[data-test-id="cs-alias-delete"], .VerticalActionTooltip li:has-text("Delete Alias"), [data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Delete Alias")',
  "Delete Alias modal (doc step)":
    '[data-test-id="cs-modal-title-delete-alias"], .ReactModal__delete-branches',
  "Delete button in Delete Alias modal (doc step)":
    '[data-test-id="cs-settings-branchs-delete-branch-cta"], .ReactModal__delete-branches button:has-text("Delete")',
  "Cancel button in Delete Alias modal (doc step)":
    '[data-test-id="cs-settings-branchs-delete-branch-cancel-cta"], .ReactModal__delete-branches button:has-text("Cancel")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Delete Alias modal title (doc step)":
    '[data-test-id="cs-modal-title-delete-alias"]',
  "Alias ID input in Delete modal (doc step)":
    '[data-test-id="cs-settings-branchs-delete-branch-text-input"] input, input[placeholder*="Alias ID"]',
};
