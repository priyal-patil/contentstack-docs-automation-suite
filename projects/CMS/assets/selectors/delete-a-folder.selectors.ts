export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id="cs-stacklist-card-PriyalDocsStack"]',
  "Assets (doc step)":
    '[data-test-id="cms-nav-assets"], button:has-text("Assets"), a:has-text("Assets")',
  "First folder vertical ellipses (doc step)":
    '[data-test-id^="cs-table-body-row-"]:has(svg[name="Folder"]) [data-test-id="cs-table-action-options"]',
  "Delete option (doc step)":
    '[data-test-id="cs-asset-action-delete"] div, [data-test-id="cs-asset-action-delete"]',
  "Delete confirm (doc step)":
    'button[data-test-id="cs-delete-asset"], button:has-text("Delete"), button[aria-label*="Delete Asset" i]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Delete option label (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"]:visible li:has-text("Delete"), [data-test-id="cs-vertical-action-tooltip-actions"]:visible li:has-text("Delete")',
  "Delete Asset Folder modal title (doc step)":
    '[data-test-id="cs-modal-title-delete-asset-folder"], [data-test-id="cs-modal-title"], h3:has-text("Delete")',
};

