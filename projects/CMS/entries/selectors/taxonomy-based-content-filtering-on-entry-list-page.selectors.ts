export const CLICK_SELECTORS: Record<string, string> = {
  "Entries (doc step)":
    '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "Filters tab (doc step)":
    '[data-test-id="cs-entries-filters-tab"], .Tab__item:has-text("Filters")',
  "Left filters panel (doc step)":
    '.PageLayout__leftSidebar__tabs, [data-test-id="cs-entries-list-left-tab"]',
  "First taxonomy term/left filter option (doc step)":
    '.PageLayout__leftSidebar__tabs .filter-items .item label.Checkbox, .PageLayout__leftSidebar__tabs .filter-items .item input[type="checkbox"], .PageLayout__leftSidebar__tabs [data-test-id*="item"]:has(input[type="checkbox"])',
  "Entries list table (doc step)":
    'table, [data-test-id="cs-table"], [data-test-id="cs-table-body"]'
};

