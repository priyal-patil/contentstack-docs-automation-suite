export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")',
  "Settings (doc step)":
    '[data-test-id="cms-nav-settings"], button:has-text("Settings"), a:has-text("Settings"), [role="menuitem"]:has-text("Settings"), li:has-text("Settings")',
  "More (doc step)":
    '[data-test-id="cs-dropdown-truncate-button"], button:has-text("More"), [data-test-id="menu"] button',
  "Settings (top nav) (doc step)":
    '[data-test-id="cms-nav-settings"], button:has-text("Settings"), a:has-text("Settings")',
  "Live Preview (left nav) (doc step)":
    '[data-test-id="cs-stack-settings-live-preview"], a[href*="/settings/live-preview"], #live-preview',
  // Prefer stack-scoped /entries href + stable test-id so .first() cannot match a random "Entries" link elsewhere in the page.
  "Entries (doc step)":
    'a[href*="/#!/stack/"][href*="/entries"], button[data-test-id="cms-nav-entries"], [data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "First Entry row (doc step)":
    '[data-test-id^="cs-table-body-row-0"], [role="row"][data-test-id^="cs-table-body-row-"]',
  "Live Preview icon (doc step)":
    '[data-test-id="cs-entry-edit-tab-live-preview"], #rhs-live-preview-icon',
  "Live Preview settings icon (doc step)":
    '[data-test-id="live-preview-browser-settings-btn"] button, [data-test-id="live-preview-browser-settings-btn"]',
  "Open in new tab icon (doc step)":
    '[data-test-id*="live-preview-browser"][data-test-id*="new-tab"], [data-test-id*="open"][data-test-id*="tab"], button[aria-label*="new tab" i], button[title*="new tab" i]',
  "Preview panel resize edge (doc step)":
    '#entry__page--resizer, [id="entry__page--resizer"]',
  "Select Environment dropdown in settings modal (doc step)":
    '[data-test-id="live-preview-edit-url-env-dropdown"] .Select__control, [data-test-id="live-preview-edit-url-env-dropdown"]',
  "First environment option in settings modal (doc step)":
    '.Select__menu [role="option"], .Select__menu [class*="option"], div[id^="react-select-"][id*="-option-"]',
  "Save in settings modal (doc step)":
    '[data-test-id="live-preview-edit-url-modal-reload-button"], button:has-text("Save")',
  "Editable content block in preview (doc step)":
    '[data-test-id*="live-preview" i] [data-test-id*="block" i], .lp-browser-container [class*="block" i], .lp-browser-container',
  "Edit button in preview (doc step)":
    'button[data-test-id="cs-cslp-tooltip"], [data-test-id="cslp-singular-edit-button"], button[data-test-id="cs-cslp-tooltip"]:has-text("Edit")',
  "Toggle orientation button (doc step)":
    '[data-test-id="live-preview-browser-toggle-viewport-btn"], [data-test-id="live-preview-browser-viewport-settings-bar-toggle-viewport"], .lp-viewport-orientation-icon',
  "Toggle orientation (doc step)":
    '[data-test-id="live-preview-browser-toggle-viewport-btn"], [data-test-id="live-preview-browser-viewport-settings-bar-toggle-viewport"], .lp-viewport-orientation-icon',
  "Environments from left nav (doc step)":
    'a.ListRowV2-wrapper:has([data-test-id="cs-stack-settings-environments"]), [data-test-id="cs-stack-settings-environments"]',
  "Environment row action menu first row (doc step)":
    '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-table-action-options"], [data-test-id^="cs-table-body-row-0"] button[data-test-id="cs-table-action-options"]',
  "Edit Environment action (doc step)":
    'li[data-test-id="cs-environments-action-edit"], [data-test-id="cs-environments-action-edit"]',
  "Edit Environment modal (doc step)":
    '[data-test-id="cs-modal-title-edit-environment"], h3:has-text("Edit Environment")',
  "Save Environment (doc step)":
    '[data-test-id="cs-environment-edit-update"], button:has-text("Save")',
  "Environments page (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Environments"), .PageTitle:has-text("Environments")',
  "Visual Experience from left nav (doc step)":
    'a[href*="settings/visual-experience"]:visible, a.ListRowV2-wrapper:has([data-test-id="cs-stack-settings-visual-experience"]):visible, [data-test-id="cs-stack-settings-visual-experience"]:visible',
  // App header on this route is usually "Live Preview" (see data/dom/CMS/live-preview/live-preview-page.html). set-up-live-preview-for-your-stack uses a dedicated verify in actionRules.
  "Visual Experience page title (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Live Preview"), .page-header-title:has-text("Live Preview"), [data-test-id="cs-page-title"]:has-text("Visual Experience"), .page-header-title:has-text("Visual Experience"), a.ListRowV2-wrapper:has([data-test-id="cs-stack-settings-visual-experience"].ListRowV2--active)',
  "Visual Experience General tab (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("General"), [data-test-id="cs-tabs-item"].Tab__selected:has-text("General")',
  "Enable Live Preview checkbox (doc step)":
    '[data-test-id="cs-checkbox-label"]:has-text("Enable Live Preview"), label[data-test-id="cs-checkbox"]:has-text("Enable Live Preview")',
  "Default Preview Environment dropdown (doc step)":
    '.live-preview-setting [data-test-id="cs-select"], .general-settings-section-wrapper:has(h2.general-settings-section-title:has-text("Live Preview")) [data-test-id="cs-select"]',
  "First Default Preview Environment option (doc step)":
    '.Select__menu [role="option"], .Select__menu [class*="option"], div[id^="react-select-"][id*="-option-"]',
  "Default Preview Environment field (doc step)":
    '[data-test-id="cs-default-preview-env"], label.FieldLabel:has-text("Default Preview Environment")',
  "Always Open in New Tab toggle (doc step)":
    '.visual-experience-settings [data-test-id="cs-field"]:has(.Label--color--secondary:has-text("Always Open in New Tab")) .toggle-switch',
  "Live Preview Display Setup Status toggle (doc step)":
    '.live-preview-setting [data-test-id="cs-toggle-switch"]:has-text("Display Setup Status"), .general-settings-section-wrapper:has(h2.general-settings-section-title:has-text("Live Preview")) [data-test-id="cs-toggle-switch"]',
  "Save Visual Experience settings (doc step)":
    '.general-settings-footer [data-test-id="cs-button"]:has-text("Save"), .visual-experience-settings .general-settings-footer button.Button--primary',
  "Visual Experience Preview URL tab (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Preview URL")',
  "Enable Custom Preview URL toggle (doc step)":
    '.preview-url-container .toggle-wrapper-custom [data-test-id="cs-toggle-switch"] .toggle-switch',
  "Save Preview URL settings (doc step)":
    '.preview-url-footer button[data-test-id="cs-button"].Button--primary:has-text("Save"), .preview-url-footer [data-test-id="cs-button"]:has-text("Save")',
  // Doc note: select environment before preview loads (initial URL modal on entry Live Preview).
  "Select Environment dropdown in Live Preview initial modal (doc step)":
    '[data-testid="live-preview-initial-url-modal"] [data-test-id="live-preview-initial-url-modal-env-dropdown"] .Select__control, [data-test-id="live-preview-initial-url-modal-env-dropdown"] .Select__control',
  "First environment option in Live Preview initial modal (doc step)":
    '.Select__menu [role="option"], .Select__menu [class*="option"], div[id^="react-select-"][id*="-option-"]',
  "Show Live Preview button (doc step)":
    '[data-test-id="cs-live-preview-show"]:not([disabled]), button[aria-label="Show Live Preview"]:not([disabled])',
};

