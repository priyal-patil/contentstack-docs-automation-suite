/**
 * Create a Custom Attribute — DOM: `data/dom/Personalize/attributes-list.html`, `create-new-attribute.html`.
 */

const newAttributeModalRoot = '[role="dialog"]:has([data-test-id="cs-modal-title-new-attribute"])';

export const CLICK_SELECTORS: Record<string, string> = {
  "Personalize Projects landing page title (doc step)": '[data-test-id="cs-page-title"]',
  "Personalize workspace top navigation Attributes (doc step)": '[data-test-id="personalize-nav-attributes"]',
  "Create Custom Attribute doc: verify Attributes page + New Attribute primary button (doc step)":
    '[data-testid="add-new-attribute-button"], [data-test-id="cs-page-layout-header"] button.Button--primary:has-text("New Attribute")',
  "Create Custom Attribute doc: Attributes page + New Attribute primary button (doc step)":
    '[data-testid="add-new-attribute-button"], [data-test-id="cs-page-layout-header"] button.Button--primary:has-text("New Attribute")',
  "New Attribute modal title (doc step)": '[data-test-id="cs-modal-title-new-attribute"]',
  "New Attribute Name field label (doc step)": `${newAttributeModalRoot} label[data-test-id="cs-field-label"]:has-text("Name")`,
  "New Attribute Key field label (doc step)": `${newAttributeModalRoot} label[data-test-id="cs-field-label"]:has-text("Key")`,
  "New Attribute Description field label (doc step)": `${newAttributeModalRoot} label[data-test-id="cs-field-label"]:has-text("Description")`,
  "Create Custom Attribute doc: verify Create button in modal (doc step)":
    `${newAttributeModalRoot} [data-testid="attribute-form-submit"]`,
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Personalize New Attribute modal Name field (doc step)": `${newAttributeModalRoot} [data-testid="name-input"]`,
  "Personalize New Attribute modal Key field (doc step)": `${newAttributeModalRoot} [data-testid="key-input"]`,
  "Personalize New Attribute modal Description field (doc step)": `${newAttributeModalRoot} [data-testid="description-input"]`,
};
