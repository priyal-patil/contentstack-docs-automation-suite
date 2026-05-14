/**
 * Brand Kit — Create a Voice Profile (voice-profiles module).
 * DOM refs: data/dom/BrandKit/voice-profile-listingpage.html, create-voice-profile-page.html,
 * create-voice-profiles-playground.html
 */

export const CLICK_SELECTORS: Record<string, string> = {
  /** Doc: left navigation panel → Brand Kit */
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

  "Voice Profile Name label (doc step)":
    'form#voice-profile-form label.FieldLabel:has-text("Voice Profile Name")',
  "Communication Style Mixer section label (doc step)":
    'form#voice-profile-form label.FieldLabel:has-text("Communication Style Mixer")',
  "Formality Level slider label (doc step)":
    'form#voice-profile-form label[data-test-id="cs-field-label"]:has-text("Formality Level")',
  "Tone Of Voice slider label (doc step)":
    'form#voice-profile-form label[data-test-id="cs-field-label"]:has-text("Tone Of Voice")',
  "Humor Level slider label (doc step)":
    'form#voice-profile-form label[data-test-id="cs-field-label"]:has-text("Humor Level")',
  "Language Complexity Level slider label (doc step)":
    'form#voice-profile-form label[data-test-id="cs-field-label"]:has-text("Language Complexity Level")',
  "Custom Details section label (doc step)":
    'form#voice-profile-form label.FieldLabel:has-text("Custom Details")',
  "Insights label (doc step)":
    'form#voice-profile-form label.FieldLabel:has-text("Insights")',
  "Sample Content label (doc step)":
    'form#voice-profile-form label.FieldLabel:has-text("Sample Content")',
  "Playground section label (doc step)":
    'form#voice-profile-form label.FieldLabel:has-text("Playground")',
  "Enable Knowledge Vault label (doc step)":
    'form#voice-profile-form label.FieldLabel:has-text("Enable Knowledge Vault"), form#voice-profile-form label.kv-field-label-legacy:has-text("Enable Knowledge Vault")',
  "Provide Prompt label (doc step)":
    'form#voice-profile-form label.FieldLabel:has-text("Provide Prompt")',
  "Generate Response in Playground button (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-voice-profile-generate-playground"]',

  "Enable Knowledge Vault toggle click (doc step)":
    '[data-test-id="brand-kit-change-menu-voice-profile-form-toggle-playground-knowledge-vault"] label.toggle-switch, [data-test-id="brand-kit-change-menu-voice-profile-form-toggle-playground-knowledge-vault"] input[type="checkbox"]',

  "Clear Prompt button (doc step)":
    '[data-test-id="brand-kit-click-btn-secondary-action-voice-profile-clear-prompt"]',

  "Create Voice Profile Save (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-create-voice-profile-save"], button[type="submit"][form="voice-profile-form"]',

  /** Doc: Information icon on the right-side navigation panel after save */
  "Voice Profile Information icon right-side navigation (doc step)":
    '[data-test-id="brand-kit-click-menu-edit-voice-profile-toggle-information-tab"]',

  /** Doc: Playground content on the right — title visible after generation opens panel */
  "Playground panel title right sidebar (doc step)":
    '.profile-side-bar-window .playground-title, .SidebarWindow__content .playground-title, [data-testid="voice-profile-side-bar-window"] .playground-title',

  /** Doc: hover Playground title in right panel to surface Regenerate / Copy (create-voice-profiles-playground.html) */
  "Playground sidebar panel title hover target (doc step)":
    '.SidebarWindow__content .playground-title, .profile-side-bar-window .playground-title',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Voice Profile Name (doc step)":
    'form#voice-profile-form input[data-test-id="brand-kit-change-input-text-create-voice-profile-name"], form#voice-profile-form input[name="profileName"]',
  "Voice Profile Description (doc step)":
    'form#voice-profile-form textarea[data-testid="brand-kit-change-input-text-create-voice-profile-description"], form#voice-profile-form textarea#description-input',
  "Voice Profile Insights (doc step)":
    'form#voice-profile-form textarea[data-test-id="brand-kit-change-input-text-create-voice-profile-insights"]',
  "Voice Profile Sample Content (doc step)":
    'form#voice-profile-form textarea[data-test-id="brand-kit-change-input-text-create-voice-profile-sample-content"]',
  "Voice Profile Provide Prompt (doc step)":
    'form#voice-profile-form textarea[data-test-id="brand-kit-change-input-text-voice-profile-playground-prompt"]',
};
