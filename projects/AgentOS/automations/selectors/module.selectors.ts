export const CLICK_SELECTORS: Record<string, string> = {
  // ── App Switcher navigation (data-test-ids confirmed from live DOM) ──────
  "Agent OS in App Switcher list (doc step)":
    '[data-test-id="app-switcher-automate"]',
  "Marketplace in App Switcher list (doc step)":
    '[data-test-id="app-switcher-marketplace"]',
  "CMS in App Switcher list (doc step)":
    '[data-test-id="app-switcher-cms"]',

  // ── Projects listing (shared with agent-os module patterns) ─────────────
  "+ New Project button (doc step)":
    'button[data-test-id="newProjectButtonHeader"], button:has-text("+ New Project"), button:has-text("New Project")',
  "+ New Project button on projects listing page (doc step)":
    'button[data-test-id="newProjectButtonHeader"], button:has-text("+ New Project"), button:has-text("New Project")',
  "any existing project card (doc step)":
    '[data-test-id="cs-stackcard"]',
  "any existing project card on projects listing page (doc step)":
    '[data-test-id="cs-stackcard"]',
  "projects listing page (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Projects"), .PageTitle:has-text("Projects")',
  "Agent OS (doc step)":
    '[data-test-id="app-switcher-automate"], [data-test-id="cs-agent os-button"], a:has-text("Agent OS")',
  "+ New Automation button (doc step)":
    'button[data-test-id="newAutomationButtonHeader"], button:has-text("+ New Automation"), button:has-text("New Automation")',
  "+ New Automation button on Automations listing page (doc step)":
    'button[data-test-id="newAutomationButtonHeader"], button:has-text("+ New Automation"), button:has-text("New Automation")',

  // ── Create New option in dropdown ────────────────────────────────────────
  "Create New option in dropdown (doc step)":
    '[role="option"]:has-text("Create New"), [role="menuitem"]:has-text("Create New"), li:has-text("Create New")',

  // ── Create / Clone Automation modals ────────────────────────────────────
  "Automation Name field (doc step)":
    'label:has-text("Automation Name"), [class*="field-label"]:has-text("Automation Name")',
  "Automation Name input (doc step)":
    'input[placeholder*="automation name" i], input[placeholder*="Enter name" i], input[name="automationName"]',
  "Automation Description field (doc step)":
    'label:has-text("Description"), [class*="field-label"]:has-text("Description")',
  "Create button in New Automation (doc step)":
    'button:text-is("Create"), button[data-test-id="createAutomation"]',
  "Automation Name field in Create New Automation modal (doc step)":
    'label:has-text("Automation Name"), [class*="field-label"]:has-text("Automation Name")',
  "Automation Name input in Create New Automation modal (doc step)":
    'input[placeholder*="automation name" i], input[placeholder*="Enter name" i], input[name="automationName"]',
  "Clone Automation modal (doc step)":
    '[data-test-id="cs-modal-title-clone-automation"], [role="dialog"]:has-text("Clone Automation")',
  "Automation Name field in Clone Automation modal (doc step)":
    'label:has-text("Automation Name"), [class*="field-label"]:has-text("Automation Name")',
  "Automation Name input in Clone Automation modal (doc step)":
    'input[placeholder*="automation name" i], input[placeholder*="Enter name" i], input[name="automationName"]',
  "Clone button in Clone Automation modal (doc step)":
    'button:text-is("Clone"), button[data-test-id="cloneAutomation"]',
  "Update button in Edit Automation modal (doc step)":
    'button:text-is("Update"), button[data-test-id="updateAutomation"]',

  // ── Automations listing page ─────────────────────────────────────────────
  "Automations listing page (doc step)":
    '[class*="automation-list"], [class*="automations-list"], [data-test-id*="automation-list"]',
  "Automations listing page after Update (doc step)":
    '[class*="automation-list"], [class*="automations-list"], [data-test-id*="automation-list"]',
  "any existing automation on Automations listing page (doc step)":
    '[class*="automation-row"], tr[class*="automation"], [data-test-id*="automation-row"]',
  "any existing automation row on Automations listing page (doc step)":
    '[class*="automation-row"], tr[class*="automation"], [data-test-id*="automation-row"]',
  "vertical ellipses on automation row (doc step)":
    '[data-test-id="cs-table-action-options"]',
  "vertical ellipses under Actions column on automation row (doc step)":
    '[data-test-id="cs-table-action-options"]',
  "vertical three dots under Actions column on automation row (doc step)":
    '[data-test-id="cs-table-action-options"]',
  "Actions column on Automations listing page (doc step)":
    'th:has-text("Actions"), [role="columnheader"]:has-text("Actions")',
  "clone icon on automation row on Automations listing page (doc step)":
    '[data-test-id="cs-table-action-options"]',
  "Automations in top navigation panel (doc step)":
    '[data-test-id="automate-nav-automations"], button[aria-label="Automations"], a:has-text("Automations")',
  "Automations in top navigation panel to return to listing (doc step)":
    '[data-test-id="automate-nav-automations"], button[aria-label="Automations"], a:has-text("Automations")',
  "Automations project page (doc step)":
    '[class*="automation-list"], [data-test-id*="automation-list"], h1:has-text("Automations")',
  "On-demand Automation project (doc step)":
    '[data-test-id="cs-stackcard"]:has-text("On-demand"), [class*="StackCard"]:has-text("On-demand")',

  // ── Configure Trigger ────────────────────────────────────────────────────
  "Configure Trigger in left navigation panel (doc step)":
    '[data-test-id="automate-nav-configure-trigger"], [data-test-id="automations-nav-configure-trigger"], button:has-text("Configure Trigger"), a:has-text("Configure Trigger")',
  "Configure Trigger in left navigation (doc step)":
    '[data-test-id="automate-nav-configure-trigger"], [data-test-id="automations-nav-configure-trigger"], button:has-text("Configure Trigger"), a:has-text("Configure Trigger")',
  "Choose Trigger section (doc step)":
    'h2:has-text("Choose Trigger"), h1:has-text("Choose Trigger"), [class*="choose-trigger"]',
  "Choose Trigger section after selecting a connector (doc step)":
    '[class*="choose-trigger"], h2:has-text("Choose Trigger")',
  "On-Demand Automation trigger (doc step)":
    '[class*="trigger"]:has-text("On-Demand Automation"), [role="option"]:has-text("On-Demand Automation"), button:has-text("On-Demand Automation")',
  "Entry Sidebar trigger under Choose Trigger (doc step)":
    '[class*="trigger"]:has-text("Entry Sidebar"), [role="option"]:has-text("Entry Sidebar"), button:has-text("Entry Sidebar")',
  "Stack field on Entry Sidebar Configure Trigger page (doc step)":
    'label:has-text("Stack"), [class*="field-label"]:has-text("Stack")',
  "Branch field on Entry Sidebar Configure Trigger page (doc step)":
    'label:has-text("Branch"), [class*="field-label"]:has-text("Branch")',
  "Show Optional Fields toggle button (doc step)":
    'button:has-text("Show Optional Fields"), [class*="toggle"]:has-text("Optional Fields"), [class*="optional-fields-toggle"]',
  "Show Optional Fields toggle button on Configure Action page (doc step)":
    'button:has-text("Show Optional Fields"), [class*="toggle"]:has-text("Optional Fields"), [class*="optional-fields-toggle"]',
  "+ Input Options button (doc step)":
    'button:has-text("+ Input Options"), button:has-text("Input Options"), button[data-test-id*="input-options"]',
  "Input Label field (doc step)":
    'label:has-text("Input Label"), [class*="field-label"]:has-text("Input Label")',
  "Input Type drop-down (doc step)":
    'label:has-text("Input Type"), [class*="field-label"]:has-text("Input Type")',
  "String option in Input Type drop-down (doc step)":
    '[role="option"]:has-text("String"), li:has-text("String"), [class*="option"]:has-text("String")',
  "Input Description field (doc step)":
    'label:has-text("Input Description"), label:has-text("Description"), [class*="field-label"]:has-text("Description")',
  "Proceed button in Configure Trigger (doc step)":
    'button:has-text("Proceed"), button[data-test-id*="proceed"]',
  "Test Trigger button (doc step)":
    'button:has-text("Test Trigger"), button[data-test-id*="test-trigger"]',
  "Save and Exit button in Configure Trigger (doc step)":
    'button:has-text("Save and Exit"), button[data-test-id*="save-exit"]',

  // ── Configure Action Step ────────────────────────────────────────────────
  "Configure Action Step in left navigation panel (doc step)":
    '[data-test-id="automate-nav-configure-action"], [data-test-id="automations-nav-configure-action"], button:has-text("Configure Action"), a:has-text("Configure Action")',
  "Configure Action Step in left navigation (doc step)":
    '[data-test-id="automate-nav-configure-action"], [data-test-id="automations-nav-configure-action"], button:has-text("Configure Action"), a:has-text("Configure Action")',
  "Action Step button (doc step)":
    'button:has-text("Action Step"), button:has-text("+ Add Step"), button[data-test-id*="action-step"]',
  "Action Step option on Configure Action Step page (doc step)":
    'button:has-text("Action Step"), [role="option"]:has-text("Action Step")',
  "Conditional Path option (doc step)":
    'button:has-text("Conditional Path"), [role="option"]:has-text("Conditional Path"), [class*="conditional-path"]',
  "Choose Connector section on Configure Action Step page (doc step)":
    'h2:has-text("Choose Connector"), [class*="choose-connector"]',
  "Choose Connector section on Configure Action Step page for Algolia (doc step)":
    'h2:has-text("Choose Connector"), [class*="choose-connector"]',
  "Choose Connector section on Configure Action Step page for Else step (doc step)":
    'h2:has-text("Choose Connector"), [class*="choose-connector"]',
  "Choose Connector section on Configure Trigger page (doc step)":
    'h2:has-text("Choose Connector"), [class*="choose-connector"]',
  "any connector from Choose Connector list (doc step)":
    '[class*="connector-card"], [class*="ConnectorCard"], [class*="connector-item"]',
  "Email by Agent OS connector (doc step)":
    '[class*="connector"]:has-text("Email by Agent OS"), [class*="ConnectorCard"]:has-text("Email"), button:has-text("Email by Agent OS")',
  "Slack connector in Choose Connector list (doc step)":
    '[class*="connector"]:has-text("Slack"), [class*="ConnectorCard"]:has-text("Slack"), button:has-text("Slack")',
  "Slack connector from Choose Connector list (doc step)":
    '[class*="connector"]:has-text("Slack"), [class*="ConnectorCard"]:has-text("Slack"), button:has-text("Slack")',
  "Transform connector in Choose Connector list (doc step)":
    '[class*="connector"]:has-text("Transform"), [class*="ConnectorCard"]:has-text("Transform"), button:has-text("Transform")',
  "Algolia connector in Choose Connector list (doc step)":
    '[class*="connector"]:has-text("Algolia"), [class*="ConnectorCard"]:has-text("Algolia"), button:has-text("Algolia")',
  "Choose an Action tab (doc step)":
    'h2:has-text("Choose an Action"), [class*="choose-action"], button[role="tab"]:has-text("Action")',
  "Choose an Action section after selecting Algolia connector (doc step)":
    'h2:has-text("Choose an Action"), [class*="choose-action"]',
  "Choose an Action section after selecting Slack connector (doc step)":
    'h2:has-text("Choose an Action"), [class*="choose-action"]',
  "Choose an Action section after selecting Transform connector (doc step)":
    'h2:has-text("Choose an Action"), [class*="choose-action"]',
  "Email by Agent OS action under Choose an Action tab (doc step)":
    '[class*="action"]:has-text("Email by Agent OS"), [class*="ActionCard"]:has-text("Email"), button:has-text("Email by Agent OS")',
  "Send Message action in Choose an Action list (doc step)":
    '[class*="action"]:has-text("Send Message"), button:has-text("Send Message")',
  "Transform action in Choose an Action list (doc step)":
    '[class*="action"]:has-text("Transform"), button:has-text("Transform")',
  "To field on Configure Action page (doc step)":
    'label:has-text("To"), [class*="field-label"]:has-text("To")',
  "Subject field on Configure Action page (doc step)":
    'label:has-text("Subject"), [class*="field-label"]:has-text("Subject")',
  "Body Type field on Configure Action page (doc step)":
    'label:has-text("Body Type"), [class*="field-label"]:has-text("Body Type")',
  "Body Type dropdown on Configure Action page (doc step)":
    'label:has-text("Body Type"), [class*="field"]:has-text("Body Type")',
  "Any Body Type option in dropdown (doc step)":
    '[role="option"], [class*="option"], li[class*="option"]',
  "Body field on Configure Action page (doc step)":
    'label:has-text("Body"), [class*="field-label"]:has-text("Body")',
  "CC field on Configure Action page (doc step)":
    'label:has-text("CC"), [class*="field-label"]:has-text("CC")',
  "BCC field on Configure Action page (doc step)":
    'label:has-text("BCC"), [class*="field-label"]:has-text("BCC")',
  "Proceed button in Configure Action Step (doc step)":
    'button:has-text("Proceed"), button[data-test-id*="proceed"]',
  "Test Action button (doc step)":
    'button:has-text("Test Action"), button[data-test-id*="test-action"]',
  "Test Action button for If step (doc step)":
    'button:has-text("Test Action"), button[data-test-id*="test-action"]',
  "Test Action button for Algolia Else step (doc step)":
    'button:has-text("Test Action"), button[data-test-id*="test-action"]',
  "Test Action button for Transform Else step (doc step)":
    'button:has-text("Test Action"), button[data-test-id*="test-action"]',
  "Save and Exit button in Configure Action Step (doc step)":
    'button:has-text("Save and Exit"), button[data-test-id*="save-exit"]',
  "+ Add New Step button below existing action steps (doc step)":
    'button:has-text("+ Add Step"), button:has-text("Add New Step"), button[data-test-id*="add-step"]',
  "+ Add Condition button (doc step)":
    'button:has-text("+ Add Condition"), button:has-text("Add Condition"), button[data-test-id*="add-condition"]',
  "+ Add Step button under If step (doc step)":
    'button:has-text("+ Add Step"), button[data-test-id*="if-add-step"]',
  "+ Add Step button under Else step (doc step)":
    'button:has-text("+ Add Step"), button[data-test-id*="else-add-step"]',
  "+ Add Step button under Else step for Algolia (doc step)":
    'button:has-text("+ Add Step"), button[data-test-id*="else-add-step"]',
  "any trigger from the selected connector in Choose Trigger list (doc step)":
    '[class*="trigger-item"], [class*="TriggerCard"], [class*="trigger-card"]',
  "any configured trigger tab (doc step)":
    '[class*="trigger-tab"], [role="tab"][class*="trigger"]',

  // ── Activate / Settings ───────────────────────────────────────────────────
  "Activate Automation toggle button (doc step)":
    'button:has-text("Activate Automation"), [class*="activate-toggle"], [data-test-id*="activate"]',
  "automation activate toggle at top-left corner (doc step)":
    'button:has-text("Activate"), [class*="activate-toggle"], [data-test-id*="activate"]',
  "Settings in automation navigation (doc step)":
    '[data-test-id="automate-nav-settings"], [data-test-id="automations-nav-settings"], button[aria-label="Settings"]',

  // ── Sharing ───────────────────────────────────────────────────────────────
  "checkbox to save and copy automation recipe link (doc step)":
    'input[type="checkbox"][name*="recipe"], input[type="checkbox"][name*="share"], [class*="recipe-checkbox"]',
  "recipe link copied to clipboard after Save and Copy Link (doc step)":
    '[class*="recipe-link"], input[value*="http"]',

  // ── Import / Export (test IDs confirmed from import-automation-m.html) ───
  "Choose a file button in Import Automation modal (doc step)":
    '[data-test-id="cs-import-file-choose"], input[type="file"]',
  "Import Automation modal (doc step)":
    '[data-test-id="cs-modal-title-import-automation"]',

  // ── Connectors — accounts ─────────────────────────────────────────────────
  "+ Add New Account button in Configure Action tab (doc step)":
    'button:has-text("+ Add New Account"), button:has-text("Add New Account"), button[data-test-id*="add-account"]',
  "+ Add New Account button in Configure Trigger (doc step)":
    'button:has-text("+ Add New Account"), button:has-text("Add New Account"), button[data-test-id*="add-account"]',
  "+ Add New Account button for Slack connector (doc step)":
    'button:has-text("+ Add New Account"), button:has-text("Add New Account")',
  "Add Account button for Algolia connector (doc step)":
    'button:has-text("Add Account"), button:has-text("+ Add Account"), button[data-test-id*="add-account"]',
  "Authorize button in Authorize Netlify modal (doc step)":
    'button:has-text("Authorize"), [role="dialog"] button:has-text("Authorize")',
  "Authorize button in Manage Permissions modal (doc step)":
    'button:has-text("Authorize"), [role="dialog"] button:has-text("Authorize")',
  "Authorize button in Manage Permissions popup (doc step)":
    'button:has-text("Authorize"), [role="dialog"] button:has-text("Authorize")',
  "Authorize button in permissions popup on new tab (doc step)":
    'button:has-text("Authorize"), button:has-text("Allow")',
  "Allow button in new tab opened by Slack authorization (doc step)":
    'button:has-text("Allow"), button:has-text("Authorize")',
  "Authorize Account modal (doc step)":
    '[role="dialog"]:has-text("Authorize"), [role="dialog"]:has-text("Account")',
  "Set Account Name modal (doc step)":
    '[role="dialog"]:has-text("Set Account"), [role="dialog"]:has-text("Account Name")',
  "Title field for Slack account (doc step)":
    'label:has-text("Title"), [class*="field-label"]:has-text("Title")',
  "Token field in Authorize Netlify modal (doc step)":
    'label:has-text("Token"), [class*="field-label"]:has-text("Token")',
  "Channel field in Slack Send Message configuration (doc step)":
    'label:has-text("Channel"), [class*="field-label"]:has-text("Channel")',
  "Channel field lookup in Slack Send Message configuration (doc step)":
    '[class*="lookup"]:has-text("Channel"), [class*="Lookup"]:has-text("Channel")',
  "first channel result in Channel lookup search results (doc step)":
    '[class*="lookup-result"]:first-child, [class*="LookupResult"]:first-child, [role="option"]:first-child',
  "search input in Channel lookup (doc step)":
    '[class*="lookup-search"] input, [class*="LookupSearch"] input',

  // ── Algolia-specific ──────────────────────────────────────────────────────
  "+ Add Objects to Merge button (doc step)":
    'button:has-text("+ Add Objects to Merge"), button:has-text("Add Objects")',
  "Select an Event field (doc step)":
    'label:has-text("Select an Event"), [class*="field-label"]:has-text("Event")',
  "content type UID input box (doc step)":
    'input[placeholder*="content type" i], input[name*="contentTypeUid"], input[data-test-id*="content-type-uid"]',
  "Add Input button in Transform Configure Action (doc step)":
    'button:has-text("Add Input"), button[data-test-id*="add-input"]',
  "Transformation field (doc step)":
    'label:has-text("Transformation"), [class*="field-label"]:has-text("Transformation")',
  "entry data from Transform step in Entries field options (doc step)":
    '[class*="option"]:has-text("Entries"), [role="option"]:has-text("Entries")',

  // ── Lookup dropdowns ──────────────────────────────────────────────────────
  "Branch Lookup dropdown (doc step)":
    '[class*="lookup"]:has-text("Branch"), [class*="Lookup"]:has-text("Branch")',
  "Stack Lookup dropdown (doc step)":
    '[class*="lookup"]:has-text("Stack"), [class*="Lookup"]:has-text("Stack")',
  "Any stack option in Select Stack dropdown (doc step)":
    '[role="option"]:not([aria-disabled="true"]):first-child, [class*="option"]:not([class*="disabled"]):first-child',
  "any branch from Branch Lookup dropdown (doc step)":
    '[role="option"]:first-child, [class*="option"]:first-child',
  "any stack from Stack Lookup dropdown (doc step)":
    '[role="option"]:first-child, [class*="option"]:first-child',
  "any index from Index Name list (doc step)":
    '[role="option"]:first-child, [class*="option"]:first-child',
  "any project option from Project Name drop-down (doc step)":
    '[role="option"]:first-child, [class*="option"]:first-child',
  "any project option from Select Project dropdown (doc step)":
    '[role="option"]:first-child, [class*="option"]:first-child',
  "Any branch option from Lookup list (doc step)":
    '[role="option"]:first-child, [class*="option"]:first-child',

  // ── Trigger rename ─────────────────────────────────────────────────────────
  "edit icon on trigger header (doc step)":
    'button[aria-label*="edit" i], button[title*="Edit"], svg[name*="Edit"]',
  "delete icon on trigger header (doc step)":
    'button[aria-label*="delete" i], button[title*="Delete"], svg[name*="Delete"]',
  "checkmark to confirm trigger rename (doc step)":
    'button[aria-label*="confirm" i], button[aria-label*="save" i], svg[name*="Check"]',

  // ── New Project ────────────────────────────────────────────────────────────
  "+ Create Project button (doc step)":
    'button[data-test-id="createProject"], button:has-text("Create Project")',

  // ── Tabs / icons ──────────────────────────────────────────────────────────
  "UI Locations tab on configuration screen (doc step)":
    '[role="tab"]:has-text("UI Locations"), button:has-text("UI Locations")',
  "View Recipes icon (doc step)":
    'button:has-text("View Recipes"), [aria-label*="View Recipes"]',
  "Manage Automations icon (doc step)":
    'button:has-text("Manage Automations"), [aria-label*="Manage Automations"]',
  "Automate icon in right navigation panel (doc step)":
    'button:has-text("Automate"), [aria-label*="Automate"], [data-test-id*="automate-icon"]',
  "Automate icon in right navigation panel on entry page (doc step)":
    'button:has-text("Automate"), [aria-label*="Automate"], [data-test-id*="automate-icon"]',
  "Execute icon for active automation (doc step)":
    'button[aria-label*="Execute"], button[title*="Execute"], [data-test-id*="execute-icon"]',
  "Open Stack button on configuration screen (doc step)":
    'button:has-text("Open Stack"), [data-test-id*="open-stack"]',

  // ── CMS steps (used in on-demand-automation-app prerequisite) ────────────
  "+ New Content Type button (doc step)":
    'button:has-text("+ New Content Type"), button:has-text("New Content Type")',
  "Save and proceed button in content type creation (doc step)":
    'button:has-text("Save and proceed"), button:has-text("Save and Proceed")',
  "Insert a field button in content type builder (doc step)":
    'button[data-test-id="add-new-field"], button:has-text("Insert a field"), button:has-text("+ Add Field")',
  "Single Line Textbox option in field type list (doc step)":
    '[class*="field-type"]:has-text("Single Line Textbox"), button:has-text("Single Line Textbox"), li:has-text("Single Line Textbox")',
  "Save and Close button in content type builder (doc step)":
    'button:has-text("Save and Close")',
  "Entries in left navigation panel (doc step)":
    '[data-test-id="cs-left-nav-Entries"], [class*="left-nav"]:has-text("Entries"), nav a:has-text("Entries")',
  "Entries in left navigation panel or top navigation (doc step)":
    '[data-test-id="cs-left-nav-Entries"], [class*="left-nav"]:has-text("Entries"), nav a:has-text("Entries"), button:has-text("Entries")',
  "+ New Entry button (doc step)":
    'button:has-text("+ New Entry"), button:has-text("New Entry")',
  "Proceed button in New Entry (doc step)":
    'button:has-text("Proceed"), button[data-test-id*="proceed"]',
  "Save button on entry editor page (doc step)":
    'button:text-is("Save"), button[data-test-id*="entry-save"]',
  "first entry in Entries list (doc step)":
    '[class*="entry-row"]:first-child, tbody tr:first-child, [data-test-id*="entry"]:first-child',

  // ── Marketplace ────────────────────────────────────────────────────────────
  "Apps in left panel (doc step)":
    '[class*="left-nav"]:has-text("Apps"), nav a:has-text("Apps"), button:has-text("Apps")',
  "Automate app card in Marketplace (doc step)":
    '[class*="app-card"]:has-text("Automate"), [class*="AppCard"]:has-text("Automate"), [class*="marketplace-app"]:has-text("Automate")',
  "Install button on Automate app card (doc step)":
    '[class*="app-card"]:has-text("Automate") button:has-text("Install"), button:has-text("Install")',
  "stack selection dropdown in Install pop-up (doc step)":
    '[role="dialog"] [class*="select"], [role="dialog"] [class*="dropdown"], [role="dialog"] [class*="Select"]',
  "first enabled stack option in stack dropdown (doc step)":
    '[role="option"]:not([aria-disabled="true"]):first-child, [class*="option"]:not([class*="disabled"]):first-child',
  "terms and conditions checkbox in Install pop-up (doc step)":
    '[role="dialog"] input[type="checkbox"], [role="dialog"] [class*="checkbox"]',
  "Install button in Install pop-up (doc step)":
    '[role="dialog"] button:has-text("Install"), button[data-test-id*="install"]',
  "Entry Sidebar Rail UI location on configuration screen (doc step)":
    '[class*="ui-location"]:has-text("Entry Sidebar Rail"), :has-text("Entry Sidebar Rail")',
  "Asset Sidebar Rail UI location on configuration screen (doc step)":
    '[class*="ui-location"]:has-text("Asset Sidebar Rail"), :has-text("Asset Sidebar Rail")',

  // ── Tab navigation (new browser tab steps) ────────────────────────────────
  "new browser tab (doc step)": "body",
  "original Agent OS tab (doc step)": "body",

  // ── Stack selection ────────────────────────────────────────────────────────
  "{INSTALL_STACK_NAME} from Lookup list (doc step)":
    '[role="option"]:first-child, [class*="option"]:first-child',
  "{INSTALL_STACK_NAME} stack card (doc step)":
    '[data-test-id="cs-stackcard"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Automation Name input (doc step)":
    'input[placeholder*="automation name" i], input[placeholder*="Enter name" i], input[name="automationName"]',
  "Automation Name input in Clone Automation modal (doc step)":
    'input[placeholder*="automation name" i], input[placeholder*="Enter name" i], input[name="automationName"]',
  "Automation Name input in Create New Automation modal (doc step)":
    'input[placeholder*="automation name" i], input[placeholder*="Enter name" i], input[name="automationName"]',
  "project name input in New Project (doc step)":
    'input[data-testid="title-input"], input[placeholder*="project name" i]',
  "Input Label input (doc step)":
    'input[placeholder*="label" i], input[name="inputLabel"], input[data-test-id*="input-label"]',
  "Input Description input (doc step)":
    'textarea[placeholder*="description" i], input[name="inputDescription"]',
  "To email input on Configure Action page (doc step)":
    'input[placeholder*="email" i], input[name="to"], input[type="email"]',
  "Subject input on Configure Action page (doc step)":
    'input[placeholder*="subject" i], input[name="subject"]',
  "Body input on Configure Action page (doc step)":
    'textarea[placeholder*="body" i], textarea[name="body"]',
  "Title input for Slack account (doc step)":
    'input[placeholder*="title" i], input[name="title"], input[data-test-id*="title"]',
  "Token input in Authorize Netlify modal (doc step)":
    'input[placeholder*="token" i], input[name="token"], input[type="password"]',
  "search input in Marketplace Apps (doc step)":
    'input[placeholder*="search" i], input[type="search"], [class*="search"] input',
  "trigger rename input (doc step)":
    'input[class*="rename"], input[class*="trigger-name"], [class*="trigger"] input',
  "variable name input in Add Input (doc step)":
    'input[placeholder*="variable" i], input[name*="variable"], input[placeholder*="name" i]',
  "variable value input in Add Input (doc step)":
    'input[placeholder*="value" i], input[name*="value"]',
  "content type UID input box (doc step)":
    'input[placeholder*="content type" i], input[name*="contentTypeUid"]',
  "Site ID text box in Configure Action (doc step)":
    'input[placeholder*="site" i], input[name*="siteId"], input[data-test-id*="site-id"]',
};
