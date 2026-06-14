export const CLICK_SELECTORS: Record<string, string> = {
  "First folder row (doc step)":
    '[data-test-id^="cs-table-body-row-"]:has(svg[name="Folder"]) [data-test-id="cs-asset-detail-title"]',
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")',
  "Assets (doc step)":
    '[data-test-id="cms-nav-assets"], button:has-text("Assets"), a:has-text("Assets")',
  "First Not Published asset row (doc step)":
    '[data-test-id^="cs-table-body-row-"]:has([data-test-id="cs-asset-table-head-publish_status"]:has-text("Not Published")) [data-test-id="cs-asset-detail-title"]',
  "Publish Asset button (doc step)":
    'button[aria-label="Publish Asset"], [data-test-id="cs-asset-publish-btn"], button:has-text("Publish Asset")',
  "First Asset Actions menu (doc step)":
    '[data-test-id^="cs-table-body-row-"]:has([data-test-id="cs-asset-table-head-publish_status"]:has-text("Not Published")) [data-test-id="cs-table-action-options"], [data-test-id="cs-table-action-options"]',
  "Publish (doc step)":
    '[data-test-id="cs-dropdown-elements"]:has-text("Publish"), li:has-text("Publish")',
  "Publish modal publish button (doc step)":
    'button[data-test-id="cs-asset-single-publish-btn"], .asset-publish-modal button:has-text("Publish")',
  "First Environment checkbox (doc step)":
    'label[data-test-id="cs-asset-single-publish-env"], .asset-publish-modal [data-test-id="cs-asset-single-publish-env"]',
  "Second Language checkbox (doc step)":
    'label[data-test-id="cs-asset-single-publish-lang"]:nth-of-type(2), .asset-publish-modal [data-test-id="cs-asset-single-publish-lang"]:nth-of-type(2)',
  "First Language checkbox (doc step)":
    'label[data-test-id="cs-asset-single-publish-lang"]:first-of-type, label[data-test-id="cs-asset-single-publish-lang"]:nth-of-type(1), [data-test-id="cs-asset-single-publish-lang"]:first-of-type',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Publish Asset button (doc step)":
    'button[aria-label="Publish Asset"], [data-test-id="cs-asset-publish-btn"], button:has-text("Publish Asset")',
  "Publish Asset modal title (doc step)":
    '[data-test-id="cs-modal-title"]:has-text("Publish Asset"), .asset-publish-modal h3:has-text("Publish Asset")',
  "Publish modal publish button (doc step)":
    'button[data-test-id="cs-asset-single-publish-btn"], .asset-publish-modal button:has-text("Publish")',
  "Select Environment(s) label (doc step)":
    '[data-test-id="cs-field-label"]:has-text("Select Environment"), label:has-text("Select Environment")',
  "Select Language(s) label (doc step)":
    '[data-test-id="cs-field-label"]:has-text("Select Language"), label:has-text("Select Language")',
  "Publish field label (doc step)":
    '[data-test-id="cs-field-label"]:has-text("Publish"), label:has-text("Publish")',
  "Now publish option (doc step)":
    'label[data-test-id="cs-radio"]:has-text("Now"), .publish-radios label:has-text("Now")',
  "First Language checkbox (doc step)":
    'label[data-test-id="cs-asset-single-publish-lang"], .asset-publish-modal [data-test-id="cs-asset-single-publish-lang"]',
};
