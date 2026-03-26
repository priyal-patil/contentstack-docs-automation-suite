export const CLICK_SELECTORS: Record<string, string> = {
  "Vertical ellipsis in Actions column (doc step)":
    '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-table-action-options"], [data-test-id="cs-table-action-options"]',
  "Disable option in webhook menu (doc step)":
    '[data-test-id="cs-webhooks-action-disable"], .VerticalActionTooltip li:has-text("Disable"), [data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Disable")',
  "Enable option in webhook menu (doc step)":
    '[data-test-id="cs-webhooks-action-enable"], .VerticalActionTooltip li:has-text("Enable"), [data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Enable")',
  "Enable or Disable option in webhook menu (doc step)":
    '[data-test-id="cs-webhooks-action-enable"], [data-test-id="cs-webhooks-action-disable"], .VerticalActionTooltip li:has-text("Enable"), .VerticalActionTooltip li:has-text("Disable"), [data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Enable"), [data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Disable")',
  "Proceed button in disable modal (doc step)":
    '[data-test-id="cs-webhooks-disable-proceed"], button:has-text("Proceed")',
  "Enable Webhook toggle (doc step)":
    '[data-test-id="cs-webhook-switch-enabled"] input[type="checkbox"], [data-test-id="cs-webhook-switch-enabled"] input, [data-test-id="cs-webhook-switch-enabled"] .toggle-switch, [data-test-id="cs-webhook-label-enabled"], input[name="enableWebhook"], input[aria-label="enableWebhook"], label:has-text("Enable Webhook")',
  "Save button (doc step)":
    '[data-test-id="cs-webhooks-edit-save"], [data-test-id="cs-webhook-save"], button:has-text("Save")',
};

export const INPUT_SELECTORS: Record<string, string> = {};
