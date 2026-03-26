/**
 * Selectors for Blog Landing Page flow.
 * Doc: https://www.contentstack.com/docs/developers/content-modeling/blog-landing-page
 * Verifies all fields from "Developing Content Type" section match the app Schema tab.
 */
export const CLICK_SELECTORS: Record<string, string> = {
  "Use Prebuilt (doc step)":
    'div.ContentModel__options--item[data-test-id="cs-cb-new-prebuilt-ct-child"], [data-test-id="cs-cb-new-prebuilt-ct-child"], li:has-text("Use Prebuilt"), [role="menuitem"]:has-text("Use Prebuilt")',
  "Add Content Model (doc step)":
    '[role="dialog"]:has-text("Add Content Model"), [data-test-id="cs-modal-title-add-content-model"], .ReactModal__Content:has-text("Add Content Model"), [role="dialog"] h2:has-text("Add Content Model"), [role="dialog"] h3:has-text("Add Content Model"), [data-test-id*="add-content-model"]',
  "Blog Landing Page card (doc step)":
    '[role="dialog"] .content_model_card_component:has(img.ContentModel--banner[alt="blog-landing.svg"]), [data-test-id="content-models-blog-landing-page-card"], [role="dialog"] [data-test-id*="blog-landing"]',
  "Schema tab (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Schema"), .Tab__item:has-text("Schema"), [data-test-id="content-model-details-modal"] [data-test-id="cs-tabs-item"]:has-text("Schema")',
  "Preview Schema dropdown (doc step)":
    '[data-test-id="content-model-details-modal"] [data-test-id="cs-select"], label:has-text("Preview Schema") + div [class*="Select"], .schema [data-test-id="cs-select"]',
  "Author option in dropdown (doc step)":
    '[role="option"]:has-text("Author"), .Select__menu div:has-text("Author"), div[id^="react-select-"][id*="-option-"]:has-text("Author"), [class*="Select__menu"]:has-text("Author"), div[title="Author"]',
};
