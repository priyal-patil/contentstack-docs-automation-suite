export const CLICK_SELECTORS: Record<string, string> = {
  "Content Models (doc step)":
    '[data-test-id="cms-nav-content-models"], button:has-text("Content Models"), a:has-text("Content Models")',
  "+ New Content Type (doc step)":
    'button:has-text("New Content Type"), button[aria-label="Create New Content Type"]',
  "Create New (doc step)":
    '[data-test-id="cs-cb-new-ct-child"], button:has-text("Create New"), [role="menuitem"]:has-text("Create New")',
  "Single (Type) (doc step)":
    '[data-testid="cs-modal"][role="dialog"] label:has-text("Single"), [data-testid="cs-modal"][role="dialog"] [role="radio"]:has-text("Single")',
  "Save and proceed (doc step)":
    '[data-test-id="cs-ct-create-modal-submit"], [data-testid="cs-modal"] button:has-text("Save and proceed"), button:has-text("Save and proceed")',
  "Insert a field":
    '[data-test-id="cs-field-type-selector"] .FieldTypeSelector:visible, [data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"]:visible',
  "Taxonomy (doc step)":
    '.Infomodal--top-left .FieldTypeSelector__field-tile:has([data-test-id*="taxonomy"]), div.FieldTypeSelector__field-tile:has([data-test-id*="taxonomy"]), div.FieldTypeSelector__field-tile:has-text("Taxonomy")',
  "Save and Close (doc step)":
    '[data-test-id="cs-ct-save-close"], button:has-text("Save and Close")',
  "Entries (doc step)":
    '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "New Entry (doc step)":
    'button[data-test-id="cs-new-entry-all-entry"], button[aria-label="Create New Entry"], button:has-text("New Entry")',
  "Taxonomy CT row (doc step)":
    '.ReactModal__new-entry [role="row"]:has-text("Taxonomy CT-"), [role="dialog"] [role="row"]:has-text("Taxonomy CT-"), [role="dialog"] table tr:has-text("Taxonomy CT-")',
  "Create Entry (doc step)":
    '[data-test-id="cs-new-entry-single-proceed"], [role="dialog"] button:has-text("Create"), [role="dialog"] button:has-text("Proceed")',
  "Taxonomy field (doc step)":
    '[data-test-id*="taxonomy" i], [class*="Taxonomy"], :has-text("Taxonomy")',
  "Select Term(s) (doc step)":
    'button:has-text("Select Term"), button:has-text("Select Term(s)"), [data-test-id*="select-term" i]',
  "First term (doc step)":
    '[role="dialog"] [role="row"], [role="dialog"] [role="option"], [role="dialog"] .Checkbox, [role="dialog"] [data-test-id*="term" i]',
  "Apply (doc step)":
    '[role="dialog"] button:has-text("Apply"), button[data-test-id*="apply" i]',
  "Save (doc step)":
    '[data-test-id="cs-entry-save"], button:has-text("Save")'
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Name (doc step)":
    '[data-testid="cs-modal"][role="dialog"] input[name="name"], [data-test-id="cs-ct-create-modal-ct-name-input"] input',
  "Description (ct create) (doc step)":
    '[data-test-id="cs-ct-modal-ct-description-input"] textarea[name="description"]'
};

