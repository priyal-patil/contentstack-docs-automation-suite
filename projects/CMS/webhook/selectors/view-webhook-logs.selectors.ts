export const CLICK_SELECTORS: Record<string, string> = {
  "Log tab (doc step)":
    '[data-test-id="cs-webhooks-logs-tab"], .Tab__item:has-text("Log"), [role="tab"]:has-text("Log")',
  "Edit Webhook tab (doc step)":
    '[data-test-id="cs-webhooks-edit-tab"], .Tab__item:has-text("Edit Webhook"), [role="tab"]:has-text("Edit Webhook")',
  "See Details option (doc step)":
    'li:has-text("See Details"), [data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("See Details")',
};

export const INPUT_SELECTORS: Record<string, string> = {};
