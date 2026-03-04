export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="Headless CMS" i]',
  "Stacks (doc step)":
    'button:has-text("Stacks"), [aria-label*="Stacks" i], [data-test-id*="stacks" i]',
  "Any Stack Card (doc step)":
    '[data-test-id*="stack-card" i], [data-test-id*="stack-list" i] [role="button"], a[href*="/#!/stack/"], .stack-card, .stacklist-card',
  "Settings (doc step)":
    '[data-test-id="cms-nav-settings"], [aria-label="Settings"], button:has-text("Settings"), a:has-text("Settings")',
  "Audit Log tab (doc step)":
    'button:has-text("Audit Log"), [role="tab"]:has-text("Audit Log"), a:has-text("Audit Log")',
  "+ New Stack (doc step)":
    'button:has-text("+ New Stack"), button:has-text("New Stack"), [aria-label*="New Stack" i]',
  "Create New (doc step)":
    'button:has-text("Create New"), [role="menuitem"]:has-text("Create New"), [data-test-id*="create-new" i]',
  "Use Prebuilt (doc step)":
    'button:has-text("Use Prebuilt"), [role="menuitem"]:has-text("Use Prebuilt"), [data-test-id*="prebuilt" i]',
  "Create (doc step)":
    'button:has-text("Create"), [aria-label^="Create" i]',
  "Save (doc step)": 'button:has-text("Save"), [aria-label="Save"]',
  "Delete Stack (doc step)":
    'button:has-text("Delete Stack"), [aria-label="Delete Stack"], [data-test-id*="delete" i]',
  "Delete (confirm doc step)":
    'button:has-text("Delete"), [data-test-id*="delete" i]',
  "Leave Stack (doc step)":
    'button:has-text("Leave Stack"), [aria-label*="Leave Stack" i]',
  "Transfer Ownership (doc step)":
    'button:has-text("Transfer Ownership"), [aria-label*="Transfer Ownership" i]',
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
    'text=Recently Modified Entries, [data-test-id*="recently" i]:has-text("Entries")',
  "Recently Modified Assets (doc step)":
    'text=Recently Modified Assets, [data-test-id*="recently" i]:has-text("Assets")',
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
