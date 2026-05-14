/**
 * Brand Kit — Create a Brand Kit (doc-only scope).
 * DOM refs: data/dom/BrandKit/*.html (same surfaces as get-started-with-brand-kit Brand Kit segment).
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Create Brand Kit modal title (doc step)":
    '[data-test-id="cs-modal-title-create-brand-kit"], h3[title="Create Brand Kit"], [role="dialog"]:has-text("Create Brand Kit")',
  "Create Brand Kit modal Brand Kit Name label (doc step)":
    '[data-testid="new-brand-kit-modal"] label[data-test-id="cs-field-label"]:has-text("Brand Kit Name"), .new-brand-kit-modal label:has-text("Brand Kit Name")',
  "Create Brand Kit modal Description label (doc step)":
    '[data-testid="new-brand-kit-modal"] label:has-text("Description")',
  "Create Brand Kit modal Select Stack(s) label (doc step)":
    '[data-testid="new-brand-kit-modal"] label:has-text("Select Stack")',

  "Brand Kit left navigation item (doc step)":
    '[role="navigation"] [aria-label*="Brand Kit" i], [role="navigation"] button:has-text("Brand Kit"), [role="navigation"] a:has-text("Brand Kit"), aside [href*="brand-kit" i], [data-test-id*="sidebar" i] a:has-text("Brand Kit"), [data-test-id*="sidebar" i] button:has-text("Brand Kit")',

  "Brand Kit dashboard product tile (doc step)":
    '[data-test-id="cs-global-dashboard-product-tile-brand-kit"]',

  "Brand Kits page New Brand Kit primary (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-homepage-add-brand-kit"], button:has-text("New Brand Kit")',

  /** Primary modal submit — verify before click (same DOM as click step). */
  "Create Brand Kit button (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-create-modal-save"], button:has-text("Create Brand Kit")',

  /** Primary modal submit — doc "click … Create Brand Kit" (button). */
  "Create Brand Kit modal primary Create Brand Kit button (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-create-modal-save"], button:has-text("Create Brand Kit")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Brand Kit Name (doc step)":
    '[data-testid="new-brand-kit-modal"] input[name="name"], .new-brand-kit-modal input[name="name"]',
  "Brand Kit Description (doc step)":
    '[data-testid="new-brand-kit-modal"] textarea[name="description"], .new-brand-kit-modal textarea[name="description"]',
};
