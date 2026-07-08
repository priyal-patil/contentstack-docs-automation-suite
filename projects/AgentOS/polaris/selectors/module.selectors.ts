export const CLICK_SELECTORS: Record<string, string> = {
  // Step 1 — click a stack from the CMS stack list (uses PriyalDocsStack)
  "stack (doc step)":
    '[data-test-id="cs-stacklist-card-PriyalDocsStack"], [data-test-id="cs-stackcard-title-PriyalDocsStack"], [data-test-id="cs-stack-card-PriyalDocsStack"]',

  // Step 2 — navigate to an entry page from the stack dashboard
  "entry page (doc step)":
    '[data-test-id="cs-nav-item-entries"], [data-test-id="nav-item-entries"], nav a:has-text("Entries"), [aria-label="Entries"]',

  // Steps 3-4 — Polaris icon in the entry editor (AI assistant sidebar toggle)
  // Confirmed DOM: div[role="button"][id="stackHeaderNewPolaris"][aria-label="Polaris"] inside data-testid="cs-polaris-access-gate"
  "Polaris icon (doc step)":
    '#stackHeaderNewPolaris, [data-testid="cs-polaris-access-gate"] [role="button"], [aria-label="Polaris"][role="button"], [data-test-id="cs-polaris-icon-new"]',

  // Steps 5+ — Polaris panel (right sidebar) — confirmed: data-polaris-sidebar="true" from DOM
  "Polaris panel (doc step)":
    '[data-polaris-sidebar="true"], [data-testid="cs-polaris-panel"], [data-test-id="polaris-panel"]',

  // Step — click a content type / view to get entries list — confirmed DOM: accordion "Content Type Views" is collapsed, but Popular Views are visible
  "content type (doc step)":
    '[data-test-id="cs-entries-popular-views-item"]:first-child, [data-test-id="cs-entries-lhs-views-ct_view-close"], [data-test-id*="cs-entries-ct"]:first-child, [data-test-id="cs-content-type"]:first-child',

  // Step — click an existing entry — confirmed DOM has cs-table-body-row-0 (div-based table, no td)
  "existing entry (doc step)":
    '[data-test-id="cs-table-body-row-0"], [data-test-id="cs-table-body-row-0"] [data-test-id*="title"], tbody tr:first-child td:first-child a',

  // Confirm button for Polaris actions
  "Confirm button (doc step)":
    'button:has-text("Confirm"), [data-test-id*="polaris-confirm"], [data-test-id="cs-button"]:has-text("Confirm")',

  // Assets section navigation
  "Assets section (doc step)":
    '[data-test-id="cs-nav-item-assets"], nav a:has-text("Assets"), [aria-label="Assets"]',

  // Existing asset in Assets Editor — confirmed DOM: cs-asset-list; no body rows found (may be empty)
  "existing asset in Assets Editor (doc step)":
    '[data-test-id="cs-asset-list"] [data-test-id*="row"]:first-child, [data-test-id="cs-asset-list"] tr:first-child, [data-test-id="cs-table-body-row-0"], [class*="asset-list"] [class*="item"]:first-child',

  // Visual Editor navigation (uses Compass starter app)
  "Visual Editor (doc step)":
    '[data-test-id="cs-nav-item-visual-editor"], nav a:has-text("Visual Editor"), [aria-label="Visual Editor"]',

  // Page/experience in Visual Editor preview mode
  "page or experience in preview mode (doc step)":
    '[data-test-id*="visual-editor-page"]:first-child, [class*="preview-page"]:first-child, [class*="experience-item"]:first-child',

  // Content element on the Visual Editor canvas
  "content element on the Visual Editor canvas (doc step)":
    '[data-test-id*="canvas-element"]:first-child, [class*="canvas"] [class*="element"]:first-child, [class*="VECanvas"] [class*="element"]:first-child',
};

export const INPUT_SELECTORS: Record<string, string> = {
  // Polaris panel prompt input — confirmed no standard textarea in DOM; sidebar uses custom component
  "Polaris panel prompt input (doc step)":
    '[data-polaris-sidebar="true"] textarea, [data-polaris-sidebar="true"] input[type="text"], [data-polaris-sidebar="true"] [contenteditable="true"], [data-testid="polaris-prompt-input"]',
};
