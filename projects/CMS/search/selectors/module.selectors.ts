export const CLICK_SELECTORS: Record<string, string> = {
  "Entries (doc step)":
    'a[href*="/#!/stack/"][href*="/entries"], button[data-test-id="cms-nav-entries"], [data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "Assets (doc step)":
    '[data-test-id="cms-nav-assets"], button:has-text("Assets"), a:has-text("Assets")',
  "Search bar dropdown (doc step)":
    '[data-test-id="cs-search-bar-select"], [data-test-id="cs-entries-inline-search"] [data-test-id="cs-search-bar-select"], .SearchBar__select',
  "All option (Search within all fields) (doc step)":
    '[data-test-id="cs-entries-search-in-all"], li:has-text("All (Search within all fields)"), [role="menuitem"]:has-text("All")',
  "Title option (Search within title only) (doc step)":
    '[data-test-id="cs-entries-search-in-title"], li:has-text("Title (Search within title only)"), [role="menuitem"]:has-text("Title")',
  "URL option (Search within url only) (doc step)":
    '[data-test-id="cs-entries-search-in-url"], li:has-text("URL (Search within url only)"), [role="menuitem"]:has-text("URL")',
  "Specific field option (doc step)":
    '[data-test-id="cs-entries-search-in-specific-field"], li:has-text("Specific field"), [role="menuitem"]:has-text("Specific field")',
  "Search submit button (doc step)":
    'button[data-test-id="cs-search-bar-input-submit"]',
  "Search results displayed (doc step)":
    '[data-test-id^="cs-table-body-row-"], .Table__body [role="row"], [data-test-id="cs-table"] [role="row"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Search bar input (doc step)":
    '[data-test-id="cs-search-bar-input"] input, [data-test-id="cs-entries-inline-search"] input, [data-test-id="cs-search-input-field"], .SearchBar input[type="text"], input[aria-label*="Search" i], input[placeholder*="Search" i]',
};
