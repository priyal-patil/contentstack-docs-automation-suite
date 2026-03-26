export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")',
  "Assets (doc step)":
    '[data-test-id="cms-nav-assets"], button:has-text("Assets"), a:has-text("Assets")',
  "First folder vertical ellipses (doc step)":
    '[data-test-id^="cs-table-body-row-"]:has([data-test-id="cs-asset-table-head-asset-type"]:has-text("Folder")) [data-test-id="cs-table-action-options"], [data-test-id^="cs-table-body-row-"]:has([role="cell"]:has-text("Folder")) [data-test-id="cs-table-action-options"]',
  "Move To option (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] [data-test-id*="move" i], [data-test-id="cs-vertical-action-tooltip"]:visible li:has-text("Move")',
  "Destination folder row (doc step)":
    '[data-test-id="cs-modal-description"] [data-test-id^="cs-table-body-row-"]:has([data-test-id="cs-asset-detail-title"])',
  "Move here (doc step)":
    '[data-test-id="cs-asset-move-folder"], button:has-text("Move here"), button[aria-label*="Move Asset" i]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Move To option label (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] [data-test-id*="move" i], [data-test-id="cs-vertical-action-tooltip"]:visible li:has-text("Move")',
  "Move To modal title (doc step)":
    '[data-test-id="cs-modal-title-move-to"], h3:has-text("Move To")',
};

