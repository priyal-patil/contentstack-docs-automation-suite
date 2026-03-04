export const CLICK_SELECTORS: Record<string, string> = {
  Delete:
    '#tableRowActionNode li[data-test-id="cs-ct-action-delete"] .ml-8, #tableRowActionNode li[data-test-id="cs-ct-action-delete"]',

  "Confirm Delete":
    '[role="dialog"] button:has-text("Delete"), [data-testid="cs-modal"][role="dialog"] button:has-text("Delete")',
};

export const INPUT_SELECTORS: Record<string, string> = {};

