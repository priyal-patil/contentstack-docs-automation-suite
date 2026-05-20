/**
 * Manage a Personalize Project — DOM: `data/dom/Personalize/personalize-projects.html`, `settings-general.html`, `settings-users.html`.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Personalize Projects landing page title (doc step)": '[data-test-id="cs-page-title"]',

  /** Top nav buttons (opened project workspace). Doc: Experiences … Settings. */
  "Personalize workspace top navigation Experiences (doc step)": '[data-test-id="personalize-nav-experiences"]',
  "Personalize workspace top navigation Audiences (doc step)": '[data-test-id="personalize-nav-audiences"]',
  "Personalize workspace top navigation Attributes (doc step)": '[data-test-id="personalize-nav-attributes"]',
  "Personalize workspace top navigation Events (doc step)": '[data-test-id="personalize-nav-events"]',
  "Personalize workspace top navigation Settings (doc step)": '[data-test-id="personalize-nav-settings"]',

  "Personalize workspace top navigation Settings button (doc step)": '[data-test-id="personalize-nav-settings"]',

  /** Settings left sidebar (doc: General / Users). */
  "Manage doc: Settings left navigation General row (doc step)":
    '[data-test-id="cs-page-layout-leftSidebar"] [data-test-id="cs-list-row"]#general, [data-test-id="cs-list-row"]#general',
  "Manage doc: Settings left navigation Users row (doc step)":
    '[data-test-id="cs-page-layout-leftSidebar"] [data-test-id="cs-list-row"]#users, [data-test-id="cs-list-row"]#users',
  "Personalize Settings left navigation Users row (doc step)":
    '[data-test-id="cs-page-layout-leftSidebar"] [data-test-id="cs-list-row"]#users, [data-test-id="cs-list-row"]#users',

  "Personalize Settings General page title (doc step)": '[data-test-id="cs-page-title"]',
  "Personalize Settings Users page title (doc step)": '[data-test-id="cs-page-title"]',

  "Manage doc: Project Details section heading (doc step)":
    'main#react-personalize h3[data-test-id="cs-heading-tag"]:has-text("Project Details"), h3[data-test-id="cs-heading-tag"]:has-text("Project Details")',
  "Manage doc: Project Details Name field label (doc step)":
    'label[data-test-id="cs-field-label"][for="name"], label[data-test-id="cs-field-label"]:has-text("Name")',
  "Manage doc: Project Details Description field label (doc step)":
    'label[data-test-id="cs-field-label"][for="description"], label[data-test-id="cs-field-label"]:has-text("Description")',
  "Manage doc: Project Details UID field label (doc step)":
    'label[data-test-id="cs-field-label"][for="projectId"], label[data-test-id="cs-field-label"]:has-text("UID")',

  "Manage doc: Users list Status column header (doc step)": '[data-test-id="cs-table-head-text--2"]',
  "Manage doc: Users list Role column header (doc step)": '[data-test-id="cs-table-head-text--3"]',

  /** Stack Connection heading + Invite (Save/Reset use dedicated verify/handlers — enabled-after-edit). */
  "Manage doc: Stack Connection section heading (doc step)":
    'main#react-personalize h3[data-test-id="cs-heading-tag"]:has-text("Stack Connection")',

  /** Users — Invite User (header). */
  "Manage doc: Users Invite User button (doc step)": '[data-testid="invite-users-button"]',
  /** Invite modal title + Invite submit (within dialog). Prefer role when multiple modals stack. */
  "Manage doc: Invite User modal title (doc step)": '[data-test-id="cs-modal-title-invite-user"]',
  "Manage doc: Invite User modal Invite submit (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-invite-user"]) [data-testid="invite-users-form-submit-button"]',
  "Manage doc: Invite User modal Email Addresses field label (doc step)":
    '[role="dialog"] label[data-test-id="cs-field-label"][for="userEmails"], [data-testid="cs-modal"] label[data-test-id="cs-field-label"][for="userEmails"]',
  "Manage doc: Invite User modal Message field label (doc step)":
    '[role="dialog"] label[data-test-id="cs-field-label"][for="invitationMessage"], [data-testid="cs-modal"] label[data-test-id="cs-field-label"][for="invitationMessage"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Personalize Settings General Name field (doc step)": '[data-testid="name-input"]',
  "Personalize Settings General Description field (doc step)": '[data-testid="description-input"]',

  /** Invite User modal optional message (`Enter message`). */
  "Personalize Settings Users Invite modal message field (doc step)": '[data-testid="invitation-message-input"]',
};
