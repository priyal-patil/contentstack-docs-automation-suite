/**
 * Administration — security-management module selectors.
 * DOM references: empty at time of authoring; selectors derived from naming patterns.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  // ── change-password ──────────────────────────────────────────────────────────

  /** Profile icon in the top-right corner of the dashboard (doc step). DOM: data-test-id="cs-user-profile" > label[aria-label="User Profile"][role="button"] */
  "Profile icon in top-right corner (doc step)":
    '[data-test-id="cs-user-profile"] label[aria-label="User Profile"], [data-test-id="cs-user-profile"] label[role="button"]',

  /** "Profile" option in the profile dropdown menu (doc step). DOM: label#profile[data-test-id="cs-userprofile-click"][aria-label="Profile Settings"] */
  "Profile option in dropdown (doc step)":
    'label#profile[aria-label="Profile Settings"], [data-test-id="cs-userprofile-click"][aria-label="Profile Settings"]',

  /** "Security" tab in the left navigation panel of the Profile section (doc step). DOM: data-test-id="cs-account-settings-security" */
  "Security tab in left navigation panel (doc step)":
    '[data-test-id="cs-account-settings-security"], a[href*="#/user/security"], .ListRowV2:has-text("Security")',

  /** "Reset Password" button under the Email & Password section (doc step). DOM: data-test-id="cs-account-security-change-password-reset" */
  "Reset Password button under Email and Password (doc step)":
    '[data-test-id="cs-account-security-change-password-reset"], button:has-text("Reset Password")',

  /** "Reset Password" modal/dialog title (doc step). DOM: data-test-id="cs-modal-title-reset-password" */
  "Reset Password modal title (doc step)":
    '[data-test-id="cs-modal-title-reset-password"], h3:has-text("Reset Password")',

  /** "Update" button inside the Reset Password modal (doc step). DOM: .change-password-modal-wrapper button */
  "Update button in Reset Password modal (doc step)":
    '.change-password-modal-wrapper button:has-text("Update"), [data-test-id="cs-modal-title-reset-password"] ~ * button:has-text("Update")',

  /** "Email & Password" section heading on the Security tab (doc step) — verified via click map. DOM: .account-settings__security__cpw */
  "Email and Password section (doc step)":
    '.account-settings__security__cpw [data-test-id="cs-account-security-label"], .account-settings__security__cpw label:has-text("Email & Password")',

  // ── multi-factor-authentication / reset-mfa ──────────────────────────────────

  /** "Multi-Factor Authentication" section heading on the Security tab (doc step). DOM: .account-settings__security__tfa */
  "Multi-Factor Authentication section (doc step)":
    '.account-settings__security__tfa [data-test-id="cs-account-security-label"], .account-settings__security__tfa label:has-text("Multi-Factor Authentication")',

  /** "Add" / "Enable" button under Multi-Factor Authentication section (doc step). DOM: data-test-id="cs-account-security-mfa-enable" */
  "Add or Enable MFA button (doc step)":
    '[data-test-id="cs-account-security-mfa-enable"], .account-settings__security__tfa button:has-text("Add"), .account-settings__security__tfa button:has-text("Enable")',

  /** "Continue" button inside the Set Up MFA confirmation modal (doc step). DOM: data-test-id="cs-session-warning-continue" */
  "Continue button in Set Up MFA modal (doc step)":
    '[data-test-id="cs-session-warning-continue"], .session-termination-warning-modal button:has-text("Continue")',

  /** "Next" button inside the Authenticator App (QR code) modal (doc step). DOM: data-test-id="cs-account-security-mfa-next" */
  "Next button in Authenticator App modal (doc step)":
    '[data-test-id="cs-account-security-mfa-next"], .mfa-modal-container button:has-text("Next")',

  /** "Reset MFA" button under Multi-Factor Authentication section (doc step). DOM: data-test-id="cs-account-security-mfa-reset" */
  "Reset MFA button (doc step)":
    '[data-test-id="cs-account-security-mfa-reset"], .account-settings__security__tfa button:has-text("Reset MFA")',

  /** "Continue" button after entering current password during MFA reset (doc step). */
  "Continue button after password entry (doc step)":
    '[data-test-id="cs-mfa-reset-password-continue"], .mfa-modal-container button:has-text("Continue")',

  // ── account-lockout-policy ───────────────────────────────────────────────────

  /** App Switcher button in the top navigation bar (doc step). DOM: data-test-id="app-switcher" */
  "App Switcher button (doc step)":
    '[data-test-id="app-switcher"], .app__switcher__v2',

  /** "Administration" option inside the App Switcher modal (doc step). */
  "Administration option in App Switcher (doc step)":
    '[data-test-id="app-switcher-orgadmin"], button:has-text("Administration"), [aria-label="Administration"]',

  /** "Users" tab in the Administration top navigation bar (doc step). DOM: data-test-id="orgadmin-nav-users" */
  "Users tab in Administration navigation (doc step)":
    '[data-test-id="orgadmin-nav-users"], button[aria-label="Users"]',

  /** Vertical ellipsis (three-dot) action menu button on a user row (doc step). DOM: data-test-id="cs-table-action-options" */
  "Action menu button for user row (doc step)":
    '[data-test-id="cs-table-action-options"]',

  /** "Unlock User" option in the row action dropdown menu (doc step). */
  "Unlock User option in action menu (doc step)":
    '[data-test-id="cs-unlock-user"], button:has-text("Unlock User"), li:has-text("Unlock User")',

  /** Unlock user confirmation modal (doc step). */
  "Unlock user confirmation modal (doc step)":
    '[data-test-id*="unlock-user"], h3:has-text("Unlock User")',

  /** "Continue" or "Proceed" button in the unlock user confirmation modal (doc step). */
  "Continue or Proceed button in unlock confirmation modal (doc step)":
    '[data-test-id="cs-unlock-user-confirm"], button:has-text("Continue"), button:has-text("Proceed")',

  // ── manage-preferences ───────────────────────────────────────────────────────

  /** "Profile Settings" option in the profile dropdown menu (doc step). DOM: label#profile[data-test-id="cs-userprofile-click"][aria-label="Profile Settings"] */
  "Profile Settings option in dropdown (doc step)":
    'label#profile[aria-label="Profile Settings"], [data-test-id="cs-userprofile-click"][aria-label="Profile Settings"]',

  /** "Preferences" tab in the left navigation panel of Profile settings (doc step). */
  "Preferences tab in left navigation (doc step)":
    '[data-test-id="cs-account-settings-preferences"], a[href*="#/user/preferences"], .ListRowV2:has-text("Preferences")',

  /** "Time Zone" section heading on the Preferences page (doc step). */
  "Time Zone section heading (doc step)":
    '[data-test-id="cs-account-preferences-timezone-label"], .account-settings__preferences__timezone label, label:has-text("Time Zone"), h3:has-text("Time Zone")',

  /** Timezone dropdown trigger — the immediate preceding sibling of the "Choose your time zone" hint text (doc step). DOM: no data-test-id, no ARIA role. XPath selects e114 via its hint sibling. */
  "Timezone dropdown (doc step)":
    'xpath=//*[contains(normalize-space(text()),"Choose your time zone")]/preceding-sibling::*[1]',

  /** First option in an opened dropdown list — used for both timezone (listitem/li) and language dropdowns (doc step). */
  "First option in opened dropdown (doc step)":
    'li:first-child, [role="option"]:first-child, [data-test-id*="option"]:first-child, .Select__option:first-child, li[role="option"]:first-child',

  /** Language dropdown trigger — textbox input inside the language async-select component (doc step). DOM: input[aria-label="cs-async-select-aria"] */
  "Language dropdown (doc step)":
    '[data-test-id="cs-preferences-language-dropdown"], input[aria-label="cs-async-select-aria"], [aria-label="cs-async-select-aria"]',

  /** "Save" button in the Time Zone section — first Save button on the page (doc step). DOM: data-test-id="cs-preferences-save-button" */
  "Save button in Time Zone section (doc step)":
    '[data-test-id="cs-preferences-save-button"], button:has-text("Save")',

  /** "Set Language" section heading on the Preferences page — a generic div element per DOM snapshot (doc step). */
  "Set Language section heading (doc step)":
    '[data-test-id="cs-account-preferences-language-label"], div:text-is("Set Language"), span:text-is("Set Language"), label:has-text("Set Language")',

  /** "Save" button in the Set Language section — second Save button on the page (doc step). DOM: data-test-id="cs-preferences-save-button" (second instance) */
  "Save button in Set Language section (doc step)":
    ':nth-match([data-test-id="cs-preferences-save-button"], 2), :nth-match(button:has-text("Save"), 2)',

  // ── change-personal-details ──────────────────────────────────────────────────

  /** Profile Image upload area on the Profile settings page (doc step). DOM: profile-page.html */
  "Profile Image field in Profile section (doc step)":
    '[data-test-id="cs-account-profile-image-upload"], .account-settings__profile-picture, .Avatar--pic[tabindex="0"]',

  /** "First Name" label on the Profile settings page (doc step). DOM: data-test-id="cs-account-profile-first-name-label" */
  "First Name label in Profile section (doc step)":
    '[data-test-id="cs-account-profile-first-name-label"], label[for="first_name"]',

  /** "Last Name" label on the Profile settings page (doc step). DOM: data-test-id="cs-account-profile-last-name-label" */
  "Last Name label in Profile section (doc step)":
    '[data-test-id="cs-account-profile-last-name-label"], label[for="last_name"]',

  /** "Company Name" label on the Profile settings page (doc step). DOM: data-test-id="cs-account-profile-company-label" */
  "Company Name label in Profile section (doc step)":
    '[data-test-id="cs-account-profile-company-label"], label[for="company"]',

  /** "Email" label on the Profile settings page — read-only per doc (doc step). DOM: data-test-id="cs-account-profile-email-label" */
  "Email field in Profile section (doc step)":
    '[data-test-id="cs-account-profile-email-label"], label[for="email"]',

  /** "Save" button on the Profile settings page (doc step). DOM: data-test-id="cs-account-profile-save" */
  "Save button in Profile section (doc step)":
    '[data-test-id="cs-account-profile-save"], button:has-text("Save")',

  // ── forgot-reset-password ────────────────────────────────────────────────────

  /** "Forgot Password?" link below the login fields on the login page (doc step). DOM: data-test-id="cs-forgot-password" */
  "Forgot Password link in login page (doc step)":
    '[data-test-id="cs-forgot-password"], button:has-text("Forgot Password?")',

  /** "Send Instructions" button on the Forgot Password page (doc step). DOM: data-test-id="cs-forgot-password-send-instructions" */
  "Send Instructions button (doc step)":
    '[data-test-id="cs-forgot-password-send-instructions"], button:has-text("Send Instructions")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  // ── change-password ──────────────────────────────────────────────────────────

  // ── forgot-reset-password ────────────────────────────────────────────────────

  /** Login page title on the Contentstack login page (doc step). DOM: data-test-id="cs-login-title" */
  "Login page title (doc step)":
    '[data-test-id="cs-login-title"], h1:has-text("Log in to Contentstack")',

  /** "Forgot your password?" page title after clicking the Forgot Password link (doc step). DOM: data-test-id="cs-account-form-title" */
  "Forgot Password page title (doc step)":
    '[data-test-id="cs-account-form-title"], h1:has-text("Forgot your password?")',

  /** Subtext below the Forgot Password page title (doc step). DOM: data-test-id="cs-account-form-sub-text" */
  "Forgot Password page subtext (doc step)":
    '[data-test-id="cs-account-form-sub-text"]',

  /** Email label on the Forgot Password page (doc step). DOM: data-test-id="cs-account-form-email" */
  "Forgot Password Email label (doc step)":
    '[data-test-id="cs-account-form-email"], label:has-text("Email")',

  /** Email input field on the Forgot Password page (doc step). DOM: data-test-id="cs-account-form-email-text-input" */
  "Forgot Password Email input (doc step)":
    '[data-test-id="cs-account-form-email-text-input"] input[name="email"], input[aria-label="email"]',

  // ── multi-factor-authentication / reset-mfa ──────────────────────────────────

  /** "Set Up Multi-Factor Authentication" modal title (doc step). DOM: data-test-id="cs-modal-title-set-up-multi-factor-authentication" */
  "Set Up MFA modal title (doc step)":
    '[data-test-id="cs-modal-title-set-up-multi-factor-authentication"], h3:has-text("Set Up Multi-Factor Authentication")',

  /** "Authenticator App" modal title — shown after Continue in the Set Up MFA flow (doc step). DOM: data-test-id="cs-modal-title-authenticator-app" */
  "Authenticator App modal title (doc step)":
    '[data-test-id="cs-modal-title-authenticator-app-(android,-iphone,-desktop)"], h3:has-text("Authenticator App")',

  /** "Enter verification code" label on the TOTP entry screen (doc step). DOM: .otp-verification-header */
  "Enter verification code label (doc step)":
    '.otp-verification-header h3:has-text("Enter verification code"), [data-test-id="cs-account-security-otp-input"]',

  /** 6-digit TOTP verification code input field (doc step). DOM: data-test-id="cs-account-security-otp-input" */
  "MFA verification code input (doc step)":
    '[data-test-id="cs-account-security-otp-input"] input[placeholder*="security code" i], [data-test-id="cs-account-security-otp-input"] input',

  /** Current password input field during MFA reset (doc step). */
  "Current password field for MFA reset (doc step)":
    '[data-test-id="cs-mfa-reset-current-password"] input, input[name="current_password"], input[placeholder*="current password" i]',

  // ── change-personal-details ──────────────────────────────────────────────────

  /** First Name input on the Profile settings page (doc step). DOM: data-test-id="cs-account-profile-first-name" */
  "First Name input in Profile section (doc step)":
    '[data-test-id="cs-account-profile-first-name"] input, input[name="first_name"]',

  /** Last Name input on the Profile settings page (doc step). DOM: data-test-id="cs-account-profile-last-name" */
  "Last Name input in Profile section (doc step)":
    '[data-test-id="cs-account-profile-last-name"] input, input[name="last_name"]',

  /** Company Name input on the Profile settings page (doc step). DOM: data-test-id="cs-account-profile-company" */
  "Company Name input in Profile section (doc step)":
    '[data-test-id="cs-account-profile-company"] input, input[name="company"]',

  // ── change-password ──────────────────────────────────────────────────────────

  /** "Old Password" input field in the Reset Password modal (doc step). DOM: input[name="old_password"] */
  "Old Password field in Reset Password modal (doc step)":
    'input[name="old_password"], input[aria-label="old_password"], input[placeholder*="current password" i]',

  /** "New Password" input field in the Reset Password modal (doc step). DOM: input[name="password"] */
  "New Password field in Reset Password modal (doc step)":
    'input[name="password"], input[aria-label="password"], input[placeholder*="new password" i]',

  /** "Confirm Password" input field in the Reset Password modal (doc step). DOM: input[name="password_confirmation"] */
  "Confirm Password field in Reset Password modal (doc step)":
    'input[name="password_confirmation"], input[aria-label="password_confirmation"], input[placeholder*="Re-enter new password" i]',
};
