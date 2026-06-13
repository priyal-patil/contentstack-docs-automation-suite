export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")',
  "Assets (doc step)":
    '[data-test-id="cms-nav-assets"], button:has-text("Assets"), a:has-text("Assets")',
  "New Asset (doc step)":
    'button[data-test-id="cs-add-asset"], button[aria-label="Upload Asset"], button:has-text("New Asset")',
  "Choose Files (doc step)":
    '#scrte-image-modal button[data-test-id="cs-button"]:has-text("Choose Files"), button:has-text("Choose Files")',
  "Choose files (doc step)":
    '#scrte-image-modal button[data-test-id="cs-button"]:has-text("Choose"), [role="dialog"] button:has-text("Choose files"), [role="dialog"] button:has-text("Choose Files"), button[data-test-id="cs-button"]:has-text("Choose")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Upload Asset(s) modal title (doc step)":
    '#scrte-image-modal [data-test-id="cs-modal-title"], #scrte-image-modal h3, [role="dialog"] h3:has-text("Upload Asset")',
  "Asset file input (doc step)":
    '[role="dialog"]:has-text("Upload Asset") input[type="file"], #scrte-image-modal input[data-testid="drop-input"], #scrte-image-modal input[data-test-id="drop-input"], #scrte-image-modal input[type="file"], input[data-testid="drop-input"]',
};
