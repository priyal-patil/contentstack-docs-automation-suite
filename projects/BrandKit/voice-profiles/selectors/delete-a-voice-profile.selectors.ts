/**
 * Brand Kit — Delete a Voice Profile (voice-profiles module).
 * DOM refs: data/dom/BrandKit/delete-voice-profiles.html, voice-profile-listingpage.html
 */

export const CLICK_SELECTORS: Record<string, string> = {
  /** Voice Profiles listing Actions ⋯ opens this tooltip (portaled). */
  "Voice Profiles Actions dropdown tooltip (delete-a-voice-profile)":
    '[data-test-id="cs-vertical-action-tooltip"].VerticalActionTooltip, [data-test-id="cs-vertical-action-tooltip"]',

  /** Row action that opens the Delete Voice Profile confirmation modal (codegen: prefer open-delete-voice-profile-modal). */
  "Voice Profiles Actions Delete menu item (delete-a-voice-profile)":
    '[data-test-id="brand-kit-click-menu-voice-profiles-list-open-delete-voice-profile-modal"], [data-test-id="brand-kit-click-menu-voice-profiles-list-delete-voice-profile"]',

  "Brand Kit left navigation item (doc step)":
    '[role="navigation"] [aria-label*="Brand Kit" i], [role="navigation"] button:has-text("Brand Kit"), [role="navigation"] a:has-text("Brand Kit"), aside [href*="brand-kit" i], [data-test-id*="sidebar" i] a:has-text("Brand Kit"), [data-test-id*="sidebar" i] button:has-text("Brand Kit")',

  "Brand Kit dashboard product tile (doc step)":
    '[data-test-id="cs-global-dashboard-product-tile-brand-kit"]',

  "Brand Kit Voice Profiles sidebar card (doc step)":
    '[data-test-id="brand-kit-click-btn-secondary-action-voice-profiles"]',

  "Voice Profiles landing page title (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Voice Profiles"), .PageTitle[data-test-id="cs-page-title"]:has-text("Voice Profiles")',

  "Voice Profiles listing Actions column header (doc step)":
    'table thead [role="columnheader"]:has-text("Actions"), table [role="columnheader"]:has-text("Actions")',

  "Delete Voice Profile modal confirm Delete (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-voice-profile-delete-modal-delete"]',
};

export const INPUT_SELECTORS: Record<string, string> = {};
