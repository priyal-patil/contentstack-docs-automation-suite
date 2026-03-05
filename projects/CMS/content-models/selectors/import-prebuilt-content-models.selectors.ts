export const CLICK_SELECTORS: Record<string, string> = {
  "Use Prebuilt": '[data-test-id="cs-cb-new-prebuilt-ct-child"]',
  "Prebuilt card hover area (doc step)":
    '[role="dialog"] [data-test-id*="about-us" i], [role="dialog"] [data-test-id*="prebuilt" i]',
  "Import":
    '[role="dialog"] button[data-test-id*="import" i], [role="dialog"] button:has-text("Import")',
};

export const INPUT_SELECTORS: Record<string, string> = {};
