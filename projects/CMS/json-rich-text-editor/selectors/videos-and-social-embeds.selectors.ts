/**
 * JSON RTE — Videos and Social Embeds (video-icon.html, video-modal.html, social-embed-icon.html, social-embeds-modal.html).
 * https://www.contentstack.com/docs/developers/json-rich-text-editor/videos-and-social-embeds
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "New Entry (doc step)":
    '[data-test-id="cs-new-entry-all-entry"], button[aria-label="Create New Entry"], .PageLayout__head button:has-text("New Entry"), button.Button--primary:has-text("New Entry")',
  "Proceed (Select Content Type modal) (doc step)":
    '[data-test-id="cs-new-entry-single-proceed"], button[aria-label="Proceed"]:not([disabled])',
  "Create Entry (doc step)":
    '[data-test-id="cs-new-entry-single-proceed"], button[aria-label="Proceed"]:not([disabled])',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Entry Title (doc step)":
    '[data-test-id="cs-title-input"] input:not([type="number"]), [data-test-id="cs-single-line-field-title"] input:not([type="number"]), [data-test-id="cs-edit-entry-field-title"] input, input[placeholder*="Type something" i]:not([type="number"])',
  /** Video modal — video-modal.html (label: Video Embed Code or Youtube/Vimeo Link). */
  "JSON RTE Video modal embed input (doc step)":
    'textarea[data-testid="embeded_url"], textarea[name="embeded_url"][aria-label="embeded_url"]',
  /** Social Embeds modal — social-embeds-modal.html (label: Embed URL). */
  "JSON RTE Social Embeds modal URL input (doc step)": 'textarea[data-testid="social_embed_url"]',
};
