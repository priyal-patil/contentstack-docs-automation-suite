/**
 * Boolean doc – Part 1: Example 1 – Clickwrap Boolean Field
 * https://www.contentstack.com/docs/developers/create-content-types/boolean
 * Reuses module.selectors.ts; Part 1–specific targets here.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Properties (Boolean) (doc step)":
    '.ContentTypeField:has(p[data-test-id="cs-ct-select-field-boolean"]), .ContentTypeField:has(svg[name="Boolean"]) [data-test-id$="-option-properties"], [data-test-id="cs-ct-field"] [data-test-id$="-option-properties"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Display Name (doc step)":
    '[data-test-id="cs-content-type-field-boolean-basic-display-name-input"] input, [data-test-id="cs-content-type-field-single-line-textbox-basic-display-name-input"] input, [class*="FieldProperties"] input[placeholder="Enter value"]',
  "Help text (doc step)":
    '[data-test-id="cs-content-type-field-boolean-basic-description-input"] textarea, [data-test-id="cs-content-type-field-boolean-basic-description-input"] input',
  "Instruction value (doc step)":
    '[data-test-id="cs-content-type-field-boolean-basic-instruction-input"] textarea, [data-test-id="cs-content-type-field-boolean-basic-instruction-input"] input',
};
