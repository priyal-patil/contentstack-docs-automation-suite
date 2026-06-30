export const CLICK_SELECTORS: Record<string, string> = {
  "First folder row (doc step)":
    '[data-test-id^="cs-table-body-row-"]:has(svg[name="Folder"]):first-of-type [data-test-id="cs-asset-detail-title"], [data-test-id="cs-table-body-row-0"]:has(svg[name="Folder"]) [data-test-id="cs-asset-detail-title"]',
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id="cs-stacklist-card-PriyalDocsStack"]',
  "Assets (doc step)":
    '[data-test-id="cms-nav-assets"], button:has-text("Assets"), a:has-text("Assets")',
  "First Asset row (doc step)":
    '[data-test-id^="cs-table-body-row-"]:not(:has(svg[name="Folder"])):has([data-test-id="cs-asset-detail-title"]) [data-test-id="cs-asset-detail-title"], a[href*="/assets/blt"]:not([href*="/browse"]) [data-test-id="cs-asset-detail-title"]',
  "Asset preview area (doc step)":
    'button[aria-label*="Full screen Asset" i], [data-test-id*="asset-preview"], img[alt]',
  "Replace (doc step)":
    'button:has-text("Replace"), [data-test-id*="replace"], [aria-label*="replace" i]',
  "Choose Files (doc step)":
    '#scrte-image-modal button[data-test-id="cs-button"]:has-text("Choose Files"), button:has-text("Choose Files")',
  "Save (doc step)":
    '[data-test-id="cs-asset-save"], button[aria-label="Save Changes"], button:has-text("Save Changes")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Title field label (doc step)":
    'label:has-text("Title"), [data-test-id*="title-label"]',
  "Description field label (doc step)":
    'label:has-text("Description"), [data-test-id*="description-label"]',
  "Tags field label (doc step)":
    'label:has-text("Tags"), [data-test-id*="tag-label"]',
  "Title (doc step)":
    'input[name="title"], [data-test-id*="asset-title"] input, [data-test-id*="title"] input, input[aria-label*="title" i], input[placeholder*="title" i]',
  "Description (doc step)":
    'textarea[name="description"], [data-test-id*="asset-description"] textarea, [data-test-id*="description"] textarea, textarea[aria-label*="description" i], textarea[placeholder*="description" i]',
  "Tags (doc step)":
    '[data-test-id*="asset-tag"] input, [data-test-id*="tags"] input, input[placeholder*="tag" i], input[aria-label*="tag" i], [role="textbox"][aria-label*="editable pill" i], [contenteditable="true"][role="textbox"]',
  "Asset file input (doc step)":
    '#scrte-image-modal input[data-testid="drop-input"], #scrte-image-modal input[type="file"], input[data-testid="drop-input"], input[type="file"]',
  "Upload asset modal title (doc step)":
    '#scrte-image-modal h3, [data-test-id*="cs-modal-title"]',
  "Asset saved success toast (doc step)":
    '[data-test-id="cs-toast-success"], .toast-message:has-text("saved"), [role="alert"]:has-text("saved")',
};
