export const CLICK_SELECTORS: Record<string, string> = {
  // Field tile in FieldTypeSelector
  "Rich Text Editor": '[data-test-id="cs-ct-select-field-rich_text_editor"]',

  // Newly added field card/container in builder canvas
  "Rich Text Editor (field card)":
    'div:has(> h3:has-text("Rich Text Editor")), div:has(h3:has-text("Rich Text Editor"))',

  "Rich Text Editor (added field row)": 'role=heading[name="Rich Text Editor"]',

  // Click the first action icon button in the RTE row
  "Open Rich Text Editor properties (row)":
    'xpath=//h3[normalize-space(.)="Rich Text Editor"]/ancestor::*[self::div or self::li][1]//button[2]',

  // RTE Properties Advanced tab (panel opens on Basic tab; Custom is on Advanced)
  "Advanced (RTE tab) (doc step)":
    '[data-test-id="cs-ct-field-rich-text-editor-tab-advanced"], [role="tab"]:has-text("Advanced"), .Tab__item:has-text("Advanced"), button:has-text("Advanced")',

  // RTE config
  "Custom (Editor Type)":
    '[data-test-id="cs-content-type-field-rich-text-editor-advanced-custom-editor-type-radio"]',
  "Custom (Editor Type) (doc step)":
    '[data-test-id="cs-content-type-field-rich-text-editor-advanced-custom-editor-type-radio"]',

  // Toolbar options selection in custom editor
  "Select All": 'label:has-text("Select All") .Checkbox__box, label:has-text("Select All")',
};

export const INPUT_SELECTORS: Record<string, string> = {};

