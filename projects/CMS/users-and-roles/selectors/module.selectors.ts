export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id="cs-stacklist-card-PriyalDocsStack"]',
  /** settings-top-nav.html — top bar Settings (doc may say left nav; verify may warn if placement differs). */
  "Settings (doc step)":
    '[data-test-id="cms-nav-settings"], button:has-text("Settings"), a:has-text("Settings"), [role="menuitem"]:has-text("Settings"), li:has-text("Settings")',
  /** users-and-roles-left-icon.html — settings drawer row. */
  "Users & Roles in settings left navigation (doc step)":
    '[data-test-id="cs-stack-settings-users-roles"], a[href*="/settings/users"], .ListRowV2-wrapper:has([data-test-id="cs-stack-settings-users-roles"])',
  /** header.html */
  "Users & Roles page title (doc step)": '[data-test-id="cs-page-title"]',
  "Invite User button top right on Users & Roles page (doc step)": '[data-test-id="cs-users-header-invite-user"]',
  /** invite-user-modal.html */
  "Invite User modal title (doc step)": '[data-test-id="cs-modal-title-invite-user"]',
  "Email field label in Invite User modal (doc step)": '[data-test-id="cs-users-email-label"]',
  "Roles field label in Invite User modal (doc step)": '[data-test-id="cs-users-roles-selector-label"]',
  "Message field label in Invite User modal (doc step)": '[data-test-id="cs-users-message-label"]',
  "Invite button in Invite User modal (doc step)": '[data-test-id="cs-users-invite"]',
  /** Roles react-select control (invite-user-modal.html — Portal__placeholder Select Role(s)). */
  "Invite User modal Roles select control (doc step)":
    '[data-test-id="cs-roles-invite-user-roles-select-input"] .Portal__control, [data-test-id="cs-roles-invite-user-roles-select-input"] div[class*="control"]',
  /** users-listing.html — user table row (hover target per doc). */
  "Users table row to remove user (doc step)":
    '[data-test-id^="cs-table-body-row-"]:not(.Table__empty__row)',
  /** Doc says trash-bin icon appears at extreme right on hover — app uses ⋮ menu instead.
   *  This selector targets the hover-revealed icon the doc describes; since it does not exist
   *  in the app, this step will hard-fail, correctly recording the doc/app mismatch. */
  "Delete icon at extreme right of user row after hover (doc step)":
    '[data-test-id^="cs-table-body-row-"] [data-test-id="cs-users-delete-icon"], [data-test-id^="cs-table-body-row-"] button[aria-label*="delete" i]:not([data-test-id="cs-table-action-options"])',
  /** After Delete/row action opens menu — Remove (data/dom/CMS/users-and-roles/users-verticle-menu.html). */
  "Remove in user row actions menu (doc step)": '[data-test-id="cs-users-action-remove"]',
  /** Confirmation dialog primary Remove (destructive). */
  "Remove user confirmation modal Remove button (doc step)":
    '.ReactModal__Content button.Button--primary:has-text("Remove"), .ReactModal__Content button:has-text("Remove"), [data-test-id="cs-users-quick-action-remove"], [role="dialog"] button.Button--primary:has-text("Remove"), [role="dialog"] button:has-text("Remove")',
  /** users-tab.html — Users | Roles tabs (doc: Users page for assign-role-to-a-user). */
  "Users tab on Users and Roles page (doc step)":
    '[data-test-id="cs-settings-tab-users"], [data-test-id="cs-settings-users-tab"], button:has-text("Users")',
  /** roles-listing.html / roles-tab.html — Users | Roles tabs (doc: select Roles tab). */
  "Roles tab on Users and Roles page (doc step)":
    '[data-test-id="cs-settings-tab-roles"], [data-test-id="cs-settings-roles-tab"]',
  /** roles-header.html — top right + New Role. */
  "+ New Role button top right on Users and Roles page (doc step)": '[data-test-id="cs-roles-header-new-role"]',
  /** new-role-page.html — Name / Description labels. */
  "New role Name field label (doc step)": '[data-test-id="cs-roles-name-label"]',
  "New role Description field label (doc step)": '[data-test-id="cs-roles-description-label"]',
  /** new-role-page.html — Permissions block (doc step 5). */
  "Permissions section heading on New Role page (doc step)": ".roles-edit__permissions-heading",
  /** permission-entries.html — Entries block (doc: Permissions on entries). */
  "Entries permissions block label (doc step)": '[data-test-id="cs-roles-permission-entry-label"]',
  /** permission-entries.html — “All Entries of Content Types” (examples Scenario 1). */
  "All Entries of Content Types heading (doc step)": '[data-test-id="cs-roles-permission-all-entries"]',
  /** permission-assets.html — Assets block (doc: Permissions on assets). */
  "Assets permissions block label (doc step)": '[data-test-id="cs-roles-permission-assets-label"]',
  /** Users table row — opens Update User (assign-role-to-a-user doc step 2). */
  "User row to open Update User (doc step)":
    '[data-test-id^="cs-table-body-row-"]:not(.Table__empty__row) [data-test-id="cs-users-table-email"], .users-list [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row)',
  /** Update User modal (assign-role-to-a-user). */
  "Update User modal title (doc step)":
    '[data-test-id="cs-modal-title-update-user"], [role="dialog"] h2:has-text("Update User"), [role="dialog"] h3:has-text("Update User")',
  "Update User modal Update button (doc step)":
    '[data-test-id="cs-users-update-user-save"], [data-test-id="cs-users-update-save"], [role="dialog"] button.Button--primary:has-text("Update"), [role="dialog"] button:has-text("Update")',
  /** roles-listing.html — open role edit (update-a-role doc step 2). */
  "Role row link to open role for editing (doc step)": 'a[href*="/settings/roles/"][href*="/edit"]',
  /** delete-a-role: hover the first role row (doc step 7). */
  "Roles table row to delete (doc step)":
    '[data-test-id^="cs-table-body-row-"]:not(.Table__empty__row)',
  /** Doc says Delete icon appears at extreme right on hover — app uses ⋮ instead.
   *  This selector targets the hover-revealed icon; since it does not exist, step hard-fails. */
  "Delete icon at extreme right of role row after hover (doc step)":
    '[data-test-id^="cs-table-body-row-"] [data-test-id="cs-roles-delete-icon"], [data-test-id^="cs-table-body-row-"] button[aria-label*="delete" i]:not([data-test-id="cs-table-action-options"])',
  /** delete-role-modal.html — confirm delete custom role. */
  "Delete Role modal title (doc step)": '[data-test-id="cs-modal-title-delete-role"]',
  "Delete Role confirmation modal Delete button (doc step)": '[data-test-id="cs-roles-quick-action-delete"]',
  /** new-role-page.html — Publishing Environments + Languages (doc steps 6–7). */
  "Publishing Environments label on New Role page (doc step)": '[data-test-id="cs-roles-permission-env-label"]',
  "Languages label on New Role page (doc step)": '[data-test-id="cs-roles-permission-locale-label"]',
  /** First env / language row (checkbox label; click handler ensures selection). */
  "First Publishing Environment checkbox on New Role page (doc step)":
    '.roles-edit__env [data-test-id="cs-roles-select-env"]',
  "First Language checkbox on New Role page (doc step)": '.roles-edit__lang [data-test-id="cs-roles-select-lang"]',
  /** Doc step 8: Click Save to create the new role. */
  "Save button to create the new role (doc step)":
    '[data-test-id="cs-roles-save"], [data-test-id="cs-page-layout-footer-save"], .PageLayout__footer button.Button--primary:has-text("Save"), footer button.Button--primary:has-text("Save")',
  /** update-a-role doc step 7: Save the changes. */
  "Save button to save role changes (doc step)":
    '[data-test-id="cs-roles-save"], [data-test-id="cs-page-layout-footer-save"], .PageLayout__footer button.Button--primary:has-text("Save"), footer button.Button--primary:has-text("Save")',
  /** Alias for Save (same selectors as Save button to create the new role). */
  "New role save button (doc step)":
    '[data-test-id="cs-roles-save"], [data-test-id="cs-page-layout-footer-save"], .PageLayout__footer button.Button--primary:has-text("Save"), footer button.Button--primary:has-text("Save")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "New role Name field (doc step)": '[data-test-id="cs-roles-name-input"] input, #roleName',
  "New role Description field (doc step)": '[data-test-id="cs-roles-description-input"] textarea, #role_description',
};
