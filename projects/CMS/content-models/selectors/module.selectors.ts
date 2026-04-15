export const CLICK_SELECTORS: Record<string, string> = {
  // Top nav
  "Content Models": '[data-test-id="cms-nav-content-models"]',

  // Readiness gate on Content Types page
  "Content Types": '[data-test-id="cs-cb-new-ct"]',

  // Common CTA on Content Types page (matches primary button: cs-cb-new-ct, aria-label Create New Content Type)
  "+ New Content Type":
    '[data-test-id="cs-cb-new-ct"], button:has-text("New Content Type"), button[aria-label="Create New Content Type"]',
  "New Content Type":
    '[data-test-id="cs-cb-new-ct"], button:has-text("New Content Type"), button[aria-label="Create New Content Type"]',
  "Create New (Content Type)":
    'div:has-text("Create New"):visible',
  "Create New": '[data-test-id="cs-cb-new-ct-child"]',

  // Create Content Type modal: submit to open builder
  "Save and proceed":
    '[data-test-id="cs-ct-create-modal-submit"], [data-testid="cs-modal"] button:has-text("Save and proceed"), [data-testid="cs-modal"] button:has-text("Create"), button:has-text("Save and proceed"), button:has-text("Create")',

  // Content Types list: open first visible row (common for content-models docs)
  "Open the content type you want to compare.": 'div[role="row"][data-test-id="cs-table-body-row-0"]',

  // Content Types table row actions (default to first row for determinism)
  "vertical ellipsis": '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-table-action-options"]',

  // Row action popover container + items
  Settings: '#tableRowActionNode [data-test-id="cs-ct-action-settings"]',
  Edit: '#tableRowActionNode [data-test-id="cs-ct-action-edit"]',

  // Builder actions (Save / Save and Close – common for all content type flows)
  Save: '[data-test-id="cs-ct-save"], button:has-text("Save")',
  "Save (doc step)": '[data-test-id="cs-ct-save"], button:has-text("Save")',
  "Save and Close": '[data-test-id="cs-ct-save-close"], button:has-text("Save and Close")',
  "Save and Close (doc step)": '[data-test-id="cs-ct-save-close"], button:has-text("Save and Close")',

  // Builder: dismiss properties panel (e.g. before + New Block)
  "Builder area (dismiss properties)": 'role=heading[name="Title"]',

  // Create Content Type modal (type radios)
  "Single (Type)":
    '[data-testid="cs-modal"][role="dialog"] label:has-text("Single"), [data-testid="cs-modal"][role="dialog"] [role="radio"]:has-text("Single")',

  // Field picker tiles (content type builder) – options after "Insert a field"; click the tile; fallback by text
  "Single Line Textbox (doc step)":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-single_line"]), div.FieldTypeSelector__field-tile:has-text("Single Line Textbox"), [data-test-id="cs-ct-select-field-single_line"]',
  "Single Line Textbox":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-single_line"]), div.FieldTypeSelector__field-tile:has-text("Single Line Textbox"), [data-test-id="cs-ct-select-field-single_line"]',
  "Multi Line Textbox (doc step)":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-multi_line"]), div.FieldTypeSelector__field-tile:has-text("Multi Line Textbox"), [data-test-id="cs-ct-select-field-multi_line"]',
  "Multi Line Textbox":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-multi_line"]), div.FieldTypeSelector__field-tile:has-text("Multi Line Textbox"), [data-test-id="cs-ct-select-field-multi_line"]',
  "Boolean (doc step)":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-boolean"]), div.FieldTypeSelector__field-tile:has-text("Boolean"), [data-test-id="cs-ct-select-field-boolean"]',
  Boolean:
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-boolean"]), div.FieldTypeSelector__field-tile:has-text("Boolean"), [data-test-id="cs-ct-select-field-boolean"]',
  "Number (doc step)":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-number"]), div.FieldTypeSelector__field-tile:has-text("Number"), [data-test-id="cs-ct-select-field-number"]',
  Number:
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-number"]), div.FieldTypeSelector__field-tile:has-text("Number"), [data-test-id="cs-ct-select-field-number"]',
  "File (doc step)":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-file"]), div.FieldTypeSelector__field-tile:has-text("File"), [data-test-id="cs-ct-select-field-file"]',
  File:
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-file"]), div.FieldTypeSelector__field-tile:has-text("File"), [data-test-id="cs-ct-select-field-file"]',
  "Date (doc step)":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-date"]), div.FieldTypeSelector__field-tile:has-text("Date"), [data-test-id="cs-ct-select-field-date"]',
  Date:
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-date"]), div.FieldTypeSelector__field-tile:has-text("Date"), [data-test-id="cs-ct-select-field-date"]',
  "Link (doc step)":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-link"]), div.FieldTypeSelector__field-tile:has-text("Link"), [data-test-id="cs-ct-select-field-link"]',
  Link:
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-link"]), div.FieldTypeSelector__field-tile:has-text("Link"), [data-test-id="cs-ct-select-field-link"]',
  "Reference (doc step)":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-reference"]), div.FieldTypeSelector__field-tile:has-text("Reference"), [data-test-id="cs-ct-select-field-reference"]',
  Reference:
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-reference"]), div.FieldTypeSelector__field-tile:has-text("Reference"), [data-test-id="cs-ct-select-field-reference"]',
  "JSON (doc step)":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-json"]), div.FieldTypeSelector__field-tile:has-text("JSON"), [data-test-id="cs-ct-select-field-json"]',
  JSON:
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-json"]), div.FieldTypeSelector__field-tile:has-text("JSON"), [data-test-id="cs-ct-select-field-json"]',
  "Rich Text Editor (doc step)":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-rich_text_editor"]), div.FieldTypeSelector__field-tile:has-text("Rich Text Editor"), [data-test-id="cs-ct-select-field-rich_text_editor"]',
  "Rich Text Editor":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-rich_text_editor"]), div.FieldTypeSelector__field-tile:has-text("Rich Text Editor"), [data-test-id="cs-ct-select-field-rich_text_editor"]',
  "Global (SEO) (doc step)":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-global_field"]), div.FieldTypeSelector__field-tile:has-text("Global"), div.FieldTypeSelector__field-tile:has-text("Global Field"), [data-test-id="cs-ct-select-field-global_field"]',
  "Global (SEO)":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-global_field"]), div.FieldTypeSelector__field-tile:has-text("Global"), div.FieldTypeSelector__field-tile:has-text("Global Field"), [data-test-id="cs-ct-select-field-global_field"]',
  "Modular Blocks (doc step)":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-modular_blocks"]), div.FieldTypeSelector__field-tile:has-text("Modular Blocks"), [data-test-id="cs-ct-select-field-modular_blocks"]',
  "Modular Blocks":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-modular_blocks"]), div.FieldTypeSelector__field-tile:has-text("Modular Blocks"), [data-test-id="cs-ct-select-field-modular_blocks"]',
  "Group (doc step)":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-group"]), div.FieldTypeSelector__field-tile:has-text("Group"), [data-test-id="cs-ct-select-field-group"]',
  Group:
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-group"]), div.FieldTypeSelector__field-tile:has-text("Group"), [data-test-id="cs-ct-select-field-group"]',

  // Modular Blocks: add block
  "+ New Block (doc step)": '[data-test-id="cs-cb-new-block"]',
  "Create (doc step)": '[data-test-id="cs-cb-add-block"]',

  // Add field (+) in builder – stable selector from content builder DOM (cs-field-type-selector)
  // The + icon is inside .FieldTypeSelector__action-bar which has class "hide" until the area is hovered.
  "Insert a field":
    '[data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"], [data-test-id="cs-field-type-selector"] [data-test-id="cs-icon"][name="PurpleAdd"], [data-test-id="cs-field-type-selector"] .FieldTypeSelector__action-bar svg[name="PurpleAdd"]',
  // Hover target to reveal the + (same container; use for hover-then-click)
  "Insert a field (hover area)": '[data-test-id="cs-field-type-selector"]',

  // Legacy / doc-step alias (same as Insert a field for content-models)
  "Insert a Field (doc step)":
    '[data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"], [data-test-id="cs-field-type-selector"] .FieldTypeSelector__action-bar svg[name="PurpleAdd"], button:has(svg[name="PurpleAdd"]), .FieldTypeSelector__action-bar svg[name="PurpleAdd"]',

  // Field config (Rich Text Editor docs)
  Properties:
    // Field "Properties" button (sliders icon). Keep broad but deterministic.
    'button:has(svg[name="Sliders"]), [role="button"]:has(svg[name="Sliders"])',
  "Add field (+)":
    'button:has(svg[name="PurpleAdd"]):visible, [role="button"]:has(svg[name="PurpleAdd"]):visible, svg[name="PurpleAdd"]:visible',
  Advanced: '[data-test-id="cs-ct-field-rich-text-editor-tab-advanced"]',
  "Advanced (Editor Type)":
    '[data-test-id="cs-content-type-field-rich-text-editor-advanced-advanced-editor-type-radio"]',
  "Custom (Editor Type)":
    '[data-test-id="cs-content-type-field-rich-text-editor-advanced-custom-editor-type-radio"]',
  "Custom (Editor Type) (doc step)":
    '[data-test-id="cs-content-type-field-rich-text-editor-advanced-custom-editor-type-radio"]',
  "Select Object(s)":
    '[data-test-id="cs-content-type-field-rich-text-editor-advanced-select-objects-tag-as-select"]',
  "Add Content Type(s)": '[data-test-id="cs-new-entry-multiple-proceed"]',

  // Compare Versions CTA (header button)
  "Compare Versions": '[data-test-id="cs-open-ct-compare-button"]',

  // Compare screen header title
  "Back to Content Type Editor": '[data-test-id="cs-page-title"]:has-text("Back to Content Type Editor")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  // Create Content Type modal
  Name: '[data-testid="cs-modal"][role="dialog"] input[name="name"], [data-test-id="cs-ct-create-modal-ct-name-input"] input',
  Description:
    '[data-test-id="cs-ct-modal-ct-description-input"] textarea[name="description"], [data-test-id="cs-ct-edit-details-description"] textarea',

  // Modular Blocks / field properties
  "Block Name (doc step)":
    '[data-test-id="cs-cb-add-block-title-input"] input, input[placeholder="Enter block title"]',
  "Display Name (doc step)":
    '[data-test-id="cs-content-type-field-single-line-textbox-basic-display-name-input"] input, [class*="FieldProperties"] input[placeholder="Enter value"], [role="tabpanel"] input[placeholder="Enter value"]',
};

