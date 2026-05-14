/**
 * Brand Kit — Import Item in Knowledge Vault.
 * DOM: data/dom/BrandKit/kv-import.html (canonical KV snippet), import-modal.html
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Brand Kit left navigation item (doc step)":
    '[role="navigation"] [aria-label*="Brand Kit" i], [role="navigation"] button:has-text("Brand Kit"), [role="navigation"] a:has-text("Brand Kit"), aside [href*="brand-kit" i], [data-test-id*="sidebar" i] a:has-text("Brand Kit"), [data-test-id*="sidebar" i] button:has-text("Brand Kit")',

  "Brand Kit dashboard product tile (doc step)":
    '[data-test-id="cs-global-dashboard-product-tile-brand-kit"]',

  "Brand Kit Knowledge Vault top navigation (doc step)": '[data-test-id="brandkit-nav-knowledge-vault"]',

  "Knowledge Vault page title (doc step)":
    '.page-header-title:has-text("Knowledge Vault"), [data-test-id="cs-page-title"]:has-text("Knowledge Vault")',

  "Knowledge Vault list New Item primary (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-items-list-add-item"]',

  "Knowledge Vault Knowledge Vault nav label visible (doc step)":
    '[data-test-id="brandkit-nav-knowledge-vault"], button[aria-label="Knowledge Vault"]',

  "Knowledge Vault Import menu option (doc step)":
    '[data-test-id="brand-kit-click-input-select-knowledge-vault-import"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Knowledge Vault Import file input (import-item-in-knowledge-vault doc step)": '[data-test-id="file-input"]',
};
