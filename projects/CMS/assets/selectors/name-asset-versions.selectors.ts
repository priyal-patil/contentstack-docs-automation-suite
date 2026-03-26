export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")',
  "Assets (doc step)":
    '[data-test-id="cms-nav-assets"], button:has-text("Assets"), a:has-text("Assets")',
  "First Asset row (doc step)":
    'a[href*="#/stack/"][href*="/assets/blt"]:not([href*="/browse"]):visible, a[href*="/assets/blt"]:not([href*="/browse"]):visible, [data-test-id="cs-table-body-row-0"] a[href*="/assets/"]:not([href*="/browse"]):visible, [data-test-id="cs-table-body-row-0"] [data-test-id="cs-asset-detail-title"]:visible',
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

