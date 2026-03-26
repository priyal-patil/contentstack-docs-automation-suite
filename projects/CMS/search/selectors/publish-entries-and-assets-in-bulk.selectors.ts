/**
 * Selectors for Publish Entries and Assets in Bulk flow (from search results).
 * Doc: https://www.contentstack.com/docs/content-managers/search-content/publish-entries-and-assets-in-bulk
 * DOM: data/dom/CMS/entries/publish-entries-references.html
 */
export const CLICK_SELECTORS: Record<string, string> = {
  "First entry checkbox (doc step)":
    ':nth-match([data-test-id^="cs-table-body-row-"] [data-test-id="cs-table-row-selection"] input[type="checkbox"], 1), [data-test-id^="cs-table-body-row-"] input[type="checkbox"]:first-of-type, .Table__body__row input[type="checkbox"]',
  "Second entry checkbox (doc step)":
    ':nth-match([data-test-id^="cs-table-body-row-"] [data-test-id="cs-table-row-selection"] input[type="checkbox"], 2)',
  "Publish button on floating bar (doc step)":
    'button[data-test-id="entries_bulk_action_publish"], [data-test-id="entries_bulk_action_publish"], li:has-text("Publish")',
  "Vertical ellipsis on floating bar (doc step)":
    '[data-test-id="table-see-more-icon"], [data-test-id="cs-dropdown"] [data-test-id="table-see-more-icon"], [data-test-id="cs-vertical-action-tooltip"]',
  "Floating panel See More (doc step)":
    '[data-test-id="table-see-more-icon"], [data-test-id="cs-dropdown"] [data-test-id="table-see-more-icon"]',
  "Publish in floating panel (doc step)":
    'button[data-test-id="entries_bulk_action_publish"], [data-test-id="entries_bulk_action_publish"], li[data-test-id="cs-dropdown-elements"]:has([data-test-id="entries_bulk_action_publish"])',
  "First Environment checkbox (doc step)":
    'label[data-test-id="cs-entries-publish-select-environment-element"], [data-test-id="cs-entries-publish-select-environment-element"]',
  "Send With References (doc step)":
    'button[data-test-id="cs-bulk-entry-publish-with-ref"], button[data-test-id="cs-single-entry-publish"], button:has-text("Send With References"), button:has-text("Send")',
  "Send Without References (doc step)":
    'button[data-test-id="cs-bulk-entry-publish-without-ref"], button:has-text("Send Without References")',
  "Send With References or Send Without References (doc step)":
    'button[data-test-id="cs-bulk-entry-publish-with-ref"], button[data-test-id="cs-bulk-entry-publish-without-ref"], button[data-test-id="cs-single-entry-publish"], button:has-text("Send With References"), button:has-text("Send Without References"), button:has-text("Send")',
  "Publish Entries modal (doc step)":
    '[data-test-id="cs-entry-bulk-publish-list-page"], [data-test-id="cs-entry-single-publish-edit-page"], [data-test-id="cs-modal-title-publish-entries"], [data-test-id="cs-modal-title-publish-entry"], h3:has-text("Publish Entries"), h3:has-text("Publish Entry")',
  "Select Environment(s) (doc step)":
    '[data-test-id="cs-entries-publish-select-environment"], label:has-text("Select Environment")',
  "Select Language(s) (doc step)":
    '[data-test-id="cs-entries-publish-select-lang"], label:has-text("Select Language")',
  "Publish Now or Later (doc step)":
    '[data-test-id="cs-entries-publish-select-now"], [data-test-id="cs-entries-publish-select-later"], label:has-text("Now"), label:has-text("Later")',
};
