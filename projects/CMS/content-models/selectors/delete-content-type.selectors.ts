export const CLICK_SELECTORS: Record<string, string> = {
  // Actions column header
  "Actions (doc step)":
    '[data-test-id="cs-table-row-action-column-cell--4"], [role="columnheader"]:has-text("Actions")',

  // Vertical ellipsis on the AUTO- row
  "vertical ellipsis (doc step)":
    '[data-test-id="cs-table-action-options"]',

  // Delete menu item in the row action tooltip
  Delete:
    '[data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-delete"] .ml-8, [data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-delete"], [data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Delete"), [data-test-id="cs-vertical-action-tooltip-actions"] [data-test-id*="delete" i]',
  "Delete (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-delete"] .ml-8, [data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-delete"], [data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Delete"), [data-test-id="cs-vertical-action-tooltip-actions"] [data-test-id*="delete" i]',

  // Confirm Delete button inside the modal (CMS modals use ReactModal, not role=dialog)
  "Confirm Delete":
    '.ReactModal__Content button:has-text("Delete"), [data-test-id="cs-cb-delete-ct"], [data-test-id*="delete-ct" i], [role="dialog"] button:has-text("Delete")',
  "Confirm Delete (doc step)":
    '.ReactModal__Content button:has-text("Delete"), [data-test-id="cs-cb-delete-ct"], [data-test-id*="delete-ct" i], [role="dialog"] button:has-text("Delete")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Confirm Delete (doc step)":
    '.ReactModal__Content button:has-text("Delete"), [data-test-id="cs-cb-delete-ct"], [data-test-id*="delete-ct" i]',
};
