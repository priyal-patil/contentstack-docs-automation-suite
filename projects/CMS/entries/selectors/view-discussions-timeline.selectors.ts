export const CLICK_SELECTORS: Record<string, string> = {
  "Entries (doc step)":
    '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "First Entry row (doc step)":
    '[data-test-id^="cs-table-body-row-0"], [role="row"][data-test-id^="cs-table-body-row-"]',
  "Discussions tab (doc step)":
    '[data-test-id*="discussion"], button:has-text("Discussions"), [aria-label*="discussion" i]',
  "Discussion status dropdown (doc step)":
    '[data-test-id="cs-entry-discussion-panel-dropdown"], [data-test-id="cs-entry-discussion-panel-dropdown-value"]',
  "Timeline from dropdown (doc step)":
    '[data-test-id="cs-Timeline-comment"], li[title="Timeline"]',
  "First timeline discussion row (doc step)":
    '[data-test-id^="cs-timeline-comment-"], #timelinelist .comment',
  "Timeline action (resolve/reopen) (doc step)":
    'button[data-test-id="cs-entry-discussions-timeline-resolve"], button[data-test-id="cs-entry-discussions-reopen"], button:has-text("Resolve"), button:has-text("Reopen")'
};
