export const CLICK_SELECTORS: Record<string, string> = {
  // Actions column header
  "Actions (doc step)":
    '[data-test-id="cs-table-row-action-column-cell--4"], [role="columnheader"]:has-text("Actions")',

  // Vertical ellipsis on the AUTO- row
  "vertical ellipsis (doc step)":
    '[data-test-id="cs-table-action-options"]',

  // Delete menu item in the row action tooltip
  Delete:
    '[data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-delete"] .ml-8, [data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-delete"]',
  "Delete (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-delete"] .ml-8, [data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-delete"]',

  // Confirm Delete button inside the modal
  "Confirm Delete":
    '[role="dialog"] button:has-text("Delete"), [data-testid="cs-modal"][role="dialog"] button:has-text("Delete")',
  "Confirm Delete (doc step)":
    '[role="dialog"] button:has-text("Delete"), [data-testid="cs-modal"][role="dialog"] button:has-text("Delete")',
};

export const INPUT_SELECTORS: Record<string, string> = {};
