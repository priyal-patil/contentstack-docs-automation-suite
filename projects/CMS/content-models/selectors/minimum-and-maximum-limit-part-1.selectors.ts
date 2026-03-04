/**
 * Min/Max Limit doc – Part 1: Set minimum and maximum limits for a field (e.g. Single Line Textbox).
 * Source: https://www.contentstack.com/docs/developers/create-content-types/minimum-and-maximum-limit
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Properties (Single Line Textbox) (doc step)":
    '.ContentTypeField:has(p[data-test-id="cs-ct-select-field-single_line"]), .ContentTypeField:has(svg[name="SingleLineTextbox"]) [data-test-id$="-option-properties"], [data-test-id="cs-ct-field"] [data-test-id$="-option-properties"]',
  "Advanced (Single Line Textbox) (doc step)":
    '[data-test-id="cs-ct-field-single-line-textbox-tab-advanced"], [data-test-id="cs-ct-field-single_line-tab-advanced"], [data-test-id="cs-ct-field-single-line-textbox-tab-advanced"], .Tab__item:has-text("Advanced")',
  "Multiple (doc step)":
    '[data-test-id="cs-ct-field-single-line-textbox-multiple-disabled"] label.toggle-switch, [data-test-id="cs-ct-field-single-line-textbox-multiple-disabled"] .toggle-switch, [data-test-id*="multiple"] label.toggle-switch',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Set Minimum Limit (doc step)":
    '[data-test-id*="minimum"] input, [data-test-id*="min-limit"] input, input[placeholder*="Minimum"], input[name*="minimum"]',
  "Set Maximum Limit (doc step)":
    '[data-test-id*="maximum"] input, [data-test-id*="max-limit"] input, input[placeholder*="Maximum"], input[name*="maximum"]',
};
