export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id="cs-stacklist-card-PriyalDocsStack"]',
  "Entries (doc step)":
    '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "First Entry row (doc step)":
    '[data-test-id^="cs-table-body-row-0"], [role="row"][data-test-id^="cs-table-body-row-"]',
  "Publish (bottom-right) (doc step)":
    'button[data-test-id="cs-entry-publish"], button[aria-label="Publish Entry"], button:has-text("Publish")',
  "First Environment option (doc step)":
    '[data-test-id="cs-entries-publish-select-environment-element"]',
  "Select all languages (doc step)":
    '[data-test-id="cs-entries-publish-select-all-language"], [data-test-id="cs-entries-publish-select-lang-all"], [data-test-id="cs-entries-publish-select-lang"] [data-test-id*="all" i], [role="dialog"] :has-text("Select all languages")',
  "Now (doc step)":
    '[data-test-id="cs-entries-publish-select-now"], [role="dialog"] label:has-text("Now"), [role="dialog"] [role="radio"]:has-text("Now")',
  "Send (doc step)":
    'button[data-test-id="cs-single-entry-publish"], [role="dialog"] button:has-text("Send")',
  "Send With References (doc step)":
    'button[data-test-id="cs-send-with-references"], button[data-test-id="cs-publish-with-references"], [role="dialog"] button:has-text("Send With References")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Publish Entry modal (doc step)":
    '[data-test-id="cs-modal-title-publish-entry"], h3:has-text("Publish Entry")',
  "Select Environment(s) label (doc step)":
    '[data-test-id="cs-entries-publish-select-environment"], [data-test-id="cs-field-label"]:has-text("Select Environment")',
  "Select Language(s) label (doc step)":
    '[data-test-id="cs-entries-publish-select-lang"], [data-test-id="cs-field-label"]:has-text("Select Language")',
  "Publish References modal title (doc step)":
    '[data-test-id="cs-modal-title-publish-reference"], [data-test-id="cs-modal-title-publish-references"], h3:has-text("Publish Reference"), h3:has-text("Publish References")',
  "Publish queue page indicator (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Publish Queue"), a:has-text("Publish Queue"), button:has-text("Publish Queue")',
};
