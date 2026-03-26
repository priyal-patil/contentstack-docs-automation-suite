export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")',
  "Entries (doc step)":
    '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "First entry checkbox (doc step)":
    ':nth-match([data-test-id^="cs-table-body-row-"] [data-test-id="cs-table-row-selection"] input[type="checkbox"], 1)',
  "Second entry checkbox (doc step)":
    ':nth-match([data-test-id^="cs-table-body-row-"] [data-test-id="cs-table-row-selection"] input[type="checkbox"], 2)',
  "Floating panel See More (doc step)":
    '[data-test-id="table-see-more-icon"], [data-test-id="cs-dropdown"] [data-test-id="table-see-more-icon"]',
  "Publish in floating panel (doc step)":
    'button[data-test-id="entries_bulk_action_publish"], [data-test-id="entries_bulk_action_publish"], li[data-test-id="cs-dropdown-elements"]:has([data-test-id="entries_bulk_action_publish"])',
  "First Environment checkbox (doc step)":
    'label[data-test-id="cs-entries-publish-select-environment-element"], [data-test-id="cs-entries-publish-select-environment-element"]',
  "Send With References (doc step)":
    'button[data-test-id="cs-bulk-entry-publish-with-ref"], button:has-text("Send With References")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Publish floating button label (doc step)":
    '[data-test-id="entries_bulk_action_publish"]',
  "Publish Entries modal title (doc step)":
    '[data-test-id="cs-modal-title-publish-entries"], h3:has-text("Publish Entries")',
  "Select Environment(s) label (doc step)":
    '[data-test-id="cs-entries-publish-select-environment"], [data-test-id="cs-field-label"]:has-text("Select Environment")',
  "Select Language(s) label (doc step)":
    '[data-test-id="cs-entries-publish-select-lang"], [data-test-id="cs-field-label"]:has-text("Select Language")',
  "Publish label (doc step)":
    '[data-test-id="cs-entries-publish-select"], label:has-text("Publish")',
  "Send With References label (doc step)":
    '[data-test-id="cs-bulk-entry-publish-with-ref"]',
};

