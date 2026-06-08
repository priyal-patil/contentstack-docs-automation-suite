/**
 * Marketplace — marketplace-apps module selectors.
 * Covers:
 *   - audience-insights flow (Install + Full Page + Entry Sidebar)
 *   - content-type-visualizer flow (Install + Dashboard use)
 *   - google-analytics flow (Install + Dashboard Widget + Sidebar Widget)
 *
 * Doc paths: Marketplace → Marketplace Apps → Audience Insights / Content Type Visualizer / Google Analytics
 */

export const CLICK_SELECTORS: Record<string, string> = {
  // ── Google Cloud Console: Create Service Account JSON (doc step) ───────────

  "CREATE PROJECT button in Google Cloud Console (doc step)":
    'button:has-text("CREATE PROJECT"), button:has-text("NEW PROJECT"), [data-testid*="create-project-button"], a:has-text("CREATE PROJECT")',

  "SELECT PROJECT button in Google Cloud Console (doc step)":
    'button:has-text("SELECT PROJECT"), button:has-text("Select Project"), a:has-text("SELECT PROJECT")',

  "Select a project drop-down in Google Cloud Console (doc step)":
    'button:has-text("Select a project"), [aria-label*="Select a project"], [data-testid*="project-selector"], *:has-text("Select a project")',

  "+ CREATE SERVICE ACCOUNT button in Google Cloud Console (doc step)":
    'button:has-text("CREATE SERVICE ACCOUNT"), button:has-text("+ CREATE SERVICE ACCOUNT"), [data-testid*="create-service-account"]',

  "CREATE AND CONTINUE button in Google Cloud Console (doc step)":
    'button:has-text("CREATE AND CONTINUE"), button:has-text("Create and Continue")',

  "DONE button in Google Cloud Console (doc step)":
    'button:has-text("DONE"), button:has-text("Done")',

  "three dots action menu on service account row in Google Cloud Console (doc step)":
    'tbody tr button:last-child, [role="row"] button:last-child, tbody td:last-child button, [aria-label="Actions"] button, [aria-label="more_vert"]',

  "Manage keys option in service account action menu (doc step)":
    '[role="menuitem"]:has-text("Manage keys"), a:has-text("Manage keys"), li:has-text("Manage keys"), button:has-text("Manage keys"), span:text-is("Manage keys")',

  "ADD KEY dropdown in Google Cloud Console (doc step)":
    'button:has-text("ADD KEY"), [aria-label*="ADD KEY"], button:has-text("Add Key")',

  "Create new key option in ADD KEY dropdown (doc step)":
    '[role="menuitem"]:has-text("Create new key"), li:has-text("Create new key"), button:has-text("Create new key")',

  "JSON key type option in Create key dialog (doc step)":
    'input[type="radio"][value="json"] ~ *, label:has-text("JSON"), [role="radio"]:has-text("JSON")',

  "CREATE button in Create key dialog (doc step)":
    'button:has-text("CREATE"), [mat-raised-button]:has-text("CREATE")',

  // ── Google Cloud Console: Enable APIs (doc step) ───────────────────────────

  "+ ENABLE APIS AND SERVICES button in Google Cloud Console (doc step)":
    'button:has-text("ENABLE APIS AND SERVICES"), a:has-text("ENABLE APIS AND SERVICES"), button:has-text("+ ENABLE APIS AND SERVICES")',

  "Google Analytics Reporting API result in API Library (doc step)":
    'a:has-text("Google Analytics Reporting API"), [role="link"]:has-text("Google Analytics Reporting API"), h3:has-text("Google Analytics Reporting API")',

  "ENABLE button for Google Analytics Reporting API (doc step)":
    'button:has-text("ENABLE"), [data-testid*="enable-button"], a:has-text("ENABLE")',

  "Google Analytics Data API result in API Library (doc step)":
    'a:has-text("Google Analytics Data API"), [role="link"]:has-text("Google Analytics Data API"), h3:has-text("Google Analytics Data API")',

  "ENABLE button for Google Analytics Data API (doc step)":
    'button:has-text("ENABLE"), [data-testid*="enable-button"], a:has-text("ENABLE")',

  // ── Google Analytics: Add Service Account + Get IDs (doc step) ─────────────

  "Admin option in Google Analytics left navigation panel (doc step)":
    'a:has-text("Admin"), button:has-text("Admin"), [aria-label="Admin"], [data-testid*="admin"]',

  "Account access management under Account Settings in Google Analytics (doc step)":
    'a:has-text("Account access management"), button:has-text("Account access management"), [role="link"]:has-text("Account access management")',

  "plus icon to add users in Google Analytics (doc step)":
    'button[aria-label*="add"], button[aria-label="Add"], [data-testid*="add-button"], button:has(mat-icon:has-text("add")), [aria-label*="plus"]',

  "Add users option in Google Analytics (doc step)":
    '[role="menuitem"]:has-text("Add users"), li:has-text("Add users"), button:has-text("Add users")',

  "Add roles and data restrictions modal in Google Analytics (doc step)":
    '[role="dialog"]:has-text("Add roles and data restrictions"), [role="heading"]:has-text("Add roles and data restrictions"), *:text-is("Add roles and data restrictions")',

  "Direct roles and data restrictions section in Google Analytics (doc step)":
    '*:has-text("Direct roles and data restrictions"), [class*="direct-roles"], h2:has-text("Direct roles"), h3:has-text("Direct roles")',

  "Email addresses field in Add roles and data restrictions modal in Google Analytics (doc step)":
    'label:has-text("Email addresses"), [aria-label*="Email addresses" i], *:text-is("Email addresses")',

  "Viewer option under Direct roles and data restrictions in Google Analytics (doc step)":
    'label:has-text("Viewer"), input[type="radio"] ~ label:has-text("Viewer"), [role="radio"]:has-text("Viewer"), [role="option"]:has-text("Viewer")',

  "Add button in Add roles and data restrictions modal in Google Analytics (doc step)":
    'button:has-text("Add"):not(:has-text("Add users")), [mat-raised-button]:has-text("Add")',

  "Property details under Property Settings in Google Analytics (doc step)":
    'a:has-text("Property details"), button:has-text("Property details"), [role="link"]:has-text("Property details")',

  "View Settings under View section in Google Analytics (doc step)":
    'a:has-text("View Settings"), button:has-text("View Settings"), [role="link"]:has-text("View Settings")',

  // ── shared Marketplace navigation ─────────────────────────────────────────

  /** App Switcher button in the top navigation bar (doc step).
   * Matches both the CMS div-based switcher and the org-dashboard <button> variant. */
  "App Switcher button (doc step)":
    '[data-test-id="app-switcher"], .app__switcher__v2, button[aria-label="App Switcher"], [aria-controls="app-switcher-modal"]',

  /** Marketplace option inside the App Switcher modal (doc step).
   * Also matches the org-dashboard product card (aria-label contains "Marketplace" and "open"). */
  "Marketplace option in App Switcher (doc step)":
    '[data-test-id="app-switcher-marketplace"], [data-test-id="app-switcher-body"] a:has-text("Marketplace"), [data-test-id="app-switcher-body"] [role="button"]:has-text("Marketplace"), button[aria-label*="Marketplace" i][aria-label*="open" i]',

  /** "Manage" option in the Marketplace navigation (doc step). */
  "Manage option (doc step)":
    '[data-test-id="cs-marketplace-manage"], button:has-text("Manage Apps"), button:has-text("Manage"), [data-test-id="cs-manage-apps"]',

  /** "Installed Apps" option in the Manage dropdown (doc step). */
  "Installed Apps option (doc step)":
    '[data-test-id="cs-marketplace-installed-apps"], a:has-text("Installed Apps"), button:has-text("Installed Apps"), [role="menuitem"]:has-text("Installed Apps")',

  // ── Audience Insights install flow ────────────────────────────────────────

  /** Audience Insights app row in the Installed Apps listing (doc step). */
  "Audience Insights app in Installed Apps (doc step)":
    '[class*="Table__body__row"]:has-text("Audience Insights"), [role="row"]:has-text("Audience Insights"), td:has-text("Audience Insights")',

  /** "Install" button in the Audience Insights app modal (doc step). */
  "Install button in app modal (doc step)":
    'button:has-text("Install"), [data-test-id*="install-app"], [class*="install"]:has-text("Install")',

  /** "Select stack" dropdown in the install authorization page (doc step).
   * Actual UI: Contentstack cs-select component — input[aria-label="cs-select-aria"] inside a cursor:pointer container. */
  "Select stack dropdown in install popup (doc step)":
    'input[aria-label="cs-select-aria"], [class*="cs-select"] .control, *:has(> input[aria-label="cs-select-aria"])',

  /** First enabled stack option in the "Select stack" dropdown (doc step).
   * No :first-child/:first-of-type needed — Playwright's .first() picks the first match. */
  "First stack option in install popup (doc step)":
    '[class*="cs-select__option"]:not([class*="disabled"]), [class*="Select__option"]:not([class*="disabled"]), [role="listbox"] [role="option"]:not([aria-disabled="true"]), [class*="option"]:not([class*="disabled"]):not([class*="group"])',

  /** Terms of Service checkbox in the install authorization page (doc step).
   * Selector targets UNCHECKED state only — if already pre-checked, the step returns no element and the flow continues
   * via warnOnly (avoids accidentally unchecking a pre-checked ToS box). */
  "Terms of Service checkbox in install popup (doc step)":
    'input[type="checkbox"]:not(:checked)',

  /** "Install" button inside the install authorization page (doc step).
   * DOM: button "aria-button" (first button; contains child text "Install"). Cancel is the second button. */
  "Install button in install popup (doc step)":
    'button:has-text("Install"), button[aria-label="aria-button"]:has-text("Install"), button:not(:has-text("Cancel")):has(*:has-text("Install"))',

  /** "Open Stack" button after installation completes (doc step). */
  "Open Stack button (doc step)":
    'button:has-text("Open Stack"), a:has-text("Open Stack"), [data-test-id*="open-stack"]',

  // ── Full Page sections ────────────────────────────────────────────────────

  /** "Apps" dropdown button in the stack top navigation (doc step).
   * DOM: data-test-id="cms-nav-apps", aria-label="Apps", class contains "TopNavbar__content__items__list__async__dropdown__button". */
  "Apps button in top navigation (doc step)":
    '[data-test-id="cms-nav-apps"], button[aria-label="Apps"][class*="apps"], button.apps[class*="TopNavbar"], [data-test-id="cs-dropdown-truncate-button"], [data-test-id="menu"] button:has-text("More"), button:has-text("More")',

  /** "Audience Insights" option in the Apps dropdown / left navigation (doc step).
   * Doc: "On the left-hand side primary navigation, you will find the Audience Insights app icon."
   * Note in doc: "If you have enabled the App Switcher, the icon will be available at the top under the Apps section." */
  "Audience Insights app icon in left navigation (doc step)":
    '[data-test-id*="audience-insights"], a:has-text("Audience Insights"), [role="menuitem"]:has-text("Audience Insights"), li:has-text("Audience Insights") a',

  /** "Opportunity Explorer" section in the Audience Insights Full Page app (doc step).
   * Doc: "The app consists of three sections: Opportunity Explorer, Content Map, Audience Explorer." */
  "Opportunity Explorer section (doc step)":
    '*:has-text("Opportunity Explorer"), [class*="opportunity-explorer"], h2:has-text("Opportunity Explorer"), h3:has-text("Opportunity Explorer")',

  /** "Content Map" section in the Audience Insights Full Page app (doc step). */
  "Content Map section (doc step)":
    '*:has-text("Content Map"), [class*="content-map"], h2:has-text("Content Map"), h3:has-text("Content Map")',

  /** "Audience Explorer" section in the Audience Insights Full Page app (doc step). */
  "Audience Explorer section (doc step)":
    '*:has-text("Audience Explorer"), [class*="audience-explorer"], h2:has-text("Audience Explorer"), h3:has-text("Audience Explorer")',

  // ── Entry Sidebar navigation ──────────────────────────────────────────────

  /** "Entries" page link in the stack left navigation (doc step). */
  "Entries page link (doc step)":
    '[data-test-id="cs-nav-entries"], a[href*="/entries"], nav a:has-text("Entries"), [aria-label="Entries"]',

  /** First entry row in the Entries listing (doc step). */
  "First entry row (doc step)":
    '[data-test-id="cs-entry-row-0"], [class*="entry-list"] [class*="row"]:first-child, [class*="EntryList"] tr:first-child td:first-child',

  /** "Audience Insights" app icon in the entry right navigation panel (doc step). */
  "Audience Insights app icon in right panel (doc step)":
    '[data-test-id*="audience-insights"], [aria-label*="Audience Insights"], [class*="right-panel"] *:has-text("Audience Insights"), [class*="sidebar"] [title*="Audience Insights"]',

  /** "Analyze" button in the Audience Insights Entry Sidebar (doc step). */
  "Analyze button (doc step)":
    'button:has-text("Analyze"), [data-test-id*="analyze"], [class*="analyze"]:has-text("Analyze")',

  /** "Topics" section in the Entry Sidebar analysis results (doc step). */
  "Topics section (doc step)":
    '*:has-text("Topics"), [class*="topics"], h3:has-text("Topics"), [data-test-id*="topics"]',

  /** "Audience Alignment" section in the Entry Sidebar analysis results (doc step). */
  "Audience Alignment section (doc step)":
    '*:has-text("Audience Alignment"), [class*="audience-alignment"], h3:has-text("Audience Alignment")',

  /** "Re-analyze" button in the Entry Sidebar (doc step). */
  "Re-analyze button (doc step)":
    'button:has-text("Re-analyze"), [data-test-id*="re-analyze"], [class*="re-analyze"]:has-text("Re-analyze")',

  // ── Content Type Visualizer — shared Marketplace navigation ───────────────

  /** Marketplace main page heading — verifies we landed on the Marketplace after App Switcher (doc step).
   * DOM: h2 "Contentstack Marketplace: Where composable happens". */
  "Marketplace heading on apps page (doc step)":
    'h2:has-text("Contentstack Marketplace"), [class*="marketplace"] h2, *:has-text("Contentstack Marketplace: Where composable")',

  /** "Apps" filter option in the Marketplace left panel (doc step).
   * Doc: "Click Apps from the left panel." — the left sidebar filter item with exact text "Apps".
   * DOM: generic [cursor=pointer] element (not a link/button/heading). First match in DOM order
   * is the left-panel filter item; heading "Apps" [level=4] appears later in the main content. */
  "Apps option in Marketplace left panel (doc step)":
    '*:text-is("Apps"):not(h4), [class*="sidebar"] *:text-is("Apps"), [class*="filter"] *:text-is("Apps"), [data-test-id="cs-marketplace-apps"]',

  // ── Content Type Visualizer install flow ──────────────────────────────────

  /** Content Type Visualizer app card in the Marketplace Apps listing (doc step). */
  "Content Type Visualizer app card (doc step)":
    '[class*="AppCard"]:has-text("Content Type Visualizer"), [class*="app-card"]:has-text("Content Type Visualizer"), [class*="Table__body__row"]:has-text("Content Type Visualizer"), *:has-text("Content Type Visualizer")',

  /** "Install" button on the Content Type Visualizer card (doc calls it "Install App") (doc step).
   * After searching "Content Type Visualizer" there is 1 result; the button label is "Install" in the UI.
   * Falls back to broader selectors if class names differ. */
  "Install App button on Content Type Visualizer (doc step)":
    'button:has-text("Install App"), button[aria-label="aria-button"]:has-text("Install"):not(:has-text("Cancel")):not(:has-text("Uninstall")), button:has-text("Install"):not(:has-text("Cancel")):not(:has-text("Uninstall")):not(:has-text("Build"))',

  /** "UI Locations" tab in the app configuration page after install (doc step).
   * DOM: generic [cursor=pointer] with text "UI Locations" (not a role=tab or button). */
  "UI Locations tab in app modal (doc step)":
    '[role="tab"]:has-text("UI Locations"), button:has-text("UI Locations"), [class*="tab"]:has-text("UI Locations"), a:has-text("UI Locations"), *:text-is("UI Locations")',

  /** "Stacks" icon in the left navigation panel to return to the stacks list (doc step). */
  "Stacks icon in left navigation (doc step)":
    '[data-test-id="cs-stacks-icon"], [aria-label="Stacks"], [class*="nav"] a[href*="stacks"], [class*="StackIcon"], a:has-text("Stacks"), svg[name="Stacks"]',

  /** The required stack to open for using Content Type Visualizer (doc step).
   * Clicks the first/default stack in the stacks listing. */
  "Required stack for Content Type Visualizer (doc step)":
    '[class*="StackList"] [class*="row"]:first-child a, [class*="StackList"] tr:first-child td:first-child, [class*="stack-item"]:first-child a, [class*="stack-list"] a:first-child',

  // ── Content Type Visualizer dashboard use ─────────────────────────────────

  /** "Dashboard" option in the stack navigation (doc step). */
  "Dashboard option in stack (doc step)":
    '[data-test-id="cs-nav-dashboard"], a[href*="dashboard"], button:has-text("Dashboard"), link:has-text("Dashboard")',

  /** Content Type Visualizer app widget in the stack Dashboard (doc step). */
  "Content Type Visualizer app in Dashboard (doc step)":
    '[class*="dashboard"] *:has-text("Content Type Visualizer"), [class*="Dashboard"] *:has-text("Content Type Visualizer"), iframe[title*="Content Type Visualizer"], *:has-text("Content Type Visualizer")',

  /** Zoom in (+) icon in the Content Type Visualizer diagram (doc step).
   * DOM (inside iframe): button "zoom in" — aria-label is lowercase. */
  "Zoom in icon (doc step)":
    'button[aria-label="zoom in"], button[aria-label="Zoom In"], button[title="zoom in"], button[title="Zoom In"], [class*="zoom-in"]',

  /** Zoom out (-) icon in the Content Type Visualizer diagram (doc step).
   * DOM (inside iframe): button "zoom out" — aria-label is lowercase. */
  "Zoom out icon (doc step)":
    'button[aria-label="zoom out"], button[aria-label="Zoom Out"], button[title="zoom out"], button[title="Zoom Out"], [class*="zoom-out"]',

  /** A content type card/node in the Content Type Visualizer diagram (doc step).
   * DOM (inside iframe): article elements represent each content type card. */
  "Content type card in diagram (doc step)":
    'article, [class*="content-type-card"], [class*="ContentType"], [class*="node"]:not([class*="disabled"])',

  /** "Content Type Information" panel in the right panel after clicking a card (doc step). */
  "Content Type Information panel (doc step)":
    '*:has-text("Content Type Information"), h2:has-text("Content Type Information"), h3:has-text("Content Type Information"), [class*="info-panel"]:has-text("Content Type Information")',

  /** "Name" field label in the Content Type Information panel (doc step). */
  "Name field in Content Type Information (doc step)":
    '*:text-is("Name"), [class*="info-panel"] *:has-text("Name"), [class*="ContentTypeInfo"] *:has-text("Name")',

  /** "Field Count" label in the Content Type Information panel (doc step). */
  "Field Count in Content Type Information (doc step)":
    '*:text-is("Field Count"), *:has-text("Field Count"), [class*="info-panel"] *:has-text("Field Count")',

  /** "Edit Content Type" button in the Content Type Information panel (doc step). */
  "Edit Content Type button (doc step)":
    'button:has-text("Edit Content Type"), a:has-text("Edit Content Type"), [data-test-id*="edit-content-type"], *:text-is("Edit Content Type")',

  /** "Referenced Content Type(s)" dropdown in the Content Type Information panel (doc step).
   * Optional field — warnOnly in the flow. */
  "Referenced Content Types dropdown (doc step)":
    '*:has-text("Referenced Content Type(s)"), *:text-is("Referenced Content Type(s)"), button:has-text("Referenced Content Type"), [class*="referenced"]',

  /** "JSON View" icon/button in the right panel of Content Type Visualizer (doc step). */
  "JSON View icon in right panel (doc step)":
    'button[aria-label*="JSON"], button:has-text("JSON View"), *:text-is("JSON View"), [data-test-id*="json-view"], [class*="json-view"]',

  /** "Content Type" section heading in the JSON view panel (doc step). */
  "Content Type section in JSON view (doc step)":
    '[class*="json-panel"] *:has-text("Content Type"), [class*="JSONView"] *:has-text("Content Type"), *:text-is("Content Type")',

  /** "JSON" section heading in the JSON view panel (doc step). */
  "JSON section in JSON view (doc step)":
    '*:text-is("JSON"), [class*="json-panel"] *:has-text("JSON"), [class*="code-section"] *:has-text("JSON")',

  /** "Copy" icon/button to copy the JSON code (doc step). */
  "Copy icon in JSON view (doc step)":
    'button:has-text("Copy"), *:text-is("Copy"), button[aria-label*="Copy"], [data-test-id*="copy"], [class*="copy-icon"]',

  /** "Recenter" icon to bring diagram back to initial state (doc step).
   * DOM (inside iframe): button "Recenter" — exact accessible name. */
  "Recenter icon (doc step)":
    'button[aria-label="Recenter"], button[aria-label="recenter"], button:has-text("Recenter"), button[title*="Recenter" i], [class*="recenter"]',

  /** "Fullscreen" icon to view diagram in full screen (doc step).
   * DOM (inside iframe): img "Fullscreen" with cursor:pointer — it is an img element, not a button. */
  "Fullscreen icon (doc step)":
    'img[alt="Fullscreen"], button[aria-label*="Fullscreen" i], *[aria-label*="fullscreen" i], [title*="Fullscreen" i], [class*="fullscreen"]',

  /** "Reload" button to reload content types in the Dashboard (doc step).
   * DOM (inside iframe): button "aria-button" containing text with "Content Types" count. */
  "Reload button (doc step)":
    'button:has-text("Reload"), button:has-text("Content Types"), [data-test-id*="reload"], button[aria-label*="Reload"], [class*="reload"]:has-text("Reload")',

  /** "Search" button to search for specific content types (doc step). */
  "Search button (doc step)":
    'button:has-text("Search"), button[aria-label*="Search" i], [data-test-id*="search-content-type"], [class*="search-button"]',

  /** "X" button to clear and close the Search modal (doc step). */
  "X button to clear search (doc step)":
    'button:has-text("X"), button[aria-label="Clear"], button[aria-label="Close"], [class*="search-modal"] button[class*="clear"], button[aria-label*="close" i]',

  // ── Google Analytics install flow ─────────────────────────────────────────

  /** Google Analytics app card in the Marketplace Apps listing (doc step). */
  "Google Analytics app card (doc step)":
    '[class*="AppCard"]:has-text("Google Analytics"), [class*="app-card"]:has-text("Google Analytics"), *:has-text("Google Analytics"):not(nav):not(button)',

  /** "Install" button on the Google Analytics app card (doc step). */
  "Install button on Google Analytics app (doc step)":
    'button:has-text("Install App"), button[aria-label="aria-button"]:has-text("Install"):not(:has-text("Cancel")):not(:has-text("Uninstall")), button:has-text("Install"):not(:has-text("Cancel")):not(:has-text("Uninstall")):not(:has-text("Build"))',

  /** "Configuration" tab in the app modal after install (doc step).
   * Google Analytics opens to a Configuration tab (unlike apps that open directly to UI Locations). */
  "Configuration tab in app modal (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Configuration"), [class*="Tab__item"]:has-text("Configuration"), [role="tab"]:has-text("Configuration"), button:has-text("Configuration"), *:text-is("Configuration")',

  /** "Universal Analytics" option on the Configuration screen (doc step).
   * Doc: "choose the Google Analytics solution you prefer: Universal Analytics". */
  "Universal Analytics option in Configuration (doc step)":
    'label:has-text("Universal Analytics"), input[value*="universal" i] + *, *:has-text("Universal Analytics"):not(nav), [class*="radio"]:has-text("Universal Analytics")',

  /** "Google Analytics 4" option on the Configuration screen (doc step).
   * Doc: "Google Analytics 4: Contentstack now supports Google Analytics 4". */
  "Google Analytics 4 option in Configuration (doc step)":
    'label:has-text("Google Analytics 4"), input[value*="ga4" i] + *, *:has-text("Google Analytics 4"):not(nav), [class*="radio"]:has-text("Google Analytics 4")',

  /** "Property ID" field on the Google Analytics 4 configuration screen (doc step).
   * Doc: "Property ID: Enter the Property ID retrieved in Step 1." */
  "Property ID field in Google Analytics 4 configuration (doc step)":
    'label:has-text("Property ID"), *:text-is("Property ID"), [data-test-id*="property-id"], input[placeholder*="Property ID" i], *:has-text("Property ID")',

  /** "View ID" field label on the Universal Analytics configuration screen (doc step).
   * Doc: "View ID: Enter the View ID retrieved in Step 1." */
  "View ID field in Universal Analytics configuration (doc step)":
    'label:has-text("View ID"), *:text-is("View ID"), [data-test-id*="view-id"], *:has-text("View ID")',

  /** "Import Service Account Details" section/button in the Configuration screen (doc step).
   * Doc: "Import Service Account Details: Upload the service account details (service_account.json file)." */
  "Import Service Account Details section in Configuration (doc step)":
    '*:has-text("Import Service Account Details"), *:has-text("Service Account"), button:has-text("Import"), [class*="service-account"]',

  /** "Save" button on the app Configuration screen (doc step).
   * Doc: "After adding the configuration details, click the Save button." */
  "Save button in app configuration (doc step)":
    'button:has-text("Save"), [data-test-id*="config-save"], [class*="save-btn"]:has-text("Save"), button[aria-label="Save"]',

  /** "Webhook" tab in the app modal (doc step).
   * Doc: "If the webhook is enabled for your app, you can view the webhook logs under the Webhook tab." */
  "Webhook tab in app modal (doc step)":
    '[role="tab"]:has-text("Webhook"), button:has-text("Webhook"), [class*="tab"]:has-text("Webhook"), a:has-text("Webhook"), *:text-is("Webhook")',

  // ── Google Analytics dashboard widget ────────────────────────────────────

  /** Google Analytics widget card in the stack Dashboard (doc step). */
  "Google Analytics widget in Dashboard (doc step)":
    '[class*="dashboard"] *:has-text("Google Analytics"), [class*="Dashboard"] *:has-text("Google Analytics"), *:has-text("Google Analytics"):not(nav):not([class*="Marketplace"])',

  /** Day selection options (small cards) in the Google Analytics Dashboard widget (doc step).
   * Doc: "You can select the number of days for which data should be displayed." */
  "Day selection options in Dashboard widget (doc step)":
    '[class*="day"]:has-text("Days"), button:has-text("Days"), *:has-text("30 Days"), *:has-text("7 Days"), [class*="filter"]:has-text("Days")',

  // ── Google Analytics sidebar widget: content type creation ───────────────

  /** "Content Models" icon/link in the stack left navigation (doc step). */
  "Content Models icon in left nav (doc step)":
    '[data-test-id="cs-nav-content-models"], [data-test-id="cs-nav-content-types"], a[href*="content-types"], button:has-text("Content Models"), nav a:has-text("Content Models"), [aria-label="Content Models"]',

  /** "+ New Content Type" button on the Content Models listing page (doc step). */
  "New Content Type button (doc step)":
    'button[aria-label="Create New Content Type"], button:has-text("+ New Content Type"), button:has-text("New Content Type"), [data-test-id*="new-content-type"], a:has-text("New Content Type")',

  /** "Create New" option in the New Content Type dropdown (doc step).
   * This appears ONLY after clicking the "New Content Type" button — it's the dropdown child button. */
  "Create New option in content type dropdown (doc step)":
    '[data-test-id="cs-cb-new-ct-child"], button:has-text("Create New"), [role="menuitem"]:has-text("Create New")',

  /** "Save and Proceed" (or "Proceed") button in the new content type creation modal (doc step). */
  "Proceed button in new content type modal (doc step)":
    'button:has-text("Save and Proceed"), button:has-text("Proceed"), button:has-text("Continue"), [data-test-id*="proceed-btn"], [data-test-id*="continue-btn"]',

  /** "Insert a field" link (+ sign) in the Content Type Builder (doc step).
   * Doc: "clicking the Insert a field link represented by a + sign".
   * The PurpleAdd (+) icon lives inside [data-test-id="cs-field-type-selector"] and
   * appears after hovering — hover on that container first, then click the SVG. */
  "Insert a field button in Content Type Builder (doc step)":
    '[data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"], [data-test-id="cs-field-type-selector"] [data-test-id="cs-icon"][name="PurpleAdd"], [data-test-id="cs-field-type-selector"] .FieldTypeSelector__action-bar svg[name="PurpleAdd"], [data-test-id*="insert-field"], button:has(svg[name="PurpleAdd"])',

  /** "URL" field type option in the Insert a field panel (doc step). */
  "URL field type option in Content Type Builder (doc step)":
    'button:has-text("URL"):not(:has-text("JSON")):not(:has-text("Rich")), [data-test-id*="field-url"], [class*="field-type"]:has-text("URL"):not(:has-text("JSON")), li:has-text("URL"):not(:has-text("JSON RTE")):not(:has-text("Rich")), *:text-is("URL")',

  /** "Save" or "Save and Close" button in the Content Type Builder (doc step). */
  "Save button in Content Type Builder (doc step)":
    'button:has-text("Save and Close"), button:has-text("Save"), [data-test-id*="ct-save"], [class*="save-btn"]:has-text("Save"), button[aria-label*="Save"]',

  // ── Google Analytics sidebar widget: entry creation ───────────────────────

  /** "Entries" option in the stack top navigation bar (doc step).
   * Doc: navigation to Entries to create a new entry. */
  "Entries option in top nav (doc step)":
    '[data-test-id="cs-nav-entries"], a:has-text("Entries"), button:has-text("Entries"), nav a[href*="entries"]',

  /** "+ New Entry" button on the Entries listing page (doc step). */
  "New Entry button (doc step)":
    'button:has-text("+ New Entry"), button:has-text("New Entry"), a:has-text("New Entry"), [data-test-id*="add-entry"], [data-test-id*="new-entry"]',

  /** "GA Test Content Type" option in the new entry content type selector (doc step).
   * Automation selects the content type created in the sidebar widget setup. */
  "GA Test Content Type option in new entry type selector (doc step)":
    '*:has-text("GA Test Content Type"), [role="option"]:has-text("GA Test Content Type"), li:has-text("GA Test Content Type")',

  /** "Save" button in the entry editor (doc step). */
  "Save button in entry (doc step)":
    'button:has-text("Save"):not(:has-text("Close")):not(:has-text("Publish")), [data-test-id*="entry-save"], button[aria-label="Save"], [class*="save-btn"]:has-text("Save"):not(:has-text("Close"))',

  // ── Google Analytics sidebar widget: using the widget ────────────────────

  /** "Widgets" icon/button in the entry right navigation panel (doc step).
   * Doc: "In the right navigation panel, click Widgets". */
  "Widgets button in entry right nav panel (doc step)":
    '[data-test-id*="widgets"], button:has-text("Widgets"), [aria-label="Widgets"], [class*="right-panel"] button:has-text("Widgets"), [class*="sidebar-right"] button:has-text("Widgets")',

  /** "Google Analytics" app option in the Widgets panel (doc step).
   * Doc: "select the Google Analytics app to view the analytics". */
  "Google Analytics option in Widgets panel (doc step)":
    '[data-test-id*="google-analytics"], *:has-text("Google Analytics"):not(nav), li:has-text("Google Analytics"), [class*="widget-item"]:has-text("Google Analytics")',

  /** Google Analytics sidebar widget panel (verify it loaded) (doc step). */
  "Google Analytics sidebar widget (doc step)":
    '[class*="sidebar"] *:has-text("Google Analytics"), [class*="right-panel"] *:has-text("Google Analytics"), [class*="widget"] *:has-text("Google Analytics"), *:has-text("Google Analytics")',

  /** Doc text verified after selecting Google Analytics in the Widgets panel (doc step).
   * Doc: "You can select the number of days for which data should be displayed for the specific page." */
  "number of days message in Google Analytics sidebar widget (doc step)":
    '*:has-text("You can select the number of days for which data should be displayed for the specific page.")',

  // ── Google Analytics: verify IDs (doc step) ───────────────────────────────

  /** PROPERTY ID label visible in top-right corner of Property details page (doc step).
   * Doc: "In the top-right corner, you can view the PROPERTY ID." */
  "PROPERTY ID in top-right corner of Google Analytics (doc step)":
    '*:has-text("PROPERTY ID"), [aria-label*="Property ID" i], [class*="property-id"], h2:has-text("Property ID")',

  /** View ID label in View Settings page (doc step).
   * Doc: "copy the View ID to the clipboard to use in Step 2." */
  "View ID in View Settings in Google Analytics (doc step)":
    '*:has-text("View ID"), [aria-label*="View ID" i], [class*="view-id"], h2:has-text("View ID")',

  // ── Healthcheck app install + configuration ────────────────────────────────

  /** Health Check app card in the Marketplace Apps listing (doc step). */
  "Healthcheck app card (doc step)":
    '[class*="AppCard"]:has-text("Healthcheck"), [class*="app-card"]:has-text("Healthcheck"), [class*="Table__body__row"]:has-text("Healthcheck"), *:has-text("Healthcheck"):not(nav):not(button)',

  /** "Install" button on the Health Check app card (doc step). */
  "Install button on Healthcheck app (doc step)":
    'button:has-text("Install App"), button[aria-label="aria-button"]:has-text("Install"):not(:has-text("Cancel")):not(:has-text("Uninstall")), button:has-text("Install"):not(:has-text("Cancel")):not(:has-text("Uninstall")):not(:has-text("Build"))',

  /** "Branch" dropdown on the Health Check Configuration screen (doc step).
   * Doc: "Select the Branch and Environment from their respective drop-down menus."
   * DOM: cs-select component; enabled Branch select has input[aria-label="cs-select-aria"]:not([disabled]). */
  "Branch dropdown on Configuration screen (doc step)":
    '*:has-text("Select..."):has(input[aria-label="cs-select-aria"]:not([disabled])), *:has(> input[aria-label="cs-select-aria"]:not([disabled])), input[aria-label="cs-select-aria"]:not([disabled])',

  /** First option in the Branch dropdown (doc step). */
  "First branch option in Branch dropdown (doc step)":
    '[class*="cs-select__option"]:not([class*="disabled"]), [class*="option"]:not([class*="disabled"]):not([class*="group"]), [role="option"]:not([aria-disabled="true"])',

  /** "Environment" dropdown on the Health Check Configuration screen (doc step).
   * Doc: "Select the Branch and Environment from their respective drop-down menus."
   * DOM: second cs-select on the page; may become enabled after Branch is selected. */
  "Environment dropdown on Configuration screen (doc step)":
    '*:has-text("Select..."):has(input[aria-label="cs-select-aria"]:not([disabled])), *:has(> input[aria-label="cs-select-aria"]:not([disabled])), input[aria-label="cs-select-aria"]:not([disabled])',

  /** First option in the Environment dropdown (doc step). */
  "First environment option in Environment dropdown (doc step)":
    '[class*="cs-select__option"]:not([class*="disabled"]), [class*="option"]:not([class*="disabled"]):not([class*="group"]), [role="option"]:not([aria-disabled="true"])',

  /** "Healthcheck Report Download" toggle on the Configuration screen (doc step). */
  "Healthcheck Report Download toggle (doc step)":
    '*:has-text("Healthcheck Report Download") [role="switch"], *:has-text("Report Download") [role="switch"], label:has-text("Report Download") + [role="switch"], [class*="toggle"]:near(*:has-text("Report Download"))',

  /** "Healthcheck Email Notifications" toggle on the Configuration screen (doc step). */
  "Healthcheck Email Notifications toggle (doc step)":
    '*:has-text("Email Notifications") [role="switch"], label:has-text("Email Notifications") + [role="switch"], [class*="toggle"]:near(*:has-text("Email Notifications")), *:has-text("Healthcheck Email Notifications") [role="switch"]',

  /** "Authorize" button on the Health Check Configuration screen (doc step). */
  "Authorize button on Configuration screen (doc step)":
    'button:has-text("Authorize"), [data-test-id*="authorize"], a:has-text("Authorize")',

  /** Second "Authorize" button after organization entities appear (doc step). */
  "Second Authorize button on Configuration screen (doc step)":
    'button:has-text("Authorize"), [data-test-id*="authorize"], a:has-text("Authorize")',

  /** "Save" button on the Health Check app Configuration screen (doc step). */
  "Save button on app Configuration screen (doc step)":
    'button:has-text("Save"), [data-test-id*="config-save"], [class*="save-btn"]:has-text("Save"), button[aria-label="Save"]',

  // ── Healthcheck app use ────────────────────────────────────────────────────

  /** "Health Check" app option in the Apps dropdown (doc step). */
  "Healthcheck app in Apps dropdown (doc step)":
    '[data-test-id*="healthcheck"], [data-test-id*="health-check"], ' +
    'a:has-text("Healthcheck"), button:has-text("Healthcheck"), ' +
    '[role="menuitem"]:has-text("Healthcheck"), li:has-text("Healthcheck") a, ' +
    'a:has-text("Health Check"), button:has-text("Health Check"), ' +
    '[role="menuitem"]:has-text("Health Check"), li:has-text("Health Check") a, ' +
    '[class*="dropdown"] a:has-text("Healthcheck"), [class*="dropdown"] a:has-text("Health Check"), ' +
    '[data-test-id="menu"] a:has-text("Healthcheck"), [data-test-id="menu"] a:has-text("Health Check"), ' +
    '[class*="truncate"] a:has-text("Healthcheck"), [class*="truncate"] a:has-text("Health Check")',

  /** "Customize and Run" button on the Health Check welcome screen (doc step). */
  "Customize and Run button (doc step)":
    'button:has-text("Customize and Run"), a:has-text("Customize and Run"), [data-test-id*="customize-run"]',

  /** "Healthcheck Configuration" modal heading (doc step). */
  "Healthcheck Configuration modal (doc step)":
    '[role="dialog"] *:has-text("Healthcheck Configuration"), *:has-text("Healthcheck Configuration"), [class*="modal"] *:has-text("Healthcheck Configuration")',

  /** "Clear All" button in the Healthcheck Configuration modal (doc step). */
  "Clear All button in Healthcheck Configuration modal (doc step)":
    'button:has-text("Clear All"), [data-test-id*="clear-all"], a:has-text("Clear All")',

  /** "Run Healthcheck" button in the Configuration modal (doc step). */
  "Run Healthcheck button in modal (doc step)":
    'button:has-text("Run Healthcheck"), [data-test-id*="run-healthcheck"], a:has-text("Run Healthcheck")',

  /** "Running Healthcheck" modal heading (doc step). */
  "Running Healthcheck modal (doc step)":
    '[role="dialog"] *:has-text("Running Healthcheck"), *:has-text("Running Healthcheck"), [class*="modal"] *:has-text("Running Healthcheck")',

  /** "Overview" heading after Healthcheck completes (doc step). */
  "Healthcheck Overview heading (doc step)":
    '[class*="healthcheck"] *:has-text("Overview"), nav a:has-text("Overview"), [class*="left-nav"] *:has-text("Overview"), h1:has-text("Overview"), h2:has-text("Overview"), *:has-text("Overview")',

  /** "Actions Required" summary card in the Healthcheck overview/section (doc step). */
  "Actions Required section in Healthcheck (doc step)":
    '*:has-text("Actions Required"), [class*="actions-required"], h3:has-text("Actions Required"), [class*="card"]:has-text("Actions Required")',

  /** "Overall Opportunities" summary card in the Healthcheck overview (doc step). */
  "Overall Opportunities section in Healthcheck (doc step)":
    '*:has-text("Overall Opportunities"), [class*="opportunities"], h3:has-text("Overall Opportunities"), [class*="card"]:has-text("Overall Opportunities")',

  /** "Strengths" summary card in the Healthcheck overview/section (doc step). */
  "Strengths section in Healthcheck (doc step)":
    '*:has-text("Strengths"), [class*="strengths"], h3:has-text("Strengths"), [class*="card"]:has-text("Strengths")',

  /** "Download PDF" button in the Healthcheck overview (doc step). */
  "Download PDF button in Healthcheck (doc step)":
    'button:has-text("Download PDF"), a:has-text("Download PDF"), [data-test-id*="download-pdf"]',

  /** "Run Healthcheck" button on the Healthcheck overview page (doc step). */
  "Run Healthcheck button on overview page (doc step)":
    'button:has-text("Run Healthcheck"), [data-test-id*="run-healthcheck"], a:has-text("Run Healthcheck")',

  /** "Security" item in the Healthcheck left navigation panel (doc step). */
  "Security section in Healthcheck left nav (doc step)":
    'nav a:has-text("Security"), [class*="left-nav"] *:has-text("Security"), [class*="sidebar"] a:has-text("Security"), li a:has-text("Security"):not([href*="contentstack"])',

  /** "View Details" button/link in the Healthcheck section results (doc step). */
  "View Details button in Healthcheck (doc step)":
    'button:has-text("View Details"), a:has-text("View Details"), [data-test-id*="view-details"]',

  /** "Export XLSX" button in a Healthcheck category section (doc step). */
  "Export XLSX button in Healthcheck (doc step)":
    'button:has-text("Export XLSX"), a:has-text("Export XLSX"), [data-test-id*="export-xlsx"]',

  /** "Content Modeling" item in the Healthcheck left navigation panel (doc step). */
  "Content Modeling section in Healthcheck left nav (doc step)":
    'nav a:has-text("Content Modeling"), [class*="left-nav"] *:has-text("Content Modeling"), [class*="sidebar"] a:has-text("Content Modeling"), li a:has-text("Content Modeling")',

  /** "Content" item in the Healthcheck left navigation panel (doc step). */
  "Content section in Healthcheck left nav (doc step)":
    'nav a:text-is("Content"), [class*="left-nav"] a:text-is("Content"), [class*="sidebar"] a:text-is("Content"), li a:text-is("Content")',

  /** "Other Configurations" item in the Healthcheck left navigation panel (doc step). */
  "Other Configurations section in Healthcheck left nav (doc step)":
    'nav a:has-text("Other Configurations"), [class*="left-nav"] *:has-text("Other Configurations"), [class*="sidebar"] a:has-text("Other Configurations"), li a:has-text("Other Configurations")',

  /** "Usage Checks" item in the Healthcheck left navigation panel (doc step). */
  "Usage Checks section in Healthcheck left nav (doc step)":
    'nav a:has-text("Usage Checks"), [class*="left-nav"] *:has-text("Usage Checks"), [class*="sidebar"] a:has-text("Usage Checks"), li a:has-text("Usage Checks")',

  /** "Bandwidth Usage" section heading in the Healthcheck Usage Checks view (doc step). */
  "Bandwidth Usage section in Healthcheck (doc step)":
    '*:has-text("Bandwidth Usage"), h3:has-text("Bandwidth Usage"), [class*="bandwidth"], [data-test-id*="bandwidth"]',

  /** "Top URLs" section heading in the Healthcheck Usage Checks view (doc step). */
  "Top URLs section in Healthcheck (doc step)":
    '*:has-text("Top URLs"), h3:has-text("Top URLs"), [class*="top-urls"], [data-test-id*="top-urls"]',

  /** "Status Code" section heading in the Healthcheck Usage Checks view (doc step). */
  "Status Code section in Healthcheck (doc step)":
    '*:has-text("Status Code"), h3:has-text("Status Code"), [class*="status-code"], [data-test-id*="status-code"]',

  /** "API Usage" section heading in the Healthcheck Usage Checks view (doc step). */
  "API Usage section in Healthcheck (doc step)":
    '*:has-text("API Usage"), h3:has-text("API Usage"), [class*="api-usage"], [data-test-id*="api-usage"]',

  /** "Logs" item in the Healthcheck left navigation panel (doc step). */
  "Logs section in Healthcheck left nav (doc step)":
    'nav a:text-is("Logs"), [class*="left-nav"] a:text-is("Logs"), [class*="sidebar"] a:text-is("Logs"), li a:text-is("Logs")',

  /** "Info" tab in the Healthcheck Logs view (doc step). */
  "Info tab in Healthcheck Logs (doc step)":
    '[role="tab"]:has-text("Info"), button:has-text("Info"), [class*="tab"]:has-text("Info"), a:text-is("Info")',

  /** "Skipped" tab in the Healthcheck Logs view (doc step). */
  "Skipped tab in Healthcheck Logs (doc step)":
    '[role="tab"]:has-text("Skipped"), button:has-text("Skipped"), [class*="tab"]:has-text("Skipped"), a:text-is("Skipped")',

  /** "Full Page" UI location entry on the UI Locations tab after install (doc step). */
  "Full Page UI Location in app modal (doc step)":
    '*:has-text("Full Page"), [class*="ui-location"]:has-text("Full Page"), td:has-text("Full Page"), tr:has-text("Full Page"), [class*="location"]:has-text("Full Page")',

  /** "Cancel" button inside the Running Healthcheck modal (doc step). */
  "Cancel button in Running Healthcheck modal (doc step)":
    '[role="dialog"] button:has-text("Cancel"), [class*="modal"] button:has-text("Cancel"), button:has-text("Cancel")',

  /** "Yes" button in the confirmation dialog after clicking Cancel in the Running Healthcheck modal (doc step). */
  "Yes button to confirm cancel Healthcheck (doc step)":
    '[role="dialog"] button:has-text("Yes"), button:text-is("Yes"), [class*="modal"] button:has-text("Yes"), [class*="confirm"] button:has-text("Yes")',

  /** "Areas of Opportunities" category section within a Healthcheck result page (doc step). */
  "Areas of Opportunities section in Healthcheck (doc step)":
    '*:has-text("Areas of Opportunities"), [class*="opportunities"], h3:has-text("Areas of Opportunities"), [class*="card"]:has-text("Areas of Opportunities"), *:text-is("Areas of Opportunities")',

  /** Gear/settings icon on the first stack row in the Healthcheck "Installed On Stack" modal tab (doc step).
   * Appears when the app is already installed; clicking navigates to that stack's Configuration page. */
  "Gear icon on first installed stack row (doc step)":
    '[role="dialog"] [role="row"][aria-label="row 1"] [role="cell"]:last-child img:last-child, [role="dialog"] [role="row"][aria-label="row 1"] [role="cell"]:last-child > :last-child, [role="dialog"] table [role="row"]:nth-child(2) [role="cell"]:last-child img:last-child',

  // ── MonkeyLearn install + use ─────────────────────────────────────────────

  /** MonkeyLearn app card in the Marketplace Apps listing (doc step). */
  "MonkeyLearn app card (doc step)":
    '[class*="AppCard"]:has-text("MonkeyLearn"), [class*="app-card"]:has-text("MonkeyLearn"), [class*="Table__body__row"]:has-text("MonkeyLearn"), *:has-text("MonkeyLearn"):not(nav):not(button)',

  /** "Install App" button on the MonkeyLearn app card (doc step). */
  "Install App button on MonkeyLearn (doc step)":
    'button:has-text("Install App"), button[aria-label="aria-button"]:has-text("Install"):not(:has-text("Cancel")):not(:has-text("Uninstall")), button:has-text("Install"):not(:has-text("Cancel")):not(:has-text("Uninstall")):not(:has-text("Build"))',

  /** "API Key" label/field on the MonkeyLearn Configuration screen (doc step). */
  "API Key field in MonkeyLearn Configuration (doc step)":
    'label:has-text("API Key"), *:text-is("API Key"), [data-test-id*="api-key"], [class*="api-key"]:has-text("API Key"), *:has-text("API Key")',

  /** "Scope" section label on the MonkeyLearn Configuration screen (doc step). */
  "Scope section in MonkeyLearn Configuration (doc step)":
    '*:text-is("Scope"), label:has-text("Scope"), [class*="scope"]:has-text("Scope"), *:has-text("Select Scope")',

  /** "All Content Types" option in the Scope selection on MonkeyLearn Configuration (doc step). */
  "All Content Types option in Scope (doc step)":
    'label:has-text("All Content Types"), input[value*="all" i] + label, [role="radio"]:has-text("All Content Types"), [role="option"]:has-text("All Content Types"), *:has-text("All Content Types"):not(nav)',

  /** "Specific Content Type" option in the Scope selection on MonkeyLearn Configuration (doc step). */
  "Specific Content Type option in Scope (doc step)":
    'label:has-text("Specific Content Type"), input[value*="specific" i] + label, [role="radio"]:has-text("Specific Content Type"), [role="option"]:has-text("Specific Content Type"), *:has-text("Specific Content Type"):not(nav)',

  /** "Multi Line Textbox" field type option in the Insert a field panel (doc step). */
  "Multi Line Textbox field type option in Content Type Builder (doc step)":
    'button:has-text("Multi Line Textbox"), li:has-text("Multi Line Textbox"), [class*="field-type"]:has-text("Multi Line Textbox"), *:text-is("Multi Line Textbox"), [data-test-id*="multi-line"]',

  /** "JSON RTE" field type option in the Insert a field panel (doc step).
   * Doc calls it "JSON RTE field"; the UI labels it "JSON Rich Text Editor". */
  "JSON RTE field type option in Content Type Builder (doc step)":
    '*:text-is("JSON Rich Text Editor"), button:has-text("JSON Rich Text Editor"), li:has-text("JSON Rich Text Editor"), [class*="field-type"]:has-text("JSON Rich Text Editor"), button:has-text("JSON RTE"), li:has-text("JSON RTE"), *:text-is("JSON RTE"), [data-test-id*="json-rte"]',

  /** "Apps" section label inside the Entry Widgets dropdown panel (doc step).
   * Doc: "click the Entry Widgets dropdown, and under Apps, select the app". */
  "Apps section in Entry Widgets panel (doc step)":
    '[class*="widget"] *:text-is("Apps"), [class*="sidebar"] *:text-is("Apps"), [class*="EntryWidgets"] *:text-is("Apps"), *:text-is("Apps"):not(h4):not(nav)',

  /** "Entry Widgets" dropdown in the entry right panel Widgets section (doc step). */
  "Entry Widgets dropdown in Widgets panel (doc step)":
    '*:has-text("Entry Widgets"), button:has-text("Entry Widgets"), [class*="EntryWidgets"], [class*="entry-widgets"], [class*="widget-header"]:has-text("Entry Widgets")',

  /** "MonkeyLearn" app option inside the Entry Widgets dropdown (doc step). */
  "MonkeyLearn option in Entry Widgets (doc step)":
    '[data-test-id*="monkeylearn"], li:has-text("MonkeyLearn"), [role="option"]:has-text("MonkeyLearn"), [class*="widget-item"]:has-text("MonkeyLearn"), *:has-text("MonkeyLearn"):not(nav):not(h1):not(h2)',

  /** "Model" label/dropdown in the MonkeyLearn sidebar widget (doc step). */
  "Model dropdown in MonkeyLearn widget (doc step)":
    'label:has-text("Model"), *:text-is("Model"), *:has-text("Model"):has(input[aria-label="cs-select-aria"]), [class*="model"] input[aria-label="cs-select-aria"], [class*="widget"] *:has(> input[aria-label="cs-select-aria"])',

  /** First option in the Model dropdown in the MonkeyLearn sidebar widget (doc step). */
  "First model option in MonkeyLearn widget (doc step)":
    '[class*="cs-select__option"]:not([class*="disabled"]), [class*="option"]:not([class*="disabled"]):not([class*="group"]), [role="option"]:not([aria-disabled="true"])',

  /** "Entry Field" label/dropdown in the MonkeyLearn sidebar widget (doc step). */
  "Entry Field dropdown in MonkeyLearn widget (doc step)":
    'label:has-text("Entry Field"), *:text-is("Entry Field"), *:has-text("Entry Field"):has(input[aria-label="cs-select-aria"]), [class*="entry-field"] input[aria-label="cs-select-aria"]',

  /** First option in the Entry Field dropdown in the MonkeyLearn sidebar widget (doc step). */
  "First entry field option in MonkeyLearn widget (doc step)":
    '[class*="cs-select__option"]:not([class*="disabled"]), [class*="option"]:not([class*="disabled"]):not([class*="group"]), [role="option"]:not([aria-disabled="true"])',

  /** "Run" button in the MonkeyLearn sidebar widget (doc step). */
  "Run button in MonkeyLearn widget (doc step)":
    '[class*="widget"] button:has-text("Run"), [class*="sidebar"] button:has-text("Run"), button:has-text("Run"):not(:has-text("Content Type")):not(:has-text("Rerun"))',

  /** Results container in the MonkeyLearn sidebar widget after clicking Run (doc step). */
  "MonkeyLearn results in widget (doc step)":
    '[class*="sidebar"] [class*="result"], [class*="widget"] [class*="result"], [class*="monkeylearn"] [class*="result"], [class*="right-panel"] [class*="result"], [class*="sidebar"] [class*="analysis"]',

  /** "ML Test Content Type" option in the new entry content type selector (doc step). */
  "ML Test Content Type option in new entry type selector (doc step)":
    '*:has-text("ML Test Content Type"), [role="option"]:has-text("ML Test Content Type"), li:has-text("ML Test Content Type")',

  /** "User Profile" section in MonkeyLearn account settings (doc step).
   * Doc: "Under the 'User Profile' section, click My Account." */
  "User Profile section in MonkeyLearn (doc step)":
    '*:text-is("User Profile"), [class*="user-profile"]:has-text("User Profile"), h2:has-text("User Profile"), h3:has-text("User Profile"), [aria-label*="User Profile"]',

  /** "My Account" option under User Profile section in MonkeyLearn (doc step). */
  "My Account option in MonkeyLearn (doc step)":
    'a:has-text("My Account"), button:has-text("My Account"), [class*="profile"] a:has-text("My Account"), *:text-is("My Account")',

  /** "API Key" section heading in MonkeyLearn account settings (doc step).
   * Doc: "Under API Key, you will see the API Key." */
  "API Key section in MonkeyLearn (doc step)":
    '*:text-is("API Key"), h2:has-text("API Key"), h3:has-text("API Key"), [class*="api-key"]:has-text("API Key")',

  /** "Revoke and re-generate" button for the API Key in MonkeyLearn (doc step). */
  "Revoke and re-generate button in MonkeyLearn (doc step)":
    'button:has-text("Revoke and re-generate"), a:has-text("Revoke and re-generate"), *:text-is("Revoke and re-generate"), button:has-text("Revoke")',

  // ── Optimizely install + use ──────────────────────────────────────────────

  /** Optimizely app card in the Marketplace Apps listing (doc step). */
  "Optimizely app card (doc step)":
    '[class*="AppCard"]:has-text("Optimizely"), [class*="app-card"]:has-text("Optimizely"), [class*="Table__body__row"]:has-text("Optimizely"), *:has-text("Optimizely"):not(nav):not(button)',

  /** "Install" button on the Optimizely app card (doc step). */
  "Install button on Optimizely app (doc step)":
    'button:has-text("Install App"), button[aria-label="aria-button"]:has-text("Install"):not(:has-text("Cancel")):not(:has-text("Uninstall")), button:has-text("Install"):not(:has-text("Cancel")):not(:has-text("Uninstall")):not(:has-text("Build"))',

  /** "Project ID" label on the Optimizely Configuration screen (doc step). */
  "Project ID field in Optimizely Configuration (doc step)":
    'label:has-text("Project ID"), *:text-is("Project ID"), [data-test-id*="project-id"], [class*="project-id"]:has-text("Project ID")',

  /** "Auth Token" label on the Optimizely Configuration screen (doc step). */
  "Auth Token field in Optimizely Configuration (doc step)":
    'label:has-text("Auth Token"), *:text-is("Auth Token"), label:has-text("Access Token"), *:text-is("Access Token"), [data-test-id*="auth-token"], [class*="auth-token"]',

  /** "All Fields" option in the Optimizely Keys to Save in Entry configuration (doc step). */
  "All Fields option in Optimizely Configuration (doc step)":
    'label:has-text("All Fields"), input[value*="all" i] + label, [role="radio"]:has-text("All Fields"), [role="option"]:has-text("All Fields"), *:has-text("All Fields"):not(nav)',

  /** "Custom Fields" option in the Optimizely Keys configuration (doc step). */
  "Custom Fields option in Optimizely Configuration (doc step)":
    'label:has-text("Custom Fields"), input[value*="custom" i] + label, [role="radio"]:has-text("Custom Fields"), [role="option"]:has-text("Custom Fields"), *:has-text("Custom Fields"):not(nav)',

  /** "Custom" field type option in the Insert a field panel (doc step). */
  "Custom field type option in Content Type Builder (doc step)":
    'button:has-text("Custom"), li:has-text("Custom"), [class*="field-type"]:has-text("Custom"), *:text-is("Custom"), [data-test-id*="custom-field"]',

  /** "Select Extension/App" dropdown/section in the Content Type Builder (doc step).
   * Doc: "Under Select Extension/App, select Optimizely Audience". */
  "Select Extension/App section in Content Type Builder (doc step)":
    '*:has-text("Select Extension/App"), *:has-text("Select Extension"), [class*="extension"] *:has-text("Select"), [class*="custom-field"] *:has-text("Extension")',

  /** "Optimizely Audience" option in the Select Extension/App dropdown (doc step). */
  "Optimizely Audience option in Select Extension/App (doc step)":
    '[role="option"]:has-text("Optimizely Audience"), li:has-text("Optimizely Audience"), *:has-text("Optimizely Audience"):not(h1):not(h2)',

  /** "Optimizely Variations" option in the Select Extension/App dropdown (doc step). */
  "Optimizely Variations option in Select Extension/App (doc step)":
    '[role="option"]:has-text("Optimizely Variations"), li:has-text("Optimizely Variations"), *:has-text("Optimizely Variations"):not(h1):not(h2)',

  /** "Proceed" button inside the Select Extension/App field setup (doc step). */
  "Proceed button in Select Extension/App (doc step)":
    'button:has-text("Proceed"), [data-test-id*="proceed"], button:has-text("Save and Proceed"), button:has-text("Continue")',

  /** "+ Add Audience(s)" button in the Optimizely Audience custom field on the entry (doc step). */
  "Add Audience(s) button in Optimizely Audience field (doc step)":
    'button:has-text("Add Audience"), button:has-text("+ Add Audience"), [class*="audience"] button:has-text("Add"), *:has-text("+ Add Audience(s)")',

  /** "+ Add Audience(s)" button inside the audience selection modal/panel (doc step). */
  "Add Audience(s) button in audience selection panel (doc step)":
    '[role="dialog"] button:has-text("Add Audience"), button:has-text("Add Audience(s)"), [class*="modal"] button:has-text("Add Audience"), button:has-text("+ Add Audience(s)")',

  /** "+ Add Variation(s)" button in the Optimizely Variations custom field on the entry (doc step). */
  "Add Variation(s) button in Optimizely Variations field (doc step)":
    'button:has-text("Add Variation"), button:has-text("+ Add Variation"), [class*="variation"] button:has-text("Add"), *:has-text("+ Add Variation(s)")',

  /** "Add Variations" modal heading (doc step). */
  "Add Variations modal (doc step)":
    '[role="dialog"]:has-text("Add Variations"), *:has-text("Add Variations"), [class*="modal"]:has-text("Add Variations")',

  /** "Experiment Type" dropdown in the Add Variations modal (doc step). */
  "Experiment Type dropdown in Add Variations modal (doc step)":
    'label:has-text("Experiment Type"), *:text-is("Experiment Type"), [class*="experiment-type"] input[aria-label="cs-select-aria"], *:has-text("Experiment Type"):has(input[aria-label="cs-select-aria"])',

  /** "Experiment" option in the Experiment Type dropdown (doc step). */
  "Experiment option in Experiment Type dropdown (doc step)":
    '[role="option"]:has-text("Experiment"), [class*="cs-select__option"]:has-text("Experiment"):not(:has-text("Campaign")), li:has-text("Experiment"):not(:has-text("Campaign"))',

  /** "Experiment List" dropdown in the Add Variations modal (doc step). */
  "Experiment List dropdown in Add Variations modal (doc step)":
    'label:has-text("Experiment List"), *:text-is("Experiment List"), *:has-text("Experiment List"):has(input[aria-label="cs-select-aria"])',

  /** First option in the Experiment List dropdown (doc step). */
  "First experiment option in Experiment List (doc step)":
    '[class*="cs-select__option"]:not([class*="disabled"]), [role="option"]:not([aria-disabled="true"]), [class*="option"]:not([class*="disabled"]):not([class*="group"])',

  /** "+ Add Variation(s)" button inside the Add Variations modal (doc step). */
  "Add Variation(s) button in Add Variations modal (doc step)":
    '[role="dialog"] button:has-text("Add Variation"), [class*="modal"] button:has-text("Add Variation"), button:has-text("+ Add Variation(s)"), button:has-text("Add Variation(s)")',

  /** "Optimizely Test Content Type" option when creating a new entry (doc step). */
  "Optimizely Test Content Type option in new entry type selector (doc step)":
    '*:has-text("Optimizely Test Content Type"), [role="option"]:has-text("Optimizely Test Content Type"), li:has-text("Optimizely Test Content Type")',

  /** Settings option in the Optimizely left navigation panel (doc step). */
  "Settings option in Optimizely left navigation (doc step)":
    'a:has-text("Settings"), button:has-text("Settings"), [aria-label*="Settings"], nav *:text-is("Settings")',

  /** "Snippet Details" heading in Optimizely Settings page (doc step).
   * Doc: "You will get the Project ID under the Snippet Details heading." */
  "Snippet Details heading in Optimizely (doc step)":
    '*:text-is("Snippet Details"), h2:has-text("Snippet Details"), h3:has-text("Snippet Details"), [class*="snippet-details"]:has-text("Snippet Details")',

  /** "Project ID" under Snippet Details in Optimizely account settings (doc step). */
  "Project ID under Snippet Details in Optimizely (doc step)":
    '*:has-text("Project ID"), *:text-is("Project ID"), h2:has-text("Project ID"), [class*="project-id"]',

  /** "Profile" option in the Optimizely bottom-left navigation (doc step). */
  "Profile option in Optimizely bottom-left navigation (doc step)":
    'a:has-text("Profile"), button:has-text("Profile"), [aria-label*="Profile"], *:text-is("Profile")',

  /** "API Access" tab in Optimizely account settings (doc step). */
  "API Access tab in Optimizely (doc step)":
    '[role="tab"]:has-text("API Access"), button:has-text("API Access"), a:has-text("API Access"), *:text-is("API Access")',

  /** "Generate New Token" button in Optimizely API Access page (doc step). */
  "Generate New Token button in Optimizely (doc step)":
    'button:has-text("Generate New Token"), a:has-text("Generate New Token"), *:text-is("Generate New Token")',

  /** "Generate New Token" modal heading (doc step). */
  "Generate New Token modal in Optimizely (doc step)":
    '[role="dialog"]:has-text("Generate New Token"), *:has-text("Generate New Token"), [class*="modal"]:has-text("Generate New Token")',

  /** "Token Name" label in the Generate New Token modal (doc step). */
  "Token Name field in Generate New Token modal (doc step)":
    'label:has-text("Token Name"), *:text-is("Token Name"), [data-testid*="token-name"], [class*="token-name"]:has-text("Token Name")',

  /** "User" email label in the Generate New Token modal (doc step). */
  "User email field in Generate New Token modal (doc step)":
    'label:has-text("User"), *:text-is("User"), [data-testid*="user-email"], [class*="user"]:has-text("User"):not(button)',

  /** First user option in the User email dropdown of Generate New Token modal (doc step). */
  "First user option in Generate New Token modal (doc step)":
    '[role="option"]:not([aria-disabled="true"]), [class*="option"]:not([class*="disabled"]):not([class*="group"]), li[class*="option"]',

  /** "Create" button in the Generate New Token modal (doc step). */
  "Create button in Generate New Token modal (doc step)":
    '[role="dialog"] button:has-text("Create"), [class*="modal"] button:has-text("Create"), button:has-text("Create"):not(:has-text("Content Type")):not(:has-text("New"))',

  /** "Save In Entry" / "Choose Optimizely Keys to Save in Entry" label on Configuration screen (doc step).
   * Doc: "Choose the Optimizely Keys to Save in Entry". */
  "Save In Entry configuration label (doc step)":
    '*:has-text("Save In Entry"), *:text-is("Save In Entry"), *:has-text("Optimizely Keys to Save in Entry"), label:has-text("Save In Entry")',

  /** "Use Prebuilt" option in the New Content Type dropdown (doc step).
   * Doc: "If you want to create a new content type, select Create New. To use the prebuilt one, click Use Prebuilt." */
  "Use Prebuilt option in content type dropdown (doc step)":
    'button:has-text("Use Prebuilt"), [role="menuitem"]:has-text("Use Prebuilt"), li:has-text("Use Prebuilt"), *:text-is("Use Prebuilt")',

  /** "Help Text" field label for the custom field in Content Type Builder (doc step). */
  "Help Text field for custom field (doc step)":
    'label:has-text("Help Text"), *:text-is("Help Text"), [data-test-id*="help-text"], [class*="help-text"]:has-text("Help Text")',

  /** "Instruction Value" field label for the custom field in Content Type Builder (doc step). */
  "Instruction Value field for custom field (doc step)":
    'label:has-text("Instruction Value"), *:text-is("Instruction Value"), [data-test-id*="instruction"], [class*="instruction"]:has-text("Instruction")',

  /** First audience checkbox in the audience selection panel (doc step). */
  "First audience checkbox in audience selection panel (doc step)":
    '[role="dialog"] input[type="checkbox"]:not(:checked), [class*="modal"] input[type="checkbox"]:not(:checked), [class*="audience-list"] input[type="checkbox"], [class*="audience"] li input[type="checkbox"]',

  /** Second audience checkbox in the audience selection panel (doc step). */
  "Second audience checkbox in audience selection panel (doc step)":
    '[role="dialog"] input[type="checkbox"]:not(:checked):nth-of-type(2), [class*="audience"] li:nth-child(2) input[type="checkbox"]',

  /** First variation checkbox in the Add Variations modal (doc step). */
  "First variation checkbox in Add Variations modal (doc step)":
    '[role="dialog"] input[type="checkbox"]:not(:checked), [class*="variation-list"] input[type="checkbox"], [class*="variation"] li input[type="checkbox"]',

  /** "Campaign List" dropdown in the Add Variations modal (doc step). */
  "Campaign List dropdown in Add Variations modal (doc step)":
    'label:has-text("Campaign List"), *:text-is("Campaign List"), *:has-text("Campaign List"):has(input[aria-label="cs-select-aria"]), [class*="campaign-list"] input[aria-label="cs-select-aria"]',

  /** First campaign option in the Campaign List dropdown (doc step). */
  "First campaign option in Campaign List (doc step)":
    '[class*="cs-select__option"]:not([class*="disabled"]), [role="option"]:not([aria-disabled="true"]), [class*="option"]:not([class*="disabled"]):not([class*="group"])',

  // ── AI Assistant install + use ────────────────────────────────────────────

  /** AI Assistant app card in the Marketplace Apps listing (doc step). */
  "AI Assistant app card (doc step)":
    '[class*="AppCard"]:has-text("AI Assistant"), [class*="app-card"]:has-text("AI Assistant"), *:has-text("AI Assistant"):not(nav):not(button)',

  /** "Install App" button on the AI Assistant app card (doc step). */
  "Install App button on AI Assistant (doc step)":
    'button:has-text("Install App"), button[aria-label="aria-button"]:has-text("Install"):not(:has-text("Cancel")):not(:has-text("Uninstall")), button:has-text("Install"):not(:has-text("Cancel")):not(:has-text("Uninstall")):not(:has-text("Build"))',

  /** "Platform Configuration" section on the AI Assistant Configuration screen (doc step). */
  "Platform Configuration section (doc step)":
    '*:text-is("Platform Configuration"), h2:has-text("Platform Configuration"), h3:has-text("Platform Configuration"), label:has-text("Platform Configuration")',

  /** "Managed by Contentstack" option in Platform Configuration (doc step). */
  "Managed by Contentstack option in Platform Configuration (doc step)":
    'label:has-text("Managed by Contentstack"), input[value*="managed" i] + label, [role="radio"]:has-text("Managed by Contentstack"), *:has-text("Managed by Contentstack"):not(nav)',

  /** "Custom Credentials" option in Platform Configuration (doc step). */
  "Custom Credentials option in Platform Configuration (doc step)":
    'label:has-text("Custom Credentials"), input[value*="custom" i] + label, [role="radio"]:has-text("Custom Credentials"), *:has-text("Custom Credentials"):not(nav)',

  /** "Provider Name" label/dropdown on the Custom Credentials configuration screen (doc step).
   * Doc: "Select the Provider Name (for example, Open AI)". */
  "Provider Name dropdown in AI Assistant Configuration (doc step)":
    'label:has-text("Provider Name"), *:text-is("Provider Name"), *:has-text("Provider Name"):has(input[aria-label="cs-select-aria"]), [class*="provider-name"], input[aria-label="cs-select-aria"]:near(*:has-text("Provider Name"))',

  /** "API Model" section label on the Custom Credentials configuration screen (doc step).
   * Doc: "In the API Model section, choose either Recommended Models or All Available Models." */
  "API Model section (doc step)":
    '*:text-is("API Model"), h2:has-text("API Model"), h3:has-text("API Model"), label:has-text("API Model"), [class*="api-model"]:has-text("API Model")',

  /** "Recommended Models" option in the API Model section (doc step). */
  "Recommended Models option in API Model (doc step)":
    'label:has-text("Recommended Models"), [role="radio"]:has-text("Recommended Models"), input[value*="recommended" i] + label, *:has-text("Recommended Models"):not(nav)',

  /** "All Available Models" option in the API Model section (doc step). */
  "All Available Models option in API Model (doc step)":
    'label:has-text("All Available Models"), [role="radio"]:has-text("All Available Models"), input[value*="all" i] + label, *:has-text("All Available Models"):not(nav)',

  /** "Save and Proceed" button on the AI Assistant Platform Configuration screen (doc step). */
  "Save and Proceed button in AI Assistant Configuration (doc step)":
    'button:has-text("Save and Proceed"), [data-test-id*="save-proceed"], button:has-text("Save & Proceed")',

  /** "Advanced Configuration" section on the AI Assistant Configuration screen (doc step). */
  "Advanced Configuration section (doc step)":
    '*:text-is("Advanced Configuration"), h2:has-text("Advanced Configuration"), h3:has-text("Advanced Configuration"), [class*="advanced-config"]:has-text("Advanced Configuration")',

  /** "When field content is selected" checkbox in Advanced Configuration (doc step).
   * Doc: "Select the checkbox(s) to view the app in the entry field or when the field content is selected." */
  "When field content is selected checkbox in Advanced Configuration (doc step)":
    'label:has-text("When field content is selected"), input[type="checkbox"]:near(*:has-text("When field content is selected")), *:text-is("When field content is selected")',

  /** "+ Create Sub-action Prompt" button in Advanced Configuration (doc step). */
  "Create Sub-action Prompt button (doc step)":
    'button:has-text("Create Sub-action Prompt"), button:has-text("+ Create Sub-action"), a:has-text("Create Sub-action Prompt"), *:text-is("+ Create Sub-action Prompt")',

  /** "Enable search for sub-action" toggle in Advanced Configuration (doc step). */
  "Enable search for sub-action toggle (doc step)":
    '*:has-text("Enable search for sub-action") [role="switch"], label:has-text("Enable search") + [role="switch"], *:text-is("Enable search for sub-action")',

  /** AI Assistant popup that appears after clicking the AI Assistant icon on a field (doc step).
   * Doc: "A pop-up appears. You can transform the content for a specific field by choosing the AI Assistant options." */
  "AI Assistant popup in entry (doc step)":
    '[class*="ai-assistant"] [class*="popup"], [class*="ai-assistant-popup"], [class*="field-modifier"] [class*="popup"], [data-test-id*="ai-assistant-popup"], [class*="aiAssistant"] [class*="dropdown"]',

  /** "Custom commands for a field" option in the AI Assistant popup (doc step).
   * Doc: "You can also provide custom commands for a field." */
  "Custom commands option in AI Assistant (doc step)":
    'button:has-text("custom commands"), li:has-text("custom commands"), *:has-text("custom commands for a field"), [class*="custom-command"]:has-text("custom")',

  /** Single Line Textbox field type option in the Insert a field panel (doc step). */
  "Single Line Textbox field type option in Content Type Builder (doc step)":
    'button:has-text("Single Line Textbox"), li:has-text("Single Line Textbox"), [class*="field-type"]:has-text("Single Line Textbox"), *:text-is("Single Line Textbox"), [data-test-id*="single-line"]',

  /** "AI Assistant Test Content Type" option when creating a new entry (doc step). */
  "AI Assistant Test Content Type option in new entry type selector (doc step)":
    '*:has-text("AI Assistant Test Content Type"), [role="option"]:has-text("AI Assistant Test Content Type"), li:has-text("AI Assistant Test Content Type")',

  /** AI Assistant app icon in the Field Modifier location of the entry (doc step). */
  "AI Assistant icon in Field Modifier location (doc step)":
    '[data-test-id*="ai-assistant"], [class*="ai-assistant"], button[aria-label*="AI Assistant"], [title*="AI Assistant"], img[alt*="AI Assistant"]',

  /** "Rewrite the field content" option in the AI Assistant popup (doc step). */
  "Rewrite field content option in AI Assistant (doc step)":
    'button:has-text("Rewrite the field content"), li:has-text("Rewrite the field content"), [role="option"]:has-text("Rewrite the field content"), *:text-is("Rewrite the field content")',

  /** "Shorten this text" option in the AI Assistant popup (doc step). */
  "Shorten this text option in AI Assistant (doc step)":
    'button:has-text("Shorten this text"), li:has-text("Shorten this text"), [role="option"]:has-text("Shorten this text"), *:text-is("Shorten this text")',

  /** "Accept" button in the AI Assistant generated content popup (doc step). */
  "Accept button in AI Assistant popup (doc step)":
    'button:has-text("Accept"), [data-test-id*="accept"], *:text-is("Accept")',

  /** "Try Again" button in the AI Assistant generated content popup (doc step). */
  "Try Again button in AI Assistant popup (doc step)":
    'button:has-text("Try Again"), *:text-is("Try Again"), [data-test-id*="try-again"]',

  /** "Cancel" button in the AI Assistant generated content popup (doc step). */
  "Cancel button in AI Assistant popup (doc step)":
    'button:has-text("Cancel"), *:text-is("Cancel"), [data-test-id*="cancel"]',

  /** "Outline" option in the AI Assistant popup to generate content from another field (doc step). */
  "Outline option in AI Assistant (doc step)":
    'button:has-text("Outline"), li:has-text("Outline"), [role="option"]:has-text("Outline"), *:text-is("Outline")',

  /** "Summary" option in the AI Assistant popup (doc step). */
  "Summary option in AI Assistant (doc step)":
    'button:has-text("Summary"), li:has-text("Summary"), [role="option"]:has-text("Summary"), *:text-is("Summary")',

  /** "SEO Tags" option in the AI Assistant popup (doc step). */
  "SEO Tags option in AI Assistant (doc step)":
    'button:has-text("SEO Tags"), li:has-text("SEO Tags"), [role="option"]:has-text("SEO Tags"), *:text-is("SEO Tags")',

  /** "Blog Posts" option in the AI Assistant popup (doc step). */
  "Blog Posts option in AI Assistant (doc step)":
    'button:has-text("Blog Posts"), li:has-text("Blog Posts"), [role="option"]:has-text("Blog Posts"), *:text-is("Blog Posts")',

  /** "Headline" option in the AI Assistant popup (doc step). */
  "Headline option in AI Assistant (doc step)":
    'button:has-text("Headline"), li:has-text("Headline"), [role="option"]:has-text("Headline"), *:text-is("Headline")',

  /** "User Persona Tags" option in the AI Assistant popup (doc step). */
  "User Persona Tags option in AI Assistant (doc step)":
    'button:has-text("User Persona Tags"), li:has-text("User Persona Tags"), [role="option"]:has-text("User Persona Tags"), *:text-is("User Persona Tags")',

  /** "Properties" icon of the JSON RTE field in Content Type Builder (doc step). */
  "Properties icon of JSON RTE field (doc step)":
    '[data-test-id*="json-rte"] [data-test-id*="properties"], [class*="json-rte"] [class*="properties"], button[aria-label*="Properties"]:near([class*="json-rte"]), [class*="field-properties"]',

  /** "AI Assistant" option in the Select JSON RTE Plugin(s) panel (doc step). */
  "AI Assistant option in JSON RTE Plugin selector (doc step)":
    '[role="option"]:has-text("AI Assistant"), li:has-text("AI Assistant"), [class*="plugin"]:has-text("AI Assistant"), label:has-text("AI Assistant")',

  /** "Add Plugin(s)" button in the JSON RTE Properties panel (doc step). */
  "Add Plugin(s) button in JSON RTE (doc step)":
    'button:has-text("Add Plugin"), button:has-text("Add Plugin(s)"), *:text-is("Add Plugin(s)"), [data-test-id*="add-plugin"]',

  // ── AI Assistant with Brand Kit — additional selectors ────────────────────

  /** "API Credentials" section heading in Platform Configuration (doc step).
   * Doc: "Select API Credentials" — the section label shown before Managed by Contentstack / Custom Credentials. */
  "API Credentials section (doc step)":
    '*:text-is("API Credentials"), h2:has-text("API Credentials"), h3:has-text("API Credentials"), label:has-text("API Credentials"), [class*="api-credentials"]:has-text("API Credentials")',

  /** "Enable On-Brand Generative AI" toggle in Platform Configuration (doc step).
   * Doc: "Click the Enable On-Brand Generative AI toggle button" when Brand Kit is enabled. */
  "Enable On-Brand Generative AI toggle (doc step)":
    '*:has-text("Enable On-Brand Generative AI") [role="switch"], label:has-text("Enable On-Brand Generative AI") + [role="switch"], *:text-is("Enable On-Brand Generative AI"), button:has-text("Enable On-Brand Generative AI")',

  /** "Proceed" button in Platform Configuration after toggling Brand Kit (doc step). */
  "Proceed button in Platform Configuration (doc step)":
    '[class*="platform-config"] button:has-text("Proceed"), [class*="Configuration"] button:has-text("Proceed"), button:has-text("Proceed"):not(:has-text("Save"))',

  /** "Add your custom prompt" section in Advanced Configuration (doc step).
   * Doc: "Provide the required Prompt" — the prompt input section heading. */
  "Add your custom prompt section (doc step)":
    '*:text-is("Add your custom prompt"), h2:has-text("Add your custom prompt"), h3:has-text("Add your custom prompt"), [class*="custom-prompt"]:has-text("Add your custom prompt"), *:has-text("Add your custom prompt"):not(button)',

  /** "Add the custom option" section in Advanced Configuration (doc step).
   * Doc: refers to the sub-actions/custom option configuration section. */
  "Add the custom option section (doc step)":
    '*:text-is("Add the custom option"), h2:has-text("Add the custom option"), h3:has-text("Add the custom option"), [class*="custom-option"]:has-text("Add the custom option"), *:has-text("Add the custom option"):not(button)',

  /** "Current Field" option inside "Perform action on" in Advanced Configuration (doc step).
   * Doc: "Choose the option to Perform action on — Current Field or Other Field." */
  "Current Field option in Perform action on (doc step)":
    '[role="radio"]:has-text("Current Field"), label:has-text("Current Field"), input[value*="current" i] + label, *:text-is("Current Field")',

  /** "Other Field" option inside "Perform action on" in Advanced Configuration (doc step). */
  "Other Field option in Perform action on (doc step)":
    '[role="radio"]:has-text("Other Field"), label:has-text("Other Field"), input[value*="other" i] + label, *:text-is("Other Field")',

  /** "Entry Field" checkbox(es) in Advanced Configuration — to view the app in the entry field (doc step).
   * Doc: "select the Entry Field checkbox(s) to view the app in the entry field." */
  "Entry Field checkbox in Advanced Configuration (doc step)":
    'label:has-text("Entry Field"):not(:has-text("JSON RTE")), input[type="checkbox"]:near(*:text-is("Entry Field")), *:text-is("Entry Field"):not(nav):not(button)',

  /** "When JSON RTE field content is selected" checkbox in Advanced Configuration (doc step).
   * Doc: "If you select the When JSON RTE field content is selected checkbox, you will be able to perform actions only on the selected content in the JSON Rich Text Editor field." */
  "When JSON RTE field content is selected checkbox (doc step)":
    'label:has-text("When JSON RTE field content is selected"), input[type="checkbox"]:near(*:has-text("JSON RTE field content")), *:has-text("When JSON RTE field content is selected"), *:text-is("When JSON RTE field content is selected")',

  /** "Save and Proceed" button specifically for saving Advanced Configuration settings (doc step).
   * Doc: "Then, click Save or Save and Proceed to save the advanced configuration settings." */
  "Save and Proceed button in Advanced Configuration (doc step)":
    'button:has-text("Save and Proceed"), button:has-text("Save & Proceed"), [data-test-id*="save-proceed"]',

  /** "+ Create Action" button in Advanced Configuration of AI Assistant with Brand Kit (doc step).
   * Doc: "Click the + Create Action button". Different from Create Sub-action Prompt. */
  "Create Action button in Advanced Configuration (doc step)":
    'button:has-text("Create Action"), button:has-text("+ Create Action"), a:has-text("Create Action"), *:text-is("+ Create Action")',

  /** Icon upload field (SVG) in Advanced Configuration (doc step).
   * Doc: "upload the Icon (in SVG format)". */
  "Icon upload in Advanced Configuration (doc step)":
    'input[type="file"][accept*="svg"], input[type="file"]:near(*:has-text("Icon")), label:has-text("Icon") ~ input[type="file"], [data-test-id*="icon-upload"]',

  /** "Include Field data" toggle in Advanced Configuration (doc step). */
  "Include Field data toggle in Advanced Configuration (doc step)":
    '*:has-text("Include Field data") [role="switch"], label:has-text("Include Field data") + [role="switch"], *:text-is("Include Field data")',

  /** "Perform action on" option in Advanced Configuration (doc step).
   * Doc: "Choose the option to Perform action on — select current or other field." */
  "Perform action on option in Advanced Configuration (doc step)":
    '*:text-is("Perform action on"), label:has-text("Perform action on"), *:has-text("Perform action on"):not(button)',

  /** "Brand Kits" dropdown in the AI Assistant popup inside an entry (doc step).
   * Doc: "Click the Brand Kits drop-down and select the required Brand Kit." */
  "Brand Kits dropdown in AI Assistant popup (doc step)":
    'label:has-text("Brand Kits"), *:text-is("Brand Kits"), *:has-text("Brand Kits"):has(input[aria-label="cs-select-aria"]), [class*="brand-kit"] input[aria-label="cs-select-aria"]',

  /** "Voice Profiles" dropdown in the AI Assistant popup inside an entry (doc step).
   * Doc: "from the Voice Profiles drop-down, select the applicable Voice Profile." */
  "Voice Profiles dropdown in AI Assistant popup (doc step)":
    'label:has-text("Voice Profiles"), *:text-is("Voice Profiles"), *:has-text("Voice Profile"):has(input[aria-label="cs-select-aria"]), [class*="voice-profile"] input[aria-label="cs-select-aria"]',

  /** "Knowledge Vault" toggle in the AI Assistant popup (doc step).
   * Doc: "If you want to generate content from the Knowledge Vault, enable it." */
  "Knowledge Vault toggle in AI Assistant popup (doc step)":
    '*:has-text("Knowledge Vault") [role="switch"], label:has-text("Knowledge Vault") + [role="switch"], *:text-is("Knowledge Vault"), button:has-text("Knowledge Vault")',

  /** "Brainstorm With AI Assistant" option in the AI Assistant popup (doc step).
   * Doc: chat-based feature for creative ideation with Accept, Regenerate, and Edit options. */
  "Brainstorm With AI Assistant option (doc step)":
    'button:has-text("Brainstorm With AI Assistant"), button:has-text("Brainstorm"), li:has-text("Brainstorm With AI Assistant"), *:text-is("Brainstorm With AI Assistant")',

  /** "Optimize text for SEO" option in the AI Assistant Replace Field Content popup (doc step). */
  "Optimize text for SEO option in AI Assistant (doc step)":
    'button:has-text("Optimize text for SEO"), li:has-text("Optimize text for SEO"), *:text-is("Optimize text for SEO")',

  /** "Change tone" option in the AI Assistant Replace Field Content popup (doc step). */
  "Change tone option in AI Assistant (doc step)":
    'button:has-text("Change tone"), li:has-text("Change tone"), *:text-is("Change tone")',

  /** "Persuasive" tone option in the Change tone dropdown (doc step). */
  "Persuasive option in Change tone (doc step)":
    '[role="option"]:has-text("Persuasive"), li:has-text("Persuasive"), button:has-text("Persuasive"), *:text-is("Persuasive")',

  /** "Change length" option in the AI Assistant Replace Field Content popup (doc step). */
  "Change length option in AI Assistant (doc step)":
    'button:has-text("Change length"), li:has-text("Change length"), *:text-is("Change length")',

  /** "Longer" option in the Change length dropdown (doc step). */
  "Longer option in Change length (doc step)":
    '[role="option"]:has-text("Longer"), li:has-text("Longer"), button:has-text("Longer"), *:text-is("Longer")',

  /** "Shorter" option in the Change length dropdown (doc step). */
  "Shorter option in Change length (doc step)":
    '[role="option"]:has-text("Shorter"), li:has-text("Shorter"), button:has-text("Shorter"), *:text-is("Shorter")',

  /** "Regenerate" button in the AI Assistant Brainstorm popup (doc step). */
  "Regenerate button in AI Assistant popup (doc step)":
    'button:has-text("Regenerate"), *:text-is("Regenerate"), [data-test-id*="regenerate"]',

  /** "Edit" button in the AI Assistant Brainstorm popup (doc step). */
  "Edit button in AI Assistant popup (doc step)":
    'button:has-text("Edit"), *:text-is("Edit"), [data-test-id*="edit-brainstorm"]',

  /** "AI Assistant Brand Kit Test Content Type" option in the new entry selector (doc step). */
  "AI Assistant Brand Kit Test Content Type option in new entry type selector (doc step)":
    '*:has-text("AI Assistant Brand Kit Test Content Type"), [role="option"]:has-text("AI Assistant Brand Kit Test Content Type"), li:has-text("AI Assistant Brand Kit Test Content Type")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  // ── Google Cloud Console inputs (doc step) ────────────────────────────────

  /** Service account name input on the create service account form (doc step). */
  "Service account name input in Google Cloud Console (doc step)":
    'input[aria-label*="Service account name" i], input[placeholder*="Service account name" i], input[name*="displayName" i], label:has-text("Service account name") + input, label:has-text("Service account name") ~ input, [data-testid*="account-name"] input',

  /** API Library search bar in Google Cloud Console (doc step). */
  "API Library search bar in Google Cloud Console (doc step)":
    'input[placeholder*="Search for APIs" i], input[aria-label*="Search" i], input[type="search"], [data-testid*="search"] input',

  // ── Google Analytics inputs (doc step) ────────────────────────────────────

  /** Email addresses field in the Add roles modal in Google Analytics (doc step). */
  "Email addresses field in Add roles and data restrictions modal in Google Analytics (doc step)":
    'input[placeholder*="Email" i], input[aria-label*="Email addresses" i], input[type="email"], [data-testid*="email"] input',

  // ── shared Marketplace search ──────────────────────────────────────────────

  /** Search input on the Marketplace apps listing page (doc step).
   * DOM placeholder: "Search in All Collections" or "Search in Apps" (after clicking Apps filter). */
  "Marketplace apps search input (doc step)":
    'input[placeholder*="Search in"], [class*="marketplace"] input[type="search"], [class*="marketplace-search"] input',

  /** Search input inside the Content Type Visualizer dashboard widget (doc step).
   * Appears after clicking the Search button in the visualizer toolbar. */
  "Search input in Content Type Visualizer (doc step)":
    'input[type="search"]:visible, input[placeholder*="earch" i]:visible, [class*="search-input"] input, [class*="searchInput"] input',

  // ── Google Analytics configuration screen ────────────────────────────────

  /** Property ID input on the Google Analytics 4 configuration screen (doc step).
   * Doc: "Property ID: Enter the Property ID retrieved in Step 1." */
  "Property ID field in Google Analytics 4 configuration (doc step)":
    'input[placeholder*="Property ID" i], input[name*="propertyId" i], input[name*="property_id" i], [data-test-id*="property-id"] input, [class*="property-id"] input',

  /** View ID input on the Universal Analytics configuration screen (doc step).
   * Doc: "View ID: Enter the View ID retrieved in Step 1." */
  "View ID field in Universal Analytics configuration (doc step)":
    'input[placeholder*="View ID" i], input[name*="viewId" i], input[name*="view_id" i], [data-test-id*="view-id"] input, [class*="view-id"] input',

  // ── Google Analytics sidebar widget: content type + entry creation ────────

  /** Content type name input in the new content type modal (doc step). */
  "Content type name input (doc step)":
    '[data-test-id="cs-ct-create-modal-ct-name-input"] input, [data-testid="cs-modal"] input[name="name"], input[name="name"], input[placeholder*="Enter a name" i], input[placeholder*="content type name" i], input[placeholder*="display name" i], [data-test-id*="content-type-name"] input',

  /** Title field in the entry editor (doc step). */
  "Title field in entry (doc step)":
    'input[placeholder*="Enter a title"], input[name="title"], [data-test-id*="entry-title"] input, [class*="entry-title"] input',

  /** URL field in the entry editor for the URL content type field (doc step). */
  "URL field in entry (doc step)":
    'input[placeholder*="URL"], input[name="url"], [data-test-id*="url-field"] input, [class*="url-field"] input, input[type="url"]',

  /** API Key input on the MonkeyLearn Configuration screen (doc step). */
  "API Key input in MonkeyLearn Configuration (doc step)":
    'input[placeholder*="API Key" i], input[name*="apiKey" i], input[name*="api_key" i], label:has-text("API Key") ~ input, [data-test-id*="api-key"] input, [class*="api-key"] input',

  /** Multi Line Textbox field in the entry editor (doc step). */
  "Multi Line Textbox field in entry (doc step)":
    'textarea[class*="TextArea"], [class*="multiline"] textarea, textarea[placeholder*="Enter" i], [data-test-id*="multi-line"] textarea, textarea',

  /** JSON RTE field in the entry editor (doc step). */
  "JSON RTE field in entry (doc step)":
    '[class*="json-rte"] [contenteditable="true"], [data-test-id*="json-rte"] [contenteditable], [class*="jsonrte"] [contenteditable="true"], [class*="JsonRte"] [contenteditable="true"]',

  // ── Optimizely configuration inputs ──────────────────────────────────────

  /** Project ID input on the Optimizely Configuration screen (doc step). */
  "Project ID input in Optimizely Configuration (doc step)":
    'input[placeholder*="Project ID" i], input[name*="projectId" i], input[name*="project_id" i], label:has-text("Project ID") ~ input, [data-test-id*="project-id"] input',

  /** Auth Token (Access Token) input on the Optimizely Configuration screen (doc step). */
  "Auth Token input in Optimizely Configuration (doc step)":
    'input[placeholder*="Auth Token" i], input[placeholder*="Access Token" i], input[name*="authToken" i], input[name*="auth_token" i], label:has-text("Auth Token") ~ input, label:has-text("Access Token") ~ input',

  /** Token Name input in the Generate New Token modal (doc step). */
  "Token Name input in Generate New Token modal (doc step)":
    'input[placeholder*="Token Name" i], input[name*="tokenName" i], label:has-text("Token Name") ~ input, [data-test-id*="token-name"] input',

  /** Display Name input for the custom field in Content Type Builder (doc step). */
  "Display Name input for custom field (doc step)":
    'input[placeholder*="Display Name" i], input[name*="displayName" i], label:has-text("Display Name") ~ input, [data-test-id*="display-name"] input, [class*="display-name"] input',

  // ── AI Assistant configuration inputs ────────────────────────────────────

  /** "Custom Name" input for a prompt in Advanced Configuration of AI Assistant (doc step). */
  "Custom Name input in Advanced Configuration (doc step)":
    'input[placeholder*="Custom Name" i], input[name*="customName" i], label:has-text("Custom Name") ~ input, [data-test-id*="custom-name"] input',

  /** API Key or Access Key input on the Custom Credentials configuration screen (doc step). */
  "API Key input for Custom Credentials in AI Assistant (doc step)":
    'input[placeholder*="API Key" i], input[placeholder*="Access Key" i], input[name*="apiKey" i], label:has-text("API Key") ~ input, label:has-text("Access Key") ~ input, [data-test-id*="api-key"] input',

  /** Single Line Textbox field in the entry editor (doc step). */
  "Single Line Textbox field in entry (doc step)":
    'input[class*="TextInput"], input[data-test-id*="single-line"], [class*="single-line"] input[type="text"], input[placeholder*="Enter" i]:not([name="title"])',

  /** Prompt input inside the AI Assistant popup in the entry editor (doc step).
   * Doc: "Enter the prompt to start generating the content." */
  "Prompt input in AI Assistant popup (doc step)":
    '[class*="ai-assistant"] input[type="text"], [class*="ai-assistant"] textarea, [data-test-id*="prompt"] input, input[placeholder*="prompt" i], textarea[placeholder*="prompt" i]',

  /** Custom action prompt input in Advanced Configuration of AI Assistant (doc step). */
  "Prompt input in Advanced Configuration (doc step)":
    'label:has-text("Prompt") ~ textarea, label:has-text("Prompt") ~ input, [data-test-id*="prompt"] textarea, textarea[placeholder*="Prompt" i], input[placeholder*="Prompt" i]',

  /** "Display Name" input for a sub-action in Advanced Configuration (doc step). */
  "Display Name input for sub-action (doc step)":
    'input[placeholder*="Display Name" i], input[name*="displayName" i], [class*="sub-action"] input[placeholder*="Display" i]',

  /** "Value" input for a sub-action in Advanced Configuration (doc step). */
  "Value input for sub-action (doc step)":
    'input[placeholder*="Value" i], input[name*="value" i], [class*="sub-action"] input[placeholder*="Value" i]',
};
