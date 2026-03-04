export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="Headless CMS" i]',
  "Stacks (doc step)":
    'button:has-text("Stacks"), [aria-label*="Stacks" i], [data-test-id*="stacks" i]',
  "Any Stack Card (doc step)":
    '[data-test-id*="stack-card" i], [data-test-id*="stack-list" i] [role="button"], a[href*="/#!/stack/"], .stack-card, .stacklist-card',
  "Settings (doc step)":
    '[data-test-id="cms-nav-settings"], [aria-label="Settings"], button:has-text("Settings"), a:has-text("Settings")',
  "More (doc step)":
    'button:has-text("More"), [aria-label="More"]',
  "Audit Log tab (doc step)":
    'button:has-text("Audit Log"), [role="tab"]:has-text("Audit Log"), a:has-text("Audit Log")',
  "Dashboard page (doc step)":
    '[data-test-id="cms-nav-dashboard"], [role="heading"]:has-text("Dashboard"), h1:has-text("Dashboard")',
  "Audit Date column (doc step)":
    'th:has-text("Date"), [role="columnheader"]:has-text("Date"), button:has-text("Date")',
  "Audit Action column (doc step)":
    'th:has-text("Action"), [role="columnheader"]:has-text("Action"), button:has-text("Action")',
  "Audit Title column (doc step)":
    'th:has-text("Title"), [role="columnheader"]:has-text("Title"), button:has-text("Title")',
  "Audit Remote Address column (doc step)":
    'th:has-text("Remote Address"), [role="columnheader"]:has-text("Remote Address")',
  "+ New Stack (doc step)":
    'button:has-text("+ New Stack"), button:has-text("New Stack"), [aria-label*="New Stack" i]',
  "Create New (doc step)":
    'button:has-text("Create New"), [role="menuitem"]:has-text("Create New"), [data-test-id*="create-new" i]',
  "Use Prebuilt (doc step)":
    'button:has-text("Use Prebuilt"), [role="menuitem"]:has-text("Use Prebuilt"), [data-test-id*="prebuilt" i]',
  "Create (doc step)":
    'button:has-text("Create"), [aria-label^="Create" i]',
  "Stack Color (doc step)":
    '[data-test-id="cs-stack-create-color"], [data-test-id="cs-stack-create-color-field"] label',
  "Stack Color swatch (doc step)":
    '[data-testid="cs-stack-create-color-swatch"] .ColorSwatch__palette__container:not(.active), [aria-label="Predefined color palette"] .ColorSwatch__palette__container:not(.active)',
  "Save (doc step)": 'button:has-text("Save"), [aria-label="Save"]',
  "Delete Stack (doc step)":
    'button:has-text("Delete Stack"), [aria-label="Delete Stack"], [data-test-id*="delete" i]',
  "Delete (confirm doc step)":
    'button[data-test-id="cs-stack-delete"], button[data-test-id="cs-stack-delete"] span:has-text("Delete"), button:has-text("Delete"), [data-test-id*="delete" i]',
  "Stack Owner Email (doc step)":
    "xpath=//*[contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'stack owner email')]/following::*[@aria-label='uid' or @name='uid'][1]",
  "Appearance section (doc step)":
    'section:has-text("Appearance"), div:has-text("Appearance"), div:has-text("Stack Accent"), [data-test-id="cs-stack-create-color-field"], [data-test-id*="stack-create-color-field" i]',
  "Stack Color (settings doc step)":
    '[data-test-id*="stack-create-color" i], [aria-label*="Stack Color" i], label:has-text("Stack Color"), div:has-text("Stack Accent")',
  "API Credentials section (doc step)":
    'section:has-text("API Credentials"), div:has-text("API Credentials"), [data-test-id*="api-credentials" i], [data-test-id*="stack-api" i]',
  "API Key (doc step)":
    "xpath=//*[contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'api key')]/following::*[@aria-label='uid' or @name='uid'][1]",
  "Leave Stack (doc step)":
    'button:has-text("Leave Stack"), [aria-label*="Leave Stack" i]',
  "Transfer Ownership (doc step)":
    'button:has-text("Transfer Ownership"), [aria-label*="Transfer Ownership" i]',
  "Leave Stack (confirm doc step)":
    'button:has-text("Leave Stack"), [aria-label*="Leave Stack" i]',
  "Transfer Ownership (confirm doc step)":
    'button[data-test-id="cs-stack-transfer-ownership"], button[data-test-id="cs-stack-transfer-ownership"] span:has-text("Transfer Ownership"), button:has-text("Transfer Ownership"), [aria-label*="Transfer Ownership" i]',
  "Import (doc step)":
    'button:has-text("Import"), [aria-label="Import"], [data-test-id*="import" i]',
  "Import Sample (doc step)":
    'button:has-text("Import Sample"), [aria-label*="Import Sample" i]',
  "Edit Dashboard (doc step)":
    'button:has-text("Edit Dashboard"), [aria-label*="Edit Dashboard" i]',
  "+ Dashboard Extension (doc step)":
    'button:has-text("+ Dashboard Extension"), button:has-text("Dashboard Extension")',
  "Done (doc step)": 'button:has-text("Done"), [aria-label="Done"]',
  "Recently Modified Entries (doc step)":
    '[role="heading"]:has-text("Recently Modified Entries"), h1:has-text("Recently Modified Entries"), h2:has-text("Recently Modified Entries"), h3:has-text("Recently Modified Entries")',
  "Recently Modified Assets (doc step)":
    '[role="heading"]:has-text("Recently Modified Assets"), h1:has-text("Recently Modified Assets"), h2:has-text("Recently Modified Assets"), h3:has-text("Recently Modified Assets")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Name (create stack doc step)":
    'input[aria-label="name"], input[name="name"], input[placeholder*="name" i]',
  "Description (create stack doc step)":
    'textarea[aria-label="description"], textarea[name="description"], textarea[placeholder*="description" i]',
  "Stack Name (import doc step)":
    'input[aria-label="name"], input[name="name"], input[placeholder*="name" i]',
  "Name (edit stack doc step)":
    'input[aria-label="name"], input[name="name"], input[placeholder*="name" i]',
  "Description (edit stack doc step)":
    'textarea[aria-label="description"], textarea[name="description"], textarea[placeholder*="description" i]',
  "Delete confirmation (doc step)":
    'input[aria-label*="delete" i], input[placeholder*="DELETE"], input[name*="delete" i]',
  "Recipient Email (doc step)":
    'input[type="email"], input[aria-label*="email" i], input[name*="email" i]',
};
