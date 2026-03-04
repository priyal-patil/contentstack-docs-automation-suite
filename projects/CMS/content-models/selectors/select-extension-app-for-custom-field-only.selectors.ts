/**
 * Flow: select-extension-app-for-custom-field-only
 * Source: https://www.contentstack.com/docs/developers/create-content-types/select-extension-app-for-custom-field-only
 * Generated/updated by bulkIngestFromUrls. Prefer data-test-id selectors.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Custom": "[data-test-id=\"cs-icon\"]",
  // Custom field tile in Field Type Selector (same pattern as module.selectors for Group, etc.)
  "Custom (doc step)":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-custom"]), div.FieldTypeSelector__field-tile:has-text("Custom"), [data-test-id="cs-ct-select-field-custom"]',
  "ct select field custom": "[data-test-id=\"cs-ct-select-field-custom\"]",
  "content field custom basic extension": "[data-test-id=\"cs-content-field-custom-basic-extension\"]",
  "ArrowSquareOut": "[data-test-id=\"cs-icon\"]",
  "choose extension modal title color picker": "[data-test-id=\"cs-choose-extension-modal-title-color-picker\"]",
  "new entry single proceed": "[data-test-id=\"cs-new-entry-single-proceed\"]",
  "Custom (icon)": "[data-test-id=\"cs-icon\"] svg[name=\"Custom\"]",
  "ArrowSquareOut (icon)": "[data-test-id=\"cs-icon\"] svg[name=\"ArrowSquareOut\"]",
  // In Custom Properties panel: "Select Extension/App" – click placeholder or inner action (opens extension modal)
  "Select Extension/Apps (doc step)":
    '[data-test-id="cs-content-field-custom-basic-extension"], [data-test-id="cs-content-field-custom-basic-extension"] a.Select__tag__action__items, .Select__tag__placeholder:has-text("Choose an Extension")',
  // Proceed button in extension-selection modal (visible after selecting an extension)
  "Proceed (doc step)":
    '[data-test-id="cs-new-entry-single-proceed"]',
  // Select an extension in the "Choose Extension/App" modal – Color Picker row (role="cell" with data-test-id on title div)
  "Select extension (e.g. Color Picker) (doc step)":
    '[data-test-id="cs-choose-extension-modal-title-color-picker"], [role="cell"] [data-test-id="cs-choose-extension-modal-title-color-picker"], div:has-text("Color Picker")',
};

export const INPUT_SELECTORS: Record<string, string> = {
};
