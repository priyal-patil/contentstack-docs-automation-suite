/**
 * Brand Kit — Delete a Brand Kit (doc: delete-a-brand-kit).
 * DOM: data/dom/BrandKit/brand-kit-settings.html, delete-brandkit-modal.html
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Brand Kit left navigation item (doc step)":
    '[role="navigation"] [aria-label*="Brand Kit" i], [role="navigation"] button:has-text("Brand Kit"), [role="navigation"] a:has-text("Brand Kit"), aside [href*="brand-kit" i], [data-test-id*="sidebar" i] a:has-text("Brand Kit"), [data-test-id*="sidebar" i] button:has-text("Brand Kit")',

  "Brand Kit dashboard product tile (doc step)":
    '[data-test-id="cs-global-dashboard-product-tile-brand-kit"]',

  "Brand Kit Settings navigation item delete doc (doc step)":
    '[data-test-id="brandkit-nav-settings"], nav.TopNavbar a[href*="settings"] button, nav.TopNavbar button:has-text("Settings")',

  "Delete Brand Kit flow: Settings page heading (doc step)":
    '[data-test-id="general-settings-left-sidenav"] [data-test-id="cs-section-header"], [data-test-id="cs-section-header"]:has-text("Settings")',

  /** brand-kit-settings.html — Delete Brand Kit card */
  "Delete Brand Kit settings section title (doc step)":
    '.general-settings .brand-kit-details:has(.brand-kit-details-title:has-text("Delete Brand Kit")) .brand-kit-details-title',

  /** Opens delete-brandkit-modal.html */
  "Delete Brand Kit settings open delete modal button (doc step)":
    '[data-test-id="brand-kit-click-btn-secondary-action-settings-general-open-delete-brand-kit-modal"]',

  "Delete Brand Kit modal primary Delete button (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-settings-general-delete-brand-kit-confirm"]',

  "Delete Brand Kit modal title (doc step)":
    '[data-test-id="brand-kit-settings-general-delete-brand-kit-modal"] [data-test-id="cs-modal-title"], [role="dialog"]:has([data-test-id="brand-kit-change-input-text-settings-general-delete-brand-kit"]) h3',

  "Delete Brand Kit modal Delete button verify (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-settings-general-delete-brand-kit-confirm"]',

  "Delete Brand Kit settings Delete Brand Kit button before modal (doc step)":
    '[data-test-id="brand-kit-click-btn-secondary-action-settings-general-open-delete-brand-kit-modal"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Delete Brand Kit modal type DELETE confirm field (doc step)":
    '[data-test-id="brand-kit-change-input-text-settings-general-delete-brand-kit"], [data-test-id="brand-kit-settings-general-delete-brand-kit-modal"] input[name="delete"]',
};
