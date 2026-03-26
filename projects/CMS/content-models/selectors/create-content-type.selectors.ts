/**
 * Selectors for Create a Content Type flow.
 * Doc: https://www.contentstack.com/docs/developers/create-content-types/create-a-content-type
 * Verifies all fields, buttons, and modals documented in the Create a Content Type doc.
 */
export const CLICK_SELECTORS: Record<string, string> = {
  "Content Models (doc step)":
    '[data-test-id="cms-nav-content-models"], a:has-text("Content Models"), button:has-text("Content Models")',
  "+ New Content Type (doc step)":
    '[data-test-id="cs-cb-new-ct"], button:has-text("New Content Type"), button[aria-label="Create New Content Type"]',
  "Create New (doc step)":
    '[data-test-id="cs-cb-new-ct-child"], button:has-text("Create New"), [role="menuitem"]:has-text("Create New")',
  "Use Prebuilt (doc step)":
    '[data-test-id="cs-cb-new-prebuilt-ct-child"], li:has-text("Use Prebuilt"), [role="menuitem"]:has-text("Use Prebuilt")',
  "Save and proceed (doc step)":
    '[data-test-id="cs-ct-create-modal-submit"], [data-testid="cs-modal"] button:has-text("Save and proceed"), [data-testid="cs-modal"] button:has-text("Create"), button:has-text("Save and proceed")',
  "Insert a field (doc step)":
    '[data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"], [data-test-id="cs-field-type-selector"] .FieldTypeSelector__action-bar svg[name="PurpleAdd"], button:has(svg[name="PurpleAdd"])',
  "Save (doc step)": '[data-test-id="cs-ct-save"], button:has-text("Save")',
  "Save and Close (doc step)": '[data-test-id="cs-ct-save-close"], button:has-text("Save and Close")',
  "Properties cog (doc step)":
    'button:has(svg[name="Sliders"]), [role="button"]:has(svg[name="Sliders"]), [data-test-id="cs-ct-title-option-properties"]',
  "Create New Content Type modal (doc step)":
    '[role="dialog"]:has-text("Create New Content Type"), [data-test-id="cs-modal-title"]:has-text("Create New Content Type"), [data-testid="cs-modal"][role="dialog"]',
  "Single (Type doc step)":
    '[data-testid="cs-modal"] label:has-text("Single"), [data-testid="cs-modal"][role="dialog"] label:has-text("Single")',
  "Multiple (Type doc step)":
    '[data-testid="cs-modal"] label:has-text("Multiple"), [data-testid="cs-modal"][role="dialog"] label:has-text("Multiple")',
  "Content Type Builder (doc step)":
    '.contenttype-builder [data-test-id="cs-ct-title-truncate"], .contenttype-builder .ContentTypeField__display-name:has-text("Title"), .ContentTypeField [data-test-id="cs-ct-title-truncate"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Name (doc step)":
    '[data-testid="cs-modal"][role="dialog"] input[name="name"], [data-test-id="cs-ct-create-modal-ct-name-input"] input',
  "Description (doc step)":
    '[data-test-id="cs-ct-modal-ct-description-input"] textarea, [data-testid="cs-modal"] textarea[name="description"]',
  "Type (doc step)":
    '[data-testid="cs-modal"][role="dialog"] [role="radio"], [data-testid="cs-modal"] label:has-text("Single"), [data-testid="cs-modal"] label:has-text("Multiple")',
};
