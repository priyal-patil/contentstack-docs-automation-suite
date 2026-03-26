export const CLICK_SELECTORS: Record<string, string> = {
  "User Profile icon (doc step)":
    '[data-test-id="cs-user-profile"] [aria-label*="User Profile" i], [data-test-id="cs-user-profile"] label[role="button"], button[aria-label*="User Profile" i]',
  "Profile Settings option (doc step)":
    '[data-test-id="cs-userprofile-click"]#profile, [data-test-id="cs-userprofile-click"]:has-text("Profile"), #UserProfile [id="profile"]',
  "Security tab in profile left nav (doc step)":
    '[data-test-id="cs-account-settings-security"], a[href*="#/user/security"], .ListRowV2:has-text("Security")',
  "Reset Password button (doc step)":
    '[data-test-id="cs-account-security-change-password-reset"], button:has-text("Reset Password")',
  "Update password button in reset modal (doc step)":
    '.change-password-modal-wrapper button:has-text("Update"), [data-test-id="cs-modal-title-reset-password"] ~ * button:has-text("Update")',
  "Forgot Password link in login page (doc step)":
    '[data-test-id="cs-forgot-password"], button:has-text("Forgot Password?")',
  "Send Instructions button (doc step)":
    '[data-test-id="cs-forgot-password-send-instructions"], button:has-text("Send Instructions")',
  "MFA Enable button (doc step)":
    '[data-test-id="cs-account-security-mfa-enable"], button:has-text("Add"), button:has-text("Enable")',
  "Terminate Other Sessions button (doc step)":
    '[data-test-id="cs-account-security-terminate-sessions"], button:has-text("Terminate Other Sessions")',
  "Set Up MFA modal Continue button (doc step)":
    '[data-test-id="cs-session-warning-continue"], .session-termination-warning-modal button:has-text("Continue")',
  "Authenticator App modal Next button (doc step)":
    '[data-test-id="cs-account-security-mfa-next"], .mfa-modal-container button:has-text("Next")',
  "Authenticator App modal Verify button (doc step)":
    '[data-test-id="cs-account-security-mfa-verify"], .mfa-modal-container button:has-text("Verify")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Profile Settings option label (doc step)":
    '[data-test-id="cs-userprofile-click"]#profile:has-text("Profile Settings"), [data-test-id="cs-userprofile-click"]:has-text("Profile Settings")',
  "Security tab label (doc step)":
    '[data-test-id="cs-account-settings-security"], .ListRowV2:has-text("Security")',
  "Email and Password section label (doc step)":
    '.account-settings__security__cpw [data-test-id="cs-account-security-label"], .account-settings__security__cpw label:has-text("Email & Password")',
  "Reset Password modal title (doc step)":
    '[data-test-id="cs-modal-title-reset-password"], h3:has-text("Reset Password")',
  "Old Password label (doc step)":
    'label[for="old_password"], [data-test-id="cs-field-label"]:has-text("Old Password")',
  "New Password label (doc step)":
    'label[for="password"], [data-test-id="cs-field-label"]:has-text("New Password")',
  "Confirm Password label (doc step)":
    'label[for="password_confirmation"], [data-test-id="cs-field-label"]:has-text("Confirm Password")',
  "Old Password input (doc step)":
    'input[name="old_password"], input[aria-label="old_password"], input[placeholder*="current password" i]',
  "New Password input (doc step)":
    'input[name="password"], input[aria-label="password"], input[placeholder*="new password" i]',
  "Confirm Password input (doc step)":
    'input[name="password_confirmation"], input[aria-label="password_confirmation"], input[placeholder*="Re-enter new password" i]',
  "Login page title (doc step)":
    '[data-test-id="cs-login-title"], h1:has-text("Log in to Contentstack")',
  "Forgot Password page title (doc step)":
    '[data-test-id="cs-account-form-title"], h1:has-text("Forgot your password?")',
  "Forgot Password page subtext (doc step)":
    '[data-test-id="cs-account-form-sub-text"]',
  "Forgot Password Email label (doc step)":
    '[data-test-id="cs-account-form-email"], label:has-text("Email")',
  "Forgot Password Email input (doc step)":
    '[data-test-id="cs-account-form-email-text-input"] input[name="email"], input[aria-label="email"]',
  "Multi-Factor Authentication section label (doc step)":
    '.account-settings__security__tfa [data-test-id="cs-account-security-label"], .account-settings__security__tfa label:has-text("Multi-Factor Authentication")',
  "Set Up MFA modal title (doc step)":
    '[data-test-id="cs-modal-title-set-up-multi-factor-authentication"], h3:has-text("Set Up Multi-Factor Authentication")',
  "Authenticator App modal title (doc step)":
    '[data-test-id="cs-modal-title-authenticator-app-(android,-iphone,-desktop)"], h3:has-text("Authenticator App")',
  "Enter verification code label (doc step)":
    '.otp-verification-header h3:has-text("Enter verification code"), [data-test-id="cs-account-security-otp-input"]',
  "MFA verification code input (doc step)":
    '[data-test-id="cs-account-security-otp-input"] input[placeholder*="security code" i], [data-test-id="cs-account-security-otp-input"] input',
  "MFA Add or Enable button (doc step)":
    '[data-test-id="cs-account-security-mfa-enable"], .account-settings__security__tfa button:has-text("Add"), .account-settings__security__tfa button:has-text("Enable")',
  "Session Management section label (doc step)":
    '[data-test-id="cs-account-security-label"]:has-text("Session Management"), .account-settings__security label:has-text("Session Management"), .security-container [data-test-id="cs-account-security-label"]',
};
