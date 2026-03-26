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
  "Move To in floating panel (doc step)":
    'button[data-test-id="cs-asset-bulk-panel-move_to"], [data-test-id="cs-asset-bulk-panel-move_to"]',
  "New Folder in Move To modal (doc step)":
    '[data-test-id="cs-assets-move-to-new-folder"], [data-test-id="cs-table-body-row-0"] [data-test-id="cs-assets-move-to-new-folder"]',
  "Move here (doc step)":
    'button[data-test-id="cs-asset-move-folder"], button:has-text("Move here"), button[aria-label*="Move Assets" i]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Move To floating button label (doc step)":
    '[data-test-id="cs-asset-bulk-panel-move_to"]',
  "Move To modal title (doc step)":
    '[data-test-id="cs-modal-title-move-to"], h3:has-text("Move To")',
  "New Folder label in Move To modal (doc step)":
    '[data-test-id="cs-assets-move-to-new-folder"] .list-asset-name, [data-test-id="cs-assets-move-to-new-folder"]',
  "Move To new folder name input (doc step)":
    '[data-test-id="cs-modal-description"] input[placeholder*="folder" i], [data-test-id="cs-modal-description"] input[aria-label*="folder" i], [data-test-id="cs-modal-description"] input[type="text"]',
  "Move here button label (doc step)":
    'button[data-test-id="cs-asset-move-folder"]',
};

