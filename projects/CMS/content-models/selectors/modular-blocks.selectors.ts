/**
 * Used by actionRules “open properties” path for Modular Blocks: hover field row, then force/DOM-click.
 * Keep in sync with "Properties (Single Line Textbox) (doc step)" — first segment must be this test id so .first() hits Sliders, not another field.
 */
export const MODULAR_BLOCKS_SINGLE_LINE_PROPERTIES_BUTTON_SELECTOR =
  '[data-test-id="cs-ct-single-line-textbox-option-properties"]';

/** Content type builder row that contains the Single Line properties icon (hover target before click). */
export const MODULAR_BLOCKS_SINGLE_LINE_FIELD_ROW_SELECTOR =
  `.ContentTypeField:has(${MODULAR_BLOCKS_SINGLE_LINE_PROPERTIES_BUTTON_SELECTOR})`;

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

  // Properties (Sliders) for Single Line Textbox only. Do NOT use [data-test-id$="-option-properties"] alone —
  // that matches Modular Blocks / other fields first in DOM, so .first() clicks the wrong icon vs manual.
  "Properties (Single Line Textbox) (doc step)":
    `${MODULAR_BLOCKS_SINGLE_LINE_PROPERTIES_BUTTON_SELECTOR}, button:has(svg[name="Sliders"])${MODULAR_BLOCKS_SINGLE_LINE_PROPERTIES_BUTTON_SELECTOR}`,

  // Delete one of the added fields (provided snippet)
  "Delete field (doc step)": '[data-test-id="cs-ct-single-line-textbox-option-delete"]',

  // Save content type
  "Save (doc step)": '[data-test-id="cs-ct-save"], button:has-text("Save")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  // Block name input (from provided DOM; fallback by placeholder)
  "Block Name (doc step)":
    '[data-test-id="cs-cb-add-block-title-input"] input, input[placeholder="Enter block title"]',

  // Display Name: wrapper is div[data-test-id="cs-content-type-field-single-line-textbox-basic-display-name-input"], input has TextInput__input + dynamic name *.displayName
  // Avoid broad "Enter value" fallbacks here — they can match a hidden input first and break .first().
  "Display Name (doc step)":
    '[data-test-id="cs-content-type-field-single-line-textbox-basic-display-name-input"] input.TextInput__input, [data-test-id="cs-content-type-field-single-line-textbox-basic-display-name-input"] input[placeholder="Enter value"], [data-test-id="cs-content-type-field-single-line-textbox-basic-display-name-input"] input, input[aria-label$=".displayName"].TextInput__input',
};

