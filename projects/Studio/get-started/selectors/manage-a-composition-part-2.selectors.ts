export const CLICK_SELECTORS: Record<string, string> = {
  "Create Freeform Composition modal heading (doc step)":
    '[data-test-id="cs-modal-title-create-freeform-composition"]',
  "Studio Freeform Composition Name field label (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-freeform-composition"]) label[data-test-id="cs-field-label"]:has-text("Name")',
  "Studio Freeform Composition UID field label (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-freeform-composition"]) label[data-test-id="cs-field-label"]:has-text("Composition UID")',
  "Studio Freeform Composition URL Path label (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-freeform-composition"]) label[data-test-id="cs-field-label"]:has-text("URL Path")',
  "Edit Composition modal heading (doc step)":
    'h3[title="Edit Composition"], [data-test-id^="cs-modal-title-edit-composition"]',
  "Studio Edit Freeform Composition Name field label (doc step)":
    '[role="dialog"]:has-text("Edit Composition") label[data-test-id="cs-field-label"]:has-text("Name")',
  "Studio Edit Freeform Composition URL Path label (doc step)":
    '[role="dialog"]:has-text("Edit Composition") label[data-test-id="cs-field-label"]:has-text("URL Path")',
  "Studio Edit Composition Save button visible (doc step)":
    '[role="dialog"]:has-text("Edit Composition") [data-test-id="cs-button-group"] button.Button--primary:has-text("Save")',
  "Delete Composition modal heading (doc step)":
    'h3[title="Delete Composition"], [data-test-id^="cs-modal-title-delete-composition"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Studio Freeform Composition Name field (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-freeform-composition"]) [data-test-id="cs-input-text-composition-form-composition-name"] input',
  "Studio Freeform Composition UID field (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-freeform-composition"]) input[name="composableUid"]',
  "Studio Freeform Composition URL Path field (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-freeform-composition"]) input[name="compositionUrl"]',
  "Studio Edit Freeform Composition Name field (doc step)":
    '[role="dialog"]:has-text("Edit Composition") [data-test-id="cs-input-text-composition-form-composition-name"] input',
};
