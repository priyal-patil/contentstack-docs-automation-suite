export const CLICK_SELECTORS: Record<string, string> = {
  "Import Webhook modal (doc step)":
    '[data-test-id="cs-modal-title-import-webhook"], h3:has-text("Import Webhook"), [data-testid="cs-modal"]:has-text("Import Webhook")',
  "Import Webhook icon (doc step)":
    '[data-test-id="table-import-icon"], button[aria-label="Import List"], button[aria-label*="Import" i]',
  "Import button in modal (doc step)":
    '[data-test-id="cs-import-file-import"], button:has-text("Import")',
  "Import button at bottom (doc step)":
    '[data-test-id="cs-import-file"], button:has-text("Import")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "File to import (doc step)":
    '[data-test-id="cs-import-file-choose"], #import-input, input[type="file"]',
};
