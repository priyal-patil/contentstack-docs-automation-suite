export const CLICK_SELECTORS: Record<string, string> = {
  // Actions column header (listing page)
  "Actions (doc step)":
    '[data-test-id="cs-table-row-action-column-cell--4"], [role="columnheader"]:has-text("Actions")',

  // Vertical ellipsis on the AUTO- row
  "vertical ellipsis (doc step)": '[data-test-id="cs-table-action-options"]',

  Export:
    '#tableRowActionNode li[data-test-id="cs-ct-action-export"] .ml-8, #tableRowActionNode li[data-test-id="cs-ct-action-export"]',
  "Export (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-export"] .ml-8, [data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-export"], #tableRowActionNode li[data-test-id="cs-ct-action-export"] .ml-8, #tableRowActionNode li[data-test-id="cs-ct-action-export"]',
};

export const INPUT_SELECTORS: Record<string, string> = {};

