/**
 * Flow: use-default-url-pattern
 * Source: https://www.contentstack.com/docs/developers/create-content-types/use-default-url-pattern
 * Generated/updated by bulkIngestFromUrls. Prefer data-test-id selectors.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  // Actions column header (listing page)
  "Actions (doc step)":
    '[data-test-id="cs-table-row-action-column-cell--4"], [role="columnheader"]:has-text("Actions")',

  // Vertical ellipsis on the AUTO- row
  "vertical ellipsis (doc step)": '[data-test-id="cs-table-action-options"]',

  // Edit menu item inside the row action tooltip
  "Edit (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-edit"] .ml-8, [data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-edit"]',

  "Link": "[data-test-id=\"cs-icon\"]",
  // URL field tile in Field Type Selector (doc: "Click the URL field from the field selector")
  "URL (doc step)":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-url"]), div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-link"]), div.FieldTypeSelector__field-tile:has-text("URL"), [data-test-id="cs-ct-select-field-url"], [data-test-id="cs-ct-select-field-link"]',
  "ct select field url": "[data-test-id=\"cs-ct-select-field-url\"]",
  "Link (icon)": "[data-test-id=\"cs-icon\"] svg[name=\"Link\"]",
};

export const INPUT_SELECTORS: Record<string, string> = {
};
