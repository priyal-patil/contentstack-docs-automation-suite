/**
 * Taxonomy module — DOM refs: data/dom/CMS/taxonomy/*.html, settings-top-nav, settings-left-nav.
 */

import { TERM_DETAILS_SPLIT_CTA_CARET } from "./automation.locators";

export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")',
  /** Top bar Settings (settings-top-nav.html — cms-nav-settings). */
  "Settings (doc step)":
    'div.TopNavbar__content__items__list__redirect a[href*="/settings/stack"] button[data-test-id="cms-nav-settings"], a[href*="/settings/stack"] [data-test-id="cms-nav-settings"], [data-test-id="cms-nav-settings"], button:has-text("Settings")',
  /** Settings → Taxonomy (taxonomy-left-nav.html; selector only — doc does not name placement). */
  "Taxonomy in settings (doc step)":
    'a[href*="/settings/taxonomy"]:has([data-test-id="cs-stack-settings-taxonomy"]), [data-test-id="cs-stack-settings-taxonomy"]',
  /** taxonomy-listing.html — open an existing taxonomy (create-a-term doc step 2). Use the row div only: parent <a> matches first in DOM order and is often visibility-hidden. */
  "Taxonomy listing first taxonomy row open edit (doc step)":
    '[data-test-id="cs-table-body-row-0"][role="row"]:not(.Table__empty__row)',
  /** taxonomy-details-page.html — create-a-term doc step 3. Header CTA after terms exist; empty-state "New Term" when none. */
  "Add Term button on taxonomy details (doc step)":
    '.taxonomy-title-section [data-test-id="add-term-button"], .taxonomy-title-right [data-test-id="add-term-button"], button:has-text("New Term"), [data-test-id="add-term-button"], button.Button--primary:has-text("Add Term"), button:has-text("Add Term")',
  /** taxonomy-details Term Details panel — second root term when header Add Term is not shown (live UI). */
  "Term details Create a Sibling Term button (doc step)":
    '.terms-details-section button:has-text("Create a Sibling Term"), .terms-details-section-terms-selected button:has-text("Create a Sibling Term"), .terms-edit-section button:has-text("Create a Sibling Term")',
  /**
   * create-a-sibling-term.html — caret next to primary "Create a Sibling Term" opens menu with "Create a Child Term".
   * Live taxonomy details uses this split instead of a standalone child CTA.
   * Full selector list: ./automation.locators.ts → TERM_DETAILS_SPLIT_CTA_CARET
   */
  "Term details Create a Sibling Term split dropdown caret (doc step)": TERM_DETAILS_SPLIT_CTA_CARET,
  /** Select first root term in tree so Term Details shows actions (after focus was on another term). */
  "Taxonomy terms list first root term open details (doc step)":
    '.terms-sortable-area div[role="treeitem"]:first-child .term-node, .taxonomy-edit-content [role="treeitem"]:first-child .term-node',
  /** create-term.html — create-a-term doc step 5. Modal save vs inline Term Details split CTA (data-test-id cs-button). */
  "Create Term modal Save button (doc step)":
    '.ReactModal__taxonomy [data-test-id="save-button"], .ReactModal__Content__footer [data-test-id="save-button"], .terms-details-section .terms-split-cta button.Button--primary:has-text("Save"), .terms-edit-form .terms-split-cta button.Button--primary:has-text("Save")',
  /** taxonomy-details left term tree — create-a-term doc (sibling / child). */
  "Taxonomy terms list first term vertical ellipsis (doc step)":
    '.terms-sortable-area [role="treeitem"] button[data-test-id="cs-group-more-actions-icon"], .terms-sortable-area div[role="treeitem"] button[data-test-id="cs-group-more-actions-icon"], .terms-sortable-section button.three-dots-vertical-icon, #terms-search-trucation-id button.three-dots-vertical-icon',
  /** create-sibling-term-menu.html — doc "Create Sibling". */
  "Term vertical menu Create a Sibling Term (doc step)":
    'li[data-test-id="cs-dropdown-elements"][title="Create a Sibling Term"], li.Dropdown__menu__list__item:has-text("Create a Sibling Term"), li:has(p:has-text("Create Sibling Term")), li:has-text("Create Sibling Term")',
  /** create-sibling-term-menu.html — doc "Create Child". */
  "Term vertical menu Create a Child Term (doc step)":
    'li[data-test-id="cs-dropdown-elements"][title="Create a Child Term"], li.Dropdown__menu__list__item:has-text("Create a Child Term"), li:has(p:has-text("Create Child Term")), li:has-text("Create Child Term")',
  /** taxonomy term row menu — edit-a-term doc step 3 (Actions column → Edit). */
  "Term vertical menu Edit (doc step)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Edit"), li[data-test-id="cs-dropdown-elements"][title="Edit"]',
  /** taxonomy-details-page.html — select a term before Term Details / locale table (edit-a-term prerequisite). */
  "Taxonomy terms list first term row select (doc step)":
    '.terms-sortable-area div[role="treeitem"]:first-child .term-node, .taxonomy-edit-content [role="treeitem"]:first-child .term-node, .terms-sortable-area [data-rbd-draggable-id], .terms-sortable-area [data-rbd-draggable-context-id] [data-rbd-draggable-id]',
  /** taxonomy-details-page.html — Term Details locale table, Actions column (edit-a-term doc step 3). */
  "Term details locale table first row Actions ellipsis (doc step)":
    '.terms-edit-section [data-test-id="cs-table-body-row-0"] [data-test-id="cs-table-action-options"], .terms-details-section [data-test-id="cs-table-body-row-0"] [data-test-id="cs-table-action-options"]',
  /** term-section.html — move-or-reorder-a-term doc step 3 (hover, then drag handle ActionBar icon). */
  "Taxonomy term list first term row hover for drag (doc step)":
    '.terms-sortable-area div[role="treeitem"]:first-child .term-node',
  "Taxonomy term list first term drag handle (doc step)":
    '.terms-sortable-area div[role="treeitem"]:first-child .term-drag-icon.term-actions-hover, .terms-sortable-area div[role="treeitem"]:first-child .term-drag-icon',
  /** Drop onto second sibling term row (requires at least two terms). */
  "Taxonomy term list second term row drop target (doc step)":
    '.terms-sortable-area div[role="treeitem"]:first-child + div[role="treeitem"] .term-node',
  /** move-term-modal.html — move-or-reorder-a-term doc step 3 (confirm). */
  "Move Term modal Move button (doc step)":
    '.ReactModal__taxonomy [data-test-id="cs-button-group"] button.Button--primary:has-text("Move"), .ReactModal__Content__footer button.Button--primary:has-text("Move")',
  /** new-term-details-page.html — edit-a-term doc (Save in DOM ref; live UI often uses Update beside Cancel, outside split CTA). */
  "Edit Term Save button (doc step)":
    '.terms-details-section-terms-selected button[data-test-id="cs-button"]:has-text("Update"), .terms-details-section-terms-selected button:has-text("Update"), .terms-edit-form [data-test-id="cs-button-group"] button.Button--primary:has-text("Save"), .terms-edit-form .terms-split-cta button[data-test-id="cs-button"]:has-text("Save"), .terms-details-section .terms-edit-form button.Button--primary:has-text("Save")',
  /** taxonomy-listing.html / taxonomy-header.html — doc step 2. */
  "New Taxonomy button (doc step)":
    '.create-taxonomy-split-cta button.Button--primary:has-text("New Taxonomy"), button.Button--primary:has-text("New Taxonomy")',
  /** taxonomy-header.html + new-taxonomy-menu.html — import-a-taxonomy doc step 2 (caret opens menu; main button may open create). */
  "New Taxonomy button open dropdown (doc step)":
    ".create-taxonomy-split-cta button.Button--primary .openDropdownOnClick, .create-taxonomy-split-cta .openDropdownOnClick",
  /** new-taxonomy-menu.html — import-a-taxonomy doc step 2. */
  "Taxonomy New Taxonomy menu Import (doc step)":
    '[data-test-id="cs-dropdown-elements"][title="Import"], li.Dropdown__menu__list__item[title="Import"]',
  /** new-taxonomy-menu.html — split "+ New Taxonomy" → open create modal (Create New). */
  "Taxonomy New Taxonomy menu Create New (doc step)":
    '[data-test-id="cs-dropdown-elements"][title="Create New"], li.Dropdown__menu__list__item[title="Create New"], li.Dropdown__menu__list__item:has-text("Create New")',
  /** import-taxonomy.html — import-a-taxonomy doc step 5. */
  "Import Taxonomy modal Done button (doc step)":
    '.ReactModal__taxonomy__import .ReactModal__Content__footer button:has-text("Done"), .ReactModal__taxonomy__import button.Button--primary:has-text("Done")',
  /** import-taxonomy-checkbox.html — import-a-taxonomy doc step 4 (tick Display this taxonomy…). */
  "Import Taxonomy display at top checkbox (doc step)":
    '.ReactModal__taxonomy__import .taxonomy-imported-checkbox label[data-test-id="cs-checkbox"], .ReactModal__taxonomy__import .taxonomy-imported-checkbox .Checkbox__box, .ReactModal__taxonomy__import .Checkbox-wrapper.taxonomy-imported-checkbox .Checkbox__box',
  /** create-new-taxonomy.html — doc step 4. */
  "Create Taxonomy modal Create Taxonomy button (doc step)":
    '[data-test-id="cs-taxonomy-createBtn"], [data-testid="create-taxonomy-button"], button:has-text("Create Taxonomy")',
  "Create Taxonomy modal Cancel button (doc step)": '[data-test-id="cs-taxonomy-cancelBtn"]',
  /** taxonomy-verticle-ellipses.html — first row, Actions column (doc step 2). */
  "Taxonomy listing first row Actions vertical ellipsis (doc step)":
    '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-table-action-options"]',
  /** taxonomy-verticle-menu.html — doc step 3. */
  "Taxonomy row vertical menu Edit (doc step)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Edit")',
  /** taxonomy-verticle-menu.html — delete-a-taxonomy doc step 3. */
  "Taxonomy row vertical menu Delete (doc step)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Delete")',
  /** delete-taxonomy.html — delete-a-taxonomy doc step 4. */
  "Delete Taxonomy modal Delete button (doc step)":
    '[data-test-id="cs-taxonomy-deleteBtn"], .ReactModal__taxonomy button.Button--destructive:has-text("Delete")',
  /** term-section.html — delete-a-term doc; click handled in actionRules (row img / hover). Kept for resolveTarget fallbacks. */
  "Taxonomy term list first term vertical actions menu (doc step)":
    '.terms-sortable-area div[role="treeitem"]:first-child [data-test-id="cs-group-more-actions-icon"], .terms-sortable-area [role="treeitem"]:first-child button[data-test-id="cs-group-more-actions-icon"]',
  /** term-hori-ellipses.html — delete-a-term doc step 3. */
  "Term vertical menu Delete Term (doc step)":
    'li[data-test-id="cs-dropdown-elements"]:has([data-test-id="cs-term-delete-label"]), li:has(p[data-test-id="cs-term-delete-label"]), li.Dropdown__menu__list__item:has-text("Delete Term")',
  /** delete-term-modal.html — delete-a-term doc step 4. */
  "Delete Term modal Delete button (doc step)":
    '.ReactModal__taxonomy:has([data-test-id="cs-modal-title-delete-term"]) [data-test-id="cs-button-group"] button.Button--destructive:has-text("Delete"), .ReactModal__taxonomy:has(h3[data-test-id="cs-modal-title-delete-term"]) button.Button--destructive:has-text("Delete")',
  /** taxonomy-verticle-menu.html — export-a-taxonomy doc step 3. */
  "Taxonomy row vertical menu Export as JSON (doc step)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Export as JSON")',
  "Taxonomy row vertical menu Export as CSV (doc step)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Export as CSV")',
  /** edit-taxonomy.html — doc step 4. */
  "Edit Taxonomy modal Update button (doc step)":
    '[data-test-id="cs-taxonomy-createBtn"]:has-text("Update"), .ReactModal__taxonomy [data-test-id="cs-taxonomy-createBtn"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  /** taxonomy-header.html — doc "Create New Taxonomy" button (import-a-taxonomy doc step 2); verify only — UI may show "New Taxonomy". */
  "Create New Taxonomy split button (doc step)":
    '.create-taxonomy-split-cta button.Button--primary:has-text("New Taxonomy")',
  /** taxonomy-listing.html */
  "Taxonomy page title (doc step)": '[data-test-id="cs-page-title"]:has-text("Taxonomy")',
  /** create-term.html — modal titles only (portal); do not mix with Term Details or .first() hits wrong node. */
  "Create Term modal title (doc step)":
    '.ReactModal__taxonomy [data-test-id="cs-modal-title-create-term"], .ReactModal__taxonomy h3[data-test-id="cs-modal-title-create-term"], .ReactModal__taxonomy [data-test-id="cs-modal-title-create-sibling-term"], .ReactModal__taxonomy h3[data-test-id="cs-modal-title-create-sibling-term"]',
  /** create-term.html — doc "Name" for the term (UI: Term Name). */
  "Create Term Term Name field label (doc step)":
    '[data-test-id="cs-modal-description"] label[for="term-name"], label[for="term-name"][data-test-id="cs-field-label"], .terms-edit-form label[for="name"], .terms-details-section label[for="name"]',
  /** create-term.html — doc "Unique ID" (UI: Term UID). */
  "Create Term Term UID field label (doc step)":
    '[data-test-id="cs-modal-description"] label[for="term-uid"], label[for="term-uid"][data-test-id="cs-field-label"], .terms-edit-form label[for="uid"], .terms-details-section label[for="uid"].taxonomy-edit-uid, .terms-details-section label[for="uid"]',
  "Create Term Term Name input (doc step)":
    '[data-test-id="term-name-input"], input#term-name[name="name"], .terms-edit-form input[name="name"]',
  "Create Term Term UID input (doc step)":
    '[data-test-id="term-uid-input"], input#term-uid[name="uid"], .terms-edit-form input[name="uid"]',
  /** create-child-term.html — doc nested term modal (portal only; avoid inline panel false positives). */
  "Create Child Term modal title (doc step)":
    '.ReactModal__taxonomy [data-test-id="cs-modal-title-create-child-term"], .ReactModal__taxonomy h3[data-test-id="cs-modal-title-create-child-term"]',
  /** move-term-modal.html — move-or-reorder-a-term doc (confirmation popup). */
  "Move Term modal title (doc step)":
    '[data-test-id="cs-modal-title-move-term"], h3[data-test-id="cs-modal-title-move-term"]',
  "Move Term modal confirmation text (doc step)":
    '.ReactModal__taxonomy [data-test-id="cs-modal-description"], .ReactModal__Content__body[data-test-id="cs-modal-description"]',
  /** new-term-details-page.html — edit-a-term doc (Term Details + form). */
  "Term Details section title (doc step)":
    '.terms-details-section-terms-selected .terms-detail-title, .terms-details-section .terms-detail-title:has-text("Term Details")',
  "Edit Term Term Name field label (doc step)":
    '.terms-edit-form label[for="name"][data-test-id="cs-field-label"], .terms-details-section label[for="name"][data-test-id="cs-field-label"]',
  "Edit Term UID cannot be changed instruction (doc step)":
    '.terms-edit-form [data-test-id="cs-instruction-text"], .terms-details-section [data-test-id="cs-instruction-text"]',
  "Edit Term Term Name input (doc step)":
    '.terms-edit-form input[name="name"], .terms-details-section input[name="name"]',
  /** create-new-taxonomy.html — doc "Create New Taxonomy" modal; UI title casing may differ. */
  "Create New Taxonomy modal title (doc step)":
    '[data-test-id="cs-modal-title-create-new-taxonomy"], h3[data-test-id="cs-modal-title-create-new-taxonomy"], [data-testid="taxonomy-create-modal"] h3, .ReactModal__taxonomy:has(input[name="taxonomy-create-modal-name"]) .ReactModal__Content__header h3, .ReactModal__taxonomy .ReactModal__Content__header h3',
  "Create Taxonomy Name field label (doc step)":
    '[data-test-id="cs-modal-description"] label[for="taxonomy-create-modal-name"], [data-test-id="cs-field-label"]:has-text("Name")',
  "Create Taxonomy UID field label (doc step)":
    'label[for="taxonomy-create-modal-uid"].taxonomy-edit-uid, label[for="taxonomy-create-modal-uid"]',
  "Create Taxonomy Description field label (doc step)":
    'label[for="taxonomy-create-modal-description"]',
  "Create Taxonomy UID instruction text (doc step)":
    '[data-test-id="cs-modal-description"] [data-test-id="cs-instruction-text"]',
  "Create Taxonomy Name input (doc step)": 'input[name="taxonomy-create-modal-name"]',
  "Create Taxonomy UID input (doc step)": 'input[name="taxonomy-create-modal-uid"]',
  "Create Taxonomy Description textarea (doc step)": 'textarea[name="taxonomy-create-modal-description"]',
  /** edit-taxonomy.html — doc "Edit Taxonomy" modal. */
  "Edit Taxonomy modal title (doc step)":
    '[data-test-id="cs-modal-title-edit-taxonomy"], h3[data-test-id="cs-modal-title-edit-taxonomy"]',
  "Edit Taxonomy Name field label (doc step)":
    '[data-test-id="cs-modal-description"] label[for="taxonomy-create-modal-name"], [data-test-id="cs-modal-description"] [data-test-id="cs-field-label"]:has-text("Name")',
  "Edit Taxonomy UID field label (doc step)":
    'label[for="taxonomy-create-modal-uid"].taxonomy-edit-uid, label[for="taxonomy-create-modal-uid"]',
  "Edit Taxonomy UID read only label (doc step)":
    'label[for="taxonomy-create-modal-uid"] .FieldLabel__required-text:has-text("read only")',
  "Edit Taxonomy Description field label (doc step)": 'label[for="taxonomy-create-modal-description"]',
  "Edit Taxonomy UID instruction text (doc step)":
    '[data-test-id="cs-modal-description"] [data-test-id="cs-instruction-text"]',
  "Edit Taxonomy Name input (doc step)": 'input[name="taxonomy-create-modal-name"]',
  "Edit Taxonomy Description textarea (doc step)": 'textarea[name="taxonomy-create-modal-description"]',
  /** import-taxonomy.html — import-a-taxonomy doc step 3. */
  "Import Taxonomy modal title (doc step)":
    '[data-test-id="cs-modal-title-import-taxonomy"], h3[data-test-id="cs-modal-title-import-taxonomy"]',
  "Import Taxonomy Choose a File label (doc step)":
    'label[for="fileInput"].file-upload-container__input-button-label, .ReactModal__taxonomy__import label[for="fileInput"]',
  "Import Taxonomy file input (doc step)":
    '.ReactModal__taxonomy__import #fileInput, .ReactModal__taxonomy__import input[name="fileInput"], .ReactModal__taxonomy__import input[type="file"]',
  /** import-taxonomy-checkbox.html — full sentence next to the checkbox (doc step 4). */
  "Import Taxonomy display at top label (doc step)":
    '.ReactModal__taxonomy__import .taxonomy-imported-checkbox [data-test-id="cs-checkbox-label"], .ReactModal__taxonomy__import [data-test-id="cs-checkbox-label"]',
  /** delete-taxonomy.html — delete-a-taxonomy doc step 4. */
  "Delete Taxonomy modal title (doc step)":
    '[data-test-id="cs-modal-title-delete-taxonomy"], h3[data-test-id="cs-modal-title-delete-taxonomy"]',
  "Delete Taxonomy modal instruction type DELETE (doc step)":
    '.ReactModal__taxonomy .taxonomy-delete-text:has-text("DELETE")',
  "Delete Taxonomy type DELETE input (doc step)":
    '[data-test-id="cs-taxonomy-textInputDelete"] input, .ReactModal__taxonomy input[placeholder*="DELETE" i]',
  /** delete-term-modal.html — delete-a-term doc step 4. */
  "Delete Term modal title (doc step)":
    '[data-test-id="cs-modal-title-delete-term"], h3[data-test-id="cs-modal-title-delete-term"]',
  "Delete Term modal instruction type DELETE (doc step)":
    '.ReactModal__taxonomy:has([data-test-id="cs-modal-title-delete-term"]) .taxonomy-delete-text:has-text("Please type DELETE")',
  "Delete Term type DELETE input (doc step)":
    '.ReactModal__taxonomy:has([data-test-id="cs-modal-title-delete-term"]) input[placeholder*="DELETE" i], .ReactModal__taxonomy:has([data-test-id="cs-modal-title-delete-term"]) [data-test-id="cs-modal-description"] input[name="name"]',
};

/** Re-export automation-only locator groups for custom scripts / imports from one entry. */
export * from "./automation.locators";
