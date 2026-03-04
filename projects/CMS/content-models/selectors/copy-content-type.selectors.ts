export const CLICK_SELECTORS: Record<string, string> = {
  // Row action menu option (scoped to popover container)
  "Copy Content Type": '#tableRowActionNode li[data-test-id="cs-ct-action-copy"] .ml-8',

  // Copy modal actions
  Copy: '[data-testid="cs-modal"][role="dialog"] [data-test-id="cs-cb-copy-ct"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  Name: '[data-testid="cs-modal"][role="dialog"] [data-test-id="cs-ct-copy-ct-modal-title-input"] input[name="name"]',
  Description:
    '[data-testid="cs-modal"][role="dialog"] [data-test-id="cs-ct-copy-ct-modal-description-input"] textarea[name="description"]',
};

