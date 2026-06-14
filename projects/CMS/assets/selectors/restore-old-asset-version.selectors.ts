export const CLICK_SELECTORS: Record<string, string> = {
  "First folder row (doc step)":
    '[data-test-id^="cs-table-body-row-"]:has(svg[name="Folder"]) [data-test-id="cs-asset-detail-title"]',
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")',
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
  "Second asset version row (doc step)":
    '[data-test-id="cs-save-version-item-1"], [data-test-id^="cs-save-version-item-"]:nth-of-type(2)',
};

export const INPUT_SELECTORS: Record<string, string> = {};

