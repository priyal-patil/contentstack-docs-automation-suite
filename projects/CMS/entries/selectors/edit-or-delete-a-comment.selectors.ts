export const CLICK_SELECTORS: Record<string, string> = {
  "Entries (doc step)":
    '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "First Entry row (doc step)":
    '[data-test-id^="cs-table-body-row-0"], [role="row"][data-test-id^="cs-table-body-row-"]',
  "Comment mode icon (doc step)":
    'button[aria-label*="comment" i], [data-test-id*="comment"][role="button"], button:has([name*="Comment"])',
  "Automation seed comment thread":
    'text=Automation seed comment thread',
  "First comment row (doc step)":
    '[data-test-id="comment-item-can-edit"], #commentslist [role="row"]',
  "Edit comment icon (doc step)":
    '[data-test-id^="cs-comment-item-message-action-edit-"]',
  "Update (doc step)":
    'button[data-test-id="cs-edit-comment"], button[aria-label="Update Comment"], button:has-text("Update")',
  "Delete comment icon (doc step)":
    '[data-test-id^="cs-comment-item-message-action-delete-"]'
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Comment textbox (doc step)":
    'textarea[data-test-id="mention-input"], textarea[placeholder*="Enter a comment" i]'
};
