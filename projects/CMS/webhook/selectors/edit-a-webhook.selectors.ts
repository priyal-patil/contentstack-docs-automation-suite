export const CLICK_SELECTORS: Record<string, string> = {
  "First webhook row (doc step)":
    '[data-test-id="cs-table-body-row-0"], a[href*="/webhooks/"] [data-test-id="cs-table-body-row-0"], [data-test-id^="cs-table-body-row-"]',
  "Save webhook button (doc step)":
    '[data-test-id="cs-webhook-save"], button[data-test-id="cs-button"]:has-text("Save"), button:has-text("Save")',
  "Edit Webhook tab (doc step)":
    '[data-test-id="cs-webhooks-edit-tab"], .Tab__item:has-text("Edit Webhook")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Name label (doc step)":
    '[data-test-id="cs-webhook-name-label"], label:has-text("Name")',
  "URL to Notify label (doc step)":
    '[data-test-id="cs-webhook-url-label"], label:has-text("URL")',
  "Name input (doc step)":
    '[data-test-id="cs-webhook-name-input"] input, input[name="name"][placeholder*="webhook"]',
  "URL to Notify input (doc step)":
    '[data-test-id="cs-webhook-url-input"] input, input[name="url"]',
};
