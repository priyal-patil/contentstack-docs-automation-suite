/**
 * Brand Kit — Edit a Voice Profile (voice-profiles module).
 * Shares Voice Profile form selectors with create flow; listing/open steps reuse Brand Kit voice-profile paths.
 *
 * Voice Profiles listing row ⋯: `[data-test-id="cs-table-action-options"]` on the row (see openRowActionMenu).
 * Dropdown: `.VerticalActionTooltip[data-test-id="cs-vertical-action-tooltip"]` → actions ul `cs-vertical-action-tooltip-actions`.
 * Edit row: `[data-test-id="cs-vertical-action-tooltip-actions"] li[data-test-id="cs-ct-action-edit"]`
 * or legacy `[data-test-id="brand-kit-click-menu-voice-profiles-list-edit-voice-profile"]`.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  /** Voice Profiles listing Actions ⋯ opens this tooltip (portaled). */
  "Voice Profiles Actions dropdown tooltip (edit-a-voice-profile)":
    '[data-test-id="cs-vertical-action-tooltip"].VerticalActionTooltip, [data-test-id="cs-vertical-action-tooltip"]',

  /** Edit row action (vertical tooltip UL → CMS edit `li`; hover before click when UI requires it). */
  "Voice Profiles Actions Edit menu item (edit-a-voice-profile)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] li[data-test-id="cs-ct-action-edit"], [data-test-id="brand-kit-click-menu-voice-profiles-list-edit-voice-profile"]',
  /** Doc: left navigation panel → Brand Kit */
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

  "Generate Response in Playground button (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-voice-profile-generate-playground"]',

  "Edit Voice Profile Save button visible (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-create-voice-profile-save"], button[type="submit"][form="voice-profile-form"]',
  "Edit Voice Profile Save button (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-create-voice-profile-save"], button[type="submit"][form="voice-profile-form"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Voice Profile Name (doc step)":
    'form#voice-profile-form input[data-test-id="brand-kit-change-input-text-create-voice-profile-name"], form#voice-profile-form input[name="profileName"]',
  "Voice Profile Description (doc step)":
    'form#voice-profile-form textarea[data-testid="brand-kit-change-input-text-create-voice-profile-description"], form#voice-profile-form textarea#description-input',
};
