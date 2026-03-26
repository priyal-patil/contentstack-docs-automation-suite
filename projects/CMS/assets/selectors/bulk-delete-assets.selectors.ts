export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")',
  "Assets (doc step)":
    '[data-test-id="cms-nav-assets"], button:has-text("Assets"), a:has-text("Assets")',
  "First asset checkbox (doc step)":
    ':nth-match([data-test-id^="cs-table-body-row-"] [data-test-id="cs-table-row-selection"] input[type="checkbox"], 1)',
  "Second asset checkbox (doc step)":
    ':nth-match([data-test-id^="cs-table-body-row-"] [data-test-id="cs-table-row-selection"] input[type="checkbox"], 2)',
  "Delete in floating panel (doc step)":
    'button[data-test-id="cs-asset-bulk-panel-delete"], [data-test-id="cs-asset-bulk-panel-delete"]',
  "Delete confirm (doc step)":
    'button[data-test-id="cs-delete-asset"], button[aria-label*="Delete Assets" i]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Delete floating button label (doc step)":
    '[data-test-id="cs-asset-bulk-panel-delete"]',
  "Delete Asset modal title (doc step)":
    '[data-test-id="cs-modal-title-delete-asset"], h3:has-text("Delete")',
  "Delete Asset modal info (doc step)":
    '[data-test-id="cs-aseet-bulk-delete-info"], [data-test-id="cs-modal-description"], [role="dialog"] :text("This will move the selected asset(s) to the Trash")',
  "Delete modal button label (doc step)":
    '[data-test-id="cs-delete-asset"], [role="dialog"] button:has-text("Delete")',
};

