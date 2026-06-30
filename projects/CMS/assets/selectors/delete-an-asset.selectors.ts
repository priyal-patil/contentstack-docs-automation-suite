export const CLICK_SELECTORS: Record<string, string> = {
  "First folder row (doc step)":
    '[data-test-id^="cs-table-body-row-"]:has(svg[name="Folder"]) [data-test-id="cs-asset-detail-title"]',
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id="cs-stacklist-card-PriyalDocsStack"]',
  "Assets (doc step)":
    '[data-test-id="cms-nav-assets"], button:has-text("Assets"), a:has-text("Assets")',
  "First Not Published asset row (doc step)":
    '[data-test-id^="cs-table-body-row-"]:has([data-test-id="cs-asset-table-head-publish_status"]:has-text("Not Published")) [data-test-id="cs-asset-detail-title"]',
  "First Asset row (doc step)":
    '[data-test-id^="cs-table-body-row-"]:not(:has(svg[name="Folder"])):has([data-test-id="cs-asset-detail-title"]) [data-test-id="cs-asset-detail-title"]',
  "Asset see more (doc step)":
    '[data-test-id="cs-asset-see-more-dropdown"], button:has([data-test-id="cs-icon"][name="SeeMore"]), .asset-see-more [data-test-id="cs-icon"][name="SeeMore"]',
  "Delete in see more dropdown (doc step)":
    '[data-test-id="cs-asset-edit-see-more-delete"], [data-test-id="cs-dropdown-elements"]:has-text("Delete"), li:has-text("Delete")',
  "Delete confirm button (doc step)":
    '[data-test-id="cs-delete-selected-asset"], button[aria-label="Delete Asset"], .ReactModal__delete button:has-text("Delete")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Delete Asset modal title (doc step)":
    '[data-test-id="cs-modal-title-delete-asset"], h3:has-text("Delete Asset")',
};
