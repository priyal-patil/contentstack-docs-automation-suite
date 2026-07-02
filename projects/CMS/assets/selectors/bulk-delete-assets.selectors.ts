/**
 * Assets table row selection (bulk ops).
 * DOM: [data-test-id="cs-table-row-selection"] > .checkbox-wrapper > label[data-test-id="cs-checkbox"] > input#rowSelect[title^="select row"].
 * Use explicit row test-ids (cs-table-body-row-0, …) — :nth-match() is not reliable across Playwright engines.
 */
export const ASSET_TABLE_FIRST_ROW_CHECKBOX =
  '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-table-row-selection"] label[data-test-id="cs-checkbox"], [data-test-id="cs-table-body-row-0"] label[data-test-id="cs-checkbox"]';
export const ASSET_TABLE_SECOND_ROW_CHECKBOX =
  '[data-test-id="cs-table-body-row-1"] [data-test-id="cs-table-row-selection"] label[data-test-id="cs-checkbox"], [data-test-id="cs-table-body-row-1"] label[data-test-id="cs-checkbox"]';

export const CLICK_SELECTORS: Record<string, string> = {
  "First folder row (doc step)":
    '[data-test-id="this-step-is-intentionally-skipped"]',
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id="cs-stacklist-card-PriyalDocsStack"]',
  "Assets (doc step)":
    '[data-test-id="cms-nav-assets"], button:has-text("Assets"), a:has-text("Assets")',
  "First asset checkbox (doc step)":
    ':nth-match([data-test-id^="cs-table-body-row-"]:not(:has(svg[name="Folder"])) [data-test-id="cs-table-row-selection"] label[data-test-id="cs-checkbox"], 1)',
  "Second asset checkbox (doc step)":
    ':nth-match([data-test-id^="cs-table-body-row-"]:not(:has(svg[name="Folder"])) [data-test-id="cs-table-row-selection"] label[data-test-id="cs-checkbox"], 2)',
  "Delete in floating panel (doc step)":
    'button[data-test-id="cs-asset-bulk-panel-delete"], [data-test-id="cs-asset-bulk-panel-delete"]',
  "Delete confirm (doc step)":
    'button[data-test-id="cs-delete-asset"], button[aria-label*="Delete Assets" i]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Delete floating button label (doc step)":
    '[data-test-id="cs-asset-bulk-panel-delete"]',
  "Delete Asset modal title (doc step)":
    '[data-test-id="cs-modal-title-delete-asset"], h3:has-text("Delete")',
  "Delete Asset modal info (doc step)":
    '[data-test-id="cs-aseet-bulk-delete-info"], [data-test-id="cs-modal-description"], [role="dialog"] :text("This will move the selected asset(s) to the Trash")',
  "Delete modal button label (doc step)":
    '[data-test-id="cs-delete-asset"], [role="dialog"] button:has-text("Delete")',
};

