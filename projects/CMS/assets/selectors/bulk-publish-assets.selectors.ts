export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")',
  "Assets (doc step)":
    '[data-test-id="cms-nav-assets"], button:has-text("Assets"), a:has-text("Assets")',
  "First asset checkbox (doc step)":
    ':nth-match([data-test-id^="cs-table-body-row-"]:has([data-test-id="cs-asset-table-head-publish_status"]:has-text("Not Published")) [data-test-id="cs-table-row-selection"] input[type="checkbox"], 1)',
  "Second asset checkbox (doc step)":
    ':nth-match([data-test-id^="cs-table-body-row-"]:has([data-test-id="cs-asset-table-head-publish_status"]:has-text("Not Published")) [data-test-id="cs-table-row-selection"] input[type="checkbox"], 2)',
  "Floating panel See More (doc step)":
    '[data-test-id="table-see-more-icon"], [data-test-id="cs-dropdown"] [data-test-id="table-see-more-icon"]',
  "Publish in floating panel (doc step)":
    'li[data-test-id="cs-dropdown-elements"]:has([data-test-id="cs-asset-bulk-panel-publish"]), [data-test-id="cs-dropdown-elements"] [data-test-id="cs-asset-bulk-panel-publish"], button[data-test-id="cs-asset-bulk-panel-publish"]',
  "First Environment checkbox (doc step)":
    'label[data-test-id="cs-asset-single-publish-env"], [data-test-id="cs-asset-single-publish-env"]',
  "Publish modal publish button (doc step)":
    'button[data-test-id="cs-asset-bulk-publish-btn"], .asset-publish-modal button:has-text("Publish")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Publish Status column header (doc step)":
    '[data-test-id="cs-asset-table-head-publish_status-text--7"], [data-test-id*="publish_status-text"]',
  "First Not Published status (doc step)":
    ':nth-match([data-test-id="cs-asset-table-head-publish_status"]:has-text("Not Published"), 1)',
  "Second Not Published status (doc step)":
    ':nth-match([data-test-id="cs-asset-table-head-publish_status"]:has-text("Not Published"), 2)',
  "Publish floating button label (doc step)":
    '[data-test-id="cs-asset-bulk-panel-publish"]',
  "Publish Assets modal title (doc step)":
    '[data-test-id="cs-modal-title"] span:has-text("Publish Asset"), [data-test-id="cs-modal-title"]:has-text("Publish Asset"), .asset-publish-modal h3:has-text("Publish Asset")',
  "Select Environment(s) label (doc step)":
    '[data-test-id="cs-field-label"]:has-text("Select Environment"), label:has-text("Select Environment")',
  "Select Language(s) label (doc step)":
    '[data-test-id="cs-field-label"]:has-text("Select Language"), label:has-text("Select Language")',
  "Publish modal button label (doc step)":
    '[data-test-id="cs-asset-bulk-publish-btn"]',
};

