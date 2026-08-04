export const CLICK_SELECTORS: Record<string, string> = {
  // Vertical ellipsis on the first visible row
  "vertical ellipsis":
    '[data-test-id="cs-table-action-options"]',

  // Delete menu item in the row action tooltip
  "Delete (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-delete"] .ml-8, [data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-delete"]',

  // Confirm Delete button inside the modal (CMS modals use ReactModal, not role=dialog)
  "Confirm Delete":
    '.ReactModal__Content button:has-text("Delete"), [data-test-id="cs-cb-delete-ct"], [data-test-id*="delete-ct" i], [role="dialog"] button:has-text("Delete")',
};

export const INPUT_SELECTORS: Record<string, string> = {};
