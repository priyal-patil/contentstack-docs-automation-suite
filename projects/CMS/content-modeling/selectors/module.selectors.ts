/**
 * Content Modeling module - shared selectors.
 * Reuses Content Models UI (same as content-models).
 */
export const CLICK_SELECTORS: Record<string, string> = {
  "Content Models (doc step)":
    '[data-test-id="cms-nav-content-models"], [data-test-id="cms-nav-content-models"] a, a:has-text("Content Models")',
  "Content Models":
    '[data-test-id="cms-nav-content-models"], [data-test-id="cms-nav-content-models"] a',
  "+ New Content Type (doc step)": '[data-test-id="cs-cb-new-ct"]',
  "+ New Content Type": '[data-test-id="cs-cb-new-ct"]',
  "Use Prebuilt (doc step)": 'div.ContentModel__options--item[data-test-id="cs-cb-new-prebuilt-ct-child"]',
};
