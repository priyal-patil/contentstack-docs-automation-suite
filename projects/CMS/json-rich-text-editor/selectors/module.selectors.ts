/**
 * Selectors for JSON Rich Text Editor (content type builder) flows.
 * DOM refs: data/dom/CMS/json-rich-text-editor/*.html, data/dom/CMS/content-models/content-builder.html
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Content Models (doc step)":
    '[data-test-id="cms-nav-content-models"], a:has-text("Content Models"), button:has-text("Content Models")',
  "+ New Content Type (doc step)":
    '[data-test-id="cs-cb-new-ct"], button:has-text("New Content Type"), button[aria-label="Create New Content Type"]',
  "Create New (doc step)":
    '[data-test-id="cs-cb-new-ct-child"], button:has-text("Create New"), [role="menuitem"]:has-text("Create New")',
  "Save and proceed (doc step)":
    '[data-test-id="cs-ct-create-modal-submit"], [data-testid="cs-modal"] button:has-text("Save and proceed"), [data-testid="cs-modal"] button:has-text("Create"), button:has-text("Save and proceed")',
  "Insert a field (doc step)":
    '[data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"], [data-test-id="cs-field-type-selector"] .FieldTypeSelector__action-bar svg[name="PurpleAdd"], button:has(svg[name="PurpleAdd"])',
  "Save (doc step)": '[data-test-id="cs-ct-save"], button:has-text("Save")',
  "Save and Close (doc step)": '[data-test-id="cs-ct-save-close"], button:has-text("Save and Close")',
  /** ReactModal__warning "Save changes" / unsaved changes on leave CT builder — primary action. */
  "Save unsaved CT builder changes (doc step)":
    '.ReactModal__warning [data-test-id="cs-cb-unsaved-save"], [data-test-id="cs-cb-unsaved-save"]',

  "JSON Rich Text Editor field tile (doc step)":
    '.Infomodal--top-left .FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-supercharged_rte"]), div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-supercharged_rte"]), [data-test-id="cs-ct-select-field-supercharged_rte"]',

  "JSON Rich Text Editor Properties heading (doc step)":
    '[data-test-id="cs-content-types-field-properties-title"], h4.FieldProperties__heading:has-text("JSON Rich Text Editor Properties")',

  "JSON RTE Advanced tab (doc step)": '[data-test-id="cs-ct-field-json-rich-text-editor-tab-advanced"]',

  "Editor Type Custom JSON RTE (doc step)":
    '[data-test-id="cs-content-type-field-json-rich-text-editor-advanced-custom-editor-type-radio"]',

  "JSON RTE Select All formatting options (doc step)":
    '[data-test-id="cs-content-type-field-json-rich-text-editor-advanced-formatting-options-select-all-checkbox"]',

  "Entries (doc step)":
    'a[href*="/entries"]:has([data-test-id="cms-nav-entries"]), [data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "New Entry (doc step)":
    'button[data-test-id="cs-new-entry-all-entry"], a[data-test-id="cs-new-entry-all-entry"], [data-test-id^="cs-new-entry"], button[aria-label="Create New Entry"], button:has-text("New Entry"), a:has-text("New Entry"), button:has-text("+ New Entry")',
  /** Select Content Type modal: virtualized Table__body; runtime prefers row whose title matches Shared JSON RTE Doc CT-{unique} (see actionRules). */
  "First content type row New Entry modal (doc step)":
    '.ReactModal__new-entry .Table__body [data-test-id="cs-table-body-row-0"], [role="dialog"]:has-text("Select Content Type") .Table__body [data-test-id="cs-table-body-row-0"], [role="dialog"] [data-test-id="cs-table-body-row-0"]',
  "Slash RTE content type row New Entry modal (doc step)":
    '.ReactModal__new-entry [role="row"]:has-text("Slash RTE CT-"), [role="dialog"] [role="row"]:has-text("Slash RTE CT-"), [role="dialog"] table tr:has-text("Slash RTE CT-")',
  "Create Entry (doc step)":
    '[data-test-id="cs-new-entry-single-proceed"], button[aria-label="Proceed"]:not([disabled]), [role="dialog"] button:has-text("Proceed"):not([disabled]), [role="dialog"] button:has-text("Create")',
  "JSON RTE entry editor focus (doc step)":
    '[data-test-id="cs-edit-entry-field-json_rte"] #scrte-editable, #scrte-editable',
  "Save entry from editor (doc step)":
    '[data-test-id="cs-entry-not-locked-and-localized-save"], [data-test-id="cs-entry-save"], button[aria-label="Save Changes"], button:has-text("Save")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Name (doc step)":
    '[data-testid="cs-modal"][role="dialog"] input[name="name"], [data-test-id="cs-ct-create-modal-ct-name-input"] input',
  "Type (doc step)":
    '[data-testid="cs-modal"][role="dialog"] [role="radio"], [data-testid="cs-modal"] label:has-text("Single"), [data-testid="cs-modal"] label:has-text("Multiple")',
  "Entry Title (doc step)":
    '[data-test-id="cs-title-input"] input:not([type="number"]), [data-test-id="cs-single-line-field-title"] input:not([type="number"]), [data-test-id="cs-edit-entry-field-title"] input, input[placeholder*="Type something" i]:not([type="number"]), input[name="title"]:not([type="number"]), input[placeholder*="title" i]:not([type="number"]), [aria-label*="title" i]',
};
