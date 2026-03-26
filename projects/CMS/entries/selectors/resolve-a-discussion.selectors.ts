export const CLICK_SELECTORS: Record<string, string> = {
  "Entries (doc step)":
    '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "First Entry row (doc step)":
    '[data-test-id^="cs-table-body-row-0"], [role="row"][data-test-id^="cs-table-body-row-"]',
  "Comment mode icon (doc step)":
    'button[aria-label*="comment" i], [data-test-id*="comment"][role="button"], button:has([name*="Comment"])',
  "Resolve (doc step)":
    'button:has-text("Resolve"), [data-test-id*="resolve"]'
};
