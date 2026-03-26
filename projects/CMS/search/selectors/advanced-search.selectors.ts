export const CLICK_SELECTORS: Record<string, string> = {
  "Content Type or Field label (doc step)":
    '[data-test-id="cs-advance-search-query-container"] label.fieldLabel:has-text("Content Type or Field"), .field-wrapper__key label:has-text("Content Type or Field")',
  "Operator label (doc step)":
    '[data-test-id="cs-advance-search-query-container"] label.fieldLabel:has-text("Operator"), .field-wrapper__operator label:has-text("Operator")',
  "Value label (doc step)":
    '[data-test-id="cs-advance-search-query-container"] label.fieldLabel:has-text("Value"), .field-wrapper__value label:has-text("Value")',
  "Advanced Search button (doc step)":
    '[data-test-id="cs-entries-advance-search"], button:has-text("Advanced Search")',
  "Advanced Search panel (doc step)":
    '[data-test-id="cs-advance-search-query-container"], .AdvancedQueryView',
  "Match All Conditions (doc step)":
    '[data-test-id="cs-advance-search-condition-select"]:has-text("Match All Conditions"), .query-wrapper-matchTag:has-text("Match All Conditions")',
  "Content Type or Field dropdown (doc step)":
    '[data-test-id="cs-advance-search-select-field"]',
  "Title option in Content Type menu (doc step)":
    '[data-test-id="cs-advance-search-select-list-element"]:has([data-test-id="cs-advance-search-select-list-element-label"]:has-text("Title")), li.AdvancedQueryView__suggestion-item--selectable:has-text("Title")',
  "Operator dropdown (doc step)":
    '[data-test-id="cs-advance-search-select-operator"]',
  "Contains operator option (doc step)":
    '[data-test-id="cs-advance-search-select-list-element"]:has-text("Contains"), li.AdvancedQueryView__suggestion-item--selectable:has-text("Contains")',
  "Search button in Advanced Search (doc step)":
    'button[data-test-id="cs-advance-search-results"], [data-test-id="cs-advance-search-results"]',
  "Reset button in Advanced Search (doc step)":
    '[data-test-id="cs-advance-search-reset"], button:has-text("Reset")',
  "Remove button in Advanced Search (doc step)":
    '[data-test-id="cs-advance-search-condition-remove"], button:has-text("Remove")',
  "New Condition button (doc step)":
    '[data-test-id="cs-advance-search-add-condition"], button:has-text("New Condition")',
  "New Sub-condition button (doc step)":
    '[data-test-id="cs-advance-search-add-sub-condition"], button:has-text("New Sub-condition")',
  "Modify Advanced Search button (doc step)":
    'button:has-text("Modify Advanced Search"), [data-test-id="cs-entries-advance-search"]:has-text("Modify"), a:has-text("Modify Advanced Search")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Value input in Advanced Search (doc step)":
    '[data-test-id="cs-advance-search-query-wrapper-0"] [data-test-id="cs-text-input"] input, [data-test-id="cs-advance-search-query-container"] [data-test-id="cs-text-input"] input, .AdvancedQueryView [data-test-id="cs-text-input"] input, input[placeholder="Enter value"]',
};
