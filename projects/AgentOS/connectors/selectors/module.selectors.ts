export const CLICK_SELECTORS: Record<string, string> = {
  // ── App Switcher navigation (confirmed from data/dom/AgentOS/connectors/transform-step-1-failure.html) ──
  "App Switcher icon in the top navigation bar":
    '[data-test-id="app-switcher"], [data-test-id="app-switcher-toolbar"], [aria-label="App Switcher"]',
  "App Switcher icon (doc step)":
    '[data-test-id="app-switcher"], [aria-label="App Switcher"], [data-testid="app-switcher"]',

  // ── Agent OS in App Switcher (confirmed from data/dom/AgentOS/appswitcher-agentos.html) ──
  "Agent OS in App Switcher list":
    '[data-test-id="app-switcher-automate"]',
  "Agent OS in App Switcher list (doc step)":
    '[data-test-id="app-switcher-automate"], [data-test-id="cs-agent os-button"], a:has-text("Agent OS")',

  // ── Projects listing ──────────────────────────────────────────────────────
  "any existing project card on the projects listing page":
    '[data-test-id="cs-stackcard"]:has-text("PriyalDocsAutomation"), [data-test-id="cs-stackcard"]',
  "any existing project card on projects listing page (doc step)":
    '[data-test-id="cs-stackcard"]:has-text("PriyalDocsAutomation"), [data-test-id="cs-stackcard"]',

  // ── Automations navigation ────────────────────────────────────────────────
  "Automations in top navigation panel":
    '[data-test-id="automate-nav-automations"], button[aria-label="Automations"], a:has-text("Automations")',
  "Automations in top navigation panel (doc step)":
    '[data-test-id="automate-nav-automations"], button[aria-label="Automations"], a:has-text("Automations")',

  "+ New Automation button on the Automations listing page":
    '[data-test-id="addNewAutomation"], .create-split-cta .openDropdownOnClick, button[data-test-id="newAutomationButtonHeader"], .create-split-cta button, button:has-text("+ New Automation"), button:has-text("New Automation")',
  "Create New option in dropdown":
    'li.Dropdown__menu__list__item:has-text("Create New"), li[data-test-id="cs-dropdown-elements"]:has-text("Create New"), [role="option"]:has-text("Create New"), [role="menuitem"]:has-text("Create New"), div.Dropdown__menu__list__item:has-text("Create New"), div:text-is("Create New")',
  "+ New Automation button on Automations listing page (doc step)":
    'button[data-test-id="newAutomationButtonHeader"], button:has-text("+ New Automation"), button:has-text("New Automation")',

  "Automation Name field in the new automation dialog":
    'label:has-text("Automation Name"), [class*="field-label"]:has-text("Automation Name")',
  "Automation Name field in Create New Automation modal (doc step)":
    'label:has-text("Automation Name"), [class*="field-label"]:has-text("Automation Name")',

  "Automation Description field":
    'label:has-text("Description"), [class*="field-label"]:has-text("Description")',

  "Create button in the new automation dialog":
    'button:text-is("Create"), button[data-test-id="createAutomation"]',
  "Create button in New Automation (doc step)":
    'button:text-is("Create"), button[data-test-id="createAutomation"]',

  // ── Configure Action Step left nav ────────────────────────────────────────
  "Configure Action Step in left navigation panel":
    'h5:has-text("Configure Action Step"), div:text-is("Configure Action Step"), [data-test-id="automate-nav-configure-action"], [data-test-id="automations-nav-configure-action"]',

  // ── Action Step card in automation canvas ─────────────────────────────────
  "Action Step card in the automation canvas":
    '.action-type-selector-box:has-text("Action Step"), .action-type-selector-box:has(.title:text-is("Action Step")), button:has-text("Action Step"), [role="option"]:has-text("Action Step")',
  "Action Step card at the bottom of the automation":
    '.action-type-selector-box:has-text("Action Step"), .action-type-selector-box:has(.title:text-is("Action Step")), button:has-text("Action Step"), [role="option"]:has-text("Action Step")',

  // ── Choose Connector (confirmed from data/dom/AgentOS/connectors/transform-step-19-failure.html) ──
  // "Choose Connector" is a span.stepper-title inside .step__title; connector cards use class "connector_list"
  "Choose Connector section heading":
    'span.stepper-title:has-text("Choose Connector"), .stepper-title:has-text("Choose Connector")',
  "Transform connector in the Choose Connector list":
    '.connector_list:has-text("Transform"), [class*="connector_list"]:has-text("Transform")',

  // ── Choose an Action ──────────────────────────────────────────────────────
  "Choose an Action section":
    'span.stepper-title:has-text("Choose an Action"), .stepper-title:has-text("Choose an Action")',
  // Action options use class "action_event" with span.event_title (confirmed from transform-step-31-failure.html)
  "Aggregate Data action option in Choose an Action":
    '.action_event:has-text("Aggregate Data"), .event_title:has-text("Aggregate Data")',
  "Date and Time Transformer action option in Choose an Action":
    '.action_event:has-text("Date and Time Transformer"), .event_title:has-text("Date and Time Transformer")',
  "Filter Data action option in Choose an Action":
    '.action_event:has-text("Filter Data"), .event_title:has-text("Filter Data")',
  "JSON Stringify action option in Choose an Action":
    '.action_event:has-text("JSON Stringify"), .event_title:has-text("JSON Stringify")',
  "Merge Data action option in Choose an Action":
    '.action_event:has-text("Merge Data"), .event_title:has-text("Merge Data")',
  "Modify Object Fields action option in Choose an Action":
    '.action_event:has-text("Modify Object Fields"), .event_title:has-text("Modify Object Fields")',
  "Remove Duplicate Data action option in Choose an Action":
    '.action_event:has-text("Remove Duplicate Data"), .event_title:has-text("Remove Duplicate Data")',
  "Sort Data action option in Choose an Action":
    '.action_event:has-text("Sort Data"), .event_title:has-text("Sort Data")',
  "Transform action option in Choose an Action":
    '.action_event:has-text("Transform"), .event_title:text-is("Transform")',
  "Template action option in Choose an Action":
    '.action_event:has-text("Template"), .event_title:has-text("Template")',

  // ── Aggregate Data fields ─────────────────────────────────────────────────
  "Input Value field":
    '[class*="field-label"]:has-text("Input Value"), [class*="field"]:has-text("Input Value"), *:has-text("Input Value"):has(+ input), *:has-text("Input Value"):has(+ textarea)',
  "Field Name field":
    '[class*="field-label"]:has-text("Field Name"), [class*="field"]:has-text("Field Name"), *:has-text("Field Name"):has(+ input)',
  "Statistics dropdown field":
    '[class*="field-label"]:has-text("Statistics"), [class*="field"]:has-text("Statistics"), *:has-text("Statistics"):has(+ [class*="Select"])',
  "Statistics dropdown":
    '[class*="Select__control"]:near(*:has-text("Statistics")), .Select__control:near(*:has-text("Statistics"))',
  "any option in the Statistics dropdown":
    '[role="option"]:first-child, [class*="Select__option"]:first-child',
  // Show Optional Fields is a checkbox toggle (aria-toggle-switch) + text, not a <button>
  "Show Optional Fields toggle button":
    '*:has-text("Show Optional Fields"):has(input[type="checkbox"]), [class*="toggle"]:has-text("Optional Fields"), label:has-text("Show Optional Fields"), [class*="optional"]:has-text("Show Optional Fields")',
  "Null Value Handling dropdown after enabling Show Optional Fields":
    '[class*="field-label"]:has-text("Null Value Handling"), [class*="field"]:has-text("Null Value Handling")',
  "Null Value Handling dropdown":
    '[class*="Select__control"]:near(*:has-text("Null Value Handling")), .Select__control:near(*:has-text("Null Value Handling"))',
  "Exclude option in the Null Value Handling dropdown":
    '[role="option"]:has-text("Exclude"), [class*="Select__option"]:has-text("Exclude")',
  "Zero option in the Null Value Handling dropdown":
    '[role="option"]:has-text("Zero"), [class*="Select__option"]:has-text("Zero")',

  // ── Proceed / Test / Save ─────────────────────────────────────────────────
  "Proceed button":
    'button:has-text("Proceed"), button[data-test-id*="proceed"]',
  "Test Action button":
    'button:has-text("Test Action"), button[data-test-id*="test-action"]',
  "Save and Exit button":
    'button:has-text("Save and Exit"), button[data-test-id*="save-exit"]',

  // ── Date and Time Transformer fields ──────────────────────────────────────
  "operation type dropdown in Date and Time Transformer":
    '[class*="Select__control"]:first-of-type, .Select__control:first-of-type',
  "Add Duration to Date option in the operation type dropdown":
    '[role="option"]:has-text("Add Duration to Date"), [class*="Select__option"]:has-text("Add Duration to Date")',
  "Extract Part of Date option in the operation type dropdown":
    '[role="option"]:has-text("Extract Part of Date"), [class*="Select__option"]:has-text("Extract Part of Date")',
  "Format Date option in the operation type dropdown":
    '[role="option"]:has-text("Format Date"), [class*="Select__option"]:has-text("Format Date")',
  "Get Current Date option in the operation type dropdown":
    '[role="option"]:has-text("Get Current Date"), [class*="Select__option"]:has-text("Get Current Date")',
  "Calculate Time Between Dates option in the operation type dropdown":
    '[role="option"]:has-text("Calculate Time Between Dates"), [class*="Select__option"]:has-text("Calculate Time Between Dates")',
  "Subtract from Date option in the operation type dropdown":
    '[role="option"]:has-text("Subtract from Date"), [class*="Select__option"]:has-text("Subtract from Date")',
  "Input Date field":
    'label:has-text("Input Date"), [class*="field-label"]:has-text("Input Date")',
  "Select Unit dropdown field":
    'label:has-text("Select Unit"), [class*="field-label"]:has-text("Select Unit")',
  "Select Unit dropdown":
    '[class*="Select__control"]:near(*:has-text("Select Unit")), .Select__control:near(*:has-text("Select Unit"))',
  "Minute option in the Select Unit dropdown":
    '[role="option"]:has-text("Minute"), [class*="Select__option"]:has-text("Minute")',
  "Hour option in the Select Unit dropdown":
    '[role="option"]:has-text("Hour"), [class*="Select__option"]:has-text("Hour")',
  "Day option in the Select Unit dropdown":
    '[role="option"]:has-text("Day"), [class*="Select__option"]:has-text("Day")',
  "Week option in the Select Unit dropdown":
    '[role="option"]:has-text("Week"), [class*="Select__option"]:has-text("Week")',
  "Month option in the Select Unit dropdown":
    '[role="option"]:has-text("Month"), [class*="Select__option"]:has-text("Month")',
  "Year option in the Select Unit dropdown":
    '[role="option"]:has-text("Year"), [class*="Select__option"]:has-text("Year")',
  "Add Value field":
    'label:has-text("Add Value"), [class*="field-label"]:has-text("Add Value")',
  "Select Output Format dropdown field":
    'label:has-text("Select Output Format"), [class*="field-label"]:has-text("Select Output Format")',
  "Select Output Format dropdown":
    '[class*="Select__control"]:near(*:has-text("Select Output Format")), .Select__control:near(*:has-text("Select Output Format"))',
  "any option in the Select Output Format dropdown":
    '[role="option"]:first-child, [class*="Select__option"]:first-child',

  // ── Filter Data fields ────────────────────────────────────────────────────
  "Filter Conditions section":
    'h2:has-text("Filter Conditions"), [class*="filter-conditions"], label:has-text("Filter Conditions")',
  "Select Input field in Filter Conditions":
    'label:has-text("Select Input"), [class*="field-label"]:has-text("Select Input")',
  "Operator dropdown in Filter Conditions":
    'label:has-text("Operator"), [class*="field-label"]:has-text("Operator")',
  "Value field in Filter Conditions":
    'label:has-text("Value"), [class*="field-label"]:has-text("Value")',

  // ── Merge Data fields ─────────────────────────────────────────────────────
  "Input Name field":
    'label:has-text("Input Name"), [class*="field-label"]:has-text("Input Name")',
  "Merge Method dropdown field":
    'label:has-text("Merge Method"), [class*="field-label"]:has-text("Merge Method")',
  "Merge Method dropdown":
    '[class*="Select__control"]:near(*:has-text("Merge Method")), .Select__control:near(*:has-text("Merge Method"))',
  "Merge option in the Merge Method dropdown":
    '[role="option"]:text-is("Merge"), [class*="Select__option"]:text-is("Merge")',
  "Append option in the Merge Method dropdown":
    '[role="option"]:has-text("Append"), [class*="Select__option"]:has-text("Append")',
  "Select Merge Option dropdown field":
    'label:has-text("Select Merge Option"), [class*="field-label"]:has-text("Select Merge Option")',
  "Select Merge Option dropdown":
    '[class*="Select__control"]:near(*:has-text("Select Merge Option")), .Select__control:near(*:has-text("Select Merge Option"))',
  "Matching Fields option in the Select Merge Option dropdown":
    '[role="option"]:has-text("Matching Fields"), [class*="Select__option"]:has-text("Matching Fields")',
  "Position option in the Select Merge Option dropdown":
    '[role="option"]:has-text("Position"), [class*="Select__option"]:has-text("Position")',
  "All Possible Combinations option in the Select Merge Option dropdown":
    '[role="option"]:has-text("All Possible Combinations"), [class*="Select__option"]:has-text("All Possible Combinations")',
  "Field Name field in Merge Data":
    'label:has-text("Field Name"), [class*="field-label"]:has-text("Field Name")',
  "Match Options dropdown field":
    'label:has-text("Match Options"), [class*="field-label"]:has-text("Match Options")',

  // ── Modify Object Fields ──────────────────────────────────────────────────
  "Select Operations dropdown field":
    'label:has-text("Select Operations"), [class*="field-label"]:has-text("Select Operations")',
  "Select Operations dropdown":
    '[class*="Select__control"]:near(*:has-text("Select Operations")), .Select__control:near(*:has-text("Select Operations"))',
  "Add New Field option in the Select Operations dropdown":
    '[role="option"]:has-text("Add New Field"), [class*="Select__option"]:has-text("Add New Field")',
  "Remove Field option in the Select Operations dropdown":
    '[role="option"]:has-text("Remove Field"), [class*="Select__option"]:has-text("Remove Field")',
  "Update Field option in the Select Operations dropdown":
    '[role="option"]:has-text("Update Field"), [class*="Select__option"]:has-text("Update Field")',
  "Field Key field":
    'label:has-text("Field Key"), [class*="field-label"]:has-text("Field Key")',
  "Field Value field":
    'label:has-text("Field Value"), [class*="field-label"]:has-text("Field Value")',
  "Target Path field":
    'label:has-text("Target Path"), [class*="field-label"]:has-text("Target Path")',

  // ── Remove Duplicate Data fields ──────────────────────────────────────────
  "Key/Nested Path field":
    'label:has-text("Key/Nested Path"), [class*="field-label"]:has-text("Key/Nested Path")',
  "Case-sensitive comparison checkbox after enabling Show Optional Fields":
    'label:has-text("Case-sensitive comparison"), [class*="checkbox"]:has-text("Case-sensitive comparison")',

  // ── Sort Data fields ──────────────────────────────────────────────────────
  "Select Sort Direction dropdown field":
    'label:has-text("Select Sort Direction"), [class*="field-label"]:has-text("Select Sort Direction")',
  "Select Sort Direction dropdown":
    '[class*="Select__control"]:near(*:has-text("Select Sort Direction")), .Select__control:near(*:has-text("Select Sort Direction"))',
  "Ascending option in the Select Sort Direction dropdown":
    '[role="option"]:has-text("Ascending"), [class*="Select__option"]:has-text("Ascending")',
  "Descending option in the Select Sort Direction dropdown":
    '[role="option"]:has-text("Descending"), [class*="Select__option"]:has-text("Descending")',
  "Enable case-sensitive sorting checkbox after enabling Show Optional Fields":
    'label:has-text("Enable case-sensitive sorting"), [class*="checkbox"]:has-text("case-sensitive sorting")',

  // ── JSON Stringify fields ──────────────────────────────────────────────────
  "Select Indentation Spaces dropdown after enabling Show Optional Fields":
    '[class*="field-label"]:has-text("Select Indentation Spaces"), [class*="field"]:has-text("Select Indentation Spaces")',
  "Select Indentation Spaces dropdown":
    '[class*="Select__control"]:near(*:has-text("Select Indentation Spaces")), .Select__control:near(*:has-text("Select Indentation Spaces"))',

  // ── Transform action fields ───────────────────────────────────────────────
  "Transformation field":
    '[class*="field-label"]:has-text("Transformation"), [class*="field"]:has-text("Transformation")',
  "Add Input button":
    'button:has-text("Add Input"), button[data-test-id*="add-input"]',

  // ── Template action fields ────────────────────────────────────────────────
  "Template field":
    '[class*="field-label"]:has-text("Template"), [class*="field"]:has-text("Template")',

  // ── Configure Trigger navigation (legacy / other connector flows) ─────────
  "Configure Trigger in left navigation panel (doc step)":
    '[data-test-id="automate-nav-configure-trigger"], [data-test-id="automations-nav-configure-trigger"], button:has-text("Configure Trigger"), a:has-text("Configure Trigger")',

  // ── Choose Connector (legacy doc step keys) ───────────────────────────────
  "Choose Connector section on Configure Trigger page (doc step)":
    'h2:has-text("Choose Connector"), [class*="choose-connector"]',
  "BigCommerce connector in Choose Connector list (doc step)":
    '[class*="connector"]:has-text("BigCommerce"), [class*="ConnectorCard"]:has-text("BigCommerce"), button:has-text("BigCommerce")',

  // ── Choose Trigger tab ────────────────────────────────────────────────────
  "Choose Trigger tab (doc step)":
    '[role="tab"]:has-text("Choose Trigger"), button:has-text("Choose Trigger"), h2:has-text("Choose Trigger")',
  "BigCommerce trigger under Choose Trigger tab (doc step)":
    '[class*="trigger"]:has-text("BigCommerce"), [role="option"]:has-text("BigCommerce"), button:has-text("BigCommerce")',

  // ── Configure Trigger tab ─────────────────────────────────────────────────
  "Configure Trigger tab (doc step)":
    '[role="tab"]:has-text("Configure Trigger"), h2:has-text("Configure Trigger"), [class*="configure-trigger-tab"]',

  // ── Add New Account / default account ────────────────────────────────────
  "default account displayed in BigCommerce account list (doc step)":
    '[class*="account-card"], [class*="AccountCard"], [class*="account-item"], [class*="AccountItem"], [class*="account-row"], [role="option"][class*="account"]',
  "+ Add New Account button in Configure Trigger (doc step)":
    'button:has-text("+ Add New Account"), button:has-text("Add New Account"), button[data-test-id*="add-account"]',

  // ── Authorize pop-up ──────────────────────────────────────────────────────
  "Authorize pop-up window (doc step)":
    '[role="dialog"]:has-text("Authorize"), [role="dialog"]:has-text("Store Hash"), .ReactModal__Content:has-text("Store Hash")',
  "Store Hash field in Authorize pop-up (doc step)":
    '[role="dialog"] label:has-text("Store Hash"), .ReactModal__Content label:has-text("Store Hash")',
  "Access Token field in Authorize pop-up (doc step)":
    '[role="dialog"] label:has-text("Access Token"), .ReactModal__Content label:has-text("Access Token")',
  "Authorize button in Authorize BigCommerce pop-up (doc step)":
    '[role="dialog"] button:has-text("Authorize"), .ReactModal__Content button:has-text("Authorize")',

  // ── Select an Event ───────────────────────────────────────────────────────
  "Select an Event dropdown (doc step)":
    'label:has-text("Select an Event") ~ * [class*="select"], [class*="field"]:has(label:has-text("Select an Event")) [class*="select"], [class*="dropdown"]:near(*:has-text("Select an Event"))',
  "any event option in Select an Event dropdown (doc step)":
    '[role="option"]:first-child, [class*="option"]:first-child',

  // ── Optional fields ───────────────────────────────────────────────────────
  "Show Optional Fields toggle button (doc step)":
    'button:has-text("Show Optional Fields"), [class*="toggle"]:has-text("Optional Fields"), [class*="optional-fields-toggle"]',
  "+ Add Custom Header button (doc step)":
    'button:has-text("+ Add Custom Header"), button:has-text("Add Custom Header"), button[data-test-id*="add-custom-header"]',

  // ── Proceed / Test / Save (legacy doc step keys) ──────────────────────────
  "Proceed button in Configure Trigger (doc step)":
    'button:has-text("Proceed"), button[data-test-id*="proceed"]',
  "Test Trigger button (doc step)":
    'button:has-text("Test Trigger"), button[data-test-id*="test-trigger"]',
  "Save and Exit button in Configure Trigger (doc step)":
    'button:has-text("Save and Exit"), button[data-test-id*="save-exit"]',
};

