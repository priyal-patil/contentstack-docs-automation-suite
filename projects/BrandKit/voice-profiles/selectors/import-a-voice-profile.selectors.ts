/**
 * Brand Kit — Import a Voice Profile (voice-profiles module).
 * DOM refs: data/dom/BrandKit/new-voice-profile-button-menu.html, import-modal.html
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Brand Kit left navigation item (doc step)":
    '[role="navigation"] [aria-label*="Brand Kit" i], [role="navigation"] button:has-text("Brand Kit"), [role="navigation"] a:has-text("Brand Kit"), aside [href*="brand-kit" i], [data-test-id*="sidebar" i] a:has-text("Brand Kit"), [data-test-id*="sidebar" i] button:has-text("Brand Kit")',

  "Brand Kit dashboard product tile (doc step)":
    '[data-test-id="cs-global-dashboard-product-tile-brand-kit"]',

  "Brand Kit Voice Profiles sidebar card (doc step)":
    '[data-test-id="brand-kit-click-btn-secondary-action-voice-profiles"]',

  "Voice Profiles landing page title (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Voice Profiles"), .PageTitle[data-test-id="cs-page-title"]:has-text("Voice Profiles")',

  "Voice Profiles list New Voice Profile (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-voice-profiles-list-add-voice-profile"], [data-test-id="cs-new-profile"], button:has-text("New Voice Profile")',

  "Voice Profiles Import menu option (doc step)":
    '[data-test-id="brand-kit-click-input-select-voice-profile-import"]',

  "Import Voice Profile Proceed button (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-upload-file-modal-proceed"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Import Voice Profile file input (import-a-voice-profile doc step)": '[data-test-id="file-input"]',
};
