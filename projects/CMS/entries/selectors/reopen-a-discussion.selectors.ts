export const CLICK_SELECTORS: Record<string, string> = {
  "Entries (doc step)":
    '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "First Entry row (doc step)":
    '[data-test-id^="cs-table-body-row-0"], [role="row"][data-test-id^="cs-table-body-row-"]',
  "Discussions tab (doc step)":
    '[data-test-id*="discussion"], button:has-text("Discussions"), [aria-label*="discussion" i]',
  "Discussion status dropdown (doc step)":
    '[data-test-id="cs-entry-discussion-panel-dropdown"], [data-test-id="cs-entry-discussion-panel-dropdown-value"]',
  "Resolved from dropdown (doc step)":
    '[data-test-id="cs-resolved-comment"], li[title="Resolved"]',
  "First resolved discussion row (doc step)":
    '.discussion-board .comment, [data-test-id^="cs-timeline-comment-"]',
  "Reopen (doc step)":
    'button[data-test-id="cs-entry-discussions-reopen"], button:has-text("Reopen"), [role="button"]:has-text("Reopen"), [data-test-id*="reopen"]'
};
