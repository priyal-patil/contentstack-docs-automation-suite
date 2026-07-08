export const CLICK_SELECTORS: Record<string, string> = {
  // ── App Switcher navigation (data-test-ids confirmed from live DOM) ──────
  "App Switcher icon (doc step)":
    '[data-test-id="app-switcher-toolbar"], [data-test-id="cs-icon-global-navigation"], button[aria-label="App Switcher"], [data-test-id="app-switcher"]',
  "Agent OS in App Switcher list (doc step)":
    '[data-test-id="app-switcher-automate"]',
  "Agent OS option in App Switcher list (doc step)":
    '[data-test-id="app-switcher-automate"]',
  "App Switcher icon in top navigation (doc step)":
    '[data-test-id="app-switcher-toolbar"], [data-test-id="cs-icon-global-navigation"], [aria-label="App Switcher"], [data-test-id="app-switcher"]',
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
    '[data-test-id="cs-stackcard-title-PriyalDocsAutomation"], [data-test-id="cs-stackcard"]:has-text("PriyalDocsAutomation")',
  "any existing project card on projects listing page (doc step)":
    '[data-test-id="cs-stackcard-title-PriyalDocsAutomation"], [data-test-id="cs-stackcard"]:has-text("PriyalDocsAutomation")',
  "existing project on Agent OS projects page (doc step)":
    '[data-test-id="cs-stackcard-title-PriyalDocsAutomation"], [data-test-id="cs-stackcard"]:has-text("PriyalDocsAutomation")',
  "+ New Project button on Agent OS projects page (doc step)":
    'button[data-test-id="newProjectButtonHeader"], button:has-text("+ New Project"), button:has-text("New Project")',
  "Automations tab in project navigation (doc step)":
    '[data-test-id="automate-nav-automations"], button[aria-label="Automations"], a:has-text("Automations")',
  "Create New option in + New Automation dropdown (doc step)":
    'li.Dropdown__menu__list__item:has-text("Create New"), li[data-test-id="cs-dropdown-elements"]:has-text("Create New"), [role="option"]:has-text("Create New"), [role="menuitem"]:has-text("Create New"), div.Dropdown__menu__list__item:has-text("Create New"), div:text-is("Create New")',
  "PriyalDocsAutomation project card (doc step)":
    '[data-test-id="cs-stackcard"]:has-text("PriyalDocsAutomation"), [data-test-id="cs-stacklist-card-PriyalDocsAutomation"], [class*="stack-card"]:has-text("PriyalDocsAutomation")',
  "projects listing page (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Projects"), .PageTitle:has-text("Projects")',
  // New Project modal fields — confirmed from DOM: data-test-id="cs-modal-title-create-new-project"
  "Project Name field in new project modal (doc step)":
    '[data-test-id="cs-modal-title-create-new-project"] ~ * label:has-text("Project Name"), [role="dialog"] label:has-text("Project Name"), .ReactModal__Content label:has-text("Project Name")',
  "Description field in new project modal (doc step)":
    '[role="dialog"] label:has-text("Description"), .ReactModal__Content label:has-text("Description")',
  "close button on new project modal (doc step)":
    '[data-test-id="cs-modal-close"], [role="dialog"] [data-test-id="cs-modal-close"], .ReactModal__Content [data-test-id="cs-modal-close"]',
  "Agent OS (doc step)":
    '[data-test-id="app-switcher-automate"], [data-test-id="cs-agent os-button"], a:has-text("Agent OS")',
  // Clicking the main "Create" button navigates to editor; the chevron (.openDropdownOnClick) opens the dropdown
  // On Automations listing empty state, [data-test-id="addNewAutomation"] button opens modal directly
  "+ New Automation button (doc step)":
    '.create-split-cta .openDropdownOnClick, [data-test-id="addNewAutomation"], button[data-test-id="newAutomationButtonHeader"], .create-split-cta button[data-test-id="cs-button"], .create-split-cta button, button:has-text("+ New Automation"), button:has-text("New Automation")',
  "+ New Automation button on Automations listing page (doc step)":
    '[data-test-id="addNewAutomation"], .create-split-cta .openDropdownOnClick, button[data-test-id="newAutomationButtonHeader"], .create-split-cta button[data-test-id="cs-button"], .create-split-cta button, button:has-text("+ New Automation"), button:has-text("New Automation")',
  "+ New Automation button on Automations page (doc step)":
    '[data-test-id="addNewAutomation"], .create-split-cta .openDropdownOnClick, button[data-test-id="newAutomationButtonHeader"], .create-split-cta button[data-test-id="cs-button"], .create-split-cta button, button:has-text("+ New Automation"), button:has-text("New Automation")',

  // ── Create New option in dropdown ────────────────────────────────────────
  // Portal-rendered dropdown items have class Dropdown__menu__list__item (li elements)
  // data-test-id="cs-dropdown-elements" is the default; items appear in document.body portal
  // IMPORTANT: Do NOT include "New Automation" text selectors — they match the button's inner div
  // The dropdown items are plain <div> elements (ARIA: generic) with text "Create New"/"Import"
  "Create New option in dropdown (doc step)":
    'li.Dropdown__menu__list__item:has-text("Create New"), li[data-test-id="cs-dropdown-elements"]:has-text("Create New"), li[title="Create New"], [role="option"]:has-text("Create New"), [role="menuitem"]:has-text("Create New"), div.Dropdown__menu__list__item:has-text("Create New"), div:text-is("Create New")',

  // ── Create / Clone Automation modals ────────────────────────────────────
  "Automation Name field (doc step)":
    'label:has-text("Automation Name"), [class*="field-label"]:has-text("Automation Name")',
  "Automation Name input (doc step)":
    'input[placeholder*="automation name" i], input[placeholder*="Enter name" i], input[name="automationName"]',
  "Automation Description field (doc step)":
    'label:has-text("Description"), [class*="field-label"]:has-text("Description")',
  "Create button in New Automation (doc step)":
    'button:text-is("Create"), button[data-test-id="createAutomation"]',
  "Create button in Create New Automation modal (doc step)":
    'button[data-test-id="createAutomation"], button#createRule, [role="dialog"] button[aria-label="createRule"], [role="dialog"] button:text-is("Create")',
  "Automation Name field in Create New Automation modal (doc step)":
    'label:has-text("Automation Name"), [class*="field-label"]:has-text("Automation Name")',
  "Automation Name field in new automation modal (doc step)":
    'label:has-text("Automation Name"), [class*="field-label"]:has-text("Automation Name")',
  "Automation Name input in Create New Automation modal (doc step)":
    'input[placeholder*="automation name" i], input[placeholder*="Enter name" i], input[name="automationName"]',
  "Automation Name input in new automation modal (doc step)":
    'input[placeholder*="automation name" i], input[placeholder*="Enter name" i], input[name="automationName"]',
  "Description field in new automation modal (doc step)":
    '[role="dialog"] label:has-text("Description"), .ReactModal__Content label:has-text("Description")',
  "Description field in Create New Automation modal (doc step)":
    '[role="dialog"] label:has-text("Description"), [role="dialog"] textarea[name="description"], [role="dialog"] textarea[placeholder*="description" i]',
  "Description input in new automation modal (doc step)":
    '[role="dialog"] textarea[name="description"], .ReactModal__Content textarea[placeholder*="description" i], [role="dialog"] textarea',
  "Create button in new automation modal (doc step)":
    'button:text-is("Create"), button[data-test-id="createAutomation"]',
  "Create New Automation modal (doc step)":
    '[data-test-id="cs-modal-title-create-new-automation"], [role="dialog"]:has-text("Create New Automation"), [role="dialog"] h3:has-text("Create New Automation"), [role="dialog"] h2:has-text("Create New Automation"), h3:has-text("Create New Automation")',
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
  "Automations tab in top navigation (doc step)":
    '[data-test-id="automate-nav-automations"], button[aria-label="Automations"], a:has-text("Automations")',
  "Automations in top navigation panel (doc step)":
    '[data-test-id="automate-nav-automations"], button[aria-label="Automations"], a:has-text("Automations")',
  "Automations in top navigation panel to return to listing (doc step)":
    '[data-test-id="automate-nav-automations"], button[aria-label="Automations"], a:has-text("Automations")',
  "Automations project page (doc step)":
    '[class*="automation-list"], [data-test-id*="automation-list"], h1:has-text("Automations")',
  "On-demand Automation project (doc step)":
    '[data-test-id="cs-stackcard"]:has-text("On-demand"), [class*="StackCard"]:has-text("On-demand")',

  // ── Configure Trigger ────────────────────────────────────────────────────
  "Stack Lookup dropdown in Configure Trigger (doc step)":
    '[class*="lookup"]:has-text("Stack"), [class*="Lookup"]:has-text("Stack"), label:has-text("Stack")',
  "Entry Trigger in trigger events list (doc step)":
    '[class*="trigger"]:has-text("Entry Trigger"), [class*="TriggerCard"]:has-text("Entry Trigger"), button:has-text("Entry Trigger")',
  "Entry Trigger event under Choose Trigger tab (doc step)":
    '[class*="trigger"]:has-text("Entry Trigger"), [class*="TriggerCard"]:has-text("Entry Trigger"), button:has-text("Entry Trigger")',
  "Entry Trigger option in Choose Trigger section (doc step)":
    '[class*="trigger"]:has-text("Entry Trigger"), [class*="TriggerCard"]:has-text("Entry Trigger"), button:has-text("Entry Trigger")',
  "Choose Trigger tab (doc step)":
    '[role="tab"]:has-text("Choose Trigger"), button:has-text("Choose Trigger"), [class*="tab"]:has-text("Choose Trigger")',
  "Asset Trigger under Choose Trigger tab (doc step)":
    '[class*="trigger"]:has-text("Asset Trigger"), [class*="TriggerCard"]:has-text("Asset Trigger"), button:has-text("Asset Trigger")',
  "Event dropdown field in Configure Trigger (doc step)":
    'label:has-text("Event"), [class*="field"]:has-text("Event"), [class*="field-label"]:has-text("Event")',
  "Event dropdown in Configure Trigger (doc step)":
    'label:has-text("Event"), [class*="field"]:has-text("Event"), [class*="field-label"]:has-text("Event")',
  "Asset Created option in Event dropdown (doc step)":
    '[role="option"]:has-text("Asset Created"), li:has-text("Asset Created")',
  "Asset Updated option in Event dropdown (doc step)":
    '[role="option"]:has-text("Asset Updated"), li:has-text("Asset Updated")',
  "Asset Deleted option in Event dropdown (doc step)":
    '[role="option"]:has-text("Asset Deleted"), li:has-text("Asset Deleted")',
  "Asset Published option in Event dropdown (doc step)":
    '[role="option"]:has-text("Asset Published"), li:has-text("Asset Published")',
  "Asset Publish Failed option in Event dropdown (doc step)":
    '[role="option"]:has-text("Asset Publish Failed"), li:has-text("Asset Publish Failed")',
  "Asset Unpublished option in Event dropdown (doc step)":
    '[role="option"]:has-text("Asset Unpublished"), li:has-text("Asset Unpublished")',
  "Asset Unpublish Failed option in Event dropdown (doc step)":
    '[role="option"]:has-text("Asset Unpublish Failed"), li:has-text("Asset Unpublish Failed")',
  "All option in Event dropdown (doc step)":
    '[role="option"]:has-text("All"), li:has-text("All")',
  "Branch Lookup dropdown in Configure Trigger (doc step)":
    '[class*="lookup"]:has-text("Branch"), [class*="Lookup"]:has-text("Branch"), label:has-text("Branch")',
  "Show Optional Fields toggle in Configure Trigger (doc step)":
    'button:has-text("Show Optional Fields"), [class*="toggle"]:has-text("Optional Fields"), [class*="optional-fields-toggle"]',
  "Select Account dropdown in Configure Trigger (doc step)":
    'label:has-text("Select Account"), [class*="field"]:has-text("Select Account"), button:has-text("Select Account")',
  "Entry Created events field in Configure Trigger (doc step)":
    'label:has-text("Entry Created"), [class*="field"]:has-text("Entry Created"), label:has-text("Events")',
  "any option in Entry Created events field dropdown (doc step)":
    '[role="option"]:first-child, [class*="option"]:first-child',
  "any event option from Event dropdown (doc step)":
    '[role="option"]:first-child, [class*="option"]:first-child',
  "any event option from Events dropdown (doc step)":
    '[role="option"]:first-child, [class*="option"]:first-child',
  "Proceed button for Configure Trigger (doc step)":
    'button:has-text("Proceed"), button[data-test-id*="proceed"]',
  "Save and Exit button for Configure Trigger (doc step)":
    'button:has-text("Save and Exit"), button[data-test-id*="save-exit"]',
  "Contentstack trigger connector in Choose Connector list (doc step)":
    '[class*="connector"]:has-text("Contentstack"), [class*="ConnectorCard"]:has-text("Contentstack"), button:has-text("Contentstack")',
  "HTTP trigger connector in Choose Connector list (doc step)":
    '[class*="connector"]:has-text("HTTP"), [class*="ConnectorCard"]:has-text("HTTP"), button:has-text("HTTP")',
  "Method dropdown in HTTP trigger configuration (doc step)":
    'label:has-text("Method"), [class*="field"]:has-text("Method"), button:has-text("Method")',
  "Proceed button on HTTP trigger configuration page (doc step)":
    'button:has-text("Proceed"), button[data-test-id*="proceed"]',
  "Test Trigger button for HTTP trigger (doc step)":
    'button:has-text("Test Trigger"), button[data-test-id*="test-trigger"]',
  "Save and Exit button for HTTP trigger (doc step)":
    'button:has-text("Save and Exit"), button[data-test-id*="save-exit"]',
  "Contentstack connector in Configure Trigger (doc step)":
    '[class*="connector"]:has-text("Contentstack"), [class*="ConnectorCard"]:has-text("Contentstack"), button:has-text("Contentstack")',
  "Entry Trigger option (doc step)":
    '[class*="trigger"]:has-text("Entry Trigger"), [class*="TriggerCard"]:has-text("Entry Trigger"), button:has-text("Entry Trigger")',
  "Entry Published trigger event option (doc step)":
    '[role="option"]:has-text("Entry Published"), li:has-text("Entry Published"), button:has-text("Entry Published")',
  "Select Stack field (doc step)":
    'label:has-text("Stack"), [class*="field"]:has-text("Stack"), [class*="lookup"]:has-text("Stack")',
  "Configure Trigger section with additional details (doc step)":
    'h2:has-text("Configure Trigger"), h1:has-text("Configure Trigger"), [class*="configure-trigger"]',
  "Description field in Configure Trigger section (doc step)":
    'label:has-text("Description"), [class*="field-label"]:has-text("Description")',
  "Key field in Configure Trigger section (doc step)":
    'label:has-text("Key"), [class*="field-label"]:has-text("Key")',
  "Configure Action section (doc step)":
    'h2:has-text("Configure Action"), h1:has-text("Configure Action"), [class*="configure-action"]',
  "default account displayed in Contentstack trigger account list (doc step)":
    '[class*="account-item"]:first-child, [class*="AccountCard"]:first-child, [class*="account-list"] :first-child',
  "default account displayed in Algolia account list (doc step)":
    '[class*="account-item"]:first-child, [class*="AccountCard"]:first-child, [class*="account-list"] :first-child',
  "+ Add New Account button for Contentstack trigger (doc step)":
    'button:has-text("+ Add New Account"), button:has-text("Add New Account"), button[data-test-id*="add-account"]',
  "Contentstack OAuth option in Add Account modal for trigger (doc step)":
    '[role="option"]:has-text("Contentstack OAuth"), li:has-text("Contentstack OAuth"), button:has-text("Contentstack OAuth")',
  "Proceed button in Add Account modal for trigger (doc step)":
    'button:has-text("Proceed"), button[data-test-id*="proceed"]',
  "All option in trigger events list (doc step)":
    '[role="option"]:has-text("All"), li:has-text("All"), button:has-text("All")',
  "Proceed button in Authorize Account modal (doc step)":
    'button:has-text("Proceed"), button[data-test-id*="proceed"]',
  "Manage Permissions modal (doc step)":
    '[role="dialog"]:has-text("Manage Permissions"), [role="dialog"]:has-text("Permissions")',
  "Entry Created event option (doc step)":
    '[role="option"]:has-text("Entry Created"), li:has-text("Entry Created")',
  // Configure Trigger left-nav item: the automation editor left panel renders an h5 inside a div
  // ARIA confirms: heading "Configure Trigger" [level=5] inside generic [cursor=pointer]
  // No ft-trigger-block-head or block-title classes found in DOM — use h5:has-text and div:text-is
  "Configure Trigger in left navigation panel (doc step)":
    'h5:has-text("Configure Trigger"), div:text-is("Configure Trigger"), [data-test-id="automate-nav-configure-trigger"], [data-test-id="automations-nav-configure-trigger"]',
  "Configure Trigger in left navigation (doc step)":
    'h5:has-text("Configure Trigger"), div:text-is("Configure Trigger"), [data-test-id="automate-nav-configure-trigger"], [data-test-id="automations-nav-configure-trigger"]',
  "Configure Trigger step in left navigation panel (doc step)":
    'h5:has-text("Configure Trigger"), div:text-is("Configure Trigger"), [data-test-id="automate-nav-configure-trigger"], [data-test-id="automations-nav-configure-trigger"]',
  // Choose Trigger: appears as listitem text or generic div after connector selection
  "Choose Trigger section (doc step)":
    'div:text-is("Choose Trigger"), li:has-text("Choose Trigger"), h5:has-text("Choose Trigger"), h2:has-text("Choose Trigger")',
  "Choose Trigger section after selecting a connector (doc step)":
    'div:text-is("Choose Trigger"), li:has-text("Choose Trigger"), h5:has-text("Choose Trigger")',
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
  // Trigger selection — unique names from send-newly-transformed-data-via-email
  "Events field in Contentstack trigger configuration (doc step)":
    'label:has-text("Events"), [class*="field-label"]:has-text("Events"), [class*="field"]:has-text("Events")',
  "Entry Created option in Events dropdown (doc step)":
    '[role="option"]:has-text("Entry Created"), li:has-text("Entry Created"), [class*="option"]:has-text("Entry Created")',
  "Stack field in Contentstack trigger configuration (doc step)":
    'label:has-text("Stack"), [class*="field-label"]:has-text("Stack")',
  "any stack option from Stack dropdown (doc step)":
    '[role="option"]:first-child, li[class*="option"]:first-child, [class*="option"]:first-child',
  // Trigger aliases — various target name forms used across different flows
  "Proceed button in Configure Trigger (doc step)":
    'button:has-text("Proceed"), button[data-test-id*="proceed"]',
  "Proceed button on Configure Trigger page (doc step)":
    'button:has-text("Proceed"), button[data-test-id*="proceed"]',
  "Test Trigger button (doc step)":
    'button:has-text("Test Trigger"), button[data-test-id*="test-trigger"]',
  "Save and Exit button in Configure Trigger (doc step)":
    'button:has-text("Save and Exit"), button[data-test-id*="save-exit"]',
  "Save and Exit button on Configure Trigger page (doc step)":
    'button:has-text("Save and Exit"), button[data-test-id*="save-exit"]',
  // Configure Trigger section: right panel header shows "Configure Trigger" as a generic div
  // ARIA: generic [ref=e251]: Configure Trigger (in the right panel step block header)
  "Configure Trigger section on page (doc step)":
    'h5:has-text("Configure Trigger"), div:text-is("Configure Trigger"), h2:has-text("Configure Trigger"), [class*="configure-trigger"]',
  "HTTP Request Trigger in trigger events list (doc step)":
    '[class*="trigger"]:has-text("HTTP Request"), button:has-text("HTTP Request"), [role="option"]:has-text("HTTP Request")',
  "Method dropdown on Configure Trigger page (doc step)":
    'label:has-text("Method"), [class*="field"]:has-text("Method"), button:has-text("Method")',
  "GET/POST option in Method dropdown (doc step)":
    '[role="option"]:has-text("GET"), [role="option"]:has-text("POST"), li:has-text("GET"), li:has-text("POST")',
  "URL field after clicking Proceed on Configure Trigger page (doc step)":
    'label:has-text("URL"), [class*="field-label"]:has-text("URL"), input[placeholder*="URL" i]',
  "copy icon for URL field on Configure Trigger page (doc step)":
    '[class*="copy"], button[aria-label*="copy" i], [data-test-id*="copy"]',
  "Repeat Path option (doc step)":
    'button:has-text("Repeat Path"), [class*="option"]:has-text("Repeat Path"), [role="option"]:has-text("Repeat Path")',
  "Data source field in Repeat Path Configurations (doc step)":
    'label:has-text("Data source"), [class*="field-label"]:has-text("Data source"), [class*="field"]:has-text("Data source")',
  "any option displayed in Data source dropdown (doc step)":
    '[role="option"]:first-child, li[class*="option"]:first-child',
  "Save Configuration button in Repeat Path (doc step)":
    'button:has-text("Save Configuration"), button:has-text("Save"), button[data-test-id*="save-config"]',
  "Reload icon in output section of Repeat Path (doc step)":
    'button[aria-label*="reload" i], button:has-text("Reload"), [class*="reload"], svg[class*="reload"]',
  "+ Add Step button under Repeat Path in left navigation panel (doc step)":
    'button:has-text("+ Add Step"), button:has-text("Add Step"), button[data-test-id*="add-step"]',

  // ── Configure Action Step ────────────────────────────────────────────────
  "Configure Action Step section heading (doc step)":
    'h2:has-text("Configure Action Step"), h1:has-text("Configure Action"), [class*="configure-action"] h2',
  "Action Step option to configure third-party services (doc step)":
    'button:has-text("Action Step"), [role="option"]:has-text("Action Step"), [class*="option"]:has-text("Action Step")',
  "Index Entries action in Choose an Action list (doc step)":
    '[class*="action"]:has-text("Index Entries"), [class*="ActionCard"]:has-text("Index Entries"), button:has-text("Index Entries")',
  "Index Entries action under Choose an Action tab (doc step)":
    '[class*="action"]:has-text("Index Entries"), [class*="ActionCard"]:has-text("Index Entries"), button:has-text("Index Entries")',
  "+ Add New Account button for Algolia connector (doc step)":
    'button:has-text("+ Add New Account"), button:has-text("Add New Account"), button[data-test-id*="add-account"]',
  "+ Add New Account button for ChatGPT connector (doc step)":
    'button:has-text("+ Add New Account"), button:has-text("Add New Account"), button[data-test-id*="add-account"]',
  "Chat with Vision action under Choose an Action tab (doc step)":
    '[class*="action"]:has-text("Chat with Vision"), [class*="ActionCard"]:has-text("Chat with Vision"), button:has-text("Chat with Vision")',
  "ChatGPT connector in Choose Connector list (doc step)":
    '[class*="connector"]:has-text("ChatGPT"), [class*="ConnectorCard"]:has-text("ChatGPT"), button:has-text("ChatGPT")',
  "AWS S3 connector in Choose Connector list (doc step)":
    '[class*="connector"]:has-text("AWS S3"), [class*="ConnectorCard"]:has-text("AWS S3"), [class*="connector"]:has-text("S3"), button:has-text("AWS S3")',
  "Create New Object action under Choose an Action tab (doc step)":
    '[class*="action"]:has-text("Create New Object"), [class*="ActionCard"]:has-text("Create New Object"), button:has-text("Create New Object")',
  "Netlify connector in Configure Action Step (doc step)":
    '[class*="connector"]:has-text("Netlify"), [class*="ConnectorCard"]:has-text("Netlify"), button:has-text("Netlify")',
  "Deploy Site action option (doc step)":
    '[class*="action"]:has-text("Deploy Site"), [class*="ActionCard"]:has-text("Deploy Site"), button:has-text("Deploy Site")',
  "Configure Action Step in left navigation panel for Function Calling (doc step)":
    'h5:has-text("Configure Action Step"), div:text-is("Configure Action Step"), [data-test-id="automate-nav-configure-action"]',
  "Action Step option for Function Calling (doc step)":
    'button:has-text("Action Step"), [role="option"]:has-text("Action Step")',
  "Configure Action Step section heading for Function Calling (doc step)":
    'h2:has-text("Configure Action Step"), h1:has-text("Configure Action"), [class*="configure-action"] h2',
  "ChatGPT connector in Choose Connector list for Function Calling (doc step)":
    '[class*="connector"]:has-text("ChatGPT"), [class*="ConnectorCard"]:has-text("ChatGPT"), button:has-text("ChatGPT")',
  "Choose an Action tab for Function Calling (doc step)":
    'h2:has-text("Choose an Action"), [class*="choose-action"], button[role="tab"]:has-text("Action")',
  "Function Calling action under Choose an Action tab (doc step)":
    '[class*="action"]:has-text("Function Calling"), [class*="ActionCard"]:has-text("Function Calling"), button:has-text("Function Calling")',
  "+ Add New Account button for ChatGPT Function Calling (doc step)":
    'button:has-text("+ Add New Account"), button:has-text("Add New Account"), button[data-test-id*="add-account"]',
  "Title field in ChatGPT Authorize modal (doc step)":
    'label:has-text("Title"), [class*="field-label"]:has-text("Title")',
  "+ Add New Step button on automation canvas for Algolia (doc step)":
    'button:has-text("+ Add Step"), button:has-text("Add New Step"), button[data-test-id*="add-step"]',
  "Action Step option for Algolia (doc step)":
    'button:has-text("Action Step"), [role="option"]:has-text("Action Step")',
  "Configure Action Step section heading for Algolia (doc step)":
    'h2:has-text("Configure Action Step"), h1:has-text("Configure Action"), [class*="configure-action"] h2',
  "Choose an Action tab for Algolia (doc step)":
    'h2:has-text("Choose an Action"), [class*="choose-action"], button[role="tab"]:has-text("Action")',
  "Configure Action tab for Algolia Index Entries (doc step)":
    '[role="tab"]:has-text("Configure Action"), button:has-text("Configure Action"), [class*="tab"]:has-text("Configure Action")',
  "Configure Action Step in left navigation panel for Add Content to a Project (doc step)":
    'h5:has-text("Configure Action Step"), div:text-is("Configure Action Step"), [data-test-id="automate-nav-configure-action"]',
  "Action Step option for Add Content to a Project (doc step)":
    'button:has-text("Action Step"), [role="option"]:has-text("Action Step")',
  "Configure Action Step section heading for Add Content to a Project (doc step)":
    'h2:has-text("Configure Action Step"), h1:has-text("Configure Action"), [class*="configure-action"] h2',
  "Smartling connector in Choose Connector list (doc step)":
    '[class*="connector"]:has-text("Smartling"), [class*="ConnectorCard"]:has-text("Smartling"), button:has-text("Smartling")',
  "Choose an Action tab for Smartling Add Content (doc step)":
    'h2:has-text("Choose an Action"), [class*="choose-action"], button[role="tab"]:has-text("Action")',
  "Add Content to a Project action under Choose an Action tab (doc step)":
    '[class*="action"]:has-text("Add Content to a Project"), [class*="ActionCard"]:has-text("Add Content"), button:has-text("Add Content to a Project")',
  "+ Add New Account button for Smartling Add Content (doc step)":
    'button:has-text("+ Add New Account"), button:has-text("Add New Account"), button[data-test-id*="add-account"]',
  "Authorize modal for Smartling Add Content account (doc step)":
    '[role="dialog"]:has-text("Authorize"), [role="dialog"]:has-text("Smartling")',
  "Select Input box for content type UID (doc step)":
    'input[placeholder*="content type" i], input[name*="contentTypeUid"], [class*="lookup"]:has-text("Content Type")',
  "Matches (Text) option (doc step)":
    '[role="option"]:has-text("Matches"), li:has-text("Matches (Text)"), li:has-text("Matches")',
  "Save Configuration button (doc step)":
    'button:has-text("Save Configuration"), button[data-test-id*="save-config"]',
  "Proceed button on Configure Action Step page (doc step)":
    'button:has-text("Proceed"), button[data-test-id*="proceed"]',
  "Save and Exit button (doc step)":
    'button:has-text("Save and Exit"), button[data-test-id*="save-exit"]',
  "Configure Action Step in left navigation panel (doc step)":
    'h5:has-text("Configure Action Step"), div:text-is("Configure Action Step"), [data-test-id="automate-nav-configure-action"], [data-test-id="automations-nav-configure-action"]',
  "Configure Action Step in left navigation (doc step)":
    'h5:has-text("Configure Action Step"), div:text-is("Configure Action Step"), [data-test-id="automate-nav-configure-action"], [data-test-id="automations-nav-configure-action"]',
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
  // Context-specific aliases for send-newly-transformed-data-via-email flow
  "Configure Action Step in left navigation panel for Transform (doc step)":
    'h5:has-text("Configure Action Step"), div:text-is("Configure Action Step"), [data-test-id="automate-nav-configure-action"]',
  "Action Step option for Transform (doc step)":
    'button:has-text("Action Step"), button:has-text("+ Add Step"), [role="option"]:has-text("Action Step")',
  "Action Step option for Email (doc step)":
    'button:has-text("Action Step"), button:has-text("+ Add Step"), [role="option"]:has-text("Action Step")',
  "Configure Action Step section heading for Transform (doc step)":
    'h2:has-text("Configure Action Step"), h1:has-text("Configure Action"), [class*="configure-action"] h2',
  "Choose an Action tab for Transform (doc step)":
    'h2:has-text("Choose an Action"), [class*="choose-action"], button[role="tab"]:has-text("Action")',
  "Choose an Action tab for Email by Agent OS (doc step)":
    'h2:has-text("Choose an Action"), [class*="choose-action"], button[role="tab"]:has-text("Action")',
  "Transform action under Choose an Action tab (doc step)":
    '[class*="action"]:has-text("Transform"), button:has-text("Transform")',
  "Email by Agent OS connector in Choose Connector list (doc step)":
    '[class*="connector"]:has-text("Email by Agent OS"), [class*="ConnectorCard"]:has-text("Email"), button:has-text("Email by Agent OS")',
  "Add Input button in Configure Action for Transform (doc step)":
    'button:has-text("Add Input"), button:has-text("+ Add Input"), button[data-test-id*="add-input"]',
  "Proceed button on Transform Configure Action page (doc step)":
    'button:has-text("Proceed"), button[data-test-id*="proceed"]',
  "Test Action button for Transform (doc step)":
    'button:has-text("Test Action"), button[data-test-id*="test-action"]',
  "Save and Exit button for Transform (doc step)":
    'button:has-text("Save and Exit"), button[data-test-id*="save-exit"]',
  "+ Add New Step button on automation canvas (doc step)":
    'button:has-text("+ Add Step"), button:has-text("Add New Step"), button[data-test-id*="add-step"]',
  "+ Add New Account button for Email by Agent OS (doc step)":
    'button:has-text("+ Add New Account"), button:has-text("Add New Account"), button[data-test-id*="add-account"]',
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
  "Transformation field in Transform Configure Action (doc step)":
    'label:has-text("Transformation"), [class*="field-label"]:has-text("Transformation")',
  "Select Account dropdown (doc step)":
    'label:has-text("Select Account"), [class*="field"]:has-text("Select Account"), button:has-text("Select Account")',
  "Input Name field in Transform Configure Action (doc step)":
    'label:has-text("Input Name"), [class*="field-label"]:has-text("Input Name")',
  "Input Value field in Transform Configure Action (doc step)":
    'label:has-text("Input Value"), [class*="field-label"]:has-text("Input Value")',
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

  // ── Repeat Path / Contentstack Management connector (using-repeat-paths) ───
  "Contentstack connector in Choose Connector list (doc step)":
    '.connector_list:has-text("Contentstack"), [class*="connector"]:has-text("Contentstack"), [class*="ConnectorCard"]:has-text("Contentstack"), button:has-text("Contentstack")',
  "Contentstack Management connector option (doc step)":
    '[class*="connector"]:has-text("Contentstack Management"), [class*="ConnectorCard"]:has-text("Contentstack Management"), [role="option"]:has-text("Contentstack Management"), button:has-text("Contentstack Management")',
  "Create an Entry action in Choose an Action list (doc step)":
    '[class*="action"]:has-text("Create an Entry"), [class*="ActionCard"]:has-text("Create an Entry"), button:has-text("Create an Entry"), [role="option"]:has-text("Create an Entry")',
  "Configure Action tab (doc step)":
    '[role="tab"]:has-text("Configure Action"), button:has-text("Configure Action"), [class*="tab"]:has-text("Configure Action")',
  "Stack Lookup dropdown in Create an Entry Configure Action (doc step)":
    '[class*="lookup"]:has-text("Stack"), [class*="Lookup"]:has-text("Stack"), label:has-text("Stack")',
  "Branch Lookup dropdown in Create an Entry Configure Action (doc step)":
    '[class*="lookup"]:has-text("Branch"), [class*="Lookup"]:has-text("Branch"), label:has-text("Branch")',
  "Content Type Lookup dropdown in Create an Entry Configure Action (doc step)":
    '[class*="lookup"]:has-text("Content Type"), [class*="Lookup"]:has-text("Content Type"), label:has-text("Content Type")',
  "any content type from Content Type Lookup dropdown (doc step)":
    '[role="option"]:first-child, [class*="option"]:first-child',
  "Entry Data field in Create an Entry Configure Action (doc step)":
    'label:has-text("Entry Data"), [class*="field-label"]:has-text("Entry Data"), [class*="field"]:has-text("Entry Data")',
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
  // Transform Configure Action inputs (send-newly-transformed-data-via-email)
  "Input Name input in Transform Configure Action (doc step)":
    'input[placeholder*="name" i]:not([name="automationName"]), input[placeholder*="input name" i], input[data-test-id*="input-name"]',
  "Input Value input in Transform Configure Action (doc step)":
    'input[placeholder*="value" i], input[name*="value"], textarea[placeholder*="value" i]',
  "Automation Name input in new automation modal (doc step)":
    'input[placeholder*="automation name" i], input[placeholder*="Enter name" i], input[name="automationName"]',
  "Description input in Create New Automation modal (doc step)":
    'textarea[placeholder*="description" i], textarea[name="description"]',
  "Description input in new automation modal (doc step)":
    'textarea[name="description"], textarea[placeholder*="description" i], [role="dialog"] textarea[name="description"]',
  "Entry Data field in Create an Entry Configure Action (doc step)":
    'textarea[placeholder*="entry data" i], textarea[name*="entryData"], input[placeholder*="entry data" i], [class*="entry-data"] textarea',
};
