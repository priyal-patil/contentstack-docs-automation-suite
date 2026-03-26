/**
 * Selectors for Unpublish Entries and Assets in Bulk flow (from search results).
 * Doc: https://www.contentstack.com/docs/content-managers/search-content/unpublish-entries-and-assets-in-bulk
 * DOM: data/dom/CMS/entries/bulk-unpublish-entries.html
 */
export const CLICK_SELECTORS: Record<string, string> = {
  "First entry checkbox (doc step)":
    ':nth-match([data-test-id^="cs-table-body-row-"] [data-test-id="cs-table-row-selection"] input[type="checkbox"], 1), [data-test-id^="cs-table-body-row-"] input[type="checkbox"]:first-of-type, .Table__body__row input[type="checkbox"]',
  "Floating panel See More (doc step)":
    '[data-test-id="table-see-more-icon"], [data-test-id="cs-dropdown"] [data-test-id="table-see-more-icon"]',
  "Unpublish button on floating bar (doc step)":
    'button[data-test-id="entries_bulk_action_unpublish"], [data-test-id="entries_bulk_action_unpublish"], li:has-text("Unpublish")',
  "Unpublish in floating panel (doc step)":
    'button[data-test-id="entries_bulk_action_unpublish"], [data-test-id="entries_bulk_action_unpublish"], li[data-test-id="cs-dropdown-elements"]:has([data-test-id="entries_bulk_action_unpublish"])',
  "First Environment checkbox (doc step)":
    'label[data-test-id="cs-entries-publish-select-environment-element"], [data-test-id="cs-entries-publish-select-environment-element"]',
  "Send (doc step)":
    'button[data-test-id="cs-bulk-entry-unpublish"], button:has-text("Send")',
  "Unpublish Entries modal (doc step)":
    '[data-test-id="cs-entry-bulk-unpublish-list-page"], [data-test-id="cs-modal-title-unpublish-entries"], [data-test-id="cs-modal-title-unpublish-entry"], h3:has-text("Unpublish Entries"), h3:has-text("Unpublish Entry")',
  "Select Environment(s) (doc step)":
    '[data-test-id="cs-entries-publish-select-environment"], label:has-text("Select Environment")',
  "Select Language(s) (doc step)":
    '[data-test-id="cs-entries-publish-select-lang"], label:has-text("Select Language")',
  "Unpublish Now or Later (doc step)":
    '[data-test-id="cs-entries-publish-select-now"], [data-test-id="cs-entries-publish-select-later"], label:has-text("Now"), label:has-text("Later")',
};
