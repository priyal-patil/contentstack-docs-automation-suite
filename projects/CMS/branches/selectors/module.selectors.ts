export const CLICK_SELECTORS: Record<string, string> = {
  "Settings (doc step)":
    '[data-test-id="cms-nav-settings"], button[aria-label="Settings"], [data-test-id="cs-dropdown-elements"]:has-text("Settings"), [role="menuitem"]:has-text("Settings"), li:has-text("Settings"), button:has-text("Settings")',
  "More (doc step)":
    'button:has-text("More"), button[aria-label*="more" i], button[aria-label*="aria-button" i]:has(svg[name="SeeMore"]), [data-test-id="cs-dropdown-truncate-button"]',
  "Branches in settings left nav (doc step)":
    '[data-test-id="cs-stack-settings-branches"], a[href*="/settings/branches"], .ListRowV2:has-text("Branches")',
  "Branches (doc step)":
    '[data-test-id="cs-stack-settings-branches"], a[href*="/settings/branches"], .ListRowV2:has-text("Branches")',
  "+ New Branch button (doc step)":
    '[data-test-id="cs-branches-add-newbranch-cta"], button:has-text("New Branch"), button:has-text("+ New Branch")',
  "Branches page header (doc step)":
    '[data-test-id="cs-leftnavheader-header"] .page-header__title, .page-header__title:has-text("Branches"), span:has-text("Branches")',
  "Actions menu on branch row (doc step)":
    '[data-test-id^="cs-table-body-row-"] [data-test-id="cs-table-action-menu"], [data-test-id^="cs-table-body-row-"] button[aria-label*="action" i], [data-test-id^="cs-table-body-row-"] .Table__body__row__actions button, .branches-table tbody tr:first-child [class*="action" i] button, [data-test-id^="cs-table-body-row-"]:first-child button:last-child',
  "Delete option in branch actions menu (doc step)":
    '[role="menuitem"]:has-text("Delete"), [data-test-id="cs-table-action-menu-delete"], [role="option"]:has-text("Delete"), ul[role="menu"] li:has-text("Delete"), .Dropdown__menu li:has-text("Delete")',
  "Aliases tab (doc step)":
    '[data-test-id="cs-aliases-tab"], .Tab__item:has-text("Aliases")',
  "+ Assign Alias button (doc step)":
    '[data-test-id="cs-branches-assign-alias-cta"], button:has-text("Assign Alias"), button:has-text("+ Assign Alias")',
  "Create New Branch modal (doc step)":
    '[data-test-id="cs-modal-title"]:has-text("Create New Branch"), .create-new-branch-title, .ReactModal__add-lang-branch',
  "main option in source dropdown (doc step)":
    '.Portal__option:has-text("main"), div[id*="-option-"]:has-text("main"), [role="option"]:has-text("main"), .Select__menu div:has-text("main")',
  "First source branch option (doc step)":
    '[role="listbox"] [role="option"]:visible, [role="option"]:visible, .Portal__menu [role="option"]:visible',
  "Cancel button in Create New Branch modal (doc step)":
    '[data-test-id="cs-branches-new-branch-cancel-cta"], button:has-text("Cancel")',
  "Create button in Create New Branch modal (doc step)":
    '[data-test-id="cs-branches-new-branch-save-cta"], button:has-text("Save"), button:has-text("Create")',
  "Branch ID help text (doc step)":
    '[data-test-id="cs-branches-new-branch-id-help-text"]',
  "Source Branch help text (doc step)":
    '[data-test-id="cs-branches-new-branch-source-help-text"]',
  "Source branch dropdown (doc step)":
    '[data-test-id="cs-branches-new-branch-source-select"] .Portal__control, [data-test-id="cs-branches-new-branch-source-select"]',
  "Assign New Alias modal (doc step)":
    '[data-test-id="cs-edit-branch-alias-title"]:has-text("Assign New Alias"), .create-new-alias-title:has-text("Assign New Alias"), h2:has-text("Assign New Alias"), [role="dialog"] h2:has-text("Assign New Alias")',
  "Save button in Assign New Alias modal (doc step)":
    '[data-test-id="cs-settings-branches-edit-alias-name-create-branch-save-cta"]',
  "Target Branch dropdown (doc step)":
    '[data-test-id="cs-branches-new-branch-source-select"] .Portal__control, [data-test-id="cs-branches-new-branch-source-select"]',
  "main option in target branch dropdown (doc step)":
    '[role="listbox"] [role="option"]:has-text("main"), [role="option"]:has-text("main"), .Portal__menu [role="option"]:has-text("main")',
  "More Options icon on alias row (doc step)":
    '[data-test-id^="cs-table-body-row-"] [data-test-id="cs-table-action-options"], [data-test-id^="cs-table-body-row-"] button.three-dots-vertical-icon, [data-test-id^="cs-table-body-row-"] button[aria-label*="action" i]',
  "Delete Alias option in menu (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] [data-test-id*="delete" i], [role="menuitem"]:has-text("Delete"), ul[data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Delete")',
  "Delete Alias modal (doc step)":
    '[data-test-id="cs-modal-title"]:has-text("Delete Alias"), [role="dialog"] h2:has-text("Delete Alias"), .Modal__title:has-text("Delete Alias")',
  "Delete button in Delete Alias modal (doc step)":
    '[role="dialog"] button:has-text("Delete"), .Modal button:has-text("Delete"), [data-test-id*="modal"] button:has-text("Delete")',
  "Edit icon on alias row (doc step)":
    '[data-test-id^="cs-table-body-row-"] button:has(svg[name="Edit"]), [data-test-id^="cs-table-body-row-"] [data-test-id="cs-table-action-options"], [data-test-id^="cs-table-body-row-"] button[aria-label*="edit" i]',
  "Edit Alias modal (doc step)":
    '[data-test-id="cs-modal-title"]:has-text("Edit Alias"), [role="dialog"] h2:has-text("Edit Alias"), .Modal__title:has-text("Edit Alias")',
  "Target Branch dropdown in Edit Alias (doc step)":
    '[data-test-id="cs-settings-branches-edit-alias-name-target-branch-select"] .Portal__control, [data-test-id="cs-settings-branches-edit-alias-name-target-branch-select"], [role="dialog"] [data-test-id*="target" i] .Portal__control',
  "Save button in Edit Alias modal (doc step)":
    '[data-test-id="cs-settings-branches-edit-alias-name-create-branch-save-cta"], [role="dialog"] button:has-text("Save")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Branch ID label (doc step)":
    '[data-test-id="cs-branches-new-branch-id"], label:has-text("Branch ID")',
  "Source Branch label (doc step)":
    '[data-test-id="cs-branches-new-branch-source-field"], label:has-text("Source Branch")',
  "Branch ID input (doc step)":
    '[data-test-id="cs-branches-new-branch-text-input"] input, input[name="branch"], input[placeholder*="branch ID"]',
  "Alias ID label (doc step)":
    '[data-test-id="cs-settings-branches-create-alias-name-field"], label:has-text("Alias ID")',
  "Target Branch label (doc step)":
    '[data-test-id="cs-settings-branches-edit-alias-name-target-branch-field"], label:has-text("Target Branch")',
  "Alias ID input (doc step)":
    '[data-test-id="cs-settings-branches-create-alias-name-text-input"] input, input[name="alias"], input[placeholder*="alias ID"]',
  "Alias ID input in Delete modal (doc step)":
    '[role="dialog"] [data-test-id="cs-settings-branches-create-alias-name-text-input"] input, [role="dialog"] input[name="alias"], [role="dialog"] input[placeholder*="alias" i]',
  "Alias ID label in Edit modal (doc step)":
    '[role="dialog"] [data-test-id="cs-settings-branches-create-alias-name-field"], [role="dialog"] label:has-text("Alias ID")',
  "Target Branch label in Edit modal (doc step)":
    '[role="dialog"] [data-test-id="cs-settings-branches-edit-alias-name-target-branch-field"], [role="dialog"] label:has-text("Target Branch")',
};
