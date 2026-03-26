export const CLICK_SELECTORS: Record<string, string> = {
  "First webhook row (doc step)":
    '[data-test-id^="cs-table-body-row-"]:has([data-test-id="cs-webhooks-list-title"]), a[href*="/settings/webhooks/"][href*="/webhook/edit"], [data-test-id="cs-table-body-row-0"]',
  "Vertical ellipsis in Actions column (doc step)":
    '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-table-action-options"], [data-test-id="cs-table-action-options"]',
  "Export option in webhook menu (doc step)":
    '[data-test-id="cs-webhooks-action-export"], .VerticalActionTooltip li:has-text("Export"), [role="menu"] li:has-text("Export"), li:has-text("Export")',
  "Export button at bottom (doc step)":
    '[data-test-id="cs-webhooks-edit-export"], button:has-text("Export")',
};

export const INPUT_SELECTORS: Record<string, string> = {};
