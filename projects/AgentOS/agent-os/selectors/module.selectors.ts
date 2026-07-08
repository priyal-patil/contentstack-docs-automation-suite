export const CLICK_SELECTORS: Record<string, string> = {
  // projects-list.html
  "App Switcher icon (doc step)":
    '[data-test-id="app-switcher"], [aria-label="App Switcher"], [data-testid="app-switcher"]',
  "Agent OS (doc step)":
    '[data-test-id="cs-agent os-button"], [aria-label="agent os"], [role="menuitem"]:has-text("Agent OS"), button:has-text("Agent OS"), a:has-text("Agent OS")',
  "Projects page (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Projects"), .PageTitle:has-text("Projects")',
  "+ New Project (doc step)":
    'button[data-test-id="newProjectButtonHeader"], button:has-text("New Project")',

  // create-new-project-m.html + edit-settings.html
  "Create New Project modal (doc step)":
    '[data-test-id="cs-modal-title-create-new-project"]',
  "Project Name field (doc step)":
    '[data-test-id="cs-field-label"]:has-text("Project Name")',
  "Description field (doc step)":
    '[data-test-id="cs-field-label"]:has-text("Description")',
  "Tags field (doc step)":
    '[data-test-id="cs-field-label"]:has-text("Tags")',
  "Create Project button (doc step)":
    'button[data-test-id="createProject"]',
  "Cancel create project (doc step)":
    'button[data-test-id="cancelCreateProject"]',

  // edit-settings.html — Settings nav in top bar (within a project)
  "Settings (doc step)":
    'button[data-test-id="automate-nav-settings"], button[data-test-id="automations-nav-app-settings"]',
  "General settings tab (doc step)":
    '[data-test-id="cs-automate--project-settings-layout-left-navigation-general"]',
  "Save Changes button (doc step)":
    'button[data-testid="attribute-form-submit"]',
  "Advanced Settings section (doc step)":
    'h1.section-heading:has-text("Advanced Settings"), .advanced-settings-section h1:has-text("Advanced Settings")',
  "Delete Project button (doc step)":
    'button:has(.delete-btn-content), button:has-text("Delete Project"):not(.delete-project-btn)',

  // delete-project-modal.html
  "Delete Project modal (doc step)":
    '[data-test-id="cs-modal-title-delete-project"], .delete-project-modal',
  "Yes Delete Project button (doc step)":
    'button.delete-project-btn, button:has-text("Yes, Delete Project")',

  // view-execution-log-of-agent-os
  "Any existing project card (doc step)":
    '[data-test-id="cs-stackcard"]:has-text("PriyalDocsAutomation"), [data-test-id="cs-stackcard"]',
  "PriyalDocsAutomation project card (doc step)":
    '[data-test-id="cs-stackcard"]:has-text("PriyalDocsAutomation"), [data-test-id="cs-stacklist-card-PriyalDocsAutomation"]',
  "Project Dashboard loaded (doc step)":
    '[data-test-id="automate-nav-dashboard"], nav:has([data-test-id="automate-nav-settings"])',
  "Execution Log in left nav (doc step)":
    '[data-test-id="cs-automate--project-settings-layout-left-navigation-execution-log"]',
  "Audit Log tab (doc step)":
    '[data-test-id="cs-automate--project-settings-layout-left-navigation-audit-log"]',
  "Users in left nav (doc step)":
    '[data-test-id="cs-automate--project-settings-layout-left-navigation-users"]',
  "Invite Users field (doc step)":
    '[data-test-id="cs-invite-users"], label:has-text("Invite Users"), :text("Invite Users")',

  // error-notification — org-level Settings from the Projects page (automations-nav-app-settings is the unique top-nav Settings button on the Projects page)
  "Settings icon on Projects page (doc step)":
    '[data-test-id="automations-nav-app-settings"]',
  // Verify selector targets the toggle div itself so extractElementLabel reads its actual text
  // ("Enable error notification for automation(s)"), not the "Email Notifications" left-nav item
  // which was silently matching and preventing the doc/UI mismatch warning from firing.
  "Email Notifications toggle (doc step)":
    '[data-test-id="cs-toggle-switch"]',
  "Primary Recipient(s) field (doc step)":
    'label:has-text("Primary Recipient"), :text("Primary Recipient")',
  "Add Other Recipients field (doc step)":
    'label:has-text("Add Other Recipient"), :text("Add Other Recipient")',
  "Frequency of Notifications field (doc step)":
    'label:has-text("Frequency of Notifications"), :text("Frequency of Notifications"), h2:has-text("Frequency")',
  "Throttle Frequency field (doc step)":
    'label:has-text("Throttle Frequency"), :text("Throttle Frequency"), h2:has-text("Throttle Frequency")',
  // Primary Recipient(s) — React Select with class "automations-recipients-select"; only enabled after toggle is ON
  "Primary Recipient(s) dropdown input (doc step)":
    '.automations-recipients-select .Select__control, .automations-recipients-select [class*="Select__control"], #recipient .Select__control',
  "Automation Creator option (doc step)":
    '[role="option"]:has-text("Automation Creator"), [class*="Select__option"]:has-text("Automation Creator"), [class*="option"]:has-text("Automation Creator")',
  "Org Owner option (doc step)":
    '[role="option"]:has-text("Org Owner"), [class*="Select__option"]:has-text("Org Owner"), [class*="option"]:has-text("Org Owner")',
  "Org Admins option (doc step)":
    '[role="option"]:has-text("Org Admins"), [class*="Select__option"]:has-text("Org Admins"), [class*="option"]:has-text("Org Admins")',
  // Frequency radio buttons: data-test-id="cs-radio"; UI shows "Immediate" (doc says "Immediately")
  "Immediately option (doc step)":
    '[data-test-id="cs-radio"]:has-text("Immediately"), [data-test-id="cs-radio"]:has-text("Immediate"), [class*="Radio__label"]:has-text("Immediately"), [class*="Radio__label"]:has-text("Immediate")',
  "Daily option (doc step)":
    '[data-test-id="cs-radio"]:has-text("Daily"), [class*="Radio__label"]:has-text("Daily")',
  "Weekly option (doc step)":
    '[data-test-id="cs-radio"]:has-text("Weekly"), [class*="Radio__label"]:has-text("Weekly")',
  "Cancel Settings button (doc step)":
    '[data-test-id="cancelSaveSettings"], button:has-text("Cancel")',
  "Save button on Settings page (doc step)":
    'button:text-is("Save"), button[data-test-id="cs-button"]:has-text("Save")',
  "Execution log type filter dropdown (doc step)":
    '[data-test-id="cs-execution-log-filter-automations"], [data-test-id="cs-execution-log-type-filter"], button:has-text("Automation"), [class*="ExecutionLog__filter"], [class*="filter-dropdown"]:has-text("Automation")',
  "Agents dropdown option (doc step)":
    '[data-test-id="cs-execution-log-filter-agents"], [role="option"]:has-text("Agent"), [role="menuitem"]:has-text("Agent"), li:has-text("Agent"), button:has-text("Agent")',
  "Automations dropdown option (doc step)":
    '[data-test-id="cs-execution-log-filter-automations"], [role="option"]:has-text("Automation"), [role="menuitem"]:has-text("Automation"), li:has-text("Automation"), button:has-text("Automation")',
  "Name column header (doc step)":
    'th:has-text("Name"), [role="columnheader"]:has-text("Name")',
  "Status column header (doc step)":
    'th:has-text("Status"), [role="columnheader"]:has-text("Status")',
  "Started At column header (doc step)":
    'th:has-text("Started At"), [role="columnheader"]:has-text("Started At")',
  "Duration column header (doc step)":
    'th:has-text("Duration"), [role="columnheader"]:has-text("Duration")',
  "Connectors Used column header (doc step)":
    'th:has-text("Connectors Used"), [role="columnheader"]:has-text("Connectors Used")',
  "Tools Used column header (doc step)":
    'th:has-text("Tools Used"), [role="columnheader"]:has-text("Tools Used")',

  // execution log detail view — shared labels (Automations and Agents)
  "Started At in execution detail (doc step)":
    '[data-test-id*="started-at"], [class*="started-at"], [class*="StartedAt"], dt:has-text("Started At"), label:has-text("Started At"), span:has-text("Started At"), :text("Started At"):not(th):not([role="columnheader"])',
  "Duration in execution detail (doc step)":
    '[data-test-id*="duration"], [class*="duration"], dt:has-text("Duration"), label:has-text("Duration"), span:has-text("Duration"), :text("Duration"):not(th):not([role="columnheader"])',
  "Input in execution detail (doc step)":
    '[data-test-id*="detail-input"], [class*="detail-input"], dt:has-text("Input"), label:has-text("Input"), span:has-text("Input"), :text("Input"):not(th)',
  "Output in execution detail (doc step)":
    '[data-test-id*="detail-output"], [class*="detail-output"], dt:has-text("Output"), label:has-text("Output"), span:has-text("Output"), :text("Output"):not(th)',
  "Back to Execution Log button (doc step)":
    'button[data-test-id="cs-page-layout-go-back"], [aria-label="Go back"], button:has-text("Execution Log"), [data-test-id="cs-breadcrumb-link-0"]',

  // execution log detail view — Agent-specific labels
  "Execution steps in execution detail (doc step)":
    '[data-test-id*="execution-steps"], [class*="execution-steps"], h2:has-text("Execution steps"), h3:has-text("Execution steps"), :text("Execution steps")',
  "Metrics section in execution detail (doc step)":
    '[data-test-id*="metrics"], [class*="metrics-section"], h2:has-text("Metrics"), h3:has-text("Metrics"), :text("Metrics")',
  "Total Tokens in execution detail (doc step)":
    '[data-test-id*="total-tokens"], [class*="total-tokens"], dt:has-text("Total Tokens"), label:has-text("Total Tokens"), span:has-text("Total Tokens"), :text("Total Tokens")',
  "Model in execution detail (doc step)":
    '[data-test-id*="model-name"], [class*="model-name"], dt:has-text("Model"), label:has-text("Model"), span:has-text("Model"), :text("Model")',

  "First log entry row (doc step)":
    'tbody tr:first-child, [role="row"]:not([role="columnheader"]):first-child',
  "Failed status in execution log (doc step)":
    '[data-test-id="cs-execution-log-status-failed"], td:has-text("Failed"), [class*="status"]:has-text("Failed")',
  "Info icon on failed execution (doc step)":
    '[data-test-id="cs-execution-log-info-icon"], [aria-label="Info"], button[title="Info"], td [data-test-id*="info"]',
  "Retry Execution button (doc step)":
    '[data-test-id="cs-retry-execution"], button:has-text("Retry Execution"), button:has-text("Retry")',

  // monitor-agent-os-activities-in-audit-log — audit log table columns
  "Date column header (doc step)":
    'th:has-text("Date"), [role="columnheader"]:has-text("Date")',
  "Module column header (doc step)":
    'th:has-text("Module"), [role="columnheader"]:has-text("Module")',
  "Action column header (doc step)":
    'th:has-text("Action"), [role="columnheader"]:has-text("Action")',
  "Title column header (doc step)":
    'th:has-text("Title"), [role="columnheader"]:has-text("Title")',

  // project-sharing — invite users
  "Invite Users button (doc step)":
    'button:has-text("Invite Users"), [data-test-id*="invite-users-button"], [data-test-id*="cs-invite-btn"]',

  // executions-in-agent-os — code and copy icons in execution detail
  "Code icon in execution detail (doc step)":
    '[data-test-id*="code-icon"], [aria-label="Code"], button[title="Code"], [class*="code-icon"], svg[name*="Code"]',
  "Copy icon in execution detail (doc step)":
    '[data-test-id*="copy-icon"], [aria-label="Copy"], button[title="Copy"], [class*="copy-icon"], svg[name*="Copy"]',

  // agent-os-dashboard
  "Overview section on Dashboard (doc step)":
    '[data-test-id*="overview"], [class*="overview-section"], h2:has-text("Overview"), :text("Overview")',
  "Execution Log section on Dashboard (doc step)":
    '[data-test-id*="execution-log"]:not([data-test-id*="navigation"]), [class*="execution-log"]:not([class*="nav"]), h2:has-text("Execution Log"), :text("Execution Log")',

  // projects-list.html — project card and star icon
  "Project card (doc step)":
    '[data-test-id="cs-stackcard"]:has-text("Auto Project")',
  "Go back to Projects (doc step)":
    'button[data-test-id="cs-page-layout-go-back"]',
  "Star icon (doc step)":
    '[data-test-id="cs-stackcard-mark-as-favourite-and-pin-to-the-top"], button.StackCard__star-button',
};

export const INPUT_SELECTORS: Record<string, string> = {
  // create-new-project-m.html
  "Project Name input (doc step)":
    'input[data-testid="title-input"], input[placeholder="Enter project name"]',
  "Description input (doc step)":
    'textarea[data-testid="description-input"], textarea[placeholder="Provide a description"]',

  // delete-project-modal.html — type project name to confirm deletion
  "Delete Project name confirm input (doc step)":
    '.delete-project-modal input[placeholder="Enter your project name"], input[placeholder="Enter your project name"]',
};
