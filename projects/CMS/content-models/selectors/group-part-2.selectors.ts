/**
 * Group doc – Part 2: Add Group then Number, Date, File inside group
 * https://www.contentstack.com/docs/developers/create-content-types/group
 * Reuses module.selectors.ts; Group-specific targets (same as part-1 for Properties/Advanced).
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Properties (Group) (doc step)":
    '.ContentTypeField:has(p[data-test-id="cs-ct-select-field-group"]), .ContentTypeField:has(svg[name="Group"]) [data-test-id$="-option-properties"], [data-test-id="cs-ct-field"] [data-test-id$="-option-properties"]',
  "Advanced (Group) (doc step)": '[data-test-id="cs-ct-field-group-tab-advanced"]',
  "Multiple (doc step)":
    '[data-test-id="cs-ct-field-group-multiple-disabled"] label.toggle-switch input[type="checkbox"], [data-test-id="cs-ct-field-group-multiple-disabled"] .toggle-switch',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Display Name (doc step)":
    '[data-test-id="cs-content-type-field-group-basic-display-name-input"] input, [data-test-id="cs-content-type-field-single-line-textbox-basic-display-name-input"] input, [class*="FieldProperties"] input[placeholder="Enter value"]',
};
