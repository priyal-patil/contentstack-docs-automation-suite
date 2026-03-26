/**
 * Selectors for Get Localized Entries flow.
 * Doc-only: Filter icon, Language dropdown, Localized in dropdown, Show localized only toggle, Apply.
 * DOM: data/dom/CMS/search/left-nav-filters.html, select-language-modal-filter.html
 */
export const CLICK_SELECTORS: Record<string, string> = {
  "Filter icon in Language column (doc step)":
    '[data-test-id="cs-entries-table-language-filter"], button[aria-label="Filter Languages"], .Table-filter-icon-wrapper button',
  "Filters tab in left panel (doc step)":
    '[data-test-id="cs-entries-filters-tab"], .Tab__item:has-text("Filters")',
  "Languages filter dropdown (doc step)":
    '[data-test-id="cs-languages-filter"], [data-test-id="cs-filter-languages"], .Accordion__heading__title:has-text("Languages")',
  "Manage Filters button (doc step)":
    '[data-test-id="cs-add-manage-filters"], .filters-manager-btn:has-text("Manage Filters")',
  "Language dropdown (doc step)":
    '[data-test-id="cs-language-filter-elements"], [data-test-id="cs-filter-show-localized-wrapper"] ~ * [data-test-id*="language"], .tableFilterModal__suggestion-items',
  "Localized in dropdown (doc step)":
    '[data-test-id*="localized-in"], [data-test-id*="localized_in"], .tableFilterModal [data-test-id*="localized"], :has-text("Localized in")',
  "Show localized only toggle (doc step)":
    '[data-test-id="cs-filter-show-localized-wrapper"], [data-test-id="cs-filter-show-localized-toggle-on"], label:has-text("Show localized only")',
  "Apply button (doc step)":
    '[data-test-id="cs-entries-apply-filter"], button:has-text("Apply")',
  "Language option in filter (doc step)":
    '[data-test-id="cs-language-filter-element-label"]:has-text("English"), [data-test-id="cs-language-filter-elements"]:has-text("English"), [data-test-id="cs-language-filter-elements"]:has-text("All Languages"), .tableFilterModal__suggestion-item',
};
