export const CLICK_SELECTORS: Record<string, string> = {
  // Navigation — shared with other AgentOS modules
  "App Switcher icon in top navigation (doc step)":
    '[data-test-id="app-switcher"], [aria-label="App Switcher"], [data-testid="app-switcher"]',
  "Agent OS option in App Switcher list (doc step)":
    '[data-test-id="cs-agent os-button"], [aria-label="agent os"], [role="menuitem"]:has-text("Agent OS"), button:has-text("Agent OS"), a:has-text("Agent OS")',
  "existing project on Agent OS projects page (doc step)":
    '[data-test-id="cs-stackcard"]',

  // Project Dashboard nav — clicking project card from projects list lands on Automations page; need to go to Dashboard first to access project-level Settings
  "Project Dashboard nav item (doc step)":
    '[data-test-id="automate-nav-dashboard"], button[data-test-id="automate-nav-dashboard"]',

  // Settings — project-level settings with sidenav (only available from Project Dashboard, NOT from within Automations)
  "Settings option in top navigation panel (doc step)":
    'button[data-test-id="automate-nav-settings"]',

  // Variables settings page — left navigation
  "Variables option in left navigation (doc step)":
    '[data-test-id="cs-automate--project-settings-layout-left-navigation-variables"], a:has-text("Variables"), [role="menuitem"]:has-text("Variables"), li:has-text("Variables")',

  // Add variable pop-up
  "+ icon to add a new project variable (doc step)":
    '[data-test-id="table-panel-action-items"] button, [data-test-id="table-panel-action-items"], button[data-test-id*="add-variable"], button:has([data-test-id="cs-icon"][name="Plus"])',
  "Variable Type field in add variable pop-up (doc step)":
    '[data-test-id="cs-field-label"]:has-text("Variable Type"), label:has-text("Variable Type")',
  "Variable Type dropdown (doc step)":
    '.variable-type, [data-test-id="cs-field"]:has(label:has-text("Variable Type"))',
  "Plain Text option in Variable Type dropdown (doc step)":
    '[data-test-id="cs-radio"]:has(input[name="textType"]), label[data-test-id="cs-radio"]:has-text("Plain Text"), input[name="textType"]',
  "Secret option in Variable Type dropdown (doc step)":
    '[data-test-id="cs-radio"]:has(input[name="passwordType"]), label[data-test-id="cs-radio"]:has-text("Secret"), input[name="passwordType"]',
  "Key field in add variable pop-up (doc step)":
    '[data-test-id="cs-field-label"]:has-text("Key"), label:has-text("Key")',
  "Value field in add variable pop-up (doc step)":
    '[data-test-id="cs-field-label"]:has-text("Value"), label:has-text("Value")',
  // Save button in Create Variable modal — confirmed DOM: data-test-id="createProjectVariable"
  "Save button in add variable pop-up (doc step)":
    'button[data-test-id="createProjectVariable"], [role="dialog"] button:has-text("Save"), .ReactModal__Content button:has-text("Save")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Key input in add variable pop-up (doc step)":
    '[role="dialog"] input[placeholder*="key" i], [role="dialog"] input[name*="key" i], .ReactModal__Content input[type="text"]:first-of-type, [data-test-id*="variable-key"] input',
  "Value input in add variable pop-up (doc step)":
    '[role="dialog"] input[placeholder*="value" i], [role="dialog"] input[name*="value" i], .ReactModal__Content input[type="text"]:last-of-type, [data-test-id*="variable-value"] input',
};
