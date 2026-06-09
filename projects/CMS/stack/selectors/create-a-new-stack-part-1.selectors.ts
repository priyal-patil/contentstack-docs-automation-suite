/**
 * Flow: create-a-new-stack-part-1
 * Source: https://www.contentstack.com/docs/developers/set-up-stack/create-a-new-stack
 * Add CLICK_SELECTORS and INPUT_SELECTORS as needed.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "+ New Stack (doc step)": '[data-test-id="cs-create-new-stack"], button[aria-label="New Stack"], button:has-text("New Stack")',
  "Create New (doc step)": '[data-test-id="cs-create-new"], [role="button"]:has-text("Create New"), [aria-label="Create New"], li:has-text("Create New"), button:has-text("Create New")',
  "Create (doc step)": '[data-test-id="cs-create-stack"]',
  "Stack Color swatch (doc step)": '[data-testid="cs-stack-create-color-swatch"] .ColorSwatch__palette__container:not(.active)',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Name (create stack doc step)": '[data-test-id="cs-stack-create-title-input"] input',
  "Description (create stack doc step)": '[data-test-id="cs-stack-create-description-input"] textarea',
};
