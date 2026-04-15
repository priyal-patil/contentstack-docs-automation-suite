/**
 * Selectors for Delete Entries and Assets in Bulk flow (from search results).
 * Doc: https://www.contentstack.com/docs/content-managers/search-content/delete-entries-and-assets-in-bulk
 * DOM: data/dom/CMS/entries/bulk-delete-entries.html
 */
export const CLICK_SELECTORS: Record<string, string> = {
  "First entry checkbox (doc step)":
    ':nth-match([data-test-id^="cs-table-body-row-"] [data-test-id="cs-table-row-selection"] input[type="checkbox"], 1), [data-test-id^="cs-table-body-row-"] input[type="checkbox"]:first-of-type, .Table__body__row input[type="checkbox"]',
  "Floating panel See More (doc step)":
    '[data-test-id="table-see-more-icon"], [data-test-id="cs-dropdown"] [data-test-id="table-see-more-icon"]',
  "Delete in floating panel (doc step)":
    'button[data-test-id="entries_bulk_action_delete"], [data-test-id="entries_bulk_action_delete"], [data-test-id="cs-entry-bulk-panel-delete"], li[data-test-id="cs-dropdown-elements"]:has([data-test-id="entries_bulk_action_delete"]), li[data-test-id="cs-dropdown-elements"]:has-text("Delete")',
  "Delete confirm (doc step)":
    'button[data-test-id="cs-entry-delete"], button[aria-label*="Delete Entr" i], button:has-text("Delete")',
  "Delete Entries modal (doc step)":
    '[data-test-id="cs-modal-title-delete-entries"], [data-test-id="cs-modal-title-delete-entry"], h3:has-text("Delete Entries"), h3:has-text("Delete Entry"), h3:has-text("Delete")',
};
