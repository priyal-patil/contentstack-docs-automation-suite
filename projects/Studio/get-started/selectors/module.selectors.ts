export const CLICK_SELECTORS: Record<string, string> = {
  "Studio (doc step)":
    '[role="menuitem"]:has-text("Studio"), button:has-text("Studio"), a:has-text("Studio"), [data-test-id*="studio" i][role="menuitem"]',
  "Studio New Project primary button (doc step)":
    '[data-test-id="cs-page-layout-header"] button.Button--primary:has-text("New Project"), button.Button--primary:has-text("New Project")',
  "Create New Studio Project modal heading (doc step)":
    '[data-test-id="cs-modal-title-create-new-studio-project"]',
  "Studio New Project Name field label (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-new-studio-project"]) label[data-test-id="cs-field-label"]:has-text("Name")',
  "Studio New Project Description field label (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-new-studio-project"]) label[data-test-id="cs-field-label"]:has-text("Description")',
  "Studio New Project Select Stack field label (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-new-studio-project"]) label[data-test-id="cs-field-label"]:has-text("Select Stack")',
  /** create-new-studio-project-m.html — Accordion Advanced Settings + composition content type fields. */
  "Studio New Project Advanced Settings section title (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-new-studio-project"]) [data-test-id="cs-accordion"] .Accordion__heading__title',
  "Studio New Project Content Type Name field label (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-new-studio-project"]) label[data-test-id="cs-field-label"]:has-text("Content Type Name")',
  "Studio New Project Content Type UID field label (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-new-studio-project"]) label[data-test-id="cs-field-label"]:has-text("Content Type UID")',
  "Studio Create New Project modal Create button visible (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-new-studio-project"]) [data-test-id="cs-button-group"] button.Button--primary:has-text("Create")',
  "Studio Projects page heading (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Studio Projects"), .projectListingHeader__title-PFVCkU:has-text("Studio Projects")',
  "Create New Composition modal heading (doc step)":
    '[data-test-id="cs-modal-title-create-new-composition"]',
  "Linked Composition type heading (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-new-composition"]) h2:has-text("Linked Composition")',
  "Freeform Composition type heading (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-new-composition"]) h2:has-text("Freeform Composition")',
  "Freeform Composition create link (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-new-composition"]) button:has-text("Create a Freeform Composition")',
  "Studio New Composition button visible (doc step)":
    'main button:has-text("New Composition"), [data-test-id="cs-page-layout-main"] button:has-text("New Composition")',
  "Studio Create Linked Composition primary button visible (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-new-composition"]) button:has-text("Create Linked Composition")',
  "Studio Create a Freeform Composition link visible (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-new-composition"]) button:has-text("Create a Freeform Composition")',
  "Studio composition form Create button visible (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-linked-composition"]) [data-test-id="cs-click-btn-primary-action-composition-form-create-composition"], [role="dialog"]:has([data-test-id="cs-modal-title-create-freeform-composition"]) [data-test-id="cs-click-btn-primary-action-composition-form-create-composition"]',
  /** composition-main-header.html — canvas toolbar primary Deploy. */
  "Studio canvas editor Deploy button visible (doc step)":
    '[data-test-id="cs-click-btn-primary-action-canvas-editor-deploy-composition"]',
  /** publish-composition.html — primary action after selecting environment(s). */
  "Studio Publish Composition modal Publish button visible (doc step)":
    '[data-testid="publish-modal__action_proceed"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Studio New Project Name field (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-new-studio-project"]) input[name="projectName"]',
  "Studio New Project Description field (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-new-studio-project"]) textarea[name="projectDescription"]',
  "Studio New Project Advanced Content Type Name field (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-new-studio-project"]) input[name="contentTypeName"]',
  "Studio New Project Advanced Content Type UID field (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-new-studio-project"]) input[name="contentTypeUid"]',
};
