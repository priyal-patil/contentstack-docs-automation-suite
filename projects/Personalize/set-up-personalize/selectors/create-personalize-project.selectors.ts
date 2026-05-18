/**
 * Create a Personalize Project — DOM: `data/dom/Personalize/personalize-projects.html`, `new-personalize-project.html`.
 */

const personalizeProjectModalRoot =
  '[role="dialog"]:has([data-test-id="cs-modal-title-new-personalize-project"])';

export const CLICK_SELECTORS: Record<string, string> = {
  "Personalize Projects landing page title (doc step)": '[data-test-id="cs-page-title"]',
  "New Personalize Project primary button (doc step)":
    'button[aria-label="add-new-project-button"], [data-test-id="cs-page-layout-header"] button.Button--primary:has-text("New Personalize Project")',
  "New Personalize Project modal title (doc step)": '[data-test-id="cs-modal-title-new-personalize-project"]',
  "New Personalize Project Name field label (doc step)":
    `${personalizeProjectModalRoot} label[data-test-id="cs-field-label"]:has-text("Name")`,
  "New Personalize Project Description field label (doc step)":
    `${personalizeProjectModalRoot} label[data-test-id="cs-field-label"]:has-text("Description")`,
  "New Personalize Project Select Stack field label (doc step)":
    `${personalizeProjectModalRoot} label[data-test-id="cs-field-label"]:has-text("Select Stack")`,
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Personalize New Project Name field (doc step)": `${personalizeProjectModalRoot} [data-testid="name-input"]`,
  "Personalize New Project Description field (doc step)": `${personalizeProjectModalRoot} [data-testid="description-input"]`,
};
