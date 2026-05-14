/**
 * Brand Kit — Edit Item in Knowledge Vault (knowledge-vault module).
 * DOM: data/dom/BrandKit/knowledge-vault-listpage.html, kv-vert-ellip-menu.html
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Knowledge Vault listing item row open for edit (doc step)":
    '[data-test-id="items-list"] [role="row"][data-test-id^="cs-table-body-row"] [data-test-id="item-name-test"]',

  "Brand Kit left navigation item (doc step)":
    '[role="navigation"] [aria-label*="Brand Kit" i], [role="navigation"] button:has-text("Brand Kit"), [role="navigation"] a:has-text("Brand Kit"), aside [href*="brand-kit" i], [data-test-id*="sidebar" i] a:has-text("Brand Kit"), [data-test-id*="sidebar" i] button:has-text("Brand Kit")',

  "Brand Kit dashboard product tile (doc step)":
    '[data-test-id="cs-global-dashboard-product-tile-brand-kit"]',

  "Brand Kit Knowledge Vault top navigation (doc step)": '[data-test-id="brandkit-nav-knowledge-vault"]',

  "Knowledge Vault page title (doc step)":
    '.page-header-title:has-text("Knowledge Vault"), [data-test-id="cs-page-title"]:has-text("Knowledge Vault")',

  "Knowledge Vault Knowledge Vault nav label visible (doc step)":
    '[data-test-id="brandkit-nav-knowledge-vault"], button[aria-label="Knowledge Vault"]',

  /** Doc step 4 — Actions column header (knowledge-vault-listpage.html). */
  "Knowledge Vault listing Actions column header (doc step)":
    '[data-test-id="items-list"] [data-test-id="cs-table-head-text--4"], [data-test-id="items-list"] span.Table__head__column-text:has-text("Actions")',

  /** Row ⋯ menu — Edit li (kv-vert-ellip-menu.html). */
  "Knowledge Vault Items row Edit menu visible (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] li[data-test-id="brand-kit-click-menu-items-list-edit-item"]',

  "Knowledge Vault Items row Edit menu item (doc step)":
    '[data-test-id="brand-kit-click-menu-items-list-edit-item"], [data-test-id="cs-vertical-action-tooltip"] li:has-text("Edit")',

  "Knowledge Vault manual entry Text Content field label (doc step)":
    'label[data-test-id="cs-field-label"]:has-text("Text Content"), form#knowledge-vault-form label span:has-text("Text Content")',

  "Knowledge Vault manual entry Name field label (doc step)":
    'label[data-test-id="cs-field-label"]:has-text("Name"), form#knowledge-vault-form label span:has-text("Name")',

  "Knowledge Vault item Save primary (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-create-item-save"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Knowledge Vault manual item Text Content input (doc step)":
    '[data-test-id="brand-kit-change-input-text-create-item-content"]',
};
