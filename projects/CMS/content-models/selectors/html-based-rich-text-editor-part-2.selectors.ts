export const CLICK_SELECTORS: Record<string, string> = {
  // Field tile in FieldTypeSelector
  "Rich Text Editor": '[data-test-id="cs-ct-select-field-rich_text_editor"]',

  // RTE Properties / Advanced section (some are in module selectors, but keeping critical ones here too)
  Properties: 'button:has(svg[name="Sliders"]), [role="button"]:has(svg[name="Sliders"])',
  Advanced: '[data-test-id="cs-ct-field-rich-text-editor-tab-advanced"]',
  "Advanced (Editor Type)":
    '[data-test-id="cs-content-type-field-rich-text-editor-advanced-advanced-editor-type-radio"]',
  "Advanced (doc step)": '[data-test-id="cs-ct-field-rich-text-editor-tab-advanced"]',
  "Advanced (Editor Type) (doc step)":
    '[data-test-id="cs-content-type-field-rich-text-editor-advanced-advanced-editor-type-radio"]',

  "Options (doc step)": 'text=Options',
  "Embed Object(s) (doc step)": 'text=Embed Object(s)',

  "Embed Object(s) Toggle":
    'label:has(input[name*="embed_object"]) .toggle-slider:visible, input[name*="embed_object"] + span:visible, input[name*="embed_object"] ~ span.toggle-slider:visible, input[name*="embed_object"] ~ .toggle-slider:visible, label:has(input[name*="embed_object"]):visible',
  "Embed Object(s) Toggle (doc step)":
    'label:has(input[name*="embed_object"]) .toggle-slider:visible, input[name*="embed_object"] + span:visible, input[name*="embed_object"] ~ span.toggle-slider:visible, input[name*="embed_object"] ~ .toggle-slider:visible, label:has(input[name*="embed_object"]):visible',

  // Select objects dropdown (opens a modal/picker)
  "Select Object(s)":
    '[data-test-id="cs-content-type-field-rich-text-editor-advanced-select-objects-tag-as-select"]',

  // In the picker: choose Embed Asset(s)
  "Embed Asset(s)":
    'role=dialog >> text=Embed Asset(s), role=dialog >> text=Embed Assets',

  // Proceed button
  "Add Content Type(s)": '[data-test-id="cs-new-entry-multiple-proceed"]',
  "Add Content Type(s) (doc step)": '[data-test-id="cs-new-entry-multiple-proceed"]',

  // Embed picker modal
  "Select Object(s) (open modal)":
    '[data-test-id="cs-content-type-field-rich-text-editor-advanced-select-objects-tag-as-select"], div.Select__tag__placeholder:has-text("Select Object(s)"), div.Select__tag--v2:has-text("Select Object(s)"), div:has-text("Select Object(s)"):has(img):visible',
  "Select Object(s) (open modal) (doc step)":
    '[data-test-id="cs-content-type-field-rich-text-editor-advanced-select-objects-tag-as-select"], div.Select__tag__placeholder:has-text("Select Object(s)"), div.Select__tag--v2:has-text("Select Object(s)"), div:has-text("Select Object(s)"):has(img):visible',
  "First content type checkbox":
    'role=dialog >> role=row[name="row 1"] >> css=[data-test-id="cs-checkbox"] .Checkbox__box',
  "First content type checkbox (doc step)":
    'role=dialog >> role=row[name="row 1"] >> css=[data-test-id="cs-checkbox"] .Checkbox__box',
};

export const INPUT_SELECTORS: Record<string, string> = {};

