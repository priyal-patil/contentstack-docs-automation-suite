/**
 * Flow: managing-non-localizable-fields
 * Source: https://www.contentstack.com/docs/developers/create-content-types/managing-non-localizable-fields
 * Generated/updated by bulkIngestFromUrls. Prefer data-test-id selectors.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "ct field singleline non localizable disabled": "[data-test-id=\"cs-ct-field-singleline-non-localizable-disabled\"]",
  // Non-localizable toggle: specific test-id (single-line) or by label + toggle in properties panel (Group, etc.)
  "Non-localizable (doc step)":
    '[data-test-id="cs-ct-field-singleline-non-localizable-disabled"], [data-test-id*="non-localizable"], [data-test-id*="nonLocalization"] button, [data-test-id*="nonLocalization"] [role="switch"], label:has-text("Non-localizable") input, .ToggleWrap:has-text("Non-localizable") input, .ToggleWrap:has-text("Non-localizable") [role="switch"]',
  // Properties icon on the Group field row (after inserting a group). Prefer test-id; fallback to Sliders icon in Group row (see group-part-1, module.selectors).
  "Properties (doc step)":
    '.ContentTypeField:has(svg[name="Group"]) [data-test-id$="-option-properties"], .ContentTypeField:has(svg[name="Group"]) button:has(svg[name="Sliders"]), .ContentTypeField:has(p[data-test-id="cs-ct-select-field-group"]) [data-test-id$="-option-properties"], [data-test-id="cs-ct-field"] [data-test-id$="-option-properties"]',
  // Advanced tab in Field Properties modal (Group field)
  "Advanced (doc step)":
    '[data-test-id="cs-ct-field-group-tab-advanced"], .Tab__item:has-text("Advanced"), [role="tab"]:has-text("Advanced"), button:has-text("Advanced")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "1772170388051.2.nonLocalization": "input[name=\"1772170388051.2.nonLocalization\"], textarea[name=\"1772170388051.2.nonLocalization\"]",
};
