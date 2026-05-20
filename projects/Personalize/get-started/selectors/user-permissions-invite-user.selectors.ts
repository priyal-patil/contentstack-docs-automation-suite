/**
 * User Permissions — Invite a User (`user-permissions-invite-user.flow.json`).
 * Aligns with **`projects/Personalize/set-up-personalize/selectors/manage-personalize-project.selectors.ts`** for Settings / Users / Invite modal.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Personalize Projects landing page title (doc step)": '[data-test-id="cs-page-title"]',

  "Personalize workspace top navigation Settings (doc step)": '[data-test-id="personalize-nav-settings"]',
  "Personalize workspace top navigation Settings button (doc step)": '[data-test-id="personalize-nav-settings"]',

  "User Permissions doc: Settings left navigation Users row (doc step)":
    '[data-test-id="cs-page-layout-leftSidebar"] [data-test-id="cs-list-row"]#users, [data-test-id="cs-list-row"]#users',
  "Personalize Settings left navigation Users row (doc step)":
    '[data-test-id="cs-page-layout-leftSidebar"] [data-test-id="cs-list-row"]#users, [data-test-id="cs-list-row"]#users',

  "Personalize Settings Users page title (doc step)": '[data-test-id="cs-page-title"]',

  "Manage doc: Users Invite User button (doc step)": '[data-testid="invite-users-button"]',
  "Manage doc: Invite User modal title (doc step)": '[data-test-id="cs-modal-title-invite-user"]',
  "Manage doc: Invite User modal Invite submit (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-invite-user"]) [data-testid="invite-users-form-submit-button"]',
  "Manage doc: Invite User modal Email Addresses field label (doc step)":
    '[role="dialog"] label[data-test-id="cs-field-label"][for="userEmails"], [data-testid="cs-modal"] label[data-test-id="cs-field-label"][for="userEmails"]',
  "Manage doc: Invite User modal Message field label (doc step)":
    '[role="dialog"] label[data-test-id="cs-field-label"][for="invitationMessage"], [data-testid="cs-modal"] label[data-test-id="cs-field-label"][for="invitationMessage"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Personalize Settings Users Invite modal message field (doc step)": '[data-testid="invitation-message-input"]',
};
