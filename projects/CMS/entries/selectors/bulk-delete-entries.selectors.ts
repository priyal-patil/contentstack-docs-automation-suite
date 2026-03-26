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
  "Delete in floating panel (doc step)":
    'button[data-test-id="entries_bulk_action_delete"], [data-test-id="entries_bulk_action_delete"], [data-test-id="cs-entry-bulk-panel-delete"], li[data-test-id="cs-dropdown-elements"]:has([data-test-id="entries_bulk_action_delete"]), li[data-test-id="cs-dropdown-elements"]:has-text("Delete")',
  "Delete confirm (doc step)":
    'button[data-test-id="cs-entry-delete"], button[aria-label*="Delete Entr" i], button:has-text("Delete")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Delete floating button label (doc step)":
    '[data-test-id="entries_bulk_action_delete"], [data-test-id="cs-entry-bulk-panel-delete"], li[data-test-id="cs-dropdown-elements"]:has-text("Delete")',
  "Delete Entries modal title (doc step)":
    '[data-test-id="cs-modal-title-delete-entries"], h3:has-text("Delete Entries"), h3:has-text("Delete")',
  "Delete Entries modal info (doc step)":
    '[data-test-id="cs-modal-description"], .cnf-text:has-text("The selected entries will move to the Trash")',
  "Delete modal button label (doc step)":
    '[data-test-id="cs-entry-delete"], button[aria-label*="Delete Entr" i], button:has-text("Delete")',
};
