/**
 * Flow: customize-your-dashboard-view-part-1
 * Source: https://www.contentstack.com/docs/developers/set-up-stack/customize-your-dashboard-view
 * Add CLICK_SELECTORS and INPUT_SELECTORS as needed.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "+ Dashboard Extension (doc step)":
    '[data-test-id="cs-add-existing-dashboard-widget"], button[aria-label="Add Dashboard Extension"], button:has-text("Dashboard Extension")',
  "Edit Dashboard (doc step)":
    '[data-test-id="cs-dashboard-edit"], button[aria-label="Edit Dashboard"], button:has-text("Edit Dashboard")',
  "Add Widgets modal (doc step)":
    '[data-test-id="cs-modal-title-add-widgets"], h3:has-text("Add Widgets")',
  "New Dashboard Extension (doc step)":
    '[data-test-id="cs-empty-dashboard-add-extension"], button[aria-label="Create New Dashboard Extension"], button:has-text("New Dashboard Extension")',
  "Browse Marketplace (doc step)":
    '[data-test-id="cs-browse-marketplace"], button[aria-label="Browse Marketplace"], button:has-text("Browse Marketplace")',
  "Remove Recently Modified Assets (doc step)":
    'button[aria-label*="Remove" i]:near(:text("Recently Modified Assets")), [data-test-id*="remove" i]:near(:text("Recently Modified Assets"))',
  "Done (doc step)":
    'button:has-text("Done"), [aria-label="Done"]',
};

export const INPUT_SELECTORS: Record<string, string> = {};
