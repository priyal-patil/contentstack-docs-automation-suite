export const CLICK_SELECTORS: Record<string, string> = {
  "Entries (doc step)":
    '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "First Entry row (doc step)":
    '[data-test-id^="cs-table-body-row-0"], [role="row"][data-test-id^="cs-table-body-row-"]',
  "Comment mode icon (doc step)":
    'button[aria-label*="comment" i], [data-test-id*="comment"][role="button"], button:has([name*="Comment"])',
  "Add comment icon (doc step)":
    'button[data-test-id^="cs-new-comment-"], button.click-to-comment, button:has([name="AddComment"])',
  "Reply on seed comment (doc step)":
    'button:has-text("Reply"), [data-test-id*="reply"]',
  "Automation seed comment thread":
    'text=Automation seed comment thread',
  "Post (doc step)":
    'button[data-test-id="cs-comment-submit"], button[aria-label="Post Comment"], button:has-text("Post")'
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Comment textbox (doc step)":
    'textarea[data-test-id="mention-input"], textarea[placeholder*="Enter a comment" i]'
};

