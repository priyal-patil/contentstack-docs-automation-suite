export const CLICK_SELECTORS: Record<string, string> = {
  // Reuse stable selectors from module where possible
  "Advanced (doc step)": '[data-test-id="cs-ct-field-rich-text-editor-tab-advanced"]',
  "Custom (Editor Type) (doc step)":
    '[data-test-id="cs-content-type-field-rich-text-editor-advanced-custom-editor-type-radio"]',

  // Insert Object -> Embed icon (from provided DOM snippet)
  "Embed icon (Insert Object) (doc step)":
    '[data-test-id="cs-content-type-field-rich-text-editor-advanced-formatting-options-Embed"], [data-test-id="cs-ctf-rte-custom-insert-option-6"]',

  // Dropdown that opens embed picker modal
  "Select Object(s) (open modal) (doc step)":
    '[data-test-id="cs-content-type-field-rich-text-editor-advanced-select-objects-tag-as-select"], div.Select__tag__placeholder:has-text("Select Object(s)"), div.Select__tag--v2:has-text("Select Object(s)")',

  // In modal: check Embed Asset(s)
  "Embed Asset(s) (doc step)": 'role=dialog >> text=Embed Asset(s)',

  // In modal: pick first content type row
  "First content type checkbox (doc step)":
    'role=dialog >> role=row[name="row 1"] >> css=[data-test-id="cs-checkbox"] .Checkbox__box',

  // Proceed from modal
  "Add Content Type(s) (doc step)": '[data-test-id="cs-new-entry-multiple-proceed"]',
};

export const INPUT_SELECTORS: Record<string, string> = {};

