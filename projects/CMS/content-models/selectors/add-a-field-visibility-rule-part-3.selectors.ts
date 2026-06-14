/**
 * Flow: add-a-field-visibility-rule-part-3
 * Source: https://www.contentstack.com/docs/developers/create-content-types/add-a-field-visibility-rule
 * Section: Apply Field Visibility Rules to Modular Block Fields
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
    '[data-test-id="cs-fvr-empty-state-create-new-rule-cta"], button:has-text("Create New Rule"), button:has-text("Add Rule"), [role="button"]:has-text("Create New Rule")',

  // Rule 1: Operand field dropdown
  "Operand Field (FVR) (doc step)":
    '[data-test-id="cs-conditions-field-dropdown-0"], [data-test-id="cs-conditions-field-dropdown-0"] .Portal__control, .rule [data-test-id="cs-conditions-field-dropdown-0"]',

  // Rule 1: Condition operator dropdown (Equals)
  "Condition operator (FVR) (doc step)":
    '[data-test-id="cs-conditions-condition-dropdown-0"] .Portal__control, .rule [data-test-id="cs-conditions-condition-dropdown-0"]',

  // Rule 1: Action type Show dropdown
  "Action type Show (FVR) (doc step)":
    '[data-test-id="cs-action-show-hide-field-0"] .Portal__control, .rule [data-test-id="cs-action-show-hide-field-0"]',
  "Show (FVR option) (doc step)": '[role="option"]:has-text("Show"), li:has-text("Show")',

  // Rule 1: Target field dropdown
  "Target field (FVR) (doc step)":
    '[data-test-id="cs-action-select-field-0"] .Portal__control, .rule [data-test-id="cs-action-select-field-0"]',

  // Save Rule 1
  "Save rule (FVR) (doc step)":
    '[data-test-id*="fvr"] button:has-text("Save"), .rule button:has-text("Save"), [role="dialog"] button:has-text("Save")',

  // + Add Another Rule button
  "+ Add Another Rule (doc step)":
    'button:has-text("Add Another Rule"), button:has-text("+ Add Another Rule"), [role="button"]:has-text("Add Another Rule")',

  // Rule 2 selectors (second rule accordion)
  "Operand Field 2 (FVR) (doc step)":
    '[data-test-id="cs-conditions-field-dropdown-0"]:last-of-type .Portal__control, .Accordion__data:last-of-type [data-test-id="cs-conditions-field-dropdown-0"]',

  "Condition operator 2 (FVR) (doc step)":
    '[data-test-id="cs-conditions-condition-dropdown-0"]:last-of-type .Portal__control, .Accordion__data:last-of-type [data-test-id="cs-conditions-condition-dropdown-0"]',

  "Action type Show 2 (FVR) (doc step)":
    '[data-test-id="cs-action-show-hide-field-0"]:last-of-type .Portal__control, .Accordion__data:last-of-type [data-test-id="cs-action-show-hide-field-0"]',

  "Target field 2 (FVR) (doc step)":
    '[data-test-id="cs-action-select-field-0"]:last-of-type .Portal__control, .Accordion__data:last-of-type [data-test-id="cs-action-select-field-0"]',

  // Save and Close content type
  "Save and Close (doc step)": '[data-test-id="cs-ct-save-close"], button:has-text("Save and Close")',
};

export const INPUT_SELECTORS: Record<string, string> = {};
