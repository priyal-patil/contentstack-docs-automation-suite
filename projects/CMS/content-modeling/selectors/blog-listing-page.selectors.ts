/**
 * Selectors for Blog Listing Page flow.
 * Doc: https://www.contentstack.com/docs/developers/content-modeling/blog-listing-page
 * Verifies all fields from "Developing Content Type" section match the app Schema tab.
 */
export const CLICK_SELECTORS: Record<string, string> = {
  "Use Prebuilt (doc step)":
    'div.ContentModel__options--item[data-test-id="cs-cb-new-prebuilt-ct-child"], [data-test-id="cs-cb-new-prebuilt-ct-child"], li:has-text("Use Prebuilt"), [role="menuitem"]:has-text("Use Prebuilt")',
  "Add Content Model (doc step)":
    '[role="dialog"]:has-text("Add Content Model"), [data-test-id="cs-modal-title-add-content-model"], .ReactModal__Content:has-text("Add Content Model"), [role="dialog"] h2:has-text("Add Content Model"), [role="dialog"] h3:has-text("Add Content Model"), [data-test-id*="add-content-model"]',
  "Blog Listing Page card (doc step)":
    '[role="dialog"] .content_model_card_component:has(img.ContentModel--banner[alt="blog-listing.svg"]), [data-test-id="content-models-blog-listing-page-card"], [role="dialog"] [data-test-id*="blog-listing"]',
  "Schema tab (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Schema"), .Tab__item:has-text("Schema"), [data-test-id="content-model-details-modal"] [data-test-id="cs-tabs-item"]:has-text("Schema")',
};
