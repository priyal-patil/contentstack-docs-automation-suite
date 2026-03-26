export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")',
  "Assets (doc step)":
    '[data-test-id="cms-nav-assets"], button:has-text("Assets"), a:has-text("Assets")',
  "First Not Published asset row (doc step)":
    '[data-test-id^="cs-table-body-row-"]:has([data-test-id="cs-asset-table-head-publish_status"]:has-text("Not Published")) [data-test-id="cs-asset-detail-title"]',
  "Generate permanent URL (doc step)":
    'button[data-test-id="cs-asset-generate-label"], button:has-text("Generate permanent URL"), button[aria-label*="Generate url" i]',
  "Save (doc step)":
    'button:has-text("Save Changes"), [data-test-id*="asset-save"], button:has-text("Save"), button[aria-label*="save" i]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Permanent URL label (doc step)":
    'label:has-text("Permanent URL"), [data-test-id*="permanent"]',
  "Permanent URL slug input (doc step)":
    'input[name*="slug" i], input[placeholder*="slug" i], input[aria-label*="slug" i], input[data-test-id*="permanent"]',
};
