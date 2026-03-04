export const CLICK_SELECTORS: Record<string, string> = {
  // Open first content type row (from provided DOM: div[role="row"] with data-test-id)
  "Open the content type you want to add Modular Blocks to.":
    '[data-test-id="cs-table-body-row-0"]',

  // Field picker (+) in content type builder
  "Insert a Field (doc step)":
    'button:has(svg[name="PurpleAdd"]):visible, [role="button"]:has(svg[name="PurpleAdd"]):visible, svg[name="PurpleAdd"]:visible',

  // Select Modular Blocks field tile (from provided outerHTML)
  "Modular Blocks (doc step)": '[data-test-id="cs-ct-select-field-modular_blocks"]',

  // Create a new Modular Block (from provided DOM)
  "+ New Block (doc step)": '[data-test-id="cs-cb-new-block"]',
  "Create (doc step)": '[data-test-id="cs-cb-add-block"]',

  // Dismiss Modular Blocks Properties panel so "+ New Block" opens the add-block form
  "Builder area (dismiss properties)": 'role=heading[name="Title"]',

  // Insert field inside the selected block (PurpleAdd in block editor)
  "Insert a Field (inside block) (doc step)":
    'div.FieldTypeSelector__action-bar:visible svg[name="PurpleAdd"], div.FieldTypeSelector__action-bar:visible [data-test-id="cs-icon"][name="PurpleAdd"]',

  // Pick a field tile to add inside block (doc says "select any field")
  "Single Line Textbox (doc step)": '[data-test-id="cs-ct-select-field-single_line"]',

  // Rename: open properties for the Single Line Textbox inside the block (field has dynamic id e.g. cs-ct-banner-1-option-properties)
  "Properties (Single Line Textbox) (doc step)":
    'div.Block .ContentTypeField [data-test-id$="-option-properties"], [data-test-id="cs-ct-single-line-textbox-option-properties"]',

  // Delete one of the added fields (provided snippet)
  "Delete field (doc step)": '[data-test-id="cs-ct-single-line-textbox-option-delete"]',

  // Save content type
  "Save (doc step)": '[data-test-id="cs-ct-save"], button:has-text("Save")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  // Block name input (from provided DOM; fallback by placeholder)
  "Block Name (doc step)":
    '[data-test-id="cs-cb-add-block-title-input"] input, input[placeholder="Enter block title"]',

  // Display Name input in Single Line Textbox properties panel (panel may use same component; first "Enter value" in panel)
  "Display Name (doc step)":
    '[data-test-id="cs-content-type-field-single-line-textbox-basic-display-name-input"] input, [class*="FieldProperties"] input[placeholder="Enter value"], [role="tabpanel"] input[placeholder="Enter value"]',
};

