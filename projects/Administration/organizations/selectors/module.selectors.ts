/**
 * Administration — organizations module selectors.
 * DOM references:
 *   data/dom/Administration/invite-user-new-page.html  — Invite User form (Administration product row only).
 *   data/dom/Administration/invite-user-page-mange-role.html — Manage Roles sidebar (org roles).
 *   data/dom/Administration/edit-user.html — Edit User page (empty at time of authoring; selectors derived from naming patterns).
 *   data/dom/Administration/users-list.html — Users list page (empty at time of authoring; selectors derived from naming patterns).
 *
 * Note: CMS product-row selectors and edit-user selectors are derived from the org naming pattern
 * because the corresponding DOM files were empty at time of authoring.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  // ── Navigation ──────────────────────────────────────────────────────────────

  /** Top-bar app switcher icon — opens the product switcher panel. */
  "App Switcher icon (doc step)":
    '[data-test-id="app-switcher"], button[aria-label*="App Switcher" i], [aria-label*="switcher" i], [data-test-id*="appswitcher" i]',

  /** App switcher panel — Administration tile/link. */
  "Administration in App Switcher (doc step)":
    '[data-test-id="app-switcher-orgadmin"], [data-test-id="app-switcher-body"] a:has-text("Administration"), .app__switcher__body__v2 a:has-text("Administration")',

  /** Org admin top-nav — Users section button. */
  "Users nav in Administration (doc step)":
    '[data-test-id="orgadmin-nav-users"], button[aria-label="Users"], .TopNavbar button:has-text("Users")',

  /** Users list page top-right Invite User button. */
  "Invite User button on Users list page (doc step)":
    '[data-test-id="cs-users-header-invite-user"], [data-test-id*="invite-user" i]:not([data-test-id="cs-org-invite-user"]), button:has-text("Invite User"), a:has-text("Invite User")',

  // ── Invite User page — email ────────────────────────────────────────────────

  /** invite-user-new-page.html — page title element. */
  "Invite User page title (doc step)": '[data-test-id="cs-page-title"]',

  /** Pill component — click to focus for typing. */
  "Email input Pill on Invite User page (doc step)": '[data-test-id="cs-users-email-input"]',

  /** Doc step: "You can only assign either the Admin or Member role" — Admin option in org role assignment. */
  "Admin role option in org role assignment (doc step)":
    '[data-test-id="cs-role-checkbox-admin"], [data-test-id="cs-org-role-admin"], [role="option"]:has-text("Admin"), .role-option:has-text("Admin"), li:has-text("Admin"), label:has-text("Admin")',

  /** Doc step: "You can only assign either the Admin or Member role" — Member option in org role assignment. */
  "Member role option in org role assignment (doc step)":
    '[data-test-id="cs-role-checkbox-member"], [data-test-id="cs-org-role-member"], [role="option"]:has-text("Member"), .role-option:has-text("Member"), li:has-text("Member"), label:has-text("Member")',

  /** Doc step: "Optionally assign stack-specific roles" — stack roles section on the Invite User page. */
  "Stack-specific roles on Invite User page (doc step)":
    '[data-test-id="cs-roles-select-product-headless-cms"], [data-test-id="cs-roles-select-product-cms"], .roles-select__product-item:has-text("CMS"), .roles-select__product-item:has-text("Headless CMS")',

  /** Actions column header in the Users list table — verified before interacting with row actions. */
  "Actions column in Users list (doc step)":
    'th:has-text("Actions"), [data-test-id="cs-table-header-actions"], [data-test-id="cs-users-actions-column"], .Table__header th:has-text("Actions")',

  // ── organization-information ────────────────────────────────────────────────

  /** "Info" tab in org admin navigation (doc step: "Click Info tab"). */
  "Info tab in org admin (doc step)":
    '[data-test-id="orgadmin-nav-org-info"], button[aria-label="Org Info"], button:has-text("Info"), a:has-text("Info")',

  /** Organization Name field on Organization Information page (non-editable). */
  "Organization Name field (doc step)":
    '[data-test-id="cs-org-name"], [data-test-id="cs-org-info-name"], input[name*="org" i][name*="name" i], label:has-text("Organization Name"), [aria-label*="Organization Name" i]',

  /** Organization ID field on Organization Information page (non-editable). */
  "Organization ID field (doc step)":
    '[data-test-id="cs-org-id"], [data-test-id="cs-org-info-id"], input[name*="org" i][name*="id" i], label:has-text("Organization ID"), [aria-label*="Organization ID" i]',

  /** Transfer Ownership button on Organization Information page. */
  "Transfer Ownership button (doc step)":
    '[data-test-id="cs-org-transfer-ownership"], [data-test-id="cs-transfer-ownership"], button:has-text("Transfer Ownership"), a:has-text("Transfer Ownership")',

  /** Email input in the Transfer Ownership modal/form. */
  "Transfer Ownership email input (doc step)":
    '[data-test-id="cs-transfer-ownership-email"], [data-test-id="cs-org-transfer-email"], input[type="email"], input[placeholder*="email" i], input[name*="email" i]',

  // ── organization-settings-overview ──────────────────────────────────────────

  /** Organization settings management page title/heading after Org Admin redirect. */
  "Organization settings management page (doc step)":
    '[data-test-id="cs-page-title"], .PageTitle, h1, h2',

  /** "Organization Information" subsection on the settings overview page.
   *  Nav label in DOM is "Org Info" — if app text differs from doc, test fails. */
  "Organization Information section (doc step)":
    '[data-test-id="orgadmin-nav-org-info"], a:has-text("Organization Information"), button:has-text("Organization Information"), [aria-label="Organization Information"], [aria-label="Org Info"]',

  /** "Product Analytics" subsection on the settings overview page. */
  "Product Analytics section (doc step)":
    '[data-test-id="orgadmin-nav-product-analytics"], a:has-text("Product Analytics"), button:has-text("Product Analytics"), [aria-label="Product Analytics"]',

  /** "Organization Users" subsection on the settings overview page.
   *  Nav label in DOM is "Users" — if app text differs from doc, test fails. */
  "Organization Users section (doc step)":
    '[data-test-id="orgadmin-nav-users"], a:has-text("Organization Users"), button:has-text("Organization Users"), [aria-label="Organization Users"], [aria-label="Users"]',

  /** "Organization Stacks" subsection on the settings overview page.
   *  Nav label in DOM is "Stacks" — if app text differs from doc, test fails. */
  "Organization Stacks section (doc step)":
    '[data-test-id="orgadmin-nav-stacks"], a:has-text("Organization Stacks"), button:has-text("Organization Stacks"), [aria-label="Organization Stacks"], [aria-label="Stacks"]',

  // ── bulk-operations-on-organization-users ───────────────────────────────────

  /** Floating bulk-action panel that appears after selecting user checkboxes. */
  "Bulk operations floating panel (doc step)":
    '[data-test-id="cs-users-bulk-action-bar"], [data-test-id="cs-bulk-action-panel"], .bulk-action-bar, .floating-panel, [class*="bulk-action" i]',

  /** "Remove" option in the bulk operations floating panel. */
  "Remove option in bulk operations panel (doc step)":
    '[data-test-id="cs-bulk-action-remove"], [data-test-id="cs-users-bulk-remove"], .bulk-action-bar button:has-text("Remove"), [class*="bulk-action" i] button:has-text("Remove")',

  /** "Update Organization Role" option in the bulk operations floating panel. */
  "Update Organization Role option in bulk operations panel (doc step)":
    '[data-test-id="cs-bulk-action-update-org-role"], [data-test-id="cs-users-bulk-update-role"], .bulk-action-bar button:has-text("Update Organization Role"), [class*="bulk-action" i] button:has-text("Update Organization Role")',

  /** "Update Stack Access" option in the bulk operations floating panel. */
  "Update Stack Access option in bulk operations panel (doc step)":
    '[data-test-id="cs-bulk-action-update-stack-access"], [data-test-id="cs-users-bulk-stack-access"], .bulk-action-bar button:has-text("Update Stack Access"), [class*="bulk-action" i] button:has-text("Update Stack Access")',

  /** "Force Password Reset" option in the bulk operations floating panel. */
  "Force Password Reset option in bulk operations panel (doc step)":
    '[data-test-id="cs-bulk-action-force-password-reset"], [data-test-id="cs-users-bulk-force-reset"], .bulk-action-bar button:has-text("Force Password Reset"), [class*="bulk-action" i] button:has-text("Force Password Reset")',

  /** "Reset MFA" option in the bulk operations floating panel. */
  "Reset MFA option in bulk operations panel (doc step)":
    '[data-test-id="cs-bulk-action-reset-mfa"], [data-test-id="cs-users-bulk-reset-mfa"], .bulk-action-bar button:has-text("Reset MFA"), [class*="bulk-action" i] button:has-text("Reset MFA")',

  /** "Force Kill Session" option in the bulk operations floating panel. */
  "Force Kill Session option in bulk operations panel (doc step)":
    '[data-test-id="cs-bulk-action-force-kill-session"], [data-test-id="cs-users-bulk-kill-session"], .bulk-action-bar button:has-text("Force Kill Session"), [class*="bulk-action" i] button:has-text("Force Kill Session")',

  // ── Assign Product Roles — CMS section ─────────────────────────────────────

  /**
   * CMS product row in the Assign Product Roles accordion.
   * DOM pattern: cs-roles-select-product-{product}. CMS may surface as
   * "headless-cms", "cms", or "Headless CMS" text — all covered.
   */
  "CMS section in Assign Product Roles (doc step)":
    '[data-test-id="cs-roles-select-product-headless-cms"], [data-test-id="cs-roles-select-product-cms"], .roles-select__product-item:has-text("Headless CMS"), .roles-select__product-item:has-text("CMS")',

  /**
   * Manage Roles button inside the CMS product row (doc step: "In the CMS section, click Manage Roles").
   */
  "CMS section Manage Roles button (doc step)":
    '[data-test-id="cs-roles-manage-headless-cms"], [data-test-id="cs-roles-manage-cms"], [data-test-id="cs-roles-select-product-headless-cms"] button:has-text("Manage Roles"), [data-test-id="cs-roles-select-product-cms"] button:has-text("Manage Roles"), .roles-select__product-item:has-text("CMS") button:has-text("Manage Roles")',

  /**
   * Stacks dropdown inside the CMS Manage Roles sidebar
   * (doc step: "Select the stacks to which you want to assign roles").
   */
  "Stacks dropdown in CMS manage roles sidebar (doc step)":
    '[data-test-id="cs-roles-sidebar-dropdown-organization"], [data-test-id="cs-roles-sidebar-dropdown-cms"], [data-test-id="cs-roles-sidebar-dropdown-headless-cms"]',

  /**
   * First available stack option in the open stacks dropdown.
   * The dropdown renders a list; pick the first item that is selectable.
   */
  "First stack option in stacks dropdown (doc step)":
    '[data-test-id="cs-roles-sidebar-dropdown-organization"] [role="option"]:first-child, [data-test-id="cs-roles-sidebar-dropdown-organization"] li:first-child, .Dropdown__list li:first-child',

  /** Role checkbox — Member (lowest-privilege default; safe to select in automation). */
  "Member role checkbox in sidebar (doc step)":
    '[data-test-id="cs-role-checkbox-member"], .roles-list [data-test-id="cs-checkbox"]:has-text("Member")',

  /** Save button in the Manage Roles sidebar (doc step: "Click Save to confirm your selections"). */
  "Save button in manage roles sidebar (doc step)":
    '[data-test-id="cs-roles-sidebar-save"]',

  // ── Assign Product Roles — Administration section ───────────────────────────

  /**
   * Administration product row in the Assign Product Roles accordion.
   * DOM: cs-roles-select-product-organization (invite-user-new-page.html).
   */
  "Administration section in Assign Product Roles (doc step)":
    '[data-test-id="cs-roles-select-product-organization"]',

  /**
   * Manage Roles button inside the Administration product row
   * (doc step: "In the Administration section, click Manage Roles").
   * DOM: cs-roles-manage-organization (invite-user-new-page.html).
   */
  "Administration section Manage Roles button (doc step)":
    '[data-test-id="cs-roles-manage-organization"]',

  /** Product Roles accordion inside the Administration Manage Roles sidebar. */
  "Product Roles accordion in sidebar (doc step)":
    '[data-test-id="cs-roles-sidebar-product-accordion-organization"]',

  /** Member role checkbox in Administration manage roles sidebar. */
  "Member role checkbox in Administration sidebar (doc step)":
    '[data-test-id="cs-role-checkbox-member"]',

  /** Save button in the Administration Manage Roles sidebar. */
  "Save button in Administration manage roles sidebar (doc step)":
    '[data-test-id="cs-roles-sidebar-save"]',

  // ── Final submit ────────────────────────────────────────────────────────────

  /**
   * Invite submit button — enabled only after at least one email + one role.
   * DOM: cs-org-invite-user (invite-user-new-page.html).
   */
  "Invite button on Invite User page (doc step)": '[data-test-id="cs-org-invite-user"]',

  /** Cancel / go-back — used to abort the invite form during non-destructive automation passes. */
  "Cancel button on Invite User page (doc step)": '[data-test-id="cs-org-edit-invite-cancel"]',

  // ── organization-users — shared Users list actions ──────────────────────────

  /** Vertical ellipsis (⋮) in the Actions column of a user row. */
  "Vertical ellipsis in Actions column (doc step)":
    '[data-test-id="cs-table-action-options"], [data-test-id="cs-users-action-menu"], button[aria-label*="action" i]:has(svg), .VerticalActionTooltip__trigger',

  /** "Edit" option in the row actions menu. */
  "Edit option in Actions menu (doc step)":
    '[data-test-id="cs-users-action-edit"], .VerticalActionTooltip li:has-text("Edit"), [role="menu"] li:has-text("Edit"), li:has-text("Edit")',

  /** "Assign Organization Role" section heading on Edit user page. */
  "Assign Organization Role section on Edit user page (doc step)":
    '[data-test-id="cs-edit-user-org-role-section"], [data-test-id*="assign-org-role"], h3:has-text("Assign Organization Role"), label:has-text("Assign Organization Role"), .edit-user__org-role',

  /** "Remove" option in the row actions menu (doc step: "select Remove"). */
  "Remove option in Actions menu (doc step)":
    '[data-test-id="cs-users-action-remove"], .VerticalActionTooltip li:has-text("Remove"), [role="menu"] li:has-text("Remove"), li:has-text("Remove")',

  /** Remove User confirmation modal. */
  "Remove User modal (doc step)":
    '[role="dialog"]:has-text("Remove User"), [data-test-id*="remove-user"], [data-test-id="cs-modal-title-remove-user"]',

  /** "Remove" confirm button inside the Remove User modal. */
  "Remove button in Remove User modal (doc step)":
    '[role="dialog"] button.Button--primary:has-text("Remove"), [role="dialog"] button:has-text("Remove"), [data-test-id="cs-users-remove-confirm"]',

  /** Checkbox next to a user row for bulk actions. */
  "User checkbox in Users list (doc step)":
    '[data-test-id^="cs-table-body-row"] [data-test-id="cs-checkbox"], [data-test-id^="cs-table-body-row"] input[type="checkbox"], tbody tr:not(.Table__empty__row) input[type="checkbox"]',

  /** "Force Password Reset" option (bulk action or row action menu). */
  "Force Password Reset option (doc step)":
    '[data-test-id="cs-users-force-password-reset"], [data-test-id*="force-password-reset"], li:has-text("Force Password Reset"), [role="menu"] li:has-text("Force Password Reset"), button:has-text("Force Password Reset")',

  /** Confirmation modal for Force Password Reset. */
  "Force Password Reset modal (doc step)":
    '[role="dialog"]:has-text("Force Password Reset"), [data-test-id*="force-password-reset-modal"]',

  /** "Continue" button in Force Password Reset modal. */
  "Continue button in Force Password Reset modal (doc step)":
    '[role="dialog"] button:has-text("Continue"), [data-test-id="cs-users-force-reset-confirm"]',

  /** "Unlock User" option in the row actions menu or bulk action. */
  "Unlock User option (doc step)":
    '[data-test-id="cs-users-action-unlock"], .VerticalActionTooltip li:has-text("Unlock User"), [role="menu"] li:has-text("Unlock User"), li:has-text("Unlock User")',

  /** Confirmation modal for Unlock Users. */
  "Unlock User confirmation modal (doc step)":
    '[role="dialog"]:has-text("Unlock User"), [data-test-id*="unlock-user-modal"]',

  /** "Continue" or "Proceed" button in Unlock User confirmation modal. */
  "Continue or Proceed in Unlock User modal (doc step)":
    '[role="dialog"] button:has-text("Continue"), [role="dialog"] button:has-text("Proceed"), [data-test-id="cs-users-unlock-confirm"]',

  /** "Reset MFA" option in the row actions menu. */
  "Reset MFA option in Actions menu (doc step)":
    '[data-test-id="cs-users-action-reset-mfa"], .VerticalActionTooltip li:has-text("Reset MFA"), [role="menu"] li:has-text("Reset MFA"), li:has-text("Reset MFA")',

  /** Reset Multi-Factor Authentication confirmation modal. */
  "Reset Multi-Factor Authentication modal (doc step)":
    '[role="dialog"]:has-text("Reset Multi-Factor"), [role="dialog"]:has-text("Multi-Factor Authentication"), [data-test-id*="reset-mfa-modal"]',

  /** "Proceed" button inside the Reset MFA modal. */
  "Proceed button in Reset MFA modal (doc step)":
    '[role="dialog"] button:has-text("Proceed"), [data-test-id="cs-users-reset-mfa-confirm"]',

  /** Export icon to download the users list CSV. */
  "Export icon on Users list page (doc step)":
    '[data-test-id="cs-users-export"], [data-test-id*="export"], button[aria-label*="Export" i], button:has-text("Export"), .export-btn',

  /** "Last Login At" column header — click to sort the list. */
  "Last Login At column header (doc step)":
    '[data-test-id="cs-table-sort-last-login-at"], th:has-text("Last Login At"), [data-test-id="cs-table-header-last-login"], th[aria-label*="Last Login" i]',

  // ── webhook-configuration ───────────────────────────────────────────────────

  /** Webhook Configuration tab in the org admin left navigation (doc step). */
  "Webhook Configuration tab (doc step)":
    '[data-test-id="orgadmin-nav-webhook-configuration"], button[aria-label="Webhook Configuration"], a:has-text("Webhook Configuration"), button:has-text("Webhook Configuration")',

  /** Connection Rate Limit input on the Webhook Configuration page — accepts 2 to 100 (doc step). */
  "Connection Rate Limit field (doc step)":
    '[data-test-id="cs-webhook-conf-connection-rate-limit"], input[name*="connection-rate-limit" i], input[name*="connectionRateLimit" i], input[aria-label*="Connection Rate Limit" i], label:has-text("Connection Rate Limit") ~ input, label:has-text("Connection Rate Limit") input',

  /** Save button on the Webhook Configuration page (doc step). */
  "Save button on Webhook Configuration page (doc step)":
    '[data-test-id="cs-webhook-conf-save"], [data-test-id="cs-webhook-save"], button.Button--primary:has-text("Save"), button:has-text("Save")',

  // ── security-configuration ──────────────────────────────────────────────────

  /** Security Configuration tab in the org admin top navigation (doc step). */
  "Security Configuration tab in Administration (doc step)":
    '[data-test-id="orgadmin-nav-security-configuration"], button[aria-label="Security Configuration"], a:has-text("Security Configuration"), button:has-text("Security Configuration")',

  /** Enable MFA toggle on the Security Configuration / MFA sub-page (doc step). */
  "Enable MFA toggle (doc step)":
    '[data-test-id="cs-security-conf-mfa-toggle"], [data-test-id="cs-security-mfa-enable"], input[type="checkbox"][aria-label*="MFA" i], label:has-text("MFA") input[type="checkbox"], .Toggle:has-text("MFA")',

  /** Save button shared across all Security Configuration sub-sections (doc step). */
  "Save button on Security Configuration page (doc step)":
    '[data-test-id="cs-security-conf-save"], [data-test-id="cs-security-save"], button.Button--primary:has-text("Save"), button:has-text("Save")',

  /** Cancel button on the Session Timeout sub-page (doc step: "Click Save or Cancel"). */
  "Cancel button on Security Configuration page (doc step)":
    '[data-test-id="cs-security-conf-cancel"], [data-test-id="cs-security-cancel"], button:has-text("Cancel")',

  /** Password Policies sub-tab on the Security Configuration page (doc step). */
  "Password Policies tab (doc step)":
    '[data-test-id="cs-security-conf-tab-password-policies"], [data-test-id="cs-security-password-policies"], a:has-text("Password Policies"), button:has-text("Password Policies"), li:has-text("Password Policies")',

  /** Password Duration input on the Password Policies sub-page (doc step: 0–365 days, 0 = no expiry). */
  "Password Duration field (doc step)":
    '[data-test-id="cs-security-conf-password-duration"], input[name*="password-duration" i], input[name*="passwordDuration" i], input[aria-label*="Password Duration" i], label:has-text("Password Duration") ~ input, label:has-text("Password Duration") input',

  /** Minimum Password Length input on the Password Policies sub-page (doc step: minimum value 8). */
  "Minimum Password Length field (doc step)":
    '[data-test-id="cs-security-conf-min-password-length"], input[name*="min-password-length" i], input[name*="minimumPasswordLength" i], input[aria-label*="Minimum Password Length" i], label:has-text("Minimum Password Length") ~ input, label:has-text("Minimum Password Length") input',

  /** Session Timeout sub-tab on the Security Configuration page (doc step). */
  "Session Timeout tab (doc step)":
    '[data-test-id="cs-security-conf-tab-session-timeout"], [data-test-id="cs-security-session-timeout"], a:has-text("Session Timeout"), button:has-text("Session Timeout"), li:has-text("Session Timeout")',

  /** Enable Session Timeout toggle on the Session Timeout sub-page (doc step). */
  "Enable Session Timeout toggle (doc step)":
    '[data-test-id="cs-security-conf-session-timeout-toggle"], [data-test-id="cs-security-session-timeout-enable"], input[type="checkbox"][aria-label*="Session Timeout" i], label:has-text("Enable Session Timeout") input[type="checkbox"], .Toggle:has-text("Session Timeout")',

  /** Maximum Session Duration (hours) input on Session Timeout sub-page (doc step: default 12). */
  "Maximum Session Duration field (doc step)":
    '[data-test-id="cs-security-conf-max-session-duration"], input[name*="max-session-duration" i], input[name*="maximumSessionDuration" i], input[aria-label*="Maximum Session Duration" i], label:has-text("Maximum Session Duration") ~ input, label:has-text("Maximum Session Duration") input',

  /** Maximum Inactivity Timeout (hours) input on Session Timeout sub-page (doc step: default 1). */
  "Maximum Inactivity Timeout field (doc step)":
    '[data-test-id="cs-security-conf-max-inactivity-timeout"], input[name*="max-inactivity-timeout" i], input[name*="maximumInactivityTimeout" i], input[aria-label*="Maximum Inactivity Timeout" i], label:has-text("Maximum Inactivity Timeout") ~ input, label:has-text("Maximum Inactivity Timeout") input',

  /** Allowlist User Email input on Session Timeout sub-page — comma-separated emails (doc step). */
  "Allowlist User Email field (doc step)":
    '[data-test-id="cs-security-conf-allowlist-email"], input[name*="allowlist-email" i], input[name*="allowlistEmail" i], input[aria-label*="Allowlist User Email" i], input[placeholder*="allowlist" i], label:has-text("Allowlist User Email") ~ input, label:has-text("Allowlist User Email") input',

  /** Allowed Email Domains sub-tab on the Security Configuration page (doc step). */
  "Allowed Email Domains tab (doc step)":
    '[data-test-id="cs-security-conf-tab-allowed-email-domains"], [data-test-id="cs-security-allowed-email-domains"], a:has-text("Allowed Email Domains"), button:has-text("Allowed Email Domains"), li:has-text("Allowed Email Domains")',

  /** Enable Allowed Email Domains toggle on the Allowed Email Domains sub-page (doc step). */
  "Enable Allowed Email Domains toggle (doc step)":
    '[data-test-id="cs-security-conf-allowed-email-domains-toggle"], [data-test-id="cs-security-allowed-domains-enable"], input[type="checkbox"][aria-label*="Allowed Email Domains" i], label:has-text("Enable Allowed Email Domains") input[type="checkbox"], .Toggle:has-text("Allowed Email Domains")',

  /** Add Allowed Email Domain(s) input on the Allowed Email Domains sub-page — up to 30 domains (doc step). */
  "Add Allowed Email Domain(s) field (doc step)":
    '[data-test-id="cs-security-conf-allowed-domain-input"], input[name*="allowed-email-domain" i], input[name*="allowedEmailDomain" i], input[aria-label*="Allowed Email Domain" i], input[placeholder*="domain" i], label:has-text("Add Allowed Email Domain") ~ input, label:has-text("Add Allowed Email Domain") input',

  // ── change-organization-role-of-existing-users ──────────────────────────────

  /**
   * Org Admin icon in the left navigation panel
   * (doc step: "click on the 'Org Admin' icon on the left navigation panel").
   * DOM: cs-org admin-button seen in invite-user-new-page.html top nav.
   */
  "Org Admin icon in left navigation (doc step)":
    '[data-test-id="cs-org admin-button"], button[aria-label="org admin"], [aria-label*="Org Admin" i]',

  /**
   * Settings page heading/label — confirms the org-admin Settings page loaded
   * (doc step: "In the Settings page, click on Users").
   */
  "Settings page (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Settings"), h1:has-text("Settings"), h2:has-text("Settings"), .PageTitle:has-text("Settings")',

  /**
   * Users link in the Settings/org-admin page
   * (doc step: "click on Users").
   * Reuses orgadmin-nav-users seen across invite-user DOM files.
   */
  "Users in Settings page (doc step)":
    '[data-test-id="orgadmin-nav-users"], button[aria-label="Users"], .TopNavbar button:has-text("Users")',

  /**
   * A user row in the Users list — click to open the Edit user page
   * (doc step: "Click on the user whose role you want to change").
   * edit-user.html is empty; using table-row pattern from org admin users list.
   */
  "User row in Users list (doc step)":
    '[data-test-id^="cs-table-body-row-"]:not(.Table__empty__row), .users-list tbody tr:not(.Table__empty__row), table tbody tr:not(.Table__empty__row)',

  /**
   * Organization role dropdown on the Edit user page
   * (doc step: "Change the organization role to Admin or Member").
   */
  "Organization role dropdown on Edit user page (doc step)":
    '[data-test-id="cs-users-org-role"], [data-test-id="cs-org-role-select"], [data-test-id="cs-edit-user-org-role"], select[name*="role" i], [aria-label*="organization role" i]',

  /**
   * "Edit User" screen heading, reached via the row actions ⋮ menu > Edit
   * (doc step: "On the Edit User screen, update the following as required").
   * DOM not yet captured for this screen; selector derived from page-title naming pattern.
   */
  "Edit User screen heading (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Edit User"), h1:has-text("Edit User"), h2:has-text("Edit User")',

  /**
   * "Administration" roles row within Manage Product Roles on the Edit User screen
   * (doc step bullet: "The organization-level Administration roles").
   */
  "Administration roles section on Edit User screen (doc step)":
    '[data-test-id*="administration" i]:has-text("Administration"), li:has-text("Administration"):has-text("Manage Administration roles"), div:has-text("Manage Administration roles")',

  /**
   * "CMS" product roles row within Manage Product Roles on the Edit User screen
   * (doc step bullet: "The product roles for each product, such as the CMS, Assets, and AgentOS").
   */
  "CMS product roles section on Edit User screen (doc step)":
    '[data-test-id*="cms" i]:has-text("CMS"), li:has-text("CMS"):has-text("Manage CMS roles"), div:has-text("Manage CMS roles")',

  /**
   * Stack Role section on the Edit user page
   * (doc step: "You can also change the Stack Role of the user").
   */
  "Stack Role section on Edit user page (doc step)":
    '[data-test-id="cs-edit-user-stack-role"], [data-test-id="cs-users-stack-role"], [data-test-id*="stack-role" i], .stack-role, h3:has-text("Stack Role"), label:has-text("Stack Role")',

  /**
   * Update button on the Edit user page
   * (doc step: "Click on Update once you are done updating the roles").
   */
  "Update button on Edit user page (doc step)":
    '[data-test-id="cs-org-update-user"], [data-test-id="cs-users-update"], [data-test-id="cs-edit-user-update"], button:has-text("Update"), [data-test-id="cs-page-layout-footer-save"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  /**
   * Pill input inside the email field — type here to add email addresses.
   * The Pill component wraps an inner <input> or contenteditable div.
   */
  "Email input on Invite User page (doc step)":
    '[data-test-id="cs-users-email-input"] input, [data-test-id="cs-users-email-input"] [contenteditable="true"]',
};
