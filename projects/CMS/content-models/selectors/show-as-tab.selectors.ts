/**
 * Flow: show-as-tab
 * Source: https://www.contentstack.com/docs/developers/create-content-types/show-as-tab
 * Generated/updated by bulkIngestFromUrls. Prefer data-test-id selectors.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "ct field group tab enabled": "[data-test-id=\"cs-ct-field-group-tab-enabled\"]",
  "Show as Tab (doc step)": "[data-test-id=\"cs-ct-field-group-tab-enabled\"]",
  // Properties icon on the Group field row (hover over Group, then click Properties)
  "Properties (doc step)":
    '.ContentTypeField:has(svg[name="Group"]) [data-test-id$="-option-properties"]',
  // Advanced tab in Field Properties modal (Group field)
  "Advanced (doc step)":
    '[data-test-id="cs-ct-field-group-tab-advanced"], .Tab__item:has-text("Advanced"), [role="tab"]:has-text("Advanced"), button:has-text("Advanced")',
  "help": "[data-test-id=\"cs-help\"]",
  "tooltip": "[data-test-id=\"cs-tooltip\"]",
  "Information": "[data-test-id=\"cs-icon\"]",
  "Information (icon)": "[data-test-id=\"cs-icon\"] svg[name=\"Information\"]",
};

export const INPUT_SELECTORS: Record<string, string> = {
  "1772170384371.1.tab": "input[name=\"1772170384371.1.tab\"], textarea[name=\"1772170384371.1.tab\"]",
};
