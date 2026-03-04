/**
 * Flow: customize-your-dashboard-view-part-2
 * Source: https://www.contentstack.com/docs/developers/set-up-stack/customize-your-dashboard-view
 * Add CLICK_SELECTORS and INPUT_SELECTORS as needed.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Edit Dashboard (doc step)":
    '[data-test-id="cs-dashboard-edit"], button[aria-label="Edit Dashboard"], button:has-text("Edit Dashboard")',
  "Done (doc step)":
    'button:has-text("Done"), [aria-label="Done"]',
};

export const INPUT_SELECTORS: Record<string, string> = {};
