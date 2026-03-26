export const CLICK_SELECTORS: Record<string, string> = {
  // Quick Search icon = magnifying glass in cs-header-search-container. Manually captured. NOT Help (cs-help-center).
  "Search icon in header (doc step)":
    '[data-test-id="cs-header-search-container"] [data-test-id="cs-header-search-icon"]',
  // Submit button in Quick Search dropdown (after typing). Manually captured.
  "Quick Search submit button (doc step)":
    '[data-test-id="cs-header-search-container"] [data-test-id="cs-search-bar-input-submit"], [data-test-id="cs-search-bar-input-submit"]',
  "Entries option in Quick Search dropdown (doc step)":
    '[data-test-id="cs-header-search-entries"], li[data-test-id="cs-header-search-entries"], [data-test-id="cs-search-bar-select"] ~ * [data-test-id="cs-header-search-entries"], .Dropdown__menu__list__item:has-text("Entries")',
  "Assets option in Quick Search dropdown (doc step)":
    '[data-test-id="cs-header-search-assets"], li[data-test-id="cs-header-search-assets"], [data-test-id="cs-search-bar-select"] ~ * [data-test-id="cs-header-search-assets"], .Dropdown__menu__list__item:has-text("Assets")',
  "Entries listing page (doc step)":
    '[data-test-id="cs-table"], .entryList, [data-test-id="cs-entries-inline-search"], [data-test-id="cs-search-bar-select"], [data-test-id="cs-empty-state"], [data-test-id="cs-page-layout-contentBody"] .entryList',
};

export const INPUT_SELECTORS: Record<string, string> = {
  // Input in Quick Search dropdown. Manually captured. NOT dashboard (cs-search, "Search help content").
  "Quick Search input (doc step)":
    '[data-test-id="cs-header-search-container"] input, [data-test-id="cs-search-bar-input"] input, input[placeholder="Search Entries"], input[placeholder*="Search Entries" i]',
};
