export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")',
  "Assets (doc step)":
    '[data-test-id="cms-nav-assets"], button:has-text("Assets"), a:has-text("Assets")',
  "Create new asset folder icon (doc step)":
    'button[data-test-id="cs-asset-create-new-folder"], button:has(svg[name="FolderSimplePlus"])',
  "Create (doc step)":
    'button[data-test-id="cs-asset-create-folder"], [data-test-id="cs-button-group"] button:has-text("Create")',
  "Created folder row (doc step)":
    '[data-test-id="cs-table-body-row-0"] a[href*="/assets/browse"], [data-test-id="cs-table-body-row-0"] [data-testid="asset-list-title"], [data-test-id="cs-table-body-row-0"]',
  "First Asset row (doc step)":
    'a[href*="#/stack/"][href*="/assets/blt"]:not([href*="/browse"]):visible, a[href*="/assets/blt"]:not([href*="/browse"]):visible, [data-test-id="cs-table-body-row-0"] a[href*="/assets/"]:not([href*="/browse"]):visible',
  "New Asset (doc step)":
    'button[data-test-id="cs-add-asset"], button[aria-label="Upload Asset"], button:has-text("New Asset")',
  "Choose Files (doc step)":
    '#scrte-image-modal button[data-test-id="cs-button"]:has-text("Choose Files"), button:has-text("Choose Files")',
  "Publish Asset button (doc step)":
    'button[aria-label="Publish Asset"]:visible, [data-test-id="cs-asset-publish-btn"]:visible, button:has-text("Publish Asset"):visible, button:has-text("Publish"):visible, [role="menuitem"]:has-text("Publish"):visible, li:has-text("Publish"):visible, [data-test-id="cs-dropdown-elements"]:has-text("Publish"):visible',
  "Close modal/window (doc step)":
    '[data-test-id="cs-modal-close"], .ReactModal__close',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Create Asset Folder modal title (doc step)":
    '[data-test-id="cs-modal-title-create-asset-folder"], h3:has-text("Create Asset Folder")',
  "Folder Name label (doc step)":
    '[data-test-id="cs-create-folder-text-input"] label, label:has-text("Name"), .cs-form-field:has-text("Name") label',
  "Create button in modal (doc step)":
    '[data-test-id="cs-asset-create-folder"], button[data-test-id="cs-button"]:has-text("Create"), button:has-text("Create")',
  "+ New Asset button (doc step)":
    'button[data-test-id="cs-add-asset"], button[aria-label="Upload Asset"], button:has-text("+ New Asset"), button:has-text("New Asset")',
  "Folder name input (doc step)":
    '[data-test-id="cs-create-folder-text-input"] input[name="name"], input[name="name"][placeholder*="folder" i], input[placeholder*="Enter folder name" i]',
  "Asset file input (doc step)":
    '#scrte-image-modal input[data-testid="drop-input"], #scrte-image-modal input[type="file"], input[data-testid="drop-input"], input[type="file"]',
  "Publish Asset modal title (doc step)":
    '[data-test-id="cs-modal-title"]:has-text("Publish Asset"), .asset-publish-modal h3:has-text("Publish Asset")',
};

