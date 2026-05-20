/**
 * Edit a Custom Attribute — Personalize Attributes listing + **Edit Attribute** modal (patterns align with **`create-custom-attribute`** / `create-new-attribute.html`; edit modal `cs-modal-title-edit-attribute` when present).
 */

const editAttributeModalRoot =
  '[role="dialog"]:has([data-test-id="cs-modal-title-edit-attribute"]), [role="dialog"]:has(h3[data-test-id="cs-modal-title-new-attribute"]:has-text("Edit Attribute")), [role="dialog"]:has(h3[data-test-id="cs-modal-title"]:has-text("Edit Attribute")), .ReactModal__Content:has([data-test-id="cs-modal-title-edit-attribute"]), .ReactModal__Content:has(h3[data-test-id="cs-modal-title-new-attribute"]:has-text("Edit Attribute"))';

export const CLICK_SELECTORS: Record<string, string> = {
  "Personalize Projects landing page title (doc step)": '[data-test-id="cs-page-title"]',
  "Personalize workspace top navigation Attributes (doc step)": '[data-test-id="personalize-nav-attributes"]',

  "Edit Custom Attribute doc: verify Attributes table Actions column heading (doc step)":
    '[data-test-id="cs-table"] [role="columnheader"]:has-text("Actions")',

  "Edit Custom Attribute doc: verify row Actions vertical tooltip Edit menu item label (doc step)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] li[data-test-id="cs-ct-action-edit"]',

  "Edit Custom Attribute doc: Attributes row Actions Edit menu item (doc step)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] li[data-test-id="cs-ct-action-edit"]',

  "Edit Attribute modal title (doc step)":
    '[data-test-id="cs-modal-title-edit-attribute"], h3[data-test-id="cs-modal-title-new-attribute"]:has-text("Edit Attribute"), [role="dialog"] h3[data-test-id="cs-modal-title"]:has-text("Edit Attribute"), .ReactModal__Content h3[data-test-id="cs-modal-title-edit-attribute"], .ReactModal__Content h3[data-test-id="cs-modal-title-new-attribute"]:has-text("Edit Attribute")',

  "Edit Attribute modal Name field label (doc step)": `${editAttributeModalRoot} label[data-test-id="cs-field-label"]:has-text("Name")`,

  "Edit Attribute modal Key field label (doc step)": `${editAttributeModalRoot} label[data-test-id="cs-field-label"]:has-text("Key")`,

  "Edit Attribute modal Description field label (doc step)": `${editAttributeModalRoot} label[data-test-id="cs-field-label"]:has-text("Description")`,

  "Edit Custom Attribute doc: verify Save button in Edit Attribute modal (doc step)":
    `${editAttributeModalRoot} [data-testid="attribute-form-submit"], ${editAttributeModalRoot} [data-test-id="cs-button"]`,
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Personalize Edit Attribute modal Name field (doc step)": `${editAttributeModalRoot} [data-testid="name-input"]`,
  "Personalize Edit Attribute modal Key field (doc step)": `${editAttributeModalRoot} [data-testid="key-input"]`,
  "Personalize Edit Attribute modal Description field (doc step)": `${editAttributeModalRoot} [data-testid="description-input"]`,
};
