/**
 * Selectors for Website Homepage flow.
 * Doc: https://www.contentstack.com/docs/developers/content-modeling/website-homepage
 * Verifies Homepage content type fields from "Developing Content Type" section.
 */
export const CLICK_SELECTORS: Record<string, string> = {
  "Use Prebuilt (doc step)":
    'div.ContentModel__options--item[data-test-id="cs-cb-new-prebuilt-ct-child"]',
  "Add Content Model (doc step)":
    '[role="dialog"]:has-text("Add Content Model"), [data-test-id="cs-modal-title-add-content-model"], .ReactModal__Content:has-text("Add Content Model"), [role="dialog"] h2:has-text("Add Content Model"), [role="dialog"] h3:has-text("Add Content Model"), [data-test-id*="add-content-model"]',
  "Website Homepage card (doc step)":
    '[role="dialog"] .content_model_card_component:has(img.ContentModel--banner[alt="website-home-page.svg"]), [data-test-id="content-models-website-homepage-card"], [role="dialog"] [data-test-id*="website-homepage"], [role="dialog"] [data-test-id*="website-home-page"]',
  "Schema tab (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Schema"), .Tab__item:has-text("Schema"), [data-test-id="content-model-details-modal"] [data-test-id="cs-tabs-item"]:has-text("Schema")',
};
