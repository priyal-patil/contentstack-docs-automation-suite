export const CLICK_SELECTORS: Record<string, string> = {
  // Navigation — shared with agent-os module
  "App Switcher icon (doc step)":
    '[data-test-id="app-switcher"], [aria-label="App Switcher"], [data-testid="app-switcher"]',
  "Agent OS (doc step)":
    '[data-test-id="cs-agent os-button"], [aria-label="agent os"], [role="menuitem"]:has-text("Agent OS"), button:has-text("Agent OS"), a:has-text("Agent OS")',
  "Any existing project card (doc step)":
    '[data-test-id="cs-stackcard"]',
  "Project Dashboard loaded (doc step)":
    '[data-test-id="automate-nav-dashboard"], nav:has([data-test-id="automate-nav-settings"])',

  // Agents nav in top navigation panel — confirmed from delete-an-agent-step-5-failure.html
  "Agents in top navigation panel (doc step)":
    '[data-test-id="automate-nav-agents-agentos"], button[aria-label="Agents"][data-test-id="automate-nav-agents-agentos"]',

  // create-an-agent — New Agent button on the Agents listing page (not Dashboard)
  "+ New Agent button (doc step)":
    'button[data-test-id="newAgentButtonHeader"], button:has-text("+ New Agent"), button:has-text("New Agent")',

  // Create Agent modal
  "Create Agent modal (doc step)":
    '[data-test-id="cs-modal-title-create-new-agent"], [role="dialog"]:has-text("Create Agent"), .ReactModal__Content:has-text("Create Agent")',
  "Skip, I'll create manually link (doc step)":
    '[data-test-id="cs-skip-manual-setup"], button:has-text("Skip, I\'ll create manually"), a:has-text("Skip, I\'ll create manually"), :text("Skip, I\'ll create manually")',
  "Title field (doc step)":
    '[data-test-id="cs-field-label"]:has-text("Title"), label:has-text("Title")',
  "Description field in Create Agent (doc step)":
    '[data-test-id="cs-field-label"]:has-text("Description"), label:has-text("Description")',
  "Create Agent button (doc step)":
    '[role="dialog"] button[data-test-id="createAgent"], [role="dialog"] button:has-text("Create Agent"), .ReactModal__Content button:has-text("Create Agent")',

  // Agent Builder page — landed after agent creation
  "Agent Builder page (doc step)":
    '[data-test-id="cs-agent-builder"], h1:has-text("Agent Builder"), [class*="AgentBuilder"], :text("Agent Builder")',

  // Agent Builder components
  "Trigger component (doc step)":
    '[data-test-id="cs-agent-builder-trigger"], [data-test-id*="trigger"], h2:has-text("Trigger"), button:has-text("Trigger"), :text("Trigger")',
  "Tools component (doc step)":
    '[data-test-id="cs-agent-builder-tools"], [data-test-id*="tools"], h2:has-text("Tools"), button:has-text("Tools"), :text("Tools")',
  "Instructions component (doc step)":
    '[data-test-id="cs-agent-builder-instructions"], [data-test-id*="instructions"], h2:has-text("Instructions"), button:has-text("Instructions"), :text("Instructions")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  // Create Agent modal inputs
  "Title input (doc step)":
    '[role="dialog"] input[data-testid="title-input"], [role="dialog"] input[placeholder*="title" i], [role="dialog"] input[name="title"], .ReactModal__Content input[type="text"]',
  "Description input in Create Agent (doc step)":
    '[role="dialog"] textarea[data-testid="description-input"], [role="dialog"] textarea[placeholder*="description" i], [role="dialog"] textarea[name="description"], .ReactModal__Content textarea',
};
