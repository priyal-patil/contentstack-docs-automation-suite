/**
 * Flow: import-prebuilt-stack
 * Source: https://www.contentstack.com/docs/developers/set-up-stack/import-prebuilt-stack
 * DOM: data/dom/CMS/stack/import-authorize.html (OAuth_Consent_Card), import-authorize-button.html (Authorize CTA).
 * Authorize after Import is optional — not every run shows it.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "+ New Stack (doc step)":
    '[data-test-id="cs-new-stack"], button:has-text("+ New Stack"), button:has-text("New Stack")',
  "Use Prebuilt (doc step)":
    'div[data-test-id="cs-add-stack-use-prebuilt"], [data-test-id="cs-add-stack-use-prebuilt"], [role="menuitem"]:has-text("Use Prebuilt"), button:has-text("Use Prebuilt")',
  // Hover this card to reveal the Import CTA.
  "Import card hover area (doc step)":
    '[data-test-id="starters-gatsby-starter"]',
  "Import (doc step)":
    'button[data-test-id="starters-gatsby-starter-import"], button[data-test-id="starters-gatsby-starter-import"] div[class*="flex-v-center"]',
  "Read More (starter auth doc step)":
    'div[class*="flex-v-center"] > span:has-text("Read More"), span:has-text("Read More")',
  // OAuth consent (import-authorize.html): primary cs-button + span "Read More"; loop until Authorize (import-authorize-button.html).
  "Read More until Authorize visible (doc step)":
    '.OAuth_Consent_Card button[data-test-id="cs-button"]:has-text("Read More"), .OAuth_Background button[data-test-id="cs-button"]:has-text("Read More"), .OAuth_Card_Footer button[data-test-id="cs-button"]:has-text("Read More"), .Auth__Card--footer button[data-test-id="cs-button"]:has-text("Read More")',
  "Authorize (starter auth doc step)":
    'button[data-testid="modal-form-install-authorize"], .OAuth_Consent_Card button:has(span:has-text("Authorize")), div[class*="flex-v-center"] > span:has-text("Authorize"), button:has-text("Authorize")',
  "Import Sample (doc step)":
    'button[data-test-id="cs-button"]:has-text("Import Starter"), button:has-text("Import Starter"), button:has-text("Import Sample")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Stack Name (import doc step)":
    'input[aria-label*="stack" i], input[aria-label="stack"], input[name="stack"], input[data-test-id="cs-stack-name"], input[data-test-id*="stack-name" i], input[aria-label="name"], input[name="name"], input[placeholder*="Stack" i], input[placeholder*="name" i], [role="dialog"] input[type="text"]',
};
