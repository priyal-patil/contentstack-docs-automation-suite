export const CLICK_SELECTORS: Record<string, string> = {
  "Content Models (doc step)":
    '[data-test-id="cms-nav-content-models"], button:has-text("Content Models"), a:has-text("Content Models")',
  "Global Fields (doc step)":
    '[data-test-id="cs-gf-button"], [data-test-id="cs-gf-section"], [data-test-id="cs-page-title"]:has-text("Global Fields")',
  "+ New Global Field (doc step)":
    '[data-test-id="cs-cb-new-gf"], button:has-text("New Global Field")',
  "Proceed (doc step)":
    '[data-test-id="cs-cb-create-gf-details"], button:has-text("Proceed")',
  "Insert a field":
    '[data-test-id="cs-field-type-selector"] .FieldTypeSelector:visible, [data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"]:visible',
  "Single Line Textbox (doc step)":
    '.Infomodal--top-left .FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-single_line"]):visible, .Infomodal--top-left [data-test-id="cs-ct-select-field-single_line"]:visible, div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-single_line"]):visible',
  "Builder area (dismiss properties)":
    'div[id="PageLayout__body"]',
  "Save and Close (doc step)":
    '[data-test-id="cs-gf-save-close"], [data-test-id="cs-ct-save-close"], button:has-text("Save and Close")',

  "+ New Content Type (doc step)":
    'button:has-text("New Content Type"), button[aria-label="Create New Content Type"]',
  "Create New (doc step)":
    '[data-test-id="cs-cb-new-ct-child"], button:has-text("Create New"), [role="menuitem"]:has-text("Create New")',
  "Save and proceed (doc step)":
    '[data-test-id="cs-ct-create-modal-submit"], [data-testid="cs-modal"] button:has-text("Save and proceed"), button:has-text("Save and proceed")',
  "Global (doc step)":
    '.Infomodal--top-left .FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-global_field"]):visible, div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-global_field"]):visible, div.FieldTypeSelector__field-tile:has-text("Global"):visible',
  "Global field row (doc step)":
    '.ContentTypeField:has(h3:has-text("Global")), .ContentTypeField:has(svg[name="Global"])',
  "Properties (Global) (doc step)":
    '.ContentTypeField:has(svg[name="Global"]) [data-test-id$="-option-properties"], .ContentTypeField:has(svg[name="Global"]) button:has(svg[name="Sliders"])',
  "Advanced (doc step)":
    '[data-test-id="cs-ct-field-global-tab-advanced"], [role="tab"]:has-text("Advanced"), .Tab__item:has-text("Advanced")',
  "Show as Tab (doc step)":
    '[data-test-id="cs-ct-field-global-tab-disabled"] label.toggle-switch, [data-test-id="cs-ct-field-global-tab-disabled"], [data-test-id*="show"][data-test-id*="tab"] label.toggle-switch, [data-test-id*="show-as-tab"] label.toggle-switch, .FieldProperties__container:has-text("Show as Tab") label.toggle-switch, .FieldProperties:has-text("Show as Tab") [role="switch"]',
  "Select Global Field (doc step)":
    '[data-test-id="cs-content-type-field-global-basic-select-global-field"]',
  "Any Global Field row (doc step)":
    '[role="dialog"]:has-text("Select Global Fields") [role="rowgroup"] [role="row"]:has([role="cell"]), [role="dialog"]:has-text("Select Global Fields") table tr:has(td)',
  "SEO Settings Global Field row (doc step)":
    '[role="dialog"]:has-text("Select Global Fields") [role="row"]:has-text("SEO Settings-"), [role="dialog"]:has-text("Select Global Fields") table tr:has-text("SEO Settings-")',
  "Proceed (Select Global Fields) (doc step)":
    '[role="dialog"]:has-text("Select Global Fields") button:has-text("Proceed")',

  "Entries (doc step)":
    'button[data-test-id="cms-nav-entries"], [data-test-id="cms-nav-entries"]',
  "Entries page (doc step)":
    'a[href*="/#!/stack/"][href*="/entries"].active, button[data-test-id="cms-nav-entries"], [data-test-id="cs-page-title"]:has-text("Entries"), .PageTitle:has-text("Entries")',
  "New Entry (doc step)":
    'button[data-test-id="cs-new-entry-all-entry"], button[aria-label="Create New Entry"], button:has-text("New Entry")',
  "Entry Tabs CT content type row (doc step)":
    '.ReactModal__new-entry [data-test-id^="cs-table-body-row-"]:has([data-test-id="cs-content-type-list-title-text"]:has-text("Entry Tabs CT")), [role="dialog"]:has-text("Select Content Type") [role="row"]:has-text("Entry Tabs CT"), [role="dialog"]:has-text("Select Content Type") table tr:has-text("Entry Tabs CT")',
  "First Entry row (doc step)":
    '[data-test-id^="cs-table-body-row-0"], [role="row"][data-test-id^="cs-table-body-row-"]',
  "Global tab (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Global"), .Tab__item:has-text("Global")',
  "Save (doc step)":
    '[data-test-id="cs-entry-save"], button:has-text("Save")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Global Field Name (doc step)":
    '[data-test-id="cs-gf-create-name-input"] input[name="name"], input[aria-label="name"]',
  "Description (doc step)":
    '[data-test-id="cs-gf-description-input"] textarea[name="description"], textarea[aria-label="description"]',
  "Display Name (doc step)":
    '[data-test-id="cs-content-type-field-single-line-textbox-basic-display-name-input"] input, [class*="FieldProperties"] input[placeholder="Enter value"]',
  "Name (doc step)":
    '[data-testid="cs-modal"][role="dialog"] input[name="name"], [data-test-id="cs-ct-create-modal-ct-name-input"] input',
  "Description (ct create) (doc step)":
    '[data-test-id="cs-ct-modal-ct-description-input"] textarea[name="description"]',
  "SEO Title (tab field) (doc step)":
    'input[aria-label*="seo title" i], input[name*="seo_title" i], input[name*="seotitle" i]',
};

