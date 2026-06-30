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
    '[data-test-id="table-see-more-icon"], [data-test-id="cs-dropdown"] [data-test-id="table-see-more-icon"], [data-test-id="cs-bulk-action-panel"] [name="SeeMore"]',
  "Export in floating panel (doc step)":
    'button[data-test-id="entries_bulk_export"], [data-test-id="entries_bulk_export"], li[data-test-id="cs-dropdown-elements"]:has([data-test-id="entries_bulk_export"]), li[data-test-id="cs-dropdown-elements"]:has-text("Export")',
  "Export confirm (doc step)":
    'button[data-test-id="cs-export-entries-entries-export"], button:has-text("Export")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Export floating button label (doc step)":
    '[data-test-id="entries_bulk_export"], li[data-test-id="cs-dropdown-elements"]:has-text("Export")',
  "Export Entries modal title (doc step)":
    '[data-test-id="cs-modal-title-export-entries"], h3:has-text("Export Entries")',
  "What to Export label (doc step)":
    '[data-test-id="cs-field-label"]:has-text("What to Export")',
  "Manage Columns label (doc step)":
    '[data-test-id="cs-field-label"]:has-text("Manage Columns")',
  "Export Format label (doc step)":
    '[data-test-id="cs-field-label"]:has-text("Export Format")',
  "All selected scope label (doc step)":
    '[data-test-id="cs-export-entries-entries-scope-selected"]',
  "JSON format label (doc step)":
    '[data-test-id="cs-export-entries-entries-format-json"]',
  "Export button label (doc step)":
    '[data-test-id="cs-export-entries-entries-export"]',
};