/** Visible Live Preview partition (initial URL modal and/or loaded preview chrome). */
const LIVE_PREVIEW_PANEL_DOC_STEP =
  '.live-preview-partition--visible, [data-testid="live-preview-initial-url-modal"], .LPHeaderContainer .LPHeaderTitle:has-text("Live Preview"), #entry__page--resizer, [data-test-id="cs-live-preview-close"], [data-test-id="lp-header-close-btn"], [data-test-id="cs-live-preview-show"], .lp-browser-container, [data-testid="live-preview-browser-url-input-form"], [data-test-id="live-preview-browser-toggle-viewport-btn"]';

export const INPUT_SELECTORS: Record<string, string> = {
  "Base URL (edit doc step)":
    '[data-test-id="cs-environments-edit-url-input"] input[name="environment_name_0"], input[aria-label="environment_name_0"]',
  "Base URL field label (edit modal) (doc step)":
    '[data-test-id="cs-environments-edit-url-input"] label, .ReactModal__Content label.FieldLabel:has-text("Base URL"), [role="dialog"] label:has-text("Base URL")',
  "Live Preview Display Setup Status label (doc step)":
    '.Label--color--secondary:has-text("Display Setup Status"), span:has-text("Display Setup Status"), [data-test-id="cs-toggle-switch"]:has-text("Display Setup Status")',
  "Live Preview page title (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Live Preview"), .page-header-title:has-text("Live Preview")',
  "Enable Live Preview label (doc step)":
    '[data-test-id="cs-checkbox-label"]:has-text("Enable Live Preview"), [data-test-id="cs-checkbox"]:has-text("Enable Live Preview")',
  "Default Preview Environment label (doc step)":
    '[data-test-id="cs-default-preview-env"], label:has-text("Default Preview Environment")',
  "Display Setup Status label (doc step)":
    '[data-test-id="cs-toggle-switch"]:has-text("Display Setup Status"), .Label--color--secondary:has-text("Display Setup Status")',
  // Same panel targets as doc-named "Live Preview (doc step)"; partition may show initial URL modal before viewport bar.
  "Live Preview (doc step)": LIVE_PREVIEW_PANEL_DOC_STEP,
  "Live Preview window (doc step)": LIVE_PREVIEW_PANEL_DOC_STEP,
  "Live Preview settings modal (doc step)":
    '.settings-modal-container, .LPHeaderTitle:has-text("Settings"), [data-test-id="live-preview-edit-url-modal-reload-button"]',
  "Open in new tab icon label (doc step)":
    '[data-test-id*="live-preview-browser"][data-test-id*="new-tab"], [data-test-id*="open"][data-test-id*="tab"], button[aria-label*="new tab" i], button[title*="new tab" i]',
  "Select Environment label in settings modal (doc step)":
    '[data-test-id="live-preview-edit-url-env-dropdown"] [data-test-id="cs-field-label"]',
  "Toggle orientation button label (doc step)":
    '[data-test-id="live-preview-browser-viewport-settings-bar-toggle-viewport"]',
  "Horizontal viewport input (doc step)":
    '[data-test-id="live-preview-browser-viewport-settings-bar-horizontal-viewport"] input',
  "Vertical viewport input (doc step)":
    '[data-test-id="live-preview-browser-viewport-settings-bar-vertical-viewport"] input',
  "Horizontal viewport value (doc step)":
    '[data-test-id="live-preview-browser-viewport-settings-bar-horizontal-viewport"] input',
  "Vertical viewport value (doc step)":
    '[data-test-id="live-preview-browser-viewport-settings-bar-vertical-viewport"] input',
  "First editable field in editor (doc step)":
    '[data-test-id="cs-single-line-field-title"] input[aria-label="title"], #title, input[name="title"], [data-test-id="cs-title-input"] input, [data-test-id="cs-field"] input:not([type="checkbox"]), textarea',
  "Always Open in New Tab toggle label (doc step)":
    '.visual-experience-settings .Label--color--secondary:has-text("Always Open in New Tab")',
  "Enable Custom Preview URL toggle label (doc step)":
    '.toggle-wrapper-custom__title:has-text("Enable Custom Preview URL")',
  "Base URL section label Preview URL (doc step)":
    '.preview-url-container label[data-test-id="cs-field-label"]:has-text("Base URL")',
  "URL Path section label (doc step)":
    '.preview-url-container label[data-test-id="cs-field-label"]:has-text("URL Path")',
  "Custom preview first base URL alias input (doc step)":
    '.base-url-table__row .base-url-table__cell--alias [data-test-id="cs-text-input"] input',
  "Custom preview first base URL pattern input (doc step)":
    '.base-url-table__row .base-url-table__cell--pattern [data-test-id="cs-text-input"] input',
};
