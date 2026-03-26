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
  "Reference (doc step)":
    '.Infomodal--top-left .FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-reference"]):visible, div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-reference"]):visible, div.FieldTypeSelector__field-tile:has-text("Reference"):visible',
  "Referenced Content Type selector (doc step)":
    '[data-test-id="cs-content-type-field-reference-basic-select-reference-content-type"], button:has-text("Select Content Type"), [aria-label*="Select Content Type" i]',
  "Ref Parent CT content type row (doc step)":
    '[role="dialog"] [role="row"]:has-text("Ref Parent CT-"), [role="dialog"] table tr:has-text("Ref Parent CT-")',
  "Add Content Type(s) (doc step)":
    '[role="dialog"] button:has-text("Add Content Type"), [role="dialog"] button:has-text("Add Content Type(s)"), [role="dialog"] button:has-text("Add")',
  "Save and Close (doc step)":
    '[data-test-id="cs-ct-save-close"], button:has-text("Save and Close")',
  "Entries (doc step)":
    '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "New Entry (doc step)":
    'button[data-test-id="cs-new-entry-all-entry"], button[aria-label="Create New Entry"], button:has-text("New Entry")',
  "Ref Parent CT row (doc step)":
    '.ReactModal__new-entry [role="row"]:has-text("Ref Parent CT-"), [role="dialog"] [role="row"]:has-text("Ref Parent CT-"), [role="dialog"] table tr:has-text("Ref Parent CT-")',
  "Ref Child CT row (doc step)":
    '.ReactModal__new-entry [role="row"]:has-text("Ref Child CT-"), [role="dialog"] [role="row"]:has-text("Ref Child CT-"), [role="dialog"] table tr:has-text("Ref Child CT-")',
  "Create Entry (doc step)":
    '[data-test-id="cs-new-entry-single-proceed"], [role="dialog"] button:has-text("Create"), [role="dialog"] button:has-text("Proceed")',
  "First Entry row (doc step)":
    '[data-test-id^="cs-table-body-row-0"], [role="row"][data-test-id^="cs-table-body-row-"]',
  "Information icon (doc step)":
    '[data-test-id="cs-entry-edit-tab-information"], [name="Information"]',
  "Referenced In section (doc step)":
    '[data-test-id="cs-linkedlist"], .LinkedList:has(.LinkedList__heading:has-text("Referenced In"))',
  "View reference map (doc step)":
    '[data-test-id="cs-edit-entry-info-ref-tree-venus"], a:has-text("View reference map"), :has-text("View reference map")',
  "Referenced entry name (doc step)":
    '[data-test-id^="cs-edit-entry-info-ref-"], .InfoRowTitle .Link__solid',
  "Save (doc step)":
    '[data-test-id="cs-entry-save"], button:has-text("Save")'
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Name (doc step)":
    '[data-testid="cs-modal"][role="dialog"] input[name="name"], [data-test-id="cs-ct-create-modal-ct-name-input"] input',
  "Description (ct create) (doc step)":
    '[data-test-id="cs-ct-modal-ct-description-input"] textarea[name="description"]',
  "Search content types (doc step)":
    '[role="dialog"] input[placeholder*="Search" i], [role="dialog"] input[type="search"]',
  "Entry Title (doc step)":
    '[data-test-id="cs-title-input"] input, input[name="title"], input[placeholder*="title" i], [aria-label*="title" i]'
};

