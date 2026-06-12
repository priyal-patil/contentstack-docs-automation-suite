export const CLICK_SELECTORS: Record<string, string> = {
  "Log tab (doc step)":
    '[data-test-id="cs-webhooks-logs-tab"], .Tab__item:has-text("Log"), [role="tab"]:has-text("Log")',
  "Edit Webhook tab (doc step)":
    '[data-test-id="cs-webhooks-edit-tab"], .Tab__item:has-text("Edit Webhook"), [role="tab"]:has-text("Edit Webhook")',
  "Vertical ellipsis in log Actions column (doc step)":
    '[data-test-id="cs-webhooks-log-table"] tbody tr:first-child [data-test-id="cs-vertical-action-tooltip"], [data-test-id="cs-webhooks-log-table"] tbody tr:first-child button[data-test-id="cs-icon-MoreVertical"], .webhook-logs__table tbody tr:first-child [data-test-id="cs-vertical-action-tooltip"], table tbody tr:first-child [data-test-id="cs-vertical-action-tooltip"]',
  "See Details option (doc step)":
    'li:has-text("See Details"), [data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("See Details")',
};

export const INPUT_SELECTORS: Record<string, string> = {};

export const VERIFY_SELECTORS: Record<string, string> = {
  "First log row (doc step)":
    '[data-test-id="cs-webhooks-log-table"] tbody tr:first-child, .webhook-logs__table tbody tr:first-child, table tbody tr:first-child',
  "Vertical ellipsis in log Actions column (doc step)":
    '[data-test-id="cs-webhooks-log-table"] tbody tr:first-child [data-test-id="cs-vertical-action-tooltip"], [data-test-id="cs-webhooks-log-table"] tbody tr:first-child button[data-test-id="cs-icon-MoreVertical"], .webhook-logs__table tbody tr:first-child [data-test-id="cs-vertical-action-tooltip"], table tbody tr:first-child [data-test-id="cs-vertical-action-tooltip"]',
  "Time column header (doc step)":
    '[data-test-id="cs-webhooks-log-table"] thead th:has-text("Time"), .webhook-logs__table thead th:has-text("Time"), table thead th:has-text("Time")',
  "Action column header (doc step)":
    '[data-test-id="cs-webhooks-log-table"] thead th:has-text("Action"), .webhook-logs__table thead th:has-text("Action"), table thead th:has-text("Action")',
  "Module column header (doc step)":
    '[data-test-id="cs-webhooks-log-table"] thead th:has-text("Module"), .webhook-logs__table thead th:has-text("Module"), table thead th:has-text("Module")',
  "Title column header (doc step)":
    '[data-test-id="cs-webhooks-log-table"] thead th:has-text("Title"), .webhook-logs__table thead th:has-text("Title"), table thead th:has-text("Title")',
  "Call Status column header (doc step)":
    '[data-test-id="cs-webhooks-log-table"] thead th:has-text("Call Status"), .webhook-logs__table thead th:has-text("Call Status"), table thead th:has-text("Call Status")',
  "Actions column header (doc step)":
    '[data-test-id="cs-webhooks-log-table"] thead th:has-text("Actions"), .webhook-logs__table thead th:has-text("Actions"), table thead th:has-text("Actions")',
};
