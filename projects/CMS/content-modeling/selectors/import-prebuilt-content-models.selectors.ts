/**
 * Selectors for Import Prebuilt Content Models flow.
 * Doc: https://www.contentstack.com/docs/developers/create-content-types/import-prebuilt-content-models
 */
export const CLICK_SELECTORS: Record<string, string> = {
  "Use Prebuilt (doc step)":
    'div.ContentModel__options--item[data-test-id="cs-cb-new-prebuilt-ct-child"], [data-test-id="cs-cb-new-prebuilt-ct-child"], li:has-text("Use Prebuilt"), [role="menuitem"]:has-text("Use Prebuilt")',
  "Add Content Model (doc step)":
    '[role="dialog"]:has-text("Add Content Model"), .ReactModal__Content:has-text("Add Content Model"), [role="dialog"] h2, [role="dialog"] h3, [data-test-id*="add-content-model"], [data-test-id*="prebuilt"]',
  "About Us Page (doc step)":
    '[data-test-id="content-models-about-us-page-card"], [role="dialog"] [data-test-id*="about-us"], [role="dialog"]:has-text("About Us Page")',
  "Hover on About Us Page card (doc step)":
    '[data-test-id="content-models-about-us-page-card"], [role="dialog"] [data-test-id*="about-us"]',
  "Import (doc step)":
    '[data-test-id="content-models-about-us-page-card-import"], [role="dialog"] button[data-test-id*="import" i], [role="dialog"] button:has-text("Import")',
  "Stack Name (doc step)":
    'label[for="stack"], [data-test-id="cs-field-label"], .StackNameField label',
  "Import Content Model to Stack (doc step)":
    '#import-content-model h5, .import-contentmodel-stepper .Accordion__heading__title h5',
  "Import Content Model (doc step)":
    'button[data-test-id="cs-button"]:has-text("Import Content Model"), button:has-text("Import Content Model")',
  "View Content Models (doc step)":
    'button[data-test-id="cs-button"]:has-text("View Content Models"), button:has-text("View Content Models")',
  "Authorize (doc step)": 'button:has-text("Authorize"), a:has-text("Authorize")',
  "First content type row (doc step)":
    '[data-test-id^="cs-table-body-row-"]:first-of-type, div[role="row"]:has([data-test-id^="cs-ct-title"]):first-of-type',
};
