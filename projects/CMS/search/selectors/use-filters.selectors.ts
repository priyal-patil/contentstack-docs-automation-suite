/**
 * Selectors for Use Filters flow.
 * DOM reference: data/dom/CMS/entries/left-nav-filters.html
 */
export const CLICK_SELECTORS: Record<string, string> = {
  "Filters tab in left panel (doc step)":
    '[data-test-id="cs-entries-filters-tab"], [data-test-id="cs-entries-list-left-tab"] [data-test-id="cs-entries-filters-tab"], .Tab__item:has-text("Filters")',
  "Content Types filter section (doc step)":
    '[data-test-id="cs-content-types-filter"], .Accordion__heading__title:has-text("Content Types"), [data-test-id="cs-content-types-filter"] .Accordion__heading__title',
  "Manage Filters button (doc step)":
    '[data-test-id="cs-add-manage-filters"], .filters-manager-btn:has-text("Manage Filters"), [data-test-id="cs-add-manage-filters"]',
  "View All in Content Types filter (doc step)":
    '[data-test-id="cs-content-type-filter-view-all"], .view-all:has-text("View All")',
  "Publish Status filter section (doc step)":
    '[data-test-id="cs-publish-status-filter"], .Accordion__heading__title:has-text("Publish Status")',
};
