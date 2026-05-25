/**
 * Administration — teams module selectors.
 * DOM references: empty at time of authoring; selectors derived from naming patterns.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  // ── Navigation ──────────────────────────────────────────────────────────────

  /** Org Admin icon in the left navigation panel (doc step). */
  "Org Admin icon in left navigation (doc step)":
    '[data-test-id="cs-org admin-button"], button[aria-label="org admin"], [aria-label*="Org Admin" i]',

  // ── create-a-team / edit-a-team ──────────────────────────────────────────────

  /** Teams menu item in the Org Admin left navigation (doc step). */
  "Teams menu item in Org Admin (doc step)":
    '[data-test-id="orgadmin-nav-teams"], a:has-text("Teams"), button:has-text("Teams"), [aria-label="Teams"]',

  // ── edit-a-team ──────────────────────────────────────────────────────────────

  /** "Actions" column header on the Teams list page (doc step). */
  "Actions column on Teams list page (doc step)":
    'th:has-text("Actions"), [data-test-id="cs-teams-col-actions"]',

  /** Three dots (ellipsis) in the Actions column of a team row on the Teams list page (doc step). */
  "Three dots in Actions column for team (doc step)":
    '[data-test-id="cs-team-row-actions"], [data-test-id="cs-team-actions-menu"], tr button[aria-label*="action" i], tr button[aria-label*="more" i], .team-row [data-test-id*="ellipsis"], .VerticalActionTooltip__trigger',

  /** "Edit" option (pencil icon) in the team row Actions dropdown menu (doc step). */
  "Edit option in team Actions menu (doc step)":
    '[data-test-id="cs-team-action-edit"], [role="menu"] li:has-text("Edit"), [role="menuitem"]:has-text("Edit"), li:has-text("Edit")',

  /** "Delete" option (trash bin icon) in the team row Actions dropdown menu (doc step). */
  "Delete option in team Actions menu (doc step)":
    '[data-test-id="cs-team-action-delete"], [role="menu"] li:has-text("Delete"), [role="menuitem"]:has-text("Delete"), li:has-text("Delete")',

  /** "Delete Team" modal/dialog that appears after clicking the Delete option (doc step). */
  "Delete Team modal (doc step)":
    '[role="dialog"]:has-text("Delete Team"), [data-test-id="cs-delete-team-modal"], .modal__title:has-text("Delete Team")',

  /** "Delete Team" button inside the Delete Team confirmation modal (doc step). */
  "Delete Team button in modal (doc step)":
    '[role="dialog"] button:has-text("Delete Team"), [data-test-id="cs-delete-team-confirm"], [role="dialog"] button.Button--danger:has-text("Delete")',

  /** "Save" button on the Team tab of the team configuration/edit page (doc step). */
  "Save button on Team tab (doc step)":
    '[data-test-id="cs-team-save"], button:has-text("Save"), [aria-label="Save"]',

  // ── create-a-team ────────────────────────────────────────────────────────────

  /** "+ New Team" button on the Teams list page (doc step). */
  "+ New Team button (doc step)":
    '[data-test-id="cs-teams-new-team"], button:has-text("+ New Team"), button:has-text("New Team"), a:has-text("+ New Team")',

  /** "Create New Team" modal/dialog title (doc step). */
  "Create New Team modal title (doc step)":
    '[data-test-id="cs-create-team-modal-title"], [role="dialog"] h2:has-text("Create New Team"), [role="dialog"] h1:has-text("Create New Team"), .modal__title:has-text("Create New Team")',

  /** "Team Name" label in the Create New Team form (doc step). */
  "Team Name label in Create New Team form (doc step)":
    '[data-test-id="cs-create-team-name-label"], [role="dialog"] label:has-text("Team Name"), [role="dialog"] .FormField__label:has-text("Team Name"), form label:has-text("Team Name")',

  /** "Description" label in the Create New Team form (doc step). */
  "Description label in Create New Team form (doc step)":
    '[data-test-id="cs-create-team-desc-label"], [role="dialog"] label:has-text("Description"), [role="dialog"] .FormField__label:has-text("Description"), form label:has-text("Description")',

  /** "Create Team" button in the new team form/modal (doc step). */
  "Create Team button (doc step)":
    '[data-test-id="cs-teams-create-team"], button:has-text("Create Team"), [aria-label="Create Team"]',

  /** "Team" tab on the team configuration page (doc step). */
  "Team tab on team configuration page (doc step)":
    '[data-test-id="cs-team-config-tab-team"], [role="tab"]:has-text("Team"), button:has-text("Team"), a:has-text("Team")',

  /** "Team Name" label on the Team tab of the configuration page (doc step). */
  "Team Name label on Team tab (doc step)":
    '[data-test-id="cs-team-tab-name-label"], .team-config label:has-text("Team Name"), .FormField__label:has-text("Team Name"), h3:has-text("Team Name")',

  /** "Description" label on the Team tab of the configuration page (doc step). */
  "Description label on Team tab (doc step)":
    '[data-test-id="cs-team-tab-desc-label"], .team-config label:has-text("Description"), .FormField__label:has-text("Description"), h3:has-text("Description")',

  /** "Assign Organization Role" section heading on the Team tab (doc step). */
  "Assign Organization Role section on Team tab (doc step)":
    '[data-test-id="cs-team-assign-org-role"], h2:has-text("Assign Organization Role"), h3:has-text("Assign Organization Role"), label:has-text("Assign Organization Role"), [aria-label*="Assign Organization Role" i]',

  /** "Invite to stacks" section heading on the Team tab (doc step). */
  "Invite to stacks section on Team tab (doc step)":
    '[data-test-id="cs-team-invite-to-stacks"], h2:has-text("Invite to stacks"), h3:has-text("Invite to stacks"), label:has-text("Invite to stacks"), [aria-label*="Invite to stacks" i]',

  /** "Users" tab on the team configuration page (doc step). */
  "Users tab on team configuration page (doc step)":
    '[data-test-id="cs-team-config-tab-users"], [role="tab"]:has-text("Users"), button:has-text("Users"), a:has-text("Users")',

  /** "+ Invite Users" button on the Users tab of the team configuration page (doc step). */
  "+ Invite Users button (doc step)":
    '[data-test-id="cs-team-invite-users"], button:has-text("+ Invite Users"), button:has-text("Invite Users"), a:has-text("+ Invite Users")',

  /** "Invite Users" modal/dialog title that appears after clicking + Invite Users (doc step). */
  "Invite Users modal title (doc step)":
    '[data-test-id="cs-invite-users-modal-title"], [role="dialog"] h2:has-text("Invite Users"), [role="dialog"] h1:has-text("Invite Users"), .modal__title:has-text("Invite Users")',

  /** "Invite" button inside the Invite Users dialog (doc step). */
  "Invite button in Invite Users dialog (doc step)":
    '[role="dialog"] button:has-text("Invite"), [data-test-id="cs-team-invite-confirm"], button.Button--primary:has-text("Invite")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  // ── create-a-team ────────────────────────────────────────────────────────────

  /** Team name input field in the new team form (doc step). */
  "Team name input field (doc step)":
    '[data-test-id="cs-team-name-input"], input[name="name"], input[placeholder*="team name" i], input[aria-label*="team name" i]',

  /** Team description input field in the new team form (doc step). */
  "Team description input field (doc step)":
    '[data-test-id="cs-team-description-input"], textarea[name="description"], input[name="description"], textarea[placeholder*="description" i], input[aria-label*="description" i]',

  /** Email address input inside the Invite Users dialog (doc step). */
  "Email address input in Invite Users (doc step)":
    '[data-test-id="cs-team-invite-email-input"], input[type="email"], input[name="email"], input[placeholder*="email" i], input[aria-label*="email" i]',
};
