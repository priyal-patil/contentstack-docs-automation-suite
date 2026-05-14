/**
 * Brand Kit — Add Item in Knowledge Vault (knowledge-vault module).
 * DOM refs: data/dom/BrandKit/knowledge-vault-listpage.html, add-item-modal.html,
 * create-manual-kv-page.html, create-upload-kv-page.html
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

  "Knowledge Vault Add Item modal title (doc step)": '[data-test-id="cs-modal-title-add-item"], h3[title="Add Item"]',

  "Knowledge Vault Add Item modal Manual Text Entry card (doc step)": '[data-test-id="manual-text-entry"]',

  "Knowledge Vault Add Item modal File Upload card (doc step)": '[data-test-id="file-upload"]',

  "Knowledge Vault Add Item modal Add primary enabled (doc step)": '[data-test-id="create-item-button"]',

  "Knowledge Vault manual entry Name field label (doc step)":
    'label[data-test-id="cs-field-label"]:has-text("Name"), form#knowledge-vault-form label span:has-text("Name")',

  "Knowledge Vault manual entry Text Content field label (doc step)":
    'label[data-test-id="cs-field-label"]:has-text("Text Content"), form#knowledge-vault-form label span:has-text("Text Content")',

  "Knowledge Vault file upload Name field label (doc step)":
    'form#knowledge-vault-form label[data-test-id="cs-field-label"]:has-text("Name")',

  "Knowledge Vault file upload Upload File field label (doc step)":
    'label[data-test-id="cs-field-label"]:has-text("Upload File")',

  "Knowledge Vault Preview File Text section heading (doc step)":
    '.chunk-data-container p:has-text("Preview File Text"), .chunk-data-container:has-text("Preview File Text")',

  "Knowledge Vault item Save primary (doc step)":
    '[data-test-id="brand-kit-click-btn-primary-action-create-item-save"]',

  "Knowledge Vault Knowledge Vault nav label visible (doc step)":
    '[data-test-id="brandkit-nav-knowledge-vault"], button[aria-label="Knowledge Vault"]',

  /** Automation extension — KV listing header Folder (+) opens New Folder modal (knowledge-vault-listpage.html). */
  "Knowledge Vault page header New Folder icon (automation extension)":
    '[data-testid="brand-kit-click-btn-primary-action-knowledge-vault-open-add-folder-modal"], .PageHeader .add-folder-icon svg[name="FolderSimplePlus"]',

  "Knowledge Vault New Folder modal title (automation extension)":
    '[data-test-id="cs-modal-title-new-folder"], [role="dialog"] h3[title="New Folder"]',

  "Knowledge Vault New Folder modal Name field label (automation extension)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-new-folder"]) label[data-test-id="cs-field-label"] span:first-child',

  "Knowledge Vault New Folder modal Save primary enabled (automation extension)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-new-folder"]) button[data-test-id="folder-form-create-btn"]',

  "Knowledge Vault New Folder modal Save primary (automation extension)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-new-folder"]) button[data-test-id="folder-form-create-btn"]:has-text("Save")',

  /** Move To row menu — tooltip hosts Move To li (kv-vert-ellip-menu.html). */
  "Knowledge Vault Items row Move To menu visible (automation extension)":
    '[data-test-id="cs-vertical-action-tooltip"] li[data-test-id="brand-kit-click-input-select-knowledge-vault-open-move-item-modal"]',

  "Knowledge Vault Items row Move To menu item (automation extension)":
    '[data-test-id="brand-kit-click-input-select-knowledge-vault-open-move-item-modal"], [data-test-id="cs-vertical-action-tooltip"] li:has-text("Move To")',

  "Knowledge Vault Move To modal title (automation extension)":
    '[data-test-id="cs-modal-title-move-to"], .move-items-modal h3[title="Move To"]',

  "Knowledge Vault Move To modal filters control visible (automation extension)":
    '[data-testid="brand-kit-click-btn-primary-action-knowledge-vault-show-filters-selection"], .move-items-modal svg[name="Filter"][data-testid="brand-kit-click-btn-primary-action-knowledge-vault-show-filters-selection"]',

  "Knowledge Vault Move To modal new folder icon visible (automation extension)":
    '.move-items-form-container [data-testid="brand-kit-click-btn-primary-action-knowledge-vault-open-add-folder-modal"], .move-items-modal svg[name="Plus"][data-testid="brand-kit-click-btn-primary-action-knowledge-vault-open-add-folder-modal"]',

  "Knowledge Vault Move To modal Move here primary (automation extension)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-move-to"]) button[data-test-id="folder-form-create-btn"]:has-text("Move here"), .move-items-modal button[data-test-id="folder-form-create-btn"]:has-text("Move here")',

  "Knowledge Vault listing Actions column header (automation extension)":
    '[data-test-id="items-list"] [data-test-id="cs-table-head-text--4"], [data-test-id="items-list"] span.Table__head__column-text:has-text("Actions")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Knowledge Vault manual item Name input (doc step)":
    '[data-test-id="brand-kit-change-input-text-create-item-name"]',
  "Knowledge Vault manual item Text Content input (doc step)":
    '[data-test-id="brand-kit-change-input-text-create-item-content"]',
  "Knowledge Vault file upload Name input (doc step)":
    '[data-test-id="brand-kit-change-input-text-create-item-name"]',
  "Knowledge Vault file upload file input (add-item-in-knowledge-vault doc step)": '[data-test-id="file-input"]',

  "Knowledge Vault New Folder modal name input (automation extension)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-new-folder"]) input[data-test-id="folder-name-input"], form#folder-form input[name="name"]',
};
