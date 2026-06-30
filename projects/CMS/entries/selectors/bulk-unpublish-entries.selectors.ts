export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id="cs-stacklist-card-PriyalDocsStack"]',
  "Entries (doc step)":
    '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "First entry checkbox (doc step)":
    ':nth-match([data-test-id^="cs-table-body-row-"] [data-test-id="cs-table-row-selection"] input[type="checkbox"], 1)',
  "Second entry checkbox (doc step)":
    ':nth-match([data-test-id^="cs-table-body-row-"] [data-test-id="cs-table-row-selection"] input[type="checkbox"], 2)',
  "Floating panel See More (doc step)":
    '[data-test-id="table-see-more-icon"], [data-test-id="cs-dropdown"] [data-test-id="table-see-more-icon"]',
  "Unpublish in floating panel (doc step)":
    'button[data-test-id="entries_bulk_action_unpublish"], [data-test-id="entries_bulk_action_unpublish"], li[data-test-id="cs-dropdown-elements"]:has([data-test-id="entries_bulk_action_unpublish"])',
  "First Environment checkbox (doc step)":
    'label[data-test-id="cs-entries-publish-select-environment-element"], [data-test-id="cs-entries-publish-select-environment-element"]',
  "Send (doc step)":
    'button[data-test-id="cs-bulk-entry-unpublish"], button:has-text("Send")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Unpublish floating button label (doc step)":
    '[data-test-id="entries_bulk_action_unpublish"]',
  "Unpublish Entries modal title (doc step)":
    '[data-test-id="cs-modal-title-unpublish-entries"], h3:has-text("Unpublish Entries")',
  "Select Environment(s) label (doc step)":
    '[data-test-id="cs-entries-publish-select-environment"], [data-test-id="cs-field-label"]:has-text("Select Environment")',
  "Select Language(s) label (doc step)":
    '[data-test-id="cs-entries-publish-select-lang"], [data-test-id="cs-field-label"]:has-text("Select Language")',
  "Unpublish label (doc step)":
    '[data-test-id="cs-entries-publish-select"], label:has-text("Unpublish")',
  "Send label (doc step)":
    '[data-test-id="cs-bulk-entry-unpublish"]',
};

