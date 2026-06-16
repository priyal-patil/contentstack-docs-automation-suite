export const CLICK_SELECTORS: Record<string, string> = {
  // Actions column header (listing page)
  "Actions (doc step)":
    '[data-test-id="cs-table-row-action-column-cell--4"], [role="columnheader"]:has-text("Actions")',

  // Row action menu option — popup uses .VerticalActionTooltip, not #tableRowActionNode
  "Copy Content Type":
    '[data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-copy"] .ml-8, [data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-copy"]',
  "Copy Content Type (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-copy"] .ml-8, [data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-copy"]',

  // vertical ellipsis on the AUTO- row
  "vertical ellipsis (doc step)": '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-table-action-options"]',

  // Copy modal actions
  Copy: '[data-testid="cs-modal"][role="dialog"] [data-test-id="cs-cb-copy-ct"]',
  "Copy (doc step)": '[data-testid="cs-modal"][role="dialog"] [data-test-id="cs-cb-copy-ct"]',

  // Copy Content Type modal container (for modal title verify)
  "Copy Content Type modal (doc step)": '[data-testid="cs-modal"][role="dialog"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  Name: '[data-testid="cs-modal"][role="dialog"] [data-test-id="cs-ct-copy-ct-modal-title-input"] input[name="name"]',
  "Name (doc step)": '[data-testid="cs-modal"][role="dialog"] [data-test-id="cs-ct-copy-ct-modal-title-input"] input[name="name"]',
  Description:
    '[data-testid="cs-modal"][role="dialog"] [data-test-id="cs-ct-copy-ct-modal-description-input"] textarea[name="description"]',
  "Description (doc step)":
    '[data-testid="cs-modal"][role="dialog"] [data-test-id="cs-ct-copy-ct-modal-description-input"] textarea[name="description"]',
};