export const VERIFY_SELECTORS: Record<string, string> = {
  "projects listing page (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Projects"), .PageTitle:has-text("Projects")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  // ── Automation Name input ─────────────────────────────────────────────────
  "Automation Name field in the new automation dialog":
    'input[placeholder*="automation name" i], input[placeholder*="Enter name" i], input[name="automationName"]',
  "Automation Name input in Create New Automation modal (doc step)":
    'input[placeholder*="automation name" i], input[placeholder*="Enter name" i], input[name="automationName"]',

  // ── Aggregate Data inputs ─────────────────────────────────────────────────
  // AgentOS forms use div labels (not <label>). `:below(:text-is())` finds inputs geometrically
  // below the exact label text node (avoids matching large containers like :has-text() would).
  "Input Value field":
    'textarea:below(:text-is("Input Value")), input:below(:text-is("Input Value")), textarea[class*="input-value"], input[class*="input-value"]',
  "Field Name field":
    'input:below(:text-is("Field Name")), textarea:below(:text-is("Field Name")), input[placeholder*="field name" i]',

  // ── Date and Time Transformer inputs ─────────────────────────────────────
  "Input Date field":
    'input:below(:text-is("Input Date")), textarea:below(:text-is("Input Date")), input[placeholder*="date" i]',
  "Add Value field":
    'input:below(:text-is("Add Value")), input[placeholder*="value" i], input[type="number"]:below(:text-is("Add Value"))',

  // ── Merge Data inputs ─────────────────────────────────────────────────────
  "Input Name field":
    'input:below(:text-is("Input Name")), input[placeholder*="input name" i]',

  // ── Remove Duplicate Data inputs ──────────────────────────────────────────
  "Key/Nested Path field":
    'input:below(:text-is("Key/Nested Path")), input[placeholder*="path" i]',

  // ── Sort Data inputs ──────────────────────────────────────────────────────
  "Field Name field in Merge Data":
    'input:below(:text-is("Field Name")), input[placeholder*="field name" i]',

  // ── Transform action inputs ───────────────────────────────────────────────
  "Transformation field":
    'textarea:below(:text-is("Transformation")), textarea[class*="transformation"], [data-test-id*="transformation"] textarea',

  // ── Template action inputs ────────────────────────────────────────────────
  "Template field":
    'textarea:below(:text-is("Template")), textarea[class*="template"], [data-test-id*="template"] textarea',

  // ── Legacy doc step keys ──────────────────────────────────────────────────
  "Store Hash input in Authorize pop-up (doc step)":
    '[role="dialog"] input[placeholder*="store hash" i], [role="dialog"] input[name*="storeHash"], .ReactModal__Content input[type="text"]:first-of-type',
  "Access Token input in Authorize pop-up (doc step)":
    '[role="dialog"] input[placeholder*="access token" i], [role="dialog"] input[name*="accessToken"], .ReactModal__Content input[type="password"], .ReactModal__Content input[type="text"]:nth-of-type(2)',
};
