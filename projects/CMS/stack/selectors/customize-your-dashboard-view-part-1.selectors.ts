/**
 * Flow: customize-your-dashboard-view-part-1
 * Source: https://www.contentstack.com/docs/developers/set-up-stack/customize-your-dashboard-view
 * Add CLICK_SELECTORS and INPUT_SELECTORS as needed.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Close icon":
    '[data-test-id="cs-dashboard-widget-modal-close"], .ReactModal__close',
  "Click X":
    'button[data-test-id="cs-dashboard-remove-widget"], .DashboardCard__remove-card',
  "+ Dashboard Extension (doc step)":
    '[data-test-id="cs-add-existing-dashboard-widget"], button[aria-label="Add Dashboard Extension"], button:has-text("Dashboard Extension")',
  "Edit Dashboard (doc step)":
    '[data-test-id="cs-dashboard-edit-enable"], [data-test-id="cs-dashboard-edit"], button[aria-label="Edit Dashboard"], button:has-text("Edit Dashboard")',
  "Add Widgets modal (doc step)":
    '[data-test-id="cs-modal-title-add-widgets"], h3:has-text("Add Widgets")',
  "Recently Modified Entries card in Add Widgets modal (doc step)":
    'div.ReactModal__widget__items:has([data-test-id="cs-recently_modified_entries"]), div.ReactModal__widget__items:has-text("Recently Modified Entries")',
  "+ Add To Dashboard button for Recently Modified Entries (doc step)":
    'button#recently_modified_entries[data-test-id="cs-dashboard-add-card"], button[id="recently_modified_entries"][aria-label="Add To Dashboard"]',
  "Recently Modified Assets card in Add Widgets modal (doc step)":
    'div.ReactModal__widget__items:has([data-test-id="cs-recently_modified_assets"]), div.ReactModal__widget__items:has-text("Recently Modified Assets")',
  "+ Add To Dashboard button for Recently Modified Assets (doc step)":
    'button#recently_modified_assets[data-test-id="cs-dashboard-add-card"], button[id="recently_modified_assets"][aria-label="Add To Dashboard"]',
  "New Dashboard Extension (doc step)":
    '[data-test-id="cs-empty-dashboard-add-extension"], button[aria-label="Create New Dashboard Extension"], button:has-text("New Dashboard Extension")',
  "Browse Marketplace (doc step)":
    '[data-test-id="cs-browse-marketplace"], button[aria-label="Browse Marketplace"], button:has-text("Browse Marketplace")',
  "Remove Recently Modified Assets (doc step)":
    '[data-test-id="cs-dashboard-remove-widget"], div:has([data-test-id="cs-recently-modified-assets-heading"]) button[data-test-id="cs-dashboard-remove-widget"], button[aria-label*="Remove" i]:near(:text("Recently Modified Assets")), [data-test-id*="remove" i]:near(:text("Recently Modified Assets"))',
  "Done (doc step)":
    '[data-test-id="cs-dashboard-edit-disable"], button[aria-label="Done"], button:has-text("Done"), [aria-label="Done"]',
};

export const INPUT_SELECTORS: Record<string, string> = {};
