export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")',
  "Assets (doc step)":
    '[data-test-id="cms-nav-assets"], button:has-text("Assets"), a:has-text("Assets")',
  "First published asset checkbox (doc step)":
    ':nth-match([data-test-id^="cs-table-body-row-"]:has([data-test-id="cs-asset-table-head-publish_status"]:has-text("Published")) [data-test-id="cs-table-row-selection"] input[type="checkbox"], 1)',
  "Second published asset checkbox (doc step)":
    ':nth-match([data-test-id^="cs-table-body-row-"]:has([data-test-id="cs-asset-table-head-publish_status"]:has-text("Published")) [data-test-id="cs-table-row-selection"] input[type="checkbox"], 2)',
  "Floating panel See More (doc step)":
    '[data-test-id="table-see-more-icon"], [data-test-id="cs-dropdown"] [data-test-id="table-see-more-icon"]',
  "Unpublish in floating panel (doc step)":
    'li[data-test-id="cs-dropdown-elements"]:has([data-test-id="cs-asset-bulk-panel-unpublish"]), [data-test-id="cs-dropdown-elements"] [data-test-id="cs-asset-bulk-panel-unpublish"], button[data-test-id="cs-asset-bulk-panel-unpublish"]',
  "First Environment checkbox (doc step)":
    'label[data-test-id="cs-asset-single-publish-env"], [data-test-id="cs-asset-single-publish-env"]',
  "First Language checkbox (doc step)":
    'label[data-test-id="cs-asset-single-publish-lang"]:first-of-type, label[data-test-id="cs-asset-single-publish-lang"]:nth-of-type(1), [data-test-id="cs-asset-single-publish-lang"]:first-of-type',
  "Unpublish modal unpublish button (doc step)":
    'button[data-test-id="cs-asset-bulk-unpublish-btn"], .asset-publish-modal button:has-text("Unpublish")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Publish Status column header (doc step)":
    '[data-test-id="cs-asset-table-head-publish_status-text--7"], [data-test-id*="publish_status-text"]',
  "First Published status (doc step)":
    ':nth-match([data-test-id="cs-asset-table-head-publish_status"]:has-text("Published"), 1)',
  "Second Published status (doc step)":
    ':nth-match([data-test-id="cs-asset-table-head-publish_status"]:has-text("Published"), 2)',
  "Unpublish floating button label (doc step)":
    '[data-test-id="cs-asset-bulk-panel-unpublish"]',
  "Unpublish Assets modal title (doc step)":
    '[data-test-id="cs-modal-title"] span:has-text("Unpublish Asset"), [data-test-id="cs-modal-title"]:has-text("Unpublish Asset"), .asset-publish-modal h3:has-text("Unpublish Asset")',
  "Select Environment(s) label (doc step)":
    '[data-test-id="cs-field-label"]:has-text("Select Environment"), label:has-text("Select Environment")',
  "First Environment checkbox (doc step)":
    'label[data-test-id="cs-asset-single-publish-env"], [data-test-id="cs-asset-single-publish-env"]',
  "Select Language(s) label (doc step)":
    '[data-test-id="cs-field-label"]:has-text("Select Language"), label:has-text("Select Language")',
  "First Language checkbox (doc step)":
    'label[data-test-id="cs-asset-single-publish-lang"], [data-test-id="cs-asset-single-publish-lang"]',
  "Unpublish modal unpublish button (doc step)":
    'button[data-test-id="cs-asset-bulk-unpublish-btn"], .asset-publish-modal button:has-text("Unpublish")',
  "Unpublish modal button label (doc step)":
    '[data-test-id="cs-asset-bulk-unpublish-btn"]',
};

