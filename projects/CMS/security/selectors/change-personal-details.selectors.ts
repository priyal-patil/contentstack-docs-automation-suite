export const CLICK_SELECTORS: Record<string, string> = {
  "Profile option in dropdown (doc step)":
    '[data-test-id="cs-userprofile-click"]#profile, [data-test-id="cs-userprofile-click"]:has-text("Profile"), #UserProfile [id="profile"]',
  "Save button in profile (doc step)":
    '[data-test-id="cs-account-profile-save"], button:has-text("Save")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Profile option in dropdown (doc step)":
    '[data-test-id="cs-userprofile-click"]#profile:has-text("Profile"), [data-test-id="cs-userprofile-click"]:has-text("Profile Settings"), [data-test-id="cs-userprofile-click"]:has-text("Profile")',
  "Profile Image (doc step)":
    '[data-test-id="cs-account-profile-image"], [data-test-id="cs-account-profile-avatar"], .account-settings__profile__image img, .account-settings__profile .UserAvatar, .account-profile__image',
  "Profile section (doc step)":
    '[data-test-id="cs-account-profile-first-name-label"], label:has-text("First Name"), .account-settings__profile',
  "Last Name (doc step)":
    '[data-test-id="cs-account-profile-last-name-label"], label:has-text("Last Name"), [data-test-id="cs-field-label"]:has-text("Last Name"), label[for*="last_name"]',
  "Company Name (doc step)":
    '[data-test-id="cs-account-profile-company-label"], label:has-text("Company Name"), [data-test-id="cs-field-label"]:has-text("Company Name"), label[for*="company"]',
  "Company Name input (doc step)":
    '[data-test-id="cs-account-profile-company"] input, input[name="company"], input[aria-label="company"]',
  "Save button in profile (doc step)":
    '[data-test-id="cs-account-profile-save"], button:has-text("Save")',
};
