/**
 * Flow: customize-your-dashboard-view-part-2
 * Source: https://www.contentstack.com/docs/developers/set-up-stack/customize-your-dashboard-view
 * Add CLICK_SELECTORS and INPUT_SELECTORS as needed.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Edit Dashboard (doc step)":
    '[data-test-id="cs-dashboard-edit-enable"], [data-test-id="cs-dashboard-edit"], button[aria-label="Edit Dashboard"], button:has-text("Edit Dashboard")',
  "First widget card on Dashboard (doc step)":
    '[data-rbd-draggable-id]:first-of-type, [data-test-id*="dashboard-widget"]:first-child',
  "Search card (doc step)":
    '[data-test-id="cms-click-btn-primary-action-dashboard-widget-search"], [data-rbd-draggable-id="search"]',
  "Done (doc step)":
    '[data-test-id="cs-dashboard-edit-disable"], button[aria-label="Done"], button:has-text("Done"), [aria-label="Done"]',
};

export const INPUT_SELECTORS: Record<string, string> = {};
