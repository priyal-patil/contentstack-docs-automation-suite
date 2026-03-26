export const CLICK_SELECTORS: Record<string, string> = {
  "Entries (doc step)":
    '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "First Entry row (doc step)":
    '[data-test-id^="cs-table-body-row-0"], [role="row"][data-test-id^="cs-table-body-row-"]',
  "Discussions tab (doc step)":
    '[data-test-id*="discussion"], button:has-text("Discussions"), [aria-label*="discussion" i]',
  "First unlinked discussion row (doc step)":
    '.discussion-board .comment, [data-test-id^="cs-timeline-comment-"]',
  "ReLink (doc step)":
    'button:has-text("ReLink"), button:has-text("Relink"), [data-test-id*="relink"]',
  "Relink Field With modal (doc step)":
    'text=Relink Field With',
  "First relink field option (doc step)":
    '[role="radio"], [role="option"], .Modal [data-test-id*="field"]',
  "Confirm relink (doc step)":
    'button:has-text("Confirm"), button[data-test-id*="confirm"]'
};
