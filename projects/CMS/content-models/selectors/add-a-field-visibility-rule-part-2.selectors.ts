/**
 * Flow: add-a-field-visibility-rule-part-2
 * Source: https://www.contentstack.com/docs/developers/create-content-types/add-a-field-visibility-rule
 * Section: Apply Field Visibility Rules to Group Fields
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

  // Field Visibility Rules button in builder header
  "Field Visibility Rules (doc step)": '[data-test-id="cs-open-fvr-button"]',

  // Create New Rule CTA
  "Create New Rule (doc step)":
    '[data-test-id="cs-fvr-empty-state-create-new-rule-cta"], button:has-text("Create New Rule"), button:has-text("Add Rule"), button:has-text("Add Another Rule"), [role="button"]:has-text("Create New Rule"), [role="button"]:has-text("Add Rule")',

  // Operand field dropdown (condition: which field)
  "Operand Field (FVR) (doc step)":
    '[data-test-id="cs-conditions-field-dropdown-0"], [data-test-id="cs-conditions-field-dropdown-0"] .Portal__control, .rule [data-test-id="cs-conditions-field-dropdown-0"]',

  // Condition operator dropdown (is selected)
  "Condition operator (FVR) (doc step)":
    '[data-test-id="cs-conditions-condition-dropdown-0"] .Portal__control, [data-test-id="cs-conditions-condition-dropdown-0"] input[aria-label="cs-select-aria"], .rule [data-test-id="cs-conditions-condition-dropdown-0"]',

  // Action type Show dropdown
  "Action type Show (FVR) (doc step)":
    '[data-test-id="cs-action-show-hide-field-0"] .Portal__control, [data-test-id="cs-action-show-hide-field-0"] input[aria-label="cs-select-aria"], .rule [data-test-id="cs-action-show-hide-field-0"]',
  "Show (FVR option) (doc step)": '[role="option"]:has-text("Show"), li:has-text("Show")',

  // Target field (LinkedIn URL / first target)
  "Target field (FVR) (doc step)":
    '[data-test-id="cs-action-select-field-0"] .Portal__control, [data-test-id="cs-action-select-field-0"] input[aria-label="cs-select-aria"], .rule [data-test-id="cs-action-select-field-0"]',

  // Add action button
  "Add action (FVR) (doc step)":
    '[data-test-id="cs-cb-field-visibility-add-action"], button:has-text("Add Action"), button:has-text("+ Add Action")',

  // Second action Show dropdown
  "Action type Show 2 (FVR) (doc step)":
    '[data-test-id="cs-action-show-hide-field-1"] .Portal__control, [data-test-id="cs-action-show-hide-field-1"] input[aria-label="cs-select-aria"], .rule [data-test-id="cs-action-show-hide-field-1"]',

  // Target field 2 (Twitter URL / second target)
  "Target field 2 (FVR) (doc step)":
    '[data-test-id="cs-action-select-field-1"] .Portal__control, [data-test-id="cs-action-select-field-1"] input[aria-label="cs-select-aria"], .rule [data-test-id="cs-action-select-field-1"]',

  // Save the rule
  "Save rule (FVR) (doc step)":
    '[data-test-id*="fvr"] button:has-text("Save"), .rule button:has-text("Save"), [role="dialog"] button:has-text("Save")',

  // Save and Close content type
  "Save and Close (doc step)": '[data-test-id="cs-ct-save-close"], button:has-text("Save and Close")',
};

export const INPUT_SELECTORS: Record<string, string> = {};
