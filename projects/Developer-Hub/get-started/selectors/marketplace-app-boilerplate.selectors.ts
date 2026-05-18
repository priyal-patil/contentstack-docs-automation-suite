/**
 * Marketplace App Boilerplate — Developer Hub UI (doc-driven targets).
 * DOM refs: data/dom/Developer-Hub/{dashboard-developer-hub,create-standard-app,ui-locations,basic-information,hosting,add-ui-location,custom-field-ui-location-page,authorization-window}.html
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Organization dashboard Developer Hub product tile (doc step)":
    '[data-test-id="cs-global-dashboard-product-tile-developer-hub"]',

  "Create Standard App modal Create button (doc step)": '[data-test-id="new-app-create-standard-app-cta"]',
  /** Organization app (required for Global Full Page per Marketplace App Boilerplate doc). Stack radio for Stack-only flows */
  "Create Standard App Organization App type (doc step)": '[data-test-id="new-app-app-type-organization-app"]',
  "Create Standard App Stack App type (doc step)": '[data-test-id="new-app-app-type-stack-app"]',

  /** Left nav Manage → Basic Information — #info */
  "Developer Hub app settings Basic Information nav (doc step)": "#info",

  /** Left nav UI Locations — #ui-locations */
  "Developer Hub app settings UI Locations nav (doc step)": "#ui-locations",

  /** Left nav Hosting — #hosting */
  "Developer Hub app settings Hosting nav (doc step)": "#hosting",

  /** Banner link on UI Locations toward Hosting tab (class + text fallbacks in actionRules click handler) */
  "Developer Hub UI Locations View Hosting link (doc step)":
    '[data-test-id="ui-locations-content"] span.view_hosting, [data-test-id="ui-locations-content"] .view_hosting, span.view_hosting',

  /** Doc lists Hosting with Launch and Custom Hosting; automation selects Custom Hosting after verifying both */
  "Hosting tab Hosting with Launch option (doc step)": 'input[type="radio"][value="launch"]',

  "Hosting tab Custom Hosting option (doc step)": 'input[type="radio"][value="external"]',

  "Hosting tab Save button (doc step)": '[data-test-id="hosting-save-cta"]',

  /** Basic Information footer save */
  "Developer Hub Basic Information Save button (doc step)":
    '[data-test-id="standard-app-basic-info-save-cta"]',

  /** Per-location ellipsis: scoped to Stack Dashboard tile row */
  "Developer Hub UI Locations Stack Dashboard row ellipsis (doc step)":
    '[data-test-id="uilocation-stack-dashboard location-item"] div.action-button-dropdown',
  /** Asset Sidebar tile */
  "Developer Hub UI Locations Asset Sidebar row ellipsis (doc step)":
    '[data-test-id="uilocation-asset-sidebar location-item"] div.action-button-dropdown',
  /** Custom Field tile */
  "Developer Hub UI Locations Custom Field row ellipsis (doc step)":
    '[data-test-id="uilocation-custom-field location-item"] div.action-button-dropdown',

  "Developer Hub UI Locations Entry Sidebar row ellipsis (doc step)":
    '[data-test-id="uilocation-entry-sidebar location-item"] div.action-button-dropdown',

  "Developer Hub UI Locations App Configuration row ellipsis (doc step)":
    '[data-test-id="uilocation-app-configuration location-item"] div.action-button-dropdown',

  "Developer Hub UI Locations Full Page row ellipsis (doc step)":
    '[data-test-id="uilocation-full-page location-item"] div.action-button-dropdown',

  "Developer Hub UI Locations Field Modifier row ellipsis (doc step)":
    '[data-test-id="uilocation-field-modifier location-item"] div.action-button-dropdown',

  "Developer Hub UI Locations Content Type Sidebar row ellipsis (doc step)":
    '[data-test-id="uilocation-content-type-sidebar location-item"] div.action-button-dropdown',

  "Developer Hub UI Locations Global Full Page row ellipsis (doc step)":
    '[data-test-id="uilocation-global-full-page location-item"] div.action-button-dropdown',

  /** Footer save for UI Locations workspace */
  "Developer Hub UI Locations footer Save button (doc step)": '[data-test-id="uilocation-save-cta"]',

  /** Open Data Type react-select — click control container first (actionRules may complete selection) */
  "Developer Hub UI location Custom Field Data Type dropdown (doc step)":
    '[data-test-id="uilocation-custom-field-1-data-type"] div.Select__control',

  /** Field Modifier — Allowed Field Types (react-select); placeholder + numbered id seen in-product */
  "Developer Hub UI location Field Modifier Allowed Field Types dropdown (doc step)":
    '[data-test-id^="uilocation-field-modifier-"][data-test-id$="-field-types"] div.Select__control, [data-test-id^="uilocation-field-modifier-"][data-test-id$="-allowed-field-types"] div.Select__control, [data-test-id="uilocation-field-modifier-1-field-types"] div.Select__control, [data-test-id="uilocation-field-modifier-1-allowed-field-types"] div.Select__control',

  /** Install flow — optional */
  "Developer Hub Install App button (doc step)": '[data-test-id="install-app-cta"]:not([disabled])',
  "Developer Hub install OAuth consent checkbox (doc step)":
    '.Auth__Card--checkbox input[type="checkbox"]',
  "Developer Hub install modal Install button (doc step)": '[data-test-id="modal-form-install-authorize"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Create Standard App modal app name input (doc step)": '[data-test-id="new-app-name"]',

  /** Basic Information editable name — optional tweak uses description instead (doc §8) */
  "Developer Hub Basic Information description textarea (doc step)": '[data-test-id="basic-info-description"]',

  /** Hosting → App URL (Custom Hosting). Sample from doc/hosting DOM */
  "Developer Hub Hosting App URL input (doc step)": ".app-url-input-container input",

  /** Boilerplate accordion pattern from custom-field capture — stack dashboard assumed #1 suffix */
  "Developer Hub UI location Stack Dashboard Name input (doc step)":
    '[data-test-id="uilocation-stack-dashboard-1-name"] input',
  "Developer Hub UI location Stack Dashboard Path input (doc step)":
    '[data-test-id="uilocation-stack-dashboard-1-path"] input',

  "Developer Hub UI location Asset Sidebar Name input (doc step)":
    '[data-test-id="uilocation-asset-sidebar-1-name"] input',
  "Developer Hub UI location Asset Sidebar Path input (doc step)":
    '[data-test-id="uilocation-asset-sidebar-1-path"] input',

  "Developer Hub UI location Custom Field Name input (doc step)":
    '[data-test-id="uilocation-custom-field-1-name"] input',
  "Developer Hub UI location Custom Field Path input (doc step)":
    '[data-test-id="uilocation-custom-field-1-path"] input',

  "Developer Hub UI location Entry Sidebar Name input (doc step)":
    '[data-test-id="uilocation-entry-sidebar-1-name"] input',
  "Developer Hub UI location Entry Sidebar Path input (doc step)":
    '[data-test-id="uilocation-entry-sidebar-1-path"] input',

  /** App Configuration — doc only requires Path */
  "Developer Hub UI location App Configuration Path input (doc step)":
    '[data-test-id="uilocation-app-configuration-1-path"] input',

  "Developer Hub UI location Full Page Name input (doc step)":
    '[data-test-id="uilocation-full-page-1-name"] input',
  "Developer Hub UI location Full Page Path input (doc step)":
    '[data-test-id="uilocation-full-page-1-path"] input',

  "Developer Hub UI location Field Modifier Name input (doc step)":
    '[data-test-id="uilocation-field-modifier-1-name"] input',
  "Developer Hub UI location Field Modifier Path input (doc step)":
    '[data-test-id="uilocation-field-modifier-1-path"] input',

  "Developer Hub UI location Content Type Sidebar Name input (doc step)":
    '[data-test-id="uilocation-content-type-sidebar-1-name"] input',
  "Developer Hub UI location Content Type Sidebar Path input (doc step)":
    '[data-test-id="uilocation-content-type-sidebar-1-path"] input',

  "Developer Hub UI location Global Full Page Name input (doc step)":
    '[data-test-id="uilocation-global-full-page-1-name"] input',
  "Developer Hub UI location Global Full Page Path input (doc step)":
    '[data-test-id="uilocation-global-full-page-1-path"] input',
};
