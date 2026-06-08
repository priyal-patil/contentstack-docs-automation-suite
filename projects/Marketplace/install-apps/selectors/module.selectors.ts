/**
 * Marketplace — install-apps module selectors.
 * Covers: installing-apps flow.
 *
 * DOM reference: data/dom/header/app-switcher.html
 * Doc path: Marketplace → Discover > Explore > Apps → app card → details → Install App
 */

export const CLICK_SELECTORS: Record<string, string> = {
  // ── shared App Switcher navigation ───────────────────────────────────────

  /** App Switcher button in the top navigation bar (doc step). */
  "App Switcher button (doc step)":
    '[data-test-id="app-switcher"], .app__switcher__v2',

  /** Marketplace option inside the App Switcher modal (doc step). */
  "Marketplace option in App Switcher (doc step)":
    '[data-test-id="app-switcher-marketplace"], [data-test-id="app-switcher-body"] a:has-text("Marketplace"), [data-test-id="app-switcher-body"] [role="button"]:has-text("Marketplace")',

  // ── Marketplace left navigation ───────────────────────────────────────────

  /** "Discover" navigation section in the Marketplace left nav (doc step).
   * Doc: "Go to Discover > Explore > Apps" */
  "Discover navigation item (doc step)":
    '[data-test-id="cs-marketplace-discover"], [data-test-id="cs-marketplace-nav-discover"], nav a:has-text("Discover"), [role="navigation"] a:has-text("Discover"), a:has-text("Discover"), button:has-text("Discover")',

  /** "Explore" sub-navigation item under Discover (doc step). */
  "Explore navigation item (doc step)":
    '[data-test-id="cs-marketplace-explore"], [data-test-id="cs-marketplace-nav-explore"], nav a:has-text("Explore"), [role="navigation"] a:has-text("Explore"), a:has-text("Explore"), button:has-text("Explore")',

  /** "Apps" filter/navigation item under Explore (doc step). */
  "Apps navigation item (doc step)":
    '[data-test-id="cs-marketplace-apps"], [data-test-id="cs-marketplace-nav-apps"], nav a:has-text("Apps"), [role="navigation"] a:has-text("Apps"), a:has-text("Apps"), button:has-text("Apps")',

  // ── app listing and detail page ───────────────────────────────────────────

  /** Any app card in the Marketplace app listing (doc step). Clicks the first one. */
  "Marketplace app card (doc step)":
    '[data-test-id="cs-marketplace-app-card"], [class*="app-card"], [class*="AppCard"], [class*="marketplace-app"], [data-test-id*="app-card"]',

  /** "Overview" tab on the app detail page (doc step). */
  "App Overview tab (doc step)":
    '[data-test-id="cs-app-overview"], [role="tab"]:has-text("Overview"), a:has-text("Overview"), button:has-text("Overview")',

  /** "Screenshots" tab on the app detail page (doc step). */
  "App Screenshots tab (doc step)":
    '[data-test-id="cs-app-screenshots"], [role="tab"]:has-text("Screenshots"), a:has-text("Screenshots"), button:has-text("Screenshots")',

  /** "Use Cases" tab on the app detail page (doc step). */
  "App Use Cases tab (doc step)":
    '[data-test-id="cs-app-use-cases"], [role="tab"]:has-text("Use Cases"), a:has-text("Use Cases"), button:has-text("Use Cases")',

  /** "Installed On" tab on the app detail page (doc step). */
  "App Installed On tab (doc step)":
    '[data-test-id="cs-app-installed-on"], [role="tab"]:has-text("Installed On"), a:has-text("Installed On"), button:has-text("Installed On")',

  /** "Install App" button (for admins) or "Request Install" button (for non-admins) — doc step.
   * Doc: "Click the Install App button on the right" / "Click the Request Install button". */
  "Install App button or Request Install button (doc step)":
    '[data-test-id="cs-install-app"], button:has-text("Install App"), a:has-text("Install App"), button:has-text("Request Install"), a:has-text("Request Install"), [data-test-id="cs-request-install"]',

  /** "Install App" click — doc step.
   * Doc: "Click the Install App button on the right." */
  "Install App button (doc step)":
    '[data-test-id="cs-install-app"], button:has-text("Install App"), a:has-text("Install App")',

  /** Stack selection prompt — doc step.
   * Doc: "In case of a stack app, you are prompted to select the stack in which you want to install the app." */
  "Select stack prompt (doc step)":
    '[data-test-id="cs-select-stack"], [data-test-id="cs-stack-select-modal"], [role="dialog"]:has-text("Select"), .stack-select, select[name*="stack" i], [aria-label*="Select stack" i], [placeholder*="Select stack" i]',

  /** Install button inside the stack selection dialog — doc step.
   * Doc: "Select the stack and click Install." */
  "Install button in stack selection (doc step)":
    '[data-test-id="cs-install-button"], [role="dialog"] button:has-text("Install"), button:has-text("Install"):not(:has-text("Install App"))',

  // ── post-install: configuration page and authorization ───────────────────

  /** App configuration page after clicking Install — doc step.
   * Doc: "You will be redirected to the configuration page to fill in the required information related to the app." */
  "App configuration page (doc step)":
    '[data-test-id="cs-app-configuration"], [data-test-id="cs-app-config-page"], h1:has-text("Configuration"), h2:has-text("Configuration"), [role="heading"]:has-text("Configuration"), .app-config__heading, form[class*="config"]',

  /** Save button on the configuration page — doc step.
   * Doc: "After adding the details, click the Save button." */
  "Save button on configuration page (doc step)":
    '[data-test-id="cs-app-config-save"], [data-test-id="cs-save-button"], button:has-text("Save"), [role="button"]:has-text("Save")',

  /** Authorization prompt for organization apps — doc step.
   * Doc: "In the case of an organization app, you will be asked to allow access to specific modules of your Contentstack account." */
  "Allow access to modules prompt (doc step)":
    '[data-test-id="cs-authorize-modal"], [data-test-id="cs-allow-access"], [role="dialog"]:has-text("allow access"), [role="dialog"]:has-text("modules"), *:has-text("allow access to specific modules"), *:has-text("Contentstack account")',

  /** "Authorize & Install" button on the org app authorization prompt — doc step.
   * Doc: "Click Authorize & Install to proceed." */
  "Authorize and Install button (doc step)":
    '[data-test-id="cs-authorize-install"], button:has-text("Authorize & Install"), [role="button"]:has-text("Authorize & Install"), a:has-text("Authorize & Install")',

  // ── updating-an-installed-app ─────────────────────────────────────────────

  /** "Manage" item in the left-side navigation panel (doc step).
   * Doc: "Click Manage in the left-side navigation panel." */
  "Manage in left-side navigation panel (doc step)":
    '[data-test-id="cs-marketplace-manage"], nav a:has-text("Manage"), [role="navigation"] a:has-text("Manage"), a:has-text("Manage"), button:has-text("Manage"), [data-test-id="cs-manage-apps"]',

  /** "Installed Apps" option under Manage (doc step).
   * Doc: "select Installed Apps." */
  "Installed Apps option (doc step)":
    '[data-test-id="cs-installed-apps"], a:has-text("Installed Apps"), [role="menuitem"]:has-text("Installed Apps"), [role="option"]:has-text("Installed Apps"), button:has-text("Installed Apps"), li:has-text("Installed Apps")',

  /** Red dot indicator on apps that have an available update (doc step).
   * Doc: "All apps with an available update are highlighted with a red dot." */
  "App update available red dot indicator (doc step)":
    '[data-test-id="cs-app-update-dot"], [class*="red-dot"], [class*="update-dot"], [class*="update-badge"], [aria-label*="update available" i], [title*="update available" i]',

  /** App icon/card for an app that has an update available (doc step).
   * Doc: "Click the app icon — a modal appears."
   * Installed Apps page uses a table; first row = data-test-id="cs-table-body-row-0". */
  "App icon with update available (doc step)":
    '[data-test-id="cs-table-body-row-0"], [data-test-id="cs-installed-app-card"], [class*="Table__body__row"]:first-child',

  /** "Overview" tab inside the app detail modal (doc step).
   * Actual DOM: div.Tab__item with data-test-id="cs-tabs-item" — not role="tab". */
  "App detail modal Overview tab (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Overview"), .Tab__item:has-text("Overview"), [data-test-id="cs-modal-app-overview"], [role="tab"]:has-text("Overview"), a:has-text("Overview"), button:has-text("Overview")',

  /** "Screenshots" tab inside the app detail modal (doc step). */
  "App detail modal Screenshots tab (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Screenshots"), .Tab__item:has-text("Screenshots"), [data-test-id="cs-modal-app-screenshots"], [role="tab"]:has-text("Screenshots"), a:has-text("Screenshots"), button:has-text("Screenshots")',

  /** "Use Cases" tab inside the app detail modal (doc step). */
  "App detail modal Use Cases tab (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Use Cases"), .Tab__item:has-text("Use Cases"), [data-test-id="cs-modal-app-use-cases"], [role="tab"]:has-text("Use Cases"), a:has-text("Use Cases"), button:has-text("Use Cases")',

  /** "Installed On" tab inside the app detail modal (doc step).
   * Doc says "Installed On"; actual UI shows "Installed On Stack" — :has-text() matches either. */
  "App detail modal Installed On tab (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Installed On"), .Tab__item:has-text("Installed On"), [data-test-id="cs-modal-app-installed-on"], [role="tab"]:has-text("Installed On"), a:has-text("Installed On"), button:has-text("Installed On")',

  /** Red dot after the stack name indicating an update is available (doc step).
   * Doc: "The red dot after the stack name signifies that an app update is available." */
  "Red dot after stack name indicating update available (doc step)":
    '[data-test-id="cs-stack-update-dot"], [class*="stack-update"], [class*="update-indicator"], [class*="red-dot"]',

  /** "Update" button on the app detail modal (doc step).
   * Doc: "Click Update to install the app updates." */
  "Update button (doc step)":
    '[data-test-id="cs-app-update"], button:has-text("Update"), [role="button"]:has-text("Update"), a:has-text("Update")',

  /** Update popup — stack selected by default (doc step).
   * Doc: "In the popup window, the stack is selected by default." */
  "Update popup stack selected by default (doc step)":
    '[data-test-id="cs-update-popup"], [role="dialog"]:has-text("Update"), [role="dialog"] [class*="stack"], .update-modal',

  /** Terms of Service in the update popup (doc step).
   * Doc: "accept the Terms of Service and Privacy Policy." */
  "Terms of Service in update popup (doc step)":
    '[data-test-id="cs-terms-of-service"], a:has-text("Terms of Service"), label:has-text("Terms of Service"), *:has-text("Terms of Service")',

  /** Privacy Policy in the update popup (doc step). */
  "Privacy Policy in update popup (doc step)":
    '[data-test-id="cs-privacy-policy"], a:has-text("Privacy Policy"), label:has-text("Privacy Policy"), *:has-text("Privacy Policy")',

  /** "Update" button inside the popup (doc step).
   * Doc: "click the Update button." */
  "Update button in popup (doc step)":
    '[data-test-id="cs-update-popup-confirm"], [role="dialog"] button:has-text("Update"), [role="dialog"] [role="button"]:has-text("Update")',

  /** App configuration details page after update (doc step).
   * Doc: "Optionally, update the existing configuration details." */
  "App configuration details page (doc step)":
    '[data-test-id="cs-app-configuration"], [data-test-id="cs-app-config-page"], h1:has-text("Configuration"), h2:has-text("Configuration"), [role="heading"]:has-text("Configuration"), form[class*="config"]',

  /** "Open Stack" button on the configuration page (doc step).
   * Doc: "Click the Open Stack button to directly navigate to the stack." */
  "Open Stack button (doc step)":
    '[data-test-id="cs-open-stack"], button:has-text("Open Stack"), a:has-text("Open Stack"), [role="button"]:has-text("Open Stack")',

  /** "Cancel" button on the configuration page (doc step).
   * Doc: "Click the Cancel button to cancel updating the configuration details." */
  "Cancel button on configuration page (doc step)":
    '[data-test-id="cs-config-cancel"], button:has-text("Cancel"), [role="button"]:has-text("Cancel")',

  // ── uninstalling-an-app ───────────────────────────────────────────────────

  /** "Installed On" tab inside the installed app modal — click to navigate to it (doc step).
   * Doc: "Go to the Installed On tab." */
  "Installed On tab in modal (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Installed On"), .Tab__item:has-text("Installed On")',

  /** "Manage" option (doc step).
   * Doc: "Open Marketplace, and go to Manage > Installed Apps." */
  "Manage option (doc step)":
    '[data-test-id="cs-marketplace-manage"], button:has-text("Manage Apps"), button:has-text("Manage"), [data-test-id="cs-manage-apps"]',

  /** Installed app row to click for uninstalling — Color Picker (Stack App) (doc step).
   * Doc: "Click the app that you want to uninstall." */
  "Installed app to uninstall (doc step)":
    '[class*="Table__body__row"]:has-text("Color Picker"), [role="row"]:has-text("Color Picker")',

  /** Stack row in the Installed On tab — hover reveals action icons (doc step).
   * Doc: "Hover on the stack from which you want to uninstall the app." */
  "Stack row in Installed On tab (doc step)":
    '[data-test-id="cs-table-body-row-0"], [class*="Table__body__row"]:first-child',

  /** "Uninstall" button directly in the app modal header — for Org Apps (doc step).
   * Org Apps (e.g. Bitbucket Cloud) show Uninstall + Configuration buttons directly in the modal, with no Installed On tab. */
  "Uninstall button in app modal (doc step)":
    '[data-test-id="app-details-modal-header"] button:has-text("Uninstall"), [class*="App_Details_Header"] button:has-text("Uninstall"), [class*="App_Install_btn"] button:has-text("Uninstall"), [class*="CardCTA"] button:has-text("Uninstall")',

  /** "Configuration" button in the app modal header — for Org Apps (doc step). */
  "Configuration button in app modal (doc step)":
    '[data-test-id="app-details-modal-header"] button:has-text("Configuration"), [class*="App_Details_Header"] button:has-text("Configuration"), [class*="App_Install_btn"] button:has-text("Configuration"), [class*="CardCTA"] button:has-text("Configuration")',

  /** "Uninstall App" icon in the Installed On tab table row — for Stack Apps (doc step).
   * Doc: "You can see the icons for Uninstall App and Configuration." / "Click the Uninstall icon." */
  "Uninstall App icon (doc step)":
    '[class*="MKT__UninstallIcon"], [class*="UninstallIcon"], [aria-label*="Uninstall" i], [title*="Uninstall" i]',

  /** "Configuration" icon in the Installed On tab table row — for Stack Apps (doc step).
   * Doc: "You can see the icons for Uninstall App and Configuration." */
  "Configuration icon (doc step)":
    '[class*="MKT__SettingsIcon"], [class*="SettingsIcon"], [data-test-id="cs-icon"][name="Settings"], [aria-label*="Configuration" i]',

  /** Confirmation popup asking to enter the app name (doc step).
   * Doc: "Enter the name of your application in the pop-up box." */
  "Uninstall confirmation popup (doc step)":
    '[role="dialog"]:has-text("Uninstall"), [class*="modal"]:has-text("Uninstall"), [class*="Modal"]:has-text("Uninstall"), [data-test-id*="uninstall"]',

  /** Text input in the uninstall confirmation popup (doc step).
   * Doc: "Enter the name of your application in the pop-up box." */
  "App name input in uninstall popup (doc step)":
    '[role="dialog"] input[type="text"], [role="dialog"] input:not([type="hidden"]), [class*="modal"] input[type="text"]',

  /** "Uninstall" button inside the confirmation popup (doc step).
   * Doc: "click Uninstall to permanently remove the app and all its associated data." */
  "Uninstall button in confirmation popup (doc step)":
    '[role="dialog"] button:has-text("Uninstall"), [class*="modal"] button:has-text("Uninstall"), [class*="Modal"] button:has-text("Uninstall")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  /** Text input in the uninstall confirmation popup — type the app name to confirm (doc step). */
  "App name input in uninstall popup (doc step)":
    '[role="dialog"] input[type="text"], [role="dialog"] input:not([type="hidden"]), [class*="modal"] input[type="text"]',
};
