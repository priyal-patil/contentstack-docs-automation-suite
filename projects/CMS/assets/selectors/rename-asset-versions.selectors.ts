export const CLICK_SELECTORS: Record<string, string> = {
  "First folder row (doc step)":
    '[data-test-id^="cs-table-body-row-"]:has(svg[name="Folder"]) [data-test-id="cs-asset-detail-title"]',
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id="cs-stacklist-card-PriyalDocsStack"]',
  "Assets (doc step)":
    '[data-test-id="cms-nav-assets"], button:has-text("Assets"), a:has-text("Assets")',
  "First Asset row (doc step)":
    '[data-test-id^="cs-table-body-row-"]:not(:has(svg[name="Folder"])):has([data-test-id="cs-asset-detail-title"]) [data-test-id="cs-asset-detail-title"]',
  "Save (doc step)":
    'button:has-text("Save Changes"), [data-test-id*="asset-save"], button:has-text("Save"), button[aria-label*="save" i]',
  "Version dropdown (doc step)":
    '[data-test-id="cs-save-version-dropdown"], [data-test-id="cs-asset-details-version-list"] [data-test-id="cs-save-version-dropdown"]',
  "Version dropdown menu (doc step)":
    '.Dropdown__version__menu-wrapper, [data-test-id^="cs-save-version-item-"]',
  "First version rename icon (doc step)":
    '[data-test-id="cs-save-version-item-0"] [data-test-id="cs-version-dropdown-edit"], [data-test-id="cs-version-dropdown-edit"]',
  "Version rename confirm (doc step)":
    '[data-test-id="cs-save-version-item-0"] button:has(svg[name="Check"]), [data-test-id^="cs-save-version-item-"] button:has(svg[name="Check"]), [data-test-id^="cs-save-version-item-"] [data-test-id*="check" i], [data-test-id^="cs-save-version-item-"] svg[name="Check"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Version name input (doc step)":
    '[data-test-id="cs-save-version-item-0"] input, [data-test-id^="cs-save-version-item-"] input, .Dropdown__version__name input',
};
