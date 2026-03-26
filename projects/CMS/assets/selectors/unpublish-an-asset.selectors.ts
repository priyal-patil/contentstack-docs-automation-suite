export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")',
  "Assets (doc step)":
    '[data-test-id="cms-nav-assets"], button:has-text("Assets"), a:has-text("Assets")',
  "First Published asset row (doc step)":
    '[data-test-id^="cs-table-body-row-"]:has([data-test-id="cs-asset-table-head-publish_status"]:has-text("Published")) [data-test-id="cs-asset-detail-title"]',
  "First Published asset actions menu (doc step)":
    '[data-test-id^="cs-table-body-row-"]:has([data-test-id="cs-asset-table-head-publish_status"]:has-text("Published")) [data-test-id="cs-table-action-options"]',
  "Unpublish from actions dropdown (doc step)":
    '[data-test-id="cs-dropdown-elements"]:has-text("Unpublish"), li:has-text("Unpublish"), [role="menuitem"]:has-text("Unpublish")',
  "Unpublish Asset button (doc step)":
    'button[aria-label="Unpublish Asset"], button[aria-label*="Unpublish" i], [data-test-id="cs-asset-unpublish-btn"], button:has-text("Unpublish Asset"), button:has-text("Unpublish")',
  "Unpublish modal unpublish button (doc step)":
    'button[data-test-id="cs-asset-single-unpublish-btn"], .asset-publish-modal button:has-text("Unpublish")',
  "First Environment checkbox (doc step)":
    'label[data-test-id="cs-asset-single-unpublish-env"], .asset-publish-modal [data-test-id="cs-asset-single-unpublish-env"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Unpublish Asset modal title (doc step)":
    '[data-test-id="cs-modal-title"]:has-text("Unpublish Asset"), .asset-publish-modal h3:has-text("Unpublish Asset")',
  "Select Environment(s) label (doc step)":
    '[data-test-id="cs-field-label"]:has-text("Select Environment"), label:has-text("Select Environment")',
  "Select Language(s) label (doc step)":
    '[data-test-id="cs-field-label"]:has-text("Select Language"), label:has-text("Select Language")',
  "Unpublish field label (doc step)":
    '[data-test-id="cs-field-label"]:has-text("Unpublish"), label:has-text("Unpublish")',
  "Now unpublish option (doc step)":
    'label[data-test-id="cs-radio"]:has-text("Now"), .publish-radios label:has-text("Now")',
  "First Language checkbox (doc step)":
    'label[data-test-id="cs-asset-single-unpublish-lang"], .asset-publish-modal [data-test-id="cs-asset-single-unpublish-lang"]',
};
