export const CLICK_SELECTORS: Record<string, string> = {
  "Create New Branch modal (doc step)":
    '[data-test-id="cs-modal-title"]:has-text("Create New Branch"), .create-new-branch-title, .ReactModal__add-lang-branch',
  "main option in source dropdown (doc step)":
    '[role="listbox"] [role="option"]:has-text("main"), [role="option"]:has-text("main"), .Portal__menu [role="option"]:has-text("main"), .Select__menu div:has-text("main")',
  "Create button in Create New Branch modal (doc step)":
    '[data-test-id="cs-branches-new-branch-save-cta"], button:has-text("Save"), button:has-text("Create")',
  "Cancel button in Create New Branch modal (doc step)":
    '[data-test-id="cs-branches-new-branch-cancel-cta"], button:has-text("Cancel")',
  "Source branch dropdown (doc step)":
    '[data-test-id="cs-branches-new-branch-source-select"] .Portal__control, [data-test-id="cs-branches-new-branch-source-select"] .Select__control, [data-test-id="cs-branches-new-branch-source-select"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Branch ID label (doc step)":
    '[data-test-id="cs-branches-new-branch-id"], label:has-text("Branch ID")',
  "Source Branch label (doc step)":
    '[data-test-id="cs-branches-new-branch-source-field"], label:has-text("Source Branch")',
  "Branch ID input (doc step)":
    '[data-test-id="cs-branches-new-branch-text-input"] input, input[name="branch"], input[placeholder*="branch ID"]',
};
