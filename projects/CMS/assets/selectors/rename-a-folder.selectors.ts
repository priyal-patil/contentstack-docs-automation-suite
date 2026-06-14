export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")',
  "Assets (doc step)":
    '[data-test-id="cms-nav-assets"], button:has-text("Assets"), a:has-text("Assets")',
  "First folder vertical ellipses (doc step)":
    '[data-test-id^="cs-table-body-row-"]:has([data-test-id="cs-asset-table-head-asset-type"]:has-text("Folder")) [data-test-id="cs-table-action-options"], [data-test-id^="cs-table-body-row-"]:has([role="cell"]:has-text("Folder")) [data-test-id="cs-table-action-options"]',
  "Rename option (doc step)":
    '[data-test-id="cs-asset-action-rename"] div, [data-test-id="cs-asset-action-rename"]',
  "Save (doc step)":
    'button[data-test-id="cs-asset-rename-folder-save"], button:has-text("Save"), button[aria-label*="Save Changes" i]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Rename Folder modal title (doc step)":
    '[data-test-id="cs-modal-title-rename-folder"], h3:has-text("Rename Folder")',
  "Folder name label (doc step)":
    '[data-test-id="cs-asset-rename-folder"], label:has-text("Folder name")',
  "Folder name input (doc step)":
    '[data-test-id="cs-asset-rename-folder-input"] input[name="folderName"], input[name="folderName"], input[aria-label="folderName"]',
  "Rename option label (doc step)":
    '[data-test-id="cs-asset-action-rename"], [data-test-id="cs-asset-action-rename"] div',
};

