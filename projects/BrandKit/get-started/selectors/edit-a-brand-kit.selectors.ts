/**
 * Brand Kit — Edit a Brand Kit (doc: edit-a-brand-kit).
 * DOM refs: data/dom/BrandKit/brandkits-listingpage.html, brand-kit-settings.html
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Brand Kit left navigation item (doc step)":
    '[role="navigation"] [aria-label*="Brand Kit" i], [role="navigation"] button:has-text("Brand Kit"), [role="navigation"] a:has-text("Brand Kit"), aside [href*="brand-kit" i], [data-test-id*="sidebar" i] a:has-text("Brand Kit"), [data-test-id*="sidebar" i] button:has-text("Brand Kit")',

  "Brand Kit dashboard product tile (doc step)":
    '[data-test-id="cs-global-dashboard-product-tile-brand-kit"]',

  /** Rulesets / KV / Settings strip — doc calls this “left navigation panel” for Settings; placement checked in actionRules (warn if outside Left Navigation). */
  "Brand Kit Settings navigation item edit doc (doc step)":
    '[data-test-id="brandkit-nav-settings"], nav.TopNavbar a[href*="settings"] button, nav.TopNavbar button:has-text("Settings")',

  "Edit Brand Kit Settings page Settings heading (doc step)":
    '[data-test-id="general-settings-left-sidenav"] [data-test-id="cs-section-header"], [data-test-id="cs-section-header"]:has-text("Settings")',

  "Edit Brand Kit Settings General sidenav row (doc step)":
    '[data-test-id="brand-kit-click-menu-settings-general"]',

  "Edit Brand Kit Settings Brand Kit Details section title (doc step)":
    '.general-settings .brand-kit-details:has(.brand-kit-details-title:has-text("Brand Kit Details")) .brand-kit-details-title',

  "Edit Brand Kit Settings Brand Kit Name label (doc step)":
    '.general-settings .brand-kit-details:has(.brand-kit-details-title:has-text("Brand Kit Details")) label[data-test-id="cs-field-label"]:has-text("Brand Kit Name")',

  "Edit Brand Kit Settings Description label (doc step)":
    '.general-settings .brand-kit-details:has(.brand-kit-details-title:has-text("Brand Kit Details")) label[data-test-id="cs-field-label"]:has-text("Description")',

  "Edit Brand Kit Settings Brand Kit Details Save button (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-settings-general-save-edited-brand-kit-details"]',

  "Edit Brand Kit Settings Stack Details section title (doc step)":
    '.general-settings .brand-kit-details:has(.brand-kit-details-title:has-text("Stack Details")) .brand-kit-details-title',

  /** Doc shows “+ Add Stacks”; UI uses Plus icon + “Add Stacks” (brand-kit-settings.html). */
  "Edit Brand Kit Settings Add Stacks button (doc step)":
    '[data-test-id="brand-kit-click-btn-secondary-action-settings-general-add-stacks"], button:has-text("Add Stacks")',

  "Edit Brand Kit Settings Stack Details Save button (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-settings-general-save-stacks"]',

  "Edit Brand Kit Settings API Key Details section title (doc step)":
    '.general-settings .brand-kit-details:has(.brand-kit-details-title:has-text("API Key Details")) .brand-kit-details-title',

  "Edit Brand Kit Settings Managed by Contentstack option (doc step)":
    '[data-test-id="managed-by-cs-radio-btn"]',

  "Edit Brand Kit Settings Custom Credentials option (doc step)":
    '[data-test-id="managed-by-user-radio-btn"]',

  /** Prefer paragraph shown after Custom Credentials is selected (copy may vary slightly vs docs). */
  "Brand Kit Settings Custom Credentials intro paragraph per edit doc (doc step)":
    '.api-key-details-selection .api-key-details-info, .custom-usage ~ div .api-key-details-info, .api-key-details-container .api-key-details-selection p',

  "Brand Kit Settings Custom Credentials API Key Provider label (doc step)":
    '.api-key-details-selection label[data-test-id="cs-field-label"]:has-text("API Key Provider"), .api-key-details-container .api-key-details-selection label:has-text("API Key Provider")',

  /** React-select for API Key Provider under the **API Key Details** card (scoped so Default Voice select is not matched). */
  "Brand Kit Settings Custom Credentials API Key Provider dropdown control (doc step)":
    '.general-settings .brand-kit-details:has(.brand-kit-details-title:has-text("API Key Details")) [data-test-id="cs-select"] .Select__control, .general-settings .brand-kit-details:has(.brand-kit-details-title:has-text("API Key Details")) [data-test-id="cs-select"] .Portal__control',

  "Brand Kit Settings Save Custom Credentials button (doc step)":
    'button:has-text("Save Custom Credentials")',

  /** After verifying provider list; selects OpenAI (doc-listed option). */
  "Brand Kit Settings Custom Credentials select OpenAI from API Key Provider menu (doc step)":
    "#dropdown-dom .Select__menu .Select__option:has-text(\"OpenAI\"), .Portal__menu .Select__option:has-text(\"OpenAI\"), [role=\"listbox\"] [role=\"option\"]:has-text(\"OpenAI\")",

  "Brand Kit Settings Save Custom Credentials button click (doc step)":
    'button:has-text("Save Custom Credentials")',

  "Brand Kit Settings API Key configuration change Proceed button (doc step)":
    '[role="dialog"] button:has-text("Proceed"), .ReactModal__Content button:has-text("Proceed"), button[data-test-id*="proceed" i]',
};
