export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")',
  "Entries (doc step)":
    '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "First Entry row (doc step)":
    '[data-test-id^="cs-table-body-row-0"], [role="row"][data-test-id^="cs-table-body-row-"]',
  "See more (entry editor) (doc step)":
    '[data-test-id="cs-entry-see-more-dropdown"]',
  "Delete from see more (doc step)":
    '[data-test-id="cs-entry-edit-see-more-delete"], [data-test-id="cs-dropdown-elements"]:has([data-test-id="cs-entry-edit-see-more-delete"]), [data-test-id="cs-dropdown-elements"]:has-text("Delete")',
  "Select all languages in delete modal (doc step)":
    '[role="dialog"] [data-test-id*="select-all-language" i], [role="dialog"] [data-test-id*="all-language" i], [role="dialog"] :has-text("Select all languages")',
  "Delete confirm (doc step)":
    'button[data-test-id="cs-entry-delete"], button[aria-label*="Delete Entr" i], [role="dialog"] button:has-text("Delete")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Delete from see more label (doc step)":
    '[data-test-id="cs-entry-edit-see-more-delete"], [data-test-id="cs-dropdown-elements"]:has-text("Delete")',
  "Delete Entry modal (doc step)":
    '[data-test-id="cs-modal-title-delete-entry"], [data-test-id="cs-modal-title-delete-entries"], h3:has-text("Delete Entry"), h3:has-text("Delete")',
  "Select all languages in delete modal (doc step)":
    '[role="dialog"] [data-test-id*="select-all-language" i], [role="dialog"] [data-test-id*="all-language" i], [role="dialog"] :has-text("Select all languages")',
  "Delete confirm label (doc step)":
    'button[data-test-id="cs-entry-delete"], button[aria-label*="Delete Entr" i], [role="dialog"] button:has-text("Delete")',
};
