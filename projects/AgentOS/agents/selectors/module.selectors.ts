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

  // create-an-agent — New Agent button (confirmed: cs-automate--add-new-agent-cta-button from DOM)
  "+ New Agent button (doc step)":
    '[data-test-id="cs-automate--add-new-agent-cta-button"], button[data-test-id="newAgentButtonHeader"], [data-test-id="custom-agents-click-btn-primary-action-landing-create-agent"], button:has-text("+ New Agent"), button:has-text("New Agent")',

  // + New Agent dropdown options (clicking + New Agent button opens a dropdown, not a modal directly)
  "Create manually option in New Agent dropdown (doc step)":
    '[data-test-id="cs-automate--add-new-agent-cta-dropdown-create-manually-button"], button:has-text("Create manually"), [role="menuitem"]:has-text("Create manually")',

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

  // edit-an-agent / delete-an-agent — vertical ellipsis / three-dot menu on a user agent card
  "vertical ellipses on an agent (doc step)":
    '[data-test-id*="cs-agentos-custom-agents"][data-test-id*="action"], [data-test-id*="cs-agentos"][data-test-id*="more"], [data-testid*="custom-agents"][data-testid*="more"], .agent-card button[class*="more"], .agent-card button[class*="action"], [class*="agent-card"] button[aria-label*="more" i], [class*="agent-card"] button[aria-label*="options" i], [class*="agent-list"] button[class*="more"], button[data-test-id*="agent"][data-test-id*="more"]',
  // edit-an-agent dropdown options
  "Edit Agent option in dropdown (doc step)":
    '[role="menuitem"]:has-text("Edit Agent"), [role="option"]:has-text("Edit Agent"), li:has-text("Edit Agent"), button:has-text("Edit Agent"), [data-test-id*="edit-agent"]',
  // delete-an-agent dropdown options
  "Delete option in dropdown (doc step)":
    '[role="menuitem"]:has-text("Delete"), [role="option"]:has-text("Delete"), li:has-text("Delete"), button:has-text("Delete"), [data-test-id*="delete-agent"]',
  "Delete button in Delete Agent pop-up (doc step)":
    '[role="dialog"] button:has-text("Delete"), .ReactModal__Content button:has-text("Delete"), [data-test-id*="confirm-delete"]',

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
  // delete-an-agent — DELETE confirmation input in the Delete Agent pop-up
  "DELETE confirmation input in Delete Agent pop-up (doc step)":
    '[role="dialog"] input[placeholder*="DELETE" i], [role="dialog"] input[placeholder*="delete" i], .ReactModal__Content input[type="text"], [data-test-id*="delete-confirm"] input',
};
