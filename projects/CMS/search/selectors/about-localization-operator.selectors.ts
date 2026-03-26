/**
 * Selectors for About Localization Operator flow.
 * DOM reference: data-test-id="cs-advance-search-select-operator", cs-advance-search-select-value
 */
export const CLICK_SELECTORS: Record<string, string> = {
  "Advanced Search button (doc step)":
    '[data-test-id="cs-entries-advance-search"], button:has-text("Advanced Search")',
  "Match All Conditions (doc step)":
    '[data-test-id="cs-advance-search-condition-select"]:has-text("Match All Conditions"), .query-wrapper-matchTag:has-text("Match All Conditions")',
  "Content Type or Field dropdown (doc step)":
    '[data-test-id="cs-advance-search-select-field"]',
  "Language option in Content Type menu (doc step)":
    '[data-test-id="cs-advance-search-select-list-element"]:has-text("Language"), [data-test-id="cs-advance-search-select-list-element-label"]:has-text("Language"), li.AdvancedQueryView__suggestion-item--selectable:has-text("Language")',
  "Operator dropdown (doc step)":
    '[data-test-id="cs-advance-search-select-operator"]',
  "Localized In operator option (doc step)":
    '[data-test-id="cs-advance-search-select-list-element"]:has-text("Localized In"), div.query-value-textTruncate:has-text("Localized In"), li:has-text("Localized In"), .AdvancedQueryView__suggestion-item--selectable:has-text("Localized In"), [role="option"]:has-text("Localized In")',
  "Not Localized In operator option (doc step)":
    '[data-test-id="cs-advance-search-select-list-element"]:has-text(/not localized in/i), [data-test-id="cs-advance-search-select-list-element"]:has-text("Not Localized In"), li:has-text(/not localized in/i), .AdvancedQueryView__suggestion-item--selectable:has-text(/not localized in/i), [role="option"]:has-text(/not localized in/i)',
  "Matches operator option (doc step)":
    '[data-test-id="cs-advance-search-select-list-element"]:has-text("Matches"), li.AdvancedQueryView__suggestion-item--selectable:has-text("Matches"), [role="option"]:has-text("Matches")',
  "Value dropdown in Advanced Search (doc step)":
    '[data-test-id="cs-advance-search-select-value"]',
  "French language option (doc step)":
    '[data-test-id="cs-advance-search-select-list-element"]:has-text("French"), [data-test-id="cs-advance-search-select-list-element"]:has-text("English"), li:has-text("French"), li:has-text("English - United States"), li:has-text("English"), [role="option"]:has-text("French"), [role="option"]:has-text("English"), .AdvancedQueryView__suggestion-item--selectable:has-text("French"), .AdvancedQueryView__suggestion-item--selectable:has-text("English")',
  "Search button in Advanced Search (doc step)":
    'button[data-test-id="cs-advance-search-results"], [data-test-id="cs-advance-search-results"]',
};
