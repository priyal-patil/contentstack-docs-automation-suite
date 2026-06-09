export const CLICK_SELECTORS: Record<string, string> = {
  // ── Navigation ─────────────────────────────────────────────────────────────
  "App Switcher icon (doc step)":
    '[data-test-id="app-switcher"], [data-test-id="app-switcher-toolbar"], [aria-label="App Switcher"]',
  "Agent OS (doc step)":
    '[data-test-id="cs-agent os-button"], [aria-label="agent os"], [role="menuitem"]:has-text("Agent OS"), a:has-text("Agent OS")',

  // ── Projects list ──────────────────────────────────────────────────────────
  "+ New Project (doc step)":
    '[data-test-id="newProjectButtonHeader"], button:has-text("New Project")',

  // ── Create modal actions ───────────────────────────────────────────────────
  "Create (doc step)":
    'button[data-test-id="createProject"], button[data-testid="attribute-form-submit"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  // ── Verify targets ─────────────────────────────────────────────────────────
  "New project modal (doc step)":
    '[data-test-id="cs-modal-title-create-new-project"], h3[title="Create New Project"]',
  "Project Name (doc step)":
    'input[data-testid="title-input"], input[name="title"], input[placeholder="Enter project name"]',
  "Description (doc step)":
    'textarea[data-testid="description-input"], textarea[name="description"], textarea[placeholder="Provide a description"]',
  "Tags (doc step)":
    '[data-test-id="cs-pill"] input, [data-rbd-droppable-id="PillDroppable"] input, [data-test-id="cs-pill"]',
};
