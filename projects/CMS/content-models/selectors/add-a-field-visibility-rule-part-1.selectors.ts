/**
 * Flow: add-a-field-visibility-rule-part-1
 * Source: https://www.contentstack.com/docs/developers/create-content-types/add-a-field-visibility-rule
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

  "Date": "[data-test-id=\"cs-icon\"]",
  "ct select field date": "[data-test-id=\"cs-ct-select-field-date\"]",
  // Date field tile in Field Type Selector (doc: create a Date field first)
  "Date (doc step)":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-date"]), div.FieldTypeSelector__field-tile:has-text("Date"), [data-test-id="cs-ct-select-field-date"]',
  "open fvr button": "[data-test-id=\"cs-open-fvr-button\"]",
  "fvr count title": "[data-test-id=\"cs-fvr-count-title\"]",
  "fvr count badge": "[data-test-id=\"cs-fvr-count-badge\"]",
  "fvr empty state create new rule cta": "[data-test-id=\"cs-fvr-empty-state-create-new-rule-cta\"]",
  // Field Visibility Rules button in builder header (doc: then click Field Visibility Rules)
  "Field Visibility Rules (doc step)": '[data-test-id="cs-open-fvr-button"]',
  // Create New Rule CTA when no rules exist (doc: Create New Rule); also "Add Rule" / "Add Another Rule" when panel lists rules
  "Create New Rule (doc step)":
    '[data-test-id="cs-fvr-empty-state-create-new-rule-cta"], button:has-text("Create New Rule"), button:has-text("Add Rule"), button:has-text("Add Another Rule"), a:has-text("Create New Rule"), [role="button"]:has-text("Create New Rule"), [role="button"]:has-text("Add Rule")',
  "Date (icon)": "[data-test-id=\"cs-icon\"] svg[name=\"Date\"]",

  // --- FVR rule form (after Create New Rule): use data-test-id from .rule / Accordion__data ---
  // Operand field dropdown (condition: which field) – cs-conditions-field-dropdown-0; click container if .Portal__control missing
  "Operand Field (FVR) (doc step)":
    '[data-test-id="cs-conditions-field-dropdown-0"], [data-test-id="cs-conditions-field-dropdown-0"] .Portal__control, [data-test-id="cs-conditions-field-dropdown-0"] input[aria-label="cs-select-aria"], .rule [data-test-id="cs-conditions-field-dropdown-0"], [role="dialog"] [data-test-id="cs-conditions-field-dropdown-0"]',
  "Date (FVR option) (doc step)":
    '[role="option"]:has-text("Date"), [role="listbox"] [role="option"]:has-text("Date"), [data-test-id*="fvr"] [role="option"]:has-text("Date"), li:has-text("Date"), div:has-text("Date")',
  // Condition/operator dropdown – cs-conditions-condition-dropdown-0 (select Before); fallback
  "Condition operator (FVR) (doc step)":
    '[data-test-id="cs-conditions-condition-dropdown-0"] .Portal__control, [data-test-id="cs-conditions-condition-dropdown-0"] input[aria-label="cs-select-aria"], .rule [data-test-id="cs-conditions-condition-dropdown-0"], [role="dialog"] .rule [aria-label="cs-select-aria"]',
  "Before (FVR option) (doc step)":
    '[role="option"]:has-text("Before"), [role="listbox"] [role="option"]:has-text("Before"), [id*="react-select"] ~ [role="listbox"] [role="option"], li:has-text("Before"), div[role="option"]:has-text("Before"), div:has-text("Before")',
  // Action type: Show / Hide – cs-action-show-hide-field-0; fallback
  "Action type Show (FVR) (doc step)":
    '[data-test-id="cs-action-show-hide-field-0"] .Portal__control, [data-test-id="cs-action-show-hide-field-0"] input[aria-label="cs-select-aria"], .rule [data-test-id="cs-action-show-hide-field-0"], [role="dialog"] [aria-label="cs-select-aria"]',
  "Show (FVR option) (doc step)": '[role="option"]:has-text("Show"), li:has-text("Show")',
  // Target field (which field to show/hide) – cs-action-select-field-0; fallback
  "Target field (FVR) (doc step)":
    '[data-test-id="cs-action-select-field-0"] .Portal__control, [data-test-id="cs-action-select-field-0"] input[aria-label="cs-select-aria"], .rule [data-test-id="cs-action-select-field-0"], [role="dialog"] [aria-label="cs-select-aria"]',
  "Archive Notification (FVR option) (doc step)": '[role="option"]:has-text("Archive Notification"), li:has-text("Archive Notification")',
  "Add action (FVR) (doc step)":
    '[data-test-id="cs-cb-field-visibility-add-action"], button[aria-label="Add New Action"], button:has-text("Add Action"), button:has-text("+ Add Action")',
  // Second action row: Show/Hide dropdown – cs-action-show-hide-field-1 (select Hide)
  "Action type Hide (FVR) (doc step)":
    '[data-test-id="cs-action-show-hide-field-1"] .Portal__control, [data-test-id="cs-action-show-hide-field-1"] input[aria-label="cs-select-aria"], .rule [data-test-id="cs-action-show-hide-field-1"]',
  "Hide (FVR option) (doc step)": '[role="option"]:has-text("Hide"), li:has-text("Hide")',
  // Second action row: target field – cs-action-select-field-1 (select Body)
  "Target field 2 (FVR) (doc step)":
    '[data-test-id="cs-action-select-field-1"] .Portal__control, [data-test-id="cs-action-select-field-1"] input[aria-label="cs-select-aria"], .rule [data-test-id="cs-action-select-field-1"]',
  "Body (FVR option) (doc step)": '[role="option"]:has-text("Body"), li:has-text("Body")',
  // Save the rule (inside FVR panel)
  "Save rule (FVR) (doc step)":
    '[data-test-id*="fvr"] button:has-text("Save"), .rule button:has-text("Save"), [role="dialog"] button:has-text("Save")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  // Expected value for condition (e.g. 12-31-2024) – cs-conditions-field-value-0
  "Expected Value (FVR) (doc step)":
    '[data-test-id="cs-conditions-field-value-0"] input, input[name="field_rules[0].conditions[0].value"], input[placeholder="Please enter value"], .rule input[type="text"]',
};
