export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id*="stack-card" i], [data-test-id*="stack-list" i] [role="button"], a[href*="/#!/stack/"], .stack-card, .stacklist-card',

  "Entries (doc step)":
    'a[href*="/#!/stack/"][href*="/entries"], button[data-test-id="cms-nav-entries"], [data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "Entries page (doc step)":
    'a[href*="/#!/stack/"][href*="/entries"].active, button[data-test-id="cms-nav-entries"], [data-test-id="cs-page-title"]:has-text("Entries"), .PageTitle:has-text("Entries")',
  "vertical ellipsis (doc step)":
    '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-table-action-options"], [data-test-id="cs-table-action-options"]',
  "Preview (doc step)":
    '[data-test-id="cs-entry-action-preview"], [role="menu"] [role="menuitem"]:has-text("Preview"), li:has-text("Preview")',
  "Publish from row action (doc step)":
    '[data-test-id="cs-entry-action-publish"], [role="menu"] [role="menuitem"]:has-text("Publish"), li:has-text("Publish")',
  "Publish (bottom-right) (doc step)":
    'button[data-test-id="cs-entry-publish"], button[aria-label="Publish Entry"], button:has-text("Publish")',
  "Publish (doc step)":
    'button[data-test-id="cs-entry-publish"], button[aria-label="Publish Entry"], button:has-text("Publish")',
  "Publish Entry modal (doc step)":
    '[data-test-id="cs-entry-single-publish-edit-page"], [data-test-id="cs-modal-title-publish-entry"]',
  "First Environment option (doc step)":
    '[data-test-id="cs-entries-publish-select-environment-element"]:not(.Checkbox--state-disabled), [data-test-id="cs-entries-publish-select-environment-element"]',
  "First Language option (doc step)":
    '[data-test-id="cs-entries-publish-select-lang-element"]:not(.Checkbox--state-disabled), [data-test-id="cs-entries-publish-select-lang-element"]',
  "Variants dropdown (if available) (doc step)":
    '[data-test-id*="variant" i], [aria-label*="variant" i], [data-test-id="cs-entries-publish-select"]',
  "Now (doc step)":
    '[data-test-id="cs-entries-publish-select-now"], [role="dialog"] label:has-text("Now"), [role="dialog"] [role="radio"]:has-text("Now")',
  "Later (doc step)":
    '[data-test-id="cs-entries-publish-select-later"], [role="dialog"] label:has-text("Later"), [role="dialog"] [role="radio"]:has-text("Later")',
  "Send (doc step)":
    'button[data-test-id="cs-single-entry-publish"], [role="dialog"] button:has-text("Send")',
  "Publish Review or Publish References modal (doc step)":
    '[role="dialog"]:has-text("Publish Review"), [role="dialog"]:has-text("Publish Reference"), .Modal:has-text("Publish Review"), .Modal:has-text("Publish Reference"), [data-test-id*="publish-review" i], [data-test-id*="publish-reference" i], [data-test-id*="notification" i]:has-text("publish"), [role="status"]:has-text("publish")',
  "See more (entry editor) (doc step)":
    '[data-test-id="cs-entry-see-more-dropdown"]',
  "Delete from see more (doc step)":
    '[data-test-id="cs-entry-edit-see-more-delete"], [data-test-id="cs-dropdown-elements"]:has-text("Delete")',
  "Export from see more (doc step)":
    '[data-test-id="cs-entry-edit-see-more-export"], [data-test-id="cs-dropdown-elements"]:has-text("Export")',
  "Export from row action (doc step)":
    '[data-test-id="cs-entries-action-export"], [role="menuitem"]:has-text("Export"), li:has-text("Export")',
  "Import from see more (doc step)":
    '[data-test-id="cs-entry-edit-see-more-import"], [data-test-id="cs-import-file"], [data-test-id="cs-dropdown-elements"]:has-text("Import")',
  "Add to Release from see more (doc step)":
    '[data-test-id="cs-entry-edit-see-more-add-to-release"], [data-test-id="cs-dropdown-elements"]:has-text("Add to Release"), li:has-text("Add to Release")',
  "Import Entry modal (doc step)":
    '[data-test-id="cs-modal-title-import-entry"], .ReactModal__import-entry, [role="dialog"]:has-text("Import Entry")',
  "Choose a file (entry import) (doc step)":
    'button[data-test-id="cs-import-file"], [role="dialog"] button:has-text("Choose a file"), [aria-label*="Choose File" i]',
  "Import confirm (entry modal) (doc step)":
    'button[data-test-id="cs-import-file-import"], [role="dialog"] button:has-text("Import"), button:has-text("Import")',
  "Copy from see more (doc step)":
    '[data-test-id="cs-entry-edit-see-more-copy"], [data-test-id="cs-dropdown-elements"]:has-text("Copy")',
  "Copy from row action (doc step)":
    '[data-test-id="cs-entries-action-copy"], [role="menuitem"]:has-text("Copy"), li:has-text("Copy")',
  "Copy Entry modal (doc step)":
    '[data-test-id="cs-modal-title-copy-entry"], .ReactModal__copy-entry, [role="dialog"]:has-text("Copy Entry")',
  "Current Locale Only (doc step)":
    '[role="dialog"] label:has-text("Current Locale Only"), [role="dialog"] [data-test-id*="current-locale" i], [role="dialog"] :has-text("Current Locale Only")',
  "All Locales (doc step)":
    '[role="dialog"] label:has-text("All Locales"), [role="dialog"] [data-test-id*="all-locales" i], [role="dialog"] :has-text("All Locales")',
  "Copy confirm (doc step)":
    '[role="dialog"] button:has-text("Copy"), button[data-test-id*="copy" i]',
  "Delete from row action (doc step)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] [data-test-id="cs-entries-action-delete"], [data-test-id="cs-entries-action-delete"]',
  "Delete Entry modal (doc step)":
    '[data-test-id="cs-modal-title-delete-entry"], .ReactModal__delete-entry',
  "Delete confirm (doc step)":
    'button[data-test-id="cs-entry-delete"], button[aria-label="Delete Entry"], button:has-text("Delete")',
  "Unpublish (bottom-right) (doc step)":
    'button[data-test-id="cs-entry-unpublish"], button[aria-label="Unpublish Entry"], button:has-text("Unpublish")',
  "Unpublish from row action (doc step)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] [data-test-id="cs-entries-action-unpublish"], [data-test-id="cs-entries-action-unpublish"], [role="menuitem"]:has-text("Unpublish"), li:has-text("Unpublish")',
  "Unpublish Entry modal (doc step)":
    '[data-test-id="cs-modal-title-unpublish-entry"], .ReactModal__unpublish-entry, [data-test-id*="unpublish" i]:has-text("Entry")',
  "First Unpublish Environment option (doc step)":
    '[data-test-id="cs-entries-unpublish-select-environment-element"], [data-test-id="cs-entries-publish-select-environment-element"]',
  "First Unpublish Language option (doc step)":
    '[data-test-id="cs-entries-unpublish-select-lang-element"], [data-test-id="cs-entries-publish-select-lang-element"]',
  "Now (unpublish) (doc step)":
    '[data-test-id="cs-entries-unpublish-select-now"], [data-test-id="cs-entries-publish-select-now"], [role="dialog"] label:has-text("Now")',
  "Unpublish confirm/send (doc step)":
    'button[data-test-id="cs-single-entry-unpublish"], [role="dialog"] button:has-text("Unpublish"), [role="dialog"] button:has-text("Send")',
  "Language dropdown (doc step)":
    '[data-test-id="cs-edit-entry-locale-dropdown"], [data-test-id="cs-edit-entry-locale-dropdown-value"]',
  "Second language option (doc step)":
    '.Dropdown__menu__list__item:nth-child(2), [role="menu"] [role="menuitem"]:nth-of-type(2), [role="listbox"] [role="option"]:nth-child(2)',
  "First Entry row (doc step)":
    '[data-test-id^="cs-table-body-row-0"], [role="row"][data-test-id^="cs-table-body-row-"]',
  "Assets (doc step)":
    '[data-test-id="cms-nav-assets"], button:has-text("Assets"), a:has-text("Assets")',
  "First Asset row (doc step)":
    'a[href*="/assets/blt"]:not([href*="/browse"]):visible, [data-test-id="cs-table-body-row-0"] [data-test-id="cs-asset-detail-title"]:visible',
  "Horizontal see more (asset details) (doc step)":
    'button[data-test-id*="see-more" i], [data-test-id*="asset" i][data-test-id*="see-more" i], button:has(svg[name="SeeMore"]), button[aria-label*="more" i]',
  "Add to Release from asset more (doc step)":
    '[data-test-id="cs-asset-edit-see-more-add-to-release"], [data-test-id*="add-to-release" i], [data-test-id="cs-dropdown-elements"]:has-text("Add to Release"), li:has-text("Add to Release")',
  "First release row in Add to Release modal (doc step)":
    '[data-test-id="cs-table-body-row-1"], [data-test-id^="cs-table-body-row-"]:has([data-test-id="cs-entries-release-title"])',
  "Add for Publishing button in Add to Release modal (doc step)":
    '[data-test-id="cs-releases-publish"], button:has-text("Add for Publishing")',
  "Add With References button (doc step)":
    'button:has-text("Add With References"), [data-test-id*="add-with-references" i]',
  "Add Without References button (doc step)":
    'button:has-text("Add Without References"), [data-test-id*="add-without-references" i]',
  "New Entry (doc step)":
    'button[data-test-id="cs-new-entry-all-entry"]',
  "+ New Entry (doc step)":
    'button[data-test-id="cs-new-entry-all-entry"]',

  "Select Content Type modal (doc step)":
    '.ReactModal__new-entry, [data-test-id="cs-new-entry-single-proceed"]',
  "First Content Type row (doc step)":
    '.ReactModal__new-entry [data-test-id^="cs-table-body-row-"], .ReactModal__new-entry [role="row"]:has([role="cell"])',
  "Create Entry (doc step)":
    '[data-test-id="cs-new-entry-single-proceed"], [role="dialog"] button:has-text("Create"), [role="dialog"] button:has-text("Proceed")',
  "Proceed (doc step)":
    '[data-test-id="cs-new-entry-single-proceed"]:not([disabled]), .ReactModal__new-entry button:has-text("Proceed"):not([disabled])',

  "Save (doc step)":
    '[data-test-id="cs-entry-save"], button:has-text("Save")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Entry Title (doc step)":
    '[data-test-id="cs-title-input"] input, input[name="title"], input[placeholder*="title" i], [aria-label*="title" i]',
  "Add to Release modal title (doc step)":
    '[data-test-id="cs-modal-title"]:has-text("Add to Release"), h3:has-text("Add to Release")',
  "Add to Release table Name header (doc step)":
    '[data-test-id="cs-table-head-text--0"]:has-text("Name"), [role="columnheader"]:has-text("Name")',
  "Add to Release table Description header (doc step)":
    '[data-test-id="cs-table-head-text--1"]:has-text("Description"), [role="columnheader"]:has-text("Description")',
  "Add to Release table Items header (doc step)":
    '[data-test-id="cs-table-head-text--2"]:has-text("Items"), [role="columnheader"]:has-text("Items")',
  "Add to Release table Modified At header (doc step)":
    '[data-test-id="cs-table-head-text--3"]:has-text("Modified At"), [role="columnheader"]:has-text("Modified At")',
  "Select Language(s) label in Add to Release modal (doc step)":
    'label[data-test-id="cs-field-label"]:has-text("Select Language"), label:has-text("Select Language(s)")',
};

