export const CLICK_SELECTORS: Record<string, string> = {
  "Vertical ellipsis in Actions column (doc step)":
    '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-table-action-options"], [data-test-id="cs-table-action-options"]',
  "Delete option in webhook menu (doc step)":
    '[data-test-id="cs-webhooks-action-delete"], .VerticalActionTooltip li:has-text("Delete"), [data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Delete")',
  "Delete button in delete modal (doc step)":
    '[data-test-id="cs-webhooks-delete"], [role="dialog"] button:has-text("Delete"), [data-test-id="cs-modal-title-delete-webhook"] ~ * button:has-text("Delete"), .ReactModal__delete button:has-text("Delete"), button.Button--destructive:has-text("Delete")',
};

export const INPUT_SELECTORS: Record<string, string> = {};
