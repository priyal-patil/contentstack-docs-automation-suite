export const CLICK_SELECTORS: Record<string, string> = {
  "App Switcher icon (doc step)":
    'button:has-text("App Switcher"), [aria-label*="App Switcher" i], [aria-label*="apps" i], [aria-label*="switcher" i], [data-test-id*="app-switcher" i], [data-test-id*="appswitcher" i], #app-switcher, [id*="app-switcher" i]',
  "Agent OS (doc step)":
    '[role="menuitem"]:has-text("Agent OS"), button:has-text("Agent OS"), a:has-text("Agent OS"), [data-test-id*="agent" i]',
  "+ New Project (doc step)":
    'button:has-text("+ New Project"), button:has-text("New Project"), [aria-label*="New Project" i], [data-test-id*="new-project" i]',
  "New project modal (doc step)":
    '[role="dialog"]:has-text("New project"), [role="dialog"]:has-text("Project Name")',
  "Create (doc step)":
    '[role="dialog"] button:has-text("Create"), button:has-text("Create")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Project Name (doc step)":
    '[role="dialog"] input[aria-label*="Project Name" i], [role="dialog"] input[name*="project" i], [role="dialog"] input[placeholder*="Project" i], [role="dialog"] input[type="text"]',
  "Description (doc step)":
    '[role="dialog"] textarea[aria-label*="Description" i], [role="dialog"] textarea[name*="description" i], [role="dialog"] textarea',
  "Tags (doc step)":
    '[role="dialog"] [data-test-id="cs-pill"], [role="dialog"] [data-test-id="cs-pill"] input, [role="dialog"] input[aria-label*="Tag" i], [role="dialog"] input[placeholder*="Tag" i], [role="dialog"] [data-test-id*="tag" i] input',
};
