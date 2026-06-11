/**
 * Copy Global Field modal — primary **Copy** CTA (`data-test-id="cs-cb-copy-gf"`, `aria-label="Copy Global Field"`).
 * Import these for custom flows/tests; flow steps use keys `"Copy (doc step)"` / `"Copy (global field modal) (doc step)"` in CLICK_SELECTORS.
 * @see data/dom/CMS/content-models/copy-global-field-copy-button.html
 */
export const GLOBAL_FIELD_COPY_MODAL_PRIMARY_BUTTON = '[data-test-id="cs-cb-copy-gf"]';
export const GLOBAL_FIELD_COPY_MODAL_COPY_CTA_LOCATOR =
  `${GLOBAL_FIELD_COPY_MODAL_PRIMARY_BUTTON}, button[aria-label="Copy Global Field"], [role="dialog"] button.Button--primary:has-text("Copy"), [role="dialog"] button:has-text("Copy")`;

export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id*="stack-card" i], [data-test-id*="stack-list" i] [role="button"], a[href*="/#!/stack/"], .stack-card, .stacklist-card',
  "Content Models (doc step)":
    '[data-test-id="cms-nav-content-models"], button:has-text("Content Models"), a:has-text("Content Models")',
  "Any Content Type Row (doc step)":
    '[data-test-id^="cs-table-body-row-"]',
  "Any Content Type Row (or builder) (doc step)":
    '[data-test-id^="cs-table-body-row-"], [href*="/content-type/"][href*="content-type-builder"]',
  // Prefer sidebar-scoped cs-gf-button (see global-fields-content-models-sidebar-section.html). A broad
  // comma-union with cs-gf-section caused .first() to hit the wrapper; unreliably toggling the radio.
  // @see data/dom/CMS/content-models/global-fields-content-models-sidebar-section.html
  "Global Fields (doc step)":
    '[data-test-id="cs-page-layout-leftSidebar"] [data-test-id="cs-gf-button"], [data-test-id="cs-gf-button"]',
  "Global Fields page (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Global Fields"), .PageTitle:has-text("Global Fields"), [data-test-id="cs-page-layout-contentBody"] .globalField-contentlist, .contmoduleList.globalField-contentlist, [data-test-id="cs-page-layout-contentBody"] [title="Import Global Field"]',
  "Content Types (doc step)":
    'button:has-text("New Content Type"), button[aria-label="Create New Content Type"]',
  "Content Types tab (doc step)":
    '[role="radio"]:has-text("CONTENT TYPES"), [role="tab"]:has-text("CONTENT TYPES"), label:has-text("CONTENT TYPES")',
  "+ New Content Type (doc step)":
    'button:has-text("New Content Type"), button[aria-label="Create New Content Type"]',
  "Create New (doc step)":
    '[data-test-id="cs-cb-new-ct-child"], button:has-text("Create New"), [role="menuitem"]:has-text("Create New"), div:has-text("Create New"):visible',
  "Single (Type) (doc step)":
    '[data-testid="cs-modal"][role="dialog"] label:has-text("Single"), [data-testid="cs-modal"][role="dialog"] [role="radio"]:has-text("Single")',
  "Save and proceed (doc step)":
    '[data-test-id="cs-ct-create-modal-submit"], [data-testid="cs-modal"] button:has-text("Save and proceed"), [data-testid="cs-modal"] button:has-text("Create"), button:has-text("Save and proceed"), button:has-text("Create")',
  "Import Global Field (doc step)":
    'button[data-test-id="table-import-icon"], div[title="Import Global Field"] button[data-test-id="table-import-icon"]',
  "Import Global Field modal (doc step)":
    '[data-test-id="cs-modal-title-import-global-field"]:has-text("Import Global Field"), [data-testid="cs-modal"][role="dialog"]:has-text("Import Global Field")',
  "Choose a file (global field) (doc step)":
    '.upload-box[aria-label="Choose File to Import"], [data-test-id="cs-modal-description"] .upload-box',
  "Import (global field modal) (doc step)":
    'button[data-test-id="cs-import-file-import"], button:has-text("Import")',
  "Global Field actions menu (doc step)":
    '[data-test-id^="cs-table-body-row-0"] [aria-label*="action" i], [role="row"] [aria-label*="row 1 action" i], [role="menu"][aria-label*="row 1 action" i], [role="menu"][aria-label*="row action" i]',
  "Edit (Global Field action) (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-gf-action-edit"], [data-test-id="cs-gf-action-edit"]',
  "Edit option (Global Field action) (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-gf-action-edit"], [data-test-id="cs-gf-action-edit"], li:has-text("Edit")',
  "Copy Global Field option (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-gf-action-copy"], [data-test-id="cs-gf-action-copy"], li:has-text("Copy Global Field")',
  "Export option (Global Field action) (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-gf-action-export"], [data-test-id="cs-gf-action-export"], li:has-text("Export")',
  "Delete option (Global Field action) (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-gf-action-delete"], [data-test-id="cs-gf-action-delete"], li:has-text("Delete")',
  "Delete Global Field modal (doc step)":
    '[data-test-id="cs-modal-title-delete-global-field"]:has-text("Delete Global Field"), [data-testid="cs-modal"][role="dialog"]:has-text("Delete Global Field"), .globalFiled-delete:has-text("Delete Global Field")',
  "Delete (global field modal) (doc step)":
    'button[data-test-id="cs-cb-delete-gf"], button[aria-label="Delete Global Field"], button:has-text("Delete")',
  "Copy Global Field modal (doc step)":
    '[data-test-id="cs-modal-title"]:has-text("Copy Global Field"), .GF_copy_modal:has-text("Copy Global Field")',
  /** Primary Copy CTA in Copy Global Field modal — uses {@link GLOBAL_FIELD_COPY_MODAL_COPY_CTA_LOCATOR}. */
  "Copy (doc step)": GLOBAL_FIELD_COPY_MODAL_COPY_CTA_LOCATOR,
  "Copy (global field modal) (doc step)": GLOBAL_FIELD_COPY_MODAL_COPY_CTA_LOCATOR,
  "Edit Global Field modal (doc step)":
    '[data-test-id="cs-modal-title"]:has-text("Edit Global Field"), [data-testid="cs-modal"][role="dialog"]:has-text("Edit Global Field")',
  "Update (edit global field) (doc step)":
    '[data-test-id="cs-cb-edit-ct-details"], button:has-text("Update")',
  "Any Global Field title (doc step)":
    'a[href*="/global-field/"][href*="global-field-builder"]:visible, a[href*="#/stack/"][href*="/global-field/"][href*="global-field-builder"]:visible',
  "+ New Global Field (doc step)":
    '[data-test-id="cs-cb-new-gf"], button:has-text("New Global Field")',
  "Create New Global Field modal (doc step)":
    '[data-test-id="cs-modal-title"]:has-text("Create New Global Field"), [data-testid="cs-modal"][role="dialog"]:has-text("Create New Global Field")',
  "Proceed (doc step)":
    '[data-test-id="cs-cb-create-gf-details"], button:has-text("Proceed")',
  "Insert a field":
    '[data-test-id="cs-field-type-selector"] .FieldTypeSelector:visible, [data-test-id="cs-field-type-selector"] .FieldTypeSelector__action-sign:visible, [data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"]:visible',
  "Insert a field (doc step)":
    '[data-test-id="cs-field-type-selector"] .FieldTypeSelector:visible, [data-test-id="cs-field-type-selector"] .FieldTypeSelector__action-sign:visible, [data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"]:visible',
  "Builder area (dismiss properties)":
    'div[id="PageLayout__body"]',
  "Single Line Textbox (doc step)":
    '.Infomodal--top-left .FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-single_line"]):visible, .Infomodal--top-left [data-test-id="cs-ct-select-field-single_line"]:visible, div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-single_line"]):visible',
  "Multi Line Textbox (doc step)":
    '.Infomodal--top-left .FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-multi_line"]):visible, .Infomodal--top-left [data-test-id="cs-ct-select-field-multi_line"]:visible, div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-multi_line"]):visible',
  "Number (doc step)":
    '.Infomodal--top-left .FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-number"]):visible, .Infomodal--top-left [data-test-id="cs-ct-select-field-number"]:visible, div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-number"]):visible',
  "Group (doc step)":
    '.Infomodal--top-left .FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-group"]):visible, div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-group"]):visible, div.FieldTypeSelector__field-tile:has-text("Group"):visible',
  "Reference (doc step)":
    '.Infomodal--top-left .FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-reference"]):visible, div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-reference"]):visible, div.FieldTypeSelector__field-tile:has-text("Reference"):visible',
  "Modular Blocks (doc step)":
    '.Infomodal--top-left .FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-modular_blocks"]):visible, div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-modular_blocks"]):visible, div.FieldTypeSelector__field-tile:has-text("Modular Blocks"):visible',
  "JSON Rich Text Editor (doc step)":
    '.Infomodal--top-left .FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-supercharged_rte"]):visible, div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-supercharged_rte"]):visible, div.FieldTypeSelector__field-tile:has-text("JSON Rich Text Editor"):visible',
  "File (doc step)":
    '.Infomodal--top-left .FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-file"]):visible, div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-file"]):visible, div.FieldTypeSelector__field-tile:has-text("File"):visible',
  "Link (doc step)":
    '.Infomodal--top-left .FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-link"]):visible, div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-link"]):visible, div.FieldTypeSelector__field-tile:has-text("Link"):visible',
  "Group Properties title (doc step)":
    '[data-test-id="cs-content-types-field-properties-title"]:has-text("Group Properties"), .FieldProperties__heading:has-text("Group Properties")',
  "Insert a sub-field (Group) (doc step)":
    '.ContentTypeField:has(h3:has-text("Banner")) .empty-field.field-type-selector-default [data-test-id="cs-field-type-selector"] .FieldTypeSelector__action-sign, .ContentTypeField:has(h3:has-text("Banner")) .empty-field.field-type-selector-default [data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"], .ContentTypeField:has-text("Group cannot be empty") .empty-field.field-type-selector-default [data-test-id="cs-field-type-selector"] .FieldTypeSelector__action-sign',
  "Insert a field (inside block) (doc step)":
    '.ModularBlocks [data-test-id="cs-field-type-selector"] .FieldTypeSelector__action-sign, .ModularBlocks [data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"], [class*="ModularBlocks"] [data-test-id="cs-field-type-selector"] .FieldTypeSelector__action-sign, [class*="ModularBlocks"] [data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"]',
  "+ New Block (doc step)":
    '[data-test-id="cs-cb-new-block"], button[aria-label="Add New Block"]',
  "Create (doc step)":
    '[data-test-id="cs-cb-add-block"], button[aria-label="Create Block"], button:has-text("Create")',
  "Group row (Banner) (doc step)":
    '.ContentTypeField:has(h3:has-text("Banner")), [class*="ContentTypeField"]:has(h3:has-text("Banner")), h3:has-text("Banner")',
  "Global (doc step)":
    '.Infomodal--top-left .FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-global_field"]):visible, div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-global_field"]):visible, div.FieldTypeSelector__field-tile:has-text("Global"):visible',
  "Global field row (doc step)":
    '.ContentTypeField:has(h3:has-text("Global")), .ContentTypeField:has(svg[name="Global"])',
  "Properties (Global) (doc step)":
    '.ContentTypeField:has(svg[name="Global"]) [data-test-id$="-option-properties"], .ContentTypeField:has(svg[name="Global"]) button:has(svg[name="Sliders"]), .ContentTypeField:has(h3:has-text("Global")) [data-test-id$="-option-properties"]',
  "Global Properties title (doc step)":
    '[data-test-id="cs-content-types-field-properties-title"]:has-text("Global Properties")',
  "Basic (doc step)":
    '[data-test-id="cs-ct-field-global-tab-basic"], [role="tab"]:has-text("Basic"), .Tab__item:has-text("Basic")',
  "Advanced (doc step)":
    '[data-test-id="cs-ct-field-global-tab-advanced"], [role="tab"]:has-text("Advanced"), .Tab__item:has-text("Advanced")',
  "Select Global Field (doc step)":
    '[data-test-id="cs-content-type-field-global-basic-select-global-field"]',
  "Any Global Field option (doc step)":
    '[role="listbox"] [role="option"]:not([aria-disabled="true"]), .Select-menu [role="option"]:not([aria-disabled="true"]), .Select__menu [role="option"]:not([aria-disabled="true"])',
  "Any Global Field row (doc step)":
    '[role="dialog"]:has-text("Select Global Fields") [role="rowgroup"] [role="row"]:has([role="cell"]), [role="dialog"]:has-text("Select Global Fields") table tr:has(td)',
  "Author Details content type row (doc step)":
    '.ReactModal__new-entry [data-test-id^="cs-table-body-row-"]:has([data-test-id="cs-content-type-list-title-text"]:has-text("Author Details")), .ReactModal__new-entry [data-test-id^="cs-table-body-row-"]:has([data-test-id="cs-content-type-list-title-text"]:has-text("author_details")), [role="dialog"]:has-text("Select Content Type") [role="row"]:has-text("Author Details"), [role="dialog"]:has-text("Select Content Type") [role="row"]:has-text("author_details"), [role="dialog"]:has-text("Select Content Type") table tr:has-text("Author Details"), [role="dialog"]:has-text("Select Content Type") table tr:has-text("author_details")',
  "Blog Post global field row (doc step)":
    '[role="dialog"]:has-text("Select Global Fields") [role="row"]:has-text("Blog Post-"), [role="dialog"]:has-text("Select Global Fields") table tr:has-text("Blog Post-")',
  "SEO Metadata global field row (doc step)":
    '[role="dialog"]:has-text("Select Global Fields") [role="row"]:has-text("SEO Metadata-"), [role="dialog"]:has-text("Select Global Fields") table tr:has-text("SEO Metadata-")',
  "Referenced Content Type selector (doc step)":
    '[data-test-id="cs-content-type-field-reference-basic-reference-tag-as-select"], [class*="FieldProperties"] div:has-text("Referenced Content Type") ~ div:has-text("Select"), [class*="FieldProperties"] [role="combobox"]:visible, [class*="FieldProperties"] [aria-label*="Referenced Content Type" i]',
  "Any Referenced Content Type option (doc step)":
    '[role="listbox"] [role="option"]:not([aria-disabled="true"]), .Select-menu [role="option"]:not([aria-disabled="true"]), .Select__menu [role="option"]:not([aria-disabled="true"])',
  "Any Referenced Content Type row (doc step)":
    '[role="dialog"] [role="rowgroup"] [role="row"]:has([role="cell"]), [role="dialog"] table tr:has(td)',
  "Add Content Type(s) (doc step)":
    '[data-test-id="cs-new-entry-multiple-proceed"], [role="dialog"] button:has-text("Add Content Type"), [role="dialog"] button:has-text("Proceed")',
  "Proceed (Select Global Fields) (doc step)":
    '[role="dialog"]:has-text("Select Global Fields") button:has-text("Proceed")',
  "Multiple (doc step)":
    '[data-test-id="cs-ct-field-global-multiple-disabled"]',
  "Non-localizable (doc step)":
    '[data-test-id="cs-ct-field-global-non-localizable-disabled"]',
  "Save (doc step)":
    '[data-test-id="cs-gf-save"], button:has-text("Save")',
  "Save and Close (doc step)":
    '[data-test-id="cs-gf-save-close"], button:has-text("Save and Close")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Global Field Name (doc step)":
    '[data-test-id="cs-gf-create-name-input"] input[name="name"], input[aria-label="name"]',
  "Description (doc step)":
    '[data-test-id="cs-gf-description-input"] textarea[name="description"], textarea[aria-label="description"]',
  "Name (doc step)":
    '[data-testid="cs-modal"][role="dialog"] input[name="name"], [data-test-id="cs-ct-create-modal-ct-name-input"] input',
  "Description (ct create) (doc step)":
    '[data-test-id="cs-ct-modal-ct-description-input"] textarea[name="description"], [data-test-id="cs-ct-edit-details-description"] textarea',
  "Name (edit global field) (doc step)":
    '[data-test-id="cs-gf-edit-name-input"] input[name="name"], [data-test-id="cs-gf-edit-name-input"] input[aria-label="name"]',
  "UID (edit global field) (doc step)":
    '[data-test-id="cs-gf-edit-uid-input"] input[name="uid"], [data-test-id="cs-gf-edit-uid-input"] input[aria-label="uid"]',
  "Description (edit global field) (doc step)":
    '[data-test-id="cs-gf-description-input"] textarea[name="description"], [data-test-id="cs-gf-description-input"] textarea[aria-label="description"]',
  "Name (copy global field) (doc step)":
    '[data-test-id="cs-gf-copy-modal-name-input"] input[name="name"], [data-test-id="cs-gf-copy-modal-name-input"] input[aria-label="name"]',
  "UID (copy global field) (doc step)":
    '[data-test-id="cs-gf-copy-modal-uid-input"] input[name="uid"], [data-test-id="cs-gf-copy-modal-uid-input"] input[aria-label="uid"]',
  "Description (copy global field) (doc step)":
    '[data-test-id="cs-gf-copy-modal-description-input"] textarea[name="description"], [data-test-id="cs-gf-copy-modal-description-input"] textarea[aria-label="description"]',
  "Global Field name confirm input (doc step)":
    '[data-test-id="cs-gf-delete-confirm-input-field"] input[name="name"], [data-test-id="cs-gf-delete-confirm-input-field"] input[aria-label="name"]',
  "Display Name (global basic) (doc step)":
    '[data-test-id="cs-content-type-field-global-basic-display-name-input"] input',
  "Unique ID (global basic) (doc step)":
    '[data-test-id="cs-content-type-field-global-basic-uid-input"] input',
  "Instruction Value (global basic) (doc step)":
    '[data-test-id="cs-content-type-field-global-basic-instruction-input"] textarea',
  "Help Text (global basic) (doc step)":
    '[data-test-id="cs-content-type-field-global-basic-help-text-input"] textarea',
  "Display Name (doc step)":
    '[data-test-id="cs-content-type-field-single-line-textbox-basic-display-name-input"] input, [class*="FieldProperties"] input[placeholder="Enter value"], [role="tabpanel"] input[placeholder="Enter value"]',
  "Search content types (doc step)":
    'input[data-test-id="cs-search-input-field"][aria-label="Search"], .Search__input[data-test-id="cs-search-input-field"]',
  "Block Name (doc step)":
    '[data-test-id="cs-cb-add-block-title-input"] input, input[placeholder="Enter block title"]',
};
