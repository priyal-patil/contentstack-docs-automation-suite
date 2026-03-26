export const CLICK_SELECTORS: Record<string, string> = {
  "Profile option in dropdown (doc step)":
    '[data-test-id="cs-userprofile-click"]#profile, [data-test-id="cs-userprofile-click"]:has-text("Profile"), #UserProfile [id="profile"]',
  "Save button in profile (doc step)":
    '[data-test-id="cs-account-profile-save"], button:has-text("Save")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Profile option in dropdown (doc step)":
    '[data-test-id="cs-userprofile-click"]#profile:has-text("Profile"), [data-test-id="cs-userprofile-click"]:has-text("Profile Settings"), [data-test-id="cs-userprofile-click"]:has-text("Profile")',
  "Profile section (doc step)":
    '[data-test-id="cs-account-profile-first-name-label"], label:has-text("First Name"), .account-settings__profile',
  "Company Name input (doc step)":
    '[data-test-id="cs-account-profile-company"] input, input[name="company"], input[aria-label="company"]',
};
