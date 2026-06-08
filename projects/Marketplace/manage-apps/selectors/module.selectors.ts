/**
 * Marketplace — manage-apps module selectors.
 * Covers: installed-apps flow.
 *
 * Doc path: Marketplace → Manage > Installed Apps → app detail modal
 */

export const CLICK_SELECTORS: Record<string, string> = {
  // ── shared App Switcher navigation ───────────────────────────────────────

  /** App Switcher button in the top navigation bar (doc step). */
  "App Switcher button (doc step)":
    '[data-test-id="app-switcher"], .app__switcher__v2',

  /** Marketplace option inside the App Switcher modal (doc step). */
  "Marketplace option in App Switcher (doc step)":
    '[data-test-id="app-switcher-marketplace"], [data-test-id="app-switcher-body"] a:has-text("Marketplace"), [data-test-id="app-switcher-body"] [role="button"]:has-text("Marketplace")',

  // ── Manage Apps navigation ────────────────────────────────────────────────

  /** "Manage" option (doc step).
   * Doc: "Go to Manage > Installed Apps / Authorized Apps." */
  "Manage option (doc step)":
    '[data-test-id="cs-marketplace-manage"], button:has-text("Manage Apps"), button:has-text("Manage"), [data-test-id="cs-manage-apps"]',

  /** "Installed Apps" option in the Manage Apps dropdown (doc step). */
  "Installed Apps option (doc step)":
    '[data-test-id="cs-marketplace-installed-apps"], a:has-text("Installed Apps"), button:has-text("Installed Apps"), [role="menuitem"]:has-text("Installed Apps")',

  // ── Installed Apps listing ────────────────────────────────────────────────

  /** Installed app row to open for configuration — BigCommerce (Stack App) (doc step).
   * Doc: "Click the app that you want to change the configuration for." */
  "Installed app for configuration (doc step)":
    '[class*="Table__body__row"]:has-text("BigCommerce"), [role="row"]:has-text("BigCommerce"), td:has-text("BigCommerce")',

  // ── app detail modal tabs ─────────────────────────────────────────────────

  /** "Installed On" tab in the app detail modal (doc step).
   * Doc says "Installed On"; actual UI shows "Installed On Stack" — :has-text() matches either. */
  "Installed On tab in modal (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Installed On"), .Tab__item:has-text("Installed On")',

  /** "Configuration" tab in the app detail modal (doc step).
   * Doc: "Click the Configuration tab to enter the configuration details of the app." */
  "Configuration tab in modal (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Configuration"), .Tab__item:has-text("Configuration"), [role="tab"]:has-text("Configuration")',

  /** "UI Locations" tab in the app detail modal (doc step).
   * Doc: "Click the UI Locations tab to access the app's locations." */
  "UI Locations tab in modal (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("UI Locations"), .Tab__item:has-text("UI Locations"), [role="tab"]:has-text("UI Locations")',

  /** "Webhook" tab in the app detail modal (doc step).
   * Doc: "If webhooks are enabled for the app, you can see a Webhook tab." — conditional. */
  "Webhook tab in modal (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Webhook"), .Tab__item:has-text("Webhook"), [role="tab"]:has-text("Webhook")',

  // ── app configuration page tabs (reached via Configuration icon in Installed On Stack row) ──

  /** "Configuration" tab on the app configuration page (doc step).
   * Doc: "Click the Configuration tab to enter the configuration details of the app."
   * Actual navigation: gear icon in Installed On Stack row → configuration page with this tab. */
  "Configuration tab on config page (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Configuration"), .Tab__item:has-text("Configuration"), [role="tab"]:has-text("Configuration"), h1:has-text("Configuration"), h2:has-text("Configuration"), [data-test-id="cs-app-configuration"]',

  /** "UI Locations" tab on the app configuration page (doc step).
   * Doc: "Click the UI Locations tab to access the app's locations."
   * Actual page renders this as the only tab (underlined text tab). */
  "UI Locations tab on config page (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("UI Locations"), .Tab__item:has-text("UI Locations"), [class*="tab"]:has-text("UI Locations"), [role="tab"]:has-text("UI Locations"), a:has-text("UI Locations"), button:has-text("UI Locations"), *[class*="active"]:has-text("UI Locations"), *[class*="selected"]:has-text("UI Locations")',

  /** "Webhook" tab on the app configuration page (doc step).
   * Doc: "If webhooks are enabled for the app, you can see a Webhook tab." — conditional. */
  "Webhook tab on config page (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Webhook"), .Tab__item:has-text("Webhook"), [class*="tab"]:has-text("Webhook"), [role="tab"]:has-text("Webhook"), a:has-text("Webhook"), button:has-text("Webhook")',

  // ── Installed On tab — row actions ────────────────────────────────────────

  /** Stack row in the Installed On tab — hover reveals action icons (doc step).
   * Doc: "Hover over the stack from which you want to uninstall the app or update the configuration settings." */
  "Stack row in Installed On tab (doc step)":
    '[data-test-id="cs-table-body-row-0"], [class*="Table__body__row"]:first-child',

  /** "Uninstall App" icon in the Installed On tab row (doc step).
   * Doc: "You can see Uninstall App and Configuration icons."
   * DOM: <span class="MKT__Icons MKT__UninstallIcon"> inside .Installation__Actions--config */
  "Uninstall App icon (doc step)":
    '.MKT__UninstallIcon, [class*="MKT__UninstallIcon"], [class*="UninstallIcon"]',

  /** "Configuration" (gear/settings) icon in the Installed On tab row (doc step).
   * Doc: "You can see Uninstall App and Configuration icons."
   * DOM: <span class="MKT__Icons MKT__SettingsIcon"><svg name="Settings" data-test-id="cs-icon"> */
  "Configuration icon (doc step)":
    '.MKT__SettingsIcon, [class*="MKT__SettingsIcon"], svg[name="Settings"], [data-test-id="cs-icon"][name="Settings"]',

  // ── UI Locations tab ──────────────────────────────────────────────────────

  /** UI Location entry row visible after clicking UI Locations tab (doc step).
   * Doc: "You can see the number of locations in the box corresponding to each UI Location."
   * Two rendering modes:
   * Mode A (direct nav): outer page shows accordion items — Accordion__heading matches.
   * Mode B (after Config tab click): all content inside iframes — iframe on outer page matches. */
  "UI Location entry in UI Locations tab (doc step)":
    '.UiLocationsConfiguration, [class*="UiLocationsConfiguration"], .Accordion__heading, [class*="Accordion__heading"], [class*="accordion-title"], [class*="UILocation"], iframe',

  /** Expand/collapse chevron on each UI Location row (doc step).
   * Doc: "Click the icon (highlighted in the following screenshot) to view the UI Locations in detail."
   * DOM: <div tabindex="0" class=" Accordion__heading__toggle"><svg name="CaretDown" data-test-id="cs-icon"> */
  "UI Location detail expand icon (doc step)":
    '.Accordion__heading__toggle, [class*="Accordion__heading__toggle"], svg[name="CaretDown"], [data-test-id="cs-icon"][name="CaretDown"]',

  /** Toggle button to enable/disable a UI location (doc step).
   * Doc: "You can enable or disable a particular UI location by using the toggle button."
   * Toggle appears on each installed location row inside the expanded section. */
  "UI location toggle button (doc step)":
    '[role="switch"], [class*="Toggle__"], [class*="toggle__"], input[type="checkbox"][class*="toggle"], [data-test-id*="toggle"], [class*="enabled-toggle"], [class*="EnabledToggle"]',

  /** "Required" label on a UI location that cannot be disabled (doc step).
   * Doc: "The UI locations marked as Required cannot be disabled." */
  "Required label on UI location (doc step)":
    'span:has-text("Required"), [class*="required"]:has-text("Required"), [class*="Required"]:has-text("Required"), [class*="badge"]:has-text("Required")',

  // ── Webhook tab ───────────────────────────────────────────────────────────

  /** "Webhook Logs" section inside the Webhook tab (doc step).
   * Doc: "The Webhook section provides a list of all configured events under the Webhook Logs section." */
  "Webhook Logs section (doc step)":
    '[class*="WebhookLogs"], [class*="webhook-logs"], *:has-text("Webhook Logs"), [data-test-id*="webhook-logs"]',

  /** "Configure Webhook" section inside the Webhook tab (doc step).
   * Doc: "Inside the Configure Webhook section, you can select the following options under Branch Scope." */
  "Configure Webhook section (doc step)":
    '[class*="ConfigureWebhook"], [class*="configure-webhook"], *:has-text("Configure Webhook"), [data-test-id*="configure-webhook"]',

  /** "Branch Scope" label inside Configure Webhook section (doc step).
   * Doc: "you can select the following options under Branch Scope:" */
  "Branch Scope label (doc step)":
    'label:has-text("Branch Scope"), *:has-text("Branch Scope"), [class*="branch-scope"], [class*="BranchScope"]',

  /** "All Branches" option under Branch Scope in Configure Webhook (doc step).
   * Doc: "All Branches: if you want the webhook to trigger on all branches of the organization." */
  "All Branches option in Branch Scope (doc step)":
    'label:has-text("All Branches"), [role="radio"]:has-text("All Branches"), input[value*="all" i] ~ *, *:has-text("All Branches")',

  /** "Specific Branches" option under Branch Scope in Configure Webhook (doc step).
   * Doc: "Specific Branches: if you want the webhook to trigger on a specific branch(s)." */
  "Specific Branches option in Branch Scope (doc step)":
    'label:has-text("Specific Branches"), [role="radio"]:has-text("Specific Branches"), input[value*="specific" i] ~ *, *:has-text("Specific Branches")',

  // ── authorized-apps flow ──────────────────────────────────────────────────

  /** Marketplace icon in the left-hand side primary navigation (doc step).
   * Doc: "In the left-hand side primary navigation, click the Marketplace icon to go to the Marketplace." */
  "Marketplace icon in left navigation (doc step)":
    '[data-test-id="cs-nav-marketplace"], a[href*="marketplace"], nav a:has-text("Marketplace"), [aria-label="Marketplace"], [class*="nav"]:has-text("Marketplace")',

  /** "Authorized Apps" option in the Manage Apps dropdown (doc step).
   * Doc: "Go to Manage > Authorized Apps." */
  "Authorized Apps option (doc step)":
    '[data-test-id="cs-marketplace-authorized-apps"], a:has-text("Authorized Apps"), button:has-text("Authorized Apps"), [role="menuitem"]:has-text("Authorized Apps")',

  /** Authorized Apps listing section on the page (doc step).
   * Doc: "Under the Authorized Apps section, click the app for which you want to revoke the permissions." */
  "Authorized Apps listing (doc step)":
    '[class*="AuthorizedApps"], [class*="authorized-apps"], [data-test-id*="authorized-apps"], *:has-text("Authorized Apps")',

  /** Contentstack Starter app entry in Authorized Apps listing (doc step).
   * Doc: "Click Contentstack Starter to view the authorized access tokens." */
  "Contentstack Starter app in Authorized Apps (doc step)":
    '[class*="Table__body__row"]:has-text("Contentstack Starter"), [role="row"]:has-text("Contentstack Starter"), td:has-text("Contentstack Starter"), [class*="app-card"]:has-text("Contentstack Starter"), *:has-text("Contentstack Starter")',

  /** User row in the Contentstack Starter authorized users table (doc step).
   * Doc: "On the page that appears, click the user whose permission you want to revoke."
   * DOM: table with Users / First authorized on / Modified At columns; hover reveals the Revoke button.
   * Selector targets the first tbody data row (not the header). */
  "User row in Contentstack Starter (doc step)":
    '[data-test-id="cs-table-body-row-0"], tbody tr:first-child td:first-child, [class*="Table__body__row"]:first-of-type',

  /** "Revoke" button that appears after selecting a user row (doc step).
   * Doc: "Click the Revoke button to proceed."
   * DOM: individual Revoke button appears after clicking the user row. */
  "Revoke button (doc step)":
    'button:has-text("Revoke"):not(:has-text("All")), [data-test-id*="revoke"]:not([data-test-id*="all"]), [class*="revoke"]:not([class*="All"]), span:has-text("Revoke"):not(:has-text("All"))',

  /** "Revoke All" button on the app permissions detail page (doc step).
   * Doc: "You can also revoke the permissions of all users by clicking the Revoke All button." */
  "Revoke All button (doc step)":
    'button:has-text("Revoke All"), [data-test-id*="revoke-all"], [class*="revoke-all"], [class*="RevokeAll"]',

  // ── app-releases-in-marketplace flow ─────────────────────────────────────

  /** Installed app row to open for releases — XTM (doc step).
   * Doc: "Click the app whose releases you want to view." */
  "Installed app for releases (doc step)":
    '[class*="Table__body__row"]:has-text("XTM"), [role="row"]:has-text("XTM"), td:has-text("XTM")',

  /** "Overview" tab in the installed app modal (doc step).
   * Doc: "The app modal includes Overview, Screenshots, Use Cases, Installed On Stack, and Releases tab." */
  "Overview tab in app modal (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Overview"), .Tab__item:has-text("Overview"), [role="tab"]:has-text("Overview")',

  /** "Screenshots" tab in the installed app modal (doc step).
   * Doc: "The app modal includes Overview, Screenshots, Use Cases, Installed On Stack, and Releases tab." */
  "Screenshots tab in app modal (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Screenshots"), .Tab__item:has-text("Screenshots"), [role="tab"]:has-text("Screenshots")',

  /** "Use Cases" tab in the installed app modal (doc step).
   * Doc: "The app modal includes Overview, Screenshots, Use Cases, Installed On Stack, and Releases tab." */
  "Use Cases tab in app modal (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Use Cases"), .Tab__item:has-text("Use Cases"), [role="tab"]:has-text("Use Cases")',

  /** "Installed On Stack" tab in the installed app modal (doc step).
   * Doc: "The app modal includes... Installed On Stack... tab. By default, you are on the Installed On Stack tab." */
  "Installed On Stack tab in app modal (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Installed On"), .Tab__item:has-text("Installed On"), [role="tab"]:has-text("Installed On")',

  /** "Releases" tab in the installed app modal (doc step).
   * Doc: "Click the Releases tab to view all the releases with release type, version number, release name, and description." */
  "Releases tab in app modal (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Releases"), .Tab__item:has-text("Releases"), [role="tab"]:has-text("Releases")',

  /** "Major" release type label in the Releases tab (doc step).
   * Doc: "There are three Release types: Major (1.0.0), Minor (1.1.0), and Patch (1.1.1)." */
  "Major release type (doc step)":
    '*:has-text("Major"), [class*="release-type"]:has-text("Major"), [class*="ReleaseType"]:has-text("Major"), td:has-text("Major"), span:has-text("Major")',

  /** "Minor" release type label in the Releases tab (doc step).
   * Doc: "There are three Release types: Major (1.0.0), Minor (1.1.0), and Patch (1.1.1)." */
  "Minor release type (doc step)":
    '*:has-text("Minor"), [class*="release-type"]:has-text("Minor"), [class*="ReleaseType"]:has-text("Minor"), td:has-text("Minor"), span:has-text("Minor")',

  /** "Patch" release type label in the Releases tab (doc step).
   * Doc: "There are three Release types: Major (1.0.0), Minor (1.1.0), and Patch (1.1.1)." */
  "Patch release type (doc step)":
    '*:has-text("Patch"), [class*="release-type"]:has-text("Patch"), [class*="ReleaseType"]:has-text("Patch"), td:has-text("Patch"), span:has-text("Patch")',

  /** "Install" button to install the latest version of the app (doc step).
   * Doc: "Click the Install button to install and configure the latest version of the app." */
  "Install button in Releases tab (doc step)":
    'button:has-text("Install"), [data-test-id*="install"], [class*="install"]:has-text("Install")',
};

export const INPUT_SELECTORS: Record<string, string> = {};
