/**
 * Administration — single-sign-on module selectors.
 * DOM references: empty at time of authoring; selectors derived from naming patterns.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  // ── Navigation ──────────────────────────────────────────────────────────────

  /** Org Admin icon in the left navigation panel (doc step). */
  "Org Admin icon in left navigation (doc step)":
    '[data-test-id="cs-org admin-button"], button[aria-label="org admin"], [aria-label*="Org Admin" i]',

  // ── set-up-sso-in-contentstack ───────────────────────────────────────────────

  /** Single Sign-On menu item in the Org Admin navigation (doc step). */
  "Single Sign-On menu item in Org Admin (doc step)":
    '[data-test-id="orgadmin-nav-sso"], [data-test-id="orgadmin-nav-single-sign-on"], a:has-text("Single Sign-On"), button:has-text("Single Sign-On"), [aria-label="Single Sign-On"]',

  /** "Create" button on the SSO settings page for generating the ACS URL (doc step). */
  "Create button on SSO page (doc step)":
    '[data-test-id="cs-sso-create"], button:has-text("Create"), [aria-label="Create"]',

  /** Assertion Consumer Service (ACS) URL label/section generated after clicking Create (doc step). */
  "ACS URL on SSO page (doc step)":
    '[data-test-id="cs-sso-acs-url"], label:has-text("Assertion Consumer Service"), h3:has-text("Assertion Consumer Service"), [aria-label*="ACS" i], .sso-config [data-test-id*="acs"]',

  /** Entity ID label/section generated after clicking Create (doc step). */
  "Entity ID on SSO page (doc step)":
    '[data-test-id="cs-sso-entity-id"], label:has-text("Entity ID"), h3:has-text("Entity ID"), [aria-label*="Entity ID" i]',

  /** Attributes label/section generated after clicking Create (doc step). */
  "Attributes section on SSO page (doc step)":
    '[data-test-id="cs-sso-attributes"], label:has-text("Attributes"), h3:has-text("Attributes"), [aria-label*="Attributes" i]',

  /** NameID Format label/section generated after clicking Create (doc step). */
  "NameID Format on SSO page (doc step)":
    '[data-test-id="cs-sso-nameid-format"], label:has-text("NameID Format"), h3:has-text("NameID Format"), [aria-label*="NameID" i]',

  /** "IdP Configuration" accordion/section heading on the SSO settings page (doc step). */
  "IdP Configuration section on SSO page (doc step)":
    '[data-test-id="cs-sso-idp-config-section"], h2:has-text("IdP Configuration"), h3:has-text("IdP Configuration"), button:has-text("IdP Configuration"), [aria-label*="IdP Configuration" i]',

  /** "Single Sign-On URL" label inside the IdP Configuration section (doc step). */
  "Single Sign-On URL field in IdP Configuration (doc step)":
    '[data-test-id="cs-sso-idp-sso-url-label"], label:has-text("Single Sign-On URL"), .FormField__label:has-text("Single Sign-On URL")',

  /** "Certificate" label/upload field inside the IdP Configuration section (doc step). */
  "Certificate field in IdP Configuration (doc step)":
    '[data-test-id="cs-sso-certificate"], label:has-text("Certificate"), .FormField__label:has-text("Certificate"), [aria-label*="Certificate" i]',

  /** "Signature Algorithm" dropdown inside the IdP Configuration section (doc step). */
  "Signature Algorithm field in IdP Configuration (doc step)":
    '[data-test-id="cs-sso-signature-algorithm"], label:has-text("Signature Algorithm"), select[aria-label*="Signature Algorithm" i], button:has-text("Signature Algorithm"), .FormField__label:has-text("Signature Algorithm")',

  /** "Enable SAML Encryption" checkbox inside the IdP Configuration section (doc step). */
  "Enable SAML Encryption checkbox on SSO page (doc step)":
    '[data-test-id="cs-sso-enable-saml-encryption"], label:has-text("Enable SAML Encryption"), input[type="checkbox"][aria-label*="SAML Encryption" i], [aria-label*="Enable SAML Encryption" i]',

  /** "Save" button in the IdP Configuration section (doc step). */
  "Save button in IdP Configuration (doc step)":
    '[data-test-id="cs-sso-idp-config-save"], .sso-idp-config button:has-text("Save"), button[aria-label="Save"]',

  /** "User Management" accordion/section heading on the SSO settings page (doc step). */
  "User Management section on SSO page (doc step)":
    '[data-test-id="cs-sso-user-management-section"], h2:has-text("User Management"), h3:has-text("User Management"), button:has-text("User Management"), [aria-label*="User Management" i]',

  /** "Strict Mode" toggle label in the User Management section (doc step). */
  "Strict Mode toggle on SSO page (doc step)":
    '[data-test-id="cs-sso-strict-mode"], label:has-text("Strict Mode"), .FormField__label:has-text("Strict Mode"), [aria-label*="Strict Mode" i]',

  /** "User Email Whitelists" label/field in the User Management section (doc step). */
  "User Email Whitelists field on SSO page (doc step)":
    '[data-test-id="cs-sso-email-whitelist"], label:has-text("User Email Whitelists"), .FormField__label:has-text("User Email Whitelists"), [aria-label*="Email Whitelist" i]',

  /** "Session Time-Out" label/field in the User Management section (doc step). */
  "Session Time-Out field on SSO page (doc step)":
    '[data-test-id="cs-sso-session-timeout"], label:has-text("Session Time-Out"), .FormField__label:has-text("Session Time-Out"), [aria-label*="Session Time" i]',

  /** "Advanced Settings" accordion/section in the User Management section (doc step). */
  "Advanced Settings section on SSO page (doc step)":
    '[data-test-id="cs-sso-advanced-settings"], button:has-text("Advanced Settings"), h3:has-text("Advanced Settings"), [aria-label*="Advanced Settings" i]',

  /** "+ ADD ROLE MAPPING" link inside Advanced Settings (doc step). */
  "+ ADD ROLE MAPPING link on SSO page (doc step)":
    '[data-test-id="cs-sso-add-role-mapping"], a:has-text("+ ADD ROLE MAPPING"), button:has-text("+ ADD ROLE MAPPING"), button:has-text("ADD ROLE MAPPING")',

  /** "Organization Role" dropdown in the role mapping form (doc step). */
  "Organization Role field on SSO page (doc step)":
    '[data-test-id="cs-sso-org-role"], label:has-text("Organization Role"), select[aria-label*="Organization Role" i], button:has-text("Organization Role"), .FormField__label:has-text("Organization Role")',

  /** "Stack Roles" field/dropdown in the role mapping form (doc step). */
  "Stack Roles field on SSO page (doc step)":
    '[data-test-id="cs-sso-stack-roles"], label:has-text("Stack Roles"), .FormField__label:has-text("Stack Roles"), [aria-label*="Stack Roles" i]',

  /** "Role Delimiter" label/field in Advanced Settings (doc step). */
  "Role Delimiter field on SSO page (doc step)":
    '[data-test-id="cs-sso-role-delimiter"], label:has-text("Role Delimiter"), .FormField__label:has-text("Role Delimiter"), [aria-label*="Role Delimiter" i]',

  /** "Enable IdP Role Mapping" checkbox in Advanced Settings (doc step). */
  "Enable IdP Role Mapping checkbox on SSO page (doc step)":
    '[data-test-id="cs-sso-enable-idp-role-mapping"], label:has-text("Enable IdP Role Mapping"), input[type="checkbox"][aria-label*="IdP Role Mapping" i], [aria-label*="Enable IdP Role Mapping" i]',

  /** "Test SSO" button on the SSO settings page (doc step). */
  "Test SSO button on SSO page (doc step)":
    '[data-test-id="cs-sso-test"], button:has-text("Test SSO"), [aria-label="Test SSO"]',

  /** "Enable SSO" button on the SSO settings page (doc step). */
  "Enable SSO button on SSO page (doc step)":
    '[data-test-id="cs-sso-enable"], button:has-text("Enable SSO"), [aria-label="Enable SSO"]',

  /** SSO One-click URL label/field that appears after SSO is enabled (doc step). */
  "SSO One-click URL on SSO page (doc step)":
    '[data-test-id="cs-sso-one-click-url"], label:has-text("SSO One-click URL"), h3:has-text("SSO One-click URL"), [aria-label*="SSO One-click URL" i]',

  /** "Disable" button that replaces "Enable SSO" after SSO is enabled (doc step). */
  "Disable SSO button on SSO page (doc step)":
    '[data-test-id="cs-sso-disable"], button:has-text("Disable"), [aria-label*="Disable SSO" i], button:has-text("Disable SSO")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  // ── set-up-sso-in-contentstack ───────────────────────────────────────────────

  /** SSO name input field where the organization enters their SSO identifier (doc step). */
  "SSO name input field (doc step)":
    '[data-test-id="cs-sso-name-input"], input[name="sso_name"], input[placeholder*="SSO name" i], input[aria-label*="SSO name" i]',

  /** IdP Single Sign-On URL input inside the IdP Configuration section (doc step). */
  "Single Sign-On URL field in IdP Configuration (doc step)":
    '[data-test-id="cs-sso-idp-sso-url-input"], input[name="sso_url"], input[placeholder*="Single Sign-On URL" i], input[aria-label*="Single Sign-On URL" i]',

  /** IdP Role Identifier text input in the role mapping form (doc step). */
  "IdP Role Identifier input on SSO page (doc step)":
    '[data-test-id="cs-sso-idp-role-identifier"], input[name="idp_role_identifier"], input[placeholder*="role identifier" i], input[aria-label*="IdP Role Identifier" i]',
};
