/**
 * Boolean doc – Part 2: Example 2 – Default Boolean Value
 * https://www.contentstack.com/docs/developers/create-content-types/boolean
 * Does Part 1 steps then Advanced → True, verify non-localizable off, add 2nd and 3rd Boolean.
 * Reuses module.selectors.ts; Part 2–specific targets here (includes Part 1 + Advanced, True, nth).
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Properties (Boolean) (doc step)":
    '.ContentTypeField:has(p[data-test-id="cs-ct-select-field-boolean"]), .ContentTypeField:has(svg[name="Boolean"]) [data-test-id$="-option-properties"], [data-test-id="cs-ct-field"] [data-test-id$="-option-properties"]',
  "Advanced (Boolean) (doc step)": '[data-test-id="cs-ct-field-boolean-tab-advanced"]',
  "True (doc step)": '[data-test-id="cs-ct-field-boolean-true"]',
  "Non-localizable (off) (doc step)":
    '[data-test-id="cs-ct-field-boolean-non-localizable-disabled"] input[type="checkbox"]:disabled, [data-test-id="cs-ct-field-boolean-non-localizable-disabled"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Display Name (doc step)":
    '[data-test-id="cs-content-type-field-boolean-basic-display-name-input"] input, [data-test-id="cs-content-type-field-single-line-textbox-basic-display-name-input"] input, [class*="FieldProperties"] input[placeholder="Enter value"]',
  "Help text (doc step)":
    '[data-test-id="cs-content-type-field-boolean-basic-description-input"] textarea, [data-test-id="cs-content-type-field-boolean-basic-description-input"] input',
  "Instruction value (doc step)":
    '[data-test-id="cs-content-type-field-boolean-basic-instruction-input"] textarea, [data-test-id="cs-content-type-field-boolean-basic-instruction-input"] input',
};
