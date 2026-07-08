/**
 * Administration — manage-organization module selectors.
 * DOM references: empty at time of authoring; selectors derived from naming patterns.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  // ── switch-between-organizations ────────────────────────────────────────────

  /** Profile icon in the top-right header — opens the profile/account menu (doc step).
   * DOM: <div data-test-id="cs-user-profile"><label aria-label="User Profile" role="button">. */
  "Profile icon (doc step)":
    '[data-test-id="cs-user-profile"]',

  /** "Switch organization" static label/section heading inside the profile dropdown menu (doc step).
   * DOM: <div class="switch_organization" aria-label="Switch Organization"><p>Switch organization</p></div> — not interactive. */
  "Switch organization dropdown (doc step)":
    '[aria-label="Switch Organization"]',

  /** Actual dropdown control that reveals org options — a hover-triggered widget next to the "Switch organization" label (doc step).
   * DOM: <div data-test-id="cs-userprofile-orgdropdown" class="Dropdown--hover ..." aria-expanded="false"> — opens on hover, not click. */
  "Organization dropdown trigger (doc step)":
    '[data-test-id="cs-userprofile-orgdropdown"]',

  /** First available organization option in the Switch organization dropdown list (doc step).
   * DOM: <ul class="Dropdown__menu__list"><li data-test-id="cs-dropdown-elements" class="Dropdown__menu__list__item ...">. */
  "Organization option in Switch organization dropdown (doc step)":
    'ul.Dropdown__menu__list li[data-test-id="cs-dropdown-elements"]',

  // ── customer-entitlements ───────────────────────────────────────────────────

  /** Mission Control tab in the org admin navigation (doc step). */
  "Mission Control tab (doc step)":
    '[data-test-id="orgadmin-nav-mission-control"], button[aria-label="Mission Control"], a:has-text("Mission Control"), button:has-text("Mission Control")',

  /** Usage Overview page heading — confirms the page loaded after clicking Mission Control (doc step). */
  "Usage Overview page (doc step)":
    '[data-test-id="cs-usage-overview"], h1:has-text("Usage Overview"), h2:has-text("Usage Overview"), .PageTitle:has-text("Usage")',

  /** Users tab in the org admin navigation (doc step — for Remove Inactive Users section). */
  "Users tab in org admin (doc step)":
    '[data-test-id="orgadmin-nav-users"], button[aria-label="Users"], a:has-text("Users"), button:has-text("Users")',

  /** Users list table/container on the Organization Settings page (doc step). */
  "Users list on Organization Settings page (doc step)":
    '[data-test-id="cs-org-users-list"], [data-test-id="cs-users-table"], .users-list, table tbody',

  /** Remove icon that appears on hovering a user row (doc step). */
  "Remove icon on user row (doc step)":
    '[data-test-id="cs-users-action-remove"], [data-test-id="cs-user-row-remove"], button[aria-label*="Remove" i], .user-row__remove-icon, tr:hover [data-test-id*="remove"]',

  /** Confirmation popup after clicking the Remove icon (doc step). */
  "Remove user confirmation popup (doc step)":
    '[role="dialog"]:has-text("Remove"), [data-test-id*="remove-user-modal"], [data-test-id="cs-modal-title-remove-user"]',

  /** Confirm button inside the Remove user popup (doc step). */
  "Confirm button in Remove user popup (doc step)":
    '[role="dialog"] button.Button--primary:has-text("Confirm"), [role="dialog"] button:has-text("Confirm"), [role="dialog"] button:has-text("Remove"), [data-test-id="cs-users-remove-confirm"]',

  /** Product Analytics tab in the org admin navigation (doc step). */
  "Product Analytics tab (doc step)":
    '[data-test-id="orgadmin-nav-product-analytics"], button[aria-label="Product Analytics"], a:has-text("Product Analytics"), button:has-text("Product Analytics")',

  /** Usage by Stacks section heading on the Product Analytics page (doc step). */
  "Usage by Stacks section (doc step)":
    '[data-test-id="cs-analytics-usage-by-stacks"], h2:has-text("Usage by Stacks"), h3:has-text("Usage by Stacks"), [aria-label="Usage by Stacks"]',

  /** Bandwidth section heading on the Product Analytics page (doc step). */
  "Bandwidth section (doc step)":
    '[data-test-id="cs-analytics-bandwidth"], h2:has-text("Bandwidth"), h3:has-text("Bandwidth"), [aria-label="Bandwidth"]',

  /** API Requests section under Usage Type on the Product Analytics page (doc step). */
  "API Requests section (doc step)":
    '[data-test-id="cs-analytics-api-requests"], h2:has-text("API Requests"), h3:has-text("API Requests"), [aria-label="API Requests"]',

  /** Top URLs section on the Product Analytics page (doc step). */
  "Top URLs section (doc step)":
    '[data-test-id="cs-analytics-top-urls"], h2:has-text("Top URLs"), h3:has-text("Top URLs"), [aria-label="Top URLs"]',

  /** Services filter on the Product Analytics page (doc step). */
  "Services filter (doc step)":
    '[data-test-id="cs-analytics-filter-services"], label:has-text("Services"), [aria-label*="Services" i], button:has-text("Services"), .filter-panel [data-test-id*="services"]',

  /** Group By filter on the Product Analytics page (doc step). */
  "Group By filter (doc step)":
    '[data-test-id="cs-analytics-filter-group-by"], label:has-text("Group By"), [aria-label*="Group By" i], button:has-text("Group By"), .filter-panel [data-test-id*="group-by"]',

  /** Duration filter on the Product Analytics page (doc step). */
  "Duration filter (doc step)":
    '[data-test-id="cs-analytics-filter-duration"], label:has-text("Duration"), [aria-label*="Duration" i], button:has-text("Duration"), .filter-panel [data-test-id*="duration"]',

  // ── organization-bulk-task-queue ────────────────────────────────────────────

  /** Bulk Task Queue tab in the org admin left navigation (doc step). */
  "Bulk Task Queue tab (doc step)":
    '[data-test-id="orgadmin-nav-bulk-task-queue"], button[aria-label="Bulk Task Queue"], a:has-text("Bulk Task Queue"), button:has-text("Bulk Task Queue")',

  /** Ongoing tab on the Bulk Task Queue page — shows queued tasks (doc step). */
  "Ongoing tab on Bulk Task Queue page (doc step)":
    '[data-test-id="cs-bulk-task-tab-ongoing"], button:has-text("Ongoing"), a:has-text("Ongoing"), [role="tab"]:has-text("Ongoing")',

  /** Completed tab on the Bulk Task Queue page — shows finished tasks (doc step). */
  "Completed tab on Bulk Task Queue page (doc step)":
    '[data-test-id="cs-bulk-task-tab-completed"], button:has-text("Completed"), a:has-text("Completed"), [role="tab"]:has-text("Completed")',

  /** "Time" column header on the Bulk Task Queue table (doc step). */
  "Time column on Bulk Task Queue page (doc step)":
    'th:has-text("Time"), [data-test-id="cs-bulk-task-col-time"]',

  /** "Job ID" column header on the Bulk Task Queue table (doc step). */
  "Job ID column on Bulk Task Queue page (doc step)":
    'th:has-text("Job ID"), [data-test-id="cs-bulk-task-col-job-id"]',

  /** "Task Details" column header on the Bulk Task Queue table (doc step). */
  "Task Details column on Bulk Task Queue page (doc step)":
    'th:has-text("Task Details"), [data-test-id="cs-bulk-task-col-task-details"]',

  /** "Stack Name" column header on the Bulk Task Queue table (doc step). */
  "Stack Name column on Bulk Task Queue page (doc step)":
    'th:has-text("Stack Name"), [data-test-id="cs-bulk-task-col-stack-name"]',

  /** "By User" column header on the Bulk Task Queue table (doc step). */
  "By User column on Bulk Task Queue page (doc step)":
    'th:has-text("By User"), [data-test-id="cs-bulk-task-col-by-user"]',

  /** "Task Status" column header on the Bulk Task Queue table (doc step). */
  "Task Status column on Bulk Task Queue page (doc step)":
    'th:has-text("Task Status"), [data-test-id="cs-bulk-task-col-task-status"]',

  /** "Reset filters" button that clears all applied filters (doc step). */
  "Reset filters button on Bulk Task Queue page (doc step)":
    '[data-test-id="cs-bulk-task-reset-filters"], button:has-text("Reset filters"), a:has-text("Reset filters")',

  // ── manage-notifications ────────────────────────────────────────────────────

  /** Bell icon in the top right corner of the screen — opens the Notifications panel (doc step).
   * DOM varies by app: Administration wraps it in a div with data-test-id="cs-notification-bellicon";
   * CMS Dashboard's outer wrapper has no data-test-id (only the inner svg carries "cs-notification-bell-icon").
   * aria-label="Notification" is present on the clickable wrapper in both. */
  "Bell icon in top right corner (doc step)":
    '[data-test-id="cs-notification-bellicon"], [aria-label="Notification"]',

  /** Notifications panel/drawer that opens after clicking the bell icon (doc step).
   * DOM: <div class="notification__list"><div class="notification__list__header">... (BEM double-underscore, not hyphenated). */
  "Notifications panel (doc step)":
    '.notification__list',

  /** Ellipsis (three dots) icon on an individual notification row (doc step).
   * DOM: <div class="notification__group__right"><div data-test-id="cs-dropdown" class="... actions__dropdown"> (DotsThreeLargeVertical svg icon). */
  "Ellipsis on notification (doc step)":
    '.notification__group__right .actions__dropdown',

  /** "Mark as Read" option in the per-notification ellipsis menu (doc step).
   * DOM: <ul class="Dropdown__menu__list"><li data-test-id="cs-dropdown-elements">Mark as Read</li> — no role="menu", generic id, scope by text. */
  "Mark as Read option in notification menu (doc step)":
    'ul.Dropdown__menu__list li[data-test-id="cs-dropdown-elements"]:has-text("Mark as Read")',

  /** "Delete" option in the per-notification ellipsis menu (doc step).
   * DOM: same list as above, sibling <li> with text "Delete". */
  "Delete option in notification menu (doc step)":
    'ul.Dropdown__menu__list li[data-test-id="cs-dropdown-elements"]:has-text("Delete")',

  /** Three dots menu icon at the panel level for bulk notification actions (doc step).
   * DOM: <div class="notification__list__header"><div class="group">...<div data-test-id="cs-dropdown" class="... actions__dropdown"> (DotsThreeLargeVertical, distinct from per-row ellipsis). */
  "Three dots menu on Notifications panel (doc step)":
    '.notification__list__header .actions__dropdown',

  /** "Mark All Read" option in the panel-level three dots menu (doc step).
   * No DOM sample captured for this menu's open state — exact wording unconfirmed, generic fallback only. */
  "Mark All Read option in Notifications menu (doc step)":
    'ul.Dropdown__menu__list li[data-test-id="cs-dropdown-elements"]:has-text("Mark All Read")',

  /** "Delete All" option in the panel-level three dots menu (doc step).
   * No DOM sample captured for this menu's open state — exact wording unconfirmed, generic fallback only. */
  "Delete All option in Notifications menu (doc step)":
    'ul.Dropdown__menu__list li[data-test-id="cs-dropdown-elements"]:has-text("Delete All")',

  // ── monitor-organization-activities-in-audit-log ───────────────────────────

  /** Audit Log tab on the left panel under Org Admin (doc step). */
  "Audit Log tab on left panel (doc step)":
    '[data-test-id="orgadmin-nav-audit-log"], [data-test-id="cs-left-nav-audit-log"], nav a:has-text("Audit Log"), .left-panel a:has-text("Audit Log"), aside a:has-text("Audit Log"), button:has-text("Audit Log")',

  /** "Date and Time" column header on the Audit Log page (doc step). */
  "Date and Time column on Audit Log page (doc step)":
    'th:has-text("Date and Time"), [data-test-id="cs-audit-log-col-date-time"]',

  /** "User" column header on the Audit Log page (doc step). */
  "User column on Audit Log page (doc step)":
    'th:has-text("User"), [data-test-id="cs-audit-log-col-user"]',

  /** "Event" column header on the Audit Log page (doc step). */
  "Event column on Audit Log page (doc step)":
    'th:has-text("Event"), [data-test-id="cs-audit-log-col-event"]',

  /** "Application" column header on the Audit Log page (doc step). */
  "Application column on Audit Log page (doc step)":
    'th:has-text("Application"), [data-test-id="cs-audit-log-col-application"]',

  /** "Remote Address" column header on the Audit Log page (doc step). */
  "Remote Address column on Audit Log page (doc step)":
    'th:has-text("Remote Address"), [data-test-id="cs-audit-log-col-remote-address"]',

  /** Refresh icon on the Audit Log page (doc step). */
  "Refresh icon on Audit Log page (doc step)":
    '[data-test-id="cs-audit-log-refresh"], button[aria-label*="Refresh" i], button[title*="Refresh" i], .audit-log__refresh',

  /** Filter icon on the Audit Log page (doc step). */
  "Filter icon on Audit Log page (doc step)":
    '[data-test-id="cs-audit-log-filter"], button[aria-label*="Filter" i], button[title*="Filter" i], .audit-log__filter',

  /** "All Apps" dropdown on the Audit Log page (doc step). */
  "All Apps dropdown on Audit Log page (doc step)":
    '[data-test-id="cs-audit-log-filter-all-apps"], button:has-text("All Apps"), [aria-label*="All Apps" i], select[aria-label*="Apps" i]',

  /** Export icon on the Audit Log page (doc step). */
  "Export icon on Audit Log page (doc step)":
    '[data-test-id="cs-audit-log-export"], button[aria-label*="Export" i], button[title*="Export" i], .audit-log__export',

  // ── Navigation ──────────────────────────────────────────────────────────────

  /** Org Admin icon in the left navigation panel (doc step). */
  "Org Admin icon in left navigation (doc step)":
    '[data-test-id="cs-org admin-button"], button[aria-label="org admin"], [aria-label*="Org Admin" i]',

  /** Stacks tab in the org admin top navigation (doc step). */
  "Stacks tab in org admin (doc step)":
    '[data-test-id="orgadmin-nav-stacks"], button[aria-label="Stacks"], a:has-text("Stacks"), button:has-text("Stacks")',

  /** Stacks settings page heading/container — confirms the Stacks page loaded (doc step). */
  "Stacks settings page (doc step)":
    '[data-test-id="cs-page-title"], .PageTitle, h1, h2',

  // ── Stacks list table columns ────────────────────────────────────────────────

  /** "Name" column header on the Stacks list page (doc step). */
  "Name column on Stacks page (doc step)":
    'th:has-text("Name"), [data-test-id="cs-table-header-name"], [data-test-id="cs-stacks-column-name"]',

  /** "Owner" column header on the Stacks list page (doc step). */
  "Owner column on Stacks page (doc step)":
    'th:has-text("Owner"), [data-test-id="cs-table-header-owner"], [data-test-id="cs-stacks-column-owner"]',

  /** "Email Address" column header on the Stacks list page (doc step). */
  "Email Address column on Stacks page (doc step)":
    'th:has-text("Email Address"), [data-test-id="cs-table-header-email"], [data-test-id="cs-stacks-column-email"]',

  /** "Users" count column header on the Stacks list page (doc step). */
  "Users count column on Stacks page (doc step)":
    'th:has-text("Users"), [data-test-id="cs-table-header-users"], [data-test-id="cs-stacks-column-users"]',

  /** "Created At" column header on the Stacks list page (doc step). */
  "Created At column on Stacks page (doc step)":
    'th:has-text("Created At"), [data-test-id="cs-table-header-created-at"], [data-test-id="cs-stacks-column-created-at"]',

  /** "Actions" column header on the Stacks list page (doc step). */
  "Actions column on Stacks page (doc step)":
    'th:has-text("Actions"), [data-test-id="cs-table-header-actions"], [data-test-id="cs-stacks-column-actions"]',

  // ── Delete Stack via Organization Owner ─────────────────────────────────────

  /** Ellipsis (⋮) under the Actions column in a stack row (doc step). */
  "Ellipsis in Stacks Actions column (doc step)":
    '[data-test-id="cs-stacks-action-menu"], [data-test-id="cs-table-action-options"], button[aria-label*="action" i]:has(svg), .VerticalActionTooltip__trigger',

  /** "Delete" option in the stack row Actions dropdown menu (doc step). */
  "Delete option in Stacks Actions menu (doc step)":
    '[data-test-id="cs-stacks-action-delete"], .VerticalActionTooltip li:has-text("Delete"), [role="menu"] li:has-text("Delete"), li:has-text("Delete")',

  /** Confirmation dialog that appears after clicking Delete in the Actions menu (doc step). */
  "Confirm Delete dialog on Stacks page (doc step)":
    '[role="dialog"]:has-text("Delete"), [data-test-id*="delete-stack-modal"], [data-test-id="cs-modal-title-delete-stack"]',

  /** Confirm button inside the Delete stack confirmation dialog (doc step). */
  "Confirm Delete button on Stacks page (doc step)":
    '[role="dialog"] button.Button--danger:has-text("Delete"), [role="dialog"] button.Button--primary:has-text("Delete"), [role="dialog"] button:has-text("Confirm"), [data-test-id="cs-stacks-delete-confirm"]',

  // ── Delete Stack via Stack Creator/Owner ────────────────────────────────────

  /** Settings (cog) icon on the left navigation panel inside a stack (doc step). */
  "Settings icon on left navigation panel (doc step)":
    '[data-test-id="cs-left-nav-settings"], [aria-label*="Settings" i], button[aria-label="Settings"], a[href*="/settings"]',

  /** "Stack" option inside the Settings left-nav or sub-menu (doc step). */
  "Stack option in Settings (doc step)":
    '[data-test-id="cs-settings-nav-stack"], [data-test-id="cs-stack-settings"], a:has-text("Stack"), button:has-text("Stack"), li:has-text("Stack")',

  /** Stack Settings page heading — confirms the Stack Settings page loaded after clicking Stack in Settings (doc step). */
  "Stack Settings page (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Stack"), h1:has-text("Stack Settings"), h2:has-text("Stack Settings"), .PageTitle:has-text("Stack")',

  /** "Delete Stack" button on the Stack Settings page (doc step). */
  "Delete Stack button on Stack Settings page (doc step)":
    '[data-test-id="cs-stack-settings-delete"], button:has-text("Delete Stack"), a:has-text("Delete Stack")',

  /** Confirmation modal/action after clicking Delete Stack (doc step). */
  "Confirm Delete action on Stack Settings page (doc step)":
    '[role="dialog"] button.Button--danger:has-text("Delete"), [role="dialog"] button.Button--primary:has-text("Delete"), [role="dialog"] button:has-text("Confirm"), [data-test-id="cs-stack-delete-confirm"]',
};

export const INPUT_SELECTORS: Record<string, string> = {};
