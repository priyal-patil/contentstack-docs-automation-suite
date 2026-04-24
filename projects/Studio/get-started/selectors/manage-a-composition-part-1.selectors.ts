export const CLICK_SELECTORS: Record<string, string> = {
  "Create Linked Composition modal heading (doc step)":
    '[data-test-id="cs-modal-title-create-linked-composition"]',
  "Studio Linked Composition Name field label (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-linked-composition"]) label[data-test-id="cs-field-label"]:has-text("Name")',
  "Studio Linked Composition UID field label (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-linked-composition"]) label[data-test-id="cs-field-label"]:has-text("Composition UID")',
  "Studio Linked Composition Select Content Type label (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-linked-composition"]) label[data-test-id="cs-field-label"]:has-text("Select Content Type")',
  "Studio Linked Composition URL Slug label (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-linked-composition"]) label[data-test-id="cs-field-label"]:has-text("URL Slug")',
  "Edit Composition modal heading (doc step)":
    'h3[title="Edit Composition"], [data-test-id^="cs-modal-title-edit-composition"]',
  "Studio Edit Linked Composition Name field label (doc step)":
    '[role="dialog"]:has-text("Edit Composition") label[data-test-id="cs-field-label"]:has-text("Name")',
  "Studio Edit Linked Composition Select Content Type label (doc step)":
    '[role="dialog"]:has-text("Edit Composition") label[data-test-id="cs-field-label"]:has-text("Select Content Type")',
  "Studio Edit Linked Composition URL Slug label (doc step)":
    '[role="dialog"]:has-text("Edit Composition") label[data-test-id="cs-field-label"]:has-text("URL Slug")',
  "Studio Edit Composition Save button visible (doc step)":
    '[role="dialog"]:has-text("Edit Composition") [data-test-id="cs-button-group"] button.Button--primary:has-text("Save")',
  "Delete Composition modal heading (doc step)":
    'h3[title="Delete Composition"], [data-test-id^="cs-modal-title-delete-composition"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Studio Linked Composition Name field (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-linked-composition"]) [data-test-id="cs-input-text-composition-form-composition-name"] input',
  "Studio Linked Composition UID field (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-linked-composition"]) input[name="composableUid"]',
  "Studio Linked Composition URL Slug field (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-linked-composition"]) [data-test-id="cs-input-text-composition-form-composition-url"] input',
  "Studio Edit Linked Composition Name field (doc step)":
    '[role="dialog"]:has-text("Edit Composition") [data-test-id="cs-input-text-composition-form-composition-name"] input',
};
