/**
 * Brand Kit — Get Started with Brand Kit.
 * DOM refs: data/dom/BrandKit/*.html
 * CMS segment mirrors projects/CMS/content-models/selectors/create-content-type.selectors.ts
 * and projects/CMS/json-rich-text-editor/selectors/module.selectors.ts (entries slice).
 */

export const CLICK_SELECTORS: Record<string, string> = {
  /** Verify anchors */
  "Create Brand Kit modal title (doc step)":
    '[data-test-id="cs-modal-title-create-brand-kit"], h3[title="Create Brand Kit"], [role="dialog"]:has-text("Create Brand Kit")',
  "Create Brand Kit modal Brand Kit Name label (doc step)":
    '[data-testid="new-brand-kit-modal"] label[data-test-id="cs-field-label"]:has-text("Brand Kit Name"), .new-brand-kit-modal label:has-text("Brand Kit Name")',
  "Create Brand Kit modal Description label (doc step)":
    '[data-testid="new-brand-kit-modal"] label:has-text("Description")',
  "Create Brand Kit modal Select Stack(s) label (doc step)":
    '[data-testid="new-brand-kit-modal"] label:has-text("Select Stack")',
  "Create Brand Kit modal Create Brand Kit button (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-create-modal-save"]',

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
  "Provide Prompt label (doc step)":
    'form#voice-profile-form label.FieldLabel:has-text("Provide Prompt")',
  "Generate Response in Playground button (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-voice-profile-generate-playground"]',

  "Create New Content Type modal (doc step)":
    '[role="dialog"]:has-text("Create New Content Type"), [data-test-id="cs-modal-title"]:has-text("Create New Content Type"), [data-testid="cs-modal"][role="dialog"]',
  "Content Type Builder (doc step)":
    '.contenttype-builder [data-test-id="cs-ct-title-truncate"], .contenttype-builder .ContentTypeField__display-name:has-text("Title"), .ContentTypeField [data-test-id="cs-ct-title-truncate"]',

  "Entries page (doc step)":
    '[data-test-id="entries_page_header_title"], [data-test-id="cs-page-title"]:has-text("Entries"), .page-header-title:has-text("Entries")',
  /** Doc: left navigation panel → Brand Kit icon */
  "Brand Kit left navigation item (doc step)":
    '[role="navigation"] [aria-label*="Brand Kit" i], [role="navigation"] button:has-text("Brand Kit"), [role="navigation"] a:has-text("Brand Kit"), aside [href*="brand-kit" i], [data-test-id*="sidebar" i] a:has-text("Brand Kit"), [data-test-id*="sidebar" i] button:has-text("Brand Kit")',

  /** Fallback when Brand Kit is not in left nav: org dashboard product tile (data/dom/BrandKit/brandkit-dashboard-card.html) */
  "Brand Kit dashboard product tile (doc step)":
    '[data-test-id="cs-global-dashboard-product-tile-brand-kit"]',

  "Brand Kits page New Brand Kit primary (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-homepage-add-brand-kit"], button:has-text("New Brand Kit")',

  /** Primary modal submit — doc "click … Create Brand Kit" (button). */
  "Create Brand Kit modal primary Create Brand Kit button (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-create-modal-save"], button:has-text("Create Brand Kit")',

  "Brand Kit Voice Profiles sidebar card (doc step)":
    '[data-test-id="brand-kit-click-btn-secondary-action-voice-profiles"]',

  "Voice Profiles list New Voice Profile (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-voice-profiles-list-add-voice-profile"], button:has-text("New Voice Profile")',

  "Create Voice Profile Save (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-create-voice-profile-save"], button[type="submit"][form="voice-profile-form"]',

  // --- CMS (doc § Use Brand Kit in the AI Assistant app) ---
  "Content Models (doc step)":
    '[data-test-id="cms-nav-content-models"], a:has-text("Content Models"), button:has-text("Content Models")',
  "+ New Content Type (doc step)":
    '[data-test-id="cs-cb-new-ct"], button:has-text("New Content Type"), button[aria-label="Create New Content Type"]',
  "Create New (doc step)":
    '[data-test-id="cs-cb-new-ct-child"], button:has-text("Create New"), [role="menuitem"]:has-text("Create New")',
  "Use Prebuilt (doc step)":
    '[data-test-id="cs-cb-new-prebuilt-ct-child"], li:has-text("Use Prebuilt"), [role="menuitem"]:has-text("Use Prebuilt")',
  "Save and proceed (doc step)":
    '[data-test-id="cs-ct-create-modal-submit"], [data-testid="cs-modal"] button:has-text("Save and proceed"), [data-testid="cs-modal"] button:has-text("Create"), button:has-text("Save and proceed")',
  "Insert a field (doc step)":
    '[data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"], [data-test-id="cs-field-type-selector"] .FieldTypeSelector__action-bar svg[name="PurpleAdd"], button:has(svg[name="PurpleAdd"])',
  "Single Line Textbox (doc step)":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-single_line"]), div.FieldTypeSelector__field-tile:has-text("Single Line Textbox"), [data-test-id="cs-ct-select-field-single_line"]',
  "Save (doc step)":
    '[data-test-id="cs-ct-save"], [data-test-id="cs-entry-save"], button:has-text("Save")',
  "Save and Close (doc step)": '[data-test-id="cs-ct-save-close"], button:has-text("Save and Close")',

  "Single (Type doc step)":
    '[data-testid="cs-modal"] label:has-text("Single"), [data-testid="cs-modal"][role="dialog"] label:has-text("Single")',
  "Multiple (Type doc step)":
    '[data-testid="cs-modal"] label:has-text("Multiple"), [data-testid="cs-modal"][role="dialog"] label:has-text("Multiple")',

  "Entries (doc step)":
    'a[href*="/#!/stack/"][href*="/entries"], button[data-test-id="cms-nav-entries"], [data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "New Entry (doc step)":
    'button[data-test-id="cs-new-entry-all-entry"], button[aria-label="Create New Entry"], button:has-text("New Entry"), button:has-text("+ New Entry")',
  "Proceed (Select Content Type modal) (doc step)":
    '[data-test-id="cs-new-entry-single-proceed"], button[aria-label="Proceed"]:not([disabled]), [role="dialog"]:has-text("Select Content Type") button[aria-label="Proceed"], [role="dialog"] button:has-text("Proceed"):not([disabled])',

  /** Entry editor primary Save (scoped — avoids CT builder Save during CMS segment) */
  "Entry editor Save button (doc step)": '[data-test-id="cs-entry-save"]',

  "Publish (bottom-right) (doc step)":
    'button[data-test-id="cs-entry-publish"], button[aria-label="Publish Entry"], button:has-text("Publish")',
  "First Environment option (doc step)":
    '[data-test-id="cs-entries-publish-select-environment-element"]:not(.Checkbox--state-disabled), [data-test-id="cs-entries-publish-select-environment-element"]',
  "First Language option (doc step)":
    '[data-test-id="cs-entries-publish-select-lang-element"]:not(.Checkbox--state-disabled), [data-test-id="cs-entries-publish-select-lang-element"]',
  "Variants dropdown (if available) (doc step)":
    '[data-test-id*="variant" i], [aria-label*="variant" i]',
  "Now (doc step)":
    '[data-test-id="cs-entries-publish-select-now"], [role="dialog"] label:has-text("Now"), [role="dialog"] [role="radio"]:has-text("Now")',
  "Send (doc step)":
    'button[data-test-id="cs-single-entry-publish"], [role="dialog"] button:has-text("Send")',

  /** Doc: AI Assistant app icon in Field Modifier Location */
  "AI Assistant field modifier icon (doc step)":
    '[data-test-id="field-location__icon"][role="button"], span[data-test-id="field-location__icon"] img[alt="app icon"], [data-test-id="field-location__icon"]',

  /** AI Assistant right nav — Brand Kit / Voice Profile async selects (entries-AI-assistant-right-nav.html) */
  "Brand Kit AI Assistant right nav Brand Kits dropdown label (doc step)":
    '#ai-assistant-dropdown div.brand-kit-profile > div[data-test-id="cs-select-async"]:nth-child(1) label[data-test-id="cs-field-label"]',
  "Brand Kit AI Assistant right nav Voice Profiles dropdown label (doc step)":
    '#ai-assistant-dropdown div.brand-kit-profile > div[data-test-id="cs-select-async"]:nth-child(2) label[data-test-id="cs-field-label"]',
  /** Knowledge Vault — doc label (verify); toggle click uses dedicated handler in actionRules */
  "Brand Kit AI Assistant right nav Knowledge Vault label (doc step)":
    '#ai-assistant-dropdown label:has-text("Knowledge Vault")',

  /** AI Assistant right nav — Action Items (DOM: entries-ai-assistant-rightnav-actionitems.html) */
  "Brand Kit AI Assistant Action Items Accept (doc step)":
    '[data-test-id="ai-asst-change-input-select-action-items-accept"]',
  "Brand Kit AI Assistant Action Items Try Again (doc step)":
    '[data-test-id="ai-asst-change-input-select-action-items-try-again"]',
  "Brand Kit AI Assistant Action Items Cancel (doc step)":
    '[data-test-id="ai-asst-submit-input-select-action-items-cancel"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Brand Kit Name (doc step)":
    '[data-testid="new-brand-kit-modal"] input[name="name"], .new-brand-kit-modal input[name="name"]',
  "Brand Kit Description (doc step)":
    '[data-testid="new-brand-kit-modal"] textarea[name="description"], .new-brand-kit-modal textarea[name="description"]',

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

  "Name (doc step)":
    '[data-testid="cs-modal"][role="dialog"] input[name="name"], [data-test-id="cs-ct-create-modal-ct-name-input"] input',
  "Description (doc step)":
    '[data-test-id="cs-ct-modal-ct-description-input"] textarea, [data-testid="cs-modal"] textarea[name="description"]',
  "Type (doc step)":
    '[data-testid="cs-modal"][role="dialog"] [role="radio"], [data-testid="cs-modal"] label:has-text("Single"), [data-testid="cs-modal"] label:has-text("Multiple")',

  "Entry Title (doc step)":
    '[data-test-id="cs-title-input"] input, input[name="title"], input[placeholder*="title" i]',

  /** AI Assistant dropdown pad — Replace field content / prompt textarea */
  "Brand Kit AI Assistant right nav: AI Assistant prompt field (doc step)":
    '#ai-assistant-dropdown textarea.Textarea__textarea, #ai-assistant-dropdown [data-test-id="cs-text-area"] textarea',
};
